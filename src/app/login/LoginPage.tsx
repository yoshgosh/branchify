'use client';

import { signIn } from 'next-auth/react';
import { BranchifyLogo } from '@/app/components/BranchifyLogo';
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-base-1">
            <div className="flex flex-col items-center gap-8">
                <BranchifyLogo width={48} height={80} color="var(--color-base-9)" />
                <h1 className="text-2xl font-semibold tracking-tight text-base-9">Branchify</h1>
                <button
                    onClick={() => signIn('google')}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-base-4 bg-base-2 px-5 py-3 text-sm font-medium text-base-9 transition-colors hover:bg-base-3"
                >
                    <FcGoogle size={18} />
                    Googleでログイン
                </button>
            </div>
        </div>
    );
}
