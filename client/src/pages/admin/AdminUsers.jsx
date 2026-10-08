import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Download,
  Search,
  Users,
  Calendar,
  Phone,
  Mail,
  Filter,
  Eye,
  X,
  GraduationCap,
  School,
  FileText,
  BadgeCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  UserCheck,
  Layers,
  ArrowUpDown,
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

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'teams' ? 'teams' : 'users';
  const initialTeamStatus = searchParams.get('teamStatus') || 'all';

  const [activeTab, setActiveTab] = useState(initialTab); // 'users' | 'teams'
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState({});
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [teamStatusFilter, setTeamStatusFilter] = useState(initialTeamStatus);
  const [idStatusFilter, setIdStatusFilter] = useState('all');
  const [studentTypeFilter, setStudentTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [idPreview, setIdPreview] = useState(null); // { url, name, userName, type }
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedEvent, searchQuery, teamStatusFilter, idStatusFilter, studentTypeFilter]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events?status=all');
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error('Error loading events list:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        eventId: selectedEvent,
        search: searchQuery,
        teamStatus: teamStatusFilter,
        idStatus: idStatusFilter,
        studentType: studentTypeFilter,
      });

      const res = await api.get(`/admin/users?${queryParams.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users || []);
        setTeams(res.data.teams || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      showError('Failed to load registered participants data.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams);
  };

  // Export to CSV Functionality
  const exportUsersToCSV = () => {
    if (users.length === 0) {
      showError('No user records available to export.');
      return;
    }

    const headers = [
      'Full Name',
      'Email',
      'Mobile Phone',
      'Student Type',
      'School / College',
      'Year / Class',
      'ID Card Status',
      'Team Registration Status',
      'Team Name',
      'Registered Date',
    ];

    const rows = users.map((u) => [
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.phone || ''}"`,
      `"${u.studentType === 'school' ? 'School Student' : 'College Student'}"`,
      `"${u.college || u.institute || ''}"`,
      `"${u.year || ''}"`,
      `"${u.hasIdCard ? 'Uploaded' : 'Missing'}"`,
      `"${u.isTeamRegistered ? 'Team Registered' : 'Team Pending'}"`,
      `"${u.teamName || 'N/A'}"`,
      `"${new Date(u.registeredAt).toLocaleString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hackways_User_Registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('User registrations exported to CSV.');
  };

  const exportTeamsToCSV = () => {
    if (teams.length === 0) {
      showError('No team records available to export.');
      return;
    }

    const headers = [
      'Team Name',
      'Event Title',
      'Leader Name',
      'Leader Email',
      'Leader Phone',
      'Leader College',
      'Total Members',
      'Members Info',
      'Track Preference',
      'Registered Date',
    ];

    const rows = teams.map((t) => {
      const membersInfo = (t.teamMembers || [])
        .map((m) => `${m.name || 'Member'} (${m.email || 'no email'})`)
        .join('; ');

      return [
        `"${t.teamName || ''}"`,
        `"${t.event?.title || ''}"`,
        `"${t.leader?.name || t.leaderName || ''}"`,
        `"${t.leader?.email || t.leaderEmail || ''}"`,
        `"${t.leader?.phone || t.phone || ''}"`,
        `"${t.leader?.college || t.collegeOrOrg || ''}"`,
        `"${t.membersCount || 1}"`,
        `"${membersInfo}"`,
        `"${t.trackPreference || 'General'}"`,
        `"${new Date(t.registeredAt).toLocaleString()}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hackways_Team_Registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Team registrations exported to CSV.');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-accent/15 pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-accent mb-1">
            Admin Console • Participant Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
            Registrations Management
          </h1>
          <p className="text-xs text-dark-muted mt-1">
            Manage individual user profile registrations (with mobile numbers &amp; ID cards) and event team registrations.
          </p>
        </div>

        <button
          onClick={activeTab === 'users' ? exportUsersToCSV : exportTeamsToCSV}
          className="btn-primary py-2.5 px-5 text-xs font-semibold rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4 text-secondary" />
          <span>Export {activeTab === 'users' ? 'Users' : 'Teams'} to CSV</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-accent/15 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-dark-muted uppercase tracking-wider">Total Users Registered</span>
          <div className="text-2xl font-black text-dark">{stats?.totalUsers || users.length}</div>
          <span className="text-[10px] text-dark-muted">Verified participant accounts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs space-y-1 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Team Pending</span>
            <Clock className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <div className="text-2xl font-black text-amber-800">
            {stats?.pendingTeamsCount ?? users.filter((u) => !u.isTeamRegistered).length}
          </div>
          <span className="text-[10px] text-amber-700">Profile ready, no team registered</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-1 bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">Team Registered</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-800">
            {stats?.registeredTeamsCount ?? users.filter((u) => u.isTeamRegistered).length}
          </div>
          <span className="text-[10px] text-emerald-700">Linked to active event teams</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-accent/15 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-dark-muted uppercase tracking-wider">Total Event Teams</span>
            <Users className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-2xl font-black text-primary">{stats?.totalTeams ?? teams.length}</div>
          <span className="text-[10px] text-dark-muted">Formed hackathon teams</span>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center border-b border-accent/15 gap-4">
        <button
          type="button"
          onClick={() => handleTabChange('users')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-dark-muted hover:text-dark'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>User Registrations</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'users' ? 'bg-primary text-white' : 'bg-background-cream text-dark-muted'
            }`}
          >
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('teams')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'teams'
              ? 'border-primary text-primary'
              : 'border-transparent text-dark-muted hover:text-dark'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Registrations</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'teams' ? 'bg-primary text-white' : 'bg-background-cream text-dark-muted'
            }`}
          >
            {teams.length}
          </span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search */}
        <div className="relative flex items-center flex-1">
          <Search className="w-4 h-4 text-dark-muted absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'users'
                ? 'Search by name, email, mobile phone, college...'
                : 'Search by team name, leader name, email, phone...'
            }
            className="input-field pl-11 text-xs w-full"
          />
        </div>

        {activeTab === 'users' ? (
          <>
            {/* Team Status Filter */}
            <div className="w-full sm:w-56">
              <select
                value={teamStatusFilter}
                onChange={(e) => setTeamStatusFilter(e.target.value)}
                className="input-field text-xs w-full font-semibold"
              >
                <option value="all">Team Status: All Users</option>
                <option value="pending">⏳ Team Registration: Pending</option>
                <option value="registered">✅ Team Registration: Registered</option>
              </select>
            </div>

            {/* ID Card Status Filter */}
            <div className="w-full sm:w-48">
              <select
                value={idStatusFilter}
                onChange={(e) => setIdStatusFilter(e.target.value)}
                className="input-field text-xs w-full font-semibold"
              >
                <option value="all">ID Card: All Status</option>
                <option value="uploaded">ID Card: Uploaded</option>
                <option value="missing">ID Card: Missing</option>
              </select>
            </div>

            {/* Student Type Filter */}
            <div className="w-full sm:w-44">
              <select
                value={studentTypeFilter}
                onChange={(e) => setStudentTypeFilter(e.target.value)}
                className="input-field text-xs w-full font-semibold"
              >
                <option value="all">Type: All Students</option>
                <option value="college">College Students</option>
                <option value="school">School Students</option>
              </select>
            </div>
          </>
        ) : (
          /* Team Event Filter */
          <div className="w-full sm:w-72">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="input-field text-xs w-full font-semibold"
            >
              <option value="all">All Events</option>
              {events.map((evt) => (
                <option key={evt._id || evt.id} value={evt._id || evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: USER REGISTRATIONS TABLE */}
      {activeTab === 'users' && (
        <>
          {loading ? (
            <div className="card h-64 animate-pulse bg-white/70"></div>
          ) : users.length > 0 ? (
            <div className="bg-white rounded-2xl border border-accent/15 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-background-cream/60 border-b border-accent/15 text-accent font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-6">Participant</th>
                      <th className="py-3.5 px-4">Mobile Number</th>
                      <th className="py-3.5 px-4">Academic &amp; Student ID</th>
                      <th className="py-3.5 px-4">Team Registration Status</th>
                      <th className="py-3.5 px-6">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent/10">
                    {users.map((user) => {
                      const isSchool = user.studentType === 'school';
                      const hasId = Boolean(user.idCardUrl);

                      return (
                        <tr key={user.id} className="hover:bg-background-cream/30 transition-colors">
                          {/* Name & Email */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-secondary/80 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                {user.name ? user.name.slice(0, 2) : 'US'}
                              </div>
                              <div>
                                <div className="font-bold text-dark text-sm">{user.name || 'Participant'}</div>
                                <div className="text-dark-muted text-[11px] flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{user.email || 'No email provided'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Mobile Phone */}
                          <td className="py-4 px-4 whitespace-nowrap">
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
                          <td className="py-4 px-4 space-y-1">
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

                            {/* ID Card Status & Action */}
                            <div className="pt-0.5">
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
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
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
                          <td className="py-4 px-4">
                            {user.isTeamRegistered ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Team: {user.teamName || 'Registered'}</span>
                                </span>
                                {user.eventTitle && (
                                  <div className="text-[11px] text-dark-muted truncate max-w-[200px]">
                                    Event: {user.eventTitle}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                                  <span>Team Pending</span>
                                </span>
                                <p className="text-[10px] text-amber-800/80">User registered, team registration pending</p>
                              </div>
                            )}
                          </td>

                          {/* Registered At */}
                          <td className="py-4 px-6 text-dark-muted whitespace-nowrap">
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
            </div>
          ) : (
            <div className="card bg-white p-12 text-center space-y-2">
              <UserCheck className="w-10 h-10 text-dark-muted mx-auto" />
              <p className="text-dark font-semibold text-sm">No user registrations found.</p>
              <p className="text-dark-muted text-xs">
                Try adjusting your search terms or filters to view other registered participants.
              </p>
            </div>
          )}
        </>
      )}

      {/* TAB 2: TEAM REGISTRATIONS TABLE */}
      {activeTab === 'teams' && (
        <>
          {loading ? (
            <div className="card h-64 animate-pulse bg-white/70"></div>
          ) : teams.length > 0 ? (
            <div className="bg-white rounded-2xl border border-accent/15 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-background-cream/60 border-b border-accent/15 text-accent font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-6">Team Name</th>
                      <th className="py-3.5 px-4">Event Program</th>
                      <th className="py-3.5 px-4">Team Leader</th>
                      <th className="py-3.5 px-4">Members</th>
                      <th className="py-3.5 px-4">Track</th>
                      <th className="py-3.5 px-6">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent/10">
                    {teams.map((team) => (
                      <tr key={team._id || team.id} className="hover:bg-background-cream/30 transition-colors">
                        {/* Team Name */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-dark text-sm">{team.teamName}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Registered
                          </span>
                        </td>

                        {/* Event Title */}
                        <td className="py-4 px-4 space-y-0.5">
                          <div className="font-bold text-primary truncate max-w-xs">
                            {team.event?.title || 'Hackathon Event'}
                          </div>
                          {team.event?.category && (
                            <span className="text-[10px] text-dark-muted font-medium">
                              {team.event.category}
                            </span>
                          )}
                        </td>

                        {/* Leader Info */}
                        <td className="py-4 px-4 space-y-1">
                          <div className="font-bold text-dark">{team.leader?.name || team.leaderName}</div>
                          <div className="text-dark-muted text-[11px] flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>{team.leader?.email || team.leaderEmail}</span>
                          </div>
                          {(team.leader?.phone || team.phone) && (
                            <div className="text-dark-muted text-[11px] flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{team.leader?.phone || team.phone}</span>
                            </div>
                          )}
                        </td>

                        {/* Members */}
                        <td className="py-4 px-4 space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[10px]">
                            <Users className="w-3 h-3" />
                            <span>{team.membersCount || 1} Member{team.membersCount > 1 ? 's' : ''}</span>
                          </span>

                          {team.teamMembers && team.teamMembers.length > 0 && (
                            <div className="text-[11px] text-dark-muted max-w-xs truncate">
                              {team.teamMembers.map((m) => m.name).filter(Boolean).join(', ')}
                            </div>
                          )}
                        </td>

                        {/* Track */}
                        <td className="py-4 px-4 text-dark font-medium">
                          {team.trackPreference || 'General'}
                        </td>

                        {/* Registered At */}
                        <td className="py-4 px-6 text-dark-muted whitespace-nowrap">
                          <div className="font-semibold text-dark">
                            {formatDateMonthYear(team.registeredAt)}
                          </div>
                          <div className="text-[10px] text-dark-muted">
                            {formatTime(team.registeredAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card bg-white p-12 text-center space-y-2">
              <Users className="w-10 h-10 text-dark-muted mx-auto" />
              <p className="text-dark font-semibold text-sm">No team registrations found.</p>
              <p className="text-dark-muted text-xs">
                Teams registered for events will appear here with leader and member details.
              </p>
            </div>
          )}
        </>
      )}

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
