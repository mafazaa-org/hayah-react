import { create } from 'zustand';
import type { Notification } from '../types/notification';
import { notificationService } from '../services/notificationService';
import { socketService } from '../services/socketService';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;

  fetchNotifications: (page?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  initializeSocketListeners: () => void;
  removeSocketListeners: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  hasMore: true,
  page: 1,

  fetchNotifications: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await notificationService.fetchNotifications(page);

      set((state) => {
        const newNotifications = page === 1
          ? response.data
          : [...state.notifications, ...response.data];

        return {
          notifications: newNotifications,
          unreadCount: response.unreadCount,
          hasMore: newNotifications.length < response.total,
          page,
          isLoading: false
        };
      });
    } catch (error: any) {
      set({ error: error.message || 'حدث خطأ أثناء جلب الإشعارات', isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      // Optimistic update
      set((state) => {
        const notifications = state.notifications.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        );
        const unreadCount = notifications.filter(n => !n.isRead).length;
        return { notifications, unreadCount };
      });

      await notificationService.markAsRead(id);
    } catch (error) {
      // Refresh to get actual state if failed
      get().fetchNotifications(1);
    }
  },

  markAllAsRead: async () => {
    try {
      // Optimistic update
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));

      await notificationService.markAllAsRead();
    } catch (error) {
      get().fetchNotifications(1);
    }
  },

  deleteNotification: async (id: string) => {
    try {
      // Optimistic update
      set((state) => {
        const notifications = state.notifications.filter(n => n.id !== id);
        const unreadCount = notifications.filter(n => !n.isRead).length;
        return { notifications, unreadCount };
      });

      await notificationService.deleteNotification(id);
    } catch (error) {
      get().fetchNotifications(1);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await notificationService.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  },

  initializeSocketListeners: () => {
    socketService.off('new_notification');
    socketService.on('new_notification', () => {
      // Optimistically increment unread count to simulate real-time notification
      set((state) => ({ unreadCount: state.unreadCount + 1 }));
      // Also fetch the actual notifications list to keep it updated
      get().fetchNotifications(1);
    });
  },

  removeSocketListeners: () => {
    socketService.off('new_notification');
  }
}));
