import type { Notification } from '../types/notification';

// Mock Data
let mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: '1',
    type: 'mention',
    title: 'إشارة جديدة',
    message: 'قام أحمد بالإشارة إليك في تعليق على المهمة "تصميم واجهة المستخدم".',
    isRead: false,
    createdAt: new Date().toISOString(),
    taskId: 't1',
    actor: { id: 'u2', name: 'أحمد محمود', avatarUrl: 'https://i.pravatar.cc/150?u=u2' }
  },
  {
    id: 'n2',
    userId: '1',
    type: 'task_assignment',
    title: 'مهمة جديدة',
    message: 'تم تعيينك كموكل للمهمة "تحديث قاعدة البيانات".',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    taskId: 't2',
    actor: { id: 'u3', name: 'سارة خالد' }
  },
  {
    id: 'n3',
    userId: '1',
    type: 'task_due_date',
    title: 'تذكير بموعد استحقاق',
    message: 'المهمة "إطلاق الحملة التسويقية" مستحقة غداً.',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    taskId: 't3'
  }
];

export const notificationService = {
  fetchNotifications: async (page = 1, limit = 20): Promise<{ data: Notification[], total: number, unreadCount: number }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const sorted = [...mockNotifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const start = (page - 1) * limit;
    const paginated = sorted.slice(start, start + limit);
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;

    return {
      data: paginated,
      total: mockNotifications.length,
      unreadCount
    };
  },

  markAsRead: async (id: string): Promise<Notification> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const notif = mockNotifications.find(n => n.id === id);
    if (!notif) throw new Error('Notification not found');
    notif.isRead = true;
    return { ...notif };
  },

  markAllAsRead: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockNotifications = mockNotifications.map(n => ({ ...n, isRead: true }));
  },

  deleteNotification: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockNotifications = mockNotifications.filter(n => n.id !== id);
  },

  getUnreadCount: async (): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockNotifications.filter(n => !n.isRead).length;
  }
};
