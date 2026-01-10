import 'server-only';
import type { DBLike } from '@/server/db/types';
import { edges } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { EdgeSchema, type Edge } from '@/shared/entities/edge';
import {
    EdgeInsertSchema,
    EdgeUpdateSchema,
    type EdgeInsertInput,
    type EdgeUpdateInput,
} from './models';

export async function findById(d: DBLike, edgeId: string): Promise<Edge | null> {
    const rows = await d.select().from(edges).where(eq(edges.edgeId, edgeId)).limit(1);

    const row = rows[0];
    return row ? EdgeSchema.parse(row) : null;
}

export async function findParents(d: DBLike, childId: string): Promise<Edge[]> {
    const rows = await d.select().from(edges).where(eq(edges.childId, childId));

    return rows.map((r) => EdgeSchema.parse(r));
}

export async function findChildren(d: DBLike, parentId: string): Promise<Edge[]> {
    const rows = await d.select().from(edges).where(eq(edges.parentId, parentId));

    return rows.map((r) => EdgeSchema.parse(r));
}

export async function listByGraphId(d: DBLike, graphId: string): Promise<Edge[]> {
    const rows = await d.select().from(edges).where(eq(edges.graphId, graphId));

    return rows.map((r) => EdgeSchema.parse(r));
}

export async function create(d: DBLike, data: EdgeInsertInput): Promise<Edge> {
    const values = EdgeInsertSchema.parse(data);
    const [row] = await d.insert(edges).values(values).returning();
    return EdgeSchema.parse(row);
}

export async function update(
    d: DBLike,
    edgeId: string,
    data: EdgeUpdateInput
): Promise<Edge | null> {
    const patch = EdgeUpdateSchema.parse(data);
    if (Object.keys(patch).length === 0) {
        return findById(d, edgeId);
    }

    const [row] = await d.update(edges).set(patch).where(eq(edges.edgeId, edgeId)).returning();

    return row ? EdgeSchema.parse(row) : null;
}

export async function remove(d: DBLike, edgeId: string): Promise<Edge | null> {
    const [row] = await d.delete(edges).where(eq(edges.edgeId, edgeId)).returning();

    return row ? EdgeSchema.parse(row) : null;
}

export async function exists(d: DBLike, edgeId: string): Promise<boolean> {
    const hit = await d
        .select({ id: edges.edgeId })
        .from(edges)
        .where(eq(edges.edgeId, edgeId))
        .limit(1);

    return hit.length > 0;
}
