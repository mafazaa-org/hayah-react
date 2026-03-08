import { useState, useEffect, useRef } from 'react';
import { Search, Home, LayoutDashboard, Settings, User as UserIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../store/useTaskStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { setSearchQuery } = useTaskStore(state => ({
    setSearchQuery: state.setSearchQuery
  }));

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = [
    {
      id: 'search', title: `بحث عن: "${query}"`, icon: <Search size={16} />, action: () => {
        setSearchQuery(query);
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }, show: query.trim().length > 0
    },
    { id: 'home', title: 'الرئيسية', icon: <Home size={16} />, action: () => navigate('/') },
    { id: 'dashboard', title: 'لوحة التحكم', icon: <LayoutDashboard size={16} />, action: () => navigate('/dashboard') },
    { id: 'profile', title: 'الملف الشخصي', icon: <UserIcon size={16} />, action: () => navigate('/profile') },
    { id: 'settings', title: 'الإعدادات', icon: <Settings size={16} />, action: () => navigate('/settings') },
  ];

  const visibleItems = items.filter(item => item.show !== false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % visibleItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + visibleItems.length) % visibleItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (visibleItems[selectedIndex]) {
        visibleItems[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden focus:outline-none flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-3 border-b border-slate-800">
          <Search size={20} className="text-slate-400 rtl:ml-2 ltr:mr-2" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none text-slate-100 placeholder:text-slate-500 focus:outline-none text-lg"
            placeholder="ابحث، أو انتقل إلى..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            dir="rtl"
          />
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-2 py-2">
          {visibleItems.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              لا توجد نتائج
            </div>
          ) : (
            <div className="space-y-1">
              {visibleItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-right
                      ${isSelected ? 'bg-sky-500/10 text-sky-400' : 'text-slate-300 hover:bg-slate-800'}
                    `}
                  >
                    <div className={isSelected ? 'text-sky-400' : 'text-slate-500'}>
                      {item.icon}
                    </div>
                    <span className="flex-1">{item.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="font-sans px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">↑</kbd> <kbd className="font-sans px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">↓</kbd> للتنقل</span>
            <span className="flex items-center gap-1"><kbd className="font-sans px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">Enter</kbd> للاختيار</span>
            <span className="flex items-center gap-1"><kbd className="font-sans px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">Esc</kbd> للإغلاق</span>
          </div>
        </div>
      </div>
    </div>
  );
}
