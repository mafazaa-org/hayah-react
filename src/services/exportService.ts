import type { Task, Column } from '../types/task';

// Simulated delay for async operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface ExportOptions {
  format: 'json' | 'csv';
  /** When true, only export tasks matching current filters */
  applyFilters: boolean;
  /** Columns to include in CSV export */
  csvColumns?: string[];
}

const CSV_COLUMN_MAP: Record<string, { header: string; accessor: (task: Task, columns: Column[]) => string }> = {
  title:       { header: 'العنوان',        accessor: (t) => t.title },
  description: { header: 'الوصف',          accessor: (t) => t.description || '' },
  status:      { header: 'الحالة',         accessor: (t, cols) => cols.find(c => c.id === t.status)?.name || '' },
  priority:    { header: 'الأولوية',       accessor: (t) => t.priority || '' },
  dueDate:     { header: 'الموعد النهائي', accessor: (t) => t.dueDate ? new Date(t.dueDate).toLocaleDateString('ar-EG') : '' },
  tags:        { header: 'الوسوم',         accessor: (t) => t.tags?.join(', ') || '' },
  assignees:   { header: 'المكلفون',       accessor: (t) => t.assignees?.join(', ') || '' },
  createdAt:   { header: 'تاريخ الإنشاء',  accessor: (t) => new Date(t.createdAt).toLocaleDateString('ar-EG') },
};

export const ALL_CSV_COLUMNS = Object.keys(CSV_COLUMN_MAP);

export const exportService = {
  /**
   * Export tasks to the selected format and trigger a browser download.
   */
  exportTasks: async (
    tasks: Task[],
    columns: Column[],
    options: ExportOptions
  ): Promise<void> => {
    await delay(300);

    const selectedCols = options.csvColumns && options.csvColumns.length > 0
      ? options.csvColumns
      : ALL_CSV_COLUMNS;

    if (options.format === 'csv') {
      const headers = selectedCols.map(k => CSV_COLUMN_MAP[k]?.header ?? k);
      const rows = tasks.map(task =>
        selectedCols.map(k => {
          const val = CSV_COLUMN_MAP[k]?.accessor(task, columns) ?? '';
          // Escape double-quotes inside cells
          return `"${val.replace(/"/g, '""')}"`;
        })
      );

      const bom = '\ufeff'; // UTF-8 BOM for Excel compatibility
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      triggerDownload(bom + csvContent, 'text/csv;charset=utf-8;', `tasks_${dateSuffix()}.csv`);
    } else {
      const data = {
        exportDate: new Date().toISOString(),
        columns,
        tasks,
      };
      const jsonContent = JSON.stringify(data, null, 2);
      triggerDownload(jsonContent, 'application/json', `tasks_${dateSuffix()}.json`);
    }
  },
};

// --- helpers ---

function dateSuffix(): string {
  return new Date().toISOString().split('T')[0];
}

function triggerDownload(content: string, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
