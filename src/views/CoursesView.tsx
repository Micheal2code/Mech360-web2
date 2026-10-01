import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Course, CourseNote } from '../types';
import { api } from '../services/api';

interface CoursesViewProps {
  courses: Course[];
  notes: CourseNote[];
  onRefresh: () => void;
  onOpenUpload: () => void;
  initialCourseFilter?: string;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  notes,
  onRefresh,
  onOpenUpload,
  initialCourseFilter,
}) => {
  const { currentUser, isMasterAdmin, canUpload } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState(initialCourseFilter || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewNote, setPreviewNote] = useState<CourseNote | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredNotes = notes.filter((n) => {
    if (selectedCourse !== 'ALL' && n.courseCode !== selectedCourse) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTopic = n.topic.toLowerCase().includes(q);
      const matchTitle = n.courseTitle.toLowerCase().includes(q);
      const matchSummary = n.summary.toLowerCase().includes(q);
      const matchLecturer = n.lecturer.toLowerCase().includes(q);
      const matchTags = n.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTopic && !matchTitle && !matchSummary && !matchLecturer && !matchTags) return false;
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!currentUser?.matricNo) return;
    if (!confirm('Are you sure you want to delete this course note?')) return;
    setDeletingId(id);
    try {
      await api.deleteNote(id, currentUser.matricNo);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to delete note');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopySummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Course Notes & Syllabus Repository
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Access lecture slides, problem set breakdowns, and formula sheets uploaded by course representatives.
          </p>
        </div>

        {canUpload && (
          <button
            onClick={onOpenUpload}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-blue-400 shadow flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>📤</span>
            <span>Upload Course Material</span>
          </button>
        )}
      </div>

      {/* Course Code Filter Bar */}
      {courses.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setSelectedCourse('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedCourse === 'ALL'
                  ? 'bg-blue-600 text-white border border-blue-400 shadow'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              All Courses ({notes.length})
            </button>
            {courses.map((c) => {
              const count = notes.filter((n) => n.courseCode === c.code).length;
              return (
                <button
                  key={c.code}
                  onClick={() => setSelectedCourse(c.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                    selectedCourse === c.code
                      ? 'bg-blue-600 text-white border border-blue-400 shadow'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{c.iconEmoji}</span>
                  <span>{c.code}</span>
                  <span className="bg-slate-950 text-[10px] px-1.5 py-0.2 rounded text-slate-400 ml-1">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Search Bar */}
      {notes.length > 0 && (
        <div>
          <input
            type="text"
            placeholder="Search notes by topic, keyword, or lecturer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none shadow"
          />
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <span className="text-4xl">📚</span>
          <p className="font-bold text-sm text-slate-200">No course notes uploaded yet</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {canUpload
              ? 'Click the "Upload Course Material" button or navigate to the Admin Portal to add courses and notes to the repository.'
              : 'Course materials uploaded by the Master Admin and Assistant Admins will appear here.'}
          </p>
          {canUpload && (
            <div className="pt-2">
              <button
                onClick={onOpenUpload}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold border border-blue-400 shadow cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>📤</span>
                <span>Upload Course Material</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => {
            const isOwner = currentUser?.matricNo === note.uploadedBy;
            const canDelete = isOwner || isMasterAdmin;

            return (
              <div
                key={note.id}
                className="bg-slate-900 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="bg-blue-900 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">
                      {note.courseCode}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      📄 .{note.fileType.toUpperCase()} ({note.fileSize})
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-white leading-snug mb-1">
                    {note.topic}
                  </h3>
                  <p className="text-xs text-slate-400 mb-2">
                    Course: <strong className="text-slate-300">{note.courseTitle}</strong> • Lecturer: <strong className="text-slate-300">{note.lecturer}</strong>
                  </p>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-2 mb-3">
                    {note.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {note.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-950 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-800"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    By: <strong className="text-slate-300">{note.uploadedByName}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewNote(note)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer"
                    >
                      👁️ Preview
                    </button>

                    <button
                      onClick={() => {
                        alert(`Downloading ${note.topic} (${note.fileSize})...`);
                        note.downloadsCount += 1;
                      }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold border border-blue-400 cursor-pointer flex items-center gap-1"
                    >
                      <span>📥</span>
                      <span>Download ({note.downloadsCount})</span>
                    </button>

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(note.id)}
                        disabled={deletingId === note.id}
                        className="p-1.5 bg-red-950 hover:bg-red-900 text-red-300 rounded-lg border border-red-800 text-xs font-bold cursor-pointer"
                        title="Delete Note"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PDF / Content Preview Modal */}
      {previewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-slate-850 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-blue-900 text-white text-xs font-bold px-2 py-0.5 rounded">
                  {previewNote.courseCode}
                </span>
                <h3 className="font-extrabold text-slate-100 text-sm truncate max-w-md">
                  {previewNote.topic}
                </h3>
              </div>
              <button
                onClick={() => setPreviewNote(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Course: <strong className="text-white">{previewNote.courseTitle}</strong></span>
                  <span>Lecturer: <strong className="text-white">{previewNote.lecturer}</strong></span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Uploader: <strong className="text-white">{previewNote.uploadedByName}</strong></span>
                  <span>Uploaded: <strong className="text-slate-300">{new Date(previewNote.timestamp).toLocaleDateString()}</strong></span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Executive Summary
                  </h4>
                  <button
                    onClick={() => handleCopySummary(previewNote.summary)}
                    className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer font-semibold"
                  >
                    {copySuccess ? '✅ Copied!' : '📋 Copy Summary'}
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {previewNote.summary}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Mathematical Steps & Equations
                </h4>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed">
                  {previewNote.fullContent}
                </div>
              </div>
            </div>

            <div className="bg-slate-850 p-3.5 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setPreviewNote(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Downloading ${previewNote.topic}...`);
                  previewNote.downloadsCount += 1;
                  setPreviewNote(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold border border-blue-400 cursor-pointer flex items-center gap-1.5"
              >
                <span>📥</span>
                <span>Download Attachment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
