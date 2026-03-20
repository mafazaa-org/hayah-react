// View mode types
export type ViewMode = 'kanban' | 'table' | 'calendar' | 'timeline' | 'roadmap' | 'workload' | 'overview';

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
  },
  {
    id: 'roadmap',
    name: 'خارطة الطريق',
    description: 'خطة استراتيجية للمشروع',
    icon: 'Map',
    available: true
  },
  {
    id: 'workload',
    name: 'عبء العمل',
    description: 'حجم المهام الموزعة على الفريق',
    icon: 'Users',
    available: true
  },
  {
    id: 'overview',
    name: 'نظرة عامة',
    description: 'إحصائيات وملخص حالة القائمة',
    icon: 'PieChart',
    available: true
  }
];
