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
import { EmptyLevelView } from './views/EmptyLevelView';

import { Course, CourseNote, LectureRecording, Assignment, Announcement, PdfRequest } from './types';
import { api } from './services/api';

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

  // Global State (Cleanly initialized, loaded from backend)
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

  const loadAllData = async () => {
    try {
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
      console.error('Failed to load portal data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const isSecretAdminRoute = window.location.pathname === '/admin-access-2026' || 
                               window.location.hash === '#/admin-access-2026' || 
                               window.location.hash === '#admin-access-2026';
                               
    if (sessionStorage.getItem('pre_login_matric') || isSecretAdminRoute) {
      setAuthModalOpen(true);
    }
    const interval = setInterval(loadAllData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (tab: string, extra?: any) => {
    if (extra?.filterCourse) {
      setCourseFilter(extra.filterCourse);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Unauthenticated Gateway Screen (Mercedes-Benz Background showing clearly)
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
          <div className="w-16 h-16 bg-blue-700 border-2 border-blue-400 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-xl animate-pulse">
            ⚙️
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-800">
              Department of Mechanical Engineering
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">Class Portal Gateway</h1>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed font-medium">
              Welcome! Please enter the portal with your official matriculation number to pick your level and access course materials.
            </p>
          </div>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] text-white font-extrabold rounded-2xl text-xs border border-blue-400 shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🔑</span>
            <span>Enter Portal Gateway</span>
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

  // 2. Authenticated but level not selected yet -> Show Level Selector Page
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

  // 3. Authenticated and level selected is 200, 300, or 500 (Blank Level Page)
  if (selectedLevel === '200' || selectedLevel === '300' || selectedLevel === '500') {
    return (
      <>
        <EmptyLevelView
          level={selectedLevel}
          onBackToSelector={() => setSelectedLevel(null)}
          onSwitchTo400L={() => handleSelectLevel('400')}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </>
    );
  }

  // 4. Authenticated and level is '400' -> Full Active App
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
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <span>⚙️</span>
              <span>Synchronizing 400L Mechanical Engineering Portal...</span>
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
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'notes' && (
              <CoursesView
                courses={courses}
                notes={notes}
                onRefresh={loadAllData}
                onOpenUpload={() => setActiveTab('admin')}
                initialCourseFilter={courseFilter}
              />
            )}

            {activeTab === 'pdf-requests' && (
              <PdfRequestsView
                pdfRequests={pdfRequests}
                courses={courses}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'audio' && (
              <AudioLecturesView
                courses={courses}
                lectures={recordings}
                onRefresh={loadAllData}
                onOpenUpload={() => setActiveTab('admin')}
              />
            )}

            {activeTab === 'assignments' && (
              <AssignmentsView
                assignments={assignments}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'chat' && <ChatRoomView />}

            {activeTab === 'feedback' && <FeedbackView />}

            {activeTab === 'tutor' && <AITutorView courses={courses} />}

            {activeTab === 'admin' && (
              <AdminPortalView
                courses={courses}
                assignments={assignments}
                pdfRequests={pdfRequests}
                onRefreshAll={loadAllData}
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
