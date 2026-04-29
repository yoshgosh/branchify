import { AppThunk } from '@/client/store/store';
import {
    paneSelectors,
    selectOpenPaneIds,
    selectFocusedPaneId,
    selectLatestClosedPaneIdByGraphId,
} from '@/client/store/features/panes/selectors';
import {
    createPane,
    insertOpenPaneId,
    removeOpenPaneId,
    setFocusedPaneId,
    updatePane,
} from '@/client/store/features/panes/slice';
import { addSyncedGraphId } from '@/client/store/features/graphs/slice';
import type { Pane } from '@/client/store/features/panes/types';
import { selectIsGraphSynced } from '@/client/store/features/graphs/selectors';
import { listNodesThunk } from '@/client/store/features/nodes/thunks';
import { listEdgesThunk } from '@/client/store/features/edges/thunks';
import { selectNodeIdsByGraphId } from '@/client/store/features/nodes/selectors';
import { activateNode } from './activate-node';

// paneData および paneData のプロパティについて、 undefined は未指定、null は空値の指定を意味し、厳格に区別する
// pane.graphId, pane.headNodeId の関係については usecases 内で保証する上、防御的ガードも行う
// 各 id が空文字列でないことは保証されている
export const openPane =
    (paneData?: Partial<Omit<Pane, 'paneId'>>, forceAdd = false, forceCreate = false): AppThunk =>
    async (dispatch, getState) => {
        const graphId = paneData?.graphId;

        const state = getState();
        const openPaneIds = selectOpenPaneIds(state);
        const focusedPaneId = selectFocusedPaneId(state);

        const mustAdd = !focusedPaneId;
        const focusedIdx = focusedPaneId ? openPaneIds.indexOf(focusedPaneId) : -1;

        // focusedPaneId が null 、または forceAdd が true の場合、追加
        if (mustAdd || forceAdd) {
            const { paneId } = await dispatch(getPaneIdToOpen(paneData, forceCreate));

            // focusedPane の次、または最後尾に追加
            const insertIdx = focusedIdx >= 0 ? focusedIdx + 1 : openPaneIds.length;

            dispatch(
                insertOpenPaneId({
                    paneId,
                    idx: insertIdx,
                })
            );
            dispatch(setFocusedPaneId({ paneId }));

            return;
        }

        // 開いている pane があり、かつ forceAdd が false の場合、置換

        // ただし、指定された graphId （　null を含む）の pane が既に開かれており、かつ forceCreate が false の場合は何もしない
        const focusedPane = paneSelectors.selectById(getState(), focusedPaneId);
        if (!focusedPane) return; // 防御的ガード
        if (focusedPane.graphId === graphId && !forceCreate) return;

        const { paneId } = await dispatch(getPaneIdToOpen(paneData, forceCreate));

        dispatch(
            insertOpenPaneId({
                paneId,
                idx: focusedIdx,
            })
        );
        dispatch(setFocusedPaneId({ paneId }));

        dispatch(removeOpenPaneId({ paneId: focusedPaneId! }));
    };

export const getPaneIdToOpen =
    (
        paneData?: Partial<Omit<Pane, 'paneId'>>,
        forceCreate: boolean = false
    ): AppThunk<Promise<{ paneId: string }>> =>
    async (dispatch, getState) => {
        const graphId = paneData?.graphId;

        const state = getState();

        // graphId が指定されており（ null を含む）、かつ forceCreate が false の場合、キャッシュを優先
        if (graphId !== undefined && !forceCreate) {
            const cachedPaneId = selectLatestClosedPaneIdByGraphId(graphId)(state);
            if (cachedPaneId) return { paneId: cachedPaneId };
        }

        // pane を新規作成
        // TODO: paneData の headNodeId / activeNodeIds と graphId に矛盾がないか確認する
        const action = createPane({
            data: paneData,
        });
        dispatch(action);
        const pane = action.payload.pane;

        // graphId が指定されている場合、nodes / edges の同期と headNodeId の設定、 activeNodeIds の activation を行う
        if (graphId) {
            const isSynced = selectIsGraphSynced(graphId)(state);
            // 未同期の graph であれば、非同期で nodes / edges を読み込み、完了後に同期済みフラグを立てる
            if (!isSynced) {
                await Promise.all([
                    dispatch(listNodesThunk({ graphId })),
                    dispatch(listEdgesThunk({ graphId })),
                ]);
                dispatch(addSyncedGraphId({ graphId }));
            }

            // paneData.headNodeId が undefined で headNodeId の指定がない場合、graph の最後の node を headNodeId に設定する
            let headNodeId = paneData?.headNodeId;
            if (headNodeId === undefined) {
                const nodeIds = selectNodeIdsByGraphId(graphId)(getState());
                headNodeId = nodeIds.at(-1);
                if (headNodeId !== undefined) {
                    dispatch(
                        updatePane({
                            paneId: pane.paneId,
                            data: { headNodeId },
                        })
                    );
                }
            }

            // activeNodeIds は指定の有無にかかわらず、headNodeId で activate する
            if (headNodeId) {
                dispatch(activateNode(pane.paneId, headNodeId));
            }
        }

        return { paneId: pane.paneId };
    };
