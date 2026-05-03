'use client';

import { useAppDispatch } from '@/client/store/store';
import { switchGraph } from '@/client/store/usecases/view/switch-graph';
import { BranchifyIcon } from '@/app/components/BranchifyIcon';

export default function SidebarHeader() {
    const dispatch = useAppDispatch();

    const handleClick = () => {
        dispatch(switchGraph(null));
    };

    return (
        <div className="p-2">
            <button className="p-2 rounded-lg cursor-pointer hover:bg-base-3" onClick={handleClick}>
                <BranchifyIcon size={25} color="var(--color-base-9)" />
            </button>
        </div>
    );
}
