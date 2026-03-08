import { useState, useEffect } from 'react';
import {
  X, LayoutDashboard, Bug, CalendarDays, Zap, User,
  FileStack, Plus, Trash2, Loader2, Columns3, Save
} from 'lucide-react';
import { useTemplateStore } from '../../store/useTemplateStore';
import type { ListTemplate, TemplateCategory } from '../../types/template';

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={24} />,
  Bug: <Bug size={24} />,
  CalendarDays: <CalendarDays size={24} />,
  Zap: <Zap size={24} />,
  User: <User size={24} />,
  FileStack: <FileStack size={24} />,
};

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  project: 'مشاريع',
  personal: 'شخصي',
  team: 'فريق',
  custom: 'مخصّص',
};

type Tab = 'browse' | 'save';

export function ListTemplatesModal() {
  const {
    isListTemplatesModalOpen,
    closeListTemplatesModal,
    listTemplates,
    isLoading,
    createListFromTemplate,
    saveListAsTemplate,
    deleteTemplate,
  } = useTemplateStore();

  const [tab, setTab] = useState<Tab>('browse');
  const [selectedTemplate, setSelectedTemplate] = useState<ListTemplate | null>(null);
  const [newListName, setNewListName] = useState('');
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [saveTemplateDesc, setSaveTemplateDesc] = useState('');
  const [filterCategory, setFilterCategory] = useState<TemplateCategory | 'all'>('all');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isListTemplatesModalOpen) {
      setTab('browse');
      setSelectedTemplate(null);
      setNewListName('');
      setSaveTemplateName('');
      setSaveTemplateDesc('');
      setFilterCategory('all');
    }
  }, [isListTemplatesModalOpen]);

  if (!isListTemplatesModalOpen) return null;

  const filteredTemplates = filterCategory === 'all'
    ? listTemplates
    : listTemplates.filter(t => t.category === filterCategory);

  const handleCreate = async () => {
    if (!selectedTemplate || !newListName.trim()) return;
    await createListFromTemplate(selectedTemplate.id, newListName.trim(), null);
  };

  const handleSave = async () => {
    if (!saveTemplateName.trim()) return;
    await saveListAsTemplate('current-list', saveTemplateName.trim(), saveTemplateDesc.trim());
    setSaveTemplateName('');
    setSaveTemplateDesc('');
    setTab('browse');
  };

  const categories: (TemplateCategory | 'all')[] = ['all', 'project', 'team', 'personal', 'custom'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeListTemplatesModal} />

      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <FileStack size={20} className="text-sky-400" />
            قوالب القوائم
          </h2>
          <button onClick={closeListTemplatesModal} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 shrink-0">
          <button
            onClick={() => setTab('browse')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              tab === 'browse'
                ? 'text-sky-400 border-b-2 border-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            استعراض القوالب
          </button>
          <button
            onClick={() => setTab('save')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              tab === 'save'
                ? 'text-sky-400 border-b-2 border-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            حفظ كقالب
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="text-sky-400 animate-spin" />
            </div>
          )}

          {!isLoading && tab === 'browse' && (
            <div className="space-y-5">
              {/* Category Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      filterCategory === cat
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {cat === 'all' ? 'الكل' : CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => { setSelectedTemplate(template); setNewListName(template.name); }}
                    className={`p-4 rounded-xl border text-right transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/30'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: template.color + '20', color: template.color }}
                      >
                        {ICON_MAP[template.icon] || <FileStack size={24} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-slate-200 mb-1">{template.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2">{template.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Columns3 size={12} className="text-slate-600" />
                          <span className="text-xs text-slate-500">{template.columns.length} أعمدة</span>
                          {!template.isBuiltIn && (
                            <span className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">مخصّص</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Template Preview */}
              {selectedTemplate && (
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-200">معاينة: {selectedTemplate.name}</h3>
                    {!selectedTemplate.isBuiltIn && (
                      <button
                        onClick={() => { deleteTemplate(selectedTemplate.id, 'list'); setSelectedTemplate(null); }}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="حذف القالب"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedTemplate.columns.map((col, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-700"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                        <span className="text-xs text-slate-300">{col.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Create from Template */}
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="text"
                      value={newListName}
                      onChange={e => setNewListName(e.target.value)}
                      placeholder="اسم القائمة الجديدة"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <button
                      onClick={handleCreate}
                      disabled={!newListName.trim() || isLoading}
                      className="px-4 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Plus size={16} />
                      إنشاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && tab === 'save' && (
            <div className="space-y-4 max-w-md mx-auto">
              <p className="text-sm text-slate-400 text-center">
                احفظ القائمة الحالية كقالب لاستخدامه لاحقاً
              </p>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">اسم القالب</label>
                <input
                  type="text"
                  value={saveTemplateName}
                  onChange={e => setSaveTemplateName(e.target.value)}
                  placeholder="مثال: قالب مشروع تصميم"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">وصف القالب</label>
                <textarea
                  value={saveTemplateDesc}
                  onChange={e => setSaveTemplateDesc(e.target.value)}
                  placeholder="وصف مختصر للقالب..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={!saveTemplateName.trim() || isLoading}
                className="w-full px-4 py-2.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save size={16} />
                حفظ كقالب
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end shrink-0">
          <button
            onClick={closeListTemplatesModal}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
