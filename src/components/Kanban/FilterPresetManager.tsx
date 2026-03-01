import { useState, useEffect } from 'react';
import { Bookmark, Trash2, Upload, Plus } from 'lucide-react';
import { filterService, type FilterPreset } from '../../services/filterService';
import type { FilterOptions } from './FilterPanel';

interface FilterPresetManagerProps {
  listId: string;
  currentFilters: FilterOptions;
  onLoadPreset: (filters: FilterOptions) => void;
}

export function FilterPresetManager({ listId, currentFilters, onLoadPreset }: FilterPresetManagerProps) {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    setPresets(filterService.getPresets(listId));
  }, [listId]);

  const handleSave = () => {
    if (!presetName.trim()) return;
    const newPreset = filterService.savePreset(listId, presetName.trim(), currentFilters);
    setPresets(prev => [...prev, newPreset]);
    setPresetName('');
    setIsCreating(false);
  };

  const handleDelete = (presetId: string) => {
    filterService.deletePreset(presetId);
    setPresets(prev => prev.filter(p => p.id !== presetId));
  };

  const handleLoad = (preset: FilterPreset) => {
    onLoadPreset(preset.filters);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
          <Bookmark size={14} />
          القوالب المحفوظة
        </label>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="text-xs text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
        >
          <Plus size={12} />
          حفظ الحالي
        </button>
      </div>

      {/* Save new preset */}
      {isCreating && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="اسم القالب..."
            className="flex-1 px-2 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={!presetName.trim()}
            className="px-3 py-1.5 text-xs bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            حفظ
          </button>
        </div>
      )}

      {/* Preset list */}
      {presets.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-2">لا توجد قوالب محفوظة</p>
      ) : (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {presets.map(preset => (
            <div
              key={preset.id}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors group"
            >
              <button
                onClick={() => handleLoad(preset)}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-slate-100 transition-colors flex-1 text-right"
              >
                <Upload size={12} className="text-slate-500 shrink-0" />
                <span className="truncate">{preset.name}</span>
              </button>
              <button
                onClick={() => handleDelete(preset.id)}
                className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                aria-label={`حذف ${preset.name}`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
