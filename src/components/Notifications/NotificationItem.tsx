import type { Notification } from '../../types/notification';
import {
  MessageSquare,
  UserPlus,
  Clock,
  CheckCircle2,
  AtSign,
  Paperclip,
  Bell,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (notification: Notification) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete, onClick }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'comment': return <MessageSquare size={16} className="text-blue-500" />;
      case 'mention': return <AtSign size={16} className="text-purple-500" />;
      case 'task_assignment': return <UserPlus size={16} className="text-green-500" />;
      case 'task_due_date': return <Clock size={16} className="text-orange-500" />;
      case 'status_change': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'file_attachment': return <Paperclip size={16} className="text-slate-500" />;
      default: return <Bell size={16} className="text-slate-500" />;
    }
  };

  return (
    <div
      className={`group relative p-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-900/10' : ''}`}
      onClick={() => onClick(notification)}
    >
      {!notification.isRead && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      <div className="flex gap-3 items-start mr-4">
        <div className="mt-1 p-2 bg-slate-800 rounded-full shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm ${!notification.isRead ? 'font-semibold text-slate-200' : 'font-medium text-slate-300'} truncate`}>
              {notification.title}
            </h4>
            <span className="text-[10px] text-slate-500 shrink-0 whitespace-nowrap" dir="ltr">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ar })}
            </span>
          </div>

          <p className={`text-xs mt-1 line-clamp-2 ${!notification.isRead ? 'text-slate-300' : 'text-slate-400'}`}>
            {notification.message}
          </p>

          {notification.actor && (
            <div className="flex items-center gap-1 mt-2">
              {notification.actor.avatarUrl ? (
                <img src={notification.actor.avatarUrl} alt={notification.actor.name} className="w-4 h-4 rounded-full" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px] text-slate-300">
                  {notification.actor.name.charAt(0)}
                </div>
              )}
              <span className="text-[10px] text-slate-500 truncate">{notification.actor.name}</span>
            </div>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 shrink-0 absolute left-2 top-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
            title="حذف"
          >
            <X size={14} />
          </button>
          {!notification.isRead && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="p-1 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
              title="تحديد كمقروء"
            >
              <CheckCircle2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
