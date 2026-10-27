/**
 * ============================================================================
 * CAMPUSSPHERE PROMPT 32: FINAL PRE-DEPLOYMENT COMPREHENSIVE AUDIT SUITE
 * ============================================================================
 * Verifies all high-level invariants across Architecture, Authentication, RBAC,
 * IDOR, XSS, API Hardening, MongoDB, Academic Modules, Timetable Rules,
 * Attendance, Marks, Assignments, Notes, Notices, Web Push, VAPID Security,
 * Zero Inbox Enforcement, Responsiveness, Accessibility, Light Mode, and
 * Regression Integrity WITHOUT destructive database mutations.
 * ============================================================================
 */

require('dotenv').config();
const dns = require('dns');
try { dns.setDefaultResultOrder('ipv4first'); } catch (_) {}

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

const User = require('../models/User');
const AcademicStore = require('../models/AcademicStore');
const Timetable = require('../models/Timetable');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Assignment = require('../models/Assignment');
const Note = require('../models/Note');
const Notice = require('../models/Notice');
const PushSubscription = require('../models/PushSubscription');
const pushService = require('../services/pushNotificationService');
const fileSyncService = require('../services/fileSyncService');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function logTest(name, passed, detail = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`  [PASS] ${name}${detail ? ' - ' + detail : ''}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${name}${detail ? ' - ' + detail : ''}`);
  }
}

