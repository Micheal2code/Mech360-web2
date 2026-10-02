import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { checkMatric, setupPassword, loginWithPassword, loginAsAdminQuick, currentUser, logout } = useAuth();

  // Secret admin route detection to hide Admin Login from homepage
  const isSecretAdminRoute = typeof window !== 'undefined' && (
    window.location.pathname === '/admin-access-2026' ||
    window.location.hash === '#/admin-access-2026' ||
    window.location.hash === '#admin-access-2026'
  );

  const [activeMode, setActiveMode] = useState<'student' | 'admin'>(
    isSecretAdminRoute ? 'admin' : 'student'
  );

  // Student Flow State (including Forgot Password steps)
  const [authStep, setAuthStep] = useState<'check_matric' | 'setup_password' | 'enter_password' | 'forgot_password' | 'enter_reset_code'>('check_matric');
  const [matricInput, setMatricInput] = useState('');
  const [studentInfo, setStudentInfo] = useState<{ matricNo: string; fullName: string } | null>(null);

  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');

  // Admin Quick Login State
  const [adminPin, setAdminPin] = useState('');

  // Brute-force Lockout State
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number>(0);
  const [loginAttempts, setLoginAttempts] = useState<number>(0);

  // Feedback State
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Check Lockout state continuously
  useEffect(() => {
    const checkLockout = () => {
      const lockTs = localStorage.getItem('classhub_login_lock');
      if (lockTs) {
        const diff = Date.now() - Number(lockTs);
        const LOCK_DURATION = 5 * 60 * 1000; // 5 minutes
        if (diff < LOCK_DURATION) {
          setLockoutTimeLeft(Math.ceil((LOCK_DURATION - diff) / 1000));
        } else {
          localStorage.removeItem('classhub_login_lock');
          setLockoutTimeLeft(0);
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-restore state if page was refreshed before login
  useEffect(() => {
    const pendingMatric = sessionStorage.getItem('pre_login_matric');
    if (pendingMatric && isOpen) {
      sessionStorage.removeItem('pre_login_matric');
      setMatricInput(pendingMatric);
      setLoading(true);
      checkMatric(pendingMatric)
        .then((res) => {
          setStudentInfo({ matricNo: res.matricNo, fullName: res.fullName });
          if (res.requiresPasswordSetup) {
            setAuthStep('setup_password');
            setSuccessMsg(`Welcome, ${res.fullName}! Please create your secure password.`);
          } else {
            setAuthStep('enter_password');
            setSuccessMsg(`Welcome back, ${res.fullName}! Enter your password.`);
          }
        })
        .catch((err) => {
          setErrorMsg(err.message || 'NO ACCESS: Matriculation number verification failed.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Check Matric Number & Refresh Page Before Login
  const handleCheckMatric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricInput.trim()) return;

    if (lockoutTimeLeft > 0) {
      setErrorMsg(`Too many tries, try again in 5 mins (${lockoutTimeLeft}s remaining)`);
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const currentLevel = localStorage.getItem('mee_selected_level') || '400';

    try {
      const res = await checkMatric(matricInput.trim().toUpperCase());
      setStudentInfo({ matricNo: res.matricNo, fullName: res.fullName });

      // Store pending matric and perform page refresh BEFORE login
      sessionStorage.setItem('pre_login_matric', res.matricNo);
      setSuccessMsg('Verifying account register...');
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (err: any) {
      setErrorMsg(err.message || 'NO ACCESS: Matriculation number not found in official student register.');
      setLoading(false);
    }
  };

  // Step 2A: First Time Password Setup & Refresh Page After Login
  const handleSetupPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInfo) return;

    if (lockoutTimeLeft > 0) {
      setErrorMsg(`Too many tries, try again in 5 mins (${lockoutTimeLeft}s remaining)`);
      return;
    }

    if (passwordInput.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const currentLevel = localStorage.getItem('mee_selected_level') || '400';

    try {
      const user = await setupPassword(studentInfo.matricNo, passwordInput);
      setSuccessMsg(`Welcome, ${user.fullName}! Password configured successfully. Refreshing page...`);
      setLoginAttempts(0);
      setTimeout(() => {
        onClose();
        resetForm();
        window.location.reload(); // Refresh page AFTER login
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to setup password.');
      setLoading(false);
    }
  };

  // Step 2B: Enter Password Login & Refresh Page After Login
  const handleLoginWithPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInfo) return;

    if (lockoutTimeLeft > 0) {
      setErrorMsg(`Too many tries, try again in 5 mins (${lockoutTimeLeft}s remaining)`);
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const currentLevel = localStorage.getItem('mee_selected_level') || '400';

    try {
      const user = await loginWithPassword(studentInfo.matricNo, passwordInput);
      setSuccessMsg(`Welcome, ${user.fullName}! Access granted. Refreshing page...`);
      setLoginAttempts(0);
      setTimeout(() => {
        onClose();
        resetForm();
        window.location.reload(); // Refresh page AFTER login
      }, 500);
    } catch (err: any) {
      const nextAttempts = loginAttempts + 1;
      setLoginAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        localStorage.setItem('classhub_login_lock', Date.now().toString());
        setLockoutTimeLeft(300);
        setErrorMsg('Too many tries, try again in 5 mins');
      } else {
        setErrorMsg(err.message || 'Incorrect password for this matriculation number.');
      }
      setLoading(false);
    }
  };

  // Admin Quick Login & Refresh Page After Login
  const handleAdminQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutTimeLeft > 0) {
      setErrorMsg(`Too many tries, try again in 5 mins (${lockoutTimeLeft}s remaining)`);
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await loginAsAdminQuick(adminPin.trim());
      setSuccessMsg('Master Admin authenticated successfully. Refreshing page...');
      setLoginAttempts(0);
      setTimeout(() => {
        onClose();
        resetForm();
        window.location.reload(); // Refresh page AFTER login
      }, 500);
    } catch (err: any) {
      const nextAttempts = loginAttempts + 1;
      setLoginAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        localStorage.setItem('classhub_login_lock', Date.now().toString());
        setLockoutTimeLeft(300);
        setErrorMsg('Too many tries, try again in 5 mins');
      } else {
        setErrorMsg(err.message || 'Invalid Admin PIN.');
      }
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricInput.trim()) {
      setErrorMsg('Please enter your matriculation number.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.forgotPassword(matricInput.trim().toUpperCase());
      setSuccessMsg(res.message || 'Verification code generated and sent to Admin Portal.');
      setAuthStep('enter_reset_code');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request password reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetWithCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricInput.trim() || !resetCodeInput.trim() || !passwordInput.trim()) {
      setErrorMsg('Matric number, reset code, and new password are required.');
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.resetWithCode(matricInput.trim().toUpperCase(), resetCodeInput.trim(), passwordInput.trim());
      setSuccessMsg(res.message || 'Password successfully reset! You can now log in.');
      setTimeout(() => {
        setAuthStep('enter_password');
        setResetCodeInput('');
        setPasswordInput('');
        setConfirmPasswordInput('');
        setErrorMsg('');
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password. Please check the reset code.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAuthStep('check_matric');
    setMatricInput('');
    setStudentInfo(null);
    setPasswordInput('');
    setConfirmPasswordInput('');
    setResetCodeInput('');
    setAdminPin('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative engineering-grid">
        {/* Header */}
        <div className="bg-slate-850 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/90 flex items-center justify-center text-xl shadow border border-blue-400">
              ⚙️
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                ClassHub Authentication
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">
                {(() => {
                  const lvl = typeof window !== 'undefined' ? localStorage.getItem('mee_selected_level') || '400' : '400';
                  return lvl === '400' ? 'Verified 114 Student Database • Secure Portal' : `${lvl}L Student Record Database • Secure Portal`;
                })()}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-slate-400 hover:text-white text-lg font-bold p-1.5 cursor-pointer rounded-xl hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Session Badge */}
          {currentUser && (
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between shadow">
              <div>
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  Active Session
                </div>
                <div className="text-xs font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <span>{currentUser.avatarEmoji}</span>
                  <span>{currentUser.fullName}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {currentUser.matricNo} •{' '}
                  <span className="text-blue-400 font-bold">
                    {currentUser.isAdmin ? 'Master Admin' : currentUser.isPartialAdmin ? 'Assistant Admin' : 'Student'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  resetForm();
                }}
                className="bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700 text-xs px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors shadow"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Mode Switcher Tabs (Only visible on the secret route) */}
          {isSecretAdminRoute && (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('student');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMode === 'student'
                    ? 'bg-blue-600 text-white shadow-lg border border-blue-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🎓</span>
                <span>Student Portal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode('admin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMode === 'admin'
                    ? 'bg-amber-700 text-amber-100 shadow-lg border border-amber-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>⚡</span>
                <span>Quick Admin</span>
              </button>
            </div>
          )}

          {/* Alert Banners */}
          {errorMsg && (
            <div className="bg-red-950/90 border border-red-700 text-red-200 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow">
              <span className="text-base">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/90 border border-emerald-700 text-emerald-200 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow">
              <span className="text-base">✅</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* STUDENT MODE */}
          {activeMode === 'student' && (
            <div>
              {/* STEP 1: CHECK MATRIC NUMBER */}
              {authStep === 'check_matric' && (
                <form onSubmit={handleCheckMatric} className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-200 mb-1.5">
                      Input Your Matriculation Number
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={20}
                      placeholder="e.g. EES/XX/XX/XXXX"
                      value={matricInput}
                      onChange={(e) => setMatricInput(e.target.value.slice(0, 20).toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none tracking-wider uppercase shadow-inner"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Format: <strong>EES/XX/XX/XXXX</strong> (Verified against official 114 student database).
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !matricInput.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-2xl text-xs border border-blue-400 shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Verifying Database Record...</span>
                    ) : (
                      <>
                        <span>🔑</span>
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2A: FIRST TIME LOGIN - SET UP PASSWORD */}
              {authStep === 'setup_password' && studentInfo && (
                <form onSubmit={handleSetupPasswordSubmit} className="space-y-4">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs">
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Verified Student</div>
                    <div className="text-sm font-extrabold text-white mt-0.5">{studentInfo.fullName}</div>
                    <div className="text-xs font-mono text-blue-400 font-bold">{studentInfo.matricNo}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-200 mb-1">
                      Create Your Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter password..."
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-200 mb-1">
                      Confirm Your Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password..."
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none shadow-inner"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthStep('check_matric')}
                      className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                    >
                      ← Back
                    </button>

                    <button
                      type="submit"
                      disabled={loading || !passwordInput || !confirmPasswordInput}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold py-2.5 px-5 rounded-xl text-xs border border-emerald-400 shadow cursor-pointer transition-all"
                    >
                      {loading ? 'Saving Password...' : '💾 Save Password & Login'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2B: RETURNING USER - ENTER PASSWORD */}
              {authStep === 'enter_password' && studentInfo && (
                <form onSubmit={handleLoginWithPasswordSubmit} className="space-y-4">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs">
                    <div className="text-slate-400 font-bold uppercase text-[10px]">Welcome Back</div>
                    <div className="text-sm font-extrabold text-white mt-0.5">{studentInfo.fullName}</div>
                    <div className="text-xs font-mono text-blue-400 font-bold">{studentInfo.matricNo}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-200 mb-1">
                      Enter Account Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none shadow-inner"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setAuthStep('check_matric')}
                        className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                      >
                        ← Change Matric
                      </button>

                      <button
                        type="button"
                        onClick={() => setAuthStep('forgot_password')}
                        className="text-xs font-bold text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        ❓ Forgot Password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !passwordInput}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-2xl text-xs border border-blue-400 shadow cursor-pointer transition-all"
                    >
                      {loading ? 'Verifying Password...' : '🔓 Enter Dashboard'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3A: FORGOT PASSWORD REQUEST CODE */}
              {authStep === 'forgot_password' && (
                <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs">
                    <div className="text-red-400 font-bold uppercase text-[10px]">Forgot Password Flow</div>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                      This will generate a 6-digit verification code and dispatch it to the Admin Portal. Contact the Class Rep / Administrator to retrieve your code.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-200 mb-1">
                      Your Matriculation Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="EES/XX/XX/XXXX"
                      value={matricInput}
                      onChange={(e) => setMatricInput(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm font-mono text-white tracking-wider uppercase focus:outline-none shadow-inner"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthStep(studentInfo ? 'enter_password' : 'check_matric')}
                      className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                    >
                      ← Back
                    </button>

                    <button
                      type="submit"
                      disabled={loading || !matricInput.trim()}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold py-2.5 px-5 rounded-xl text-xs border border-blue-400 shadow cursor-pointer transition-all"
                    >
                      {loading ? 'Generating...' : '🔑 Request Code'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3B: ENTER CODE & RESET PASSWORD */}
              {authStep === 'enter_reset_code' && (
                <form onSubmit={handleResetWithCodeSubmit} className="space-y-4">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs">
                    <div className="text-emerald-400 font-bold uppercase text-[10px]">Reset Password with Code</div>
                    <p className="text-slate-300 text-[11px] mt-1">
                      Enter the 6-digit code received from the Admin Portal, then set your new secure password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-200 mb-1">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={resetCodeInput}
                      onChange={(e) => setResetCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-2xl px-4 py-3 text-center text-lg font-mono text-white focus:outline-none shadow-inner tracking-[0.3em]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-200 mb-1">
                      Create New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="At least 4 characters"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-200 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Confirm your new password"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none shadow-inner"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthStep('forgot_password')}
                      className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                    >
                      ← Back
                    </button>

                    <button
                      type="submit"
                      disabled={loading || !resetCodeInput || !passwordInput || !confirmPasswordInput}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold py-2.5 px-5 rounded-xl text-xs border border-emerald-400 shadow cursor-pointer transition-all"
                    >
                      {loading ? 'Resetting...' : '💾 Reset & Save Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ADMIN QUICK MODE */}
          {activeMode === 'admin' && (
            <form onSubmit={handleAdminQuickLogin} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-extrabold text-amber-300">
                    Master Admin 4-Digit PIN
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Micheal Chukwuemeka OBI</span>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full bg-slate-950 border-2 border-amber-700/80 focus:border-amber-400 rounded-2xl px-4 py-3 text-center text-2xl tracking-[0.6em] font-mono text-amber-200 placeholder-slate-600 focus:outline-none shadow-inner"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Authenticates Master Administrator privilege override.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || adminPin.length !== 4}
                className="w-full bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-2xl text-xs border border-amber-500 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Authenticating Master Admin...</span>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Authenticate Master Admin</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
