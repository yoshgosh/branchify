import { TurnNode, TurnEdge } from '../models';

export type TurnGraphProps = {
    turnNodes: TurnNode[];
    turnEdges: TurnEdge[];
    onTurnNodeClick: (event: React.MouseEvent, turnNode: TurnNode) => void;
    scrollToTurnNodeId?: string | null;
    showTitle?: boolean;
};

export type TurnGraphComponent = React.ComponentType<TurnGraphProps>;
