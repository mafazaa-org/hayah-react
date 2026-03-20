import { useMemo } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { usePresenceStore } from '../../store/usePresenceStore';
import { Users, AlertTriangle } from 'lucide-react';

interface WorkloadViewProps {
  listId: string;
}

// Hard limit or soft limit proxy for demonstrative workload capacity
const MAX_TASKS_PER_USER = 10;

interface AssigneeWorkload {
  userId: string;
  name: string;
  tasks: any[];
  completed: number;
  pending: number;
  capacityLevel: number; // 0 to 100+
}

export function WorkloadView(_props: WorkloadViewProps) {
  const { tasks, error } = useTaskStore();
  const onlineUsersMap = usePresenceStore(state => state.onlineUsers);

  // Derive workload by assignee
  const workloads = useMemo<AssigneeWorkload[]>(() => {
    const map = new Map<string, AssigneeWorkload>();
    const unassigned: AssigneeWorkload = {
      userId: 'unassigned',
      name: 'غير معين',
      tasks: [],
      completed: 0,
      pending: 0,
      capacityLevel: 0,
    };

    tasks.forEach(task => {
      if (!task.assignees || task.assignees.length === 0) {
        unassigned.tasks.push(task);
        if (task.status === 'done') unassigned.completed++;
        else unassigned.pending++;
        unassigned.capacityLevel = Math.round((unassigned.pending / MAX_TASKS_PER_USER) * 100);
      } else {
        task.assignees.forEach(assigneeId => {
          if (!map.has(assigneeId)) {
            // Usually we'd map this to a real user profile via `useListStore` active users.
            // For now, we will extract a mock name or rely on ID strings.
            map.set(assigneeId, {
              userId: assigneeId,
              name: assigneeId,
              tasks: [],
              completed: 0,
              pending: 0,
              capacityLevel: 0
            });
          }
          const w = map.get(assigneeId)!;
          w.tasks.push(task);
          if (task.status === 'done') w.completed++;
          else w.pending++;

          w.capacityLevel = Math.min((w.pending / MAX_TASKS_PER_USER) * 100, 100); // Caps at 100% for bar, but mathematically higher.
        });
      }
    });

    const result = Array.from(map.values()).sort((a, b) => b.pending - a.pending);
    if (unassigned.tasks.length > 0) {
      result.push(unassigned);
    }
    return result;
  }, [tasks]);

  const getCapacityColor = (pending: number) => {
    if (pending > MAX_TASKS_PER_USER * 0.8) return 'bg-red-500'; // High workload (>80% limit)
    if (pending > MAX_TASKS_PER_USER * 0.5) return 'bg-amber-500'; // Medium (50-80%)
    return 'bg-emerald-500'; // Low / Safe (<50%)
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
      {/* ===== Toolbar ===== */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-pink-400" />
          <span className="text-sm text-slate-200 font-medium">عبء عمل الفريق (Workload)</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{workloads.length - (workloads.some(w => w.userId === 'unassigned') ? 1 : 0)} أعضاء مسندون</span>
          <span>الحد العادي: {MAX_TASKS_PER_USER} مهام لكل عضو</span>
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
        {workloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-500 h-full gap-3">
            <Users size={48} className="text-slate-700" />
            <p>لا توجد مهام أو أعضاء فريق محددين</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {workloads.map(w => {
              const isUnassigned = w.userId === 'unassigned';
              const userColor = getCapacityColor(w.pending);
              const overLimit = w.pending > MAX_TASKS_PER_USER;
              const isOnline = onlineUsersMap[w.userId];

              return (
                <div key={w.userId} className="bg-slate-900/50 rounded-lg border border-slate-800 p-5 shadow-sm flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-lg font-bold text-slate-300">
                      {isUnassigned ? '؟' : w.name.split(/[-_]/).map(part => part[0]?.toUpperCase()).join('').slice(0, 2)}
                    </div>
                    {isOnline && !isUnassigned && (
                      <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full" />
                    )}
                  </div>

                  <h3 className="text-slate-200 font-semibold mb-1 truncate w-full px-2" title={w.name}>
                    {w.name}
                  </h3>

                  <div className="text-xs text-slate-400 mb-4 flex divide-x divide-slate-700 divide-x-reverse">
                    <span className="px-2">مكتمل: {w.completed}</span>
                    <span className="px-2 font-medium text-slate-300">قيد الإنجاز: {w.pending}</span>
                  </div>

                  {/* Capacity Bar */}
                  {!isUnassigned && (
                    <div className="w-full mt-auto">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-medium">
                        <span>توزيع الحمل</span>
                        <span className={overLimit ? 'text-red-400' : ''}>
                          {w.pending} / {MAX_TASKS_PER_USER}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                        <div
                          className={`absolute right-0 top-0 bottom-0 ${userColor} transition-all duration-500`}
                          style={{ width: `${Math.min((w.pending / MAX_TASKS_PER_USER) * 100, 100)}%` }}
                        />
                      </div>
                      {overLimit && (
                        <p className="text-[10px] text-red-500/80 mt-2">عضو الفريق تجاوز السعة المحددة!</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
