import { useState, useCallback, useRef } from 'react';
import {
  X, Upload, Download, FileText, ArrowLeft, ArrowRight,
  CheckCircle2, AlertTriangle, Loader2
} from 'lucide-react';
import { importService, type ImportPreview, type ImportProgress, type ColumnMapping } from '../../services/importService';

type Step = 'upload' | 'preview' | 'importing' | 'done';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  defaultStatus: string;
  onImportComplete: (count: number) => void;
}

export function ImportModal({ isOpen, onClose, listId, defaultStatus, onImportComplete }: ImportModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping[]>([]);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setMapping([]);
    setProgress(null);
    setError(null);
    setImportedCount(0);
    setIsDragOver(false);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  const handleFile = async (f: File) => {
    setFile(f);
    setError(null);
    try {
      const p = await importService.parseCSV(f);
      setPreview(p);
      setMapping(importService.autoDetectMapping(p.headers));
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل قراءة الملف');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      handleFile(droppedFile);
    } else {
      setError('يرجى رفع ملف CSV فقط');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleCommit = async () => {
    if (!preview) return;
    setStep('importing');
    setError(null);
    try {
      const created = await importService.commitImport(listId, preview.rows, defaultStatus, (p) => {
        setProgress(p);
      });
      setImportedCount(created.length);
      setStep('done');
      onImportComplete(created.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الاستيراد');
      setStep('preview');
    }
  };

  const updateMapping = (csvHeader: string, taskField: string) => {
    setMapping(prev => prev.map(m => m.csvHeader === csvHeader ? { ...m, taskField: taskField as ColumnMapping['taskField'] } : m));
  };

  const stepTitle: Record<Step, string> = {
    upload: 'رفع ملف CSV',
    preview: 'معاينة البيانات',
    importing: 'جارٍ الاستيراد...',
    done: 'تم الاستيراد بنجاح',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Upload size={20} className="text-emerald-400" />
            {stepTitle[step]}
          </h2>
          <button onClick={handleClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-2 py-3 border-b border-slate-800/50 shrink-0">
          {(['upload', 'preview', 'importing', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
                step === s ? 'bg-sky-500' : i < ['upload', 'preview', 'importing', 'done'].indexOf(step) ? 'bg-sky-500/50' : 'bg-slate-700'
              }`} />
              {i < 3 && <div className="w-8 h-px bg-slate-700" />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* Step: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Template Download */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-sm text-slate-300 mb-2">حمّل قالب CSV لتسهيل عملية الاستيراد:</p>
                <button
                  onClick={() => importService.downloadTemplate()}
                  className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  تحميل القالب
                </button>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-sky-500 bg-sky-500/5'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <Upload size={40} className={`mx-auto mb-3 ${isDragOver ? 'text-sky-400' : 'text-slate-500'}`} />
                <p className="text-sm text-slate-300 mb-1">اسحب ملف CSV هنا أو انقر للاختيار</p>
                <p className="text-xs text-slate-500">يجب أن يكون الملف بصيغة .csv</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {file && (
                <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
                  <FileText size={16} className="text-sky-400" />
                  <span className="text-sm text-slate-300">{file.name}</span>
                  <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && preview && (
            <div className="space-y-5">
              {/* Column Mapping */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3">تعيين الأعمدة</h3>
                <div className="space-y-2">
                  {mapping.map(m => (
                    <div key={m.csvHeader} className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-3 py-2">
                      <span className="text-sm text-slate-400 w-32 truncate" title={m.csvHeader}>{m.csvHeader}</span>
                      <ArrowLeft size={14} className="text-slate-600 shrink-0" />
                      <select
                        value={m.taskField}
                        onChange={(e) => updateMapping(m.csvHeader, e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="__skip__">— تخطّي —</option>
                        <option value="title">العنوان</option>
                        <option value="description">الوصف</option>
                        <option value="status">الحالة</option>
                        <option value="priority">الأولوية</option>
                        <option value="dueDate">الموعد النهائي</option>
                        <option value="tags">الوسوم</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Preview Table */}
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-3">
                  معاينة البيانات ({preview.totalRows} صف)
                </h3>
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-800/80">
                        {preview.headers.map(h => (
                          <th key={h} className="px-3 py-2 text-right text-xs font-medium text-slate-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="border-t border-slate-800/50 hover:bg-slate-800/30">
                          {preview.headers.map(h => {
                            const field = mapping.find(m => m.csvHeader === h)?.taskField;
                            const value = field && field !== '__skip__' ? row[field] : '';
                            return (
                              <td key={h} className="px-3 py-2 text-slate-300 whitespace-nowrap max-w-[200px] truncate">{value || '—'}</td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.totalRows > 5 && (
                    <div className="text-center py-2 text-xs text-slate-500 border-t border-slate-800/50">
                      ... و {preview.totalRows - 5} صفوف أخرى
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step: Importing */}
          {step === 'importing' && progress && (
            <div className="py-8 text-center space-y-5">
              <Loader2 size={40} className="mx-auto text-sky-400 animate-spin" />
              <div>
                <p className="text-sm text-slate-300 mb-2">
                  جارٍ استيراد المهام... {progress.processed} / {progress.total}
                </p>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(progress.processed / progress.total) * 100}%` }}
                  />
                </div>
              </div>
              {progress.errors.length > 0 && (
                <div className="text-right text-xs text-amber-400 space-y-1">{progress.errors.map((e, i) => <p key={i}>{e}</p>)}</div>
              )}
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
              <p className="text-lg text-slate-200">تم استيراد {importedCount} مهمة بنجاح!</p>
              {progress && progress.errors.length > 0 && (
                <p className="text-sm text-amber-400">{progress.errors.length} أخطاء أثناء الاستيراد</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div>
            {step === 'preview' && (
              <button
                onClick={() => { setStep('upload'); setPreview(null); setFile(null); }}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
              >
                <ArrowRight size={14} />
                رجوع
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              {step === 'done' ? 'إغلاق' : 'إلغاء'}
            </button>
            {step === 'preview' && (
              <button
                onClick={handleCommit}
                className="px-5 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Upload size={16} />
                بدء الاستيراد ({preview?.totalRows} مهمة)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
