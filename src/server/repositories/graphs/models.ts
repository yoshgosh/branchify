import { z } from "zod";
import { GraphSchema } from "@/shared/entities/graph";

export const GraphInsertSchema = GraphSchema.omit({
    graphId: true,
    createdAt: true,
    updatedAt: true,
})
    .extend({
        title: z.string().nullable().default(null),
    })
    .strict();
export type GraphInsert = z.output<typeof GraphInsertSchema>;
export type GraphInsertInput = z.input<typeof GraphInsertSchema>;

export const GraphUpdateSchema = GraphSchema.omit({
    graphId: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
})
    .extend({
        title: z.string().nullable(),
    })
    .partial()
    .strict();
export type GraphUpdate = z.output<typeof GraphUpdateSchema>;
export type GraphUpdateInput = z.input<typeof GraphUpdateSchema>;
