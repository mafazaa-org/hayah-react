import { useState, useCallback, useRef, useMemo, useEffect } from 'react';

interface UseVirtualListOptions {
  /** Total number of items in the list */
  itemCount: number;
  /** Height of each item in pixels */
  itemHeight: number;
  /** Number of extra items to render above/below the visible window */
  overscan?: number;
}

interface UseVirtualListReturn {
  /** Ref to attach to the scrollable container */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Total height of the virtualized content (for the spacer) */
  totalHeight: number;
  /** Index of the first visible item to render */
  startIndex: number;
  /** Index of the last visible item to render (exclusive) */
  endIndex: number;
  /** Offset in px for the rendered slice (applied as paddingTop) */
  offsetY: number;
  /** Attach this to the container's onScroll */
  onScroll: () => void;
}

/**
 * Lightweight virtual scrolling hook.
 * Renders only the visible items plus an overscan buffer.
 *
 * Usage:
 * ```tsx
 * const { containerRef, totalHeight, startIndex, endIndex, offsetY, onScroll } = useVirtualList({
 *   itemCount: items.length,
 *   itemHeight: 60,
 * });
 *
 * <div ref={containerRef} onScroll={onScroll} style={{ height: 400, overflow: 'auto' }}>
 *   <div style={{ height: totalHeight, paddingTop: offsetY }}>
 *     {items.slice(startIndex, endIndex).map(item => (
 *       <div key={item.id} style={{ height: 60 }}>{item.name}</div>
 *     ))}
 *   </div>
 * </div>
 * ```
 */
export function useVirtualList({
  itemCount,
  itemHeight,
  overscan = 5,
}: UseVirtualListOptions): UseVirtualListReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Measure container height on mount and resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => setContainerHeight(el.clientHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (el) {
      setScrollTop(el.scrollTop);
    }
  }, []);

  const { startIndex, endIndex, offsetY, totalHeight } = useMemo(() => {
    const total = itemCount * itemHeight;

    const rawStart = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const rawEnd = rawStart + visibleCount;

    const start = Math.max(0, rawStart - overscan);
    const end = Math.min(itemCount, rawEnd + overscan);

    return {
      totalHeight: total,
      startIndex: start,
      endIndex: end,
      offsetY: start * itemHeight,
    };
  }, [itemCount, itemHeight, scrollTop, containerHeight, overscan]);

  return { containerRef, totalHeight, startIndex, endIndex, offsetY, onScroll };
}
