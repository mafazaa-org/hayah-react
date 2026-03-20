import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  /** Callback invoked when the sentinel element becomes visible */
  onLoadMore: () => void;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Whether a load is currently in progress */
  isLoading: boolean;
  /** IntersectionObserver rootMargin (default: '200px') */
  rootMargin?: string;
  /** IntersectionObserver threshold (default: 0) */
  threshold?: number;
}

/**
 * Hook for infinite scroll using IntersectionObserver.
 * Returns a ref to attach to a sentinel element at the bottom of the list.
 *
 * Usage:
 * ```tsx
 * const sentinelRef = useInfiniteScroll({
 *   onLoadMore: () => fetchNextPage(),
 *   hasMore,
 *   isLoading,
 * });
 *
 * <div>
 *   {items.map(item => <Item key={item.id} />)}
 *   <div ref={sentinelRef} />
 * </div>
 * ```
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = '200px',
  threshold = 0,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  // Keep the callback ref fresh without re-creating the observer
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMoreRef.current();
      }
    },
    [hasMore, isLoading]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin,
      threshold,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect, rootMargin, threshold]);

  return sentinelRef;
}
