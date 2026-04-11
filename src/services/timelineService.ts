import type { Task } from '../types/task';
import { apiClient } from '../apiClient';

// Timeline-specific task type with guaranteed start/end dates
export interface TimelineTask extends Task {
  startDate: string;
  endDate: string;
}

export interface Dependency {
  id: string;
  source: string; // Task ID (predecessor)
  target: string; // Task ID (successor)
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
}

export const timelineService = {
  /**
   * Fetch tasks with timeline-specific data (start/end dates)
   */
  getTimelineTasks: async (
    listId: string,
    startRange: Date,
    endRange: Date
  ): Promise<TimelineTask[]> => {
    // Fetch tasks within the date range using the calendar endpoint
    const response = await apiClient.get<Task[]>('/tasks/calendar', {
      params: {
        listId,
        start: startRange.toISOString().split('T')[0],
        end: endRange.toISOString().split('T')[0],
      },
    });

    // Map tasks to TimelineTask format, ensuring start/end dates exist
    return response.data
      .filter(task => task.dueDate || task.startDate)
      .map(task => {
        const startDate = task.startDate || task.createdAt;
        const endDate = task.dueDate || task.startDate || task.createdAt;

        return {
          ...task,
          startDate,
          endDate,
        } as TimelineTask;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  },

  /**
   * Fetch dependencies between tasks.
   */
  getDependencies: async (listId: string): Promise<Dependency[]> => {
    // First, get all tasks for this list
    const tasksResponse = await apiClient.get<Task[]>('/tasks', {
      params: { listId },
    });

    // Then fetch dependencies for each task and aggregate
    const deps: Dependency[] = [];
    const seen = new Set<string>();

    for (const task of tasksResponse.data) {
      try {
        const depResponse = await apiClient.get<{ blocking: Array<Record<string, unknown>>; blockedBy: Array<Record<string, unknown>> }>(
          `/tasks/${task.id}/dependencies`
        );

        for (const d of depResponse.data.blocking || []) {
          const id = d.id as string;
          if (!seen.has(id)) {
            seen.add(id);
            deps.push({
              id,
              source: (d.taskId as string) || task.id,
              target: (d.dependsOnTaskId as string) || '',
              type: 'finish_to_start',
            });
          }
        }

        for (const d of depResponse.data.blockedBy || []) {
          const id = d.id as string;
          if (!seen.has(id)) {
            seen.add(id);
            deps.push({
              id,
              source: (d.dependsOnTaskId as string) || '',
              target: (d.taskId as string) || task.id,
              type: 'finish_to_start',
            });
          }
        }
      } catch {
        // Skip tasks with no dependencies
      }
    }

    return deps;
  },

  /**
   * Update a task's start and end dates (drag-to-resize).
   */
  updateTaskDates: async (
    taskId: string,
    startDate: string,
    endDate: string
  ): Promise<{ taskId: string; startDate: string; endDate: string }> => {
    await apiClient.put(`/tasks/${taskId}`, {
      startDate,
      dueDate: endDate,
    });
    return { taskId, startDate, endDate };
  },
};
