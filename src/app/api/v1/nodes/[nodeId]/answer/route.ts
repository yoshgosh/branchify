import { NextRequest, NextResponse } from 'next/server';
import { NodeIdPathSchema } from '@/shared/api/contracts/v1';
import { generateAnswerMessage } from '@/server/usecases/nodes/generate-answer-message';
import { getCtx } from '@/server/libs/auth';

export async function POST(_req: NextRequest, { params }: { params: Promise<unknown> }) {
    const ctx = await getCtx();
    const path = NodeIdPathSchema.parse(await params);

    const { stream } = await generateAnswerMessage(ctx, {
        nodeId: path.nodeId,
    });

    const encoder = new TextEncoder();
    const sseStream = new ReadableStream({
        async start(controller) {
            const reader = stream.getReader();
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const payload = JSON.stringify(value);
                    controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
                }

                controller.enqueue(encoder.encode('event: end\n\n'));
                controller.close();
            } catch (err) {
                controller.enqueue(
                    encoder.encode(`event: error\ndata: ${(err as Error).message}\n\n`)
                );
                controller.close();
            }
        },
    });

    return new NextResponse(sseStream, {
        status: 200,
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        },
    });
}
