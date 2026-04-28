import { useScrollRegistry } from './useScrollRegistry';
import { useScrollObserver } from './useScrollObserver';
import { useCachedCallback } from './useCachedCallback';

export function useScroll() {
    const registry = useScrollRegistry();
    const observer = useScrollObserver();

    const registerElementRef = useCachedCallback((id: string) => {
        const reg = registry.registerElementRef(id);
        const obs = observer.registerElementRef(id);
        return (el: HTMLElement | null) => {
            reg(el);
            obs(el);
        };
    });

    return {
        scrollToElement: registry.scrollToElement,
        resetContainer: registry.resetContainer,
        containerRef: registry.containerRef,
        contentRef: registry.contentRef,
        visibleElementIds: observer.visibleElementIds,
        registerElementRef,
    };
}
