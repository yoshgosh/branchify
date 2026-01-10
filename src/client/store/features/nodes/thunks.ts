import { createAsyncThunk } from '@reduxjs/toolkit';
import * as nodeService from '@/client/services/nodes/service';
import type { Node, Message } from '@/shared/entities/node';
import type { Edge } from '@/shared/entities/edge';
import { fromNodeDto, mapMessageToDto, fromEdgeDto } from '@/shared/api/models';

export const listNodesThunk = createAsyncThunk<{ nodes: Node[] }, { graphId: string }>(
    'nodes/list',
    async ({ graphId }) => {
        const dto = await nodeService.listNodes({ graphId });
        return {
            nodes: dto.nodes.map(fromNodeDto),
        };
    }
);

export const createNodeThunk = createAsyncThunk<
    { node: Node; edges: Edge[] },
    {
        data: Omit<Node, 'nodeId' | 'createdAt' | 'updatedAt' | 'title' | 'message'> & {
            title?: string | null;
            message?: Message | null;
        };
        parentIds?: string[];
    }
>('nodes/create', async ({ data, parentIds }) => {
    const dto = await nodeService.createNode({
        data: mapMessageToDto(data),
        parentIds: parentIds ?? [],
    });

    return {
        node: fromNodeDto(dto.node),
        edges: dto.edges.map(fromEdgeDto),
    };
});

export const updateNodeThunk = createAsyncThunk<
    { node: Node },
    {
        nodeId: string;
        data: Partial<Pick<Node, 'title'>>;
    }
>('nodes/update', async ({ nodeId, data }) => {
    const dto = await nodeService.updateNode({ nodeId }, { data });

    return {
        node: fromNodeDto(dto.node),
    };
});

export const removeNodeThunk = createAsyncThunk<{ node: Node | null }, { nodeId: string }>(
    'nodes/remove',
    async ({ nodeId }) => {
        const dto = await nodeService.removeNode({ nodeId });

        return {
            node: dto.node ? fromNodeDto(dto.node) : null,
        };
    }
);

export const generateNodeTitleThunk = createAsyncThunk<{ node: Node }, { nodeId: string }>(
    'nodes/generateTitle',
    async ({ nodeId }) => {
        const dto = await nodeService.generateNodeTitle({ nodeId });

        return {
            node: fromNodeDto(dto.node),
        };
    }
);
