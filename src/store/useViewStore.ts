import { create } from 'zustand';
import type { ViewConfig, ViewMode } from '../types/view';
import { viewConfigService } from '../services/viewConfigService';

interface ViewState {
  // Current view mode per list
  viewModes: Map<string, ViewMode>;

  // View configurations
  viewConfigs: Map<string, ViewConfig>;

  // Loading state
  isLoading: boolean;

  // Actions
  loadViewConfig: (listId: string) => Promise<void>;
  setViewMode: (listId: string, mode: ViewMode) => Promise<void>;
  updateViewSettings: (listId: string, settings: ViewConfig['settings']) => Promise<void>;
  getViewMode: (listId: string) => ViewMode;
  getViewConfig: (listId: string) => ViewConfig | undefined;
}

export const useViewStore = create<ViewState>((set, get) => ({
  viewModes: new Map(),
  viewConfigs: new Map(),
  isLoading: false,

  // Load view configuration for a list
  loadViewConfig: async (listId: string) => {
    set({ isLoading: true });
    try {
      const config = await viewConfigService.getViewConfig(listId);
      if (config) {
        set(state => {
          const newViewModes = new Map(state.viewModes);
          const newViewConfigs = new Map(state.viewConfigs);
          newViewModes.set(listId, config.mode);
          newViewConfigs.set(listId, config);
          return { viewModes: newViewModes, viewConfigs: newViewConfigs };
        });
      }
    } catch (error) {
      console.error('Failed to load view config:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Set view mode for a list
  setViewMode: async (listId: string, mode: ViewMode) => {
    // Optimistic update
    set(state => {
      const newViewModes = new Map(state.viewModes);
      newViewModes.set(listId, mode);
      return { viewModes: newViewModes };
    });

    try {
      const currentConfig = get().viewConfigs.get(listId);
      const config = await viewConfigService.saveViewConfig(
        listId,
        mode,
        currentConfig?.settings
      );

      set(state => {
        const newViewConfigs = new Map(state.viewConfigs);
        newViewConfigs.set(listId, config);
        return { viewConfigs: newViewConfigs };
      });
    } catch (error) {
      console.error('Failed to save view mode:', error);
      // Revert on error
      const config = get().viewConfigs.get(listId);
      if (config) {
        set(state => {
          const newViewModes = new Map(state.viewModes);
          newViewModes.set(listId, config.mode);
          return { viewModes: newViewModes };
        });
      }
    }
  },

  // Update view settings
  updateViewSettings: async (listId: string, settings: ViewConfig['settings']) => {
    try {
      const currentMode = get().viewModes.get(listId) || 'kanban';
      const config = await viewConfigService.saveViewConfig(listId, currentMode, settings);

      set(state => {
        const newViewConfigs = new Map(state.viewConfigs);
        newViewConfigs.set(listId, config);
        return { viewConfigs: newViewConfigs };
      });
    } catch (error) {
      console.error('Failed to save view settings:', error);
    }
  },

  // Get current view mode for a list
  getViewMode: (listId: string) => {
    return get().viewModes.get(listId) || 'kanban';
  },

  // Get view config for a list
  getViewConfig: (listId: string) => {
    return get().viewConfigs.get(listId);
  }
}));
