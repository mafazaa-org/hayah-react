import { useState, useEffect } from 'react';
import { useTaskDetailStore } from '../../store/useTaskDetailStore';
import { useCustomFieldStore } from '../../store/useCustomFieldStore';
import { useListStore } from '../../store/useListStore';
import { Settings2, Plus, Calendar, Hash, Type, ChevronDown, CheckSquare, X } from 'lucide-react';

export function CustomFieldsSection() {
  const { selectedTask, updateTaskField } = useTaskDetailStore();
  const { activeListId } = useListStore();
  const { fields, fetchFields, openManagerModal } = useCustomFieldStore();

  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>('');

  useEffect(() => {
    if (activeListId) {
      fetchFields(activeListId);
    }
  }, [activeListId, fetchFields]);

  if (!selectedTask) return null;

  const taskValues = selectedTask.customFields || {};

  const handleSave = (fieldId: string, value: any) => {
    const updatedValues = { ...taskValues, [fieldId]: value };
    updateTaskField({ customFields: updatedValues });
    setEditingFieldId(null);
  };

  if (fields.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-800/20 border border-slate-700/50 rounded-xl">
        <Settings2 size={32} className="mx-auto mb-3 text-slate-600" />
        <p className="text-sm text-slate-500">لا توجد حقول مخصصة معرّفة</p>
        <button 
          onClick={openManagerModal}
          className="text-xs text-sky-400 mt-2 hover:underline flex items-center gap-1 mx-auto"
        >
          <Plus size={14} />
          إدارة الحقول
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-300">الحقول المخصصة</h3>
        <button 
          onClick={openManagerModal}
          className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          title="إدارة الحقول"
        >
          <Settings2 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {fields.map((field) => {
          const value = taskValues[field.id];
          const isEditing = editingFieldId === field.id;

          const renderValue = () => {
            if (value === undefined || value === null || value === '') {
              return <span className="text-slate-600 italic text-xs">فارغ</span>;
            }

            if (field.type === 'checkbox') {
              return (
                <div className={`w-5 h-5 rounded flex items-center justify-center ${value ? 'bg-sky-500 text-white' : 'bg-slate-700'}`}>
                  {value && <CheckSquare size={14} />}
                </div>
              );
            }

            if (field.type === 'select') {
              const option = field.options?.find(o => o.id === value || o.value === value);
              return (
                <span 
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: (option?.color || '#334155') + '30', color: option?.color || '#94a3b8' }}
                >
                  {option?.value || value}
                </span>
              );
            }

            return <span className="text-sm text-slate-200">{String(value)}</span>;
          };

          return (
            <div 
              key={field.id}
              className="flex items-center gap-4 px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-all cursor-pointer group"
              onClick={() => {
                if (!isEditing) {
                  setEditingFieldId(field.id);
                  setEditValue(value ?? '');
                }
              }}
            >
              <div className="flex items-center gap-2 min-w-[100px] shrink-0">
                <span className="text-slate-500">
                  {field.type === 'text' && <Type size={14} />}
                  {field.type === 'number' && <Hash size={14} />}
                  {field.type === 'date' && <Calendar size={14} />}
                  {field.type === 'select' && <ChevronDown size={14} />}
                  {field.type === 'checkbox' && <CheckSquare size={14} />}
                </span>
                <label className="text-xs font-medium text-slate-400">{field.name}</label>
              </div>

              <div className="flex-1 text-right">
                {isEditing ? (
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {field.type === 'checkbox' ? (
                      <input 
                        type="checkbox"
                        checked={!!editValue}
                        onChange={(e) => handleSave(field.id, e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500"
                        autoFocus
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={editValue}
                        onChange={(e) => handleSave(field.id, e.target.value)}
                        onBlur={() => setEditingFieldId(null)}
                        className="w-full bg-slate-900 border-b border-sky-500 py-1 text-sm text-slate-100 focus:outline-none"
                        autoFocus
                      >
                        <option value="">-- اختر --</option>
                        {field.options?.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.value}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSave(field.id, field.type === 'number' ? Number(editValue) : editValue)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave(field.id, field.type === 'number' ? Number(editValue) : editValue);
                          if (e.key === 'Escape') setEditingFieldId(null);
                        }}
                        className="w-full bg-transparent border-b border-sky-500 py-1 text-sm text-slate-100 focus:outline-none"
                        autoFocus
                      />
                    )}
                    <button onClick={() => setEditingFieldId(null)} className="p-1 text-slate-500 hover:text-slate-300">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  renderValue()
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

