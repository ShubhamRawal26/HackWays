import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Calendar,
  Send,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  Database,
  RefreshCw,
  AlertTriangle,
  Eye,
  X,
  Download,
  BadgeCheck,
  Phone,
  Mail,
  GraduationCap,
  School,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

// Format date as "08 Oct 2026" (Date Month Year)
const formatDateMonthYear = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateStr);
  }
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'pending' | 'registered'
  const [idPreview, setIdPreview] = useState(null); // { url, name, userName, type }
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToCloud = async () => {
    setSyncingCloud(true);
    try {
      const res = await api.post('/admin/sync-cloud');
      if (res.data?.success) {
        success('All events, problem statements, users, and teams are now pushed to Firebase Cloud!');
        fetchStats();
      } else {
        showError('Firebase rejected write: Check Firebase Console Rules.');
      }
    } catch (err) {
      showError(err.message || 'Failed to sync to cloud.');
    } finally {
      setSyncingCloud(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { stats, recentEvents, recentUsers, recentTeamRegistrations } = data || {
    stats: {},
    recentEvents: [],
    recentUsers: [],
    recentTeamRegistrations: [],
  };

  const filteredRecentUsers = (recentUsers || []).filter((u) => {
    if (userFilter === 'pending') return !u.isTeamRegistered;
    if (userFilter === 'registered') return u.isTeamRegistered;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Cloud Database Sync Strip */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-secondary flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-dark">Firebase Cloud Realtime Database</span>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                active-cc357-default-rtdb
              </span>
            </div>
            <p className="text-[11px] text-dark-muted">
              Live sync for user profile registrations, student ID verification, and team registrations.
            </p>
          </div>
        </div>

        <button
          onClick={handleSyncToCloud}
          disabled={syncingCloud}
          className="btn-primary py-2 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncingCloud ? 'animate-spin' : ''}`} />
          <span>{syncingCloud ? 'Syncing Cloud...' : 'Sync to Firebase Cloud'}</span>
        </button>
      </div>

      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-accent/15 pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-accent mb-1">Executive Summary</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">Admin Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/events" className="btn-primary py-2 px-4 text-xs font-semibold rounded-xl">
            Create Event
          </Link>
          <Link to="/admin/users" className="btn-outline py-2 px-4 text-xs font-semibold rounded-xl">
            Registrations Directory
          </Link>
        </div>
      </div>

      {/* 4 Primary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Events */}
        <div className="card bg-white p-6 rounded-2xl shadow-card border border-accent/15 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Total Events</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-dark">{stats?.totalEvents || 0}</div>
          <span className="text-[11px] text-dark-muted font-medium">Active & scheduled programs</span>
        </div>

        {/* User Registrations */}
        <div className="card bg-white p-6 rounded-2xl shadow-card border border-accent/15 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">User Registrations</span>
            <div className="p-2 rounded-xl bg-secondary/70 text-primary">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-dark">{stats?.totalUsers || 0}</div>
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              <Clock className="w-3 h-3 text-amber-700" />
              {stats?.teamPendingCount || 0} Team Pending
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              {stats?.teamRegisteredCount || 0} In Team
            </span>
          </div>
        </div>

        {/* Team Registrations */}
        <div className="card bg-white p-6 rounded-2xl shadow-card border border-accent/15 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Team Registrations</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-dark">{stats?.totalTeamRegistrations || 0}</div>
          <span className="text-[11px] text-dark-muted font-medium">Formed hackathon teams</span>
        </div>

        {/* Total Submissions */}
        <div className="card bg-white p-6 rounded-2xl shadow-card border border-accent/15 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Total Submissions</span>
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-dark">{stats?.totalSubmissions || 0}</div>
          <span className="text-[11px] text-dark-muted font-medium">
            {stats?.totalIdeaSubmissions || 0} Ideas • {stats?.totalPrototypeSubmissions || 0} Prototypes
          </span>
        </div>
      </div>

      {/* SECTION 1: RECENT USER REGISTRATIONS (Profile Completed, Mobile Number & ID Card) */}
      <div className="card bg-white p-6 rounded-2xl shadow-card border border-accent/15 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-accent/15 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-lg sm:text-xl text-dark">Recent User Registrations</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary/60 text-accent px-2 py-0.5 rounded-md">
                Basic Details &amp; Student ID
              </span>
            </div>
            <p className="text-xs text-dark-muted">
              Users who logged in and filled their basic details (Mobile Number, Name, College, ID Card). Tracks whether their team registration is completed or pending.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick Status Filter Pills */}
            <div className="inline-flex items-center p-1 bg-background-cream/70 rounded-xl border border-accent/15 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUserFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  userFilter === 'all'
                    ? 'bg-primary text-secondary font-bold shadow-xs'
                    : 'text-dark-muted hover:text-dark'
                }`}
              >
                All ({recentUsers?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setUserFilter('pending')}
                className={`px-3 py-1 rounded-lg transition-all inline-flex items-center gap-1.5 ${
                  userFilter === 'pending'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-amber-800 hover:text-amber-950'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Team Pending ({stats?.teamPendingCount || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setUserFilter('registered')}
                className={`px-3 py-1 rounded-lg transition-all inline-flex items-center gap-1.5 ${
                  userFilter === 'registered'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-emerald-800 hover:text-emerald-950'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Team Registered ({stats?.teamRegisteredCount || 0})</span>
              </button>
            </div>

            <Link
              to={userFilter === 'pending' ? '/admin/users?tab=users&teamStatus=pending' : '/admin/users?tab=users'}
              className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>View All User Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* User Table */}
        {filteredRecentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-background-cream/60 border-b border-accent/15 text-accent font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Participant</th>
                  <th className="py-3 px-4">Mobile Number</th>
                  <th className="py-3 px-4">Academic &amp; Student ID</th>
                  <th className="py-3 px-4">Team Registration Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent/10">
                {filteredRecentUsers.map((user) => {
                  const isSchool = user.studentType === 'school';
                  const hasId = Boolean(user.idCardUrl);

                  return (
                    <tr key={user.id} className="hover:bg-background-cream/30 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary/80 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {user.name ? user.name.slice(0, 2) : 'US'}
                          </div>
                          <div>
                            <div className="font-bold text-dark text-sm">{user.name || 'Participant'}</div>
                            <div className="text-dark-muted text-[11px] flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{user.email || 'No email'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Mobile Number */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {user.phone ? (
                          <div className="inline-flex items-center gap-1.5 font-bold text-dark bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200">
                            <Phone className="w-3 h-3 text-primary" />
                            <span>{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-dark-muted italic">Not provided</span>
                        )}
                      </td>

                      {/* Academic & ID Card */}
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isSchool
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-primary/10 text-primary border border-primary/20'
                            }`}
                          >
                            {isSchool ? <School className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                            {isSchool ? 'School' : 'College'}
                          </span>

                          {user.year && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-secondary/50 text-[10px] font-bold text-accent">
                              {user.year}
                            </span>
                          )}
                        </div>

                        <div className="text-dark-muted truncate max-w-xs text-[11px]">
                          {user.college || user.institute || 'Institution not specified'}
                        </div>

                        {/* ID Card Action */}
                        <div>
                          {hasId ? (
                            <button
                              type="button"
                              onClick={() =>
                                setIdPreview({
                                  url: user.idCardUrl,
                                  name: user.idCardName || 'Student_ID.jpg',
                                  userName: user.name || 'Participant',
                                  type: isSchool ? 'School' : 'College',
                                })
                              }
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View ID Card</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[10px] font-semibold">
                              <AlertCircle className="w-3 h-3" />
                              <span>No ID Card</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team Registration Status */}
                      <td className="py-3.5 px-4">
                        {user.isTeamRegistered ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Team: {user.teamName || 'Registered'}</span>
                            </span>
                            {user.eventTitle && (
                              <div className="text-[11px] text-dark-muted truncate max-w-[180px]">
                                {user.eventTitle}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                              <Clock className="w-3.5 h-3.5 text-amber-700" />
                              <span>Team Pending</span>
                            </span>
                            <p className="text-[10px] text-amber-800/80">User profile ready, team not yet formed</p>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-dark-muted whitespace-nowrap">
                        <div className="font-semibold text-dark">
                          {formatDateMonthYear(user.registeredAt)}
                        </div>
                        <div className="text-[10px] text-dark-muted">
                          {formatTime(user.registeredAt)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-background-cream/30 rounded-xl border border-dashed border-accent/20 space-y-2">
            <Users className="w-8 h-8 text-dark-muted mx-auto" />
            <p className="text-dark font-bold text-sm">No user registrations found for this filter.</p>
            <p className="text-dark-muted text-xs">
              When users sign in and complete their details modal, they will immediately appear here.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2 & 3: TWO COLUMNS (Recent Team Registrations & Active Events) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Team Registrations */}
        <div className="card bg-white p-6 rounded-2xl shadow-card border border-accent/15 space-y-4">
          <div className="flex items-center justify-between border-b border-accent/15 pb-3">
            <div>
              <h3 className="font-bold text-base text-dark">Recent Team Registrations</h3>
              <p className="text-[11px] text-dark-muted">Teams registered for live hackathons</p>
            </div>
            <Link to="/admin/users?tab=teams" className="text-xs font-semibold text-primary hover:underline">
              View All Teams
            </Link>
          </div>

          <div className="space-y-3">
            {recentTeamRegistrations && recentTeamRegistrations.length > 0 ? (
              recentTeamRegistrations.map((team) => (
                <div
                  key={team._id || team.id}
                  className="p-3.5 rounded-xl bg-background-cream/40 border border-accent/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-dark">{team.teamName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {team.membersCount || 1} Member{team.membersCount > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="text-dark-muted flex items-center gap-2 text-[11px]">
                      <span>Leader: <strong className="text-dark">{team.leader?.name || team.leaderName || 'Participant'}</strong></span>
                      {team.leader?.phone && (
                        <>
                          <span>•</span>
                          <span>{team.leader.phone}</span>
                        </>
                      )}
                    </div>

                    <div className="text-[11px] text-primary font-medium">
                      Event: {team.event?.title || 'Hackathon Event'}
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-dark-muted flex-shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold mb-1">
                      Registered
                    </span>
                    <div className="font-semibold text-dark">{formatDateMonthYear(team.registeredAt)}</div>
                    <div className="text-[10px] text-dark-muted">{formatTime(team.registeredAt)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-background-cream/20 rounded-xl border border-dashed border-accent/20">
                <Users className="w-6 h-6 text-dark-muted mx-auto mb-1" />
                <p className="text-xs text-dark-muted font-medium">No team registrations yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Active & Recent Events */}
        <div className="card bg-white p-6 rounded-2xl shadow-card border border-accent/15 space-y-4">
          <div className="flex items-center justify-between border-b border-accent/15 pb-3">
            <div>
              <h3 className="font-bold text-base text-dark">Active &amp; Scheduled Programs</h3>
              <p className="text-[11px] text-dark-muted">Current hackathons &amp; contests</p>
            </div>
            <Link to="/admin/events" className="text-xs font-semibold text-primary hover:underline">
              Manage Events
            </Link>
          </div>

          <div className="space-y-3">
            {recentEvents && recentEvents.length > 0 ? (
              recentEvents.map((evt) => (
                <div
                  key={evt._id || evt.id}
                  className="p-3.5 rounded-xl bg-background-cream/40 border border-accent/15 flex items-center justify-between gap-4"
                >
                  <div className="truncate space-y-1">
                    <h4 className="font-bold text-sm text-dark truncate">{evt.title}</h4>
                    <span className="text-xs text-dark-muted block">
                      {formatDateMonthYear(evt.startDate)} • {evt.category || 'Hackathon'}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase shrink-0 ${
                      evt.status === 'Ongoing'
                        ? 'bg-emerald-100 text-emerald-800'
                        : evt.status === 'Upcoming'
                        ? 'bg-primary text-white'
                        : 'bg-dark-muted text-white'
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-background-cream/20 rounded-xl border border-dashed border-accent/20">
                <Calendar className="w-6 h-6 text-dark-muted mx-auto mb-1" />
                <p className="text-xs text-dark-muted font-medium">No events found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ID Card Preview Modal */}
      {idPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-accent/20">
            <div className="p-4 border-b border-accent/15 flex items-center justify-between bg-background-cream/50">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-dark">{idPreview.userName}'s Student ID</h3>
                  <p className="text-[10px] text-dark-muted">{idPreview.type} Student Verification Document</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIdPreview(null)}
                className="p-1.5 rounded-lg text-dark-muted hover:text-dark hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex flex-col items-center justify-center bg-neutral-900/5 max-h-[70vh] overflow-auto">
              {idPreview.url?.startsWith('data:application/pdf') ? (
                <div className="p-8 text-center space-y-3">
                  <FileText className="w-16 h-16 text-primary mx-auto" />
                  <p className="text-xs font-semibold text-dark">{idPreview.name}</p>
                  <a
                    href={idPreview.url}
                    download={idPreview.name}
                    className="btn-primary text-xs py-2 px-4 rounded-xl inline-flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF to View</span>
                  </a>
                </div>
              ) : (
                <img
                  src={idPreview.url}
                  alt={idPreview.name}
                  className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-md border border-neutral-200"
                />
              )}
            </div>

            <div className="p-3 border-t border-accent/15 bg-white flex items-center justify-between">
              <span className="text-[11px] text-dark-muted truncate max-w-[240px]">{idPreview.name}</span>
              <div className="flex items-center gap-2">
                <a
                  href={idPreview.url}
                  download={idPreview.name}
                  className="btn-secondary text-[11px] py-1.5 px-3 rounded-lg inline-flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIdPreview(null)}
                  className="btn-primary text-[11px] py-1.5 px-3 rounded-lg"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

