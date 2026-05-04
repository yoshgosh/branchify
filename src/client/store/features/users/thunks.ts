import { createAsyncThunk } from '@reduxjs/toolkit';
import * as userService from '@/client/services/users/service';
import type { UserDto } from '@/shared/api/models';

export const getMeThunk = createAsyncThunk<{ user: UserDto }, void>('users/getMe', async () => {
    const res = await userService.getMe();
    return { user: res.user };
});

export const updateMeThunk = createAsyncThunk<
    { user: UserDto },
    { data: { openaiApiKey?: string } }
>('users/updateMe', async ({ data }) => {
    const res = await userService.updateMe({ data });
    return { user: res.user };
});
