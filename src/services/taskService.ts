import type { Task } from '../types/task';
import type { SortOptions } from '../components/Kanban/SortDropdown';
import { apiClient } from '../apiClient';

export const taskService = {
  /**
   * Get all tasks for a list
   */
  getTasksForList: async (listId: string, _columnIds?: string[]): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>('/tasks', {
      params: { listId, includeArchived: 'false' },
    });
    return response.data;
  },

  /**
   * Get tasks for a list with server-side sorting.
   */
  getTasksForListSorted: async (
    listId: string,
    _columnIds: string[],
    sort: SortOptions
  ): Promise<Task[]> => {
    // Map frontend sort field names to backend SortField enum values
    const fieldMap: Record<string, string> = {
      dueDate: 'dueDate',
      priority: 'priority',
      createdAt: 'createdAt',
      title: 'title',
      assignee: 'assignee',
      customFields: 'customField',
    };
    const sortField = fieldMap[sort.field] || sort.field;
    const sortDirection = sort.direction === 'asc' ? 'ASC' : 'DESC';

    const response = await apiClient.get<Task[]>('/tasks', {
      params: {
        listId,
        includeArchived: 'false',
        sortField,
        sortDirection,
      },
    });
    return response.data;
  },

  /**
   * Create a new task
   */
  createTask: async (listId: string, data: Pick<Task, 'title' | 'description' | 'status'>): Promise<Task> => {
    const response = await apiClient.post<Task>('/tasks', {
      title: data.title,
      description: data.description,
      listId,
      statusId: data.status,
    });
    return response.data;
  },

  /**
   * Update task properties
   */
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const response = await apiClient.put<Task>(`/tasks/${taskId}`, updates);
    return response.data;
  },

  /**
   * Move task to a different column or reorder within column
   */
  moveTask: async (taskId: string, newStatus: string, newOrder: number): Promise<Task> => {
    const response = await apiClient.put<Task>(`/tasks/${taskId}/move`, {
      statusId: newStatus,
      orderPosition: newOrder,
    });
    return response.data;
  },

  /**
   * Delete a task
   */
  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  /**
   * Get all tasks across all lists (for global search via POST /tasks/search).
   */
  getAllTasks: async (): Promise<Task[]> => {
    const response = await apiClient.post<Task[]>('/tasks/search', {
      query: '',
    });
    return response.data;
  },

  /**
   * Get tasks for a list with simple pagination.
   */
  getTasksForListPaginated: async (
    listId: string,
    _columnIds: string[],
    page: number,
    pageSize: number,
    sort: SortOptions
  ): Promise<{ tasks: Task[]; total: number }> => {
    // Backend does not have native pagination on GET /tasks,
    // so we fetch sorted and slice client-side
    const sorted = await taskService.getTasksForListSorted(listId, _columnIds, sort);
    const total = sorted.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      tasks: sorted.slice(start, end),
      total,
    };
  },

  /**
   * Fetch tasks by due date range (calendar view).
   */
  getTasksByDateRange: async (
    listId: string,
    from: string,
    to: string
  ): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>('/tasks/calendar', {
      params: { listId, start: from, end: to },
    });
    return response.data;
  },

  /**
   * Update only the due date for a task.
   */
  updateTaskDueDate: async (taskId: string, dueDate: string | null): Promise<Task> => {
    return taskService.updateTask(taskId, {
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });
  },

  /**
   * Subscribe to real-time task updates for a list.
   * Returns an unsubscribe function.
   * NOTE: Real-time is handled by socketService; this is a compatibility stub.
   */
  subscribeToTaskUpdates: (
    _listId: string,
    _callback: (tasks: Task[]) => void
  ): () => void => {
    // Real-time updates are handled by socketService (Socket.IO).
    // This stub exists for backward compatibility with components
    // that may still call it.
    return () => {};
  },
};
