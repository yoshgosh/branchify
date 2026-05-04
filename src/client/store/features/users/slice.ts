import { createSlice } from '@reduxjs/toolkit';
import { getMeThunk, updateMeThunk } from './thunks';
import type { User } from '@/shared/entities/user';

interface UserState {
    me: User | null;
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
