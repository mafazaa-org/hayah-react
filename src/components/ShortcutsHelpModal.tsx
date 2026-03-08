import { X } from 'lucide-react';

interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsHelpModal({ isOpen, onClose }: ShortcutsHelpModalProps) {
  if (!isOpen) return null;

  const shortcutSections = [
    {
      title: 'التنقل وبحث',
      items: [
        { keys: ['Ctrl', 'K'], desc: 'فتح لوحة الأوامر (اللوحة السريعة)' },
        { keys: ['/'], desc: 'التركيز على شريط البحث' },
        { keys: ['?'], desc: 'إظهار قائمة الاختصارات' },
      ]
    },
    {
      title: 'إدارة المهام',
      items: [
        { keys: ['C'], desc: 'إنشاء مهمة جديدة' },
        { keys: ['Esc'], desc: 'إغلاق النوافذ المنبثقة أو إلغاء الاختيار' },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">اختصارات لوحة المفاتيح</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {shortcutSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-medium text-slate-400 mb-3">{section.title}</h3>
              <div className="space-y-2">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-slate-300">{item.desc}</span>
                    <div className="flex items-center gap-1.5 ltr:flex-row-reverse rtl:flex-row">
                      {item.keys.map((key, keyIdx) => (
                        <div key={keyIdx} className="flex items-center">
                          {keyIdx > 0 && <span className="text-slate-500 text-xs px-1">+</span>}
                          <kbd className="min-w-[24px] h-6 flex items-center justify-center px-1.5 text-[11px] font-sans bg-slate-800 border border-slate-700 rounded text-slate-300 shadow-sm">
                            {key === 'Ctrl' ? (navigator.platform.includes('Mac') ? '⌘' : 'Ctrl') : key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
