import React from 'react';
import ReactFlow, { ReactFlowProvider, Node as ReactFlowNode } from 'reactflow';
import 'reactflow/dist/style.css';
import { TurnNode } from '../../models';
import { TurnGraphProps } from '../type';
import { positionTurnGraph } from './libs/position-turn-graph';
import { createReactFlowElements } from './libs/create-react-flow-elements';
import { TurnNode as TurnNodeComponent } from './TurnNode';
import { TurnEdge as TurnEdgeComponent } from './TurnEdge';

const nodeTypes = { turnNode: TurnNodeComponent };
const edgeTypes = { turnEdge: TurnEdgeComponent };

export default function TurnGraph(props: TurnGraphProps) {
    const { turnNodes, turnEdges, onTurnNodeClick } = props;
    const positionedGraph = positionTurnGraph(turnNodes, turnEdges);
    const { nodes: reactFlowNodes, edges: reactFlowEdges } = createReactFlowElements(
        positionedGraph.turnNodes,
        positionedGraph.turnEdges
    );

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
                zoomOnScroll={false}
                zoomOnPinch={false}
                minZoom={1}
                maxZoom={1}
                selectNodesOnDrag={false}
            />
        </ReactFlowProvider>
    );
}
