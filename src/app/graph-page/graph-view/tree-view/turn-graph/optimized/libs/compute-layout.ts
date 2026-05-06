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

const assignLanes = (
    turnNodes: TurnNode[],
    parentMap: Map<string, string[]>
): Map<string, number> => {
    const lanes: (string | null)[] = [];
    const colMap = new Map<string, number>();

    const getLaneIdx = (id: string) => lanes.findIndex((v) => v === id);
    const getNewLaneIdx = () => {
        lanes.push(null);
        return lanes.length - 1;
    };
    const getFreeLaneIdx = () => {
        const i = lanes.findIndex((v) => v === null);
        return i === -1 ? getNewLaneIdx() : i;
    };
    const clearLanes = (id: string) => {
        for (let i = 0; i < lanes.length; i++) if (lanes[i] === id) lanes[i] = null;
    };
    const reserveLane = (id: string, idx: number) => {
        lanes[idx] = id;
    };

    for (let i = turnNodes.length - 1; i >= 0; i--) {
        const { turnNodeId } = turnNodes[i];

        let laneIdx = getLaneIdx(turnNodeId);
        if (laneIdx === -1) laneIdx = getFreeLaneIdx();
        colMap.set(turnNodeId, laneIdx);

        clearLanes(turnNodeId);

        const parentIds = parentMap.get(turnNodeId) ?? [];
        if (parentIds[0]) reserveLane(parentIds[0], laneIdx);
        for (let j = 1; j < parentIds.length; j++) {
            const parentId = parentIds[j];
            let parentLaneIdx = getLaneIdx(parentId);
            if (parentLaneIdx === -1) parentLaneIdx = getFreeLaneIdx();
            reserveLane(parentId, parentLaneIdx);
        }
    }

    return colMap;
};

export const computeLayout = (turnNodes: TurnNode[], turnEdges: TurnEdge[]): GraphLayout => {
    const parentMap = new Map<string, string[]>();
    for (const edge of turnEdges) {
        if (!parentMap.has(edge.childId)) parentMap.set(edge.childId, []);
        parentMap.get(edge.childId)!.push(edge.parentId);
    }

    const colMap = assignLanes(turnNodes, parentMap);

    const nodePositionMap = new Map<string, { x: number; y: number }>();
    const nodes: PositionedNode[] = turnNodes.map((turnNode, i) => {
        const x = (colMap.get(turnNode.turnNodeId) ?? 0) * UNIT_X + PADDING;
        const y = i * UNIT_Y + PADDING;
        nodePositionMap.set(turnNode.turnNodeId, { x, y });
        return { turnNode, x, y };
    });

    const edges: PositionedEdge[] = turnEdges.map((turnEdge) => {
        const childCol = colMap.get(turnEdge.childId) ?? 0;
        const parentCol = colMap.get(turnEdge.parentId) ?? 0;

        // parentCol < childCol → parent=right, child=top
        // parentCol > childCol → parent=bottom, child=right
        // parentCol === childCol → parent=bottom, child=top
        const childHandle: HandleType = childCol >= parentCol ? 'top' : 'right';
        const parentHandle: HandleType = childCol <= parentCol ? 'bottom' : 'right';

        const childPos = nodePositionMap.get(turnEdge.childId) ?? { x: 0, y: 0 };
        const parentPos = nodePositionMap.get(turnEdge.parentId) ?? { x: 0, y: 0 };

        const source = computeHandlePosition(childPos.x, childPos.y, childHandle);
        const target = computeHandlePosition(parentPos.x, parentPos.y, parentHandle);

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

    return { nodes, edges, graphWidth: maxX + PADDING, graphHeight: maxY + PADDING };
};
