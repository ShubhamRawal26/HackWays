import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import MyEventsPage from './pages/MyEventsPage';
import EventSubmissionPage from './pages/EventSubmissionPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import StudentDashboardPage from './pages/StudentDashboardPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProblemStatements from './pages/admin/AdminProblemStatements';
import AdminSchedule from './pages/admin/AdminSchedule';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import AdminSettings from './pages/admin/AdminSettings';

import { UserProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-dark">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function RootRoute() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return (
    <PublicLayout>
      <LandingPage />
    </PublicLayout>
  );
}

function LoginRoute() {
  return (
    <PublicLayout>
      <LoginPage />
    </PublicLayout>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Public / Participant Routes */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/admin/login"
        element={
          <PublicLayout>
            <AdminLoginPage />
          </PublicLayout>
        }
      />
      <Route
        path="/events"
        element={
          <PublicLayout>
            <EventsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/events/:id"
        element={
          <PublicLayout>
            <EventDetailPage />
          </PublicLayout>
        }
      />

      <Route
        path="/privacy"
        element={
          <PublicLayout>
            <PrivacyPolicyPage />
          </PublicLayout>
        }
      />
      <Route
        path="/terms"
        element={
          <PublicLayout>
            <TermsPage />
          </PublicLayout>
        }
      />

      {/* Protected Participant Routes */}
      <Route
        path="/dashboard"
        element={
          <UserProtectedRoute>
            <StudentDashboardPage />
          </UserProtectedRoute>
        }
      />
      <Route path="/student/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/my-events"
        element={
          <UserProtectedRoute>
            <PublicLayout>
              <MyEventsPage />
            </PublicLayout>
          </UserProtectedRoute>
        }
      />
      <Route
        path="/events/:eventId/submissions"
        element={
          <UserProtectedRoute>
            <PublicLayout>
              <EventSubmissionPage />
            </PublicLayout>
          </UserProtectedRoute>
        }
      />

      {/* Protected Admin Console Routes */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="problem-statements" element={<AdminProblemStatements />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="submissions" element={<AdminSubmissions />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
