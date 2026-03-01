import React, { useState, useEffect } from 'react';
import { useColumnStore } from '../../store/useColumnStore';
import { X } from 'lucide-react';

const PRESET_COLORS = [
  '#64748b', // slate
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4'  // cyan
];

export function ColumnModal() {
  const { isColumnModalOpen, editingColumnId, closeColumnModal, addColumn, updateColumn, columns, currentListId } = useColumnStore();

  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  // Load existing column data when editing
  useEffect(() => {
    if (editingColumnId) {
      const column = columns.find(col => col.id === editingColumnId);
      if (column) {
        setName(column.name);
        setColor(column.color);
      }
    } else {
      setName('');
      setColor(PRESET_COLORS[0]);
    }
  }, [editingColumnId, columns]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingColumnId) {
      // Update existing column
      updateColumn(editingColumnId, { name: name.trim(), color });
    } else {
      // Create new column
      if (!currentListId) return;
      addColumn(currentListId, name.trim(), color);
    }

    handleClose();
  };

  const handleClose = () => {
    closeColumnModal();
    setName('');
    setColor(PRESET_COLORS[0]);
  };

  if (!isColumnModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">
            {editingColumnId ? 'تعديل العمود' : 'إضافة عمود جديد'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
            aria-label="إغلاق"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="column-name" className="block text-sm font-medium text-slate-300 mb-2">
              اسم العمود <span className="text-red-400">*</span>
            </label>
            <input
              id="column-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: قيد التنفيذ"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
              autoFocus
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              اللون
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`
                    w-10 h-10 rounded-lg transition-all
                    ${color === presetColor ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'}
                  `}
                  style={{ backgroundColor: presetColor }}
                  aria-label={`اختر اللون ${presetColor}`}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400 mb-2">معاينة:</div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-slate-100">{name || 'اسم العمود'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingColumnId ? 'حفظ' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
