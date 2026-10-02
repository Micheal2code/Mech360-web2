import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioContext';
import { Announcement, Course, CourseNote, LectureRecording, Assignment } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  announcements: Announcement[];
  courses?: Course[];
  notes?: CourseNote[];
  recordings?: LectureRecording[];
  assignments?: Assignment[];
  selectedLevel?: string | null;
  onSwitchLevel?: () => void;
  onNavigate?: (tab: string, extra?: any) => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  announcements,
  courses = [],
  notes = [],
  recordings = [],
  assignments = [],
  selectedLevel = '400',
  onSwitchLevel,
  onNavigate,
  onOpenAuth,
  onOpenProfile,
}) => {
  const { currentUser, isMasterAdmin, isAssistantAdmin, canUpload } = useAuth();
  const { isPlaying, currentLecture } = useAudioPlayer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Search Overlay States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const latestAnnouncement = (announcements || []).length > 0 ? announcements[0] : null;

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

                {/* Switch Academic Level Button */}
                {onSwitchLevel && (
                  <button
                    onClick={onSwitchLevel}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-950/80 hover:bg-blue-900 text-blue-200 hover:text-white rounded-xl border border-blue-700/80 text-xs font-black cursor-pointer transition-all shadow-sm"
                    title="Change Academic Level (200L / 300L / 400L / 500L)"
                  >
                    <span>🎓</span>
                    <span className="hidden sm:inline text-blue-300 font-extrabold">{selectedLevel}L</span>
                    <span className="text-[10px] text-blue-400">⇄</span>
                  </button>
                )}

                {/* Global Search Button */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 bg-blue-900/40 hover:bg-blue-800 text-blue-300 hover:text-white rounded-xl border border-blue-800 text-xs font-bold cursor-pointer"
                  title="Search Portal Resources"
                >
                  🔍 Search
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

      {/* Global Portal Resource Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-10 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden mt-10">
            {/* Search Input Box */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-850">
              <span className="text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                autoFocus
                placeholder="Search notes, assignments, recordings, courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* Results Area */}
            <div className="p-4 max-h-[400px] overflow-y-auto space-y-4">
              {searchQuery.trim() === '' ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Type any keyword to search across notes, tasks, recordings, and syllabi...
                </div>
              ) : (
                <>
                  {/* Category: Course Syllabi */}
                  {courses.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()) || c.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider">
                        📚 Departmental Courses ({courses.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()) || c.title.toLowerCase().includes(searchQuery.toLowerCase())).length})
                      </h4>
                      <div className="divide-y divide-slate-800/40 bg-slate-950/50 rounded-xl border border-slate-800/80 overflow-hidden">
                        {courses.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()) || c.title.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                          <button
                            key={c.code}
                            onClick={() => {
                              if (onNavigate) onNavigate('notes', { filterCourse: c.code });
                              else setActiveTab('notes');
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left p-2.5 hover:bg-slate-800/60 transition-colors flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-white font-mono">{c.code}</span>
                              <span className="text-slate-300 ml-2">{c.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">{c.units} Units</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Course Notes */}
                  {notes.filter(n => n.topic.toLowerCase().includes(searchQuery.toLowerCase()) || n.summary.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider">
                        📑 Course Notes & Materials ({notes.filter(n => n.topic.toLowerCase().includes(searchQuery.toLowerCase()) || n.summary.toLowerCase().includes(searchQuery.toLowerCase())).length})
                      </h4>
                      <div className="divide-y divide-slate-800/40 bg-slate-950/50 rounded-xl border border-slate-800/80 overflow-hidden">
                        {notes.filter(n => n.topic.toLowerCase().includes(searchQuery.toLowerCase()) || n.summary.toLowerCase().includes(searchQuery.toLowerCase())).map(n => (
                          <button
                            key={n.id}
                            onClick={() => {
                              if (onNavigate) onNavigate('notes', { filterCourse: n.courseCode });
                              else setActiveTab('notes');
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left p-2.5 hover:bg-slate-800/60 transition-colors text-xs"
                          >
                            <div className="flex items-center gap-1.5 font-semibold">
                              <span className="bg-slate-800 text-[10px] text-slate-400 px-1.5 py-0.2 rounded font-mono">{n.courseCode}</span>
                              <span className="text-white">{n.topic}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 truncate">{n.summary}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Lecture Recordings */}
                  {recordings.filter(r => r.topic.toLowerCase().includes(searchQuery.toLowerCase()) || r.notes.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider">
                        🎧 Audio Lecture Recordings ({recordings.filter(r => r.topic.toLowerCase().includes(searchQuery.toLowerCase()) || r.notes.toLowerCase().includes(searchQuery.toLowerCase())).length})
                      </h4>
                      <div className="divide-y divide-slate-800/40 bg-slate-950/50 rounded-xl border border-slate-800/80 overflow-hidden">
                        {recordings.filter(r => r.topic.toLowerCase().includes(searchQuery.toLowerCase()) || r.notes.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                          <button
                            key={r.id}
                            onClick={() => {
                              setActiveTab('audio');
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left p-2.5 hover:bg-slate-800/60 transition-colors text-xs"
                          >
                            <div className="flex items-center gap-1.5 font-semibold">
                              <span className="bg-slate-800 text-[10px] text-slate-400 px-1.5 py-0.2 rounded font-mono">{r.courseCode}</span>
                              <span className="text-white">{r.topic}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 truncate">By {r.lecturer} • {r.duration}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category: Assignments */}
                  {assignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider">
                        📅 Post Assignments & Deadlines ({assignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase())).length})
                      </h4>
                      <div className="divide-y divide-slate-800/40 bg-slate-950/50 rounded-xl border border-slate-800/80 overflow-hidden">
                        {assignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase())).map(a => (
                          <button
                            key={a.id}
                            onClick={() => {
                              setActiveTab('assignments');
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left p-2.5 hover:bg-slate-800/60 transition-colors text-xs"
                          >
                            <div className="flex items-center gap-1.5 font-semibold">
                              <span className="bg-slate-800 text-[10px] text-slate-400 px-1.5 py-0.2 rounded font-mono">{a.courseCode}</span>
                              <span className="text-white">{a.title}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 truncate">{a.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Zero Matches State */}
                  {courses.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()) || c.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 &&
                    notes.filter(n => n.topic.toLowerCase().includes(searchQuery.toLowerCase()) || n.summary.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 &&
                    recordings.filter(r => r.topic.toLowerCase().includes(searchQuery.toLowerCase()) || r.notes.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 &&
                    assignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        ⚠️ No results found matching "{searchQuery}". Try searching with a different term.
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
