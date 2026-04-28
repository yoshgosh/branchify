import { z } from 'zod';
import type { StoredMessage as StoredMessageLC } from '@langchain/core/messages';
import {
    mapChatMessagesToStoredMessages,
    mapStoredMessagesToChatMessages,
} from '@langchain/core/messages';
import { NodeSchema, type Node, type Message } from '@/shared/entities/node';

export const MessageDtoSchema = z.custom<StoredMessageLC>();
export type MessageDto = z.infer<typeof MessageDtoSchema>;

export const NodeDtoSchema = NodeSchema.extend({
    message: MessageDtoSchema.nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
}).strict();
export type NodeDto = z.output<typeof NodeDtoSchema>;

export const toMessageDto = (msg: Message): MessageDto => mapChatMessagesToStoredMessages([msg])[0];

export const fromMessageDto = (stored: MessageDto): Message =>
    mapStoredMessagesToChatMessages([stored])[0];

export function toNodeDto(node: Node): NodeDto {
    const mapped = mapMessageToDto(node);
    return NodeDtoSchema.parse({
        ...mapped,
        createdAt: node.createdAt.toISOString(),
        updatedAt: node.updatedAt.toISOString(),
    });
}

export function fromNodeDto(dto: NodeDto): Node {
    const mapped = mapMessageFromDto(dto);
    return NodeSchema.parse({
        ...mapped,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    });
}

export function mapMessageToDto<T extends { message?: Message | null }>(
    obj: T
): Omit<T, 'message'> & { message?: MessageDto | null } {
    if (!obj.message) return obj as Omit<T, 'message'> & { message?: MessageDto | null };
    return { ...obj, message: toMessageDto(obj.message) };
}

export function mapMessageFromDto<T extends { message?: MessageDto | null }>(
    obj: T
): Omit<T, 'message'> & { message?: Message | null } {
    if (!obj.message) return obj as Omit<T, 'message'> & { message?: Message | null };
    return { ...obj, message: fromMessageDto(obj.message) };
}
