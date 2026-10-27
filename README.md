# 🎓 CampusSphere — Academic Management System

A modern, secure, and responsive **CampusSphere** web application built with HTML5, CSS3, JavaScript, Node.js, Express 5, and MongoDB / Mongoose 9. CampusSphere provides complete role-based institutional management for students, faculty, and administrators with persistent database storage, real-time push notifications, and analytics.

---

## 📁 Repository Structure

```text
CampusSphere/
├── public/                         # Dedicated web root for static client assets
│   ├── js/
│   │   └── utils.js                # Core pure utility library (sanitization, validation, formatting)
│   ├── index.html                  # Single Page Application (SPA) entry interface
│   ├── admin-courses-syllabus.html # Syllabus management interface
│   ├── courses.html                # Course catalogue interface
│   ├── about.html                  # About CampusSphere interface
│   ├── script.js                   # Client frontend SPA controller & state management
│   ├── style.css                   # Clean, high-contrast light theme design stylesheet
│   ├── animated-background.js      # Interactive background canvas rendering
│   ├── service-worker.js           # Progressive Web App service worker (safe static asset caching)
│   ├── manifest.json               # Web App Manifest with 192x192 & 512x512 icons
│   ├── icon-192x192.png            # Standard PWA application icon (192x192)
│   ├── icon-512x512.png            # High-resolution PWA application icon (512x512)
│   ├── CampusSphere-logo.png       # Institutional branding logo
│   └── favicon.ico                 # Browser shortcut favicon
├── models/                         # Mongoose 9 database schemas and models
│   ├── AcademicStore.js            # Consolidated academic data store model (with __v optimistic concurrency)
│   ├── User.js                     # User accounts model with tokenVersion, usernameLower, and scrypt hashing
│   ├── Timetable.js                # Master class schedule and timetable model
│   ├── Notice.js                   # Institutional announcements schema
│   ├── Attendance.js               # Attendance logs schema
│   ├── Mark.js                     # Examination marks schema
│   ├── Assignment.js               # Academic assignments schema
│   └── Note.js                     # Study notes schema
├── services/                       # Backend domain services
│   ├── fileSyncService.js          # File synchronization and sanitized data dump service
│   └── pushNotificationService.js  # Web Push notification dispatcher (VAPID)
├── scripts/                        # Database migration, verification, and automated test suites
│   ├── list-admins.js              # Read-only administrative account inventory utility
│   ├── migrate-usernamelower.js    # Username normalization migration script
│   ├── test-production-auth-config.js      # Auth config, startup guards, and secret verification
│   ├── test-sensitive-data-audit.js        # Sensitive file and credential exposure audit
│   ├── test-xss-security.js                # DOM sanitization and stored XSS prevention tests
│   ├── test-phase1a-regression.js          # Phase 1A regression verification
│   ├── test-phase1b-deletion.js            # Phase 1B student deletion and MongoDB consistency tests
│   ├── test-academic-security.js           # Academic isolation and RBAC test suite
│   ├── test-api-hardening.js               # Rate limiting, CORS, headers & request bounds test suite
│   ├── test-mongodb-integrity.js           # Schemas, uniqueness, and compound index tests
│   ├── test-user-api-security.js           # User API IDOR, field allowlist & migration tests
│   ├── test-sync-safety.js                 # Idempotent sync and queue serialization tests
│   └── ...                                 # Comprehensive mobile, UX, and accessibility test suites
├── uploads/                        # Persistent storage directory for syllabus PDFs and attachments
├── server.js                       # Express.js 5 backend application and security middleware
├── package.json                    # Node.js project manifest, dependencies, and npm scripts
├── package-lock.json               # Locked dependency tree
├── .env.example                    # Environment variable configuration template
├── .gitignore                      # Git exclusion rules (secrets, operational data, logs, uploads)
├── Start_CampusSphere.bat          # 1-Click Local Launcher (starts server + opens browser)
├── Stop_CampusSphere.bat           # 1-Click Stopper (terminates backend on port 3000)
└── README.md                       # Project documentation and operational guide
```

---

## 🎨 Design & UI Architecture

