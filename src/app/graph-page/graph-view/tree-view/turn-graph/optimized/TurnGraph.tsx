import React, { useState } from 'react';
import { TurnGraphProps } from '../type';
import { computeLayout } from './libs/compute-layout';
import { TurnNodeElement } from './TurnNodeElement';
import { TurnEdgePath } from './TurnEdgePath';

const NODE_SIZE = 20;
const ICON_SIZE = Math.round((NODE_SIZE * 5) / 3);
const TITLE_CHAR_WIDTH = 7;
const TITLE_LEFT_OFFSET = 8;
const TITLE_RIGHT_PADDING = 20;

export default function TurnGraph(props: TurnGraphProps) {
    const { turnNodes, turnEdges, onTurnNodeClick, registerTreeNodeRef, scrollContainerRef } =
        props;

    const [showTitle, setShowTitle] = useState(false);

    const layout = computeLayout(turnNodes, turnEdges);

    const effectiveWidth = showTitle
        ? Math.max(
              layout.graphWidth,
              ...layout.nodes.map((node) => {
                  const title = node.turnNode.nodes[0]?.title ?? '';
                  if (!title) return 0;
                  const domSize = node.turnNode.isHead ? ICON_SIZE : NODE_SIZE;
                  return (
                      node.x +
                      domSize +
                      TITLE_LEFT_OFFSET +
                      title.length * TITLE_CHAR_WIDTH +
                      TITLE_RIGHT_PADDING
                  );
              })
          )
        : layout.graphWidth;

    const sortedEdges = [...layout.edges].sort((a, b) => {
        const priority = (e: (typeof layout.edges)[number]) =>
            e.turnEdge.isVisible ? 2 : e.turnEdge.isActive ? 1 : 0;
        return priority(a) - priority(b);
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <div style={{ padding: '4px 8px' }}>
                <div
                    style={{
                        display: 'inline-flex',
                        backgroundColor: 'var(--color-base-1)',
                        borderRadius: '6px',
                        padding: '2px',
                        gap: '2px',
                    }}
                >
                    {([false, true] as const).map((value) => (
                        <button
                            key={String(value)}
                            onClick={() => setShowTitle(value)}
                            style={{
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: 500,
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                backgroundColor:
                                    showTitle === value ? 'var(--color-base-0)' : 'transparent',
                                color:
                                    showTitle === value
                                        ? 'var(--color-base-9)'
                                        : 'var(--color-base-6)',
                                boxShadow:
                                    showTitle === value ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                            }}
                        >
                            {value ? 'Title' : 'No Title'}
                        </button>
                    ))}
                </div>
            </div>
            <div ref={scrollContainerRef} style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                <div
                    style={{
                        position: 'relative',
                        width: effectiveWidth,
                        height: layout.graphHeight,
                    }}
                >
                    <svg
                        style={{ position: 'absolute', top: 0, left: 0 }}
                        width={effectiveWidth}
                        height={layout.graphHeight}
                    >
                        {sortedEdges.map((edge) => (
                            <TurnEdgePath
                                key={edge.turnEdge.turnEdgeId}
                                turnEdge={edge.turnEdge}
                                sourceX={edge.sourceX}
                                sourceY={edge.sourceY}
                                targetX={edge.targetX}
                                targetY={edge.targetY}
                            />
                        ))}
                    </svg>

                    {layout.nodes.map((node) => (
                        <TurnNodeElement
                            key={node.turnNode.turnNodeId}
                            turnNode={node.turnNode}
                            x={node.x}
                            y={node.y}
                            onClick={(event) => onTurnNodeClick(event, node.turnNode)}
                            registerRef={registerTreeNodeRef}
                            showTitle={showTitle}
                            title={node.turnNode.nodes[0]?.title ?? null}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
