import React, { useState } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { useColumnStore } from '../../store/useColumnStore';
import { X } from 'lucide-react';

export function CreateTaskModal() {
  const { isCreateTaskModalOpen, closeCreateTaskModal, addTask, selectedColumnId, currentListId } = useTaskStore();
  const { columns } = useColumnStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(selectedColumnId || '');

  // Update status when selectedColumnId changes
  React.useEffect(() => {
    if (selectedColumnId) {
      setStatus(selectedColumnId);
    }
  }, [selectedColumnId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !status || !currentListId) return;

    addTask(currentListId, {
      title: title.trim(),
      description: description.trim() || undefined,
      status
    });

    // Reset form
    setTitle('');
    setDescription('');
    setStatus(selectedColumnId || '');
  };

  const handleClose = () => {
    closeCreateTaskModal();
    setTitle('');
    setDescription('');
    setStatus(selectedColumnId || '');
  };

  if (!isCreateTaskModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">إضافة مهمة جديدة</h2>
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
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-slate-300 mb-2">
              العنوان <span className="text-red-400">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان المهمة"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-slate-300 mb-2">
              الوصف
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل وصف المهمة (اختياري)"
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>

          {/* Status/Column */}
          <div>
            <label htmlFor="task-status" className="block text-sm font-medium text-slate-300 mb-2">
              العمود <span className="text-red-400">*</span>
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            >
              <option value="">اختر العمود</option>
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
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
              disabled={!title.trim() || !status}
              className="px-4 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إضافة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
