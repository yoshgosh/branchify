import { useCallback, useSyncExternalStore } from 'react';

const QUERY = '(prefers-color-scheme: dark)';

export function useDarkMode() {
    const subscribe = useCallback((onStoreChange: () => void) => {
        const mq = window.matchMedia(QUERY);
        mq.addEventListener('change', onStoreChange);
        return () => mq.removeEventListener('change', onStoreChange);
    }, []);

    const getSnapshot = useCallback(() => window.matchMedia(QUERY).matches, []);

    const getServerSnapshot = useCallback(() => false, []);

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
