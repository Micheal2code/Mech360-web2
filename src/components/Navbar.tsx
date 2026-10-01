import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioContext';
import { Announcement } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  announcements: Announcement[];
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  announcements,
  onOpenAuth,
  onOpenProfile,
}) => {
  const { currentUser, isMasterAdmin, isAssistantAdmin, canUpload } = useAuth();
  const { isPlaying, currentLecture } = useAudioPlayer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
    { id: 'announcements', label: 'Announcements', emoji: '📢' },
    { id: 'notes', label: 'Course Notes', emoji: '📚' },
    { id: 'pdf-requests', label: 'PDF Requests', emoji: '📄' },
    { id: 'audio', label: 'Audio Lectures', emoji: '🎧' },
    { id: 'assignments', label: 'Assignments', emoji: '📅' },
    { id: 'chat', label: 'Commons Chat', emoji: '💬' },
    { id: 'feedback', label: 'App Suggestions', emoji: '💡' },
    { id: 'tutor', label: 'CourseMate AI', emoji: '🤖' },
  ];

  if (canUpload) {
    navItems.push({ id: 'admin', label: 'Admin Portal', emoji: '🛡️' });
  }

  const latestAnnouncement = announcements.length > 0 ? announcements[0] : null;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 shadow-md">
      {/* Top Urgent Broadcast Banner */}
      {latestAnnouncement && (
        <div className="bg-red-950 border-b border-red-800 text-red-100 text-xs px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="bg-red-700 text-white font-bold px-1.5 py-0.2 rounded text-[10px] uppercase">
              {latestAnnouncement.priority === 'critical' ? '🚨 CRITICAL' : '📢 BROADCAST'}
            </span>
            <span className="font-semibold text-red-200">{latestAnnouncement.title}:</span>
            <span className="text-red-300 truncate max-w-xl">{latestAnnouncement.message}</span>
          </div>
        </div>
      )}

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Department Tag */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-700 border border-blue-500 flex items-center justify-center text-xl shadow">
              ⚙️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">ClassHub</span>
                <span className="bg-blue-900/90 text-blue-200 text-[10px] font-bold px-1.5 py-0.2 rounded border border-blue-700">
                  MEE 400L
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Mechanical Engineering Departmental Portal
              </p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow border border-blue-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-sm">{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Controls */}
          <div className="flex items-center gap-3">
            {/* Audio Mini-Status */}
            {currentLecture && (
              <button
                onClick={() => setActiveTab('audio')}
                className={`hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer ${
                  isPlaying
                    ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <span>{isPlaying ? '🔊' : '🎧'}</span>
                <span className="truncate max-w-[110px]">{currentLecture.courseCode} Audio</span>
              </button>
            )}

            {/* Student Profile Button (Opens clean Profile Modal) */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-1.5 rounded-xl text-left transition-colors cursor-pointer"
                >
                  <span className="text-base">{currentUser.avatarEmoji || '🎓'}</span>
                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white truncate max-w-[120px]">
                        {currentUser.fullName}
                      </span>
                      {isMasterAdmin && (
                        <span className="bg-amber-900 text-amber-200 border border-amber-600 text-[8px] font-extrabold px-1 rounded">
                          ADMIN
                        </span>
                      )}
                      {isAssistantAdmin && (
                        <span className="bg-indigo-900 text-indigo-200 border border-indigo-600 text-[8px] font-extrabold px-1 rounded">
                          UPLOADER
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {currentUser.matricNo}
                    </div>
                  </div>
                </button>

                {/* Switch Session (Matric Login Modal) */}
                <button
                  onClick={onOpenAuth}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-bold cursor-pointer"
                  title="Switch / Login"
                >
                  🔄
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs border border-blue-400 shadow flex items-center gap-1.5 cursor-pointer"
              >
                <span>🔒</span>
                <span>Matric Login</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white border border-blue-400'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
