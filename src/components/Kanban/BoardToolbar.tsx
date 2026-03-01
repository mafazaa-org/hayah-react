import { RefreshCw, Plus, LayoutGrid, Filter, X, Search } from 'lucide-react';
import { SortDropdown, type SortOptions } from './SortDropdown';
import { ExportMenu } from './ExportMenu';
import { BulkActionsMenu } from './BulkActionsMenu';
import { FilterPanel, type FilterOptions } from './FilterPanel';
import type { Task, Column } from '../../types/task';

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

  // Export
  tasks: Task[];
  columns: Column[];

  // Bulk actions
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkMove: () => void;
  onBulkChangePriority: () => void;
  onClearSelection: () => void;
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
  tasks,
  columns,
  selectedCount,
  onBulkDelete,
  onBulkMove,
  onBulkChangePriority,
  onClearSelection
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
          {/* Export Menu */}
          <ExportMenu tasks={tasks} columns={columns} />

          <button
            onClick={onAddColumn}
            className="px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            إضافة عمود
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
