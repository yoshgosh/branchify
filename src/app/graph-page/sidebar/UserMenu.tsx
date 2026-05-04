'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import SettingsModal from './SettingsModal';

export default function UserMenu() {
    const { data: session } = useSession();
    const [settingsOpen, setSettingsOpen] = useState(false);

    if (!session?.user) return null;

    const { name, image } = session.user;

    return (
        <div className="mt-auto p-4">
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
                onClick={() => setSettingsOpen(true)}
                className="w-full cursor-pointer rounded px-2 py-1 text-left text-xs text-base-6 transition-colors hover:bg-base-3 hover:text-base-8"
            >
                設定
            </button>
            <button
                onClick={() => signOut()}
                className="w-full cursor-pointer rounded px-2 py-1 text-left text-xs text-base-6 transition-colors hover:bg-base-3 hover:text-base-8"
            >
                ログアウト
            </button>
            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
}
