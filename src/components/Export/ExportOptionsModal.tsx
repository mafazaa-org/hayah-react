import { useState } from 'react';
import { X, Download, FileText, FileJson, Check } from 'lucide-react';
import type { Task, Column } from '../../types/task';
import { exportService, ALL_CSV_COLUMNS } from '../../services/exportService';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  filteredTasks: Task[];
  columns: Column[];
}

const COLUMN_LABELS: Record<string, string> = {
  title:       'العنوان',
  description: 'الوصف',
  status:      'الحالة',
  priority:    'الأولوية',
  dueDate:     'الموعد النهائي',
  tags:        'الوسوم',
  assignees:   'المكلفون',
  createdAt:   'تاريخ الإنشاء',
};

export function ExportOptionsModal({ isOpen, onClose, tasks, filteredTasks, columns }: ExportOptionsModalProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [applyFilters, setApplyFilters] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([...ALL_CSV_COLUMNS]);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = applyFilters ? filteredTasks : tasks;
      await exportService.exportTasks(data, columns, {
        format,
        applyFilters,
        csvColumns: format === 'csv' ? selectedColumns : undefined,
      });
      onClose();
    } catch (err) {
      console.error('Export error', err);
    } finally {
      setIsExporting(false);
    }
  };

  const exportCount = applyFilters ? filteredTasks.length : tasks.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Download size={20} className="text-sky-400" />
            خيارات التصدير
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">صيغة الملف</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border text-sm flex flex-col items-center gap-2 transition-all ${
                  format === 'csv'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <FileText size={24} />
                CSV
              </button>
              <button
                onClick={() => setFormat('json')}
                className={`p-3 rounded-xl border text-sm flex flex-col items-center gap-2 transition-all ${
                  format === 'json'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <FileJson size={24} />
                JSON
              </button>
            </div>
          </div>

          {/* Apply Filters Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">تصدير المهام المصفّاة فقط</span>
            <button
              onClick={() => setApplyFilters(!applyFilters)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                applyFilters ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  applyFilters ? 'right-0.5' : 'right-[22px]'
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-slate-500">
            سيتم تصدير <span className="text-slate-300 font-medium">{exportCount}</span> مهمة
          </p>

          {/* CSV Column Selection */}
          {format === 'csv' && (
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">الأعمدة المضمّنة</label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_CSV_COLUMNS.map(col => (
                  <label
                    key={col}
                    onClick={() => setSelectedColumns(prev =>
                      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
                    )}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                      selectedColumns.includes(col)
                        ? 'bg-slate-800 text-slate-200'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        selectedColumns.includes(col)
                          ? 'border-sky-500 bg-sky-500'
                          : 'border-slate-600'
                      }`}
                    >
                      {selectedColumns.includes(col) && <Check size={12} className="text-white" />}
                    </span>
                    {COLUMN_LABELS[col] || col}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || (format === 'csv' && selectedColumns.length === 0)}
            className="px-5 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download size={16} />
            {isExporting ? 'جارٍ التصدير...' : 'تصدير'}
          </button>
        </div>
      </div>
    </div>
  );
}
