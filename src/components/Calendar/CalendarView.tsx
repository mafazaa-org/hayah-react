import { useEffect, useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CircleDot
} from 'lucide-react';
import type { Task } from '../../types/task';
import { taskService } from '../../services/taskService';

interface CalendarViewProps {
  listId: string;
}

type CalendarMode = 'month' | 'week' | 'day';

interface CalendarCell {
  date: Date;
  tasks: Task[];
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

export function CalendarView({ listId }: CalendarViewProps) {
  const [mode, setMode] = useState<CalendarMode>('month');
  const [currentDate, setCurrentDate] = useState(() => startOfDay(new Date()));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute range for current mode
  const { rangeStart, rangeEnd } = useMemo(() => {
    const base = startOfDay(currentDate);
    if (mode === 'day') {
      return { rangeStart: base, rangeEnd: base };
    }
    if (mode === 'week') {
      const day = base.getDay(); // 0-6
      const diffToSunday = day; // Sunday as first day
      const start = new Date(base);
      start.setDate(base.getDate() - diffToSunday);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { rangeStart: start, rangeEnd: end };
    }
    // month
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    return { rangeStart: startOfDay(start), rangeEnd: startOfDay(end) };
  }, [currentDate, mode]);

  // Load tasks for current date range (debounced via effect dependencies)
  useEffect(() => {
    let isMounted = true;
    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const from = rangeStart.toISOString().slice(0, 10);
        const to = rangeEnd.toISOString().slice(0, 10);
        const tasksInRange = await taskService.getTasksByDateRange(listId, from, to);
        if (!isMounted) return;
        setTasks(tasksInRange);
      } catch (err) {
        console.error('Failed to load calendar tasks', err);
        if (isMounted) {
          setError('فشل تحميل مهام التقويم');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchTasks();
    return () => {
      isMounted = false;
    };
  }, [listId, rangeStart.getTime(), rangeEnd.getTime()]);

  const tasksByDateKey = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(task => {
      if (!task.dueDate) return;
      const key = task.dueDate.slice(0, 10);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(task);
    });
    return map;
  }, [tasks]);

  const todayKey = formatDateKey(new Date());

