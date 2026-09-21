# 🎓 CampusSphere — Academic Management System

A modern, responsive **CampusSphere** web application built with HTML5, CSS3, JavaScript, Node.js, Express 5, and MongoDB / Mongoose. Developed and maintained using **Antigravity IDE**, it features secure `scrypt` password hashing, interactive Chart.js analytics, hash-based SPA routing, and persistent MongoDB database storage.

---

## 📁 Folder Structure

```text
CampusSphere/
├── index.html                      # Single Page Application (SPA) HTML interface
├── script.js                        # Dynamic frontend logic & API client handlers (~11k lines)
├── style.css                       # Modern dark glassmorphism stylesheet (~5k lines)
├── server.js                       # Express.js 5 backend server & security middleware
├── package.json                    # Node.js project manifest & dependencies
├── package-lock.json               # Locked dependency tree
├── .env                            # Environment variables (MongoDB configuration)
├── .env.example                    # Template environment variables
├── .gitignore                      # Git exclusion rules (secrets, node_modules, logs)
├── README.md                       # Project documentation & setup guide
├── Start_CampusSphere.bat          # 1-Click Local Launcher (starts server + opens browser)
├── Stop_CampusSphere.bat           # 1-Click Stopper (terminates backend on port 3000)
├── models/
│   ├── AcademicStore.js            # Consolidated academic data store model
│   ├── User.js                     # User accounts model (student, faculty, admin)
│   ├── Timetable.js                # Schedule & timetable model
│   ├── Notice.js                   # Notice schema definition
│   ├── Attendance.js               # Attendance schema definition
│   ├── Mark.js                     # Marks schema definition
│   ├── Assignment.js               # Assignment schema definition
│   └── Note.js                     # Study notes schema definition
└── scripts/
    ├── clear-demo-accounts.js                  # Utility script to clean up demo/test accounts
    ├── migrate-to-mongodb.js                   # Script to migrate legacy database.json to MongoDB
    ├── test-academic-mongodb.js                # Direct verification test for AcademicStore CRUD
    ├── test-mongodb-users.js                   # Direct verification test for User CRUD & auth
    ├── test-academic-security.js               # Academic data isolation & RBAC test suite
    ├── test-api-hardening.js                   # Rate limiting, CORS, headers & request bounds test suite
    ├── test-mongodb-integrity.js               # Schemas, uniqueness, compound indexes test suite
    ├── test-production-auth-config.js          # Production secrets, startup guard & admin bootstrap test suite
    ├── test-prompt11-production-readiness.js   # Full RBAC matrix, IDOR second pass & negative abuse test suite
    ├── test-sync-safety.js                     # Idempotent sync, queue serialization & preservation test suite
    ├── test-user-api-security.js               # User API IDOR, field allowlist & migration test suite
    └── test-xss-security.js                    # DOM sanitization, attribute breakouts & stored XSS test suite
```

---

## ✨ Features

- **🔐 Role-Based Access Control:** Dedicated portals for **Student**, **Faculty**, and **Admin** accounts.
- **🔑 Server-Side Security:** Password hashing using Node.js `crypto.scrypt` with timing-safe verification.
- **🍃 MongoDB Persistence:** Reliable, scalable cloud or local MongoDB storage via Mongoose 9.
- **📊 Academic Management & Analytics:**
  - **Student:** Profile details, attendance tracking, marks breakdown, assignments, notes, and AI Chart.js performance metrics.
  - **Faculty:** Daily attendance recording, batch marks entry, assignment publishing, student interaction, and profile customization.
  - **Admin:** Student and faculty user management, semester-wise subjects configuration, and system status overview.
- **🧭 Hash-Based SPA Routing:** Persistent page navigation (`/#attendance`, `/#marks`, `/#assignments`) supporting browser Back/Forward navigation and refresh preservation.

---

## 🚀 Quick Start

### 1. System Requirements
- [Node.js](https://nodejs.org/) (v20.19.0 or higher recommended for Mongoose 9).
- MongoDB instance (local service on `mongodb://127.0.0.1:27017` or a free MongoDB Atlas cluster).

### 2. Configure Environment (`.env`)
Copy `.env.example` to `.env` in the project root:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/CampusSphere
```

### 3. Install Dependencies
```powershell
npm install
```

### 4. Run Automated Database Tests
```powershell
npm test
```

### 5. Launching the Portal (Windows)

- **Via Terminal:**
  ```powershell
  npm start
  ```
  *(or `npm run dev` for auto-reload on file changes)*

- **Via 1-Click Batch File:**
  Double-click `Start_CampusSphere.bat` to launch the server and automatically open the application in your browser.

- **To Stop the Portal:**
  Double-click `Stop_CampusSphere.bat` to safely terminate the backend process on port 3000.

---

## 🔑 Starter Demo Accounts (Development Mode Only)

In development/test environments (`NODE_ENV !== "production"`), when connecting to an empty database, the server seeds a development administrator account:

| Role | Username | Default Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `admin@123` |

> [!WARNING]
> Default administrator accounts are **strictly disabled in production** (`NODE_ENV=production`). For production deployments, configure `SESSION_SECRET` (min 32 characters) and use `ADMIN_BOOTSTRAP_PASSWORD` for one-time initialization.

Students can self-register via the signup form on the login screen; faculty and administrator accounts must be provisioned by an Administrator to protect institutional access boundaries.

---

## 🛡️ Security & Production Deployment
- **Environment Protection**: Keep `.env` secure and never commit it to public version control.
- **Session Secrets**: In production (`NODE_ENV=production`), `SESSION_SECRET` is strictly required and must be a cryptographically random string of at least 32 characters. Server startup will fail with status code 1 if missing or weak.
- **Production Admin Provisioning**: Use `ADMIN_BOOTSTRAP_PASSWORD` (min 12 characters) for one-time initialization on fresh databases, and unset it once initial administrative access is verified.
- **Reverse Proxy & TLS**: In production, deploy behind a TLS-terminating reverse proxy (e.g., Nginx, Cloudflare, AWS ALB) configured to pass `X-Forwarded-For` and `X-Forwarded-Proto` headers for accurate rate limiting and HSTS enforcement.
- **Database Access**: Ensure MongoDB access credentials use least privilege and IP allowlisting.
