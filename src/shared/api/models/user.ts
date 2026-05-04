import { z } from 'zod';
import { UserSchema, type User } from '@/shared/entities/user';

export const UserDtoSchema = UserSchema.extend({
    emailVerified: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
}).strict();
export type UserDto = z.output<typeof UserDtoSchema>;

export function toUserDto(user: User): UserDto {
    return UserDtoSchema.parse({
        ...user,
        emailVerified: user.emailVerified?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    });
}

export function fromUserDto(dto: UserDto): User {
    return UserSchema.parse({
        ...dto,
        emailVerified: dto.emailVerified ? new Date(dto.emailVerified) : null,
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
    });
}
