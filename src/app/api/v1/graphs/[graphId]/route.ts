import { NextRequest, NextResponse } from 'next/server';
import {
    GraphIdPathSchema,
    RemoveGraphRes,
    UpdateGraphBodySchema,
    UpdateGraphRes,
} from '@/shared/api/contracts/v1';
import { toGraphDto } from '@/shared/api/models';
import { updateGraph, removeGraph } from '@/server/use-cases/graphs';
import { getCtx } from '@/server/libs/auth';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<unknown> }
): Promise<NextResponse<UpdateGraphRes>> {
    const ctx = await getCtx();
    const path = GraphIdPathSchema.parse(await params);
    const body = UpdateGraphBodySchema.parse(await req.json());
    const out = await updateGraph(ctx, {
        graphId: path.graphId,
        data: body.data,
    });
    return NextResponse.json({ graph: toGraphDto(out.graph) }, { status: 200 });
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<unknown> }
): Promise<NextResponse<RemoveGraphRes>> {
    const ctx = await getCtx();
    const path = GraphIdPathSchema.parse(await params);
    const out = await removeGraph(ctx, { graphId: path.graphId });
    return NextResponse.json({ graph: out.graph ? toGraphDto(out.graph) : null }, { status: 200 });
}
