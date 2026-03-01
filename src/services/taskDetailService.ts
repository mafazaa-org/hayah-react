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

// Simulated delay
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- In-memory stores ----------

const detailStore = new Map<string, TaskDetail>();

let _idCounter = 1000;
const uid = () => `detail-${++_idCounter}`;

// Helper: build mock detail wrapper around a Task
function ensureDetail(taskId: string): TaskDetail {
  if (!detailStore.has(taskId)) {
    const base: TaskDetail = {
      id: taskId,
      title: '',
      status: '',
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
      checklists: [],
      taskDependencies: [],
      attachments: [],
      activity: [
        {
          id: uid(),
          taskId,
          type: 'created',
          actor: 'المستخدم الحالي',
          description: 'تم إنشاء المهمة',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    detailStore.set(taskId, base);
  }
  return detailStore.get(taskId)!;
}

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

// ---------- Service ----------

export const taskDetailService = {
  // ─── Task Detail ──────────────────────────────────────────────
  async getTaskDetail(taskId: string, task?: Task): Promise<TaskDetail> {
    await delay(200);
    const detail = ensureDetail(taskId);
    if (task) {
      const merged = mergeTaskIntoDetail(detail, task);
      detailStore.set(taskId, merged);
      return merged;
    }
    return detail;
  },

  async updateTask(
    taskId: string,
    updates: Partial<Task>
  ): Promise<Partial<Task>> {
    await delay(150);
    const detail = ensureDetail(taskId);
    Object.assign(detail, updates, { updatedAt: new Date().toISOString() });
    detailStore.set(taskId, detail);
    return updates;
  },

  async archiveTask(taskId: string): Promise<void> {
    await delay(150);
    const detail = ensureDetail(taskId);
    detail.isArchived = true;
    detail.updatedAt = new Date().toISOString();
    detail.activity.unshift({
      id: uid(),
      taskId,
      type: 'archived',
      actor: 'المستخدم الحالي',
      description: 'تم أرشفة المهمة',
      timestamp: new Date().toISOString(),
    });
    detailStore.set(taskId, detail);
  },

  // ─── Subtasks ─────────────────────────────────────────────────
  async createSubtask(
    taskId: string,
    title: string
  ): Promise<Subtask> {
    await delay(150);
    const detail = ensureDetail(taskId);
    const subtask: Subtask = {
      id: uid(),
      taskId,
      title,
      completed: false,
      order: detail.subtasks.length,
    };
    detail.subtasks.push(subtask);
    detailStore.set(taskId, detail);
    return subtask;
  },

  async updateSubtask(
    taskId: string,
    subtaskId: string,
    updates: Partial<Pick<Subtask, 'title' | 'completed'>>
  ): Promise<Subtask> {
    await delay(100);
    const detail = ensureDetail(taskId);
    const st = detail.subtasks.find((s) => s.id === subtaskId);
    if (!st) throw new Error('Subtask not found');
    Object.assign(st, updates);
    detailStore.set(taskId, detail);
    return st;
  },

  async deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
    await delay(100);
    const detail = ensureDetail(taskId);
    detail.subtasks = detail.subtasks.filter((s) => s.id !== subtaskId);
    detailStore.set(taskId, detail);
  },

  async toggleSubtask(taskId: string, subtaskId: string): Promise<Subtask> {
    await delay(80);
    const detail = ensureDetail(taskId);
    const st = detail.subtasks.find((s) => s.id === subtaskId);
    if (!st) throw new Error('Subtask not found');
    st.completed = !st.completed;
    detailStore.set(taskId, detail);
    return st;
  },

  async reorderSubtasks(taskId: string, orderedIds: string[]): Promise<void> {
    await delay(80);
    const detail = ensureDetail(taskId);
    const map = new Map(detail.subtasks.map((s) => [s.id, s]));
    detail.subtasks = orderedIds
      .map((id, i) => {
        const s = map.get(id);
        if (s) s.order = i;
        return s;
      })
      .filter(Boolean) as Subtask[];
    detailStore.set(taskId, detail);
  },

  // ─── Checklists ───────────────────────────────────────────────
  async createChecklist(
    taskId: string,
    title: string
  ): Promise<Checklist> {
    await delay(150);
    const detail = ensureDetail(taskId);
    const checklist: Checklist = { id: uid(), taskId, title, items: [] };
    detail.checklists.push(checklist);
    detailStore.set(taskId, detail);
    return checklist;
  },

  async addChecklistItem(
    taskId: string,
    checklistId: string,
    title: string
  ): Promise<ChecklistItem> {
    await delay(100);
    const detail = ensureDetail(taskId);
    const cl = detail.checklists.find((c) => c.id === checklistId);
    if (!cl) throw new Error('Checklist not found');
    const item: ChecklistItem = {
      id: uid(),
      checklistId,
      title,
      completed: false,
      order: cl.items.length,
    };
    cl.items.push(item);
    detailStore.set(taskId, detail);
    return item;
  },

  async updateChecklistItem(
    taskId: string,
    checklistId: string,
    itemId: string,
    updates: Partial<Pick<ChecklistItem, 'title' | 'completed'>>
  ): Promise<ChecklistItem> {
    await delay(80);
    const detail = ensureDetail(taskId);
    const cl = detail.checklists.find((c) => c.id === checklistId);
    if (!cl) throw new Error('Checklist not found');
    const item = cl.items.find((i) => i.id === itemId);
    if (!item) throw new Error('Checklist item not found');
    Object.assign(item, updates);
    detailStore.set(taskId, detail);
    return item;
  },

  async deleteChecklistItem(
    taskId: string,
    checklistId: string,
    itemId: string
  ): Promise<void> {
    await delay(80);
    const detail = ensureDetail(taskId);
    const cl = detail.checklists.find((c) => c.id === checklistId);
    if (!cl) throw new Error('Checklist not found');
    cl.items = cl.items.filter((i) => i.id !== itemId);
    detailStore.set(taskId, detail);
  },

  async toggleChecklistItem(
    taskId: string,
    checklistId: string,
    itemId: string
  ): Promise<ChecklistItem> {
    await delay(80);
    const detail = ensureDetail(taskId);
    const cl = detail.checklists.find((c) => c.id === checklistId);
    if (!cl) throw new Error('Checklist not found');
    const item = cl.items.find((i) => i.id === itemId);
    if (!item) throw new Error('Checklist item not found');
    item.completed = !item.completed;
    detailStore.set(taskId, detail);
    return item;
  },

  // ─── Dependencies ─────────────────────────────────────────────
  async createDependency(
    taskId: string,
    targetTaskId: string,
    type: DependencyType,
    targetTaskTitle?: string
  ): Promise<TaskDependency> {
    await delay(150);
    // Circular check: if target already blocks/blocked_by this task
    const targetDetail = detailStore.get(targetTaskId);
    if (targetDetail) {
      const circular = targetDetail.taskDependencies.some(
        (d) => d.targetTaskId === taskId
      );
      if (circular)
        throw new Error('تحذير: تبعية دائرية! لا يمكن إنشاء هذه التبعية.');
    }

    const detail = ensureDetail(taskId);
    const dep: TaskDependency = {
      id: uid(),
      type,
      sourceTaskId: taskId,
      targetTaskId,
      targetTaskTitle,
    };
    detail.taskDependencies.push(dep);
    detailStore.set(taskId, detail);
    return dep;
  },

  async getDependencies(taskId: string): Promise<TaskDependency[]> {
    await delay(100);
    return ensureDetail(taskId).taskDependencies;
  },

  async deleteDependency(
    taskId: string,
    dependencyId: string
  ): Promise<void> {
    await delay(100);
    const detail = ensureDetail(taskId);
    detail.taskDependencies = detail.taskDependencies.filter(
      (d) => d.id !== dependencyId
    );
    detailStore.set(taskId, detail);
  },

  // ─── Attachments ──────────────────────────────────────────────
  async uploadAttachment(
    taskId: string,
    file: File
  ): Promise<TaskAttachment> {
    // Simulate upload with progress
    await delay(400);
    const detail = ensureDetail(taskId);
    const attachment: TaskAttachment = {
      id: uid(),
      taskId,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'المستخدم الحالي',
    };
    detail.attachments.push(attachment);
    detailStore.set(taskId, detail);
    return attachment;
  },

  async getAttachments(taskId: string): Promise<TaskAttachment[]> {
    await delay(100);
    return ensureDetail(taskId).attachments;
  },

  async deleteAttachment(
    taskId: string,
    attachmentId: string
  ): Promise<void> {
    await delay(100);
    const detail = ensureDetail(taskId);
    detail.attachments = detail.attachments.filter(
      (a) => a.id !== attachmentId
    );
    detailStore.set(taskId, detail);
  },

  // ─── Activity ─────────────────────────────────────────────────
  async getActivity(
    taskId: string,
    page = 1,
    pageSize = 10
  ): Promise<{ items: TaskActivity[]; total: number }> {
    await delay(150);
    const detail = ensureDetail(taskId);
    const total = detail.activity.length;
    const start = (page - 1) * pageSize;
    const items = detail.activity.slice(start, start + pageSize);
    return { items, total };
  },

  // Helper: push an activity entry (used internally by store)
  pushActivity(taskId: string, entry: Omit<TaskActivity, 'id' | 'taskId' | 'timestamp'>) {
    const detail = ensureDetail(taskId);
    detail.activity.unshift({
      ...entry,
      id: uid(),
      taskId,
      timestamp: new Date().toISOString(),
    });
    detailStore.set(taskId, detail);
  },
};
