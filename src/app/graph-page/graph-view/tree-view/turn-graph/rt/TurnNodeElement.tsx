import React, { RefCallback } from 'react';
import { BranchifyIcon } from '@/app/components/BranchifyIcon';
import { TurnNode } from '../../models';

type TurnNodeElementProps = {
    turnNode: TurnNode;
    x: number;
    y: number;
    onClick: (event: React.MouseEvent) => void;
    registerRef: (id: string) => RefCallback<HTMLElement>;
};

export function TurnNodeElement({ turnNode, x, y, onClick, registerRef }: TurnNodeElementProps) {
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
                isolation: 'isolate',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    width: isHead ? size : size - 4,
                    height: isHead ? size : size - 4,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-base-0)',
                    zIndex: -1,
                }}
            />
            {isHead && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: size,
                            height: size,
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-base-0)',
                            zIndex: -1,
                        }}
                    />
                    <BranchifyIcon size={iconSize} color={borderColor} />
                </div>
            )}
        </div>
    );
}
