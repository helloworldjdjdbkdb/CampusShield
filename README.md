# CampusShield 🛡️
> **Tagline:** Your Identity Protected. Your Campus Safer.  
> **Mission:** Privacy-First Campus Cyberbullying & Fake-Profile Reporting System

CampusShield is a full-stack digital safety platform engineered for colleges and universities. It allows students to report fake profiles, online impersonation, cyberbullying, doxxing, harassment, and threats with **zero-knowledge anonymity** and track their case resolution without creating an account or revealing their identity.

---

## 🌟 Key Capabilities

1. **Zero-Identity Anonymous Reporting**:
   - Students can file reports without submitting names, student IDs, phone numbers, or email addresses.
   - Generates non-sequential, cryptographically secure **Case IDs** (e.g., `CS-2026-F9K2A1`) and high-entropy **Tracking Secrets** (e.g., `cs_sec_...`).
   - Plaintext tracking secrets are displayed **only once** to the student at creation time. The server securely stores only a salted hash (BCrypt).
   - University staff and system administrators cannot view or reverse the tracking secret.

2. **Authenticated Case Tracking & Anonymous Follow-Up**:
   - Students track real-time investigation progress using only their Case ID and Tracking Secret.
   - Two-way communication channel: Students can reply to officer inquiries and submit supplemental leads while remaining completely anonymous.
   - **Strict Privacy Guarantee:** Internal staff notes, staff passwords, and sensitive system telemetry are completely isolated and **never** returned by student tracking endpoints.

3. **Role-Based Staff Incident Command**:
   - **Campus Safety Officer**: Triage allegations, assign priority (LOW, MEDIUM, HIGH, CRITICAL), update statuses, broadcast public timeline updates to students, upload/download private evidence, and record confidential investigative notes.
   - **System Administrator**: Manage staff user accounts, toggle officer access, and review the immutable system-wide security audit trail.

4. **Private Evidence Locker**:
   - File attachment support for screenshots, chat logs, and PDFs (PNG, JPG, WEBP, GIF, PDF, TXT) with 10MB limits.
   - Stored with randomized UUIDs in an isolated directory outside public web roots.
   - Evidence download requires authorized staff session.

5. **AI / Rule-Based Triage Assistant**:
   - Clearly labeled: *"Demo Classification — Not AI Verified"*.
   - Evaluates incident descriptions for high-risk threat indicators, suggests category classifications, flags emergency urgency, correlates recent platform reports, and provides an actionable duty officer protocol checklist.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Vite |
| **Backend** | Node.js (v24), Express.js, TypeScript (tsx), Helmet, CORS, Cookie-Parser, Multer |
| **Database** | SQLite via Prisma ORM (configurable to PostgreSQL via `.env DATABASE_URL`) |
| **Security** | BCrypt password & token hashing, JWT HTTP-only cookies, Express Rate Limiters |
| **Testing** | Node.js Native Test Runner (`node:test`, `node:assert`), Supertest |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Node.js 18+ (tested on v24.21.0)
- npm 9+

### 2. Install Dependencies
```bash
# In project root:
npm install

# In server directory:
cd server
npm install

# In client directory:
cd ../client
npm install
```

### 3. Database Migration & Seed
The database comes pre-configured with Prisma ORM and SQLite (`file:./dev.db`).
```bash
# Push schema and generate Prisma client
cd server
npx prisma db push
npx prisma generate

# Seed sample staff accounts and hackathon test cases
npx tsx prisma/seed.ts
```

