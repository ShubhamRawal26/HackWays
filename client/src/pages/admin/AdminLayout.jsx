import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileQuestion,
  Clock,
  Send,
  UserCog,
  LogOut,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Events', path: '/admin/events', icon: CalendarDays },
    { label: 'Registrations & Teams', path: '/admin/users', icon: Users },
    { label: 'Problem Statements', path: '/admin/problem-statements', icon: FileQuestion },
    { label: 'Schedule Controls', path: '/admin/schedule', icon: Clock },
    { label: 'Submissions', path: '/admin/submissions', icon: Send },
    { label: 'Admin Settings', path: '/admin/settings', icon: UserCog },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-background flex flex-col md:flex-row">
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-primary text-white px-4 py-3 flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <span className="font-bold text-sm tracking-tight">Admin Console</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg bg-white/10 text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary text-white flex flex-col justify-between transition-transform duration-200 ease-in-out md:sticky md:top-0 md:h-full md:translate-x-0 md:overflow-y-auto shrink-0 shadow-lg ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-secondary text-primary flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <span className="font-bold text-base block leading-tight text-white">HACKWAYS</span>
                <span className="text-[10px] text-secondary tracking-wider uppercase font-semibold">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-secondary text-primary shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-accent' : 'text-secondary'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-accent" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium transition-colors"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-secondary" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-secondary capitalize">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-dark/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl md:h-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
