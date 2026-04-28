import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { BranchifyLogo } from '@/app/components/BranchifyLogo';
import { TurnNode as TurnNodeType } from '../../models';

export function TurnNode({ data }: NodeProps<TurnNodeType>) {
    const { isHead, isActive, isVisible } = data;

    const borderColor = isVisible
        ? 'var(--color-graph-visible)'
        : isActive
          ? 'var(--color-graph-active)'
          : 'var(--color-graph-inactive)';

    const size = 20;
    const logoWidth = size;
    const logoHeight = (logoWidth * 5) / 3;

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
                    backgroundColor: 'var(--color-bg)',
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
                            width: logoWidth,
                            height: logoWidth,
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-bg)',
                            zIndex: -1,
                        }}
                    />
                    <BranchifyLogo width={logoWidth} height={logoHeight} color={borderColor} />
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
