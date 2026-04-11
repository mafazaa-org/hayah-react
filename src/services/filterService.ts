import type { FilterOptions } from '../components/Kanban/FilterPanel';
import { apiClient } from '../apiClient';

export interface FilterPreset {
  id: string;
  name: string;
  listId: string;
  filters: FilterOptions;
  createdAt: string;
}

export const filterService = {
  /**
   * Get all filter presets for a specific list
   */
  getPresets: async (listId: string): Promise<FilterPreset[]> => {
    try {
      const response = await apiClient.get<FilterPreset[]>('/lists/filter-presets', {
        params: { listId },
      });
      return response.data;
    } catch {
      return [];
    }
  },

  /**
   * Save a new filter preset
   */
  savePreset: async (listId: string, name: string, filters: FilterOptions): Promise<FilterPreset> => {
    const response = await apiClient.post<FilterPreset>('/lists/filter-presets', {
      name,
      listId,
      filterConfig: filters,
      includeArchived: false,
    });
    return response.data;
  },

  /**
   * Delete a filter preset by ID
   */
  deletePreset: async (presetId: string): Promise<void> => {
    await apiClient.delete(`/lists/filter-presets/${presetId}`);
  },
};
