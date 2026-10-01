import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { Navbar } from './components/Navbar';
import { AudioPlayerDock } from './components/AudioPlayerDock';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import blueprintBg from './assets/images/mechanical_blueprint_1790878784682.jpg';
import benzBg from './assets/images/benz_engineering_bg_1790892027687.jpg';

import { DashboardView } from './views/DashboardView';
import { AnnouncementsView } from './views/AnnouncementsView';
import { CoursesView } from './views/CoursesView';
import { AudioLecturesView } from './views/AudioLecturesView';
import { AssignmentsView } from './views/AssignmentsView';
import { ChatRoomView } from './views/ChatRoomView';
import { AITutorView } from './views/AITutorView';
import { AdminPortalView } from './views/AdminPortalView';
import { PdfRequestsView } from './views/PdfRequestsView';
import { FeedbackView } from './views/FeedbackView';
import { LevelSelectorView } from './views/LevelSelectorView';

import { Course, CourseNote, LectureRecording, Assignment, Announcement, PdfRequest } from './types';
import { api } from './services/api';
import {
  LEVEL_COURSES,
  LEVEL_NOTES,
  LEVEL_RECORDINGS,
  LEVEL_ASSIGNMENTS,
  LEVEL_ANNOUNCEMENTS,
} from './data/levelData';

