import { NextRequest, NextResponse } from 'next/server';
import {
    ListNodesQuerySchema,
    CreateNodeBodySchema,
    ListNodesRes,
    CreateNodeRes,
} from '@/shared/api/contracts/v1';
import { toNodeDto, mapMessageFromDto, toEdgeDto } from '@/shared/api/models';
import { listNodesByGraph, createNode } from '@/server/use-cases/nodes';
import { getCtx } from '@/server/libs/auth';

export async function GET(req: NextRequest): Promise<NextResponse<ListNodesRes>> {
    const ctx = await getCtx();
    const query = ListNodesQuerySchema.parse(
        Object.fromEntries(req.nextUrl.searchParams.entries())
    );
    const out = await listNodesByGraph(ctx, { graphId: query.graphId });
    return NextResponse.json({ nodes: out.nodes.map((n) => toNodeDto(n)) }, { status: 200 });
}

export async function POST(req: NextRequest): Promise<NextResponse<CreateNodeRes>> {
    const ctx = await getCtx();
    const body = CreateNodeBodySchema.parse(await req.json());
    const out = await createNode(ctx, {
        data: mapMessageFromDto(body.data),
        parentIds: body.parentIds,
    });
    return NextResponse.json(
        { node: toNodeDto(out.node), edges: out.edges.map(toEdgeDto) },
        { status: 201 }
    );
}
