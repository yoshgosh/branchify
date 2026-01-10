import 'server-only';
import type { DBLike } from '@/server/db/types';
import { graphs } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { GraphSchema, type Graph } from '@/shared/entities/graph';
import {
    GraphInsertSchema,
    GraphUpdateSchema,
    type GraphInsertInput,
    type GraphUpdateInput,
} from './models';

export async function findById(d: DBLike, graphId: string): Promise<Graph | null> {
    const rows = await d.select().from(graphs).where(eq(graphs.graphId, graphId)).limit(1);

    const row = rows[0];
    return row ? GraphSchema.parse(row) : null;
}

export async function listByUserId(d: DBLike, userId: string): Promise<Graph[]> {
    const rows = await d.select().from(graphs).where(eq(graphs.userId, userId));

    return rows.map((r) => GraphSchema.parse(r));
}

export async function create(d: DBLike, data: GraphInsertInput): Promise<Graph> {
    const values = GraphInsertSchema.parse(data);
    const [row] = await d.insert(graphs).values(values).returning();
    return GraphSchema.parse(row);
}

export async function update(
    d: DBLike,
    graphId: string,
    data: GraphUpdateInput
): Promise<Graph | null> {
    const patch = GraphUpdateSchema.parse(data);
    if (Object.keys(patch).length === 0) {
        return findById(d, graphId);
    }

    const [row] = await d.update(graphs).set(patch).where(eq(graphs.graphId, graphId)).returning();

    return row ? GraphSchema.parse(row) : null;
}

export async function remove(d: DBLike, graphId: string): Promise<Graph | null> {
    const [row] = await d.delete(graphs).where(eq(graphs.graphId, graphId)).returning();

    return row ? GraphSchema.parse(row) : null;
}

export async function exists(d: DBLike, graphId: string): Promise<boolean> {
    const hit = await d
        .select({ id: graphs.graphId })
        .from(graphs)
        .where(eq(graphs.graphId, graphId))
        .limit(1);

    return hit.length > 0;
}
