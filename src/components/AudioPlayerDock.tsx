import React, { useState } from 'react';
import { useAudioPlayer } from '../context/AudioContext';

export const AudioPlayerDock: React.FC = () => {
  const {
    currentLecture,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    showDock,
    togglePlay,
    seekTo,
    setSpeed,
    setVolumeLevel,
    toggleMute,
    closeDock,
    skipSeconds,
  } = useAudioPlayer();

  const [showTranscript, setShowTranscript] = useState(false);

  if (!showDock || !currentLecture) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const speeds = [0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t-2 border-blue-600 shadow-2xl">
      {/* Transcript / Jump points drawer */}
      {showTranscript && (
        <div className="max-w-7xl mx-auto px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>📝</span> Synchronized Lecture Notes & Jump Points
            </span>
            <button
              onClick={() => setShowTranscript(false)}
              className="text-slate-400 hover:text-white cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-slate-300 leading-relaxed font-sans">{currentLecture.notes}</p>
            </div>
            <div>
              <p className="font-bold text-slate-400 mb-1">Key Timestamps:</p>
              <div className="space-y-1">
                {(currentLecture.timestamps || []).map((ts, idx) => (
                  <button
                    key={idx}
                    onClick={() => seekTo(ts.seconds)}
                    className="w-full text-left flex items-center justify-between p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                  >
                    <span className="truncate">{ts.label}</span>
                    <span className="font-mono text-blue-400 font-bold ml-2">{ts.time}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dock Controls */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Track Details */}
        <div className="flex items-center gap-3 w-full md:w-1/3">
          <div className="w-10 h-10 rounded-xl bg-blue-900 border border-blue-600 flex items-center justify-center text-xl flex-shrink-0 shadow">
            🎧
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="bg-blue-800 text-white text-[10px] font-bold px-1.5 py-0.2 rounded uppercase">
                {currentLecture.courseCode}
              </span>
              <p className="text-xs font-bold text-slate-100 truncate">{currentLecture.topic}</p>
            </div>
            <p className="text-[11px] text-slate-400 truncate">Lecturer: {currentLecture.lecturer}</p>
          </div>
        </div>

        {/* Playback Controls & Progress Bar */}
        <div className="flex flex-col items-center w-full md:w-1/2">
          {/* Controls button row */}
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => skipSeconds(-10)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer text-xs font-bold"
              title="Rewind 10 seconds"
            >
              ⏪ 10s
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center text-sm shadow cursor-pointer border border-blue-400"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            <button
              onClick={() => skipSeconds(10)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer text-xs font-bold"
              title="Forward 10 seconds"
            >
              10s ⏩
            </button>

            {/* Speeds selector */}
            <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5 ml-2">
              {speeds.map((rate) => (
                <button
                  key={rate}
                  onClick={() => setSpeed(rate)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    playbackRate === rate ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Seek bar */}
          <div className="w-full flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-[11px] font-mono text-slate-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume, Transcript & Close */}
        <div className="flex items-center justify-end gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border cursor-pointer ${
              showTranscript
                ? 'bg-blue-900 border-blue-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>📝</span>
            <span className="hidden sm:inline">Notes</span>
          </button>

          <button
            onClick={toggleMute}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
            title="Mute/Unmute"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolumeLevel(Number(e.target.value))}
            className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hidden sm:block"
          />

          <button
            onClick={closeDock}
            className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-slate-800 cursor-pointer ml-1 text-sm font-bold"
            title="Close Player"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
