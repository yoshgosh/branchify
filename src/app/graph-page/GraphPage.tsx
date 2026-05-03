'use client';

import { useAppSelector } from '@/client/store/store';
import { selectActiveGraphId } from '@/client/store/features/view/selectors';
import GraphView from './graph-view/GraphView';
import Sidebar from './sidebar/Sidebar';

export default function GraphChatPage() {
    const activeGraphId = useAppSelector(selectActiveGraphId);

    return (
        <div className="h-screen flex divide-x divide-base-3 overflow-hidden">
            <Sidebar />
            <GraphView graphId={activeGraphId} />
        </div>
    );
}
