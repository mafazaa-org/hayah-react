import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(prev => !prev)} />

        {/* Sidebar toggle (desktop) */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className="hidden md:flex items-center justify-center w-5 h-10 absolute top-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-slate-400 hover:text-slate-200 transition-colors z-30"
          style={{ left: isSidebarOpen ? '16.1rem' : '0.25rem' }}
          title={isSidebarOpen ? 'إخفاء الشريط الجانبي' : 'إظهار الشريط الجانبي'}
        >
          {isSidebarOpen ? <PanelRightOpen size={14} /> : <PanelRightClose size={14} />}
        </button>

        <main className="flex-1 overflow-auto bg-slate-950 relative w-full scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
