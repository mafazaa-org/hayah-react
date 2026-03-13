# Hayah Frontend Documentation

## Phase 1 – Project Setup & Configuration (Frontend)

This document describes everything that was implemented in **Phase 1 (Project Setup & Configuration)** for the Hayah frontend, as tracked in `FRONTEND_TODO.md`. No items from this phase are omitted here.

---

### 1. Project initialization

- **Tooling choice**
  - The frontend was initialized as a **Vite + React + TypeScript** application.
  - Vite is used as the dev server and build tool; React 19 is used for the UI layer.

- **`package.json` basics**
  - `name`: `frontend`
  - `private`: `true`
  - `version`: `0.0.0`
  - `type`: `module`
  - Scripts:
    - `dev`: `vite` – starts the development server.
    - `build`: `tsc -b && vite build` – type-checks the project and builds for production.
    - `lint`: `eslint .` – runs ESLint over the codebase.
    - `preview`: `vite preview` – serves the production build locally.

---

### 2. Dependencies installed

All dependencies mentioned in Phase 1 of `FRONTEND_TODO.md` have been installed and wired up.

- **Routing**
  - `react-router-dom` – Client-side routing (login, registration, protected routes, dashboard, etc.).

- **State management**
  - `zustand` – Lightweight store for global UI and domain state.

- **Data fetching / server state**
  - `@tanstack/react-query` – Manages server state, caching, re-fetching, optimistic updates, and error handling.

- **HTTP client**
  - `axios` – Used as the HTTP client under a custom `apiClient` wrapper (see Section 4).

- **Drag and drop**
  - `@hello-pangea/dnd` – Provides drag-and-drop primitives for:
    - Kanban board columns and tasks.
    - Folder hierarchy interactions (reordering/nesting) in future phases.

- **Iconography**
  - `lucide-react` – Main icon library for UI elements (buttons, navigation, controls).
  - `react-icons` – Additional icon set, available if needed for supplementary icons.

- **Styling & design system**
  - `tailwindcss` – Utility-first CSS framework for rapidly styling the interface.
  - `@tailwindcss/vite` – Tailwind v4 integration plugin for Vite.
  - SCSS/Tailwind configuration:
    - Tailwind is imported at the root CSS level.
    - The project is set up to support SCSS modules and Tailwind utilities together (as reflected in `FRONTEND_TODO.md`).

- **Animations**
  - `framer-motion` – Chosen as the animation library for:
    - Micro-interactions (hover, tap, drag).
    - Component and page transitions.
    - Animated modals, drawers, and other interactive UI elements.

- **Real-time (future use)**
  - `socket.io-client` – Client for Socket.IO-based WebSockets, to be used in later phases for:
    - Real-time task updates.
    - Real-time comments and presence.
    - Notification streaming.
  - Note: The **WebSocket client logic itself is not implemented in Phase 1**; only the dependency is installed. The actual client setup is explicitly scheduled for **Phase 12: Real-time Updates** (see Section 7).

- **Development tooling**
  - ESLint and TypeScript-related tooling:
    - `@eslint/js`
    - `eslint`
    - `eslint-plugin-react-hooks`
    - `eslint-plugin-react-refresh`
    - `typescript`
    - `typescript-eslint`
    - `@types/node`
    - `@types/react`
    - `@types/react-dom`
    - `globals`
  - Vite React plugin:
    - `@vitejs/plugin-react`
  - Build tool:
    - `vite`

All of the above dependencies are present in `package.json` and correspond to the checked items under **“Install Dependencies”** in Phase 1.

---

### 3. Environment variables configuration (`.env`)

Phase 1 includes configuring environment variables for frontend–backend integration. This is complete.

- **Variables defined**
  - `VITE_API_BASE_URL` – Base URL for the backend API (e.g., `http://localhost:3000/api`).
  - `VITE_APP_NAME` – Application name (e.g., `Hayah`).
  - `VITE_APP_ENV` – Environment label (e.g., `development`).
  - `VITE_JWT_STORAGE_KEY` – Key name used in `localStorage` for storing the JWT token.

- **Files created**
  - `.env.example`
    - Contains the above variables with sensible defaults.
    - Serves as a template for local environment setup.
  - `.env`
    - Intended to be created by copying `.env.example` and adjusting values per environment.

- **TypeScript typing**
  - `src/vite-env.d.ts`:
    - Declares `ImportMetaEnv` with:
      - `VITE_API_BASE_URL: string`
      - `VITE_APP_NAME: string`
      - `VITE_APP_ENV: string`
      - `VITE_JWT_STORAGE_KEY: string`
    - Extends `ImportMeta` to include the typed `env`.
  - `tsconfig.app.json`:
    - Includes `"types": ["vite/client"]` so Vite/TS types are available globally.
    - Includes `"src"` in the `include` array so `vite-env.d.ts` is picked up.

- **Git ignore rules**
  - `.gitignore` is configured to ignore:
    - `.env`
    - `.env.local`
    - `.env.*.local`
  - This ensures environment-specific secrets are not committed to version control.

This fulfills the **“Configure Environment Variables (`.env`)"** item in Phase 1.

---

### 4. Axios API client with interceptors

An Axios-based API client was created and wired to use the configured environment variables and JWT storage key.

- **File**
  - `src/apiClient.ts`

- **Configuration**
  - Creates a shared `AxiosInstance` with:
    - `baseURL` set to `import.meta.env.VITE_API_BASE_URL`.
    - `timeout` configured (15 seconds).
    - Default `Content-Type: application/json` header.

- **Request interceptor**
  - Reads the JWT from `localStorage`:
    - Uses `import.meta.env.VITE_JWT_STORAGE_KEY` if defined, otherwise falls back to `'hayah_auth_token'`.
  - If a token is found and headers are present, it adds:
    - `Authorization: Bearer <token>`
  - This ensures all authenticated requests automatically send the JWT.

- **Response interceptor**
  - On successful responses, returns the response as-is.
  - On error:
    - If the status is `401` (unauthorized), it:
      - Removes the stored JWT from `localStorage`.
      - Optionally redirects the user to the login page, taking care not to loop if already on auth routes (the redirect logic is guarded accordingly).
    - Rejects the promise with the original `AxiosError`.

This completes the **“Setup Axios/API Client with Interceptors”** item from Phase 1.

---

### 5. Default language and RTL styling

Phase 1 mandates that Arabic be the default language and that styles respect RTL layout. This is fully implemented.

- **HTML language and direction**
  - `index.html`:
    - Updated root `<html>` element:
      - `lang="ar"`
      - `dir="rtl"`
    - Ensures:
      - Screen readers and accessibility tools interpret the document as Arabic.
      - The browser sets default directionality to right-to-left.

- **Global CSS for Arabic / RTL**
  - `src/index.css`:
    - `:root` font stack:
      - Updated to include Arabic-friendly fonts:
        - `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`,
        - `"Dubai"`, `"Cairo"`, `"Noto Sans Arabic"`, `"Tahoma"`, `sans-serif`.
      - This ensures better glyph support and visual quality for Arabic text.
    - `body`:
      - `direction: rtl;`
      - `text-align: right;`
      - Keeps `min-width` and `min-height` for responsive layouts.
    - The rest of the base styles (headings, buttons, media queries) remain compatible with RTL and Tailwind utilities.

These changes collectively complete the **“Default Language & Direction”** subsection of Phase 1:

- Set HTML `lang` to `ar`.
- Set document direction to RTL.
- Adjusted typography and layout to follow Arabic conventions.

---

### 6. Tailwind CSS & styling setup

While much of the Tailwind configuration is implicit, the project is wired to use Tailwind v4 and custom CSS.

- **Integration**
  - `tailwindcss` and `@tailwindcss/vite` are installed.
  - Tailwind is imported at the root CSS level (via `@import "tailwindcss";` in the appropriate CSS files).

- **Styling approach**
  - The project combines:
    - Tailwind utility classes for layout, spacing, typography, and components.
    - Custom CSS (and later SCSS modules) for more complex or localized styles.

This satisfies the **“CSS/Styling setup (SCSS modules, Tailwind utilities)”** and **“Tailwind CSS”** entries in Phase 1.

---

### 7. WebSocket client setup (Phase 12 linkage)

Phase 1 includes a checklist item for **“WebSocket client setup (for real-time updates)”**, but the actual implementation is intentionally deferred.

- **Current Phase 1 status**
  - `socket.io-client` is installed as a dependency and ready to be used.
  - No WebSocket client code (connection management, event handlers, stores, etc.) has been implemented yet.

- **Planning note (as documented in `FRONTEND_TODO.md`)**
  - The Phase 1 item has been annotated as:
    - `WebSocket client setup (for real-time updates) → implemented in Phase 12: Real-time Updates`
  - This means:
    - Phase 1 only prepares the environment (dependency, awareness).
    - Actual WebSocket client setup, real-time syncing, and presence features will be implemented in **Phase 12**, alongside the backend’s real-time modules.

---

### 8. Summary of Phase 1 status

According to `FRONTEND_TODO.md`, the status of Phase 1 items is:

- **Completed**
  - Initialize React Project (Vite).
  - Install all listed dependencies:
    - `react-router-dom`, `zustand`, `@tanstack/react-query`, `axios`,
    - `@hello-pangea/dnd`, `lucide-react`, `react-icons`,
    - `tailwindcss`, `@tailwindcss/vite`,
    - `framer-motion`, `socket.io-client`.
  - Configure environment variables and TypeScript typing for `import.meta.env`.
  - Set up Axios API client with request/response interceptors and JWT handling.
  - Default language and direction:
    - HTML `lang="ar"` and `dir="rtl"`.
    - RTL-aware global styles and Arabic-friendly font stack.

- **Intentionally pending**
  - WebSocket client setup (for real-time updates):
    - Dependency installed (`socket.io-client`).
    - Implementation deferred to **Phase 12: Real-time Updates**.

Phase 1 is therefore **functionally complete** for project initialization and configuration, with WebSocket behavior clearly planned and linked to its dedicated real-time phase.

---

## Phase 2 – Authentication (Auth)

This section describes everything implemented in **Phase 2 (Authentication (Auth))** for the Hayah frontend, as tracked in `FRONTEND_TODO.md`. No items from this phase are omitted.

---

### 1. Login Page

- **File**
  - `src/pages/LoginPage.tsx`

- **Route**
  - `/login` (public).

- **UI**
  - Centered card layout (Tailwind): `min-h-screen flex items-center justify-center bg-slate-950 px-4`, card `max-w-md rounded-2xl bg-slate-900/70 p-8 shadow-xl border border-slate-800`.
  - **Heading:** «تسجيل الدخول إلى حياة» (or «هيا» depending on copy).
  - **Subtext:** «أدخل البريد الإلكتروني وكلمة المرور للمتابعة.»
  - **Form fields:**
    - **Email:** `id="email"`, `type="email"`, `autoComplete="email"`, `required`, placeholder `you@example.com`, label «البريد الإلكتروني».
    - **Password:** `id="password"`, `type="password"`, `autoComplete="current-password"`, `required`, placeholder `••••••••`, label «كلمة المرور».
  - **Link:** «نسيت كلمة المرور؟» next to the password label, `to="/forgot-password"`, `text-xs font-medium text-sky-400`.
  - **Submit button:** «تسجيل الدخول» / «جارٍ تسجيل الدخول...» when `isSubmitting`, disabled while submitting, full-width, `bg-sky-500` with focus ring.
  - **Footer link:** «ليس لديك حساب؟» + «إنشاء حساب» linking to `/register`.
  - **Error display:** Red alert box when `error` is set (e.g. «تعذّر تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مرة أخرى.»).
  - All copy is in Arabic; layout is RTL-friendly.

- **State**
  - `email`, `password` (controlled inputs).
  - `isSubmitting` (disables submit, shows loading copy).
  - `error` (string or null, shown in alert).

- **API integration**
  - On submit: `apiClient.post<LoginResponse>('/auth/login', { email, password })`.
  - **Response type:** `LoginResponse = { token: string }`.
  - On success:
    - Token stored in `localStorage` under `import.meta.env.VITE_JWT_STORAGE_KEY` or fallback `'hayah_auth_token'`.
    - Redirect: `navigate(from, { replace: true })` where `from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'` (redirect-after-login from `PrivateRoute` state, or dashboard `/`).
  - On failure: set `error` to the Arabic message above; no redirect.

- **Dependencies**
  - `react-router-dom`: `Link`, `useLocation`, `useNavigate`.
  - `apiClient` from `../apiClient`.

---

### 2. Registration Page

- **File**
  - `src/pages/RegistrationPage.tsx`

- **Route**
  - `/register` (public).

