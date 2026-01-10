import { RootState } from '@/client/store/store';
import { edgeAdapter } from './adapter';
import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from '@/client/store/utils/create-cached-selector';

export const edgeSelectors = edgeAdapter.getSelectors((state: RootState) => state.edge);

export const selectEdgesByGraphId = createCachedSelector((graphId: string) =>
    createSelector(edgeSelectors.selectAll, (edges) =>
        edges.filter((edge) => edge.graphId === graphId)
    )
);

export const selectEdgeIdsByGraphId = (graphId: string) => (state: RootState) => {
    const edges = selectEdgesByGraphId(graphId)(state);
    return edges.map((edge) => edge.edgeId);
    // TODO: selectIds + entities[edgeId] の方がメモリ効率がいいかも
};

export const selectParentNodeIdMapByGraphId = createCachedSelector((graphId: string) =>
    createSelector(selectEdgesByGraphId(graphId), (edges) => {
        const parentMap: Record<string, string[]> = {};
        for (const edge of edges) {
            const { parentId, childId } = edge;
            if (!parentMap[childId]) parentMap[childId] = [];
            parentMap[childId].push(parentId); // 昇順を保証
        }
        return parentMap;
    })
);

export const selectChildNodeIdMapByGraphId = createCachedSelector((graphId: string) =>
    createSelector(selectEdgesByGraphId(graphId), (edges) => {
        const childMap: Record<string, string[]> = {};
        for (const edge of edges) {
            const { parentId, childId } = edge;
            if (!childMap[parentId]) childMap[parentId] = [];
            childMap[parentId].push(childId); // 昇順を保証
        }
        return childMap;
    })
);
