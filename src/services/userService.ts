import { apiClient } from '../apiClient';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  taskAssignments: boolean;
  taskDueDates: boolean;
  comments: boolean;
  mentions: boolean;
  statusChanges: boolean;
}


export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/users/me');
    // Mock data for now until backend is fully ready
    if (!response.data || !response.data.id) {
      // Return mock if API fails or returns empty (during dev)
      // meaningful mainly if backend is not actually running or incomplete
      return {
        id: '1',
        email: 'user@example.com',
        name: 'المستخدم الحالي',
        avatarUrl: undefined
      };
    }
    return response.data;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>('/users/me', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ avatarUrl: string }>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put('/users/me/password', { currentPassword, newPassword });
  },

  updatePreferences: async (prefs: Partial<UserPreferences>): Promise<UserPreferences> => {
    const response = await apiClient.put<UserPreferences>('/users/me/settings', prefs);
    return response.data;
  }
};
