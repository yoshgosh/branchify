import React from 'react';
import { EdgeProps } from 'reactflow';
import { TurnEdge as TurnEdgeType } from '../models';

const RADIUS = 10; // 折れ線の角丸半径

export function TurnEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
}: EdgeProps<TurnEdgeType>) {
    const { isVisible, isActive } = data || {};

    // 見た目の色（状態によって変える）
    const stroke = isVisible
        ? 'var(--color-graph-visible)'
        : isActive
          ? 'var(--color-graph-active)'
          : 'var(--color-graph-inactive)';

    // 正しい方向か確認（子が下、親が上であるべき）
    const isChildToParent = sourceY > targetY;

    // 正規化：常に childY > parentY となるよう入れ替え
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
        // 縦線　→ 下から上へ
        path = `M${childX},${childY} L${parentX},${parentY}`;
    } else if (childX < parentX) {
        // 子が左・親が右 → 上→左折れ（角丸）
        path = `
            M${childX},${childY}
            L${parentX - RADIUS},${childY}
            A${RADIUS},${RADIUS} 0 0 0 ${parentX},${childY - RADIUS}
            L${parentX},${parentY}
        `;
    } else {
        // 子が右・親が左 → 右→上折れ（角丸）
        path = `
            M${childX},${childY}
            L${childX},${parentY + RADIUS}
            A${RADIUS},${RADIUS} 0 0 0 ${childX - RADIUS},${parentY}
            L${parentX},${parentY}
        `;
    }

    return (
        <g>
            <path
                d={path.trim()}
                stroke={stroke}
                strokeWidth={2}
                fill="none"
                style={
                    {
                        // transition: "border 0.3s ease-in",
                    }
                }
            />
        </g>
    );
}
