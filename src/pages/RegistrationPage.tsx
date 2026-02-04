import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '../apiClient'

type RegisterResponse = {
  token: string
}

export function RegistrationPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await apiClient.post<RegisterResponse>('/auth/register', {
        name,
        email,
        password,
      })

      const token = response.data.token
      const tokenKey =
        import.meta.env.VITE_JWT_STORAGE_KEY || 'hayah_auth_token'
      window.localStorage.setItem(tokenKey, token)

      navigate('/', { replace: true })
    } catch {
      setError('تعذّر إنشاء الحساب. يرجى التحقق من البيانات والمحاولة مرة أخرى.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-slate-900/70 p-8 shadow-xl border border-slate-800">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            إنشاء حساب جديد
          </h1>
          <p className="text-sm text-slate-400">
            أدخل بياناتك لإنشاء حساب والبدء باستخدام حياة.
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
              htmlFor="name"
              className="block text-sm font-medium text-slate-200"
            >
              الاسم
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              className="block w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/50 placeholder:text-slate-500"
              placeholder="الاسم الكامل"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

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
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-200"
            >
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
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
            {isSubmitting ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}
          </button>

          <p className="text-center text-sm text-slate-400"> لديك حساب؟ <Link to="/login" className="font-medium text-sky-400 hover:text-sky-300 transition">تسجيل الدخول</Link> </p>
        </form>
      </div>
    </div>
  )
}

