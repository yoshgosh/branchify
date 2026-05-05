import { Node } from '@/shared/entities/node';

export type TurnNode = {
    turnNodeId: string;
    nodes: Node[];
    x?: number;
    y?: number;
    isHead?: boolean;
    isActive?: boolean;
    isVisible?: boolean;
    showTitle?: boolean;
};

export type HandleType = 'top' | 'bottom' | 'left' | 'right';

export type TurnEdge = {
    turnEdgeId: string;
    parentId: string;
    childId: string;
    parentHandle?: HandleType;
    childHandle?: HandleType;
    isActive?: boolean;
    isVisible?: boolean;
};

export type LayoutMode = 'optimized' | 'rt';
