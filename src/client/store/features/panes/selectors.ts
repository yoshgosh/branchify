import { RootState } from '@/client/store/store';
import { paneAdapter } from './adapter';

export const paneSelectors = paneAdapter.getSelectors((state: RootState) => state.pane);

export const selectFocusedPaneId = (state: RootState) => {
    return state.pane.focusedPaneId;
};

export const selectOpenPaneIds = (state: RootState) => {
    return state.pane.openPaneIds;
};

export const selectIsPaneOpen =
    (paneId: string) =>
    (state: RootState): boolean => {
        return state.pane.openPaneIds.includes(paneId);
    };

export const selectPaneIdsByGraphId =
    (graphId: string | null) =>
    (state: RootState): string[] => {
        return paneSelectors
            .selectAll(state)
            .filter((pane) => pane.graphId === graphId)
            .map((pane) => pane.paneId);
    };

// TODO: 現状、最後に作った pane を返しており、最後に閉じた pane を返すように修正する
export const selectClosedPaneIdsByGraphId =
    (graphId: string | null) =>
    (state: RootState): string[] => {
        const openIds = state.pane.openPaneIds;
        return paneSelectors
            .selectAll(state)
            .filter((pane) => pane.graphId === graphId && !openIds.includes(pane.paneId))
            .map((pane) => pane.paneId);
    };

export const selectLatestClosedPaneIdByGraphId =
    (graphId: string | null) =>
    (state: RootState): string | null => {
        const closedIds = selectClosedPaneIdsByGraphId(graphId)(state);
        return closedIds.at(-1) ?? null;
    };
