import { z } from 'zod';
import { UserSchema } from '@/shared/entities/user';

export const UserInsertSchema = UserSchema.omit({
    userId: true,
    createdAt: true,
    updatedAt: true,
}).strict();
export type UserInsert = z.output<typeof UserInsertSchema>;
export type UserInsertInput = z.input<typeof UserInsertSchema>;

export const UserUpdateSchema = UserSchema.omit({
    userId: true,
    createdAt: true,
    updatedAt: true,
})
    .partial()
    .strict();
export type UserUpdate = z.output<typeof UserUpdateSchema>;
export type UserUpdateInput = z.input<typeof UserUpdateSchema>;
