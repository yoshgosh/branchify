'use client';

import { FiPlusCircle } from "react-icons/fi";
import { useAppDispatch } from '@/client/store/store';
import { switchGraph } from '@/client/store/usecases/view/switch-graph';

interface SidebarNewChatButtonProps {
    collapsed: boolean;
}

export default function SidebarNewChatButton({ collapsed }: SidebarNewChatButtonProps) {
    const dispatch = useAppDispatch();

    const handleClick = () => {
        dispatch(switchGraph(null));
    };

    return (
        <div className="overflow-hidden px-2 pb-2">
            <button
                className={`flex h-10 items-center overflow-hidden rounded-lg text-sm cursor-pointer hover:bg-base-3 ${
                    collapsed ? 'w-10' : 'w-60 pr-3 text-left'
                }`}
                onClick={handleClick}
                aria-label="New Chat"
                title="New Chat"
            >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <FiPlusCircle className="shrink-0" size={18} />
                </span>
                {!collapsed && <span className="min-w-0 whitespace-nowrap">New Chat</span>}
            </button>
        </div>
    );
}
