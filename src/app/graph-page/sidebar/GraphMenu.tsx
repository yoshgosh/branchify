"use client";

import { useAppDispatch, useAppSelector } from "@/client/store/store";
import { graphSelectors } from "@/client/store/features/graphs/selectors";
import { openPane } from "@/client/store/use-cases/panes/open-pane";

interface GraphItemProps {
    graphId: string;
}

function GraphItem({ graphId }: GraphItemProps) {
    const dispatch = useAppDispatch();
    const graph = useAppSelector((state) =>
        graphSelectors.selectById(state, graphId)
    );

    const handleClick = (e: React.MouseEvent) => {
        const forceAdd = e.ctrlKey || e.metaKey;
        dispatch(openPane({ graphId }, forceAdd));
    };

    return (
        <li
            className="px-3 py-2 rounded hover:bg-bg cursor-pointer text-sm truncate"
            onClick={handleClick}
            title={graph?.title ?? "New Graph"}
        >
            {graph?.title ?? "New Graph"}
        </li>
    );
}

export default function GraphMenu() {
    const graphIds = useAppSelector(graphSelectors.selectIds);

    return (
        <div className="flex-1 overflow-y-auto">
            <ul className="p-2 space-y-2">
                {graphIds
                    .slice()
                    .reverse()
                    .map((graphId) => (
                        <GraphItem key={graphId} graphId={graphId} />
                    ))}
            </ul>
        </div>
    );
}
