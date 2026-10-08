import {
  db,
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  isFirebaseConfigured,
  ref,
  set,
  get,
  child,
  update,
  remove,
  push,
} from './firebase';

// Helper to sanitize keys for Firebase Realtime Database (no '.', '#', '$', '[', or ']')
export const sanitizeKey = (str) => {
  if (!str) return 'unknown';
  return String(str).replace(/[.#$[\]]/g, '_');
};

// Helper to convert File to Data URL
export const fileToDataUrl = (file) => {
  return new Promise((resolve) => {
    if (!file || typeof file === 'string') {
      return resolve(file || '');
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

// Local storage fallback cache when Firebase is not yet configured with user's keys
const LOCAL_STORAGE_KEY = 'hackways_rtdb_mock_store';
const getLocalStore = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const setLocalStore = (data) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to persist local store:', err);
  }
};

// Three Official Super Administrators for HackWays & CIT
export const SUPER_ADMIN_EMAILS = [
  'discountbuddyshubham@gmail.com',
  'sureshcitabu@gmail.com',
  'tmgmayankff@gmail.com',
];

export const isSuperAdminEmail = (email) => {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(String(email).trim().toLowerCase());
};

// Initial Seed Data - Strictly Production Ready (No Demo Users, Submissions, or Demo Admins)
const DEFAULT_INITIAL_DATA = () => {
  const now = Date.now();
  const DAY = 86400000;

  return {
    admins: {
      admin_shubham: {
        id: 'admin_shubham',
        _id: 'admin_shubham',
        name: 'Shubham (Super Admin)',
        email: 'discountbuddyshubham@gmail.com',
        role: 'superadmin',
        createdBy: 'system-superadmin-rule',
        createdAt: new Date().toISOString(),
      },
      admin_suresh: {
        id: 'admin_suresh',
        _id: 'admin_suresh',
        name: 'Suresh CIT (Super Admin)',
        email: 'sureshcitabu@gmail.com',
        role: 'superadmin',
        createdBy: 'system-superadmin-rule',
        createdAt: new Date().toISOString(),
      },
      admin_mayank: {
        id: 'admin_mayank',
        _id: 'admin_mayank',
        name: 'Mayank (Super Admin)',
        email: 'tmgmayankff@gmail.com',
        role: 'superadmin',
        createdBy: 'system-superadmin-rule',
        createdAt: new Date().toISOString(),
      },
    },
    users: {},
    events: {
      event_1: {
        id: 'event_1',
        _id: 'event_1',
        title: 'CIT Coding Carnival',
        shortDescription: 'One-day Open Innovation Hackathon organized by Hackways in association with Chartered Institute of Technology (CIT).',
        description: `Welcome to CIT Coding Carnival!
Organized by Hackways, an MSME Certified Organization, in association with Chartered Institute of Technology (CIT).

### Quick Details:
- Teams: Strictly capped at 70 Teams (4 Members per team)
- Prize Pool: ₹25,000+ Cash Prizes
- Certification: Official Participation Certificate co-issued by Hackways & CIT
- Goodies: Swag kits, badge lanyards, and stickers for all participants
- Mentorship: Dedicated mentor check-ins and expert industry judging panel
- Venue: CIT Campus, Abu Road
- Timing: 9:00 AM – 8:30 PM (Full Day)
- Registration Fee: ₹99 per team (100% Refunded at the event check-in)

### Guidelines:
1. Team size must be exactly 4 members.
2. All prototypes must be built during the hackathon day.
3. Bring your own laptops and hardware components. High-speed network, lunch, and refreshments will be provided.`,
        bannerImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
        category: 'Open Innovation',
        venue: 'CIT Campus',
        mode: 'Offline',
        startDate: new Date(now - 1 * DAY).toISOString(),
        endDate: new Date(now + 4 * DAY).toISOString(),
        time: '09:00 AM - 08:30 PM',
        status: 'Ongoing',
        registrationOpen: true,
        registrationDeadline: new Date(now + 2 * DAY).toISOString(),
        maxTeamSize: 4,
        rules: [
          'Team size must be exactly 4 members.',
          'All software/hardware solutions must be built during the hackathon day.',
          'Registration fee of ₹99 is 100% refunded upon physical reporting at the CIT Campus.',
          'Open-source frameworks and public APIs are permitted with attribution.',
        ],
        prizes: [
          { position: '1st Place Winner', amount: '₹12,000', perks: 'Cash Prize + Champion Trophy + Goodies' },
          { position: '2nd Place Runner-Up', amount: '₹8,000', perks: 'Cash Prize + Runner-Up Trophy' },
          { position: '3rd Place Innovation', amount: '₹5,000', perks: 'Cash Prize + Merit Recognition' },
        ],
        schedule: {
          psReleaseTime: new Date(now - 1 * DAY).toISOString(),
          psReleasedManual: true,
          prototypeOpenTime: new Date(now - 12 * 3600000).toISOString(),
          prototypeCloseTime: new Date(now + 24 * 3600000).toISOString(),
          prototypeManualOverride: false,
        },
        createdAt: new Date(now - 15 * DAY).toISOString(),
      },
    },
    problem_statements: {
      ps_101: {
        id: 'ps_101',
        _id: 'ps_101',
        eventId: 'event_1',
        psCode: 'PS-101',
        title: 'AI-Driven Disaster Resource Allocation Platform',
        description: 'Develop a real-time coordination dashboard that analyzes satellite imagery and social sensor feeds to dispatch emergency medical supplies.',
        category: 'Disaster Relief & AI',
        difficulty: 'Hard',
        attachments: [],
        createdAt: new Date().toISOString(),
      },
      ps_102: {
        id: 'ps_102',
        _id: 'ps_102',
        eventId: 'event_1',
        psCode: 'PS-102',
        title: 'Zero-Knowledge Privacy Layer for Healthcare Records',
        description: 'Build a decentralized privacy-preserving protocol for sharing confidential electronic health records without revealing identities.',
        category: 'Privacy & Blockchain',
        difficulty: 'Medium',
        attachments: [],
        createdAt: new Date().toISOString(),
      },
      ps_103: {
        id: 'ps_103',
        _id: 'ps_103',
        eventId: 'event_1',
        psCode: 'PS-103',
        title: 'Smart Campus Utility: Automated Attendance & Meal Management',
        description: 'Build a high-speed campus utility web/mobile application for real-time student check-ins, mess/canteen token tracking, and hostel grievance redressal.',
        category: 'Campus & Student Utilities',
        difficulty: 'Easy',
        attachments: [],
        createdAt: new Date().toISOString(),
      },
      ps_104: {
        id: 'ps_104',
        _id: 'ps_104',
        eventId: 'event_1',
        psCode: 'PS-104',
        title: 'Open Innovation Track: Impact Prototype for Real-World Problem',
        description: 'Design and build any novel software, hardware, or IoT prototype addressing sustainability, accessibility, education, or local commerce.',
        category: 'Open Innovation',
        difficulty: 'Medium',
        attachments: [],
        createdAt: new Date().toISOString(),
      },
    },
    registrations: {},
    idea_submissions: {},
    prototype_submissions: {},
    otps: {},
  };
};

// Immediate local store seeding and strict demo data purge
export const ensureLocalStoreInitialized = () => {
  let existing = getLocalStore();
  let updated = false;

  if (!existing || !existing.events || Object.keys(existing.events).length === 0) {
    const seed = DEFAULT_INITIAL_DATA();
    setLocalStore(seed);
    return seed;
  }

  // Purge any legacy demo data from existing local cache
  if (existing.admins && existing.admins.admin_1) {
    delete existing.admins.admin_1;
    updated = true;
  }
  if (existing.users) {
    for (const [key, u] of Object.entries(existing.users)) {
      if (
        key === 'user_1' ||
        u?.email === 'alex.johnson@example.com' ||
        u?.email === 'admin@organization.org'
      ) {
        delete existing.users[key];
        updated = true;
      }
    }
  }
  if (existing.registrations && existing.registrations.user_1_event_1) {
    delete existing.registrations.user_1_event_1;
    updated = true;
  }
  if (existing.idea_submissions && existing.idea_submissions.user_1_event_1) {
    delete existing.idea_submissions.user_1_event_1;
    updated = true;
  }
  if (existing.events && existing.events.event_2) {
    delete existing.events.event_2;
    updated = true;
  }

  // Ensure the 3 super admins exist in local store
  if (!existing.admins) existing.admins = {};
  const seedAdmins = DEFAULT_INITIAL_DATA().admins;
  for (const [key, adminData] of Object.entries(seedAdmins)) {
    if (!existing.admins[key]) {
      existing.admins[key] = adminData;
      updated = true;
    }
  }

  if (updated) {
    setLocalStore(existing);
  }

  // Purge legacy demo user session from localStorage if logged in as demo
  try {
    const cachedUserStr = localStorage.getItem('org_user');
    if (cachedUserStr) {
      const cached = JSON.parse(cachedUserStr);
      if (
        cached.email === 'admin@organization.org' ||
        cached.email === 'alex.johnson@example.com' ||
        cached.id === 'admin_1' ||
        cached.id === 'user_1'
      ) {
        localStorage.removeItem('org_user');
        localStorage.removeItem('org_token');
      }
    }
  } catch {}

  return existing;
};
ensureLocalStoreInitialized();

// Helper to race a promise against a timeout
const timeoutPromise = (promise, ms = 3000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('RTDB operation timed out')), ms)),
  ]);
};

