import type { NavigationItem } from './folderService';
import { apiClient } from '../apiClient';

// Extended list details
export interface ListDetails extends NavigationItem {
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string;
  members?: string[];
}

export const listService = {
  getListDetails: async (id: string): Promise<ListDetails> => {
    const response = await apiClient.get<ListDetails>(`/lists/${id}`);
    return { ...response.data, type: 'list' };
  },

  updateList: async (id: string, updates: Partial<ListDetails>): Promise<void> => {
    await apiClient.put(`/lists/${id}`, {
      name: updates.name,
      description: updates.description,
      visibility: updates.visibility,
    });
  },

  duplicateList: async (id: string, options: { withTasks: boolean }): Promise<NavigationItem> => {
    const response = await apiClient.post<NavigationItem>(`/lists/${id}/duplicate`, {
      includeTasks: options.withTasks,
    });
    return { ...response.data, type: 'list' };
  },

  archiveList: async (id: string, archive: boolean): Promise<void> => {
    if (archive) {
      await apiClient.post(`/lists/${id}/archive`);
    } else {
      await apiClient.post(`/lists/${id}/unarchive`);
    }
  },

  getTemplates: async (): Promise<Partial<NavigationItem>[]> => {
    const response = await apiClient.get<Partial<NavigationItem>[]>('/lists/templates');
    return response.data;
  },

  createFromTemplate: async (templateId: string, name: string, parentId: string | null): Promise<NavigationItem> => {
    const response = await apiClient.post<NavigationItem>(`/lists/templates/${templateId}/create-list`, {
      name,
      folderId: parentId,
    });
    return { ...response.data, type: 'list' };
  },

  saveAsTemplate: async (listId: string, name: string): Promise<void> => {
    await apiClient.post(`/lists/templates/from-list/${listId}`, {
      name,
      description: `Template created from list`,
    });
  },
};
