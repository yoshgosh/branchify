import type { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export type DB = NodePgDatabase<typeof schema>;
export type TX = NodePgTransaction<typeof schema, any>;
export type DBLike = DB | TX;