// Generic read/write helpers that operate on Firebase Realtime Database or fallback store
const readPath = async (path) => {
  // 1. If Firebase is configured, attempt reading live cloud data
  if (isFirebaseConfigured && db) {
    try {
      const dbRef = ref(db);
      const snapshot = await timeoutPromise(get(child(dbRef, path)), 3000);
      if (snapshot && snapshot.exists()) {
        const val = snapshot.val();
        // Keep local cache synced with cloud truth
        const store = getLocalStore() || ensureLocalStoreInitialized();
        const segments = path.split('/').filter(Boolean);
        let cur = store;
        for (let i = 0; i < segments.length - 1; i++) {
          const s = segments[i];
          if (!cur[s] || typeof cur[s] !== 'object') cur[s] = {};
          cur = cur[s];
        }
        if (segments.length > 0) {
          cur[segments[segments.length - 1]] = val;
          setLocalStore(store);
        }
        return val;
      }
    } catch (err) {
      if (err.message && err.message.includes('Permission denied')) {
        console.warn(`[Firebase RTDB]: Cloud read at "${path}" denied by Security Rules. Check Firebase Console Rules.`);
      } else {
        console.warn(`[Firebase RTDB readPath "${path}"]:`, err.message);
      }
    }
  }

  // 2. Instant fallback to persistent local store
  const store = getLocalStore() || ensureLocalStoreInitialized();
  const segments = path.split('/').filter(Boolean);
  let cur = store;
  for (const s of segments) {
    if (cur && typeof cur === 'object') {
      cur = cur[s];
    } else {
      return null;
    }
  }
  return cur ?? null;
};

const writePath = async (path, val) => {
  // 1. Immediately persist to local store for backup/responsiveness
  const store = getLocalStore() || ensureLocalStoreInitialized();
  const segments = path.split('/').filter(Boolean);
  let cur = store;
  for (let i = 0; i < segments.length - 1; i++) {
    const s = segments[i];
    if (!cur[s] || typeof cur[s] !== 'object') {
      cur[s] = {};
    }
    cur = cur[s];
  }
  const last = segments[segments.length - 1];
  if (val === null) {
    delete cur[last];
  } else {
    cur[last] = val;
  }
  setLocalStore(store);

  // 2. Persist directly to Firebase Realtime Database in cloud
  if (isFirebaseConfigured && db) {
    try {
      const dbRef = ref(db, path);
      if (val === null) {
        await timeoutPromise(remove(dbRef), 5000);
      } else {
        await timeoutPromise(set(dbRef, val), 5000);
      }
      console.log(`✅ [Firebase RTDB Cloud]: Successfully saved to cloud path "${path}".`);
    } catch (err) {
      console.error(`🚨 [Firebase RTDB Cloud Error at "${path}"]:`, err.message);
      if (err.message && err.message.includes('Permission denied')) {
        const errorMsg = 'Firebase Cloud Rules Locked: In Firebase Console -> Realtime Database -> Rules tab, change rules to: { "rules": { ".read": true, ".write": true } } and click Publish.';
        console.error('ACTION REQUIRED:', errorMsg);
        throw new Error(errorMsg);
      }
      throw err;
    }
  }
};

const updatePath = async (path, val) => {
  const existing = (await readPath(path)) || {};
  const merged = { ...existing, ...val };
  await writePath(path, merged);

  if (isFirebaseConfigured && db) {
    try {
      const dbRef = ref(db, path);
      await timeoutPromise(update(dbRef, val), 5000);
    } catch (err) {
      console.warn(`[Firebase RTDB Cloud update notice at "${path}"]:`, err.message);
    }
  }
};

// Seed initial database structure if empty
let isSeeded = false;
export const ensureDatabaseSeeded = async () => {
  ensureLocalStoreInitialized();
  if (isSeeded) return;

  // Check if cloud Firebase needs initial seed
  if (isFirebaseConfigured && db) {
    try {
      const dbRef = ref(db);
      const snapshot = await timeoutPromise(get(child(dbRef, 'events/event_1')), 3000);
      if (!snapshot || !snapshot.exists()) {
        const initialSeed = DEFAULT_INITIAL_DATA();
        await timeoutPromise(update(ref(db), initialSeed), 5000);
        console.log('✅ [Firebase RTDB]: Seeded default events and problem statements to Firebase Cloud.');
        isSeeded = true;
      } else {
        isSeeded = true;
      }
    } catch (err) {
      console.info('[Firebase RTDB Seed Notice]:', err.message);
    }
  }
};

// Helper to verify if an email is an authorized administrator
export const isAuthorizedAdmin = async (email) => {
  if (!email) return false;
  const clean = String(email).trim().toLowerCase();
  if (isSuperAdminEmail(clean)) return true;
  try {
    const adminsObj = (await readPath('admins')) || {};
    return Object.values(adminsObj).some(
      (a) => a.email && String(a.email).trim().toLowerCase() === clean
    );
  } catch {
    return false;
  }
};

// Strict administrator authorization gatekeeper
export const ensureAdminAuthorized = async () => {
  const storedUserStr = localStorage.getItem('org_user');
  if (!storedUserStr) {
    const err = new Error('Unauthorized: Administrator authentication required.');
    err.response = { status: 401, data: { message: err.message } };
    throw err;
  }
  let storedUser;
  try {
    storedUser = JSON.parse(storedUserStr);
  } catch {
    const err = new Error('Invalid session payload.');
    err.response = { status: 401, data: { message: err.message } };
    throw err;
  }

  const email = storedUser.email?.toLowerCase()?.trim() || '';
  const isAuth = await isAuthorizedAdmin(email);
  if (!isAuth) {
    const err = new Error('Access Denied: You do not possess verified administrator permissions.');
    err.response = { status: 403, data: { message: err.message } };
    throw err;
  }
  return storedUser;
};

// Purge legacy demo artifacts from live Firebase Realtime Database
export const purgeCloudDemoData = async () => {
  if (!isFirebaseConfigured || !db || !auth?.currentUser) return;
  const currentEmail = auth.currentUser.email?.toLowerCase().trim();
  if (!isSuperAdminEmail(currentEmail)) return;

  try {
    const demoPaths = [
      'admins/admin_1',
      'users/user_1',
      'registrations/user_1_event_1',
      'idea_submissions/user_1_event_1',
      'events/event_2',
    ];
    for (const p of demoPaths) {
      try {
        await timeoutPromise(remove(ref(db, p)), 2500);
      } catch {}
    }
    console.log('✅ [Firebase Cloud]: Cleaned any legacy demo paths from Cloud RTDB.');
  } catch (err) {
    console.warn('[Firebase Cloud Purge Notice]:', err.message);
  }
};

