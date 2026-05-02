'use client';

import { useAppDispatch } from '@/client/store/store';
import { switchGraph } from '@/client/store/use-cases/view/switch-graph';
import { BranchifyLogo } from '@/app/components/BranchifyLogo';

export default function SidebarHeader() {
    const dispatch = useAppDispatch();

    const handleClick = () => {
        dispatch(switchGraph(null));
    };

    return (
        <div className="p-4 px-6 cursor-pointer" onClick={handleClick}>
            <BranchifyLogo width={18} height={30} color="var(--color-base-9)" />
        </div>
    );
}
