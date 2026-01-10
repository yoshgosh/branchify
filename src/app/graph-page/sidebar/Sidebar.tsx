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
        <div className="w-64 flex-shrink-0 h-full bg-bg-muted">
            <SidebarHeader />
            <GraphMenu />
            <UserMenu />
        </div>
    );
}
