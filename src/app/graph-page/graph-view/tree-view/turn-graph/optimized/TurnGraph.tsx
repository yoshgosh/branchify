import React from 'react';
import { TurnGraphProps } from '../type';
import { positionTurnGraph } from './libs/position-turn-graph';
import { computeLayout } from './libs/compute-layout';
import { TurnNodeElement } from './TurnNodeElement';
import { TurnEdgePath } from './TurnEdgePath';

export default function TurnGraph(props: TurnGraphProps) {
    const { turnNodes, turnEdges, onTurnNodeClick, registerTreeNodeRef, scrollContainerRef } = props;

    const positionedGraph = positionTurnGraph(turnNodes, turnEdges);
    const layout = computeLayout(positionedGraph.turnNodes, positionedGraph.turnEdges);

    return (
        <div
            ref={scrollContainerRef}
            style={{ width: '100%', height: '100%', overflow: 'auto' }}
        >
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
                        registerRef={registerTreeNodeRef}
                    />
                ))}
            </div>
        </div>
    );
}
