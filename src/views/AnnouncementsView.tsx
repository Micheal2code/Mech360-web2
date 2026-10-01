import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Announcement, Course } from '../types';
import { api } from '../services/api';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  courses: Course[];
  onRefresh: () => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  courses,
  onRefresh,
}) => {
  const { currentUser, isMasterAdmin, canUpload } = useAuth();

  const [activeFilter, setActiveTabFilter] = useState<'all' | 'critical' | 'high' | 'info'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'high' | 'critical' | 'info'>('high');
  const [courseCode, setCourseCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const filteredAnnouncements = announcements.filter((ann) => {
    if (activeFilter !== 'all' && ann.priority !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ann.title.toLowerCase().includes(q);
      const matchMessage = ann.message.toLowerCase().includes(q);
      const matchSender = ann.senderName.toLowerCase().includes(q);
      if (!matchTitle && !matchMessage && !matchSender) return false;
    }
    return true;
  });

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.matricNo) return;
    try {
      setLoading(true);
      await api.sendAnnouncement({
        matricNo: currentUser.matricNo,
        title: title.trim(),
        message: message.trim(),
        priority,
        courseCode: courseCode || undefined,
      });

      setSuccessMsg('Announcement published to class feed!');
      setTitle('');
      setMessage('');
      setCourseCode('');
      onRefresh();
      setTimeout(() => {
        setSuccessMsg('');
        setIsPostingModalOpen(false);
      }, 1500);
    } catch (e: any) {
      alert(e.message || 'Failed to post announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📢</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Official Class Announcements
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Departmental updates, exam schedule notices, project deadlines, and urgent messages posted by Master Admin Micheal Chukwuemeka OBI and Assistant Admins.
          </p>
        </div>

        {canUpload ? (
          <button
            onClick={() => setIsPostingModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-amber-400 shadow flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>➕</span>
            <span>Post Announcement</span>
          </button>
        ) : (
          <div className="text-[11px] font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            🔒 Official Feed (Admin Managed)
          </div>
        )}
      </div>

      {/* Priority Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Notices ({announcements.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'critical'
                ? 'bg-red-700 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🚨</span>
            <span>Critical</span>
          </button>
          <button
            onClick={() => setActiveTabFilter('high')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'high'
                ? 'bg-amber-700 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚠️</span>
            <span>High Priority</span>
          </button>
          <button
            onClick={() => setActiveTabFilter('info')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'info'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>ℹ️</span>
            <span>General Info</span>
          </button>
        </div>

        <input
          type="text"
          placeholder="Search announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none shadow sm:w-64"
        />
      </div>

      {/* Announcements Feed */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <span className="text-4xl">📢</span>
          <p className="font-bold text-sm text-slate-200">No announcements published yet</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {canUpload
              ? 'Click the "Post Announcement" button above to issue a class update.'
              : 'Class notices and general updates from the Master Admin and Assistant Admins will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => {
            const isCritical = ann.priority === 'critical';
            const isHigh = ann.priority === 'high';

            return (
              <div
                key={ann.id}
                className={`p-5 rounded-2xl border transition-all shadow ${
                  isCritical
                    ? 'bg-red-950/40 border-red-700'
                    : isHigh
                    ? 'bg-amber-950/30 border-amber-700/80'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isCritical
                          ? 'bg-red-700 text-white'
                          : isHigh
                          ? 'bg-amber-700 text-white'
                          : 'bg-blue-800 text-white'
                      }`}
                    >
                      {ann.priority === 'critical' ? '🚨 CRITICAL' : ann.priority === 'high' ? '⚠️ HIGH PRIORITY' : 'ℹ️ INFO'}
                    </span>

                    {ann.courseCode && (
                      <span className="bg-slate-950 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-800">
                        {ann.courseCode}
                      </span>
                    )}

                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      {ann.title}
                    </h3>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(ann.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans mt-2 whitespace-pre-wrap">
                  {ann.message}
                </p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span>👑 Author:</span>
                    <strong className="text-slate-200">{ann.senderName}</strong>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${ann.title}\n\n${ann.message}`);
                      alert('Announcement text copied to clipboard!');
                    }}
                    className="text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                  >
                    📋 Copy Notice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Announcement Modal for Admins & Assistant Admins */}
      {isPostingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-850 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📢</span>
                <h3 className="font-extrabold text-white text-sm">Post General Class Announcement</h3>
              </div>
              <button
                onClick={() => setIsPostingModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-5 space-y-4">
              {successMsg && (
                <div className="bg-emerald-950 border border-emerald-700 text-emerald-200 p-2.5 rounded-xl text-xs font-bold text-center">
                  ✅ {successMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Semester Exam Venue Shift & Timetable Notice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none shadow"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl p-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="high">⚠️ High Priority</option>
                    <option value="critical">🚨 Critical Urgent</option>
                    <option value="info">ℹ️ General Info</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Target Course (Optional)
                  </label>
                  <select
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl p-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="">General (All Courses)</option>
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Announcement Message / Notice Body
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type the full message details..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPostingModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold border border-amber-400 shadow cursor-pointer transition-colors"
                >
                  {loading ? 'Publishing...' : '📢 Broadcast Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