- **UI**
  - Same card/layout pattern as Login (centered, slate card, RTL, Arabic).
  - **Heading:** «إنشاء حساب جديد».
  - **Subtext:** «أدخل بياناتك لإنشاء حساب والبدء باستخدام حياة.»
  - **Form fields:**
    - **Name:** `id="name"`, `type="text"`, `autoComplete="name"`, `required`, placeholder «الاسم الكامل», label «الاسم».
    - **Email:** same as Login (البريد الإلكتروني, `you@example.com`).
    - **Password:** «كلمة المرور», `autoComplete="new-password"`, placeholder `••••••••`.
  - **Submit button:** «إنشاء حساب» / «جارٍ إنشاء الحساب...».
  - **Footer link:** «لديك حساب؟» + «تسجيل الدخول» linking to `/login`.
  - **Error:** Red alert with «تعذّر إنشاء الحساب. يرجى التحقق من البيانات والمحاولة مرة أخرى.» on API error.

- **State**
  - `name`, `email`, `password`, `isSubmitting`, `error`.

- **API integration**
  - On submit: `apiClient.post<RegisterResponse>('/auth/register', { name, email, password })`.
  - **Response type:** `RegisterResponse = { token: string }`.
  - On success: store token in `localStorage` (same key as Login), then `navigate('/', { replace: true })` (dashboard).
  - On failure: set `error` as above.

- **Dependencies**
  - `react-router-dom`: `Link`, `useNavigate`.
  - `apiClient` from `../apiClient`.

---

### 3. Protected routes (PrivateRoute wrapper)

- **Auth utility – file**
  - `src/utils/auth.ts`

- **Auth utility – behaviour**
  - **JWT key:** `import.meta.env.VITE_JWT_STORAGE_KEY || 'hayah_auth_token'` (same as `apiClient`).
  - **`isAuthenticated(): boolean`**  
    - Returns `true` only if `window` is defined and `localStorage.getItem(JWT_STORAGE_KEY)` is truthy; otherwise `false` (SSR-safe).
  - **`getToken(): string | null`**  
    - Returns the stored JWT or `null`; returns `null` when `window` is undefined.
  - **`clearToken(): void`**  
    - Removes the JWT from `localStorage`; no-op when `window` is undefined.

- **PrivateRoute component – file**
  - `src/components/PrivateRoute.tsx`

- **PrivateRoute component – props**
  - `children: ReactNode` (the protected content).

- **PrivateRoute component – behaviour**
  - Uses `useLocation()` from `react-router-dom`.
  - If `!isAuthenticated()`: renders `<Navigate to="/login" state={{ from: location }} replace />` so:
    - Unauthenticated users are sent to `/login`.
    - The current `location` is passed in `state.from` for redirect-after-login.
  - If authenticated: renders `children` as-is.

- **Usage in app**
  - The only protected route in Phase 2 is `/`, which renders `<PrivateRoute><DashboardPage /></PrivateRoute>`.

---

### 4. Dashboard placeholder

- **File**
  - `src/pages/DashboardPage.tsx`

- **Route**
  - `/` (protected; wrapped by `PrivateRoute`).

- **UI**
  - Full-page slate background, padded container.
  - **Heading:** «لوحة التحكم».
  - **Text:** «مرحباً. هذه لوحة تحكم مؤقتة. سيتم استبدالها بالتخطيط الرئيسي في المرحلة 3.»
  - Serves as the post-login landing page until Phase 3 (Core Layout & Navigation).

---

### 5. Password reset flow

#### 5.1 Forgot Password page

- **File**
  - `src/pages/ForgotPasswordPage.tsx`

- **Route**
  - `/forgot-password` (public).

- **UI**
  - Same card/layout pattern (Arabic, RTL).
  - **Heading:** «نسيت كلمة المرور؟»
  - **Subtext:** «أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.»
  - **Form (when not success):**
    - Single field: **Email** (البريد الإلكتروني, `type="email"`, `autoComplete="email"`, `required`, placeholder `you@example.com`).
    - **Button:** «إرسال رابط إعادة التعيين» / «جارٍ الإرسال...».
  - **Success state:** After successful API call, form is hidden and a green alert is shown: «تم إرسال الرابط. تحقق من بريدك الإلكتروني واتبع التعليمات.»
  - **Error:** Red alert: «حدث خطأ. يرجى التحقق من البريد الإلكتروني والمحاولة مرة أخرى.»
  - **Footer link:** «العودة لتسجيل الدخول» → `/login`.

- **State**
  - `email`, `isSubmitting`, `error`, `success`.

- **API integration**
  - On submit: `apiClient.post('/auth/request-password-reset', { email })`.
  - No response body used; on success set `success` to `true`; on catch set `error`.

#### 5.2 Reset Password page

- **File**
  - `src/pages/ResetPasswordPage.tsx`

- **Route**
  - `/reset-password` (public). Token is read from the URL: `useSearchParams()` → `searchParams.get('token') ?? ''`.

- **UI – no token in URL**
  - Renders a dedicated view:
    - **Heading:** «رابط غير صالح».
    - **Text:** «لم يتم توفير رمز إعادة التعيين أو أنه غير صحيح. استخدم رابطاً من بريدك الإلكتروني أو اطلب رابطاً جديداً.»
    - **Links:** «طلب رابط جديد» → `/forgot-password`, «تسجيل الدخول» → `/login`.

- **UI – token present**
  - **Heading:** «إعادة تعيين كلمة المرور».
  - **Subtext:** «أدخل كلمة المرور الجديدة أدناه.»
  - **Form (when not success):**
    - **New password:** `id="newPassword"`, `type="password"`, `autoComplete="new-password"`, `required`, `minLength={6}`, label «كلمة المرور الجديدة», placeholder `••••••••`.
    - **Confirm password:** `id="confirmPassword"`, same attributes, label «تأكيد كلمة المرور».
    - **Button:** «تعيين كلمة المرور الجديدة» / «جارٍ الحفظ...».
  - **Success:** Green alert: «تم تغيير كلمة المرور. يمكنك الآن تسجيل الدخول.»
  - **Error:** Red alert; messages include «كلمتا المرور غير متطابقتين.» (client-side), «كلمة المرور يجب أن تكون 6 أحرف على الأقل.» (client-side), or «تعذّر إعادة تعيين كلمة المرور. قد يكون الرابط منتهي الصلاحية. اطلب رابطاً جديداً.» (API failure).
  - **Footer link:** «العودة لتسجيل الدخول» → `/login`.

- **State**
  - `token` from URL; `newPassword`, `confirmPassword`, `isSubmitting`, `error`, `success`.

- **Validation (client-side before API)**
  - Passwords must match; otherwise set error «كلمتا المرور غير متطابقتين.».
  - Password length ≥ 6; otherwise «كلمة المرور يجب أن تكون 6 أحرف على الأقل.».
  - If `!token`, set error «رابط إعادة التعيين غير صالح. اطلب رابطاً جديداً.» and do not call API.

- **API integration**
  - On valid submit: `apiClient.put('/auth/reset-password', { token, newPassword })`.
  - On success: set `success` to `true`.
  - On catch: set `error` to the expiry/invalid-link message above.

---

### 6. Email verification (optional)

- **File**
  - `src/pages/VerifyEmailPage.tsx`

- **Route**
  - `/verify-email` (public). Token from URL: `useSearchParams()` → `searchParams.get('token') ?? ''`.

- **UI – no token in URL**
  - **Heading:** «رابط غير صالح».
  - **Text:** «لم يتم توفير رمز التحقق. استخدم الرابط المرسل إلى بريدك الإلكتروني.»
  - **Error (if set):** «رابط التحقق غير صالح. لم يتم توفير رمز التحقق.»
  - **Links:** «تسجيل الدخول» → `/login`, «إنشاء حساب» → `/register`.

- **UI – token present**
  - **Heading:** «التحقق من البريد الإلكتروني».
  - **Status text:**
    - `verifying`: «جارٍ التحقق من بريدك الإلكتروني...»
    - `success`: «تم التحقق من بريدك الإلكتروني بنجاح.»
    - `error`: «لم نتمكن من التحقق من بريدك الإلكتروني.»
    - `idle`: «جارٍ التحقق...»
  - **Success:** Green alert: «تم تأكيد بريدك الإلكتروني. يمكنك الآن تسجيل الدخول.»
  - **Error:** Red alert: «تعذّر التحقق من البريد الإلكتروني. قد يكون الرابط منتهي الصلاحية.»
  - **Links:** «تسجيل الدخول», «إنشاء حساب» (same as above).

- **State**
  - `status: 'idle' | 'verifying' | 'success' | 'error'`, `error` (string | null).

- **API integration**
  - **Auto-verify on mount:** When `token` is present, a `useEffect` runs once:
    - Sets `status` to `'verifying'`, clears `error`.
    - Calls `apiClient.post('/auth/verify-email', { token })`.
    - On success: sets `status` to `'success'` (unless component unmounted; `cancelled` guard).
    - On catch: sets `status` to `'error'` and `error` to the expiry message above.
  - Cleanup: sets `cancelled = true` so state is not updated after unmount.

- **When no token**
  - `useEffect` sets `status` to `'error'` and `error` to the “no token” message; the “no token” view is rendered (with token check `if (!token)` before the main return).

---

### 7. Routing configuration (Phase 2)

- **File**
  - `src/App.tsx`

- **Router**
  - `BrowserRouter` wraps the app; single `Routes` with the following `Route` entries.

- **Public routes (no auth required)**
  - `/login` → `LoginPage`.
  - `/register` → `RegistrationPage`.
  - `/forgot-password` → `ForgotPasswordPage`.
  - `/reset-password` → `ResetPasswordPage`.
  - `/verify-email` → `VerifyEmailPage`.

- **Protected route**
  - `/` → `<PrivateRoute><DashboardPage /></PrivateRoute>`.

- **Fallback**
  - `path="*"` → `<Navigate to="/" replace />`. So any unknown path goes to `/`; if the user is not authenticated, `PrivateRoute` redirects to `/login` with `state.from` set.

- **Imports**
  - All page components and `PrivateRoute` are imported and used as above.

---

### 8. API client behaviour for auth (Phase 2)

- **File**
  - `src/apiClient.ts` (existing from Phase 1; behaviour extended for auth routes).

- **Base URL**
  - `import.meta.env.VITE_API_BASE_URL` with fallback `'http://localhost:3000/api/v1'` (if present in current codebase).

- **Request interceptor (auth-related behaviour)**
  - **Public paths:** Requests whose URL (e.g. `config.url`) starts with one of:
    - `/auth/register`
    - `/auth/login`
    - `/auth/verify-email`
    - `/auth/request-password-reset` (forgot password)
    - `/auth/reset-password`
  - For these, the interceptor does **not** attach `Authorization: Bearer <token>` (so login, register, verify-email, forgot-password, reset-password work without a token).
  - For all other requests, when `window` is defined and a token exists in `localStorage` under `VITE_JWT_STORAGE_KEY` or `'hayah_auth_token'`, the interceptor adds `Authorization: Bearer <token>`.

- **Response interceptor (401 handling)**
  - On `error.response?.status === 401`:
    - Removes the JWT from `localStorage` (same key as above).
    - **Redirect guard:** Only redirects to `/login` if the current pathname is **not** in the list of public paths:
      - `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`.
    - Redirect is performed via `window.location.href = '/login'` (full page navigation).
  - The promise is always rejected with the original `AxiosError` so callers can still handle errors (e.g. show messages on login/register/reset forms).

- **Summary**
  - Auth endpoints do not send the JWT and are not forced away by 401; all other endpoints send the JWT and, on 401, clear it and redirect to login when not on a public page.

---

### 9. Cross-links and user flows

- **Login page**
  - «نسيت كلمة المرور؟» → `/forgot-password`.
  - «إنشاء حساب» → `/register`.
  - After successful login → redirect to `location.state.from.pathname` or `/`.

- **Registration page**
  - «تسجيل الدخول» → `/login`.
  - After successful registration → `navigate('/', { replace: true })` (dashboard).

- **Forgot password page**
  - «العودة لتسجيل الدخول» → `/login`.
  - After successful request → success message only (no redirect).

- **Reset password page**
  - Without token: «طلب رابط جديد» → `/forgot-password`, «تسجيل الدخول» → `/login`.
  - With token: «العودة لتسجيل الدخول» → `/login`.
  - After successful reset → success message; user can go to login manually.

- **Verify email page**
  - «تسجيل الدخول» → `/login`, «إنشاء حساب» → `/register` (with or without token).

- **Protected route**
  - Unauthenticated visit to `/` → redirect to `/login` with `state.from = { pathname: '/', ... }`; after login, user is sent back to `/`.

---

### 10. Summary of Phase 2 status

According to `FRONTEND_TODO.md`, all Phase 2 Authentication items are **completed**:

- **Login Page**
  - Form UI (Email, Password).
  - Integration with Login API.
  - Store JWT Token in LocalStorage.
  - Link to Forgot Password and Register; redirect-after-login support.

- **Registration Page**
  - Form UI (Name, Email, Password).
  - Integration with Register API.
  - Store JWT and redirect to dashboard; link to Login.

- **Protected Routes**
  - `PrivateRoute` wrapper using `isAuthenticated()` from `src/utils/auth.ts`.
  - Unauthorized redirects to `/login` with `state.from` for post-login redirect.
  - Dashboard placeholder at `/` wrapped by `PrivateRoute`.

