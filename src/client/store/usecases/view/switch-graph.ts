import { AppThunk } from '@/client/store/store';
import { setActiveGraphId, initEntry, updateEntry } from '@/client/store/features/view/slice';
import { selectIsGraphLoaded } from '@/client/store/features/graphs/selectors';
import { addLoadedGraphId } from '@/client/store/features/graphs/slice';
import { listNodesThunk } from '@/client/store/features/nodes/thunks';
import { listEdgesThunk } from '@/client/store/features/edges/thunks';
import { selectNodeIdsByGraphId } from '@/client/store/features/nodes/selectors';
import { activateNode } from './activate-node';

export const switchGraph =
    (graphId: string | null): AppThunk =>
    async (dispatch, getState) => {
        if (graphId) {
            dispatch(initEntry({ graphId }));
        }
        dispatch(setActiveGraphId({ graphId }));

        if (!graphId) return;

        const isLoaded = selectIsGraphLoaded(graphId)(getState());
        if (!isLoaded) {
            await Promise.all([
                dispatch(listNodesThunk({ graphId })),
                dispatch(listEdgesThunk({ graphId })),
            ]);
            dispatch(addLoadedGraphId({ graphId }));
        }

        const entry = getState().view.entries[graphId];
        if (!entry.headNodeId) {
            const nodeIds = selectNodeIdsByGraphId(graphId)(getState());
            const lastNodeId = nodeIds.at(-1) ?? null;
            if (lastNodeId) {
                dispatch(updateEntry({ graphId, data: { headNodeId: lastNodeId } }));
                dispatch(activateNode(lastNodeId));
            }
        }
    };
