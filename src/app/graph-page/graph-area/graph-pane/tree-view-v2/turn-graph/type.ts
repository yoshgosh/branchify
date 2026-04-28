import { TurnNode, TurnEdge } from '../models';

export type TurnGraphProps = {
    turnNodes: TurnNode[];
    turnEdges: TurnEdge[];
    onTurnNodeClick: (event: React.MouseEvent, turnNode: TurnNode) => void;
};

export type TurnGraphComponent = React.ComponentType<TurnGraphProps>;
