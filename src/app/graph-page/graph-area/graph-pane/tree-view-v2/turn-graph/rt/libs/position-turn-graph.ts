import { TurnNode, TurnEdge } from '../../../models';

type TurnNodeMap = Record<string, TurnNode>;
type ChildrenMap = Record<string, string[]>;

const toTurnNodeMap = (turnNodes: TurnNode[]): TurnNodeMap =>
    turnNodes.reduce<TurnNodeMap>((acc, node) => {
        acc[node.turnNodeId] = node;
        return acc;
    }, {} as TurnNodeMap);

const createChildrenMap = (turnEdges: TurnEdge[]): ChildrenMap =>
    turnEdges.reduce<ChildrenMap>((acc, edge) => {
        const { parentId, childId } = edge;
        if (!acc[parentId]) acc[parentId] = [];
        acc[parentId].push(childId);
        return acc;
    }, {} as ChildrenMap);

const findRootNode = (turnNodes: TurnNode[], turnEdges: TurnEdge[]): TurnNode | undefined => {
    const childIds = new Set(turnEdges.map((edge) => edge.childId));
    return turnNodes.find((node) => !childIds.has(node.turnNodeId));
};

const setPosition = (
    turnNodes: TurnNode[],
    childrenMap: ChildrenMap,
    rootNode: TurnNode
): void => {
    const depths: Record<string, number> = {};

    const calcDepth = (nodeId: string, depth: number): void => {
        depths[nodeId] = depth;
        const children = childrenMap[nodeId] ?? [];
        for (const childId of children) {
            calcDepth(childId, depth + 1);
        }
    };

    calcDepth(rootNode.turnNodeId, 0);

    let nextLeafX = 0;
    const positions: Record<string, number> = {};

    const assignX = (nodeId: string): number => {
        const children = childrenMap[nodeId] ?? [];

        if (children.length === 0) {
            positions[nodeId] = nextLeafX;
            nextLeafX += 1;
            return positions[nodeId];
        }

        const childXs: number[] = [];
        for (const childId of children) {
            childXs.push(assignX(childId));
        }

        const minX = Math.min(...childXs);
        const maxX = Math.max(...childXs);
        positions[nodeId] = (minX + maxX) / 2;

        return positions[nodeId];
    };

    assignX(rootNode.turnNodeId);

    for (const node of turnNodes) {
        node.x = positions[node.turnNodeId] ?? 0;
        node.y = depths[node.turnNodeId] ?? 0;
    }
};

const setHandle = (turnEdges: TurnEdge[], turnNodeMap: TurnNodeMap): void => {
    for (const turnEdge of turnEdges) {
        const parentTurnNode = turnNodeMap[turnEdge.parentId];
        const childTurnNode = turnNodeMap[turnEdge.childId];
        if (parentTurnNode.x === undefined || childTurnNode.x === undefined) continue;

        turnEdge.parentHandle = 'bottom';
        turnEdge.childHandle = 'top';
    }
};

export const positionTurnGraph = (
    turnNodes: TurnNode[],
    turnEdges: TurnEdge[]
): { turnNodes: TurnNode[]; turnEdges: TurnEdge[] } => {
    const positionedTurnNodes = turnNodes.map((turnNode) => ({ ...turnNode }));
    const positionedTurnEdges = turnEdges.map((turnEdge) => ({ ...turnEdge }));

    const childrenMap = createChildrenMap(positionedTurnEdges);
    const rootNode = findRootNode(positionedTurnNodes, positionedTurnEdges);

    if (!rootNode) {
        return {
            turnNodes: positionedTurnNodes,
            turnEdges: positionedTurnEdges,
        };
    }

    setPosition(positionedTurnNodes, childrenMap, rootNode);

    const turnNodeMap = toTurnNodeMap(positionedTurnNodes);
    setHandle(positionedTurnEdges, turnNodeMap);

    return {
        turnNodes: positionedTurnNodes,
        turnEdges: positionedTurnEdges,
    };
};
