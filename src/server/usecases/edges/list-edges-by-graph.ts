import type { Ctx } from '@/server/usecases/common/context';
import type { Edge } from '@/shared/entities/edge';
import * as EdgeRepo from '@/server/repositories/edges/repository';
import { withTransaction } from '@/server/db/transaction';

export type ListEdgesByGraphInput = { graphId: string };
export type ListEdgesByGraphOutput = { edges: Edge[] };

export async function listEdgesByGraph(
    _ctx: Ctx,
    input: ListEdgesByGraphInput
): Promise<ListEdgesByGraphOutput> {
    return withTransaction(async (tx) => {
        const edges = await EdgeRepo.listByGraphId(tx, input.graphId);
        return { edges };
    });
}
