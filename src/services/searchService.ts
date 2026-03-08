// Search Service — localStorage-backed mock for recent & saved searches
import { taskService } from './taskService';
import type { Task } from '../types/task';

const RECENT_SEARCHES_KEY = 'hayah_recent_searches';
const SAVED_SEARCHES_KEY = 'hayah_saved_searches';
const MAX_RECENT_SEARCHES = 10;

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  // future expansion: filters?: Record<string, any>;
}

export const searchService = {
  /**
   * Get recent search queries from localStorage
   */
  getRecentSearches(): string[] {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * Add a search query to recent searches
   */
  addRecentSearch(query: string): void {
    if (!query.trim()) return;

    const recent = searchService.getRecentSearches();
    // Remove duplicate if exists
    const filtered = recent.filter(q => q !== query);
    // Add to front
    filtered.unshift(query);
    // Trim to max
    const trimmed = filtered.slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(trimmed));
  },

  /**
   * Remove a single recent search
   */
  removeRecentSearch(query: string): void {
    const recent = searchService.getRecentSearches();
    const filtered = recent.filter(q => q !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
  },

  /**
   * Clear all recent searches
   */
  clearRecentSearches(): void {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  },

  /**
   * Get saved searches
   */
  getSavedSearches(): SavedSearch[] {
    try {
      const stored = localStorage.getItem(SAVED_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * Save a new search configuration
   */
  saveSearch(name: string, query: string): SavedSearch {
    const saved = searchService.getSavedSearches();
    const newSaved: SavedSearch = {
      id: `save-${Date.now()}`,
      name,
      query
    };
    saved.push(newSaved);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(saved));
    return newSaved;
  },

  /**
   * Delete a saved search
   */
  deleteSavedSearch(id: string): void {
    const saved = searchService.getSavedSearches();
    const filtered = saved.filter(s => s.id !== id);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(filtered));
  },

  /**
   * Global cross-list task search
   */
  searchTasks: async (
    query: string,
    filters?: { assignee?: string; status?: string }
  ): Promise<Task[]> => {
    // Artificial mock delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Fallback: get all tasks. If backend was real, this is a database LIKE / text query.
    let allTasks = await taskService.getAllTasks();

    const q = query.trim().toLowerCase();

    if (q) {
      allTasks = allTasks.filter(task => {
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        return matchTitle || matchDesc;
      });
    }

    if (filters?.assignee) {
      allTasks = allTasks.filter(t => t.assignees?.includes(filters.assignee!));
    }

    if (filters?.status) {
      allTasks = allTasks.filter(t => t.status === filters.status);
    }

    return allTasks;
  }
};
