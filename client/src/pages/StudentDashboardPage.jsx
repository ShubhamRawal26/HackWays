import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import hackwaysLogo from '../assets/hackways-logo.jpg';
import UserDetailsModal from '../components/UserDetailsModal';
import {
  Users,
  FileText,
  Code2,
  Trophy,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Send,
  Building,
  Phone,
  Mail,
  User,
  ShieldCheck,
  MapPin,
  Download,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Github,
  Globe,
  Video,
  Award,
  Info,
} from 'lucide-react';

const EVENT_ID = 'event_1';

export default function StudentDashboardPage() {
  const { user, isAdmin, logout } = useAuth();
  const { success, error: showError, info } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPreview = searchParams.get('preview') === 'true';
  const isSuper = isAdmin || user?.role === 'superadmin' || user?.role === 'admin';

  // Automatically redirect admins to /admin/dashboard
  useEffect(() => {
    if (isSuper && !isPreview) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isSuper, isPreview, navigate]);

  // Active View / Tab: 'details' | 'team' | 'ps' | 'solution' | 'prototype' | 'results'
  const activeTab = searchParams.get('tab') || 'details';
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    if (user && !isSuper) {
      const isComplete = Boolean(
        user.name &&
        user.phone &&
        (user.institute || user.college) &&
        user.year &&
        user.idCardUrl
      );
      if (!isComplete) {
        setProfileModalOpen(true);
      } else {
        setProfileModalOpen(false);
      }
    }
  }, [user, isSuper]);
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
    setSidebarOpen(false);
  };

  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [problemStatements, setProblemStatements] = useState([]);
  const [ideaSubmission, setIdeaSubmission] = useState(null);
  const [prototypeSubmission, setPrototypeSubmission] = useState(null);

  // --- Form States ---
  // Team Registration Form
  const [teamName, setTeamName] = useState('');
  const [collegeOrOrg, setCollegeOrOrg] = useState(user?.institute || user?.college || '');
  const [trackPreference, setTrackPreference] = useState('Open Innovation');
  const [members, setMembers] = useState([
    { name: '', email: '', phone: '' },
    { name: '', email: '', phone: '' },
    { name: '', email: '', phone: '' },
  ]);
  const [submittingTeam, setSubmittingTeam] = useState(false);

  // Solution / Idea Form
  const [selectedPS, setSelectedPS] = useState('');
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [pitchDeckUrl, setPitchDeckUrl] = useState('');
  const [submittingIdea, setSubmittingIdea] = useState(false);

  // Prototype Form
  const [protoTitle, setProtoTitle] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [videoDemoUrl, setVideoDemoUrl] = useState('');
  const [protoHighlights, setProtoHighlights] = useState('');
  const [submittingProto, setSubmittingProto] = useState(false);

  // Filter for PS
  const [psCategoryFilter, setPsCategoryFilter] = useState('All');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Load Dashboard Data
  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Event Info
      const evtRes = await api.get(`/events/${EVENT_ID}`);
      if (evtRes.data?.success) {
        setEventData(evtRes.data.event);
        let reg = evtRes.data.registration || evtRes.data.registrationDetails || evtRes.data.userState?.registration;
        if (!reg) {
          try {
            const myEvtsRes = await api.get('/events/user/my-events');
            if (myEvtsRes.data?.success && myEvtsRes.data.registrations?.length > 0) {
              reg =
                myEvtsRes.data.registrations.find(
                  (r) => r.eventId === EVENT_ID || r.event?.id === EVENT_ID
                ) || myEvtsRes.data.registrations[0];
            }
          } catch (e) {
            console.warn('Fallback my-events fetch notice:', e);
          }
        }
        if (reg) {
          setRegistration(reg);
          if (reg.teamName) setTeamName(reg.teamName);
          if (reg.collegeOrOrg) setCollegeOrOrg(reg.collegeOrOrg);
          if (reg.trackPreference) setTrackPreference(reg.trackPreference);
          if (Array.isArray(reg.teamMembers) && reg.teamMembers.length > 1) {
            const extra = reg.teamMembers.slice(1, 4);
            setMembers([
              { name: extra[0]?.name || '', email: extra[0]?.email || '', phone: extra[0]?.phone || '' },
              { name: extra[1]?.name || '', email: extra[1]?.email || '', phone: extra[1]?.phone || '' },
              { name: extra[2]?.name || '', email: extra[2]?.email || '', phone: extra[2]?.phone || '' },
            ]);
          }
        }
      }

      // 2. Fetch Problem Statements
      const psRes = await api.get(`/events/${EVENT_ID}/problem-statements`);
      if (psRes.data?.success) {
        setProblemStatements(psRes.data.problemStatements || []);
      }

      // 3. Fetch Submissions (Idea & Prototype)
      const subRes = await api.get(`/events/${EVENT_ID}/submissions/my-submissions`);
      if (subRes.data?.success) {
        setIdeaSubmission(subRes.data.ideaSubmission);
        setPrototypeSubmission(subRes.data.prototypeSubmission);

        if (subRes.data.ideaSubmission) {
          setSelectedPS(subRes.data.ideaSubmission.problemStatementId || '');
          setIdeaTitle(subRes.data.ideaSubmission.ideaTitle || '');
          setIdeaDescription(subRes.data.ideaSubmission.ideaDescription || '');
          setTechStackInput(
            Array.isArray(subRes.data.ideaSubmission.techStack)
              ? subRes.data.ideaSubmission.techStack.join(', ')
              : subRes.data.ideaSubmission.techStack || ''
          );
          setPitchDeckUrl(subRes.data.ideaSubmission.supportingFileUrl || '');
        }

        if (subRes.data.prototypeSubmission) {
          const proto = subRes.data.prototypeSubmission;
          setProtoTitle(proto.title || proto.prototypeTitle || '');
          setGithubUrl(proto.githubUrl || '');
          setLiveDemoUrl(proto.liveDemoUrl || '');
          setVideoDemoUrl(proto.driveUrl || '');
          setProtoHighlights(proto.description || '');
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  // Submit Team Registration
  const handleRegisterTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      showError('Please enter your team name.');
      return;
    }

    setSubmittingTeam(true);
    try {
      const fullTeam = [
        {
          name: user?.name || 'Team Leader',
          email: user?.email,
          phone: user?.phone || '',
          role: 'Team Leader',
        },
        ...members.map((m, idx) => ({
          name: m.name.trim() || `Member ${idx + 2}`,
          email: m.email.trim() || '',
          phone: m.phone.trim() || '',
          role: `Member ${idx + 2}`,
        })),
      ];

      const res = await api.post(`/events/${EVENT_ID}/register`, {
        teamName: teamName.trim(),
        collegeOrOrg: collegeOrOrg.trim() || user?.college || 'CIT Campus',
        trackPreference,
        teamMembers: fullTeam,
      });

      if (res.data?.success) {
        success('Team registration completed! Your slot is locked.');
        setRegistration(res.data.registration);
      }
    } catch (err) {
      console.error('Team registration error:', err);
      showError(err.response?.data?.message || err.message || 'Failed to register team.');
    } finally {
      setSubmittingTeam(false);
    }
  };

  // Submit Solution (Idea)
  const handleSubmitIdea = async (e) => {
    e.preventDefault();
    if (!selectedPS) {
      showError('Please choose a Problem Statement.');
      return;
    }
    if (!ideaTitle.trim() || !ideaDescription.trim()) {
      showError('Please provide idea title and description.');
      return;
    }

    setSubmittingIdea(true);
    try {
      const stack = techStackInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.post(`/events/${EVENT_ID}/submissions/idea`, {
        problemStatementId: selectedPS,
        ideaTitle: ideaTitle.trim(),
        ideaDescription: ideaDescription.trim(),
        techStack: stack,
        supportingFileUrl: pitchDeckUrl.trim(),
        supportingFileName: pitchDeckUrl.trim() ? 'Pitch_Deck_Link' : '',
      });

      if (res.data?.success) {
        success('Idea proposal saved successfully!');
        setIdeaSubmission(res.data.ideaSubmission);
      }
    } catch (err) {
      console.error('Idea submit error:', err);
      showError(err.response?.data?.message || err.message || 'Failed to submit idea.');
    } finally {
      setSubmittingIdea(false);
    }
  };

  // Submit Prototype
  const handleSubmitPrototype = async (e) => {
    e.preventDefault();
    if (!githubUrl.trim()) {
      showError('Please provide your GitHub repository URL.');
      return;
    }

    setSubmittingProto(true);
    try {
      const res = await api.post(`/events/${EVENT_ID}/submissions/prototype`, {
        problemStatementId: selectedPS || (problemStatements[0]?.id || 'ps_101'),
        title: protoTitle.trim() || `${teamName || 'Team'} Working Prototype`,
        description: protoHighlights.trim(),
        githubUrl: githubUrl.trim(),
        liveDemoUrl: liveDemoUrl.trim(),
        driveUrl: videoDemoUrl.trim(),
      });

      if (res.data?.success) {
        success('Prototype submitted successfully!');
        setPrototypeSubmission(res.data.prototypeSubmission);
      }
    } catch (err) {
      console.error('Prototype submit error:', err);
      showError(err.response?.data?.message || err.message || 'Failed to submit prototype.');
    } finally {
      setSubmittingProto(false);
    }
  };

  const filteredPS =
    psCategoryFilter === 'All'
      ? problemStatements
      : problemStatements.filter((p) => p.category?.toLowerCase().includes(psCategoryFilter.toLowerCase()));

  // Menu items in Admin Dashboard format
  const menuItems = [
    {
      id: 'details',
      label: 'Hackathon Details',
      icon: Info,
    },
    {
      id: 'team',
      label: 'Team Registration',
      icon: Users,
    },
    {
      id: 'ps',
      label: 'PS Visible',
      icon: FileText,
    },
    {
      id: 'solution',
      label: 'Submit Solution',
      icon: Send,
    },
    {
      id: 'prototype',
      label: 'Submit Prototype',
      icon: Code2,
    },
    {
      id: 'results',
      label: 'Final Result',
      icon: Trophy,
    },
  ];

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-background flex flex-col md:flex-row">
      {/* Mobile Top Navbar (Admin format) */}
      <div className="md:hidden bg-primary text-white px-4 py-3 flex items-center justify-between shadow-soft sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <img
            src={hackwaysLogo}
            onError={(e) => {
              e.currentTarget.src = '/hackways-logo.png';
            }}
            alt="Hackways"
            className="w-8 h-8 rounded-lg object-contain border border-white/20"
          />
          <div>
            <span className="font-extrabold text-sm tracking-tight block leading-tight">HACKWAYS</span>
            <span className="text-[10px] text-secondary font-semibold">Student Dashboard</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg bg-white/10 text-white"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation (Exact Admin Dashboard Format) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary text-white flex flex-col justify-between transition-transform duration-200 ease-in-out md:sticky md:top-0 md:h-full md:translate-x-0 md:overflow-y-auto shrink-0 shadow-lg ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <img
              src={hackwaysLogo}
              onError={(e) => {
                e.currentTarget.src = '/hackways-logo.png';
              }}
              alt="Hackways"
              className="w-10 h-10 rounded-xl object-contain border border-white/20 shadow-sm"
            />
            <div>
              <span className="font-black text-base block leading-tight tracking-wider text-white">HACKWAYS</span>
              <span className="text-[10px] text-secondary tracking-widest uppercase font-bold block mt-0.5">
                Student Console
              </span>
            </div>
          </div>

          {/* Super Admin Quick Link */}
          {isSuper && (
            <div className="mx-4 my-2 p-3 rounded-xl bg-secondary text-primary font-bold text-xs flex items-center justify-between shadow-md">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Super Admin</span>
              </span>
              <Link to="/admin/dashboard" className="px-2 py-1 rounded bg-primary text-white text-[11px] hover:bg-dark transition-colors">
                Admin Console &rarr;
              </Link>
            </div>
          )}


          {/* Nav links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-secondary text-primary shadow-sm font-bold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-accent' : 'text-secondary'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-accent" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="truncate min-w-0 pr-2">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Student'}</div>
              <div className="text-[10px] text-secondary truncate">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
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
        {/* Top Header Strip inside Main Content */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-accent/15 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-accent mb-1">
              <span>CIT Coding Carnival 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              {activeTab === 'details' && 'CIT Coding Carnival 2026 - Event Overview'}
              {activeTab === 'team' && 'Team Registration & Roster'}
              {activeTab === 'ps' && 'Official Problem Statements'}
              {activeTab === 'solution' && 'Stage 1: Submit Solution Proposal'}
              {activeTab === 'prototype' && 'Stage 2: Submit Working Prototype'}
              {activeTab === 'results' && 'Final Results & Certification'}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {registration ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Team Slot Confirmed</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold shadow-2xs">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Slot Not Locked</span>
              </span>
            )}
          </div>
        </div>

        {/* 0. HACKATHON DETAILS VIEW */}
        {activeTab === 'details' && (
          <div className="space-y-8">
            {/* Banner Overview Card */}
            <div className="bg-gradient-to-br from-primary via-primary-hover to-dark text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-4 max-w-3xl">
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  CIT Coding Carnival 2026
                </h2>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                  Join innovators, coders, and creators across the nation for an intensive 12-hour offline hackathon.
                  Co-organized by <strong>Hackways</strong> (MSME Certified) in association with <strong>Chartered Institute of Technology (CIT), Abu Road</strong>.
                </p>

                {/* Quick Info Badges */}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-white">
                    <MapPin className="w-3.5 h-3.5 text-secondary" />
                    <span>CIT Campus, Abu Road</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-white">
                    <Clock className="w-3.5 h-3.5 text-secondary" />
                    <span>09:00 AM – 08:30 PM (Full Day)</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-white">
                    <Users className="w-3.5 h-3.5 text-secondary" />
                    <span>Strictly 4 Students / Team</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-xs font-bold text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>₹99 Entry (100% Refundable at Check-in)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-accent/15 shadow-card hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="text-xl font-extrabold text-primary">₹25,000+</div>
                <div className="text-xs font-bold text-dark mt-0.5">Total Cash Prize Pool</div>
                <div className="text-[11px] text-dark-muted mt-1 leading-snug">
                  Cash prizes for 1st, 2nd, and 3rd innovation spots directly transferred.
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-accent/15 shadow-card hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xl font-extrabold text-emerald-700">₹99 Refundable</div>
                <div className="text-xs font-bold text-dark mt-0.5">Zero Effective Cost</div>
                <div className="text-[11px] text-dark-muted mt-1 leading-snug">
                  Registration fee is 100% refunded in cash/UPI upon physical reporting.
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-accent/15 shadow-card hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-xl font-extrabold text-primary">4 Members</div>
                <div className="text-xs font-bold text-dark mt-0.5">Strict Team Structure</div>
                <div className="text-[11px] text-dark-muted mt-1 leading-snug">
                  Slots are capped strictly to 70 student teams across all colleges.
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-accent/15 shadow-card hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-xl font-extrabold text-primary">Govt. Verified</div>
                <div className="text-xs font-bold text-dark mt-0.5">MSME & CIT Certificates</div>
                <div className="text-[11px] text-dark-muted mt-1 leading-snug">
                  Verified digital and hardcopy certificates for every participant.
                </div>
              </div>
            </div>

            {/* Prize Breakdown & Schedule in 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Prize Breakdown */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-accent/15 shadow-card space-y-4">
                <div className="border-b border-accent/15 pb-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-accent">Rewards & Recognition</div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-primary mt-0.5">Prize Distribution</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 font-black flex items-center justify-center text-sm shadow-xs">
                        1st
                      </div>
                      <div>
                        <div className="font-extrabold text-dark text-sm">Champion Team</div>
                        <div className="text-[11px] text-dark-muted">Trophy + Swag Kits + Direct Mentorship</div>
                      </div>
                    </div>
                    <span className="font-extrabold text-amber-900 text-base">₹12,000</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-800 font-black flex items-center justify-center text-sm shadow-xs">
                        2nd
                      </div>
                      <div>
                        <div className="font-extrabold text-dark text-sm">Runner-Up Team</div>
                        <div className="text-[11px] text-dark-muted">Runner-up Trophy + Merit Certificates</div>
                      </div>
                    </div>
                    <span className="font-extrabold text-primary text-base">₹8,000</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 font-black flex items-center justify-center text-sm shadow-xs">
                        3rd
                      </div>
                      <div>
                        <div className="font-extrabold text-dark text-sm">Innovation Pick</div>
                        <div className="text-[11px] text-dark-muted">Innovation Trophy + Merit Certificates</div>
                      </div>
                    </div>
                    <span className="font-extrabold text-primary text-base">₹5,000</span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-dark-muted">
                  Plus: Lunch, refreshment kits, and mentor feedback provided to all 70 participating teams.
                </div>
              </div>

              {/* Day Schedule */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-accent/15 shadow-card space-y-4">
                <div className="border-b border-accent/15 pb-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-accent">Event Timeline</div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-primary mt-0.5">Hackathon Schedule</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-background-cream/60">
                    <span className="font-mono font-bold text-accent shrink-0 w-16">09:00 AM</span>
                    <span className="text-dark font-medium">Reporting, Desk Check-in & ₹99 Cash/UPI Refund</span>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-background-cream/60">
                    <span className="font-mono font-bold text-accent shrink-0 w-16">09:45 AM</span>
                    <span className="text-dark font-medium">Opening Ceremony & Problem Statement Briefing</span>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-background-cream/60">
                    <span className="font-mono font-bold text-accent shrink-0 w-16">10:15 AM</span>
                    <span className="text-dark font-medium">Hackathon Hacking Starts • Coding & Building</span>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-background-cream/60">
                    <span className="font-mono font-bold text-accent shrink-0 w-16">01:30 PM</span>
                    <span className="text-dark font-medium">Lunch & Refreshments Break</span>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-background-cream/60">
                    <span className="font-mono font-bold text-accent shrink-0 w-16">03:30 PM</span>
                    <span className="text-dark font-medium">Mentor Check-ins & Technical Evaluation</span>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-background-cream/60">
                    <span className="font-mono font-bold text-accent shrink-0 w-16">06:00 PM</span>
                    <span className="text-dark font-medium">Final Code & Prototype Freeze</span>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-background-cream/60">
                    <span className="font-mono font-bold text-accent shrink-0 w-16">06:30 PM</span>
                    <span className="text-dark font-medium">Live Pitching to Jury & Final Demonstration</span>
                  </div>
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-background-cream/60">
                    <span className="font-mono font-bold text-accent shrink-0 w-16">08:00 PM</span>
                    <span className="text-dark font-medium">Awards Ceremony & Certificate Handover</span>
                  </div>
                </div>
              </div>
            </div>


            {/* IN THE END: DIRECT CALL TO ACTION TO REGISTER TEAM */}
            <div className="bg-gradient-to-r from-primary to-dark text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-accent/20">
              <div className="space-y-2 max-w-xl">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Ready to Register Your 4-Member Squad?
                </h3>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                  Only 70 team slots are available. Enter your team details now to guarantee your spot at CIT Campus!
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('team');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn-secondary py-4 px-8 rounded-2xl font-extrabold text-sm sm:text-base inline-flex items-center justify-center gap-2.5 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Users className="w-5 h-5 text-accent" />
                <span>Register Your Team</span>
                <ArrowRight className="w-5 h-5 text-accent" />
              </button>
            </div>
          </div>
        )}

        {/* 1. TEAM REGISTRATION VIEW */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {registration ? (
              /* Already Registered View */
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-accent/15 p-6 sm:p-8 shadow-card space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-accent/15 gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                        ✓ Slot Confirmed • 4 Members
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-primary mt-2">
                        {registration.teamName || 'Your Registered Team'}
                      </h2>
                      <p className="text-xs sm:text-sm text-dark-muted mt-1">
                        {registration.collegeOrOrg || user?.college || 'Chartered Institute of Technology'} • Registered on {new Date(registration.registeredAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('ps')}
                      className="btn-primary text-xs sm:text-sm py-2.5 px-5 rounded-xl font-bold self-start sm:self-auto"
                    >
                      <span>View Problem Statements</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Team Members Grid */}
                  <div>
                    <h3 className="text-base font-bold text-dark mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span>Official 4-Member Roster</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Leader */}
                      <div className="bg-primary/5 rounded-2xl p-5 border border-primary/15 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-secondary px-2 py-0.5 rounded-full">
                            Team Leader
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="font-extrabold text-base text-primary truncate">
                          {registration.leaderName || user?.name || 'Leader'}
                        </div>
                        <p className="text-xs text-dark-muted truncate flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-accent/60 shrink-0" />
                          <span className="truncate">{registration.leaderEmail || user?.email}</span>
                        </p>
                        <p className="text-xs text-dark-muted truncate flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-accent/60 shrink-0" />
                          <span>{registration.phone || user?.phone || 'Provided'}</span>
                        </p>
                      </div>

                      {/* Members 2, 3, 4 */}
                      {(registration.teamMembers && registration.teamMembers.length > 1
                        ? registration.teamMembers.slice(1)
                        : [
                            { name: 'Member 2', email: 'member2@example.com', phone: 'Verified', role: 'Member 2' },
                            { name: 'Member 3', email: 'member3@example.com', phone: 'Verified', role: 'Member 3' },
                            { name: 'Member 4', email: 'member4@example.com', phone: 'Verified', role: 'Member 4' },
                          ]
                      ).map((m, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl p-5 border border-accent/15 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                              Member {idx + 2}
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="font-extrabold text-base text-primary truncate">
                            {m.name || `Member ${idx + 2}`}
                          </div>
                          <p className="text-xs text-dark-muted truncate flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-accent/60 shrink-0" />
                            <span className="truncate">{m.email || 'Email verified'}</span>
                          </p>
                          <p className="text-xs text-dark-muted truncate flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-accent/60 shrink-0" />
                            <span>{m.phone || 'Phone verified'}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Refund Notice */}
                  <div className="bg-[#EBF7EE] p-5 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        ₹99 On-Spot Refund Guarantee:
                      </p>
                      <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                        Report at the CIT Campus registration desk at 9:00 AM on event day to receive your instant 100% refund in cash or UPI.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-900 bg-white px-3.5 py-2 rounded-xl border border-emerald-300 shadow-2xs whitespace-nowrap self-start sm:self-auto">
                      Check-in Desk Ready
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Register Team Form */
              <div className="bg-white rounded-3xl border border-accent/15 p-6 sm:p-10 shadow-card space-y-6">
                <div className="border-b border-accent/15 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent">
                    Step 1
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-primary mt-1">
                    Register Your 4-Member Team
                  </h2>
                  <p className="text-xs sm:text-sm text-dark-muted mt-1 leading-relaxed">
                    Fill in your team details below. Strictly 4 students per team, capped at 70 teams total.
                  </p>
                </div>

                <form onSubmit={handleRegisterTeam} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                        Team Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g. PixelPioneers"
                        className="w-full px-4 py-2.5 bg-background-cream border border-accent/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                        College / Institution <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={collegeOrOrg}
                        onChange={(e) => setCollegeOrOrg(e.target.value)}
                        placeholder="e.g. Chartered Institute of Technology (CIT)"
                        className="w-full px-4 py-2.5 bg-background-cream border border-accent/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Leader Info */}
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 space-y-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      Team Leader (You)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-dark-muted block">Name:</span>
                        <strong className="text-dark">{user?.name || 'Logged in user'}</strong>
                      </div>
                      <div>
                        <span className="text-dark-muted block">Email:</span>
                        <strong className="text-dark truncate block">{user?.email}</strong>
                      </div>
                      <div>
                        <span className="text-dark-muted block">Phone:</span>
                        <strong className="text-dark">{user?.phone || 'Provided'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Members 2, 3, 4 */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-dark uppercase tracking-wider">
                      Remaining 3 Teammates
                    </h3>
                    {members.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white border border-accent/20 shadow-2xs space-y-3"
                      >
                        <div className="text-xs font-bold text-accent">Teammate #{idx + 2}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            required
                            placeholder={`Member ${idx + 2} Full Name`}
                            value={m.name}
                            onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                            className="px-3.5 py-2 bg-background-cream border border-accent/20 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-primary"
                          />
                          <input
                            type="email"
                            required
                            placeholder={`Member ${idx + 2} Email`}
                            value={m.email}
                            onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                            className="px-3.5 py-2 bg-background-cream border border-accent/20 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-primary"
                          />
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="10-digit Phone"
                            value={m.phone}
                            onChange={(e) =>
                              handleMemberChange(idx, 'phone', e.target.value.replace(/\D/g, ''))
                            }
                            className="px-3.5 py-2 bg-background-cream border border-accent/20 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-primary font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={submittingTeam}
                    className="btn-primary w-full py-4 rounded-xl text-base font-bold shadow-card cursor-pointer"
                  >
                    {submittingTeam ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Locking Team Slot...</span>
                      </>
                    ) : (
                      <>
                        <span>Lock Team Registration</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* 2. PS VISIBLE VIEW */}
        {activeTab === 'ps' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-accent/15 p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent bg-secondary/50 px-3 py-1 rounded-full">
                  Official Problem Statements
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-primary mt-2">
                  Released Tracks ({problemStatements.length})
                </h2>
                <p className="text-xs sm:text-sm text-dark-muted mt-1">
                  Browse problem statements and select one to start your idea proposal.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'AI', 'Campus', 'Web', 'Open Innovation'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPsCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      psCategoryFilter === cat
                        ? 'bg-primary text-white'
                        : 'bg-background-cream text-dark-muted hover:text-dark'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPS.map((ps) => (
                <div
                  key={ps.id}
                  className="bg-white rounded-3xl border border-accent/15 p-6 sm:p-8 shadow-card flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-accent bg-secondary/60 px-3 py-1 rounded-md">
                        {ps.psCode}
                      </span>
                      <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                        {ps.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-primary leading-snug">
                      {ps.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-dark-muted leading-relaxed">
                      {ps.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-accent/10 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-dark-muted">
                      Difficulty: <strong className="text-dark">{ps.difficulty || 'Medium'}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPS(ps.id);
                        setActiveTab('solution');
                      }}
                      className="btn-primary text-xs py-2 px-4 rounded-xl font-bold inline-flex items-center gap-1.5"
                    >
                      <span>Choose for Solution</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SUBMIT THE SOLUTION (IDEA) VIEW */}
        {activeTab === 'solution' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-accent/15 p-6 sm:p-10 shadow-card space-y-6">
              <div className="border-b border-accent/15 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent">
                    Stage 1
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-primary mt-1">
                    Submit Solution &amp; Technical Approach
                  </h2>
                  <p className="text-xs sm:text-sm text-dark-muted mt-1">
                    Describe your proposed system, architecture, and technology stack.
                  </p>
                </div>
                {ideaSubmission && (
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-full flex items-center gap-1 self-start sm:self-auto">
                    <CheckCircle2 className="w-4 h-4" /> Proposal {ideaSubmission.status || 'Submitted'}
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmitIdea} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                    Problem Statement <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={selectedPS}
                    onChange={(e) => setSelectedPS(e.target.value)}
                    className="w-full px-4 py-3 bg-background-cream border border-accent/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                  >
                    <option value="">-- Select Problem Statement --</option>
                    {problemStatements.map((ps) => (
                      <option key={ps.id} value={ps.id}>
                        [{ps.psCode}] {ps.title} ({ps.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                    Project Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                    placeholder="e.g. IoT Campus Assistant"
                    className="w-full px-4 py-2.5 bg-background-cream border border-accent/20 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                    Solution Abstract &amp; Architecture <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={ideaDescription}
                    onChange={(e) => setIdeaDescription(e.target.value)}
                    placeholder="Detailed explanation of how your system solves the problem, APIs used, and user flow..."
                    className="w-full p-4 bg-background-cream border border-accent/20 rounded-xl text-sm focus:outline-none focus:border-primary leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                    Tech Stack (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    placeholder="e.g. React, Node.js, Firebase, TailwindCSS, Python"
                    className="w-full px-4 py-2.5 bg-background-cream border border-accent/20 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                    Presentation Deck / Figma Link
                  </label>
                  <input
                    type="url"
                    value={pitchDeckUrl}
                    onChange={(e) => setPitchDeckUrl(e.target.value)}
                    placeholder="https://docs.google.com/presentation/d/... or Canva / Figma link"
                    className="w-full px-4 py-2.5 bg-background-cream border border-accent/20 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    type="submit"
                    disabled={submittingIdea}
                    className="btn-primary w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm cursor-pointer shadow-sm"
                  >
                    {submittingIdea ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving Proposal...</span>
                      </>
                    ) : (
                      <>
                        <span>{ideaSubmission ? 'Update Solution Proposal' : 'Submit Solution Proposal'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. SUBMIT PROTOTYPE VIEW */}
        {activeTab === 'prototype' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-accent/15 p-6 sm:p-10 shadow-card space-y-6">
              <div className="border-b border-accent/15 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent">
                    Stage 2
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-primary mt-1">
                    Submit Working Prototype &amp; Code
                  </h2>
                  <p className="text-xs sm:text-sm text-dark-muted mt-1">
                    Provide your GitHub repository and live application demo link.
                  </p>
                </div>
                {prototypeSubmission && (
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-full flex items-center gap-1 self-start sm:self-auto">
                    <CheckCircle2 className="w-4 h-4" /> Prototype Submitted
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmitPrototype} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                    Prototype Title
                  </label>
                  <input
                    type="text"
                    value={protoTitle}
                    onChange={(e) => setProtoTitle(e.target.value)}
                    placeholder="e.g. CampusFix MVP v1.0"
                    className="w-full px-4 py-2.5 bg-background-cream border border-accent/20 rounded-xl text-sm focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                    GitHub Repository URL <span className="text-red-600">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Github className="w-4 h-4 text-dark-muted absolute left-3.5 pointer-events-none" />
                    <input
                      type="url"
                      required
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/your-username/repo"
                      className="w-full pl-10 pr-4 py-2.5 bg-background-cream border border-accent/20 rounded-xl text-sm focus:outline-none focus:border-primary font-mono text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                    Live Hosted URL (Vercel / Netlify / Render / APK)
                  </label>
                  <div className="relative flex items-center">
                    <Globe className="w-4 h-4 text-dark-muted absolute left-3.5 pointer-events-none" />
                    <input
                      type="url"
                      value={liveDemoUrl}
                      onChange={(e) => setLiveDemoUrl(e.target.value)}
                      placeholder="https://your-project.vercel.app"
                      className="w-full pl-10 pr-4 py-2.5 bg-background-cream border border-accent/20 rounded-xl text-sm focus:outline-none focus:border-primary text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                    Video Demo Link (YouTube / Loom / Drive)
                  </label>
                  <div className="relative flex items-center">
                    <Video className="w-4 h-4 text-dark-muted absolute left-3.5 pointer-events-none" />
                    <input
                      type="url"
                      value={videoDemoUrl}
                      onChange={(e) => setVideoDemoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full pl-10 pr-4 py-2.5 bg-background-cream border border-accent/20 rounded-xl text-sm focus:outline-none focus:border-primary text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">
                    Key Features Implemented
                  </label>
                  <textarea
                    rows={4}
                    value={protoHighlights}
                    onChange={(e) => setProtoHighlights(e.target.value)}
                    placeholder="List the 3-5 key working features built today, APIs integrated, and jury demo instructions..."
                    className="w-full p-4 bg-background-cream border border-accent/20 rounded-xl text-sm focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    type="submit"
                    disabled={submittingProto}
                    className="btn-primary w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm cursor-pointer shadow-sm"
                  >
                    {submittingProto ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting Prototype...</span>
                      </>
                    ) : (
                      <>
                        <span>{prototypeSubmission ? 'Update Prototype Code' : 'Submit Final Prototype'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 5. FINAL RESULT VIEW */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-accent/15 p-6 sm:p-10 shadow-card space-y-8">
              <div className="border-b border-accent/15 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Closing Ceremony
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-primary mt-1">
                  Final Results &amp; Verified Certificates
                </h2>
                <p className="text-xs sm:text-sm text-dark-muted mt-1">
                  Winner announcements and certificate issuance at the CIT Auditorium.
                </p>
              </div>

              {/* Progress Milestones Stepper */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    Stage 1
                  </div>
                  <div className="font-extrabold text-sm text-emerald-950">Team Registered</div>
                  <p className="text-[11px] text-emerald-800">
                    {registration ? '✓ Verified & Confirmed' : 'Incomplete'}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-1 ${
                  ideaSubmission ? 'bg-emerald-50 border-emerald-100' : 'bg-background-cream border-accent/15'
                }`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-accent">
                    Stage 2
                  </div>
                  <div className="font-extrabold text-sm text-dark">Idea Proposal</div>
                  <p className="text-[11px] text-dark-muted">
                    {ideaSubmission ? '✓ Proposal Submitted' : 'Pending Submission'}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-1 ${
                  prototypeSubmission ? 'bg-emerald-50 border-emerald-100' : 'bg-background-cream border-accent/15'
                }`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-accent">
                    Stage 3
                  </div>
                  <div className="font-extrabold text-sm text-dark">Prototype Code</div>
                  <p className="text-[11px] text-dark-muted">
                    {prototypeSubmission ? '✓ Code Submitted' : 'Pending Submission'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1">
                  <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Stage 4
                  </div>
                  <div className="font-extrabold text-sm text-amber-950">Jury &amp; Winners</div>
                  <p className="text-[11px] text-amber-800">
                    Live Demo at 06:00 PM
                  </p>
                </div>
              </div>

              {/* Prize Pool Spotlight Card */}
              <div className="bg-primary text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                <div className="space-y-4 relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-secondary text-xs font-bold uppercase tracking-wider">
                    Cash Prizes
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold">
                    ₹25,000+ Direct Cash Prize Pool
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                      <div className="text-xs text-white/70">1st Place Champion</div>
                      <div className="text-xl font-black text-secondary">₹12,000</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                      <div className="text-xs text-white/70">2nd Place Runner-Up</div>
                      <div className="text-xl font-black text-secondary">₹8,000</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                      <div className="text-xs text-white/70">3rd Place Innovation</div>
                      <div className="text-xl font-black text-secondary">₹5,000</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Certificates Card */}
              <div className="p-6 rounded-3xl bg-background-cream border border-accent/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
                    <Award className="w-3.5 h-3.5" />
                    Government of India MSME &amp; CIT Co-signed
                  </div>
                  <h4 className="text-xl font-bold text-primary">Official Participation Certificates</h4>
                  <p className="text-xs sm:text-sm text-dark-muted max-w-xl leading-relaxed">
                    Digital certificates are generated for all 4 team members with individual verification IDs upon completion of the live pitching round.
                  </p>
                </div>
                <button
                  onClick={() => info('Certificates will be unlocked after the event closing ceremony.')}
                  className="btn-secondary whitespace-nowrap text-xs font-bold px-5 py-3 rounded-xl self-start sm:self-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Certificate</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Profile Details Modal */}
      <UserDetailsModal
        isOpen={profileModalOpen}
        onClose={() => {
          const isComplete = Boolean(
            user?.name &&
            user?.phone &&
            (user?.institute || user?.college) &&
            user?.year &&
            user?.idCardUrl
          );
          if (!isComplete) {
            navigate('/login');
          } else {
            setProfileModalOpen(false);
          }
        }}
        onSaved={() => {
          setProfileModalOpen(false);
          loadDashboardData();
        }}
      />
    </div>
  );
}
