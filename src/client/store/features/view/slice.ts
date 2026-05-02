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

        updateActiveEntry: (state, action: PayloadAction<{ data: Partial<ViewEntry> }>) => {
            const { data } = action.payload;
            if (state.activeGraphId) {
                const entry = state.entries[state.activeGraphId];
                if (entry) {
                    Object.assign(entry, data);
                }
            } else {
                Object.assign(state.newEntry, data);
            }
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

export const { setActiveGraphId, updateActiveEntry, initEntry, promoteNewEntry, removeEntry } =
    view.actions;

export default view.reducer;
