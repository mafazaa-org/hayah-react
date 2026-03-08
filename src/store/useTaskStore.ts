import { create } from 'zustand';
import type { Task } from '../types/task';
import { taskService } from '../services/taskService';
import { bulkOperationService, type BulkEditPayload } from '../services/bulkOperationService';
import type { FilterOptions } from '../components/Kanban/FilterPanel';
import type { SortOptions } from '../components/Kanban/SortDropdown';
import { socketService } from '../services/socketService';

interface TaskState {
  // State
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  currentListId: string | null;

  // Modal state
  isCreateTaskModalOpen: boolean;
  selectedColumnId: string | null;

  // Filter & Sort state
  filters: FilterOptions;
  sort: SortOptions;
  searchQuery: string;

  // Selection state
  selectedTaskIds: Set<string>;
  isSelectionMode: boolean;

  // Actions
  fetchTasks: (listId: string, columnIds: string[]) => Promise<void>;
  addTask: (listId: string, data: Pick<Task, 'title' | 'description' | 'status'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  moveTask: (taskId: string, newStatus: string, newOrder: number) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // Modal actions
  openCreateTaskModal: (columnId?: string) => void;
  closeCreateTaskModal: () => void;

  // Filter & Sort actions
  setFilters: (filters: FilterOptions) => void;
  setSort: (sort: SortOptions) => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  clearFilters: () => void;
  setIterationFilter: (iterationIds: string[]) => void;
  hasActiveFilters: () => boolean;

  // Selection actions
  toggleTaskSelection: (taskId: string) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;
  toggleSelectionMode: () => void;
  bulkDeleteTasks: () => Promise<void>;
  bulkEditTasks: (payload: BulkEditPayload) => Promise<void>;
  bulkMoveTasks: (targetStatus: string) => Promise<void>;
  addImportedTasks: (tasks: Task[]) => void;

  // Utility
  getTasksByColumn: (columnId: string) => Task[];
  getFilteredAndSortedTasks: () => Task[];
  getAvailableTags: () => string[];

  // Socket
  initializeSocketListeners: () => void;
  removeSocketListeners: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // Initial state
  tasks: [],
  isLoading: false,
  error: null,
  currentListId: null,
  isCreateTaskModalOpen: false,
  selectedColumnId: null,

  // Filter & Sort initial state
  filters: {
    priorities: [],
    tags: [],
    statuses: [],
    assignees: [],
    hasAssignee: null,
    dueDateRange: null,
    customFields: [],
    iterations: [],
    matchMode: 'AND'
  },
  sort: {
    field: 'createdAt',
    direction: 'desc'
  },

  // Selection initial state
  selectedTaskIds: new Set(),
  isSelectionMode: false,

  // Search initial state
  searchQuery: '',

  // Fetch tasks for a list
  fetchTasks: async (listId: string, columnIds: string[]) => {
    set({ isLoading: true, error: null, currentListId: listId });
    try {
      const { sort } = get();
      const tasks = await taskService.getTasksForListSorted(listId, columnIds, sort);
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      set({ error: 'فشل تحميل المهام', isLoading: false });
    }
  },

  // Add a new task
  addTask: async (listId: string, data: Pick<Task, 'title' | 'description' | 'status'>) => {
    set({ isLoading: true });
    try {
      const newTask = await taskService.createTask(listId, data);
      set(state => ({
        tasks: [...state.tasks, newTask],
        isLoading: false,
        isCreateTaskModalOpen: false,
        selectedColumnId: null
      }));
    } catch (error) {
      console.error('Failed to create task:', error);
      set({ error: 'فشل إنشاء المهمة', isLoading: false });
    }
  },

  // Update task properties
  updateTask: async (taskId: string, updates: Partial<Task>) => {
    set({ isLoading: true });
    try {
      const updatedTask = await taskService.updateTask(taskId, updates);
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === taskId ? updatedTask : task
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to update task:', error);
      set({ error: 'فشل تحديث المهمة', isLoading: false });
    }
  },

  // Move task to different column or reorder
  moveTask: async (taskId: string, newStatus: string, newOrder: number) => {
    // Optimistic update
    const { tasks } = get();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    const oldStatus = task.status;

    // Create updated tasks array
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus, order: newOrder };
      }
      // Reorder tasks in old column
      if (t.status === oldStatus && t.order > task.order) {
        return { ...t, order: t.order - 1 };
      }
      // Reorder tasks in new column
      if (t.status === newStatus && t.order >= newOrder) {
        return { ...t, order: t.order + 1 };
      }
      return t;
    });

    set({ tasks: updatedTasks });

    try {
      await taskService.moveTask(taskId, newStatus, newOrder);
    } catch (error) {
      console.error('Failed to move task:', error);
      // Revert on error
      set({ tasks, error: 'فشل نقل المهمة' });
    }
  },

  // Delete a task
  deleteTask: async (taskId: string) => {
    set({ isLoading: true });
    try {
      await taskService.deleteTask(taskId);
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== taskId),
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to delete task:', error);
      set({ error: 'فشل حذف المهمة', isLoading: false });
    }
  },

  // Modal actions
  openCreateTaskModal: (columnId?: string) => {
    set({ isCreateTaskModalOpen: true, selectedColumnId: columnId || null });
  },

  closeCreateTaskModal: () => {
    set({ isCreateTaskModalOpen: false, selectedColumnId: null });
  },

  // Get tasks for a specific column, sorted by order
  getTasksByColumn: (columnId: string) => {
    const { tasks } = get();
    return tasks
      .filter(task => task.status === columnId)
      .sort((a, b) => a.order - b.order);
  },

  // Filter & Sort actions
  setFilters: (filters: FilterOptions) => {
    set({ filters });
  },

  setSort: (sort: SortOptions) => {
    set({ sort });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  clearSearch: () => {
    set({ searchQuery: '' });
  },

  clearFilters: () => {
    set({
      filters: {
        priorities: [],
        tags: [],
        statuses: [],
        assignees: [],
        hasAssignee: null,
        dueDateRange: null,
        customFields: [],
        iterations: [],
        matchMode: 'AND'
      }
    });
  },

  setIterationFilter: (iterationIds: string[]) => {
    set(state => ({
      filters: { ...state.filters, iterations: iterationIds }
    }));
  },

  hasActiveFilters: () => {
    const { filters } = get();
    return filters.priorities.length > 0 ||
      filters.tags.length > 0 ||
      filters.statuses.length > 0 ||
      filters.assignees.length > 0 ||
      filters.iterations.length > 0 ||
      filters.hasAssignee !== null ||
      filters.dueDateRange !== null ||
      filters.customFields.length > 0;
  },

  // Selection actions
  toggleTaskSelection: (taskId: string) => {
    set(state => {
      const newSelection = new Set(state.selectedTaskIds);
      if (newSelection.has(taskId)) {
        newSelection.delete(taskId);
      } else {
        newSelection.add(taskId);
      }
      return { selectedTaskIds: newSelection };
    });
  },

  selectAllTasks: () => {
    const { tasks } = get();
    set({ selectedTaskIds: new Set(tasks.map(t => t.id)) });
  },

  clearSelection: () => {
    set({ selectedTaskIds: new Set(), isSelectionMode: false });
  },

  toggleSelectionMode: () => {
    set(state => ({
      isSelectionMode: !state.isSelectionMode,
      selectedTaskIds: new Set()
    }));
  },

  bulkDeleteTasks: async () => {
    const { selectedTaskIds } = get();
    const taskIds = Array.from(selectedTaskIds);

    set({ isLoading: true });
    try {
      await Promise.all(taskIds.map(id => taskService.deleteTask(id)));
      set(state => ({
        tasks: state.tasks.filter(task => !selectedTaskIds.has(task.id)),
        selectedTaskIds: new Set(),
        isSelectionMode: false,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to delete tasks:', error);
      set({ error: 'فشل حذف المهام', isLoading: false });
    }
  },

  bulkEditTasks: async (payload: BulkEditPayload) => {
    const { selectedTaskIds } = get();
    const taskIds = Array.from(selectedTaskIds);
    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(task =>
        selectedTaskIds.has(task.id)
          ? { ...task, ...payload, updatedAt: new Date().toISOString() }
          : task
      ),
      selectedTaskIds: new Set(),
      isSelectionMode: false,
    }));
    try {
      await bulkOperationService.bulkEdit(taskIds, payload);
    } catch (error) {
      console.error('Failed to bulk edit tasks:', error);
      set({ error: 'فشل تعديل المهام' });
    }
  },

  bulkMoveTasks: async (targetStatus: string) => {
    const { selectedTaskIds } = get();
    const taskIds = Array.from(selectedTaskIds);
    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(task =>
        selectedTaskIds.has(task.id)
          ? { ...task, status: targetStatus, updatedAt: new Date().toISOString() }
          : task
      ),
      selectedTaskIds: new Set(),
      isSelectionMode: false,
    }));
    try {
      await bulkOperationService.bulkMove(taskIds, targetStatus);
    } catch (error) {
      console.error('Failed to bulk move tasks:', error);
      set({ error: 'فشل نقل المهام' });
    }
  },

  addImportedTasks: (newTasks: Task[]) => {
    set(state => ({
      tasks: [...state.tasks, ...newTasks],
    }));
  },

  // Utility functions
  getFilteredAndSortedTasks: () => {
    const { tasks, filters, sort, searchQuery } = get();

    // Apply filters with support for AND/OR match mode and custom fields
    let filtered = tasks.filter(task => {
      const predicates: boolean[] = [];

      // Status filter
      if (filters.statuses.length > 0) {
        predicates.push(filters.statuses.includes(task.status));
      }

      // Priority filter
      if (filters.priorities.length > 0) {
        predicates.push(!!task.priority && filters.priorities.includes(task.priority));
      }

      // Assignee filter
      if (filters.assignees.length > 0) {
        const taskAssignees = task.assignees || [];
        predicates.push(filters.assignees.some(a => taskAssignees.includes(a)));
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const taskTags = task.tags || [];
        predicates.push(filters.tags.some(tag => taskTags.includes(tag)));
      }

      // Has assignee filter
      if (filters.hasAssignee !== null) {
        const hasAnyAssignee = (task.assignees || []).length > 0;
        predicates.push(filters.hasAssignee ? hasAnyAssignee : !hasAnyAssignee);
      }

      // Due date filter
      if (filters.dueDateRange && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        let matchesDue = true;

        switch (filters.dueDateRange) {
          case 'overdue':
            matchesDue = dueDate < now;
            break;
          case 'today':
            matchesDue = dueDate.toDateString() === now.toDateString();
            break;
          case 'week': {
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            matchesDue = dueDate <= weekFromNow;
            break;
          }
          case 'month': {
            const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            matchesDue = dueDate <= monthFromNow;
            break;
          }
        }

        predicates.push(matchesDue);
      }

      // Custom fields filter (all custom-field conditions must match for this predicate)
      if (filters.customFields.length > 0) {
        const customMatch = filters.customFields.every(cf => {
          if (!cf.key || !cf.value) return true;
          const value = task.customFields?.[cf.key];
          if (value === undefined || value === null) return false;
          return String(value).toLowerCase().includes(cf.value.toLowerCase());
        });
        predicates.push(customMatch);
      }

      // Iteration Filter
      if (filters.iterations.length > 0) {
        const matchesIteration = filters.iterations.includes(task.iterationId || '');
        predicates.push(matchesIteration);
      }

      // If there are no active predicates, the task is included
      if (predicates.length === 0) return true;

      return filters.matchMode === 'AND'
        ? predicates.every(Boolean)
        : predicates.some(Boolean);
    });

    // Text search (title, description, tags)
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(task => {
        const inTitle = task.title.toLowerCase().includes(query);
        const inDescription = (task.description || '').toLowerCase().includes(query);
        const inTags = (task.tags || []).some(tag => tag.toLowerCase().includes(query));
        return inTitle || inDescription || inTags;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
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
          comparison = prioB - prioA; // Higher priority first
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

    return filtered;
  },

  getAvailableTags: () => {
    const { tasks } = get();
    const tagsSet = new Set<string>();
    tasks.forEach(task => {
      task.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  },

  initializeSocketListeners: () => {
    socketService.off('task_updated');
    socketService.on('task_updated', (data) => {
      // Optimistically update lists without re-fetching
      set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === data.taskId ? { ...task, ...data } : task
        )
      }));
    });
  },

  removeSocketListeners: () => {
    socketService.off('task_updated');
  }
}));
