import type { Column } from '../types/task';
import { apiClient } from '../apiClient';

export const columnService = {
  /**
   * Get all columns (statuses) for a list
   */
  getColumnsForList: async (listId: string): Promise<Column[]> => {
    const response = await apiClient.get<Array<Record<string, unknown>>>('/statuses', {
      params: { listId },
    });
    // Map backend StatusEntity to frontend Column type
    return response.data.map((s) => ({
      id: s.id as string,
      name: s.name as string,
      color: (s.color as string) || '#64748b',
      order: (s.orderIndex as number) ?? (s.order as number) ?? 0,
      listId: (s.listId as string) || listId,
    }));
  },

  /**
   * Create a new column (status)
   */
  createColumn: async (listId: string, name: string, color: string): Promise<Column> => {
    // Get existing columns to calculate order
    const existing = await columnService.getColumnsForList(listId);
    const orderIndex = existing.length;

    const response = await apiClient.post('/statuses', {
      name,
      listId,
      orderIndex,
      color,
    });
    const s = response.data as Record<string, unknown>;
    return {
      id: s.id as string,
      name: s.name as string,
      color: (s.color as string) || color,
      order: (s.orderIndex as number) ?? orderIndex,
      listId,
    };
  },

  /**
   * Update column properties
   */
  updateColumn: async (columnId: string, updates: Partial<Pick<Column, 'name' | 'color'>>): Promise<Column> => {
    const response = await apiClient.put(`/statuses/${columnId}`, updates);
    const s = response.data as Record<string, unknown>;
    return {
      id: s.id as string,
      name: s.name as string,
      color: (s.color as string) || '#64748b',
      order: (s.orderIndex as number) ?? (s.order as number) ?? 0,
      listId: s.listId as string,
    };
  },

  /**
   * Delete a column (status)
   */
  deleteColumn: async (columnId: string): Promise<void> => {
    await apiClient.delete(`/statuses/${columnId}`);
  },

  /**
   * Reorder columns (statuses)
   */
  reorderColumns: async (listId: string, columnIds: string[]): Promise<Column[]> => {
    const statusOrders = columnIds.map((statusId, index) => ({
      statusId,
      orderIndex: index,
    }));

    const response = await apiClient.put('/statuses/reorder', {
      statusOrders,
    }, {
      params: { listId },
    });

    return (response.data as Array<Record<string, unknown>>).map((s) => ({
      id: s.id as string,
      name: s.name as string,
      color: (s.color as string) || '#64748b',
      order: (s.orderIndex as number) ?? 0,
      listId: (s.listId as string) || listId,
    }));
  },
};
