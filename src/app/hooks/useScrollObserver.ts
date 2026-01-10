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
                    const set = new Set(prev);
                    let changed = false;

                    for (const entry of entries) {
                        const el = entry.target as HTMLElement;
                        const id = el.dataset.scrollId;
                        if (!id) continue;

                        if (entry.isIntersecting) {
                            if (!set.has(id)) {
                                set.add(id);
                                changed = true;
                            }
                        } else {
                            if (set.has(id)) {
                                set.delete(id);
                                changed = true;
                            }
                        }
                    }

                    return changed ? Array.from(set) : prev;
                });
            },
            { threshold: 0.1 }
        );

        elements.current.forEach((el) => {
            observer.current!.observe(el);
        });

        return () => observer.current?.disconnect();
    }, []);

    const observe = useCachedCallback((id: string) => {
        return (el: HTMLElement) => {
            const prevEl = elements.current.get(id);
            if (prevEl === el) return;

            el.dataset.scrollId = id;
            elements.current.set(id, el);
            if (observer.current) {
                observer.current.observe(el);
            }
        };
    });

    const unobserve = useCachedCallback((id: string) => {
        return () => {
            const prevEl = elements.current.get(id);
            if (!prevEl) return;

            if (observer.current) {
                observer.current.unobserve(prevEl);
            }
            elements.current.delete(id);
            setVisibleIds((prevSet) => {
                if (!prevSet.includes(id)) return prevSet;
                return prevSet.filter((v) => v !== id);
            });
        };
    });

    const registerElementRef = useCachedCallback<RefCallback<HTMLElement>>((id) => {
        return (el) => {
            if (el) {
                observe(id)(el);
            } else {
                unobserve(id);
            }
        };
    });
    return {
        visibleElementIds,
        registerElementRef,
    };
}
