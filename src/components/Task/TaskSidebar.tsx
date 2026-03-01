import { useState } from 'react';
import type { TaskDetail } from '../../types/task';
import { useTaskDetailStore } from '../../store/useTaskDetailStore';
import {
  Users,
  Calendar,
  Tag,
  Layers,
  X,
  Plus,
  Search,
} from 'lucide-react';

interface TaskSidebarProps {
  task: TaskDetail;
}

// Mock user list
const MOCK_USERS = [
  { id: 'user-1', name: 'أحمد محمد' },
  { id: 'user-2', name: 'سارة علي' },
  { id: 'user-3', name: 'محمد خالد' },
  { id: 'user-4', name: 'فاطمة يوسف' },
  { id: 'user-5', name: 'عمر حسن' },
];

const MOCK_TAGS = ['عاجل', 'تصميم', 'برمجة', 'مراجعة', 'اختبار', 'توثيق', 'بحث'];
const MOCK_ITERATIONS = ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Backlog'];

export function TaskSidebar({ task }: TaskSidebarProps) {
  const { updateTaskField } = useTaskDetailStore();

  // Assignees
  const [showAssigneeDD, setShowAssigneeDD] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState('');

  const filteredUsers = MOCK_USERS.filter(
    (u) =>
      u.name.includes(assigneeSearch) &&
      !(task.assignees || []).includes(u.id)
  );

  const addAssignee = (userId: string) => {
    updateTaskField({ assignees: [...(task.assignees || []), userId] });
  };

  const removeAssignee = (userId: string) => {
    updateTaskField({
      assignees: (task.assignees || []).filter((id) => id !== userId),
    });
  };

  // Due Date
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Tags
  const [showTagDD, setShowTagDD] = useState(false);

  const toggleTag = (tag: string) => {
    const current = task.tags || [];
    if (current.includes(tag)) {
      updateTaskField({ tags: current.filter((t) => t !== tag) });
    } else {
      updateTaskField({ tags: [...current, tag] });
    }
  };

  // Iteration
  const [showIterDD, setShowIterDD] = useState(false);

  return (
    <div className="space-y-5">
      {/* Assignees */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wide">
          <Users size={12} />
          المسؤولون
        </h4>
        <div className="space-y-1.5">
          {(task.assignees || []).map((userId) => {
            const user = MOCK_USERS.find((u) => u.id === userId);
            return (
              <div
                key={userId}
                className="flex items-center justify-between px-2 py-1.5 bg-slate-800/50 rounded-md group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                    {(user?.name || userId).charAt(0)}
                  </div>
                  <span className="text-sm text-slate-300">{user?.name || userId}</span>
                </div>
                <button
                  onClick={() => removeAssignee(userId)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-700 rounded transition-all text-slate-500 hover:text-red-400"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
        <div className="relative">
          <button
            onClick={() => {
              setShowAssigneeDD(!showAssigneeDD);
              setAssigneeSearch('');
            }}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-md transition-colors w-full"
          >
            <Plus size={12} />
            إضافة مسؤول
          </button>
          {showAssigneeDD && (
            <div className="absolute top-full mt-1 right-0 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1">
              <div className="px-2 py-1.5">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded border border-slate-700">
                  <Search size={12} className="text-slate-500" />
                  <input
                    value={assigneeSearch}
                    onChange={(e) => setAssigneeSearch(e.target.value)}
                    placeholder="بحث..."
                    className="bg-transparent text-xs text-slate-200 focus:outline-none w-full"
                    autoFocus
                  />
                </div>
              </div>
              {filteredUsers.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-500">لا توجد نتائج</div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      addAssignee(user.id);
                      setShowAssigneeDD(false);
                    }}
                    className="w-full px-3 py-2 text-sm text-right flex items-center gap-2 hover:bg-slate-700 transition-colors text-slate-300"
                  >
                    <div className="w-5 h-5 rounded-full bg-linear-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-[9px] text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    {user.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wide">
          <Calendar size={12} />
          تاريخ الاستحقاق
        </h4>
        {showDatePicker ? (
          <div className="space-y-2">
            <input
              type="datetime-local"
              defaultValue={task.dueDate ? task.dueDate.slice(0, 16) : ''}
              onChange={(e) => {
                if (e.target.value) {
                  updateTaskField({ dueDate: new Date(e.target.value).toISOString() });
                }
              }}
              className="w-full px-2 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <div className="flex gap-2">
              {task.dueDate && (
                <button
                  onClick={() => {
                    updateTaskField({ dueDate: undefined });
                    setShowDatePicker(false);
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  إزالة
                </button>
              )}
              <button
                onClick={() => setShowDatePicker(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDatePicker(true)}
            className={`w-full text-right px-2 py-1.5 text-sm rounded-md border border-transparent hover:border-slate-700 transition-colors ${task.dueDate
              ? new Date(task.dueDate) < new Date()
                ? 'text-red-400'
                : 'text-slate-300'
              : 'text-slate-500'
              }`}
          >
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
              : 'لم يتم التحديد'}
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wide">
          <Tag size={12} />
          الوسوم
        </h4>
        <div className="flex flex-wrap gap-1">
          {(task.tags || []).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-sky-500/10 text-sky-300 border border-sky-500/20"
            >
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="hover:text-red-400 transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowTagDD(!showTagDD)}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <Plus size={12} />
            إضافة وسم
          </button>
          {showTagDD && (
            <div className="absolute top-full mt-1 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-[140px] py-1">
              {MOCK_TAGS.map((tag) => {
                const isActive = (task.tags || []).includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`w-full px-3 py-1.5 text-sm text-right hover:bg-slate-700 transition-colors ${isActive ? 'text-sky-400' : 'text-slate-300'
                      }`}
                  >
                    {isActive ? '✓ ' : ''}
                    {tag}
                  </button>
                );
              })}
              <div className="border-t border-slate-700 mt-1 pt-1">
                <button
                  onClick={() => setShowTagDD(false)}
                  className="w-full px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 text-right"
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Iteration */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wide">
          <Layers size={12} />
          الدورة / Sprint
        </h4>
        <div className="relative">
          <button
            onClick={() => setShowIterDD(!showIterDD)}
            className="w-full text-right px-2 py-1.5 text-sm rounded-md border border-transparent hover:border-slate-700 transition-colors text-slate-300"
          >
            {task.iterationName || 'لم يتم التحديد'}
          </button>
          {showIterDD && (
            <div className="absolute top-full mt-1 right-0 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1">
              <button
                onClick={() => {
                  updateTaskField({ iterationName: undefined });
                  setShowIterDD(false);
                }}
                className="w-full px-3 py-1.5 text-sm text-right text-slate-500 hover:bg-slate-700"
              >
                بدون دورة
              </button>
              {MOCK_ITERATIONS.map((iter) => (
                <button
                  key={iter}
                  onClick={() => {
                    updateTaskField({ iterationName: iter });
                    setShowIterDD(false);
                  }}
                  className={`w-full px-3 py-1.5 text-sm text-right hover:bg-slate-700 transition-colors ${task.iterationName === iter ? 'text-sky-400' : 'text-slate-300'
                    }`}
                >
                  {iter}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
