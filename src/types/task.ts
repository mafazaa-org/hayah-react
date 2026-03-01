// Task type definitions
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string; // column ID
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignees?: string[]; // user IDs
  dueDate?: string;
  tags?: string[];
  /**
   * Lightweight custom-field values attached to the task.
   * This will be expanded in Phase 16 (Custom Fields) but
   * is sufficient for basic filtering by custom fields.
   */
  customFields?: Record<string, string | number | boolean>;
  /**
   * Subtask progress summary (for quick card display).
   */
  subtaskStats?: {
    completed: number;
    total: number;
  };
  /**
   * Checklist progress summary (for quick card display).
   */
  checklistStats?: {
    completed: number;
    total: number;
  };
  /**
   * Optional iteration / sprint name.
   */
  iterationName?: string;
  /**
   * Number of file attachments linked to this task.
   */
  attachmentsCount?: number;
  /**
   * Number of dependencies (blocks / blocked-by).
   */
  dependencyCount?: number;
  createdAt: string;
  updatedAt: string;
  startDate?: string; // Phase 7: Timeline View
  dependencies?: string[]; // List of task IDs that this task depends on
  order: number; // Position within column
}

// Column/Status type definitions
export interface Column {
  id: string;
  name: string;
  color: string;
  order: number;
  listId: string;
}

// Priority colors for visual indicators
export const PRIORITY_COLORS = {
  low: '#64748b',      // slate
  medium: '#3b82f6',   // blue
  high: '#f59e0b',     // amber
  critical: '#ef4444'  // red
} as const;

// Default columns for new lists
export const DEFAULT_COLUMNS: Omit<Column, 'id' | 'listId'>[] = [
  { name: 'قيد الانتظار', color: '#64748b', order: 0 },  // To Do
  { name: 'قيد التنفيذ', color: '#3b82f6', order: 1 },   // In Progress
  { name: 'مكتمل', color: '#10b981', order: 2 }          // Done
];
