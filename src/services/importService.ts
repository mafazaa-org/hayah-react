import type { Task } from '../types/task';
import { apiClient } from '../apiClient';

/** A single row parsed from the uploaded CSV */
export interface ImportRow {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  tags: string;
  [key: string]: string;
}

/** Mapping from CSV header string → Task field key */
export interface ColumnMapping {
  csvHeader: string;
  taskField: keyof ImportRow | '__skip__';
}

export interface ImportPreview {
  headers: string[];
  rows: ImportRow[];
  totalRows: number;
}

export interface ImportProgress {
  processed: number;
  total: number;
  errors: string[];
}

const TEMPLATE_HEADERS = ['العنوان', 'الوصف', 'الحالة', 'الأولوية', 'الموعد النهائي', 'الوسوم'];

const HEADER_TO_FIELD: Record<string, keyof ImportRow> = {
  'العنوان': 'title',
  'الوصف': 'description',
  'الحالة': 'status',
  'الأولوية': 'priority',
  'الموعد النهائي': 'dueDate',
  'الوسوم': 'tags',
  // English fallbacks
  'Title': 'title',
  'Description': 'description',
  'Status': 'status',
  'Priority': 'priority',
  'Due Date': 'dueDate',
  'Tags': 'tags',
};

export const importService = {
  /**
   * Download a blank CSV template that users can fill in.
   * (Client-side only — no backend needed)
   */
  downloadTemplate: (): void => {
    const bom = '\ufeff';
    const exampleRow = ['مهمة نموذجية', 'وصف المهمة', 'قيد الانتظار', 'medium', '2026-04-01', 'تصميم, UI'];
    const csv = [TEMPLATE_HEADERS.join(','), exampleRow.map(c => `"${c}"`).join(',')].join('\n');
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'hayah_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  },

  /**
   * Parse a CSV file and return a preview of data + auto-detected column mapping.
   * (Client-side parsing for preview)
   */
  parseCSV: async (file: File): Promise<ImportPreview> => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) throw new Error('الملف فارغ');

    const headers = parseCsvLine(lines[0]);
    const rows: ImportRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cells = parseCsvLine(lines[i]);
      const row: ImportRow = { title: '', description: '', status: '', priority: '', dueDate: '', tags: '' };
      headers.forEach((h, idx) => {
        const field = HEADER_TO_FIELD[h.trim()];
        if (field && idx < cells.length) {
          row[field] = cells[idx];
        }
      });
      if (row.title || row.description) {
        rows.push(row);
      }
    }

    return { headers, rows, totalRows: rows.length };
  },

  /**
   * Auto-detect mapping from CSV headers to Task fields.
   */
  autoDetectMapping: (headers: string[]): ColumnMapping[] => {
    return headers.map(h => {
      const field = HEADER_TO_FIELD[h.trim()];
      return { csvHeader: h, taskField: field || '__skip__' };
    });
  },

  /**
   * Commit the import — uploads CSV file to backend for processing.
   */
  commitImport: async (
    listId: string,
    _rows: ImportRow[],
    _defaultStatus: string,
    onProgress?: (progress: ImportProgress) => void,
    originalFile?: File
  ): Promise<Task[]> => {
    if (originalFile) {
      // Upload CSV file directly to backend
      const formData = new FormData();
      formData.append('file', originalFile);

      onProgress?.({ processed: 0, total: _rows.length, errors: [] });

      const response = await apiClient.post<{ created: number; failed: number; errors: { row: number; message: string }[] }>(
        `/export-import/lists/${listId}/import/tasks`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const result = response.data;
      const errors = result.errors.map(e => `صف ${e.row}: ${e.message}`);
      onProgress?.({ processed: result.created + result.failed, total: result.created + result.failed, errors });

      // Return empty array since backend handles task creation
      return [];
    }

    // Fallback: use bulk create API with parsed rows
    const tasks = _rows.filter(r => r.title.trim()).map(row => ({
      title: row.title.trim(),
      description: row.description?.trim() || undefined,
      status: row.status?.trim() || _defaultStatus,
      priority: row.priority?.trim() || 'Medium',
      dueDate: row.dueDate?.trim() || undefined,
    }));

    onProgress?.({ processed: 0, total: tasks.length, errors: [] });

    const response = await apiClient.post<{ created: Task[] }>('/export-import/tasks/bulk', {
      listId,
      tasks,
    });

    onProgress?.({ processed: tasks.length, total: tasks.length, errors: [] });
    return response.data.created || [];
  },
};

// --- helpers ---

/** Very simple CSV line parser supporting quoted fields */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}
