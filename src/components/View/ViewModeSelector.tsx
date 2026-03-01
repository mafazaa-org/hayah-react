import { LayoutGrid, Table, Calendar, GanttChart } from 'lucide-react';
import type { ViewMode } from '../../types/view';
import { VIEW_MODES } from '../../types/view';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const ICONS = {
  LayoutGrid,
  Table,
  Calendar,
  GanttChart
};

export function ViewModeSelector({ currentMode, onModeChange }: ViewModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-slate-900/50 rounded-lg p-1 border border-slate-800">
      {VIEW_MODES.map((viewMode) => {
        const Icon = ICONS[viewMode.icon as keyof typeof ICONS];
        const isActive = currentMode === viewMode.id;
        const isDisabled = !viewMode.available;

        return (
          <button
            key={viewMode.id}
            onClick={() => !isDisabled && onModeChange(viewMode.id)}
            disabled={isDisabled}
            className={`
              relative px-3 py-2 rounded-md text-sm font-medium transition-all
              flex items-center gap-2
              ${isActive
                ? 'bg-sky-500 text-white shadow-lg'
                : isDisabled
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }
            `}
            title={isDisabled ? `${viewMode.name} - قريباً` : viewMode.description}
          >
            <Icon size={16} />
            <span>{viewMode.name}</span>
            {isDisabled && (
              <span className="text-xs opacity-60">(قريباً)</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
