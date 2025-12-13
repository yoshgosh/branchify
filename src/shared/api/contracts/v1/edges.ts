import { z } from "zod";
import { EdgeDtoSchema } from "@/shared/api/models";

// ----- query -----
export const ListEdgesQuerySchema = z
    .object({
        graphId: z.uuid(),
    })
    .strict();
export type ListEdgesQuery = z.infer<typeof ListEdgesQuerySchema>;

// ----- response body -----
export const ListEdgesResSchema = z
    .object({
        edges: z.array(EdgeDtoSchema),
    })
    .strict();
export type ListEdgesRes = z.infer<typeof ListEdgesResSchema>;
