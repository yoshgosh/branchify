import { RefCallback, useRef } from 'react';
import { useCachedCallback } from './useCachedCallback';

type ScrollToOptions = {
    behavior?: 'auto' | 'smooth';
};

export function useTreeScroll() {
    const elements = useRef<Map<string, HTMLElement>>(new Map());
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const registerElementRef = useCachedCallback<RefCallback<HTMLElement>>((id) => {
        return (el) => {
            if (el) {
                elements.current.set(id, el);
            } else {
                elements.current.delete(id);
            }
        };
    });

    const scrollToElement = (id: string, options: ScrollToOptions = {}) => {
        const { behavior = 'smooth' } = options;

        const el = elements.current.get(id);
        if (!el) return;

        el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior });
    };

    return {
        scrollToElement,
        registerElementRef,
        scrollContainerRef,
    };
}
