import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import type { UserProfile } from '../services/userService';

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
      setName(data.name);
      setEmail(data.email);
    } catch (err) {
      setError('فشل في جلب بيانات الملف الشخصي');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await userService.updateProfile({ name });
      setProfile({ ...profile!, name: updated.name });
      alert('تم تحديث الملف الشخصي بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء التحديث');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.changePassword(currentPassword, newPassword);
      setPasswordMessage('تم تغيير كلمة المرور بنجاح');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      setPasswordMessage('فشل تغيير كلمة المرور. تأكد من كلمة المرور الحالية.');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        // Mocking immediate verify or we can add a loading state for avatar
        await userService.uploadAvatar(file);
        // Reload profile to get new URL or optimistically update
        loadProfile();
      } catch (err) {
        console.error('Avatar upload failed', err);
        alert('فشل رفع الصورة الرمزية');
      }
    }
  };

  if (loading) return <div className="p-8 text-white">جاري التحميل...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-50" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">الملف الشخصي</h1>

        {/* Profile Card */}
        <div className="bg-slate-900 p-6 rounded-lg shadow-md border border-slate-800">
          <div className="flex items-center space-x-4 space-x-reverse mb-6">
            <div className="relative group w-24 h-24 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center border-2 border-slate-600">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-slate-400">{profile?.name.charAt(0)}</span>
              )}
              <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <span className="text-xs text-white">تغيير</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile?.name}</h2>
              <p className="text-slate-400">{profile?.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full p-2 rounded bg-slate-800/50 border border-slate-700 text-slate-400 cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors"
            >
              حفظ التغييرات
            </button>
          </form>
        </div>

        {/* Security Section */}
        <div className="bg-slate-900 p-6 rounded-lg shadow-md border border-slate-800">
          <h2 className="text-xl font-bold mb-4">الأمان</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">كلمة المرور الحالية</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">كلمة المرور الجديدة</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.includes('نجاح') ? 'text-green-500' : 'text-red-500'}`}>
                {passwordMessage}
              </p>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white font-medium transition-colors"
            >
              تغيير كلمة المرور
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
