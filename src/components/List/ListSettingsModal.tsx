import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useListStore } from '../../store/useListStore';

export function ListSettingsModal() {
  const {
    isSettingsModalOpen,
    closeSettingsModal,
    activeListDetails,
    updateList,
    fetchListDetails,
    contextListId
  } = useListStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [visibility, setVisibility] = useState<'private' | 'public' | 'workspace'>('workspace');

  useEffect(() => {
    if (isSettingsModalOpen && contextListId) {
      // If we have details loaded for this list, use them. Otherwise we might needed to fetch.
      // For now assume store handles fetching or we pass simple props. 
      // Ideally useListStore should fetch details when modal opens if not present.
      fetchListDetails(contextListId);
    }
  }, [isSettingsModalOpen, contextListId, fetchListDetails]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (activeListDetails && activeListDetails.id === contextListId) {
      setName(activeListDetails.name);
      setDescription(activeListDetails.description || '');
      setColor(activeListDetails.color || '#3b82f6');
      setVisibility(activeListDetails.visibility || 'workspace');
    }
  }, [activeListDetails, contextListId]);

  if (!isSettingsModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contextListId) {
      updateList(contextListId, { name, description, color, visibility });
      closeSettingsModal();
    }
  };

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">

        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
          <h3 className="font-semibold text-slate-200">إعدادات القائمة</h3>
          <button onClick={closeSettingsModal} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <form id="list-settings-form" onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">الاسم</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">الوصف</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">لون القائمة</label>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">مستوى الظهور</label>
              <div className="grid grid-cols-3 gap-2">
                {(['private', 'workspace', 'public'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibility(v)}
                    className={`px-2 py-1.5 text-xs rounded-md border text-center transition-all ${visibility === v
                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-100'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                  >
                    {v === 'private' ? 'خاص' : v === 'workspace' ? 'مساحة العمل' : 'عام'}
                  </button>
                ))}
              </div>
            </div>

          </form>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 bg-slate-800/50 border-t border-slate-800">
          <button
            onClick={closeSettingsModal}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="list-settings-form"
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
}
