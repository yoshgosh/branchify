import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/server/db/schema';

let _pool: Pool | undefined;
let _db: NodePgDatabase<typeof schema> | undefined;

function getPool() {
    if (_pool) return _pool;
    _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    return _pool;
}

export function db() {
    if (_db) return _db;
    _db = drizzle(getPool(), { schema });
    return _db;
}

export { schema };
