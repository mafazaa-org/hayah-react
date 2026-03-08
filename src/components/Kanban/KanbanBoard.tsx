import { useEffect, useState, useMemo } from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useColumnStore } from '../../store/useColumnStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useViewStore } from '../../store/useViewStore';
import { useListStore } from '../../store/useListStore';
import { useTemplateStore } from '../../store/useTemplateStore';
import { KanbanColumn } from './KanbanColumn';
import { BoardToolbar } from './BoardToolbar';
import { ShareListModal } from './ShareListModal';
import { TaskDetailModal } from '../Task/TaskDetailModal';
import { ExportOptionsModal } from '../Export/ExportOptionsModal';
import { ImportModal } from '../Import/ImportModal';
import { BulkActionsBar } from './BulkActionsBar';
import { ListTemplatesModal } from '../Templates/ListTemplatesModal';
import { TaskTemplatesModal } from '../Templates/TaskTemplatesModal';
import { useCustomFieldStore } from '../../store/useCustomFieldStore';
import { CustomFieldManagerModal } from '../CustomFields/CustomFieldManagerModal';
import { IterationManagerModal } from '../Iterations/IterationManagerModal';
import { useIterationStore } from '../../store/useIterationStore';
import type { Task } from '../../types/task';

interface KanbanBoardProps {
  listId: string;
}

export function KanbanBoard({ listId }: KanbanBoardProps) {
  const { columns, fetchColumns, reorderColumns, openColumnModal } = useColumnStore();
  const {
    tasks,
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
    selectAllTasks,
    clearSelection,
    bulkDeleteTasks,
    bulkMoveTasks,
    bulkEditTasks,
  } = useTaskStore();
  const { getViewConfig, updateViewSettings } = useViewStore();
  const { openShareModal, activeUsers, fetchUserPresence } = useListStore();

  const [viewDensity, setViewDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [debouncedFilteredTasks, setDebouncedFilteredTasks] = useState<Task[]>([]);
  const [localSearch, setLocalSearch] = useState('');

  // Template store
  const { openListTemplatesModal, openTaskTemplatesModal } = useTemplateStore();

  // Custom Field Store
  const { openManagerModal: openCustomFieldsModal } = useCustomFieldStore();

  // Iteration Store
  const { openManagerModal: openIterationModal } = useIterationStore();

  // Modal states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    // Fetch columns first
    fetchColumns(listId).then(() => {
      // Then fetch tasks with column IDs
      const columnIds = columns.map(col => col.id);
      if (columnIds.length > 0) {
        fetchTasks(listId, columnIds);
      }
    });

    // Fetch user presence logic for sharing collaboration
    fetchUserPresence(listId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId, fetchColumns, fetchTasks, fetchUserPresence]);

  // Refresh data when columns change
  useEffect(() => {
    if (columns.length > 0) {
      const columnIds = columns.map(col => col.id);
      fetchTasks(listId, columnIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns.length, fetchTasks, listId]);

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
          field: sortBy as unknown as any,
          direction: sortDirection as 'asc' | 'desc'
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
    
    const self = handleSearchChange as unknown as { _timeout?: number };
    if (self._timeout) window.clearTimeout(self._timeout);
    self._timeout = window.setTimeout(() => {
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

  // Bulk action handlers (now real using the store)
  const handleBulkMove = () => {
    // The BulkActionsBar now handles column selection directly
    console.log('Bulk move:', Array.from(selectedTaskIds));
  };

  const handleBulkChangePriority = () => {
    // The BulkActionsBar now handles priority selection directly
    console.log('Bulk change priority:', Array.from(selectedTaskIds));
  };

  // Import completion — add imported tasks to the store
  const handleImportComplete = (count: number) => {
    console.log(`Imported ${count} tasks`);
    // Tasks are added to the store via addImportedTasks in the modal's commit flow
  };

  // Default status for importing (first column)
  const defaultStatus = columns.length > 0 ? columns[0].id : '';

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
        // Bulk actions
        selectedCount={selectedTaskIds.size}
        onBulkDelete={bulkDeleteTasks}
        onBulkMove={handleBulkMove}
        onBulkChangePriority={handleBulkChangePriority}
        onClearSelection={clearSelection}
        onShareClick={() => openShareModal(listId)}
        activeMembers={activeUsers.map(u => ({ id: u.id, name: u.user.name, avatar: u.user.avatar }))}
        // Export & Import modal triggers
        onExportClick={() => setIsExportModalOpen(true)}
        onImportClick={() => setIsImportModalOpen(true)}
        // Templates
        onListTemplatesClick={() => openListTemplatesModal()}
        onTaskTemplatesClick={() => openTaskTemplatesModal(listId, defaultStatus)}
        // Custom Fields
        onCustomFieldsClick={() => openCustomFieldsModal()}
        // Iterations
        onIterationsClick={() => openIterationModal()}
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

      {/* Floating Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedTaskIds.size}
        totalCount={tasks.length}
        columns={columns}
        onSelectAll={selectAllTasks}
        onClearSelection={clearSelection}
        onBulkDelete={bulkDeleteTasks}
        onBulkMove={(targetStatus) => bulkMoveTasks(targetStatus)}
        onBulkChangePriority={(priority) => bulkEditTasks({ priority })}
        onBulkExport={() => setIsExportModalOpen(true)}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal />

      {/* Share List Modal */}
      <ShareListModal />

      {/* Export Options Modal */}
      <ExportOptionsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        tasks={tasks}
        filteredTasks={debouncedFilteredTasks}
        columns={columns}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        listId={listId}
        defaultStatus={defaultStatus}
        onImportComplete={(count) => {
          handleImportComplete(count);
          // Refresh to pick up imported tasks
          handleRefresh();
        }}
      />

      {/* List Templates Modal */}
      <ListTemplatesModal />

      {/* Task Templates Modal */}
      <TaskTemplatesModal
        listId={listId}
        defaultColumnId={defaultStatus}
        onTaskCreated={(taskId) => {
          console.log(`Task ${taskId} created from template`);
          handleRefresh();
        }}
      />

      {/* Custom Field Manager Modal */}
      <CustomFieldManagerModal />
      <IterationManagerModal />
    </div>
  );
}
