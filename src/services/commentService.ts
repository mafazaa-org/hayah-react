import type {
  TaskComment,
  CommentAttachment,
  CommentReaction,
} from '../types/task';

// ─── Helper ──────────────────────────────────────────────────────
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Mock Users (for @mention search) ────────────────────────────
const MOCK_USERS = [
  { id: 'user-1', name: 'أحمد محمد', avatarUrl: undefined },
  { id: 'user-2', name: 'سارة علي', avatarUrl: undefined },
  { id: 'user-3', name: 'محمد خالد', avatarUrl: undefined },
  { id: 'user-4', name: 'فاطمة يوسف', avatarUrl: undefined },
  { id: 'user-5', name: 'عمر حسن', avatarUrl: undefined },
  { id: 'user-6', name: 'ليلى أحمد', avatarUrl: undefined },
  { id: 'user-7', name: 'خالد سعيد', avatarUrl: undefined },
];

// ─── In-memory comment store ────────────────────────────────────
const commentsStore = new Map<string, TaskComment[]>();

function seedComments(taskId: string): TaskComment[] {
  const now = new Date();
  const comments: TaskComment[] = [
    {
      id: crypto.randomUUID(),
      taskId,
      authorId: 'user-2',
      authorName: 'سارة علي',
      content: 'تم مراجعة هذه المهمة وتحتاج بعض التعديلات. @أحمد محمد هل يمكنك المراجعة؟',
      mentionedUsers: ['user-1'],
      attachments: [],
      reactions: [
        { emoji: '👍', userId: 'user-1', userName: 'أحمد محمد' },
        { emoji: '👍', userId: 'user-3', userName: 'محمد خالد' },
      ],
      createdAt: new Date(now.getTime() - 3600000).toISOString(),
      updatedAt: new Date(now.getTime() - 3600000).toISOString(),
      isEdited: false,
    },
    {
      id: crypto.randomUUID(),
      taskId,
      authorId: 'user-1',
      authorName: 'أحمد محمد',
      content: 'تمام، سأراجعها اليوم وأعطيك التعليقات.',
      mentionedUsers: [],
      attachments: [],
      reactions: [{ emoji: '🙏', userId: 'user-2', userName: 'سارة علي' }],
      createdAt: new Date(now.getTime() - 1800000).toISOString(),
      updatedAt: new Date(now.getTime() - 1800000).toISOString(),
      isEdited: false,
    },
  ];
  commentsStore.set(taskId, comments);
  return comments;
}

// ─── Service ─────────────────────────────────────────────────────
export const commentService = {
  /** Fetch comments for a task (paginated) */
  async getComments(
    taskId: string,
    page = 1,
    pageSize = 20
  ): Promise<{ items: TaskComment[]; total: number }> {
    await delay(200);
    let all = commentsStore.get(taskId);
    if (!all) all = seedComments(taskId);
    const total = all.length;
    // newest first, then paginate
    const sorted = [...all].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const start = (page - 1) * pageSize;
    const items = sorted.slice(start, start + pageSize);
    return { items, total };
  },

  /** Create a new comment */
  async createComment(
    taskId: string,
    content: string,
    mentionedUsers: string[] = [],
    attachments: CommentAttachment[] = []
  ): Promise<TaskComment> {
    await delay(250);
    const now = new Date().toISOString();
    const comment: TaskComment = {
      id: crypto.randomUUID(),
      taskId,
      authorId: 'user-1', // current user mock
      authorName: 'أحمد محمد',
      content,
      mentionedUsers,
      attachments,
      reactions: [],
      createdAt: now,
      updatedAt: now,
      isEdited: false,
    };
    const existing = commentsStore.get(taskId) || [];
    commentsStore.set(taskId, [...existing, comment]);
    return comment;
  },

  /** Update an existing comment */
  async updateComment(
    taskId: string,
    commentId: string,
    content: string,
    mentionedUsers: string[] = []
  ): Promise<TaskComment> {
    await delay(200);
    const all = commentsStore.get(taskId) || [];
    const idx = all.findIndex((c) => c.id === commentId);
    if (idx === -1) throw new Error('التعليق غير موجود');
    const updated: TaskComment = {
      ...all[idx],
      content,
      mentionedUsers,
      updatedAt: new Date().toISOString(),
      isEdited: true,
    };
    all[idx] = updated;
    commentsStore.set(taskId, all);
    return updated;
  },

  /** Delete a comment */
  async deleteComment(taskId: string, commentId: string): Promise<void> {
    await delay(150);
    const all = commentsStore.get(taskId) || [];
    commentsStore.set(
      taskId,
      all.filter((c) => c.id !== commentId)
    );
  },

  /** Toggle a reaction on a comment */
  async addReaction(
    taskId: string,
    commentId: string,
    emoji: string
  ): Promise<CommentReaction[]> {
    await delay(100);
    const all = commentsStore.get(taskId) || [];
    const comment = all.find((c) => c.id === commentId);
    if (!comment) throw new Error('التعليق غير موجود');
    const currentUserId = 'user-1';
    const currentUserName = 'أحمد محمد';
    const existingIdx = comment.reactions.findIndex(
      (r) => r.emoji === emoji && r.userId === currentUserId
    );
    if (existingIdx !== -1) {
      // Remove (toggle off)
      comment.reactions.splice(existingIdx, 1);
    } else {
      comment.reactions.push({ emoji, userId: currentUserId, userName: currentUserName });
    }
    commentsStore.set(taskId, all);
    return [...comment.reactions];
  },

  /** Upload a file attachment for a comment */
  async uploadCommentAttachment(
    _taskId: string,
    file: File
  ): Promise<CommentAttachment> {
    await delay(300);
    const attachment: CommentAttachment = {
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
    return attachment;
  },

  /** Delete an attachment from a comment */
  async deleteCommentAttachment(
    taskId: string,
    commentId: string,
    attachmentId: string
  ): Promise<void> {
    await delay(100);
    const all = commentsStore.get(taskId) || [];
    const comment = all.find((c) => c.id === commentId);
    if (comment) {
      comment.attachments = comment.attachments.filter((a) => a.id !== attachmentId);
      commentsStore.set(taskId, all);
    }
  },

  /** Search users for @mention autocomplete */
  async searchUsers(query: string): Promise<{ id: string; name: string }[]> {
    await delay(80);
    if (!query.trim()) return MOCK_USERS.slice(0, 5);
    return MOCK_USERS.filter((u) =>
      u.name.toLowerCase().includes(query.toLowerCase())
    );
  },
};