CampusSphere features an **enforced light theme design**:
- **Palette**: Clean slate (`#f8fafc`) and pure white (`#ffffff`) background layers, paired with deep slate text (`#0f172a` / `#334155`) for WCAG AAA contrast compliance.
- **Accents**: Modern indigo (`#4f46e5`) primary branding, emerald (`#10b981`) success indicators, and amber/rose contextual badges.
- **Components**: Polished border radiuses, soft elevation shadows, crisp data tables, and responsive cards engineered for stability across all viewport resolutions.
- **Accessibility**: Explicit hover states, keyboard navigation focus rings, screen-reader accessible ARIA attributes, and zero layout shift on interactive controls.

---

## ✨ Features

- **🔐 Role-Based Access Control (RBAC):** Dedicated, secure views for **Student**, **Faculty**, and **Administrator** accounts.
- **🛡️ Enterprise-Grade Authentication:**
  - Password hashing via Node.js native `crypto.scrypt` with timing-safe equality checks.
  - Signed HMAC SHA-256 session tokens with sliding expiration (12-hour validity, refreshed via `X-Refreshed-Token`).
  - Active token revocation via database-backed `tokenVersion` (invalidates sessions on password change, admin reset, or explicit logout).
  - Per-account brute-force throttling with exponential backoff on consecutive failed logins.
- **🍃 MongoDB & Mongoose 9 Persistence:** Scalable database schemas with optimistic concurrency control (`__v`) and automated session transactions.
- **📊 Academic Management & Analytics:**
  - **Student**: Profile details, subject-wise attendance tracking, marks breakdown, downloadable assignments, and Chart.js performance metrics.
  - **Faculty**: Daily attendance recording, batch examination marks entry, assignment publishing, student interaction, and profile customization.
  - **Admin**: Student, faculty, and administrator account provisioning, semester-wise subjects configuration, timetable management, and system health status.
- **🔔 Web Push Notifications:** Real system-level browser and mobile push alerts powered by standard VAPID Web Push protocols.
- **📱 Progressive Web App (PWA):** Service worker static asset caching, offline resiliency, manifest metadata, and responsive mobile layout.

---

## ⚙️ Environment Variables

Configure application settings by copying `.env.example` to `.env`:

