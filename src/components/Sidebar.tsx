import { Home, Inbox, Search, Plus, Archive, Trash2 } from 'lucide-react';
import { FolderTree } from './Sidebar/FolderTree';
import { useNavigate } from 'react-router-dom';

export function Sidebar({ isOpen, onToggle }: { isOpen: boolean, onToggle: () => void }) {
  const navigate = useNavigate();


  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onToggle}
      />

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:sticky top-14 bottom-0 z-40 h-[calc(100vh-3.5rem)]
          bg-slate-900 border-l border-white/5 
          transition-[width,transform] duration-300 ease-in-out
          ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-0'}
          overflow-hidden flex flex-col
        `}
      >
        {/* Toggle Button (Desktop - Absolute on edge when closed implementation requires different logic, 
            here we assume specific layout handling or header button. For now keeping it simple internal) 
        */}

        {/* Quick Links */}
        <div className="p-2 space-y-1 mt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
          >
            <Home size={18} className="text-pink-500" />
            <span className="font-medium">الرئيسية</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-md transition-colors">
            <Inbox size={18} className="text-blue-500" />
            <span className="font-medium">الوارد</span>
            <span className="mr-auto bg-slate-800 text-slate-400 text-xs px-1.5 py-0.5 rounded">3</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-md transition-colors">
            <Search size={18} className="text-slate-500" />
            <span className="font-medium">بحث</span>
          </button>
        </div>

        <div className="h-px bg-slate-800 mx-4 my-2" />

        {/* Spaces / Tree */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

          {/* Spaces Header */}
          <div className="flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>المساحات</span>
            <button className="hover:text-slate-300 transition-colors">
              <Plus size={14} />
            </button>
          </div>

          <FolderTree />
        </div>

        {/* Bottom Actions */}
        <div className="p-2 border-t border-slate-800 bg-slate-900/50">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 rounded-md transition-colors">
            <Archive size={16} />
            <span>الأرشيف</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 rounded-md transition-colors">
            <Trash2 size={16} />
            <span>سلة المحذوفات</span>
          </button>
        </div>
      </aside>

      {/* Collapse Toggle (Visible only when sidebar is open? Or always floating? 
          For standard layout, usually the toggle is in the Header or on the sidebar edge.
          Let's add a floating toggle on the MainLayout side if valid, or just rely on Header for now.
      */}
    </>
  );
}
