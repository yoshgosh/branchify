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
            // 親ノードがない場合は終了
            if (parentNodeIds.length === 0) return ancestorActiveNodeIds;
            // 親ノードにすでにアクティブなノードが含まれる場合、アクティブな親ノードのうち最も新しいノード以前のノードを追加して終了
            for (let i = parentNodeIds.length - 1; i >= 0; i--) {
                const parentNodeId = parentNodeIds[i];
                const idx = prevActiveNodeIds.indexOf(parentNodeId);
                if (idx !== -1) {
                    ancestorActiveNodeIds.unshift(...prevActiveNodeIds.slice(0, idx + 1));
                    return ancestorActiveNodeIds;
                }
            }
            // 親ノードにすでにアクティブなノードが含まれない場合、親ノードのうちプライマリーなノード（最後=最も新しい）を追加
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
            // 子ノードがない場合は終了
            if (childNodeIds.length === 0) return descendantActiveNodeIds;
            // 子ノードにすでにアクティブなノードが含まれる場合、アクティブな子ノードのうち最も古いノード以降のノードを追加して終了
            for (let i = 0; i < childNodeIds.length; i++) {
                const childNodeId = childNodeIds[i];
                const idx = prevActiveNodeIds.indexOf(childNodeId);
                if (idx !== -1) {
                    descendantActiveNodeIds.push(...prevActiveNodeIds.slice(idx));
                    return descendantActiveNodeIds;
                }
            }
            // 子ノードにすでにアクティブなノードが含まれない場合、子ノードのうち最もプライマリーなノード（最後=最も新しい）を追加
            const primaryChildNodeId = childNodeIds.at(-1)!;
            descendantActiveNodeIds.push(primaryChildNodeId);
            currentNodeId = primaryChildNodeId;
        }
    };

    const activeNodeIds: string[] = [];

    // 祖先ノードを計算
    const ancestorActiveNodeIds = calculateAncestorActiveNodeIds(
        nodeIdToActivate,
        parentNodeIdMap,
        prevActiveNodeIds
    );
    activeNodeIds.push(...ancestorActiveNodeIds);

    // クリックされたノードを追加
    activeNodeIds.push(nodeIdToActivate);

    // 子孫ノードを計算
    const descendantActiveNodeIds = calculateDescendantActiveNodeIds(
        nodeIdToActivate,
        childNodeIdMap,
        prevActiveNodeIds
    );
    activeNodeIds.push(...descendantActiveNodeIds);

    return activeNodeIds;
}
