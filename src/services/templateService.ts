import type { Task } from '../types/task';
import type { NavigationItem } from './folderService';
import type {
  ListTemplate,
  TaskTemplate,
} from '../types/template';
import { apiClient } from '../apiClient';

export const templateService = {
  // --- List Templates ---

  getListTemplates: async (): Promise<ListTemplate[]> => {
    const response = await apiClient.get<ListTemplate[]>('/lists/templates', {
      params: { includePublic: 'true' },
    });
    return response.data;
  },

  createListFromTemplate: async (
    templateId: string,
    name: string,
    parentId: string | null
  ): Promise<NavigationItem> => {
    const response = await apiClient.post<NavigationItem>(`/lists/templates/${templateId}/create-list`, {
      name,
      folderId: parentId,
    });
    return { ...response.data, type: 'list' };
  },

  saveListAsTemplate: async (listId: string, name: string, description: string): Promise<ListTemplate> => {
    const response = await apiClient.post<ListTemplate>(`/lists/templates/from-list/${listId}`, {
      name,
      description,
    });
    return response.data;
  },

  // --- Task Templates ---

  getTaskTemplates: async (): Promise<TaskTemplate[]> => {
    const response = await apiClient.get<TaskTemplate[]>('/tasks/templates', {
      params: { includePublic: 'true' },
    });
    return response.data;
  },

  createTaskFromTemplate: async (
    templateId: string,
    listId: string,
    columnId: string
  ): Promise<Task> => {
    const response = await apiClient.post<Task>(`/tasks/templates/${templateId}/create-task`, {
      listId,
      statusId: columnId,
    });
    return response.data;
  },

  saveTaskAsTemplate: async (taskId: string, name: string, description: string): Promise<TaskTemplate> => {
    const response = await apiClient.post<TaskTemplate>(`/tasks/templates/from-task/${taskId}`, {
      name,
      description,
    });
    return response.data;
  },

  // --- Delete (custom only) ---

  deleteTemplate: async (templateId: string, type: 'list' | 'task'): Promise<void> => {
    if (type === 'list') {
      await apiClient.delete(`/lists/templates/${templateId}`);
    } else {
      await apiClient.delete(`/tasks/templates/${templateId}`);
    }
  },
};
