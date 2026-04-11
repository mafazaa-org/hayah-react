import { apiClient } from '../apiClient';

export interface ExportOptions {
  format: 'json' | 'csv';
  /** When true, only export tasks matching current filters */
  applyFilters: boolean;
  /** Columns to include in CSV export */
  csvColumns?: string[];
}

export const ALL_CSV_COLUMNS = ['title', 'description', 'status', 'priority', 'dueDate', 'tags', 'assignees', 'createdAt'];

export const exportService = {
  /**
   * Export tasks via the backend API and trigger a browser download.
   */
  exportTasks: async (
    _tasks: unknown[],
    _columns: unknown[],
    options: ExportOptions,
    listId?: string
  ): Promise<void> => {
    if (!listId) {
      console.error('listId is required for export');
      return;
    }

    const response = await apiClient.get(`/export-import/lists/${listId}/export`, {
      params: { format: options.format },
      responseType: 'blob',
    });

    const mimeType = options.format === 'csv'
      ? 'text/csv;charset=utf-8;'
      : 'application/json';
    const ext = options.format === 'csv' ? 'csv' : 'json';
    const filename = `tasks_${new Date().toISOString().split('T')[0]}.${ext}`;

    const blob = new Blob([response.data as BlobPart], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  },
};
