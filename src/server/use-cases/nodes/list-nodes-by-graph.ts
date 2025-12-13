import type { Ctx } from "@/server/use-cases/common/context";
import type { Node } from "@/shared/entities/node";
import * as NodeRepo from "@/server/repositories/nodes/repository";
import { withTransaction } from "@/server/db/transaction";

export type ListNodesByGraphInput = {
    graphId: string;
};

export type ListNodesByGraphOutput = {
    nodes: Node[];
};

export async function listNodesByGraph(
    _ctx: Ctx,
    input: ListNodesByGraphInput
): Promise<ListNodesByGraphOutput> {
    return await withTransaction(async (tx) => {
        const nodes = await NodeRepo.listByGraphId(tx, input.graphId);
        return { nodes };
    });
}
