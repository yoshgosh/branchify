import { z } from 'zod';

export const UserSchema = z
    .object({
        userId: z.uuid(),
        name: z.string(),
        email: z.string().email(),
        emailVerified: z.date().nullable(),
        image: z.string().nullable(),
        openaiApiKey: z.string().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
    })
    .strict();
export type User = z.output<typeof UserSchema>;
