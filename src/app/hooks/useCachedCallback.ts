import { useRef } from 'react';

export function useCachedCallback<T>(create: (key: string) => T): (key: string) => T {
    const cache = useRef<Map<string, T>>(new Map());

    return (key: string) => {
        if (!cache.current.has(key)) {
            const callback = create(key);
            cache.current.set(key, callback);
        }
        return cache.current.get(key)!;
    };
}
