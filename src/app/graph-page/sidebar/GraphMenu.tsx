'use client';

import { useAppDispatch, useAppSelector } from '@/client/store/store';
import { graphSelectors } from '@/client/store/features/graphs/selectors';
import { switchGraph } from '@/client/store/usecases/view/switch-graph';

interface GraphItemProps {
    graphId: string;
    onSelect: (graphId: string) => void;
}

function GraphItem({ graphId, onSelect }: GraphItemProps) {
    const graph = useAppSelector((state) => graphSelectors.selectById(state, graphId));

    return (
        <li
            className="px-3 py-2 rounded hover:bg-base-3 cursor-pointer text-sm truncate"
            onClick={() => onSelect(graphId)}
            title={graph?.title ?? 'New Graph'}
        >
            {graph?.title ?? 'New Graph'}
        </li>
    );
}

export default function GraphMenu() {
    const dispatch = useAppDispatch();
    const graphIds = useAppSelector(graphSelectors.selectIds);

    const handleSelect = (graphId: string) => {
        dispatch(switchGraph(graphId));
    };

    return (
        <ul className="p-2 space-y-2">
            {graphIds
                .slice()
                .reverse()
                .map((graphId) => (
                    <GraphItem key={graphId} graphId={graphId} onSelect={handleSelect} />
                ))}
        </ul>
    );
}
