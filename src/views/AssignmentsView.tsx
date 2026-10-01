import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Assignment, AssignmentSubmission } from '../types';
import { api } from '../services/api';

interface AssignmentsViewProps {
  assignments: Assignment[];
  onRefresh: () => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({ assignments, onRefresh }) => {
  const { currentUser, isMasterAdmin, canUpload } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'due-soon' | 'completed' | 'overdue'>('all');
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchSubmissions = async () => {
    if (!currentUser?.matricNo) return;
    try {
      const res = await api.getSubmissions(currentUser.matricNo);
      setSubmissions(res.submissions || []);
    } catch (e) {
      console.error('Failed to load submissions:', e);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [currentUser]);

  const getDaysLeft = (dueDateStr: string) => {
    const diff = new Date(dueDateStr).getTime() - Date.now();
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: 'Overdue', isOverdue: true, isDueSoon: false, badge: 'bg-red-950 text-red-300 border-red-800' };
    if (hours <= 24) return { text: `${hours}h Left 🔥`, isOverdue: false, isDueSoon: true, badge: 'bg-red-900 text-red-200 border-red-700 animate-pulse' };
    if (days === 1) return { text: '1 Day Left ⚠️', isOverdue: false, isDueSoon: true, badge: 'bg-amber-950 text-amber-300 border-amber-800' };
    if (days <= 3) return { text: `${days} Days Left`, isOverdue: false, isDueSoon: false, badge: 'bg-amber-950 text-amber-300 border-amber-800' };
    return { text: `${days} Days Left`, isOverdue: false, isDueSoon: false, badge: 'bg-slate-800 text-slate-300 border-slate-700' };
  };

  const handleToggleCompletion = async (assignmentId: string, currentStatus: string) => {
    if (!currentUser?.matricNo) return;
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await api.toggleSubmission({
        matricNo: currentUser.matricNo,
        assignmentId,
        status: newStatus,
      });
      await fetchSubmissions();
    } catch (e) {
      console.error('Failed to toggle submission:', e);
    }
  };

