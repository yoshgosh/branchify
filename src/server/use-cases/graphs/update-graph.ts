import type { Ctx } from '@/server/use-cases/common/context';
import type { Graph } from '@/shared/entities/graph';
import * as GraphRepo from '@/server/repositories/graphs/repository';
import { withTransaction } from '@/server/db/transaction';

export type UpdateGraphInput = { graphId: string; data: Partial<Pick<Graph, 'title'>> };
export type UpdateGraphOutput = { graph: Graph };

export async function updateGraph(_ctx: Ctx, input: UpdateGraphInput): Promise<UpdateGraphOutput> {
    return withTransaction(async (tx) => {
        const updated = await GraphRepo.update(tx, input.graphId, input.data);
        if (!updated) throw new Error('NOT_FOUND: graph');
        return { graph: updated };
    });
}
