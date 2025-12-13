import type { Ctx } from "@/server/use-cases/common/context";
import type { Graph } from "@/shared/entities/graph";
import * as GraphRepo from "@/server/repositories/graphs/repository";
import { withTransaction } from "@/server/db/transaction";

export type RemoveGraphInput = { graphId: string };
export type RemoveGraphOutput = { graph: Graph | null };

export async function removeGraph(
    _ctx: Ctx,
    input: RemoveGraphInput
): Promise<RemoveGraphOutput> {
    return withTransaction(async (tx) => {
        const removed = await GraphRepo.remove(tx, input.graphId);
        return { graph: removed };
    });
}
