import type { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres';
import type { TablesRelationalConfig } from 'drizzle-orm';
import * as schema from './schema';

export type DB = NodePgDatabase<typeof schema>;
export type TX = NodePgTransaction<typeof schema, TablesRelationalConfig>;
export type DBLike = DB | TX;
