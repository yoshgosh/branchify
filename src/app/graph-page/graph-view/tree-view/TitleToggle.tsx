interface TitleToggleProps {
    value: boolean;
    onChange: (value: boolean) => void;
}

export default function TitleToggle({ value, onChange }: TitleToggleProps) {
    return (
        <button
            onClick={() => onChange(!value)}
            style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 500,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: value ? 'var(--color-base-0)' : 'var(--color-base-1)',
                color: value ? 'var(--color-base-9)' : 'var(--color-base-6)',
                boxShadow: value ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none',
            }}
        >
            T
        </button>
    );
}
