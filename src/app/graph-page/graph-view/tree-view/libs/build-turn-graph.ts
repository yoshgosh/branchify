import { Node } from '@/shared/entities/node';
import { Edge } from '@/shared/entities/edge';
import { TurnNode, TurnEdge } from '../models';

type NodeMap = Record<string, Node>;
type NodeIdMap = Record<string, string[]>;
// nodeId をキーにしたルックアップを用意して、後段の探索を O(1) で済ませる
const toNodeMap = (nodes: Node[]): NodeMap =>
    nodes.reduce<NodeMap>((acc, node) => {
        acc[node.nodeId] = node;
        return acc;
    }, {} as NodeMap);

const createChildMap = (edges: Edge[]): NodeIdMap => {
    // 親 nodeId -> 子 nodeId[] の形でまとめ、ターン末尾から下流を辿れるようにする
    return edges.reduce<NodeIdMap>((acc, edge) => {
        const { parentId, childId } = edge;
        if (!acc[parentId]) acc[parentId] = [];
        acc[parentId].push(childId);
        return acc;
    }, {} as NodeIdMap);
};

const toTurnNodeMap = (turnNodes: TurnNode[]): Record<string, TurnNode> =>
    turnNodes.reduce<Record<string, TurnNode>>(
        (acc, turnNode) => {
            acc[turnNode.turnNodeId] = turnNode;
            return acc;
        },
        {} as Record<string, TurnNode>
    );

// 質問ノードを起点に、answer が続く線形パスを 1 つの turn として束ねる
const buildTurnNode = (
    questionNode: Node,
    nodeMap: NodeMap,
    childrenMap: NodeIdMap,
    headNodeId: string | null,
    activeNodeIdSet: Set<string>,
    visibleNodeIdSet: Set<string>
): TurnNode => {
    const collected: Node[] = [questionNode];
    let current: Node = questionNode;

    // 非巡回・単純グラフという前提のもと、次の question ノードに当たるまで直線的に辿る
    while (true) {
        const childIds: string[] = childrenMap[current.nodeId] ?? [];
        if (childIds.length === 0) break;

        // 単純グラフ前提なので childIds[0] は必ず nodes に存在する
        const nextNode = nodeMap[childIds[0]]!;
        if (nextNode.type === 'question') break;

        collected.push(nextNode);
        current = nextNode;
    }

    const nodeIds = collected.map((node) => node.nodeId);

    const overlaps = (set: Set<string>) => nodeIds.some((nodeId) => set.has(nodeId));

    return {
        turnNodeId: questionNode.nodeId,
        nodes: collected,
        isHead: !!headNodeId && nodeIds.includes(headNodeId),
        isActive: overlaps(activeNodeIdSet),
        isVisible: overlaps(visibleNodeIdSet),
    };
};

const buildTurnEdge = (parentTurnNode: TurnNode, childTurnNode: TurnNode): TurnEdge => {
    return {
        turnEdgeId: `${parentTurnNode.turnNodeId}-${childTurnNode.turnNodeId}`,
        parentId: parentTurnNode.turnNodeId,
        childId: childTurnNode.turnNodeId,
        isActive: parentTurnNode.isActive && childTurnNode.isActive,
        isVisible: parentTurnNode.isVisible && childTurnNode.isVisible,
    };
};

export const buildTurnGraph = (
    nodes: Node[],
    edges: Edge[],
    headNodeId: string | null,
    activeNodeIds: string[],
    visibleNodeIds: string[]
): { turnNodes: TurnNode[]; turnEdges: TurnEdge[]; nodeIdToTurnId: Map<string, string> } => {
    // nodes, edges による graph から、turnNodes, turnEdges による turnGraph を作成する
    // turnNode は 隣接する複数の node とそれらを接続する edge をまとめたもの
    // node.type === "question" の node （question node）を起点に、その node から連なる node 列をたどって turnNode を作成する
    // 次の question node に到達するまで連結されたノード列を 1 つの turn とみなす
    // graph における分岐は、question node のみであることを前提とする
    // graph は、非巡回有向グラフであり、単純グラフであることを前提とする
    // turnEdge は turnNode 同士を接続する
    // turnNode の最後の node の子 node を turnNode の子 turnNode とし、親子 turnEdge を構築する
    // headNodeId, activeNodeIds, visibleNodeIds に基づいて、turnNode, turnEdge の isHead, isActive, isVisible を設定する

    const nodeMap = toNodeMap(nodes);
    const childMap = createChildMap(edges);
    const activeNodeIdSet = new Set(activeNodeIds);
    const visibleNodeIdSet = new Set(visibleNodeIds);

    // question ノード単位でターンを切り出す
    const questionNodes = nodes
        .filter((node) => node.type === 'question')
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const turnNodes: TurnNode[] = [];
    const nodeIdToTurnId = new Map<string, string>();

    for (const questionNode of questionNodes) {
        const turnNode = buildTurnNode(
            questionNode,
            nodeMap,
            childMap,
            headNodeId,
            activeNodeIdSet,
            visibleNodeIdSet
        );
        turnNodes.push(turnNode);

        for (const node of turnNode.nodes) {
            nodeIdToTurnId.set(node.nodeId, turnNode.turnNodeId);
        }
    }

    const turnNodeMap = toTurnNodeMap(turnNodes);
    const turnEdges: TurnEdge[] = [];

    // 各ターンの最終ノードが持つ子関係をもとに、ターン間のエッジを張り直す
    for (const parentTurnNode of turnNodes) {
        const lastNode = parentTurnNode.nodes.at(-1);
        if (!lastNode) continue;

        const childNodeIds = childMap[lastNode.nodeId] ?? [];
        childNodeIds.forEach((childNodeId) => {
            const childTurnId = nodeIdToTurnId.get(childNodeId);
            if (!childTurnId) return;
            const childTurnNode = turnNodeMap[childTurnId];
            if (!childTurnNode) return;

            turnEdges.push(buildTurnEdge(parentTurnNode, childTurnNode));
        });
    }

    return { turnNodes, turnEdges, nodeIdToTurnId };
};
