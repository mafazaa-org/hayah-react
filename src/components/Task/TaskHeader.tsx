import { useState, useRef, useEffect } from 'react';
import type { TaskDetail } from '../../types/task';
import { PRIORITY_COLORS } from '../../types/task';
import { useTaskDetailStore } from '../../store/useTaskDetailStore';
import { useColumnStore } from '../../store/useColumnStore';
import {
  Archive,
  ChevronDown,
  Clock,
} from 'lucide-react';

interface TaskHeaderProps {
  task: TaskDetail;
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  critical: 'حرجة',
};

export function TaskHeader({ task }: TaskHeaderProps) {
  const { updateTaskField, archiveTask } = useTaskDetailStore();
  const { columns } = useColumnStore();

  // Inline edit title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const titleRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    setTitleDraft(task.title);
  }, [task.title]);

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditingTitle]);

  const saveTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== task.title) {
      updateTaskField({ title: trimmed });
    } else {
      setTitleDraft(task.title);
    }
    setIsEditingTitle(false);
  };

  // Status & Priority dropdowns
  const [showStatusDD, setShowStatusDD] = useState(false);
  const [showPriorityDD, setShowPriorityDD] = useState(false);

  const currentColumn = columns.find((c) => c.id === task.status);

  return (
    <div className="space-y-3">
      {/* Title */}
      {isEditingTitle ? (
        <input
          ref={titleRef}
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveTitle();
            if (e.key === 'Escape') {
              setTitleDraft(task.title);
              setIsEditingTitle(false);
            }
          }}
          className="w-full text-xl font-bold bg-transparent border-b-2 border-sky-500 text-slate-100 focus:outline-none pb-1"
        />
      ) : (
        <h2
          className="text-xl font-bold text-slate-100 cursor-pointer hover:text-sky-400 transition-colors"
          onClick={() => setIsEditingTitle(true)}
          title="انقر للتعديل"
        >
          {task.title}
        </h2>
      )}

      {/* Status + Priority + Archive row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status */}
        <div className="relative">
          <button
            onClick={() => { setShowStatusDD(!showStatusDD); setShowPriorityDD(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: currentColumn?.color || '#64748b' }}
            />
            <span className="text-slate-200">{currentColumn?.name || task.status}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {showStatusDD && (
            <div className="absolute top-full mt-1 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-[160px] py-1">
              {columns.map((col) => (
                <button
                  key={col.id}
                  onClick={() => {
                    updateTaskField({ status: col.id });
                    setShowStatusDD(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-right flex items-center gap-2 hover:bg-slate-700 transition-colors ${col.id === task.status ? 'bg-slate-700/50' : ''
                    }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-slate-200">{col.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority */}
        <div className="relative">
          <button
            onClick={() => { setShowPriorityDD(!showPriorityDD); setShowStatusDD(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: task.priority ? PRIORITY_COLORS[task.priority] : '#94a3b8' }}
            />
            <span className="text-slate-200">
              {task.priority ? PRIORITY_LABELS[task.priority] : 'بدون أولوية'}
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {showPriorityDD && (
            <div className="absolute top-full mt-1 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-[140px] py-1">
              {(Object.keys(PRIORITY_LABELS) as Array<'low' | 'medium' | 'high' | 'critical'>).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => {
                      updateTaskField({ priority: p });
                      setShowPriorityDD(false);
                    }}
                    className={`w-full px-3 py-2 text-sm text-right flex items-center gap-2 hover:bg-slate-700 transition-colors ${task.priority === p ? 'bg-slate-700/50' : ''
                      }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[p] }} />
                    <span className="text-slate-200">{PRIORITY_LABELS[p]}</span>
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Archive */}
        {!task.isArchived && (
          <button
            onClick={() => {
              if (confirm('هل تريد أرشفة هذه المهمة؟')) archiveTask();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-amber-400 border border-slate-700 hover:border-amber-500/50 transition-colors"
          >
            <Archive size={14} />
            <span>أرشفة</span>
          </button>
        )}
        {task.isArchived && (
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Archive size={14} />
            مؤرشفة
          </span>
        )}
      </div>

      {/* Timestamps */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          تم الإنشاء: {new Date(task.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          آخر تحديث: {new Date(task.updatedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
