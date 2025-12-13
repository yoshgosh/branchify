import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, index, unique, check, pgEnum, uuid, jsonb } from "drizzle-orm/pg-core";
import { StoredMessage } from "./models/node";

const primaryUuid = (name: string) => uuid(name).primaryKey().default(sql`gen_random_uuid()`);

export const nodeTypeEnum = pgEnum("node_type_enum", ["question", "answer"]);
export const nodeStatusEnum = pgEnum("node_status_enum", ["pending", "in_progress", "completed", "failed"]);

const timestamps = {
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const users = pgTable("users", {
    userId: primaryUuid("user_id"),
    name: text("name").notNull(),
    ...timestamps,
}, (table) => [
    unique("users_name_idx").on(table.name),
]);

export const graphs = pgTable("graphs", {
    graphId: primaryUuid("graph_id"),
    userId: uuid("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
    title: text("title"),
    ...timestamps,
});

export const nodes = pgTable("nodes", {
    nodeId: primaryUuid("node_id"),
    graphId: uuid("graph_id").notNull().references(() => graphs.graphId, { onDelete: "cascade" }),
    title: text("title"),
    message: jsonb("message").$type<StoredMessage>(),
    type: nodeTypeEnum("type").notNull(),
    status: nodeStatusEnum("status").notNull(),
    ...timestamps,
}, (table) => [
    index("nodes_graph_id_idx").on(table.graphId),
]);

export const edges = pgTable("edges", {
    edgeId: primaryUuid("edge_id"),
    graphId: uuid("graph_id").notNull().references(() => graphs.graphId, { onDelete: "cascade" }),
    parentId: uuid("parent_id").notNull().references(() => nodes.nodeId, { onDelete: "cascade" }),
    childId: uuid("child_id").notNull().references(() => nodes.nodeId, { onDelete: "cascade" }),
    ...timestamps,
}, (table) => [
    index("edges_graph_id_idx").on(table.graphId),
    index("edges_parent_id_idx").on(table.parentId),
    index("edges_child_id_idx").on(table.childId),
    unique("edges_no_duplicate_edges").on(table.parentId, table.childId),
    check("edges_no_self_loop", sql`${table.parentId} <> ${table.childId}`),
]);

// ========== drizzle-orm 外定義スキーマ ==========
// - drizzle-orm で定義できないスキーマは、 .sql に直接記述する
// - updateAt自動更新トリガー
//   - 各テーブルの updatedAt は　.sql のトリガーにより自動更新される

// ========== 以下のコードを .sql に記述する ==========

// -- Additional processing (not included in schema.ts)

// -- Create a function to automatically update `updated_at` timestamp
// CREATE OR REPLACE FUNCTION update_timestamp()
// RETURNS TRIGGER AS $$
// BEGIN
//     NEW.updated_at = NOW();
//     RETURN NEW;
// END;
// $$ LANGUAGE plpgsql;

// -- Add triggers to automatically update `updated_at` for each table

// -- `users` table
// CREATE TRIGGER trigger_update_users
// BEFORE UPDATE ON users
// FOR EACH ROW
// EXECUTE FUNCTION update_timestamp();

// -- `graphs` table
// CREATE TRIGGER trigger_update_graphs
// BEFORE UPDATE ON graphs
// FOR EACH ROW
// EXECUTE FUNCTION update_timestamp();

// -- `nodes` table
// CREATE TRIGGER trigger_update_nodes
// BEFORE UPDATE ON nodes
// FOR EACH ROW
// EXECUTE FUNCTION update_timestamp();

// -- `edges` table
// CREATE TRIGGER trigger_update_edges
// BEFORE UPDATE ON edges
// FOR EACH ROW
// EXECUTE FUNCTION update_timestamp();
