export type IterationStatus = 'planned' | 'active' | 'completed';

export interface Iteration {
  id: string;
  listId: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status: IterationStatus;
  goal?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IterationStats {
  id: string;
  name: string;
  status: IterationStatus;
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  unstartedTasks: number;
  progress: number; // 0-100
}
