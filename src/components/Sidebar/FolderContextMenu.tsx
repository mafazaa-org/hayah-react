import { useRef, useEffect } from 'react';
import { Edit2, Trash2, ListPlus } from 'lucide-react';
import type { NavigationItem } from '../../services/folderService';

interface FolderContextMenuProps {
  x: number;
  y: number;
  item: NavigationItem;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
  onCreateList: () => void; // Creates a list or folder inside
}

export function FolderContextMenu({ x, y, item, onClose, onRename, onDelete, onCreateList }: FolderContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  // Adjust position to stay within viewport
  const style = {
    top: Math.min(y, window.innerHeight - 150),
    left: Math.min(x, window.innerWidth - 200),
  };

  // RTL adjustments if needed (browser handles 'left' fine usually, but semantic placement might matter)

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 text-sm text-slate-300"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 text-xs font-semibold text-slate-500 border-b border-slate-700 mb-1">
        {item.name}
      </div>

      {item.type === 'folder' && (
        <>
          <button
            onClick={() => { onCreateList(); onClose(); }}
            className="w-full text-right flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors"
          >
            <ListPlus size={14} />
            <span>إنشاء قائمة جديدة</span>
          </button>
          <div className="h-px bg-slate-700 my-1" />
        </>
      )}

      <button
        onClick={() => { onRename(); onClose(); }}
        className="w-full text-right flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors"
      >
        <Edit2 size={14} />
        <span>إعادة تسمية</span>
      </button>

      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full text-right flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-red-400 hover:text-red-300 transition-colors"
      >
        <Trash2 size={14} />
        <span>حذف</span>
      </button>
    </div>
  );
}