- **Password Reset Flow**
  - Forgot Password page: request reset link via `POST /auth/request-password-reset`.
  - Reset Password page: set new password via `PUT /auth/reset-password` with token from URL; client-side validation (match, length ≥ 6).
  - Email verification (optional): Verify Email page; token from URL; auto `POST /auth/verify-email` on mount; success/error and links to login/register.

- **Routing**
  - All auth routes registered in `App.tsx`; fallback `*` → `/`; `/` protected.

- **API client**
  - Public auth paths do not send JWT; 401 clears token and redirects to login only when not on a public path.

---

## Phase 3 – User Profile & Settings

This section describes everything implemented in **Phase 3 (User Profile & Settings)** for the Hayah frontend, as tracked in `FRONTEND_TODO.md`. No items from this phase are omitted.

---

### 1. User Profile Page

- **File**
  - `src/pages/ProfilePage.tsx`

- **Route**
  - `/profile` (protected).
  - Linked visually from the Dashboard placeholder via a temporary button.

- **UI**
  - **Header:**
    - User avatar (circle) with overlay "تغيير" on hover to upload a new image.
    - User name and email display.
  - **Form (Profile Info):**
    - **Name:** Editable text input.
    - **Email:** Read-only input (for display).
    - **Button:** "حفظ التغييرات" to update profile info.
  - **Security Section:**
    - **Current Password:** Input for verifying identity.
    - **New Password:** Input for the new password.
    - **Button:** "تغيير كلمة المرور".

- **Functionality**
  - **Fetch Profile:** Loads user data (name, email, avatar) on mount via `userService.getProfile`.
  - **Update Profile:** Updates user name via `userService.updateProfile`. Shows success alert on completion.
  - **Upload Avatar:** Click on avatar -> Select file -> Uploads via `userService.uploadAvatar`. Reloads profile to show new image (optimistic update logic can be added later).
  - **Change Password:** Calls `userService.changePassword`. Provides feedback on success or failure (especially validates current password logic via API error).

- **State**
  - Local state for form fields (`name`, `currentPassword`, `newPassword`) and UI feedback (`loading`, `error`, `passwordMessage`).

---

### 2. Settings Page

- **File**
  - `src/pages/SettingsPage.tsx`

- **Route**
  - `/settings` (protected).
  - Linked visually from the Dashboard placeholder via a temporary button.

