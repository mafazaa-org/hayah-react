import { useState, useEffect } from 'react';
import { Filter, X, Search } from 'lucide-react';
import type { Task } from '../../types/task';
import type { Column } from '../../types/task';
import { FilterPresetManager } from './FilterPresetManager';
import { useCustomFieldStore } from '../../store/useCustomFieldStore';

export interface FilterOptions {
  priorities: Array<Task['priority']>;
  tags: string[];
  statuses: string[];
  assignees: string[];
  hasAssignee: boolean | null;
  dueDateRange: 'overdue' | 'today' | 'week' | 'month' | null;
  /**
   * Simple custom-field filters. For now this is a basic
   * key/value pair list that matches against Task.customFields.
   */
  customFields: Array<{ key: string; value: string }>;
  /**
   * How multiple active filter types are combined.
   * AND = task must match all active filters.
   * OR  = task may match any active filter.
   */
  matchMode: 'AND' | 'OR';
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableTags: string[];
  columns: Column[];
  listId: string;
}

const PRIORITY_OPTIONS: Array<{ value: Task['priority']; label: string; color: string }> = [
  { value: 'low', label: 'منخفضة', color: '#64748b' },
  { value: 'medium', label: 'متوسطة', color: '#3b82f6' },
  { value: 'high', label: 'عالية', color: '#f59e0b' },
  { value: 'critical', label: 'حرجة', color: '#ef4444' }
];

const DUE_DATE_OPTIONS = [
  { value: 'overdue' as const, label: 'متأخرة' },
  { value: 'today' as const, label: 'اليوم' },
  { value: 'week' as const, label: 'هذا الأسبوع' },
  { value: 'month' as const, label: 'هذا الشهر' }
];

// Mock assignees for demonstration (future: fetch from API)
const MOCK_ASSIGNEES = [
  { id: 'user-1', name: 'أحمد محمد' },
  { id: 'user-2', name: 'سارة علي' },
  { id: 'user-3', name: 'محمد خالد' },
  { id: 'user-4', name: 'فاطمة حسن' },
  { id: 'user-5', name: 'يوسف عمر' }
];

