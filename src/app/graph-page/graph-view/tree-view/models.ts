import { Node } from '@/shared/entities/node';

export type TurnNode = {
    turnNodeId: string;
    nodes: Node[];
    isHead?: boolean;
    isActive?: boolean;
    isVisible?: boolean;
};

export type TurnEdge = {
    turnEdgeId: string;
    parentId: string;
    childId: string;
    isActive?: boolean;
    isVisible?: boolean;
};

export type LayoutMode = 'optimized-v2' | 'rt';
