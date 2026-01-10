import type { Ctx } from '@/server/use-cases/common/context';
import type { Node } from '@/shared/entities/node';
import * as NodeRepo from '@/server/repositories/nodes/repository';
import { withTransaction } from '@/server/db/transaction';

export type UpdateNodeInput = {
    nodeId: string;
    data: Partial<Pick<Node, 'title'>>;
};
export type UpdateNodeOutput = { node: Node };

export async function updateNode(_ctx: Ctx, input: UpdateNodeInput): Promise<UpdateNodeOutput> {
    return withTransaction(async (tx) => {
        const updated = await NodeRepo.update(tx, input.nodeId, input.data);
        if (!updated) throw new Error('NOT_FOUND: node');
        return { node: updated };
    });
}
