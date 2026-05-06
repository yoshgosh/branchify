import React from 'react';
import { TurnGraphProps } from '../type';
import { computeLayout } from './libs/compute-layout';
import { TurnNodeElement } from './TurnNodeElement';
import { TurnEdgePath } from './TurnEdgePath';

export default function TurnGraph(props: TurnGraphProps) {
    const { turnNodes, turnEdges, onTurnNodeClick, registerElementRef, containerRef } = props;

    const layout = computeLayout(turnNodes, turnEdges);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <div
                style={{
                    position: 'relative',
                    width: layout.graphWidth,
                    height: layout.graphHeight,
                }}
            >
                <svg
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    width={layout.graphWidth}
                    height={layout.graphHeight}
                >
                    {layout.edges.map((edge) => (
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
                        registerRef={registerElementRef}
                    />
                ))}
            </div>
        </div>
    );
}
