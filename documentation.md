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

