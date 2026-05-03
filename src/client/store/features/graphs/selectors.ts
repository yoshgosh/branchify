import { RootState } from '@/client/store/store';
import { graphAdapter } from './adapter';

export const graphSelectors = graphAdapter.getSelectors((state: RootState) => state.graph);

export const selectLoadedGraphIds = (state: RootState): string[] => {
    return state.graph.loadedGraphIds;
};

export const selectIsGraphLoaded =
    (graphId: string) =>
    (state: RootState): boolean => {
        return state.graph.loadedGraphIds.includes(graphId);
    };
