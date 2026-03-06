import { useEffect } from 'react';
import { usePresenceStore } from '../store/usePresenceStore';
import { socketService } from '../services/socketService';

// Simple throttle function to limit emit frequency
function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let inThrottle: boolean;
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  } as T;
}

const mockNames: Record<string, string> = {
  'u2': 'أحمد محمود',
  'u3': 'سارة خالد',
  'u4': 'محمد علي'
};
const mockColors: Record<string, string> = {
  'u2': '#f43f5e', // rose-500
  'u3': '#8b5cf6', // violet-500
  'u4': '#10b981'  // emerald-500
};

export function LiveCursors() {
  const { cursors } = usePresenceStore();

  useEffect(() => {
    const handleMouseMove = throttle((e: MouseEvent) => {
      socketService.emit('cursor_move', {
        x: e.clientX,
        y: e.clientY
      });
    }, 100);

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (Object.keys(cursors).length === 0) return null;

  return (
    <>
      {Object.entries(cursors).map(([userId, pos]) => {
        const name = mockNames[userId] || 'عضو بالفريق';
        const color = mockColors[userId] || '#0ea5e9'; // fallback sky-500

        return (
          <div
            key={userId}
            className="pointer-events-none fixed z-9999 transition-all duration-150 ease-linear"
            style={{
              left: pos.x,
              top: pos.y,
              transform: 'translate(-4px, -4px)',
            }}
          >
            {/* Custom SVG cursor */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color }}
              className="drop-shadow-md"
            >
              <path
                d="M5.65376 21.25V4.76451L19.4623 11.6669L12.56 13.9686L10.2583 20.8709L5.65376 21.25Z"
                fill="currentColor"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <div
              className="absolute top-5 rtl:right-5 ltr:left-5 px-2 py-1 text-white text-[11px] rounded-lg rounded-tr-none shadow-md font-medium whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </>
  );
}
