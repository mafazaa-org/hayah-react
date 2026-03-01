// Search API Service (mock)
// Provides global and list-specific task search with basic caching.

import type { Task } from '../types/task';
import { taskService } from './taskService';

// Simple in-memory caches for search results (per session)
const globalSearchCache = new Map<string, Task[]>();
const listSearchCache = new Map<string, Task[]>();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function applyTextSearch(tasks: Task[], query: string): Task[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return tasks;

  return tasks.filter(task => {
    const inTitle = task.title.toLowerCase().includes(normalized);
    const inDescription = (task.description || '').toLowerCase().includes(normalized);
    const inTags = (task.tags || []).some(tag => tag.toLowerCase().includes(normalized));
    return inTitle || inDescription || inTags;
  });
}

export const searchApiService = {
  /**
   * Global search across all tasks (mock API).
   * Results are cached per-query for the current session.
   */
  async searchGlobalTasks(query: string): Promise<{ results: Task[] }> {
    const normalized = normalizeQuery(query);
    if (!normalized) return { results: [] };

    if (globalSearchCache.has(normalized)) {
      return { results: globalSearchCache.get(normalized) || [] };
    }

    try {
      await delay(300);
      const allTasks = await taskService.getAllTasks();
      const results = applyTextSearch(allTasks, normalized);
      globalSearchCache.set(normalized, results);
      return { results };
    } catch (error) {
      console.error('Global search failed:', error);
      return { results: [] };
    }
  },

  /**
   * List-specific search within a list's tasks (mock API).
   * Uses listId and columnIds to fetch tasks via taskService.
   */
  async searchListTasks(
    listId: string,
    columnIds: string[],
    query: string
  ): Promise<{ results: Task[] }> {
    const normalized = normalizeQuery(query);
    if (!normalized) return { results: [] };

    const cacheKey = `${listId}::${normalized}`;
    if (listSearchCache.has(cacheKey)) {
      return { results: listSearchCache.get(cacheKey) || [] };
    }

    try {
      await delay(250);
      const tasks = await taskService.getTasksForList(listId, columnIds);
      const results = applyTextSearch(tasks, normalized);
      listSearchCache.set(cacheKey, results);
      return { results };
    } catch (error) {
      console.error('List search failed:', error);
      return { results: [] };
    }
  }
};

