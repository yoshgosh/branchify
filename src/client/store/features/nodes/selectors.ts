import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/client/store/store';
import { nodeAdapter } from './adapter';
import { createCachedSelector } from '@/client/store/utils/create-cached-selector';

export const nodeSelectors = nodeAdapter.getSelectors((state: RootState) => state.node);

export const selectNodesByGraphId = createCachedSelector((graphId: string) =>
    createSelector(nodeSelectors.selectAll, (nodes) =>
        nodes.filter((node) => node.graphId === graphId)
    )
);

export const selectNodeIdsByGraphId = (graphId: string) => (state: RootState) => {
    const nodesOfGraph = selectNodesByGraphId(graphId)(state);
    return nodesOfGraph.map((node) => node.nodeId);
    // TODO: selectIds + entities[nodeId] の方がメモリ効率がいいかも
};

export const selectNodeMapByGraphId = createCachedSelector((graphId: string) =>
    createSelector(selectNodesByGraphId(graphId), (nodes) =>
        Object.fromEntries(nodes.map((node) => [node.nodeId, node]))
    )
);
