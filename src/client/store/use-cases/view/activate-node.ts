import { AppThunk } from '@/client/store/store';
import { selectActiveViewEntry, selectActiveGraphId } from '@/client/store/features/view/selectors';
import { updateActiveEntry } from '@/client/store/features/view/slice';
import {
    selectParentNodeIdMapByGraphId,
    selectChildNodeIdMapByGraphId,
} from '@/client/store/features/edges/selectors';

export const activateNode =
    (nodeIdToActivate: string): AppThunk =>
    async (dispatch, getState) => {
        const state = getState();
        const activeGraphId = selectActiveGraphId(state);
        if (!activeGraphId) return;

        const entry = selectActiveViewEntry(state);
        const prevActiveNodeIds = entry.activeNodeIds;
        const parentNodeIdMap = selectParentNodeIdMapByGraphId(activeGraphId)(state);
        const childNodeIdMap = selectChildNodeIdMapByGraphId(activeGraphId)(state);

        const newActiveNodeIds = calculateActiveNodeIds(
            nodeIdToActivate,
            parentNodeIdMap,
            childNodeIdMap,
            prevActiveNodeIds
        );

        dispatch(updateActiveEntry({ data: { activeNodeIds: newActiveNodeIds } }));
    };

function calculateActiveNodeIds(
    nodeIdToActivate: string,
    parentNodeIdMap: Record<string, string[]>,
    childNodeIdMap: Record<string, string[]>,
    prevActiveNodeIds: string[]
): string[] {
    const calculateAncestorActiveNodeIds = (
        nodeIdToActivate: string,
        parentNodeIdMap: Record<string, string[]>,
        prevActiveNodeIds: string[]
    ): string[] => {
        const ancestorActiveNodeIds: string[] = [];
        let currentNodeId = nodeIdToActivate;
        while (true) {
            const parentNodeIds = parentNodeIdMap[currentNodeId] ?? [];
            if (parentNodeIds.length === 0) return ancestorActiveNodeIds;
            for (let i = parentNodeIds.length - 1; i >= 0; i--) {
                const parentNodeId = parentNodeIds[i];
                const idx = prevActiveNodeIds.indexOf(parentNodeId);
                if (idx !== -1) {
                    ancestorActiveNodeIds.unshift(...prevActiveNodeIds.slice(0, idx + 1));
                    return ancestorActiveNodeIds;
                }
            }
            const primaryParentNodeId = parentNodeIds.at(-1)!;
            ancestorActiveNodeIds.unshift(primaryParentNodeId);
            currentNodeId = primaryParentNodeId;
        }
    };

    const calculateDescendantActiveNodeIds = (
        nodeIdToActivate: string,
        childNodeIdMap: Record<string, string[]>,
        prevActiveNodeIds: string[]
    ): string[] => {
        const descendantActiveNodeIds: string[] = [];
        let currentNodeId: string = nodeIdToActivate;
        while (true) {
            const childNodeIds = childNodeIdMap[currentNodeId] ?? [];
            if (childNodeIds.length === 0) return descendantActiveNodeIds;
            for (let i = 0; i < childNodeIds.length; i++) {
                const childNodeId = childNodeIds[i];
                const idx = prevActiveNodeIds.indexOf(childNodeId);
                if (idx !== -1) {
                    descendantActiveNodeIds.push(...prevActiveNodeIds.slice(idx));
                    return descendantActiveNodeIds;
                }
            }
            const primaryChildNodeId = childNodeIds.at(-1)!;
            descendantActiveNodeIds.push(primaryChildNodeId);
            currentNodeId = primaryChildNodeId;
        }
    };

    const activeNodeIds: string[] = [];

    const ancestorActiveNodeIds = calculateAncestorActiveNodeIds(
        nodeIdToActivate,
        parentNodeIdMap,
        prevActiveNodeIds
    );
    activeNodeIds.push(...ancestorActiveNodeIds);

    activeNodeIds.push(nodeIdToActivate);

    const descendantActiveNodeIds = calculateDescendantActiveNodeIds(
        nodeIdToActivate,
        childNodeIdMap,
        prevActiveNodeIds
    );
    activeNodeIds.push(...descendantActiveNodeIds);

    return activeNodeIds;
}
