import type { Task } from '../types/task';
import type { NavigationItem } from './folderService';
import type {
  ListTemplate,
  TaskTemplate,
} from '../types/template';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Built-in List Templates ───────────────────────────────────────────────

const BUILT_IN_LIST_TEMPLATES: ListTemplate[] = [
  {
    id: 'lt-kanban',
    name: 'لوحة كانبان',
    description: 'سير عمل قياسي: قيد الانتظار، قيد التنفيذ، مكتمل',
    category: 'project',
    color: '#3b82f6',
    icon: 'LayoutDashboard',
    columns: [
      { name: 'قيد الانتظار', color: '#64748b', order: 0 },
      { name: 'قيد التنفيذ', color: '#3b82f6', order: 1 },
      { name: 'مكتمل', color: '#10b981', order: 2 },
    ],
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'lt-bugs',
    name: 'تتبع الأخطاء',
    description: 'لتتبع الأخطاء والمشاكل التقنية مع تصنيف الخطورة',
    category: 'project',
    color: '#ef4444',
    icon: 'Bug',
    columns: [
      { name: 'جديد', color: '#ef4444', order: 0 },
      { name: 'قيد التحقيق', color: '#f59e0b', order: 1 },
      { name: 'قيد الإصلاح', color: '#3b82f6', order: 2 },
      { name: 'قيد الاختبار', color: '#8b5cf6', order: 3 },
      { name: 'تم الإصلاح', color: '#10b981', order: 4 },
    ],
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'lt-content',
    name: 'تقويم المحتوى',
    description: 'لتخطيط وجدولة المحتوى والمنشورات',
    category: 'team',
    color: '#10b981',
    icon: 'CalendarDays',
    columns: [
      { name: 'أفكار', color: '#64748b', order: 0 },
      { name: 'قيد الكتابة', color: '#f59e0b', order: 1 },
      { name: 'قيد المراجعة', color: '#8b5cf6', order: 2 },
      { name: 'جاهز للنشر', color: '#3b82f6', order: 3 },
      { name: 'منشور', color: '#10b981', order: 4 },
    ],
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'lt-sprint',
    name: 'سبرنت أجايل',
    description: 'لإدارة سبرنتات الفريق مع مراحل التطوير',
    category: 'team',
    color: '#8b5cf6',
    icon: 'Zap',
    columns: [
      { name: 'المتراكمات', color: '#64748b', order: 0 },
      { name: 'قيد التخطيط', color: '#f59e0b', order: 1 },
      { name: 'قيد التطوير', color: '#3b82f6', order: 2 },
      { name: 'مراجعة الكود', color: '#8b5cf6', order: 3 },
      { name: 'اختبار', color: '#ec4899', order: 4 },
      { name: 'مكتمل', color: '#10b981', order: 5 },
    ],
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'lt-personal',
    name: 'مهام شخصية',
    description: 'لوحة بسيطة لتنظيم المهام الشخصية اليومية',
    category: 'personal',
    color: '#f59e0b',
    icon: 'User',
    columns: [
      { name: 'اليوم', color: '#f59e0b', order: 0 },
      { name: 'هذا الأسبوع', color: '#3b82f6', order: 1 },
      { name: 'لاحقاً', color: '#64748b', order: 2 },
      { name: 'منجز', color: '#10b981', order: 3 },
    ],
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

// ─── Built-in Task Templates ───────────────────────────────────────────────

const BUILT_IN_TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'tt-feature',
    name: 'ميزة جديدة',
    description: 'قالب لتطوير ميزة جديدة مع قائمة تحقق شاملة',
    category: 'project',
    defaultPriority: 'medium',
    defaultTags: ['ميزة', 'تطوير'],
    checklist: [
      { title: 'كتابة المتطلبات', completed: false },
      { title: 'التصميم الفني', completed: false },
      { title: 'التطوير', completed: false },
      { title: 'كتابة الاختبارات', completed: false },
      { title: 'مراجعة الكود', completed: false },
      { title: 'النشر', completed: false },
    ],
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tt-bug',
    name: 'إصلاح خطأ',
    description: 'قالب لتوثيق وإصلاح الأخطاء البرمجية',
    category: 'project',
    defaultPriority: 'high',
    defaultTags: ['خطأ', 'إصلاح'],
    checklist: [
      { title: 'إعادة إنتاج المشكلة', completed: false },
      { title: 'تحديد السبب الجذري', completed: false },
      { title: 'كتابة الإصلاح', completed: false },
      { title: 'اختبار الإصلاح', completed: false },
      { title: 'اختبار الانحدار', completed: false },
    ],
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tt-meeting',
    name: 'ملاحظات اجتماع',
    description: 'قالب لتوثيق ملاحظات ونتائج الاجتماعات',
    category: 'team',
    defaultPriority: 'low',
    defaultTags: ['اجتماع'],
    checklist: [
      { title: 'تحديد جدول الأعمال', completed: false },
      { title: 'تدوين القرارات', completed: false },
      { title: 'تحديد بنود العمل', completed: false },
      { title: 'مشاركة الملاحظات', completed: false },
    ],
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tt-review',
    name: 'مراجعة محتوى',
    description: 'قالب لمراجعة وتدقيق المحتوى قبل النشر',
    category: 'team',
    defaultPriority: 'medium',
    defaultTags: ['مراجعة', 'محتوى'],
    checklist: [
      { title: 'مراجعة النص', completed: false },
      { title: 'التدقيق اللغوي', completed: false },
      { title: 'مراجعة التصميم', completed: false },
      { title: 'الموافقة النهائية', completed: false },
    ],
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tt-research',
    name: 'مهمة بحثية',
    description: 'قالب لتنظيم مهام البحث والاستقصاء',
    category: 'personal',
    defaultPriority: 'medium',
    defaultTags: ['بحث'],
    checklist: [
      { title: 'تحديد نطاق البحث', completed: false },
      { title: 'جمع المصادر', completed: false },
      { title: 'التحليل والمقارنة', completed: false },
      { title: 'كتابة التقرير', completed: false },
      { title: 'تقديم النتائج', completed: false },
    ],
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

// Custom templates (simulated persistent storage)
let customListTemplates: ListTemplate[] = [];
let customTaskTemplates: TaskTemplate[] = [];

// ─── Service ───────────────────────────────────────────────────────────────

export const templateService = {
  // --- List Templates ---

  getListTemplates: async (): Promise<ListTemplate[]> => {
    await delay(300);
    return [...BUILT_IN_LIST_TEMPLATES, ...customListTemplates];
  },

  createListFromTemplate: async (
    templateId: string,
    name: string,
    parentId: string | null
  ): Promise<NavigationItem> => {
    await delay(500);
    const all = [...BUILT_IN_LIST_TEMPLATES, ...customListTemplates];
    const template = all.find(t => t.id === templateId);
    console.log(`[templateService] Creating list "${name}" from template "${template?.name}" in parent ${parentId}`);
    return {
      id: `list-tpl-${Date.now()}`,
      type: 'list',
      name,
      description: template?.description || 'Created from template',
      color: template?.color,
      visibility: 'private',
    };
  },

  saveListAsTemplate: async (listId: string, name: string, description: string): Promise<ListTemplate> => {
    await delay(400);
    const newTemplate: ListTemplate = {
      id: `lt-custom-${Date.now()}`,
      name,
      description,
      category: 'custom',
      color: '#64748b',
      icon: 'FileStack',
      columns: [
        { name: 'قيد الانتظار', color: '#64748b', order: 0 },
        { name: 'قيد التنفيذ', color: '#3b82f6', order: 1 },
        { name: 'مكتمل', color: '#10b981', order: 2 },
      ],
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
    };
    customListTemplates.push(newTemplate);
    console.log(`[templateService] Saved list ${listId} as template "${name}"`);
    return newTemplate;
  },

  // --- Task Templates ---

  getTaskTemplates: async (): Promise<TaskTemplate[]> => {
    await delay(300);
    return [...BUILT_IN_TASK_TEMPLATES, ...customTaskTemplates];
  },

  createTaskFromTemplate: async (
    templateId: string,
    listId: string,
    columnId: string
  ): Promise<Task> => {
    await delay(400);
    const all = [...BUILT_IN_TASK_TEMPLATES, ...customTaskTemplates];
    const template = all.find(t => t.id === templateId);
    if (!template) throw new Error('القالب غير موجود');

    const task: Task = {
      id: `task-tpl-${Date.now()}`,
      title: template.name,
      description: template.description,
      status: columnId,
      priority: template.defaultPriority,
      tags: [...template.defaultTags],
      assignees: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 0,
    };
    console.log(`[templateService] Created task from template "${template.name}" in list ${listId}`);
    return task;
  },

  saveTaskAsTemplate: async (taskId: string, name: string, description: string): Promise<TaskTemplate> => {
    await delay(400);
    const newTemplate: TaskTemplate = {
      id: `tt-custom-${Date.now()}`,
      name,
      description,
      category: 'custom',
      defaultPriority: 'medium',
      defaultTags: [],
      checklist: [],
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
    };
    customTaskTemplates.push(newTemplate);
    console.log(`[templateService] Saved task ${taskId} as template "${name}"`);
    return newTemplate;
  },

  // --- Delete (custom only) ---

  deleteTemplate: async (templateId: string, type: 'list' | 'task'): Promise<void> => {
    await delay(300);
    if (type === 'list') {
      customListTemplates = customListTemplates.filter(t => t.id !== templateId);
    } else {
      customTaskTemplates = customTaskTemplates.filter(t => t.id !== templateId);
    }
    console.log(`[templateService] Deleted ${type} template ${templateId}`);
  },
};
