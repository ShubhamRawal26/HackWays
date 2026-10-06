import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [idPreview, setIdPreview] = useState(null); // { url, name, userName }
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [selectedEvent, searchQuery]);

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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?eventId=${selectedEvent}&search=${searchQuery}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      showError('Failed to load registered users.');
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV Functionality
  const exportToCSV = () => {
    if (users.length === 0) {
      showError('No user records available to export.');
      return;
    }

    const headers = [
      'Full Name',
      'Email',
      'Phone',
      'Student Type',
      'School / College',
      'Year / Class',
      'ID Card Status',
      'Event Title',
      'Team Name',
      'Registered Date',
    ];

    const rows = users.map((r) => [
      `"${r.user?.name || ''}"`,
      `"${r.user?.email || ''}"`,
      `"${r.user?.phone || ''}"`,
      `"${r.user?.studentType === 'school' ? 'School Student' : 'College Student'}"`,
      `"${r.collegeOrOrg || r.user?.college || r.user?.institute || ''}"`,
      `"${r.user?.year || ''}"`,
      `"${r.user?.idCardUrl ? 'Uploaded' : 'Missing'}"`,
      `"${r.event?.title || ''}"`,
      `"${r.teamName || ''}"`,
      `"${new Date(r.registeredAt).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hackways_Registered_Users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Participant list exported to CSV.');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-accent/15 pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-accent mb-1">Participant Directory</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">Registered Participants</h1>
        </div>

        <button
          onClick={exportToCSV}
          className="btn-primary py-2.5 px-5 text-xs font-semibold rounded-xl inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-secondary" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex items-center w-full sm:w-72">
          <Search className="w-4 h-4 text-dark-muted absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="input-field pl-11 text-xs"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="input-field text-xs"
          >
            <option value="all">-- All Registered Events --</option>
            {events.map((evt) => (
              <option key={evt._id} value={evt._id}>
                {evt.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="card h-64 animate-pulse bg-white/70"></div>
      ) : users.length > 0 ? (
        <div className="bg-white rounded-2xl border border-accent/15 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-background-cream/60 border-b border-accent/15 text-accent font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Participant</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Academic &amp; Student ID</th>
                  <th className="py-3.5 px-4">Event &amp; Team</th>
                  <th className="py-3.5 px-6">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent/10">
                {users.map((reg) => {
                  const isSchool = reg.user?.studentType === 'school';
                  const hasId = Boolean(reg.user?.idCardUrl);

                  return (
                    <tr key={reg._id} className="hover:bg-background-cream/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-dark text-sm">{reg.user?.name || 'Participant'}</div>
                        <div className="text-dark-muted text-[11px]">{reg.user?.email}</div>
                      </td>
                      <td className="py-4 px-4 text-dark font-medium whitespace-nowrap">
                        {reg.user?.phone || 'N/A'}
                      </td>
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

                          {reg.user?.year && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-secondary/50 text-[10px] font-bold text-accent">
                              {reg.user.year}
                            </span>
                          )}
                        </div>

                        <div className="text-dark-muted truncate max-w-xs text-[11px]">
                          {reg.collegeOrOrg || reg.user?.college || reg.user?.institute || '—'}
                        </div>

                        {/* ID Card Status & Action */}
                        <div className="pt-0.5">
                          {hasId ? (
                            <button
                              type="button"
                              onClick={() =>
                                setIdPreview({
                                  url: reg.user.idCardUrl,
                                  name: reg.user.idCardName || 'Student_ID.jpg',
                                  userName: reg.user.name || 'Participant',
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
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="font-bold text-primary truncate max-w-xs">{reg.event?.title}</div>
                        {reg.teamName && (
                          <div className="text-[11px] text-dark-muted font-medium">Team: {reg.teamName}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-dark-muted whitespace-nowrap">
                        {new Date(reg.registeredAt).toLocaleDateString()}
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
          <p className="text-dark font-semibold text-sm">No registered participants found.</p>
          <p className="text-dark-muted text-xs">Try selecting a different event filter or clear search terms.</p>
        </div>
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
