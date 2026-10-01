import React from 'react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout, isMasterAdmin, isAssistantAdmin } = useAuth();

  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-850 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{currentUser.avatarEmoji || '🎓'}</span>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm">Student Academic Profile</h3>
              <p className="text-[11px] text-slate-400">ClassHub Departmental Identity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Identity Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Full Name
              </span>
              <span className="text-base font-extrabold text-white">{currentUser.fullName}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Matric Number
                </span>
                <span className="text-xs font-mono font-bold text-blue-400">{currentUser.matricNo}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Class Role
                </span>
                <span className="text-xs font-bold">
                  {isMasterAdmin ? (
                    <span className="text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-700">
                      Master Admin
                    </span>
                  ) : isAssistantAdmin ? (
                    <span className="text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-700">
                      Assistant Admin (Upload Only)
                    </span>
                  ) : (
                    <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      Regular Student
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Department
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {currentUser.department || 'Mechanical Engineering'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Academic Level
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {currentUser.level || '400 Level'}
                </span>
              </div>
            </div>

            {currentUser.email && (
              <div className="pt-2 border-t border-slate-900">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Official Email
                </span>
                <span className="text-xs text-slate-300 font-mono">{currentUser.email}</span>
              </div>
            )}
          </div>

          {/* Privacy & Security Shield Notice */}
          <div className="bg-blue-950/40 border border-blue-800/80 p-3 rounded-xl text-xs text-blue-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span>🔒</span>
              <span>Privacy Shield Protected</span>
            </div>
            <p className="text-[11px] text-blue-300 leading-relaxed">
              Your matriculation credentials are confirmed against the official 400L register. Your sensitive information is never revealed to peers in public channels.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-200 rounded-xl text-xs font-bold border border-red-700 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
