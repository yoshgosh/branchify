import { RefCallback, RefObject } from 'react';
import { TurnNode, TurnEdge } from '../models';

export type TurnGraphProps = {
    turnNodes: TurnNode[];
    turnEdges: TurnEdge[];
    onTurnNodeClick: (event: React.MouseEvent, turnNode: TurnNode) => void;
    registerTreeNodeRef: (id: string) => RefCallback<HTMLElement>;
    scrollContainerRef: RefObject<HTMLDivElement | null>;
};

export type TurnGraphComponent = React.ComponentType<TurnGraphProps>;
