import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Loader2, Settings } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { NotificationItem } from './NotificationItem';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../types/notification';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    fetchUnreadCount
  } = useNotificationStore();

  useEffect(() => {
    fetchUnreadCount();
    // Maybe set up an interval to poll for unread count in real implementation
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1);
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsOpen(false);

    // Navigate based on notification type
    // In a real implementation this would be more robust
    if (notification.taskId && notification.listId) {
      navigate(`/dashboard/list/${notification.listId}`); // and open task modal eventually
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-300 hover:bg-white/5 rounded-full relative group transition-colors"
      >
        <Bell size={20} className={isOpen ? "text-blue-400" : ""} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-slate-900 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" dir="rtl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-200">الإشعارات</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                  {unreadCount} جديد
                </span>
              )}
            </div>

            <div className="flex gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                  title="تحديد الكل كمقروء"
                >
                  <Check size={16} />
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/settings');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
                title="إعدادات الإشعارات"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto no-scrollbar">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <p className="mt-2 text-sm text-slate-500">جاري تحميل الإشعارات...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="flex flex-col">
                {notifications.map(notif => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    onClick={handleNotificationClick}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-slate-500" />
                </div>
                <h4 className="text-slate-300 font-medium text-sm">لا توجد إشعارات</h4>
                <p className="text-xs text-slate-500 mt-1">
                  عندما يتم تكليفك بمهام أو يتم الإشارة إليك، ستظهر إشعاراتك هنا.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-slate-800 bg-slate-900/80 text-center">
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors py-1 px-4 rounded hover:bg-blue-500/10 w-full">
                عرض كل الإشعارات
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