  const buildMonthCells = (): CalendarCell[] => {
    const cells: CalendarCell[] = [];
    const start = new Date(rangeStart);
    const end = new Date(rangeEnd);

    // Determine first grid day (start from Sunday)
    const firstDay = new Date(start);
    const weekday = firstDay.getDay(); // 0-6
    firstDay.setDate(firstDay.getDate() - weekday);

    for (let i = 0; i < 42; i++) {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + i);
      if (date > end && i >= 35) break;
      const key = formatDateKey(date);
      cells.push({
        date,
        tasks: tasksByDateKey.get(key) || []
      });
    }
    return cells;
  };

  const buildWeekCells = (): CalendarCell[] => {
    const cells: CalendarCell[] = [];
    const start = new Date(rangeStart);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const key = formatDateKey(date);
      cells.push({
        date,
        tasks: tasksByDateKey.get(key) || []
      });
    }
    return cells;
  };

  const buildDayTasks = (): CalendarCell => {
    const key = formatDateKey(rangeStart);
    return {
      date: rangeStart,
      tasks: tasksByDateKey.get(key) || []
    };
  };

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (mode === 'day') {
      d.setDate(d.getDate() - 1);
    } else if (mode === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setCurrentDate(startOfDay(d));
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (mode === 'day') {
      d.setDate(d.getDate() + 1);
    } else if (mode === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setCurrentDate(startOfDay(d));
  };

  const handleToday = () => {
    setCurrentDate(startOfDay(new Date()));
  };

  const onTaskDrop = async (taskId: string, targetDate: Date) => {
    const iso = targetDate.toISOString().slice(0, 10);
    try {
      await taskService.updateTaskDueDate(taskId, iso);
      // Update local state optimistically
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? { ...t, dueDate: new Date(iso).toISOString() }
            : t
        )
      );
    } catch (err) {
      console.error('Failed to move task on calendar', err);
      setError('فشل تحديث موعد المهمة');
    }
  };

  const renderTaskChip = (task: Task) => {
    const priorityColor =
      task.priority === 'critical'
        ? 'bg-red-500/30 text-red-100 border-red-500/40'
        : task.priority === 'high'
        ? 'bg-amber-500/30 text-amber-100 border-amber-500/40'
        : task.priority === 'medium'
        ? 'bg-sky-500/30 text-sky-100 border-sky-500/40'
        : 'bg-slate-700/60 text-slate-100 border-slate-600/60';

    return (
      <div
        key={task.id}
        className={`px-2 py-0.5 rounded-md text-[11px] border mb-1 truncate cursor-move ${priorityColor}`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/task-id', task.id);
        }}
        title={task.title}
      >
        {task.title}
      </div>
    );
  };

  const weekdayLabels = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const monthCells = mode === 'month' ? buildMonthCells() : [];
  const weekCells = mode === 'week' ? buildWeekCells() : [];
  const dayCell = mode === 'day' ? buildDayTasks() : null;

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-slate-300" />
          <span className="text-sm text-slate-200 font-medium">عرض التقويم</span>
          <span className="flex items-center gap-1 text-xs text-slate-400 ml-3">
            <CircleDot size={10} className="text-emerald-400" />
            اليوم:
            <span className="text-slate-200">
              {new Date().toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode toggle */}
          <div className="inline-flex rounded-full bg-slate-900 border border-slate-700 p-1 text-xs">
            {(['month', 'week', 'day'] as CalendarMode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-full ${
                  mode === m
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {m === 'month' ? 'شهر' : m === 'week' ? 'أسبوع' : 'يوم'}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1 text-xs text-slate-200">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 rounded hover:bg-slate-800"
            >
              <ChevronRight size={14} />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2 py-1 rounded border border-sky-500/50 text-sky-300 hover:bg-sky-500/10"
            >
              اليوم
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1 rounded hover:bg-slate-800"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="ml-2 text-slate-400 text-xs flex items-center gap-1">
              <Clock size={12} />
              {currentDate.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: mode === 'day' ? 'numeric' : undefined
              })}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-950/40 border-b border-red-800 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Calendar body */}
      <div className="flex-1 overflow-auto p-4">
        {mode === 'month' && (
          <div className="grid grid-cols-7 gap-2 text-xs">
            {weekdayLabels.map(label => (
              <div
                key={label}
                className="text-center text-slate-400 mb-1"
              >
                {label}
              </div>
            ))}
            {monthCells.map(cell => {
              const key = formatDateKey(cell.date);
              const isToday = key === todayKey;
              const isCurrentMonth = cell.date.getMonth() === currentDate.getMonth();
              return (
                <div
                  key={key}
                  className={`
                    min-h-[90px] rounded-lg border p-1 flex flex-col
                    ${isCurrentMonth ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-950/40 border-slate-900/80'}
                    ${isToday ? 'ring-1 ring-emerald-400/70' : ''}
                  `}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const taskId = e.dataTransfer.getData('text/task-id');
                    if (taskId) {
                      onTaskDrop(taskId, cell.date);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[11px] ${
                        isCurrentMonth ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>
                    {cell.tasks.length > 0 && (
                      <span className="text-[10px] text-slate-500">
                        {cell.tasks.length} مهمة
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {cell.tasks.slice(0, 3).map(renderTaskChip)}
                    {cell.tasks.length > 3 && (
                      <div className="mt-1 text-[10px] text-slate-500">
                        +{cell.tasks.length - 3} أخرى
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {mode === 'week' && (
          <div className="grid grid-cols-7 gap-2 text-xs">
            {weekCells.map(cell => {
              const key = formatDateKey(cell.date);
              const isToday = key === todayKey;
              return (
                <div
                  key={key}
                  className={`
                    min-h-[140px] rounded-lg border p-2 flex flex-col bg-slate-900/60 border-slate-800
                    ${isToday ? 'ring-1 ring-emerald-400/70' : ''}
                  `}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const taskId = e.dataTransfer.getData('text/task-id');
                    if (taskId) {
                      onTaskDrop(taskId, cell.date);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-400">
                        {weekdayLabels[cell.date.getDay()]}
                      </span>
                      <span className="text-sm text-slate-100">
                        {cell.date.getDate()}
                      </span>
                    </div>
                    {cell.tasks.length > 0 && (
                      <span className="text-[10px] text-slate-500">
                        {cell.tasks.length} مهمة
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-auto">
                    {cell.tasks.map(renderTaskChip)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {mode === 'day' && dayCell && (
          <div className="flex flex-col gap-3 text-xs">
            <div
              className={`
                rounded-lg border border-slate-800 bg-slate-900/60 p-3
                ${formatDateKey(dayCell.date) === todayKey ? 'ring-1 ring-emerald-400/70' : ''}
              `}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const taskId = e.dataTransfer.getData('text/task-id');
                if (taskId) {
                  onTaskDrop(taskId, dayCell.date);
                }
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-100">
                    {dayCell.date.toLocaleDateString('ar-EG', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {dayCell.tasks.length} مهمة في هذا اليوم
                </span>
              </div>
              <div className="space-y-1 max-h-[420px] overflow-auto">
                {dayCell.tasks.length === 0 && (
                  <div className="text-[11px] text-slate-500">
                    لا توجد مهام مجدولة لهذا اليوم.
                  </div>
                )}
                {dayCell.tasks.map(task => renderTaskChip(task))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
