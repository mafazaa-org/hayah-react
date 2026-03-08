import { useState, useEffect } from 'react';
import { 
  X, Plus, Settings2, Trash2, GripVertical, Type, Hash, 
  Calendar, ChevronDown, CheckSquare, Save, Loader2 
} from 'lucide-react';
import { useCustomFieldStore } from '../../store/useCustomFieldStore';
import { useListStore } from '../../store/useListStore';
import type { CustomFieldType } from '../../types/customField';

const FIELD_TYPES: { type: CustomFieldType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'نص', icon: <Type size={16} /> },
  { type: 'number', label: 'رقم', icon: <Hash size={16} /> },
  { type: 'date', label: 'تاريخ', icon: <Calendar size={16} /> },
  { type: 'select', label: 'قائمة منسدلة', icon: <ChevronDown size={16} /> },
  { type: 'checkbox', label: 'صندوق اختيار', icon: <CheckSquare size={16} /> },
];

export function CustomFieldManagerModal() {
  const { activeListId } = useListStore();
  const { 
    fields, 
    isLoading, 
    isManagerModalOpen, 
    closeManagerModal,
    fetchFields,
    addField,
    updateField,
    deleteField
  } = useCustomFieldStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<CustomFieldType>('text');

  useEffect(() => {
    if (isManagerModalOpen && activeListId) {
      fetchFields(activeListId);
    }
  }, [isManagerModalOpen, activeListId, fetchFields]);

  if (!isManagerModalOpen) return null;

  const handleAdd = async () => {
    if (!newName.trim() || !activeListId) return;
    await addField(activeListId, {
      listId: activeListId,
      name: newName.trim(),
      type: newType,
      showOnCard: false,
      order: fields.length
    });
    setNewName('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeManagerModal} />
      
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Settings2 size={20} className="text-sky-400" />
            إدارة الحقول المخصصة
          </h2>
          <button onClick={closeManagerModal} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading && fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
              <Loader2 className="animate-spin" size={32} />
              <p>جاري تحميل الحقول...</p>
            </div>
          ) : (
            <>
              {/* Field List */}
              <div className="space-y-3">
                {fields.map((field) => (
                  <div 
                    key={field.id}
                    className="flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl group transition-all hover:border-slate-600"
                  >
                    <div className="text-slate-600 cursor-grab active:cursor-grabbing">
                      <GripVertical size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-400">
                          {FIELD_TYPES.find(t => t.type === field.type)?.icon}
                        </span>
                        <h3 className="text-sm font-medium text-slate-200 truncate">{field.name}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={field.showOnCard}
                            onChange={(e) => updateField(field.id, { showOnCard: e.target.checked })}
                            className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500/20"
                          />
                          عرض على البطاقة
                        </label>
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteField(field.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {fields.length === 0 && !isAdding && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
                    <p className="text-slate-500 text-sm">لا توجد حقول مخصصة لهذه القائمة</p>
                  </div>
                )}
              </div>

              {/* Add New Field UI */}
              {isAdding ? (
                <div className="p-5 bg-slate-800/80 border border-sky-500/30 rounded-2xl animate-in slide-in-from-top-2 duration-200">
                  <h4 className="text-sm font-medium text-slate-200 mb-4 flex items-center gap-2">
                    <Plus size={16} className="text-sky-400" />
                    حقل جديد
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1.5 block">اسم الحقل</label>
                      <input 
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="مثال: الميزانية، التاريخ الفعلي..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1.5 block">نوع الحقل</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {FIELD_TYPES.map((t) => (
                          <button
                            key={t.type}
                            onClick={() => setNewType(t.type)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                              newType === t.type
                                ? 'bg-sky-500/10 border-sky-500/50 text-sky-400'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            {t.icon}
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={handleAdd}
                        disabled={!newName.trim()}
                        className="flex-1 bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Save size={14} />
                        إضافة الحقل
                      </button>
                      <button 
                        onClick={() => setIsAdding(false)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAdding(true)}
                  className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-800/20 text-slate-400 hover:text-slate-300 rounded-2xl transition-all"
                >
                  <Plus size={18} />
                  إضافة حقل جديد
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 text-right">
          <button 
            onClick={closeManagerModal}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
}
