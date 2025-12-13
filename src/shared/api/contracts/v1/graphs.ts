import { z } from "zod";
import { GraphSchema } from "@/shared/entities";
import { GraphDtoSchema } from "@/shared/api/models";

// ----- path params -----
export const GraphIdPathSchema = z
    .object({
        graphId: z.uuid(),
    })
    .strict();
export type GraphIdPath = z.infer<typeof GraphIdPathSchema>;

// ----- request body -----
export const UpdateGraphBodySchema = z
    .object({
        data: GraphSchema.partial().pick({ title: true }),
    })
    .strict();
export type UpdateGraphBody = z.infer<typeof UpdateGraphBodySchema>;

// ----- response body -----
export const ListGraphsResSchema = z
    .object({
        graphs: z.array(GraphDtoSchema),
    })
    .strict();
export type ListGraphsRes = z.infer<typeof ListGraphsResSchema>;

export const CreateGraphResSchema = z
    .object({
        graph: GraphDtoSchema,
    })
    .strict();
export type CreateGraphRes = z.infer<typeof CreateGraphResSchema>;

export const UpdateGraphResSchema = z
    .object({
        graph: GraphDtoSchema,
    })
    .strict();
export type UpdateGraphRes = z.infer<typeof UpdateGraphResSchema>;

export const RemoveGraphResSchema = z
    .object({
        graph: GraphDtoSchema.nullable(),
    })
    .strict();
export type RemoveGraphRes = z.infer<typeof RemoveGraphResSchema>;

export const GenerateGraphTitleResSchema = z
    .object({
        graph: GraphDtoSchema,
    })
    .strict();
export type GenerateGraphTitleRes = z.infer<typeof GenerateGraphTitleResSchema>;
