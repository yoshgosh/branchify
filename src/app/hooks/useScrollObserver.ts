import { RefCallback, useEffect, useRef, useState } from 'react';
import { useCachedCallback } from './useCachedCallback';

export function useScrollObserver() {
    const [visibleElementIds, setVisibleIds] = useState<string[]>([]);
    const observer = useRef<IntersectionObserver | null>(null);
    const elements = useRef<Map<string, HTMLElement>>(new Map());

    useEffect(() => {
        observer.current = new IntersectionObserver(
            (entries) => {
                setVisibleIds((prev) => {
                    const nextSet = new Set(prev);
                    let changed = false;

                    for (const entry of entries) {
                        const el = entry.target as HTMLElement;
                        const id = el.dataset.scrollId;
                        if (!id) continue;

                        if (entry.isIntersecting) {
                            if (!nextSet.has(id)) {
                                nextSet.add(id);
                                changed = true;
                            }
                        } else {
                            if (nextSet.has(id)) {
                                nextSet.delete(id);
                                changed = true;
                            }
                        }
                    }

                    return changed ? Array.from(nextSet) : prev;
                });
            },
            { threshold: 0.1 }
        );

        elements.current.forEach((el) => {
            observer.current?.observe(el);
        });

        return () => {
            observer.current?.disconnect();
            observer.current = null;
        };
    }, []);

    const observe = useCachedCallback((id: string) => {
        return (el: HTMLElement) => {
            const prevEl = elements.current.get(id);
            if (prevEl === el) return;

            el.dataset.scrollId = id;
            elements.current.set(id, el);

            observer.current?.observe(el);
        };
    });

    const unobserve = useCachedCallback((id: string) => {
        return () => {
            const el = elements.current.get(id);
            if (!el) return;

            observer.current?.unobserve(el);
            elements.current.delete(id);
            setVisibleIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : prev));
        };
    });

    const registerElementRef = useCachedCallback<RefCallback<HTMLElement>>((id) => {
        return (el) => {
            if (el) {
                observe(id)(el);
            } else {
                unobserve(id)();
            }
        };
    });

    return {
        visibleElementIds,
        registerElementRef,
    };
}
