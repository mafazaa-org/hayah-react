import { create } from 'zustand';
import type { Column } from '../types/task';
import { columnService } from '../services/columnService';

interface ColumnState {
  // State
  columns: Column[];
  isLoading: boolean;
  error: string | null;
  currentListId: string | null;

  // Modal state
  isColumnModalOpen: boolean;
  editingColumnId: string | null;

  // Actions
  fetchColumns: (listId: string) => Promise<void>;
  addColumn: (listId: string, name: string, color: string) => Promise<void>;
  updateColumn: (columnId: string, updates: Partial<Pick<Column, 'name' | 'color'>>) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  reorderColumns: (listId: string, columnIds: string[]) => Promise<void>;

  // Modal actions
  openColumnModal: (columnId?: string) => void;
  closeColumnModal: () => void;
}

export const useColumnStore = create<ColumnState>((set, get) => ({
  // Initial state
  columns: [],
  isLoading: false,
  error: null,
  currentListId: null,
  isColumnModalOpen: false,
  editingColumnId: null,

  // Fetch columns for a list
  fetchColumns: async (listId: string) => {
    set({ isLoading: true, error: null, currentListId: listId });
    try {
      const columns = await columnService.getColumnsForList(listId);
      set({ columns, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch columns:', error);
      set({ error: 'فشل تحميل الأعمدة', isLoading: false });
    }
  },

  // Add a new column
  addColumn: async (listId: string, name: string, color: string) => {
    set({ isLoading: true });
    try {
      const newColumn = await columnService.createColumn(listId, name, color);
      set(state => ({
        columns: [...state.columns, newColumn],
        isLoading: false,
        isColumnModalOpen: false
      }));
    } catch (error) {
      console.error('Failed to create column:', error);
      set({ error: 'فشل إنشاء العمود', isLoading: false });
    }
  },

  // Update column properties
  updateColumn: async (columnId: string, updates: Partial<Pick<Column, 'name' | 'color'>>) => {
    set({ isLoading: true });
    try {
      const updatedColumn = await columnService.updateColumn(columnId, updates);
      set(state => ({
        columns: state.columns.map(col =>
          col.id === columnId ? updatedColumn : col
        ),
        isLoading: false,
        isColumnModalOpen: false,
        editingColumnId: null
      }));
    } catch (error) {
      console.error('Failed to update column:', error);
      set({ error: 'فشل تحديث العمود', isLoading: false });
    }
  },

  // Delete a column
  deleteColumn: async (columnId: string) => {
    set({ isLoading: true });
    try {
      await columnService.deleteColumn(columnId);
      set(state => ({
        columns: state.columns.filter(col => col.id !== columnId),
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to delete column:', error);
      set({ error: 'فشل حذف العمود', isLoading: false });
    }
  },

  // Reorder columns
  reorderColumns: async (listId: string, columnIds: string[]) => {
    // Optimistic update
    const { columns } = get();
    const columnMap = new Map(columns.map(col => [col.id, col]));
    const reorderedColumns = columnIds
      .map(id => columnMap.get(id))
      .filter((col): col is Column => col !== undefined)
      .map((col, index) => ({ ...col, order: index }));

    set({ columns: reorderedColumns });

    try {
      await columnService.reorderColumns(listId, columnIds);
    } catch (error) {
      console.error('Failed to reorder columns:', error);
      // Revert on error
      set({ columns, error: 'فشل إعادة ترتيب الأعمدة' });
    }
  },

  // Modal actions
  openColumnModal: (columnId?: string) => {
    set({ isColumnModalOpen: true, editingColumnId: columnId || null });
  },

  closeColumnModal: () => {
    set({ isColumnModalOpen: false, editingColumnId: null });
  }
}));
