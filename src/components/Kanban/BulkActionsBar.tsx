import { useState } from 'react';
import {
  X, Trash2, Move, Flag, Download, CheckSquare, Square
} from 'lucide-react';
import type { Column } from '../../types/task';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  columns: Column[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkMove: (targetStatus: string) => void;
  onBulkChangePriority: (priority: 'low' | 'medium' | 'high' | 'critical') => void;
  onBulkExport: () => void;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  columns,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkMove,
  onBulkChangePriority,
  onBulkExport,
}: BulkActionsBarProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  if (selectedCount === 0) return null;

  const priorities: { value: 'low' | 'medium' | 'high' | 'critical'; label: string; color: string }[] = [
    { value: 'low', label: 'منخفضة', color: 'bg-slate-500' },
    { value: 'medium', label: 'متوسطة', color: 'bg-blue-500' },
    { value: 'high', label: 'عالية', color: 'bg-amber-500' },
    { value: 'critical', label: 'حرجة', color: 'bg-red-500' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4">
        {/* Selection info */}
        <div className="flex items-center gap-2 pl-4 border-l border-slate-700">
          <span className="text-sm font-medium text-sky-400">{selectedCount}</span>
          <span className="text-sm text-slate-400">محدد من {totalCount}</span>
        </div>

        {/* Select All / Deselect */}
        {selectedCount < totalCount ? (
          <button
            onClick={onSelectAll}
            className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="تحديد الكل"
          >
            <CheckSquare size={18} />
          </button>
        ) : (
          <button
            onClick={onClearSelection}
            className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="إلغاء التحديد"
          >
            <Square size={18} />
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-slate-700" />

        {/* Move to column */}
        <div className="relative">
          <button
            onClick={() => { setShowMoveMenu(!showMoveMenu); setShowPriorityMenu(false); }}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-sm"
            title="نقل إلى"
          >
            <Move size={16} />
            نقل
          </button>
          {showMoveMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMoveMenu(false)} />
              <div className="absolute bottom-full left-0 mb-2 z-50 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl min-w-[160px] py-1">
                {columns.map(col => (
                  <button
                    key={col.id}
                    onClick={() => { onBulkMove(col.id); setShowMoveMenu(false); }}
                    className="w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 text-right flex items-center gap-2"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                    {col.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Change Priority */}
        <div className="relative">
          <button
            onClick={() => { setShowPriorityMenu(!showPriorityMenu); setShowMoveMenu(false); }}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-sm"
            title="تغيير الأولوية"
          >
            <Flag size={16} />
            أولوية
          </button>
          {showPriorityMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPriorityMenu(false)} />
              <div className="absolute bottom-full left-0 mb-2 z-50 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl min-w-[140px] py-1">
                {priorities.map(p => (
                  <button
                    key={p.value}
                    onClick={() => { onBulkChangePriority(p.value); setShowPriorityMenu(false); }}
                    className="w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 text-right flex items-center gap-2"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.color}`} />
                    {p.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Export Selected */}
        <button
          onClick={onBulkExport}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-sm"
          title="تصدير المحدد"
        >
          <Download size={16} />
          تصدير
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-700" />

        {/* Delete */}
        <button
          onClick={() => {
            if (confirm(`هل أنت متأكد من حذف ${selectedCount} مهمة؟`)) {
              onBulkDelete();
            }
          }}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1.5 text-sm"
          title="حذف المحدد"
        >
          <Trash2 size={16} />
          حذف
        </button>

        {/* Close */}
        <button
          onClick={onClearSelection}
          className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          title="إلغاء التحديد"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
