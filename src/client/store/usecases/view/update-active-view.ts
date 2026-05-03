import { AppThunk } from '@/client/store/store';
import { selectActiveGraphId } from '@/client/store/features/view/selectors';
import { updateEntry, updateNewEntry } from '@/client/store/features/view/slice';
import { ViewEntry } from '@/client/store/features/view/types';

export const updateActiveView =
    (data: Partial<ViewEntry>): AppThunk =>
    (dispatch, getState) => {
        const graphId = selectActiveGraphId(getState());
        if (graphId) {
            dispatch(updateEntry({ graphId, data }));
        } else {
            dispatch(updateNewEntry({ data }));
        }
    };
