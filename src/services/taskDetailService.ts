import type {
  TaskDetail,
  Subtask,
  Checklist,
  ChecklistItem,
  TaskDependency,
  DependencyType,
  TaskAttachment,
  TaskActivity,
  Task,
} from '../types/task';
import { apiClient } from '../apiClient';

// Merge lightweight Task fields into a TaskDetail record so that the modal
// always reflects the latest card-level data.
function mergeTaskIntoDetail(detail: TaskDetail, task: Task): TaskDetail {
  return {
    ...detail,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignees: task.assignees,
    dueDate: task.dueDate,
    tags: task.tags,
    customFields: task.customFields,
    iterationName: task.iterationName,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    order: task.order,
    startDate: task.startDate,
    dependencies: task.dependencies,
    isArchived: task.isArchived,
  };
}

export const taskDetailService = {
  // ─── Task Detail ──────────────────────────────────────────────
  async getTaskDetail(taskId: string, task?: Task): Promise<TaskDetail> {
    const response = await apiClient.get<TaskDetail>(`/tasks/${taskId}`);
    let detail = response.data;

    // Fetch subtasks, checklists, dependencies, attachments, activity in parallel
    const [subtasksRes, checklistsRes, depsRes, attachmentsRes, activityRes] = await Promise.allSettled([
      apiClient.get(`/tasks/${taskId}/subtasks`),
      apiClient.get(`/tasks/${taskId}/checklists`),
      apiClient.get(`/tasks/${taskId}/dependencies`),
      apiClient.get(`/attachments/task/${taskId}`),
      apiClient.get(`/tasks/${taskId}/activities`),
    ]);

    detail.subtasks = subtasksRes.status === 'fulfilled' ? subtasksRes.value.data : [];
    detail.checklists = checklistsRes.status === 'fulfilled' ? checklistsRes.value.data : [];

    // Dependencies response: { blocking: [], blockedBy: [] }
    if (depsRes.status === 'fulfilled') {
      const depsData = depsRes.value.data as { blocking: TaskDependency[]; blockedBy: TaskDependency[] };
      detail.taskDependencies = [...(depsData.blocking || []), ...(depsData.blockedBy || [])];
    } else {
      detail.taskDependencies = [];
    }

    detail.attachments = attachmentsRes.status === 'fulfilled' ? attachmentsRes.value.data : [];
    detail.activity = activityRes.status === 'fulfilled' ? activityRes.value.data : [];
    detail.comments = []; // Comments are loaded separately via commentService

    if (task) {
      detail = mergeTaskIntoDetail(detail, task);
    }
    return detail;
  },

  async updateTask(
    taskId: string,
    updates: Partial<Task>
  ): Promise<Partial<Task>> {
    await apiClient.put(`/tasks/${taskId}`, updates);
    return updates;
  },

  async archiveTask(taskId: string): Promise<void> {
    await apiClient.post(`/tasks/${taskId}/archive`);
  },

  // ─── Subtasks ─────────────────────────────────────────────────
  async createSubtask(
    taskId: string,
    title: string
  ): Promise<Subtask> {
    const response = await apiClient.post<Subtask>('/tasks/subtasks', {
      taskId,
      title,
      orderIndex: 0, // Backend will handle ordering
    });
    return response.data;
  },

  async updateSubtask(
    _taskId: string,
    subtaskId: string,
    updates: Partial<Pick<Subtask, 'title' | 'completed'>>
  ): Promise<Subtask> {
    const response = await apiClient.put<Subtask>(`/tasks/subtasks/${subtaskId}`, {
      title: updates.title,
      isCompleted: updates.completed,
    });
    return response.data;
  },

  async deleteSubtask(_taskId: string, subtaskId: string): Promise<void> {
    await apiClient.delete(`/tasks/subtasks/${subtaskId}`);
  },

  async toggleSubtask(_taskId: string, subtaskId: string): Promise<Subtask> {
    // Get current state first, then toggle
    const current = await apiClient.get<Subtask>(`/tasks/subtasks/${subtaskId}`);
    const isCompleted = !(current.data as unknown as Record<string, unknown>).isCompleted;
    const response = await apiClient.put<Subtask>(`/tasks/subtasks/${subtaskId}`, {
      isCompleted,
    });
    return response.data;
  },

  async reorderSubtasks(_taskId: string, orderedIds: string[]): Promise<void> {
    // Move each subtask to its new position
    for (let i = 0; i < orderedIds.length; i++) {
      await apiClient.put(`/tasks/subtasks/${orderedIds[i]}`, {
        orderIndex: i,
      });
    }
  },

  // ─── Checklists ───────────────────────────────────────────────
  async createChecklist(
    taskId: string,
    title: string
  ): Promise<Checklist> {
    const response = await apiClient.post<Checklist>('/tasks/checklists', {
      taskId,
      title,
      orderIndex: 0,
    });
    return { ...response.data, items: [] };
  },

  async addChecklistItem(
    _taskId: string,
    checklistId: string,
    title: string
  ): Promise<ChecklistItem> {
    const response = await apiClient.post<ChecklistItem>('/tasks/checklist-items', {
      checklistId,
      title,
      orderIndex: 0,
    });
    return response.data;
  },

  async updateChecklistItem(
    _taskId: string,
    _checklistId: string,
    itemId: string,
    updates: Partial<Pick<ChecklistItem, 'title' | 'completed'>>
  ): Promise<ChecklistItem> {
    const response = await apiClient.put<ChecklistItem>(`/tasks/checklist-items/${itemId}`, {
      title: updates.title,
      isCompleted: updates.completed,
    });
    return response.data;
  },

  async deleteChecklistItem(
    _taskId: string,
    _checklistId: string,
    itemId: string
  ): Promise<void> {
    await apiClient.delete(`/tasks/checklist-items/${itemId}`);
  },

  async toggleChecklistItem(
    _taskId: string,
    _checklistId: string,
    itemId: string
  ): Promise<ChecklistItem> {
    const current = await apiClient.get<ChecklistItem>(`/tasks/checklist-items/${itemId}`);
    const isCompleted = !(current.data as unknown as Record<string, unknown>).isCompleted;
    const response = await apiClient.put<ChecklistItem>(`/tasks/checklist-items/${itemId}`, {
      isCompleted,
    });
    return response.data;
  },

  // ─── Dependencies ─────────────────────────────────────────────
  async createDependency(
    taskId: string,
    targetTaskId: string,
    type: DependencyType,
    _targetTaskTitle?: string
  ): Promise<TaskDependency> {
    const response = await apiClient.post<TaskDependency>('/tasks/dependencies', {
      taskId,
      dependsOnTaskId: targetTaskId,
      type,
    });
    return response.data;
  },

  async getDependencies(taskId: string): Promise<TaskDependency[]> {
    const response = await apiClient.get(`/tasks/${taskId}/dependencies`);
    const data = response.data as { blocking: TaskDependency[]; blockedBy: TaskDependency[] };
    return [...(data.blocking || []), ...(data.blockedBy || [])];
  },

  async deleteDependency(
    _taskId: string,
    dependencyId: string
  ): Promise<void> {
    await apiClient.delete(`/tasks/dependencies/${dependencyId}`);
  },

  // ─── Attachments ──────────────────────────────────────────────
  async uploadAttachment(
    taskId: string,
    file: File
  ): Promise<TaskAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<TaskAttachment>(
      `/attachments/task/${taskId}/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async getAttachments(taskId: string): Promise<TaskAttachment[]> {
    const response = await apiClient.get<TaskAttachment[]>(`/attachments/task/${taskId}`);
    return response.data;
  },

  async deleteAttachment(
    _taskId: string,
    attachmentId: string
  ): Promise<void> {
    await apiClient.delete(`/attachments/${attachmentId}`);
  },

  // ─── Activity ─────────────────────────────────────────────────
  async getActivity(
    taskId: string,
    _page = 1,
    _pageSize = 10
  ): Promise<{ items: TaskActivity[]; total: number }> {
    const response = await apiClient.get<TaskActivity[]>(`/tasks/${taskId}/activities`);
    const items = response.data;
    return { items, total: items.length };
  },

  // Helper: push an activity entry (used internally by store)
  // In the real backend, activities are auto-created — this is a no-op.
  pushActivity(_taskId: string, _entry: Omit<TaskActivity, 'id' | 'taskId' | 'timestamp'>) {
    // Activities are auto-generated by the backend on task changes.
    // No manual push needed.
  },
};
