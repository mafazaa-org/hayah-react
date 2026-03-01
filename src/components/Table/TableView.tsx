import { useEffect, useMemo, useState } from 'react';
import {
  Table as TableIcon,
  ArrowUpDown,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Edit3,
  Trash2
} from 'lucide-react';
import type { Task } from '../../types/task';
import { taskService } from '../../services/taskService';
import { useColumnStore } from '../../store/useColumnStore';

interface TableViewProps {
  listId: string;
}

type TableColumnKey =
  | 'title'
  | 'status'
  | 'priority'
  | 'assignees'
  | 'dueDate'
  | 'iteration'
  | 'tags'
  | 'createdAt';

interface TableColumnConfig {
  key: TableColumnKey;
  label: string;
  width: number;
  sortable?: boolean;
}

const DEFAULT_COLUMNS: TableColumnConfig[] = [
  { key: 'title', label: 'العنوان', width: 260, sortable: true },
  { key: 'status', label: 'الحالة', width: 140, sortable: false },
  { key: 'priority', label: 'الأولوية', width: 120, sortable: true },
  { key: 'assignees', label: 'المسؤولون', width: 140, sortable: true },
  { key: 'dueDate', label: 'الموعد النهائي', width: 140, sortable: true },
  { key: 'iteration', label: 'السباق', width: 140, sortable: false },
  { key: 'tags', label: 'الوسوم', width: 200, sortable: false },
  { key: 'createdAt', label: 'تاريخ الإنشاء', width: 160, sortable: true }
];

