import { createEntityAdapter } from '@reduxjs/toolkit';
import { Node } from '@/shared/entities/node';

export const nodeAdapter = createEntityAdapter<Node, string>({
    selectId: (node) => node.nodeId,
    sortComparer: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
});
