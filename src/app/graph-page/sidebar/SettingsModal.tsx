'use client';

import { useState, useEffect } from 'react';
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
            setError('APIキーは sk- で始まる必要があります');
            return;
        }
        setLoading(true);
        try {
            await dispatch(updateMeThunk({ data: { openaiApiKey: apiKey } })).unwrap();
            setApiKey('');
        } catch (e) {
            setError(e instanceof Error ? e.message : '保存に失敗しました');
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
                className="w-full max-w-md rounded-lg bg-base-2 p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="mb-4 text-lg font-semibold text-base-9">設定</h2>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-base-7">OpenAI API Key</label>
                    {me?.openaiApiKeyMasked && (
                        <p className="text-xs text-base-5">現在のキー: {me.openaiApiKeyMasked}</p>
                    )}
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full rounded border border-base-4 bg-base-1 px-3 py-2 text-sm text-base-9 placeholder:text-base-5 focus:border-base-6 focus:outline-none"
                    />
                    {error && <p className="text-xs text-red-500">{error}</p>}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded px-4 py-2 text-sm text-base-6 hover:bg-base-3"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !apiKey}
                        className="cursor-pointer rounded bg-base-8 px-4 py-2 text-sm text-base-1 hover:bg-base-7 disabled:opacity-50"
                    >
                        {loading ? '保存中...' : '保存'}
                    </button>
                </div>
            </div>
        </div>
    );
}
