import { z } from 'zod';
import { UserSchema, type User } from '@/shared/entities/user';

export const UserDtoSchema = UserSchema.omit({
    openaiApiKey: true,
    emailVerified: true,
    createdAt: true,
    updatedAt: true,
})
    .extend({
        openaiApiKeyMasked: z.string().nullable(),
        createdAt: z.iso.datetime(),
        updatedAt: z.iso.datetime(),
    })
    .strict();
export type UserDto = z.output<typeof UserDtoSchema>;

export function toUserDto(user: User): UserDto {
    const key = user.openaiApiKey;
    return UserDtoSchema.parse({
        userId: user.userId,
        name: user.name,
        email: user.email,
        image: user.image,
        openaiApiKeyMasked: key ? `sk-...${key.slice(-4)}` : null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    });
}
