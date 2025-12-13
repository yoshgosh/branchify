import { fetchJson } from "../api-client";
import {
    type ListEdgesQuery,
    type ListEdgesRes,
} from "@/shared/api/contracts/v1";

// GET /api/v1/edges?graphId=:graphId
export async function listEdges(
    query: ListEdgesQuery
): Promise<ListEdgesRes> {
    const search = new URLSearchParams(
        query as Record<string, string>
    ).toString();

    const res = await fetchJson(`/edges?${search}`);
    return res as ListEdgesRes;
}