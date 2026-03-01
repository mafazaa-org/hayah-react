import { Draggable } from '@hello-pangea/dnd';
import type { Task } from '../../types/task';
import { PRIORITY_COLORS } from '../../types/task';
import {
  Calendar,
  Tag,
  Paperclip,
  Link2,
  ListChecks,
  MoreVertical
} from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useTaskDetailStore } from '../../store/useTaskDetailStore';

interface TaskCardProps {
  task: Task;
  index: number;
}

export function TaskCard({ task, index }: TaskCardProps) {
  const priorityColor = task.priority ? PRIORITY_COLORS[task.priority] : '#94a3b8';

  const searchQuery = useTaskStore(state => state.searchQuery);
  const deleteTask = useTaskStore(state => state.deleteTask);
  const openTaskDetail = useTaskDetailStore(state => state.openTaskDetail);

  const highlightText = (text: string) => {
    const query = searchQuery.trim();
    if (!query) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const parts: Array<{ value: string; match: boolean }> = [];

    let start = 0;
    let index = lowerText.indexOf(lowerQuery);

    while (index !== -1) {
      if (index > start) {
        parts.push({ value: text.slice(start, index), match: false });
      }
      parts.push({ value: text.slice(index, index + query.length), match: true });
      start = index + query.length;
      index = lowerText.indexOf(lowerQuery, start);
    }

    if (start < text.length) {
      parts.push({ value: text.slice(start), match: false });
    }

    return parts.map((part, i) =>
      part.match ? (
        <span key={i} className="bg-yellow-500/30 text-yellow-100 rounded px-0.5">
          {part.value}
        </span>
      ) : (
        <span key={i}>{part.value}</span>
      )
    );
  };

  // Check if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => {
            if (!snapshot.isDragging) {
              openTaskDetail(task.id, task);
            }
          }}
          className={`
            bg-slate-800 rounded-lg p-3 mb-2 border border-slate-700
            hover:border-slate-600 hover:shadow-lg transition-all cursor-pointer
            ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-sky-500' : ''}
          `}
        >
          {/* Top bar: priority + sprint + context menu */}
          <div className="flex items-center justify-between mb-2">
            {/* Priority Indicator */}
            <div
              className="h-1 flex-1 rounded-full mr-2"
              style={{ backgroundColor: priorityColor }}
            />
            {task.iterationName && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-sky-500/15 text-[10px] text-sky-300 border border-sky-500/30">
                {task.iterationName}
              </span>
            )}
            {/* Task card context menu (minimal) */}
            <button
              type="button"
              className="ml-2 p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('هل تريد حذف هذه المهمة؟')) {
                  deleteTask(task.id);
                }
              }}
              aria-label="قائمة خيارات المهمة"
            >
              <MoreVertical size={14} />
            </button>
          </div>

          {/* Title */}
          <h4 className="text-sm font-medium text-slate-100 mb-2 line-clamp-2">
            {highlightText(task.title)}
          </h4>

          {/* Description (if exists) */}
          {task.description && (
            <p className="text-xs text-slate-400 mb-2 line-clamp-2">
              {highlightText(task.description)}
            </p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-300"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Progress (subtasks + checklist) */}
          {(task.subtaskStats || task.checklistStats) && (
            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
              {task.subtaskStats && (
                <div className="flex items-center gap-1">
                  <ListChecks size={10} />
                  <span>
                    المهام الفرعية: {task.subtaskStats.completed}/{task.subtaskStats.total}
                  </span>
                </div>
              )}
              {task.checklistStats && (
                <div className="flex items-center gap-1">
                  <ListChecks size={10} />
                  <span>
                    القائمة: {task.checklistStats.completed}/{task.checklistStats.total}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Custom fields (compact view of first two) */}
          {task.customFields && Object.keys(task.customFields).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(task.customFields)
                .slice(0, 2)
                .map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-700/80 text-slate-200"
                  >
                    <span className="text-slate-400">{key}:</span>
                    <span className="truncate max-w-[80px]">{String(value)}</span>
                  </span>
                ))}
            </div>
          )}

          {/* Footer: Due Date, Assignees, Attachments, Dependencies */}
          <div className="flex items-center justify-between mt-2 text-xs">
            {/* Due Date */}
            {task.dueDate && (
              <div
                className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-slate-400'
                  }`}
              >
                <Calendar size={12} />
                <span>
                  {new Date(task.dueDate).toLocaleDateString('ar-EG', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-slate-400">
              {/* Assignee avatars (initials) */}
              {task.assignees && task.assignees.length > 0 && (
                <div className="flex -space-x-2">
                  {task.assignees.slice(0, 3).map((id) => (
                    <div
                      key={id}
                      className="w-5 h-5 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[10px]"
                      title={id}
                    >
                      {id
                        .split(/[-_]/)
                        .map(part => part[0]?.toUpperCase())
                        .join('')
                        .slice(0, 2)}
                    </div>
                  ))}
                  {task.assignees.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-slate-600 border border-slate-900 flex items-center justify-center text-[10px]">
                      +{task.assignees.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Attachments */}
              {typeof task.attachmentsCount === 'number' && task.attachmentsCount > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip size={12} />
                  <span>{task.attachmentsCount}</span>
                </div>
              )}

              {/* Dependencies */}
              {typeof task.dependencyCount === 'number' && task.dependencyCount > 0 && (
                <div className="flex items-center gap-1">
                  <Link2 size={12} />
                  <span>{task.dependencyCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
