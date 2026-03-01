import { useRef, useState } from 'react';
import { useTaskDetailStore } from '../../store/useTaskDetailStore';
import {
  Upload,
  Trash2,
  Download,
  FileText,
  FileImage,
  File,
} from 'lucide-react';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <FileImage size={20} className="text-emerald-400" />;
  if (mimeType.includes('pdf')) return <FileText size={20} className="text-red-400" />;
  return <File size={20} className="text-slate-400" />;
}

export function AttachmentSection() {
  const { selectedTask, uploadAttachment, removeAttachment } = useTaskDetailStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!selectedTask) return null;

  const attachments = selectedTask.attachments;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => uploadAttachment(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Drag & drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragging
          ? 'border-sky-500 bg-sky-500/5'
          : 'border-slate-700 hover:border-slate-600 bg-slate-800/20'
          }`}
      >
        <Upload size={28} className={`mx-auto mb-2 ${isDragging ? 'text-sky-400' : 'text-slate-500'}`} />
        <p className="text-sm text-slate-400">
          اسحب الملفات هنا أو <span className="text-sky-400">انقر للاختيار</span>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File list */}
      {attachments.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">لا توجد مرفقات</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 group hover:border-slate-600 transition-colors"
            >
              {/* Icon / Preview */}
              {att.mimeType.startsWith('image/') ? (
                <img
                  src={att.url}
                  alt={att.name}
                  className="w-10 h-10 rounded object-cover border border-slate-700"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">
                  {getFileIcon(att.mimeType)}
                </div>
              )}

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{att.name}</p>
                <p className="text-xs text-slate-500">
                  {formatSize(att.size)} · {new Date(att.uploadedAt).toLocaleDateString('ar-EG', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={att.url}
                  download={att.name}
                  className="p-1.5 text-slate-400 hover:text-sky-400 rounded transition-colors"
                  title="تحميل"
                >
                  <Download size={14} />
                </a>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded transition-colors"
                  title="حذف"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
