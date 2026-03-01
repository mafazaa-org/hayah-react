import { useState } from 'react';
import { useTaskDetailStore } from '../../store/useTaskDetailStore';
import { Settings2 } from 'lucide-react';

export function CustomFieldsSection() {
  const { selectedTask, updateTaskField } = useTaskDetailStore();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!selectedTask) return null;

  const customFields = selectedTask.customFields || {};
  const entries = Object.entries(customFields);

  const saveField = (key: string) => {
    const newFields = { ...customFields };
    // Try to parse as number or boolean
    const raw = editValue.trim();
    if (raw === 'true' || raw === 'false') {
      newFields[key] = raw === 'true';
    } else if (!isNaN(Number(raw)) && raw !== '') {
      newFields[key] = Number(raw);
    } else {
      newFields[key] = raw;
    }
    updateTaskField({ customFields: newFields });
    setEditingKey(null);
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <Settings2 size={32} className="mx-auto mb-3 text-slate-600" />
        <p className="text-sm text-slate-500">لا توجد حقول مخصصة</p>
        <p className="text-xs text-slate-600 mt-1">
          يمكن إضافة الحقول المخصصة من إعدادات القائمة
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700/50"
        >
          <span className="text-xs font-medium text-slate-400 min-w-[80px]">{key}</span>
          {editingKey === key ? (
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => saveField(key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveField(key);
                if (e.key === 'Escape') setEditingKey(null);
              }}
              className="flex-1 bg-transparent border-b border-sky-500 text-sm text-slate-100 focus:outline-none"
              autoFocus
            />
          ) : (
            <span
              onClick={() => {
                setEditingKey(key);
                setEditValue(String(value));
              }}
              className="flex-1 text-sm text-slate-200 cursor-pointer hover:text-sky-400 transition-colors"
            >
              {typeof value === 'boolean' ? (value ? '✓ نعم' : '✗ لا') : String(value)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
