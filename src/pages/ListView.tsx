import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useListStore } from '../store/useListStore';
import { useViewStore } from '../store/useViewStore';
import { KanbanBoard } from '../components/Kanban/KanbanBoard';
import { TableView } from '../components/Table/TableView';
import { CalendarView } from '../components/Calendar/CalendarView';
import { TimelineView } from '../components/Timeline/TimelineView';
import { ViewModeSelector } from '../components/View/ViewModeSelector';
import { CreateTaskModal } from '../components/Task/CreateTaskModal';
import { ColumnModal } from '../components/Kanban/ColumnModal';
import { Hash } from 'lucide-react';

export function ListView() {
  const { listId } = useParams<{ listId: string }>();
  const { activeListDetails, fetchListDetails } = useListStore();
  const { loadViewConfig, setViewMode, getViewMode } = useViewStore();

  const currentView = listId ? getViewMode(listId) : 'kanban';

  useEffect(() => {
    if (listId) {
      fetchListDetails(listId);
      loadViewConfig(listId);
    }
  }, [listId]);

  const handleViewModeChange = (mode: typeof currentView) => {
    if (listId) {
      setViewMode(listId, mode);
    }
  };

  if (!listId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">لم يتم العثور على القائمة</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 p-6">
      {/* List Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{ color: activeListDetails?.color || '#94a3b8' }}
            >
              <Hash size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                {activeListDetails?.name || 'جاري التحميل...'}
              </h1>
              {activeListDetails?.description && (
                <p className="text-sm text-slate-400 mt-1">
                  {activeListDetails.description}
                </p>
              )}
            </div>
          </div>

          {/* View Mode Selector */}
          <ViewModeSelector
            currentMode={currentView}
            onModeChange={handleViewModeChange}
          />
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'kanban' && <KanbanBoard listId={listId} />}
        {currentView === 'table' && <TableView listId={listId} />}
        {currentView === 'calendar' && <CalendarView listId={listId} />}
        {currentView === 'timeline' && <TimelineView listId={listId} />}
      </div>

      {/* Modals (only for Kanban view) */}
      {currentView === 'kanban' && (
        <>
          <CreateTaskModal />
          <ColumnModal />
        </>
      )}
    </div>
  );
}
