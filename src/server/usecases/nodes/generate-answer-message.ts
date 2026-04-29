import type { Ctx } from '@/server/usecases/common/context';
import type { BaseMessage } from '@langchain/core/messages';
import { AIMessage, AIMessageChunk } from '@langchain/core/messages';
import * as NodeRepo from '@/server/repositories/nodes/repository';
import * as EdgeRepo from '@/server/repositories/edges/repository';
import { withTransaction } from '@/server/db/transaction';
import { collectContextNodes } from './utils/collect-context-nodes';
import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) throw new Error('MISSING_ENV: OPENAI_API_KEY');
const OPENAI_CHAT_MODEL = 'gpt-4.1-mini';

export type GenerateAnswerMessageInput = {
    nodeId: string;
};

export type GenerateAnswerMessageOutput = {
    stream: ReadableStream;
};

export async function generateAnswerMessage(
    _ctx: Ctx,
    input: GenerateAnswerMessageInput
): Promise<GenerateAnswerMessageOutput> {
    // --- Node状態確認 ---
    await withTransaction(async (tx) => {
        const node = await NodeRepo.findById(tx, input.nodeId);
        if (!node) throw new Error('NOT_FOUND: node');
        if (node.type !== 'answer' || node.status !== 'pending') {
            throw new Error('INVALID_STATE: node is not pending answer');
        }
        const parents = await EdgeRepo.findParents(tx, input.nodeId);
        if (parents.length > 1) {
            throw new Error('INVALID_STATE: node has multiple parents');
        }
    });

    // --- Nodeを更新 ---
    await withTransaction(async (tx) => {
        await NodeRepo.update(tx, input.nodeId, {
            status: 'in_progress',
        });
    });

    // --- コンテキスト構築 ---
    const contextNodes = await withTransaction(async (tx) => {
        return await collectContextNodes(tx, input.nodeId, { maxDepth: 10 });
    });

    const contextMessages: BaseMessage[] = contextNodes
        .map((n) => n.message)
        .filter((m): m is BaseMessage => !!m);

    if (contextMessages.length === 0) {
        throw new Error('INVALID_STATE: no context messages available for generating answer');
    }

    // --- LLMストリーム生成 ---
    const llm = new ChatOpenAI({
        model: OPENAI_CHAT_MODEL,
        streaming: true,
        apiKey: OPENAI_API_KEY,
    });
    const llmStream = await llm.stream(contextMessages);

    const stream = new ReadableStream({
        async start(controller) {
            let merged: AIMessageChunk | undefined;

            try {
                for await (const chunk of llmStream) {
                    // クライアントに即時送信
                    controller.enqueue(chunk);
                    // 最終形に集約
                    merged = merged ? merged.concat(chunk) : chunk;
                }

                // ストリーム完了後の永続化
                const aiMessage = new AIMessage({
                    content: merged?.content ?? '',
                    tool_calls: merged?.tool_calls ?? [],
                    additional_kwargs: merged?.additional_kwargs ?? {},
                });

                await withTransaction(async (tx) => {
                    const prev = await NodeRepo.findById(tx, input.nodeId);
                    if (!prev) throw new Error('NOT_FOUND: node');
                    await NodeRepo.update(tx, input.nodeId, {
                        status: 'completed',
                        message: aiMessage,
                    });
                });

                controller.close();
            } catch (err) {
                console.error(`stream error at node ${input.nodeId}:`, err);
                try {
                    await withTransaction(async (tx) => {
                        await NodeRepo.update(tx, input.nodeId, {
                            status: 'failed',
                        });
                    });
                } finally {
                    controller.error(err);
                }
            }
        },
    });

    return { stream };
}
