import React, { RefCallback } from 'react';
import { BranchifyIcon } from '@/app/components/BranchifyIcon';
import { TurnNode } from '../../models';

export const TITLE_COLUMN_WIDTH = 120;
const TITLE_LEFT_GAP = 8;

type TurnNodeElementProps = {
    turnNode: TurnNode;
    x: number;
    y: number;
    onClick: (event: React.MouseEvent) => void;
    registerRef: (id: string) => RefCallback<HTMLElement>;
    showTitle?: boolean;
    title?: string | null;
};

export function TurnNodeElement({
    turnNode,
    x,
    y,
    onClick,
    registerRef,
    showTitle,
    title,
}: TurnNodeElementProps) {
    const { isHead, isActive, isVisible } = turnNode;

    const borderColor = isVisible
        ? 'var(--color-base-9)'
        : isActive
          ? 'var(--color-base-5)'
          : 'var(--color-base-3)';

    const size = 20;
    const iconSize = Math.round((size * 5) / 3);
    const domSize = isHead ? iconSize : size;
    const offset = isHead ? (iconSize - size) / 2 : 0;

    const refCallback = (el: HTMLElement | null) => {
        for (const node of turnNode.nodes) {
            registerRef(node.nodeId)(el);
        }
    };

    return (
        <div
            ref={refCallback}
            onClick={onClick}
            style={{
                position: 'absolute',
                left: x - offset,
                top: y - offset,
                width: domSize,
                height: domSize,
                cursor: 'pointer',
                borderRadius: isHead ? '0%' : '50%',
                backgroundColor: 'transparent',
                border: isHead ? 'none' : `6px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                scrollMargin: 8,
            }}
        >
            {isHead && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <BranchifyIcon size={iconSize} color={borderColor} />
                </div>
            )}
            {showTitle && title && (
                <span
                    style={{
                        position: 'absolute',
                        left: domSize + TITLE_LEFT_GAP,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: TITLE_COLUMN_WIDTH - TITLE_LEFT_GAP,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '12px',
                        color: borderColor,
                        userSelect: 'none',
                    }}
                >
                    {title}
                </span>
            )}
        </div>
    );
}
