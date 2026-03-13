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
import { usePresenceStore } from '../../store/usePresenceStore';
import { useCustomFieldStore } from '../../store/useCustomFieldStore';
import { useIterationStore } from '../../store/useIterationStore';
import { RotateCcw } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
}

export function TaskCard({ task, index }: TaskCardProps) {
  const priorityColor = task.priority ? PRIORITY_COLORS[task.priority] : '#94a3b8';

  const searchQuery = useTaskStore(state => state.searchQuery);
  const deleteTask = useTaskStore(state => state.deleteTask);
  const openTaskDetail = useTaskDetailStore(state => state.openTaskDetail);
  const onlineUsers = usePresenceStore(state => state.onlineUsers);
  const fields = useCustomFieldStore(state => state.fields);
  const iterations = useIterationStore(state => state.iterations);

  const assignedIteration = iterations.find(it => it.id === task.iterationId);
  const iterationDisplayName = assignedIteration?.name || task.iterationName;

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
        <article
          aria-label={`مهمة: ${task.title}`}
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
            hover:border-slate-600 hover:shadow-lg transition-all touch-manipulation
            ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-sky-500/80 scale-[1.02] bg-slate-800/90 z-50 cursor-grabbing' : 'cursor-grab'}
          `}
        >
          {/* Top bar: priority + sprint + context menu */}
          <div className="flex items-center justify-between mb-2">
            {/* Priority Indicator */}
            <div
              className="h-1 flex-1 rounded-full mr-2"
              style={{ backgroundColor: priorityColor }}
            />
            {iterationDisplayName && (
              <span
                className="ml-2 px-2 py-0.5 rounded-full bg-sky-500/15 text-[10px] text-sky-400 border border-sky-500/30 flex items-center gap-1 shrink-0"
                title="الدورة"
              >
                <RotateCcw size={10} />
                <span className="truncate max-w-[80px]">{iterationDisplayName}</span>
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

          {/* Custom fields (filtered by showOnCard) */}
          {task.customFields && Object.keys(task.customFields).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {fields
                .filter(f => f.showOnCard && task.customFields?.[f.id] !== undefined)
                .slice(0, 3)
                .map((field) => {
                  const value = task.customFields![field.id];
                  let displayValue = String(value);

                  if (field.type === 'select') {
                    const option = field.options?.find(o => o.id === value || o.value === value);
                    if (option) displayValue = option.value;
                  } else if (field.type === 'checkbox') {
                    displayValue = value ? 'نعم' : 'لا';
                  }

                  return (
                    <span
                      key={field.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-700/80 text-slate-200 border border-slate-600/30"
                    >
                      <span className="text-slate-400">{field.name}:</span>
                      <span className="truncate max-w-[80px]">{displayValue}</span>
                    </span>
                  );
                })}
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
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {task.assignees.slice(0, 3).map((id) => {
                    const isOnline = onlineUsers[id];
                    return (
                      <div key={id} className="relative w-5 h-5 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[10px]" title={id}>
                        {id
                          .split(/[-_]/)
                          .map(part => part[0]?.toUpperCase())
                          .join('')
                          .slice(0, 2)}
                        {isOnline && (
                          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 border border-slate-900 rounded-full" />
                        )}
                      </div>
                    );
                  })}
                  {task.assignees.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-slate-600 border border-slate-900 flex items-center justify-center text-[10px] z-10">
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
        </article>
      )}
    </Draggable>
  );
}
