import { RootState } from '@/client/store/store';
import { ViewEntry, createDefaultViewEntry } from './types';

export const selectActiveViewEntry = (state: RootState): ViewEntry => {
    const { activeGraphId, entries, newEntry } = state.view;
    if (activeGraphId) {
        return entries[activeGraphId] ?? createDefaultViewEntry();
    }
    return newEntry;
};

export const selectActiveGraphId = (state: RootState): string | null => {
    return state.view.activeGraphId;
};
