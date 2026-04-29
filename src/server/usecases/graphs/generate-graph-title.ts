import type { Ctx } from '@/server/usecases/common/context';
import type { Graph } from '@/shared/entities/graph';
import { withTransaction } from '@/server/db/transaction';
import * as GraphRepo from '@/server/repositories/graphs/repository';
import * as NodeRepo from '@/server/repositories/nodes/repository';

export type GenerateGraphTitleInput = { graphId: string };
export type GenerateGraphTitleOutput = { graph: Graph };

export async function generateGraphTitle(
    _ctx: Ctx,
    input: GenerateGraphTitleInput
): Promise<GenerateGraphTitleOutput> {
    // graphIdで最も古いnodeのtitleを取得
    const nodes = await withTransaction(async (tx) => {
        return await NodeRepo.listByGraphId(tx, input.graphId);
    });

    // createdAtでソートして最も古いnodeを取得
    const oldestNode =
        nodes.length > 0
            ? nodes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0]
            : null;

    const title = oldestNode?.title ?? null;

    // graphのtitleを更新
    const graph = await withTransaction(async (tx) => {
        const graph = await GraphRepo.update(tx, input.graphId, {
            title,
        });
        if (!graph) throw new Error('NOT_FOUND: graph');
        return graph;
    });

    return { graph };
}
