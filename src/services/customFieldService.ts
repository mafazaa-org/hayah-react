import type { CustomField } from '../types/customField';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulated persistence
let customFieldsStorage: CustomField[] = [
  {
    id: 'cf-budget',
    listId: 'default-list', // placeholder
    name: 'الميزانية',
    type: 'number',
    showOnCard: true,
    order: 0,
    defaultValue: 0
  },
  {
    id: 'cf-deadline',
    listId: 'default-list',
    name: 'الموعد النهائي الفعلي',
    type: 'date',
    showOnCard: false,
    order: 1
  },
  {
    id: 'cf-status-extra',
    listId: 'default-list',
    name: 'مرحلة التدقيق',
    type: 'select',
    options: [
      { id: 'opt-1', value: 'بانتظار المراجعة', color: '#64748b' },
      { id: 'opt-2', value: 'تمت المراجعة الأولى', color: '#3b82f6' },
      { id: 'opt-3', value: 'جاهز للاعتماد', color: '#10b981' }
    ],
    showOnCard: true,
    order: 2
  }
];

export const customFieldService = {
  getCustomFields: async (_listId: string): Promise<CustomField[]> => {
    await delay(300);
    return customFieldsStorage.filter(cf => cf.listId === _listId || cf.listId === 'default-list');
  },

  createCustomField: async (_listId: string, definition: Omit<CustomField, 'id'>): Promise<CustomField> => {
    await delay(400);
    const newField: CustomField = {
      ...definition,
      id: `cf-${Date.now()}`
    };
    customFieldsStorage.push(newField);
    return newField;
  },

  updateCustomField: async (id: string, updates: Partial<CustomField>): Promise<CustomField> => {
    await delay(300);
    const index = customFieldsStorage.findIndex(cf => cf.id === id);
    if (index === -1) throw new Error('Field not found');
    
    customFieldsStorage[index] = { ...customFieldsStorage[index], ...updates };
    return customFieldsStorage[index];
  },

  deleteCustomField: async (id: string): Promise<void> => {
    await delay(300);
    customFieldsStorage = customFieldsStorage.filter(cf => cf.id !== id);
  },

  reorderCustomFields: async (_listId: string, orderedIds: string[]): Promise<void> => {
    await delay(400);
    orderedIds.forEach((id, index) => {
      const field = customFieldsStorage.find(cf => cf.id === id);
      if (field) field.order = index;
    });
  }
};
