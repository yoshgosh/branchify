import type { Ctx } from '@/server/usecases/common/context';
import type { User } from '@/shared/entities/user';
import * as UserRepo from '@/server/repositories/users/repository';
import { withTransaction } from '@/server/db/transaction';

export type UpdateMeInput = {
    data: Partial<Pick<User, 'openaiApiKey'>>;
};
export type UpdateMeOutput = { user: User };

export async function updateMe(ctx: Ctx, input: UpdateMeInput): Promise<UpdateMeOutput> {
    const { openaiApiKey } = input.data;

    if (openaiApiKey !== undefined && !openaiApiKey.startsWith('sk-')) {
        throw new Error('VALIDATION: APIキーは sk- で始まる必要があります');
    }

    return withTransaction(async (tx) => {
        const user = await UserRepo.update(tx, ctx.userId, input.data);
        if (!user) throw new Error('NOT_FOUND: user');
        return { user };
    });
}
