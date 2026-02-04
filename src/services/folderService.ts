export interface NavigationItem {
  id: string;
  type: 'folder' | 'list';
  name: string;
  children?: NavigationItem[];
  isOpen?: boolean; // Initial state suggestion
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
        ]
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
    ]
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

export const folderService = {
  getNavigationTree: async (): Promise<NavigationItem[]> => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_TREE), 500);
    });
  }
};
