import { fetchJson } from "../api-client";
import {
    type ListGraphsRes,
    type CreateGraphRes,
    type UpdateGraphRes,
    type RemoveGraphRes,
    type GenerateGraphTitleRes,
    type GraphIdPath,
    type UpdateGraphBody,
} from "@/shared/api/contracts/v1";

// GET /api/v1/graphs
export async function listGraphs(): Promise<ListGraphsRes> {
    const res = await fetchJson("/graphs");
    return res as ListGraphsRes;
}

// POST /api/v1/graphs
export async function createGraph(): Promise<CreateGraphRes> {
    const res = await fetchJson("/graphs", { method: "POST" });
    return res as CreateGraphRes;
}

// PATCH /api/v1/graphs/:graphId
export async function updateGraph(
    path: GraphIdPath,
    body: UpdateGraphBody
): Promise<UpdateGraphRes> {
    const res = await fetchJson(`/graphs/${path.graphId}`, {
        method: "PATCH",
        body,
    });
    return res as UpdateGraphRes;
}

// DELETE /api/v1/graphs/:graphId
export async function removeGraph(
    path: GraphIdPath
): Promise<RemoveGraphRes> {
    const res = await fetchJson(`/graphs/${path.graphId}`, {
        method: "DELETE",
    });
    return res as RemoveGraphRes;
}

// POST /api/v1/graphs/:graphId/title
export async function generateGraphTitle(
    path: GraphIdPath
): Promise<GenerateGraphTitleRes> {
    const res = await fetchJson(`/graphs/${path.graphId}/title`, {
        method: "POST",
    });
    return res as GenerateGraphTitleRes;
}