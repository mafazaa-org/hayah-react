import { apiClient } from '../apiClient';

export interface NavigationItem {
  id: string;
  type: 'folder' | 'list';
  name: string;
  children?: NavigationItem[];
  isOpen?: boolean;

  // List specific properties
  description?: string;
  visibility?: 'private' | 'public' | 'workspace';
  isArchived?: boolean;
  color?: string; // hex code
  workspaceId?: string;
  folderId?: string | null;
}

export const folderService = {
  getNavigationTree: async (workspaceId = 'default'): Promise<NavigationItem[]> => {
    const response = await apiClient.get<NavigationItem[]>(`/folders/workspace/${workspaceId}/tree`);
    return response.data;
  },

  createItem: async (parentId: string | null, type: 'folder' | 'list', name: string, workspaceId = 'default'): Promise<NavigationItem> => {
    if (type === 'folder') {
      const response = await apiClient.post<NavigationItem>('/folders', {
        name,
        workspaceId,
        parentFolderId: parentId,
      });
      return { ...response.data, type: 'folder', children: [] };
    } else {
      const response = await apiClient.post<NavigationItem>('/lists', {
        name,
        workspaceId,
        folderId: parentId,
      });
      return { ...response.data, type: 'list' };
    }
  },

  updateItem: async (id: string, updates: Partial<NavigationItem>): Promise<void> => {
    if (updates.type === 'folder' || (!updates.type && !updates.visibility)) {
      // Try folder first — if the caller knows the type they should pass it
      await apiClient.put(`/folders/${id}`, { name: updates.name });
    } else {
      await apiClient.put(`/lists/${id}`, {
        name: updates.name,
        description: updates.description,
        visibility: updates.visibility,
      });
    }
  },

  deleteItem: async (id: string, type?: 'folder' | 'list'): Promise<void> => {
    if (type === 'folder') {
      await apiClient.delete(`/folders/${id}`);
    } else if (type === 'list') {
      await apiClient.delete(`/lists/${id}`);
    } else {
      // If type is unknown, try lists first (more common), then folders
      try {
        await apiClient.delete(`/lists/${id}`);
      } catch {
        await apiClient.delete(`/folders/${id}`);
      }
    }
  },

  moveItem: async (id: string, newParentId: string | null, _newIndex: number): Promise<void> => {
    await apiClient.put(`/folders/${id}/move`, {
      parentFolderId: newParentId,
    });
  },
};
