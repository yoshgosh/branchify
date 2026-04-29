'use client';

interface GraphPaneHeaderProps {
    graphTitle: string | null;
    model: string;
    provider: string;
    isFocused: boolean;
    onClose: () => void;
}

export default function GraphPaneHeader({
    graphTitle,
    model,
    provider,
    isFocused,
    onClose,
}: GraphPaneHeaderProps) {
    return (
        <div className="px-4 py-2 bg-base-0 text-sm font-medium text-base-6 flex items-center justify-between">
            <div className="flex items-center gap-x-4">
                <div className={`${isFocused ? 'font-bold' : 'font-medium'}`}>
                    {graphTitle || 'New Graph'}
                </div>
                <div>
                    <span className="px-2 py-0.5">{provider}</span>
                    <span className="px-2 py-0.5">{model}</span>
                </div>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="text-lg text-base-6 hover:text-destructive transition"
            >
                ×
            </button>
        </div>
    );
}
