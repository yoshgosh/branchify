import {
    NodeDtoSchema,
    MessageDtoSchema,
    EdgeDtoSchema,
} from "@/shared/api/models";
import { z } from "zod";

// ----- path params -----
export const NodeIdPathSchema = z
    .object({
        nodeId: z.uuid(),
    })
    .strict();
export type NodeIdPath = z.infer<typeof NodeIdPathSchema>;

// ----- query -----
export const ListNodesQuerySchema = z
    .object({
        graphId: z.uuid(),
    })
    .strict();
export type ListNodesQuery = z.infer<typeof ListNodesQuerySchema>;

// ----- request body -----
export const CreateNodeBodySchema = z
    .object({
        data: NodeDtoSchema.omit({
            nodeId: true,
            createdAt: true,
            updatedAt: true,
        }).extend({
            title: z.string().nullable().optional(),
            message: MessageDtoSchema.nullable().optional(),
        }),
        parentIds: z.array(z.uuid()).default([]),
    })
    .strict();
export type CreateNodeBody = z.infer<typeof CreateNodeBodySchema>;

export const UpdateNodeBodySchema = z
    .object({
        data: NodeDtoSchema.pick({ title: true }).partial(),
    })
    .strict();
export type UpdateNodeBody = z.infer<typeof UpdateNodeBodySchema>;

// ----- response body -----
export const ListNodesResSchema = z
    .object({
        nodes: z.array(NodeDtoSchema),
    })
    .strict();
export type ListNodesRes = z.infer<typeof ListNodesResSchema>;

export const CreateNodeResSchema = z
    .object({
        node: NodeDtoSchema,
        edges: z.array(EdgeDtoSchema),
    })
    .strict();
export type CreateNodeRes = z.infer<typeof CreateNodeResSchema>;

export const UpdateNodeResSchema = z
    .object({
        node: NodeDtoSchema,
    })
    .strict();
export type UpdateNodeRes = z.infer<typeof UpdateNodeResSchema>;

export const RemoveNodeResSchema = z
    .object({
        node: NodeDtoSchema.nullable(),
    })
    .strict();
export type RemoveNodeRes = z.infer<typeof RemoveNodeResSchema>;

export const GenerateMergeMessageResSchema = z
    .object({
        node: NodeDtoSchema,
    })
    .strict();
export type GenerateMergeMessageRes = z.infer<
    typeof GenerateMergeMessageResSchema
>;

export const GenerateNodeTitleResSchema = z
    .object({
        node: NodeDtoSchema,
    })
    .strict();
export type GenerateNodeTitleRes = z.infer<typeof GenerateNodeTitleResSchema>;
