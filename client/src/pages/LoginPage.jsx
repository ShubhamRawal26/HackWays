import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, isSuperAdmin } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import hackwaysLogo from '../assets/hackways-logo.jpg';
import UserDetailsModal from '../components/UserDetailsModal';
import {
  User,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Lock,
  Trophy,
  Users,
  BadgeCheck,
  LogOut,
} from 'lucide-react';

export default function LoginPage() {
  const { user, loginWithGoogle, logout } = useAuth();
  const { error: showError, info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Popup Modal visibility
  const [showModal, setShowModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const getDestination = (targetUser) => {
    const checkUser = targetUser || user;
    if (isSuperAdmin(checkUser?.email) || checkUser?.role === 'superadmin' || checkUser?.role === 'admin') {
      return '/admin/dashboard';
    }
    const from = location.state?.from?.pathname;
    return from && from !== '/' && !from.includes('/login') ? from : '/dashboard';
  };

  // Ensure sign in page is always scrolled to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // If user is already logged in with complete profile, redirect to dashboard immediately
  useEffect(() => {
    if (user) {
      const isComplete = Boolean(
        user.name &&
        user.phone &&
        (user.institute || user.college) &&
        user.year
      );

      if (isComplete || isSuperAdmin(user.email)) {
        navigate(getDestination(user), { replace: true });
      } else {
        setShowModal(true);
      }
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        const u = res.user;
        const isComplete = Boolean(
          u &&
          u.name &&
          u.phone &&
          (u.institute || u.college) &&
          u.year
        );

        if (!isComplete && !res.isAdmin) {
          setShowModal(true);
          info('Please complete your details to continue.');
        } else {
          success(res.message || 'Welcome back!');
          navigate(getDestination(u), { replace: true });
        }
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      showError(err.message || 'Google Sign-In failed or was cancelled.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleProfileSaved = (updatedUser) => {
    setShowModal(false);
    navigate(getDestination(updatedUser), { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Decorative ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Back navigation */}
        <div className="flex items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Hackathon</span>
          </Link>
        </div>

        {/* Brand header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-1 rounded-2xl bg-white shadow-md border border-accent/15 mx-auto">
            <img
              src={hackwaysLogo}
              onError={(e) => { e.currentTarget.src = '/hackways-logo.png'; }}
              alt="Hackways"
              className="w-12 h-12 rounded-xl object-contain shadow-xs"
            />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
              <BadgeCheck className="w-3.5 h-3.5" />
              CIT Coding Carnival 2026
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
              Start Registration
            </h1>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-xl shadow-primary/5 border border-accent/20 rounded-3xl p-6 sm:p-8 transition-all">
          <div className="space-y-6">
            {user ? (
              /* If user is already authenticated */
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-11 h-11 rounded-full object-cover border border-primary/20 shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-dark truncate">{user.name || 'User'}</p>
                    <p className="text-[11px] text-dark-muted truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Signed In
                      </span>
                      {user.year && (
                        <span className="text-[10px] font-semibold text-accent bg-secondary/40 px-2 py-0.5 rounded-md">
                          {user.year}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="w-full py-3 px-3 rounded-xl border-2 border-primary/20 hover:border-primary bg-primary/5 text-primary font-bold text-xs sm:text-sm transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Enter Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(getDestination(user))}
                    className="w-full btn-primary py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-1.5 text-xs text-dark-muted hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out / Switch account</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Direct Google Sign In Button */
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3.5 py-3.5 px-5 rounded-xl border-2 border-accent/20 bg-white hover:bg-neutral-50/80 text-dark font-bold text-sm sm:text-base transition-all shadow-xs hover:shadow-md hover:border-accent/40 active:scale-[0.99] disabled:opacity-60 cursor-pointer group"
              >
                {googleLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                ) : (
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>
            )}

            {/* Verified Trust Strip */}
            <div className="flex items-center gap-3">
              <div className="h-px bg-accent/15 flex-1" />
              <span className="text-[10px] font-bold text-accent/70 uppercase tracking-widest">
                Event Highlights
              </span>
              <div className="h-px bg-accent/15 flex-1" />
            </div>

            {/* Value Highlight Cards - Compact */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-background-cream/60 border border-accent/15">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-dark leading-tight">₹99 Entry</span>
                <span className="text-[10px] text-dark-muted leading-tight mt-0.5">100% Refundable</span>
              </div>

              <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-background-cream/60 border border-accent/15">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mb-1.5">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-dark leading-tight">4 Members</span>
                <span className="text-[10px] text-dark-muted leading-tight mt-0.5">Per Team</span>
              </div>

              <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-background-cream/60 border border-accent/15">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mb-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-dark leading-tight">₹25,000+</span>
                <span className="text-[10px] text-dark-muted leading-tight mt-0.5">Cash Prizes</span>
              </div>
            </div>

            {/* Security & Terms Footer */}
            <div className="pt-2 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-dark-muted">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secure 1-click verification • No passwords stored</span>
              </div>
              <div className="text-[10px] text-dark-muted/80">
                By continuing, you agree to the{' '}
                <Link to="/terms" className="underline hover:text-primary">
                  Terms
                </Link>{' '}
                &amp;{' '}
                <Link to="/privacy" className="underline hover:text-primary">
                  Privacy Policy
                </Link>.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal Popup */}
      <UserDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSaved={handleProfileSaved}
      />
    </div>
  );
}
