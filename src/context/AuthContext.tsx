import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { OFFICIAL_ROSTER_114 } from '../data/rosterData';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkMatric: (matricNo: string, level?: string) => Promise<{ matricNo: string; fullName: string; requiresPasswordSetup: boolean }>;
  setupPassword: (matricNo: string, password: string, level?: string) => Promise<User>;
  loginWithPassword: (matricNo: string, password: string, level?: string) => Promise<User>;
  loginAsAdminQuick: (pin: string) => Promise<void>;
  logout: () => void;
  isMasterAdmin: boolean;
  isAssistantAdmin: boolean;
  canUpload: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'classhub_auth_session_400l';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const session = JSON.parse(stored);
          if (session && session.matricNo && session.isLoggedIn) {
            const normalized = session.matricNo.toUpperCase();
            const isMaster = normalized === 'EES/23/24/0456';
            
            // Session Expiry Check: Auto Logout after 2 Hours (complying with rule 7)
            const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
            if (Date.now() - session.timestamp > TWO_HOURS_MS) {
              localStorage.removeItem(STORAGE_KEY);
              setCurrentUser(null);
              alert('Your secure session expired after 2 hours. Please log in again.');
              window.location.reload();
              return;
            }

            // Hydrate the latest assistant status dynamically from localStorage
            const savedAssistants: string[] = JSON.parse(localStorage.getItem('classhub_assistant_admins') || '[]');
            const isAssistant = savedAssistants.includes(normalized);

            // Sync with backend to check if password was reset or changed in real-time
            const pass = localStorage.getItem('classhub_pass_' + normalized);
            if (pass) {
              try {
                const verifyRes = await api.verifySession(normalized, pass);
                if (verifyRes.success && verifyRes.user) {
                  const latestUser = {
                    ...verifyRes.user,
                    isAdmin: isMaster,
                    isPartialAdmin: isMaster || isAssistant || verifyRes.user.isPartialAdmin,
                  };
                  setCurrentUser(latestUser);
                  return;
                }
              } catch (verifyErr: any) {
                // If the error status is 401 (meaning password changed/reset on server), invalidate session immediately!
                if (verifyErr.status === 401) {
                  localStorage.removeItem(STORAGE_KEY);
                  setCurrentUser(null);
                  alert(verifyErr.message || 'Session expired: Your password was changed or reset by the Administrator. Please log in again.');
                  window.location.reload();
                  return;
                }
              }
            }

            // Offline fallback: Hydrate minimal user details from official register (complying with rule 7)
            const student = OFFICIAL_ROSTER_114.find((s) => s.matricNo === normalized);
            if (student) {
              const fallbackUser: User = {
                matricNo: student.matricNo,
                fullName: student.fullName,
                department: 'Mechanical Engineering',
                level: student.level,
                isAdmin: isMaster,
                isPartialAdmin: isMaster || isAssistant || student.isPartialAdmin,
                avatarEmoji: student.avatarEmoji,
              };
              setCurrentUser(fallbackUser);
            } else {
              // Non-400L fallback session user
              const levelPrefix = localStorage.getItem('mee_selected_level') || '200';
              const fallbackUser: User = {
                matricNo: normalized,
                fullName: localStorage.getItem('classhub_name_' + levelPrefix + '_' + normalized) || `Student (${normalized})`,
                department: 'Mechanical Engineering',
                level: `${levelPrefix}L`,
                isAdmin: false,
                isPartialAdmin: false,
                avatarEmoji: '🎓',
              };
              setCurrentUser(fallbackUser);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  // Automatic logout after 1 minute (60 seconds) of inactivity
  useEffect(() => {
    if (!currentUser) return;

    const INACTIVITY_LIMIT_MS = 60 * 1000; // 1 minute (60,000 ms)
    let timeoutId: NodeJS.Timeout;

    const handleInactivityLogout = () => {
      localStorage.removeItem(STORAGE_KEY);
      setCurrentUser(null);
      alert('Session expired: You were automatically logged out due to 1 minute of inactivity.');
      window.location.reload();
    };

    const resetInactivityTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleInactivityLogout, INACTIVITY_LIMIT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((evt) => window.addEventListener(evt, resetInactivityTimer, { passive: true }));

    resetInactivityTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [currentUser]);

  const checkMatric = async (matricNo: string, level: string = '400') => {
    return await api.checkMatric(matricNo, level);
  };

  const setupPassword = async (matricNo: string, password: string, level: string = '400') => {
    const res = await api.setupPassword(matricNo, password, level);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      const sessionObj = { matricNo: res.user.matricNo, isLoggedIn: true, timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionObj));
      return res.user;
    }
    throw new Error('Failed to setup password');
  };

  const loginWithPassword = async (matricNo: string, password: string, level: string = '400') => {
    const res = await api.loginWithPassword(matricNo, password, level);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      const sessionObj = { matricNo: res.user.matricNo, isLoggedIn: true, timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionObj));
      return res.user;
    }
    throw new Error('Incorrect password');
  };

  const loginAsAdminQuick = async (pin: string) => {
    const res = await api.adminQuickLogin(pin);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      // Store only secure session object with no full credentials in local storage (complying with rule 7)
      const sessionObj = { matricNo: res.user.matricNo, isLoggedIn: true, timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionObj));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const isMasterAdmin = currentUser?.isAdmin === true;
  const isAssistantAdmin = currentUser?.isPartialAdmin === true && !isMasterAdmin;
  const canUpload = currentUser?.isAdmin === true || currentUser?.isPartialAdmin === true;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        checkMatric,
        setupPassword,
        loginWithPassword,
        loginAsAdminQuick,
        logout,
        isMasterAdmin,
        isAssistantAdmin,
        canUpload,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
