import type { Iteration } from '../types/iteration';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let iterationsStorage: Iteration[] = [
  {
    id: 'iter-1',
    listId: 'default-list',
    name: 'الدورة 1: التجهيز',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    goal: 'إعداد البنية التحتية للمشروع',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'iter-2',
    listId: 'default-list',
    name: 'الدورة 2: الميزات الأساسية',
    startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'planned',
    goal: 'تنفيذ عمليات المصادقة وإدارة الملف الشخصي',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const iterationService = {
  getIterations: async (_listId: string): Promise<Iteration[]> => {
    await delay(300);
    return iterationsStorage.filter(it => it.listId === _listId || it.listId === 'default-list');
  },

  createIteration: async (_listId: string, definition: Omit<Iteration, 'id' | 'createdAt' | 'updatedAt'>): Promise<Iteration> => {
    await delay(400);
    const newIteration: Iteration = {
      ...definition,
      id: `iter-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    iterationsStorage.push(newIteration);
    return newIteration;
  },

  updateIteration: async (id: string, updates: Partial<Iteration>): Promise<Iteration> => {
    await delay(300);
    const index = iterationsStorage.findIndex(it => it.id === id);
    if (index === -1) throw new Error('Iteration not found');
    
    iterationsStorage[index] = { 
      ...iterationsStorage[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return iterationsStorage[index];
  },

  deleteIteration: async (id: string): Promise<void> => {
    await delay(300);
    iterationsStorage = iterationsStorage.filter(it => it.id !== id);
  }
};
