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
    registerTreeNodeRef: (id: string) => RefCallback<HTMLElement>;
    scrollContainerRef: RefObject<HTMLDivElement | null>;
}

export default function TreeView({
    nodes,
    edges,
    headNodeId,
    activeNodeIds,
    visibleNodeIds,
    onSetHeadNode,
    onActivateNode,
    registerTreeNodeRef,
    scrollContainerRef,
}: TreeViewProps) {
    const [layoutMode, setLayoutMode] = useState<LayoutMode>('optimized');

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
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div
                style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 10,
                }}
            >
                <SegmentControl value={layoutMode} onChange={setLayoutMode} />
            </div>
            <TurnGraph
                turnNodes={turnNodes}
                turnEdges={turnEdges}
                onTurnNodeClick={handleTurnNodeClick}
                registerTreeNodeRef={registerTreeNodeRef}
                scrollContainerRef={scrollContainerRef}
            />
        </div>
    );
}
