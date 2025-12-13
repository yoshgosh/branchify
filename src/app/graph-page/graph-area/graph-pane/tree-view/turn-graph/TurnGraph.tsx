import { TurnNode, TurnEdge } from "../models";
import React from "react";
import { createReactFlowElements } from "./libs/create-react-flow-elements";
import ReactFlow, { ReactFlowProvider, Node as ReactFlowNode } from "reactflow";
import { TurnNode as TurnNodeComponent } from "./TurnNode";
import { TurnEdge as TurnEdgeComponent } from "./TurnEdge";
import "reactflow/dist/style.css";


const nodeTypes = { "turnNode": TurnNodeComponent, };
const edgeTypes = { "turnEdge": TurnEdgeComponent, };

interface TurnGraph {
    turnNodes: TurnNode[];
    turnEdges: TurnEdge[];
    onTurnNodeClick: (event: React.MouseEvent, turnNode: TurnNode) => void;
}

export default function TurnGraph(
    props: TurnGraph
) {
    const { turnNodes, turnEdges, onTurnNodeClick } = props;
    const { nodes: reactFlowNodes, edges: reactFlowEdges } = createReactFlowElements(turnNodes, turnEdges);

    const onNodeClick = (event: React.MouseEvent, node: ReactFlowNode<TurnNode>) => {
        const turnNode: TurnNode = node.data;
        onTurnNodeClick(event, turnNode);
    };

    return (
        <ReactFlowProvider>
            <ReactFlow
                nodes={reactFlowNodes}
                edges={reactFlowEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodeClick={onNodeClick}
                fitView={true}
                nodesDraggable={false}
                nodesConnectable={false}
                panOnDrag={false}
                zoomOnScroll={false} // Disable zoom with scroll
                zoomOnPinch={false} // Disable zoom with pinch
                minZoom={1} // Prevent zooming out
                maxZoom={1} // Prevent zooming in
                selectNodesOnDrag={false}
            ></ReactFlow>
        </ReactFlowProvider>
    );
}

