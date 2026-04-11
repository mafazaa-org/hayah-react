import type { CustomField } from '../types/customField';
import { apiClient } from '../apiClient';

export const customFieldService = {
  getCustomFields: async (listId: string): Promise<CustomField[]> => {
    const response = await apiClient.get<CustomField[]>('/lists/custom-fields', {
      params: { listId },
    });
    return response.data;
  },

  createCustomField: async (listId: string, definition: Omit<CustomField, 'id'>): Promise<CustomField> => {
    const response = await apiClient.post<CustomField>('/lists/custom-fields', {
      name: definition.name,
      type: definition.type,
      listId,
      config: definition.options ? { options: definition.options.map(o => o.value) } : null,
    });
    return response.data;
  },

  updateCustomField: async (id: string, updates: Partial<CustomField>): Promise<CustomField> => {
    const response = await apiClient.put<CustomField>(`/lists/custom-fields/${id}`, {
      name: updates.name,
      config: updates.options ? { options: updates.options.map(o => o.value) } : undefined,
    });
    return response.data;
  },

  deleteCustomField: async (id: string): Promise<void> => {
    await apiClient.delete(`/lists/custom-fields/${id}`);
  },

  reorderCustomFields: async (listId: string, orderedIds: string[]): Promise<void> => {
    await apiClient.put('/lists/custom-fields/reorder', {
      listId,
      orderedIds,
    });
  },
};
