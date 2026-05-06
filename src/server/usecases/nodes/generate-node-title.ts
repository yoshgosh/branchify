import type { Ctx } from '@/server/usecases/common/context';
import type { Node } from '@/shared/entities/node';
import { withTransaction } from '@/server/db/transaction';
import * as NodeRepo from '@/server/repositories/nodes/repository';
import * as UserRepo from '@/server/repositories/users/repository';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

const OPENAI_CHAT_MODEL = 'gpt-4.1-nano';

// 構造化アウトプット用のスキーマ
const TitleSchema = z.object({
    title: z.string().min(5),
});

export type GenerateNodeTitleInput = { nodeId: string };
export type GenerateNodeTitleOutput = { node: Node };

export async function generateNodeTitle(
    ctx: Ctx,
    input: GenerateNodeTitleInput
): Promise<GenerateNodeTitleOutput> {
    // node を取得
    const node = await withTransaction(async (tx) => {
        const node = await NodeRepo.findById(tx, input.nodeId);
        if (!node) throw new Error('NOT_FOUND: node');
        return node;
    });

    // message の content がない場合、title は null
    const content = node.message?.content;
    if (!content || (typeof content === 'string' && content.trim() === '')) {
        const updatedNode = await withTransaction(async (tx) => {
            const updatedNode = await NodeRepo.update(tx, input.nodeId, {
                title: null,
            });
            if (!updatedNode) throw new Error('NOT_FOUND: node');
            return updatedNode;
        });
        return { node: updatedNode };
    }

    // content を文字列に変換
    const contentText = typeof content === 'string' ? content : JSON.stringify(content);

    // LLMで title を生成
    const user = await withTransaction(async (tx) => UserRepo.findById(tx, ctx.userId));
    if (!user?.openaiApiKey) throw new Error('APIキーが未登録です');

    const llm = new ChatOpenAI({
        model: OPENAI_CHAT_MODEL,
        apiKey: user.openaiApiKey,
    });

    const structuredLlm = llm.withStructuredOutput(TitleSchema);

    const prompt = ChatPromptTemplate.fromMessages([
        [
            'system',
            'あなたはテキストから簡潔で適切なタイトルを生成する専門家です。与えられたテキストの内容を分析し、その要点を捉えた短いタイトルを生成してください。',
        ],
        [
            'user',
            '以下のテキストから適切なタイトルを生成してください。\nタイトルは抽象的で簡潔な表現にしてください。\nタイトルは5文字以上16文字未満程度で生成してください。\n\n{content}',
        ],
    ]);

    const chain = prompt.pipe(structuredLlm);
    const result = await chain.invoke({ content: contentText });

    // タイトルを保存
    const updatedNode = await withTransaction(async (tx) => {
        const updatedNode = await NodeRepo.update(tx, input.nodeId, {
            title: result.title,
        });
        if (!updatedNode) throw new Error('NOT_FOUND: node');
        return updatedNode;
    });

    return { node: updatedNode };
}
