import { useEffect } from 'react';
import { useTaskDetailStore } from '../../store/useTaskDetailStore';
import { CommentComposer } from './CommentComposer';
import { CommentItem } from './CommentItem';
import { MessageSquare } from 'lucide-react';

export function CommentSection() {
  const { selectedTask, loadComments, commentTotal } = useTaskDetailStore();

  // Load initial comments when component mounts
  useEffect(() => {
    if (selectedTask?.comments.length === 0) {
      loadComments(1);
    }
  }, [selectedTask?.id]); // Note: intentionally relying on selectedTask.id to reload per task

  if (!selectedTask) return null;

  const comments = selectedTask.comments;
  const hasMore = comments.length < commentTotal;
  const nextPage = Math.ceil(comments.length / 20) + 1; // pageSize = 20

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden relative">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/30 shrink-0">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <MessageSquare size={16} className="text-sky-400" />
          التعليقات
          <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-normal">
            {commentTotal}
          </span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {hasMore && (
          <div className="flex justify-center pb-2">
            <button
              onClick={() => loadComments(nextPage)}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 transition-colors"
            >
              عرض التعليقات الأقدم
            </button>
          </div>
        )}

        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-slate-500" />
            </div>
            <p className="text-slate-300 font-medium">لا توجد تعليقات</p>
            <p className="text-slate-500 text-sm mt-1">ابدأ النقاش حول هذه المهمة الآن!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Render comments bottom to top (newest at bottom, typical chat style visually if reversed) 
                Actually our mock returns newest first, so mapping them renders newest at top.
                Let's reverse it visually so newest is at the bottom next to composer.
             */}
            {[...comments].reverse().map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
        <CommentComposer />
      </div>
    </div>
  );
}
