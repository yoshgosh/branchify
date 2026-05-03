import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { graphAdapter } from './adapter';
import {
    listGraphsThunk,
    createGraphThunk,
    updateGraphThunk,
    removeGraphThunk,
    generateGraphTitleThunk,
} from './thunks';

// loadedGraphIds の各要素が一意であり、かつ entities に含まれていることを slice で保証する
interface GraphState extends ReturnType<typeof graphAdapter.getInitialState> {
    loadedGraphIds: string[];
}

const initialGraphState: GraphState = graphAdapter.getInitialState({
    loadedGraphIds: [],
});

const graph = createSlice({
    name: 'graph',
    initialState: initialGraphState,
    reducers: {
        addLoadedGraphId: (state, action: PayloadAction<{ graphId: string }>) => {
            const { graphId } = action.payload;
            if (!state.entities[graphId] || state.loadedGraphIds.includes(graphId)) return;
            state.loadedGraphIds.push(graphId);
        },

        removeLoadedGraphId: (state, action: PayloadAction<{ graphId: string }>) => {
            const { graphId } = action.payload;
            state.loadedGraphIds = state.loadedGraphIds.filter((id) => id !== graphId);
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
                    state.loadedGraphIds = state.loadedGraphIds.filter(
                        (id) => id !== graph.graphId
                    );
                }
            })

            .addCase(generateGraphTitleThunk.fulfilled, (state, action) => {
                graphAdapter.upsertOne(state, action.payload.graph);
            });
    },
});

export const { addLoadedGraphId, removeLoadedGraphId } = graph.actions;

export default graph.reducer;
