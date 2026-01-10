import { NextRequest, NextResponse } from 'next/server';
import {
    NodeIdPathSchema,
    RemoveNodeRes,
    UpdateNodeBodySchema,
    UpdateNodeRes,
} from '@/shared/api/contracts/v1';
import { toNodeDto } from '@/shared/api/models/node';
import { updateNode, removeNode } from '@/server/use-cases/nodes';
import { getCtx } from '@/server/libs/auth';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<unknown> }
): Promise<NextResponse<UpdateNodeRes>> {
    const ctx = await getCtx();
    const path = NodeIdPathSchema.parse(await params);
    const body = UpdateNodeBodySchema.parse(await req.json());
    const out = await updateNode(ctx, { nodeId: path.nodeId, data: body.data });
    return NextResponse.json({ node: toNodeDto(out.node) }, { status: 200 });
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<unknown> }
): Promise<NextResponse<RemoveNodeRes>> {
    const ctx = await getCtx();
    const path = NodeIdPathSchema.parse(await params);
    const out = await removeNode(ctx, { nodeId: path.nodeId });
    const node = out.node ? toNodeDto(out.node) : null;
    return NextResponse.json({ node }, { status: 200 });
}
