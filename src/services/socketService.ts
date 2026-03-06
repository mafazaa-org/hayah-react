// import { io, Socket } from 'socket.io-client';

// Define possible socket events for strong typing
export interface ServerToClientEvents {
  user_presence: (data: { userId: string; status: 'online' | 'offline' }) => void;
  user_typing: (data: { userId: string; taskId: string; isTyping: boolean }) => void;
  task_updated: (data: { taskId: string;[key: string]: unknown }) => void;
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
  update_presence: (status: 'online' | 'offline' | 'away') => void;
  cursor_move: (data: { x: number; y: number }) => void;
}

/**
 * A robust MockSocket client that mimics the standard socket.io API
 * but operates entirely on the client side to simulate real-time
 * team collaboration events since there is no live backend running.
 */
class MockSocket {
  private listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
  private activeIntervals: number[] = [];
  public connected: boolean = false;
  public id: string = 'mock-socket-' + Math.random().toString(36).substring(7);

  // Mock users for simulating team activity
  private mockTeamMembers = [
    { id: 'u2', name: 'أحمد محمود' },
    { id: 'u3', name: 'سارة خالد' },
    { id: 'u4', name: 'محمد علي' }
  ];

  constructor() {
    this.connect();
  }

  public connect() {
    if (this.connected) return;
    this.connected = true;

    // Simulate connection delay
    setTimeout(() => {
      this.triggerEvent('connect');
      this.startSimulatedEvents();
    }, 500);
  }

  public disconnect() {
    if (!this.connected) return;
    this.connected = false;

    // Clear all simulated intervals
    this.activeIntervals.forEach(clearInterval);
    this.activeIntervals = [];

    setTimeout(() => {
      this.triggerEvent('disconnect');
    }, 100);
  }

  public on<Ev extends keyof ServerToClientEvents>(event: Ev, listener: ServerToClientEvents[Ev]) {
    if (!this.listeners[event as string]) {
      this.listeners[event as string] = [];
    }
    this.listeners[event as string].push(listener as (...args: unknown[]) => void);
    return this;
  }

  public off<Ev extends keyof ServerToClientEvents>(event: Ev, listener?: ServerToClientEvents[Ev]) {
    if (!this.listeners[event as string]) return this;

    if (listener) {
      this.listeners[event as string] = this.listeners[event as string].filter(l => l !== (listener as (...args: unknown[]) => void));
    } else {
      delete this.listeners[event as string];
    }
    return this;
  }

  public emit<Ev extends keyof ClientToServerEvents>(event: Ev, ...args: Parameters<ClientToServerEvents[Ev]>) {
    console.debug(`[MockSocket Emit] ${String(event)}`, args);

    // Auto-reply simulation for specific client events
    if (event === 'typing') {
      const data = args[0] as { taskId: string; isTyping: boolean };
      // Simulate another user acknowledging typing
      if (data.isTyping && Math.random() > 0.5) {
        setTimeout(() => {
          this.triggerEvent('user_typing', {
            userId: this.mockTeamMembers[Math.floor(Math.random() * this.mockTeamMembers.length)].id,
            taskId: data.taskId,
            isTyping: true
          });
        }, Math.random() * 2000 + 1000);
      }
    }
    return this;
  }

  /**
   * Internal method to trigger listeners (simulates receiving an event from server)
   */
  private triggerEvent(event: string, ...args: unknown[]) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(listener => {
      try {
        listener(...args);
      } catch (e) {
        console.error(`Error in socket listener for ${event}`, e);
      }
    });
  }

  /**
   * Generates intermittent random events simulating live user interaction
   */
  private startSimulatedEvents() {
    // 1. Presence changes (Users coming online/offline randomly)
    this.activeIntervals.push(
      window.setInterval(() => {
        if (!this.connected) return;
        const randomUser = this.mockTeamMembers[Math.floor(Math.random() * this.mockTeamMembers.length)];
        const isOnline = Math.random() > 0.4; // 60% chance to be online

        console.debug(`[Simulated socket] Presence change: ${randomUser.name} is ${isOnline ? 'online' : 'offline'}`);
        this.triggerEvent('user_presence', {
          userId: randomUser.id,
          status: isOnline ? 'online' : 'offline'
        });
      }, 15000) // Every 15 seconds
    );

    // 2. Random Notifications
    this.activeIntervals.push(
      window.setInterval(() => {
        if (!this.connected) return;
        // 20% chance to receive a notification every tick
        if (Math.random() > 0.8) {
          console.debug(`[Simulated socket] New Notification received`);
          this.triggerEvent('new_notification', {
            notificationId: 'n_sim_' + Date.now()
          });
        }
      }, 12000)
    );

    // 3. Simulated cursor movements
    this.activeIntervals.push(
      window.setInterval(() => {
        if (!this.connected) return;

        // 40% chance someone moves their cursor
        if (Math.random() > 0.6) {
          const randomUser = this.mockTeamMembers[Math.floor(Math.random() * this.mockTeamMembers.length)];

          // Generate realistic smooth-ish movement simulation 
          // (mocking a few points in a sequence to look like a drag)
          let steps = 5;
          let currentX = window.innerWidth * 0.2 + Math.random() * (window.innerWidth * 0.6);
          let currentY = window.innerHeight * 0.2 + Math.random() * (window.innerHeight * 0.6);

          const intervalId = window.setInterval(() => {
            if (!this.connected) {
              clearInterval(intervalId);
              return;
            }

            this.triggerEvent('cursor_move', {
              userId: randomUser.id,
              x: currentX,
              y: currentY
            });

            currentX += (Math.random() - 0.5) * 100;
            currentY += (Math.random() - 0.5) * 100;

            steps--;
            if (steps <= 0) clearInterval(intervalId);
          }, 100);
        }
      }, 3000)
    );

    // We could add simulated task changes or new comments here, 
    // but without knowing which exact taskId the user is looking at,
    // they might just appear silently in the background state.
  }
}

// In a real app we'd conditionally export the real Socket.IO or the Mock
// export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(import.meta.env.VITE_API_BASE_URL);

// Using Mock for Phase 12 as requested
export const socketService = new MockSocket();
