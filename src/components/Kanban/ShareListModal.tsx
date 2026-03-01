import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Link as LinkIcon, Check, Shield, UserX, Loader2 } from 'lucide-react';
import { useListStore } from '../../store/useListStore';
import type { Role } from '../../services/sharingService';

export function ShareListModal() {
  const {
    isShareModalOpen,
    closeShareModal,
    contextListId,
    listMembers,
    fetchListMembers,
    inviteMember,
    updateMemberRole,
    removeMember
  } = useListStore();

  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('editor');
  const [isCopied, setIsCopied] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  useEffect(() => {
    if (isShareModalOpen && contextListId) {
      fetchListMembers(contextListId);
    }
  }, [isShareModalOpen, contextListId, fetchListMembers]);

  if (!isShareModalOpen || !contextListId) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setIsInviting(true);
    await inviteMember(contextListId, email, selectedRole);
    setEmail('');
    setIsInviting(false);
  };

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    setLoadingActionId(memberId);
    await updateMemberRole(contextListId, memberId, newRole);
    setLoadingActionId(null);
  };

  const handleRemove = async (memberId: string) => {
    setLoadingActionId(memberId);
    await removeMember(contextListId, memberId);
    setLoadingActionId(null);
  };

  const copyLink = () => {
    // Mock generating and copying link
    navigator.clipboard.writeText(`https://hayah.app/invite/${contextListId}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const roleLabels: Record<Role, string> = {
    owner: 'مدير',
    editor: 'محرر',
    viewer: 'مشاهد'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-2 text-slate-100 font-semibold">
              <Users size={18} className="text-sky-400" />
              مشاركة اللوحة
            </div>
            <button
              onClick={closeShareModal}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-6 overflow-y-auto">
            {/* Invite Form */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">دعوة أشخاص</label>
              <form onSubmit={handleInvite} className="flex gap-2 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل البريد الإلكتروني..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  disabled={isInviting}
                />

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-300 outline-none focus:border-sky-500"
                  disabled={isInviting}
                >
                  <option value="viewer">{roleLabels.viewer}</option>
                  <option value="editor">{roleLabels.editor}</option>
                  <option value="owner">{roleLabels.owner}</option>
                </select>

                <button
                  type="submit"
                  disabled={!email.trim() || isInviting}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center min-w-[70px]"
                >
                  {isInviting ? <Loader2 size={16} className="animate-spin" /> : 'دعوة'}
                </button>
              </form>
            </div>

            {/* Members List */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                الأعضاء <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{listMembers.length}</span>
              </h3>

              <div className="flex flex-col gap-2">
                {listMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {member.user.avatar ? (
                          <img src={member.user.avatar} alt={member.user.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {member.user.name.charAt(0)}
                          </div>
                        )}
                        {member.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-200">{member.user.name}</span>
                        <span className="text-xs text-slate-500">{member.user.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {loadingActionId === member.id ? (
                        <div className="px-3 py-1.5"><Loader2 size={14} className="animate-spin text-slate-400" /></div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                            className="bg-transparent text-sm text-slate-400 hover:bg-slate-700/50 rounded px-2 py-1 outline-none cursor-pointer border border-transparent hover:border-slate-600"
                          >
                            <option value="viewer">{roleLabels.viewer}</option>
                            <option value="editor">{roleLabels.editor}</option>
                            <option value="owner">{roleLabels.owner}</option>
                          </select>

                          <button
                            onClick={() => handleRemove(member.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                            title="إزالة العضو"
                          >
                            <UserX size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer (Link Copier) */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Shield size={16} />
              <span>أي شخص لديه الرابط يمكنه المشاهدة</span>
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-600 hover:border-slate-500 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium"
            >
              {isCopied ? (
                <>
                  <Check size={14} className="text-green-400" />
                  <span className="text-green-400">تم النسخ!</span>
                </>
              ) : (
                <>
                  <LinkIcon size={14} />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
