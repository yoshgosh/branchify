import { TurnNode, TurnEdge } from '../../../models';

const UNIT_X = 30;
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

export const computeLayout = (turnNodes: TurnNode[], turnEdges: TurnEdge[]): GraphLayout => {
    const childrenMap = new Map<string, string[]>();
    for (const edge of turnEdges) {
        if (!childrenMap.has(edge.parentId)) childrenMap.set(edge.parentId, []);
        childrenMap.get(edge.parentId)!.push(edge.childId);
    }

    const childIds = new Set(turnEdges.map((e) => e.childId));
    const rootNode = turnNodes.find((n) => !childIds.has(n.turnNodeId));

    if (!rootNode) {
        return { nodes: [], edges: [], graphWidth: PADDING * 2, graphHeight: PADDING * 2 };
    }

    const depthMap = new Map<string, number>();
    const calcDepth = (nodeId: string, depth: number) => {
        depthMap.set(nodeId, depth);
        for (const childId of childrenMap.get(nodeId) ?? []) {
            calcDepth(childId, depth + 1);
        }
    };
    calcDepth(rootNode.turnNodeId, 0);

    let nextLeafX = 0;
    const xMap = new Map<string, number>();
    const assignX = (nodeId: string): number => {
        const children = childrenMap.get(nodeId) ?? [];
        if (children.length === 0) {
            xMap.set(nodeId, nextLeafX++);
            return xMap.get(nodeId)!;
        }
        const childXs = children.map(assignX);
        const x = (Math.min(...childXs) + Math.max(...childXs)) / 2;
        xMap.set(nodeId, x);
        return x;
    };
    assignX(rootNode.turnNodeId);

    const nodePositionMap = new Map<string, { x: number; y: number }>();
    const nodes: PositionedNode[] = turnNodes.map((turnNode) => {
        const x = (xMap.get(turnNode.turnNodeId) ?? 0) * UNIT_X + PADDING;
        const y = (depthMap.get(turnNode.turnNodeId) ?? 0) * UNIT_Y + PADDING;
        nodePositionMap.set(turnNode.turnNodeId, { x, y });
        return { turnNode, x, y };
    });

    const edges: PositionedEdge[] = turnEdges.map((turnEdge) => {
        const childPos = nodePositionMap.get(turnEdge.childId) ?? { x: 0, y: 0 };
        const parentPos = nodePositionMap.get(turnEdge.parentId) ?? { x: 0, y: 0 };
        return {
            turnEdge,
            sourceX: childPos.x + NODE_SIZE / 2,
            sourceY: childPos.y,
            targetX: parentPos.x + NODE_SIZE / 2,
            targetY: parentPos.y + NODE_SIZE,
        };
    });

    let maxX = 0;
    let maxY = 0;
    for (const node of nodes) {
        maxX = Math.max(maxX, node.x + NODE_SIZE);
        maxY = Math.max(maxY, node.y + NODE_SIZE);
    }

    return { nodes, edges, graphWidth: maxX + PADDING, graphHeight: maxY + PADDING };
};
