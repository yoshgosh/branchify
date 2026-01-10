import { z } from 'zod';

export const EdgeSchema = z
    .object({
        edgeId: z.uuid(),
        graphId: z.uuid(),
        parentId: z.uuid(),
        childId: z.uuid(),
        createdAt: z.date(),
        updatedAt: z.date(),
    })
    .strict();
export type Edge = z.output<typeof EdgeSchema>;
