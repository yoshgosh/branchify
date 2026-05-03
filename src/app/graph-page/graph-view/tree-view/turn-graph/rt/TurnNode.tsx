import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { BranchifyIcon } from '@/app/components/BranchifyIcon';
import { TurnNode as TurnNodeType } from '../../models';

export function TurnNode({ data }: NodeProps<TurnNodeType>) {
    const { isHead, isActive, isVisible } = data;

    const borderColor = isVisible
        ? 'var(--color-base-9)'
        : isActive
          ? 'var(--color-base-5)'
          : 'var(--color-base-3)';

    const size = 20;
    const iconSize = Math.round((size * 5) / 3);

    return (
        <div
            style={{
                width: size,
                height: size,
                position: 'relative',
                borderRadius: isHead ? '0%' : '50%',
                backgroundColor: 'transparent',
                border: isHead ? 'none' : `6px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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

            <Handle
                type="target"
                position={Position.Top}
                style={{
                    visibility: 'hidden',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    visibility: 'hidden',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            />
        </div>
    );
}
