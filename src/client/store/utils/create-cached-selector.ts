type Selector<TState, TResult> = (state: TState) => TResult;
type SelectorFactory<TState, TParam, TResult> = (param: TParam) => Selector<TState, TResult>;

export function createCachedSelector<TState, TParam extends string, TResult>(
    factory: (param: TParam) => Selector<TState, TResult>,
    maxCacheSize: number = 10
): SelectorFactory<TState, TParam, TResult> {
    const cache = new Map<TParam, Selector<TState, TResult>>();

    return (param: TParam) => {
        if (cache.has(param)) {
            // LRU対応：使われたら末尾に移動
            const selector = cache.get(param)!;
            cache.delete(param);
            cache.set(param, selector);
            return selector;
        }

        if (cache.size >= maxCacheSize) {
            // LRU対応：最も古く使われたキー（先頭）を削除
            const oldestKey = cache.keys().next().value;
            if (oldestKey) {
                cache.delete(oldestKey);
            }
        }

        const selector = factory(param);
        cache.set(param, selector);
        return selector;
    };
}