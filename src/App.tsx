import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import { Navbar } from './components/Navbar';
import { AudioPlayerDock } from './components/AudioPlayerDock';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
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

import { Course, CourseNote, LectureRecording, Assignment, Announcement, PdfRequest } from './types';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const { currentUser, isMasterAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [courseFilter, setCourseFilter] = useState('ALL');

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

  // Load data for 400L
  const loadData = async () => {
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
      console.error('Failed to load live DB data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const isSecretAdminRoute = window.location.pathname === '/admin-access-2026' || 
                               window.location.hash === '#/admin-access-2026' || 
                               window.location.hash === '#admin-access-2026';
                                
    if (sessionStorage.getItem('pre_login_matric') || isSecretAdminRoute) {
      setAuthModalOpen(true);
    }

    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (tab: string, extra?: any) => {
    if (extra?.filterCourse) {
      setCourseFilter(extra.filterCourse);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login Gateway
  if (!currentUser) {
    return (
      <div 
        className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative overflow-hidden"
        style={{ backgroundImage: `url(${benzBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-slate-950/50 z-0"></div>
        
        <div className="relative z-10 max-w-md w-full bg-slate-900/90 border-2 border-slate-700/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center backdrop-blur-md">
          <div className="w-16 h-16 bg-blue-700 border-2 border-blue-400 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-xl animate-pulse">
            ⚙️
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-800">
              Department of Mechanical Engineering
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
              MEE 400L Portal Gateway
            </h1>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed font-medium">
              Welcome to the 400L Mechanical Engineering Class Portal! Sign in with your official matriculation number to access courses, notes, audio, and assignments.
            </p>
          </div>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] text-white font-extrabold rounded-2xl text-xs border border-blue-400 shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🔑</span>
            <span>Enter 400L Portal Gateway</span>
          </button>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </div>
    );
  }

  // Authenticated App
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pb-24 engineering-grid">
      <Navbar onNavigate={handleNavigate} activeTab={activeTab} setActiveTab={setActiveTab} announcements={announcements} courses={courses} notes={notes} recordings={recordings} assignments={assignments} onOpenAuth={() => setAuthModalOpen(true)} onOpenProfile={() => setProfileModalOpen(true)} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <DashboardView onNavigate={handleNavigate} courses={courses} notes={notes} recordings={recordings} assignments={assignments} announcements={announcements} />}
        {activeTab === 'announcements' && <AnnouncementsView announcements={announcements} courses={courses} onRefresh={loadData} />}
        {activeTab === 'courses' && <CoursesView courses={courses} notes={notes} onRefresh={loadData} onOpenUpload={() => setActiveTab('admin')} />}
        {activeTab === 'recordings' && <AudioLecturesView courses={courses} lectures={recordings} onRefresh={loadData} onOpenUpload={() => setActiveTab('admin')} />}
        {activeTab === 'assignments' && <AssignmentsView assignments={assignments} onRefresh={loadData} />}
        {activeTab === 'chat' && <ChatRoomView />}
        {activeTab === 'ai-tutor' && <AITutorView courses={courses} />}
        {activeTab === 'admin' && isMasterAdmin && <AdminPortalView courses={courses} assignments={assignments} pdfRequests={pdfRequests} onRefreshAll={loadData} />}
        {activeTab === 'pdf-requests' && <PdfRequestsView pdfRequests={pdfRequests} courses={courses} onRefresh={loadData} />}
        {activeTab === 'feedback' && <FeedbackView />}
      </main>
      <AudioPlayerDock />
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
