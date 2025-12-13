import { NextRequest, NextResponse } from "next/server";
import {
    GenerateNodeTitleRes,
    NodeIdPathSchema,
} from "@/shared/api/contracts/v1";
import { toNodeDto } from "@/shared/api/models/node";
import { generateNodeTitle } from "@/server/use-cases/nodes";
import { getCtx } from "@/server/libs/auth";

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<unknown> }
): Promise<NextResponse<GenerateNodeTitleRes>> {
    const ctx = await getCtx();
    const path = NodeIdPathSchema.parse(await params);
    const out = await generateNodeTitle(ctx, { nodeId: path.nodeId });
    return NextResponse.json({ node: toNodeDto(out.node) }, { status: 200 });
}
