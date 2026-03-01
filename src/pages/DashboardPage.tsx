import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFolderStore } from '../store/useFolderStore';
import type { NavigationItem } from '../services/folderService';
import {
  LayoutGrid,
  Table,
  Calendar,
  GanttChart,
  FolderOpen,
  Hash,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  ListTodo,
  Plus,
} from 'lucide-react';
import { useListStore } from '../store/useListStore';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Recursively collect all list-type items from the folder tree */
function collectLists(nodes: NavigationItem[]): NavigationItem[] {
  const result: NavigationItem[] = [];
  for (const node of nodes) {
    if (node.type === 'list') result.push(node);
    if (node.children) result.push(...collectLists(node.children));
  }
  return result;
}

/** Count folders recursively */
function countFolders(nodes: NavigationItem[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type === 'folder') count++;
    if (node.children) count += countFolders(node.children);
  }
  return count;
}

/* ------------------------------------------------------------------ */
/*  View mode cards data                                               */
/* ------------------------------------------------------------------ */
const VIEW_CARDS = [
  { id: 'kanban', label: 'كانبان', desc: 'لوحة سحب وإفلات', icon: LayoutGrid, color: 'from-blue-500 to-blue-600' },
  { id: 'table', label: 'جدول', desc: 'أعمدة وصفوف منظمة', icon: Table, color: 'from-emerald-500 to-emerald-600' },
  { id: 'calendar', label: 'تقويم', desc: 'عرض حسب التاريخ', icon: Calendar, color: 'from-amber-500 to-amber-600' },
  { id: 'timeline', label: 'خط زمني', desc: 'مخطط جانت تفاعلي', icon: GanttChart, color: 'from-purple-500 to-purple-600' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DashboardPage() {
  const navigate = useNavigate();
  const { tree, fetchTree, isLoading } = useFolderStore();
  const { openCreateModal } = useListStore();

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const lists = useMemo(() => collectLists(tree), [tree]);
  const folderCount = useMemo(() => countFolders(tree), [tree]);

  // Derive some mock stats from the tree
  const stats = useMemo(
    () => ({
      lists: lists.length,
      folders: folderCount,
    }),
    [lists.length, folderCount]
  );

  return (
    <div className="h-full overflow-auto p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ===== Hero greeting ===== */}
        <section>
          <h1 className="text-3xl font-bold text-slate-50">مرحباً بك 👋</h1>
          <p className="mt-1 text-sm text-slate-400">
            هنا لوحة تحكمك — تابع مشاريعك واطلع على آخر المستجدات.
          </p>
        </section>

        {/* ===== Stat cards ===== */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FolderOpen} label="مجلدات" value={stats.folders} color="text-amber-400" />
          <StatCard icon={Hash} label="قوائم" value={stats.lists} color="text-sky-400" />
          <StatCard icon={ListTodo} label="مهام مفتوحة" value="—" color="text-purple-400" />
          <StatCard icon={CheckCircle2} label="مهام مكتملة" value="—" color="text-emerald-400" />
        </section>

        {/* ===== Recent lists ===== */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Clock size={18} className="text-slate-400" />
              القوائم الأخيرة
            </h2>
            <button
              type="button"
              onClick={() => openCreateModal()}
              className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
            >
              <Plus size={14} />
              قائمة جديدة
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-slate-900/50 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : lists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
              <Hash size={36} className="text-slate-700" />
              <p className="text-sm">لا توجد قوائم بعد. أنشئ قائمتك الأولى!</p>
              <button
                type="button"
                onClick={() => openCreateModal()}
                className="mt-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                إنشاء قائمة
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lists.slice(0, 6).map(list => (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => navigate(`/dashboard/list/${list.id}`)}
                  className="group text-right rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 p-4 transition-all hover:shadow-lg hover:shadow-sky-500/5"
                >
                  <div className="flex items-start justify-between">
                    <ArrowUpRight
                      size={16}
                      className="text-slate-600 group-hover:text-sky-400 transition-colors mt-0.5"
                    />
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: list.color || '#3b82f6' }}
                      />
                      <span className="font-medium text-slate-100 group-hover:text-sky-300 transition-colors">
                        {list.name}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 text-right">
                    {list.children?.length ?? 0} عنصر
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ===== View modes showcase ===== */}
        <section>
          <h2 className="text-lg font-semibold text-slate-100 mb-4">طرق العرض المتاحة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {VIEW_CARDS.map(v => (
              <div
                key={v.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex flex-col items-center text-center gap-2 hover:border-slate-700 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${v.color} flex items-center justify-center`}>
                  <v.icon size={20} className="text-white" />
                </div>
                <span className="text-sm font-medium text-slate-200">{v.label}</span>
                <span className="text-[11px] text-slate-500">{v.desc}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-slate-800/80 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-100">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}
