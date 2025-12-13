import type { Ctx } from "@/server/use-cases/common/context";
import type { Graph } from "@/shared/entities/graph";
import * as GraphRepo from "@/server/repositories/graphs/repository";
import { withTransaction } from "@/server/db/transaction";

export type CreateGraphInput = Record<string, never>;
export type CreateGraphOutput = { graph: Graph };

export async function createGraph(
    ctx: Ctx,
    _input: CreateGraphInput
): Promise<CreateGraphOutput> {
    return withTransaction(async (tx) => {
        const created = await GraphRepo.create(tx, { userId: ctx.userId });
        return { graph: created };
    });
}
