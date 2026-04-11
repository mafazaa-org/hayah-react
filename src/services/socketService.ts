import { io, Socket } from 'socket.io-client';

// Define possible socket events for strong typing
export interface ServerToClientEvents {
  user_presence: (data: { userId: string; status: 'online' | 'offline' }) => void;
  user_typing: (data: { userId: string; taskId: string; isTyping: boolean }) => void;
  task_updated: (data: { taskId: string;[key: string]: unknown }) => void;
  task_created: (data: { listId: string; task: unknown }) => void;
  task_moved: (data: { listId: string; taskId: string; task: unknown }) => void;
  task_deleted: (data: { listId: string; taskId: string }) => void;
  task_assigned: (data: { listId: string; taskId: string; userId: string }) => void;
  task_unassigned: (data: { listId: string; taskId: string; userId: string }) => void;
  comment_created: (data: { listId: string; taskId: string; comment: unknown }) => void;
  comment_updated: (data: { listId: string; taskId: string; comment: unknown }) => void;
  comment_deleted: (data: { listId: string; taskId: string; commentId: string }) => void;
  presence_updated: (data: { listId: string; userIds: string[] }) => void;
  new_comment: (data: { taskId: string; commentId: string; content: string; authorId: string }) => void;
  new_notification: (data: { notificationId: string }) => void;
  cursor_move: (data: { userId: string; x: number; y: number }) => void;
  connect: () => void;
  disconnect: () => void;
}

export interface ClientToServerEvents {
  typing: (data: { taskId: string; isTyping: boolean }) => void;
  join_task: (taskId: string) => void;
  leave_task: (taskId: string) => void;
  subscribe_list: (data: { listId: string }) => void;
  unsubscribe_list: (data: { listId: string }) => void;
  subscribe_task: (data: { taskId: string }) => void;
  unsubscribe_task: (data: { taskId: string }) => void;
  presence_heartbeat: (data: { listId: string }) => void;
  update_presence: (status: 'online' | 'offline' | 'away') => void;
  cursor_move: (data: { x: number; y: number }) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000';
const JWT_STORAGE_KEY = import.meta.env.VITE_JWT_STORAGE_KEY || 'hayah_auth_token';

/**
 * Real Socket.IO client connecting to the backend /realtime namespace.
 * Falls back to a no-op wrapper if Socket.IO is unavailable.
 */
class SocketServiceWrapper {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private fallbackListeners: Record<string, Array<(...args: unknown[]) => void>> = {};
  public connected: boolean = false;
  public id: string = '';

  constructor() {
    this.initSocket();
  }

  private initSocket() {
    try {
      const token = typeof window !== 'undefined'
        ? window.localStorage.getItem(JWT_STORAGE_KEY)
        : null;

      this.socket = io(`${API_BASE_URL}/realtime`, {
        auth: { token: token || '' },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.socket.on('connect', () => {
        this.connected = true;
        this.id = this.socket?.id || '';
        console.debug('[SocketService] Connected:', this.id);
      });

      this.socket.on('disconnect', () => {
        this.connected = false;
        console.debug('[SocketService] Disconnected');
      });
    } catch (error) {
      console.warn('[SocketService] Socket.IO unavailable, running in offline mode:', error);
      this.socket = null;
    }
  }

  public connect() {
    if (this.socket) {
      this.socket.connect();
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
    }
  }

  public on<Ev extends keyof ServerToClientEvents>(event: Ev, listener: ServerToClientEvents[Ev]) {
    if (this.socket) {
      this.socket.on(event as any, listener as any);
    } else {
      // Fallback: store listener locally
      if (!this.fallbackListeners[event as string]) {
        this.fallbackListeners[event as string] = [];
      }
      this.fallbackListeners[event as string].push(listener as (...args: unknown[]) => void);
    }
    return this;
  }

  public off<Ev extends keyof ServerToClientEvents>(event: Ev, listener?: ServerToClientEvents[Ev]) {
    if (this.socket) {
      if (listener) {
        this.socket.off(event as any, listener as any);
      } else {
        this.socket.off(event as any);
      }
    } else {
      if (listener) {
        this.fallbackListeners[event as string] = (this.fallbackListeners[event as string] || [])
          .filter(l => l !== (listener as (...args: unknown[]) => void));
      } else {
        delete this.fallbackListeners[event as string];
      }
    }
    return this;
  }

  public emit<Ev extends keyof ClientToServerEvents>(event: Ev, ...args: Parameters<ClientToServerEvents[Ev]>) {
    if (this.socket && this.connected) {
      this.socket.emit(event as any, ...args as any);
    } else {
      console.debug(`[SocketService] Emit (offline): ${String(event)}`, args);
    }
    return this;
  }
}

export const socketService = new SocketServiceWrapper();
