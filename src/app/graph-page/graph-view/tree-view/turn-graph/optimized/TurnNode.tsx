import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { BranchifyLogo } from '@/app/components/BranchifyLogo';
import { TurnNode as TurnNodeType } from '../../models';

export function TurnNode({ data }: NodeProps<TurnNodeType>) {
    const { isHead, isActive, isVisible } = data;

    const borderColor = isVisible
        ? 'var(--color-base-9)'
        : isActive
          ? 'var(--color-base-5)'
          : 'var(--color-base-3)';

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
            {isHead && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <BranchifyLogo width={logoWidth} height={logoHeight} color={borderColor} />
                </div>
            )}

            <Handle
                type="target"
                id="right"
                position={Position.Right}
                style={{ visibility: 'hidden' }}
            />
            <Handle
                type="target"
                id="bottom"
                position={Position.Bottom}
                style={{ visibility: 'hidden' }}
            />
            <Handle
                type="source"
                id="top"
                position={Position.Top}
                style={{ visibility: 'hidden' }}
            />
            <Handle
                type="source"
                id="right"
                position={Position.Right}
                style={{ visibility: 'hidden' }}
            />
        </div>
    );
}
