import { z } from "zod";
import type { BaseMessage } from "@langchain/core/messages";

export const MessageSchema = z.custom<BaseMessage>();
export type Message = z.infer<typeof MessageSchema>;

export const NodeTypeSchema = z.enum(["question", "answer"]);
export type NodeType = z.infer<typeof NodeTypeSchema>;

export const NodeStatusSchema = z.enum([
    "pending",
    "in_progress",
    "completed",
    "failed",
]);
export type NodeStatus = z.infer<typeof NodeStatusSchema>;

export const NodeSchema = z
    .object({
        nodeId: z.uuid(),
        graphId: z.uuid(),
        title: z.string().nullable(),
        message: MessageSchema.nullable(),
        type: NodeTypeSchema,
        status: NodeStatusSchema,
        createdAt: z.date(),
        updatedAt: z.date(),
    })
    .strict();
export type Node = z.output<typeof NodeSchema>;
