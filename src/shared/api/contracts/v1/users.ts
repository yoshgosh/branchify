import { z } from 'zod';
import { UserSchema } from '@/shared/entities/user';

// ----- request body -----
export const UpdateMeBodySchema = z
    .object({
        data: UserSchema.partial().pick({ openaiApiKey: true }).strict(),
    })
    .strict()
    .refine((body) => !body.data.openaiApiKey || body.data.openaiApiKey.startsWith('sk-'), {
        message: 'APIキーは sk- で始まる必要があります',
        path: ['data', 'openaiApiKey'],
    });
export type UpdateMeBody = z.infer<typeof UpdateMeBodySchema>;

// ----- response body -----
export const GetMeResSchema = z
    .object({
        user: UserSchema,
    })
    .strict();
export type GetMeRes = z.infer<typeof GetMeResSchema>;

export const UpdateMeResSchema = z
    .object({
        user: UserSchema,
    })
    .strict();
export type UpdateMeRes = z.infer<typeof UpdateMeResSchema>;
