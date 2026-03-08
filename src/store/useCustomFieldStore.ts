import { create } from 'zustand';
import { customFieldService } from '../services/customFieldService';
import type { CustomField } from '../types/customField';

interface CustomFieldState {
  fields: CustomField[];
  isLoading: boolean;
  isManagerModalOpen: boolean;

  // Actions
  fetchFields: (listId: string) => Promise<void>;
  addField: (listId: string, definition: Omit<CustomField, 'id'>) => Promise<void>;
  updateField: (id: string, updates: Partial<CustomField>) => Promise<void>;
  deleteField: (id: string) => Promise<void>;
  reorderFields: (listId: string, orderedIds: string[]) => Promise<void>;

  openManagerModal: () => void;
  closeManagerModal: () => void;
}

export const useCustomFieldStore = create<CustomFieldState>((set, get) => ({
  fields: [],
  isLoading: false,
  isManagerModalOpen: false,

  fetchFields: async (listId: string) => {
    set({ isLoading: true });
    try {
      const fields = await customFieldService.getCustomFields(listId);
      set({ fields: fields.sort((a, b) => (a.order || 0) - (b.order || 0)), isLoading: false });
    } catch (error) {
      console.error('Failed to fetch custom fields:', error);
      set({ isLoading: false });
    }
  },

  addField: async (listId, definition) => {
    try {
      const newField = await customFieldService.createCustomField(listId, definition);
      set(state => ({ fields: [...state.fields, newField] }));
    } catch (error) {
      console.error('Failed to add custom field:', error);
    }
  },

  updateField: async (id, updates) => {
    try {
      const updated = await customFieldService.updateCustomField(id, updates);
      set(state => ({
        fields: state.fields.map(cf => cf.id === id ? updated : cf)
      }));
    } catch (error) {
      console.error('Failed to update custom field:', error);
    }
  },

  deleteField: async (id) => {
    try {
      await customFieldService.deleteCustomField(id);
      set(state => ({
        fields: state.fields.filter(cf => cf.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete custom field:', error);
    }
  },

  reorderFields: async (listId, orderedIds) => {
    try {
      await customFieldService.reorderCustomFields(listId, orderedIds);
      const { fields } = get();
      const newFields = [...fields].sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
      set({ fields: newFields });
    } catch (error) {
      console.error('Failed to reorder custom fields:', error);
    }
  },

  openManagerModal: () => set({ isManagerModalOpen: true }),
  closeManagerModal: () => set({ isManagerModalOpen: false }),
}));
