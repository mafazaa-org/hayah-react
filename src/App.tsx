import './index.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { PrivateRoute } from './components/PrivateRoute'
import { DashboardPage } from './pages/DashboardPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { RegistrationPage } from './pages/RegistrationPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { ListView } from './pages/ListView'
import { SearchResultsPage } from './pages/SearchResultsPage'
import { MainLayout } from './layouts/MainLayout'
import { LiveCursors } from './components/LiveCursors'

import { useEffect } from 'react';
import { usePresenceStore } from './store/usePresenceStore';
import { useNotificationStore } from './store/useNotificationStore';
import { useTaskStore } from './store/useTaskStore';
import { useTaskDetailStore } from './store/useTaskDetailStore';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/list/:listId" element={<ListView />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
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
