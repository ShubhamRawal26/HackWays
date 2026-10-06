import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function UserProtectedRoute({ children }) {
  const { user, isAdmin, isSuperAdminEmail, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If logged-in user is an Admin or Super Admin, automatically redirect to Admin Console
  const searchParams = new URLSearchParams(location.search);
  const isPreview = searchParams.get('preview') === 'true';
  const isSuper = user?.role === 'superadmin' || user?.role === 'admin' || isAdmin;

  if (isSuper && !isPreview) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If student profile is incomplete (missing student info or ID card upload), redirect to login to complete profile
  const isComplete = Boolean(
    user?.name &&
    user?.phone &&
    (user?.institute || user?.college) &&
    user?.year &&
    user?.idCardUrl
  );

  if (!isComplete && !isSuper) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function AdminProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
