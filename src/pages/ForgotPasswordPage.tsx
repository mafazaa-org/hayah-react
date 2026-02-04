import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
// import { apiClient } from '../apiClient'

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    try {
      // await apiClient.post('/auth/request-password-reset', { email })
      setSuccess(true)

      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/reset-password';
      navigate(from, { replace: true }) 
    } catch (err) {
      if (isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { message?: string | string[] }
        const msg = Array.isArray(data.message) ? data.message[0] : data.message
        setError(typeof msg === 'string' ? msg : 'حدث خطأ. يرجى التحقق من البريد الإلكتروني والمحاولة مرة أخرى.')
      } else if (isAxiosError(err) && err.request && !err.response) {
        setError('تعذّر الاتصال بالخادم. تحقق من الاتصال أو أن الخادم يعمل.')
      } else {
        setError('حدث خطأ. يرجى التحقق من البريد الإلكتروني والمحاولة مرة أخرى.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-slate-900/70 p-8 shadow-xl border border-slate-800">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            نسيت كلمة المرور؟
          </h1>
          <p className="text-sm text-slate-400">
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
          </p>
        </div>

        {success && (
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            تم إرسال الرابط. تحقق من بريدك الإلكتروني واتبع التعليمات.
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
                htmlFor="email"
                className="block text-sm font-medium text-slate-200"
              >
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/50 placeholder:text-slate-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'جارٍ الإرسال...' : 'إرسال رابط إعادة التعيين'}
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
