import { useRef, useEffect } from 'react';
import { Edit2, Trash2, Copy, Archive, Settings, FileText } from 'lucide-react';
import type { NavigationItem } from '../../services/folderService';

interface ListContextMenuProps {
  x: number;
  y: number;
  item: NavigationItem;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onSettings: () => void;
  onSaveTemplate: () => void;
}

export function ListContextMenu({
  x, y, item,
  onClose,
  onRename,
  onDelete,
  onDuplicate,
  onArchive,
  onSettings,
  onSaveTemplate
}: ListContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  const style = {
    top: Math.min(y, window.innerHeight - 300), // Adjusted for taller menu
    left: Math.min(x, window.innerWidth - 200),
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-52 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 text-sm text-slate-300"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 text-xs font-semibold text-slate-500 border-b border-slate-700 mb-1 truncate">
        {item.name}
      </div>

      <button onClick={() => { onRename(); onClose(); }} className="w-full text-right flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors">
        <Edit2 size={14} /> <span>إعادة تسمية</span>
      </button>

      <button onClick={() => { onDuplicate(); onClose(); }} className="w-full text-right flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors">
        <Copy size={14} /> <span>تكرار القائمة</span>
      </button>

      <button onClick={() => { onSaveTemplate(); onClose(); }} className="w-full text-right flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors">
        <FileText size={14} /> <span>حفظ كقالب</span>
      </button>

      <div className="h-px bg-slate-700 my-1" />

      <button onClick={() => { onSettings(); onClose(); }} className="w-full text-right flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors">
        <Settings size={14} /> <span>الإعدادات</span>
      </button>

      <button onClick={() => { onArchive(); onClose(); }} className="w-full text-right flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors">
        <Archive size={14} /> <span>أرشفة</span>
      </button>

      <div className="h-px bg-slate-700 my-1" />

      <button onClick={() => { onDelete(); onClose(); }} className="w-full text-right flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-red-400 hover:text-red-300 transition-colors">
        <Trash2 size={14} /> <span>حذف</span>
      </button>
    </div>
  );
}
