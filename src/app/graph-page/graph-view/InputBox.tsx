'use client';

import { useState, useRef, useEffect } from 'react';

const MAX_TEXTAREA_HEIGHT = 300;

interface InputBoxProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
    canSubmit: boolean;
    placeholder?: string;
}

export default function InputBox({
    value,
    onChange,
    onSubmit,
    canSubmit,
    placeholder = 'Ask a question...',
}: InputBoxProps) {
    const [isComposing, setIsComposing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleSend = () => {
        const trimmed = value.trim();
        if (trimmed && canSubmit) {
            onSubmit(trimmed);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
            e.preventDefault();
            handleSend();
        }
    };

    const resizeTextarea = () => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            const nextHeight = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT);
            el.style.height = `${nextHeight}px`;
            el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
        }
    };

    useEffect(() => {
        resizeTextarea();
    }, [value]);

    return (
        <div className="w-full px-4 pb-8">
            <div className="border border-base-3 rounded-[20px] w-full bg-base-1 gap-1 shadow-lg">
                <textarea
                    ref={textareaRef}
                    className="w-full px-4 pt-3 bg-transparent resize-none outline-none"
                    rows={1}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    placeholder={placeholder}
                />
                <div className="flex justify-end items-center gap-2 px-2 pb-2">
                    <button
                        onClick={handleSend}
                        disabled={!canSubmit}
                        className="w-[30px] h-[30px] rounded-full bg-base-9 text-base-0 flex items-center justify-center disabled:opacity-50"
                    >
                        {/* Send icon placeholder */}
                    </button>
                </div>
            </div>
        </div>
    );
}
