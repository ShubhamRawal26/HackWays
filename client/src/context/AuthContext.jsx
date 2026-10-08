import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export const SUPER_ADMIN_EMAILS = [
  'discountbuddyshubham@gmail.com',
  'sureshcitabu@gmail.com',
  'tmgmayankff@gmail.com',
];

export const isSuperAdmin = (email) => {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(String(email).trim().toLowerCase());
};

export const isAuthorizedAdminEmail = (email) => {
  if (!email) return false;
  const clean = String(email).trim().toLowerCase();
  if (isSuperAdmin(clean)) return true;
  try {
    const raw = localStorage.getItem('hackways_rtdb_mock_store');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.admins) {
        return Object.values(parsed.admins).some(
          (a) => a.email && String(a.email).trim().toLowerCase() === clean
        );
      }
    }
  } catch {}
  return false;
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('org_user');
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      if (isSuperAdmin(parsed.email)) {
        parsed.role = 'superadmin';
      } else if (!isAuthorizedAdminEmail(parsed.email)) {
        parsed.role = 'user';
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState(() => {
    try {
      const cached = localStorage.getItem('org_user');
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      if (isSuperAdmin(parsed.email)) return 'superadmin';
      if (!isAuthorizedAdminEmail(parsed.email)) return 'user';
      return parsed.role || 'user';
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    const hasToken = !!localStorage.getItem('org_token');
    const hasUser = !!localStorage.getItem('org_user');
    return hasToken && !hasUser;
  });

  // Initialize auth from localStorage / API
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('org_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          const userObj = res.data.user;
          const isSuper = isSuperAdmin(userObj?.email);
          const isAuthAdmin = isAuthorizedAdminEmail(userObj?.email);
          const assignedRole = isSuper ? 'superadmin' : (isAuthAdmin ? (res.data.role || userObj?.role || 'admin') : 'user');
          const updatedUser = { ...userObj, role: assignedRole };
          setUser(updatedUser);
          setRole(assignedRole);
          localStorage.setItem('org_user', JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        localStorage.removeItem('org_token');
        localStorage.removeItem('org_user');
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Send OTP for Login or Sign Up
  const sendOTP = async (payload) => {
    const res = await api.post('/auth/send-otp', payload);
    return res.data;
  };

  // Verify OTP and store session
  const verifyOTP = async (payload) => {
    const res = await api.post('/auth/verify-otp', payload);
    if (res.data.success) {
      const isSuper = isSuperAdmin(res.data.user?.email);
      const isAuthAdmin = isAuthorizedAdminEmail(res.data.user?.email);
      const assignedRole = isSuper ? 'superadmin' : (isAuthAdmin ? 'admin' : 'user');
      const updatedUser = { ...res.data.user, role: assignedRole };
      localStorage.setItem('org_token', res.data.token);
      localStorage.setItem('org_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setRole(assignedRole);
    }
    return res.data;
  };

  // Google Sign-In (For participants)
  const loginWithGoogle = async () => {
    const res = await api.post('/auth/google');
    if (res.data.success) {
      const isSuper = isSuperAdmin(res.data.user?.email);
      const isAuthAdmin = isAuthorizedAdminEmail(res.data.user?.email);
      const assignedRole = isSuper ? 'superadmin' : (isAuthAdmin ? (res.data.role || 'admin') : 'user');
      const updatedUser = { ...res.data.user, role: assignedRole };
      localStorage.setItem('org_token', res.data.token);
      localStorage.setItem('org_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setRole(assignedRole);
    }
    return res.data;
  };

  // Dedicated Administrator Google Sign-In with Firebase Auth
  const adminLoginWithGoogle = async () => {
    const res = await api.post('/auth/admin-google-login');
    if (res.data.success) {
      const isSuper = isSuperAdmin(res.data.user?.email);
      const isAuthAdmin = isAuthorizedAdminEmail(res.data.user?.email);
      const assignedRole = isSuper ? 'superadmin' : (isAuthAdmin ? (res.data.user.role || 'admin') : 'admin');
      const updatedUser = { ...res.data.user, role: assignedRole };
      localStorage.setItem('org_token', res.data.token);
      localStorage.setItem('org_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setRole(assignedRole);
    }
    return res.data;
  };

  // Complete profile after Google sign-in
  const completeProfile = async (payload) => {
    const res = await api.post('/auth/complete-profile', payload);
    if (res.data.success) {
      const email = res.data.user?.email || user?.email;
      const isSuper = isSuperAdmin(email);
      const isAuthAdmin = isAuthorizedAdminEmail(email);
      const assignedRole = isSuper ? 'superadmin' : (isAuthAdmin ? (res.data.user?.role || role || 'admin') : 'user');
      const updatedUser = { ...res.data.user, role: assignedRole };
      setUser(updatedUser);
      setRole(assignedRole);
      localStorage.setItem('org_user', JSON.stringify(updatedUser));
    }
    return res.data;
  };

  // Admin login fallback
  const adminLogin = async (credentials) => {
    const res = await api.post('/auth/admin-login', credentials);
    if (res.data.success) {
      const isSuper = isSuperAdmin(res.data.user?.email);
      const isAuthAdmin = isAuthorizedAdminEmail(res.data.user?.email);
      const assignedRole = isSuper ? 'superadmin' : (isAuthAdmin ? (res.data.user.role || 'admin') : 'user');
      const updatedUser = { ...res.data.user, role: assignedRole };
      localStorage.setItem('org_token', res.data.token);
      localStorage.setItem('org_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setRole(assignedRole);
    }
    return res.data;
  };

  // Update profile
  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data.success) {
      const email = res.data.user?.email || user?.email;
      const isSuper = isSuperAdmin(email);
      const isAuthAdmin = isAuthorizedAdminEmail(email);
      const assignedRole = isSuper ? 'superadmin' : (isAuthAdmin ? (res.data.user?.role || user?.role || 'admin') : 'user');
      const updatedUser = { ...res.data.user, role: assignedRole };
      setUser(updatedUser);
      localStorage.setItem('org_user', JSON.stringify(updatedUser));
    }
    return res.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('org_token');
    localStorage.removeItem('org_user');
    setUser(null);
    setRole(null);
  };

  // STRICT SECURITY CHECK:
  // A user is ONLY an admin if their verified email matches an authorized admin email.
  const isAdmin = Boolean(user?.email && isAuthorizedAdminEmail(user.email));

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isSuperAdminEmail: isSuperAdmin,
        isAuthorizedAdminEmail,
        loading,
        sendOTP,
        verifyOTP,
        loginWithGoogle,
        adminLoginWithGoogle,
        completeProfile,
        adminLogin,
        updateProfile,
        logout,
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
