import React from 'react';
import { TurnGraphProps } from '../type';
import { computeLayout } from './libs/compute-layout';
import { TurnNodeElement } from './TurnNodeElement';
import { TurnEdgePath } from './TurnEdgePath';

export default function TurnGraph(props: TurnGraphProps) {
    const { turnNodes, turnEdges, onTurnNodeClick, registerTreeNodeRef, scrollContainerRef } =
        props;

    const layout = computeLayout(turnNodes, turnEdges);

    const sortedEdges = [...layout.edges].sort((a, b) => {
        const priority = (e: (typeof layout.edges)[number]) =>
            e.turnEdge.isVisible ? 2 : e.turnEdge.isActive ? 1 : 0;
        return priority(a) - priority(b);
    });

    return (
        <div ref={scrollContainerRef} style={{ width: '100%', height: '100%', overflow: 'auto' }}>
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
                    />
                ))}
            </div>
        </div>
    );
}
