import { z } from 'zod';
import type { StoredMessage as StoredMessageLC } from '@langchain/core/messages';
import {
    mapChatMessagesToStoredMessages,
    mapStoredMessagesToChatMessages,
} from '@langchain/core/messages';
import { NodeSchema, type Node, type Message } from '@/shared/entities/node';

export const StoredMessageSchema = z.custom<StoredMessageLC>();
export type StoredMessage = z.infer<typeof StoredMessageSchema>;

export const StoredNodeSchema = NodeSchema.extend({
    message: StoredMessageSchema.nullable(),
}).strict();
export type StoredNode = z.output<typeof StoredNodeSchema>;

export const toStoredMessage = (msg: Message): StoredMessage =>
    mapChatMessagesToStoredMessages([msg])[0];

export const fromStoredMessage = (stored: StoredMessage): Message =>
    mapStoredMessagesToChatMessages([stored])[0];

export function toStoredNode(node: Node): StoredNode {
    return StoredNodeSchema.parse({
        ...node,
        message: node.message ? toStoredMessage(node.message) : node.message,
    });
}

export function fromStoredNode(stored: StoredNode): Node {
    return NodeSchema.parse({
        ...stored,
        message: stored.message ? fromStoredMessage(stored.message) : stored.message,
    });
}
