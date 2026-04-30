'use client';

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function UserMenu() {
    const { data: session } = useSession();
    if (!session?.user) return null;

    const { name, image } = session.user;

    return (
        <div className="mt-auto border-t border-base-3 p-4">
            <div className="mb-3 flex items-center gap-2 overflow-hidden">
                {image ? (
                    <Image
                        src={image}
                        alt={name ?? ''}
                        width={24}
                        height={24}
                        className="shrink-0 rounded-full"
                    />
                ) : (
                    <div className="h-6 w-6 shrink-0 rounded-full bg-base-4" />
                )}
                <span className="truncate text-sm text-base-8">{name}</span>
            </div>
            <button
                onClick={() => signOut()}
                className="w-full cursor-pointer rounded px-2 py-1 text-left text-xs text-base-6 transition-colors hover:bg-base-3 hover:text-base-8"
            >
                {/* TODO: React Icon に変更する */}
                ログアウト
            </button>
        </div>
    );
}

