import React from 'react';
import { useTaskDetailStore } from '../../store/useTaskDetailStore';
import type { ActivityType } from '../../types/task';
import {
  Plus,
  ArrowRightLeft,
  AlertTriangle,
  UserPlus,
  Type,
  FileText,
  Calendar,
  Tag,
  ListChecks,
  CheckSquare,
  Link2,
  Paperclip,
  Archive,
  RotateCcw,
  Clock,
} from 'lucide-react';

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  created: <Plus size={14} className="text-emerald-400" />,
  status_change: <ArrowRightLeft size={14} className="text-sky-400" />,
  priority_change: <AlertTriangle size={14} className="text-amber-400" />,
  assignee_change: <UserPlus size={14} className="text-indigo-400" />,
  title_change: <Type size={14} className="text-slate-400" />,
  description_change: <FileText size={14} className="text-slate-400" />,
  due_date_change: <Calendar size={14} className="text-orange-400" />,
  tag_change: <Tag size={14} className="text-cyan-400" />,
  subtask_change: <ListChecks size={14} className="text-purple-400" />,
  checklist_change: <CheckSquare size={14} className="text-teal-400" />,
  dependency_change: <Link2 size={14} className="text-rose-400" />,
  attachment_change: <Paperclip size={14} className="text-lime-400" />,
  archived: <Archive size={14} className="text-amber-400" />,
  unarchived: <RotateCcw size={14} className="text-emerald-400" />,
};

export function ActivityFeed() {
  const { selectedTask, loadActivity, activityPage, activityTotal } = useTaskDetailStore();

  if (!selectedTask) return null;

  const activity = selectedTask.activity;
  const hasMore = activity.length < activityTotal;

  return (
    <div className="space-y-1">
      {activity.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">لا يوجد نشاط حتى الآن</p>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute right-[15px] top-4 bottom-4 w-px bg-slate-800" />

          <div className="space-y-4">
            {activity.map((entry) => (
              <div key={entry.id} className="flex gap-3 relative">
                {/* Icon circle */}
                <div className="relative z-10 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  {ACTIVITY_ICONS[entry.type] || <Clock size={14} className="text-slate-500" />}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <p className="text-sm text-slate-300">
                    <span className="font-medium text-slate-200">{entry.actor}</span>{' '}
                    {entry.description}
                  </p>
                  {(entry.oldValue || entry.newValue) && (
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      {entry.oldValue && (
                        <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 line-through">
                          {entry.oldValue}
                        </span>
                      )}
                      {entry.oldValue && entry.newValue && (
                        <span className="text-slate-600">→</span>
                      )}
                      {entry.newValue && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          {entry.newValue}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-slate-600 mt-1">
                    {new Date(entry.timestamp).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => loadActivity(activityPage + 1)}
            className="px-4 py-2 text-sm text-sky-400 hover:text-sky-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            تحميل المزيد
          </button>
        </div>
      )}
    </div>
  );
}
