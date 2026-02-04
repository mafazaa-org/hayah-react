import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';

export function MainLayout() {
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans">
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Slot - Will be implemented in Phase 4.2 */}
        {/* <aside className="w-64 bg-slate-900 border-l border-white/5 hidden md:block">
            Sidebar Content
        </aside> */}

        <main className="flex-1 overflow-auto bg-slate-950 relative w-full scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
