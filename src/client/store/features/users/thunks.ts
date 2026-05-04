import { createAsyncThunk } from '@reduxjs/toolkit';
import * as userService from '@/client/services/users/service';
import type { User } from '@/shared/entities/user';
import { fromUserDto } from '@/shared/api/models';

export const getMeThunk = createAsyncThunk<{ user: User }, void>('users/getMe', async () => {
    const res = await userService.getMe();
    return { user: fromUserDto(res.user) };
});

export const updateMeThunk = createAsyncThunk<{ user: User }, { data: { openaiApiKey?: string } }>(
    'users/updateMe',
    async ({ data }) => {
        const res = await userService.updateMe({ data });
        return { user: fromUserDto(res.user) };
    }
);
