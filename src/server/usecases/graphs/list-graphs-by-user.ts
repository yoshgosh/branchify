import type { Ctx } from '@/server/usecases/common/context';
import type { Graph } from '@/shared/entities/graph';
import * as GraphRepo from '@/server/repositories/graphs/repository';
import { withTransaction } from '@/server/db/transaction';

export type ListGraphsByUserInput = Record<string, never>;
export type ListGraphsByUserOutput = { graphs: Graph[] };

export async function listGraphsByUser(
    ctx: Ctx,
    _input: ListGraphsByUserInput
): Promise<ListGraphsByUserOutput> {
    return withTransaction(async (tx) => {
        const graphs = await GraphRepo.listByUserId(tx, ctx.userId);
        return { graphs };
    });
}
