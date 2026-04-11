import type { Task } from '../types/task';
import { apiClient } from '../apiClient';

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
}

export const searchService = {
  /**
   * Get recent search queries from backend
   */
  getRecentSearches: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<{ id: string; query: string }[]>('/search/recent', {
        params: { limit: '10' },
      });
      return response.data.map(s => s.query);
    } catch {
      return [];
    }
  },

  /**
   * Add a search query to recent searches (auto-saved by backend on global search)
   */
  addRecentSearch(_query: string): void {
    // The backend automatically saves search history when POST /search/global is called.
    // No separate API call needed.
  },

  /**
   * Remove a single recent search — backend only supports clearing all
   */
  removeRecentSearch(_query: string): void {
    // Backend doesn't support removing individual search history items.
    // This is a no-op; user can clear all via clearRecentSearches.
  },

  /**
   * Clear all recent searches
   */
  clearRecentSearches: async (): Promise<void> => {
    await apiClient.delete('/search/history');
  },

  /**
   * Get saved searches
   */
  getSavedSearches: async (): Promise<SavedSearch[]> => {
    try {
      const response = await apiClient.get<SavedSearch[]>('/search/saved');
      return response.data;
    } catch {
      return [];
    }
  },

  /**
   * Save a new search configuration
   */
  saveSearch: async (name: string, query: string): Promise<SavedSearch> => {
    const response = await apiClient.post<SavedSearch>('/search/saved', {
      name,
      query,
    });
    return response.data;
  },

  /**
   * Delete a saved search
   */
  deleteSavedSearch: async (id: string): Promise<void> => {
    await apiClient.delete(`/search/saved/${id}`);
  },

  /**
   * Global cross-list task search
   */
  searchTasks: async (
    query: string,
    filters?: { assignee?: string; status?: string }
  ): Promise<Task[]> => {
    const response = await apiClient.post<{ tasks: Task[]; lists: unknown[]; total: number }>('/search/global', {
      query,
      filters,
    });
    // The global search returns { tasks, lists, total }
    return response.data.tasks || [];
  },
};
