import { useState } from 'react';
import { useTaskDetailStore } from '../../store/useTaskDetailStore';
import type { Subtask } from '../../types/task';
import {
  Plus,
  Trash2,
  Square,
  CheckSquare,
} from 'lucide-react';

export function SubtaskList() {
  const { selectedTask, addSubtask, editSubtask, deleteSubtask, toggleSubtask, reorderSubtasks } =
    useTaskDetailStore();

  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  if (!selectedTask) return null;

  const subtasks = selectedTask.subtasks;
  const completed = subtasks.filter((s) => s.completed).length;

  const handleAdd = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    addSubtask(trimmed);
    setNewTitle('');
  };

  const startEdit = (st: Subtask) => {
    setEditingId(st.id);
    setEditDraft(st.title);
  };

  const saveEdit = (id: string) => {
    const trimmed = editDraft.trim();
    if (trimmed && trimmed !== subtasks.find((s) => s.id === id)?.title) {
      editSubtask(id, trimmed);
    }
    setEditingId(null);
  };

  // Simple drag reorder via up/down (full DnD can be added later)
  const moveUp = (index: number) => {
    if (index === 0) return;
    const ids = subtasks.map((s) => s.id);
    [ids[index], ids[index - 1]] = [ids[index - 1], ids[index]];
    reorderSubtasks(ids);
  };

  const moveDown = (index: number) => {
    if (index === subtasks.length - 1) return;
    const ids = subtasks.map((s) => s.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    reorderSubtasks(ids);
  };

  const progressPct = subtasks.length > 0 ? Math.round((completed / subtasks.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress */}
      {subtasks.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>
              {completed}/{subtasks.length} مكتمل
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-l from-emerald-400 to-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtask list */}
      <div className="space-y-1">
        {subtasks.map((st, i) => (
          <div
            key={st.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md group hover:bg-slate-800/50 transition-colors"
          >
            {/* Grip */}
            <div className="flex flex-col gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => moveUp(i)}
                className="text-slate-600 hover:text-slate-300 p-0 leading-none text-[10px]"
                title="تحريك لأعلى"
              >
                ▲
              </button>
              <button
                onClick={() => moveDown(i)}
                className="text-slate-600 hover:text-slate-300 p-0 leading-none text-[10px]"
                title="تحريك لأسفل"
              >
                ▼
              </button>
            </div>

            {/* Checkbox */}
            <button
              onClick={() => toggleSubtask(st.id)}
              className={`shrink-0 transition-colors ${st.completed ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {st.completed ? <CheckSquare size={16} /> : <Square size={16} />}
            </button>

            {/* Title */}
            {editingId === st.id ? (
              <input
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                onBlur={() => saveEdit(st.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit(st.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                className="flex-1 bg-transparent border-b border-sky-500 text-sm text-slate-100 focus:outline-none"
                autoFocus
              />
            ) : (
              <span
                onClick={() => startEdit(st)}
                className={`flex-1 text-sm cursor-pointer transition-colors ${st.completed
                  ? 'line-through text-slate-500'
                  : 'text-slate-200 hover:text-slate-100'
                  }`}
              >
                {st.title}
              </span>
            )}

            {/* Delete */}
            <button
              onClick={() => deleteSubtask(st.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 rounded transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Add subtask */}
      <div className="flex items-center gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          placeholder="إضافة مهمة فرعية..."
          className="flex-1 px-3 py-2 text-sm bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <button
          onClick={handleAdd}
          disabled={!newTitle.trim()}
          className="p-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white rounded-lg transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
