import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Plus,
  // Grid
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchService } from '../services/searchService';
import { useTaskStore } from '../store/useTaskStore';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSearchQuery } = useTaskStore(state => ({
    setSearchQuery: state.setSearchQuery
  }));
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(searchService.getRecentSearches());
  }, []);

  const handleSubmitSearch = (value: string) => {
    const query = value.trim();
    if (!query) return;

    searchService.addRecentSearch(query);
    setRecentSearches(searchService.getRecentSearches());

    // If we're currently on a list/board view, apply search to that board
    if (location.pathname.startsWith('/dashboard/list/')) {
      setSearchQuery(query);
    }
    // Future (Phase 13): navigate to dedicated global search page
  };

  const handleLogout = () => {
    localStorage.removeItem(import.meta.env.VITE_JWT_STORAGE_KEY || 'hayah_auth_token');
    navigate('/login');
  };

  return (
    <header className="h-14 bg-slate-900/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 sticky top-0 z-50">
      {/* Right Side (Logo & Nav) - RTL Context */}
      <div className="flex items-center gap-4">
        {/* Logo area */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg">
            ح
          </div>
          <span className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hidden sm:block">
            حياة
          </span>
        </div>

        {/* Workspace Switcher (Mock) */}
        <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer text-slate-300 transition-colors">
          <span className="text-sm font-medium">مساحة العمل</span>
          <ChevronDown size={14} />
        </div>

        <div className="h-6 w-px bg-white/10 hidden md:block" />

        {/* Primary Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {['الأخيرة', 'المفضلة', 'القوالب'].map((item) => (
            <button key={item} className="px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5 rounded transition-colors">
              {item}
            </button>
          ))}
          <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors ml-2 shadow-lg shadow-blue-900/20">
            <Plus size={16} />
            <span>جديد</span>
          </button>
        </nav>
      </div>

      {/* Center Search */}
      <div className="flex-1 max-w-xl px-4 hidden sm:block">
        <div className="relative group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="بحث عالمي عن المهام..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              // Delay blur handling slightly to allow click on dropdown items
              setTimeout(() => setIsSearchFocused(false), 120);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmitSearch(searchTerm);
              }
            }}
            className="w-full bg-slate-800/50 border border-white/5 focus:border-blue-500/50 rounded-lg py-1.5 pr-10 pl-4 text-sm text-slate-200 focus:outline-none focus:bg-slate-800 transition-all placeholder:text-slate-500"
          />

          {/* Recent searches dropdown */}
          {isSearchFocused && recentSearches.length > 0 && (
            <div className="absolute mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-40">
              <div className="px-3 py-1.5 text-xs text-slate-500 flex items-center justify-between">
                <span>عمليات البحث الأخيرة</span>
                <button
                  type="button"
                  onClick={() => {
                    searchService.clearRecentSearches();
                    setRecentSearches([]);
                  }}
                  className="text-[11px] text-slate-500 hover:text-red-400 transition-colors"
                >
                  مسح الكل
                </button>
              </div>
              {recentSearches.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setSearchTerm(q);
                    handleSubmitSearch(q);
                  }}
                  className="w-full text-right px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between gap-2"
                >
                  <span className="truncate">{q}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Left Side (User Actions) */}
      <div className="flex items-center gap-2">
        {/* Mobile Create Button */}
        <button className="lg:hidden p-2 text-slate-300 hover:bg-white/5 rounded-full">
          <Plus size={20} />
        </button>

        <button className="p-2 text-slate-300 hover:bg-white/5 rounded-full relative group">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
        </button>

        <button className="p-2 text-slate-300 hover:bg-white/5 rounded-full hidden sm:block">
          <HelpCircle size={20} />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-purple-600 p-0.5 ml-1 ring-2 ring-transparent hover:ring-blue-500/50 transition-all"
          >
            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
              <span className="text-xs font-bold text-white">م</span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-sm font-medium text-white">المستخدم الحالي</p>
                <p className="text-xs text-slate-400 truncate">user@example.com</p>
              </div>

              <button
                onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                className="w-full text-right px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2"
              >
                <User size={16} />
                الملف الشخصي
              </button>

              <button
                onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}
                className="w-full text-right px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2"
              >
                <Settings size={16} />
                الإعدادات
              </button>

              <div className="h-px bg-slate-800 my-1" />

              <button
                onClick={handleLogout}
                className="w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-red-950/30 flex items-center gap-2"
              >
                <LogOut size={16} />
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
