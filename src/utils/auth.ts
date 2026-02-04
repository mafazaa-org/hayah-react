/**
 * Auth utilities: check and manage JWT in localStorage.
 * Uses the same key as apiClient (VITE_JWT_STORAGE_KEY or 'hayah_auth_token').
 */

const JWT_STORAGE_KEY =
  import.meta.env.VITE_JWT_STORAGE_KEY || 'hayah_auth_token'

/**
 * Returns true if a JWT is present in localStorage (user is considered logged in).
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const token = window.localStorage.getItem(JWT_STORAGE_KEY)
  return !!token
}

/**
 * Returns the stored JWT or null.
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(JWT_STORAGE_KEY)
}

/**
 * Removes the JWT from localStorage (logout).
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(JWT_STORAGE_KEY)
}
