import type { Ctx } from '@/server/usecases/common/context';
import type { Node } from '@/shared/entities/node';
import * as NodeRepo from '@/server/repositories/nodes/repository';
import { withTransaction } from '@/server/db/transaction';

export type RemoveNodeInput = { nodeId: string };
export type RemoveNodeOutput = { node: Node | null };

export async function removeNode(_ctx: Ctx, input: RemoveNodeInput): Promise<RemoveNodeOutput> {
    return withTransaction(async (tx) => {
        const removed = await NodeRepo.remove(tx, input.nodeId);
        return { node: removed };
    });
}
