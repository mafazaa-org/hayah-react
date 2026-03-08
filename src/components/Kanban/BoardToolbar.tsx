import { RefreshCw, Plus, LayoutGrid, Filter, X, Search, Users, Download, Upload, FileStack } from 'lucide-react';
import { SortDropdown, type SortOptions } from './SortDropdown';
import { BulkActionsMenu } from './BulkActionsMenu';
import { FilterPanel, type FilterOptions } from './FilterPanel';
import type { Column } from '../../types/task';

interface BoardToolbarProps {
  // Existing
  onRefresh: () => void;
  onAddColumn: () => void;
  onAddTask: () => void;
  viewDensity: 'compact' | 'comfortable';
  onToggleDensity: () => void;

  // Filter
  isFilterOpen: boolean;
  onToggleFilter: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableTags: string[];
  onClearFilters: () => void;
  filterColumns: Column[];
  listId: string;

  // Sort
  currentSort: SortOptions;
  onSortChange: (sort: SortOptions) => void;

  // Search
  searchQuery: string;
  onSearchChange: (value: string) => void;

  // Bulk actions
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkMove: () => void;
  onBulkChangePriority: () => void;
  onClearSelection: () => void;

  // Sharing
  onShareClick: () => void;
  activeMembers?: Array<{ id: string; avatar?: string; name: string }>;

  // Export & Import modal triggers
  onExportClick: () => void;
  onImportClick: () => void;

  // Templates
  onListTemplatesClick: () => void;
  onTaskTemplatesClick: () => void;
}

export function BoardToolbar({
  onRefresh,
  onAddColumn,
  onAddTask,
  viewDensity,
  onToggleDensity,
  isFilterOpen,
  onToggleFilter,
  hasActiveFilters,
  activeFilterCount,
  filters,
  onFiltersChange,
  availableTags,
  onClearFilters,
  filterColumns,
  listId,
  currentSort,
  onSortChange,
  searchQuery,
  onSearchChange,
  selectedCount,
  onBulkDelete,
  onBulkMove,
  onBulkChangePriority,
  onClearSelection,
  onShareClick,
  activeMembers = [],
  onExportClick,
  onImportClick,
  onListTemplatesClick,
  onTaskTemplatesClick,
}: BoardToolbarProps) {
  return (
    <div className="relative mb-4 px-2">
      <div className="flex items-center justify-between">
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
            aria-label="تحديث"
          >
            <RefreshCw size={16} />
            تحديث
          </button>

          <button
            onClick={onToggleDensity}
            className="px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
            aria-label="كثافة العرض"
          >
            <LayoutGrid size={16} />
            {viewDensity === 'compact' ? 'مريح' : 'مضغوط'}
          </button>

          {/* Filter Toggle */}
          <button
            onClick={onToggleFilter}
            className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${hasActiveFilters
              ? 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30'
              : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
              }`}
            aria-label="تصفية"
          >
            <Filter size={16} />
            تصفية
            {hasActiveFilters && (
              <span className="min-w-5 h-5 flex items-center justify-center bg-sky-500 text-white text-xs rounded-full px-1">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
              aria-label="مسح التصفية"
            >
              <X size={16} />
              مسح التصفية
            </button>
          )}

          {/* Sort Dropdown */}
          <SortDropdown currentSort={currentSort} onSortChange={onSortChange} />

          {/* In-board Search */}
          <div className="relative ml-2 hidden md:block">
            <Search
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="بحث في هذه اللوحة..."
              className="w-40 bg-slate-900 border border-slate-700 rounded-lg py-1.5 pr-7 pl-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Bulk Actions (visible only when tasks selected) */}
          <BulkActionsMenu
            selectedCount={selectedCount}
            onDelete={onBulkDelete}
            onMove={onBulkMove}
            onChangePriority={onBulkChangePriority}
            onClearSelection={onClearSelection}
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">

          {/* Active Members Stack (Presence) */}
          {activeMembers.length > 0 && (
            <div className="hidden sm:flex items-center -space-x-2 space-x-reverse mr-2">
              {activeMembers.slice(0, 3).map((member, i) => (
                <div
                  key={member.id}
                  className={`w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] text-white overflow-hidden relative z-[${10 - i}]`}
                  title={`${member.name} (متصل)`}
                >
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.name.charAt(0)
                  )}
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-slate-900 rounded-full"></span>
                </div>
              ))}
              {activeMembers.length > 3 && (
                <div className="w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 relative z-0">
                  +{activeMembers.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={onShareClick}
            className="px-3 py-2 text-sm text-slate-300 hover:text-slate-100 ring-1 ring-slate-700 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
          >
            <Users size={16} />
            مشاركة
          </button>

          {/* Export Button */}
          <button
            onClick={onExportClick}
            className="px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            تصدير
          </button>

          {/* Import Button */}
          <button
            onClick={onImportClick}
            className="px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
          >
            <Upload size={16} />
            استيراد
          </button>

          {/* Templates Button */}
          <button
            onClick={onListTemplatesClick}
            className="px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
          >
            <FileStack size={16} />
            قوالب
          </button>

          <button
            onClick={onAddColumn}
            className="px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            إضافة عمود
          </button>

          {/* Add Task from Template */}
          <button
            onClick={onTaskTemplatesClick}
            className="px-3 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-2"
          >
            <FileStack size={16} />
            مهمة من قالب
          </button>

          <button
            onClick={onAddTask}
            className="px-3 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            إضافة مهمة
          </button>
        </div>
      </div>

      {/* Filter Panel (collapsible) */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={onToggleFilter}
        filters={filters}
        onFiltersChange={onFiltersChange}
        availableTags={availableTags}
        columns={filterColumns}
        listId={listId}
      />
    </div>
  );
}
