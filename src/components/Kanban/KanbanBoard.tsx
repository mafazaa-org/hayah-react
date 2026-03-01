import { useEffect, useState, useMemo } from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useColumnStore } from '../../store/useColumnStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useViewStore } from '../../store/useViewStore';
import { KanbanColumn } from './KanbanColumn';
import { BoardToolbar } from './BoardToolbar';
import { TaskDetailModal } from '../Task/TaskDetailModal';
import type { Task } from '../../types/task';

interface KanbanBoardProps {
  listId: string;
}

export function KanbanBoard({ listId }: KanbanBoardProps) {
  const { columns, fetchColumns, reorderColumns, openColumnModal } = useColumnStore();
  const {
    fetchTasks,
    moveTask,
    openCreateTaskModal,
    // Filter & Sort
    filters,
    sort,
    setFilters,
    setSort,
    clearFilters,
    // Search
    searchQuery,
    setSearchQuery,
    hasActiveFilters,
    getFilteredAndSortedTasks,
    getAvailableTags,
    // Selection
    selectedTaskIds,
    clearSelection,
    bulkDeleteTasks,
  } = useTaskStore();
  const { getViewConfig, updateViewSettings } = useViewStore();

  const [viewDensity, setViewDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [debouncedFilteredTasks, setDebouncedFilteredTasks] = useState<Task[]>([]);
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    // Fetch columns first
    fetchColumns(listId).then(() => {
      // Then fetch tasks with column IDs
      const columnIds = columns.map(col => col.id);
      if (columnIds.length > 0) {
        fetchTasks(listId, columnIds);
      }
    });
  }, [listId]);

  // Refresh data when columns change
  useEffect(() => {
    if (columns.length > 0) {
      const columnIds = columns.map(col => col.id);
      fetchTasks(listId, columnIds);
    }
  }, [columns.length]);

  // Compute active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priorities.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.assignees.length > 0) count++;
    if (filters.hasAssignee !== null) count++;
    if (filters.dueDateRange !== null) count++;
    // Count custom-field conditions as a single active filter group
    if (filters.customFields.length > 0) count++;
    return count;
  }, [filters]);

  // Load saved view settings (density + sort) for this list
  useEffect(() => {
    const config = getViewConfig(listId);
    if (config?.settings) {
      const { density, sortBy, sortDirection } = config.settings;
      if (density === 'compact' || density === 'comfortable') {
        setViewDensity(density);
      }
      if (sortBy && sortDirection) {
        setSort({
          field: sortBy as any,
          direction: sortDirection
        });
      }
    }
  }, [listId, getViewConfig, setSort]);

  // Keep local search input in sync with global searchQuery (e.g. from header)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    const trimmed = value.trimStart();
    // Debounce updates to store-level searchQuery
    // Simple timeout-based debounce scoped to this handler
    window.clearTimeout((handleSearchChange as any)._timeout);
    (handleSearchChange as any)._timeout = window.setTimeout(() => {
      setSearchQuery(trimmed);
    }, 250);
  };

  // Get filtered and sorted tasks for export & bulk actions (debounced to avoid excessive recomputation)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilteredTasks(getFilteredAndSortedTasks());
    }, 250);

    return () => clearTimeout(timeout);
  }, [filters, sort, searchQuery, getFilteredAndSortedTasks]);

  const handleSortChange = (nextSort: typeof sort) => {
    setSort(nextSort);
    const existing = getViewConfig(listId);
    const nextSettings = {
      ...(existing?.settings || {}),
      sortBy: nextSort.field,
      sortDirection: nextSort.direction
    };
    updateViewSettings(listId, nextSettings);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Handle column reordering
    if (type === 'COLUMN') {
      const newColumnOrder = Array.from(columns);
      const [removed] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, removed);

      reorderColumns(listId, newColumnOrder.map(col => col.id));
      return;
    }

    // Handle task movement
    if (type === 'TASK') {
      const taskId = result.draggableId;
      const newStatus = destination.droppableId;
      const newOrder = destination.index;

      moveTask(taskId, newStatus, newOrder);
    }
  };

  const handleRefresh = () => {
    fetchColumns(listId);
    const columnIds = columns.map(col => col.id);
    if (columnIds.length > 0) {
      fetchTasks(listId, columnIds);
    }
  };

  // Bulk action stubs (move & priority need a modal in a future phase)
  const handleBulkMove = () => {
    // TODO: open a column-selection modal for bulk move
    console.log('Bulk move:', Array.from(selectedTaskIds));
  };

  const handleBulkChangePriority = () => {
    // TODO: open a priority-selection modal for bulk priority change
    console.log('Bulk change priority:', Array.from(selectedTaskIds));
  };

  return (
    <div className="h-full flex flex-col">
      <BoardToolbar
        onRefresh={handleRefresh}
        onAddColumn={() => openColumnModal()}
        onAddTask={() => openCreateTaskModal()}
        viewDensity={viewDensity}
        onToggleDensity={() => setViewDensity(prev => prev === 'compact' ? 'comfortable' : 'compact')}
        // Filter
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(prev => !prev)}
        hasActiveFilters={hasActiveFilters()}
        activeFilterCount={activeFilterCount}
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={getAvailableTags()}
        onClearFilters={clearFilters}
        filterColumns={columns}
        listId={listId}
        // Sort
        currentSort={sort}
        onSortChange={handleSortChange}
        // Search
        searchQuery={localSearch}
        onSearchChange={handleSearchChange}
        // Export
        tasks={debouncedFilteredTasks}
        columns={columns}
        // Bulk actions
        selectedCount={selectedTaskIds.size}
        onBulkDelete={bulkDeleteTasks}
        onBulkMove={handleBulkMove}
        onBulkChangePriority={handleBulkChangePriority}
        onClearSelection={clearSelection}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                flex gap-4 overflow-x-auto pb-4 px-2
                ${viewDensity === 'compact' ? 'gap-2' : 'gap-4'}
              `}
            >
              {columns
                .sort((a, b) => a.order - b.order)
                .map((column) => (
                  <KanbanColumn key={column.id} column={column} />
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Task Detail Modal */}
      <TaskDetailModal />
    </div>
  );
}
