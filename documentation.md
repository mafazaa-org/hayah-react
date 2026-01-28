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
