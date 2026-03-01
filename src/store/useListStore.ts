import { create } from 'zustand';
import { listService, type ListDetails } from '../services/listService';
import { folderService, type NavigationItem } from '../services/folderService';
import { useFolderStore } from './useFolderStore'; // To trigger tree refreshes
import { sharingService, type ListMember, type Role } from '../services/sharingService';

interface ListState {
  activeListId: string | null;
  activeListDetails: ListDetails | null;
  isLoading: boolean;

  // Modal States
  isCreateModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isTemplatesModalOpen: boolean;
  isShareModalOpen: boolean;

  // Context for modals (e.g., which folder to create list in, or which list to edit)
  contextParentId: string | null;
  contextListId: string | null;

  // Sharing State
  listMembers: ListMember[];
  activeUsers: ListMember[]; // For presence

  // Actions
  setActiveList: (id: string | null) => void;
  fetchListDetails: (id: string) => Promise<void>;

  // Modal Actions
  openCreateModal: (parentId?: string | null) => void;
  closeCreateModal: () => void;
  openSettingsModal: (listId: string) => void;
  closeSettingsModal: () => void;
  openTemplatesModal: (parentId?: string | null) => void;
  closeTemplatesModal: () => void;
  openShareModal: (listId: string) => void;
  closeShareModal: () => void;

  // Sharing Logic
  fetchListMembers: (listId: string) => Promise<void>;
  inviteMember: (listId: string, email: string, role: Role) => Promise<void>;
  updateMemberRole: (listId: string, memberId: string, role: Role) => Promise<void>;
  removeMember: (listId: string, memberId: string) => Promise<void>;
  fetchUserPresence: (listId: string) => Promise<void>;

  // Business Logic
  createList: (name: string, parentId: string | null, fromTemplateIndex?: number) => Promise<void>;
  updateList: (id: string, updates: Partial<ListDetails>) => Promise<void>;
  duplicateList: (id: string, withTasks: boolean) => Promise<void>;
  archiveList: (id: string, archive: boolean) => Promise<void>;
}

export const useListStore = create<ListState>((set, get) => ({
  activeListId: null,
  activeListDetails: null,
  isLoading: false,

  isCreateModalOpen: false,
  isSettingsModalOpen: false,
  isTemplatesModalOpen: false,
  isShareModalOpen: false,
  contextParentId: null,
  contextListId: null,

  listMembers: [],
  activeUsers: [],

  setActiveList: (id) => {
    set({ activeListId: id });
    if (id) {
      get().fetchListDetails(id);
    } else {
      set({ activeListDetails: null });
    }
  },

  fetchListDetails: async (id) => {
    set({ isLoading: true });
    try {
      const details = await listService.getListDetails(id);
      set({ activeListDetails: details, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch list details', error);
      set({ isLoading: false });
    }
  },

  openCreateModal: (parentId = null) => set({ isCreateModalOpen: true, contextParentId: parentId }),
  closeCreateModal: () => set({ isCreateModalOpen: false, contextParentId: null }),

  openSettingsModal: (listId) => set({ isSettingsModalOpen: true, contextListId: listId }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false, contextListId: null }),

  openTemplatesModal: (parentId = null) => set({ isTemplatesModalOpen: true, contextParentId: parentId }),
  closeTemplatesModal: () => set({ isTemplatesModalOpen: false, contextParentId: null }),

  openShareModal: (listId) => set({ isShareModalOpen: true, contextListId: listId }),
  closeShareModal: () => set({ isShareModalOpen: false, contextListId: null }),

  // Sharing Actions
  fetchListMembers: async () => {
    try {
      const members = await sharingService.getListMembers();
      set({ listMembers: members });
    } catch (error) {
      console.error('Failed to fetch list members:', error);
    }
  },

  inviteMember: async (listId, email, role) => {
    try {
      const newMember = await sharingService.inviteMember(listId, email, role);
      set((state) => ({ listMembers: [...state.listMembers, newMember] }));
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  },

  updateMemberRole: async (listId, memberId, role) => {
    try {
      const updatedMember = await sharingService.updateMemberRole(listId, memberId, role);
      set((state) => ({
        listMembers: state.listMembers.map(m => m.id === memberId ? updatedMember : m)
      }));
    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  },

  removeMember: async (listId, memberId) => {
    try {
      await sharingService.removeMember(listId, memberId);
      set((state) => ({
        listMembers: state.listMembers.filter(m => m.id !== memberId)
      }));
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  },

  fetchUserPresence: async () => {
    try {
      const active = await sharingService.getActiveUsers();
      set({ activeUsers: active });
    } catch (error) {
      console.error('Failed to fetch user presence:', error);
    }
  },

  createList: async (name, parentId, fromTemplateIndex) => {
    set({ isLoading: true });
    try {
      let newItem: NavigationItem;
      if (fromTemplateIndex !== undefined) {
        newItem = await listService.createFromTemplate(fromTemplateIndex, name, parentId);
      } else {
        newItem = await folderService.createItem(parentId, 'list', name);
      }

      // Refresh tree in FolderStore
      // Note: In real app, we might insert optimistically
      await useFolderStore.getState().fetchTree();

      set({ isLoading: false, isCreateModalOpen: false, isTemplatesModalOpen: false });
      console.log('Created list item:', newItem);
    } catch (error) {
      console.error('Failed to create list', error);
      set({ isLoading: false });
    }
  },

  updateList: async (id, updates) => {
    try {
      await listService.updateList(id, updates);
      await useFolderStore.getState().fetchTree(); // Refresh sidebar info (name/color/visibility)

      // If active list info changed, refresh it too
      if (get().activeListId === id) {
        get().fetchListDetails(id);
      }
    } catch (error) {
      console.error('Failed to update list', error);
    }
  },

  duplicateList: async (id, withTasks) => {
    set({ isLoading: true });
    try {
      await listService.duplicateList(id, { withTasks });
      await useFolderStore.getState().fetchTree();
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to duplicate list', error);
      set({ isLoading: false });
    }
  },

  archiveList: async (id, archive) => {
    try {
      await listService.archiveList(id, archive);
      await useFolderStore.getState().fetchTree();
    } catch (error) {
      console.error('Failed to archive list', error);
    }
  }
}));
