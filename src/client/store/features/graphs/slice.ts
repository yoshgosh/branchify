import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { graphAdapter } from './adapter';
import {
    listGraphsThunk,
    createGraphThunk,
    updateGraphThunk,
    removeGraphThunk,
    generateGraphTitleThunk,
} from './thunks';

// syncedGraphIds の各要素が一意であり、かつ entities に含まれていることを slice で保証する
interface GraphState extends ReturnType<typeof graphAdapter.getInitialState> {
    syncedGraphIds: string[];
}

const initialGraphState: GraphState = graphAdapter.getInitialState({
    syncedGraphIds: [],
});

const graph = createSlice({
    name: 'graph',
    initialState: initialGraphState,
    reducers: {
        addSyncedGraphId: (state, action: PayloadAction<{ graphId: string }>) => {
            const { graphId } = action.payload;
            if (!state.entities[graphId] || state.syncedGraphIds.includes(graphId)) return;
            state.syncedGraphIds.push(graphId);
        },

        removeSyncedGraphId: (state, action: PayloadAction<{ graphId: string }>) => {
            const { graphId } = action.payload;
            state.syncedGraphIds = state.syncedGraphIds.filter((id) => id !== graphId);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(listGraphsThunk.fulfilled, (state, action) => {
                graphAdapter.upsertMany(state, action.payload.graphs);
            })

            .addCase(createGraphThunk.fulfilled, (state, action) => {
                graphAdapter.upsertOne(state, action.payload.graph);
            })

            .addCase(updateGraphThunk.fulfilled, (state, action) => {
                graphAdapter.upsertOne(state, action.payload.graph);
            })

            .addCase(removeGraphThunk.fulfilled, (state, action) => {
                const graph = action.payload.graph;
                if (graph) {
                    graphAdapter.removeOne(state, graph.graphId);
                    state.syncedGraphIds = state.syncedGraphIds.filter(
                        (id) => id !== graph.graphId
                    );
                }
            })

            .addCase(generateGraphTitleThunk.fulfilled, (state, action) => {
                graphAdapter.upsertOne(state, action.payload.graph);
            });
    },
});

export const { addSyncedGraphId, removeSyncedGraphId } = graph.actions;

export default graph.reducer;
