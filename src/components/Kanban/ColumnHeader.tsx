import { useState } from 'react';
import type { Column } from '../../types/task';
import { MoreVertical, Pencil, Trash2, Palette } from 'lucide-react';

interface ColumnHeaderProps {
  column: Column;
  taskCount: number;
  onRename: () => void;
  onDelete: () => void;
  onChangeColor: () => void;
}

export function ColumnHeader({ column, taskCount, onRename, onDelete, onChangeColor }: ColumnHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-between mb-3 px-1">
      {/* Column Name & Count */}
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <h3 className="text-sm font-semibold text-slate-100">
          {column.name}
        </h3>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
          {taskCount}
        </span>
      </div>

      {/* Context Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
          aria-label="خيارات العمود"
        >
          <MoreVertical size={16} className="text-slate-400" />
        </button>

        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <div className="absolute left-0 top-8 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[160px]">
              <button
                onClick={() => {
                  onRename();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-right text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
              >
                <Pencil size={14} />
                إعادة تسمية
              </button>
              <button
                onClick={() => {
                  onChangeColor();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-right text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
              >
                <Palette size={14} />
                تغيير اللون
              </button>
              <hr className="my-1 border-slate-700" />
              <button
                onClick={() => {
                  if (confirm('هل أنت متأكد من حذف هذا العمود؟')) {
                    onDelete();
                  }
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-right text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
              >
                <Trash2 size={14} />
                حذف
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
