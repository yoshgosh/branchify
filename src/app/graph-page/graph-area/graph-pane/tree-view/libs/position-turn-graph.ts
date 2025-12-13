import { TurnNode, TurnEdge } from "../models";

type TurnNodeMap = Record<string, TurnNode>;
type TurnNodeIdMap = Record<string, string[]>;

const toTurnNodeMap = (turnNodes: TurnNode[]): TurnNodeMap =>
    turnNodes.reduce<TurnNodeMap>((acc, node) => {
        acc[node.turnNodeId] = node;
        return acc;
    }, {} as TurnNodeMap);

const createParentMap = (turnEdges: TurnEdge[]): TurnNodeIdMap => {
    return turnEdges.reduce<TurnNodeIdMap>((acc, edge) => {
        const { parentId, childId } = edge;
        if (!acc[childId]) acc[childId] = [];
        acc[childId].push(parentId);
        return acc;
    }, {} as TurnNodeIdMap);
};

const setPosition = (turnNodes: TurnNode[], parentMap: TurnNodeIdMap): void => {
    const lanes: (string | null)[] = [];

    // ヘルパー関数
    const getLaneIdx = (tNodeId: string) =>
        lanes.findIndex((waitingTNodeId) => waitingTNodeId === tNodeId);
    const getNewLaneIdx = () => {
        const newLaneIdx = lanes.length;
        lanes.push(null);
        return newLaneIdx;
    };
    const getFreeLaneIdx = () => {
        const freeLaneIdx = lanes.findIndex(
            (waitingTNodeId) => waitingTNodeId === null
        );
        return freeLaneIdx === -1 ? getNewLaneIdx() : freeLaneIdx;
    };
    const clearLanes = (tNodeId: string) => {
        for (let i = 0; i < lanes.length; i++) {
            if (lanes[i] === tNodeId) lanes[i] = null;
        }
    };
    const reserveLaneFor = (tNodeId: string, laneIdx: number) => {
        lanes[laneIdx] = tNodeId;
    };

    // 更新処理
    for (let i = turnNodes.length - 1; i >= 0; i--) {
        const tNode = turnNodes[i];
        const tNodeId = tNode.turnNodeId;

        // row を設定
        tNode.y = i;

        // col を設定
        let laneIdx = getLaneIdx(tNodeId);
        if (laneIdx === -1) laneIdx = getFreeLaneIdx();
        tNode.x = laneIdx;

        // lanes を更新
        clearLanes(tNodeId);
        // 第一親
        const parentTNodeIds = parentMap[tNodeId] ?? [];
        const primaryParentTNodeId = parentTNodeIds.at(0);
        if (primaryParentTNodeId) reserveLaneFor(primaryParentTNodeId, laneIdx);
        // 第二親以降
        for (let j = 1; j < parentTNodeIds.length; j++) {
            const parentTNodeId = parentTNodeIds[j];
            let laneIdx = getLaneIdx(parentTNodeId);
            if (laneIdx === -1) laneIdx = getFreeLaneIdx();
            reserveLaneFor(parentTNodeId, laneIdx);
        }
    }
};

const setHandle = (turnEdges: TurnEdge[], turnNodeMap: TurnNodeMap): void => {
    for (const tEdge of turnEdges) {
        const parentTNode = turnNodeMap[tEdge.parentId];
        const childTNode = turnNodeMap[tEdge.childId];
        if (parentTNode.x === undefined || childTNode.x === undefined) continue;

        if (parentTNode.x === childTNode.x) {
            tEdge.parentHandle = "bottom";
            tEdge.childHandle = "top";
        } else if (parentTNode.x < childTNode.x) {
            tEdge.parentHandle = "right";
            tEdge.childHandle = "top";
        } else {
            tEdge.parentHandle = "bottom";
            tEdge.childHandle = "right";
        }
    }
};

export const positionTurnGraph = (
    turnNodes: TurnNode[],
    turnEdges: TurnEdge[]
): void => {
    // turnNodesの位置と、turnEdgesのハンドル位置を計算して設定する

    const parentMap = createParentMap(turnEdges);
    setPosition(turnNodes, parentMap);

    const turnNodeMap = toTurnNodeMap(turnNodes);
    setHandle(turnEdges, turnNodeMap);
};
