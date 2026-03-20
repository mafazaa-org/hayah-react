import { useState, useCallback } from 'react';
import { taskService } from '../services/taskService';
import type { Task } from '../types/task';
import type { SortOptions } from '../components/Kanban/SortDropdown';

interface PaginatedState {
  tasks: Task[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UsePaginatedTasksReturn extends PaginatedState {
  loadMore: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  reset: () => void;
  refresh: () => Promise<void>;
}

/**
 * Hook for paginated task fetching.
 * Wraps `taskService.getTasksForListPaginated` and manages page state.
 */
export function usePaginatedTasks(
  listId: string,
  columnIds: string[],
  sort: SortOptions,
  pageSize = 20
): UsePaginatedTasksReturn {
  const [state, setState] = useState<PaginatedState>({
    tasks: [],
    page: 1,
    pageSize,
    total: 0,
    hasMore: true,
    isLoading: false,
    error: null,
  });

  const fetchPage = useCallback(
    async (page: number, append = false) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await taskService.getTasksForListPaginated(
          listId,
          columnIds,
          page,
          pageSize,
          sort
        );
        setState(prev => ({
          ...prev,
          tasks: append ? [...prev.tasks, ...result.tasks] : result.tasks,
          page,
          total: result.total,
          hasMore: page * pageSize < result.total,
          isLoading: false,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'فشل تحميل المهام';
        setState(prev => ({ ...prev, error: message, isLoading: false }));
      }
    },
    [listId, columnIds, pageSize, sort]
  );

  const loadMore = useCallback(async () => {
    if (state.isLoading || !state.hasMore) return;
    await fetchPage(state.page + 1, true);
  }, [state.isLoading, state.hasMore, state.page, fetchPage]);

  const goToPage = useCallback(
    async (page: number) => {
      await fetchPage(page, false);
    },
    [fetchPage]
  );

  const reset = useCallback(() => {
    setState({
      tasks: [],
      page: 1,
      pageSize,
      total: 0,
      hasMore: true,
      isLoading: false,
      error: null,
    });
  }, [pageSize]);

  const refresh = useCallback(async () => {
    await fetchPage(1, false);
  }, [fetchPage]);

  return { ...state, loadMore, goToPage, reset, refresh };
}
