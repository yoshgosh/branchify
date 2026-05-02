import { AppThunk } from '@/client/store/store';
import { setActiveGraphId, initEntry, updateActiveEntry } from '@/client/store/features/view/slice';
import { selectIsGraphSynced } from '@/client/store/features/graphs/selectors';
import { addSyncedGraphId } from '@/client/store/features/graphs/slice';
import { listNodesThunk } from '@/client/store/features/nodes/thunks';
import { listEdgesThunk } from '@/client/store/features/edges/thunks';
import { selectNodeIdsByGraphId } from '@/client/store/features/nodes/selectors';
import { activateNode } from './activate-node';

export const switchGraph =
    (graphId: string | null): AppThunk =>
    async (dispatch, getState) => {
        dispatch(setActiveGraphId({ graphId }));

        if (!graphId) return;

        const state = getState();
        if (!state.view.entries[graphId]) {
            dispatch(initEntry({ graphId }));
        }

        const isSynced = selectIsGraphSynced(graphId)(state);
        if (!isSynced) {
            await Promise.all([
                dispatch(listNodesThunk({ graphId })),
                dispatch(listEdgesThunk({ graphId })),
            ]);
            dispatch(addSyncedGraphId({ graphId }));
        }

        const entry = getState().view.entries[graphId];
        if (!entry.headNodeId) {
            const nodeIds = selectNodeIdsByGraphId(graphId)(getState());
            const lastNodeId = nodeIds.at(-1) ?? null;
            if (lastNodeId) {
                dispatch(updateActiveEntry({ data: { headNodeId: lastNodeId } }));
                dispatch(activateNode(lastNodeId));
            }
        }
    };
