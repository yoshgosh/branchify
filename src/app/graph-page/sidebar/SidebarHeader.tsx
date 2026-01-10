'use client';

import { useAppDispatch } from '@/client/store/store';
import { openPane } from '@/client/store/use-cases/panes/open-pane';
import { BranchifyLogo } from '@/app/components/BranchifyLogo';

export default function SidebarHeader() {
    const dispatch = useAppDispatch();

    const handleClick = (e: React.MouseEvent) => {
        const forceAdd = e.ctrlKey || e.metaKey;
        dispatch(openPane(undefined, forceAdd));
    };

    return (
        <div className="p-4 px-6 cursor-pointer" onClick={handleClick}>
            <BranchifyLogo width={18} height={30} color="var(--color-graph-head)" />
        </div>
    );
}
