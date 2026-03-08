import { create } from 'zustand';
import type { Iteration } from '../types/iteration';
import { iterationService } from '../services/iterationService';

interface IterationState {
  iterations: Iteration[];
  isLoading: boolean;
  error: string | null;
  isManagerModalOpen: boolean;

  // Actions
  fetchIterations: (listId: string) => Promise<void>;
  createIteration: (listId: string, data: Omit<Iteration, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIteration: (id: string, updates: Partial<Iteration>) => Promise<void>;
  deleteIteration: (id: string) => Promise<void>;
  
  // Modal actions
  openManagerModal: () => void;
  closeManagerModal: () => void;

  // Helpers
  getActiveIteration: () => Iteration | undefined;
}

export const useIterationStore = create<IterationState>((set, get) => ({
  iterations: [],
  isLoading: false,
  error: null,
  isManagerModalOpen: false,

  fetchIterations: async (listId: string) => {
    set({ isLoading: true, error: null });
    try {
      const iterations = await iterationService.getIterations(listId);
      set({ iterations, isLoading: false });
    } catch (error: unknown) {
      set({ error: (error as Error).message || 'Failed to fetch iterations', isLoading: false });
    }
  },

  createIteration: async (listId: string, data) => {
    set({ isLoading: true, error: null });
    try {
      const newIteration = await iterationService.createIteration(listId, data);
      set(state => ({ 
        iterations: [...state.iterations, newIteration],
        isLoading: false 
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message || 'Failed to create iteration', isLoading: false });
    }
  },

  updateIteration: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedIteration = await iterationService.updateIteration(id, updates);
      set(state => ({
        iterations: state.iterations.map(it => it.id === id ? updatedIteration : it),
        isLoading: false
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message || 'Failed to update iteration', isLoading: false });
    }
  },

  deleteIteration: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await iterationService.deleteIteration(id);
      set(state => ({
        iterations: state.iterations.filter(it => it.id !== id),
        isLoading: false
      }));
    } catch (error: unknown) {
      set({ error: (error as Error).message || 'Failed to delete iteration', isLoading: false });
    }
  },

  openManagerModal: () => set({ isManagerModalOpen: true }),
  closeManagerModal: () => set({ isManagerModalOpen: false }),

  getActiveIteration: () => {
    return get().iterations.find(it => it.status === 'active');
  }
}));
