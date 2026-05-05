import { TurnNode, TurnEdge, HandleType } from '../../../models';

const UNIT_X = 20;
const UNIT_Y = 40;
const PADDING = 20;
const NODE_SIZE = 20;

type PositionedNode = {
    turnNode: TurnNode;
    x: number;
    y: number;
};

type PositionedEdge = {
    turnEdge: TurnEdge;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
};

export type GraphLayout = {
    nodes: PositionedNode[];
    edges: PositionedEdge[];
    graphWidth: number;
    graphHeight: number;
};

const computeHandlePosition = (
    nodeX: number,
    nodeY: number,
    handle: HandleType
): { x: number; y: number } => {
    switch (handle) {
        case 'top':
            return { x: nodeX + NODE_SIZE / 2, y: nodeY };
        case 'bottom':
            return { x: nodeX + NODE_SIZE / 2, y: nodeY + NODE_SIZE };
        case 'right':
            return { x: nodeX + NODE_SIZE, y: nodeY + NODE_SIZE / 2 };
        case 'left':
            return { x: nodeX, y: nodeY + NODE_SIZE / 2 };
    }
};

export const computeLayout = (turnNodes: TurnNode[], turnEdges: TurnEdge[]): GraphLayout => {
    const nodePositionMap = new Map<string, { x: number; y: number }>();

    const nodes: PositionedNode[] = turnNodes.map((turnNode) => {
        const x = (turnNode.x ?? 0) * UNIT_X + PADDING;
        const y = (turnNode.y ?? 0) * UNIT_Y + PADDING;
        nodePositionMap.set(turnNode.turnNodeId, { x, y });
        return { turnNode, x, y };
    });

    const edges: PositionedEdge[] = turnEdges.map((turnEdge) => {
        const childPos = nodePositionMap.get(turnEdge.childId) ?? { x: 0, y: 0 };
        const parentPos = nodePositionMap.get(turnEdge.parentId) ?? { x: 0, y: 0 };

        const source = computeHandlePosition(childPos.x, childPos.y, turnEdge.childHandle ?? 'top');
        const target = computeHandlePosition(
            parentPos.x,
            parentPos.y,
            turnEdge.parentHandle ?? 'bottom'
        );

        return {
            turnEdge,
            sourceX: source.x,
            sourceY: source.y,
            targetX: target.x,
            targetY: target.y,
        };
    });

    let maxX = 0;
    let maxY = 0;
    for (const node of nodes) {
        maxX = Math.max(maxX, node.x + NODE_SIZE);
        maxY = Math.max(maxY, node.y + NODE_SIZE);
    }
    const graphWidth = maxX + PADDING;
    const graphHeight = maxY + PADDING;

    return { nodes, edges, graphWidth, graphHeight };
};
