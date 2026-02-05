import { useState, useEffect } from 'react';
import { X, FileText, ChevronRight } from 'lucide-react';
import { useListStore } from '../../store/useListStore';

export function CreateListModal() {
  const { isCreateModalOpen, closeCreateModal, createList, contextParentId } = useListStore();
  const [name, setName] = useState('');
  const [fromTemplate, setFromTemplate] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | undefined>(undefined);

  // Mock templates for dropdown (could use listService.getTemplates)
  const templates = [
    { name: 'Kanban Board', index: 0 },
    { name: 'Bug Tracking', index: 1 },
    { name: 'Content Calendar', index: 2 },
  ];

  useEffect(() => {
    if (isCreateModalOpen) {
      setName('');
      setFromTemplate(false);
      setSelectedTemplateIndex(undefined);
    }
  }, [isCreateModalOpen]);

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createList(name, contextParentId, fromTemplate ? selectedTemplateIndex : undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">

        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
          <h3 className="font-semibold text-slate-200">إنشاء قائمة جديدة</h3>
          <button onClick={closeCreateModal} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <form id="create-list-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                اسم القائمة
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="أدخل اسم القائمة..."
                autoFocus
              />
            </div>

            {/* Template Selection Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setFromTemplate(!fromTemplate)}
                className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ChevronRight size={14} className={`transform transition-transform ${fromTemplate ? 'rotate-90' : ''}`} />
                <span>استخدام قالب</span>
              </button>

              {fromTemplate && (
                <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 gap-2">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.index}
                        type="button"
                        onClick={() => setSelectedTemplateIndex(tpl.index)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md border text-left transition-all ${selectedTemplateIndex === tpl.index
                            ? 'bg-blue-500/10 border-blue-500/50 text-blue-100'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                      >
                        <FileText size={16} />
                        <span className="text-sm">{tpl.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </form>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 bg-slate-800/50 border-t border-slate-800">
          <button
            onClick={closeCreateModal}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            إلغاء
          </button>

          <button
            type="submit"
            form="create-list-form"
            disabled={!name.trim() || (fromTemplate && selectedTemplateIndex === undefined)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إنشاء القائمة
          </button>
        </div>
      </div>
    </div>
  );
}
