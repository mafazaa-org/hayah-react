import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchService } from '../services/searchService';
import type { Task } from '../types/task';
import { Search, Filter, Loader2, RefreshCw } from 'lucide-react';
import { TaskDetailModal } from '../components/Task/TaskDetailModal';
import { useTaskDetailStore } from '../store/useTaskDetailStore';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');

  const { openTaskDetail } = useTaskDetailStore();

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const filters = {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(assigneeFilter ? { assignee: assigneeFilter } : {})
      };

      const results = await searchService.searchTasks(query, filters);
      setTasks(results);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, statusFilter, assigneeFilter]);

  // Handle Highlighting
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase()
        ? <mark key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header Area */}
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/50">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
          <Search className="text-sky-400" size={24} />
          نتائج البحث عن: <span className="text-sky-400">"{query}"</span>
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          أظهرت النتائج {tasks.length} مهمة مطابقة.
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Filters Sidebar */}
        <div className="w-64 border-l border-slate-800 bg-slate-900/30 p-4 hidden md:block overflow-y-auto">
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                <Filter size={16} /> تصفية النتائج
              </h3>

              <div className="space-y-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">الحالة</label>
                  <select
                    title="تصفية حسب الحالة"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 px-3 py-2 outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="">جميع الحالات</option>
                    <option value="todo">للمعالجة</option>
                    <option value="in-progress">قيد التنفيذ</option>
                    <option value="review">أثناء المراجعة</option>
                    <option value="done">مكتمل</option>
                  </select>
                </div>

                {/* Assignee Filter (Mock values since full list requires users API) */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">المسؤول</label>
                  <select
                    title="تصفية حسب المسؤول"
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 px-3 py-2 outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="">جميع المستخدمين</option>
                    <option value="user-1">المستخدم 1</option>
                    <option value="user-2">المستخدم 2</option>
                    <option value="user-3">المستخدم 3</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setStatusFilter('');
                setAssigneeFilter('');
              }}
              className="mt-4 text-xs font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 w-fit"
            >
              <RefreshCw size={12} /> مسح التصفية
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-3">
              <Loader2 className="animate-spin" size={24} />
              <span>جاري البحث...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
              <Search className="text-slate-600 mb-2" size={32} />
              <p className="text-slate-400">لا توجد مهام تطابق كلمة البحث الخاص بك.</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 text-sm text-sky-400 hover:text-sky-300"
              >
                العودة للصفحة الرئيسية
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <div key={task.id} className="relative group" onClick={() => openTaskDetail(task.id, task)}>
                  <div className="absolute inset-0 bg-sky-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>
                  <div className="pointer-events-none p-1">
                    {/* Wrap TaskCard in pointer-events-none and pass a highlighted title directly into the layout visually or just let the card render normally, then override its visual. */}
                    {/* For a clean implementation, since TaskCard has lots of internal states, we render a customized result card here instead of reusing the Kanban card to ensure highlighting works nicely without messing with Drag and Drop context. */}
                  </div>

                  <div className="h-full bg-slate-800 border border-slate-700 hover:border-sky-500/50 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between group-hover:shadow-lg group-hover:shadow-sky-900/10">
                    <div>
                      <h3 className="text-slate-100 font-medium text-base mb-1.5 line-clamp-2">
                        {highlightText(task.title, query)}
                      </h3>
                      <p className="text-slate-400 text-xs line-clamp-2">
                        {task.description ? highlightText(task.description, query) : 'لا يوجد وصف.'}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex gap-2">
                        {task.status === 'done' ? (
                          <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">مكتمل</span>
                        ) : (
                          <span className="text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">{task.status}</span>
                        )}
                        {task.priority && (
                          <span className="text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full capitalize">{task.priority}</span>
                        )}
                      </div>

                      {task.assignees && task.assignees.length > 0 && (
                        <div className="flex -space-x-1 space-x-reverse">
                          {task.assignees.slice(0, 3).map((a, i) => (
                            <div key={i} className="w-5 h-5 rounded-full bg-slate-600 border border-slate-800 flex items-center justify-center text-[9px] text-white">
                              {a.charAt(0).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Global TaskDetailModal (already normally lives in KanbanBoard, but we need it here) */}
      <TaskDetailModal />
    </div>
  );
}
