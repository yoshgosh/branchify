import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { paneAdapter } from "./adapter";
import { Pane } from "./types";
import { v4 as uuidv4 } from "uuid";
import { getDefaultPaneData } from "./types";

// focusedPaneId が null でない場合、entities 及び openPaneIds に含まれていることを slice で保証する
// openPaneIds の各要素が一意であり、かつ entities に含まれていることを slice で保証する
interface PaneState extends ReturnType<typeof paneAdapter.getInitialState> {
    focusedPaneId: string | null;
    openPaneIds: string[];
}

const initialPaneState: PaneState = paneAdapter.getInitialState({
    focusedPaneId: null,
    openPaneIds: [],
});

const pane = createSlice({
    name: "pane",
    initialState: initialPaneState,
    reducers: {
        createPane: {
            reducer: (
                state,
                action: PayloadAction<{
                    pane: Pane;
                }>
            ) => {
                paneAdapter.addOne(state, action.payload.pane);
            },
            prepare: (args?: { data?: Partial<Omit<Pane, "paneId">> }) => {
                const data = args?.data ?? {};
                const pane: Pane = {
                    paneId: uuidv4(),
                    ...getDefaultPaneData(),
                    ...data,
                };
                return {
                    payload: { pane },
                };
            },
        },

        updatePane: (
            state,
            action: PayloadAction<{
                paneId: string;
                data: Partial<Omit<Pane, "paneId">>;
            }>
        ) => {
            const { paneId, data } = action.payload;
            if (!state.entities[paneId]) return;
            paneAdapter.updateOne(state, {
                id: paneId,
                changes: data,
            });
        },

        removePane: (state, action: PayloadAction<{ paneId: string }>) => {
            paneAdapter.removeOne(state, action.payload.paneId);
            state.openPaneIds = state.openPaneIds.filter(
                (id) => id !== action.payload.paneId
            );
            if (state.focusedPaneId === action.payload.paneId) {
                state.focusedPaneId = null;
            }
        },

        insertOpenPaneId: (
            state,
            action: PayloadAction<{ paneId: string; idx?: number }>
        ) => {
            const { paneId, idx } = action.payload;
            if (!state.entities[paneId] || state.openPaneIds.includes(paneId))
                return;
            if (
                idx === undefined ||
                idx < 0 ||
                idx >= state.openPaneIds.length
            ) {
                state.openPaneIds.push(paneId);
            } else {
                state.openPaneIds.splice(idx, 0, paneId);
            }
        },

        removeOpenPaneId: (
            state,
            action: PayloadAction<{ paneId: string }>
        ) => {
            const { paneId } = action.payload;
            const index = state.openPaneIds.indexOf(paneId);
            if (index !== -1) {
                state.openPaneIds.splice(index, 1);
                if (state.focusedPaneId === paneId) {
                    state.focusedPaneId = null;
                }
            }
        },

        setFocusedPaneId: (
            state,
            action: PayloadAction<{ paneId: string | null }>
        ) => {
            if (
                action.payload.paneId &&
                !state.openPaneIds.includes(action.payload.paneId)
            )
                return;
            state.focusedPaneId = action.payload.paneId;
        },
    },
});

export const {
    createPane,
    updatePane,
    removePane,
    insertOpenPaneId,
    removeOpenPaneId,
    setFocusedPaneId,
} = pane.actions;

export default pane.reducer;
