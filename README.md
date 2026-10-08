# Hackways — Event & Innovation Platform

A full-stack web application designed for Hackways event management, participant registrations, timed problem statement releases, idea proposals, and prototype submissions with an admin control dashboard.

---

## 🎨 Design Theme & Palette

The platform features an aesthetic, clean, and accessible UI crafted with custom tokens:

| Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Primary** | `#1F4D3A` | Dark Forest Green — Navbar, primary buttons, headings, footer |
| **Background** | `#F8EBE1` | Soft Cream — Main page & container backgrounds |
| **Secondary** | `#F9D5BA` | Light Peach — Cards, highlight sections, hover accents |
| **Accent** | `#653220` | Deep Brown — Secondary actions, links, borders, subtle badges |
| **Text Primary** | `#241812` / `#FFFFFF` | Near-black/Dark Brown on cream; White on Forest Green |

---

## 🚀 Features

### 1. Public Landing Page
- **Hero & Mission Section**: Organization highlights, tagline, and call to action.
- **Platform Metrics**: Total events organized, active participants, and upcoming event spotlight.
- **Navigation & Footer**: Responsive top navbar with quick access links and informative footer.

### 2. Authentication & Authorization
- **Passwordless User Login / Sign Up**: Email verification via 6-digit Time-based OTP (5-minute expiry, rate-limited, resend option).
- **Admin Authentication**: Dedicated `/admin/login` portal for authorized administrator accounts with secure credentials.
- **Role-Based Protection**: JWT-based session tokens with role validation middleware on both frontend and backend.

### 3. Events & Participant Hub
- **Browse Events**: Filterable tabs for **Upcoming Events**, **Ongoing Events**, and **Past Events**.
- **Event Detail View**: Complete event schedule, rules, guidelines, venue/mode info, and one-click registration.
- **My Registrations**: Direct dashboard for participants to manage and access registered events.

### 4. Problem Statement & Two-Stage Submission System
- **Timed Problem Statement Release**:
  - Countdown timer displayed prior to the release window.
  - Problem statements unlock automatically when `psReleaseTime` passes or when manually released by admin.
- **Stage 1: Idea Proposal Submission**:
  - Participants choose one problem statement.
  - Submit title, executive summary/description, and supporting links/documents.
- **Stage 2: Prototype Submission**:
  - Opens strictly within `prototypeOpenTime` to `prototypeCloseTime`.
  - Supports live demo URL, GitHub repository links, Drive links, and uploaded files.
  - Automatic backend lock upon deadline expiry.
- **Visual Status Badges**: Clear badges for *Not Opened*, *Open*, *Closed*, and *Submitted*.

### 5. Admin Command Center
- **Executive Dashboard**: Real-time stats (Total Users, Events, Registrations, Submissions) and quick activity overview.
- **Event Management**: Create, update, toggle registration status, upload banners, and delete events.
- **Participant Directory**: Searchable, filterable list of registered participants with one-click **CSV/Excel Export**.
- **Problem Statement Manager**: Add and manage categorized challenges and attachments per event.
- **Schedule & Override Controls**: Set release times and submission windows with real-time server-side enforcement and manual override toggles.
- **Submission Evaluation**: Filter submissions by event/PS, inspect submitted code/documents, change review statuses (*Under Review*, *Shortlisted*, *Rejected*), and leave evaluation notes.
- **Admin Management**: Securely invite and provision co-administrator accounts.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router DOM, Lucide Icons, Axios.
- **Backend**: Node.js, Express REST API, JSON Web Tokens (JWT), Bcrypt.js, Multer (file uploads).
- **Database**: PostgreSQL (`pg` pool connection).
- **Mailing Service**: Nodemailer (SMTP configurable with development console fallback).

---

## 📁 Project Structure

```
Organization/
├── client/                     # React Frontend (Vite + Tailwind CSS)
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Images, logos, static assets
│   │   ├── components/         # Reusable UI (Navbar, Footer, Modal, Toast, Cards)
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── pages/              # Landing, Login, Events, EventDetail, Submissions
│   │   │   └── admin/          # Admin Dashboard, Manage Events, Users, Submissions
│   │   ├── services/           # API clients and endpoints
│   │   ├── types/              # TypeScript / JSDoc definitions
│   │   ├── App.jsx             # Route definitions & guards
│   │   ├── index.css           # Custom theme tokens & Tailwind config
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Express REST API Backend
│   ├── config/                 # DB connection & Nodemailer configuration
│   ├── controllers/            # Auth, Event, PS, Submission, Admin controllers
│   ├── middleware/             # Auth JWT, Role verification, Upload, Rate limit
│   ├── models/                 # User, Admin, Event, Registration, Submission, OTP
│   ├── routes/                 # Express API route handlers
│   ├── scripts/                # Database seed scripts
│   ├── uploads/                # Local uploaded files storage
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── README.md
└── package.json                # Root concurrently/dev runner scripts
```

---

## ⚙️ Environment Variables

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection
MONGODB_URI=mongodb://127.0.0.1:27017/org_portal

# JWT Secrets
JWT_SECRET=super_secret_jwt_key_org_2026_change_in_production
JWT_EXPIRES_IN=7d

# Super Admin Email
INITIAL_ADMIN_EMAIL=discountbuddyshubham@gmail.com
INITIAL_ADMIN_NAME=Shubham (Super Admin)

# Nodemailer / SMTP Config (Leave blank to use Dev Console OTP logger)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Organization Team <no-reply@organization.org>"
```

### Client (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🏁 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance, Atlas URI, or embedded MongoDB memory server)

### 1. Clone & Install Dependencies

You can install all dependencies from the root directory:

```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

Or install separately:
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure Environment Files
```bash
# In server directory
cp .env.example .env

# In client directory
cp .env.example .env
```

### 3. Seed the Database
Populates initial admin account, sample events, problem statements, and schedules:
```bash
cd server
npm run seed
```

*Administrator Authentication:*
- Administrator login is strictly guarded by **Firebase Authentication (Google Sign-In)**.
- Only assigned administrator Gmail accounts (`discountbuddyshubham@gmail.com`, `sureshcitabu@gmail.com`, `tmgmayankff@gmail.com`, and provisioned coordinators) are granted access. All unauthorized logins are rejected.

### 4. Run the Development Servers
From the root directory:
```bash
npm run dev
```

This starts both:
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

---

## 🔒 Security & Best Practices
- **Strict Role-Based Middleware**: Sensitive endpoints (`/api/admin/*`) require verified admin JWT tokens.
- **Server-Enforced Scheduling**: Problem statements and prototype submissions are validated against server timestamp rules.
- **Sanitized Uploads**: Controlled file extensions, mime-types, and size limits on all attachment uploads.
- **Rate-Limiting**: OTP generation and authentication endpoints protected against brute force attempts.
