'use client';

import { FiLogOut, FiSettings } from 'react-icons/fi';

type UserMenuPopoverProps = {
    onOpenSettings: () => void;
    onSignOut: () => void;
};

export default function UserMenuPopover({ onOpenSettings, onSignOut }: UserMenuPopoverProps) {
    return (
        <div className="absolute bottom-full left-2 z-20 mb-2 w-60 rounded-2xl border border-base-4 bg-base-2 p-2 shadow-xl">
            <button
                type="button"
                onClick={onOpenSettings}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-base-9 transition-colors hover:bg-base-3"
            >
                <FiSettings size={16} className="shrink-0" />
                <span>Settings</span>
            </button>
            <button
                type="button"
                onClick={onSignOut}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-base-9 transition-colors hover:bg-base-3"
            >
                <FiLogOut size={16} className="shrink-0" />
                <span>Sign out</span>
            </button>
        </div>
    );
}
