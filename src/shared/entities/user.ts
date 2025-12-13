import { z } from "zod";

export const UserSchema = z
    .object({
        userId: z.uuid(),
        name: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
    })
    .strict();
export type User = z.output<typeof UserSchema>;