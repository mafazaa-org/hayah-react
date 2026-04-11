import type {
  TaskComment,
  CommentAttachment,
  CommentReaction,
} from '../types/task';
import { apiClient } from '../apiClient';

export const commentService = {
  /** Fetch comments for a task */
  async getComments(
    taskId: string,
    _page = 1,
    _pageSize = 20
  ): Promise<{ items: TaskComment[]; total: number }> {
    const response = await apiClient.get<TaskComment[]>(`/comments/task/${taskId}`);
    const items = response.data;
    return { items, total: items.length };
  },

  /** Create a new comment */
  async createComment(
    taskId: string,
    content: string,
    _mentionedUsers: string[] = [],
    _attachments: CommentAttachment[] = []
  ): Promise<TaskComment> {
    const response = await apiClient.post<TaskComment>('/comments', {
      taskId,
      content,
    });
    return response.data;
  },

  /** Update an existing comment */
  async updateComment(
    _taskId: string,
    commentId: string,
    content: string,
    _mentionedUsers: string[] = []
  ): Promise<TaskComment> {
    const response = await apiClient.put<TaskComment>(`/comments/${commentId}`, {
      content,
    });
    return response.data;
  },

  /** Delete a comment */
  async deleteComment(_taskId: string, commentId: string): Promise<void> {
    await apiClient.delete(`/comments/${commentId}`);
  },

  /** Toggle a reaction on a comment */
  async addReaction(
    _taskId: string,
    commentId: string,
    emoji: string
  ): Promise<CommentReaction[]> {
    try {
      await apiClient.post(`/comments/${commentId}/reactions`, { emoji });
    } catch {
      // If reaction already exists, remove it (toggle)
      await apiClient.delete(`/comments/${commentId}/reactions/${encodeURIComponent(emoji)}`);
    }
    // Fetch updated reactions
    const response = await apiClient.get<CommentReaction[]>(`/comments/${commentId}/reactions`);
    return response.data;
  },

  /** Upload a file attachment for a comment */
  async uploadCommentAttachment(
    _taskId: string,
    file: File,
    commentId?: string
  ): Promise<CommentAttachment> {
    const formData = new FormData();
    formData.append('file', file);

    if (commentId) {
      const response = await apiClient.post<CommentAttachment>(
        `/attachments/comment/${commentId}/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    }

    // If no commentId, create a temporary attachment object
    // (will be properly attached when the comment is created)
    return {
      id: `temp-${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
  },

  /** Delete an attachment from a comment */
  async deleteCommentAttachment(
    _taskId: string,
    _commentId: string,
    attachmentId: string
  ): Promise<void> {
    await apiClient.delete(`/attachments/${attachmentId}`);
  },

  /** Search users for @mention autocomplete */
  async searchUsers(query: string): Promise<{ id: string; name: string }[]> {
    const response = await apiClient.get<{ id: string; name: string }[]>('/users/search', {
      params: { q: query, limit: '10' },
    });
    return response.data;
  },
};
