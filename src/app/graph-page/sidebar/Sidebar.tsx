'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/client/store/store';
import { listGraphsThunk } from '@/client/store/features/graphs/thunks';
import SidebarHeader from './SidebarHeader';
import GraphMenu from './GraphMenu';
import UserMenu from './UserMenu';

export default function Sidebar() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(listGraphsThunk());
    }, [dispatch]);

    return (
        <div className="w-64 shrink-0 h-full bg-base-1 flex flex-col">
            <SidebarHeader />
            <div className="flex-1 overflow-y-auto">
                <GraphMenu />
            </div>
            <UserMenu />
        </div>
    );
}