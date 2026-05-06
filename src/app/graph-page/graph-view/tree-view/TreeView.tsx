import { Node } from '@/shared/entities/node';
import { Edge } from '@/shared/entities/edge';
import { TurnNode, LayoutMode } from './models';
import { buildTurnGraph } from './libs/build-turn-graph';
import { turnGraphRegistry } from './turn-graph/registry';
import SegmentControl from './SegmentControl';
import React, { RefCallback, RefObject, useState } from 'react';

interface TreeViewProps {
    nodes: Node[];
    edges: Edge[];
    headNodeId: string | null;
    activeNodeIds: string[];
    visibleNodeIds: string[];
    onSetHeadNode: (nodeId: string) => void;
    onActivateNode: (nodeId: string) => Promise<void>;
    registerElementRef: (id: string) => RefCallback<HTMLElement>;
    containerRef: RefObject<HTMLDivElement | null>;
}

export default function TreeView({
    nodes,
    edges,
    headNodeId,
    activeNodeIds,
    visibleNodeIds,
    onSetHeadNode,
    onActivateNode,
    registerElementRef,
    containerRef,
}: TreeViewProps) {
    const [layoutMode, setLayoutMode] = useState<LayoutMode>('optimized-v2');

    const { turnNodes, turnEdges } = buildTurnGraph(
        nodes,
        edges,
        headNodeId,
        activeNodeIds,
        visibleNodeIds
    );
    const TurnGraph = turnGraphRegistry[layoutMode];

    const handleTurnNodeClick = async (_event: React.MouseEvent, turnNode: TurnNode) => {
        const mostOldNodeId = turnNode.nodes.at(0)?.nodeId ?? turnNode.turnNodeId;
        const latestNodeId = turnNode.nodes.at(-1)?.nodeId ?? turnNode.turnNodeId;

        await onActivateNode(mostOldNodeId);
        onSetHeadNode(latestNodeId);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '0 8px 8px' }}>
                <SegmentControl value={layoutMode} onChange={setLayoutMode} />
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
                <TurnGraph
                    turnNodes={turnNodes}
                    turnEdges={turnEdges}
                    onTurnNodeClick={handleTurnNodeClick}
                    registerElementRef={registerElementRef}
                    containerRef={containerRef}
                />
            </div>
        </div>
    );
}
