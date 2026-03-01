import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiClient } from '../apiClient'

type VerifyStatus = 'idle' | 'verifying' | 'success' | 'error'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [status, setStatus] = useState<VerifyStatus>('idle')
  const [error, setError] = useState<string | null>(null)


  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('رابط التحقق غير صالح. لم يتم توفير رمز التحقق.')
      return
    }

    let cancelled = false

    async function verify() {
      setStatus('verifying')
      setError(null)

      try {
        await apiClient.post('/auth/verify-email', { token })
        if (!cancelled) {
          setStatus('success')
        }
      } catch {
        if (!cancelled) {
          setStatus('error')
          setError('تعذّر التحقق من البريد الإلكتروني. قد يكون الرابط منتهي الصلاحية.')
        }
      }
    }

    verify()
    return () => {
      cancelled = true
    }
  }, [token])

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-slate-900/70 p-8 shadow-xl border border-slate-800">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
              رابط غير صالح
            </h1>
            <p className="text-sm text-slate-400">
              لم يتم توفير رمز التحقق. استخدم الرابط المرسل إلى بريدك الإلكتروني.
            </p>
          </div>
          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
          <p className="text-center text-sm text-slate-400">
            <Link
              to="/login"
              className="font-medium text-sky-400 hover:text-sky-300 transition"
            >
              تسجيل الدخول
            </Link>
            {' · '}
            <Link
              to="/register"
              className="font-medium text-sky-400 hover:text-sky-300 transition"
            >
              إنشاء حساب
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
            التحقق من البريد الإلكتروني
          </h1>
          <p className="text-sm text-slate-400">
            {status === 'verifying' && 'جارٍ التحقق من بريدك الإلكتروني...'}
            {status === 'success' && 'تم التحقق من بريدك الإلكتروني بنجاح.'}
            {status === 'error' && 'لم نتمكن من التحقق من بريدك الإلكتروني.'}
            {status === 'idle' && 'جارٍ التحقق...'}
          </p>
        </div>

        {status === 'success' && (
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            تم تأكيد بريدك الإلكتروني. يمكنك الآن تسجيل الدخول.
          </div>
        )}

        {status === 'error' && error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <p className="text-center text-sm text-slate-400">
          <Link
            to="/login"
            className="font-medium text-sky-400 hover:text-sky-300 transition"
          >
            تسجيل الدخول
          </Link>
          {' · '}
          <Link
            to="/register"
            className="font-medium text-sky-400 hover:text-sky-300 transition"
          >
            إنشاء حساب
          </Link>
        </p>
      </div>
    </div>
  )
}
