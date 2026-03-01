import { useState } from 'react';
import { MoreVertical, Trash2, Move, Flag } from 'lucide-react';

interface BulkActionsMenuProps {
  selectedCount: number;
  onDelete: () => void;
  onMove: () => void;
  onChangePriority: () => void;
  onClearSelection: () => void;
}

export function BulkActionsMenu({
  selectedCount,
  onDelete,
  onMove,
  onChangePriority,
  onClearSelection
}: BulkActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (selectedCount === 0) return null;

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 rounded-lg px-3 py-2">
        <span className="text-sm text-sky-400">
          {selectedCount} محدد
        </span>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-sky-500/20 rounded transition-colors"
        >
          <MoreVertical size={16} className="text-sky-400" />
        </button>

        <button
          onClick={onClearSelection}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          إلغاء
        </button>
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div className="absolute left-0 top-12 z-50 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl min-w-[180px]">
            <div className="p-2">
              <button
                onClick={() => handleAction(onMove)}
                className="w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 rounded-lg transition-colors flex items-center gap-2 text-right"
              >
                <Move size={16} />
                نقل إلى عمود
              </button>
              <button
                onClick={() => handleAction(onChangePriority)}
                className="w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 rounded-lg transition-colors flex items-center gap-2 text-right"
              >
                <Flag size={16} />
                تغيير الأولوية
              </button>
              <hr className="my-2 border-slate-800" />
              <button
                onClick={() => {
                  if (confirm(`هل أنت متأكد من حذف ${selectedCount} مهمة؟`)) {
                    handleAction(onDelete);
                  }
                }}
                className="w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 text-right"
              >
                <Trash2 size={16} />
                حذف المحدد
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
