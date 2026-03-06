import { useEffect, useState, useRef } from 'react';
import { useTaskDetailStore } from '../../store/useTaskDetailStore';
import { usePresenceStore } from '../../store/usePresenceStore';
import type { TaskComment } from '../../types/task';
import { MoreHorizontal, Edit2, Trash2, Smile, X, File, Download } from 'lucide-react';

const COMMON_EMOJIS = ['👍', '🎉', '❤️', '🚀', '👀', '🙏'];

interface CommentItemProps {
  comment: TaskComment;
}

export function CommentItem({ comment }: CommentItemProps) {
  const { editComment, deleteComment, toggleReaction, deleteCommentAttachment } = useTaskDetailStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showOptions, setShowOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const onlineUsers = usePresenceStore(state => state.onlineUsers);
  const isOnline = onlineUsers[comment.authorId];

  // Group reactions by emoji
  const reactionMap = comment.reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, users: [], includesMe: false };
    acc[r.emoji].count++;
    acc[r.emoji].users.push(r.userName);
    if (r.userId === 'user-1') acc[r.emoji].includesMe = true; // mock current user
    return acc;
  }, {} as Record<string, { count: number; users: string[]; includesMe: boolean }>);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.style.height = 'auto';
      editInputRef.current.style.height = `${editInputRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }
    if (!editContent.trim()) return;

    await editComment(comment.id, editContent.trim(), comment.mentionedUsers);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(comment.content);
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  const currentUserId = 'user-1'; // Mock
  const isAuthor = comment.authorId === currentUserId;

  // Render content with highlighted @mentions
  const renderContent = (text: string) => {
    // Simple regex for @name. In a real app we'd map mentionedUsers array natively.
    const mentionRegex = /(@[\u0600-\u06FFa-zA-Z0-9_]+)/g;
    const parts = text.split(mentionRegex);
    return parts.map((part, i) => {
      if (part.match(mentionRegex)) {
        return <span key={i} className="text-sky-400 font-medium bg-sky-500/10 px-1 py-0.5 rounded-md">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Formatting date
  const dateObj = new Date(comment.createdAt);
  const timeString = dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  const dateString = dateObj.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });

  return (
    <div className="flex gap-4 group">
      {/* Avatar */}
      <div className="shrink-0 pt-1 relative">
        {comment.authorAvatarUrl ? (
          <img src={comment.authorAvatarUrl} alt={comment.authorName} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm shadow-sm">
            {comment.authorName.charAt(0)}
          </div>
        )}
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full" />
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200 text-sm">{comment.authorName}</span>
            <span className="text-xs text-slate-500">{dateString} {timeString} {comment.isEdited && <span className="text-[10px] ml-1">(مُعدَّل)</span>}</span>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${showOptions || showReactions ? 'opacity-100' : ''}`}>
              <div className="relative">
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors"
                  title="إضافة تفاعل"
                >
                  <Smile size={14} />
                </button>
                {/* Reaction Popover */}
                {showReactions && (
                  <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-1.5 flex items-center gap-1 z-10 w-max">
                    {COMMON_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => { toggleReaction(comment.id, emoji); setShowReactions(false); }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded-md transition-colors text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isAuthor && (
                <div className="relative">
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                  {showOptions && (
                    <div className="absolute left-0 top-full mt-1 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-10">
                      <button
                        onClick={() => { setIsEditing(true); setShowOptions(false); }}
                        className="w-full px-3 py-2 text-right text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 flex items-center gap-2"
                      >
                        <Edit2 size={14} /> تعديل
                      </button>
                      <button
                        onClick={() => { deleteComment(comment.id); setShowOptions(false); }}
                        className="w-full px-3 py-2 text-right text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <Trash2 size={14} /> حذف
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Text Body */}
        {isEditing ? (
          <div className="mt-2 bg-slate-800/50 border border-sky-500/50 rounded-lg p-3">
            <textarea
              ref={editInputRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-slate-200 text-sm resize-none outline-hidden min-h-[40px]"
            />
            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-700">
              <button
                onClick={() => { setIsEditing(false); setEditContent(comment.content); }}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-xs bg-sky-500 hover:bg-sky-400 text-white rounded-md transition-colors flex items-center gap-1 font-medium"
              >
                حفظ
              </button>
            </div>
          </div>
        ) : (
          <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
            {renderContent(comment.content)}
          </div>
        )}

        {/* Attachments Preview */}
        {!isEditing && comment.attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {comment.attachments.map(att => (
              <div key={att.id} className="group/att relative flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg p-2 pr-3 w-64">
                {att.mimeType.startsWith('image/') ? (
                  <img src={att.url} alt={att.name} className="w-10 h-10 rounded object-cover bg-slate-900 shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center shrink-0">
                    <File size={20} className="text-slate-400" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-200 truncate font-medium" title={att.name}>{att.name}</p>
                  <p className="text-[10px] text-slate-500">{(att.size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="flex flex-col gap-1 items-center justify-center px-1">
                  <a href={att.url} download={att.name} className="text-slate-400 hover:text-sky-400" title="تحميل">
                    <Download size={14} />
                  </a>
                  {isAuthor && (
                    <button
                      onClick={() => deleteCommentAttachment(comment.id, att.id)}
                      className="text-slate-400 hover:text-red-400 opacity-0 group-hover/att:opacity-100 transition-opacity"
                      title="حذف المرفق"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reactions */}
        {!isEditing && Object.keys(reactionMap).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(reactionMap).map(([emoji, data]) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(comment.id, emoji)}
                title={data.users.join(', ')}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs transition-colors ${data.includesMe
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
              >
                <span>{emoji}</span>
                <span className={data.includesMe ? 'font-medium' : ''}>{data.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
