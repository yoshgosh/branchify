import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { edgeAdapter } from "./adapter";
import { listEdgesThunk } from "./thunks";
import { createNodeThunk } from "@/client/store/features/nodes/thunks";

interface EdgeState extends ReturnType<typeof edgeAdapter.getInitialState> {}

const initialEdgeState: EdgeState = edgeAdapter.getInitialState();

const edge = createSlice({
    name: "edge",
    initialState: initialEdgeState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(listEdgesThunk.fulfilled, (state, action) => {
                edgeAdapter.upsertMany(state, action.payload.edges);
            })

            .addCase(createNodeThunk.fulfilled, (state, action) => {
                edgeAdapter.upsertMany(state, action.payload.edges);
            });
    },
});

export default edge.reducer;
