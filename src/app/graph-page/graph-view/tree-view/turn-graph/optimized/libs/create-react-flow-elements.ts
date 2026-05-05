import { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';
import { TurnNode, TurnEdge } from '../../../models';

export const UNIT_X = 20;
export const UNIT_Y = 40;
export const PADDING = 20;

export const createReactFlowElements = (
    turnNodes: TurnNode[],
    turnEdges: TurnEdge[],
    options: {
        unitX: number;
        unitY: number;
        padding: number;
    } = {
        unitX: UNIT_X,
        unitY: UNIT_Y,
        padding: PADDING,
    }
): {
    nodes: ReactFlowNode<TurnNode>[];
    edges: ReactFlowEdge<TurnEdge>[];
} => {
    const { unitX, unitY, padding } = options;

    const nodes: ReactFlowNode<TurnNode>[] = turnNodes.map((turnNode) => ({
        id: turnNode.turnNodeId,
        type: 'turnNode',
        data: turnNode,
        position: {
            x: (turnNode.x ?? 0) * unitX + padding,
            y: (turnNode.y ?? 0) * unitY + padding,
        },
        zIndex: turnNode.isHead ? 3 : turnNode.isVisible ? 2 : turnNode.isActive ? 1 : 0,
    }));

    const edges: ReactFlowEdge<TurnEdge>[] = turnEdges.map((turnEdge) => ({
        id: turnEdge.turnEdgeId,
        type: 'turnEdge',
        source: turnEdge.childId,
        target: turnEdge.parentId,
        sourceHandle: turnEdge.childHandle,
        targetHandle: turnEdge.parentHandle,
        data: turnEdge,
        zIndex: turnEdge.isVisible ? 2 : turnEdge.isActive ? 1 : 0,
    }));

    return { nodes, edges };
};
