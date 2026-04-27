import React from 'react';
import { EdgeProps } from 'reactflow';
import { TurnEdge as TurnEdgeType } from '../models';

// const RADIUS = 10; // 角丸の半径

export function TurnEdge({ sourceX, sourceY, targetX, targetY, data }: EdgeProps<TurnEdgeType>) {
    const { isVisible, isActive } = data || {};

    const stroke = isVisible
        ? 'var(--color-graph-visible)'
        : isActive
          ? 'var(--color-graph-active)'
          : 'var(--color-graph-inactive)';

    // RT配置では親が上、子が下
    // sourceはchild(下)、targetはparent(上)
    const childX = sourceX;
    const childY = sourceY;
    const parentX = targetX;
    const parentY = targetY;

    // シンプルな直線で接続
    const path = `M${childX},${childY} L${parentX},${parentY}`;

    // --- 2回Rで曲がるパス（コメントアウト） ---
    // const r = RADIUS;
    // let path: string;
    //
    // if (childX === parentX) {
    //     // 縦一直線の場合
    //     path = `M${childX},${childY} L${parentX},${parentY}`;
    // } else {
    //     // 2回直角に曲がるパス（中間Y座標で折れる）
    //     const midY = (childY + parentY) / 2;
    //     const dx = parentX - childX;
    //     const isRight = dx > 0; // 親が右側にいる
    //
    //     // 子から上へ → 横へ → 親へ下から
    //     // 角丸で2回曲がる
    //     if (isRight) {
    //         // 子(下) → 上へ → 右へ曲がる → 右へ進む → 上へ曲がる → 親(上)
    //         path = `
    //             M${childX},${childY}
    //             L${childX},${midY + r}
    //             A${r},${r} 0 0 1 ${childX + r},${midY}
    //             L${parentX - r},${midY}
    //             A${r},${r} 0 0 0 ${parentX},${midY - r}
    //             L${parentX},${parentY}
    //         `;
    //     } else {
    //         // 子(下) → 上へ → 左へ曲がる → 左へ進む → 上へ曲がる → 親(上)
    //         path = `
    //             M${childX},${childY}
    //             L${childX},${midY + r}
    //             A${r},${r} 0 0 0 ${childX - r},${midY}
    //             L${parentX + r},${midY}
    //             A${r},${r} 0 0 1 ${parentX},${midY - r}
    //             L${parentX},${parentY}
    //         `;
    //     }
    // }
    // --- ここまでコメントアウト ---

    return (
        <g>
            <path d={path.trim()} stroke={stroke} strokeWidth={2} fill="none" />
        </g>
    );
}
