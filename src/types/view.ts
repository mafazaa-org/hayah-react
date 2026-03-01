// View mode types
export type ViewMode = 'kanban' | 'table' | 'calendar' | 'timeline';

// View configuration interface
export interface ViewConfig {
  listId: string;
  mode: ViewMode;
  settings?: {
    // View-specific settings
    density?: 'compact' | 'comfortable';
    groupBy?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
  };
  updatedAt?: string;
}

// View mode metadata
export interface ViewModeInfo {
  id: ViewMode;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

export const VIEW_MODES: ViewModeInfo[] = [
  {
    id: 'kanban',
    name: 'كانبان',
    description: 'عرض اللوحة مع الأعمدة',
    icon: 'LayoutGrid',
    available: true
  },
  {
    id: 'table',
    name: 'جدول',
    description: 'عرض الجدول مع الصفوف والأعمدة',
    icon: 'Table',
    available: false // Coming soon
  },
  {
    id: 'calendar',
    name: 'تقويم',
    description: 'عرض التقويم حسب التاريخ',
    icon: 'Calendar',
    available: false // Coming soon
  },
  {
    id: 'timeline',
    name: 'خط زمني',
    description: 'عرض جانت للمهام',
    icon: 'GanttChart',
    available: true
  }
];
