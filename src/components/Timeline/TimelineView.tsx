import { useEffect, useMemo, useRef, useState } from 'react';
import {
  GanttChart,
  ChevronLeft,
  ChevronRight,
  Clock,
  CircleDot,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertTriangle,
  CalendarOff,
} from 'lucide-react';
import { timelineService } from '../../services/timelineService';
import type { TimelineTask, Dependency } from '../../services/timelineService';
import { PRIORITY_COLORS } from '../../types/task';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TimelineViewProps {
  listId: string;
}

type ZoomLevel = 'day' | 'week' | '2week' | 'month';

const ZOOM_META: Record<ZoomLevel, { label: string; days: number; colWidth: number }> = {
  day: { label: 'يوم', days: 14, colWidth: 48 },
  week: { label: 'أسبوع', days: 42, colWidth: 24 },
  '2week': { label: 'أسبوعان', days: 60, colWidth: 16 },
  month: { label: 'شهر', days: 90, colWidth: 10 },
};

const ZOOM_ORDER: ZoomLevel[] = ['day', 'week', '2week', 'month'];

const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 52;
const TASK_LABEL_WIDTH = 220;

/* ------------------------------------------------------------------ */
/*  Utility helpers                                                    */
/* ------------------------------------------------------------------ */

function startOfDay(d: Date): Date {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TimelineView({ listId }: TimelineViewProps) {
  // ---- State --------------------------------------------------------
  const [zoom, setZoom] = useState<ZoomLevel>('week');
  const [anchorDate, setAnchorDate] = useState(() => startOfDay(new Date()));
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  // ---- Derived values -----------------------------------------------
  const { days: totalDays, colWidth } = ZOOM_META[zoom];

  const rangeStart = useMemo(() => {
    // Centre the anchor in the visible range
    return addDays(anchorDate, -Math.floor(totalDays / 2));
  }, [anchorDate, totalDays]);

  const rangeEnd = useMemo(() => addDays(rangeStart, totalDays), [rangeStart, totalDays]);

  // Build array of dates for columns
  const columns = useMemo(() => {
    const cols: Date[] = [];
    for (let i = 0; i < totalDays; i++) {
      cols.push(addDays(rangeStart, i));
    }
    return cols;
  }, [rangeStart, totalDays]);

  const todayOffset = useMemo(() => {
    const today = startOfDay(new Date());
    const off = diffDays(rangeStart, today);
    if (off < 0 || off >= totalDays) return null;
    return off;
  }, [rangeStart, totalDays]);

  // ---- Data fetching ------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [taskData, depData] = await Promise.all([
          timelineService.getTimelineTasks(listId, rangeStart, rangeEnd),
          timelineService.getDependencies(listId),
        ]);
        if (cancelled) return;
        setTasks(taskData);
        setDependencies(depData);
      } catch (err) {
        console.error('Failed to load timeline data', err);
        if (!cancelled) setError('فشل تحميل بيانات الخط الزمني');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [listId, rangeStart.getTime(), rangeEnd.getTime()]);

  // ---- Navigation ---------------------------------------------------
  const navigate = (dir: -1 | 1) => {
    const step = Math.max(7, Math.floor(totalDays / 3));
    setAnchorDate(prev => addDays(prev, dir * step));
  };

  const goToday = () => setAnchorDate(startOfDay(new Date()));

  const zoomIn = () => {
    const idx = ZOOM_ORDER.indexOf(zoom);
    if (idx > 0) setZoom(ZOOM_ORDER[idx - 1]);
  };

  const zoomOut = () => {
    const idx = ZOOM_ORDER.indexOf(zoom);
    if (idx < ZOOM_ORDER.length - 1) setZoom(ZOOM_ORDER[idx + 1]);
  };

  // ---- Bar positioning helpers ------------------------------------
  const barForTask = (t: TimelineTask) => {
    const s = startOfDay(new Date(t.startDate));
    const e = startOfDay(new Date(t.endDate));
    const leftDays = diffDays(rangeStart, s);
    const dur = Math.max(1, diffDays(s, e));
    return {
      left: leftDays * colWidth,
      width: dur * colWidth,
    };
  };

  // ---- Priority colour helper -------------------------------------
  const barColor = (priority?: string) => {
    switch (priority) {
      case 'critical': return { bg: 'bg-red-500/80', border: 'border-red-400' };
      case 'high': return { bg: 'bg-amber-500/80', border: 'border-amber-400' };
      case 'medium': return { bg: 'bg-sky-500/80', border: 'border-sky-400' };
      default: return { bg: 'bg-slate-500/70', border: 'border-slate-400' };
    }
  };

  // ---- Status indicator dot colour --------------------------------
  const statusDotColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-emerald-400';
      case 'in-progress': return 'bg-sky-400';
      default: return 'bg-slate-500';
    }
  };

  // ---- Build task→row index map for dependency arrows ---------------
  const taskRowIndex = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t, i) => map.set(t.id, i));
    return map;
  }, [tasks]);

  // ---- Dependency arrow paths (SVG) ---------------------------------
  const depPaths = useMemo(() => {
    return dependencies
      .map(dep => {
        const srcTask = tasks.find(t => t.id === dep.source);
        const tgtTask = tasks.find(t => t.id === dep.target);
        if (!srcTask || !tgtTask) return null;

        const srcBar = barForTask(srcTask);
        const tgtBar = barForTask(tgtTask);
        const srcRow = taskRowIndex.get(srcTask.id) ?? 0;
        const tgtRow = taskRowIndex.get(tgtTask.id) ?? 0;

        // Start from end of source bar, mid-height
        const x1 = srcBar.left + srcBar.width;
        const y1 = srcRow * ROW_HEIGHT + ROW_HEIGHT / 2;

        // End at start of target bar, mid-height
        const x2 = tgtBar.left;
        const y2 = tgtRow * ROW_HEIGHT + ROW_HEIGHT / 2;

        // Bezier control points
        const cpx = (x1 + x2) / 2;

        return { id: dep.id, path: `M ${x1} ${y1} C ${cpx} ${y1}, ${cpx} ${y2}, ${x2} ${y2}`, x2, y2 };
      })
      .filter(Boolean) as { id: string; path: string; x2: number; y2: number }[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencies, tasks, rangeStart.getTime(), colWidth]);

  // ---- Grid total width ---------------------------------------------
  const gridWidth = totalDays * colWidth;

  // ---- Render -------------------------------------------------------
  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
      {/* ===== Toolbar ===== */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2">
          <GanttChart size={18} className="text-slate-300" />
          <span className="text-sm text-slate-200 font-medium">عرض الخط الزمني</span>
          <span className="flex items-center gap-1 text-xs text-slate-400 mr-3">
            <CircleDot size={10} className="text-emerald-400" />
            اليوم:
            <span className="text-slate-200">
              {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom === ZOOM_ORDER[0]}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
              title="تكبير"
            >
              <ZoomIn size={14} />
            </button>

            <div className="inline-flex rounded-full bg-slate-900 border border-slate-700 p-1 text-xs">
              {ZOOM_ORDER.map(z => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZoom(z)}
                  className={`px-3 py-1 rounded-full transition-colors ${zoom === z ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                >
                  {ZOOM_META[z].label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom === ZOOM_ORDER[ZOOM_ORDER.length - 1]}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
              title="تصغير"
            >
              <ZoomOut size={14} />
            </button>
          </div>

          {/* Date navigation */}
          <div className="flex items-center gap-1 text-xs text-slate-200">
            <button type="button" onClick={() => navigate(1)} className="p-1 rounded hover:bg-slate-800">
              <ChevronRight size={14} />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="px-2 py-1 rounded border border-sky-500/50 text-sky-300 hover:bg-sky-500/10"
            >
              اليوم
            </button>
            <button type="button" onClick={() => navigate(-1)} className="p-1 rounded hover:bg-slate-800">
              <ChevronLeft size={14} />
            </button>
            <span className="mr-2 text-slate-400 text-xs flex items-center gap-1">
              <Clock size={12} />
              {formatShortDate(rangeStart)} – {formatShortDate(rangeEnd)}
            </span>
          </div>
        </div>
      </div>

      {/* ===== Error banner ===== */}
      {error && (
        <div className="px-4 py-2 bg-red-950/40 border-b border-red-800 text-xs text-red-200 flex items-center gap-2">
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {/* ===== Body ===== */}
      <div className="flex-1 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70">
            <Loader2 size={32} className="animate-spin text-sky-400" />
          </div>
        )}

        {!isLoading && tasks.length === 0 && !error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-slate-500 gap-3">
            <CalendarOff size={48} className="text-slate-600" />
            <p className="text-sm">لا توجد مهام ذات تواريخ في هذا النطاق</p>
          </div>
        )}

        {/* ===== Scrollable grid ===== */}
        <div ref={gridRef} className="h-full overflow-auto flex">
          {/* --- Task label column (frozen) --- */}
          <div
            className="shrink-0 border-l border-slate-800 bg-slate-900/80 z-10 sticky right-0"
            style={{ width: TASK_LABEL_WIDTH }}
          >
            {/* Header */}
            <div
              className="flex items-center px-3 text-xs font-semibold text-slate-400 border-b border-slate-800"
              style={{ height: HEADER_HEIGHT }}
            >
              المهام ({tasks.length})
            </div>

            {/* Task labels */}
            {tasks.map(task => {
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-2 px-3 border-b border-slate-800/60 text-xs text-slate-200 truncate"
                  style={{ height: ROW_HEIGHT }}
                  title={task.title}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotColor(task.status)}`} />
                  <span
                    className="w-1 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || '#64748b' }}
                  />
                  <span className="truncate">{task.title}</span>
                </div>
              );
            })}
          </div>

          {/* --- Date grid --- */}
          <div className="flex-1 overflow-x-auto">
            <div className="relative" style={{ width: gridWidth, minHeight: '100%' }}>
              {/* Column headers */}
              <div className="sticky top-0 z-10 flex border-b border-slate-800 bg-slate-900/90" style={{ height: HEADER_HEIGHT }}>
                {columns.map((date, i) => {
                  const isToday = todayOffset === i;
                  const isSunday = date.getDay() === 0;
                  const showLabel = zoom === 'day' || isSunday || date.getDate() === 1;
                  return (
                    <div
                      key={i}
                      className={`shrink-0 flex flex-col items-center justify-center text-[10px] border-l border-slate-800/40 ${isToday ? 'bg-emerald-500/10' : ''
                        } ${isSunday ? 'bg-slate-800/20' : ''}`}
                      style={{ width: colWidth }}
                    >
                      {showLabel && (
                        <>
                          <span className={`${isToday ? 'text-emerald-300 font-bold' : 'text-slate-500'}`}>
                            {date.getDate()}
                          </span>
                          {(date.getDate() === 1 || (zoom === 'day' && i === 0)) && (
                            <span className="text-[8px] text-slate-600">
                              {date.toLocaleDateString('ar-EG', { month: 'short' })}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Task rows + bars */}
              <div className="relative" style={{ height: tasks.length * ROW_HEIGHT }}>
                {/* Grid lines (vertical) */}
                {columns.map((date, i) => {
                  const isToday = todayOffset === i;
                  const isSunday = date.getDay() === 0;
                  return (
                    <div
                      key={`vl-${i}`}
                      className={`absolute top-0 bottom-0 border-l ${isToday
                          ? 'border-emerald-500/40 z-5'
                          : isSunday
                            ? 'border-slate-700/50'
                            : 'border-slate-800/30'
                        }`}
                      style={{ right: 'auto', left: i * colWidth, width: 0 }}
                    />
                  );
                })}

                {/* Today highlight stripe */}
                {todayOffset !== null && (
                  <div
                    className="absolute top-0 bottom-0 bg-emerald-500/5 z-1"
                    style={{ left: todayOffset * colWidth, width: colWidth }}
                  />
                )}

                {/* Horizontal row lines */}
                {tasks.map((_, i) => (
                  <div
                    key={`hl-${i}`}
                    className="absolute w-full border-b border-slate-800/30"
                    style={{ top: (i + 1) * ROW_HEIGHT }}
                  />
                ))}

                {/* Task bars */}
                {tasks.map((task, rowIdx) => {
                  const { left, width } = barForTask(task);
                  const { bg, border } = barColor(task.priority);

                  // Clamp bar if it starts before or extends beyond the visible area
                  const clampedLeft = Math.max(0, left);
                  const clampedWidth = Math.min(gridWidth - clampedLeft, width - (clampedLeft - left));

                  if (clampedWidth <= 0) return null;

                  // Determine completion label
                  const statusLabel =
                    task.status === 'done'
                      ? 'مكتمل'
                      : task.status === 'in-progress'
                        ? 'جاري'
                        : '';

                  return (
                    <div
                      key={task.id}
                      className={`absolute rounded-md border ${bg} ${border} flex items-center px-2 text-[10px] text-white/90 font-medium truncate cursor-default
                        transition-shadow hover:shadow-lg hover:shadow-sky-500/10 hover:brightness-110 group`}
                      style={{
                        left: clampedLeft,
                        top: rowIdx * ROW_HEIGHT + 6,
                        width: clampedWidth,
                        height: ROW_HEIGHT - 12,
                      }}
                      title={`${task.title}\n${formatShortDate(new Date(task.startDate))} → ${formatShortDate(new Date(task.endDate))}`}
                    >
                      {clampedWidth > 60 && <span className="truncate">{task.title}</span>}
                      {statusLabel && clampedWidth > 120 && (
                        <span className="mr-auto text-[9px] opacity-70 shrink-0">{statusLabel}</span>
                      )}
                    </div>
                  );
                })}

                {/* Dependency arrows (SVG overlay) */}
                {depPaths.length > 0 && (
                  <svg
                    className="absolute inset-0 pointer-events-none z-4"
                    width={gridWidth}
                    height={tasks.length * ROW_HEIGHT}
                  >
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="8"
                        markerHeight="6"
                        refX="8"
                        refY="3"
                        orient="auto"
                      >
                        <polygon points="0 0, 8 3, 0 6" fill="rgba(148,163,184,0.6)" />
                      </marker>
                    </defs>
                    {depPaths.map(d => (
                      <path
                        key={d.id}
                        d={d.path}
                        fill="none"
                        stroke="rgba(148,163,184,0.35)"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        markerEnd="url(#arrowhead)"
                      />
                    ))}
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Footer ===== */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-900/40 text-[11px] text-slate-500 shrink-0">
        <span>{tasks.length} مهمة</span>
        <span>{dependencies.length} تبعية</span>
        <span>
          {formatShortDate(rangeStart)} – {formatShortDate(rangeEnd)}
        </span>
      </div>
    </div>
  );
}
