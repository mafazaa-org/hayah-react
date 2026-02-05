import type { NavigationItem } from './folderService';

// Extended list details (could be part of NavigationItem or separate fetch)
export interface ListDetails extends NavigationItem {
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string;
  members?: string[];
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock templates
const LIST_TEMPLATES: Partial<NavigationItem>[] = [
  {
    name: "Kanban Board",
    type: "list",
    description: "Standard To Do, In Progress, Done workflow",
    color: "#3b82f6"
  },
  {
    name: "Bug Tracking",
    type: "list",
    description: "Track issues with priority and severity",
    color: "#ef4444"
  },
  {
    name: "Content Calendar",
    type: "list",
    description: "Plan and schedule content publication",
    color: "#10b981"
  }
];

export const listService = {
  getListDetails: async (id: string): Promise<ListDetails> => {
    await delay(300);
    // In a real app, fetch full details
    return {
      id,
      type: 'list',
      name: 'Loaded List',
      description: 'Fetched from API',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  updateList: async (id: string, updates: Partial<ListDetails>): Promise<void> => {
    await delay(300);
    console.log(`Updated list ${id}`, updates);
  },

  duplicateList: async (id: string, options: { withTasks: boolean }): Promise<NavigationItem> => {
    await delay(500);
    console.log(`Duplicating list ${id} options:`, options);
    return {
      id: `list-${Date.now()}`,
      type: 'list',
      name: `Copy of List ${id}`,
      visibility: 'private'
    };
  },

  archiveList: async (id: string, archive: boolean): Promise<void> => {
    await delay(300);
    console.log(`Set archive status of ${id} to ${archive}`);
  },

  getTemplates: async (): Promise<Partial<NavigationItem>[]> => {
    await delay(300);
    return LIST_TEMPLATES;
  },

  createFromTemplate: async (templateIndex: number, name: string, parentId: string | null): Promise<NavigationItem> => {
    await delay(500);
    console.log(`Creating list "${name}" from template index ${templateIndex} in parent ${parentId}`);
    const template = LIST_TEMPLATES[templateIndex];

    return {
      id: `list-tpl-${Date.now()}`,
      type: 'list',
      name,
      description: template.description || 'Created from template',
      color: template.color,
      visibility: 'private'
    };
  },

  saveAsTemplate: async (listId: string, name: string): Promise<void> => {
    await delay(400);
    console.log(`Saved list ${listId} as template "${name}"`);
  }
};
