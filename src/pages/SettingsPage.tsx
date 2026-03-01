import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import type { UserPreferences } from '../services/userService';

export function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'dark',
    emailNotifications: true,
    pushNotifications: true,
    language: 'ar'
  });
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    // Mock load preferences
    // In a real app, we would fetch this from the backend
    setLoading(false);
  }, []);

  const handleToggle = async (key: keyof UserPreferences) => {
    const newVal = !preferences[key];
    // Optimistic update
    setPreferences(prev => ({ ...prev, [key]: newVal }));

    try {
      await userService.updatePreferences({ [key]: newVal });
    } catch (err) {
      console.error('Failed to update preference', err);
      // Revert on failure
      setPreferences(prev => ({ ...prev, [key]: !newVal }));
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('هل أنت متأكد أنك تريد حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      alert('سيتم تنفيذ حذف الحساب... (غير مفعل حالياً)');
      // api call to delete account
    }
  }

  if (loading) return <div className="p-8 text-white">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-50" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">الإعدادات</h1>

        {/* Appearance */}
        <div className="bg-slate-900 p-6 rounded-lg shadow-md border border-slate-800">
          <h2 className="text-xl font-bold mb-4">المظهر</h2>
          <div className="flex items-center justify-between">
            <span>الوضع الليلي</span>
            <button
              onClick={() => handleToggle('theme' as any)} // Simple toggle for now, usually needs more logic
              className={`w-12 h-6 rounded-full p-1 transition-colors ${preferences.theme === 'dark' ? 'bg-blue-600' : 'bg-slate-600'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${preferences.theme === 'dark' ? '-translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">ملاحظة: هذا الزر تجريبي، الثيم الحالي مثبت على الوضع الليلي.</p>
        </div>

        {/* Notifications */}
        <div className="bg-slate-900 p-6 rounded-lg shadow-md border border-slate-800">
          <h2 className="text-xl font-bold mb-4">الإشعارات</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>إشعارات البريد الإلكتروني</span>
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="w-5 h-5 accent-blue-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>إشعارات المتصفح (Push)</span>
              <input
                type="checkbox"
                checked={preferences.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
                className="w-5 h-5 accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-900/10 p-6 rounded-lg border border-red-900/50">
          <h2 className="text-xl font-bold text-red-500 mb-4">منطقة الخطر</h2>
          <p className="text-slate-400 text-sm mb-4">بمجرد حذف حسابك، لا يمكن العودة للوراء. يرجى التأكد.</p>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
          >
            حذف الحساب
          </button>
        </div>

      </div>
    </div>
  );
}
