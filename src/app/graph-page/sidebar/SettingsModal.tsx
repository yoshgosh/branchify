'use client';

import { useState, useEffect } from 'react';
import { FiCheckCircle, FiRefreshCw, FiSettings, FiX, FiXCircle } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/client/store/store';
import { getMeThunk, updateMeThunk } from '@/client/store/features/users/thunks';

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function SettingsModal({ open, onClose }: Props) {
    const dispatch = useAppDispatch();
    const me = useAppSelector((state) => state.user.me);
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) dispatch(getMeThunk());
    }, [open, dispatch]);

    if (!open) return null;

    const handleSave = async () => {
        setError(null);
        if (!apiKey.startsWith('sk-')) {
            setError('API key must start with "sk-"');
            return;
        }
        setLoading(true);
        try {
            await dispatch(updateMeThunk({ data: { openaiApiKey: apiKey } })).unwrap();
            setApiKey('');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md rounded-[20px] border border-base-4 bg-base-2 p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-base-6 transition-colors hover:bg-base-3 hover:text-base-9"
                    aria-label="Close settings"
                >
                    <FiX size={18} />
                </button>

                <div className="mb-6 flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center text-base-8">
                        <FiSettings size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-base-9">Settings</h2>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <label className="text-sm font-medium text-base-7">OpenAI API Key</label>
                        <span
                            className={`flex items-center gap-2 text-xs font-medium ${
                                me?.openaiApiKey ? 'text-emerald-600' : 'text-base-5'
                            }`}
                        >
                            {me?.openaiApiKey ? (
                                <FiCheckCircle size={15} className="shrink-0" />
                            ) : (
                                <FiXCircle size={15} className="shrink-0" />
                            )}
                            {me?.openaiApiKey ? 'Registered' : 'Not registered'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="min-w-0 flex-1 rounded-xl border border-base-4 bg-base-1 px-3 py-2.5 text-sm text-base-9 placeholder:text-base-5 focus:border-base-6 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={loading || !apiKey}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-base-8 text-base-1 transition-colors hover:bg-base-7 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Update API key"
                            title="Update API key"
                        >
                            <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="min-h-5">
                        {error && <p className="text-xs text-red-500">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
