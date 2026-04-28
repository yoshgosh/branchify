import React from 'react';
import { EdgeProps } from 'reactflow';
import { TurnEdge as TurnEdgeType } from '../../models';

export function TurnEdge({ sourceX, sourceY, targetX, targetY, data }: EdgeProps<TurnEdgeType>) {
    const { isVisible, isActive } = data || {};

    const stroke = isVisible
        ? 'var(--color-graph-visible)'
        : isActive
          ? 'var(--color-graph-active)'
          : 'var(--color-graph-inactive)';

    const childX = sourceX;
    const childY = sourceY;
    const parentX = targetX;
    const parentY = targetY;

    const path = `M${childX},${childY} L${parentX},${parentY}`;

    return (
        <g>
            <path d={path.trim()} stroke={stroke} strokeWidth={2} fill="none" />
        </g>
    );
}
