import { RefCallback, useRef } from 'react';
import { useCachedCallback } from './useCachedCallback';

type ScrollToOptions = {
    behavior?: 'auto' | 'smooth';
    align?: boolean;
    margin?: number;
};

export function useScrollRegistry() {
    const elements = useRef<Map<string, HTMLElement>>(new Map());
    const waiters = useRef<Map<string, Set<() => void>>>(new Map());
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const registerElementRef = useCachedCallback<RefCallback<HTMLElement>>((id) => {
        return (el) => {
            if (el) {
                elements.current.set(id, el);
                if (waiters.current.has(id)) {
                    for (const resolve of waiters.current.get(id)!) {
                        resolve();
                    }
                    waiters.current.delete(id);
                }
            } else {
                elements.current.delete(id);
            }
        };
    });

    const calculateTargetScrollTop = (id: string, margin: number) => {
        const el = elements.current.get(id);
        const container = containerRef.current;
        const content = contentRef.current;

        if (!el || !container || !content) return 0;

        const elRect = el.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        const elTopInContent = elRect.top - contentRect.top;

        return Math.max(0, elTopInContent - margin);
    };

    const adjustContainer = async (targetScrollTop: number) => {
        const container = containerRef.current;
        const content = contentRef.current;

        if (!container || !content) return 0;

        const minHeight = targetScrollTop + container.clientHeight;
        content.style.minHeight = `${minHeight}px`;

        await new Promise((r) => requestAnimationFrame(r));
    };

    const resetContainer = () => {
        const content = contentRef.current;
        if (content) {
            content.style.minHeight = '';
        }
    };

    const waitForElement = (id: string, timeoutMs: number = 3000): Promise<void> => {
        const el = elements.current.get(id);
        if (el) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout: ref for '${id}' not registered within ${timeoutMs}ms`));
            }, timeoutMs);

            if (!waiters.current.has(id)) {
                waiters.current.set(id, new Set());
            }

            waiters.current.get(id)!.add(() => {
                clearTimeout(timeout);
                resolve();
            });
        });
    };

    const scrollToElement = async (id: string, options: ScrollToOptions = {}) => {
        const { behavior = 'smooth', align = true, margin = 0 } = options;

        try {
            await waitForElement(id);

            const targetTop = calculateTargetScrollTop(id, margin);
            if (align) {
                await adjustContainer(targetTop);
            } else {
                resetContainer();
            }

            containerRef.current?.scrollTo({
                top: targetTop,
                behavior,
            });
        } catch (error) {
            console.warn(error);
        }
    };

    return {
        scrollToElement,
        resetContainer,
        registerElementRef,
        containerRef,
        contentRef,
    };
}
