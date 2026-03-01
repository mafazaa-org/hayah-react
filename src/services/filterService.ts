import type { FilterOptions } from '../components/Kanban/FilterPanel';

export interface FilterPreset {
  id: string;
  name: string;
  listId: string;
  filters: FilterOptions;
  createdAt: string;
}

const STORAGE_KEY = 'hayah_filter_presets';

function getAllPresets(): FilterPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistPresets(presets: FilterPreset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export const filterService = {
  /**
   * Get all filter presets for a specific list
   */
  getPresets(listId: string): FilterPreset[] {
    return getAllPresets().filter(p => p.listId === listId);
  },

  /**
   * Save a new filter preset
   */
  savePreset(listId: string, name: string, filters: FilterOptions): FilterPreset {
    const presets = getAllPresets();
    const newPreset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name,
      listId,
      filters,
      createdAt: new Date().toISOString()
    };
    presets.push(newPreset);
    persistPresets(presets);
    return newPreset;
  },

  /**
   * Delete a filter preset by ID
   */
  deletePreset(presetId: string): void {
    const presets = getAllPresets().filter(p => p.id !== presetId);
    persistPresets(presets);
  }
};
