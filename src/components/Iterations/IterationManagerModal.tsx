import { useState, useEffect } from 'react';
import { 
  X, Plus, Calendar, Save, Loader2, Trash2, 
  RotateCcw, Target, PlayCircle, CheckCircle2,
  Clock, AlertCircle
} from 'lucide-react';
import { useIterationStore } from '../../store/useIterationStore';
import { useListStore } from '../../store/useListStore';
import type { IterationStatus } from '../../types/iteration';

const STATUS_CONFIG: Record<IterationStatus, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  planned: { 
    label: 'مخطط لها', 
    icon: <Clock size={14} />, 
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/10'
  },
  active: { 
    label: 'نشطة حالياً', 
    icon: <PlayCircle size={14} />, 
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10'
  },
  completed: { 
    label: 'مكتملة', 
    icon: <CheckCircle2 size={14} />, 
    color: 'text-sky-400',
    bgColor: 'bg-sky-400/10'
  }
};

export function IterationManagerModal() {
  const { activeListId } = useListStore();
  const { 
    iterations, 
    isLoading, 
    isManagerModalOpen, 
    closeManagerModal,
    fetchIterations,
    createIteration,
    updateIteration,
    deleteIteration
  } = useIterationStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    status: 'planned' as IterationStatus
  });

  useEffect(() => {
    if (isManagerModalOpen && activeListId) {
      fetchIterations(activeListId);
    }
  }, [isManagerModalOpen, activeListId, fetchIterations]);

  if (!isManagerModalOpen) return null;

  const handleSave = async () => {
    if (!formData.name.trim() || !activeListId) return;

    if (editingId) {
      await updateIteration(editingId, formData);
    } else {
      await createIteration(activeListId, {
        ...formData,
        listId: activeListId
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      goal: '',
      startDate: '',
      endDate: '',
      status: 'planned'
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (iteration: any) => {
    setFormData({
      name: iteration.name,
      goal: iteration.goal || '',
      startDate: iteration.startDate ? new Date(iteration.startDate).toISOString().split('T')[0] : '',
      endDate: iteration.endDate ? new Date(iteration.endDate).toISOString().split('T')[0] : '',
      status: iteration.status
    });
    setEditingId(iteration.id);
    setIsAdding(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeManagerModal} />
      
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <RotateCcw size={20} className="text-sky-400" />
            إدارة الدورات (Iterations)
          </h2>
          <button onClick={closeManagerModal} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading && iterations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
              <Loader2 className="animate-spin" size={32} />
              <p>جاري تحميل الدورات...</p>
            </div>
          ) : (
            <>
              {/* Add/Edit Form */}
              {isAdding ? (
                <div className="p-6 bg-slate-800/40 border border-sky-500/30 rounded-2xl animate-in fade-in zoom-in duration-200">
                  <h3 className="text-sm font-medium text-slate-200 mb-6 flex items-center gap-2">
                    {editingId ? <RotateCcw size={16} /> : <Plus size={16} />}
                    {editingId ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">اسم الدورة</label>
                        <input 
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(df => ({ ...df, name: e.target.value }))}
                          placeholder="مثال: الدورة 1، Sprint 5..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1.5 block">الهدف</label>
                        <textarea 
                          value={formData.goal}
                          onChange={(e) => setFormData(df => ({ ...df, goal: e.target.value }))}
                          placeholder="ما الذي نهدف لتحقيقه في هذه الدورة؟"
                          rows={3}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500/50 resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-1.5 block">تاريخ البدء</label>
                          <input 
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData(df => ({ ...df, startDate: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500/50 scheme-dark"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-1.5 block">تاريخ الانتهاء</label>
                          <input 
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData(df => ({ ...df, endDate: e.target.value }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500/50 scheme-dark"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-2 block">الحالة</label>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(STATUS_CONFIG) as IterationStatus[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => setFormData(df => ({ ...df, status }))}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                                formData.status === status
                                  ? 'bg-sky-500/10 border-sky-500/50 text-sky-400'
                                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                              }`}
                            >
                              {STATUS_CONFIG[status].icon}
                              {STATUS_CONFIG[status].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-8">
                    <button 
                      onClick={handleSave}
                      disabled={!formData.name.trim() || isLoading}
                      className="flex-1 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      {editingId ? 'حفظ التغييرات' : 'إنشاء الدورة'}
                    </button>
                    <button 
                      onClick={resetForm}
                      className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-xl transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full py-4 flex items-center justify-center gap-2 border-2 border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-800/20 text-slate-400 hover:text-slate-200 rounded-2xl transition-all"
                  >
                    <Plus size={20} />
                    إنشاء دورة جديدة
                  </button>

                  <div className="grid gap-3">
                    {iterations.length > 0 ? (
                      iterations.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((it) => (
                        <div 
                          key={it.id}
                          className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl group hover:border-slate-600 transition-all flex items-start gap-4"
                        >
                          <div className={`p-2 rounded-lg shrink-0 ${STATUS_CONFIG[it.status].bgColor} ${STATUS_CONFIG[it.status].color}`}>
                            {STATUS_CONFIG[it.status].icon}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-semibold text-slate-100 truncate">{it.name}</h4>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => startEdit(it)}
                                  className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 rounded-lg transition-colors"
                                  title="تعديل"
                                >
                                  <RotateCcw size={14} />
                                </button>
                                <button 
                                  onClick={() => deleteIteration(it.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                  title="حذف"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            
                            {it.goal && (
                              <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed italic">
                                &quot;{it.goal}&quot;
                              </p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-medium tracking-wide">
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <Calendar size={12} className="text-slate-600" />
                                <span>
                                  {it.startDate ? new Date(it.startDate).toLocaleDateString('ar-EG') : 'بدون تاريخ'} 
                                  - 
                                  {it.endDate ? new Date(it.endDate).toLocaleDateString('ar-EG') : 'بدون تاريخ'}
                                </span>
                              </div>
                              <div className={`flex items-center gap-1.5 ${STATUS_CONFIG[it.status].color}`}>
                                <Target size={12} />
                                <span>{STATUS_CONFIG[it.status].label}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-slate-800/20 rounded-2xl border border-slate-800/50">
                        <AlertCircle size={32} className="mb-3 opacity-20" />
                        <p className="text-sm">لا توجد دورات مخططة حالياً</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-between items-center bg-slate-900/50">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">إدارة مراحل المشروع</p>
          <button 
            onClick={closeManagerModal}
            className="px-6 py-2 bg-slate-800 h-10 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