/** Compute human-readable labels for each active filter */
function getActiveFilterChips(filters: FilterOptions, columns: Column[]): Array<{ key: string; label: string }> {
  const chips: Array<{ key: string; label: string }> = [];

  filters.priorities.forEach(p => {
    const opt = PRIORITY_OPTIONS.find(o => o.value === p);
    if (opt) chips.push({ key: `priority-${p}`, label: `الأولوية: ${opt.label}` });
  });

  filters.statuses.forEach(s => {
    const col = columns.find(c => c.id === s);
    if (col) chips.push({ key: `status-${s}`, label: `الحالة: ${col.name}` });
  });

  filters.assignees.forEach(a => {
    const user = MOCK_ASSIGNEES.find(u => u.id === a);
    if (user) chips.push({ key: `assignee-${a}`, label: `المسؤول: ${user.name}` });
  });

  filters.tags.forEach(t => {
    chips.push({ key: `tag-${t}`, label: `وسم: ${t}` });
  });

  if (filters.dueDateRange) {
    const opt = DUE_DATE_OPTIONS.find(o => o.value === filters.dueDateRange);
    if (opt) chips.push({ key: 'dueDate', label: `الموعد: ${opt.label}` });
  }

  if (filters.hasAssignee === true) {
    chips.push({ key: 'hasAssignee', label: 'لديه مسؤول' });
  } else if (filters.hasAssignee === false) {
    chips.push({ key: 'hasAssignee', label: 'بدون مسؤول' });
  }

  // Custom field filters
  filters.customFields.forEach((cf, index) => {
    if (!cf.key || !cf.value) return;
    const fieldDef = useCustomFieldStore.getState().fields.find(f => f.id === cf.key);
    const fieldName = fieldDef ? fieldDef.name : cf.key;
    
    let displayValue = cf.value;
    if (fieldDef?.type === 'checkbox') {
      displayValue = cf.value === 'true' ? 'نعم' : 'لا';
    } else if (fieldDef?.type === 'select') {
      const option = fieldDef.options?.find(o => o.id === cf.value || o.value === cf.value);
      if (option) displayValue = option.value;
    }

    chips.push({
      key: `custom-${index}`,
      label: `حقل مخصص: ${fieldName} = ${displayValue}`
    });
  });

  return chips;
}

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableTags,
  columns,
  listId
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [assigneeSearch, setAssigneeSearch] = useState('');

  // Sync local filters with external changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const togglePriority = (priority: Task['priority']) => {
    const newPriorities = localFilters.priorities.includes(priority)
      ? localFilters.priorities.filter(p => p !== priority)
      : [...localFilters.priorities, priority];
    setLocalFilters({ ...localFilters, priorities: newPriorities });
  };

  const toggleStatus = (statusId: string) => {
    const newStatuses = localFilters.statuses.includes(statusId)
      ? localFilters.statuses.filter(s => s !== statusId)
      : [...localFilters.statuses, statusId];
    setLocalFilters({ ...localFilters, statuses: newStatuses });
  };

  const toggleAssignee = (assigneeId: string) => {
    const newAssignees = localFilters.assignees.includes(assigneeId)
      ? localFilters.assignees.filter(a => a !== assigneeId)
      : [...localFilters.assignees, assigneeId];
    setLocalFilters({ ...localFilters, assignees: newAssignees });
  };

  const toggleTag = (tag: string) => {
    const newTags = localFilters.tags.includes(tag)
      ? localFilters.tags.filter(t => t !== tag)
      : [...localFilters.tags, tag];
    setLocalFilters({ ...localFilters, tags: newTags });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClear = () => {
    const emptyFilters: FilterOptions = {
      priorities: [],
      tags: [],
      statuses: [],
      assignees: [],
      hasAssignee: null,
      dueDateRange: null,
      customFields: [],
      matchMode: 'AND'
    };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  /** Remove a single filter chip */
  const removeChip = (chipKey: string) => {
    const updated = { ...localFilters };

    if (chipKey.startsWith('priority-')) {
      const val = chipKey.replace('priority-', '');
      updated.priorities = updated.priorities.filter(p => p !== val);
    } else if (chipKey.startsWith('status-')) {
      const val = chipKey.replace('status-', '');
      updated.statuses = updated.statuses.filter(s => s !== val);
    } else if (chipKey.startsWith('assignee-')) {
      const val = chipKey.replace('assignee-', '');
      updated.assignees = updated.assignees.filter(a => a !== val);
    } else if (chipKey.startsWith('tag-')) {
      const val = chipKey.replace('tag-', '');
      updated.tags = updated.tags.filter(t => t !== val);
    } else if (chipKey === 'dueDate') {
      updated.dueDateRange = null;
    } else if (chipKey === 'hasAssignee') {
      updated.hasAssignee = null;
    } else if (chipKey.startsWith('custom-')) {
      const index = parseInt(chipKey.replace('custom-', ''), 10);
      if (!Number.isNaN(index)) {
        updated.customFields = updated.customFields.filter((_, i) => i !== index);
      }
    }

    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const filteredAssignees = MOCK_ASSIGNEES.filter(a =>
    a.name.toLowerCase().includes(assigneeSearch.toLowerCase())
  );

  const activeChips = getActiveFilterChips(localFilters, columns);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute left-0 top-12 z-50 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-96 max-h-[520px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <h3 className="font-semibold text-slate-100">التصفية</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pt-3">
            {activeChips.map(chip => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30"
              >
                {chip.label}
                <button
                  onClick={() => removeChip(chip.key)}
                  className="hover:text-sky-200 transition-colors"
                  aria-label={`إزالة ${chip.label}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Scrollable Filters */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* Match mode (AND / OR) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              منطق التصفية
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="matchMode"
                  checked={localFilters.matchMode === 'AND'}
                  onChange={() => setLocalFilters({ ...localFilters, matchMode: 'AND' })}
                  className="border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-sm text-slate-300">مطابقة جميع الشروط (AND)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="matchMode"
                  checked={localFilters.matchMode === 'OR'}
                  onChange={() => setLocalFilters({ ...localFilters, matchMode: 'OR' })}
                  className="border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-sm text-slate-300">مطابقة أي شرط (OR)</span>
              </label>
            </div>
          </div>

          {/* Status Filter */}
          {columns.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">الحالة</label>
              <div className="space-y-2">
                {columns.map(col => (
                  <label key={col.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.statuses.includes(col.id)}
                      onChange={() => toggleStatus(col.id)}
                      className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
                      <span className="text-sm text-slate-300">{col.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">الأولوية</label>
            <div className="space-y-2">
              {PRIORITY_OPTIONS.map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.priorities.includes(option.value)}
                    onChange={() => togglePriority(option.value)}
                    className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500"
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }} />
                    <span className="text-sm text-slate-300">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">المسؤول</label>
            {/* Search */}
            <div className="relative mb-2">
              <Search size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={assigneeSearch}
                onChange={(e) => setAssigneeSearch(e.target.value)}
                placeholder="بحث عن مسؤول..."
                className="w-full pr-7 pl-2 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {filteredAssignees.map(assignee => (
                <label key={assignee.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.assignees.includes(assignee.id)}
                    onChange={() => toggleAssignee(assignee.id)}
                    className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-300">{assignee.name}</span>
                </label>
              ))}
              {filteredAssignees.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-1">لا توجد نتائج</p>
              )}
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">الوسوم</label>
              <div className="space-y-2">
                {availableTags.map(tag => (
                  <label key={tag} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.tags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                      className="rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-sm text-slate-300">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Custom Fields Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">الحقول المخصصة</label>
            <p className="text-xs text-slate-500 mb-2">
              تصفية المهام بناءً على الحقول المخصصة المعرّفة في هذه القائمة.
            </p>
            <div className="space-y-2">
              {localFilters.customFields.map((cf, index) => {
                const fieldDef = useCustomFieldStore.getState().fields.find(f => f.id === cf.key);
                
                return (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={cf.key}
                      onChange={(e) => {
                        const updated = [...localFilters.customFields];
                        updated[index] = { ...updated[index], key: e.target.value, value: '' };
                        setLocalFilters({ ...localFilters, customFields: updated });
                      }}
                      className="w-1/3 px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      <option value="">-- اختر حقل --</option>
                      {useCustomFieldStore.getState().fields.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                    
                    <span className="text-slate-500 text-xs">=</span>
                    
                    {fieldDef?.type === 'checkbox' ? (
                      <select
                        value={cf.value}
                        onChange={(e) => {
                          const updated = [...localFilters.customFields];
                          updated[index] = { ...updated[index], value: e.target.value };
                          setLocalFilters({ ...localFilters, customFields: updated });
                        }}
                        className="flex-1 px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="">الكل</option>
                        <option value="true">نعم</option>
                        <option value="false">لا</option>
                      </select>
                    ) : fieldDef?.type === 'select' ? (
                      <select
                        value={cf.value}
                        onChange={(e) => {
                          const updated = [...localFilters.customFields];
                          updated[index] = { ...updated[index], value: e.target.value };
                          setLocalFilters({ ...localFilters, customFields: updated });
                        }}
                        className="flex-1 px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="">كل الخيارات</option>
                        {fieldDef.options?.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.value}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={fieldDef?.type === 'number' ? 'number' : fieldDef?.type === 'date' ? 'date' : 'text'}
                        value={cf.value}
                        onChange={(e) => {
                          const updated = [...localFilters.customFields];
                          updated[index] = { ...updated[index], value: e.target.value };
                          setLocalFilters({ ...localFilters, customFields: updated });
                        }}
                        placeholder="القيمة"
                        className="flex-1 px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const updated = localFilters.customFields.filter((_, i) => i !== index);
                        setLocalFilters({ ...localFilters, customFields: updated });
                      }}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      aria-label="إزالة شرط الحقل المخصص"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() =>
                  setLocalFilters({
                    ...localFilters,
                    customFields: [...localFilters.customFields, { key: '', value: '' }]
                  })
                }
                className="mt-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
              >
                + إضافة شرط حقل مخصص
              </button>
            </div>
          </div>

          {/* Due Date Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">الموعد النهائي</label>
            <div className="space-y-2">
              {DUE_DATE_OPTIONS.map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dueDate"
                    checked={localFilters.dueDateRange === option.value}
                    onChange={() => setLocalFilters({ ...localFilters, dueDateRange: option.value })}
                    className="border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-300">{option.label}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dueDate"
                  checked={localFilters.dueDateRange === null}
                  onChange={() => setLocalFilters({ ...localFilters, dueDateRange: null })}
                  className="border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-sm text-slate-300">الكل</span>
              </label>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-slate-800" />

          {/* Filter Presets */}
          <FilterPresetManager
            listId={listId}
            currentFilters={localFilters}
            onLoadPreset={(loaded) => {
              setLocalFilters(loaded);
              onFiltersChange(loaded);
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-slate-800">
          <button
            onClick={handleClear}
            className="flex-1 px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            مسح الكل
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-3 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
          >
            تطبيق
          </button>
        </div>
      </div>
    </>
  );
}
