'use client';

import { useEffect, useRef, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { FiChevronRight } from 'react-icons/fi';
import SettingsModal from './SettingsModal';
import UserMenuPopover from './UserMenuPopover';

interface UserMenuProps {
    collapsed: boolean;
}

export default function UserMenu({ collapsed }: UserMenuProps) {
    const { data: session } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [menuOpen]);

    if (!session?.user) return null;

    const { name, image } = session.user;

    const avatar = image ? (
        <Image src={image} alt={name ?? ''} width={24} height={24} className="shrink-0 rounded-full" />
    ) : (
        <div className="h-6 w-6 shrink-0 rounded-full bg-base-4" />
    );

    const handleOpenSettings = () => {
        setMenuOpen(false);
        setSettingsOpen(true);
    };

    const handleSignOut = async () => {
        setMenuOpen(false);
        await signOut();
    };

    return (
        <div ref={containerRef} className="relative mt-auto overflow-visible p-2">
            {menuOpen && (
                <UserMenuPopover onOpenSettings={handleOpenSettings} onSignOut={handleSignOut} />
            )}

            <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className={`flex h-10 items-center overflow-hidden rounded-lg transition-colors hover:bg-base-3 ${
                    collapsed ? 'w-10 justify-center' : 'w-60 pr-2'
                }`}
                title={name ?? ''}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Open user menu"
            >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                    {avatar}
                </span>
                {!collapsed && (
                    <>
                        <span className="min-w-0 flex-1 truncate whitespace-nowrap text-left text-sm text-base-8">
                            {name}
                        </span>
                        <FiChevronRight
                            size={16}
                            className={`shrink-0 text-base-6 transition-transform ${menuOpen ? 'rotate-[-90deg]' : ''}`}
                        />
                    </>
                )}
            </button>

            <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
}
