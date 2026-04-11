import type { Notification } from '../types/notification';
import { apiClient } from '../apiClient';

export const notificationService = {
  fetchNotifications: async (_page = 1, _limit = 20): Promise<{ data: Notification[]; total: number; unreadCount: number }> => {
    const response = await apiClient.get<Notification[]>('/notifications');
    const data = response.data;
    const unreadCount = data.filter(n => !n.isRead).length;

    return {
      data,
      total: data.length,
      unreadCount,
    };
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(`/notifications/${id}`, {
      isRead: true,
    });
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/mark-all-read');
  },

  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<number>('/notifications/unread-count');
    return response.data;
  },
};
