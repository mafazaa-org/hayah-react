import { useState, useRef, useEffect } from 'react';
import { useTaskDetailStore } from '../../store/useTaskDetailStore';
import { FileText } from 'lucide-react';

interface TaskDescriptionProps {
  description?: string;
}

export function TaskDescription({ description }: TaskDescriptionProps) {
  const { updateTaskField } = useTaskDetailStore();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(description || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    setDraft(description || '');
  }, [description]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed !== (description || '').trim()) {
      updateTaskField({ description: trimmed || undefined });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
        <FileText size={14} />
        الوصف
      </h3>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setDraft(description || '');
                setIsEditing(false);
              }
            }}
            className="w-full min-h-[100px] px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none text-sm leading-relaxed"
            placeholder="أضف وصفاً للمهمة..."
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setDraft(description || ''); setIsEditing(false); }}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={save}
              className="px-3 py-1.5 text-xs bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors"
            >
              حفظ
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className={`min-h-[60px] px-3 py-2 rounded-lg cursor-pointer border border-transparent hover:border-slate-700 transition-colors text-sm leading-relaxed ${description
            ? 'text-slate-300 whitespace-pre-wrap'
            : 'text-slate-500 italic'
            }`}
        >
          {description || 'انقر لإضافة وصف...'}
        </div>
      )}
    </div>
  );
}
