import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiClient } from '../apiClient'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.')
      return
    }

    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.')
      return
    }

    if (!token) {
      setError('رابط إعادة التعيين غير صالح. اطلب رابطاً جديداً.')
      return
    }

    setIsSubmitting(true)

    try {
      await apiClient.put('/auth/reset-password', {
        token,
        newPassword,
      })
      setSuccess(true)
    } catch {
      setError('تعذّر إعادة تعيين كلمة المرور. قد يكون الرابط منتهي الصلاحية. اطلب رابطاً جديداً.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-slate-900/70 p-8 shadow-xl border border-slate-800">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
              رابط غير صالح
            </h1>
            <p className="text-sm text-slate-400">
              لم يتم توفير رمز إعادة التعيين أو أنه غير صحيح. استخدم رابطاً من بريدك الإلكتروني أو اطلب رابطاً جديداً.
            </p>
          </div>
          <p className="text-center text-sm text-slate-400">
            <Link
              to="/forgot-password"
              className="font-medium text-sky-400 hover:text-sky-300 transition"
            >
              طلب رابط جديد
            </Link>
            {' · '}
            <Link
              to="/login"
              className="font-medium text-sky-400 hover:text-sky-300 transition"
            >
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-slate-900/70 p-8 shadow-xl border border-slate-800">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            إعادة تعيين كلمة المرور
          </h1>
          <p className="text-sm text-slate-400">
            أدخل كلمة المرور الجديدة أدناه.
          </p>
        </div>

        {success && (
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            تم تغيير كلمة المرور. يمكنك الآن تسجيل الدخول.
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {!success && (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-200"
              >
                كلمة المرور الجديدة
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="block w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/50 placeholder:text-slate-500"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-200"
              >
                تأكيد كلمة المرور
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="block w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/50 placeholder:text-slate-500"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'جارٍ الحفظ...' : 'تعيين كلمة المرور الجديدة'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-400">
          <Link
            to="/login"
            className="font-medium text-sky-400 hover:text-sky-300 transition"
          >
            العودة لتسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
