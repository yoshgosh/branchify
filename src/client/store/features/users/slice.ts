import { createSlice } from '@reduxjs/toolkit';
import { getMeThunk, updateMeThunk } from './thunks';
import type { UserDto } from '@/shared/api/models';

interface UserState {
    me: UserDto | null;
}

const initialState: UserState = { me: null };

const user = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getMeThunk.fulfilled, (state, action) => {
                state.me = action.payload.user;
            })
            .addCase(updateMeThunk.fulfilled, (state, action) => {
                state.me = action.payload.user;
            });
    },
});

export default user.reducer;
