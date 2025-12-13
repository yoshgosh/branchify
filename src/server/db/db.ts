import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { getPool } from "./pool";
import * as schema from "./schema";

let _db: NodePgDatabase<typeof schema> | undefined;

export function db() {
    if (_db) return _db;
    _db = drizzle(getPool(), { schema });
    return _db;
}
