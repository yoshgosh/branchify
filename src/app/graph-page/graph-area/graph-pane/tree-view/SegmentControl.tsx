import { LayoutMode } from './models';

interface SegmentControlProps {
    value: LayoutMode;
    onChange: (value: LayoutMode) => void;
}

const LAYOUT_MODE_OPTIONS: { value: LayoutMode; label: string }[] = [
  { value: 'optimized', label: 'Optimized' },
  { value: 'rt', label: 'RT' },
];

export default function SegmentControl({ value, onChange }: SegmentControlProps) {

    return (
        <div
            style={{
                display: 'flex',
                backgroundColor: 'var(--color-bg-muted)',
                borderRadius: '6px',
                padding: '2px',
                gap: '2px',
            }}
        >
            {LAYOUT_MODE_OPTIONS.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 500,
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        backgroundColor: value === option.value ? 'var(--color-bg)' : 'transparent',
                        color:
                            value === option.value
                                ? 'var(--color-text)'
                                : 'var(--color-text-muted)',
                        boxShadow: value === option.value ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none',
                    }}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}