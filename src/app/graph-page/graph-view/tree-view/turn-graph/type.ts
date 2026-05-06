import { RefCallback, RefObject } from 'react';
import { TurnNode, TurnEdge } from '../models';

export type TurnGraphProps = {
    turnNodes: TurnNode[];
    turnEdges: TurnEdge[];
    onTurnNodeClick: (event: React.MouseEvent, turnNode: TurnNode) => void;
    registerElementRef: (id: string) => RefCallback<HTMLElement>;
    containerRef: RefObject<HTMLDivElement | null>;
};

export type TurnGraphComponent = React.ComponentType<TurnGraphProps>;
