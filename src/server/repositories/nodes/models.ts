import { z } from 'zod';
import { NodeSchema, MessageSchema, type Message } from '@/shared/entities/node';
import { StoredMessageSchema, toStoredMessage } from '@/server/db/models/node';

export const NodeInsertSchema = NodeSchema.omit({
    nodeId: true,
    createdAt: true,
    updatedAt: true,
})
    .extend({
        title: z.string().nullable().default(null),
        message: MessageSchema.nullable().default(null),
    })
    .strict();
export type NodeInsert = z.output<typeof NodeInsertSchema>;
export type NodeInsertInput = z.input<typeof NodeInsertSchema>;

export const NodeUpdateSchema = NodeSchema.omit({
    nodeId: true,
    graphId: true,
    createdAt: true,
    updatedAt: true,
})
    .extend({
        title: z.string().nullable(),
        message: MessageSchema.nullable(),
    })
    .partial()
    .strict();
export type NodeUpdate = z.output<typeof NodeUpdateSchema>;
export type NodeUpdateInput = z.input<typeof NodeUpdateSchema>;

export const StoredNodeInsertSchema = NodeInsertSchema.extend({
    message: StoredMessageSchema.nullable().optional(),
}).strict();
export type StoredNodeInsert = z.output<typeof StoredNodeInsertSchema>;
export type StoredNodeInsertInput = z.input<typeof StoredNodeInsertSchema>;

export const StoredNodeUpdateSchema = NodeUpdateSchema.extend({
    message: StoredMessageSchema.nullable().optional(),
}).strict();
export type StoredNodeUpdate = z.output<typeof StoredNodeUpdateSchema>;
export type StoredNodeUpdateInput = z.input<typeof StoredNodeUpdateSchema>;

export function toStoredNodeInsert(data: NodeInsertInput): StoredNodeInsert {
    return StoredNodeInsertSchema.parse({
        ...data,
        message: data.message ? toStoredMessage(data.message) : data.message,
    });
}

export function toStoredNodeUpdate(data: NodeUpdateInput): StoredNodeUpdate {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
            if (key === 'message') {
                const messageValue = value as Message | null;
                result[key] = messageValue !== null ? toStoredMessage(messageValue) : null;
            } else {
                result[key] = value;
            }
        }
    }

    return StoredNodeUpdateSchema.parse(result);
}