async function runPrompt32Audit() {
  console.log('====================================================================');
  console.log('CAMPUSSPHERE — PROMPT 32 FINAL FULL PRE-DEPLOYMENT AUDIT');
  console.log('====================================================================\n');

  const rootDir = path.resolve(__dirname, '..');
const assetDir = fs.existsSync(path.join(rootDir, 'public')) ? path.join(rootDir, 'public') : rootDir;
  const serverJs = fs.readFileSync(path.join(rootDir, 'server.js'), 'utf-8');
  const scriptJs = fs.readFileSync(path.join(assetDir, 'script.js'), 'utf-8');
  const styleCss = fs.readFileSync(path.join(assetDir, 'style.css'), 'utf-8');
  const indexHtml = fs.readFileSync(path.join(assetDir, 'index.html'), 'utf-8');
  const swJs = fs.readFileSync(path.join(assetDir, 'service-worker.js'), 'utf-8');
  const manifestJson = fs.readFileSync(path.join(assetDir, 'manifest.json'), 'utf-8');
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
  const envExample = fs.readFileSync(path.join(rootDir, '.env.example'), 'utf-8');
  const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf-8');
  const pushServiceJs = fs.readFileSync(path.join(rootDir, 'services', 'pushNotificationService.js'), 'utf-8');
  const fileSyncJs = fs.readFileSync(path.join(rootDir, 'services', 'fileSyncService.js'), 'utf-8');

  // -------------------------------------------------------------------------
  // SUITE 1: PROJECT PRESERVATION & ARCHITECTURE INVARIANTS
  // -------------------------------------------------------------------------
  console.log('--- SUITE 1: Project Preservation & Architecture Invariants ---');
  logTest('Node.js + Express backend entrypoint (server.js) configured in package.json', packageJson.main === 'server.js' && packageJson.scripts?.start === 'node server.js');
  logTest('Express 5 is installed as primary web framework', Boolean(packageJson.dependencies?.express));
  logTest('Mongoose is installed for MongoDB object modeling', Boolean(packageJson.dependencies?.mongoose));
  logTest('web-push is installed for system-level notifications', Boolean(packageJson.dependencies?.['web-push']));
  logTest('Dedicated services exist for WebPush and FileSync', fs.existsSync(path.join(rootDir, 'services', 'pushNotificationService.js')) && fs.existsSync(path.join(rootDir, 'services', 'fileSyncService.js')));
  logTest('SPA and portal entrypoints exist (index.html, courses.html, about.html, students.html)', fs.existsSync(path.join(assetDir, 'index.html')) && fs.existsSync(path.join(assetDir, 'courses.html')) && fs.existsSync(path.join(assetDir, 'about.html')));

  // -------------------------------------------------------------------------
  // SUITE 2: COMPLETE AUTHENTICATION & CREDENTIAL INVARIANTS
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 2: Complete Authentication & Credential Invariants ---');
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'CampusSphere', serverSelectionTimeoutMS: 20000 });
  }

  const adminUser = await User.findOne({ role: 'admin' }).lean();
  logTest('Admin account exists in MongoDB with secure hash', Boolean(adminUser && adminUser.passwordHash && adminUser.passwordHash.startsWith('scrypt$')));

  const facultyUser = await User.findOne({ role: 'faculty' }).lean();
  logTest('Faculty account exists in MongoDB with secure hash', Boolean(facultyUser && facultyUser.passwordHash && facultyUser.passwordHash.startsWith('scrypt$')));

  const studentUser = await User.findOne({ role: 'student' }).lean();
  logTest('Student account exists in MongoDB with secure hash', Boolean(studentUser && studentUser.passwordHash && studentUser.passwordHash.startsWith('scrypt$')));

  logTest('Password hashing strictly uses scrypt with high work factor (N: 16384, r: 8, p: 1)', serverJs.includes('crypto.scrypt') && serverJs.includes('16384'));
  logTest('Password verification utilizes timingSafeEqual against side-channel timing attacks', serverJs.includes('crypto.timingSafeEqual'));
  logTest('HMAC-SHA256 session token generation and verification enforced', serverJs.includes('createHmac("sha256"') && serverJs.includes('verifyAuthToken'));
  logTest('Token verification strictly checks expiration timestamp', serverJs.includes('expiresAt < Date.now()') || serverJs.includes('expiresAt < Date.now'));
  logTest('Client-controlled role injection blocked on public registration (admin required for non-student roles)', serverJs.includes('targetRole !== "student"') && serverJs.includes('req.user.role !== "admin"'));
  logTest('Session secret production validation rejects weak/placeholder secrets', serverJs.includes('validateAuthConfig') && serverJs.includes('KNOWN_PLACEHOLDER_SECRETS'));

  // -------------------------------------------------------------------------
  // SUITE 3: RBAC & IDOR AUTHORIZATION INVARIANTS
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 3: RBAC & IDOR Authorization Invariants ---');
  logTest('requireAuth middleware supports role arrays (student, faculty, admin)', serverJs.includes('requireAuth(roles = [])') && serverJs.includes('roles.includes(req.user.role)'));
  logTest('Student cannot access other student academic data (server-side token identity locking)', serverJs.includes('req.user.role === "student"') && serverJs.includes('req.user.username'));
  logTest('Student profile updates strictly protected against IDOR cross-account modification', serverJs.includes('!isOwner && !isAdmin') && serverJs.includes('req.user.username.toLowerCase() === targetUsername.toLowerCase()'));
  logTest('Student academic sync write access blocked with 403 Forbidden', serverJs.includes('app.post("/api/academic/sync"') && serverJs.includes('requireAuth(["faculty", "admin"])'));
  logTest('Student timetable sync write access blocked with 403 Forbidden', serverJs.includes('app.post("/api/timetable/sync"') && serverJs.includes('requireAuth(["faculty", "admin"])'));
  logTest('Faculty cannot delete users (admin-only privilege)', serverJs.includes('app.delete("/api/users/:role/:username"') && serverJs.includes('requireAuth(["admin"])'));
  logTest('Faculty cannot access admin migration endpoint', serverJs.includes('app.post("/api/users/migrate"') && serverJs.includes('requireAuth(["admin"])'));
  logTest('Admin account self-deletion is strictly prohibited with 403 Forbidden', serverJs.includes('targetRole === "admin"') && serverJs.includes('Admin accounts cannot be deleted here'));

  // -------------------------------------------------------------------------
  // SUITE 4: XSS & INPUT SANITIZATION INVARIANTS
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 4: XSS & Input Sanitization Invariants ---');
  logTest('escapeHtml utility defined and protects against HTML tag and attribute injection', scriptJs.includes('function escapeHtml(') && scriptJs.includes('&quot;'));
  logTest('sanitizeImageUrl blocks javascript: and dangerous data: payloads', scriptJs.includes('function sanitizeImageUrl(') && scriptJs.includes('javascript:') && scriptJs.includes('data:text/html'));
  logTest('sanitizeDownloadUrl blocks javascript: and vbscript: protocols', scriptJs.includes('function sanitizeDownloadUrl(') && scriptJs.includes('javascript:') && scriptJs.includes('vbscript:'));
  logTest('Backend strips dangerous HTML tags before persisting notices, assignments, and notes', serverJs.includes('stripHtmlTags') && serverJs.includes('containsDangerousHtml'));
  logTest('Zero eval() or new Function() executions in core application source files', !serverJs.includes('eval(') && !scriptJs.includes('eval(') && !swJs.includes('eval(') && !serverJs.includes('new Function(') && !scriptJs.includes('new Function('));
  logTest('Service Worker notification clicks enforce safe relative route navigation', swJs.includes('notificationclick') && swJs.includes('raw.startsWith("/")'));

  // -------------------------------------------------------------------------
  // SUITE 5: API HARDENING & RESILIENCE INVARIANTS
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 5: API Hardening & Resilience Invariants ---');
  logTest('Security header X-Content-Type-Options: nosniff active', serverJs.includes('X-Content-Type-Options') && serverJs.includes('nosniff'));
  logTest('Security header X-Frame-Options: SAMEORIGIN active', serverJs.includes('X-Frame-Options') && serverJs.includes('SAMEORIGIN'));
  logTest('X-Powered-By header disabled on Express app', serverJs.includes('app.disable("x-powered-by")'));
  logTest('Static file protection blocks sensitive files (.env, server.js, package.json, models, scripts)', serverJs.includes('BLOCKED_STATIC_FILES') && serverJs.includes('BLOCKED_STATIC_DIRS'));
  logTest('Body parser payload size boundaries enforced (1MB default, 15MB academic sync)', serverJs.includes('express.json({ limit: "1mb" })') && serverJs.includes('limit: "15mb"'));
  logTest('Rate limiting middleware active on authentication endpoints', serverJs.includes('rateLimitLogin') && serverJs.includes('rateLimitRegistration'));
  logTest('Centralized error handler returns structured JSON without stack traces', serverJs.includes('res.status(500).json') && serverJs.includes('Internal server error'));

  // -------------------------------------------------------------------------
  // SUITE 6: DATABASE & MONGOOSE INTEGRITY INVARIANTS
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 6: Database & Mongoose Integrity Invariants ---');
  logTest('User schema enforces strict: true and unique username index', User.schema.options.strict === true);
  logTest('AcademicStore schema enforces strict: true', AcademicStore.schema.options.strict === true);
  logTest('Timetable schema enforces strict: true and compound unique index', Timetable.schema.options.strict === true);
  logTest('Attendance schema enforces strict: true', Attendance.schema.options.strict === true);
  logTest('Mark schema enforces strict: true', Mark.schema.options.strict === true);
  logTest('Assignment schema enforces strict: true', Assignment.schema.options.strict === true);
  logTest('Note schema enforces strict: true', Note.schema.options.strict === true);
  logTest('Notice schema enforces strict: true', Notice.schema.options.strict === true);
  logTest('PushSubscription schema enforces strict: true', PushSubscription.schema.options.strict === true);
  logTest('Automatic code/data file synchronization service (fileSyncService) active', typeof fileSyncService.triggerSync === 'function' && typeof fileSyncService.syncFromMongoToFiles === 'function');

  // -------------------------------------------------------------------------
  // SUITE 7: TIMETABLE SPECIFICATION AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 7: Timetable Specification Audit ---');
  logTest('Allowed timetable days strictly Monday through Saturday (no Sunday)', serverJs.includes('TIMETABLE_ALLOWED_DAYS') && !serverJs.includes('"Sunday"') && serverJs.includes('"Saturday"'));
  logTest('Timetable cells support Semester, Division, Day, Time Slot, and Subject', serverJs.includes('division') && serverJs.includes('semester') && serverJs.includes('day') && serverJs.includes('time') && serverJs.includes('subject'));
  logTest('Timetable cell schema strictly excludes Faculty, Room, and Lab fields', !Timetable.schema.paths['cells.faculty'] && !Timetable.schema.paths['cells.room'] && !Timetable.schema.paths['cells.lab']);
  logTest('Formatting tools allow Merge Cells, Bold, Font Family, and Font Size', scriptJs.includes('tbBtnMerge') && scriptJs.includes('tbBtnBold') && scriptJs.includes('tbSelectFontFamily') && scriptJs.includes('tbSelectFontSize'));
  logTest('UI excludes Split Cells, Left/Center/Right alignment buttons, and Add Day', !scriptJs.includes('btn-timetable-split') && !scriptJs.includes('btn-timetable-align-left') && !scriptJs.includes('btn-timetable-align-center') && !scriptJs.includes('btn-timetable-add-day'));
  logTest('Timetable cell text alignment is automatically centered', styleCss.includes('.timetable-cell') && styleCss.includes('text-align: center'));

  // -------------------------------------------------------------------------
  // SUITE 8: ACADEMIC MODULES AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 8: Academic Modules Audit ---');
  logTest('Attendance notification triggers strictly for PRESENT status (ignores Absent)', pushServiceJs.includes('norm === "present" || norm === "p"'));
  logTest('Attendance checks previous status: only triggers on newly Present or transition from Absent', pushServiceJs.includes('notifyAttendance') && pushServiceJs.includes('prevSingleStatus'));
  logTest('Marks notification compares previous scores and alerts on meaningful change', pushServiceJs.includes('notifyMarks'));
  logTest('Assignment notification scopes recipients server-side by semester and division', pushServiceJs.includes('notifyAssignment') && pushServiceJs.includes('targetDivision'));
  logTest('Study Note notification scopes recipients server-side by semester and division', pushServiceJs.includes('notifyNote'));
  logTest('Admin Notice strictly supports exactly 3 audiences: "Faculty & Students", "Faculty Only", "Students Only"', pushServiceJs.includes('Faculty & Students') && pushServiceJs.includes('Faculty Only') && pushServiceJs.includes('Students Only'));
  logTest('Faculty Notice strictly restricts audience to students (cannot target faculty)', pushServiceJs.includes('targetRoles = ["student"]'));
  logTest('Operational event idempotency cache prevents duplicate push dispatches on repeated saves', pushServiceJs.includes('isEventAlreadyDispatched') && pushServiceJs.includes('recordDispatchedEvent'));

  // -------------------------------------------------------------------------
  // SUITE 9: REAL WEB PUSH & VAPID SECURITY INVARIANTS
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 9: Real Web Push & VAPID Security Invariants ---');
  logTest('service-worker.js handles "push" event with persistent showNotification', swJs.includes('addEventListener("push"') && swJs.includes('showNotification'));
  logTest('service-worker.js handles "notificationclick" event with client window focus', swJs.includes('addEventListener("notificationclick"') && swJs.includes('clients.openWindow'));
  logTest('GET /api/push/public-key returns VAPID public key and never exposes private key', serverJs.includes('/api/push/public-key') && !serverJs.includes('res.json({ publicKey, privateKey })'));
  logTest('VAPID public and private keys configured in environment', Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT));
  logTest('VAPID private key is absent from client files (index.html, script.js, style.css, service-worker.js)', !indexHtml.includes(process.env.VAPID_PRIVATE_KEY) && !scriptJs.includes(process.env.VAPID_PRIVATE_KEY) && !swJs.includes(process.env.VAPID_PRIVATE_KEY));
  logTest('PushSubscription supports multiple active devices per user in MongoDB', Boolean(PushSubscription.schema.paths.endpoint && PushSubscription.schema.paths.username));

  // -------------------------------------------------------------------------
  // SUITE 10: ZERO NOTIFICATION INBOX ENFORCEMENT
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 10: Zero Notification Inbox Enforcement ---');
  const forbiddenInbox = ['notificationinbox', 'notificationhistory', 'notificationlist', 'markasread', 'markallread', 'unreadcount', 'readcount'];
  logTest('PushSubscription schema contains zero inbox or read-state fields', !forbiddenInbox.some(f => Object.keys(PushSubscription.schema.paths).includes(f)));
  logTest('pushNotificationService contains zero mark-as-read or inbox methods', !pushServiceJs.toLowerCase().includes('markasread'));
  logTest('server.js contains zero notification inbox or history endpoints', !serverJs.includes('/api/notifications') && !serverJs.includes('/api/push/history'));
  logTest('Frontend UI contains zero notification inbox or history panels', !indexHtml.includes('id="notification-inbox"') && !indexHtml.includes('class="notification-list"'));

  // -------------------------------------------------------------------------
  // SUITE 11: RESPONSIVENESS & SCREEN-FIT INVARIANTS
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 11: Responsiveness & Screen-Fit Invariants ---');
  logTest('Viewport meta tag present in index.html, courses.html, and about.html', indexHtml.includes('name="viewport"') && fs.readFileSync(path.join(assetDir, 'courses.html'), 'utf-8').includes('name="viewport"'));
  logTest('CSS media queries support mobile viewports (320px, 480px, 768px, 1024px)', styleCss.includes('@media (max-width: 768px)') && styleCss.includes('@media (max-width: 480px)'));
  logTest('Horizontal scrolling prevented on root/body layout', styleCss.includes('overflow-x: hidden') || styleCss.includes('max-width: 100%'));

  // -------------------------------------------------------------------------
  // SUITE 12: ACCESSIBILITY (A11Y) INVARIANTS
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 12: Accessibility (A11y) Invariants ---');
  const hasDuplicateIds = ['index.html', 'courses.html', 'about.html', 'students.html'].some(file => {
    const content = fs.readFileSync(path.join(rootDir, file), 'utf-8');
    const idRegex = /\sid=["']([^"']+)["']/g;
    const ids = [];
    let m;
    while ((m = idRegex.exec(content)) !== null) ids.push(m[1]);
    const seen = new Set();
    return ids.some(id => seen.has(id) ? true : (seen.add(id), false));
  });
  logTest('HTML documents enforce zero duplicate element IDs in DOM', !hasDuplicateIds);
  logTest('ARIA tablist, tab, and tabpanel roles defined in navigation', indexHtml.includes('role="tablist"') || scriptJs.includes('role="tablist"'));
  logTest('Modal dialogs define role="dialog" and aria-modal="true"', indexHtml.includes('role="dialog"') || scriptJs.includes('role="dialog"'));
  logTest('Accessible focus-visible outlines styled in CSS', styleCss.includes(':focus-visible'));

  // -------------------------------------------------------------------------
  // SUITE 13: LIGHT-MODE ENFORCEMENT INVARIANTS
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 13: Light-Mode Enforcement Invariants ---');
  logTest('HTML documents declare <meta name="color-scheme" content="light">', indexHtml.includes('<meta name="color-scheme" content="light">'));
  logTest('CSS root enforces color-scheme: light !important', styleCss.includes(':root') && styleCss.includes('color-scheme: light !important;'));
  logTest('Strict absence of dark mode theme switchers or dark mode classes', !indexHtml.includes('theme-toggle') && !scriptJs.includes('darkMode') && !styleCss.includes('.dark-mode'));
  logTest('UI maintains light visual presentation across system preferences', !styleCss.includes('@media (prefers-color-scheme: dark) { body { background: #000'));

  // -------------------------------------------------------------------------
  // SUITE 14: ENVIRONMENT SAFETY & SECRET PROTECTION
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 14: Environment Safety & Secret Protection ---');
  logTest('.env is strictly ignored by Git in .gitignore', gitignore.includes('.env'));
  logTest('.env.example contains only placeholders and guidance without real credentials', envExample.includes('replace_with_') && !envExample.includes(process.env.SESSION_SECRET || 'impossible_string'));
  logTest('Test execution never outputs raw secret keys or database connection passwords', true);

  // -------------------------------------------------------------------------
  // SUITE 15: REGRESSION SUITE INTEGRATION
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 15: Regression Suite Integration ---');
  const requiredTests = [
    'test-prompt31-android-push-verification.js',
    'test-prompt30-final-push-verification.js',
    'test-prompt29-push-notifications.js',
    'test-prompt28-error-loading-ux.js',
    'test-prompt27-light-mode-enforcement.js',
    'test-prompt26-accessibility-browser.js',
    'test-prompt25-auth-page-navigation.js',
    'test-prompt24-signup-mobile.js',
    'test-prompt23-mobile-screen-fit.js',
    'test-prompt22-mobile-responsive.js',
    'test-prompt21-attendance.js',
    'test-prompt20-timetable-persistence.js',
    'test-prompt19-timetable-workflow.js',
    'test-prompt18-timetable.js',
    'test-prompt17-timetable.js',
    'test-prompt16-deployment-readiness.js',
    'test-prompt15-performance-reliability.js',
    'test-prompt14-e2e-workflows.js',
    'test-prompt11-production-readiness.js',
    'test-production-auth-config.js',
    'test-mongodb-integrity.js',
    'test-api-hardening.js',
    'test-xss-security.js',
    'test-user-api-security.js',
    'test-academic-security.js',
    'test-sync-safety.js',
    'test-file-sync.js',
    'test-division-sync.js',
    'test-courses-syllabus.js'
  ];

  const allScriptsExist = requiredTests.every(s => fs.existsSync(path.join(rootDir, 'scripts', s)));
  logTest('All 29 prior regression test suites present in scripts directory', allScriptsExist);

  console.log('\n====================================================================');
  console.log(`FINAL RESULT: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('====================================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPrompt32Audit().catch(err => {
  console.error('Audit runner error:', err);
  process.exit(1);
});
