import { Node } from '@/shared/entities/node';
import { Edge } from '@/shared/entities/edge';
import { TurnNode, LayoutMode } from './models';
import { buildTurnGraph } from './libs/build-turn-graph';
import { turnGraphRegistry } from './turn-graph/registry';
import SegmentControl from './SegmentControl';
import TitleToggle from './TitleToggle';
import React, { useState } from 'react';

interface TreeViewProps {
    nodes: Node[];
    edges: Edge[];
    headNodeId: string | null;
    activeNodeIds: string[];
    visibleNodeIds: string[];
    scrollToNodeId: string | null;
    onSetHeadNode: (nodeId: string) => void;
    onActivateNode: (nodeId: string) => Promise<void>;
}

export default function TreeView({
    nodes,
    edges,
    headNodeId,
    activeNodeIds,
    visibleNodeIds,
    scrollToNodeId,
    onSetHeadNode,
    onActivateNode,
}: TreeViewProps) {
    const [layoutMode, setLayoutMode] = useState<LayoutMode>('optimized');
    const [showTitle, setShowTitle] = useState(false);

    const { turnNodes, turnEdges, nodeIdToTurnId } = buildTurnGraph(
        nodes,
        edges,
        headNodeId,
        activeNodeIds,
        visibleNodeIds
    );
    const TurnGraph = turnGraphRegistry[layoutMode];

    const scrollToTurnNodeId = scrollToNodeId ? (nodeIdToTurnId.get(scrollToNodeId) ?? null) : null;

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
                    left: 8,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                <SegmentControl value={layoutMode} onChange={setLayoutMode} />
                {layoutMode === 'optimized' && (
                    <TitleToggle value={showTitle} onChange={setShowTitle} />
                )}
            </div>
            <TurnGraph
                turnNodes={turnNodes}
                turnEdges={turnEdges}
                onTurnNodeClick={handleTurnNodeClick}
                scrollToTurnNodeId={scrollToTurnNodeId}
                showTitle={showTitle}
            />
        </div>
    );
}
