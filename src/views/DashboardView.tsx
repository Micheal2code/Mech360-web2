import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioContext';
import { Course, CourseNote, LectureRecording, Assignment, Announcement } from '../types';
import { api } from '../services/api';

const ENGINEERING_FUN_FACTS = [
  "The Mercedes-Benz three-pointed star logo represents land, sea, and air dominance in engineering.",
  "In 1913, the first modern moving assembly line was introduced by Henry Ford, reducing chassis production time from 12 hours to 93 minutes.",
  "The Rankine cycle is a model used to predict the performance of steam turbine systems, commonly found in thermal power plants.",
  "The maximum efficiency of any thermodynamic cycle is defined by the Carnot Limit, which depends purely on temperature extremes.",
  "In fluid mechanics, the Navier-Stokes equations describe how fluids flow. They are so complex that there is a $1,000,000 Millennium Prize for proving their smooth solutions exist.",
  "Titanium possesses the highest strength-to-weight ratio of any metal, making it a critical material for aerospace and advanced mechanical designs.",
  "A double-clutch transmission shifts gears in less than 8 milliseconds, which is about 40 times faster than a human blink.",
  "The world's largest diesel engine, the Wärtsilä-Sulzer RTA96-C, produces 109,000 horsepower and is used in container ships.",
  "Regenerative braking in hybrid and electric cars converts kinetic energy back into electrical energy during deceleration, saving up to 30% of energy."
];

