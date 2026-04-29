import 'server-only';
import type { DBLike } from '@/server/db/types';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { UserSchema, type User } from '@/shared/entities/user';
import {
    UserInsertSchema,
    UserUpdateSchema,
    type UserInsertInput,
    type UserUpdateInput,
} from './models';

export async function findByEmail(d: DBLike, email: string): Promise<User | null> {
    const rows = await d.select().from(users).where(eq(users.email, email)).limit(1);
    const row = rows[0];
    return row ? UserSchema.parse(row) : null;
}

export async function findById(d: DBLike, userId: string): Promise<User | null> {
    const rows = await d.select().from(users).where(eq(users.userId, userId)).limit(1);

    const row = rows[0];
    return row ? UserSchema.parse(row) : null;
}

export async function create(d: DBLike, data: UserInsertInput): Promise<User> {
    const values = UserInsertSchema.parse(data);
    const [row] = await d.insert(users).values(values).returning();
    return UserSchema.parse(row);
}

export async function update(
    d: DBLike,
    userId: string,
    data: UserUpdateInput
): Promise<User | null> {
    const patch = UserUpdateSchema.parse(data);
    if (Object.keys(patch).length === 0) {
        return findById(d, userId);
    }

    const [row] = await d.update(users).set(patch).where(eq(users.userId, userId)).returning();

    return row ? UserSchema.parse(row) : null;
}

export async function remove(d: DBLike, userId: string): Promise<User | null> {
    const [row] = await d.delete(users).where(eq(users.userId, userId)).returning();

    return row ? UserSchema.parse(row) : null;
}

export async function exists(d: DBLike, userId: string): Promise<boolean> {
    const hit = await d
        .select({ id: users.userId })
        .from(users)
        .where(eq(users.userId, userId))
        .limit(1);

    return hit.length > 0;
}
