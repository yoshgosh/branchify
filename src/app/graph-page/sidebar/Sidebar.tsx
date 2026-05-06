'use client';

import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { useAppDispatch } from '@/client/store/store';
import { listGraphsThunk } from '@/client/store/features/graphs/thunks';
import SidebarHeader from './SidebarHeader';
import SidebarNewChatButton from './SidebarNewChatButton';
import GraphMenu from './GraphMenu';
import UserMenu from './UserMenu';

export default function Sidebar() {
    const dispatch = useAppDispatch();
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        dispatch(listGraphsThunk());
    }, [dispatch]);

    const handleExpandFromEmptyArea = (event: MouseEvent<HTMLDivElement>) => {
        if (!collapsed) return;
        if (event.target !== event.currentTarget) return;
        setCollapsed(false);
    };

    return (
        <div
            className={`h-full shrink-0 bg-base-1 flex flex-col transition-[width] duration-200 ${
                collapsed ? 'w-14' : 'w-64'
            }`}
        >
            <SidebarHeader collapsed={collapsed} onToggleCollapsed={() => setCollapsed((prev) => !prev)} />
            <SidebarNewChatButton collapsed={collapsed} />
            {collapsed ? (
                <div className="flex-1" onClick={handleExpandFromEmptyArea} />
            ) : (
                <div className="flex-1 overflow-y-auto">
                    <GraphMenu />
                </div>
            )}
            <UserMenu collapsed={collapsed} />
        </div>
    );
}
