import { createAsyncThunk } from '@reduxjs/toolkit';
import * as graphService from '@/client/services/graphs/service';
import { fromGraphDto } from '@/shared/api/models';
import type { Graph } from '@/shared/entities/graph';

export const listGraphsThunk = createAsyncThunk<{ graphs: Graph[] }, void>(
    'graphs/list',
    async () => {
        const dto = await graphService.listGraphs();
        return { graphs: dto.graphs.map(fromGraphDto) };
    }
);

export const createGraphThunk = createAsyncThunk<{ graph: Graph }, void>(
    'graphs/create',
    async () => {
        const dto = await graphService.createGraph();
        return { graph: fromGraphDto(dto.graph) };
    }
);

export const updateGraphThunk = createAsyncThunk<
    { graph: Graph },
    {
        graphId: string;
        data: Partial<Pick<Graph, 'title'>>;
    }
>('graphs/update', async ({ graphId, data }) => {
    const dto = await graphService.updateGraph({ graphId }, { data });
    return { graph: fromGraphDto(dto.graph) };
});

export const removeGraphThunk = createAsyncThunk<{ graph: Graph | null }, { graphId: string }>(
    'graphs/remove',
    async ({ graphId }) => {
        const dto = await graphService.removeGraph({ graphId });
        return { graph: dto.graph ? fromGraphDto(dto.graph) : null };
    }
);

export const generateGraphTitleThunk = createAsyncThunk<{ graph: Graph }, { graphId: string }>(
    'graphs/generateTitle',
    async ({ graphId }) => {
        const dto = await graphService.generateGraphTitle({ graphId });
        return { graph: fromGraphDto(dto.graph) };
    }
);
