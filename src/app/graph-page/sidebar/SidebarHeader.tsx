'use client';

import { useAppDispatch } from '@/client/store/store';
import { openPane } from '@/client/store/usecases/panes/open-pane';
import { BranchifyIcon } from '@/app/components/BranchifyIcon';

export default function SidebarHeader() {
    const dispatch = useAppDispatch();

    const handleClick = (e: React.MouseEvent) => {
        const forceAdd = e.ctrlKey || e.metaKey;
        dispatch(openPane(undefined, forceAdd));
    };

    return (
        <div className="p-4 px-6 cursor-pointer" onClick={handleClick}>
            <BranchifyIcon size={30} color="var(--color-base-9)" />
        </div>
    );
}