export function TableView({ listId }: TableViewProps) {
  const { columns, fetchColumns } = useColumnStore();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [sort, setSort] = useState<{ field: 'dueDate' | 'priority' | 'createdAt' | 'title' | 'assignee' | 'customFields'; direction: 'asc' | 'desc' }>({
    field: 'createdAt',
    direction: 'desc'
  });

  const [visibleColumns, setVisibleColumns] = useState<Record<TableColumnKey, boolean>>(() => {
    const initial: Record<TableColumnKey, boolean> = {
      title: true,
      status: true,
      priority: true,
      assignees: true,
      dueDate: true,
      iteration: true,
      tags: true,
      createdAt: true
    };
    return initial;
  });

  const [columnOrder, setColumnOrder] = useState<TableColumnKey[]>(
    DEFAULT_COLUMNS.map(c => c.key)
  );
  const [columnWidths, setColumnWidths] = useState<Record<TableColumnKey, number>>(
    () =>
      DEFAULT_COLUMNS.reduce(
        (acc, col) => {
          acc[col.key] = col.width;
          return acc;
        },
        {} as Record<TableColumnKey, number>
      )
  );

  const [columnFilters, setColumnFilters] = useState<Record<TableColumnKey, string>>({
    title: '',
    status: '',
    priority: '',
    assignees: '',
    dueDate: '',
    iteration: '',
    tags: '',
    createdAt: ''
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [editing, setEditing] = useState<{
    taskId: string | null;
    field: keyof Task | null;
    value: string;
  }>({
    taskId: null,
    field: null,
    value: ''
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Load columns and tasks
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (columns.length === 0) {
          await fetchColumns(listId);
        }
        const columnIds = (columns.length > 0 ? columns : []).map(c => c.id);
        const { tasks: pageTasks, total: totalCount } = await taskService.getTasksForListPaginated(
          listId,
          columnIds,
          page,
          pageSize,
          sort
        );
        if (!isMounted) return;
        setTasks(pageTasks);
        setTotal(totalCount);
      } catch (err) {
        console.error('Failed to load table tasks:', err);
        if (isMounted) {
          setError('فشل تحميل المهام في عرض الجدول');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [listId, page, pageSize, sort.field, sort.direction, columns.length]);

  const handleToggleColumnVisibility = (key: TableColumnKey) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResizeColumn = (key: TableColumnKey, delta: number) => {
    setColumnWidths(prev => {
      const next = Math.min(400, Math.max(80, (prev[key] || 160) + delta));
      return { ...prev, [key]: next };
    });
  };

  const handleReorderColumn = (key: TableColumnKey, direction: 'left' | 'right') => {
    setColumnOrder(prev => {
      const index = prev.indexOf(key);
      if (index === -1) return prev;
      const newOrder = [...prev];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newOrder.length) return prev;
      const [removed] = newOrder.splice(index, 1);
      newOrder.splice(targetIndex, 0, removed);
      return newOrder;
    });
  };

  const handleSortToggle = (config: TableColumnConfig) => {
    if (!config.sortable) return;
    setSort(prev => {
      const fieldMap: Record<TableColumnKey, typeof prev.field> = {
        title: 'title',
        priority: 'priority',
        dueDate: 'dueDate',
        createdAt: 'createdAt',
        assignees: 'assignee',
        status: 'createdAt',
        iteration: 'createdAt',
        tags: 'createdAt'
      };
      const field = fieldMap[config.key];
      if (prev.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { field, direction: 'asc' };
    });
  };

  const handleFilterChange = (key: TableColumnKey, value: string) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Title
      if (columnFilters.title) {
        if (!task.title.toLowerCase().includes(columnFilters.title.toLowerCase())) {
          return false;
        }
      }
      // Status (ID match)
      if (columnFilters.status) {
        if (!task.status.toLowerCase().includes(columnFilters.status.toLowerCase())) {
          return false;
        }
      }
      // Priority
      if (columnFilters.priority && task.priority) {
        if (!task.priority.toLowerCase().includes(columnFilters.priority.toLowerCase())) {
          return false;
        }
      }
      // Assignees (IDs)
      if (columnFilters.assignees && task.assignees && task.assignees.length > 0) {
        const joined = task.assignees.join(',').toLowerCase();
        if (!joined.includes(columnFilters.assignees.toLowerCase())) {
          return false;
        }
      }
      // Due date (string compare)
      if (columnFilters.dueDate && task.dueDate) {
        if (!task.dueDate.toLowerCase().includes(columnFilters.dueDate.toLowerCase())) {
          return false;
        }
      }
      // Iteration
      if (columnFilters.iteration && task.iterationName) {
        if (!task.iterationName.toLowerCase().includes(columnFilters.iteration.toLowerCase())) {
          return false;
        }
      }
      // Tags
      if (columnFilters.tags && task.tags && task.tags.length > 0) {
        const joined = task.tags.join(',').toLowerCase();
        if (!joined.includes(columnFilters.tags.toLowerCase())) {
          return false;
        }
      }
      // Created at
      if (columnFilters.createdAt) {
        if (!task.createdAt.toLowerCase().includes(columnFilters.createdAt.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, columnFilters]);

  const handleToggleRow = (taskId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleToggleAllRows = () => {
    if (selectedIds.size === filteredTasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTasks.map(t => t.id)));
    }
  };

  const handleStartEditing = (task: Task, field: keyof Task) => {
    let value = '';
    if (field === 'title' || field === 'description') {
      value = (task[field] as string) || '';
    } else if (field === 'dueDate') {
      value = task.dueDate ? task.dueDate.slice(0, 10) : '';
    }
    setEditing({ taskId: task.id, field, value });
  };

  const handleCommitEdit = async () => {
    if (!editing.taskId || !editing.field) return;
    const { taskId, field, value } = editing;

    // Optimistic update
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              [field]:
                field === 'dueDate' && value
                  ? new Date(value).toISOString()
                  : value
            }
          : task
      )
    );

    try {
      await taskService.updateTask(taskId, {
        [field]:
          field === 'dueDate' && value
            ? new Date(value).toISOString()
            : value
      } as Partial<Task>);
    } catch (err) {
      console.error('Failed to save inline edit:', err);
      setError('فشل حفظ التعديل السريع');
    } finally {
      setEditing({ taskId: null, field: null, value: '' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm('هل تريد حذف المهام المحددة؟')) return;
    try {
      setIsLoading(true);
      await Promise.all(Array.from(selectedIds).map(id => taskService.deleteTask(id)));
      setTasks(prev => prev.filter(t => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to delete selected tasks:', err);
      setError('فشل حذف المهام المحددة');
    } finally {
      setIsLoading(false);
    }
  };

  const currentColumns = columnOrder
    .map(key => DEFAULT_COLUMNS.find(col => col.key === key)!)
    .filter(col => visibleColumns[col.key]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-950/40 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <TableIcon size={18} className="text-slate-300" />
          <span className="text-sm text-slate-200 font-medium">عرض الجدول</span>
          <span className="text-xs text-slate-500">
            ({total} مهمة)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Column visibility */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Eye size={14} />
            {currentColumns.length}/{DEFAULT_COLUMNS.length} أعمدة
          </div>

          {/* Bulk actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 size={12} />
              حذف محدد
              {selectedIds.size > 0 && (
                <span className="text-[11px] text-red-200">
                  ({selectedIds.size})
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Column controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-900 bg-slate-950/80 text-xs text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1">
            <Filter size={12} />
            <span>تخصيص الأعمدة:</span>
          </span>
          {DEFAULT_COLUMNS.map(col => (
            <button
              key={col.key}
              type="button"
              onClick={() => handleToggleColumnVisibility(col.key)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] ${
                visibleColumns[col.key]
                  ? 'border-sky-500/50 text-sky-300 bg-sky-500/10'
                  : 'border-slate-700 text-slate-500 bg-slate-900'
              }`}
            >
              {visibleColumns[col.key] ? <Eye size={10} /> : <EyeOff size={10} />}
              <span>{col.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full text-xs text-slate-200">
          <thead className="bg-slate-900/80 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 border-b border-slate-800 w-8 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.size > 0 && selectedIds.size === filteredTasks.length}
                  onChange={handleToggleAllRows}
                  className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500"
                />
              </th>
              {currentColumns.map(col => (
                <th
                  key={col.key}
                  className="px-3 py-2 border-b border-slate-800 text-right align-middle"
                  style={{ width: columnWidths[col.key], minWidth: columnWidths[col.key] }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleSortToggle(col)}
                      className="flex items-center gap-1 text-slate-300 hover:text-slate-50"
                    >
                      <span>{col.label}</span>
                      {col.sortable && (
                        <ArrowUpDown size={12} className="text-slate-500" />
                      )}
                    </button>
                    <div className="flex items-center gap-1 text-slate-500">
                      <button
                        type="button"
                        onClick={() => handleReorderColumn(col.key, 'left')}
                        className="px-1 hover:text-slate-200"
                        title="نقل لليسار"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorderColumn(col.key, 'right')}
                        className="px-1 hover:text-slate-200"
                        title="نقل لليمين"
                      >
                        ›
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResizeColumn(col.key, 20)}
                        className="px-1 hover:text-slate-200"
                        title="توسيع"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResizeColumn(col.key, -20)}
                        className="px-1 hover:text-slate-200"
                        title="تصغير"
                      >
                        -
                      </button>
                    </div>
                  </div>
                  {/* Column filter input */}
                  <div className="mt-1">
                    <input
                      type="text"
                      value={columnFilters[col.key]}
                      onChange={(e) => handleFilterChange(col.key, e.target.value)}
                      placeholder="تصفية..."
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </th>
              ))}
              <th className="px-3 py-2 border-b border-slate-800 w-20 text-right">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && filteredTasks.length === 0 && (
              <tr>
                <td colSpan={currentColumns.length + 2} className="py-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    <span>جاري تحميل المهام...</span>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && filteredTasks.length === 0 && (
              <tr>
                <td colSpan={currentColumns.length + 2} className="py-8 text-center text-slate-500">
                  لا توجد مهام مطابقة للمعايير الحالية.
                </td>
              </tr>
            )}
            {filteredTasks.map(task => (
              <tr
                key={task.id}
                className={`border-b border-slate-900/60 hover:bg-slate-900/40 ${
                  selectedIds.has(task.id) ? 'bg-slate-900/60' : ''
                }`}
              >
                <td className="px-3 py-2 text-center align-middle">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(task.id)}
                    onChange={() => handleToggleRow(task.id)}
                    className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500"
                  />
                </td>
                {currentColumns.map(col => {
                  const isEditing =
                    editing.taskId === task.id &&
                    ((col.key === 'title' && editing.field === 'title') ||
                      (col.key === 'dueDate' && editing.field === 'dueDate'));

                  let display: React.ReactNode = null;
                  switch (col.key) {
                    case 'title':
                      display = task.title;
                      break;
                    case 'status':
                      display = task.status;
                      break;
                    case 'priority':
                      display = task.priority || '-';
                      break;
                    case 'assignees':
                      display = task.assignees && task.assignees.length > 0
                        ? `${task.assignees.length} مسؤول`
                        : '—';
                      break;
                    case 'dueDate':
                      display = task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString('ar-EG')
                        : '—';
                      break;
                    case 'iteration':
                      display = task.iterationName || '—';
                      break;
                    case 'tags':
                      display = task.tags && task.tags.length > 0
                        ? task.tags.join(', ')
                        : '—';
                      break;
                    case 'createdAt':
                      display = new Date(task.createdAt).toLocaleString('ar-EG');
                      break;
                  }

                  return (
                    <td
                      key={col.key}
                      className="px-3 py-2 align-middle text-xs text-slate-100"
                      style={{ width: columnWidths[col.key], minWidth: columnWidths[col.key] }}
                      onDoubleClick={() => {
                        if (col.key === 'title') {
                          handleStartEditing(task, 'title');
                        } else if (col.key === 'dueDate') {
                          handleStartEditing(task, 'dueDate');
                        }
                      }}
                    >
                      {isEditing ? (
                        <input
                          type={col.key === 'dueDate' ? 'date' : 'text'}
                          value={editing.value}
                          onChange={(e) =>
                            setEditing(prev => ({ ...prev, value: e.target.value }))
                          }
                          onBlur={handleCommitEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommitEdit();
                            if (e.key === 'Escape') {
                              setEditing({ taskId: null, field: null, value: '' });
                            }
                          }}
                          autoFocus
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-sky-500 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                      ) : (
                        <span className="block truncate">{display}</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-right align-middle">
                  <button
                    type="button"
                    onClick={() => handleStartEditing(task, 'title')}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    <Edit3 size={11} />
                    تعديل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/80">
        <div>
          صفحة {page} من {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
          >
            <ChevronRight size={12} />
            السابق
          </button>
          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
          >
            التالي
            <ChevronLeft size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
