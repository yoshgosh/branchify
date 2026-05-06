'use client';

interface GraphViewHeaderProps {
    graphTitle: string | null;
    model: string;
    provider: string;
}

export default function GraphViewHeader({ graphTitle, model, provider }: GraphViewHeaderProps) {
    return (
        <div className="p-2 bg-base-0">
            <div className="flex h-10 items-center justify-between px-2">
                <div className="flex items-center gap-x-4">
                    <div className="text-sm font-medium text-base-8">{graphTitle || 'New Graph'}</div>
                    <div className="text-sm font-medium text-base-6">
                        <span className="px-2 py-0.5">{provider}</span>
                        <span className="px-2 py-0.5">{model}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