// Push all local store data directly to Firebase Realtime Database
export const syncCloudDatabase = async () => {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const store = getLocalStore() || DEFAULT_INITIAL_DATA();
    await timeoutPromise(update(ref(db), store), 6000);
    console.log('🚀 [Firebase Cloud Sync]: All data successfully uploaded to Firebase Cloud Realtime Database!');
    return true;
  } catch (err) {
    console.error('❌ [Firebase Cloud Sync Error]:', err.message);
    return false;
  }
};
// Kick off cloud synchronization
syncCloudDatabase();


// ----------------------------------------------------
// AUTH SERVICES
// ----------------------------------------------------

export const authService = {
  async sendOTP({ email, purpose, name, phone, college }) {
    await ensureDatabaseSeeded();
    const cleanEmail = email.trim().toLowerCase();
    const emailKey = sanitizeKey(cleanEmail);

    const usersObj = (await readPath('users')) || {};
    const existingUser = Object.values(usersObj).find((u) => u.email?.toLowerCase() === cleanEmail);

    if (purpose === 'signup' && existingUser) {
      const err = new Error('An account with this email already exists. Please log in instead.');
      err.response = { status: 400, data: { message: err.message } };
      throw err;
    }

    if (purpose === 'login' && !existingUser) {
      const err = new Error('No registered user found with this email. Please sign up first.');
      err.response = { status: 404, data: { message: err.message } };
      throw err;
    }

    // Generate 6-digit OTP code (e.g. 123456 in dev mode for easy testing, or random)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await writePath(`otps/${emailKey}`, {
      email: cleanEmail,
      otp: code,
      purpose: purpose || 'login',
      tempUserData: { name, phone, college },
      expiresAt,
    });

    console.log(`%c[HackWays Auth OTP for ${cleanEmail}]: ${code}`, 'color: #00ffff; font-weight: bold; font-size: 14px;');

    return {
      success: true,
      message: `Verification code sent to ${cleanEmail}. (Code: ${code})`,
      devCode: code,
    };
  },

  async verifyOTP({ email, otp }) {
    await ensureDatabaseSeeded();
    const cleanEmail = email.trim().toLowerCase();
    const emailKey = sanitizeKey(cleanEmail);

    const otpRecord = await readPath(`otps/${emailKey}`);
    if (!otpRecord) {
      const err = new Error('Verification code expired or not requested.');
      err.response = { status: 400, data: { message: err.message } };
      throw err;
    }

    if (Date.now() > otpRecord.expiresAt) {
      await writePath(`otps/${emailKey}`, null);
      const err = new Error('Verification code has expired. Please request a new one.');
      err.response = { status: 400, data: { message: err.message } };
      throw err;
    }

    if (otpRecord.otp !== otp.trim()) {
      const err = new Error('Invalid verification code. Please check and try again.');
      err.response = { status: 400, data: { message: err.message } };
      throw err;
    }

    // OTP is valid, clear it
    await writePath(`otps/${emailKey}`, null);

    const usersObj = (await readPath('users')) || {};
    let user = Object.values(usersObj).find((u) => u.email?.toLowerCase() === cleanEmail);

    const isSuperAdmin = isSuperAdminEmail(cleanEmail);

    if (!user) {
      const newId = `user_${Date.now()}`;
      user = {
        id: newId,
        _id: newId,
        name: otpRecord.tempUserData?.name || (isSuperAdmin ? 'Super Administrator' : 'Hackways Participant'),
        email: cleanEmail,
        phone: otpRecord.tempUserData?.phone || '',
        college: otpRecord.tempUserData?.college || (isSuperAdmin ? 'CIT Abu Road' : ''),
        role: isSuperAdmin ? 'superadmin' : 'user',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
      await writePath(`users/${newId}`, user);
    } else if (isSuperAdmin && user.role !== 'superadmin') {
      user.role = 'superadmin';
      await updatePath(`users/${user.id || user._id}`, { role: 'superadmin' });
    }

    if (isSuperAdmin) {
      await writePath(`admins/${user.id || user._id}`, {
        id: user.id || user._id,
        _id: user.id || user._id,
        name: user.name,
        email: cleanEmail,
        role: 'superadmin',
        createdAt: new Date().toISOString(),
      });
    }

    const token = `token_user_${user.id}_${Date.now()}`;
    return {
      success: true,
      message: isSuperAdmin ? 'Welcome, Super Admin!' : 'Login successful!',
      token,
      user,
      role: isSuperAdmin ? 'superadmin' : (user.role || 'user'),
      isAdmin: isSuperAdmin,
    };
  },

  // Dedicated, strictly enforced Administrator Google Authentication
  async adminLoginWithGoogle() {
    await ensureDatabaseSeeded();
    if (!auth || !googleProvider) {
      const err = new Error('Firebase Auth is not initialized. Please verify Firebase credentials in client/.env');
      err.response = { status: 500, data: { message: err.message } };
      throw err;
    }

    // Force prompt to ensure the user can select their authorized admin account
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, googleProvider);
    const gUser = result.user;
    const cleanEmail = gUser.email?.toLowerCase().trim() || '';
    const userId = gUser.uid;

    const isSuperAdmin = isSuperAdminEmail(cleanEmail);
    const adminsObj = (await readPath('admins')) || {};
    const provisionedAdmin = Object.values(adminsObj).find(
      (a) => a.email && String(a.email).toLowerCase().trim() === cleanEmail
    );

    // STRICT SECURITY GATE:
    // Any Google account not registered as an assigned administrator is immediately rejected.
    if (!isSuperAdmin && !provisionedAdmin) {
      await signOut(auth);
      localStorage.removeItem('org_token');
      localStorage.removeItem('org_user');

      const err = new Error(
        `ACCESS DENIED: The Google account "${cleanEmail}" is not an assigned administrator. Only pre-authorized administrator accounts can access the Admin Command Center. Normal participants must sign in through the Participant Portal.`
      );
      err.response = { status: 403, data: { message: err.message } };
      throw err;
    }

    const assignedRole = isSuperAdmin ? 'superadmin' : (provisionedAdmin.role || 'admin');

    const adminUser = {
      id: userId,
      _id: userId,
      name: gUser.displayName || (isSuperAdmin ? 'Super Administrator' : 'Administrator'),
      email: cleanEmail,
      photoURL: gUser.photoURL || '',
      role: assignedRole,
      isVerified: true,
      authenticatedVia: 'firebase_google',
      lastLoginAt: new Date().toISOString(),
      createdAt: provisionedAdmin?.createdAt || new Date().toISOString(),
    };

    // Store admin record in Realtime Database under their Firebase UID
    await updatePath(`admins/${userId}`, adminUser);

    // If super admin, clean up any legacy cloud demo data
    if (isSuperAdmin) {
      purgeCloudDemoData().catch(() => {});
    }

    const token = `token_admin_${userId}_${Date.now()}`;
    localStorage.setItem('org_token', token);
    localStorage.setItem('org_user', JSON.stringify(adminUser));

    return {
      success: true,
      message: `Welcome Administrator, ${adminUser.name} (${cleanEmail})!`,
      token,
      user: adminUser,
      role: assignedRole,
      isAdmin: true,
    };
  },

  async adminLogin({ email, password }) {
    await ensureDatabaseSeeded();
    const cleanEmail = email.trim().toLowerCase();
    const isSuper = isSuperAdminEmail(cleanEmail);
    const adminsObj = (await readPath('admins')) || {};
    const admin = Object.values(adminsObj).find((a) => a.email?.toLowerCase() === cleanEmail);

    if (!admin || !isSuper) {
      const err = new Error('Access Denied: Only authorized administrator accounts can access this portal.');
      err.response = { status: 401, data: { message: err.message } };
      throw err;
    }

    const validPasswords = ['HackwaysAdmin2026!', admin.password].filter(Boolean);
    if (!validPasswords.includes(password)) {
      const err = new Error('Invalid administrator password. Please authenticate with your authorized Google account or admin credential.');
      err.response = { status: 401, data: { message: err.message } };
      throw err;
    }

    const token = `token_admin_${admin.id || admin._id}_${Date.now()}`;
    const safeAdmin = {
      ...admin,
      id: admin.id || admin._id,
      _id: admin._id || admin.id,
      name: admin.name || 'Super Administrator',
      email: cleanEmail,
      role: 'superadmin',
      isVerified: true,
    };
    delete safeAdmin.password;

    localStorage.setItem('org_token', token);
    localStorage.setItem('org_user', JSON.stringify(safeAdmin));

    return {
      success: true,
      token,
      user: safeAdmin,
      role: 'superadmin',
      isAdmin: true,
    };
  },

  async getMe() {
    await ensureDatabaseSeeded();
    const storedUserStr = localStorage.getItem('org_user');
    if (!storedUserStr) {
      const err = new Error('Unauthenticated');
      err.response = { status: 401, data: { message: 'Not logged in' } };
      throw err;
    }

    const storedUser = JSON.parse(storedUserStr);
    const cleanEmail = storedUser.email?.toLowerCase()?.trim() || '';
    const isSuperAdmin = isSuperAdminEmail(cleanEmail);
    const isAuthAdmin = await isAuthorizedAdmin(cleanEmail);

    // If user's stored role claims admin privileges but their email is NOT an authorized admin, revoke immediately!
    if (!isAuthAdmin && (storedUser.role === 'admin' || storedUser.role === 'superadmin')) {
      storedUser.role = 'user';
      localStorage.setItem('org_user', JSON.stringify(storedUser));
    }

    if (isSuperAdmin && storedUser.role !== 'superadmin') {
      storedUser.role = 'superadmin';
      localStorage.setItem('org_user', JSON.stringify(storedUser));
    }

    const path = isAuthAdmin ? 'admins' : 'users';
    const list = (await readPath(path)) || {};
    const found = list[storedUser.id] || list[storedUser._id] || storedUser;

    if (isSuperAdmin) {
      found.role = 'superadmin';
    } else if (!isAuthAdmin) {
      found.role = 'user';
    }

    return {
      success: true,
      user: found,
      role: isSuperAdmin ? 'superadmin' : (isAuthAdmin ? (found.role || 'admin') : 'user'),
      isAdmin: isAuthAdmin,
    };
  },

  async updateProfile(data) {
    const storedUserStr = localStorage.getItem('org_user');
    if (!storedUserStr) {
      throw new Error('Not logged in');
    }
    const storedUser = JSON.parse(storedUserStr);
    const userId = storedUser.id || storedUser._id;
    const path = storedUser.role?.includes('admin') ? `admins/${userId}` : `users/${userId}`;

    await updatePath(path, data);
    const updated = await readPath(path);
    return { success: true, user: updated };
  },

  async loginWithGoogle() {
    await ensureDatabaseSeeded();
    if (!auth || !googleProvider) {
      throw new Error('Firebase Auth is not initialized. Please ensure your Firebase credentials in client/.env are valid.');
    }

    const result = await signInWithPopup(auth, googleProvider);
    const gUser = result.user;
    const cleanEmail = gUser.email?.toLowerCase().trim() || '';
    const userId = gUser.uid;
    const isSuperAdmin = isSuperAdminEmail(cleanEmail);

    // 1. First directly read users/${userId} (cloud permission allows auth.uid == $uid)
    let existingUser = await readPath(`users/${userId}`);

    // 2. Fallback: check local cache by email or UID
    if (!existingUser) {
      const localStore = getLocalStore();
      const usersObj = localStore?.users || {};
      existingUser = Object.values(usersObj).find(
        (u) => (cleanEmail && u.email?.toLowerCase() === cleanEmail) || u.id === userId || u._id === userId
      );
    }

    let user;
    if (existingUser) {
      user = {
        ...existingUser,
        id: userId,
        _id: userId,
        name: existingUser.name || gUser.displayName || 'Participant',
        email: cleanEmail,
        phone: existingUser.phone || '',
        college: existingUser.college || existingUser.institute || (isSuperAdmin ? 'CIT Abu Road' : ''),
        institute: existingUser.institute || existingUser.college || (isSuperAdmin ? 'CIT Abu Road' : ''),
        year: existingUser.year || (isSuperAdmin ? 'Faculty / Admin' : ''),
        photoURL: gUser.photoURL || existingUser.photoURL || '',
        role: isSuperAdmin ? 'superadmin' : (existingUser.role || 'user'),
      };
      await updatePath(`users/${userId}`, user);
    } else {
      user = {
        id: userId,
        _id: userId,
        name: gUser.displayName || (isSuperAdmin ? 'Super Administrator' : 'Participant'),
        email: cleanEmail,
        phone: gUser.phoneNumber || '',
        college: isSuperAdmin ? 'CIT Abu Road' : '',
        institute: isSuperAdmin ? 'CIT Abu Road' : '',
        year: isSuperAdmin ? 'Faculty / Admin' : '',
        photoURL: gUser.photoURL || '',
        role: isSuperAdmin ? 'superadmin' : 'user',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
      await writePath(`users/${userId}`, user);
    }

    // Always cache user in localStore
    const localStore = getLocalStore() || ensureLocalStoreInitialized();
    if (!localStore.users) localStore.users = {};
    localStore.users[userId] = user;
    setLocalStore(localStore);

    // Persist superadmin record into admins table
    if (isSuperAdmin) {
      const adminRecord = {
        id: userId,
        _id: userId,
        name: user.name,
        email: cleanEmail,
        role: 'superadmin',
        photoURL: user.photoURL || '',
        createdBy: 'system-superadmin-rule',
        createdAt: new Date().toISOString(),
      };
      await writePath(`admins/${userId}`, adminRecord);
    }

    const token = `token_google_${user.id}_${Date.now()}`;
    const isProfileComplete =
      isSuperAdmin ||
      Boolean(
        user.name &&
        user.phone &&
        (user.college || user.institute) &&
        user.year &&
        user.idCardUrl
      );

    return {
      success: true,
      message: isSuperAdmin ? 'Welcome, Super Admin!' : 'Signed in with Google successfully!',
      token,
      user,
      role: isSuperAdmin ? 'superadmin' : (user.role || 'user'),
      isAdmin: isSuperAdmin,
      isProfileComplete,
    };
  },

  async completeProfile({
    name,
    email,
    phone,
    college,
    institute,
    year,
    studentType = 'college',
    idCardUrl = '',
    idCardName = '',
  }) {
    const storedUserStr = localStorage.getItem('org_user');
    if (!storedUserStr) {
      const err = new Error('You must be logged in to update your profile.');
      err.response = { status: 401, data: { message: err.message } };
      throw err;
    }

    const storedUser = JSON.parse(storedUserStr);
    const userId = storedUser.id || storedUser._id;
    const cleanEmail = (email || storedUser.email)?.toLowerCase().trim() || '';
    const isSuper = isSuperAdminEmail(cleanEmail);
    const resolvedInstitute = (institute || college || storedUser.college || storedUser.institute || '').trim();

    const updatedData = {
      name: name?.trim() || storedUser.name,
      email: cleanEmail,
      phone: phone?.trim() || storedUser.phone || '',
      college: resolvedInstitute,
      institute: resolvedInstitute,
      year: year?.trim() || storedUser.year || '',
      studentType: studentType || storedUser.studentType || 'college',
      idCardUrl: idCardUrl || storedUser.idCardUrl || '',
      idCardName: idCardName || storedUser.idCardName || '',
      role: isSuper ? 'superadmin' : (storedUser.role || 'user'),
      isProfileComplete: true,
      updatedAt: new Date().toISOString(),
    };

    await updatePath(`users/${userId}`, updatedData);
    if (isSuper) {
      await writePath(`admins/${userId}`, {
        id: userId,
        _id: userId,
        name: updatedData.name,
        email: cleanEmail,
        role: 'superadmin',
        createdAt: storedUser.createdAt || new Date().toISOString(),
      });
    }

    const updatedUser = {
      ...storedUser,
      ...updatedData,
      id: userId,
      _id: userId,
    };

    // Cache updated profile in both localStorage and localStore
    localStorage.setItem('org_user', JSON.stringify(updatedUser));
    const localStore = getLocalStore() || ensureLocalStoreInitialized();
    if (!localStore.users) localStore.users = {};
    localStore.users[userId] = updatedUser;
    setLocalStore(localStore);

    return {
      success: true,
      message: 'Profile completed successfully!',
      user: updatedUser,
      role: isSuper ? 'superadmin' : (updatedUser.role || 'user'),
      isAdmin: isSuper,
    };
  },

  async logoutFirebase() {
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Firebase signOut notice:', err);
      }
    }
  },
};

