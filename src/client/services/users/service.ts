import { fetchJson } from '../api-client';
import type { GetMeRes, UpdateMeBody, UpdateMeRes } from '@/shared/api/contracts/v1';

export async function getMe(): Promise<GetMeRes> {
    return await fetchJson('/users/me');
}

export async function updateMe(body: UpdateMeBody): Promise<UpdateMeRes> {
    return await fetchJson('/users/me', {
        method: 'PATCH',
        body,
    });
}
