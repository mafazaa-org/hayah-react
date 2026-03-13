import { Droppable } from '@hello-pangea/dnd';
import type { Column } from '../../types/task';
import { ColumnHeader } from './ColumnHeader';
import { TaskCard } from './TaskCard';
import { useTaskStore } from '../../store/useTaskStore';
import { useColumnStore } from '../../store/useColumnStore';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { EmptyState } from '../UI/EmptyState';
import { TaskCardSkeleton } from '../UI/Skeleton';

interface KanbanColumnProps {
  column: Column;
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { getFilteredAndSortedTasks, openCreateTaskModal, isLoading } = useTaskStore();
  const { openColumnModal, deleteColumn } = useColumnStore();

  // Use filtered & sorted tasks scoped to this column
  const tasks = useMemo(() => {
    return getFilteredAndSortedTasks().filter(task => task.status === column.id);
  }, [getFilteredAndSortedTasks, column.id]);

  return (
    <section
      className="shrink-0 w-80 bg-slate-900/50 rounded-lg p-3 border border-slate-800"
      aria-labelledby={`column-header-${column.id}`}
    >
      <ColumnHeader
        column={column}
        taskCount={tasks.length}
        onRename={() => openColumnModal(column.id)}
        onDelete={() => deleteColumn(column.id)}
        onChangeColor={() => openColumnModal(column.id)}
      />

      <Droppable droppableId={column.id} type="TASK">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              min-h-[200px] transition-colors rounded-lg
              ${snapshot.isDraggingOver ? 'bg-slate-800/50' : ''}
            `}
          >
            {isLoading ? (
              <div className="py-2 space-y-2 relative pointer-events-none">
                <TaskCardSkeleton />
                <TaskCardSkeleton />
                <TaskCardSkeleton />
              </div>
            ) : tasks.length > 0 ? (
              tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))
            ) : (
              <div className="py-2">
                <EmptyState title="لا توجد مهام" description="اسحب وأفلت المهام إلى هنا أو أضف مهمة جديدة." />
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Task Button */}
      <button
        onClick={() => openCreateTaskModal(column.id)}
        className="w-full mt-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 justify-center"
      >
        <Plus size={16} />
        إضافة مهمة
      </button>
    </section>
  );
}
