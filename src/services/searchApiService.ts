import type { Task } from '../types/task';
import { apiClient } from '../apiClient';

export const searchApiService = {
  /**
   * Global search across all tasks via backend API.
   */
  async searchGlobalTasks(query: string): Promise<{ results: Task[] }> {
    if (!query.trim()) return { results: [] };

    try {
      const response = await apiClient.post<{ tasks: Task[]; lists: unknown[]; total: number }>('/search/global', {
        query: query.trim(),
      });
      return { results: response.data.tasks || [] };
    } catch (error) {
      console.error('Global search failed:', error);
      return { results: [] };
    }
  },

  /**
   * List-specific search within a list's tasks.
   */
  async searchListTasks(
    listId: string,
    _columnIds: string[],
    query: string
  ): Promise<{ results: Task[] }> {
    if (!query.trim()) return { results: [] };

    try {
      const response = await apiClient.post<Task[]>('/tasks/search', {
        query: query.trim(),
        listId,
      });
      return { results: response.data };
    } catch (error) {
      console.error('List search failed:', error);
      return { results: [] };
    }
  },
};
