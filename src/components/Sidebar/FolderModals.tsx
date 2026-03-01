import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { NavigationItem } from '../../services/folderService';

interface FolderModalsProps {
  isOpen: boolean;
  type: 'create' | 'rename' | 'delete';
  item?: NavigationItem;
  parentId?: string | null;
  onClose: () => void;
  onConfirm: (data: { name: string; type: 'folder' | 'list' }) => void;
}

export function FolderModals({ isOpen, type, item, onClose, onConfirm }: FolderModalsProps) {
  const [name, setName] = useState('');
  const [createType, setCreateType] = useState<'folder' | 'list'>('list');

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    if (isOpen) {
      if (type === 'rename' && item) {
        setName(item.name);
      } else {
        setName('');
        setCreateType('list');
      }
    }
  }, [isOpen, type, item]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ name, type: createType });
    onClose();
  };

  const title = {
    create: 'إنشاء عنصر جديد',
    rename: 'إعادة تسمية',
    delete: 'تأكيد الحذف'
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
          <h3 className="font-semibold text-slate-200">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {type === 'delete' ? (
            <p className="text-slate-400 text-sm">
              هل أنت متأكد من حذف <span className="text-white font-medium">"{item?.name}"</span>؟
              لا يمكن التراجع عن هذا الإجراء.
            </p>
          ) : (
            <form id="modal-form" onSubmit={handleSubmit} className="space-y-4">

              {/* Type Selection for Create */}
              {type === 'create' && (
                <div className="flex bg-slate-800 p-1 rounded-md">
                  <button
                    type="button"
                    onClick={() => setCreateType('list')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${createType === 'list' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    قائمة
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateType('folder')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${createType === 'folder' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    مجلد
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  الاسم
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="أدخل الاسم هنا..."
                  autoFocus
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 bg-slate-800/50 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            إلغاء
          </button>

          {type === 'delete' ? (
            <button
              onClick={() => { onConfirm({ name: '', type: 'folder' }); onClose(); }} // Type/name irrelevant for delete
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm shadow-red-900/20"
            >
              حذف
            </button>
          ) : (
            <button
              type="submit"
              form="modal-form"
              disabled={!name.trim()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {type === 'create' ? 'إنشاء' : 'حفظ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
