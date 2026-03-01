// Search Service — localStorage-backed mock for recent & saved searches
// TODO (Phase 13): Add global search across all lists/tasks via API

const RECENT_SEARCHES_KEY = 'hayah_recent_searches';
const MAX_RECENT_SEARCHES = 10;

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

  // TODO (Phase 13): savedSearches CRUD
  // TODO (Phase 13): searchTasks(query, filters?) — global cross-list search
};
