'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface UserMenuProps {
    collapsed: boolean;
}

export default function UserMenu({ collapsed }: UserMenuProps) {
    const { data: session } = useSession();

    if (!session?.user) return null;

    const { name, image } = session.user;

    const avatar = image ? (
        <Image src={image} alt={name ?? ''} width={24} height={24} className="shrink-0 rounded-full" />
    ) : (
        <div className="h-6 w-6 shrink-0 rounded-full bg-base-4" />
    );

    return (
        <div className="mt-auto overflow-hidden p-2">
            <div
                className={`flex h-10 items-center overflow-hidden rounded-lg ${
                    collapsed ? 'w-10' : 'w-60'
                }`}
                title={name ?? ''}
            >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                    {avatar}
                </span>
                {!collapsed && <span className="min-w-0 whitespace-nowrap text-sm text-base-8">{name}</span>}
            </div>
        </div>
    );
}
