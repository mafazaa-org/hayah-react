import type { Iteration } from '../types/iteration';
import { apiClient } from '../apiClient';

export const iterationService = {
  getIterations: async (listId: string): Promise<Iteration[]> => {
    const response = await apiClient.get<Iteration[]>(`/lists/${listId}/iterations`);
    return response.data;
  },

  createIteration: async (listId: string, definition: Omit<Iteration, 'id' | 'createdAt' | 'updatedAt'>): Promise<Iteration> => {
    const response = await apiClient.post<Iteration>(`/lists/${listId}/iterations`, {
      name: definition.name,
      startDate: definition.startDate,
      endDate: definition.endDate,
      status: definition.status,
      goal: definition.goal,
    });
    return response.data;
  },

  updateIteration: async (id: string, updates: Partial<Iteration>): Promise<Iteration> => {
    const response = await apiClient.put<Iteration>(`/lists/iterations/${id}`, updates);
    return response.data;
  },

  deleteIteration: async (id: string): Promise<void> => {
    await apiClient.delete(`/lists/iterations/${id}`);
  },
};
