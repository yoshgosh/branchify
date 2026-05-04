import { NextRequest, NextResponse } from 'next/server';
import { getCtx } from '@/server/libs/auth';
import { getMe, updateMe } from '@/server/usecases/users';
import { UpdateMeBodySchema, type GetMeRes, type UpdateMeRes } from '@/shared/api/contracts/v1';

export async function GET(): Promise<NextResponse<GetMeRes>> {
    const ctx = await getCtx();
    const { user } = await getMe(ctx);
    return NextResponse.json({ user }, { status: 200 });
}

export async function PATCH(req: NextRequest): Promise<NextResponse<UpdateMeRes>> {
    const ctx = await getCtx();
    const body = UpdateMeBodySchema.parse(await req.json());
    const { user } = await updateMe(ctx, { data: body.data });
    return NextResponse.json({ user }, { status: 200 });
}
