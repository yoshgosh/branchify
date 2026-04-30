import 'server-only';
import { auth } from '@/auth';
import type { Ctx } from '@/server/usecases/common';

export async function getCtx(): Promise<Ctx> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }
    return { userId: session.user.id };
}
