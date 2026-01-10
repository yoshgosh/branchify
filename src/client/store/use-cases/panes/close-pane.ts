import { AppThunk } from '@/client/store/store';
import { selectOpenPaneIds, selectFocusedPaneId } from '@/client/store/features/panes/selectors';
import { removeOpenPaneId, setFocusedPaneId } from '@/client/store/features/panes/slice';

export const closePane =
    (paneId: string): AppThunk =>
    (dispatch, getState) => {
        const state = getState();
        const openPaneIds = selectOpenPaneIds(state);
        const focusedPaneId = selectFocusedPaneId(state);

        const targetIdx = openPaneIds.indexOf(paneId);
        if (targetIdx === -1) {
            // pane が開かれていない場合は何もしない
            return;
        }

        let nextFocusedPaneId: string | null = null;

        // 閉じる pane がフォーカスされている場合のみ、次のフォーカス対象を決める
        if (focusedPaneId === paneId) {
            if (targetIdx < openPaneIds.length - 1) {
                // focusedPane の次の idx の pane をフォーカス
                nextFocusedPaneId = openPaneIds[targetIdx + 1];
            } else {
                // 次の idx がない場合、focusedPane を除く最後尾の pane をフォーカス
                for (let i = openPaneIds.length - 1; i >= 0; i--) {
                    const candidate = openPaneIds[i];
                    if (candidate !== paneId) {
                        nextFocusedPaneId = candidate;
                        break;
                    }
                }
            }
        }

        // pane を閉じる（openPaneIds から取り除く）
        dispatch(removeOpenPaneId({ paneId }));

        // 次にフォーカスすべき pane がある場合のみ設定
        if (nextFocusedPaneId) {
            dispatch(setFocusedPaneId({ paneId: nextFocusedPaneId }));
        }
    };
