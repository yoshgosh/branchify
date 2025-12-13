import { NextRequest, NextResponse } from "next/server";
import { ListEdgesQuerySchema, ListEdgesRes } from "@/shared/api/contracts/v1";
import { toEdgeDto } from "@/shared/api/models";
import { listEdgesByGraph } from "@/server/use-cases/edges";
import { getCtx } from "@/server/libs/auth";

export async function GET(
    req: NextRequest
): Promise<NextResponse<ListEdgesRes>> {
    const ctx = await getCtx();
    const query = ListEdgesQuerySchema.parse(
        Object.fromEntries(req.nextUrl.searchParams.entries())
    );
    const out = await listEdgesByGraph(ctx, { graphId: query.graphId });
    return NextResponse.json(
        { edges: out.edges.map(toEdgeDto) },
        { status: 200 }
    );
}
