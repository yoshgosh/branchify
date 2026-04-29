'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/client/store/store';
import { selectOpenPaneIds, selectFocusedPaneId } from '@/client/store/features/panes/selectors';
import { openPane } from '@/client/store/usecases/panes/open-pane';
import GraphPane from './graph-pane/GraphPane';

export default function GraphArea() {
    const dispatch = useAppDispatch();
    const openPaneIds = useAppSelector(selectOpenPaneIds);
    const focusedPaneId = useAppSelector(selectFocusedPaneId);

    useEffect(() => {
        if (openPaneIds.length === 0) {
            dispatch(openPane({ graphId: null }));
        }
    }, [dispatch, openPaneIds.length]);

    return (
        <div className="flex-1 flex divide-x divide-base-3 overflow-hidden">
            {openPaneIds.map((paneId) => (
                <GraphPane key={paneId} paneId={paneId} isFocused={paneId === focusedPaneId} />
            ))}
        </div>
    );
}
