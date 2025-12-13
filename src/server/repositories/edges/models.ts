import { z } from "zod";
import { EdgeSchema } from "@/shared/entities/edge";

export const EdgeInsertSchema = EdgeSchema.omit({
    edgeId: true,
    createdAt: true,
    updatedAt: true,
}).strict();
export type EdgeInsert = z.output<typeof EdgeInsertSchema>;
export type EdgeInsertInput = z.input<typeof EdgeInsertSchema>;

export const EdgeUpdateSchema = z.never();
export type EdgeUpdate = z.output<typeof EdgeUpdateSchema>;
export type EdgeUpdateInput = z.input<typeof EdgeUpdateSchema>;
