import 'server-only';
import { Pool } from 'pg';

let _pool: Pool | undefined;

export function getPool() {
    if (_pool) return _pool;
    _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        // ssl: { rejectUnauthorized: false }, // Supabase/Neon等で必要なら
        // max: 10, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000,
    });
    return _pool;
}
