import React, { useEffect, useMemo } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    Node as ReactFlowNode,
    useReactFlow,
    useStore,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TurnNode } from '../../models';
import { TurnGraphProps } from '../type';
import { positionTurnGraph } from './libs/position-turn-graph';
import {
    createReactFlowElements,
    UNIT_X,
    UNIT_Y,
    PADDING,
} from './libs/create-react-flow-elements';
import { TurnNode as TurnNodeComponent } from './TurnNode';
import { TurnEdge as TurnEdgeComponent } from './TurnEdge';

const nodeTypes = { turnNode: TurnNodeComponent };
const edgeTypes = { turnEdge: TurnEdgeComponent };

const NODE_SIZE = 20;
const SCROLL_MARGIN = 40;

function TurnGraphInner(props: TurnGraphProps) {
    const { turnNodes, turnEdges, onTurnNodeClick, scrollToTurnNodeId } = props;
    const { setViewport, getViewport } = useReactFlow();
    const containerWidth = useStore((s) => s.width);
    const containerHeight = useStore((s) => s.height);

    const positionedGraph = positionTurnGraph(turnNodes, turnEdges);
    const { nodes: reactFlowNodes, edges: reactFlowEdges } = createReactFlowElements(
        positionedGraph.turnNodes,
        positionedGraph.turnEdges
    );

    const graphBounds = useMemo(() => {
        const nodes = positionedGraph.turnNodes;
        if (nodes.length === 0) return { maxX: 0, maxY: 0 };
        const maxX = Math.max(...nodes.map((n) => n.x ?? 0)) * UNIT_X + PADDING + NODE_SIZE;
        const maxY = Math.max(...nodes.map((n) => n.y ?? 0)) * UNIT_Y + PADDING + NODE_SIZE;
        return { maxX, maxY };
    }, [positionedGraph.turnNodes]);

    const translateExtent = useMemo((): [[number, number], [number, number]] => {
        const right = Math.max(graphBounds.maxX + PADDING, containerWidth);
        const bottom = Math.max(graphBounds.maxY + PADDING, containerHeight);
        return [
            [0, 0],
            [right, bottom],
        ];
    }, [graphBounds, containerWidth, containerHeight]);

    useEffect(() => {
        if (!scrollToTurnNodeId) return;
        const turnNode = positionedGraph.turnNodes.find((n) => n.turnNodeId === scrollToTurnNodeId);
        if (!turnNode) return;

        const nodeX = (turnNode.x ?? 0) * UNIT_X + PADDING;
        const nodeY = (turnNode.y ?? 0) * UNIT_Y + PADDING;
        const nodeRight = nodeX + NODE_SIZE;
        const nodeBottom = nodeY + NODE_SIZE;

        const vp = getViewport();
        const visibleLeft = -vp.x;
        const visibleTop = -vp.y;
        const visibleRight = visibleLeft + containerWidth;
        const visibleBottom = visibleTop + containerHeight;

        const isVisible =
            nodeX >= visibleLeft + SCROLL_MARGIN &&
            nodeRight <= visibleRight - SCROLL_MARGIN &&
            nodeY >= visibleTop + SCROLL_MARGIN &&
            nodeBottom <= visibleBottom - SCROLL_MARGIN;

        if (isVisible) return;

        let newX = vp.x;
        let newY = vp.y;

        if (nodeX < visibleLeft + SCROLL_MARGIN) {
            newX = -(nodeX - SCROLL_MARGIN);
        } else if (nodeRight > visibleRight - SCROLL_MARGIN) {
            newX = -(nodeRight - containerWidth + SCROLL_MARGIN);
        }

        if (nodeY < visibleTop + SCROLL_MARGIN) {
            newY = -(nodeY - SCROLL_MARGIN);
        } else if (nodeBottom > visibleBottom - SCROLL_MARGIN) {
            newY = -(nodeBottom - containerHeight + SCROLL_MARGIN);
        }

        setViewport({ x: newX, y: newY, zoom: 1 }, { duration: 300 });
    }, [
        scrollToTurnNodeId,
        positionedGraph.turnNodes,
        setViewport,
        getViewport,
        containerWidth,
        containerHeight,
    ]);

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
            translateExtent={translateExtent}
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
