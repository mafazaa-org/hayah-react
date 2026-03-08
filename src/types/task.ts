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
   * ID of the iteration / sprint this task belongs to.
   */
  iterationId?: string;
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
  isArchived?: boolean;
}

// --- Phase 8: Detail View Types ---

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface Checklist {
  id: string;
  taskId: string;
  title: string;
  items: ChecklistItem[];
}

export type DependencyType = 'blocks' | 'blocked_by';

export interface TaskDependency {
  id: string;
  type: DependencyType;
  sourceTaskId: string;
  targetTaskId: string;
  targetTaskTitle?: string; // for display purposes
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  name: string;
  size: number; // bytes
  mimeType: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export type ActivityType =
  | 'created'
  | 'status_change'
  | 'priority_change'
  | 'assignee_change'
  | 'title_change'
  | 'description_change'
  | 'due_date_change'
  | 'tag_change'
  | 'subtask_change'
  | 'checklist_change'
  | 'dependency_change'
  | 'attachment_change'
  | 'archived'
  | 'unarchived';

export interface TaskActivity {
  id: string;
  taskId: string;
  type: ActivityType;
  actor: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

// --- Phase 9: Comments & Collaboration Types ---

export interface CommentAttachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface CommentReaction {
  emoji: string;
  userId: string;
  userName: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  mentionedUsers: string[]; // user IDs
  attachments: CommentAttachment[];
  reactions: CommentReaction[];
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
}

export interface TaskDetail extends Task {
  subtasks: Subtask[];
  checklists: Checklist[];
  taskDependencies: TaskDependency[];
  attachments: TaskAttachment[];
  activity: TaskActivity[];
  comments: TaskComment[];
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
