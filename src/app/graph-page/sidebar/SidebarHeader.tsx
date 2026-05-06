'use client';

import { useAppDispatch } from '@/client/store/store';
import { switchGraph } from '@/client/store/usecases/view/switch-graph';
import { BranchifyIcon } from '@/app/components/BranchifyIcon';
import { FiSidebar } from "react-icons/fi";

interface SidebarHeaderProps {
    collapsed: boolean;
    onToggleCollapsed: () => void;
}

export default function SidebarHeader({ collapsed, onToggleCollapsed }: SidebarHeaderProps) {
    const dispatch = useAppDispatch();

    const handleClick = () => {
        dispatch(switchGraph(null));
    };

    if (collapsed) {
        return (
            <div className="overflow-hidden p-2">
                <div className="flex w-10 items-start justify-start">
                    <button
                        className="flex h-10 w-10 items-center justify-center rounded-lg cursor-pointer hover:bg-base-3"
                        onClick={onToggleCollapsed}
                        aria-label="Expand sidebar"
                        title="Expand sidebar"
                    >
                        <FiSidebar size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden p-2">
            <div className="flex w-60 items-start justify-between gap-2">
                <button
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg cursor-pointer"
                    onClick={handleClick}
                    aria-label="Start new chat"
                    title="New Chat"
                >
                    <BranchifyIcon size={25} color="var(--color-base-9)" />
                </button>
                <button
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg cursor-pointer hover:bg-base-3"
                    onClick={onToggleCollapsed}
                    aria-label="Collapse sidebar"
                    title="Collapse sidebar"
                >
                    <FiSidebar size={18} />
                </button>
            </div>
        </div>
    );
}
