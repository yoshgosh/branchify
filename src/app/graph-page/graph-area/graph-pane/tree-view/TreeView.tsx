import { Node } from '@/shared/entities/node';
import { Edge } from '@/shared/entities/edge';
import { TurnNode } from './models';
import { buildTurnGraph } from './libs/build-turn-graph';
import { positionTurnGraph } from './libs/position-turn-graph';
import { positionTurnGraphRT } from './libs/position-turn-graph-rt';
import TurnGraph from './turn-graph/TurnGraph';
import TurnGraphRT from './turn-graph-rt/TurnGraph';
import React, { useState } from 'react';

type LayoutMode = 'optimized' | 'rt';

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

interface SegmentControlProps {
    value: LayoutMode;
    onChange: (value: LayoutMode) => void;
}

function SegmentControl({ value, onChange }: SegmentControlProps) {
    const options: { value: LayoutMode; label: string }[] = [
        { value: 'optimized', label: 'Optimized' },
        { value: 'rt', label: 'RT' },
    ];

    return (
        <div
            style={{
                display: 'flex',
                backgroundColor: 'var(--color-bg-muted)',
                borderRadius: '6px',
                padding: '2px',
                gap: '2px',
            }}
        >
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 500,
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        backgroundColor: value === option.value ? 'var(--color-bg)' : 'transparent',
                        color:
                            value === option.value
                                ? 'var(--color-text)'
                                : 'var(--color-text-muted)',
                        boxShadow: value === option.value ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none',
                    }}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
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
    const [layoutMode, setLayoutMode] = useState<LayoutMode>('optimized');

    const { turnNodes, turnEdges } = buildTurnGraph(
        nodes,
        edges,
        headNodeId,
        activeNodeIds,
        visibleNodeIds
    );

    // レイアウトモードに応じて配置関数を適用
    if (layoutMode === 'rt') {
        positionTurnGraphRT(turnNodes, turnEdges);
    } else {
        positionTurnGraph(turnNodes, turnEdges);
    }

    console.log('TurnGraph:', { turnNodes, turnEdges, layoutMode });

    const handleTurnNodeClick = async (event: React.MouseEvent, turnNode: TurnNode) => {
        // TurnNode内の最も新しい（最後の）ノードIDを取得
        const latestNodeId = turnNode.nodes.at(-1)?.nodeId ?? turnNode.turnNodeId;

        if (event.metaKey || event.ctrlKey) {
            onOpenPaneWithNode(latestNodeId);
        } else {
            await onActivateNode(latestNodeId);
            onSetHeadNode(latestNodeId);
        }
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
            {layoutMode === 'rt' ? (
                <TurnGraphRT
                    turnNodes={turnNodes}
                    turnEdges={turnEdges}
                    onTurnNodeClick={handleTurnNodeClick}
                />
            ) : (
                <TurnGraph
                    turnNodes={turnNodes}
                    turnEdges={turnEdges}
                    onTurnNodeClick={handleTurnNodeClick}
                />
            )}
        </div>
    );
}
