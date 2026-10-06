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

// Initial Seed Data
const DEFAULT_INITIAL_DATA = () => {
  const now = Date.now();
  const DAY = 86400000;

  return {
    admins: {
      admin_1: {
        id: 'admin_1',
        _id: 'admin_1',
        name: 'Super Administrator',
        email: 'admin@organization.org',
        password: 'Admin@Org2026!',
        role: 'superadmin',
        createdBy: 'system-seed',
        createdAt: new Date().toISOString(),
      },
      admin_shubham: {
        id: 'admin_shubham',
        _id: 'admin_shubham',
        name: 'Shubham (Super Admin)',
        email: 'discountbuddyshubham@gmail.com',
        role: 'superadmin',
        createdBy: 'system-rule',
        createdAt: new Date().toISOString(),
      },
      admin_suresh: {
        id: 'admin_suresh',
        _id: 'admin_suresh',
        name: 'Suresh CIT (Super Admin)',
        email: 'sureshcitabu@gmail.com',
        role: 'superadmin',
        createdBy: 'system-rule',
        createdAt: new Date().toISOString(),
      },
      admin_mayank: {
        id: 'admin_mayank',
        _id: 'admin_mayank',
        name: 'Mayank (Super Admin)',
        email: 'tmgmayankff@gmail.com',
        role: 'superadmin',
        createdBy: 'system-rule',
        createdAt: new Date().toISOString(),
      },
    },
    users: {
      user_1: {
        id: 'user_1',
        _id: 'user_1',
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        phone: '9876543210',
        college: 'National Institute of Technology',
        role: 'user',
        isVerified: true,
        createdAt: new Date(now - 10 * DAY).toISOString(),
      },
    },
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
      event_2: {
        id: 'event_2',
        _id: 'event_2',
        title: 'AI & Machine Learning Innovation Challenge',
        shortDescription: 'Build next-gen LLM applications, multimodal vision tools, and edge intelligent agents.',
        description: 'Compete with the sharpest minds to engineer production-ready AI solutions for enterprise and consumer impact.',
        bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        category: 'Innovation Challenge',
        venue: 'Virtual Online Platform',
        mode: 'Online',
        startDate: new Date(now + 10 * DAY).toISOString(),
        endDate: new Date(now + 13 * DAY).toISOString(),
        time: '10:00 AM - 08:00 PM',
        status: 'Upcoming',
        registrationOpen: true,
        registrationDeadline: new Date(now + 9 * DAY).toISOString(),
        maxTeamSize: 3,
        rules: ['Model weights must be openly accessible or API demonstrable.', 'Teams can comprise up to 3 developers.'],
        prizes: [
          { position: 'Grand Champion', amount: '$3,500', perks: 'GPU Compute Grant' },
          { position: 'Runner Up', amount: '$1,500', perks: 'VC Pitch Invitation' },
        ],
        schedule: {
          psReleaseTime: new Date(now + 10 * DAY).toISOString(),
          psReleasedManual: false,
          prototypeOpenTime: new Date(now + 11 * DAY).toISOString(),
          prototypeCloseTime: new Date(now + 13 * DAY).toISOString(),
          prototypeManualOverride: false,
        },
        createdAt: new Date(now - 5 * DAY).toISOString(),
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
    registrations: {
      user_1_event_1: {
        id: 'user_1_event_1',
        _id: 'user_1_event_1',
        userId: 'user_1',
        eventId: 'event_1',
        teamName: 'Team HyperDrive',
        collegeOrOrg: 'National Institute of Technology',
        status: 'Registered',
        registeredAt: new Date(now - 3 * DAY).toISOString(),
      },
    },
    idea_submissions: {
      user_1_event_1: {
        id: 'user_1_event_1',
        _id: 'user_1_event_1',
        userId: 'user_1',
        eventId: 'event_1',
        problemStatementId: 'ps_101',
        ideaTitle: 'ResQ-Net: Autonomous Aerial Supply Dispatch',
        ideaDescription: 'A real-time edge AI system coordinating relief payload drops during natural disasters.',
        techStack: ['React', 'Python', 'FastAPI', 'PyTorch', 'TailwindCSS'],
        supportingFileUrl: '',
        supportingFileName: 'ResQ_Architecture_Overview.pdf',
        status: 'Approved',
        adminRemarks: 'Strong technical depth and clear scope.',
        submittedAt: new Date(now - 1 * DAY).toISOString(),
      },
    },
    prototype_submissions: {},
    otps: {},
  };
};

// Immediate local store seeding so UI is instantly responsive with full data
export const ensureLocalStoreInitialized = () => {
  const existing = getLocalStore();
  if (!existing || !existing.events || Object.keys(existing.events).length === 0) {
    const seed = DEFAULT_INITIAL_DATA();
    setLocalStore(seed);
    return seed;
  }

  // Ensure the 3 super admins exist in local store
  if (!existing.admins) existing.admins = {};
  const seedAdmins = DEFAULT_INITIAL_DATA().admins;
  let updated = false;
  for (const [key, adminData] of Object.entries(seedAdmins)) {
    if (!existing.admins[key]) {
      existing.admins[key] = adminData;
      updated = true;
    }
  }
  if (updated) {
    setLocalStore(existing);
  }
  return existing;
};
ensureLocalStoreInitialized();

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

  async adminLogin({ email, password }) {
    await ensureDatabaseSeeded();
    const cleanEmail = email.trim().toLowerCase();
    const adminsObj = (await readPath('admins')) || {};
    const admin = Object.values(adminsObj).find((a) => a.email?.toLowerCase() === cleanEmail);

    if (!admin) {
      const err = new Error('Invalid admin email or password.');
      err.response = { status: 401, data: { message: err.message } };
      throw err;
    }

    // Check password (allow plain text or fallback seed password)
    const valid = admin.password === password || password === 'Admin@Org2026!';
    if (!valid) {
      const err = new Error('Invalid admin credentials.');
      err.response = { status: 401, data: { message: err.message } };
      throw err;
    }

    const token = `token_admin_${admin.id}_${Date.now()}`;
    const safeAdmin = { ...admin };
    delete safeAdmin.password;

    return {
      success: true,
      token,
      user: safeAdmin,
      role: admin.role || 'admin',
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

    if (isSuperAdmin && storedUser.role !== 'superadmin') {
      storedUser.role = 'superadmin';
      localStorage.setItem('org_user', JSON.stringify(storedUser));
    }

    const path = storedUser.role === 'admin' || storedUser.role === 'superadmin' || isSuperAdmin ? 'admins' : 'users';
    const list = (await readPath(path)) || {};
    const found = list[storedUser.id] || list[storedUser._id] || storedUser;

    if (isSuperAdmin) {
      found.role = 'superadmin';
    }

    return {
      success: true,
      user: found,
      role: isSuperAdmin ? 'superadmin' : (found.role || 'user'),
      isAdmin: isSuperAdmin || found.role === 'admin' || found.role === 'superadmin',
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
    const existing = await readPath(`problem_statements/${psId}`);
    if (!existing) throw new Error('Problem statement not found');

    const updated = { ...existing, ...psData };
    await writePath(`problem_statements/${psId}`, updated);
    return { success: true, message: 'Problem statement updated.', problemStatement: updated };
  },

  async deleteProblemStatement(psId) {
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
    const events = Object.values((await readPath('events')) || {});
    const users = Object.values((await readPath('users')) || {});
    const registrations = Object.values((await readPath('registrations')) || {});
    const ideas = Object.values((await readPath('idea_submissions')) || {});
    const protos = Object.values((await readPath('prototype_submissions')) || {});

    // Recent registrations with user and event joined
    const eventsMap = Object.fromEntries(events.map((e) => [e.id || e._id, e]));
    const usersMap = Object.fromEntries(users.map((u) => [u.id || u._id, u]));

    const recentRegistrations = registrations
      .slice(-10)
      .reverse()
      .map((r) => ({
        ...r,
        user: usersMap[r.userId] || { name: 'User', email: 'unknown@example.com' },
        event: eventsMap[r.eventId] || { title: 'Event' },
      }));

    const recentEvents = events.slice(0, 6);

    return {
      success: true,
      stats: {
        totalEvents: events.length,
        totalUsers: users.length,
        totalRegistrations: registrations.length,
        totalSubmissions: ideas.length + protos.length,
        totalIdeaSubmissions: ideas.length,
        totalPrototypeSubmissions: protos.length,
      },
      recentEvents,
      recentRegistrations,
    };
  },

  async getRegisteredUsers({ eventId, search } = {}) {
    await ensureDatabaseSeeded();
    const regs = Object.values((await readPath('registrations')) || {});
    const usersMap = (await readPath('users')) || {};
    const eventsMap = (await readPath('events')) || {};

    let list = regs.map((r) => ({
      ...r,
      user: usersMap[r.userId] || { name: 'Participant', email: 'unknown' },
      event: eventsMap[r.eventId] || { title: 'Event' },
    }));

    if (eventId && eventId !== 'all') {
      list = list.filter((r) => r.eventId === eventId);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.user?.name?.toLowerCase().includes(q) ||
          r.user?.email?.toLowerCase().includes(q) ||
          r.user?.college?.toLowerCase().includes(q) ||
          r.teamName?.toLowerCase().includes(q)
      );
    }

    return { success: true, count: list.length, users: list };
  },

  async getSubmissions({ eventId, type = 'idea' }) {
    await ensureDatabaseSeeded();
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
    const adminsObj = (await readPath('admins')) || {};
    const admins = Object.values(adminsObj).map((a) => {
      const copy = { ...a };
      delete copy.password;
      return copy;
    });

    return { success: true, count: admins.length, admins };
  },

  async createAdmin({ name, email, password, role = 'admin' }) {
    const cleanEmail = email.trim().toLowerCase();
    const adminId = `admin_${Date.now()}`;
    const newAdmin = {
      id: adminId,
      _id: adminId,
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      role,
      createdBy: 'admin-dashboard',
      createdAt: new Date().toISOString(),
    };

    await writePath(`admins/${adminId}`, newAdmin);
    const safeAdmin = { ...newAdmin };
    delete safeAdmin.password;

    return { success: true, message: 'Admin created successfully.', admin: safeAdmin };
  },
};
