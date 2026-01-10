import { Ctx } from '@/server/use-cases/common';

export async function getCtx(): Promise<Ctx> {
    // TODO: 実装
    return { userId: process.env.DEV_USER_ID! };
}
