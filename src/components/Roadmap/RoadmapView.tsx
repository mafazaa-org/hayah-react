import { useEffect, useMemo } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { Map as MapIcon, Clock, AlertTriangle } from 'lucide-react';
import type { Task } from '../../types/task';

interface RoadmapViewProps {
  listId: string;
}

// A simple structure for our Roadmap items (grouping by Epic/Feature via tags)
interface EpicGroup {
  name: string;
  tasks: Task[];
  progress: number;
}

export function RoadmapView(_props: RoadmapViewProps) {
  const { tasks, isLoading, error } = useTaskStore();

  // For roadmap, we rely on tags to simulate "Features" or "Epics"
  const epicGroups = useMemo<EpicGroup[]>(() => {
    const groups = new Map<string, Task[]>();
    const ungrouped: Task[] = [];

    tasks.forEach(task => {
      // Find tags that might be epics (e.g. anything not simple)
      // For this view, we'll treat ANY tag as a potential feature bracket.
      // If a task has no tags, it goes to "Ungrouped/Other"
      if (!task.tags || task.tags.length === 0) {
        ungrouped.push(task);
      } else {
        task.tags.forEach(tag => {
          if (!groups.has(tag)) {
            groups.set(tag, []);
          }
          groups.get(tag)!.push(task);
        });
      }
    });

    const result: EpicGroup[] = Array.from(groups.entries()).map(([name, groupTasks]) => {
      const completed = groupTasks.filter(t => t.status === 'done').length;
      return {
        name,
        tasks: groupTasks,
        progress: groupTasks.length > 0 ? (completed / groupTasks.length) * 100 : 0
      };
    });

    if (ungrouped.length > 0) {
      const completed = ungrouped.filter(t => t.status === 'done').length;
      result.push({
        name: 'مهام أخرى',
        tasks: ungrouped,
        progress: (completed / ungrouped.length) * 100
      });
    }

    // Sort heavily populated epics first
    return result.sort((a, b) => b.tasks.length - a.tasks.length);
  }, [tasks]);

  useEffect(() => {
    // If tasks aren't loaded for this list, we should fetch (relying on global fetch but avoiding heavy re-fetches if they are already in store).
    // To be safe and simple, we rely on the parent or the store retaining tasks. 
    // In our architecture, the board views expect `useTaskStore().tasks` to be populated or fetch them.
    if (tasks.length === 0 && !isLoading) {
      // We don't have columns here easily, so we rely on the tasks already being fetched in Kanban.
      // But if user directly loads `/timeline` or `/roadmap`, they might not have tasks.
      // We will trigger a fetch without strict column params via a generic task fetch if your service supports it.
      // For now, we assume the parent (ListView or Kanban side effects) has loaded tasks, or we show empty.
    }
  }, [tasks.length, isLoading]);

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
      {/* ===== Toolbar ===== */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2">
          <MapIcon size={18} className="text-purple-400" />
          <span className="text-sm text-slate-200 font-medium">خارطة الطريق (Roadmap)</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{epicGroups.length} ميزات رئيسية</span>
          <span>{tasks.length} مهام</span>
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
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {epicGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-500 h-full gap-3">
            <MapIcon size={48} className="text-slate-700" />
            <p>لا توجد ميزات أو مهام بخارطة الطريق</p>
          </div>
        ) : (
          epicGroups.map(epic => (
            <div key={epic.name} className="bg-slate-900/50 rounded-lg border border-slate-800 p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-purple-500/80 border border-purple-400"></span>
                    {epic.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    يتضمن {epic.tasks.length} مهام
                  </p>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full md:w-64">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>التقدم</span>
                    <span>{Math.round(epic.progress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${epic.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sub-tasks macro view */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {epic.tasks.slice(0, 8).map(task => (
                  <div key={task.id} className="bg-slate-800/60 rounded border border-slate-700/50 p-3 flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-200 line-clamp-1 truncate" title={task.title}>
                      {task.title}
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`${task.status === 'done' ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {task.status === 'done' ? 'مكتمل' : task.status === 'in-progress' ? 'جاري' : 'جديد'}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock size={10} />
                          {new Date(task.dueDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {epic.tasks.length > 8 && (
                  <div className="flex items-center justify-center p-3 text-xs text-slate-500 bg-slate-800/20 rounded border border-slate-800 border-dashed">
                    + {epic.tasks.length - 8} مهام أخرى
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
