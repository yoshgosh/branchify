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
    const [showBranchifyIcon, setShowBranchifyIcon] = useState(true);

    useEffect(() => {
        dispatch(listGraphsThunk());
    }, [dispatch]);

    const handleExpand = () => {
        setShowBranchifyIcon(true);
        setCollapsed(false);
    };

    const handleCollapse = () => {
        setShowBranchifyIcon(true);
        setCollapsed(true);
    };

    const handleExpandFromEmptyArea = (event: MouseEvent<HTMLDivElement>) => {
        if (!collapsed) return;
        if (event.target !== event.currentTarget) return;
        handleExpand();
    };

    const handleMouseEnter = () => {
        if (!collapsed) return;
        setShowBranchifyIcon(false);
    };

    const handleMouseLeave = () => {
        if (!collapsed) return;
        setShowBranchifyIcon(true);
    };

    return (
        <div
            className={`relative z-10 h-full shrink-0 bg-base-1 flex flex-col transition-[width] duration-200 ${
                collapsed ? 'w-14' : 'w-64'
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <SidebarHeader
                collapsed={collapsed}
                showBranchifyIcon={showBranchifyIcon}
                onCollapse={handleCollapse}
                onExpand={handleExpand}
            />
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
