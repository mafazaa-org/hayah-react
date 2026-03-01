import type { Column } from '../types/task';
import { DEFAULT_COLUMNS } from '../types/task';

// Simulated delay for async operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data store
const mockColumnsStore = new Map<string, Column[]>();

// Initialize default columns for a list
const initializeColumnsForList = (listId: string): Column[] => {
  if (mockColumnsStore.has(listId)) {
    return mockColumnsStore.get(listId)!;
  }

  const columns: Column[] = DEFAULT_COLUMNS.map((col, index) => ({
    ...col,
    id: `col-${listId}-${index}`,
    listId
  }));

  mockColumnsStore.set(listId, columns);
  return columns;
};

export const columnService = {
  /**
   * Get all columns for a list
   */
  getColumnsForList: async (listId: string): Promise<Column[]> => {
    await delay(300);
    console.log(`Fetching columns for list ${listId}`);
    return initializeColumnsForList(listId);
  },

  /**
   * Create a new column
   */
  createColumn: async (listId: string, name: string, color: string): Promise<Column> => {
    await delay(400);
    const columns = initializeColumnsForList(listId);

    const newColumn: Column = {
      id: `col-${listId}-${Date.now()}`,
      name,
      color,
      order: columns.length,
      listId
    };

    columns.push(newColumn);
    mockColumnsStore.set(listId, columns);

    console.log('Created column:', newColumn);
    return newColumn;
  },

  /**
   * Update column properties
   */
  updateColumn: async (columnId: string, updates: Partial<Pick<Column, 'name' | 'color'>>): Promise<Column> => {
    await delay(300);

    // Find the column across all lists
    for (const [listId, columns] of mockColumnsStore.entries()) {
      const columnIndex = columns.findIndex(c => c.id === columnId);
      if (columnIndex !== -1) {
        const updatedColumn = { ...columns[columnIndex], ...updates };
        columns[columnIndex] = updatedColumn;
        mockColumnsStore.set(listId, columns);
        console.log('Updated column:', updatedColumn);
        return updatedColumn;
      }
    }

    throw new Error(`Column ${columnId} not found`);
  },

  /**
   * Delete a column
   */
  deleteColumn: async (columnId: string): Promise<void> => {
    await delay(400);

    for (const [listId, columns] of mockColumnsStore.entries()) {
      const filteredColumns = columns.filter(c => c.id !== columnId);
      if (filteredColumns.length !== columns.length) {
        // Reorder remaining columns
        filteredColumns.forEach((col, index) => {
          col.order = index;
        });
        mockColumnsStore.set(listId, filteredColumns);
        console.log(`Deleted column ${columnId}`);
        return;
      }
    }

    throw new Error(`Column ${columnId} not found`);
  },

  /**
   * Reorder columns
   */
  reorderColumns: async (listId: string, columnIds: string[]): Promise<Column[]> => {
    await delay(300);
    const columns = mockColumnsStore.get(listId);

    if (!columns) {
      throw new Error(`List ${listId} not found`);
    }

    // Create a map for quick lookup
    const columnMap = new Map(columns.map(col => [col.id, col]));

    // Reorder based on provided IDs
    const reorderedColumns = columnIds
      .map(id => columnMap.get(id))
      .filter((col): col is Column => col !== undefined)
      .map((col, index) => ({ ...col, order: index }));

    mockColumnsStore.set(listId, reorderedColumns);
    console.log('Reordered columns for list', listId);
    return reorderedColumns;
  }
};
