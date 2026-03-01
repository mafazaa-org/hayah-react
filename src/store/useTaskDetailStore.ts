import { create } from 'zustand';
import type {
  TaskDetail,
  Subtask,
  DependencyType,
  Task,
} from '../types/task';
import { taskDetailService } from '../services/taskDetailService';

export type DetailTab =
  | 'details'
  | 'subtasks'
  | 'checklists'
  | 'dependencies'
  | 'attachments'
  | 'activity';

interface TaskDetailState {
  // Core
  selectedTask: TaskDetail | null;
  isDetailModalOpen: boolean;
  isLoading: boolean;
  error: string | null;
  activeTab: DetailTab;

  // Actions — modal
  openTaskDetail: (taskId: string, task?: Task) => Promise<void>;
  closeTaskDetail: () => void;
  setActiveTab: (tab: DetailTab) => void;

  // Actions — task fields
  updateTaskField: (updates: Partial<Task>) => Promise<void>;
  archiveTask: () => Promise<void>;

  // Actions — subtasks
  addSubtask: (title: string) => Promise<void>;
  editSubtask: (subtaskId: string, title: string) => Promise<void>;
  deleteSubtask: (subtaskId: string) => Promise<void>;
  toggleSubtask: (subtaskId: string) => Promise<void>;
  reorderSubtasks: (orderedIds: string[]) => Promise<void>;

  // Actions — checklists
  addChecklist: (title: string) => Promise<void>;
  addChecklistItem: (checklistId: string, title: string) => Promise<void>;
  toggleChecklistItem: (checklistId: string, itemId: string) => Promise<void>;
  deleteChecklistItem: (checklistId: string, itemId: string) => Promise<void>;
  updateChecklistItem: (checklistId: string, itemId: string, title: string) => Promise<void>;

  // Actions — dependencies
  addDependency: (targetTaskId: string, type: DependencyType, targetTitle?: string) => Promise<void>;
  removeDependency: (dependencyId: string) => Promise<void>;

  // Actions — attachments
  uploadAttachment: (file: File) => Promise<void>;
  removeAttachment: (attachmentId: string) => Promise<void>;

  // Actions — activity
  loadActivity: (page?: number) => Promise<void>;
  activityPage: number;
  activityTotal: number;
}

