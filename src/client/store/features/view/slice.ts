import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ViewState, ViewEntry, createDefaultViewEntry } from './types';
import { removeGraphThunk } from '@/client/store/features/graphs/thunks';

const initialViewState: ViewState = {
    activeGraphId: null,
    entries: {},
    newEntry: createDefaultViewEntry(),
};

const view = createSlice({
    name: 'view',
    initialState: initialViewState,
    reducers: {
        setActiveGraphId: (state, action: PayloadAction<{ graphId: string | null }>) => {
            state.activeGraphId = action.payload.graphId;
        },

        updateEntry: (
            state,
            action: PayloadAction<{ graphId: string; data: Partial<ViewEntry> }>
        ) => {
            const entry = state.entries[action.payload.graphId];
            if (entry) {
                Object.assign(entry, action.payload.data);
            }
        },

        updateNewEntry: (state, action: PayloadAction<{ data: Partial<ViewEntry> }>) => {
            Object.assign(state.newEntry, action.payload.data);
        },

        initEntry: (state, action: PayloadAction<{ graphId: string }>) => {
            const { graphId } = action.payload;
            if (!state.entries[graphId]) {
                state.entries[graphId] = createDefaultViewEntry();
            }
        },

        promoteNewEntry: (state, action: PayloadAction<{ graphId: string }>) => {
            const { graphId } = action.payload;
            state.entries[graphId] = { ...state.newEntry };
            state.newEntry = createDefaultViewEntry();
            state.activeGraphId = graphId;
        },

        removeEntry: (state, action: PayloadAction<{ graphId: string }>) => {
            const { graphId } = action.payload;
            delete state.entries[graphId];
            if (state.activeGraphId === graphId) {
                state.activeGraphId = null;
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(removeGraphThunk.fulfilled, (state, action) => {
            const graph = action.payload.graph;
            if (graph) {
                delete state.entries[graph.graphId];
                if (state.activeGraphId === graph.graphId) {
                    state.activeGraphId = null;
                }
            }
        });
    },
});

export const {
    setActiveGraphId,
    updateEntry,
    updateNewEntry,
    initEntry,
    promoteNewEntry,
    removeEntry,
} = view.actions;

export default view.reducer;
