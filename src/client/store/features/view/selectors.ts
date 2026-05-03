import { RootState } from '@/client/store/store';
import { ViewEntry } from './types';

export const selectActiveViewEntry = (state: RootState): ViewEntry => {
    const { activeGraphId, entries, newEntry } = state.view;
    if (activeGraphId) {
        return entries[activeGraphId]!;
    }
    return newEntry;
};

export const selectActiveGraphId = (state: RootState): string | null => {
    return state.view.activeGraphId;
};
