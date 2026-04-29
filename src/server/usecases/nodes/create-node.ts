import type { Ctx } from '@/server/usecases/common/context';
import type { Node, Message } from '@/shared/entities/node';
import type { Edge } from '@/shared/entities';
import * as NodeRepo from '@/server/repositories/nodes/repository';
import * as EdgeRepo from '@/server/repositories/edges/repository';
import { withTransaction } from '@/server/db/transaction';

export type CreateNodeInput = {
    data: Omit<Node, 'nodeId' | 'createdAt' | 'updatedAt' | 'title' | 'message'> & {
        title?: string | null;
        message?: Message | null;
    };
    parentIds: string[];
};
export type CreateNodeOutput = {
    node: Node;
    edges: Edge[];
};

export async function createNode(_ctx: Ctx, input: CreateNodeInput): Promise<CreateNodeOutput> {
    return withTransaction(async (tx) => {
        const parents = await NodeRepo.findByIds(tx, input.parentIds);
        if (parents.length !== input.parentIds.length) {
            throw new Error('One or more parent nodes not found');
        }
        const notCompleted = parents.filter((p) => p.status !== 'completed');
        if (notCompleted.length > 0) {
            throw new Error("All parent nodes must have status 'completed'");
        }
        const created = await NodeRepo.create(tx, input.data);
        const edges = await Promise.all(
            input.parentIds.map((parentId) =>
                EdgeRepo.create(tx, {
                    graphId: created.graphId,
                    parentId: parentId,
                    childId: created.nodeId,
                })
            )
        );
        return { node: created, edges };
    });
}
