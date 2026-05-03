import 'server-only';
import { Pool } from 'pg';

let _pool: Pool | undefined;

export function getPool() {
    if (_pool) return _pool;
    _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL?.includes('localhost')
            ? false
            : { rejectUnauthorized: false },
    });
    return _pool;
}
