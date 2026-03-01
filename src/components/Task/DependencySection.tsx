import { useState } from 'react';
import { useTaskDetailStore } from '../../store/useTaskDetailStore';
import { useTaskStore } from '../../store/useTaskStore';
import type { DependencyType } from '../../types/task';
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  AlertTriangle,
} from 'lucide-react';

export function DependencySection() {
  const { selectedTask, addDependency, removeDependency, error } = useTaskDetailStore();
  const { tasks } = useTaskStore();

  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<DependencyType>('blocks');

  if (!selectedTask) return null;

  const deps = selectedTask.taskDependencies;

  // Filter tasks for search (exclude self and already-linked)
  const linkedIds = new Set(deps.map((d) => d.targetTaskId));
  const searchResults = tasks.filter(
    (t) =>
      t.id !== selectedTask.id &&
      !linkedIds.has(t.id) &&
      t.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (targetId: string, targetTitle: string) => {
    addDependency(targetId, selectedType, targetTitle);
    setShowAdd(false);
    setSearch('');
  };

  return (
    <div className="space-y-4">
      {/* Error (e.g. circular dependency) */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {/* Existing dependencies */}
      {deps.length === 0 && !showAdd && (
        <p className="text-sm text-slate-500">لا توجد تبعيات حالياً</p>
      )}

      <div className="space-y-2">
        {deps.map((dep) => (
          <div
            key={dep.id}
            className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 group"
          >
            {dep.type === 'blocks' ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <ArrowRight size={14} />
                <span>يحظر</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-blue-400">
                <ArrowLeft size={14} />
                <span>محظور بواسطة</span>
              </div>
            )}
            <span className="flex-1 text-sm text-slate-300 truncate">
              {dep.targetTaskTitle || dep.targetTaskId}
            </span>
            <button
              onClick={() => removeDependency(dep.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 rounded transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Add dependency */}
      {showAdd ? (
        <div className="space-y-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700">
          {/* Type selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType('blocks')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${selectedType === 'blocks'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 border border-slate-700 hover:border-slate-600'
                }`}
            >
              يحظر
            </button>
            <button
              onClick={() => setSelectedType('blocked_by')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${selectedType === 'blocked_by'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 border border-slate-700 hover:border-slate-600'
                }`}
            >
              محظور بواسطة
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 rounded-md border border-slate-700">
            <Search size={14} className="text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن مهمة..."
              className="bg-transparent text-sm text-slate-200 focus:outline-none w-full"
              autoFocus
            />
          </div>

          {/* Results */}
          {search.trim() && (
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {searchResults.length === 0 ? (
                <p className="text-xs text-slate-500 px-2 py-1">لا توجد نتائج</p>
              ) : (
                searchResults.slice(0, 10).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleAdd(t.id, t.title)}
                    className="w-full text-right px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-md transition-colors truncate"
                  >
                    {t.title}
                  </button>
                ))
              )}
            </div>
          )}

          <button
            onClick={() => { setShowAdd(false); setSearch(''); }}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            إلغاء
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Plus size={14} />
          إضافة تبعية
        </button>
      )}
    </div>
  );
}
