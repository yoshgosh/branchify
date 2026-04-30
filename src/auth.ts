import NextAuth, { type DefaultSession } from 'next-auth';
import { authConfig } from './auth.config';
import { db } from '@/server/db';
import * as UserRepo from '@/server/repositories/users/repository';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
        } & DefaultSession['user'];
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    session: { strategy: 'jwt' },
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, trigger }) {
            if (trigger === 'signIn' && user?.email) {
                const d = db();
                let dbUser = await UserRepo.findByEmail(d, user.email);
                if (!dbUser) {
                    dbUser = await UserRepo.create(d, {
                        name: user.name ?? user.email,
                        email: user.email,
                        emailVerified: null,
                        image: user.image ?? null,
                    });
                }
                token.userId = dbUser.userId;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.userId) {
                session.user.id = token.userId as string;
            }
            return session;
        },
    },
});
