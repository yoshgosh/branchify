'use client';

import { useAppDispatch, useAppSelector } from '@/client/store/store';
import { graphSelectors } from '@/client/store/features/graphs/selectors';
import { selectActiveGraphId } from '@/client/store/features/view/selectors';
import { switchGraph } from '@/client/store/usecases/view/switch-graph';

interface GraphItemProps {
    graphId: string;
    isActive: boolean;
    onSelect: (graphId: string) => void;
}

function GraphItem({ graphId, isActive, onSelect }: GraphItemProps) {
    const graph = useAppSelector((state) => graphSelectors.selectById(state, graphId));

    return (
        <li
            className={`px-3 py-1.5 rounded-lg cursor-pointer text-sm truncate hover:bg-base-3 ${
                isActive ? 'bg-base-3' : ''
            }`}
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
    const activeGraphId = useAppSelector(selectActiveGraphId);

    const handleSelect = (graphId: string) => {
        dispatch(switchGraph(graphId));
    };

    return (
        <ul className="p-2 space-y-0.5">
            {graphIds
                .slice()
                .reverse()
                .map((graphId) => (
                    <GraphItem
                        key={graphId}
                        graphId={graphId}
                        isActive={graphId === activeGraphId}
                        onSelect={handleSelect}
                    />
                ))}
        </ul>
    );
}
