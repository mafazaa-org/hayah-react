import { useState, useEffect } from 'react';
import {
  X, FileText, Plus, Trash2, Loader2, Flag, Tag, CheckSquare, Save
} from 'lucide-react';
import { useTemplateStore } from '../../store/useTemplateStore';
import type { TaskTemplate, TemplateCategory } from '../../types/template';

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: 'منخفضة', color: 'bg-slate-500' },
  medium: { label: 'متوسطة', color: 'bg-blue-500' },
  high: { label: 'عالية', color: 'bg-amber-500' },
  critical: { label: 'حرجة', color: 'bg-red-500' },
};

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  project: 'مشاريع',
  personal: 'شخصي',
  team: 'فريق',
  custom: 'مخصّص',
};

type Tab = 'browse' | 'save';

interface TaskTemplatesModalProps {
  listId: string;
  defaultColumnId: string;
  onTaskCreated: (taskId: string) => void;
}

export function TaskTemplatesModal({ listId, defaultColumnId, onTaskCreated }: TaskTemplatesModalProps) {
  const {
    isTaskTemplatesModalOpen,
    closeTaskTemplatesModal,
    taskTemplates,
    isLoading,
    createTaskFromTemplate,
    saveTaskAsTemplate,
    deleteTemplate,
  } = useTemplateStore();

  const [tab, setTab] = useState<Tab>('browse');
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [filterCategory, setFilterCategory] = useState<TemplateCategory | 'all'>('all');
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [saveTemplateDesc, setSaveTemplateDesc] = useState('');

  useEffect(() => {
    if (isTaskTemplatesModalOpen) {
      setTab('browse');
      setSelectedTemplate(null);
      setFilterCategory('all');
      setSaveTemplateName('');
      setSaveTemplateDesc('');
    }
  }, [isTaskTemplatesModalOpen]);

  if (!isTaskTemplatesModalOpen) return null;

  const filteredTemplates = filterCategory === 'all'
    ? taskTemplates
    : taskTemplates.filter(t => t.category === filterCategory);

  const handleCreateFromTemplate = async (template: TaskTemplate) => {
    const task = await createTaskFromTemplate(template.id, listId, defaultColumnId);
    if (task) {
      onTaskCreated(task.id);
    }
  };

  const handleSave = async () => {
    if (!saveTemplateName.trim()) return;
    await saveTaskAsTemplate('current-task', saveTemplateName.trim(), saveTemplateDesc.trim());
    setSaveTemplateName('');
    setSaveTemplateDesc('');
    setTab('browse');
  };

  const categories: (TemplateCategory | 'all')[] = ['all', 'project', 'team', 'personal', 'custom'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeTaskTemplatesModal} />

      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <FileText size={20} className="text-emerald-400" />
            قوالب المهام
          </h2>
          <button onClick={closeTaskTemplatesModal} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 shrink-0">
          <button
            onClick={() => setTab('browse')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              tab === 'browse'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            استعراض القوالب
          </button>
          <button
            onClick={() => setTab('save')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              tab === 'save'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
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
              <Loader2 size={32} className="text-emerald-400 animate-spin" />
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
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {cat === 'all' ? 'الكل' : CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-1 gap-3">
                {filteredTemplates.map(template => {
                  const isSelected = selectedTemplate?.id === template.id;
                  const priority = PRIORITY_LABELS[template.defaultPriority];

                  return (
                    <div
                      key={template.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/30'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          onClick={() => setSelectedTemplate(isSelected ? null : template)}
                          className="flex-1 text-right"
                        >
                          <h3 className="text-sm font-medium text-slate-200 mb-1">{template.name}</h3>
                          <p className="text-xs text-slate-500 mb-2">{template.description}</p>

                          {/* Meta */}
                          <div className="flex items-center gap-3 flex-wrap">
                            {/* Priority */}
                            <div className="flex items-center gap-1.5">
                              <Flag size={12} className="text-slate-500" />
                              <span className={`w-2 h-2 rounded-full ${priority.color}`} />
                              <span className="text-xs text-slate-400">{priority.label}</span>
                            </div>

                            {/* Tags */}
                            {template.defaultTags.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <Tag size={12} className="text-slate-500" />
                                <span className="text-xs text-slate-400">
                                  {template.defaultTags.join('، ')}
                                </span>
                              </div>
                            )}

                            {/* Checklist */}
                            {template.checklist.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <CheckSquare size={12} className="text-slate-500" />
                                <span className="text-xs text-slate-400">
                                  {template.checklist.length} عنصر
                                </span>
                              </div>
                            )}

                            {!template.isBuiltIn && (
                              <span className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">مخصّص</span>
                            )}
                          </div>
                        </button>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleCreateFromTemplate(template)}
                            className="px-3 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-1"
                            title="إنشاء مهمة"
                          >
                            <Plus size={14} />
                            استخدام
                          </button>
                          {!template.isBuiltIn && (
                            <button
                              onClick={() => { deleteTemplate(template.id, 'task'); if (isSelected) setSelectedTemplate(null); }}
                              className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="حذف القالب"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Checklist Preview */}
                      {isSelected && template.checklist.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <h4 className="text-xs font-medium text-slate-400 mb-2">قائمة التحقق:</h4>
                          <div className="space-y-1">
                            {template.checklist.map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                                <div className="w-3.5 h-3.5 rounded border border-slate-600 shrink-0" />
                                {item.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isLoading && tab === 'save' && (
            <div className="space-y-4 max-w-md mx-auto">
              <p className="text-sm text-slate-400 text-center">
                احفظ مهمة كقالب لاستخدامها لاحقاً عند إنشاء مهام مماثلة
              </p>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">اسم القالب</label>
                <input
                  type="text"
                  value={saveTemplateName}
                  onChange={e => setSaveTemplateName(e.target.value)}
                  placeholder="مثال: قالب مراجعة تصميم"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">وصف القالب</label>
                <textarea
                  value={saveTemplateDesc}
                  onChange={e => setSaveTemplateDesc(e.target.value)}
                  placeholder="وصف مختصر للقالب..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
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
            onClick={closeTaskTemplatesModal}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
