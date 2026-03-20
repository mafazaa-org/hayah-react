import './index.css'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { PrivateRoute } from './components/PrivateRoute'
import { MainLayout } from './layouts/MainLayout'
import { LiveCursors } from './components/LiveCursors'

import { useEffect } from 'react';
import { usePresenceStore } from './store/usePresenceStore';
import { useNotificationStore } from './store/useNotificationStore';
import { useTaskStore } from './store/useTaskStore';
import { useTaskDetailStore } from './store/useTaskDetailStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';

// Route-level code splitting via React.lazy
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegistrationPage = lazy(() => import('./pages/RegistrationPage').then(m => ({ default: m.RegistrationPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ListView = lazy(() => import('./pages/ListView').then(m => ({ default: m.ListView })));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage').then(m => ({ default: m.SearchResultsPage })));

// Suspense fallback for lazy-loaded routes
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500" />
    </div>
  );
}

function App() {
  // Track Web Vitals in development
  usePerformanceMonitor();
  useEffect(() => {
    // Initialize global WebSocket listeners
    const initializePresence = usePresenceStore.getState().initializeSocketListeners;
    const { fetchUnreadCount, initializeSocketListeners: initNotifListeners } = useNotificationStore.getState();
    const initTaskListeners = useTaskStore.getState().initializeSocketListeners;
    const initTaskDetailListeners = useTaskDetailStore.getState().initializeSocketListeners;

    initializePresence();
    initNotifListeners?.();
    initTaskListeners?.();
    initTaskDetailListeners?.();
    fetchUnreadCount();

    return () => {
      usePresenceStore.getState().removeSocketListeners();
      useNotificationStore.getState().removeSocketListeners?.();
    };
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
          <Route path="/register" element={<Suspense fallback={<PageLoader />}><RegistrationPage /></Suspense>} />
          <Route path="/forgot-password" element={<Suspense fallback={<PageLoader />}><ForgotPasswordPage /></Suspense>} />
          <Route path="/reset-password" element={<Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense>} />
          <Route path="/verify-email" element={<Suspense fallback={<PageLoader />}><VerifyEmailPage /></Suspense>} />
          <Route element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
            <Route path="/dashboard/list/:listId" element={<Suspense fallback={<PageLoader />}><ListView /></Suspense>} />
            <Route path="/search" element={<Suspense fallback={<PageLoader />}><SearchResultsPage /></Suspense>} />
            <Route path="/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
            <Route path="/settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <LiveCursors />
        <Toaster position="bottom-left" toastOptions={{
          style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
        }} />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
