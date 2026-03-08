import type { Task } from '../types/task';

// Simulated delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
   */
  parseCSV: async (file: File): Promise<ImportPreview> => {
    await delay(400);
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
      // At minimum, skip entirely empty rows
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
   * Commit the import — creates tasks from parsed rows.
   * Reports progress via callback.
   */
  commitImport: async (
    listId: string,
    rows: ImportRow[],
    defaultStatus: string,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<Task[]> => {
    const created: Task[] = [];
    const errors: string[] = [];
    const total = rows.length;

    for (let i = 0; i < total; i++) {
      await delay(120); // simulate per-row processing

      const row = rows[i];
      if (!row.title.trim()) {
        errors.push(`صف ${i + 1}: العنوان مطلوب`);
        onProgress?.({ processed: i + 1, total, errors: [...errors] });
        continue;
      }

      const task: Task = {
        id: `task-${listId}-imp-${Date.now()}-${i}`,
        title: row.title.trim(),
        description: row.description?.trim() || undefined,
        status: row.status?.trim() || defaultStatus,
        priority: validatePriority(row.priority?.trim()),
        dueDate: row.dueDate?.trim() || undefined,
        tags: row.tags ? row.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        assignees: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: i,
      };

      created.push(task);
      onProgress?.({ processed: i + 1, total, errors: [...errors] });
    }

    return created;
  },
};

// --- helpers ---

function validatePriority(val?: string): Task['priority'] {
  const valid = ['low', 'medium', 'high', 'critical'];
  if (val && valid.includes(val)) return val as Task['priority'];
  return 'medium';
}

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