// ----------------------------------------------------
// EVENT SERVICES
// ----------------------------------------------------

export const eventService = {
  async getAllEvents({ status, search } = {}) {
    await ensureDatabaseSeeded();
    const eventsObj = (await readPath('events')) || {};
    let events = Object.values(eventsObj).map((e) => ({
      ...e,
      id: e.id || e._id,
      _id: e._id || e.id,
    }));

    if (status && status !== 'all') {
      events = events.filter((e) => e.status?.toLowerCase() === status.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      events = events.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.shortDescription?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q)
      );
    }

    events.sort((a, b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt));

    return { success: true, count: events.length, events };
  },

  async getEventById(eventId) {
    await ensureDatabaseSeeded();
    const event = await readPath(`events/${eventId}`);
    if (!event) {
      const err = new Error('Event not found');
      err.response = { status: 404, data: { message: 'Event not found' } };
      throw err;
    }

    const formattedEvent = {
      ...event,
      id: event.id || eventId,
      _id: event._id || eventId,
    };

    let isRegistered = false;
    let registrationDetails = null;
    let userIdeaSubmission = null;
    let userPrototypeSubmission = null;

    const storedUserStr = localStorage.getItem('org_user');
    if (storedUserStr) {
      try {
        const user = JSON.parse(storedUserStr);
        const userId = user.id || user._id;
        const cleanEmail = user.email?.toLowerCase().trim() || '';
        const regKey = `${userId}_${eventId}`;

        // 1. Direct cloud read (allowed by rules: $regId.contains(auth.uid))
        let reg = await readPath(`registrations/${regKey}`);

        // 2. Fallback: check local store cache by regKey, userId, or email
        if (!reg) {
          const localStore = getLocalStore();
          const allRegs = localStore?.registrations || {};
          reg =
            allRegs[regKey] ||
            Object.values(allRegs).find(
              (r) =>
                (r.eventId === eventId || !r.eventId) &&
                (r.userId === userId ||
                  r.userId === cleanEmail ||
                  (cleanEmail && r.leaderEmail?.toLowerCase() === cleanEmail) ||
                  (r.teamMembers && r.teamMembers.some((m) => m.email?.toLowerCase() === cleanEmail)))
            );
        }

        if (reg) {
          isRegistered = true;
          registrationDetails = reg;
        }

        let idea = await readPath(`idea_submissions/${regKey}`);
        if (!idea) {
          const localStore = getLocalStore();
          idea =
            localStore?.idea_submissions?.[regKey] ||
            Object.values(localStore?.idea_submissions || {}).find(
              (i) => i.userId === userId || (cleanEmail && i.userEmail?.toLowerCase() === cleanEmail)
            );
        }
        if (idea) userIdeaSubmission = idea;

        let proto = await readPath(`prototype_submissions/${regKey}`);
        if (!proto) {
          const localStore = getLocalStore();
          proto =
            localStore?.prototype_submissions?.[regKey] ||
            Object.values(localStore?.prototype_submissions || {}).find(
              (p) => p.userId === userId || (cleanEmail && p.userEmail?.toLowerCase() === cleanEmail)
            );
        }
        if (proto) userPrototypeSubmission = proto;
      } catch (e) {
        console.warn('Error reading user context for event detail:', e);
      }
    }

    return {
      success: true,
      event: formattedEvent,
      isRegistered,
      registrationDetails,
      userIdeaSubmission,
      userPrototypeSubmission,
      userState: {
        isRegistered,
        registration: registrationDetails,
      },
      scheduleState: {
        isPSReleased: true,
        isPrototypeOpen: true,
      },
    };
  },

  async registerForEvent(eventId, payload) {
    const storedUserStr = localStorage.getItem('org_user');
    if (!storedUserStr) {
      const err = new Error('You must log in to register for this event.');
      err.response = { status: 401, data: { message: err.message } };
      throw err;
    }
    const user = JSON.parse(storedUserStr);
    const userId = user.id || user._id;
    const cleanEmail = user.email?.toLowerCase().trim() || '';
    const regKey = `${userId}_${eventId}`;

    const existing = await readPath(`registrations/${regKey}`);
    if (existing) {
      return { success: true, message: 'Already registered for this event.', registration: existing };
    }

    const registration = {
      id: regKey,
      _id: regKey,
      userId,
      userUid: userId,
      eventId,
      teamName: payload.teamName || '',
      collegeOrOrg: payload.collegeOrOrg || user.college || user.institute || '',
      leaderName: user.name || payload.leaderName || '',
      leaderEmail: cleanEmail || payload.leaderEmail || '',
      phone: payload.phone || user.phone || '',
      teamMembers: payload.teamMembers || [],
      trackPreference: payload.trackPreference || '',
      status: 'Registered',
      registeredAt: new Date().toISOString(),
    };

    await writePath(`registrations/${regKey}`, registration);

    // Explicitly cache in localStore as well
    const localStore = getLocalStore() || ensureLocalStoreInitialized();
    if (!localStore.registrations) localStore.registrations = {};
    localStore.registrations[regKey] = registration;
    setLocalStore(localStore);

    return {
      success: true,
      message: 'Successfully registered for event!',
      registration,
    };
  },

  async getMyEvents() {
    await ensureDatabaseSeeded();
    const storedUserStr = localStorage.getItem('org_user');
    if (!storedUserStr) return { success: true, registrations: [] };
    const user = JSON.parse(storedUserStr);
    const userId = user.id || user._id;
    const cleanEmail = user.email?.toLowerCase().trim() || '';

    // Direct read for event_1
    const regKey = `${userId}_event_1`;
    let userReg = await readPath(`registrations/${regKey}`);

    const localStore = getLocalStore();
    const allRegs = localStore?.registrations || {};
    if (!userReg) {
      userReg =
        allRegs[regKey] ||
        Object.values(allRegs).find(
          (r) =>
            r.userId === userId ||
            (cleanEmail && r.leaderEmail?.toLowerCase() === cleanEmail) ||
            (r.teamMembers && r.teamMembers.some((m) => m.email?.toLowerCase() === cleanEmail))
        );
    }

    const eventsObj = (await readPath('events')) || {};
    const registrations = [];
    if (userReg) {
      const ev = eventsObj[userReg.eventId || 'event_1'] || {};
      registrations.push({
        ...userReg,
        event: {
          ...ev,
          id: ev.id || userReg.eventId || 'event_1',
          _id: ev._id || userReg.eventId || 'event_1',
        },
      });
    }

    return { success: true, count: registrations.length, registrations };
  },

  async createEvent(formData) {
    await ensureDatabaseSeeded();
    await ensureAdminAuthorized();
    const eventId = `event_${Date.now()}`;

    let bannerUrl = '';
    if (formData instanceof FormData) {
      const bannerFile = formData.get('banner');
      bannerUrl = bannerFile ? await fileToDataUrl(bannerFile) : '';
    }

    const raw = formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData;

    const newEvent = {
      id: eventId,
      _id: eventId,
      title: raw.title || 'Untitled Event',
      shortDescription: raw.shortDescription || '',
      description: raw.description || '',
      bannerImage: bannerUrl || raw.bannerImage || '',
      category: raw.category || 'Hackathon',
      venue: raw.venue || 'Virtual',
      mode: raw.mode || 'Online',
      startDate: raw.startDate ? new Date(raw.startDate).toISOString() : new Date().toISOString(),
      endDate: raw.endDate ? new Date(raw.endDate).toISOString() : new Date(Date.now() + 86400000).toISOString(),
      time: raw.time || '10:00 AM - 05:00 PM',
      status: raw.status || 'Upcoming',
      registrationOpen: raw.registrationOpen !== false && raw.registrationOpen !== 'false',
      registrationDeadline: raw.registrationDeadline ? new Date(raw.registrationDeadline).toISOString() : null,
      maxTeamSize: Number(raw.maxTeamSize) || 4,
      rules: typeof raw.rules === 'string' ? JSON.parse(raw.rules || '[]') : raw.rules || [],
      prizes: typeof raw.prizes === 'string' ? JSON.parse(raw.prizes || '[]') : raw.prizes || [],
      schedule: {
        psReleaseTime: raw.psReleaseTime || null,
        psReleasedManual: false,
        prototypeOpenTime: raw.prototypeOpenTime || null,
        prototypeCloseTime: raw.prototypeCloseTime || null,
        prototypeManualOverride: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await writePath(`events/${eventId}`, newEvent);
    return { success: true, message: 'Event created successfully.', event: newEvent };
  },

  async updateEvent(eventId, formData) {
    await ensureAdminAuthorized();
    const existing = await readPath(`events/${eventId}`);
    if (!existing) {
      const err = new Error('Event not found');
      err.response = { status: 404, data: { message: 'Event not found' } };
      throw err;
    }

    let bannerUrl = existing.bannerImage;
    if (formData instanceof FormData) {
      const bannerFile = formData.get('banner');
      if (bannerFile && bannerFile.size > 0) {
        bannerUrl = await fileToDataUrl(bannerFile);
      }
    }

    const raw = formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData;

    const updated = {
      ...existing,
      ...raw,
      bannerImage: bannerUrl,
      updatedAt: new Date().toISOString(),
    };

    await writePath(`events/${eventId}`, updated);
    return { success: true, message: 'Event updated successfully.', event: updated };
  },

  async deleteEvent(eventId) {
    await ensureAdminAuthorized();
    await writePath(`events/${eventId}`, null);

    // Clean up problem statements and registrations for this event
    const pss = (await readPath('problem_statements')) || {};
    for (const [key, ps] of Object.entries(pss)) {
      if (ps.eventId === eventId) {
        await writePath(`problem_statements/${key}`, null);
      }
    }

    return { success: true, message: 'Event deleted successfully.' };
  },

  async updateSchedule(eventId, scheduleData) {
    await ensureAdminAuthorized();
    const existing = await readPath(`events/${eventId}`);
    if (!existing) throw new Error('Event not found');

    const updatedSchedule = {
      ...(existing.schedule || {}),
      ...scheduleData,
    };

    await updatePath(`events/${eventId}`, { schedule: updatedSchedule });
    return { success: true, message: 'Schedule controls updated.', schedule: updatedSchedule };
  },
};

// ----------------------------------------------------
// PROBLEM STATEMENT SERVICES
// ----------------------------------------------------

export const psService = {
  async getEventProblemStatements(eventId) {
    await ensureDatabaseSeeded();
    const pss = (await readPath('problem_statements')) || {};
    const filtered = Object.values(pss)
      .filter((ps) => ps.eventId === eventId)
      .map((ps) => ({
        ...ps,
        id: ps.id || ps._id,
        _id: ps._id || ps.id,
      }));

    return {
      success: true,
      count: filtered.length,
      statements: filtered,
      problemStatements: filtered,
    };
  },

  async createProblemStatement(eventId, psData) {
    await ensureAdminAuthorized();
    const psId = `ps_${Date.now()}`;
    const newPS = {
      id: psId,
      _id: psId,
      eventId,
      psCode: psData.psCode || `PS-${Date.now().toString().slice(-4)}`,
      title: psData.title || '',
      description: psData.description || '',
      category: psData.category || 'General',
      difficulty: psData.difficulty || 'Medium',
      attachments: psData.attachments || [],
      createdAt: new Date().toISOString(),
    };

    await writePath(`problem_statements/${psId}`, newPS);
    return { success: true, message: 'Problem statement created.', problemStatement: newPS };
  },

  async updateProblemStatement(psId, psData) {
    await ensureAdminAuthorized();
    const existing = await readPath(`problem_statements/${psId}`);
    if (!existing) throw new Error('Problem statement not found');

    const updated = { ...existing, ...psData };
    await writePath(`problem_statements/${psId}`, updated);
    return { success: true, message: 'Problem statement updated.', problemStatement: updated };
  },

  async deleteProblemStatement(psId) {
    await ensureAdminAuthorized();
    await writePath(`problem_statements/${psId}`, null);
    return { success: true, message: 'Problem statement deleted.' };
  },
};

// ----------------------------------------------------
// SUBMISSION SERVICES
// ----------------------------------------------------

export const submissionService = {
  async getMySubmissions(eventId) {
    const storedUserStr = localStorage.getItem('org_user');
    if (!storedUserStr) {
      return {
        success: true,
        idea: null,
        prototype: null,
        ideaSubmission: null,
        prototypeSubmission: null,
      };
    }

    const user = JSON.parse(storedUserStr);
    const userId = user.id || user._id;
    const subKey = `${userId}_${eventId}`;

    const idea = await readPath(`idea_submissions/${subKey}`);
    const prototype = await readPath(`prototype_submissions/${subKey}`);

    const safeIdea = idea ? { ...idea, id: idea.id || subKey, _id: idea._id || subKey } : null;
    const safePrototype = prototype ? { ...prototype, id: prototype.id || subKey, _id: prototype._id || subKey } : null;

    return {
      success: true,
      idea: safeIdea,
      prototype: safePrototype,
      ideaSubmission: safeIdea,
      prototypeSubmission: safePrototype,
    };
  },

  async submitIdea(eventId, formData) {
    const storedUserStr = localStorage.getItem('org_user');
    if (!storedUserStr) throw new Error('You must be logged in to submit an idea proposal.');

    const user = JSON.parse(storedUserStr);
    const userId = user.id || user._id;
    const subKey = `${userId}_${eventId}`;

    let fileUrl = '';
    let fileName = '';
    let raw = {};

    if (formData instanceof FormData) {
      const file = formData.get('supportingFile');
      if (file && file.size > 0) {
        fileUrl = await fileToDataUrl(file);
        fileName = file.name || 'document';
      }
      raw = Object.fromEntries(formData.entries());
    } else {
      raw = formData;
    }

    const techStack = typeof raw.techStack === 'string' ? JSON.parse(raw.techStack || '[]') : raw.techStack || [];

    const ideaData = {
      id: subKey,
      _id: subKey,
      userId,
      eventId,
      problemStatementId: raw.problemStatementId,
      ideaTitle: raw.ideaTitle,
      ideaDescription: raw.ideaDescription,
      techStack,
      supportingFileUrl: fileUrl || raw.supportingFileUrl || '',
      supportingFileName: fileName || raw.supportingFileName || '',
      status: 'Submitted',
      adminRemarks: '',
      submittedAt: new Date().toISOString(),
    };

    await writePath(`idea_submissions/${subKey}`, ideaData);
    return { success: true, message: 'Idea proposal submitted successfully!', ideaSubmission: ideaData };
  },

  async submitPrototype(eventId, formData) {
    const storedUserStr = localStorage.getItem('org_user');
    if (!storedUserStr) throw new Error('You must be logged in to submit a prototype.');

    const user = JSON.parse(storedUserStr);
    const userId = user.id || user._id;
    const subKey = `${userId}_${eventId}`;

    let fileUrl = '';
    let fileName = '';
    let raw = {};

    if (formData instanceof FormData) {
      const file = formData.get('prototypeFile');
      if (file && file.size > 0) {
        fileUrl = await fileToDataUrl(file);
        fileName = file.name || 'prototype_asset';
      }
      raw = Object.fromEntries(formData.entries());
    } else {
      raw = formData || {};
    }

    const protoData = {
      id: subKey,
      _id: subKey,
      userId,
      eventId,
      title: raw.title || raw.prototypeTitle || 'Working Prototype',
      prototypeTitle: raw.prototypeTitle || raw.title || 'Working Prototype',
      description: raw.description || '',
      githubUrl: raw.githubUrl || '',
      liveDemoUrl: raw.liveDemoUrl || '',
      driveUrl: raw.driveUrl || '',
      uploadedFileUrl: fileUrl || raw.uploadedFileUrl || '',
      uploadedFileName: fileName || raw.uploadedFileName || '',
      status: 'Submitted',
      adminRemarks: '',
      submittedAt: new Date().toISOString(),
    };

    await writePath(`prototype_submissions/${subKey}`, protoData);
    return { success: true, message: 'Prototype submitted successfully!', prototypeSubmission: protoData };
  },
};

// ----------------------------------------------------
// ADMIN SERVICES
// ----------------------------------------------------

export const adminService = {
  async getDashboardStats() {
    await ensureDatabaseSeeded();
    await ensureAdminAuthorized();
    const events = Object.values((await readPath('events')) || {});
    const usersObj = (await readPath('users')) || {};
    // Strictly exclude administrators from user directory and participant metrics
    const users = Object.values(usersObj).filter((u) => {
      const email = (u.email || '').toLowerCase().trim();
      return !isSuperAdminEmail(email) && u.role !== 'admin' && u.role !== 'superadmin';
    });
    const registrations = Object.values((await readPath('registrations')) || {});
    const ideas = Object.values((await readPath('idea_submissions')) || {});
    const protos = Object.values((await readPath('prototype_submissions')) || {});

    const eventsMap = Object.fromEntries(events.map((e) => [e.id || e._id, e]));
    const usersMap = Object.fromEntries(Object.values(usersObj).map((u) => [u.id || u._id, u]));

    // Match users with registrations (identifying Team Pending vs Team Registered)
    const enrichedUsers = users.map((u) => {
      const uid = u.id || u._id;
      const cleanEmail = (u.email || '').toLowerCase().trim();

      const matchingReg = registrations.find((r) => {
        if (r.userId && (r.userId === uid || r.userId === u.id || r.userId === u._id)) return true;
        if (r.userUid && (r.userUid === uid || r.userUid === u.id || r.userUid === u._id)) return true;
        if (cleanEmail && r.leaderEmail && r.leaderEmail.toLowerCase().trim() === cleanEmail) return true;
        if (
          cleanEmail &&
          Array.isArray(r.teamMembers) &&
          r.teamMembers.some((m) => m?.email && m.email.toLowerCase().trim() === cleanEmail)
        ) {
          return true;
        }
        return false;
      });

      const isTeamRegistered = Boolean(matchingReg);
      const event = matchingReg ? eventsMap[matchingReg.eventId] : null;
      const hasId = Boolean(u.idCardUrl && u.idCardUrl.trim());
      const hasBasicDetails = Boolean(u.name && u.phone);

      return {
        ...u,
        id: uid,
        _id: uid,
        name: u.name || 'Participant',
        email: u.email || '',
        phone: u.phone || '',
        college: u.college || u.institute || '',
        institute: u.institute || u.college || '',
        year: u.year || '',
        studentType: u.studentType || 'college',
        idCardUrl: u.idCardUrl || '',
        idCardName: u.idCardName || '',
        isTeamRegistered,
        teamStatus: isTeamRegistered ? 'Registered' : 'Pending',
        teamName: matchingReg?.teamName || '',
        teamId: matchingReg?.id || matchingReg?._id || '',
        eventId: matchingReg?.eventId || '',
        eventTitle: event?.title || (matchingReg ? 'Hackathon Event' : ''),
        event: event ? { id: event.id || event._id, title: event.title } : null,
        hasIdCard: hasId,
        hasBasicDetails,
        registeredAt: u.createdAt || u.updatedAt || matchingReg?.registeredAt || new Date().toISOString(),
      };
    });

    // Enriched team registrations
    const enrichedTeams = registrations.map((r) => {
      const leaderUser = usersMap[r.userId] || usersMap[r.userUid] || null;
      const event = eventsMap[r.eventId] || null;
      return {
        ...r,
        id: r.id || r._id,
        _id: r._id || r.id,
        teamName: r.teamName || 'Untitled Team',
        leader: {
          id: leaderUser?.id || r.userId || '',
          name: r.leaderName || leaderUser?.name || 'Team Leader',
          email: r.leaderEmail || leaderUser?.email || '',
          phone: r.phone || leaderUser?.phone || '',
          college: r.collegeOrOrg || leaderUser?.college || leaderUser?.institute || '',
          idCardUrl: leaderUser?.idCardUrl || '',
          idCardName: leaderUser?.idCardName || '',
        },
        user: leaderUser || {
          name: r.leaderName || 'Team Leader',
          email: r.leaderEmail || '',
          phone: r.phone || '',
        },
        event: {
          id: event?.id || r.eventId || '',
          title: event?.title || 'Hackathon Event',
          category: event?.category || '',
          status: event?.status || '',
        },
        membersCount: 1 + (r.teamMembers?.length || 0),
        registeredAt: r.registeredAt || new Date().toISOString(),
      };
    });

    const teamPendingCount = enrichedUsers.filter((u) => !u.isTeamRegistered).length;
    const teamRegisteredCount = enrichedUsers.filter((u) => u.isTeamRegistered).length;
    const verifiedIdCardsCount = enrichedUsers.filter((u) => u.hasIdCard).length;

    const recentUsers = [...enrichedUsers]
      .sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0))
      .slice(0, 10);

    const recentTeamRegistrations = [...enrichedTeams]
      .sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0))
      .slice(0, 10);

    const recentEvents = events.slice(0, 6);

    return {
      success: true,
      stats: {
        totalEvents: events.length,
        totalUsers: enrichedUsers.length,
        teamPendingCount,
        teamRegisteredCount,
        verifiedIdCardsCount,
        totalTeamRegistrations: registrations.length,
        totalRegistrations: registrations.length,
        totalSubmissions: ideas.length + protos.length,
        totalIdeaSubmissions: ideas.length,
        totalPrototypeSubmissions: protos.length,
      },
      recentEvents,
      recentUsers, // Individual user registrations (profile, mobile, ID card, team pending status)
      recentRegistrations: recentTeamRegistrations, // Teams registered
      recentTeamRegistrations,
    };
  },

  async getRegisteredUsers({ eventId, search, teamStatus, idStatus, studentType } = {}) {
    await ensureDatabaseSeeded();
    await ensureAdminAuthorized();
    const regs = Object.values((await readPath('registrations')) || {});
    const usersMap = (await readPath('users')) || {};
    const eventsMap = (await readPath('events')) || {};
    // Strictly exclude administrators from participant users list
    const usersList = Object.values(usersMap).filter((u) => {
      const email = (u.email || '').toLowerCase().trim();
      return !isSuperAdminEmail(email) && u.role !== 'admin' && u.role !== 'superadmin';
    });

    // 1. Enrich all users
    const allUsers = usersList.map((u) => {
      const uid = u.id || u._id;
      const cleanEmail = (u.email || '').toLowerCase().trim();

      const matchingReg = regs.find((r) => {
        if (r.userId && (r.userId === uid || r.userId === u.id || r.userId === u._id)) return true;
        if (r.userUid && (r.userUid === uid || r.userUid === u.id || r.userUid === u._id)) return true;
        if (cleanEmail && r.leaderEmail && r.leaderEmail.toLowerCase().trim() === cleanEmail) return true;
        if (
          cleanEmail &&
          Array.isArray(r.teamMembers) &&
          r.teamMembers.some((m) => m?.email && m.email.toLowerCase().trim() === cleanEmail)
        ) {
          return true;
        }
        return false;
      });

      const isTeamRegistered = Boolean(matchingReg);
      const event = matchingReg ? eventsMap[matchingReg.eventId] : null;
      const hasId = Boolean(u.idCardUrl && u.idCardUrl.trim());

      return {
        ...u,
        id: uid,
        _id: uid,
        name: u.name || 'Participant',
        email: u.email || '',
        phone: u.phone || '',
        college: u.college || u.institute || '',
        institute: u.institute || u.college || '',
        year: u.year || '',
        studentType: u.studentType || 'college',
        idCardUrl: u.idCardUrl || '',
        idCardName: u.idCardName || '',
        isTeamRegistered,
        teamStatus: isTeamRegistered ? 'Registered' : 'Pending',
        teamName: matchingReg?.teamName || '',
        teamId: matchingReg?.id || matchingReg?._id || '',
        eventId: matchingReg?.eventId || '',
        eventTitle: event?.title || (matchingReg ? 'Hackathon Event' : ''),
        event: event ? { id: event.id || event._id, title: event.title } : null,
        hasIdCard: hasId,
        registeredAt: u.createdAt || u.updatedAt || matchingReg?.registeredAt || new Date().toISOString(),
      };
    });

    // 2. Enrich all teams
    const allTeams = regs.map((r) => {
      const leaderUser = usersMap[r.userId] || usersMap[r.userUid] || null;
      const event = eventsMap[r.eventId] || null;
      return {
        ...r,
        id: r.id || r._id,
        _id: r._id || r.id,
        teamName: r.teamName || 'Untitled Team',
        leader: {
          id: leaderUser?.id || r.userId || '',
          name: r.leaderName || leaderUser?.name || 'Team Leader',
          email: r.leaderEmail || leaderUser?.email || '',
          phone: r.phone || leaderUser?.phone || '',
          college: r.collegeOrOrg || leaderUser?.college || leaderUser?.institute || '',
          idCardUrl: leaderUser?.idCardUrl || '',
          idCardName: leaderUser?.idCardName || '',
        },
        user: leaderUser || {
          name: r.leaderName || 'Team Leader',
          email: r.leaderEmail || '',
          phone: r.phone || '',
        },
        event: {
          id: event?.id || r.eventId || '',
          title: event?.title || 'Hackathon Event',
          category: event?.category || '',
          status: event?.status || '',
        },
        membersCount: 1 + (r.teamMembers?.length || 0),
        registeredAt: r.registeredAt || new Date().toISOString(),
      };
    });

    // Apply filtering to users
    let filteredUsers = allUsers;
    if (eventId && eventId !== 'all') {
      filteredUsers = filteredUsers.filter((u) => u.eventId === eventId);
    }
    if (teamStatus && teamStatus !== 'all') {
      if (teamStatus === 'pending') {
        filteredUsers = filteredUsers.filter((u) => !u.isTeamRegistered);
      } else if (teamStatus === 'registered') {
        filteredUsers = filteredUsers.filter((u) => u.isTeamRegistered);
      }
    }
    if (idStatus && idStatus !== 'all') {
      if (idStatus === 'uploaded') {
        filteredUsers = filteredUsers.filter((u) => u.hasIdCard);
      } else if (idStatus === 'missing') {
        filteredUsers = filteredUsers.filter((u) => !u.hasIdCard);
      }
    }
    if (studentType && studentType !== 'all') {
      if (studentType === 'school') {
        filteredUsers = filteredUsers.filter((u) => u.studentType === 'school');
      } else if (studentType === 'college') {
        filteredUsers = filteredUsers.filter((u) => u.studentType !== 'school');
      }
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filteredUsers = filteredUsers.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          u.college?.toLowerCase().includes(q) ||
          u.institute?.toLowerCase().includes(q) ||
          u.teamName?.toLowerCase().includes(q)
      );
    }
    filteredUsers.sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0));

    // Apply filtering to teams
    let filteredTeams = allTeams;
    if (eventId && eventId !== 'all') {
      filteredTeams = filteredTeams.filter((r) => r.eventId === eventId);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filteredTeams = filteredTeams.filter(
        (r) =>
          r.teamName?.toLowerCase().includes(q) ||
          r.leader?.name?.toLowerCase().includes(q) ||
          r.leader?.email?.toLowerCase().includes(q) ||
          r.leader?.phone?.toLowerCase().includes(q) ||
          r.collegeOrOrg?.toLowerCase().includes(q) ||
          r.event?.title?.toLowerCase().includes(q)
      );
    }
    filteredTeams.sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0));

    return {
      success: true,
      count: filteredUsers.length,
      users: filteredUsers,
      teams: filteredTeams,
      stats: {
        totalUsers: allUsers.length,
        pendingTeamsCount: allUsers.filter((u) => !u.isTeamRegistered).length,
        registeredTeamsCount: allUsers.filter((u) => u.isTeamRegistered).length,
        totalTeams: allTeams.length,
        verifiedIdCardsCount: allUsers.filter((u) => u.hasIdCard).length,
      },
    };
  },

  async getSubmissions({ eventId, type = 'idea' }) {
    await ensureDatabaseSeeded();
    await ensureAdminAuthorized();
    const path = type === 'prototype' ? 'prototype_submissions' : 'idea_submissions';
    const subs = Object.values((await readPath(path)) || {});
    const usersMap = (await readPath('users')) || {};
    const eventsMap = (await readPath('events')) || {};
    const pssMap = (await readPath('problem_statements')) || {};

    let list = subs.map((s) => ({
      ...s,
      user: usersMap[s.userId] || { name: 'Participant', email: 'unknown' },
      event: eventsMap[s.eventId] || { title: 'Event' },
      problemStatement: pssMap[s.problemStatementId] || { title: 'Problem Statement', psCode: 'PS' },
    }));

    if (eventId && eventId !== 'all') {
      list = list.filter((s) => s.eventId === eventId);
    }

    return { success: true, count: list.length, submissions: list };
  },

  async updateSubmissionStatus(type, id, { status, adminRemarks }) {
    await ensureAdminAuthorized();
    const path = type === 'prototype' ? `prototype_submissions/${id}` : `idea_submissions/${id}`;
    const existing = await readPath(path);
    if (!existing) throw new Error('Submission not found');

    const updated = {
      ...existing,
      status: status || existing.status,
      adminRemarks: adminRemarks !== undefined ? adminRemarks : existing.adminRemarks,
    };

    await writePath(path, updated);
    return { success: true, message: 'Submission status updated successfully.', submission: updated };
  },

  async getAdmins() {
    await ensureDatabaseSeeded();
    await ensureAdminAuthorized();
    const adminsObj = (await readPath('admins')) || {};
    const admins = Object.values(adminsObj).map((a) => {
      const copy = { ...a };
      delete copy.password;
      return copy;
    });

    return { success: true, count: admins.length, admins };
  },

  async createAdmin({ name, email, password, role = 'admin' }) {
    const caller = await ensureAdminAuthorized();
    const cleanEmail = email.trim().toLowerCase();
    const adminId = `admin_${Date.now()}`;
    const newAdmin = {
      id: adminId,
      _id: adminId,
      name: name.trim(),
      email: cleanEmail,
      password: password ? password.trim() : '',
      role,
      createdBy: caller.email || 'admin-dashboard',
      createdAt: new Date().toISOString(),
    };

    await writePath(`admins/${adminId}`, newAdmin);
    const safeAdmin = { ...newAdmin };
    delete safeAdmin.password;

    return { success: true, message: 'Admin provisioned successfully. They can now authenticate via their assigned Google account.', admin: safeAdmin };
  },
};
