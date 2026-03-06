export type NotificationType =
  | 'task_assignment'
  | 'task_due_date'
  | 'comment'
  | 'status_change'
  | 'mention'
  | 'file_attachment';

export interface NotificationActor {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;

  // Optional related entities
  taskId?: string;
  listId?: string;
  commentId?: string;

  actor?: NotificationActor;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskAssignments: boolean;
  taskDueDates: boolean;
  comments: boolean;
  mentions: boolean;
  statusChanges: boolean;
}
