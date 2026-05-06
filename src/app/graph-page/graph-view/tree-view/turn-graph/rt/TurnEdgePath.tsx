import React from 'react';
import { TurnEdge } from '../../models';

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

    const path = `M${sourceX},${sourceY} L${targetX},${targetY}`;

    return <path d={path} stroke={stroke} strokeWidth={2} fill="none" />;
}
