import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiClient } from '../apiClient'

type LoginResponse = {
  token: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      })

      const token = response.data.token
      const tokenKey =
        import.meta.env.VITE_JWT_STORAGE_KEY || 'hayah_auth_token'
      window.localStorage.setItem(tokenKey, token)

      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'
      navigate(from, { replace: true })
    } catch {
      setError('تعذّر تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-slate-900/70 p-8 shadow-xl border border-slate-800">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            تسجيل الدخول إلى حياة
          </h1>
          <p className="text-sm text-slate-400">
            أدخل البريد الإلكتروني وكلمة المرور للمتابعة.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

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
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-200"
              >
                كلمة المرور
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-sky-400 hover:text-sky-300 transition"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/50 placeholder:text-slate-500"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>

          <p className="text-center text-sm text-slate-400">
            ليس لديك حساب؟ <Link to="/register" className="font-medium text-sky-400 hover:text-sky-300 transition">إنشاء حساب</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

