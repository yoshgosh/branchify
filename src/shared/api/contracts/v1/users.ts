import { z } from 'zod';
import { UserDtoSchema } from '@/shared/api/models';

// ----- request body -----
export const UpdateMeBodySchema = z
    .object({
        data: z
            .object({
                openaiApiKey: z.string().min(1).optional(),
            })
            .strict(),
    })
    .strict();
export type UpdateMeBody = z.infer<typeof UpdateMeBodySchema>;

// ----- response body -----
export const GetMeResSchema = z
    .object({
        user: UserDtoSchema,
    })
    .strict();
export type GetMeRes = z.infer<typeof GetMeResSchema>;

export const UpdateMeResSchema = z
    .object({
        user: UserDtoSchema,
    })
    .strict();
export type UpdateMeRes = z.infer<typeof UpdateMeResSchema>;
