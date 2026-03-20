import { useEffect, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

type MetricCallback = (metric: PerformanceMetric) => void;

/**
 * Hook that tracks key Web Vitals using the Performance API.
 *
 * Reports Largest Contentful Paint (LCP), First Input Delay (FID),
 * Cumulative Layout Shift (CLS), and First Contentful Paint (FCP).
 *
 * Only active in development mode — a no-op in production.
 *
 * @param onMetric Optional callback for each metric (defaults to console.log).
 */
export function usePerformanceMonitor(onMetric?: MetricCallback): void {
  const callbackRef = useRef(onMetric);
  callbackRef.current = onMetric;

  useEffect(() => {
    // Only track in development
    if (import.meta.env.PROD) return;
    if (typeof PerformanceObserver === 'undefined') return;

    const report = (metric: PerformanceMetric) => {
      if (callbackRef.current) {
        callbackRef.current(metric);
      } else {
        console.log(
          `[Perf] ${metric.name}: ${metric.value.toFixed(1)}ms (${metric.rating})`
        );
      }
    };

    const observers: PerformanceObserver[] = [];

    // LCP – Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const last = entries[entries.length - 1];
        if (last) {
          const value = last.startTime;
          report({
            name: 'LCP',
            value,
            rating: value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor',
          });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(lcpObserver);
    } catch { /* unsupported */ }

    // FID – First Input Delay
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const value = (entry as PerformanceEventTiming).processingStart - entry.startTime;
          report({
            name: 'FID',
            value,
            rating: value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor',
          });
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      observers.push(fidObserver);
    } catch { /* unsupported */ }

    // CLS – Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!layoutShift.hadRecentInput && layoutShift.value) {
            clsValue += layoutShift.value;
            report({
              name: 'CLS',
              value: clsValue,
              rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor',
            });
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      observers.push(clsObserver);
    } catch { /* unsupported */ }

    // FCP – First Contentful Paint
    try {
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const fcp = entries.find(e => e.name === 'first-contentful-paint');
        if (fcp) {
          report({
            name: 'FCP',
            value: fcp.startTime,
            rating: fcp.startTime <= 1800 ? 'good' : fcp.startTime <= 3000 ? 'needs-improvement' : 'poor',
          });
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
      observers.push(fcpObserver);
    } catch { /* unsupported */ }

    return () => {
      observers.forEach(o => o.disconnect());
    };
  }, []);
}