interface DashboardViewProps {
  courses: Course[];
  notes: CourseNote[];
  recordings: LectureRecording[];
  assignments: Assignment[];
  announcements: Announcement[];
  onNavigate: (tab: string, extra?: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  courses,
  notes,
  recordings,
  assignments,
  announcements,
  onNavigate,
}) => {
  const { currentUser, isMasterAdmin, canUpload } = useAuth();
  const { playLecture, currentLecture, isPlaying } = useAudioPlayer();

  // Fun Facts state (rotates every minute)
  const [factIndex, setFactIndex] = useState(0);

  // Student progress state
  const [studentProgress, setStudentProgress] = useState<{ notesRead: string[]; assignmentsCompleted: string[]; progressPercentage: number }>({
    notesRead: [],
    assignmentsCompleted: [],
    progressPercentage: 15,
  });

  useEffect(() => {
    // Rotate fun facts every 60 seconds
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % ENGINEERING_FUN_FACTS.length);
    }, 60000);

    // Fetch personal progress
    if (currentUser?.matricNo) {
      api.getProgress(currentUser.matricNo)
        .then((res) => {
          if (res && res.progress) {
            setStudentProgress(res.progress);
          }
        })
        .catch((e) => console.error('Failed to load student progress:', e));
    }

    return () => {
      clearInterval(factInterval);
    };
  }, [currentUser]);

  const toggleNoteRead = async (noteId: string) => {
    if (!currentUser?.matricNo) return;
    const isRead = studentProgress.notesRead.includes(noteId);
    let updatedNotesRead = [...studentProgress.notesRead];
    if (isRead) {
      updatedNotesRead = updatedNotesRead.filter((id) => id !== noteId);
    } else {
      updatedNotesRead.push(noteId);
    }

    try {
      const res = await api.updateProgress(currentUser.matricNo, updatedNotesRead, studentProgress.assignmentsCompleted);
      if (res && res.progress) {
        setStudentProgress(res.progress);
      }
    } catch (e) {
      console.error('Failed to update progress:', e);
    }
  };

  const toggleAssignmentCompleted = async (assId: string) => {
    if (!currentUser?.matricNo) return;
    const isCompleted = studentProgress.assignmentsCompleted.includes(assId);
    let updatedAssCompleted = [...studentProgress.assignmentsCompleted];
    if (isCompleted) {
      updatedAssCompleted = updatedAssCompleted.filter((id) => id !== assId);
    } else {
      updatedAssCompleted.push(assId);
    }

    try {
      const res = await api.updateProgress(currentUser.matricNo, studentProgress.notesRead, updatedAssCompleted);
      if (res && res.progress) {
        setStudentProgress(res.progress);
      }
    } catch (e) {
      console.error('Failed to update progress:', e);
    }
  };

  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  const getDaysLeft = (dueDateStr: string) => {
    const diff = new Date(dueDateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: 'Overdue', isUrgent: true };
    if (days === 0) return { text: 'Due Today', isUrgent: true };
    if (days === 1) return { text: '1 Day Left', isUrgent: true };
    return { text: `${days} Days Left`, isUrgent: days <= 3 };
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-900 text-blue-200 border border-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded tracking-wider uppercase">
                MECHANICAL ENGINEERING • 400 LEVEL (MEE 400L)
              </span>
              {isMasterAdmin && (
                <span className="bg-amber-900 text-amber-200 border border-amber-600 text-[10px] font-extrabold px-2 py-0.5 rounded">
                  👑 CLASS REP / MASTER ADMIN
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {currentUser?.fullName || 'Mechanical Scholar'} {currentUser?.avatarEmoji || '⚙️'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Official Departmental Academic Hub for 400 Level Mechanical Engineering. Access uploaded course notes, stream lecture recordings, track assignments, and consult CourseMate AI.
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('tutor')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-blue-400 shadow flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>🤖</span>
              <span>CourseMate AI</span>
            </button>

            <button
              onClick={() => onNavigate('chat')}
              className="bg-slate-800 hover:bg-slate-750 text-slate-100 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>💬</span>
              <span>Commons Chat</span>
            </button>

            <button
              onClick={() => onNavigate('notes')}
              className="bg-slate-800 hover:bg-slate-750 text-slate-100 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>📚</span>
              <span>Course Notes</span>
            </button>

            <button
              onClick={() => onNavigate('pdf-requests')}
              className="bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-indigo-500 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>📑</span>
              <span>Request PDFs</span>
            </button>

            <button
              onClick={() => onNavigate('feedback')}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-emerald-500 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>💬</span>
              <span>Suggestions & WhatsApp</span>
            </button>

            {canUpload && (
              <button
                onClick={() => onNavigate('admin')}
                className="bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-amber-500 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>⚙️</span>
                <span>Admin Portal</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>⚙️</span> Departmental Courses
            </div>
            <div className="text-xl font-extrabold text-white mt-1">
              {courses.length} <span className="text-xs font-normal text-slate-400">Courses</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>⏳</span> Pending Tasks
            </div>
            <div className="text-xl font-extrabold text-amber-400 mt-1">
              {assignments.length} <span className="text-xs font-normal text-slate-400">Deadlines</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>📚</span> Course Notes
            </div>
            <div className="text-xl font-extrabold text-blue-400 mt-1">
              {notes.length} <span className="text-xs font-normal text-slate-400">Documents</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>🎧</span> Audio Lectures
            </div>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">
              {recordings.length} <span className="text-xs font-normal text-slate-400">Recordings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Announcements & Core 400L Courses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Departmental Announcements */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📢</span>
                <h2 className="font-extrabold text-white text-sm sm:text-base">
                  Official Departmental Announcements
                </h2>
              </div>
              {isMasterAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  + Broadcast Alert
                </button>
              )}
            </div>

            {announcements.length === 0 ? (
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
                <span>📢</span> No broadcasts or announcements published yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`p-4 rounded-xl border ${
                      ann.priority === 'critical'
                        ? 'bg-red-950/40 border-red-700'
                        : ann.priority === 'high'
                        ? 'bg-amber-950/40 border-amber-700'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                            ann.priority === 'critical'
                              ? 'bg-red-700 text-white'
                              : ann.priority === 'high'
                              ? 'bg-amber-700 text-white'
                              : 'bg-blue-800 text-white'
                          }`}
                        >
                          {ann.priority}
                        </span>
                        {ann.courseCode && (
                          <span className="bg-slate-800 text-slate-200 text-[10px] font-bold px-1.5 py-0.2 rounded border border-slate-700">
                            {ann.courseCode}
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-100">{ann.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ann.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{ann.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Departmental Courses Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <h2 className="font-extrabold text-white text-sm sm:text-base">
                  Departmental 400L Courses
                </h2>
              </div>
              {isMasterAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  + Add Courses in Admin Portal
                </button>
              )}
            </div>

            {courses.length === 0 ? (
              <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center text-slate-400 space-y-2">
                <span className="text-3xl">⚙️</span>
                <p className="font-bold text-sm text-slate-200">No departmental courses added yet</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  The Master Admin can upload departmental courses (e.g. MEE 401, MEE 403, MEE 405, etc.) in the Admin Portal.
                </p>
                {isMasterAdmin && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="mt-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-xs font-bold border border-amber-500 cursor-pointer"
                  >
                    Go to Admin Portal →
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courses.map((c) => {
                  const count = notes.filter((n) => n.courseCode === c.code).length;
                  return (
                    <div
                      key={c.code}
                      onClick={() => onNavigate('notes', { filterCourse: c.code })}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{c.iconEmoji}</span>
                          <span className="font-extrabold text-sm text-white group-hover:text-blue-400 transition-colors">
                            {c.code}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {c.units} Units
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-200 line-clamp-1 mb-1">
                        {c.title}
                      </h3>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-900">
                        <span className="truncate max-w-[140px]">{c.lecturer}</span>
                        <span className="text-blue-400 font-bold">{count} notes</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deadlines Countdown & Featured Lecture Audio */}
        <div className="space-y-6">
          {/* Upcoming Assignment Deadlines */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏳</span>
                <h2 className="font-extrabold text-white text-sm">Approaching Deadlines</h2>
              </div>
              <button
                onClick={() => onNavigate('assignments')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                Tracker →
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
                <span>🎉</span> No assignment deadlines pending.
              </div>
            ) : (
              <div className="space-y-2.5">
                {sortedAssignments.slice(0, 3).map((ass) => {
                  const countdown = getDaysLeft(ass.deadline);
                  return (
                    <div
                      key={ass.id}
                      onClick={() => onNavigate('assignments')}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="bg-blue-900 text-blue-200 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          {ass.courseCode}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                            countdown.isUrgent
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          ⏱️ {countdown.text}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-100 line-clamp-1">{ass.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {ass.instructions}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Personal Learning Progress Tracker Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h2 className="font-extrabold text-white text-sm">Learning Progress</h2>
              </div>
              <span className="text-xs font-mono font-bold text-blue-400">
                {studentProgress.progressPercentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 shadow-inner overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 shadow border-r border-blue-400"
                style={{ width: `${studentProgress.progressPercentage}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Track your reading & task submissions below. Mark items completed to increase your score!
            </p>

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 pt-1">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">
                Read Course Notes ({studentProgress.notesRead.length} read)
              </div>
              {notes.slice(0, 4).map((n) => {
                const isRead = studentProgress.notesRead.includes(n.id);
                return (
                  <label
                    key={n.id}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-900 text-xs text-slate-200 cursor-pointer hover:bg-slate-950 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isRead}
                      onChange={() => toggleNoteRead(n.id)}
                      className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer h-3.5 w-3.5"
                    />
                    <div className="truncate flex-1">
                      <span className="font-bold text-slate-100">{n.courseCode}</span>: {n.topic}
                    </div>
                  </label>
                );
              })}

              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-3 mb-1">
                Assignment Submissions ({studentProgress.assignmentsCompleted.length} completed)
              </div>
              {assignments.slice(0, 3).map((a) => {
                const isCompleted = studentProgress.assignmentsCompleted.includes(a.id);
                return (
                  <label
                    key={a.id}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-900 text-xs text-slate-200 cursor-pointer hover:bg-slate-950 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleAssignmentCompleted(a.id)}
                      className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer h-3.5 w-3.5"
                    />
                    <div className="truncate flex-1">
                      <span className="font-bold text-slate-100">{a.courseCode}</span>: {a.title}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Random Engineering Fun Facts Widget (Rotates every minute or with a next click button) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <h2 className="font-extrabold text-white text-sm">Engineering Fun Fact</h2>
              </div>
              <button
                onClick={() => setFactIndex((prev) => (prev + 1) % ENGINEERING_FUN_FACTS.length)}
                className="text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold px-2 py-1 rounded border border-slate-700 cursor-pointer"
                title="Next Fact"
              >
                Next ➡️
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 min-h-[90px] flex items-center">
              <p className="text-xs text-slate-300 leading-relaxed font-semibold italic">
                "{ENGINEERING_FUN_FACTS[factIndex]}"
              </p>
            </div>
            <div className="text-[9px] text-slate-500 text-right uppercase tracking-wider font-mono">
              Auto-rotates every 60 seconds
            </div>
          </div>

          {/* Featured Audio Recording */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎧</span>
                <h2 className="font-extrabold text-white text-sm">Lecture Audio Hub</h2>
              </div>
              <button
                onClick={() => onNavigate('audio')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                All Audios →
              </button>
            </div>

            {recordings.length === 0 ? (
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
                <span>🎧</span> No lecture audio recordings uploaded yet.
              </div>
            ) : (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-900 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                    {recordings[0].courseCode}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    ⏱️ {recordings[0].duration}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white leading-snug">{recordings[0].topic}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2">{recordings[0].notes}</p>
                <button
                  onClick={() => playLecture(recordings[0])}
                  className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold border border-blue-400 shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{currentLecture?.id === recordings[0].id && isPlaying ? '⏸️ Pause' : '▶️ Play Lecture'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
