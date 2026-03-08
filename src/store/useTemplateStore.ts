import { create } from 'zustand';
import { templateService } from '../services/templateService';
import type { ListTemplate, TaskTemplate } from '../types/template';
import type { Task } from '../types/task';

interface TemplateState {
  // Data
  listTemplates: ListTemplate[];
  taskTemplates: TaskTemplate[];
  isLoading: boolean;
  error: string | null;

  // Modal state
  isListTemplatesModalOpen: boolean;
  isTaskTemplatesModalOpen: boolean;

  // Context
  contextParentId: string | null; // for list creation
  contextColumnId: string | null; // for task creation
  contextListId: string | null;   // for save-as-template

  // Actions — data
  fetchListTemplates: () => Promise<void>;
  fetchTaskTemplates: () => Promise<void>;
  createListFromTemplate: (templateId: string, name: string, parentId: string | null) => Promise<void>;
  saveListAsTemplate: (listId: string, name: string, description: string) => Promise<void>;
  createTaskFromTemplate: (templateId: string, listId: string, columnId: string) => Promise<Task | null>;
  saveTaskAsTemplate: (taskId: string, name: string, description: string) => Promise<void>;
  deleteTemplate: (templateId: string, type: 'list' | 'task') => Promise<void>;

  // Actions — modals
  openListTemplatesModal: (parentId?: string | null) => void;
  closeListTemplatesModal: () => void;
  openTaskTemplatesModal: (listId: string, columnId?: string | null) => void;
  closeTaskTemplatesModal: () => void;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  listTemplates: [],
  taskTemplates: [],
  isLoading: false,
  error: null,

  isListTemplatesModalOpen: false,
  isTaskTemplatesModalOpen: false,

  contextParentId: null,
  contextColumnId: null,
  contextListId: null,

  // ─── Data Actions ──────────────────────────────────────────────

  fetchListTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await templateService.getListTemplates();
      set({ listTemplates: templates, isLoading: false });
    } catch (err) {
      console.error('Failed to fetch list templates:', err);
      set({ isLoading: false, error: 'فشل تحميل قوالب القوائم' });
    }
  },

  fetchTaskTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await templateService.getTaskTemplates();
      set({ taskTemplates: templates, isLoading: false });
    } catch (err) {
      console.error('Failed to fetch task templates:', err);
      set({ isLoading: false, error: 'فشل تحميل قوالب المهام' });
    }
  },

  createListFromTemplate: async (templateId, name, parentId) => {
    set({ isLoading: true, error: null });
    try {
      await templateService.createListFromTemplate(templateId, name, parentId);
      set({ isLoading: false, isListTemplatesModalOpen: false });
    } catch (err) {
      console.error('Failed to create list from template:', err);
      set({ isLoading: false, error: 'فشل إنشاء القائمة من القالب' });
    }
  },

  saveListAsTemplate: async (listId, name, description) => {
    set({ isLoading: true, error: null });
    try {
      const newTemplate = await templateService.saveListAsTemplate(listId, name, description);
      set(state => ({
        listTemplates: [...state.listTemplates, newTemplate],
        isLoading: false,
      }));
    } catch (err) {
      console.error('Failed to save list as template:', err);
      set({ isLoading: false, error: 'فشل حفظ القائمة كقالب' });
    }
  },

  createTaskFromTemplate: async (templateId, listId, columnId) => {
    set({ isLoading: true, error: null });
    try {
      const task = await templateService.createTaskFromTemplate(templateId, listId, columnId);
      set({ isLoading: false, isTaskTemplatesModalOpen: false });
      return task;
    } catch (err) {
      console.error('Failed to create task from template:', err);
      set({ isLoading: false, error: 'فشل إنشاء المهمة من القالب' });
      return null;
    }
  },

  saveTaskAsTemplate: async (taskId, name, description) => {
    set({ isLoading: true, error: null });
    try {
      const newTemplate = await templateService.saveTaskAsTemplate(taskId, name, description);
      set(state => ({
        taskTemplates: [...state.taskTemplates, newTemplate],
        isLoading: false,
      }));
    } catch (err) {
      console.error('Failed to save task as template:', err);
      set({ isLoading: false, error: 'فشل حفظ المهمة كقالب' });
    }
  },

  deleteTemplate: async (templateId, type) => {
    set({ isLoading: true, error: null });
    try {
      await templateService.deleteTemplate(templateId, type);
      if (type === 'list') {
        set(state => ({
          listTemplates: state.listTemplates.filter(t => t.id !== templateId),
          isLoading: false,
        }));
      } else {
        set(state => ({
          taskTemplates: state.taskTemplates.filter(t => t.id !== templateId),
          isLoading: false,
        }));
      }
    } catch (err) {
      console.error('Failed to delete template:', err);
      set({ isLoading: false, error: 'فشل حذف القالب' });
    }
  },

  // ─── Modal Actions ─────────────────────────────────────────────

  openListTemplatesModal: (parentId = null) => {
    set({ isListTemplatesModalOpen: true, contextParentId: parentId });
    get().fetchListTemplates();
  },

  closeListTemplatesModal: () => {
    set({ isListTemplatesModalOpen: false, contextParentId: null, error: null });
  },

  openTaskTemplatesModal: (listId, columnId = null) => {
    set({ isTaskTemplatesModalOpen: true, contextListId: listId, contextColumnId: columnId });
    get().fetchTaskTemplates();
  },

  closeTaskTemplatesModal: () => {
    set({ isTaskTemplatesModalOpen: false, contextListId: null, contextColumnId: null, error: null });
  },
}));
