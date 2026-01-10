import { z } from 'zod';

export const GraphSchema = z
    .object({
        graphId: z.uuid(),
        userId: z.uuid(),
        title: z.string().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
    })
    .strict();
export type Graph = z.output<typeof GraphSchema>;
