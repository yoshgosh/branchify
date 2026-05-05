import React, { useEffect } from 'react';
import ReactFlow, { ReactFlowProvider, Node as ReactFlowNode, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import { TurnNode } from '../../models';
import { TurnGraphProps } from '../type';
import { positionTurnGraph } from './libs/position-turn-graph';
import { createReactFlowElements, UNIT_X, UNIT_Y } from './libs/create-react-flow-elements';
import { TurnNode as TurnNodeComponent } from './TurnNode';
import { TurnEdge as TurnEdgeComponent } from './TurnEdge';

const nodeTypes = { turnNode: TurnNodeComponent };
const edgeTypes = { turnEdge: TurnEdgeComponent };

function TurnGraphInner(props: TurnGraphProps) {
    const { turnNodes, turnEdges, onTurnNodeClick, scrollToTurnNodeId } = props;
    const { setViewport } = useReactFlow();

    const positionedGraph = positionTurnGraph(turnNodes, turnEdges);
    const { nodes: reactFlowNodes, edges: reactFlowEdges } = createReactFlowElements(
        positionedGraph.turnNodes,
        positionedGraph.turnEdges
    );

    useEffect(() => {
        if (!scrollToTurnNodeId) return;
        const turnNode = positionedGraph.turnNodes.find((n) => n.turnNodeId === scrollToTurnNodeId);
        if (!turnNode) return;

        const x = (turnNode.x ?? 0) * UNIT_X;
        const y = (turnNode.y ?? 0) * UNIT_Y;
        setViewport({ x: -x, y: -y, zoom: 1 }, { duration: 300 });
    }, [scrollToTurnNodeId, positionedGraph.turnNodes, setViewport]);

    const onNodeClick = (event: React.MouseEvent, node: ReactFlowNode<TurnNode>) => {
        const turnNode: TurnNode = node.data;
        onTurnNodeClick(event, turnNode);
    };

    return (
        <ReactFlow
            nodes={reactFlowNodes}
            edges={reactFlowEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={onNodeClick}
            fitView={false}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            panOnScroll={true}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            minZoom={1}
            maxZoom={1}
            nodesDraggable={false}
            nodesConnectable={false}
            selectNodesOnDrag={false}
        />
    );
}

export default function TurnGraph(props: TurnGraphProps) {
    return (
        <ReactFlowProvider>
            <TurnGraphInner {...props} />
        </ReactFlowProvider>
    );
}
