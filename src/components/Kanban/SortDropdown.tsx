import { useState } from 'react';
import { ArrowUpDown, Check } from 'lucide-react';

export type SortField =
  | 'dueDate'
  | 'priority'
  | 'createdAt'
  | 'title'
  | 'assignee'
  | 'customFields';
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

interface SortDropdownProps {
  currentSort: SortOptions;
  onSortChange: (sort: SortOptions) => void;
}

const SORT_OPTIONS: Array<{ field: SortField; label: string }> = [
  { field: 'dueDate', label: 'الموعد النهائي' },
  { field: 'priority', label: 'الأولوية' },
  { field: 'createdAt', label: 'تاريخ الإنشاء' },
  { field: 'title', label: 'الاسم (أبجدي)' },
  { field: 'assignee', label: 'المسؤول' },
  { field: 'customFields', label: 'الحقول المخصصة' }
];

export function SortDropdown({ currentSort, onSortChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSortChange = (field: SortField) => {
    // If same field, toggle direction
    if (currentSort.field === field) {
      onSortChange({
        field,
        direction: currentSort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // New field, default to ascending
      onSortChange({ field, direction: 'asc' });
    }
    setIsOpen(false);
  };

  const currentLabel = SORT_OPTIONS.find(opt => opt.field === currentSort.field)?.label || 'الترتيب';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
      >
        <ArrowUpDown size={16} />
        <span>{currentLabel}</span>
        <span className="text-xs text-slate-500">
          ({currentSort.direction === 'asc' ? '↑' : '↓'})
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute left-0 top-12 z-50 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl min-w-[200px]">
            <div className="p-2">
              {SORT_OPTIONS.map(option => (
                <button
                  key={option.field}
                  onClick={() => handleSortChange(option.field)}
                  className={`
                    w-full px-3 py-2 text-sm rounded-lg transition-colors text-right
                    flex items-center justify-between
                    ${currentSort.field === option.field
                      ? 'bg-slate-800 text-slate-100'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                    }
                  `}
                >
                  <span>{option.label}</span>
                  {currentSort.field === option.field && (
                    <div className="flex items-center gap-1">
                      <Check size={14} className="text-sky-500" />
                      <span className="text-xs text-slate-500">
                        {currentSort.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
