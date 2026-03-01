import { useState } from 'react';
import { useTaskDetailStore } from '../../store/useTaskDetailStore';
import {
  Plus,
  Trash2,
  CheckSquare,
  Square,
  ListChecks,
} from 'lucide-react';

export function ChecklistSection() {
  const {
    selectedTask,
    addChecklist,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    updateChecklistItem,
  } = useTaskDetailStore();

  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newItemTitles, setNewItemTitles] = useState<Record<string, string>>({});
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  if (!selectedTask) return null;

  const checklists = selectedTask.checklists;

  const handleAddChecklist = () => {
    const trimmed = newChecklistTitle.trim();
    if (!trimmed) return;
    addChecklist(trimmed);
    setNewChecklistTitle('');
  };

  const handleAddItem = (checklistId: string) => {
    const title = (newItemTitles[checklistId] || '').trim();
    if (!title) return;
    addChecklistItem(checklistId, title);
    setNewItemTitles((prev) => ({ ...prev, [checklistId]: '' }));
  };

  return (
    <div className="space-y-6">
      {checklists.map((cl) => {
        const completed = cl.items.filter((i) => i.completed).length;
        const total = cl.items.length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <div key={cl.id} className="space-y-3">
            {/* Checklist header */}
            <div className="flex items-center gap-2">
              <ListChecks size={16} className="text-sky-400" />
              <h4 className="text-sm font-semibold text-slate-200">{cl.title}</h4>
              {total > 0 && (
                <span className="text-xs text-slate-500 mr-auto">
                  {completed}/{total}
                </span>
              )}
            </div>

            {/* Progress */}
            {total > 0 && (
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-l from-emerald-400 to-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}

            {/* Items */}
            <div className="space-y-1">
              {cl.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md group hover:bg-slate-800/50 transition-colors"
                >
                  <button
                    onClick={() => toggleChecklistItem(cl.id, item.id)}
                    className={`shrink-0 transition-colors ${item.completed ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    {item.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>

                  {editingItemId === item.id ? (
                    <input
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      onBlur={() => {
                        const trimmed = editDraft.trim();
                        if (trimmed && trimmed !== item.title) {
                          updateChecklistItem(cl.id, item.id, trimmed);
                        }
                        setEditingItemId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const trimmed = editDraft.trim();
                          if (trimmed && trimmed !== item.title) {
                            updateChecklistItem(cl.id, item.id, trimmed);
                          }
                          setEditingItemId(null);
                        }
                        if (e.key === 'Escape') setEditingItemId(null);
                      }}
                      className="flex-1 bg-transparent border-b border-sky-500 text-sm text-slate-100 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={() => {
                        setEditingItemId(item.id);
                        setEditDraft(item.title);
                      }}
                      className={`flex-1 text-sm cursor-pointer transition-colors ${item.completed
                        ? 'line-through text-slate-500'
                        : 'text-slate-200 hover:text-slate-100'
                        }`}
                    >
                      {item.title}
                    </span>
                  )}

                  <button
                    onClick={() => deleteChecklistItem(cl.id, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 rounded transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add item */}
            <div className="flex items-center gap-2">
              <input
                value={newItemTitles[cl.id] || ''}
                onChange={(e) =>
                  setNewItemTitles((prev) => ({ ...prev, [cl.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddItem(cl.id);
                }}
                placeholder="إضافة عنصر..."
                className="flex-1 px-3 py-1.5 text-sm bg-slate-800/50 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                onClick={() => handleAddItem(cl.id)}
                disabled={!(newItemTitles[cl.id] || '').trim()}
                className="p-1.5 bg-sky-500/20 hover:bg-sky-500/30 disabled:opacity-40 text-sky-400 rounded transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        );
      })}

      {/* Add new checklist */}
      <div className="border-t border-slate-800 pt-4 flex items-center gap-2">
        <input
          value={newChecklistTitle}
          onChange={(e) => setNewChecklistTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddChecklist();
          }}
          placeholder="إضافة قائمة تحقق جديدة..."
          className="flex-1 px-3 py-2 text-sm bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <button
          onClick={handleAddChecklist}
          disabled={!newChecklistTitle.trim()}
          className="p-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white rounded-lg transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