| Variable | Required? | Default | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Optional | `development` | Environment mode (`development`, `production`, or `test`). In production, strict security validations are enforced. |
| `PORT` | Optional | `3000` | Port on which the Express server listens. |
| `SESSION_SECRET` | **Required (Prod)** | Random (Dev) | Cryptographic signing key (min 32 characters). In production, startup fails if unset, weak, or matching known placeholders. |
| `MONGODB_URI` | **Required** | `mongodb://127.0.0.1:27017/CampusSphere` | MongoDB connection URI (supports local instances and MongoDB Atlas clusters). |
| `CORS_ORIGINS` | Optional | Localhost | Comma-separated list of allowed origins. Wildcard `*` and `null` origins are strictly prohibited when credentials are enabled. |
| `TRUST_PROXY` | Optional | `0` | Number of upstream reverse proxy hops to trust (set to `1` when deployed behind Nginx, Cloudflare, or AWS ALB). |
| `UPLOAD_DIR` | Optional | `./uploads` | Directory for uploaded syllabus PDFs and attachments. In production, map this to a persistent volume. |
| `VAPID_PUBLIC_KEY` | Optional | Generated | VAPID public key for web push notification subscriptions. |
| `VAPID_PRIVATE_KEY` | Optional | Generated | VAPID private key for authenticating web push payloads. |
| `VAPID_SUBJECT` | Optional | `mailto:admin@campussphere.edu` | Contact URI included in VAPID push payloads. |
| `ADMIN_BOOTSTRAP_PASSWORD` | Optional | *(None)* | Initial password (min 12 characters) for one-time admin account provisioning on fresh databases. Unset after initialization. |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) `>= 20.19.0` (required for Mongoose 9 and native crypto support).
- [MongoDB](https://www.mongodb.com/) (running locally on port 27017 or a MongoDB Atlas URI).

### 2. Installation
Clone the repository and install dependencies:
```powershell
npm install
```

### 3. Environment Setup
Create a `.env` file from the provided template:
```powershell
cp .env.example .env
```
*(In local development, if `SESSION_SECRET` is omitted, the server will automatically generate an ephemeral random secret on launch).*

### 4. Running the Application
- **Terminal**:
  ```powershell
  npm start
  ```
  *(Or use `npm run dev` to automatically reload on file modifications).*
- **1-Click Batch Launcher (Windows)**:
  - Double-click `Start_CampusSphere.bat` to launch the server and automatically open the application in your default browser.
  - Double-click `Stop_CampusSphere.bat` to safely terminate the running backend server process.

---

## 🧪 Test Suites & Verification

CampusSphere includes comprehensive automated unit, security, and integration test suites:

### Running Fast Unit & Security Tests
To execute all offline static, auth config, and security tests without database dependencies:
```powershell
npm test
```
*(Or `npm run test:unit`)*

### Specific Test Commands
| Command | Description |
| :--- | :--- |
| `npm run test:auth-config` | Verifies production secret guards, placeholder rejection, and admin bootstrap rules. |
| `npm run test:sensitive-audit` | Audits repository files to ensure no credentials, tokens, or hashes are exposed. |
| `npm run test:xss` | Tests DOM sanitization, attribute escaping, and stored XSS defenses. |
| `npm run test:phase1a` | Verifies Phase 1A assignment isolation and syllabus token validation. |
| `npm run test:phase1b` | Verifies Phase 1B safe student account deletion and multi-collection consistency. |
| `npm run test:syllabus` | Verifies course syllabus upload, download, and path traversal defenses. |
| `npm run test:divisions` | Tests semester-wise division synchronization and data consistency. |
| `npm run test:file-sync` | Validates safe atomic writes and temporary file cleanup. |
| `npm run test:login-ratelimit` | Validates exponential backoff and IP-based rate limiting on login attempts. |
| `npm run test:light-mode` | Enforces light theme stylesheet constraints across all components. |
| `npm run test:all` | Executes the complete regression and end-to-end integration test suite. |

---

## 🔑 Starter Demo Accounts (Development Mode Only)

In local development environments where `NODE_ENV === "development"`, when connecting to a completely empty database, the server automatically provisions a temporary development administrator account:

| Role | Username | Default Password | Environment |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin@123` | Development Mode Only |

> [!WARNING]
> Default administrator accounts and automatic demo seeding are **strictly disabled in production** (`NODE_ENV=production` or whenever `NODE_ENV` is unset). For production deployments, configure `SESSION_SECRET` (minimum 32 characters) and use `ADMIN_BOOTSTRAP_PASSWORD` for one-time initialization on empty databases.

---

## 🛡️ Security Architecture & Practices

1. **Content Security Policy (CSP)**:
   - Configured via strict HTTP response headers: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none';`
   - Notice: **Zero external script CDNs and zero 'unsafe-inline' in `script-src`**. All external libraries (including Chart.js 4.4.7) are vendored locally under `public/vendor/`.
2. **Vendored Libraries & Zero Inline Handlers**:
   - Chart.js 4.4.7 is vendored locally at `public/vendor/chart.umd.min.js`.
   - All dynamic UI elements utilize delegated event listeners (`data-action`, `data-navigate`, `data-onchange`), eliminating all inline `onclick=`, `onchange=`, and `onsubmit=` event handlers across the entire frontend.
3. **Dedicated Static Root**:
   - Express static middleware serves only from the isolated `public/` directory, preventing exposure of server code, environment templates, or operational data.
4. **Token Revocation & Versioning**:
   - User models track a `tokenVersion` integer that is embedded into signed HMAC tokens. Tokens with mismatched versions are rejected with HTTP 401, providing immediate session invalidation upon password modification, administrator reset, or logout.
5. **Ownership & Role Integrity**:
   - Faculty users can only update academic records and attendance for classes they are assigned to.
   - Administrative role changes require existing administrator privileges, and demotion or deletion of the last remaining administrator is blocked.
6. **Path Traversal Defenses**:
   - File uploads and syllabus downloads enforce normalized path resolution (`resolved.startsWith(BASE_DIR + path.sep)`), blocking directory traversal exploits.
7. **Input Sanitization**:
   - Dynamic user-supplied text rendered into the DOM is sanitized using `escapeHtml()` and `escapeAttr()` helper functions to prevent Cross-Site Scripting (XSS).

---

## 🚢 Production Deployment Guide

Follow these steps to deploy CampusSphere to a production environment:

### Step 1: System Provisioning
- Deploy to a Linux/Windows server with Node.js `>= 20.19.0` and process supervision (e.g. `pm2`, `systemd`, or Docker).
- Attach a persistent volume or mount path for file uploads (e.g. `/var/data/campussphere/uploads`).

### Step 2: Environment Configuration
Create the production `.env` file:
```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=<generate-a-strong-random-32+-char-secret>
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/CampusSphere?retryWrites=true&w=majority
CORS_ORIGINS=https://campussphere.yourinstitution.edu
TRUST_PROXY=1
UPLOAD_DIR=/var/data/campussphere/uploads
ADMIN_BOOTSTRAP_PASSWORD=<strong-initial-admin-password>
```
> [!NOTE]
> Generate a cryptographically secure 64-character secret using Node.js:
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Step 3: Initial Database Migration & Admin Bootstrap
If starting with an empty database:
1. Start the server once with `ADMIN_BOOTSTRAP_PASSWORD` configured in `.env`.
2. Verify initial login with username `admin` and the configured bootstrap password.
3. Remove or comment out `ADMIN_BOOTSTRAP_PASSWORD` from `.env` to prevent future re-triggering.

### Step 4: Reverse Proxy & TLS Configuration (Nginx Example)
Configure Nginx to terminate TLS and forward requests to the Node.js backend:
```nginx
server {
    listen 443 ssl http2;
    server_name campussphere.yourinstitution.edu;

    ssl_certificate /etc/letsencrypt/live/campussphere.yourinstitution.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/campussphere.yourinstitution.edu/privkey.pem;

    client_max_body_size 15M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 5: Process Supervision
Start and monitor the process with `pm2`:
```bash
pm2 start server.js --name "campussphere" -i max
pm2 save
pm2 startup
```

---

## 🛠️ Operational Workflows & Administrative Tools

### 1. The Operational Golden Rule: "Backup, Then Migrate, Then Start"
When updating CampusSphere or running schema migrations in production, always follow the three-phase operational workflow:
1. **Backup**: Create a full verified filesystem snapshot of `data/`, `backups/`, and database collections:
   ```powershell
   # Run git bundle or mongodump before making any schema changes
   mongodump --uri="$MONGODB_URI" --out="backups/db_backup_$(date +%Y%m%d)"
   ```
2. **Migrate**: Run any required schema migrations and index synchronizations:
   ```powershell
   node scripts/migrate-usernamelower.js
   ```
3. **Start**: Verify startup configuration summary and start the server:
   ```powershell
   npm start
   ```

### 2. Admin Account Pruning (`scripts/prune-admins.js`)
To audit and safely clean up excess administrator accounts:
- **Dry-run (Default)**: Inspect accounts without making any changes:
  ```powershell
  node scripts/prune-admins.js --keep "admin"
  ```
- **Apply (Destructive - Requires Triple Confirmation)**:
  ```powershell
  node scripts/prune-admins.js --keep "admin" --apply --confirm "DELETE EXTRA ADMINS"
  ```
  *(Safety rules: The script strictly refuses to delete accounts unless `--apply` AND `--confirm "DELETE EXTRA ADMINS"` are passed, and will always preserve at least one active administrator).*

### 3. Packaging & Pre-Commit Hygiene
- **Clean Distributable Archive**:
  ```powershell
  npm run package
  ```
  Creates `CampusSphere-clean.zip` excluding `node_modules`, `.env*`, `.git`, `data/`, `backups/`, and temporary logs.
- **Pre-Commit Secret Check**:
  ```powershell
  npm run check:secrets
  ```
  Audits all tracked Git files to guarantee zero unredacted scrypt hashes, MongoDB Atlas connection URIs, or private keys are committed.

---

## 📄 License & Maintainers

Maintained by the CampusSphere Engineering Team. Developed with **Antigravity IDE**.
All rights reserved.
