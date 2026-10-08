import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import hackwaysLogo from '../assets/hackways-logo.jpg';

export default function AdminLoginPage() {
  const { user, isAdmin, adminLoginWithGoogle } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleGoogleAdminLogin = async () => {
    setGoogleLoading(true);
    setAuthError('');
    try {
      const res = await adminLoginWithGoogle();
      if (res.success) {
        success(res.message || 'Administrator authenticated successfully.');
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Admin Google Auth Error:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify you are using an assigned administrator Google account.';
      setAuthError(msg);
      showError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-1 rounded-2xl bg-white shadow-md border border-accent/15 mb-2">
            <img
              src={hackwaysLogo}
              onError={(e) => { e.currentTarget.src = '/hackways-logo.png'; }}
              alt="Hackways"
              className="w-12 h-12 rounded-xl object-contain shadow-xs"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Enterprise Security • Strict Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
            Admin Command Center
          </h1>
          <p className="text-xs sm:text-sm text-dark-muted max-w-sm mx-auto">
            Restricted access strictly for authorized administrators. Authenticate using your pre-assigned Google account.
          </p>
        </div>

        {/* Security Warning / Error Box */}
        {authError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/90 text-xs text-rose-900 flex items-start gap-3 shadow-xs">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-950">Security Access Denied</p>
              <p className="text-rose-800 leading-relaxed">{authError}</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white shadow-xl shadow-primary/5 border border-accent/20 rounded-3xl p-6 sm:p-8 space-y-6">
          {/* Primary Action: Google Sign-In with Firebase Auth */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleAdminLogin}
              disabled={googleLoading}
              className="w-full group relative flex items-center justify-center gap-3.5 py-3.5 px-5 rounded-2xl bg-white border-2 border-primary/20 hover:border-primary text-primary font-bold text-sm shadow-sm hover:shadow-md hover:bg-primary/5 transition-all cursor-pointer disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign In with Admin Google Account</span>
                  <ArrowRight className="w-4 h-4 text-accent transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/10 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary">
                <Shield className="w-3.5 h-3.5 text-secondary" />
                <span>Strict Google Identity Verification</span>
              </div>
              <p className="text-[11px] text-dark-muted leading-relaxed">
                You must authenticate using your assigned Google administrator account. Any unauthorized Google account or general participant will be automatically blocked.
              </p>
            </div>
          </div>

          {/* Return to Participant Login */}
          <div className="pt-4 border-t border-accent/15 text-center">
            <Link
              to="/login"
              className="text-xs font-semibold text-dark-muted hover:text-dark inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Participant Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
