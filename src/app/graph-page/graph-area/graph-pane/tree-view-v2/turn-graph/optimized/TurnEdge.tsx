import React from 'react';
import { EdgeProps } from 'reactflow';
import { TurnEdge as TurnEdgeType } from '../../models';

const RADIUS = 10;

export function TurnEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
}: EdgeProps<TurnEdgeType>) {
    const { isVisible, isActive } = data || {};

    const stroke = isVisible
        ? 'var(--color-graph-visible)'
        : isActive
          ? 'var(--color-graph-active)'
          : 'var(--color-graph-inactive)';

    const isChildToParent = sourceY > targetY;

    const [childX, childY, parentX, parentY] = isChildToParent
        ? [sourceX, sourceY, targetX, targetY]
        : [targetX, targetY, sourceX, sourceY];

    if (!isChildToParent) {
        console.warn(
            `[TreeEdge] Unexpected edge direction: expected child→parent. Automatically reversed. (edgeId=${id})`
        );
    }

    let path = '';

    if (childX === parentX) {
        path = `M${childX},${childY} L${parentX},${parentY}`;
    } else if (childX < parentX) {
        path = `
            M${childX},${childY}
            L${parentX - RADIUS},${childY}
            A${RADIUS},${RADIUS} 0 0 0 ${parentX},${childY - RADIUS}
            L${parentX},${parentY}
        `;
    } else {
        path = `
            M${childX},${childY}
            L${childX},${parentY + RADIUS}
            A${RADIUS},${RADIUS} 0 0 0 ${childX - RADIUS},${parentY}
            L${parentX},${parentY}
        `;
    }

    return (
        <g>
            <path d={path.trim()} stroke={stroke} strokeWidth={2} fill="none" />
        </g>
    );
}
