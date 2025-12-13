import { createAsyncThunk } from "@reduxjs/toolkit";
import * as edgeService from "@/client/services/edges/service";
import { fromEdgeDto } from "@/shared/api/models";
import { Edge } from "@/shared/entities/edge";

export const listEdgesThunk = createAsyncThunk<
    {
        edges: Edge[];
    },
    {
        graphId: string;
    }
>("edges/list", async ({ graphId }) => {
    const dto = await edgeService.listEdges({ graphId });
    return { edges: dto.edges.map(fromEdgeDto) };
});
