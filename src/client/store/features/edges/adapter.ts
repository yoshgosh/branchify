import { createEntityAdapter } from "@reduxjs/toolkit";
import { Edge } from "@/shared/entities/edge";

export const edgeAdapter = createEntityAdapter<Edge, string>({
    selectId: (edge) => edge.edgeId,
    sortComparer: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
});