export const useTaskDetailStore = create<TaskDetailState>((set, get) => ({
  // Initial state
  selectedTask: null,
  isDetailModalOpen: false,
  isLoading: false,
  error: null,
  activeTab: 'details',
  activityPage: 1,
  activityTotal: 0,

  // ─── Modal ────────────────────────────────────────────────────
  async openTaskDetail(taskId: string, task?: Task) {
    set({ isLoading: true, error: null, isDetailModalOpen: true, activeTab: 'details', activityPage: 1 });
    try {
      const detail = await taskDetailService.getTaskDetail(taskId, task);
      set({ selectedTask: detail, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'خطأ في تحميل تفاصيل المهمة', isLoading: false });
    }
  },

  closeTaskDetail() {
    set({ selectedTask: null, isDetailModalOpen: false, activeTab: 'details', error: null });
  },

  setActiveTab(tab: DetailTab) {
    set({ activeTab: tab });
  },

  // ─── Task Fields ──────────────────────────────────────────────
  async updateTaskField(updates: Partial<Task>) {
    const { selectedTask } = get();
    if (!selectedTask) return;

    // Optimistic update
    const prev = { ...selectedTask };
    set({ selectedTask: { ...selectedTask, ...updates, updatedAt: new Date().toISOString() } });

    try {
      await taskDetailService.updateTask(selectedTask.id, updates);
    } catch {
      set({ selectedTask: prev }); // rollback
    }
  },

  async archiveTask() {
    const { selectedTask } = get();
    if (!selectedTask) return;
    try {
      await taskDetailService.archiveTask(selectedTask.id);
      set({
        selectedTask: { ...selectedTask, isArchived: true, updatedAt: new Date().toISOString() },
      });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  // ─── Subtasks ─────────────────────────────────────────────────
  async addSubtask(title: string) {
    const { selectedTask } = get();
    if (!selectedTask) return;
    try {
      const subtask = await taskDetailService.createSubtask(selectedTask.id, title);
      set({
        selectedTask: {
          ...selectedTask,
          subtasks: [...selectedTask.subtasks, subtask],
        },
      });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  async editSubtask(subtaskId: string, title: string) {
    const { selectedTask } = get();
    if (!selectedTask) return;
    try {
      await taskDetailService.updateSubtask(selectedTask.id, subtaskId, { title });
      set({
        selectedTask: {
          ...selectedTask,
          subtasks: selectedTask.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, title } : s
          ),
        },
      });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  async deleteSubtask(subtaskId: string) {
    const { selectedTask } = get();
    if (!selectedTask) return;
    const prev = selectedTask.subtasks;
    set({
      selectedTask: {
        ...selectedTask,
        subtasks: selectedTask.subtasks.filter((s) => s.id !== subtaskId),
      },
    });
    try {
      await taskDetailService.deleteSubtask(selectedTask.id, subtaskId);
    } catch {
      set({ selectedTask: { ...selectedTask, subtasks: prev } });
    }
  },

  async toggleSubtask(subtaskId: string) {
    const { selectedTask } = get();
    if (!selectedTask) return;
    // Optimistic
    set({
      selectedTask: {
        ...selectedTask,
        subtasks: selectedTask.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        ),
      },
    });
    try {
      await taskDetailService.toggleSubtask(selectedTask.id, subtaskId);
    } catch {
      // rollback
      set({
        selectedTask: {
          ...get().selectedTask!,
          subtasks: selectedTask.subtasks,
        },
      });
    }
  },

  async reorderSubtasks(orderedIds: string[]) {
    const { selectedTask } = get();
    if (!selectedTask) return;
    const map = new Map(selectedTask.subtasks.map((s) => [s.id, s]));
    const reordered = orderedIds
      .map((id, i) => {
        const s = map.get(id);
        return s ? { ...s, order: i } : undefined;
      })
      .filter(Boolean) as Subtask[];
    set({ selectedTask: { ...selectedTask, subtasks: reordered } });
    try {
      await taskDetailService.reorderSubtasks(selectedTask.id, orderedIds);
    } catch {
      set({ selectedTask: { ...selectedTask, subtasks: selectedTask.subtasks } });
    }
  },

  // ─── Checklists ───────────────────────────────────────────────
  async addChecklist(title: string) {
    const { selectedTask } = get();
    if (!selectedTask) return;
    try {
      const checklist = await taskDetailService.createChecklist(selectedTask.id, title);
      set({
        selectedTask: {
          ...selectedTask,
          checklists: [...selectedTask.checklists, checklist],
        },
      });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  async addChecklistItem(checklistId: string, title: string) {
    const { selectedTask } = get();
    if (!selectedTask) return;
    try {
      const item = await taskDetailService.addChecklistItem(
        selectedTask.id,
        checklistId,
        title
      );
      set({
        selectedTask: {
          ...selectedTask,
          checklists: selectedTask.checklists.map((cl) =>
            cl.id === checklistId ? { ...cl, items: [...cl.items, item] } : cl
          ),
        },
      });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  async toggleChecklistItem(checklistId: string, itemId: string) {
    const { selectedTask } = get();
    if (!selectedTask) return;
    // Optimistic
    set({
      selectedTask: {
        ...selectedTask,
        checklists: selectedTask.checklists.map((cl) =>
          cl.id === checklistId
            ? {
              ...cl,
              items: cl.items.map((i) =>
                i.id === itemId ? { ...i, completed: !i.completed } : i
              ),
            }
            : cl
        ),
      },
    });
    try {
      await taskDetailService.toggleChecklistItem(selectedTask.id, checklistId, itemId);
    } catch {
      set({ selectedTask });
    }
  },

  async deleteChecklistItem(checklistId: string, itemId: string) {
    const { selectedTask } = get();
    if (!selectedTask) return;
    set({
      selectedTask: {
        ...selectedTask,
        checklists: selectedTask.checklists.map((cl) =>
          cl.id === checklistId
            ? { ...cl, items: cl.items.filter((i) => i.id !== itemId) }
            : cl
        ),
      },
    });
    try {
      await taskDetailService.deleteChecklistItem(selectedTask.id, checklistId, itemId);
    } catch {
      set({ selectedTask });
    }
  },

  async updateChecklistItem(checklistId: string, itemId: string, title: string) {
    const { selectedTask } = get();
    if (!selectedTask) return;
    try {
      await taskDetailService.updateChecklistItem(selectedTask.id, checklistId, itemId, { title });
      set({
        selectedTask: {
          ...selectedTask,
          checklists: selectedTask.checklists.map((cl) =>
            cl.id === checklistId
              ? {
                ...cl,
                items: cl.items.map((i) =>
                  i.id === itemId ? { ...i, title } : i
                ),
              }
              : cl
          ),
        },
      });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  // ─── Dependencies ─────────────────────────────────────────────
  async addDependency(targetTaskId: string, type: DependencyType, targetTitle?: string) {
    const { selectedTask } = get();
    if (!selectedTask) return;
    try {
      const dep = await taskDetailService.createDependency(
        selectedTask.id,
        targetTaskId,
        type,
        targetTitle
      );
      set({
        selectedTask: {
          ...selectedTask,
          taskDependencies: [...selectedTask.taskDependencies, dep],
        },
      });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  async removeDependency(dependencyId: string) {
    const { selectedTask } = get();
    if (!selectedTask) return;
    set({
      selectedTask: {
        ...selectedTask,
        taskDependencies: selectedTask.taskDependencies.filter((d) => d.id !== dependencyId),
      },
    });
    try {
      await taskDetailService.deleteDependency(selectedTask.id, dependencyId);
    } catch {
      set({ selectedTask });
    }
  },

  // ─── Attachments ──────────────────────────────────────────────
  async uploadAttachment(file: File) {
    const { selectedTask } = get();
    if (!selectedTask) return;
    try {
      const attachment = await taskDetailService.uploadAttachment(selectedTask.id, file);
      set({
        selectedTask: {
          ...selectedTask,
          attachments: [...selectedTask.attachments, attachment],
        },
      });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  async removeAttachment(attachmentId: string) {
    const { selectedTask } = get();
    if (!selectedTask) return;
    set({
      selectedTask: {
        ...selectedTask,
        attachments: selectedTask.attachments.filter((a) => a.id !== attachmentId),
      },
    });
    try {
      await taskDetailService.deleteAttachment(selectedTask.id, attachmentId);
    } catch {
      set({ selectedTask });
    }
  },

  // ─── Activity ─────────────────────────────────────────────────
  async loadActivity(page = 1) {
    const { selectedTask } = get();
    if (!selectedTask) return;
    try {
      const { items, total } = await taskDetailService.getActivity(selectedTask.id, page);
      if (page === 1) {
        set({
          selectedTask: { ...selectedTask, activity: items },
          activityPage: 1,
          activityTotal: total,
        });
      } else {
        set({
          selectedTask: {
            ...selectedTask,
            activity: [...selectedTask.activity, ...items],
          },
          activityPage: page,
          activityTotal: total,
        });
      }
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));
