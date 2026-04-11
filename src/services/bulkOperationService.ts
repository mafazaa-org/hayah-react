import type { Task } from '../types/task';
import { apiClient } from '../apiClient';

export interface BulkEditPayload {
  status?: string;
  priority?: Task['priority'];
  assignees?: string[];
  tags?: string[];
}

export const bulkOperationService = {
  /**
   * Bulk-edit multiple tasks with the same update payload.
   */
  bulkEdit: async (taskIds: string[], payload: BulkEditPayload): Promise<{ updated: string[] }> => {
    await apiClient.patch('/export-import/tasks/bulk', {
      taskIds,
      statusId: payload.status,
      priorityId: payload.priority,
    });
    return { updated: taskIds };
  },

  /**
   * Bulk-delete multiple tasks.
   */
  bulkDelete: async (taskIds: string[]): Promise<{ deleted: string[] }> => {
    await apiClient.post('/export-import/tasks/bulk-delete', {
      taskIds,
    });
    return { deleted: taskIds };
  },

  /**
   * Bulk-move tasks to a different column/status.
   */
  bulkMove: async (taskIds: string[], targetStatus: string): Promise<{ moved: string[] }> => {
    await apiClient.patch('/export-import/tasks/bulk', {
      taskIds,
      statusId: targetStatus,
    });
    return { moved: taskIds };
  },
};
