/**
 * Placeholder dashboard for authenticated users.
 * Will be replaced by the main app shell (Phase 3).
 */
export function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-50">لوحة التحكم</h1>
        <p className="mt-4 text-slate-400">
          مرحباً. هذه لوحة تحكم مؤقتة. سيتم استبدالها بالتخطيط الرئيسي في المرحلة 3.
        </p>

        <div className="mt-8 flex gap-4">
          <a href="/profile" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-blue-400 transition-colors">
            الملف الشخصي
          </a>
          <a href="/settings" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-blue-400 transition-colors">
            الإعدادات
          </a>
        </div>
      </div>
    </div>
  )
}
