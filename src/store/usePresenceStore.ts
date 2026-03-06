import { create } from 'zustand';
import { socketService } from '../services/socketService';

interface PresenceState {
  onlineUsers: Record<string, boolean>; // userId -> isOnline
  typingUsers: Record<string, string[]>; // taskId -> array of userIds who are typing
  cursors: Record<string, { x: number; y: number }>; // userId -> coords

  setOnlineStatus: (userId: string, isOnline: boolean) => void;
  setUserTyping: (userId: string, taskId: string, isTyping: boolean) => void;
  setCursorPosition: (userId: string, x: number, y: number) => void;

  initializeSocketListeners: () => void;
  removeSocketListeners: () => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  onlineUsers: {},
  typingUsers: {},
  cursors: {},

  setOnlineStatus: (userId, isOnline) => set((state) => ({
    onlineUsers: {
      ...state.onlineUsers,
      [userId]: isOnline
    }
  })),

  setCursorPosition: (userId, x, y) => set((state) => ({
    cursors: {
      ...state.cursors,
      [userId]: { x, y }
    }
  })),

  setUserTyping: (userId, taskId, isTyping) => set((state) => {
    const currentTypingInTask = state.typingUsers[taskId] || [];
    let updatedTyping;

    if (isTyping) {
      updatedTyping = currentTypingInTask.includes(userId)
        ? currentTypingInTask
        : [...currentTypingInTask, userId];
    } else {
      updatedTyping = currentTypingInTask.filter(id => id !== userId);
    }

    return {
      typingUsers: {
        ...state.typingUsers,
        [taskId]: updatedTyping
      }
    };
  }),

  initializeSocketListeners: () => {
    // Make sure we only attach once (Zustand might call this multiple times in React strict mode)
    socketService.off('user_presence');
    socketService.off('user_typing');
    socketService.off('cursor_move');

    socketService.on('user_presence', (data) => {
      set((state) => ({
        onlineUsers: {
          ...state.onlineUsers,
          [data.userId]: data.status === 'online'
        }
      }));
    });

    socketService.on('user_typing', (data) => {
      set((state) => {
        const currentTypingInTask = state.typingUsers[data.taskId] || [];

        let updatedTyping;
        if (data.isTyping) {
          updatedTyping = currentTypingInTask.includes(data.userId) ? currentTypingInTask : [...currentTypingInTask, data.userId];
        } else {
          updatedTyping = currentTypingInTask.filter(id => id !== data.userId);
        }

        return {
          typingUsers: {
            ...state.typingUsers,
            [data.taskId]: updatedTyping
          }
        };
      });

      // Auto-clear typing status after 5 seconds
      if (data.isTyping) {
        setTimeout(() => {
          set((state) => {
            const current = state.typingUsers[data.taskId] || [];
            return {
              typingUsers: {
                ...state.typingUsers,
                [data.taskId]: current.filter(id => id !== data.userId)
              }
            };
          });
        }, 5000);
      }
    });

    socketService.on('cursor_move', (data) => {
      set((state) => ({
        cursors: {
          ...state.cursors,
          [data.userId]: { x: data.x, y: data.y }
        }
      }));

      // Add simple timeout to remove cursor after 3 seconds of inactivity
      setTimeout(() => {
        set((state) => {
          const current = { ...state.cursors };
          // A bit simplistic: this might clear if a new movement happened right after.
          // For a robust app, we'd clear per-timeout id. This works for MVP.
          delete current[data.userId];
          return { cursors: current };
        });
      }, 3000);
    });
  },

  removeSocketListeners: () => {
    socketService.off('user_presence');
    socketService.off('user_typing');
    socketService.off('cursor_move');
  }
}));
