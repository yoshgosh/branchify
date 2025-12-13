import { createEntityAdapter } from "@reduxjs/toolkit";
import { Graph } from "@/shared/entities/graph";

export const graphAdapter = createEntityAdapter<Graph, string>({
    selectId: (graph) => graph.graphId,
    sortComparer: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
});
