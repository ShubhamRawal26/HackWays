import {
  authService,
  eventService,
  psService,
  submissionService,
  adminService,
  syncCloudDatabase,
} from './firebaseService';

// Parse path and query parameters
const parseUrl = (rawUrl) => {
  let clean = rawUrl.replace(/^\/?api\/?/, '/');
  if (!clean.startsWith('/')) clean = '/' + clean;

  const [path, search] = clean.split('?');
  const params = new URLSearchParams(search || '');
  return { path, params };
};

const api = {
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },

  async get(rawUrl) {
    const { path, params } = parseUrl(rawUrl);

    // Auth
    if (path === '/auth/me') {
      const data = await authService.getMe();
      return { data };
    }

    // Admin Dashboard
    if (path === '/admin/dashboard') {
      const data = await adminService.getDashboardStats();
      return { data };
    }

    // Admin Users
    if (path === '/admin/users') {
      const data = await adminService.getRegisteredUsers({
        eventId: params.get('eventId'),
        search: params.get('search'),
        teamStatus: params.get('teamStatus'),
        idStatus: params.get('idStatus'),
        studentType: params.get('studentType'),
      });
      return { data };
    }

    // Admin Submissions
    if (path === '/admin/submissions') {
      const data = await adminService.getSubmissions({
        eventId: params.get('eventId'),
        type: params.get('type') || 'idea',
      });
      return { data };
    }

    // Admin Admins
    if (path === '/admin/admins') {
      const data = await adminService.getAdmins();
      return { data };
    }

    // My Events
    if (path === '/events/user/my-events') {
      const data = await eventService.getMyEvents();
      return { data };
    }

    // Event Problem Statements: /events/:id/problem-statements
    const psMatch = path.match(/^\/events\/([^/]+)\/problem-statements$/);
    if (psMatch) {
      const data = await psService.getEventProblemStatements(psMatch[1]);
      return {
        data: {
          ...data,
          statements: data.problemStatements || data.statements || [],
          problemStatements: data.problemStatements || data.statements || [],
        },
      };
    }

    // Event Submissions Mine: /events/:id/submissions/mine OR /my-submissions
    const mineMatch = path.match(/^\/events\/([^/]+)\/submissions\/(?:mine|my-submissions)$/);
    if (mineMatch) {
      const data = await submissionService.getMySubmissions(mineMatch[1]);
      return {
        data: {
          ...data,
          idea: data.idea || data.ideaSubmission || null,
          prototype: data.prototype || data.prototypeSubmission || null,
          ideaSubmission: data.idea || data.ideaSubmission || null,
          prototypeSubmission: data.prototype || data.prototypeSubmission || null,
        },
      };
    }

    // Single Event Detail: /events/:id
    const singleEventMatch = path.match(/^\/events\/([^/]+)$/);
    if (singleEventMatch) {
      const data = await eventService.getEventById(singleEventMatch[1]);
      const reg = data.registrationDetails || data.registration || data.userState?.registration || null;
      return {
        data: {
          ...data,
          registration: reg,
          registrationDetails: reg,
          userState: data.userState || {
            isRegistered: Boolean(reg),
            registration: reg,
          },
          scheduleState: data.scheduleState || {
            isPSReleased: true,
            isPrototypeOpen: true,
          },
        },
      };
    }

    // All Events: /events
    if (path === '/events') {
      const data = await eventService.getAllEvents({
        status: params.get('status'),
        search: params.get('search'),
      });
      return { data };
    }

    console.warn('[Firebase API]: Unhandled GET route:', path);
    return { data: { success: false, message: `Route ${path} not found` } };
  },

  async post(rawUrl, body) {
    const { path } = parseUrl(rawUrl);

    // Auth
    if (path === '/auth/send-otp') {
      const data = await authService.sendOTP(body);
      return { data };
    }
    if (path === '/auth/verify-otp') {
      const data = await authService.verifyOTP(body);
      return { data };
    }
    if (path === '/auth/google') {
      const data = await authService.loginWithGoogle();
      return { data };
    }
    if (path === '/auth/complete-profile') {
      const data = await authService.completeProfile(body);
      return { data };
    }
    if (path === '/auth/admin-login') {
      const data = await authService.adminLogin(body);
      return { data };
    }
    if (path === '/auth/admin-google-login') {
      const data = await authService.adminLoginWithGoogle();
      return { data };
    }

    // Admin Sync to Cloud
    if (path === '/admin/sync-cloud') {
      const ok = await syncCloudDatabase();
      return { data: { success: ok, message: ok ? 'Synchronized to Firebase Cloud!' : 'Firebase rules rejected write' } };
    }

    // Admin Create Admin
    if (path === '/admin/admins') {
      const data = await adminService.createAdmin(body);
      return { data };
    }

    // Event Registration: /events/:id/register
    const regMatch = path.match(/^\/events\/([^/]+)\/register$/);
    if (regMatch) {
      const data = await eventService.registerForEvent(regMatch[1], body);
      return { data };
    }

    // Idea Submission: /events/:id/submissions/idea
    const ideaMatch = path.match(/^\/events\/([^/]+)\/submissions\/idea$/);
    if (ideaMatch) {
      const data = await submissionService.submitIdea(ideaMatch[1], body);
      return { data };
    }

    // Prototype Submission: /events/:id/submissions/prototype
    const protoMatch = path.match(/^\/events\/([^/]+)\/submissions\/prototype$/);
    if (protoMatch) {
      const data = await submissionService.submitPrototype(protoMatch[1], body);
      return { data };
    }

    // Event Create Problem Statement: /events/:id/problem-statements
    const createPSMatch = path.match(/^\/events\/([^/]+)\/problem-statements$/);
    if (createPSMatch) {
      const data = await psService.createProblemStatement(createPSMatch[1], body);
      return { data };
    }

    // Create Event: /events
    if (path === '/events') {
      const data = await eventService.createEvent(body);
      return { data };
    }

    console.warn('[Firebase API]: Unhandled POST route:', path);
    return { data: { success: false, message: `Route ${path} not found` } };
  },

  async put(rawUrl, body) {
    const { path } = parseUrl(rawUrl);

    // Auth Profile
    if (path === '/auth/profile') {
      const data = await authService.updateProfile(body);
      return { data };
    }

    // Event Schedule Controls: /events/:id/schedule
    const schedMatch = path.match(/^\/events\/([^/]+)\/schedule$/);
    if (schedMatch) {
      const data = await eventService.updateSchedule(schedMatch[1], body);
      return { data };
    }

    // Admin Submission Review: /admin/submissions/:type/:id/review
    const reviewMatch = path.match(/^\/admin\/submissions\/([^/]+)\/([^/]+)\/review$/);
    if (reviewMatch) {
      const [, type, id] = reviewMatch;
      const data = await adminService.updateSubmissionStatus(type, id, body);
      return { data };
    }

    // Update Problem Statement: /problem-statements/:id
    const updatePSMatch = path.match(/^\/problem-statements\/([^/]+)$/);
    if (updatePSMatch) {
      const data = await psService.updateProblemStatement(updatePSMatch[1], body);
      return { data };
    }

    // Update Event: /events/:id
    const updateEventMatch = path.match(/^\/events\/([^/]+)$/);
    if (updateEventMatch) {
      const data = await eventService.updateEvent(updateEventMatch[1], body);
      return { data };
    }

    console.warn('[Firebase API]: Unhandled PUT route:', path);
    return { data: { success: false, message: `Route ${path} not found` } };
  },

  async delete(rawUrl) {
    const { path } = parseUrl(rawUrl);

    // Delete Problem Statement: /problem-statements/:id
    const deletePSMatch = path.match(/^\/problem-statements\/([^/]+)$/);
    if (deletePSMatch) {
      const data = await psService.deleteProblemStatement(deletePSMatch[1]);
      return { data };
    }

    // Delete Event: /events/:id
    const deleteEventMatch = path.match(/^\/events\/([^/]+)$/);
    if (deleteEventMatch) {
      const data = await eventService.deleteEvent(deleteEventMatch[1]);
      return { data };
    }

    console.warn('[Firebase API]: Unhandled DELETE route:', path);
    return { data: { success: false, message: `Route ${path} not found` } };
  },
};

export default api;
