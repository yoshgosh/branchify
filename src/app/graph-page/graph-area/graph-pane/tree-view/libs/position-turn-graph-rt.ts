import { TurnNode, TurnEdge } from '../models';

type TurnNodeMap = Record<string, TurnNode>;
type ChildrenMap = Record<string, string[]>;

const toTurnNodeMap = (turnNodes: TurnNode[]): TurnNodeMap =>
    turnNodes.reduce<TurnNodeMap>((acc, node) => {
        acc[node.turnNodeId] = node;
        return acc;
    }, {} as TurnNodeMap);

const createChildrenMap = (turnEdges: TurnEdge[]): ChildrenMap => {
    return turnEdges.reduce<ChildrenMap>((acc, edge) => {
        const { parentId, childId } = edge;
        if (!acc[parentId]) acc[parentId] = [];
        acc[parentId].push(childId);
        return acc;
    }, {} as ChildrenMap);
};

const findRootNode = (turnNodes: TurnNode[], turnEdges: TurnEdge[]): TurnNode | undefined => {
    const childIds = new Set(turnEdges.map((e) => e.childId));
    return turnNodes.find((node) => !childIds.has(node.turnNodeId));
};

/**
 * Reingold-Tilford風の木構造配置アルゴリズム
 * - 親ノードを上、子ノードを下に配置
 * - 兄弟ノードは水平に並べる
 * - 親は子の中央に配置（ボトムアップで計算）
 */
const setPosition = (
    turnNodes: TurnNode[],
    turnNodeMap: TurnNodeMap,
    childrenMap: ChildrenMap
): void => {
    const rootNode = findRootNode(
        turnNodes,
        Object.entries(childrenMap).flatMap(([parentId, children]) =>
            children.map((childId) => ({
                turnEdgeId: '',
                parentId,
                childId,
            }))
        )
    );

    if (!rootNode) return;

    // 各ノードのサブツリー幅を計算
    const subtreeWidths: Record<string, number> = {};

    const calcSubtreeWidth = (nodeId: string): number => {
        const children = childrenMap[nodeId] ?? [];
        if (children.length === 0) {
            subtreeWidths[nodeId] = 1;
            return 1;
        }
        const width = children.reduce((sum, childId) => sum + calcSubtreeWidth(childId), 0);
        subtreeWidths[nodeId] = width;
        return width;
    };

    calcSubtreeWidth(rootNode.turnNodeId);

    // 深さを計算
    const depths: Record<string, number> = {};
    const calcDepth = (nodeId: string, depth: number): void => {
        depths[nodeId] = depth;
        const children = childrenMap[nodeId] ?? [];
        for (const childId of children) {
            calcDepth(childId, depth + 1);
        }
    };
    calcDepth(rootNode.turnNodeId, 0);

    // 葉ノードにx座標を左から順に割り当て、親は子の中央に配置（ボトムアップ）
    let nextLeafX = 0;
    const positions: Record<string, number> = {};

    const assignX = (nodeId: string): number => {
        const children = childrenMap[nodeId] ?? [];

        if (children.length === 0) {
            // 葉ノード：左から順に配置
            positions[nodeId] = nextLeafX;
            nextLeafX += 1;
            return positions[nodeId];
        }

        // 子ノードを先に配置
        const childXs: number[] = [];
        for (const childId of children) {
            childXs.push(assignX(childId));
        }

        // 親は子の中央に配置
        const minX = Math.min(...childXs);
        const maxX = Math.max(...childXs);
        positions[nodeId] = (minX + maxX) / 2;

        return positions[nodeId];
    };

    assignX(rootNode.turnNodeId);

    // ノードに座標を設定
    for (const node of turnNodes) {
        node.x = positions[node.turnNodeId] ?? 0;
        node.y = depths[node.turnNodeId] ?? 0;
    }
};

const setHandle = (turnEdges: TurnEdge[], turnNodeMap: TurnNodeMap): void => {
    for (const tEdge of turnEdges) {
        const parentTNode = turnNodeMap[tEdge.parentId];
        const childTNode = turnNodeMap[tEdge.childId];
        if (parentTNode.x === undefined || childTNode.x === undefined) continue;

        // RT配置では親が上、子が下なのでシンプルに上下接続
        tEdge.parentHandle = 'bottom';
        tEdge.childHandle = 'top';
    }
};

export const positionTurnGraphRT = (turnNodes: TurnNode[], turnEdges: TurnEdge[]): void => {
    const turnNodeMap = toTurnNodeMap(turnNodes);
    const childrenMap = createChildrenMap(turnEdges);

    setPosition(turnNodes, turnNodeMap, childrenMap);
    setHandle(turnEdges, turnNodeMap);
};
