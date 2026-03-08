import type { Task } from '../types/task';

// Simulated delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface BulkEditPayload {
  status?: string;
  priority?: Task['priority'];
  assignees?: string[];
  tags?: string[];
}

export const bulkOperationService = {
  /**
   * Bulk-edit multiple tasks with the same update payload.
   * Returns the updated task objects.
   */
  bulkEdit: async (taskIds: string[], payload: BulkEditPayload): Promise<{ updated: string[] }> => {
    await delay(400);
    console.log(`[bulkOperationService] Editing ${taskIds.length} tasks`, payload);
    return { updated: taskIds };
  },

  /**
   * Bulk-delete multiple tasks.
   */
  bulkDelete: async (taskIds: string[]): Promise<{ deleted: string[] }> => {
    await delay(400);
    console.log(`[bulkOperationService] Deleting ${taskIds.length} tasks`);
    return { deleted: taskIds };
  },

  /**
   * Bulk-move tasks to a different column/status.
   */
  bulkMove: async (taskIds: string[], targetStatus: string): Promise<{ moved: string[] }> => {
    await delay(400);
    console.log(`[bulkOperationService] Moving ${taskIds.length} tasks to ${targetStatus}`);
    return { moved: taskIds };
  },
};
