import type { Task } from '../types/task';
import type { SortOptions } from '../components/Kanban/SortDropdown';

// Simulated delay for async operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data store - tasks grouped by list
const mockTasksStore = new Map<string, Task[]>();

// Sample mock tasks for demonstration
const createSampleTasks = (listId: string, columnIds: string[]): Task[] => {
  const now = new Date().toISOString();

  return [
    {
      id: `task-${listId}-1`,
      title: 'تصميم واجهة المستخدم',
      description: 'إنشاء تصميم أولي للصفحة الرئيسية',
      status: columnIds[0],
      priority: 'high',
      assignees: ['user-1', 'user-2'],
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      tags: ['تصميم', 'UI'],
      subtaskStats: { completed: 1, total: 4 },
      checklistStats: { completed: 2, total: 5 },
      iterationName: 'السباق 1',
      attachmentsCount: 3,
      dependencyCount: 1,
      customFields: {
        'العميل': 'شركة ألف',
        'القيمة': 12000
      },
      createdAt: now,
      updatedAt: now,
      order: 0
    },
    {
      id: `task-${listId}-2`,
      title: 'مراجعة الكود',
      description: 'مراجعة التغييرات الأخيرة',
      status: columnIds[1],
      priority: 'medium',
      assignees: ['user-3'],
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      tags: ['مراجعة'],
      subtaskStats: { completed: 0, total: 2 },
      checklistStats: { completed: 0, total: 3 },
      iterationName: 'السباق 1',
      attachmentsCount: 1,
      dependencyCount: 0,
      customFields: {
        'الوحدة': 'الواجهة الأمامية'
      },
      createdAt: now,
      updatedAt: now,
      order: 0
    },
    {
      id: `task-${listId}-3`,
      title: 'إصلاح الأخطاء',
      description: 'إصلاح المشاكل المعروفة',
      status: columnIds[0],
      priority: 'critical',
      assignees: ['user-4', 'user-5', 'user-2'],
      tags: ['bug'],
      subtaskStats: { completed: 3, total: 3 },
      checklistStats: { completed: 1, total: 1 },
      iterationName: 'السباق 2',
      attachmentsCount: 0,
      dependencyCount: 2,
      customFields: {
        'الأولوية الداخلية': 'مرتفعة جداً'
      },
      createdAt: now,
      updatedAt: now,
      order: 1
    }
  ];
};

