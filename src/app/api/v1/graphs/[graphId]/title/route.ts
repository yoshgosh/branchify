import { NextRequest, NextResponse } from 'next/server';
import { GraphIdPathSchema } from '@/shared/api/contracts/v1';
import { toGraphDto } from '@/shared/api/models';
import { generateGraphTitle } from '@/server/use-cases/graphs';
import { getCtx } from '@/server/libs/auth';

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<unknown> }
): Promise<NextResponse> {
    const ctx = await getCtx();
    const path = GraphIdPathSchema.parse(await params);
    const out = await generateGraphTitle(ctx, { graphId: path.graphId });
    return NextResponse.json({ graph: toGraphDto(out.graph) }, { status: 200 });
}