const AppContent: React.FC = () => {
  const { currentUser, isMasterAdmin, canUpload } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [courseFilter, setCourseFilter] = useState('ALL');

  // Academic Level Selection state ('200' | '300' | '400' | '500' | null)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(() => {
    return localStorage.getItem('mee_selected_level') || null;
  });

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Global State
  const [courses, setCourses] = useState<Course[]>([]);
  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [recordings, setRecordings] = useState<LectureRecording[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pdfRequests, setPdfRequests] = useState<PdfRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSelectLevel = (level: string) => {
    setSelectedLevel(level);
    localStorage.setItem('mee_selected_level', level);
  };

  // Load data according to level (400L reads live DB; 200L/300L/500L read local level curriculum)
  const loadLevelData = async () => {
    if (!selectedLevel) return;

    if (selectedLevel === '400') {
      try {
        setLoading(true);
        const [coursesRes, notesRes, recsRes, assRes, annRes, pdfRes] = await Promise.all([
          api.getCourses(),
          api.getNotes(),
          api.getRecordings(),
          api.getAssignments(),
          api.getAnnouncements(),
          api.getPdfRequests(),
        ]);

        setCourses(coursesRes.courses || []);
        setNotes(notesRes.notes || []);
        setRecordings(recsRes.recordings || []);
        setAssignments(assRes.assignments || []);
        setAnnouncements(annRes.announcements || []);
        setPdfRequests(pdfRes.pdfRequests || []);
      } catch (e) {
        console.error('Failed to load 400L live DB data:', e);
      } finally {
        setLoading(false);
      }
    } else {
      // Apart from 400L, all other levels have a blank database
      setCourses([]);
      setNotes([]);
      setRecordings([]);
      setAssignments([]);
      setAnnouncements([]);
      setPdfRequests([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLevelData();
    const isSecretAdminRoute = window.location.pathname === '/admin-access-2026' || 
                               window.location.hash === '#/admin-access-2026' || 
                               window.location.hash === '#admin-access-2026';
                               
    if (sessionStorage.getItem('pre_login_matric') || isSecretAdminRoute) {
      setAuthModalOpen(true);
    }

    // Only poll live DB if 400L selected
    let interval: any;
    if (selectedLevel === '400') {
      interval = setInterval(loadLevelData, 6000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedLevel]);

  const handleNavigate = (tab: string, extra?: any) => {
    if (extra?.filterCourse) {
      setCourseFilter(extra.filterCourse);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Level Selection Page comes FIRST (before login)
  if (!selectedLevel) {
    return (
      <>
        <LevelSelectorView
          onSelectLevel={handleSelectLevel}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </>
    );
  }

  // 2. Unauthenticated Login Gateway for the Selected Level
  if (!currentUser) {
    return (
      <div 
        className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative overflow-hidden"
        style={{ backgroundImage: `url(${benzBg})` }}
      >
        {/* Soft, lightened gradient overlay so Benz engineering car background shines through brightly */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-slate-950/50 z-0"></div>
        
        {/* Main focused login gateway card */}
        <div className="relative z-10 max-w-md w-full bg-slate-900/90 border-2 border-slate-700/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center backdrop-blur-md">
          <button
            onClick={() => setSelectedLevel(null)}
            className="text-xs text-blue-300 hover:text-white font-bold bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1 mx-auto"
          >
            <span>←</span>
            <span>Switch Level (Currently {selectedLevel}L)</span>
          </button>

          <div className="w-16 h-16 bg-blue-700 border-2 border-blue-400 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-xl animate-pulse">
            ⚙️
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-800">
              Department of Mechanical Engineering
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
              {selectedLevel}L Portal Gateway
            </h1>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed font-medium">
              Welcome to the {selectedLevel}L Mechanical Engineering Class Portal! Sign in with your official matriculation number to access courses, notes, audio, and assignments.
            </p>
          </div>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] text-white font-extrabold rounded-2xl text-xs border border-blue-400 shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🔑</span>
            <span>Enter {selectedLevel}L Portal Gateway</span>
          </button>
        </div>

        {/* Modal rendering */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </div>
    );
  }

  // 3. Authenticated -> Full Active App for Selected Level
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pb-24 engineering-grid">
      {/* Navbar with search capabilities and level switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        announcements={announcements}
        courses={courses}
        notes={notes}
        recordings={recordings}
        assignments={assignments}
        selectedLevel={selectedLevel}
        onSwitchLevel={() => setSelectedLevel(null)}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Main Content View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {selectedLevel !== '400' && (
          <div className="mb-4 p-3 rounded-2xl bg-indigo-950/60 border border-indigo-700/60 flex items-center justify-between text-xs text-indigo-200 shadow">
            <div className="flex items-center gap-2">
              <span>🎓</span>
              <span>
                You are viewing <strong>{selectedLevel} Level Local Portal</strong>. All modules run smoothly without modifying the 400L live database.
              </span>
            </div>
            <button
              onClick={() => handleSelectLevel('400')}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-lg border border-blue-400 cursor-pointer transition-all"
            >
              Switch to 400L Live DB →
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <span>⚙️</span>
              <span>Synchronizing {selectedLevel}L Mechanical Engineering Portal...</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              courses={courses}
              notes={notes}
              recordings={recordings}
              assignments={assignments}
              announcements={announcements}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementsView
              announcements={announcements}
              courses={courses}
              onRefresh={loadLevelData}
            />
          )}

          {activeTab === 'notes' && (
            <CoursesView
              courses={courses}
              notes={notes}
              onRefresh={loadLevelData}
              onOpenUpload={() => setActiveTab('admin')}
              initialCourseFilter={courseFilter}
            />
          )}

          {activeTab === 'pdf-requests' && (
            <PdfRequestsView
              pdfRequests={pdfRequests}
              courses={courses}
              onRefresh={loadLevelData}
            />
          )}

          {activeTab === 'audio' && (
            <AudioLecturesView
              courses={courses}
              lectures={recordings}
              onRefresh={loadLevelData}
              onOpenUpload={() => setActiveTab('admin')}
            />
          )}

          {activeTab === 'assignments' && (
            <AssignmentsView
              assignments={assignments}
              onRefresh={loadLevelData}
            />
          )}

          {activeTab === 'chat' && <ChatRoomView />}

          {activeTab === 'feedback' && <FeedbackView />}

          {activeTab === 'tutor' && <AITutorView courses={courses} level={selectedLevel} />}

          {activeTab === 'admin' && (
            <AdminPortalView
              courses={courses}
              assignments={assignments}
              pdfRequests={pdfRequests}
              onRefreshAll={loadLevelData}
            />
          )}
        </div>
      </main>

      {/* Floating Audio Dock */}
      <AudioPlayerDock />

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </AuthProvider>
  );
}
