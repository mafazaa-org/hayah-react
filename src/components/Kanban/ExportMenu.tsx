import { useState } from 'react';
import { Download, FileText, FileJson, Printer } from 'lucide-react';
import type { Task } from '../../types/task';
import type { Column } from '../../types/task';

interface ExportMenuProps {
  tasks: Task[];
  columns: Column[];
}

export function ExportMenu({ tasks, columns }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportAsCSV = () => {
    // Create CSV content
    const headers = ['العنوان', 'الوصف', 'الحالة', 'الأولوية', 'الموعد النهائي', 'الوسوم'];
    const rows = tasks.map(task => {
      const column = columns.find(c => c.id === task.status);
      return [
        task.title,
        task.description || '',
        column?.name || '',
        task.priority || '',
        task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-EG') : '',
        task.tags?.join(', ') || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tasks_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    setIsOpen(false);
  };

  const exportAsJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      columns,
      tasks
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tasks_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    setIsOpen(false);
  };

  const printView = () => {
    window.print();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
      >
        <Download size={16} />
        تصدير
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div className="absolute left-0 top-12 z-50 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl min-w-[180px]">
            <div className="p-2">
              <button
                onClick={exportAsCSV}
                className="w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 rounded-lg transition-colors flex items-center gap-2 text-right"
              >
                <FileText size={16} />
                تصدير كـ CSV
              </button>
              <button
                onClick={exportAsJSON}
                className="w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 rounded-lg transition-colors flex items-center gap-2 text-right"
              >
                <FileJson size={16} />
                تصدير كـ JSON
              </button>
              <hr className="my-2 border-slate-800" />
              <button
                onClick={printView}
                className="w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 rounded-lg transition-colors flex items-center gap-2 text-right"
              >
                <Printer size={16} />
                طباعة
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
