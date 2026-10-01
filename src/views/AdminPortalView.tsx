import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentRecord } from '../data/rosterData';
import { AuditLog, Course, CourseNote, StudentPasswordRecord, Assignment, PdfRequest } from '../types';
import { api } from '../services/api';

interface AdminPortalViewProps {
  courses: Course[];
  assignments: Assignment[];
  pdfRequests: PdfRequest[];
  onRefreshAll: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ courses, assignments, pdfRequests, onRefreshAll }) => {
  const { currentUser, isMasterAdmin, isAssistantAdmin, canUpload } = useAuth();

  const [activeTab, setActiveTab] = useState<'courses' | 'upload-note' | 'upload-audio' | 'assignment' | 'broadcast' | 'roster' | 'assistants' | 'passwords' | 'audit' | 'reset-codes' | 'progress-monitor'>('courses');
  const [roster, setRoster] = useState<StudentRecord[]>([]);
  const [passwordsList, setPasswordsList] = useState<StudentPasswordRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [resetCodes, setResetCodes] = useState<any[]>([]);
  const [monitorData, setMonitorData] = useState<any[]>([]);
  const [rosterSearch, setRosterSearch] = useState('');
  const [passwordsSearch, setPasswordsSearch] = useState('');
  const [showPlainText, setShowPlainText] = useState<Record<string, boolean>>({});
  const [resetModalStudent, setResetModalStudent] = useState<{ matricNo: string; fullName: string } | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Add Course Form State
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseUnits, setCourseUnits] = useState(3);
  const [courseLecturer, setCourseLecturer] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseEmoji, setCourseEmoji] = useState('⚙️');

  // Upload Note Form State
  const [uploadCourseCode, setUploadCourseCode] = useState('');
  const [uploadTopic, setUploadTopic] = useState('');
  const [uploadLecturer, setUploadLecturer] = useState('');
  const [uploadSummary, setUploadSummary] = useState('');
  const [uploadFullContent, setUploadFullContent] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadSemester, setUploadSemester] = useState<'Harmattan Semester' | 'Rain Semester'>('Harmattan Semester');

  // Upload Audio Recording Form State
  const [audioCourseCode, setAudioCourseCode] = useState('');
  const [audioTopic, setAudioTopic] = useState('');
  const [audioLecturer, setAudioLecturer] = useState('');
  const [audioDuration, setAudioDuration] = useState('25:00');
  const [audioNotes, setAudioNotes] = useState('');
  const [audioTimestampsText, setAudioTimestampsText] = useState('00:00 - Introduction & Review\n08:30 - Core Formula Derivation\n18:15 - Worked Numerical Example');
  const [audioSemester, setAudioSemester] = useState<'Harmattan Semester' | 'Rain Semester'>('Harmattan Semester');

  // Post Assignment Form State
  const [assCourseCode, setAssCourseCode] = useState('');
  const [assTitle, setAssTitle] = useState('');
  const [assDescription, setAssDescription] = useState('');
  const [assDeadline, setAssDeadline] = useState('');
  const [assPoints, setAssPoints] = useState(20);
  const [assInstructions, setAssInstructions] = useState('Submit physical hardcopy in LT-2 Department Assignment Box.');
  const [assAttachment, setAssAttachment] = useState('');
  const [assSemester, setAssSemester] = useState<'Harmattan Semester' | 'Rain Semester'>('Harmattan Semester');

  // Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'high' | 'critical' | 'info'>('high');
  const [broadcastCourse, setBroadcastCourse] = useState('');

  const fetchAdminData = async () => {
    if (!currentUser?.matricNo) return;
    try {
      setLoading(true);
      if (isMasterAdmin || canUpload) {
        const [rosterRes, logsRes, passRes, resetRes, monitorRes] = await Promise.all([
          isMasterAdmin ? api.getRoster(currentUser.matricNo) : Promise.resolve({ roster: [] }),
          isMasterAdmin ? api.getAuditLogs(currentUser.matricNo) : Promise.resolve({ logs: [] }),
          isMasterAdmin ? api.getAdminPasswords(currentUser.matricNo) : Promise.resolve({ passwords: [] }),
          api.getAdminResetCodes(currentUser.matricNo),
          api.getProgressMonitor(currentUser.matricNo),
        ]);
        setRoster(rosterRes.roster || []);
        setAuditLogs(logsRes.logs || []);
        setPasswordsList(passRes.passwords || []);
        setResetCodes(resetRes.requests || []);
        setMonitorData(monitorRes.monitor || []);
      }
    } catch (e) {
      console.error('Error fetching admin portal data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [isMasterAdmin]);

  useEffect(() => {
    const allowedAssistantTabs = ['courses', 'upload-note', 'assignment'];
    if (!isMasterAdmin && !allowedAssistantTabs.includes(activeTab)) {
      setActiveTab('courses');
    }
  }, [isMasterAdmin, activeTab]);

  // Set default course codes when courses load
  useEffect(() => {
    if (courses.length > 0) {
      if (!uploadCourseCode) setUploadCourseCode(courses[0].code);
      if (!audioCourseCode) setAudioCourseCode(courses[0].code);
      if (!assCourseCode) setAssCourseCode(courses[0].code);
    }
  }, [courses]);

  if (!canUpload) {
    return (
      <div className="bg-red-950 border-2 border-red-700 rounded-2xl p-8 text-center text-red-200">
        <span className="text-4xl">🚨</span>
        <h2 className="text-lg font-extrabold mt-2">Access Restricted</h2>
        <p className="text-xs text-red-300 mt-1">
          You do not have administrative upload permissions. Contact Master Admin Micheal Chukwuemeka OBI.
        </p>
      </div>
    );
  }

  // Handle Add Course
  const handleAddCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.matricNo || !isMasterAdmin) return;
    try {
      setLoading(true);
      await api.addCourse({
        adminMatric: currentUser.matricNo,
        code: courseCode.trim().toUpperCase(),
        title: courseTitle.trim(),
        units: Number(courseUnits) || 3,
        lecturer: courseLecturer.trim() || 'Department Lecturer',
        description: courseDescription.trim() || '400L Mechanical Engineering Course',
        iconEmoji: courseEmoji || '⚙️',
      });

      setActionSuccess(`Course ${courseCode.toUpperCase()} added successfully!`);
      setCourseCode('');
      setCourseTitle('');
      setCourseLecturer('');
      setCourseDescription('');
      onRefreshAll();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (e: any) {
      alert(e.message || 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (code: string) => {
    if (!currentUser?.matricNo || !isMasterAdmin) return;
    if (!confirm(`Are you sure you want to delete course ${code}?`)) return;
    try {
      await api.deleteCourse(code, currentUser.matricNo);
      onRefreshAll();
    } catch (e: any) {
      alert(e.message || 'Failed to delete course');
    }
  };

  // Handle Upload Note
  const handleUploadNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.matricNo) return;
    try {
      setLoading(true);
      const selectedCourse = courses.find((c) => c.code === uploadCourseCode);
      await api.uploadNote({
        matricNo: currentUser.matricNo,
        courseCode: uploadCourseCode || 'MEE 401',
        courseTitle: selectedCourse?.title || 'Mechanical Engineering Course',
        topic: uploadTopic.trim(),
        lecturer: uploadLecturer.trim() || selectedCourse?.lecturer || 'Department Lecturer',
        summary: uploadSummary.trim(),
        fullContent: uploadFullContent.trim() || uploadSummary.trim(),
        tags: uploadTags.split(',').map((t) => t.trim()).filter(Boolean),
        semester: uploadSemester,
      } as any);

      setActionSuccess('Course note published to repository successfully!');
      setUploadTopic('');
      setUploadSummary('');
      setUploadFullContent('');
      setUploadTags('');
      onRefreshAll();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (e: any) {
      alert(e.message || 'Failed to upload note');
    } finally {
      setLoading(false);
    }
  };

  // Handle Upload Audio
  const handleUploadAudioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.matricNo) return;
    try {
      setLoading(true);
      const parsedTimestamps = audioTimestampsText
        .split('\n')
        .map((line) => {
          const parts = line.split('-');
          if (parts.length >= 2) {
            const timeStr = parts[0].trim();
            const label = parts.slice(1).join('-').trim();
            const [min, sec] = timeStr.split(':').map((s) => parseInt(s, 10) || 0);
            return { time: timeStr, seconds: min * 60 + sec, label };
          }
          return null;
        })
        .filter(Boolean) as { time: string; seconds: number; label: string }[];

      await api.uploadRecording({
        matricNo: currentUser.matricNo,
        courseCode: audioCourseCode || 'MEE 401',
        topic: audioTopic.trim(),
        lecturer: audioLecturer.trim() || 'Department Lecturer',
        duration: audioDuration.trim() || '25:00',
        audioUrl: 'https://cdn.freesound.org/previews/568/568019_11861866-lq.mp3',
        timestamps: parsedTimestamps.length > 0 ? parsedTimestamps : [{ time: '00:00', seconds: 0, label: 'Lecture Intro' }],
        notes: audioNotes.trim() || 'Lecture audio notes.',
        semester: audioSemester,
      } as any);

      setActionSuccess('Lecture audio uploaded successfully!');
      setAudioTopic('');
      setAudioLecturer('');
      setAudioNotes('');
      onRefreshAll();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (e: any) {
      alert(e.message || 'Failed to upload recording');
    } finally {
      setLoading(false);
    }
  };

  // Handle Post Assignment
  const handlePostAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.matricNo) return;
    try {
      setLoading(true);
      await api.createAssignment({
        matricNo: currentUser.matricNo,
        courseCode: assCourseCode || 'MEE 401',
        title: assTitle.trim(),
        description: assDescription.trim(),
        deadline: assDeadline ? new Date(assDeadline).toISOString() : new Date(Date.now() + 86400000 * 5).toISOString(),
        points: Number(assPoints) || 20,
        instructions: assInstructions.trim(),
        attachmentName: assAttachment.trim() || undefined,
        semester: assSemester,
      } as any);

      setActionSuccess('Assignment posted successfully!');
      setAssTitle('');
      setAssDescription('');
      setAssAttachment('');
      onRefreshAll();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (e: any) {
      alert(e.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  // Handle Broadcast
  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.matricNo || !isMasterAdmin) return;
    try {
      setLoading(true);
      await api.sendAnnouncement({
        matricNo: currentUser.matricNo,
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        priority: broadcastPriority,
        courseCode: broadcastCourse || undefined,
      });

      setActionSuccess('Broadcast announcement transmitted to all 114 students!');
      setBroadcastTitle('');
      setBroadcastMessage('');
      onRefreshAll();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (e: any) {
      alert(e.message || 'Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUploadRole = async (targetMatric: string, grant: boolean) => {
    if (!currentUser?.matricNo || !isMasterAdmin) return;
    try {
      await api.toggleUploadPermission(currentUser.matricNo, targetMatric, grant);
      await fetchAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to toggle upload permission');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.matricNo || !resetModalStudent) return;
    try {
      setLoading(true);
      await api.resetStudentPassword(
        currentUser.matricNo,
        resetModalStudent.matricNo,
        newPasswordInput.trim()
      );
      setActionSuccess(`Password reset successfully for ${resetModalStudent.fullName}!`);
      setResetModalStudent(null);
      setNewPasswordInput('');
      await fetchAdminData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoster = roster.filter((s) => {
    if (!rosterSearch.trim()) return true;
    const q = rosterSearch.toLowerCase();
    return s.fullName.toLowerCase().includes(q) || s.matricNo.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-700 border border-amber-500 flex items-center justify-center text-2xl shadow">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Admin Management Portal
              </h1>
              {isMasterAdmin ? (
                <span className="bg-amber-900 text-amber-200 border border-amber-600 text-[10px] font-extrabold px-2 py-0.5 rounded">
                  MASTER ADMIN
                </span>
              ) : (
                <span className="bg-indigo-900 text-indigo-200 border border-indigo-600 text-[10px] font-extrabold px-2 py-0.5 rounded">
                  ASSISTANT ADMIN (UPLOAD ONLY)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Authorized: <strong className="text-white">{currentUser?.fullName}</strong> ({currentUser?.matricNo})
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'courses' ? 'bg-amber-700 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚙️</span>
            <span>Add Courses ({courses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload-note')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'upload-note' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📚</span>
            <span>Upload Notes</span>
          </button>

          {isMasterAdmin && (
            <button
              onClick={() => setActiveTab('upload-audio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                activeTab === 'upload-audio' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎧</span>
              <span>Upload Audio</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('assignment')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'assignment' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📅</span>
            <span>Post Assignment</span>
          </button>

          {isMasterAdmin && (
            <>
              <button
                onClick={() => setActiveTab('broadcast')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'broadcast' ? 'bg-red-700 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>📢</span>
                <span>Broadcasts</span>
              </button>

              <button
                onClick={() => setActiveTab('roster')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'roster' ? 'bg-amber-700 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>👥</span>
                <span>114 Roster</span>
              </button>

              <button
                onClick={() => setActiveTab('assistants')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'assistants' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🛡️</span>
                <span>Assistant Tracker</span>
              </button>

              <button
                onClick={() => setActiveTab('passwords')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'passwords' ? 'bg-indigo-700 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🔑</span>
                <span>Password Vault</span>
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'audit' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🔍</span>
                <span>Audit Logs</span>
              </button>

              <button
                onClick={() => setActiveTab('reset-codes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'reset-codes' ? 'bg-red-800 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🔑</span>
                <span>Password Reset Codes</span>
              </button>

              <button
                onClick={() => setActiveTab('progress-monitor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'progress-monitor' ? 'bg-emerald-700 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>📊</span>
                <span>Progress Monitor</span>
              </button>
            </>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-950 border border-emerald-700 text-emerald-200 p-3 rounded-xl text-xs font-bold text-center">
          ✅ {actionSuccess}
        </div>
      )}

      {/* Tab: Course Management (Master Admin Only) */}
      {activeTab === 'courses' && isMasterAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Course Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <span className="text-xl">⚙️</span>
              <div>
                <h2 className="font-extrabold text-white text-base">Add Departmental Course</h2>
                <p className="text-xs text-slate-400">Upload and configure 400L Mechanical Engineering courses</p>
              </div>
            </div>

            <form onSubmit={handleAddCourseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MEE 401"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Credit Units</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    required
                    value={courseUnits}
                    onChange={(e) => setCourseUnits(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Thermodynamics & Heat Transfer"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Lecturer / Professor</label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. S. O. Adeyemi"
                    value={courseLecturer}
                    onChange={(e) => setCourseLecturer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Course Icon Emoji</label>
                  <select
                    value={courseEmoji}
                    onChange={(e) => setCourseEmoji(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl p-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="🔥">🔥 Heat / Thermal</option>
                    <option value="🌊">🌊 Fluids / Hydro</option>
                    <option value="⚙️">⚙️ Machine Design</option>
                    <option value="🔊">🔊 Vibrations / Dynamics</option>
                    <option value="🤖">🤖 Mechatronics / Control</option>
                    <option value="🔩">🔩 Manufacturing / CAD</option>
                    <option value="📐">📐 Stress / Mechanics</option>
                    <option value="🔬">🔬 Lab Testing</option>
                    <option value="💡">💡 Technical Project</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Course Scope / Description</label>
                <textarea
                  rows={3}
                  placeholder="Outline syllabus topics, prerequisites, and learning objectives..."
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold border border-amber-500 shadow cursor-pointer transition-colors"
              >
                {loading ? 'Creating...' : '➕ Create Departmental Course'}
              </button>
            </form>
          </div>

          {/* Current Courses List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h2 className="font-extrabold text-white text-base">Configured Departmental Courses</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono font-bold">
                {courses.length} Courses
              </span>
            </div>

            {courses.length === 0 ? (
              <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center text-slate-400">
                <span className="text-3xl">⚙️</span>
                <p className="font-bold text-sm text-slate-200 mt-2">No courses added yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Use the form on the left to add your first 400L course!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {courses.map((c) => (
                  <div
                    key={c.code}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{c.iconEmoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-white">{c.code}</span>
                          <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">
                            {c.units} Units
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-300 mt-0.5">{c.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">Lecturer: {c.lecturer}</p>
                      </div>
                    </div>

                    {isMasterAdmin && (
                      <button
                        onClick={() => handleDeleteCourse(c.code)}
                        className="p-1.5 bg-red-950 hover:bg-red-900 text-red-300 rounded-lg border border-red-800 text-xs cursor-pointer"
                        title="Delete Course"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Upload Course Notes */}
      {activeTab === 'upload-note' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <span className="text-xl">📚</span>
            <div>
              <h2 className="font-extrabold text-white text-base">Upload Official Course Note</h2>
              <p className="text-xs text-slate-400">Accessible to Master Admin & Assistant Admins (Upload Only)</p>
            </div>
          </div>

          <form onSubmit={handleUploadNoteSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Target Course</label>
                {courses.length > 0 ? (
                  <select
                    value={uploadCourseCode}
                    onChange={(e) => setUploadCourseCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. MEE 401"
                    value={uploadCourseCode}
                    onChange={(e) => setUploadCourseCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-white uppercase"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Lecturer</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. S. O. Adeyemi"
                  value={uploadLecturer}
                  onChange={(e) => setUploadLecturer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Topic / Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Rankine Cycle Exergy Destruction Derivation"
                value={uploadTopic}
                onChange={(e) => setUploadTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Executive Summary</label>
              <textarea
                rows={2}
                required
                placeholder="Brief summary of concepts..."
                value={uploadSummary}
                onChange={(e) => setUploadSummary(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Full Content / Equations</label>
              <textarea
                rows={4}
                placeholder="Formulas, step-by-step mathematical derivations (Markdown)..."
                value={uploadFullContent}
                onChange={(e) => setUploadFullContent(e.target.value)}
                className="w-full font-mono bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-2.5 text-xs text-emerald-300 placeholder-slate-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Exergy, Rankine, Boiler"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Semester Specification</label>
                <select
                  value={uploadSemester}
                  onChange={(e) => setUploadSemester(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Harmattan Semester">🍂 Harmattan Semester</option>
                  <option value="Rain Semester">🌧️ Rain Semester</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold border border-blue-400 shadow cursor-pointer transition-colors"
            >
              {loading ? 'Publishing...' : '📤 Publish Note to Repository'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Upload Lecture Audio */}
      {activeTab === 'upload-audio' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <span className="text-xl">🎧</span>
            <div>
              <h2 className="font-extrabold text-white text-base">Upload Lecture Audio / Voice Note</h2>
              <p className="text-xs text-slate-400">Streamed via the class audio player</p>
            </div>
          </div>

          <form onSubmit={handleUploadAudioSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Course</label>
                {courses.length > 0 ? (
                  <select
                    value={audioCourseCode}
                    onChange={(e) => setAudioCourseCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. MEE 401"
                    value={audioCourseCode}
                    onChange={(e) => setAudioCourseCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-white uppercase"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Duration (MM:SS)</label>
                <input
                  type="text"
                  placeholder="25:00"
                  value={audioDuration}
                  onChange={(e) => setAudioDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Audio Lecture Title / Topic</label>
              <input
                type="text"
                required
                placeholder="e.g. Navier-Stokes Boundary Layer Simplifications"
                value={audioTopic}
                onChange={(e) => setAudioTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Lecturer</label>
              <input
                type="text"
                placeholder="e.g. Dr. C. N. Okonkwo"
                value={audioLecturer}
                onChange={(e) => setAudioLecturer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Timestamps (Format: MM:SS - Label, one per line)
              </label>
              <textarea
                rows={3}
                value={audioTimestampsText}
                onChange={(e) => setAudioTimestampsText(e.target.value)}
                className="w-full font-mono bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-2.5 text-xs text-blue-300 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Lecture Transcript / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Summary of audio recording..."
                  value={audioNotes}
                  onChange={(e) => setAudioNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Semester Specification</label>
                <select
                  value={audioSemester}
                  onChange={(e) => setAudioSemester(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Harmattan Semester">🍂 Harmattan Semester</option>
                  <option value="Rain Semester">🌧️ Rain Semester</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold border border-blue-400 shadow cursor-pointer transition-colors"
            >
              {loading ? 'Uploading...' : '🎙️ Upload Audio Recording'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Post Assignment */}
      {activeTab === 'assignment' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <span className="text-xl">📅</span>
            <div>
              <h2 className="font-extrabold text-white text-base">Post Course Assignment</h2>
              <p className="text-xs text-slate-400">Sets deadline countdown on student dashboards</p>
            </div>
          </div>

          <form onSubmit={handlePostAssignmentSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Course</label>
                {courses.length > 0 ? (
                  <select
                    value={assCourseCode}
                    onChange={(e) => setAssCourseCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. MEE 401"
                    value={assCourseCode}
                    onChange={(e) => setAssCourseCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-white uppercase"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Max Score (Points)</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={assPoints}
                  onChange={(e) => setAssPoints(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Assignment Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Steam Power Cycle Exergy Problem Set"
                value={assTitle}
                onChange={(e) => setAssTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Deadline Date & Time</label>
              <input
                type="datetime-local"
                required
                value={assDeadline}
                onChange={(e) => setAssDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Instructions / Submission Mode</label>
              <input
                type="text"
                placeholder="e.g. Submit physical handwritten solutions in LT-2 assignment box."
                value={assInstructions}
                onChange={(e) => setAssInstructions(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Task Problem Statement & Guidelines</label>
              <textarea
                rows={3}
                required
                placeholder="Detailed instructions for the assignment..."
                value={assDescription}
                onChange={(e) => setAssDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Attached Problem Set Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. MEE401_Problem_Set_1.pdf"
                  value={assAttachment}
                  onChange={(e) => setAssAttachment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Semester Specification</label>
                <select
                  value={assSemester}
                  onChange={(e) => setAssSemester(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Harmattan Semester">🍂 Harmattan Semester</option>
                  <option value="Rain Semester">🌧️ Rain Semester</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold border border-blue-400 shadow cursor-pointer transition-colors"
            >
              {loading ? 'Posting...' : '📅 Publish Assignment'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Broadcast Reminders (Master Admin Only) */}
      {activeTab === 'broadcast' && isMasterAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <span className="text-xl">📢</span>
            <div>
              <h2 className="font-extrabold text-white text-base">Transmit Urgent Class Broadcast</h2>
              <p className="text-xs text-slate-400">Master Admin only • Pushes top notification ticker</p>
            </div>
          </div>

          <form onSubmit={handleBroadcastSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Priority</label>
                <select
                  value={broadcastPriority}
                  onChange={(e) => setBroadcastPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="critical">🚨 Critical / Exam Notice</option>
                  <option value="high">⚠️ High Priority / Assignment</option>
                  <option value="info">ℹ️ General Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Course (Optional)</label>
                <select
                  value={broadcastCourse}
                  onChange={(e) => setBroadcastCourse(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl p-2.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="">-- General Announcement --</option>
                  {courses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Broadcast Title</label>
              <input
                type="text"
                required
                placeholder="e.g. URGENT: CONTINUOUS ASSESSMENT TEST DATE"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-semibold uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Message Details</label>
              <textarea
                rows={4}
                required
                placeholder="Include time, venue, syllabus coverage..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold border border-red-500 shadow cursor-pointer transition-colors"
            >
              {loading ? 'Transmitting...' : '🚀 Transmit Broadcast to 114 Students'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Roster & Role Manager (Master Admin Only) */}
      {activeTab === 'roster' && isMasterAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h2 className="font-extrabold text-white text-base">
                  Assistant Admin & Upload Role Manager
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Appoint 2 or 3 trusted students as Assistant Admins so they can post announcements, upload notes, audio lectures, and assignments when you are busy.
              </p>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search roster by name or matric..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Appoint Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-indigo-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold text-indigo-300 flex items-center gap-1.5">
                <span>🛡️</span>
                <span>Currently Appointed Assistant Admins ({roster.filter((s) => s.isPartialAdmin && !s.isAdmin).length})</span>
              </div>
            </div>

            {roster.filter((s) => s.isPartialAdmin && !s.isAdmin).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No Assistant Admins appointed yet. Select a student below to grant Assistant Admin status.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {roster
                  .filter((s) => s.isPartialAdmin && !s.isAdmin)
                  .map((assistant) => (
                    <div
                      key={assistant.matricNo}
                      className="bg-indigo-950/80 border border-indigo-700 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs text-white font-bold"
                    >
                      <span>⚡</span>
                      <span>{assistant.fullName}</span>
                      <span className="text-[10px] text-indigo-300 font-mono">({assistant.matricNo})</span>
                      <button
                        onClick={() => handleToggleUploadRole(assistant.matricNo, false)}
                        className="text-red-400 hover:text-red-200 font-bold ml-1 cursor-pointer"
                        title="Revoke Assistant Admin"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* Quick Appoint Form */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                id="quick-appoint-select"
                className="bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded-xl px-3 py-2 flex-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">Select a student to appoint as Assistant Admin...</option>
                {roster
                  .filter((s) => !s.isAdmin && !s.isPartialAdmin)
                  .map((s) => (
                    <option key={s.matricNo} value={s.matricNo}>
                      {s.fullName} ({s.matricNo})
                    </option>
                  ))}
              </select>

              <button
                onClick={() => {
                  const selectEl = document.getElementById('quick-appoint-select') as HTMLSelectElement;
                  if (selectEl && selectEl.value) {
                    handleToggleUploadRole(selectEl.value, true);
                    selectEl.value = '';
                  } else {
                    alert('Please select a student from the dropdown list first.');
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl border border-indigo-400 shadow cursor-pointer transition-colors"
              >
                ⚡ Appoint as Assistant Admin
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[550px] overflow-y-auto pr-1">
            {filteredRoster.map((student) => {
              const isMaster = student.isAdmin;
              const isUploadOnly = student.isPartialAdmin && !isMaster;

              return (
                <div
                  key={student.matricNo}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="text-xl flex-shrink-0">{student.avatarEmoji || '⚙️'}</span>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{student.fullName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {student.matricNo} •{' '}
                        {isMaster ? (
                          <span className="text-amber-400 font-bold">Master Admin</span>
                        ) : isUploadOnly ? (
                          <span className="text-indigo-400 font-bold">Upload Only</span>
                        ) : (
                          <span className="text-slate-400">Student</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isMaster && (
                    <div className="flex-shrink-0">
                      {isUploadOnly ? (
                        <button
                          onClick={() => handleToggleUploadRole(student.matricNo, false)}
                          className="px-2 py-1 bg-red-950 hover:bg-red-900 text-red-300 rounded border border-red-800 text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          Revoke Upload
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleUploadRole(student.matricNo, true)}
                          className="px-2 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 rounded border border-indigo-700 text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          + Grant Upload
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Password Vault (Master Admin Only) */}
      {activeTab === 'passwords' && isMasterAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔑</span>
                <h2 className="font-extrabold text-white text-base">
                  Student Passwords Master Vault
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                View or reset passwords for any student in case they forget their login credentials.
              </p>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search password vault by name or matric..."
                value={passwordsSearch}
                onChange={(e) => setPasswordsSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Matric No</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Stored Password</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {passwordsList
                  .filter((item) => {
                    if (!passwordsSearch.trim()) return true;
                    const q = passwordsSearch.toLowerCase();
                    return item.fullName.toLowerCase().includes(q) || item.matricNo.toLowerCase().includes(q);
                  })
                  .map((item) => {
                    const isVisible = showPlainText[item.matricNo];

                    return (
                      <tr key={item.matricNo} className="hover:bg-slate-950/60">
                        <td className="py-3 px-3 font-mono font-bold text-white">{item.matricNo}</td>
                        <td className="py-3 px-3 font-semibold text-slate-100">{item.fullName}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              item.role === 'Master Admin'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : item.role === 'Assistant Admin'
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {item.hasPassword ? (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                              ✅ Configured
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                              🟡 Pending First Login
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {item.hasPassword ? (
                            <div className="flex items-center gap-2">
                              <span className="bg-slate-950 px-2 py-1 rounded text-emerald-300 border border-slate-800 tracking-wider">
                                {isVisible ? item.password : '••••••••'}
                              </span>
                              <button
                                onClick={() =>
                                  setShowPlainText((prev) => ({
                                    ...prev,
                                    [item.matricNo]: !prev[item.matricNo],
                                  }))
                                }
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                              >
                                {isVisible ? 'Hide' : 'Reveal'}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Not set yet</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setResetModalStudent({ matricNo: item.matricNo, fullName: item.fullName });
                              setNewPasswordInput('');
                            }}
                            className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 rounded-lg text-[10px] font-bold border border-indigo-700 cursor-pointer transition-colors"
                          >
                            ✏️ Reset Password
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Audit Logs (Master Admin Only) */}
      {activeTab === 'audit' && isMasterAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔍</span>
              <h2 className="font-extrabold text-white text-base">Live Security Audit Logs</h2>
            </div>
            <button
              onClick={fetchAdminData}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              🔄 Refresh Logs
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 font-mono text-xs">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1"
              >
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="text-blue-400 font-bold">{log.type}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-slate-200">{log.description}</p>
                <div className="text-[10px] text-slate-500">Matric: {log.matricNo}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Assistant Tracker & Work Auditing (Master Admin Only) */}
      {activeTab === 'assistants' && isMasterAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <h2 className="font-extrabold text-white text-base">Assistant Admin Tracker & Auditing</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitor appointed Assistant Admins, review their assigned limited permissions, and track their work activity.
              </p>
            </div>
            <button
              onClick={fetchAdminData}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer self-start sm:self-auto"
            >
              🔄 Refresh Roster & Logs
            </button>
          </div>

          {roster.filter((s) => s.isPartialAdmin && !s.isAdmin).length === 0 ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
              <span className="text-3xl">🛡️</span>
              <p className="font-bold text-sm text-slate-200 mt-2">No Assistant Admins currently active</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                To appoint assistants and authorize them to post assignments or add courses, navigate to the <strong>114 Roster</strong> tab.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {roster
                .filter((s) => s.isPartialAdmin && !s.isAdmin)
                .map((assistant) => {
                  // Calculate dynamic counts
                  const assignmentsPostedCount = assignments.filter((a) => a.uploadedBy === assistant.matricNo).length;
                  const requestsAnsweredCount = pdfRequests.filter((req) => 
                    req.replies.some((rep) => rep.senderMatric === assistant.matricNo)
                  ).length;
                  
                  // Filter specific audit logs for this assistant
                  const assistantLogs = auditLogs.filter((log) => log.matricNo === assistant.matricNo);

                  return (
                    <div
                      key={assistant.matricNo}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-5"
                    >
                      {/* Top Header Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-indigo-950 border border-indigo-700 rounded-2xl flex items-center justify-center text-2xl text-indigo-300 shadow">
                            {assistant.avatarEmoji || '👤'}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm sm:text-base text-white">{assistant.fullName}</h3>
                            <p className="text-xs text-indigo-400 font-mono font-bold mt-0.5">{assistant.matricNo}</p>
                          </div>
                        </div>

                        {/* Work Activity Summary Statistics */}
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5 text-center min-w-[100px]">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assignments</div>
                            <div className="text-base font-extrabold text-blue-400 mt-0.5">{assignmentsPostedCount}</div>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5 text-center min-w-[100px]">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Replies</div>
                            <div className="text-base font-extrabold text-emerald-400 mt-0.5">{requestsAnsweredCount}</div>
                          </div>
                        </div>
                      </div>

                      {/* Main Grid: Privileges & Activity Log */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Column 1: Limited Privilege Boundaries */}
                        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 space-y-3">
                          <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider pb-1.5 border-b border-slate-800/60 flex items-center gap-1.5">
                            <span>🛡️</span>
                            <span>Assigned Privilege Boundaries</span>
                          </h4>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/40">
                              <span className="text-slate-300">Create Departmental Courses</span>
                              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <span>✅</span> Authorized
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/40">
                              <span className="text-slate-300">Upload Course Assignments</span>
                              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <span>✅</span> Authorized
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/40">
                              <span className="text-slate-300">Answer PDF / Material Requests</span>
                              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <span>✅</span> Authorized
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/40">
                              <span className="text-slate-300">Upload Official Course Notes</span>
                              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <span>✅</span> Authorized
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/40 opacity-55">
                              <span className="text-slate-400">Upload Lecture Audio / Recordings</span>
                              <span className="bg-red-950 text-red-300 border border-red-900 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <span>✕</span> Restricted
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/40 opacity-55">
                              <span className="text-slate-400">Manage 114 Student Register & Roles</span>
                              <span className="bg-red-950 text-red-300 border border-red-900 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <span>✕</span> Restricted
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs opacity-55">
                              <span className="text-slate-400">View Password Vault / Reset Credentials</span>
                              <span className="bg-red-950 text-red-300 border border-red-900 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                <span>✕</span> Restricted
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Recent Works / Chronological Log */}
                        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 space-y-3">
                          <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider pb-1.5 border-b border-slate-800/60 flex items-center gap-1.5">
                            <span>🔍</span>
                            <span>Recorded Work Activity & Logs</span>
                          </h4>

                          {assistantLogs.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-500 italic">
                              No recent administrative actions recorded for this Assistant.
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
                              {assistantLogs.map((log) => (
                                <div
                                  key={log.id}
                                  className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg space-y-1 font-mono"
                                >
                                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                                    <span className="text-blue-400 font-bold">{log.type}</span>
                                    <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-slate-200 text-[11px] leading-relaxed">{log.description}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Generated Password Reset Codes */}
      {activeTab === 'reset-codes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔑</span>
                <h2 className="font-extrabold text-white text-base">Generated Password Reset Codes</h2>
              </div>
              <p className="text-xs text-slate-400">
                Codes requested by students via "Forgot Password?". Share the code with the student so they can reset their password.
              </p>
            </div>
            <button
              onClick={fetchAdminData}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl"
            >
              🔄 Refresh List
            </button>
          </div>

          {resetCodes.length === 0 ? (
            <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
              <span>🎉</span> No active password reset code requests.
            </div>
          ) : (
            <div className="space-y-3">
              {resetCodes.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm">{req.fullName}</span>
                      <span className="font-mono text-xs text-blue-400 font-bold">{req.matricNo}</span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                          req.used ? 'bg-slate-800 text-slate-400' : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        }`}
                      >
                        {req.used ? 'USED' : 'ACTIVE'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Requested: {new Date(req.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-blue-500/50 p-3 rounded-xl text-center min-w-[120px]">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Verification Code</div>
                    <div className="text-lg font-mono font-extrabold text-amber-300 tracking-widest">{req.code}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Student Progress Monitor */}
      {activeTab === 'progress-monitor' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h2 className="font-extrabold text-white text-base">Student Learning Progress Monitor</h2>
              </div>
              <p className="text-xs text-slate-400">
                Track completion percentage, read course materials, and submitted assignments across all 114 students.
              </p>
            </div>
            <button
              onClick={fetchAdminData}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl"
            >
              🔄 Sync Live Monitor
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[550px] overflow-y-auto pr-1">
            {monitorData.map((item) => (
              <div
                key={item.matricNo}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <span className="font-bold text-white text-xs truncate block">{item.fullName}</span>
                    <span className="font-mono text-[10px] text-blue-400 font-bold">{item.matricNo}</span>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                    {item.progressPercentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${item.progressPercentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                  <span>Notes: {item.notesRead?.length || 0}</span>
                  <span>Assignments: {item.assignmentsCompleted?.length || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-850 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">✏️</span>
                <h3 className="font-extrabold text-white text-sm">Reset Student Password</h3>
              </div>
              <button
                onClick={() => setResetModalStudent(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-5 space-y-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Target Account</div>
                <div className="text-sm font-extrabold text-white mt-0.5">{resetModalStudent.fullName}</div>
                <div className="text-xs font-mono text-indigo-400 font-bold">{resetModalStudent.matricNo}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Enter New Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MEE2026! or 12345"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none shadow"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Tell the student their new password so they can log in immediately.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetModalStudent(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newPasswordInput.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold border border-indigo-400 shadow cursor-pointer transition-colors"
                >
                  {loading ? 'Saving...' : '💾 Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
