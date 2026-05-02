import { TurnNode, TurnEdge } from '../../../models';

type TurnNodeMap = Record<string, TurnNode>;
type TurnNodeIdMap = Record<string, string[]>;

const toTurnNodeMap = (turnNodes: TurnNode[]): TurnNodeMap =>
    turnNodes.reduce<TurnNodeMap>((acc, node) => {
        acc[node.turnNodeId] = node;
        return acc;
    }, {} as TurnNodeMap);

const createParentMap = (turnEdges: TurnEdge[]): TurnNodeIdMap =>
    turnEdges.reduce<TurnNodeIdMap>((acc, edge) => {
        const { parentId, childId } = edge;
        if (!acc[childId]) acc[childId] = [];
        acc[childId].push(parentId);
        return acc;
    }, {} as TurnNodeIdMap);

const setPosition = (turnNodes: TurnNode[], parentMap: TurnNodeIdMap): void => {
    const lanes: (string | null)[] = [];

    const getLaneIdx = (turnNodeId: string) =>
        lanes.findIndex((waitingTurnNodeId) => waitingTurnNodeId === turnNodeId);
    const getNewLaneIdx = () => {
        const newLaneIdx = lanes.length;
        lanes.push(null);
        return newLaneIdx;
    };
    const getFreeLaneIdx = () => {
        const freeLaneIdx = lanes.findIndex((waitingTurnNodeId) => waitingTurnNodeId === null);
        return freeLaneIdx === -1 ? getNewLaneIdx() : freeLaneIdx;
    };
    const clearLanes = (turnNodeId: string) => {
        for (let i = 0; i < lanes.length; i++) {
            if (lanes[i] === turnNodeId) lanes[i] = null;
        }
    };
    const reserveLaneFor = (turnNodeId: string, laneIdx: number) => {
        lanes[laneIdx] = turnNodeId;
    };

    for (let i = turnNodes.length - 1; i >= 0; i--) {
        const turnNode = turnNodes[i];
        const turnNodeId = turnNode.turnNodeId;

        turnNode.y = i;

        let laneIdx = getLaneIdx(turnNodeId);
        if (laneIdx === -1) laneIdx = getFreeLaneIdx();
        turnNode.x = laneIdx;

        clearLanes(turnNodeId);

        const parentTurnNodeIds = parentMap[turnNodeId] ?? [];
        const primaryParentTurnNodeId = parentTurnNodeIds.at(0);
        if (primaryParentTurnNodeId) reserveLaneFor(primaryParentTurnNodeId, laneIdx);

        for (let j = 1; j < parentTurnNodeIds.length; j++) {
            const parentTurnNodeId = parentTurnNodeIds[j];
            let parentLaneIdx = getLaneIdx(parentTurnNodeId);
            if (parentLaneIdx === -1) parentLaneIdx = getFreeLaneIdx();
            reserveLaneFor(parentTurnNodeId, parentLaneIdx);
        }
    }
};

const setHandle = (turnEdges: TurnEdge[], turnNodeMap: TurnNodeMap): void => {
    for (const turnEdge of turnEdges) {
        const parentTurnNode = turnNodeMap[turnEdge.parentId];
        const childTurnNode = turnNodeMap[turnEdge.childId];
        if (parentTurnNode.x === undefined || childTurnNode.x === undefined) continue;

        if (parentTurnNode.x === childTurnNode.x) {
            turnEdge.parentHandle = 'bottom';
            turnEdge.childHandle = 'top';
        } else if (parentTurnNode.x < childTurnNode.x) {
            turnEdge.parentHandle = 'right';
            turnEdge.childHandle = 'top';
        } else {
            turnEdge.parentHandle = 'bottom';
            turnEdge.childHandle = 'right';
        }
    }
};

export const positionTurnGraph = (
    turnNodes: TurnNode[],
    turnEdges: TurnEdge[]
): { turnNodes: TurnNode[]; turnEdges: TurnEdge[] } => {
    const positionedTurnNodes = turnNodes.map((turnNode) => ({ ...turnNode }));
    const positionedTurnEdges = turnEdges.map((turnEdge) => ({ ...turnEdge }));

    const parentMap = createParentMap(positionedTurnEdges);
    setPosition(positionedTurnNodes, parentMap);

    const turnNodeMap = toTurnNodeMap(positionedTurnNodes);
    setHandle(positionedTurnEdges, turnNodeMap);

    return {
        turnNodes: positionedTurnNodes,
        turnEdges: positionedTurnEdges,
    };
};
