import { useMemo } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { PieChart, AlertTriangle, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { PRIORITY_COLORS } from '../../types/task';

interface OverviewBoardProps {
  listId: string;
}

export function OverviewBoard(_props: OverviewBoardProps) {
  const { tasks, error, isLoading } = useTaskStore();

  const stats = useMemo(() => {
    let done = 0;
    let inProgress = 0;
    let todo = 0;

    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    tasks.forEach(task => {
      if (task.status === 'done') done++;
      else if (task.status === 'in-progress') inProgress++;
      else todo++;

      switch (task.priority) {
        case 'critical': critical++; break;
        case 'high': high++; break;
        case 'medium': medium++; break;
        case 'low': low++; break;
      }
    });

    const total = tasks.length || 1; // avoid divide by zero

    return {
      total: tasks.length,
      done,
      inProgress,
      todo,
      donePct: Math.round((done / total) * 100),
      inProgressPct: Math.round((inProgress / total) * 100),
      todoPct: Math.round((todo / total) * 100),
      critical,
      high,
      medium,
      low
    };
  }, [tasks]);

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
      {/* ===== Toolbar ===== */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2">
          <PieChart size={18} className="text-amber-400" />
          <span className="text-sm text-slate-200 font-medium">نظرة عامة (Overview)</span>
        </div>
        <div className="text-xs text-slate-400">
          تحديث مباشر للإحصائيات
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
      <div className="flex-1 overflow-auto p-6 space-y-8">
        {isLoading && tasks.length === 0 ? (
          <div className="flex items-center justify-center text-slate-500 h-full">جاري التحميل...</div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-500 h-full gap-3">
            <PieChart size={48} className="text-slate-700" />
            <p>القائمة فارغة، لا تتوفر إحصائيات لعرضها</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs mb-1">إجمالي المهام</p>
                  <h3 className="text-3xl font-bold text-slate-100">{stats.total}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <ListTodo size={24} />
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs mb-1">مكتمل</p>
                  <h3 className="text-3xl font-bold text-emerald-400">{stats.done}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={24} />
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs mb-1">قيد الإنجاز</p>
                  <h3 className="text-3xl font-bold text-sky-400">{stats.inProgress}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <Clock size={24} />
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs mb-1">متأخر / حرج</p>
                  <h3 className="text-3xl font-bold text-red-400">{stats.critical}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                  <AlertTriangle size={24} />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Status Progress Bar */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-6">توزيع الحالات</h3>

                {/* CSS Stacked Bar */}
                <div className="w-full h-8 rounded-full overflow-hidden flex mb-6 bg-slate-800">
                  {stats.donePct > 0 && <div className="h-full bg-emerald-500" style={{ width: `${stats.donePct}%` }} title={`مكتمل: ${stats.donePct}%`} />}
                  {stats.inProgressPct > 0 && <div className="h-full bg-sky-500" style={{ width: `${stats.inProgressPct}%` }} title={`قيد الإنجاز: ${stats.inProgressPct}%`} />}
                  {stats.todoPct > 0 && <div className="h-full bg-slate-500" style={{ width: `${stats.todoPct}%` }} title={`جديد: ${stats.todoPct}%`} />}
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      مكتمل
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <span>{stats.done} مهمة</span>
                      <span className="w-8 text-right font-medium">{stats.donePct}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <div className="w-3 h-3 rounded-full bg-sky-500" />
                      قيد الإنجاز
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <span>{stats.inProgress} مهمة</span>
                      <span className="w-8 text-right font-medium">{stats.inProgressPct}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <div className="w-3 h-3 rounded-full bg-slate-500" />
                      جديد / قيد الانتظار
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <span>{stats.todo} مهمة</span>
                      <span className="w-8 text-right font-medium">{stats.todoPct}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority Breakdown */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-6">المهام حسب الأولوية</h3>

                <div className="space-y-4">
                  {[
                    { label: 'حرج', count: stats.critical, color: PRIORITY_COLORS.critical },
                    { label: 'عالي', count: stats.high, color: PRIORITY_COLORS.high },
                    { label: 'متوسط', count: stats.medium, color: PRIORITY_COLORS.medium },
                    { label: 'منخفض', count: stats.low, color: PRIORITY_COLORS.low },
                  ].map(p => (
                    <div key={p.label} className="flex items-center gap-3">
                      <div className="w-20 text-sm text-slate-300">{p.label}</div>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${stats.total > 0 ? (p.count / stats.total) * 100 : 0}%`,
                            backgroundColor: p.color
                          }}
                        />
                      </div>
                      <div className="w-8 text-sm text-slate-400 text-left">{p.count}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
