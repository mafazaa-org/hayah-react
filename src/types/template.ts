// Phase 15: Template type definitions

export type TemplateCategory = 'project' | 'personal' | 'team' | 'custom';

/** Column definition embedded in a list template */
export interface TemplateColumn {
  name: string;
  color: string;
  order: number;
}

/** A reusable list template */
export interface ListTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  color: string;
  icon: string; // Lucide icon name
  columns: TemplateColumn[];
  isBuiltIn: boolean;
  createdAt: string;
}

/** A checklist item inside a task template */
export interface TemplateChecklistItem {
  title: string;
  completed: boolean;
}

/** A reusable task template */
export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  defaultPriority: 'low' | 'medium' | 'high' | 'critical';
  defaultTags: string[];
  checklist: TemplateChecklistItem[];
  isBuiltIn: boolean;
  createdAt: string;
}
