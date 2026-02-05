export interface NavigationItem {
  id: string;
  type: 'folder' | 'list';
  name: string;
  children?: NavigationItem[];
  isOpen?: boolean;
}

const MOCK_TREE: NavigationItem[] = [
  {
    id: 'space-1',
    type: 'folder',
    name: 'تطوير المنصة (Platform Dev)',
    children: [
      {
        id: 'folder-1',
        type: 'folder',
        name: 'الواجهة الأمامية (Frontend)',
        children: [
          { id: 'list-1', type: 'list', name: 'مهام المرحلة 1' },
          { id: 'list-2', type: 'list', name: 'مهام المرحلة 2' },
          { id: 'list-3', type: 'list', name: 'تحسينات UI/UX' },
        ],
        isOpen: true // Initially open for demo
      },
      {
        id: 'folder-2',
        type: 'folder',
        name: 'الخلفية (Backend)',
        children: [
          { id: 'list-4', type: 'list', name: 'API Endpoints' },
          { id: 'list-5', type: 'list', name: 'Database Schema' },
        ]
      }
    ],
    isOpen: true
  },
  {
    id: 'space-2',
    type: 'folder',
    name: 'التسويق (Marketing)',
    children: [
      { id: 'list-6', type: 'list', name: 'حملة إطلاق' },
      { id: 'list-7', type: 'list', name: 'محتوى السوشيال ميديا' },
    ]
  },
  {
    id: 'list-standalone',
    type: 'list',
    name: 'قائمة مهام عامة'
  }
];

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const folderService = {
  getNavigationTree: async (): Promise<NavigationItem[]> => {
    await delay(500);
    return MOCK_TREE;
  },

  createItem: async (parentId: string | null, type: 'folder' | 'list', name: string): Promise<NavigationItem> => {
    await delay(300);
    // Simulate creation
    console.log(`Creating ${type} "${name}" under parent ${parentId}`);

    return {
      id: `${type}-${Date.now()}`,
      type,
      name,
      children: type === 'folder' ? [] : undefined
    };
  },

  updateItem: async (id: string, updates: Partial<NavigationItem>): Promise<void> => {
    await delay(300);
    // In a real API, we would patch the item
    console.log(`Updated item ${id}`, updates);
  },

  deleteItem: async (id: string): Promise<void> => {
    await delay(300);
    console.log(`Deleted item ${id}`);
  },

  moveItem: async (id: string, newParentId: string | null, newIndex: number): Promise<void> => {
    await delay(300);
    console.log(`Moved item ${id} to parent ${newParentId} at index ${newIndex}`);
  }
};
