import { Node } from "@/shared/entities/node";
import { Edge } from "@/shared/entities/edge";
import { TurnNode, TurnEdge } from "./models";
import { buildTurnGraph } from "./libs/build-turn-graph";
import { positionTurnGraph } from "./libs/position-turn-graph";
import TurnGraph from "./turn-graph/TurnGraph";
import React from "react";

interface TreeViewProps {
    nodes: Node[];
    edges: Edge[];
    headNodeId: string | null;
    activeNodeIds: string[];
    visibleNodeIds: string[];
    onSetHeadNode: (nodeId: string) => void;
    onActivateNode: (nodeId: string) => Promise<void>;
    onOpenPaneWithNode: (nodeId: string) => void;
}

export default function TreeView({
    nodes,
    edges,
    headNodeId,
    activeNodeIds,
    visibleNodeIds,
    onSetHeadNode,
    onActivateNode,
    onOpenPaneWithNode,
}: TreeViewProps) {
    let { turnNodes, turnEdges } = buildTurnGraph(
        nodes,
        edges,
        headNodeId,
        activeNodeIds,
        visibleNodeIds
    );
    positionTurnGraph(turnNodes, turnEdges);
    console.log("TurnGraph:", { turnNodes, turnEdges });
    const handleTurnNodeClick = async (event: React.MouseEvent, turnNode: TurnNode) => {
            if (event.metaKey || event.ctrlKey) {
            onOpenPaneWithNode(turnNode.turnNodeId);
        } else {
            await onActivateNode(turnNode.turnNodeId);
            onSetHeadNode(turnNode.turnNodeId);
        }
    }
    return (
        <TurnGraph
            turnNodes={turnNodes}
            turnEdges={turnEdges}
            onTurnNodeClick={handleTurnNodeClick}
        />
    );
}