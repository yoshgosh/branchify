import type { Ctx } from '@/server/usecases/common/context';
import type { User } from '@/shared/entities/user';
import * as UserRepo from '@/server/repositories/users/repository';
import { withTransaction } from '@/server/db/transaction';

export type GetMeOutput = { user: User };

export async function getMe(ctx: Ctx): Promise<GetMeOutput> {
    const user = await withTransaction(async (tx) => UserRepo.findById(tx, ctx.userId));
    if (!user) throw new Error('NOT_FOUND: user');
    return { user };
}
