import type { Ctx } from '@/server/usecases/common/context';
import type { User } from '@/shared/entities/user';
import * as UserRepo from '@/server/repositories/users/repository';
import { withTransaction } from '@/server/db/transaction';

export type UpdateMeInput = {
    data: Partial<Pick<User, 'openaiApiKey'>>;
};
export type UpdateMeOutput = { user: User };

function maskApiKey(key: string | null): string | null {
    return key ? `sk-...${key.slice(-4)}` : null;
}

export async function updateMe(ctx: Ctx, input: UpdateMeInput): Promise<UpdateMeOutput> {
    return withTransaction(async (tx) => {
        const user = await UserRepo.update(tx, ctx.userId, input.data);
        if (!user) throw new Error('NOT_FOUND: user');
        return { user: { ...user, openaiApiKey: maskApiKey(user.openaiApiKey) } };
    });
}
