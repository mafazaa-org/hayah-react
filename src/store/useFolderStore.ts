import { create } from 'zustand';
import { folderService } from '../services/folderService';
import type { NavigationItem } from '../services/folderService';

interface FolderState {
  tree: NavigationItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTree: () => Promise<void>;
  toggleFolder: (id: string, isOpen: boolean) => void;
  addItem: (parentId: string | null, type: 'folder' | 'list', name: string) => Promise<void>;
  updateItemName: (id: string, name: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  // For drag and drop updates (optimistic or final)
  setTree: (tree: NavigationItem[]) => void;
}

// Helper: Recursively find and update an item in the tree
const updateNodeInTree = (nodes: NavigationItem[], id: string, updater: (node: NavigationItem) => NavigationItem): NavigationItem[] => {
  return nodes.map(node => {
    if (node.id === id) {
      return updater(node);
    }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, id, updater) };
    }
    return node;
  });
};

// Helper: Recursively add item to parent
const addItemToTree = (nodes: NavigationItem[], parentId: string | null, newItem: NavigationItem): NavigationItem[] => {
  if (parentId === null) {
    return [...nodes, newItem];
  }
  return nodes.map(node => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children || []), newItem] };
    }
    if (node.children) {
      return { ...node, children: addItemToTree(node.children, parentId, newItem) };
    }
    return node;
  });
};

// Helper: Recursively delete item
const deleteItemFromTree = (nodes: NavigationItem[], id: string): NavigationItem[] => {
  return nodes
    .filter(node => node.id !== id)
    .map(node => ({
      ...node,
      children: node.children ? deleteItemFromTree(node.children, id) : undefined
    }));
};

export const useFolderStore = create<FolderState>((set, get) => ({
  tree: [],
  isLoading: false,
  error: null,

  fetchTree: async () => {
    set({ isLoading: true, error: null });
    try {
      const tree = await folderService.getNavigationTree();
      set({ tree, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ error: 'Failed to fetch folders', isLoading: false });
    }
  },

  setTree: (tree) => set({ tree }),

  toggleFolder: (id, isOpen) => {
    set(state => ({
      tree: updateNodeInTree(state.tree, id, node => ({ ...node, isOpen }))
    }));
  },

  addItem: async (parentId, type, name) => {
    // Optimistic update could happen here, but for creation we usually wait for ID
    try {
      const newItem = await folderService.createItem(parentId, type, name);
      set(state => ({
        tree: addItemToTree(state.tree, parentId, newItem)
      }));
    } catch (err) {
      console.error(err);
      // Handle error (maybe toast)
    }
  },

  updateItemName: async (id, name) => {
    // Optimistic
    set(state => ({
      tree: updateNodeInTree(state.tree, id, node => ({ ...node, name }))
    }));

    try {
      await folderService.updateItem(id, { name });
    } catch (err) {
      console.error(err)
      // Revert if failed (todo)
    }
  },

  deleteItem: async (id) => {
    // Optimistic
    const previousTree = get().tree;
    set(state => ({
      tree: deleteItemFromTree(state.tree, id)
    }));

    try {
      await folderService.deleteItem(id);
    } catch (err) {
      console.error(err)
      set({ tree: previousTree }); // Revert
    }
  }
}));