export const taskService = {
  /**
   * Get all tasks for a list
   */
  getTasksForList: async (listId: string, columnIds: string[]): Promise<Task[]> => {
    await delay(400);

    if (!mockTasksStore.has(listId)) {
      // Initialize with sample tasks
      const sampleTasks = createSampleTasks(listId, columnIds);
      mockTasksStore.set(listId, sampleTasks);
    }

    console.log(`Fetching tasks for list ${listId}`);
    return mockTasksStore.get(listId) || [];
  },

  /**
   * Get tasks for a list with server-side sorting (mock).
   * This simulates handling sort parameters in the API.
   */
  getTasksForListSorted: async (
    listId: string,
    columnIds: string[],
    sort: SortOptions
  ): Promise<Task[]> => {
    const tasks = await taskService.getTasksForList(listId, columnIds);

    const sorted = [...tasks].sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'dueDate': {
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = dateA - dateB;
          break;
        }
        case 'priority': {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const prioA = a.priority ? priorityOrder[a.priority] : 0;
          const prioB = b.priority ? priorityOrder[b.priority] : 0;
          comparison = prioB - prioA;
          break;
        }
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title, 'ar');
          break;
        case 'assignee': {
          const countA = (a.assignees || []).length;
          const countB = (b.assignees || []).length;
          comparison = countA - countB;
          break;
        }
        case 'customFields': {
          const valA = a.customFields ? Object.values(a.customFields).join(' ').toString() : '';
          const valB = b.customFields ? Object.values(b.customFields).join(' ').toString() : '';
          comparison = valA.localeCompare(valB, 'ar');
          break;
        }
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  },

  /**
   * Create a new task
   */
  createTask: async (listId: string, data: Pick<Task, 'title' | 'description' | 'status'>): Promise<Task> => {
    await delay(400);
    const tasks = mockTasksStore.get(listId) || [];

    // Calculate order (last in the column)
    const tasksInColumn = tasks.filter(t => t.status === data.status);
    const order = tasksInColumn.length;

    const newTask: Task = {
      id: `task-${listId}-${Date.now()}`,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: 'medium',
      assignees: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order
    };

    tasks.push(newTask);
    mockTasksStore.set(listId, tasks);

    console.log('Created task:', newTask);
    return newTask;
  },

  /**
   * Update task properties
   */
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    await delay(300);

    // Find the task across all lists
    for (const [listId, tasks] of mockTasksStore.entries()) {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        const updatedTask = {
          ...tasks[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        tasks[taskIndex] = updatedTask;
        mockTasksStore.set(listId, tasks);
        console.log('Updated task:', updatedTask);
        return updatedTask;
      }
    }

    throw new Error(`Task ${taskId} not found`);
  },

  /**
   * Move task to a different column or reorder within column
   */
  moveTask: async (taskId: string, newStatus: string, newOrder: number): Promise<Task> => {
    await delay(300);

    for (const [listId, tasks] of mockTasksStore.entries()) {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        const task = tasks[taskIndex];
        const oldStatus = task.status;

        // Update task status and order
        task.status = newStatus;
        task.order = newOrder;
        task.updatedAt = new Date().toISOString();

        // Reorder tasks in old column
        tasks
          .filter(t => t.status === oldStatus && t.id !== taskId)
          .sort((a, b) => a.order - b.order)
          .forEach((t, index) => {
            t.order = index;
          });

        // Reorder tasks in new column
        tasks
          .filter(t => t.status === newStatus)
          .sort((a, b) => a.order - b.order)
          .forEach((t, index) => {
            t.order = index;
          });

        mockTasksStore.set(listId, tasks);
        console.log(`Moved task ${taskId} to ${newStatus} at position ${newOrder}`);
        return task;
      }
    }

    throw new Error(`Task ${taskId} not found`);
  },

  /**
   * Delete a task
   */
  deleteTask: async (taskId: string): Promise<void> => {
    await delay(400);

    for (const [listId, tasks] of mockTasksStore.entries()) {
      const filteredTasks = tasks.filter(t => t.id !== taskId);
      if (filteredTasks.length !== tasks.length) {
        mockTasksStore.set(listId, filteredTasks);
        console.log(`Deleted task ${taskId}`);
        return;
      }
    }

    throw new Error(`Task ${taskId} not found`);
  },

  /**
   * Get all tasks across all lists (mock helper for global search).
   */
  getAllTasks: async (): Promise<Task[]> => {
    // In a real implementation this would be a dedicated API endpoint.
    // Here we flatten the in-memory store.
    const all: Task[] = [];
    for (const tasks of mockTasksStore.values()) {
      all.push(...tasks);
    }
    return all;
  },

  /**
   * Get tasks for a list with simple pagination (mock).
   */
  getTasksForListPaginated: async (
    listId: string,
    columnIds: string[],
    page: number,
    pageSize: number,
    sort: SortOptions
  ): Promise<{ tasks: Task[]; total: number }> => {
    const sorted = await taskService.getTasksForListSorted(listId, columnIds, sort);
    const total = sorted.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      tasks: sorted.slice(start, end),
      total
    };
  },

  /**
   * Fetch tasks by due date range (inclusive).
   */
  getTasksByDateRange: async (
    listId: string,
    from: string,
    to: string
  ): Promise<Task[]> => {
    await delay(250);
    const tasks = mockTasksStore.get(listId) || [];
    const fromDate = new Date(from).getTime();
    const toDate = new Date(to).getTime();
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const time = new Date(task.dueDate).getTime();
      return time >= fromDate && time <= toDate;
    });
  },

  /**
   * Update only the due date for a task.
   */
  updateTaskDueDate: async (taskId: string, dueDate: string | null): Promise<Task> => {
    return taskService.updateTask(taskId, {
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
    });
  },

  /**
   * Subscribe to mock real-time task updates for a list.
   * Returns an unsubscribe function.
   */
  subscribeToTaskUpdates: (
    listId: string,
    callback: (tasks: Task[]) => void
  ): () => void => {
    // In a real app, this would open a WebSocket connection.
    // Here we simulate periodic refreshes.
    let isActive = true;
    const intervalId = setInterval(async () => {
      if (!isActive) return;
      const columns = mockTasksStore.get(listId) || [];
      const tasks = columns;
      callback(tasks);
    }, 5000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }
};
