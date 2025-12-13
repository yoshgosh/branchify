import "server-only";
import { db } from "./db";
import type { TX } from "./types";


export async function withTransaction<T>(
    fn: (tx: TX) => Promise<T>
): Promise<T> {
    return db().transaction(async (tx) => fn(tx));
}
