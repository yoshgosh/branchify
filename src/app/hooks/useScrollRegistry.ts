import { RefCallback, useRef } from 'react';
import { useCachedCallback } from './useCachedCallback';

type ScrollToOptions = {
    behavior?: 'auto' | 'smooth';
    align?: boolean;
};

export function useScrollRegistry() {
    const elements = useRef<Map<string, HTMLElement | null>>(new Map());
    const waiters = useRef<Map<string, Set<() => void>>>(new Map());
    const containerRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const registerElementRef = useCachedCallback<RefCallback<HTMLElement>>((id) => {
        return (el) => {
            elements.current.set(id, el);

            if (el && waiters.current.has(id)) {
                for (const resolve of waiters.current.get(id)!) {
                    resolve();
                }
                waiters.current.delete(id);
            }
        };
    });

    const adjustContainer = async (id: string) => {
        const el = elements.current.get(id);
        const container = containerRef.current;
        const content = contentRef.current;

        if (!el || !container || !content) return;

        const elRect = el.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();

        const topOffset = elRect.top - contentRect.top;

        const minHeight = topOffset + container.clientHeight;
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
        const { behavior = 'smooth', align = true } = options;
        await waitForElement(id);
        if (align) {
            await adjustContainer(id);
        } else {
            resetContainer();
        }

        const el = elements.current.get(id);
        el?.scrollIntoView({
            behavior,
            block: 'start',
        });
    };

    return {
        scrollToElement,
        resetContainer,
        registerElementRef,
        containerRef,
        contentRef,
    };
}
