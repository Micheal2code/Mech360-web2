import React from 'react';
import benzBg from '../assets/images/benz_engineering_bg_1790892027687.jpg';

interface EmptyLevelViewProps {
  level: string;
  onBackToSelector: () => void;
  onSwitchTo400L: () => void;
}

export const EmptyLevelView: React.FC<EmptyLevelViewProps> = ({
  level,
  onBackToSelector,
  onSwitchTo400L,
}) => {
  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${benzBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950/85 z-0"></div>

      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <button
          onClick={onBackToSelector}
          className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg"
        >
          <span>←</span>
          <span>Return to Level Selector</span>
        </button>

        <button
          onClick={onSwitchTo400L}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xl"
        >
          <span>🚀</span>
          <span>Switch to 400L Active App</span>
        </button>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto w-full my-auto text-center space-y-6 bg-slate-900/90 border-2 border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-md">
        <div className="w-20 h-20 bg-slate-800 border-2 border-slate-600 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner text-slate-400 animate-pulse">
          🔒
        </div>

        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-800">
            {level} Level Mechanical Engineering
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-3">
            Level Portal Empty
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
            The course notes, lecture recordings, and assignment portal for <strong>{level} Level</strong> are currently blank as course materials are being compiled by class representatives.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-left">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <span>ℹ️</span>
            <span>Level Status & Recommendations:</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside leading-relaxed">
            <li>400 Level holds the complete active portal with notes, audio, and AI tutor.</li>
            <li>You can navigate back to choose another level or switch directly to 400L.</li>
            <li>When material for {level}L is published, it will automatically populate here.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onBackToSelector}
            className="w-full sm:w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            ← Select Different Level
          </button>
          <button
            onClick={onSwitchTo400L}
            className="w-full sm:w-1/2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl border border-blue-400 shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            <span>Open 400L Active Portal</span>
          </button>
        </div>
      </main>

      <footer className="relative z-10 text-center py-4 text-xs font-semibold text-slate-400">
        Mechanical Engineering Class Portal • {level} Level Page
      </footer>
    </div>
  );
};
