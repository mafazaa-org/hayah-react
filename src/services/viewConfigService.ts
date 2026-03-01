import type { ViewConfig, ViewMode } from '../types/view';

const STORAGE_PREFIX = 'hayah_view_config_';

// Simulated delay for async operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const viewConfigService = {
  /**
   * Get saved view configuration for a list
   */
  getViewConfig: async (listId: string): Promise<ViewConfig | null> => {
    await delay(200);

    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${listId}`);
      if (stored) {
        const config = JSON.parse(stored) as ViewConfig;
        console.log(`Loaded view config for list ${listId}:`, config);
        return config;
      }
    } catch (error) {
      console.error('Failed to load view config:', error);
    }

    // Return default config
    return {
      listId,
      mode: 'kanban',
      settings: {
        density: 'comfortable'
      }
    };
  },

  /**
   * Save view configuration for a list
   */
  saveViewConfig: async (listId: string, mode: ViewMode, settings?: ViewConfig['settings']): Promise<ViewConfig> => {
    await delay(200);

    const config: ViewConfig = {
      listId,
      mode,
      settings,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(`${STORAGE_PREFIX}${listId}`, JSON.stringify(config));
      console.log(`Saved view config for list ${listId}:`, config);
    } catch (error) {
      console.error('Failed to save view config:', error);
    }

    return config;
  },

  /**
   * Clear view configuration for a list
   */
  clearViewConfig: async (listId: string): Promise<void> => {
    await delay(200);

    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${listId}`);
      console.log(`Cleared view config for list ${listId}`);
    } catch (error) {
      console.error('Failed to clear view config:', error);
    }
  },

  /**
   * Get all saved view configurations
   */
  getAllViewConfigs: async (): Promise<ViewConfig[]> => {
    await delay(200);

    const configs: ViewConfig[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            configs.push(JSON.parse(stored));
          }
        }
      }
    } catch (error) {
      console.error('Failed to load all view configs:', error);
    }

    return configs;
  }
};
