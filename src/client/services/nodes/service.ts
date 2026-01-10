// client/services/node-service.ts
import { fetchJson, postSse } from '../api-client';
import {
    type ListNodesQuery,
    type ListNodesRes,
    type CreateNodeBody,
    type CreateNodeRes,
    type UpdateNodeBody,
    type UpdateNodeRes,
    type RemoveNodeRes,
    type GenerateNodeTitleRes,
} from '@/shared/api/contracts/v1';

// GET /api/v1/nodes?graphId=:graphId
export async function listNodes(query: ListNodesQuery): Promise<ListNodesRes> {
    const search = new URLSearchParams(query as Record<string, string>).toString();
    return await fetchJson(`/nodes?${search}`);
}

// POST /api/v1/nodes
export async function createNode(body: CreateNodeBody): Promise<CreateNodeRes> {
    return await fetchJson('/nodes', {
        method: 'POST',
        body,
    });
}

// PATCH /api/v1/nodes/:nodeId
export async function updateNode(
    path: { nodeId: string },
    body: UpdateNodeBody
): Promise<UpdateNodeRes> {
    return await fetchJson(`/nodes/${path.nodeId}`, {
        method: 'PATCH',
        body,
    });
}

// DELETE /api/v1/nodes/:nodeId
export async function removeNode(path: { nodeId: string }): Promise<RemoveNodeRes> {
    return await fetchJson(`/nodes/${path.nodeId}`, {
        method: 'DELETE',
    });
}

// POST /api/v1/nodes/:nodeId/answer (SSE, no request body)
export function generateAnswerMessage(
    path: { nodeId: string },
    handlers: {
        onMessage: (data: unknown) => void;
        onError?: (err: Error) => void;
        onEnd?: () => void;
    }
): { close: () => void } {
    return postSse(`/nodes/${path.nodeId}/answer`, {
        onMessage: handlers.onMessage,
        onError: handlers.onError,
        onEnd: handlers.onEnd,
    });
}

// POST /api/v1/nodes/:nodeId/title
export async function generateNodeTitle(path: { nodeId: string }): Promise<GenerateNodeTitleRes> {
    return await fetchJson(`/nodes/${path.nodeId}/title`, {
        method: 'POST',
    });
}
