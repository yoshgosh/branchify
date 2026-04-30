import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

export const authConfig: NextAuthConfig = {
    providers: [Google],
    pages: {
        signIn: '/',
    },
    callbacks: {
        authorized({ auth, request }) {
            const isLoggedIn = !!auth?.user;
            const { pathname } = request.nextUrl;
            if (pathname === '/' || pathname.startsWith('/api/auth')) return true;
            return isLoggedIn;
        },
    },
};
