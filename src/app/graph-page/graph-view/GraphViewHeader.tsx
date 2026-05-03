'use client';

interface GraphViewHeaderProps {
    graphTitle: string | null;
    model: string;
    provider: string;
}

export default function GraphViewHeader({ graphTitle, model, provider }: GraphViewHeaderProps) {
    return (
        <div className="px-4 py-2 bg-base-0 text-sm font-medium text-base-6 flex items-center justify-between">
            <div className="flex items-center gap-x-4">
                <div className="font-medium">{graphTitle || 'New Graph'}</div>
                <div>
                    <span className="px-2 py-0.5">{provider}</span>
                    <span className="px-2 py-0.5">{model}</span>
                </div>
            </div>
        </div>
    );
}
