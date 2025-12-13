import { RootState } from "@/client/store/store";
import { graphAdapter } from "./adapter";

export const graphSelectors = graphAdapter.getSelectors(
    (state: RootState) => state.graph
);

export const selectSyncedGraphIds = (state: RootState): string[] => {
    return state.graph.syncedGraphIds;
};

export const selectIsGraphSynced =
    (graphId: string) =>
    (state: RootState): boolean => {
        return state.graph.syncedGraphIds.includes(graphId);
    };