### 4. Running the Development Server
From the root directory, launch both backend and frontend concurrently:
```bash
npm run dev
```
- **Frontend Web App:** [http://localhost:3000](http://localhost:3000)
- **Backend API Server:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Hackathon Demo Credentials

### Staff Accounts (Staff Portal Login)
| Role | Email | Password |
|---|---|---|
| **Campus Safety Officer** | `officer.sarah@campusshield.edu` | `OfficerPass123!` |
| **Campus Safety Officer** | `officer.marcus@campusshield.edu` | `OfficerPass123!` |
| **System Administrator** | `admin@campusshield.edu` | `AdminPass123!` |

*(The login page includes convenient one-click demo login buttons for judges)*

### Pre-Seeded Tracking Cases ("Track My Case")
| Scenario | Case ID | Tracking Secret | Status |
|---|---|---|---|
| **Instagram Cloned Profile** | `CS-2026-F9K2A1` | `cs_sec_demo1234567890abcdef12345678` | Action in Progress |
| **Action Needed / TikTok Impersonation** | `CS-2026-X1L8Q4` | `cs_sec_freshman987654321fedcba98765` | Additional Info Needed |
| **Urgent Threat / Discord Harassment** | `CS-2026-C7P3W2` | `cs_sec_threat8888888888888888888888` | Referred to Authority |

---

## 🧪 Automated Testing

Execute the comprehensive 12-test integration suite verifying all 15 core scenarios:
```bash
npm test
```
**Test Scenarios Verified:**
1. Valid anonymous report is accepted and assigned non-sequential ID and tracking secret.
2. Invalid report rejected with validation error details.
3. Secret tracking credentials properly hashed before persistence.
4. Correct tracking credentials retrieve permitted public case details.
5. **Privacy check:** Internal staff notes and token hashes are **never** returned to reporters.
6. Incorrect credentials return generic authentication failure without revealing case existence.
7. Unauthenticated requests to staff endpoints rejected (HTTP 401).
8. Role-based authorization enforced (Safety Officer blocked from Admin Console with HTTP 403).
9. System Administrator can access user management and audit logs.
10. Staff can update case status with reason and status transition logging.
11. Reporter tracking timeline immediately reflects authorized updates.
12. Private evidence files cannot be downloaded without staff authorization.
13. Live dashboard metrics match actual database records.
14. Anonymous follow-up responses submitted by students appear in officer investigation workspace.

---

## 🔒 Privacy & Cybersecurity Specifications

1. **Anonymity Architecture**:
   - Zero-Identity: No cookies or tracking tags track student identity.
   - Non-Sequential IDs: Prevents ID enumeration attacks (e.g. `CS-2026-F9K2A1` instead of `1`, `2`, `3`).
   - Salted Hashing: Tracking secrets are hashed with 10 salt rounds of BCrypt.
2. **Rate Limiting**:
   - Report submission: 15 per 15 minutes per IP.
   - Tracking credential validation: 15 per 15 minutes per IP (thwarts brute-force guessing).
   - Staff login: 10 per 15 minutes per IP.
3. **Data Minimization & Evidence Security**:
   - Files are stored with randomized UUID filenames outside web root.
   - Prohibits executable scripts (`.exe`, `.sh`, `.bat`, `.js`).
   - Secure download handler sets forced attachment headers.
4. **Institutional Due Process**:
   - Submissions are cataloged as allegations requiring review.
   - CampusShield explicitly disclaims vigilante public doxxing or retaliation.

---

## 📂 Project Structure
```
├── package.json               # Root scripts (concurrent dev, test, build)
├── server/                    # Node.js Express & Prisma Backend
│   ├── prisma/
│   │   ├── schema.prisma      # Full relational schema (Case, StatusHistory, etc.)
│   │   ├── seed.ts            # Seed script with realistic cases & officers
│   │   └── dev.db             # Local SQLite database file
│   ├── src/
│   │   ├── app.ts             # Express app with Helmet, CORS, and routing
│   │   ├── server.ts          # Server entry point (port 5000)
│   │   ├── db.ts              # PrismaClient singleton
│   │   ├── middleware/        # Auth, rate-limiting, private upload middleware
│   │   ├── routes/            # Reports, Auth, Cases, Admin, AI Triage
│   │   └── utils/crypto.ts    # Secure Case ID & secret hashing utilities
│   └── test/
│       └── api.test.ts        # Comprehensive 12-test scenario suite
└── client/                    # Vite + React 19 + TypeScript + Tailwind CSS
    ├── src/
    │   ├── App.tsx            # Main application layout and navigation
    │   ├── api.ts             # Typed API client
    │   ├── types.ts           # Shared TypeScript interfaces
    │   ├── context/           # AuthContext (Officer & Admin sessions)
    │   ├── components/        # Navbar, Footer, PrivacyNoticeModal
    │   └── pages/             # Landing, SafetyHub, Report, Confirm, Track,
    │                          # StaffLogin, Dashboard, CaseWorkspace, AdminConsole
```
