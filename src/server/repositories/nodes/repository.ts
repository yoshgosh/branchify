import "server-only";
import type { DBLike } from "@/server/db/types";
import { nodes } from "@/server/db/schema";
import { eq, inArray } from "drizzle-orm";
import { type Node } from "@/shared/entities/node";
import {
    NodeInsertSchema,
    NodeUpdateSchema,
    type NodeInsertInput,
    type NodeUpdateInput,
    toStoredNodeInsert,
    toStoredNodeUpdate,
} from "./models";
import { StoredNodeSchema, fromStoredNode } from "@/server/db/models";

export async function findById(
    d: DBLike,
    nodeId: string
): Promise<Node | null> {
    const rows = await d
        .select()
        .from(nodes)
        .where(eq(nodes.nodeId, nodeId))
        .limit(1);

    const row = rows[0];
    return row ? fromStoredNode(StoredNodeSchema.parse(row)) : null;
}

export async function findByIds(d: DBLike, nodeIds: string[]): Promise<Node[]> {
    if (nodeIds.length === 0) {
        return [];
    }

    const rows = await d
        .select()
        .from(nodes)
        .where(inArray(nodes.nodeId, nodeIds));

    return rows.map((r) => fromStoredNode(StoredNodeSchema.parse(r)));
}

export async function listByGraphId(
    d: DBLike,
    graphId: string
): Promise<Node[]> {
    const rows = await d.select().from(nodes).where(eq(nodes.graphId, graphId));

    return rows.map((r) => fromStoredNode(StoredNodeSchema.parse(r)));
}

export async function create(d: DBLike, data: NodeInsertInput): Promise<Node> {
    const values = NodeInsertSchema.parse(data);
    const [row] = await d
        .insert(nodes)
        .values(toStoredNodeInsert(values))
        .returning();

    return fromStoredNode(StoredNodeSchema.parse(row));
}

export async function update(
    d: DBLike,
    nodeId: string,
    data: NodeUpdateInput
): Promise<Node | null> {
    const patch = NodeUpdateSchema.parse(data);
    if (Object.keys(patch).length === 0) {
        return findById(d, nodeId);
    }

    const [row] = await d
        .update(nodes)
        .set(toStoredNodeUpdate(patch))
        .where(eq(nodes.nodeId, nodeId))
        .returning();

    return row ? fromStoredNode(StoredNodeSchema.parse(row)) : null;
}

export async function remove(d: DBLike, nodeId: string): Promise<Node | null> {
    const [row] = await d
        .delete(nodes)
        .where(eq(nodes.nodeId, nodeId))
        .returning();

    return row ? fromStoredNode(StoredNodeSchema.parse(row)) : null;
}

export async function exists(d: DBLike, nodeId: string): Promise<boolean> {
    const hit = await d
        .select({ id: nodes.nodeId })
        .from(nodes)
        .where(eq(nodes.nodeId, nodeId))
        .limit(1);

    return hit.length > 0;
}
