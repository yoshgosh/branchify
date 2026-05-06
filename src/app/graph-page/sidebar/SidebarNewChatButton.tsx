'use client';

import { FaCirclePlus } from 'react-icons/fa6';
import { useAppDispatch } from '@/client/store/store';
import { switchGraph } from '@/client/store/usecases/view/switch-graph';

export default function SidebarNewChatButton() {
    const dispatch = useAppDispatch();

    const handleClick = () => {
        dispatch(switchGraph(null));
    };

    return (
        <div className="px-2 pb-2">
            <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm cursor-pointer hover:bg-base-3"
                onClick={handleClick}
            >
                <FaCirclePlus className="shrink-0" size={16} />
                <span>New Chat</span>
            </button>
        </div>
    );
}
