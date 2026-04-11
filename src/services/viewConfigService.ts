import type { ViewConfig, ViewMode } from '../types/view';
import { apiClient } from '../apiClient';

export const viewConfigService = {
  /**
   * Get saved view configuration for a list
   */
  getViewConfig: async (listId: string): Promise<ViewConfig | null> => {
    try {
      const response = await apiClient.get<Array<Record<string, unknown>>>('/lists/views', {
        params: { listId },
      });
      const views = response.data;
      if (views && views.length > 0) {
        const view = views[0];
        return {
          listId,
          mode: (view.type as ViewMode) || 'kanban',
          settings: (view.config as ViewConfig['settings']) || { density: 'comfortable' },
          updatedAt: view.updatedAt as string,
        };
      }
    } catch (error) {
      console.error('Failed to load view config:', error);
    }

    // Return default config
    return {
      listId,
      mode: 'kanban',
      settings: {
        density: 'comfortable',
      },
    };
  },

  /**
   * Save view configuration for a list
   */
  saveViewConfig: async (listId: string, mode: ViewMode, settings?: ViewConfig['settings']): Promise<ViewConfig> => {
    // Check if a view already exists for this list
    let existingViewId: string | null = null;
    try {
      const response = await apiClient.get<Array<Record<string, unknown>>>('/lists/views', {
        params: { listId },
      });
      if (response.data && response.data.length > 0) {
        existingViewId = response.data[0].id as string;
      }
    } catch {
      // No existing view
    }

    const config: ViewConfig = {
      listId,
      mode,
      settings,
      updatedAt: new Date().toISOString(),
    };

    if (existingViewId) {
      await apiClient.put(`/lists/views/${existingViewId}`, {
        name: `${mode} View`,
        type: mode,
        config: settings || {},
      });
    } else {
      await apiClient.post('/lists/views', {
        name: `${mode} View`,
        listId,
        type: mode,
        config: settings || {},
      });
    }

    return config;
  },

  /**
   * Clear view configuration for a list
   */
  clearViewConfig: async (listId: string): Promise<void> => {
    try {
      const response = await apiClient.get<Array<Record<string, unknown>>>('/lists/views', {
        params: { listId },
      });
      if (response.data) {
        for (const view of response.data) {
          await apiClient.delete(`/lists/views/${view.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to clear view config:', error);
    }
  },

  /**
   * Get all saved view configurations
   */
  getAllViewConfigs: async (): Promise<ViewConfig[]> => {
    try {
      const response = await apiClient.get<Array<Record<string, unknown>>>('/lists/views');
      return response.data.map((view) => ({
        listId: view.listId as string,
        mode: (view.type as ViewMode) || 'kanban',
        settings: (view.config as ViewConfig['settings']) || {},
        updatedAt: view.updatedAt as string,
      }));
    } catch (error) {
      console.error('Failed to load all view configs:', error);
      return [];
    }
  },
};
