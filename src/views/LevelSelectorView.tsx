import React from 'react';
import benzBg from '../assets/images/benz_engineering_bg_1790892027687.jpg';
import { useAuth } from '../context/AuthContext';

interface LevelSelectorViewProps {
  onSelectLevel: (level: '200' | '300' | '400' | '500') => void;
  onLogout?: () => void;
}

export const LevelSelectorView: React.FC<LevelSelectorViewProps> = ({ onSelectLevel, onLogout }) => {
  const { currentUser, logout } = useAuth();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
  };

  const levels = [
    {
      id: '200' as const,
      number: '200',
      title: '200 Level',
      subtitle: 'Fundamentals of Mechanical Engineering',
      status: 'BLANK',
      statusLabel: '🔒 Blank Database Portal',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700 font-bold',
      description: '200 Level Mechanical Engineering portal featuring a clean blank database. Login with any valid matric number format.',
      courses: ['Statics', 'Engineering Drawing', 'Basic Thermodynamics'],
      active: true,
    },
    {
      id: '300' as const,
      number: '300',
      title: '300 Level',
      subtitle: 'Intermediate Thermo-Fluids & Design',
      status: 'BLANK',
      statusLabel: '🔒 Blank Database Portal',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700 font-bold',
      description: '300 Level Mechanical Engineering portal featuring a clean blank database. Login with any valid matric number format.',
      courses: ['Fluid Mechanics I', 'Applied Thermo', 'Strength of Materials'],
      active: true,
    },
    {
      id: '400' as const,
      number: '400',
      title: '400 Level',
      subtitle: 'Advanced Systems, Turbomachinery & CAD',
      status: 'ACTIVE',
      statusLabel: '⚡ 400L Live DB (114 Students)',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-600 font-extrabold shadow-sm',
      description: 'Official 400L portal with live database connection and verified 114 student matric register enforcement.',
      courses: ['MEE 401 Adv. Thermo', 'MEE 403 Turbomachinery', 'MEE 405 CAD/CAM & FEA'],
      active: true,
    },
    {
      id: '500' as const,
      number: '500',
      title: '500 Level',
      subtitle: 'Final Year Specialization & Project Thesis',
      status: 'BLANK',
      statusLabel: '🔒 Blank Database Portal',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700 font-bold',
      description: '500 Level Mechanical Engineering portal featuring a clean blank database. Login with any valid matric number format.',
      courses: ['Power Plant Eng.', 'Mechatronics', 'Final Year Thesis'],
      active: true,
    },
  ];

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-cover bg-center bg-fixed relative overflow-y-auto"
      style={{ backgroundImage: `url(${benzBg})` }}
    >
      {/* Reduced overlay opacity so Mercedes-Benz background wireframe shows as much as possible */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/80 z-0"></div>

      {/* Top Header Row */}
      <header className="relative z-10 max-w-6xl mx-auto w-full flex flex-wrap items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-700/90 border border-blue-400 rounded-xl flex items-center justify-center text-xl shadow-lg">
            ⚙️
          </div>
          <div>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
              Department of Mechanical Engineering
            </span>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">Portal Gateway</h1>
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700/80 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg">
            <span className="text-lg">{currentUser.avatarEmoji || '🎓'}</span>
            <div className="text-left">
              <div className="text-xs font-extrabold text-white">{currentUser.fullName}</div>
              <div className="text-[10px] text-blue-300 font-mono">{currentUser.matricNo}</div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="ml-2 text-xs text-red-300 hover:text-red-200 bg-red-950/60 hover:bg-red-900 border border-red-800 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer"
            >
              Log Out
            </button>
          </div>
        )}
      </header>

      {/* Main Selection Body */}
      <main className="relative z-10 max-w-5xl mx-auto w-full my-auto py-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-blue-500/50 backdrop-blur-md px-4 py-1.5 rounded-full shadow-xl">
            <span className="text-sm">🏎️</span>
            <span className="text-xs font-bold text-slate-200">Select Academic Level</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            Choose Your Class Level
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow">
            Access specialized lecture notes, audio recordings, problem sets, and AI tutoring for your specific academic year.
          </p>
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {levels.map((lvl) => (
            <div
              key={lvl.id}
              onClick={() => onSelectLevel(lvl.id)}
              className={`group relative rounded-2xl sm:rounded-3xl p-6 sm:p-7 border transition-all duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-md ${
                lvl.active
                  ? 'bg-slate-900/90 hover:bg-slate-900 border-blue-500 hover:border-blue-400 shadow-2xl hover:shadow-blue-500/20 scale-[1.01] hover:scale-[1.02]'
                  : 'bg-slate-900/75 hover:bg-slate-900/85 border-slate-700/80 hover:border-slate-600 shadow-xl'
              }`}
            >
              {lvl.active && (
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-blue-300 shadow-lg animate-pulse">
                  ⭐ Current App Level
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
                      {lvl.number}L
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                        {lvl.title}
                      </h3>
                      <p className="text-[11px] text-slate-300 font-medium">{lvl.subtitle}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-lg border ${lvl.badgeColor}`}>
                    {lvl.statusLabel}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {lvl.description}
                </p>

                {/* Course List Preview */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Key Modules:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lvl.courses.map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-950/80 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLevel(lvl.id);
                  }}
                  className={`w-full py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                    lvl.active
                      ? 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 group-hover:shadow-blue-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
                  }`}
                >
                  <span>{lvl.active ? '🚀 Enter 400L Active Portal' : `📂 View ${lvl.number}L Portal Page`}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center py-4 border-t border-slate-800/60 mt-6">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
          <span>🏎️</span>
          <span>Mercedes-Benz Engineering CAD Wireframe Gateway</span>
          <span>•</span>
          <span className="text-blue-300">MEE Class Portal</span>
        </div>
      </footer>
    </div>
  );
};
