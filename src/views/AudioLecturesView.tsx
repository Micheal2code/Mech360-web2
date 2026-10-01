import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioContext';
import { Course, LectureRecording } from '../types';
import { api } from '../services/api';

interface AudioLecturesViewProps {
  courses: Course[];
  lectures: LectureRecording[];
  onRefresh: () => void;
  onOpenUpload: () => void;
}

export const AudioLecturesView: React.FC<AudioLecturesViewProps> = ({
  courses,
  lectures,
  onRefresh,
  onOpenUpload,
}) => {
  const { currentUser, isMasterAdmin, canUpload } = useAuth();
  const {
    currentLecture,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    playLecture,
    togglePlay,
    seekTo,
    setSpeed,
    skipSeconds,
  } = useAudioPlayer();

  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');
  const [activeLectureForDetails, setActiveLectureForDetails] = useState<LectureRecording>(
    (currentLecture as any) || lectures[0] || null
  );

  const filteredLectures = lectures.filter((l) => {
    if (selectedCourseFilter !== 'ALL' && l.courseCode !== selectedCourseFilter) return false;
    return true;
  });

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleDeleteAudio = async (id: string) => {
    if (!currentUser?.matricNo) return;
    if (!confirm('Are you sure you want to delete this audio recording?')) return;
    try {
      await api.deleteRecording(id, currentUser.matricNo);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to delete audio');
    }
  };

  const active = (currentLecture as any) || activeLectureForDetails || lectures[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎧</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              400L Lecture Audio & Voice Notes Hub
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Listen to professor audio recordings, revision breakdowns, and review synchronized lecture notes.
          </p>
        </div>

        {canUpload && (
          <button
            onClick={onOpenUpload}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-blue-400 shadow flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>🎙️</span>
            <span>Upload Audio Lecture</span>
          </button>
        )}
      </div>

      {/* Main Player Display & Playlist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Active Audio Player Stage */}
        <div className="lg:col-span-2 space-y-6">
          {active ? (
            <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Top Course Tag & Lecturer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-900 text-blue-200 text-xs font-extrabold px-2.5 py-1 rounded">
                    {active.courseCode}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Lecturer: <strong className="text-slate-200">{active.lecturer}</strong>
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  📅 {active.timestamp}
                </span>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                  {active.topic || (active as any).title}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Recorded and uploaded by <span className="text-slate-300 font-semibold">{active.uploadedByName}</span>
                </p>
              </div>

              {/* Animated Waveform Visualizer simulation (Solid colors) */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 h-28">
                {Array.from({ length: 32 }).map((_, i) => {
                  const isCurrent = currentLecture?.id === active.id && isPlaying;
                  const randomHeight = isCurrent
                    ? `${Math.max(15, (Math.sin(i * 0.8 + currentTime * 3) + 1) * 45)}%`
                    : `${((i % 7) + 2) * 10}%`;

                  return (
                    <div
                      key={i}
                      className="w-1.5 bg-blue-500 rounded-full transition-all duration-150"
                      style={{ height: randomHeight }}
                    />
                  );
                })}
              </div>

              {/* Progress & Time */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>{currentLecture?.id === active.id ? formatTime(currentTime) : '00:00'}</span>
                  <span>{currentLecture?.id === active.id ? formatTime(duration) : active.duration}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={currentLecture?.id === active.id ? duration || 100 : 100}
                  value={currentLecture?.id === active.id ? currentTime : 0}
                  onChange={(e) => {
                    if (currentLecture?.id === active.id) {
                      seekTo(Number(e.target.value));
                    }
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Player Controls Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => skipSeconds(-10)}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    ⏪ -10s
                  </button>

                  <button
                    onClick={() => {
                      if (currentLecture?.id === active.id) {
                        togglePlay();
                      } else {
                        playLecture(active as any);
                      }
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-extrabold border border-blue-400 shadow flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>{currentLecture?.id === active.id && isPlaying ? '⏸️ Pause' : '▶️ Play Lecture'}</span>
                  </button>

                  <button
                    onClick={() => skipSeconds(10)}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    +10s ⏩
                  </button>
                </div>

                {/* Speed Mult buttons */}
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                  {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSpeed(spd)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        playbackRate === spd ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Synchronized Lecture Transcript / Notes */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📝</span> Lecture Transcript & Key Formulas
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {active.notes || (active as any).transcript}
                </p>
              </div>

              {/* Key Timestamps Jump List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  ⏱️ Key Lecture Timestamps (Click to Jump)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(active.timestamps || (active as any).keyTimestamps || []).map((ts: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (currentLecture?.id !== active.id) {
                          playLecture(active as any);
                        }
                        seekTo(ts.seconds);
                      }}
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500 text-left flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-medium text-slate-200 truncate mr-2">
                        {ts.label}
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {ts.time}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-2">
              <span className="text-4xl">🎧</span>
              <h3 className="text-slate-200 font-bold text-sm">No Lecture Audio Uploaded Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {canUpload
                  ? 'Click "Upload Audio Lecture" or head to the Admin Portal to upload recordings for the class.'
                  : 'Class lecture audio recordings uploaded by the Master Admin and Assistant Admins will appear here.'}
              </p>
              {canUpload && (
                <button
                  onClick={onOpenUpload}
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold border border-blue-400 shadow cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>🎙️</span>
                  <span>Upload Audio Lecture</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Playlist & Filter */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <h3 className="font-extrabold text-white text-sm">Course Audio Playlist</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono font-bold">
                {filteredLectures.length} tracks
              </span>
            </div>

            {/* Course Filter Dropdown */}
            {courses.length > 0 && (
              <div>
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Course Audios ({lectures.length})</option>
                  {courses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Track items list */}
            {filteredLectures.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-950 rounded-xl border border-slate-800">
                <span>🎧</span> No recordings found.
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredLectures.map((lec) => {
                  const isSelected = active?.id === lec.id;
                  const isNowPlaying = currentLecture?.id === lec.id && isPlaying;
                  const canDelete = currentUser?.matricNo === lec.uploadedBy || isMasterAdmin;

                  return (
                    <div
                      key={lec.id}
                      onClick={() => setActiveLectureForDetails(lec)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-blue-500 shadow'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="bg-blue-900 text-blue-200 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          {lec.courseCode}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          ⏱️ {lec.duration}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">
                        {lec.topic}
                      </h4>

                      <p className="text-[11px] text-slate-400 truncate mb-2">
                        Lecturer: {lec.lecturer}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playLecture(lec as any);
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isNowPlaying ? '⏸️ Playing' : '▶️ Play'}</span>
                        </button>

                        {canDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAudio(lec.id);
                            }}
                            className="p-1 bg-red-950 hover:bg-red-900 text-red-300 rounded border border-red-800 text-xs cursor-pointer"
                            title="Delete Audio"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
