import { createEntityAdapter } from '@reduxjs/toolkit';
import { Pane } from './types';

export const paneAdapter = createEntityAdapter<Pane, string>({
    selectId: (pane) => pane.paneId,
});
