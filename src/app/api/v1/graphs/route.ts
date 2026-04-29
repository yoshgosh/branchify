import { NextRequest, NextResponse } from 'next/server';
import { CreateGraphRes, ListGraphsRes } from '@/shared/api/contracts/v1';
import { toGraphDto } from '@/shared/api/models';
import { listGraphsByUser, createGraph } from '@/server/usecases/graphs';
import { getCtx } from '@/server/libs/auth';

export async function GET(_req: NextRequest): Promise<NextResponse<ListGraphsRes>> {
    const ctx = await getCtx();
    const out = await listGraphsByUser(ctx, {});
    return NextResponse.json({ graphs: out.graphs.map(toGraphDto) }, { status: 200 });
}

export async function POST(_req: NextRequest): Promise<NextResponse<CreateGraphRes>> {
    const ctx = await getCtx();
    const out = await createGraph(ctx, {});
    return NextResponse.json({ graph: toGraphDto(out.graph) }, { status: 201 });
}