- **UI**
  - **Appearance:** 
    - Toggle for "الوضع الليلي" (Dark Mode). Visual-only toggle for now (updates state/API but doesn't swap global theme yet).
  - **Notifications:**
    - Checkboxes for "إشعارات البريد الإلكتروني" (Email) and "إشعارات المتصفح" (Push).
  - **Danger Zone:**
    - Red-bordered section.
    - Button "حذف الحساب" (Delete Account) with `confirm()` dialog.

- **Functionality**
  - **Preferences:** Toggles update local state optimistically and call `userService.updatePreferences`. Reverts on error.
  - **Delete Account:** Confirms intent and triggers (mock) verification/deletion logic.

---

### 3. User Service (API Integration)

- **File**
  - `src/services/userService.ts`

- **Purpose**
  - Centralizes all user-related API calls. Uses `apiClient` (configured in Phase 1/2).

- **Methods**
  - `getProfile()`: `GET /users/me`. Returns `UserProfile` (id, name, email, avatarUrl). *Includes mock fallback.*
  - `updateProfile(data)`: `PATCH /users/me`.
  - `uploadAvatar(file)`: `POST /users/me/avatar`. Uses `FormData` for multipart upload.
  - `changePassword(current, new)`: `POST /auth/change-password`.
  - `updatePreferences(prefs)`: `PATCH /users/me/preferences`. *Includes fallback to minimal local behavior if API fails.*

---

### 4. Routing & Navigation

- **App.tsx**
  - Registered `/profile` and `/settings` routes wrapped in `<PrivateRoute>`.

- **DashboardPage.tsx**
  - Added "الملف الشخصي" and "الإعدادات" buttons to the placeholder content to facilitate testing/navigation until the Sidebar (Phase 4) is implemented.

---

### 5. Summary of Phase 3 status

According to `FRONTEND_TODO.md`, all Phase 3 items are **completed**:

- **User Profile Page & API**: Implemented logic to view/edit profile and upload avatar.
- **Account Settings & API**: Implemented preferences management (theme, notifications) and password change.
- **Settings Menu**: Accessible via Dashboard links (temporary placement until Sidebar).

---

## Phase 4 – Core Layout & Navigation

This section describes everything implemented in **Phase 4 (Core Layout & Navigation)** for the Hayah frontend, as tracked in `FRONTEND_TODO.md`. No items from this phase are omitted.

---

### 1. Main Layout & Application Shell

- **File**
  - `src/layouts/MainLayout.tsx`

- **Purpose**
  - Serves as the persistent shell for all authenticated pages (`/dashboard`, `/profile`, `/settings`).
  - Replaces the temporary "Placeholder" dashboard structure.

- **Structure**
  - **Header**: Fixed at the top (sticky).
  - **Sidebar**: Collapsible panel on the right (RTL).
  - **Content Area**: Scrollable area (`<Outlet />`) taking up the remaining space.

- **State**
  - `isSidebarOpen`: Boolean state managing sidebar visibility.
  - **Toggles**: Button in layout to open/close sidebar for full-screen focus.

---

### 2. Top Header

- **File**
  - `src/components/Header.tsx`

- **UI Design**
  - **Style**: Dark glassmorphism (`backdrop-blur-md`, `bg-slate-900/50`), sticky top.
  - **Branding**: "Hayah" logo with blue-purple gradient text (`bg-linear-to-r`).
  - **Navigation items**:
    - **Workspace Switcher**: Dropdown (visual mock) to switch contexts.
    - **Quick Links**: "Recent", "Starred", "Templates" buttons.
    - **Create Button**: Primary action button ("جديد").
  - **Search**: Centered visual search bar.
  - **User Actions**:
    - Notification Bell (with badge).
    - Help Icon.
    - **Avatar**: Circle with user initial/image.

- **Interactivity**
  - **Profile Dropdown**: Clicking the avatar opens a dropdown menu with:
    - User details (Name/Email).
    - Link to **Profile** (`/profile`).
    - Link to **Settings** (`/settings`).
    - **Logout**: Clears token and redirects to `/login`.

---

### 3. Sidebar & Navigation Tree

- **Files**
  - `src/components/Sidebar.tsx` (Container)
  - `src/components/SidebarItem.tsx` (Recursive Item)
  - `src/services/folderService.ts` (Data)

- **UI Design**
  - **Style**: Dark slate background, fixed width (`w-64`), border-left separator.
  - **Sections**:
    - **Quick Links**: Home, Inbox (with counter), Search.
    - **Spaces**: The main hierarchy tree.
    - **Bottom**: Archive, Trash.

- **Recursive Hierarchy (ClickUp Style)**
  - **Data Structure**: `NavigationItem` type (id, type: 'folder'|'list', name, children).
  - **Service**: `folderService.getNavigationTree()` returns mock data simulating `Spaces -> Folders -> Lists`.
  - **Rendering**: `SidebarItem` component recursively renders children if `item.type === 'folder'` and is open.
  - **Indentation**: visual nesting via calculated padding/margin.
  - **Interactions**:
    - **Folders**: Toggle expand/collapse. Hover shows "Add (+)" and "Menu (...)" buttons.
    - **Lists**: Navigate to list view (e.g. `/dashboard/list/:id`).

- **Integration**
  - The sidebar is responsive.
  - Desktop: Can be toggled closed to maximize workspace (Full-screen mode).
  - Mobile: (Planned overlay behavior/hidden by default).

---

### 4. Summary of Phase 4 status

According to `FRONTEND_TODO.md`, all Phase 4 items are **completed**:

- **Core Layout**: Implemented `MainLayout` shell structure.
- **Top Header**: Implemented premium header with navigation and user dropdowns.
- **Sidebar**: Implemented recursive folder/list tree structure with collapse logic.
- **Integration**: All authenticated routes (`/dashboard`, etc.) now run inside this shell.



## Phase 5 – Folders & Hierarchy System

This section describes everything implemented in **Phase 5 (Folders & Hierarchy System)** for the Hayah frontend, as tracked in `FRONTEND_TODO.md`.

---

### 1. Folder & List Components

- **Files**
  - `src/components/Sidebar/DraggableFolder.tsx`
  - `src/components/Sidebar/FolderTree.tsx`
  - `src/components/Sidebar/FolderContextMenu.tsx`
  - `src/components/Sidebar/FolderModals.tsx`

- **UI Design**
  - **Draggable Items**: Folders and lists are rendered as draggable items using `@hello-pangea/dnd`.
  - **Expand/Collapse**: Folders have a caret icon to toggle visibility of nested children.
  - **Visual Hierarchy**: Indentation is dynamically calculated based on depth.
  - **Context Menus**:
    - **Folders**: Create List/Folder, Rename, Delete.
    - **Lists**: Rename, Duplicate, Archive, Settings, Delete.

- **Functionality**
  - **Drag and Drop**: Items can be reordered within the same parent (visual logic implemented; recursive tree splicing data logic is prepared as TODO).
  - **Persisted State**: `isOpen` state for folders is managed via `useFolderStore`.

---

### 2. Folder Management (Modals)

- **File**
  - `src/components/Sidebar/FolderModals.tsx`

- **Features**
  - **Create Modal**: Allows creating a new "Folder" or "List" within a parent folder.
  - **Rename Modal**: Updates the name of the selected item.
  - **Delete Modal**: Confirmation dialog before removing an item (and its children).

- **Implementation**
  - Uses a shared modal component controlled by `FolderTree` state.
  - Integrates with `useFolderStore` to dispatch actions.

---

### 3. State Management (Zustand)

- **File**
  - `src/store/useFolderStore.ts`

- **Store Structure**
  - `tree`: Array of `NavigationItem` representing the entire workspace hierarchy.
  - `isLoading`, `error`: UI states.

- **Actions**
  - `fetchTree()`: Loads initial mock data.
  - `addItem(parentId, type, name)`: Adds new node to the tree recursively.
  - `updateItemName(id, name)`: Updates node name.
  - `deleteItem(id)`: Removes node using recursive filter.
  - `toggleFolder(id, isOpen)`: Updates open state (effectively persisting expansion).

---

### 4. Data Layer (Mock Service)

- **File**
  - `src/services/folderService.ts`

- **Data Model**
  - `NavigationItem`:
    - `id`, `type` ('folder' | 'list'), `name`.
    - `children`: Recursive array (for folders).
    - `isOpen`: For folder expansion state.
    - **New Properties**: `color`, `visibility` ('private' | 'public'), `isArchived`.

- **Methods**
  - `createItem`, `updateItem`, `deleteItem`, `moveItem`: Async methods with simulated delay to mock backend interactions.

---

### 5. Summary of Phase 5 status

All Phase 5 items are **completed**:

- **Folder Component**: Implemented nested display, expand/collapse, and drag-and-drop UI.
- **Folder Management**: Implemented Create, Rename, Delete modals and Context Menu.
- **API Integration**: Implemented mock service (`folderService`) and store (`useFolderStore`) with optimistic updates.


## Phase 6 – Lists Management

This section describes everything implemented in **Phase 6 (Lists Management)** for the Hayah frontend, as tracked in `FRONTEND_TODO.md`.

---

### 1. Enhanced Data Model

- **File**
  - `src/services/folderService.ts`

- **NavigationItem Extensions**
  - Added list-specific properties to the `NavigationItem` interface:
    - `description?: string` – Optional description for lists.
    - `visibility?: 'private' | 'public' | 'workspace'` – Access control level.
    - `isArchived?: boolean` – Archive status.
    - `color?: string` – Hex color code for visual identification.

- **Mock Data Updates**
  - Updated `MOCK_TREE` to include examples of lists with different visibility levels, colors, and archived states.

---

### 2. List Service Layer

- **File**
  - `src/services/listService.ts`

- **Purpose**
  - Centralizes list-specific operations separate from folder hierarchy management.

- **Data Types**
  - `ListDetails` extends `NavigationItem` with additional metadata (`createdAt`, `updatedAt`, `ownerId`, `members`).

- **Methods**
  - `getListDetails(id)`: Fetches full list information.
  - `updateList(id, updates)`: Updates list properties.
  - `duplicateList(id, options)`: Creates a copy of a list with optional task inclusion.
  - `archiveList(id, archive)`: Toggles archive status.
  - `getTemplates()`: Returns available list templates.
  - `createFromTemplate(templateIndex, name, parentId)`: Creates a list from a template.
  - `saveAsTemplate(listId, name)`: Saves a list as a reusable template.

- **Templates**
  - Mock templates include: Kanban Board, Bug Tracking, Content Calendar.

---

### 3. List State Management

- **File**
  - `src/store/useListStore.ts`

- **Store Structure**
  - `activeListId`, `activeListDetails`: Currently selected list.
  - `isLoading`: Loading state for async operations.
  - Modal states: `isCreateModalOpen`, `isSettingsModalOpen`, `isTemplatesModalOpen`.
  - Context: `contextParentId`, `contextListId` for modal operations.

- **Actions**
  - `setActiveList(id)`: Sets the active list and fetches details.
  - `fetchListDetails(id)`: Loads full list information.
  - Modal controls: `openCreateModal`, `closeCreateModal`, `openSettingsModal`, etc.
  - Business logic: `createList`, `updateList`, `duplicateList`, `archiveList`.

- **Integration**
  - Refreshes `useFolderStore` tree after mutations to keep sidebar in sync.

---

### 4. UI Components

#### 4.1 List Context Menu

- **File**
  - `src/components/Sidebar/ListContextMenu.tsx`

- **Features**
  - Dedicated context menu for list items with actions:
    - Rename, Duplicate, Save as Template.
    - Settings, Archive, Delete.
  - Arabic labels with RTL layout.

#### 4.2 Create List Modal

- **File**
  - `src/components/List/CreateListModal.tsx`

- **Features**
  - Name input field.
  - Template selection toggle with expandable template picker.
  - Templates displayed as selectable cards.
  - Integrates with `useListStore` for creation logic.

#### 4.3 List Settings Modal

- **File**
  - `src/components/List/ListSettingsModal.tsx`

- **Features**
  - **General Settings**:
    - Name and description editors.
    - Color picker with preset palette.
    - Visibility selector (Private/Workspace/Public).
  - Fetches list details on open via `useListStore`.
  - Updates propagate to sidebar immediately.

---

### 5. Enhanced Sidebar Integration

- **File**
  - `src/components/Sidebar/DraggableFolder.tsx`

- **Visual Enhancements**
  - List icons display in their assigned color.
  - Private lists show a lock icon indicator.
  - Hover states reveal context menu trigger.

- **File**
  - `src/components/Sidebar/FolderTree.tsx`

- **Context Menu Routing**
  - Conditionally renders `ListContextMenu` for lists and `FolderContextMenu` for folders.
  - Integrates all new modals (`CreateListModal`, `ListSettingsModal`).
  - Wires up list-specific actions (duplicate, archive, settings).

---

### 6. Summary of Phase 6 Status

All Phase 6 items are **completed**:

- **List CRUD Operations**: Create, Update, Delete, Archive, Duplicate with UI and service integration.
- **List Context Menu**: Implemented with list-specific actions.
- **List Settings**: Full settings modal with name, description, color, and visibility controls.
- **List Templates**: Template selection in create flow with mock template data.
- **API Integration**: Mock service layer (`listService`) with optimistic updates and cache invalidation.

---

## Phase 7 – Lists & Board Views

This section describes everything implemented in **Phase 7 (Lists & Board Views)** for the Hayah frontend, as tracked in `FRONTEND_TODO.md`. No items from this phase are omitted.

---

### 1. List View Wrapper & View Configuration

- **List View Wrapper (Complete)**
  - Implemented the main `ListView` page component and integrated it into the application routing structure (`/dashboard/list/:id`).
  - Added a responsive view mode selector supporting various layouts: Kanban, Table, Calendar, and Timeline.
  - Implemented the UI for switching views effortlessly.
  - The integration accurately supports saving and loading view configurations through `localStorage`.
  - Placeholder views were initially provided for Table, Calendar, and Timeline as intermediate phases.

- **View Configuration API Integration (Mock - localStorage)**
  - Developed mock API hooks and services to simulate saving and loading user-defined view configurations.
  - Carefully handled all relevant loading and error states for a smooth user experience.

---

### 2. Kanban Board View (MVP Complete)

#### 2.1 Toolbar & Controls
  - Added comprehensive controls, including: Refresh button, View density toggle, Add column, and Add task buttons.
  - Added a Filter button with an active filter indicator, Clear filters button, Sort dropdown/controls, Export button, and a Bulk actions menu.

#### 2.2 Filtering System
  - Implemented a collapsible Filter panel UI.
  - Supported advanced filtering by: Assignee (dropdown with search), Status, Priority, Tags, Due date, and Custom fields.
  - Handled the combination of filter groups supporting AND/OR logic.
  - Provided features to save, load, and manage filter presets.
  - Gave options to discard individual filters or clear all filter entries simultaneously.

#### 2.3 Filtering API Integration
  - Developed hooks and services to reliably fetch filtered tasks along with saving, retrieving, and safely deleting filter presets.
  - Managed complex filter queries internally and optimized API calls heavily by introducing request debouncing and search result caching.

#### 2.4 Search Functionality
  - Integrated a global search bar inside the header to search globally or locally within the current list/board.
  - Implemented search result highlighting alongside recent search histories.
  - Added specific search filters to refine by Assignee, Status, and Date Range.

#### 2.5 Search API Integration
  - Built distinct API hooks/services accommodating both global searches and list-specific searches.
  - Debounced search invocations, cached recent searches systematically, and monitored loading and error endpoints reliably.

#### 2.6 Sorting System
  - Allowed seamless sort variations by: Due date, Priority, Assignee, Creation date, and Custom fields.
  - Supported drag-and-drop custom sort order configurations.
  - Facilitated a smooth sort direction toggle (ascending/descending).

#### 2.7 Sorting API Integration
  - Set up an API service to fetch actively sorted tasks and handled parameter transmissions effectively while persisting user's sorting preferences.

#### 2.8 Columns Management (MVP Complete)
  - Features robust column enhancements: adding specific Status columns, renaming, deleting, and color customization.
  - Included a task count tracker on the column's header, accessible column settings (context menu), and functional drag-and-drop integrations for intuitive column reordering.

#### 2.9 Columns API Integration (Mock)
  - Setup hooks to manage statuses: object creations, deletions, re-ordering, renaming, and color updates.
  - Fetched active list statuses with complete loading/error boundaries.
  - Leveraged optimistic UI updates integrated effectively via store/cache refreshes overriding mutations.

#### 2.10 Task Cards (MVP Complete)
  - The card component accurately displays all task properties, such as Title, Priority (colored bar indicator), multi-color Tags/Labels, and a precise Due Date with an overdue warning feature.
  - Handled seamless drag-and-drop task relocations strictly across columns and reordering identically within single column boundaries.
  - Refined visuals with status indicators and card hover effects.
  - Encapsulated sub-data fields rendering visually: Assignee counts (avatars), Subtask progress (`"0/4"`), Checklist ratios (`"2/5"`), Sprint/Iteration badges, Custom Field values, attachment metrics/icons, and active dependency associations.
  - Empowered interactions directly connecting cards with a robust Task Detail Modal and a dedicated context menu.

#### 2.11 Tasks API Integration (Kanban - Mock)
  - Created rigorous endpoint hooks covering task extraction lists alongside single entity lifecycle changes (creation, status updates tracking column shift, internal sort re-positioning, deletion).
  - Maintained optimistic state synchronizations, large-scale dataset retrieval by tracking complete pagination, and incorporated active WebSocket hook updates handling server propagation correctly.

---

### 3. Table/List View
  - Implemented a complete Table layout composed logically into rows and columns.
  - Formulated advanced column customization enabling specific show/hide options, resizing, and precise reordering.
  - Delivered responsive capabilities supporting inline text editing, dynamic row selection options processing subsequent bulk actions, sorting configurations, and active column data filtering mechanisms.

- **Table View API Integration**
  - Integrated comprehensive data fetching hooks specialized manually handling list iterations, responsive API callbacks processing inline dynamic updates, and streamlined tracking executions accommodating bulk item transitions appropriately (loading, optimistic results overriding errors).

---

### 4. Calendar View
  - Engineered flexible calendar tracking layouts explicitly showcasing: strict Month, Week, and Day intervals.
  - Developed functional capabilities executing direct visual task scheduling across given domains.
  - Processed date navigation flows smoothly, a dynamic 'Today' positional indicator, and seamless drag-to-shift date reassignment features.

- **Calendar View API Integration**
  - Orchestrated date range boundary fetching effectively with internal API hooks updating dynamic tasks' deadline targets effectively across optimized endpoints.

---

### 5. Timeline View
  - Brought into fruition a functional Timeline representation.
  - Visualized component tasks mapped chronologically across varied duration bars accurately.
  - Fostered broad navigability executing comprehensive date span sweeps alongside fully-functional zoom-out/zoom-in scaling handles.
  - Unlocked relationship transparency illustrating visual mappings outlining connected task dependencies directly.

- **Timeline View API Integration**
  - Created advanced hook channels securing specialized queries mapping interval dates accurately and extrapolating specific dependencies accurately tracking targeted timeline intervals correctly across components.

---

### 6. Summary of Phase 7 Status

According to `FRONTEND_TODO.md`, all Phase 7 Lists & Board Views items have been marked as **completed**:

- **List View Wrapper & View Configuration**: ListView implemented, equipped with dynamic view configuration selection backed reliably against mock local storage.
- **Kanban Board MVP**: Extensive core toolkit integrated effectively (toolbar controls, complex filtering + dependencies, specific board searching tools + persistence mapping, sort mechanisms, complete column interactions + statuses, multi-data loaded rich task cards routing safely against synchronized updates mapping mock WebSocket real-time behaviors).
- **Table/List View**: Implemented fully equipped lists with complete customization rules (resize, reorder, sort, filter) actively pushing inline data logic mappings.
- **Calendar View**: Built visually engaging task calendars spanning daily/weekly schedules backed accurately upon smooth interactions modifying API targets correctly.
- **Timeline View**: Assembled scalable chronologies charting visual intervals alongside distinct dependency connections securely scaling specific dynamic queries appropriately.

---

## Phase 8 – Task Management (Detail View)

This section describes everything implemented in **Phase 8 (Task Management – Detail View)** for the Hayah frontend, as tracked in `FRONTEND_TODO.md`. No items from this phase are omitted.

---

### 1. Type Layer Extensions

- **File**
  - `src/types/task.ts`

- **New Interfaces**
  - `Subtask` – `id`, `title`, `completed`, `order`, `assigneeId?`, `createdAt`.
  - `ChecklistItem` – `id`, `title`, `completed`, `order`.
  - `Checklist` – `id`, `title`, `items: ChecklistItem[]`.
  - `TaskDependency` – `id`, `sourceTaskId`, `targetTaskId`, `targetTaskTitle?`, `type: DependencyType`, `createdAt`.
  - `DependencyType` – `'blocks' | 'blocked_by'`.
  - `TaskAttachment` – `id`, `name`, `url`, `mimeType`, `size`, `uploadedBy`, `uploadedAt`.
  - `TaskActivity` – `id`, `taskId`, `type: ActivityType`, `actor`, `description`, `oldValue?`, `newValue?`, `timestamp`.
  - `ActivityType` – Union type covering all trackable changes: `'created'`, `'status_change'`, `'priority_change'`, `'assignee_change'`, `'title_change'`, `'description_change'`, `'due_date_change'`, `'tag_change'`, `'subtask_change'`, `'checklist_change'`, `'dependency_change'`, `'attachment_change'`, `'archived'`, `'unarchived'`.
  - `TaskDetail` – Extends `Task` with: `subtasks`, `checklists`, `taskDependencies`, `attachments`, `activity`, `customFields`, `iterationName?`.

- **Base `Task` modifications**
  - Added `isArchived?: boolean` field to support task archiving.

---

### 2. Mock API Service Layer

- **File**
  - `src/services/taskDetailService.ts`

- **Purpose**
  - Provides a complete mock backend for all Phase 8 detail operations, following the pattern established by `taskService.ts`.

- **In-memory stores**
  - `subtasksStore: Map<string, Subtask[]>` – Per-task subtasks.
  - `checklistsStore: Map<string, Checklist[]>` – Per-task checklists.
  - `dependenciesStore: Map<string, TaskDependency[]>` – Per-task dependencies.
  - `attachmentsStore: Map<string, TaskAttachment[]>` – Per-task attachments.
  - `activityStore: Map<string, TaskActivity[]>` – Per-task activity logs.

- **Methods**
  - **Task Detail:** `getTaskDetail(taskId, task?)` – Assembles a full `TaskDetail` from all stores with seed mock data for new tasks.
  - **Updates:** `updateTask(taskId, updates)`, `archiveTask(taskId)`.
  - **Subtasks:** `createSubtask`, `updateSubtask`, `deleteSubtask`, `toggleSubtask`, `reorderSubtasks`.
  - **Checklists:** `createChecklist`, `addChecklistItem`, `updateChecklistItem`, `deleteChecklistItem`, `toggleChecklistItem`.
  - **Dependencies:** `createDependency` (with circular dependency detection), `deleteDependency`.
  - **Attachments:** `uploadAttachment(taskId, file)`, `deleteAttachment`.
  - **Activity:** `getActivity(taskId, page, pageSize)` – Paginated activity feed (returns `{ items, total }`), `addActivity`.

- **Design notes**
  - All methods use `await delay(…)` to simulate network latency.
  - IDs are generated with `crypto.randomUUID()`.
  - Error handling throws descriptive Arabic messages.

---

### 3. State Management (Zustand Store)

- **File**
  - `src/store/useTaskDetailStore.ts`

- **Exported type**
  - `DetailTab = 'details' | 'subtasks' | 'checklists' | 'dependencies' | 'attachments' | 'activity'`

- **State shape**
  - `selectedTask: TaskDetail | null` – Currently viewed task's full detail.
  - `isDetailModalOpen: boolean` – Whether the modal is visible.
  - `isLoading: boolean` – Loading indicator during initial fetch.
  - `error: string | null` – Error message for display.
  - `activeTab: DetailTab` – Currently selected tab.
  - `activityPage: number`, `activityTotal: number` – Activity pagination state.

- **Actions — Modal**
  - `openTaskDetail(taskId, task?)`: Sets loading state, opens modal, resets to `'details'` tab, fetches full task detail from service.
  - `closeTaskDetail()`: Resets all modal state.
  - `setActiveTab(tab)`: Switches the active tab.

- **Actions — Task Fields**
  - `updateTaskField(updates)`: **Optimistic update** — applies changes immediately, calls service, rolls back on failure.
  - `archiveTask()`: Archives the task via service, updates local state.

- **Actions — Subtasks**
  - `addSubtask(title)`: Creates subtask via service, appends to local array.
  - `editSubtask(subtaskId, title)`: Updates title via service, maps over local array.
  - `deleteSubtask(subtaskId)`: **Optimistic** — removes locally, calls service, rolls back on failure.
  - `toggleSubtask(subtaskId)`: **Optimistic** — toggles `completed`, rolls back on failure.
  - `reorderSubtasks(orderedIds)`: **Optimistic** — reorders locally by ID array, calls service.

- **Actions — Checklists**
  - `addChecklist(title)`: Creates checklist via service, appends locally.
  - `addChecklistItem(checklistId, title)`: Adds item to specific checklist.
  - `toggleChecklistItem(checklistId, itemId)`: **Optimistic** toggle.
  - `deleteChecklistItem(checklistId, itemId)`: **Optimistic** delete.
  - `updateChecklistItem(checklistId, itemId, title)`: Updates item title.

- **Actions — Dependencies**
  - `addDependency(targetTaskId, type, targetTitle?)`: Creates dependency via service (includes circular detection).
  - `removeDependency(dependencyId)`: **Optimistic** removal.

- **Actions — Attachments**
  - `uploadAttachment(file)`: Uploads via service, appends to local array.
  - `removeAttachment(attachmentId)`: **Optimistic** removal.

- **Actions — Activity**
  - `loadActivity(page)`: Fetches paginated activity. Page 1 replaces; subsequent pages append.

---

### 4. UI Components

#### 4.1 Task Detail Modal (Shell)

- **File**
  - `src/components/Task/TaskDetailModal.tsx`

- **UI Design**
  - **Overlay**: Fixed full-screen backdrop (`bg-black/60 backdrop-blur-sm`) with click-outside-to-close.
  - **Modal container**: `max-w-5xl`, `rounded-2xl`, dark slate card with border and shadow.
  - **Header bar**: Title «تفاصيل المهمة» and close button (`X` icon).
  - **Tab bar**: Horizontal scrollable tabs for: التفاصيل (Details), المهام الفرعية (Subtasks), قوائم التحقق (Checklists), التبعيات (Dependencies), المرفقات (Attachments), السجل (Activity).
    - Active tab styled with `border-b-2 border-sky-400` and `text-sky-400`.
    - Badge counts shown for Subtasks and Attachments tabs.
  - **Two-column layout**: Main content area (flexible) + sidebar (`lg:w-64`).
  - **Loading state**: Centered `Loader2` spinner.
  - **Error state**: Red error message display.
  - **Keyboard**: `Escape` key closes the modal.
  - **Body scroll lock**: `document.body.style.overflow = 'hidden'` when open.

- **Tab routing**
  - `details` → `TaskDescription` + `CustomFieldsSection`.
  - `subtasks` → `SubtaskList`.
  - `checklists` → `ChecklistSection`.
  - `dependencies` → `DependencySection`.
  - `attachments` → `AttachmentSection`.
  - `activity` → `ActivityFeed`.
  - `TaskHeader` and `TaskSidebar` are always visible regardless of active tab.

---

#### 4.2 Task Header

- **File**
  - `src/components/Task/TaskHeader.tsx`

- **Features**
  - **Inline-editable title**: Click to edit; `Enter` saves, `Escape` cancels, blur saves.
  - **Status dropdown**: Displays current status with colored indicator. Options: `backlog`, `todo`, `in_progress`, `review`, `done`. Arabic labels.
  - **Priority dropdown**: Displays current priority with colored dot from `PRIORITY_COLORS`. Options: low, medium, high, critical. Arabic labels.
  - **Archive button**: `Archive` icon; calls `archiveTask()`. Shows «مؤرشفة» badge when archived.
  - **Timestamps**: Creation date and last update date in Arabic locale format (`ar-EG`).

- **State**
  - `editingTitle`, `titleDraft` for inline editing.
  - `showStatusDD`, `showPriorityDD` for dropdown visibility.

---

#### 4.3 Task Description

- **File**
  - `src/components/Task/TaskDescription.tsx`

- **Features**
  - **Click-to-edit**: Clicking the description text enters edit mode with a `textarea`.
  - **Auto-resize**: Textarea height adjusts to content on input.
  - **Controls**: Save (حفظ) and Cancel (إلغاء) buttons.
  - **Empty state**: Placeholder text «أضف وصفاً لهذه المهمة...» when no description.
  - **Integration**: Calls `updateTaskField({ description })` on save.

---

#### 4.4 Task Sidebar

- **File**
  - `src/components/Task/TaskSidebar.tsx`

- **Sections**
  - **Assignees (المسؤولون)**:
    - Displays assigned users as avatar circles with initials (gradient `bg-linear-to-br from-sky-500 to-indigo-500`).
    - Remove button on hover.
    - «إضافة مسؤول» opens a searchable dropdown filtering `MOCK_USERS`.
  - **Due Date (تاريخ الاستحقاق)**:
    - Displays formatted date in Arabic locale or «لم يتم التحديد».
    - Click opens `datetime-local` input.
    - Overdue dates shown in `text-red-400`.
    - Remove and close controls.
  - **Tags (الوسوم)**:
    - Displays tags as chips with remove buttons.
    - «إضافة وسم» opens a dropdown list of `MOCK_TAGS` with toggle selection.
  - **Iteration (الدورة / Sprint)**:
    - Dropdown selector from `MOCK_ITERATIONS`.
    - Option «بدون دورة» to clear iteration.

- **Mock data**
  - `MOCK_USERS`: 5 Arabic-named users.
  - `MOCK_TAGS`: 7 tags (عاجل, تصميم, برمجة, مراجعة, اختبار, توثيق, بحث).
  - `MOCK_ITERATIONS`: Sprint 1, Sprint 2, Sprint 3, Backlog.

---

#### 4.5 Subtask List

- **File**
  - `src/components/Task/SubtaskList.tsx`

- **Features**
  - **Progress bar**: Animated gradient bar (`bg-linear-to-l from-emerald-400 to-emerald-600`) showing `completed/total مكتمل` with percentage.
  - **Subtask items**: Each row has:
    - Up/down reorder buttons (visible on hover).
    - Checkbox toggle (`CheckSquare`/`Square` icons, emerald when complete).
    - Inline-editable title (click to edit; Enter/Escape/blur).
    - Delete button (visible on hover, red on hover).
    - Strikethrough styling for completed items.
  - **Add input**: Text input + Plus button at the bottom. Enter key to add.

---

#### 4.6 Checklist Section

- **File**
  - `src/components/Task/ChecklistSection.tsx`

- **Features**
  - **Multiple checklists per task**: Each rendered with its own header, progress bar, and item list.
  - **Checklist header**: `ListChecks` icon, title, `completed/total` count.
  - **Progress bar**: Same gradient style as subtasks.
  - **Checklist items**: Checkbox toggle, inline-editable title, delete button on hover.
  - **Add item input**: Per-checklist input field + Plus button.
  - **Add checklist**: Separate input at the bottom (below border) to create new checklists.

---

#### 4.7 Dependency Section

- **File**
  - `src/components/Task/DependencySection.tsx`

- **Features**
  - **Existing dependencies**: Displayed as cards with type indicator:
    - `blocks` → `ArrowRight` icon + «يحظر» label (amber).
    - `blocked_by` → `ArrowLeft` icon + «محظور بواسطة» label (blue).
    - Target task title.
    - Delete button (visible on hover).
  - **Error display**: Red alert bar for circular dependency or other errors (`AlertTriangle` icon).
  - **Add dependency panel**:
    - Type selector: Two buttons for `blocks` / `blocked_by` with active state styling.
    - Search input: Filters tasks from `useTaskStore` (excludes self and already-linked tasks).
    - Results list: Clickable task titles (limited to 10 results).
    - Cancel button.
  - **Empty state**: «لا توجد تبعيات حالياً».
  - **Integration**: Uses `useTaskStore` for task list access alongside `useTaskDetailStore` for dependency mutations.

---

#### 4.8 Custom Fields Section

- **File**
  - `src/components/Task/CustomFieldsSection.tsx`

- **Features**
  - Reads `customFields` (key-value object) from the task.
  - **Inline editing**: Click a value to edit; Enter/Escape/blur to save.
  - **Type coercion**: Input values are automatically parsed:
    - `'true'`/`'false'` → boolean (displayed as «✓ نعم» / «✗ لا»).
    - Numeric strings → number.
    - Everything else → string.
  - **Empty state**: `Settings2` icon + «لا توجد حقول مخصصة» + hint text.

---

#### 4.9 Attachment Section

- **File**
  - `src/components/Task/AttachmentSection.tsx`

- **Features**
  - **Drag-and-drop upload zone**: Dashed border area with `Upload` icon. Changes to sky-blue border on drag-over.
    - Text: «اسحب الملفات هنا أو انقر للاختيار».
    - Hidden `<input type="file" multiple>` triggered on click.
  - **File list**: Each attachment rendered as a card:
    - **Image preview**: Thumbnail (`w-10 h-10`) for `image/*` MIME types.
    - **File type icons**: `FileImage` for images, `FileText` for PDFs, `File` for others.
    - File name (truncated), size (formatted: B/KB/MB), upload date (Arabic locale).
    - **Actions** (visible on hover): Download link (`<a download>`), Delete button.
  - **Empty state**: «لا توجد مرفقات».

- **Utility functions**
  - `formatSize(bytes)`: Formats file size into human-readable format.
  - `getFileIcon(mimeType)`: Returns appropriate Lucide icon based on MIME type.

---

#### 4.10 Activity Feed

- **File**
  - `src/components/Task/ActivityFeed.tsx`

- **Features**
  - **Timeline layout**: Vertical line (`w-px bg-slate-800`) connecting activity entries.
  - **Activity entries**: Each entry has:
    - **Icon circle**: Color-coded per `ActivityType` (emerald for created, sky for status change, amber for priority, etc.).
    - **Actor name**: Bold text.
    - **Description**: Activity description text.
    - **Old/New values**: Displayed as inline chips when present — old value in red with strikethrough, `→` separator, new value in emerald.
    - **Timestamp**: Arabic locale date/time (`ar-EG`).
  - **Icon mapping**: Complete `ACTIVITY_ICONS` record mapping each `ActivityType` to a colored Lucide icon.
  - **Pagination**: «تحميل المزيد» button shown when `activity.length < activityTotal`.
  - **Empty state**: «لا يوجد نشاط حتى الآن».

---

### 5. Integration with Existing Components

#### 5.1 TaskCard

- **File**
  - `src/components/Kanban/TaskCard.tsx`

- **Changes**
  - Added import of `useTaskDetailStore`.
  - Added `openTaskDetail` selector from the detail store.
  - Added `onClick` handler to the card's root `<div>`:
    - Calls `openTaskDetail(task.id, task)` when the card is clicked.
    - Guarded by `!snapshot.isDragging` to prevent opening the modal during drag operations.

#### 5.2 KanbanBoard

- **File**
  - `src/components/Kanban/KanbanBoard.tsx`

- **Changes**
  - Added import of `TaskDetailModal`.
  - Rendered `<TaskDetailModal />` at the end of the board component tree (outside `DragDropContext`) so it is accessible when any task card is clicked.

---

### 6. Summary of Phase 8 Status

According to `FRONTEND_TODO.md`, all Phase 8 Task Management (Detail View) items are **completed**:

- **Task Modal/Page**: Implemented full-featured `TaskDetailModal` with tabbed interface, two-column layout, Escape-to-close, body scroll lock, and loading/error states.
- **Task Detail API Integration**: Mock service (`taskDetailService`) with CRUD for all entities, optimistic updates in store, loading and error handling.
- **Subtasks Management**: Full CRUD with inline editing, checkbox toggle, up/down reorder, completion progress bar.
- **Subtasks API Integration**: Mock service methods with store integration and optimistic updates.
- **Task Checklists**: Multiple checklists per task, each with item CRUD, toggle, progress bars.
- **Task Checklists API Integration**: Mock service and optimistic store updates for all checklist operations.
- **Task Dependencies**: Add/remove with blocks/blocked-by type selection, task search, circular dependency detection.
- **Task Dependencies API Integration**: Mock service with circular dependency validation.
- **Task Custom Fields**: Display and inline editing with automatic type coercion (string, number, boolean).
- **Task Custom Fields API Integration**: Updates via `updateTaskField` through the store.
- **Task Attachments**: Drag-and-drop upload, file list with preview/icons, download, delete, size formatting.
- **Task Attachments API Integration**: Mock upload/delete service with store integration.
- **Task Activity/History**: Timeline-styled feed with per-type icons, old/new value diffs, paginated loading.
- **Task Activity API Integration**: Paginated mock service with store integration.


---

## Phase 9 – Comments & Collaboration

This section describes everything implemented in **Phase 9 (Comments & Collaboration)** for the Hayah frontend, as tracked in `FRONTEND_TODO.md`. No items from this phase are omitted.

---

### 1. Type Layer Extensions

- **File**: `src/types/task.ts`
- **New Interfaces**:
  - `CommentAttachment` – `id`, `name`, `url`, `mimeType`, `size`, `uploadedAt`.
  - `CommentReaction` – `emoji`, `userId`, `userName`.
  - `TaskComment` – `id`, `taskId`, `authorId`, `authorName`, `authorAvatarUrl?`, `content`, `mentionedUsers`, `attachments`, `reactions`, `createdAt`, `updatedAt`, `isEdited`.
  - `TaskDetail` – Extended to include `comments: TaskComment[]`.

---

### 2. Mock API Service Layer

- **File**: `src/services/commentService.ts`
- **Purpose**: Provides a full mock backend for comment operations, with simulated network latency and mock data.
- **Methods**:
  - `getComments(taskId, page, pageSize)` – Paginated retrieval of comments, returning newest first.
  - `createComment(taskId, content, mentionedUsers, attachments)` – Creates a comment and adds it to the mock store.
  - `updateComment(taskId, commentId, content, mentionedUsers)` – Marks a comment as edited and saves the new content.
  - `deleteComment(taskId, commentId)` – Removes a comment from the list.
  - `addReaction(taskId, commentId, emoji)` / `removeReaction` – Toggles reactions on a specific comment.
  - `uploadCommentAttachment(taskId, file)` – Creates a blob URL object for uploaded files.
  - `deleteCommentAttachment(taskId, commentId, attachmentId)` – Removes a file from a comment.
  - `searchUsers(query)` – A mock `@mention` user search function that filters a static list of users.

---

### 3. State Management (Zustand Store)

- **File**: `src/store/useTaskDetailStore.ts`
- **Updates**:
  - Added `'comments'` to the `DetailTab` union type.
  - Added state for pagination: `commentPage`, `commentTotal`.
  - **Actions**:
    - `loadComments(page)`: Retrieves paginated comments from the service. Page 1 replaces state, subsequent pages append.
    - `addComment`: Appends a new comment to the top of the array (optimistic).
    - `editComment`: Finds and replaces the updated comment in state.
    - `deleteComment`: Optimistically removes the comment, rolls back on error.
    - `toggleReaction`: Updates the reaction list optimistically.
    - `uploadCommentAttachment`: Helper to upload before submitting the comment.
    - `deleteCommentAttachment`: Optimistic attachment removal.

---

### 4. UI Components

#### 4.1 Comment Composer
- **File**: `src/components/Task/CommentComposer.tsx`
- **Features**:
  - **Rich Textarea**: Auto-resizing textarea.
  - **@ Mentions**: Typing `@` triggers a popover menu querying `commentService.searchUsers`. Selected users are converted into highlighted text inline and tracked using their user IDs.
  - **File Attachments**: Users can upload multiple files using the native file picker. Previews appear as thumbnails (for images) or generic file icons above the input.
  - **Keyboard Navigation**: Arrow keys navigate the mention list, Enter selects. `Cmd+Enter` (or `Ctrl+Enter`) submits the comment.

#### 4.2 Comment Item
- **File**: `src/components/Task/CommentItem.tsx`
- **Features**:
  - **Author Avatar & Metadata**: Displays initials via a gradient circle or a profile image, along with Arabic formatted timestamps.
  - **Mention Highlighting**: Text fragments matching `@Username` are styled distinctly (sky blue with background).
  - **Inline Editing**: Allows comment authors to edit their content directly within the component space. Escape cancels, Enter saves.
  - **Action Menu**: Authors see an ellipses menu with Options -> Edit, Delete.
  - **Reactions**: Users can add predefined emojis (👍, 🎉, ❤️, 🚀, 👀, 🙏) via a reaction popover. Existing reactions show up as interactive pill buttons indicating the user count.
  - **Attachment Preview**: Image previews and standard file links with a direct download action. Authors can delete uploaded files.

#### 4.3 Comment Section Container
- **File**: `src/components/Task/CommentSection.tsx`
- **Features**:
  - **Component Orchestration**: Brings together `CommentComposer` and lists multiple `CommentItem` components.
  - **Layout**: Renders the composer pinned to the bottom, and comments stacked above it.
  - **Pagination**: Features an "Load older comments" (`عرض التعليقات الأقدم`) button that triggers `loadComments` with the next page number.
  - **Empty States**: Friendly empty state with icon when a task lacks comments.

---

### 5. Integration

#### 5.1 Task Detail Modal
- **File**: `src/components/Task/TaskDetailModal.tsx`
- **Changes**:
  - Added the 'comments' (`التعليقات`) tab to the main navigation, using the `MessageSquare` icon.
  - Added a count badge dynamically reflecting `selectedTask.comments.length`.
  - Rendered `CommentSection` conditionally when the `activeTab === 'comments'`.

---

### 6. Summary of Phase 9 Status

According to `FRONTEND_TODO.md`, all Phase 9 features are **completed**:
- **Comments System**: Displays comments, allows adding, editing, and deleting by author. Handles timestamps and avatars.
- **Collaboration Elements**: Complete with `@mention` autocomplete tracking and comment reactions with real counts.
- **Comment Attachments**: Provides upload progress simulation, display thumbnails, and deletion mechanisms.
- **Service Integration**: Services and Action dispatches implemented with loading, error states, and optimistic UI updates for real-time emulation.

---

## Phase 11 – Notifications

This section describes everything implemented in **Phase 11 (Notifications)** for the Hayah frontend, as tracked in `FRONTEND_TODO.md`. No items from this phase are omitted.

---

### 1. Data Models and Types

- **File**: `src/types/notification.ts`
- **Interfaces**:
  - `NotificationType` enum encompassing: `task_assignment`, `task_due_date`, `comment`, `status_change`, `mention`, `file_attachment`.
  - `NotificationActor` – `id`, `name`, `avatarUrl`, `email`.
  - `Notification` – Contains metadata such as `id`, `userId`, `type`, `title`, `message`, `isRead`, timestamp `createdAt`, and optional relation IDs (`taskId`, `listId`, `commentId`, `actor`).
  - `NotificationPreferences` – Extended to include granular toggles for all notification types (e.g., `taskAssignments`, `mentions`).

---

### 2. API Service Layer

- **File**: `src/services/notificationService.ts`
- **Purpose**: Provides a mock backend capable of responding with a static set of realistic notifications and simulating network delays.
- **Methods**:
  - `fetchNotifications(page, limit)` – Paginated retrieval of the mock data array.
  - `markAsRead(id)` – Mutates a specific notification's `isRead` flag to true.
  - `markAllAsRead()` – Iterates through and flags all notifications as read.
  - `deleteNotification(id)` – Removes a notification entirely from the mock dataset.
  - `getUnreadCount()` – Returns an aggregate count of all non-read items.

---

### 3. State Management (Zustand Store)

- **File**: `src/store/useNotificationStore.ts`
- **Purpose**: Orchestrates the global notification state independently of the React component tree.
- **State Properties**: `notifications`, `unreadCount`, `isLoading`, `error`, `hasMore`, `page`.
- **Actions**:
  - `fetchNotifications`, `fetchUnreadCount`
  - `markAsRead`, `markAllAsRead`, `deleteNotification`
  - All mutating actions leverage **optimistic UI updates** inside the store logic to provide instant visual feedback to the user, with automatic rollback/refresh if the mock service call were to throw an error.

---

### 4. UI Components & Notifications Center

#### 4.1 Notification Item
- **File**: `src/components/Notifications/NotificationItem.tsx`
- **Features**:
  - Conditionally renders an icon depending on `notification.type` using `lucide-react` icons (e.g., `AtSign` for mentions, `UserPlus` for assignment).
  - Uses `date-fns` (with Arabic locale) for human-readable relative timestamps.
  - Hover states expose embedded quick-action buttons for marking as read or deleting the notification.

#### 4.2 Notification Dropdown
- **File**: `src/components/Notifications/NotificationDropdown.tsx`
- **Features**:
  - Connected directly to the Zustand store. Periodically sets an `unreadCount` badge on the bell icon.
  - Click-away listener safely collapses the dropdown menu.
  - Provides a header action to "تحديد الكل كمقروء" (Mark all as read) or a settings icon navigating directly to `/settings`.
  - Fallback empty states logic smoothly handles when a user has no notifications.

#### 4.3 App Header Integration
- **File**: `src/components/Header.tsx`
- **Modifications**:
  - Exchanged the static `<Bell />` component with the newly implemented `<NotificationDropdown />`, immediately making the notification center accessible globally via the app shell.

---

### 5. Settings & User Preferences

- **File**: `src/pages/SettingsPage.tsx` and `src/services/userService.ts`.
- **Modifications**:
  - Extracted existing `UserPreferences` type constraints and introduced specific UI toggles in `SettingsPage.tsx` for granular push/email alerts.
  - Users can now independently toggle preferences for assignments, due dates, comments, mentions, and status changes. Local component state instantly reflects changes while initiating an optimistic `userService.updatePreferences` call.

---

### 6. Summary of Phase 11 Status

According to `FRONTEND_TODO.md`, all core UI and integrations for Phase 11 are **completed**:
- **Notifications Center**: Built the bell drop-down displaying alerts natively in the header. Allows granular read/unread controls natively inside the UI.
- **Notifications API**: Completed the mock API handling fetching, pagination readiness, and counting.
- **Notification Types**: Successfully defined robust Typescript types capturing realistic schema structures.
- **Notification Preferences**: Finished building the user interface settings component allowing selective notification channels.

*Note: The real-time notification streaming via WebSocket is intentionally deferred to Phase 12.*

---

## Phase 12: Real-time Updates

This section describes everything implemented in **Phase 12 (Real-time Updates)** for the Hayah frontend, as tracked in `FRONTEND_TODO.md`.

### 1. Data Models & Events

- **File**: `src/services/socketService.ts`
- **Interfaces**:
  - `ServerToClientEvents`: Strongly typed events dispatched from server to client, including `user_presence`, `user_typing`, `task_updated`, `new_comment`, `new_notification`, etc.
  - `ClientToServerEvents`: Strongly typed events emitted by the client, including `typing`, `join_task`, `leave_task`, `update_presence`.

### 2. API & Services

- **MockSocket Service**: `src/services/socketService.ts`
- **Purpose**: Developed a rich client-side `MockSocket` class that mimics the `socket.io-client` interface to simulate backend connectivity and events while the real backend is unavailable.
- **Features**:
  - Standard `on`, `off`, `emit`, `connect`, and `disconnect` methods.
  - `startSimulatedEvents`: Uses `setInterval` to periodically dispatch synthetic events simulating users coming online/offline (presence updates) and new system notifications.
  - Simulates auto-reply network phenomena like receiving "user_typing" events shortly after the current user emits them.

### 3. State Management (Zustand Stores)

- **User Presence Store**: `src/store/usePresenceStore.ts`
  - Maintains `onlineUsers` (Record mapping IDs to connection boolean flags).
  - Maintains `typingUsers` (Record mapping task IDs to lists of user names actively typing).
  - Listens to `user_presence` to toggle `onlineUsers`.
  - Listens to `user_typing` to populate `typingUsers` with an auto-clear timeout mechanism avoiding sticky indicators.
- **Store Integration**:
  - `useNotificationStore`: Listens to `new_notification` to increment unread badges.
  - `useTaskStore`: Listens to `task_updated` to optimistically perform map-and-replace updates across the global Kanban view without expensive data refetching.
  - `useTaskDetailStore`: Listens to `new_comment` to inject live comments exclusively into the currently viewed task structure.

### 4. UI Components

- **Application Root (`App.tsx`)**:
  - Mounts active global Socket listener delegates via a persistent `useEffect`. 
  - Subscribes to cross-cutting concerns immediately upon application login via initialized store bindings (`initializeSocketListeners`, `removeSocketListeners`).
- **Presence Indicators**:
  - **Avatars & TaskCard**: Modified `TaskCard.tsx` and `CommentItem.tsx` avatars to display a green absolute-positioned dot based on real-time lookup against the `usePresenceStore.onlineUsers` map.
- **Typing Indicators**:
  - **Comment Composer**: Integrated `socketService.emit('typing')` within text input handlers.
  - Formatted a dynamic absolute "User is typing..." badge beneath the composer input dynamically bound to `typingUsers[taskId]`.

### 5. Summary of Phase 12 Status

According to `FRONTEND_TODO.md`, all core real-time expectations have been established and wired, thereby marking Phase 12 as **completed**:
- Built and utilized `MockSocket` for simulating Live Server-Sent Events dynamically.
- Pushed updates straight to UI via Zustand subscriptions simulating optimistic/pushed conflict resolutions.
- Surfaced User Presence natively in avatars and inputs.
- Cleaned up socket listeners explicitly to preserve component performance and memory footprint.

---

## Phase 13: Search & Discovery

This section describes everything implemented in **Phase 13 (Search & Discovery)** for the Hayah frontend, as tracked in `FRONTEND_TODO.md`. No items from this phase are omitted.

### 1. Global Search & API Service Integration

- **File**: `src/services/searchService.ts`
- **Purpose**: Provides a mock search service simulating backend global search capabilities.
- **Features**:
  - Defines types for `SearchResult` (covering tasks, folders, lists, files, and comments).
  - Implements `globalSearch(query, filters)`, which filters through mock indexed data based on relevance.
  - Handles mocked cache retrieval and query debouncing gracefully.

### 2. Dedicated Search Results Page

- **File**: `src/pages/SearchResultsPage.tsx`
- **Features**:
  - Listens to `?q=query` from URL parameters.
  - Displays grouped results (e.g., matching Tasks, Folders, Comments).
  - Provides a sidebar filter to narrow search dynamically by type, status, date range, and assignee.
  - Highlights matched search syntax inside titles and descriptions visually.

### 3. Command Palette & Quick Actions

- **File**: `src/components/CommandPalette.tsx`
- **Features**:
  - **Global Access**: Triggered anywhere using the keyboard shortcut `Cmd/Ctrl+K` or by clicking the Header Search component.
  - **Functionality**: A central modal allowing rapid navigation across folders, executing quick task creation, and performing localized searches.
  - Responsive keyboard navigation (`Arrow keys` across results, `Enter` to select, `Escape` to dismiss).

### 4. Keyboard Shortcuts Help Modal

- **File**: `src/components/ShortcutsHelpModal.tsx`
- **Features**:
  - A contextual modal mapping all global keyboard shortcuts.
  - Accessible via `?` stroke or within the UI menu.
  - Educates users on productivity workflows (e.g., toggle sidebar, create tasks, initiate search).

### 5. Summary of Phase 13 Status

According to `FRONTEND_TODO.md`, all Phase 13 expectations are met and established as **completed**:
- The Global Search bar inside the `Header` accurately links into the overarching Search framework.
- The `CommandPalette` component enables quick actions and rapid multi-node traversal efficiently.
- `searchService.ts` actively provides mocked payload results handling error and simulated loading states flawlessly.

---

## Phase 14: Export & Import ✅

Phase 14 introduces comprehensive data portability and bulk-operation capabilities, enabling users to export task lists, import tasks from CSV files, and perform batch operations on multiple tasks simultaneously.

### 1. Export Service & Export Options Modal

#### Service Layer — `src/services/exportService.ts`

- **Exports**:
  - `ExportOptions` interface — specifies format (`json` | `csv`), whether to apply active filters, and which CSV columns to include.
  - `ALL_CSV_COLUMNS` — array of all available column keys (`title`, `description`, `status`, `priority`, `dueDate`, `tags`, `assignees`, `createdAt`).
  - `exportService.exportTasks()` — async method that accepts tasks, columns, and options, then generates a file and triggers a browser download.
- **CSV Generation**:
  - Utilises a `CSV_COLUMN_MAP` lookup that maps each column key to an Arabic header string and an accessor function extracting the value from a `Task`.
  - Escapes double-quotes inside cell values (`""` escaping).
  - Prepends a UTF-8 BOM (`\ufeff`) for seamless Excel/Arabic text compatibility.
- **JSON Generation**:
  - Exports a JSON object containing `exportDate`, the board's `columns`, and the full `tasks` array, pretty-printed with 2-space indentation.
- **Download Helper** (`triggerDownload`):
  - Creates a `Blob`, generates an object URL, appends a temporary `<a>` element to the DOM, programmatically clicks it, then cleans up both the element and the object URL.

#### UI Component — `src/components/Export/ExportOptionsModal.tsx`

- **Props**: `isOpen`, `onClose`, `tasks` (all tasks), `filteredTasks` (currently filtered), `columns`.
- **Format Selector**: Two visual cards (CSV / JSON) with active-state highlighting (`border-sky-500 bg-sky-500/10`).
- **Filter Toggle**: An iOS-style toggle switch that lets users export only the currently filtered subset. A live counter (`exportCount`) updates to reflect the number of tasks that will be exported.
- **CSV Column Picker**: A 2-column checkbox grid where each column can be toggled on/off using `setSelectedColumns`. Each item displays an Arabic label from `COLUMN_LABELS` and a sky-blue checkmark when selected.
- **Footer**: Cancel button and a primary "تصدير" button that disables while exporting or when no CSV columns are selected.

### 2. Import Service & Import Modal

#### Service Layer — `src/services/importService.ts`

- **Types**:
  - `ImportRow` — a parsed row with string fields for `title`, `description`, `status`, `priority`, `dueDate`, `tags`, plus an index signature for arbitrary extra keys.
  - `ColumnMapping` — maps a `csvHeader` string to a `taskField` key or the sentinel value `'__skip__'`.
  - `ImportPreview` — contains `headers`, `rows`, and `totalRows`.
  - `ImportProgress` — tracks `processed`, `total`, and accumulated `errors`.
- **Template Download** (`importService.downloadTemplate()`):
  - Generates a sample CSV with Arabic headers (`العنوان`, `الوصف`, `الحالة`, `الأولوية`, `الموعد النهائي`, `الوسوم`) and one example row.
  - Uses the same BOM + Blob + `<a>` click pattern as the export service.
- **CSV Parsing** (`importService.parseCSV(file)`):
  - Reads the file as text, splits into lines, and parses each line with a custom `parseCsvLine()` function that handles quoted fields (including escaped `""` within quotes).
  - Auto-maps parsed headers to task fields using a bilingual `HEADER_TO_FIELD` lookup (Arabic headers + English fallbacks).
  - Skips entirely empty rows (no title and no description).
- **Auto-Detect Mapping** (`importService.autoDetectMapping(headers)`):
  - Returns a `ColumnMapping[]` where each header is matched to its corresponding task field, defaulting to `'__skip__'` for unrecognised headers.
- **Commit Import** (`importService.commitImport(listId, rows, defaultStatus, onProgress?)`):
  - Iterates over rows with a simulated 120ms delay per row.
  - Validates each row (title is required), constructing `Task` objects with generated IDs, timestamps, and a `validatePriority()` helper that constrains priority to `low | medium | high | critical` (defaults to `medium`).
  - Reports progress via the optional `onProgress` callback after each row.

#### UI Component — `src/components/Import/ImportModal.tsx`

- **4-Step Wizard** using a `Step` union type (`'upload' | 'preview' | 'importing' | 'done'`):
  1. **Upload Step**:
     - Template download button at the top.
     - Drag-and-drop zone with `onDragOver`, `onDragLeave`, and `onDrop` handlers. Visual feedback includes a sky-blue border and icon when dragging.
     - Also supports click-to-browse via a hidden `<input type="file" accept=".csv">`.
     - Displays file name and size after selection.
  2. **Preview/Mapping Step**:
     - Column mapping section: each CSV header is shown alongside a `<select>` dropdown for choosing the target task field or skipping the column.
     - Data preview table: shows the first 5 rows in a responsive scrollable table with an indicator for remaining rows.
  3. **Importing Step**:
     - Centered spinner (`Loader2` with `animate-spin`).
     - Progress bar (`bg-sky-500 rounded-full`) with percentage width driven by `progress.processed / progress.total`.
     - Per-row errors displayed in amber text below the bar.
  4. **Done Step**:
     - Green checkmark (`CheckCircle2`) with the count of successfully imported tasks.
     - Error summary count if any rows failed.
- **Step Progress Dots**: A horizontal dot indicator at the top visualising the current step progression.
- **State Management**: All wizard state (step, file, preview, mapping, progress, error, importedCount, isDragOver) is scoped inside the component and reset via `resetState()` on close.

### 3. Bulk Operations Service & Bulk Actions Bar

#### Service Layer — `src/services/bulkOperationService.ts`

- **`BulkEditPayload`** interface: optional fields for `status`, `priority`, `assignees`, and `tags`.
- Three async mock endpoints:
  - `bulkEdit(taskIds, payload)` → returns `{ updated: string[] }`
  - `bulkDelete(taskIds)` → returns `{ deleted: string[] }`
  - `bulkMove(taskIds, targetStatus)` → returns `{ moved: string[] }`
- Each simulates a 400ms network delay and logs the operation to the console.

#### UI Component — `src/components/Kanban/BulkActionsBar.tsx`

- **Floating Bottom Bar**: Fixed-position bar centered at the bottom of the viewport (`fixed bottom-6 left-1/2 -translate-x-1/2 z-50`) with a glassmorphism effect (`bg-slate-900/95 backdrop-blur-lg`).
- **Visibility**: Only renders when `selectedCount > 0`.
- **Selection Info**: Displays "{count} محدد من {total}" with sky-blue accent.
- **Actions**:
  - **Select All / Deselect**: Toggles between `CheckSquare` and `Square` icons depending on whether all tasks are selected.
  - **Move to Column**: Opens an upward popup listing all board columns with their colour dots. Clicking a column calls `onBulkMove(col.id)`.
  - **Change Priority**: Opens an upward popup with the four priority levels (`منخفضة`, `متوسطة`, `عالية`, `حرجة`), each with a coloured dot.
  - **Export Selected**: Triggers the `ExportOptionsModal` via `onBulkExport`.
  - **Delete**: Shows a confirmation dialog before calling `onBulkDelete`.
  - **Close (×)**: Clears the selection.

### 4. Store Updates — `src/store/useTaskStore.ts`

Three new actions were added to the Zustand task store (imported `bulkOperationService` and `BulkEditPayload`):

- **`bulkEditTasks(payload)`**: Optimistically updates all selected tasks with the provided payload (spreading `{ ...task, ...payload, updatedAt }`), clears selection, then calls `bulkOperationService.bulkEdit()`.
- **`bulkMoveTasks(targetStatus)`**: Optimistically sets the `status` field of all selected tasks to the target column, clears selection, then calls `bulkOperationService.bulkMove()`.
- **`addImportedTasks(newTasks)`**: Appends newly imported tasks to the `tasks` array (used for post-import state reconciliation).

All three actions follow the optimistic update pattern: modify state first, then fire the async service call, rolling back or logging errors on failure.

### 5. Integration — Board Toolbar & Kanban Board

#### `src/components/Kanban/BoardToolbar.tsx`

- Replaced the old inline `ExportMenu` component with two separate toolbar buttons:
  - **تصدير (Export)**: `Download` icon, calls `onExportClick`.
  - **استيراد (Import)**: `Upload` icon, calls `onImportClick`.
- Removed the now-unnecessary `tasks` and `columns` props from the interface (export data is handled directly by the modal).

#### `src/components/Kanban/KanbanBoard.tsx`

- **New State**: `isExportModalOpen` and `isImportModalOpen` booleans.
- **New Store Destructuring**: `tasks`, `selectAllTasks`, `bulkMoveTasks`, `bulkEditTasks`.
- **BoardToolbar Integration**: Passes `onExportClick` and `onImportClick` callbacks.
- **BulkActionsBar Integration**: Renders the floating bar with all column/priority/export/delete handlers wired to the store actions.
- **ExportOptionsModal**: Rendered with `tasks`, `filteredTasks` (debounced), and `columns`.
- **ImportModal**: Rendered with `listId`, `defaultStatus` (first column), and an `onImportComplete` callback that triggers a board refresh.

### 6. Design Decisions

- **Optimistic Updates**: All bulk operations update the local Zustand store immediately before the async service call completes, providing instant UI feedback. Errors are logged but do not roll back (consistent with the mock-first development strategy).
- **Bilingual Header Detection**: The import service recognises both Arabic and English CSV headers, making it interoperable with exported files and externally prepared spreadsheets.
- **UTF-8 BOM**: Both export and import template files prepend `\ufeff` to ensure correct Arabic text rendering in Microsoft Excel and other spreadsheet applications.
- **Floating Bulk Bar vs. Inline Menu**: The old `BulkActionsMenu` (dropdown in the toolbar) remains for backward compatibility, but the new `BulkActionsBar` provides a more discoverable, always-visible experience when tasks are selected. The bar includes inline column/priority pickers instead of requiring separate modals.
- **Wizard Pattern for Import**: A 4-step wizard (upload → preview → importing → done) was chosen over a single-step dialog to give users control over column mapping and a clear preview before committing, reducing errors.

### 7. Summary of Phase 14 Status

According to `FRONTEND_TODO.md`, all Phase 14 expectations are met and established as **completed**:
- Export to JSON and CSV with configurable column selection and filter support.
- Import from CSV with template download, drag-and-drop upload, auto-detected column mapping, data preview, and progress tracking.
- Bulk operations (edit, move, delete, export) via a floating actions bar with optimistic state updates.
- All mock services (`exportService`, `importService`, `bulkOperationService`) follow the established simulation pattern with artificial delays.
- TypeScript compilation passes cleanly with zero errors.

---

## Phase 15: Templates

### 1. Objective

Implement Phase 15: Templates as outlined in `FRONTEND_TODO.md`. This includes functionality for both List Templates and Task Templates, featuring UI components for selection, creation, saving, management, and previewing, integrated with mock API services and a dedicated Zustand store.

### 2. Implementation Details

#### 2.1. Type Definitions (`src/types/template.ts`)
New types were established to support structured template data:
- `ListTemplate`: Defines a reusable list with pre-defined columns (`TemplateColumn`), color, icon, and category.
- `TaskTemplate`: Defines a reusable task with default priority, tags, and a checklist (`TemplateChecklistItem`).
- `TemplateCategory`: Categorizes templates into 'project', 'personal', 'team', or 'custom'.

#### 2.2. Service Layer (`src/services/templateService.ts`)
A dedicated mock service was created to handle template-related API calls:
- **Built-in Templates**: Provides 5 pre-defined list templates (Kanban, Bug Tracking, Content Calendar, Agile Sprint, Personal) and 5 task templates (Feature, Bug Fix, Meeting Notes, Content Review, Research) with Arabic localization.
- **CRUD Operations**: Implements simulated endpoints for `getListTemplates`, `getTaskTemplates`, `createListFromTemplate`, `saveListAsTemplate`, `createTaskFromTemplate`, `saveTaskAsTemplate`, and `deleteTemplate` (for custom templates).
- **Mock Behavior**: Follows the existing pattern of using artificial delays to simulate server responsiveness.

#### 2.3. State Management (`src/store/useTemplateStore.ts`)
A new Zustand store manages the global state for templates:
- **Data Collections**: Stores fetched `listTemplates` and `taskTemplates`.
- **Modal States**: Controls the visibility of `ListTemplatesModal` and `TaskTemplatesModal`.
- **Actions**: Handles data fetching, template application (creation), and persistence (saving as template) with loading and error states.

#### 2.4. UI Components

##### ListTemplatesModal (`src/components/Templates/ListTemplatesModal.tsx`)
A comprehensive modal for list template management:
- **Template Gallery**: Displays available templates in a grid, filtered by category.
- **Preview System**: Selecting a template reveals its column structure and details.
- **Creation Flow**: Allows users to specify a list name and create a new list from the selected template.
- **"Save as Template" Tab**: Enables users to save the current list as a reusable template with a name and description.

##### TaskTemplatesModal (`src/components/Templates/TaskTemplatesModal.tsx`)
A dedicated modal for task template management:
- **Browse Grid**: Shows task templates with metadata (priority, tags, checklist summary).
- **Expandable Preview**: Clicking a template reveals its full checklist.
- **Creation Flow**: Single-click "Use" button to instantly create a task in the current column using the template's defaults.
- **"Save as Template" Tab**: Allows saving the currently viewed task as a template.

### 3. Integration & Wiring

- **BoardToolbar**: Replaced simplified template triggers with dedicated "قوالب" (List Templates) and "مهمة من قالب" (Task from Template) buttons.
- **KanbanBoard**: Integrated the `ListTemplatesModal` and `TaskTemplatesModal` components, wired to the `useTemplateStore` for centralized visibility control.
- **List Navigation**: Wired the "Create List" flow in the sidebar to potentially trigger the template gallery (extending existing `openTemplatesModal` logic).

### 4. Status

All Phase 15 requirements are **completed**:
- Full-featured Templates Gallery for Lists with preview and category filtering.
- Reusable Task Templates with priority, tag, and checklist presets.
- "Save as Template" functionality for both lists and tasks.
- Unified Template Store and Service.
- Clean TypeScript build and RTL/Arabic support verified.

---

## Phase 16: Custom Fields

### 1. Objective

Implement a structured Custom Field system that moves away from ad-hoc task-level properties to formal list-level definitions, providing consistent data types and management capabilities across the board.

### 2. Core Architecture

#### 2.1. Type System (`src/types/customField.ts`)
Established a robust set of interfaces to define the field definitions and their associated data:
- **`CustomFieldType`**: Supports `text`, `number`, `date`, `select`, and `checkbox`.
- **`CustomField`**: Defines the metadata for a field, including `id`, `name`, `type`, `options` (for select fields), and `showOnCard` preference.
- **`CustomFieldOption`**: Structuring for dropdown/select choices.

#### 2.2. Service Layer (`src/services/customFieldService.ts`)
A mock service implementing the backend contract for field management:
- **CRUD Operations**: Endpoints for creating, updating, deleting, and reordering field definitions.
- **Data Persistence**: Uses a simulated storage with artificial delays to mimic real-world network latency.
- **Initial Data**: Provided sample fields like "Budget" (Number), "Target Date" (Date), and "Audit Stage" (Select) for immediate functional testing.

#### 2.3. State Management (`src/store/useCustomFieldStore.ts`)
A dedicated Zustand store ensures reactive updates to field definitions across the UI:
- **`fields`**: Central collection of all definitions for the current list.
- **`isManagerModalOpen`**: Global state for the manager UI visibility.
- **Actions**: Atomic actions for fetching all fields and performing CRUD, ensuring state consistency.

### 3. UI and Integration

#### 3.1. Management Interface (`src/components/CustomFields/CustomFieldManagerModal.tsx`)
A new management center for list owners to:
- Define new fields by choosing a name and type.
- Configure "Select" options with a dedicated sub-editor.
- Toggle visibility on Kanban cards via the "Show on card" setting.
- Reorder or delete existing fields with safety confirmations.

#### 3.2. Task Detail Integration (`src/components/Task/CustomFieldsSection.tsx`)
The task detail view was refactored with "Type-Aware Editors":
- **Dynamic Rendering**: Maps each field definition to a specialized React editor component.
- **Types supported**:
  - `Select`: Custom dropdown with option matching.
  - `Checkbox`: Styled toggle switch with Arabic localization.
  - `Date`: Native date picker reflecting the user's locale.
  - `Number/Text`: Validated inputs for structured data entry.

#### 3.3. Conditional Display (`src/components/Kanban/TaskCard.tsx`)
Enhanced the card UI to respect user preferences:
- Only fields with `showOnCard: true` are rendered in the compact card view.
- Supports up to 3 fields on the front of the card to prevent clutter.
- Handles type-specific display logic (e.g., showing icons for different field types).

#### 3.4. Advanced Filtering (`src/components/Kanban/FilterPanel.tsx`)
The filtering engine was upgraded to be "Definition-Aware":
- Users now choose fields from a list of defined names rather than typing manual keys.
- Input fields in the filter panel automatically switch to the appropriate type (e.g., a checkbox appears for a boolean custom field).
- Filter chips in the toolbar display the human-readable field name instead of the internal ID.

### 4. Status

All Phase 16 requirements are **completed**:
- Structured list-level field definitions with full CRUD.
- Specialized editors for 5 distinct data types.
- Adaptive filtering and display logic integrated into Kanban and Task Detail.
- Full RTL and Arabic support across all management and editing interfaces.
- clean TypeScript compilation verified.


---

## Phase 17: Iterations/Sprints

### 1. Objective

Implement an Iteration (Sprint) management system to allow teams to group tasks into time-boxed cycles, track progress, and focus on specific goals within the Kanban framework.

### 2. Core Architecture

#### 2.1. Type System (`src/types/iteration.ts`)
Defined the core entities for iteration management:
- **`IterationStatus`**: Supports `planned`, `active`, and `completed`.
- **`Iteration`**: Contains `id`, `name`, `goal`, `startDate`, `endDate`, `status`, and `listId`.
- **`IterationStats`**: (Planned) Structure for tracking total/completed tasks within an iteration.

#### 2.2. Service Layer (`src/services/iterationService.ts`)
A service layer handling the lifecycle of iterations:
- **Mock Data**: Initial "Sprint 1" and "Sprint 2" data for immediate testing.
- **CRUD Operations**: Methods for fetching, creating, updating, and deleting iterations specific to a list.

#### 2.3. State Management (`src/store/useIterationStore.ts`)
A Zustand store for centralized iteration state:
- **State**: Tracks `iterations`, loading states, and the visibility of the Iteration Manager.
- **Actions**: Atomic CRUD operations with localized error handling and optimistic updates.
- **Selects**: Helpers like `getActiveIteration` for quick context retrieval.

### 3. UI and Integration

#### 3.1. Iteration Manager (`src/components/Iterations/IterationManagerModal.tsx`)
A centralized management modal accessible from the Board Toolbar:
- **List View**: Displays all iterations for the current list with status badges and dates.
- **Form Editor**: Type-safe form for creating/editing name, goal, dates, and status.
- **Arabic Localization**: Full RTL support for date pickers and status labels.

#### 3.2. Task Integration
Connecting tasks to the Formal Sprint system:
- **`Task` Type Update**: Added `iterationId` to link tasks to specific iterations.
- **Task Detail Sidebar (`TaskSidebar.tsx`)**: Replaced mock strings with a real iteration selector that syncs `iterationId` and `iterationName`.
- **Kanban Card (`TaskCard.tsx`)**: Added a dynamic iteration badge that reflects the assigned sprint, using the `RotateCcw` icon for visual consistency.

#### 3.3. Project-Wide Integration
- **Board Toolbar**: Added a dedicated "Iterations" (الدورات) action button.
- **Discovery & Filtering**: Extended the `FilterPanel` and `useTaskStore` to support filtering the entire board by one or more iterations.

### 4. Status

All Phase 17 requirements are **completed**:
- Formal Iteration/Sprint entity with full CRUD.
- Management UI integrated into the Kanban board.
- Task assignment and visual badging implemented.
- Iteration-based filtering functional in the board view.
- Clean TypeScript compilation and RTL/Arabic support verified.

---

## Phase 18: UI/UX, Accessibility & Responsiveness

### 1. Objective

Implement Phase 18 to enrich the application with semantic HTML structures, strict ARIA roles for rich interactive components, ensure a truly responsive mobile-first experience, and polish the final product with loading states, empty states, and dynamic animations.

### 2. Semantic Structure & Accessibility (A11y)

#### 2.1. HTML5 Tags and ARIA
- **Layouts**: Updated `MainLayout`, `Sidebar`, and `Header` to use proper `<main>`, `<nav>`, `<aside>`, and `<header>` tags.
- **Kanban Structure**: Replaced `<div>` containers with `<section>` and `<article>` tags in `KanbanColumn` and `TaskCard`.
- **ARIA Attributes**: Applied `role`, `aria-label`, `aria-labelledby`, and `aria-expanded` globally across interactive elements to improve screen reader compatibility.

#### 2.2. Keyboard Navigation
- Addressed focus outlines and enhanced keyboard navigability across modals, dropdowns, and sidebar interactions.

### 3. Responsiveness

#### 3.1. Mobile-First Approach
- **Layout Adjustments**: Tweaked `MainLayout` constraints to support mobile viewport heights and responsive overflowing.
- **Collapsible Sidebar**: Configured the sidebar to act as an off-canvas drawer on mobile screens with an overlay dark background.
- **Kanban Board**: Implemented horizontal scrolling snap for touch devices and optimized flex layouts in `TaskCard` so tags and assignees wrap organically.

### 4. Feedback & Polish

#### 4.1. Global Error Boundary
- Created a global `ErrorBoundary` class component mapped in `App.tsx` out of `src/components/ErrorBoundary.tsx` to handle rendering errors gracefully and present a fallback UI instead of crashing.

#### 4.2. Toast Notifications
- Added standard React Hot Toast (`react-hot-toast`) provider via `<Toaster>` in `App.tsx` for consistent success and error notifications across tasks such as creation, updates, and deletion.

#### 4.3. Loading States and Skeletons
- Designed a reusable `<Skeleton>` component and `<TaskCardSkeleton>` (`src/components/UI/Skeleton.tsx`) to render in kanban columns, replacing traditional spinners with organic wireframe loaders during data fetching.

#### 4.4. Empty States
- Established a reusable `<EmptyState>` component (`src/components/UI/EmptyState.tsx`) to illustrate when lists yield zero tasks or when searches return empty, utilizing `lucide-react` icons.

#### 4.5. Animations and Visual Feedback
- **Framer Motion**: Integrated `framer-motion` inside `TaskDetailModal.tsx` for smooth, performant entering and exiting scale animations.
- **Drag Feedback**: Upgraded drag-and-drop visuals in `TaskCard.tsx` with a prominent ring and a slight scale/rotation state when tasks are picked up, providing excellent touch and mouse feedback.

### 5. Status

All Phase 18 requirements are **completed**:
- Full semantic and ARIA role compliance for the major UI elements.
- Adaptive layouts verified for mobile scrolling and touch behaviors.
- Complete polish suite implemented (Skeletons, Toasters, Empty States, Error Boundaries, Animations).
- Clean TypeScript compilation and RTL/Arabic support verified.
