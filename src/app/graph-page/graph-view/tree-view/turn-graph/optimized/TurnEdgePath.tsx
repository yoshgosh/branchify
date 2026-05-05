import React from 'react';
import { TurnEdge } from '../models';

const RADIUS = 10;

type TurnEdgePathProps = {
    turnEdge: TurnEdge;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
};

export function TurnEdgePath({ turnEdge, sourceX, sourceY, targetX, targetY }: TurnEdgePathProps) {
    const { isVisible, isActive } = turnEdge;

    const stroke = isVisible
        ? 'var(--color-base-9)'
        : isActive
          ? 'var(--color-base-5)'
          : 'var(--color-base-3)';

    // sourceが子ノード、targetが親ノード
    const childX = sourceX;
    const childY = sourceY;
    const parentX = targetX;
    const parentY = targetY;

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
