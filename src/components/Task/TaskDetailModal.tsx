import React, { useEffect, useCallback } from 'react';
import { useTaskDetailStore } from '../../store/useTaskDetailStore';
import type { DetailTab } from '../../store/useTaskDetailStore';
import { TaskHeader } from './TaskHeader';
import { TaskDescription } from './TaskDescription';
import { TaskSidebar } from './TaskSidebar';
import { SubtaskList } from './SubtaskList';
import { ChecklistSection } from './ChecklistSection';
import { DependencySection } from './DependencySection';
import { CustomFieldsSection } from './CustomFieldsSection';
import { AttachmentSection } from './AttachmentSection';
import { ActivityFeed } from './ActivityFeed';
import {
  X,
  FileText,
  ListChecks,
  CheckSquare,
  Link2,
  Settings2,
  Paperclip,
  Clock,
  Loader2,
} from 'lucide-react';

const TABS: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
  { id: 'details', label: 'التفاصيل', icon: <FileText size={14} /> },
  { id: 'subtasks', label: 'المهام الفرعية', icon: <ListChecks size={14} /> },
  { id: 'checklists', label: 'قوائم التحقق', icon: <CheckSquare size={14} /> },
  { id: 'dependencies', label: 'التبعيات', icon: <Link2 size={14} /> },
  { id: 'attachments', label: 'المرفقات', icon: <Paperclip size={14} /> },
  { id: 'activity', label: 'السجل', icon: <Clock size={14} /> },
];

export function TaskDetailModal() {
  const { selectedTask, isDetailModalOpen, isLoading, error, activeTab, setActiveTab, closeTaskDetail } =
    useTaskDetailStore();

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDetailModalOpen) {
        closeTaskDetail();
      }
    },
    [isDetailModalOpen, closeTaskDetail]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isDetailModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDetailModalOpen]);

  if (!isDetailModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeTaskDetail();
      }}
    >
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-slate-400">تفاصيل المهمة</h3>
          </div>
          <button
            onClick={closeTaskDetail}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Loading / Error */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-sky-500" />
          </div>
        )}

        {error && !isLoading && (
          <div className="flex-1 flex items-center justify-center py-16">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        {selectedTask && !isLoading && (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-1 px-6 pt-3 overflow-x-auto shrink-0">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-t-lg transition-colors whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                  {/* Badges */}
                  {tab.id === 'subtasks' && selectedTask.subtasks.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-700 text-slate-300">
                      {selectedTask.subtasks.length}
                    </span>
                  )}
                  {tab.id === 'attachments' && selectedTask.attachments.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-700 text-slate-300">
                      {selectedTask.attachments.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content + sidebar */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col lg:flex-row gap-6 p-6">
                {/* Main content area */}
                <div className="flex-1 min-w-0 space-y-6">
                  {/* Task header is always visible */}
                  <TaskHeader task={selectedTask} />

                  {/* Active tab content */}
                  <div className="border-t border-slate-800 pt-4">
                    {activeTab === 'details' && (
                      <>
                        <TaskDescription description={selectedTask.description} />
                        {/* Show custom fields inline on details tab */}
                        <div className="mt-6">
                          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                            <Settings2 size={14} />
                            الحقول المخصصة
                          </h3>
                          <CustomFieldsSection />
                        </div>
                      </>
                    )}
                    {activeTab === 'subtasks' && <SubtaskList />}
                    {activeTab === 'checklists' && <ChecklistSection />}
                    {activeTab === 'dependencies' && <DependencySection />}
                    {activeTab === 'attachments' && <AttachmentSection />}
                    {activeTab === 'activity' && <ActivityFeed />}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:w-64 shrink-0 lg:border-r-0 lg:border-l border-slate-800 lg:pl-6">
                  <TaskSidebar task={selectedTask} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