  const handleSaveDetailedSubmission = async (assignmentId: string) => {
    if (!currentUser?.matricNo) return;
    try {
      setLoading(true);
      await api.toggleSubmission({
        matricNo: currentUser.matricNo,
        assignmentId,
        status: 'completed',
        notes: submissionNotes.trim() || 'Submission finalized in LT-2 assignment box.',
      });
      setActionSuccess('Submission saved and marked as Completed!');
      await fetchSubmissions();
      setTimeout(() => {
        setActionSuccess('');
        setSelectedAssignment(null);
      }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastReminder = async (ass: Assignment) => {
    if (!currentUser?.matricNo || !isMasterAdmin) return;
    try {
      await api.sendAnnouncement({
        matricNo: currentUser.matricNo,
        title: `⚠️ URGENT REMINDER: ${ass.courseCode} ${ass.title.slice(0, 30)}...`,
        message: `Submission deadline approaching on ${new Date(ass.deadline).toLocaleDateString()} at ${new Date(ass.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Instructions: ${ass.instructions}. Ensure all submissions are turned in on time!`,
        priority: 'high',
        courseCode: ass.courseCode,
      });
      alert('Urgent broadcast reminder transmitted to all 114 students!');
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to send broadcast');
    }
  };

  const isCompleted = (id: string) => {
    const sub = submissions.find((s) => s.assignmentId === id);
    return sub?.status === 'completed';
  };

  const filteredAssignments = assignments.filter((ass) => {
    const completed = isCompleted(ass.id);
    const countdown = getDaysLeft(ass.deadline);

    if (activeTab === 'completed') return completed;
    if (activeTab === 'pending') return !completed && !countdown.isOverdue;
    if (activeTab === 'due-soon') return !completed && countdown.isDueSoon;
    if (activeTab === 'overdue') return !completed && countdown.isOverdue;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Assignment & Submission Tracker
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Track coursework deadlines, problem sets, and mark off completed submissions.
          </p>
        </div>

        {isMasterAdmin && (
          <div className="bg-amber-950 px-3 py-1.5 rounded-xl border border-amber-800 text-xs text-amber-200 flex items-center gap-1.5 font-bold">
            <span>👑</span>
            <span>Master Admin Reminder Controls Enabled</span>
          </div>
        )}
      </div>

      {/* Categorized Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-slate-900 border border-slate-800 p-2 rounded-xl shadow">
        {[
          { id: 'all', label: 'All Tasks', count: assignments.length, emoji: '📋' },
          { id: 'pending', label: 'Pending', count: assignments.filter((a) => !isCompleted(a.id) && !getDaysLeft(a.deadline).isOverdue).length, emoji: '⏳' },
          { id: 'due-soon', label: 'Due Soon (<24h)', count: assignments.filter((a) => !isCompleted(a.id) && getDaysLeft(a.deadline).isDueSoon).length, emoji: '🔥' },
          { id: 'completed', label: 'Completed', count: assignments.filter((a) => isCompleted(a.id)).length, emoji: '✅' },
          { id: 'overdue', label: 'Overdue', count: assignments.filter((a) => !isCompleted(a.id) && getDaysLeft(a.deadline).isOverdue).length, emoji: '⚠️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow border border-blue-400'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
            <span className="bg-slate-950 text-[10px] px-1.5 py-0.2 rounded font-mono ml-1">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Assignments List Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <span className="text-4xl">🎉</span>
          <p className="font-bold text-sm text-slate-200 mt-2">No assignments found in this category</p>
          <p className="text-xs text-slate-400 mt-1">All clear! Select "All Tasks" to view the full curriculum schedule.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((ass) => {
            const completed = isCompleted(ass.id);
            const countdown = getDaysLeft(ass.deadline);

            return (
              <div
                key={ass.id}
                className={`bg-slate-900 rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  completed
                    ? 'border-emerald-700/60 opacity-80'
                    : countdown.isOverdue
                    ? 'border-red-700'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="bg-blue-900 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">
                      {ass.courseCode}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${countdown.badge}`}>
                      {completed ? '✅ SUBMITTED' : countdown.text}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-white leading-snug mb-1">
                    {ass.title}
                  </h3>
                  <p className="text-xs text-slate-400 mb-2 font-medium">
                    Points: <strong className="text-amber-400">{ass.points} Marks</strong>
                  </p>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-3 mb-3">
                    {ass.description}
                  </p>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1 mb-3">
                    <div className="flex justify-between text-slate-400">
                      <span>Deadline:</span>
                      <span className="font-mono text-slate-200 font-bold">
                        {new Date(ass.deadline).toLocaleDateString()} ({new Date(ass.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>
                    <div className="text-slate-400">
                      Instructions: <span className="text-slate-300 font-medium">{ass.instructions}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleCompletion(ass.id, completed ? 'completed' : 'pending')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        completed
                          ? 'bg-emerald-950 border-emerald-600 text-emerald-200'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span>{completed ? '✅ Completed' : '⭕ Mark Done'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedAssignment(ass);
                        const sub = submissions.find((s) => s.assignmentId === ass.id);
                        setSubmissionNotes(sub?.notes || '');
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                    >
                      Submission Details →
                    </button>
                  </div>

                  {/* Broadcast Reminder Button (Master Admin only) */}
                  {isMasterAdmin && !completed && (
                    <button
                      onClick={() => handleBroadcastReminder(ass)}
                      className="w-full py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-200 rounded-xl text-[11px] font-bold border border-amber-700 cursor-pointer flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>📢</span>
                      <span>Broadcast Reminder to Unsubmitted Students</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Notes & Details Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-slate-850 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-blue-900 text-white text-xs font-bold px-2 py-0.5 rounded">
                  {selectedAssignment.courseCode}
                </span>
                <h3 className="font-extrabold text-slate-100 text-sm truncate max-w-xs">
                  {selectedAssignment.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {actionSuccess && (
                <div className="bg-emerald-950 border border-emerald-700 text-emerald-200 p-2.5 rounded-xl text-xs font-bold text-center">
                  ✅ {actionSuccess}
                </div>
              )}

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Course: <strong className="text-white">{selectedAssignment.courseCode}</strong></span>
                  <span>Max Score: <strong className="text-amber-400">{selectedAssignment.points} Marks</strong></span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Deadline: <strong className="text-red-400">{new Date(selectedAssignment.deadline).toLocaleString()}</strong></span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Task Guidelines & Instructions
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {selectedAssignment.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  My Submission Notes & Verification
                </h4>
                <textarea
                  rows={3}
                  placeholder="Add your submission reference (e.g. Submitted handwritten packet in LT-2 assignment box, signed by Class Rep)..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-850 p-3.5 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSaveDetailedSubmission(selectedAssignment.id)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold border border-emerald-500 shadow cursor-pointer transition-colors"
              >
                {loading ? 'Saving...' : '💾 Save & Mark Completed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
