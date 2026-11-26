/**
 * scripts/test-real-database-integration.js
 *
 * CampusSphere — Phase 8, Section 3.3.3.10: Real Database and Integration Verification
 *
 * Comprehensive Real MongoDB & HTTP Integration Verification Suite
 * Database Isolation: Disposable MongoMemoryServer on 127.0.0.1 (`campussphere_phase8_integration_test`)
 * Network Isolation: Intercepts http.Server.prototype.listen to enforce loopback (127.0.0.1) binding
 * Authentication: Genuine scrypt password hashing & /api/auth/login token negotiation
 * Module Resolution: Canonical PROJECT_ROOT resolution for all models, services, and server
 */

const http = require('http');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { promisify } = require('util');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Canonical Project Root Resolution
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Explicit Test Environment Configuration
const TEST_PORT = 3888;
const TEST_HOST = '127.0.0.1';
const TEST_DB_NAME = 'campussphere_phase8_integration_test';
const TEST_SESSION_SECRET = 'campussphere_phase8_verified_secure_session_secret_32char_min!';
const WATCHDOG_TIMEOUT_MS = 60000;
const scryptAsync = promisify(crypto.scrypt);

// Process Environment Overrides (Set Prior to Requiring Application Code)
process.env.PORT = String(TEST_PORT);
process.env.SESSION_SECRET = TEST_SESSION_SECRET;
process.env.NODE_ENV = 'test';

// Authoritative File-Scoped State Declarations
let mongodInstance = null;
let capturedHttpServer = null;
let shutdownPromise = null;
let isShuttingDown = false;
let abortRequested = false;
let abortReason = null;
let watchdogTimer = null;
let harnessError = null;
const originalListen = http.Server.prototype.listen;
const results = [];

// Intercept listen to force loopback 127.0.0.1 binding and capture server instance
http.Server.prototype.listen = function (...args) {
  capturedHttpServer = this;
  if (typeof args[0] === 'number' || (typeof args[0] === 'string' && /^\d+$/.test(args[0]))) {
    const port = args[0];
    let cb = null;
    for (let i = 1; i < args.length; i++) {
      if (typeof args[i] === 'function') {
        cb = args[i];
        break;
      }
    }
    return originalListen.call(this, port, TEST_HOST, cb);
  }
  return originalListen.apply(this, args);
};

function record(id, description, passed, details = '') {
  results.push({ id, description, passed, details });
  const mark = passed ? '[PASS]' : '[FAIL]';
  console.log(`  ${mark} [Scenario ${id}] ${description}${details ? ` -> ${details}` : ''}`);
}

function checkAbort() {
  if (abortRequested || isShuttingDown) {
    throw new Error(abortReason || "Verification flow aborted by shutdown controller.");
  }
}

function request(method, pathUrl, body = null, token = null) {
  if (isShuttingDown || abortRequested) {
    return Promise.reject(new Error("Request rejected: System is shutting down."));
  }

  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: TEST_HOST,
      port: TEST_PORT,
      path: pathUrl,
      method,
      headers: {
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: data ? JSON.parse(data) : {} });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`HTTP request timeout (5000ms) on ${method} ${pathUrl}`));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function createScryptHash(password) {
  const salt = crypto.randomBytes(16);
  const derived = await scryptAsync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString('base64url')}$${Buffer.from(derived).toString('base64url')}`;
}

// Helper to track bounded shutdown operations without false cancellation claims
async function closeWithBoundedTimeout(operationFn, timeoutMs) {
  let timer;
  let finished = false;
  const opPromise = Promise.resolve().then(operationFn).then(
    () => { finished = true; return 'done'; },
    (err) => { finished = true; throw err; }
  );

  const timeoutPromise = new Promise(resolve => {
    timer = setTimeout(() => {
      if (!finished) resolve('timeout');
    }, timeoutMs);
  });

  try {
    const outcome = await Promise.race([opPromise, timeoutPromise]);
    clearTimeout(timer);
    if (outcome === 'timeout') {
      return 'shutdown_unconfirmed';
    }
    return 'confirmed';
  } catch (err) {
    clearTimeout(timer);
    return `error: ${err.message}`;
  }
}

async function executeShutdown(triggerSource = 'normal') {
  if (shutdownPromise) return shutdownPromise;
  isShuttingDown = true;
  abortRequested = true;
  abortReason = abortReason || `Shutdown triggered by ${triggerSource}`;

  shutdownPromise = (async () => {
    console.log(`\n[Shutdown Controller] Executing single-flight shutdown (trigger: ${triggerSource})...`);
    const shutdownReport = {
      server: 'not_started',
      mongoose: 'not_connected',
      mms: 'not_started',
      allConfirmed: false
    };

    // 1. Clear Watchdog Timer
    if (watchdogTimer) {
      clearTimeout(watchdogTimer);
      watchdogTimer = null;
    }

    // 2. Restore Monkey-Patched Method Immediately
    if (http.Server.prototype.listen !== originalListen) {
      http.Server.prototype.listen = originalListen;
    }

    // 3. Close HTTP Server and Terminate Client Sockets
    if (capturedHttpServer) {
      shutdownReport.server = 'pending';
      try {
        if (typeof capturedHttpServer.closeAllConnections === 'function') {
          capturedHttpServer.closeAllConnections();
        }
        const outcome = await closeWithBoundedTimeout(
          () => new Promise(resolve => capturedHttpServer.close(resolve)),
          4000
        );
        shutdownReport.server = outcome === 'confirmed' ? 'closed' : outcome;
        console.log(`  [OK] Express HTTP listener: ${shutdownReport.server}`);
      } catch (err) {
        shutdownReport.server = `error: ${err.message}`;
      }
    }

    // 4. Disconnect Mongoose
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      shutdownReport.mongoose = 'pending';
      try {
        const outcome = await closeWithBoundedTimeout(
          () => mongoose.disconnect(),
          4000
        );
        shutdownReport.mongoose = outcome === 'confirmed' ? 'disconnected' : outcome;
        console.log(`  [OK] Mongoose connection: ${shutdownReport.mongoose}`);
      } catch (err) {
        shutdownReport.mongoose = `error: ${err.message}`;
      }
    }

    // 5. Stop MongoMemoryServer
    if (mongodInstance) {
      shutdownReport.mms = 'pending';
      try {
        const outcome = await closeWithBoundedTimeout(
          () => mongodInstance.stop(),
          5000
        );
        shutdownReport.mms = outcome === 'confirmed' ? 'stopped' : outcome;
        console.log(`  [OK] MongoMemoryServer: ${shutdownReport.mms}`);
      } catch (err) {
        shutdownReport.mms = `error: ${err.message}`;
      }
      mongodInstance = null;
    }

    shutdownReport.allConfirmed =
      (shutdownReport.server === 'closed' || shutdownReport.server === 'not_started') &&
      (shutdownReport.mongoose === 'disconnected' || shutdownReport.mongoose === 'not_connected') &&
      (shutdownReport.mms === 'stopped' || shutdownReport.mms === 'not_started');

    console.log('[Shutdown Controller] Summary:', JSON.stringify(shutdownReport));
    return shutdownReport;
  })();

  return shutdownPromise;
}

function printFinalDiagnosticSummary() {
  const failedTests = results.filter(r => !r.passed);
  const summaryPayload = {
    totalTests: results.length,
    passedCount: results.length - failedTests.length,
    failedCount: failedTests.length,
    harnessError: harnessError ? (harnessError.message || String(harnessError)) : null,
    tests: results
  };

  console.log('\n======================================================================');
  console.log('MACHINE-READABLE TEST SUMMARY');
  console.log('======================================================================');
  console.log(JSON.stringify(summaryPayload, null, 2));

  if (harnessError || failedTests.length > 0) {
    process.exitCode = 1;
  } else {
    process.exitCode = 0;
  }
}

// Converged Signal and Process Handlers (No process.exit calls inside handlers)
process.on('SIGINT', async () => {
  console.log('\n[SIGNAL] SIGINT intercepted. Initiating shutdown...');
  harnessError = harnessError || new Error("Execution interrupted by SIGINT");
  await executeShutdown('SIGINT');
});

process.on('SIGTERM', async () => {
  console.log('\n[SIGNAL] SIGTERM intercepted. Initiating shutdown...');
  harnessError = harnessError || new Error("Execution interrupted by SIGTERM");
  await executeShutdown('SIGTERM');
});

process.on('unhandledRejection', async (err) => {
  console.error('[UnhandledRejection Caught]:', err);
  if (!harnessError) harnessError = err;
  await executeShutdown('unhandledRejection');
});

async function runMasterVerification() {
  watchdogTimer = setTimeout(async () => {
    console.error('\n[FATAL] Watchdog timeout (60s) reached. Halting harness...');
    harnessError = new Error("Watchdog timeout (60s) reached");
    await executeShutdown('watchdog');
  }, WATCHDOG_TIMEOUT_MS);
  watchdogTimer.unref();

  console.log('======================================================================');
  console.log('CAMPUSSPHERE PHASE 8, SECTION 3.3.3.10: REAL DATABASE & INTEGRATION AUDIT');
  console.log('======================================================================\n');

  // Preflight Safety Gate: Validate Host Isolation
  console.log('[Safety Gate 1/4] Starting isolated disposable MongoMemoryServer...');
  const startedInstance = await MongoMemoryServer.create({
    instance: {
      dbName: TEST_DB_NAME,
      ip: TEST_HOST
    }
  });
  if (abortRequested || isShuttingDown) {
    await closeWithBoundedTimeout(() => startedInstance.stop(), 5000);
    checkAbort();
  }
  mongodInstance = startedInstance;

  const uri = mongodInstance.getUri();
  const parsedUri = new URL(uri);
  if (parsedUri.hostname !== '127.0.0.1' && parsedUri.hostname !== 'localhost') {
    throw new Error(`CRITICAL TEST VIOLATION: Target host '${parsedUri.hostname}' is not loopback!`);
  }
  if (uri.includes('mongodb.net')) {
    throw new Error('CRITICAL TEST VIOLATION: URI points to MongoDB Atlas!');
  }

  process.env.MONGODB_URI = uri;
  console.log(`  [OK] Isolated disposable MongoDB URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

  // Connect Mongoose to Disposable Database
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  checkAbort();

  // Correct Absolute Model Imports Relative to PROJECT_ROOT
  const User = require(path.join(PROJECT_ROOT, 'models', 'User.js'));
  const AcademicStore = require(path.join(PROJECT_ROOT, 'models', 'AcademicStore.js'));
  const AcademicYear = require(path.join(PROJECT_ROOT, 'models', 'AcademicYear.js'));
  const Timetable = require(path.join(PROJECT_ROOT, 'models', 'Timetable.js'));
  const Mark = require(path.join(PROJECT_ROOT, 'models', 'Mark.js'));
  const Attendance = require(path.join(PROJECT_ROOT, 'models', 'Attendance.js'));
  const Notice = require(path.join(PROJECT_ROOT, 'models', 'Notice.js'));
  const Assignment = require(path.join(PROJECT_ROOT, 'models', 'Assignment.js'));
  const Note = require(path.join(PROJECT_ROOT, 'models', 'Note.js'));

  // Pre-seed Guard User to Prevent database.json Auto-Migration
  console.log('[Safety Gate 2/4] Pre-seeding baseline guard administrator...');
  const adminHash = await createScryptHash('Admin@123456');
  await User.create({
    id: 'admin_integ_01',
    role: 'admin',
    name: 'System Integration Admin',
    username: 'admin_integ',
    usernameLower: 'admin_integ',
    email: 'admin_integ@campussphere.edu',
    passwordHash: adminHash,
    tokenVersion: 0
  });

  const countGuard = await User.countDocuments();
  if (countGuard !== 1) {
    throw new Error(`Guard seeding invariant failed: User count is ${countGuard}, expected 1.`);
  }
  console.log('  [OK] Guard user verified. User count is 1.');
  checkAbort();

  // Boot Application Server
  console.log('[Safety Gate 3/4] Requiring server.js (enforcing 127.0.0.1 loopback)...');
  require(path.join(PROJECT_ROOT, 'server.js'));

  // Restore listen monkey-patch
  http.Server.prototype.listen = originalListen;

  // Poll for Server Readiness (strict redacted public readiness contract)
  let isOnline = false;
  let lastStatusPayload = null;
  for (let i = 0; i < 40; i++) {
    checkAbort();
    await new Promise((resolve) => setTimeout(resolve, 200));
    try {
      const ping = await request('GET', '/api/status');
      lastStatusPayload = ping.body;
      if (ping.status === 200 && ping.body.status === 'failed') {
        throw new Error(
          `Server startup initialization failed on /api/status: ${JSON.stringify(ping.body)}`
        );
      }
      if (ping.status === 200 && ping.body.status === 'ready' && ping.body.ready === true) {
        isOnline = true;
        break;
      }
    } catch (pollErr) {
      if (pollErr.message && pollErr.message.startsWith('Server startup initialization failed on /api/status:')) {
        throw pollErr;
      }
    }
  }
  if (!isOnline) {
    throw new Error('Express server failed to reach healthy/indexed state on 127.0.0.1:' + TEST_PORT + ' lastStatus=' + JSON.stringify(lastStatusPayload));
  }
  console.log('  [OK] Express application online and ready (public status redacted) on 127.0.0.1:' + TEST_PORT);
  checkAbort();

  // Authenticate Admin via Real /api/auth/login Endpoint
  console.log('[Safety Gate 4/4] Negotiating genuine tokens via /api/auth/login...');
  const adminLoginRes = await request('POST', '/api/auth/login', {
    role: 'admin',
    username: 'admin_integ',
    password: 'Admin@123456'
  });
  if (adminLoginRes.status !== 200 || !adminLoginRes.body.token) {
    throw new Error('Admin authentication failed: ' + JSON.stringify(adminLoginRes.body));
  }
  const adminToken = adminLoginRes.body.token;

  // Seed Faculty 1 with Active Allocation for 2025–26 (Canonical NEP 1st Sem: C Programming, Div A, 1st Semester)
  const facHash = await createScryptHash('Faculty@123456');
  await User.create({
    id: 'fac_integ_01',
    role: 'faculty',
    name: 'Prof. Ada Lovelace',
    username: 'faculty_ada',
    usernameLower: 'faculty_ada',
    email: 'ada@campussphere.edu',
    passwordHash: facHash,
    tokenVersion: 0,
    department: 'Computer Applications',
    facultyAllocations: [{
      academicYear: '2025–26',
      subject: 'C Programming',
      division: 'Div A',
      semester: '1st Semester',
      status: 'active',
      isActive: true
    }]
  });

  const facLoginRes = await request('POST', '/api/auth/login', {
    role: 'faculty',
    username: 'faculty_ada',
    password: 'Faculty@123456'
  });
  if (facLoginRes.status !== 200 || !facLoginRes.body.token) {
    throw new Error('Faculty authentication failed: ' + JSON.stringify(facLoginRes.body));
  }
  const facultyToken = facLoginRes.body.token;

  // Seed Faculty 2 with Allocation for 2026–27 (Canonical NEP 3rd Sem: Python Programming, Div B, 3rd Semester)
  await User.create({
    id: 'fac_integ_02',
    role: 'faculty',
    name: 'Prof. Charles Babbage',
    username: 'faculty_charles',
    usernameLower: 'faculty_charles',
    email: 'charles@campussphere.edu',
    passwordHash: facHash,
    tokenVersion: 0,
    department: 'Computer Applications',
    facultyAllocations: [{
      academicYear: '2026–27',
      subject: 'Python Programming',
      division: 'Div B',
      semester: '3rd Semester',
      status: 'active',
      isActive: true
    }]
  });

  const fac2LoginRes = await request('POST', '/api/auth/login', {
    role: 'faculty',
    username: 'faculty_charles',
    password: 'Faculty@123456'
  });
  if (fac2LoginRes.status !== 200 || !fac2LoginRes.body.token) {
    throw new Error('Faculty 2 authentication failed: ' + JSON.stringify(fac2LoginRes.body));
  }
  const faculty2Token = fac2LoginRes.body.token;

  // Seed Distinct Students
  const stuHash = await createScryptHash('Student@123456');
  await User.create({
    id: 'stu_integ_01',
    role: 'student',
    name: 'Alice Student',
    username: 'student_alice',
    usernameLower: 'student_alice',
    email: 'alice@campussphere.edu',
    passwordHash: stuHash,
    tokenVersion: 0,
    division: 'Div A',
    semester: '1st Semester',
    admissionYear: '2024–25',
    academicYear: '2025–26'
  });

  await User.create({
    id: 'stu_integ_02',
    role: 'student',
    name: 'Bob Student',
    username: 'student_bob',
    usernameLower: 'student_bob',
    email: 'bob@campussphere.edu',
    passwordHash: stuHash,
    tokenVersion: 0,
    division: 'Div B',
    semester: '1st Semester',
    admissionYear: '2025–26',
    academicYear: '2025–26'
  });

  const aliceLoginRes = await request('POST', '/api/auth/login', {
    role: 'student',
    username: 'student_alice',
    password: 'Student@123456'
  });
  const aliceToken = aliceLoginRes.body.token;

  const bobLoginRes = await request('POST', '/api/auth/login', {
    role: 'student',
    username: 'student_bob',
    password: 'Student@123456'
  });
  const bobToken = bobLoginRes.body.token;

  if (!aliceToken || !bobToken) {
    throw new Error('Student authentication setup failed.');
  }

  // =========================================================================
  // PRE-FLIGHT: Public Status Redaction & Admin Diagnostics RBAC
  // =========================================================================
  console.log('\n--- PRE-FLIGHT: Public Status Redaction & Admin Diagnostics RBAC ---');
  checkAbort();

  const pubStatusRes = await request('GET', '/api/status');
  const pubHealthRes = await request('GET', '/api/health');
  checkAbort();

  const pubStatusSafe = pubStatusRes.status === 200 &&
    pubStatusRes.body.status === 'ready' &&
    pubStatusRes.body.ready === true &&
    pubStatusRes.body.initError === undefined &&
    pubStatusRes.body.indexErrors === undefined &&
    pubStatusRes.body.databaseState === undefined &&
    pubStatusRes.body.database === undefined &&
    pubStatusRes.body.initialized === undefined &&
    pubStatusRes.body.indexReady === undefined &&
    pubStatusRes.body.connectionUri === undefined &&
    pubHealthRes.status === 200 &&
    pubHealthRes.body.status === 'ready' &&
    pubHealthRes.body.ready === true &&
    pubHealthRes.body.initError === undefined &&
    pubHealthRes.body.indexErrors === undefined &&
    pubHealthRes.body.databaseState === undefined;
  record('P1', 'Public /api/status and /api/health return minimal readiness only and redact all internals', pubStatusSafe);

  const diagUnauthRes = await request('GET', '/api/admin/diagnostics/database');
  const diagFacRes = await request('GET', '/api/admin/diagnostics/database', null, facultyToken);
  const diagAdminRes = await request('GET', '/api/admin/diagnostics/database', null, adminToken);
  checkAbort();

  const diagRbacValid = diagUnauthRes.status === 401 &&
    diagFacRes.status === 403 &&
    diagAdminRes.status === 200 &&
    diagAdminRes.body.databaseState === 'connected' &&
    diagAdminRes.body.initStatus === 'ready' &&
    diagAdminRes.body.initialized === true &&
    diagAdminRes.body.indexReady === true &&
    diagAdminRes.body.ready === true &&
    diagAdminRes.body.initError === null &&
    Array.isArray(diagAdminRes.body.indexErrors) &&
    diagAdminRes.body.indexErrors.length === 0;
  record('P2', 'Admin diagnostics endpoint enforces admin RBAC and reports indexReady/initialized telemetry', diagRbacValid);

  const storeCountBeforeRead = await AcademicStore.countDocuments({});
  const readAdminDataRes = await request('GET', '/api/academic/data', null, adminToken);
  const readFacDataRes = await request('GET', '/api/academic/data', null, facultyToken);
  checkAbort();
  const storeCountAfterRead = await AcademicStore.countDocuments({});
  const p3Passed =
    storeCountBeforeRead === 0 &&
    storeCountAfterRead === 0 &&
    readAdminDataRes.status === 200 &&
    readAdminDataRes.body?.success === true &&
    Array.isArray(readAdminDataRes.body?.data?.notices) &&
    readAdminDataRes.body.data.notices.length === 0 &&
    readFacDataRes.status === 200 &&
    readFacDataRes.body?.success === true;
  record('P3', 'GET /api/academic/data returns neutral empty structure and never creates AcademicStore on read', p3Passed);

  // =========================================================================
  // SCENARIO A: Academic-Year Creation and Activation (2025–26 Active)
  // =========================================================================
  console.log('\n--- SCENARIO A: Academic-Year Creation and Activation ---');
  checkAbort();

  // A1. Create 2025–26 (Upcoming)
  const yr1Res = await request('POST', '/api/academic-years', {
    yearCode: '2025–26',
    title: 'Academic Year 2025–26',
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    activeCycle: 'odd'
  }, adminToken);
  checkAbort();

  const yr1Id = yr1Res.body.academicYear?._id;
  const yr1DbDoc = await AcademicYear.findById(yr1Id).lean();
  const yr1Created = yr1Res.status === 201 &&
    yr1Res.body.academicYear?.yearCode === '2025–26' &&
    yr1DbDoc?.status === 'upcoming';
  record('A1', 'Create upcoming academic year 2025–26', yr1Created);
  if (!yr1Created) throw new Error("Prerequisite failed: Scenario A1 did not establish valid upcoming year.");

  // A0. Zero Active Years Guard: absent and null academicYear must fail closed cleanly before A2 activates 2025–26
  const absentAttAdminRes = await request('POST', '/api/attendance', {
    semester: '1st Semester',
    division: 'Div A',
    subject: 'C Programming',
    date: '09-08-25',
    isoDate: '2025-08-09',
    records: { student_alice: 'P' }
  }, adminToken);
  const nullAttFacRes = await request('POST', '/api/attendance', {
    academicYear: null,
    semester: '1st Semester',
    division: 'Div A',
    subject: 'C Programming',
    date: '09-08-25',
    isoDate: '2025-08-09',
    records: { student_alice: 'P' }
  }, facultyToken);
  const absentTtAdminRes = await request('POST', '/api/timetable', {
    semester: '1st Semester',
    division: 'Div A',
    days: ['Monday'],
    timeSlots: ['09:00 - 10:00'],
    cells: [{ dayIndex: 0, slotIndex: 0, subject: 'C Programming' }]
  }, adminToken);
  checkAbort();

  const noActiveAttCount = await Attendance.countDocuments({});
  const noActiveTtCount = await Timetable.countDocuments({});
  const a0Passed = absentAttAdminRes.status === 400 &&
    absentAttAdminRes.body.code === 'ACADEMIC_YEAR_REQUIRED' &&
    nullAttFacRes.status === 400 &&
    nullAttFacRes.body.code === 'ACADEMIC_YEAR_REQUIRED' &&
    absentTtAdminRes.status === 400 &&
    absentTtAdminRes.body.code === 'ACADEMIC_YEAR_REQUIRED' &&
    noActiveAttCount === 0 &&
    noActiveTtCount === 0;
  record('A0', 'With zero active years, omitted and null academicYear fail closed (400 ACADEMIC_YEAR_REQUIRED) with zero writes', a0Passed);

  // A2. Activate 2025–26 (Keeping it active for Scenarios B through F)
  const actYr1Res = await request('PATCH', `/api/academic-years/${yr1Id}/activate`, {}, adminToken);
  checkAbort();

  const yr1ActiveDoc = await AcademicYear.findById(yr1Id).lean();
  const activeCount1 = await AcademicYear.countDocuments({ status: 'active' });
  const yr1Activated = actYr1Res.status === 200 &&
    yr1ActiveDoc?.status === 'active' &&
    activeCount1 === 1;
  record('A2', 'Activate 2025–26 and assert exactly one active year in database', yr1Activated);
  if (!yr1Activated) throw new Error("Prerequisite failed: Scenario A2 did not activate 2025–26.");

  // =========================================================================
  // SCENARIO B: Faculty Attendance Authorization & Fail-Closed Year Guards (2025–26 Active)
  // =========================================================================
  console.log('\n--- SCENARIO B: Faculty Attendance Authorization & Fail-Closed Guards ---');
  checkAbort();

  // B1. Authorized Attendance Post (Canonical NEP: C Programming, Div A, 1st Semester, 2025–26)
  const authAttRes = await request('POST', '/api/attendance', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div A',
    subject: 'C Programming',
    date: '10-08-25',
    isoDate: '2025-08-10',
    records: { student_alice: 'P' }
  }, facultyToken);
  checkAbort();

  const authAttDoc = await Attendance.findOne({ academicYear: '2025–26', subject: 'C Programming', isoDate: '2025-08-10' }).lean();
  record(
    'B1',
    'Authorized faculty attendance request succeeds (200) and persists in active year',
    authAttRes.status === 200 &&
      !!authAttDoc &&
      authAttDoc.isoDate === '2025-08-10' &&
      authAttDoc.date === '10-08-25' &&
      authAttDoc.records?.student_alice === 'P'
  );

  // B2. Unauthorized Subject Post (DBMS not allocated to Ada in 1st Semester)
  const attSnapshotBBefore = await Attendance.find({}).lean();
  const unauthSubRes = await request('POST', '/api/attendance', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div A',
    subject: 'DBMS',
    date: '10-08-25',
    isoDate: '2025-08-10',
    records: { student_alice: 'P' }
  }, facultyToken);
  checkAbort();

  const attSnapshotBAfter = await Attendance.find({}).lean();
  const unauthSubZeroMutation = unauthSubRes.status === 403 &&
    unauthSubRes.body.code === 'UNAUTHORIZED_SUBJECT' &&
    JSON.stringify(attSnapshotBBefore) === JSON.stringify(attSnapshotBAfter);
  record('B2', 'Unauthorized subject attendance rejected (403 UNAUTHORIZED_SUBJECT) with zero database mutation', unauthSubZeroMutation);

  // B3. Unauthorized Division Post (Div B not allocated to Ada)
  const unauthDivRes = await request('POST', '/api/attendance', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div B',
    subject: 'C Programming',
    date: '10-08-25',
    isoDate: '2025-08-10',
    records: { student_bob: 'P' }
  }, facultyToken);
  checkAbort();

  const attSnapshotBFinal = await Attendance.find({}).lean();
  const unauthDivZeroMutation = unauthDivRes.status === 403 &&
    unauthDivRes.body.code === 'UNAUTHORIZED_DIVISION' &&
    JSON.stringify(attSnapshotBAfter) === JSON.stringify(attSnapshotBFinal);
  record('B3', 'Unauthorized division attendance rejected (403 UNAUTHORIZED_DIVISION) with zero database mutation', unauthDivZeroMutation);

  // B4. Fail-Closed Academic Year Validation (empty, nonexistent, upcoming; no admin bypass)
  const yrUpcomingRes = await request('POST', '/api/academic-years', {
    yearCode: '2027–28',
    title: 'Academic Year 2027–28',
    startDate: '2027-06-01',
    endDate: '2028-05-31',
    activeCycle: 'odd'
  }, adminToken);
  if (yrUpcomingRes.status !== 201) {
    throw new Error('Prerequisite failed in B4: unable to create upcoming 2027–28 year.');
  }

  const attSnapshotB4Before = await Attendance.find({}).lean();
  const storeSnapshotB4Before = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();

  const emptyYrRes = await request('POST', '/api/attendance', {
    academicYear: '   ',
    semester: '1st Semester',
    division: 'Div A',
    subject: 'C Programming',
    date: '11-08-25',
    isoDate: '2025-08-11',
    records: { student_alice: 'P' }
  }, facultyToken);

  const missingYrAdminRes = await request('POST', '/api/attendance', {
    academicYear: '2099–00',
    semester: '1st Semester',
    division: 'Div A',
    subject: 'C Programming',
    date: '11-08-25',
    isoDate: '2025-08-11',
    records: { student_alice: 'P' }
  }, adminToken);

  const upcomingYrFacRes = await request('POST', '/api/attendance', {
    academicYear: '2027–28',
    semester: '1st Semester',
    division: 'Div A',
    subject: 'C Programming',
    date: '11-08-25',
    isoDate: '2025-08-11',
    records: { student_alice: 'P' }
  }, facultyToken);

  const upcomingYrAdminRes = await request('POST', '/api/attendance', {
    academicYear: '2027–28',
    semester: '1st Semester',
    division: 'Div A',
    subject: 'C Programming',
    date: '11-08-25',
    isoDate: '2025-08-11',
    records: { student_alice: 'P' }
  }, adminToken);
  checkAbort();

  const attSnapshotB4After = await Attendance.find({}).lean();
  const storeSnapshotB4After = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();

  const failClosedB4Valid =
    emptyYrRes.status === 400 &&
    emptyYrRes.body.code === 'ACADEMIC_YEAR_REQUIRED' &&
    missingYrAdminRes.status === 400 &&
    missingYrAdminRes.body.code === 'ACADEMIC_YEAR_NOT_FOUND' &&
    upcomingYrFacRes.status === 403 &&
    upcomingYrFacRes.body.code === 'ACADEMIC_YEAR_NOT_ACTIVE' &&
    upcomingYrAdminRes.status === 403 &&
    upcomingYrAdminRes.body.code === 'ACADEMIC_YEAR_NOT_ACTIVE' &&
    JSON.stringify(attSnapshotB4Before) === JSON.stringify(attSnapshotB4After) &&
    JSON.stringify(storeSnapshotB4Before) === JSON.stringify(storeSnapshotB4After);
  record('B4', 'Fail-closed year guards reject empty, nonexistent, and upcoming years for both faculty and admin', failClosedB4Valid);

  // =========================================================================
  // SCENARIO C: Faculty Timetable Authorization & Lifecycle Guards (On Active Year 2025–26)
  // =========================================================================
  console.log('\n--- SCENARIO C: Faculty Timetable Authorization ---');
  checkAbort();

  // C1. Authorized Faculty Timetable Save (Canonical 1st Sem C Programming)
  const authTtRes = await request('POST', '/api/timetable', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div A',
    days: ['Monday'],
    timeSlots: ['09:00 - 10:00'],
    cells: [{ dayIndex: 0, slotIndex: 0, subject: 'C Programming' }]
  }, facultyToken);
  checkAbort();

  const ttDocC1 = await Timetable.findOne({ academicYear: '2025–26', semester: '1st Semester', division: 'Div A' }).lean();
  const ttC1Passed = authTtRes.status === 200 && ttDocC1?.cells[0]?.subject === 'C Programming';
  record('C1', 'Authorized faculty timetable operation succeeds (200) and persists', ttC1Passed);
  if (!ttC1Passed) throw new Error('Prerequisite failed: Scenario C1 did not persist authorized timetable cell.');

  // C2. Unauthorized Subject Overwrite on Real Seeded Cell (Attempting DBMS over C Programming)
  const ttSnapshotCBefore = await Timetable.find({}).lean();
  const unauthTtRes = await request('POST', '/api/timetable', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div A',
    days: ['Monday'],
    timeSlots: ['09:00 - 10:00'],
    cells: [{ dayIndex: 0, slotIndex: 0, subject: 'DBMS' }]
  }, facultyToken);
  checkAbort();

  const ttSnapshotCAfter = await Timetable.find({}).lean();
  const ttDocC2After = await Timetable.findOne({ academicYear: '2025–26', semester: '1st Semester', division: 'Div A' }).lean();
  const unauthTtZeroMutation = unauthTtRes.status === 403 &&
    unauthTtRes.body.message.includes('Access forbidden') &&
    ttDocC2After?.cells[0]?.subject === 'C Programming' &&
    JSON.stringify(ttSnapshotCBefore) === JSON.stringify(ttSnapshotCAfter);
  record('C2', 'Unauthorized subject timetable overwrite rejected (403) leaving existing C1 cell intact', unauthTtZeroMutation);

  // C3. Fail-Closed Timetable Lifecycle, Missing academicYear, & ID Reuse Guards Across Admin Routes
  const ttSnapshotC3Before = await Timetable.find({}).lean();
  const ttMissingYrRes = await request('POST', '/api/timetable', {
    semester: '1st Semester',
    division: 'Div A',
    days: ['Monday'],
    timeSlots: ['09:00 - 10:00'],
    cells: [{ dayIndex: 0, slotIndex: 0, subject: 'C Programming' }]
  }, adminToken);
  const ttUpcomingPutRes = await request('PUT', '/api/timetable', {
    academicYear: '2027–28',
    semester: '1st Semester',
    division: 'Div A',
    days: ['Monday'],
    timeSlots: ['09:00 - 10:00'],
    cells: [{ dayIndex: 0, slotIndex: 0, subject: 'C Programming' }]
  }, adminToken);
  const ttUpcomingDelRes = await request(
    'DELETE',
    `/api/timetable?semester=${encodeURIComponent('1st Semester')}&division=${encodeURIComponent('Div A')}&academicYear=${encodeURIComponent('2027–28')}`,
    null,
    adminToken
  );
  const ttUpcomingSyncRes = await request('POST', '/api/timetable/sync', {
    academicYear: '2027–28',
    timetable: [{
      academicYear: '2027–28',
      semester: '1st Semester',
      division: 'Div A',
      day: 'Monday',
      time: '09:00 - 10:00',
      subject: 'C Programming',
      subjectText: 'C Programming'
    }]
  }, adminToken);
  const ttIdReuseRes = await request('PUT', '/api/timetable', {
    _id: String(ttDocC1._id),
    academicYear: '2027–28',
    semester: '1st Semester',
    division: 'Div A',
    days: ['Monday'],
    timeSlots: ['09:00 - 10:00'],
    cells: [{ dayIndex: 0, slotIndex: 0, subject: 'C Programming' }]
  }, adminToken);
  checkAbort();

  const ttSnapshotC3After = await Timetable.find({}).lean();
  const ttC3Passed =
    ttMissingYrRes.status === 400 &&
    ttMissingYrRes.body.code === 'ACADEMIC_YEAR_REQUIRED' &&
    ttUpcomingPutRes.status === 403 &&
    ttUpcomingPutRes.body.code === 'ACADEMIC_YEAR_NOT_ACTIVE' &&
    ttUpcomingDelRes.status === 403 &&
    ttUpcomingDelRes.body.code === 'ACADEMIC_YEAR_NOT_ACTIVE' &&
    ttUpcomingSyncRes.status === 403 &&
    ttUpcomingSyncRes.body.code === 'ACADEMIC_YEAR_NOT_ACTIVE' &&
    ttIdReuseRes.status === 409 &&
    ttIdReuseRes.body.code === 'IMMUTABLE_RECORD' &&
    JSON.stringify(ttSnapshotC3Before) === JSON.stringify(ttSnapshotC3After);
  record('C3', 'Timetable save/update/delete/sync enforce explicit academicYear, fail-closed upcoming guard, and cross-year ID immutability', ttC3Passed);

  // =========================================================================
  // SCENARIO D: Academic Synchronization, Standalone 503 Gate, Notice & Authorless Protections
  // =========================================================================
  console.log('\n--- SCENARIO D: Academic Synchronization & Atomic Validation ---');
  checkAbort();

  // D1. Standalone Topology Fail-Closed Gate: Valid sync + attachment payload must reject 503 TRANSACTIONS_REQUIRED before any disk/DB write
  const attachmentsDirD1 = path.join(PROJECT_ROOT, 'uploads', 'attachments');
  const attFilesBeforeD1 = fs.existsSync(attachmentsDirD1) ? fs.readdirSync(attachmentsDirD1).sort() : [];
  const noticeBeforeD1 = await Notice.find({}).lean();
  const noteBeforeD1 = await Note.find({}).lean();
  const storeBeforeD1 = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();
  const validSyncRes = await request('POST', '/api/academic/sync', {
    notices: [{
      id: 'notice_sync_01',
      title: 'Valid Academic Sync Notice',
      text: 'Synchronized announcement text',
      authorRole: 'admin',
      date: '2025-09-01'
    }],
    notes: [{
      id: 'note_d1_attach',
      subject: 'C Programming',
      division: 'Div A',
      semester: '1st Semester',
      title: 'D1 Attachment Zero-Write Guard',
      fileName: 'd1_zero_write.png',
      fileData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    }]
  }, adminToken);
  checkAbort();

  const attFilesAfterD1 = fs.existsSync(attachmentsDirD1) ? fs.readdirSync(attachmentsDirD1).sort() : [];
  const noticeAfterD1 = await Notice.find({}).lean();
  const noteAfterD1 = await Note.find({}).lean();
  const storeAfterD1 = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();
  const noticeNotWritten = !(storeAfterD1?.notices || []).some(n => n.id === 'notice_sync_01') &&
    !noticeAfterD1.some(n => n.noticeId === 'notice_sync_01' || n.id === 'notice_sync_01');
  const noteNotWritten = !(storeAfterD1?.notes || []).some(n => n.id === 'note_d1_attach') &&
    !noteAfterD1.some(n => n.noteId === 'note_d1_attach' || n.id === 'note_d1_attach');
  const zeroDiskAttachmentWrite = JSON.stringify(attFilesBeforeD1) === JSON.stringify(attFilesAfterD1);
  record(
    'D1',
    'Standalone topology fails closed on valid academic sync with attachment (503 TRANSACTIONS_REQUIRED) before persistent DB or disk writes',
    validSyncRes.status === 503 &&
      validSyncRes.body.code === 'TRANSACTIONS_REQUIRED' &&
      validSyncRes.body.atomicTransactionsSupported === false &&
      noticeNotWritten &&
      noteNotWritten &&
      zeroDiskAttachmentWrite &&
      JSON.stringify(noticeBeforeD1) === JSON.stringify(noticeAfterD1) &&
      JSON.stringify(noteBeforeD1) === JSON.stringify(noteAfterD1) &&
      JSON.stringify(storeBeforeD1) === JSON.stringify(storeAfterD1)
  );

  // D2. Malformed Payloads & No Partial Mutation
  const storeSnapshotDBefore = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();
  const malformedSync1 = await request('POST', '/api/academic/sync', { students: 'invalid_string' }, adminToken);
  const storeSnapshotDMiddle = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();
  const malformedSync2 = await request('POST', '/api/academic/sync', { notices: 'invalid_string' }, adminToken);
  const storeSnapshotDAfter = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();
  checkAbort();

  const malformedRejected = malformedSync1.status === 400 &&
    malformedSync1.body.message.includes('Invalid students payload format') &&
    malformedSync2.status === 400 &&
    malformedSync2.body.message.includes('Invalid notices payload format') &&
    JSON.stringify(storeSnapshotDBefore) === JSON.stringify(storeSnapshotDMiddle) &&
    JSON.stringify(storeSnapshotDMiddle) === JSON.stringify(storeSnapshotDAfter);
  record('D2', 'Malformed academic sync payloads rejected with exact 400 status and zero mutation', malformedRejected);

  // D3. Mixed-Batch Sync Rejection (Validation runs before standalone 503 gate -> exact 403 rejection, zero writes)
  const attSnapshotD3Before = await Attendance.find({}).lean();
  const markSnapshotD3Before = await Mark.find({}).lean();
  const storeSnapshotD3Before = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();

  const mixedSyncRes = await request('POST', '/api/academic/sync', {
    dailyAttendance: [
      {
        id: 'att_mixed_valid_temp',
        attendanceId: 'att_mixed_valid_temp',
        academicYear: '2025–26',
        semester: '1st Semester',
        division: 'Div A',
        subject: 'C Programming',
        date: '12-08-25',
        isoDate: '2025-08-12',
        records: { student_alice: 'P' }
      },
      {
        id: 'att_mixed_invalid_temp',
        attendanceId: 'att_mixed_invalid_temp',
        academicYear: '2027–28',
        semester: '1st Semester',
        division: 'Div A',
        subject: 'C Programming',
        date: '12-08-27',
        isoDate: '2027-08-12',
        records: { student_alice: 'P' }
      }
    ],
    students: {
      student_alice: {
        academicYear: '2025–26',
        division: 'Div A',
        semester: '1st Semester',
        marks: {
          cprog: { internal1: 18, maxInternal1: 20, academicYear: '2025–26' }
        }
      }
    }
  }, adminToken);
  checkAbort();

  const attSnapshotD3After = await Attendance.find({}).lean();
  const markSnapshotD3After = await Mark.find({}).lean();
  const storeSnapshotD3After = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();

  const mixedRejectedZeroPartial = mixedSyncRes.status === 403 &&
    mixedSyncRes.body.code === 'ACADEMIC_YEAR_NOT_ACTIVE' &&
    JSON.stringify(attSnapshotD3Before) === JSON.stringify(attSnapshotD3After) &&
    JSON.stringify(markSnapshotD3Before) === JSON.stringify(markSnapshotD3After) &&
    JSON.stringify(storeSnapshotD3Before) === JSON.stringify(storeSnapshotD3After);
  record('D3', 'Mixed-batch academic sync rejects invalid sub-operation atomically with exact 403 before 503 gate and zero partial persistence', mixedRejectedZeroPartial);

  // D4. Seed Notice & Guard Validation (404 unfound delete, 409 unversioned/cross-year, 403 faculty-on-admin notice)
  await Notice.create([
    {
      id: 'notice_admin_ver_01',
      noticeId: 'notice_admin_ver_01',
      title: 'Admin Versioned Notice',
      text: 'Institutional schedule update',
      authorRole: 'admin',
      authorUsername: 'admin_integ',
      postedBy: 'admin_integ',
      academicYear: '2025–26',
      date: '2025-09-01'
    },
    {
      id: 'notice_legacy_unver_01',
      noticeId: 'notice_legacy_unver_01',
      title: 'Legacy Unversioned Notice',
      text: 'Historical pre-versioned notice',
      authorRole: 'faculty',
      authorUsername: 'faculty_ada',
      postedBy: 'faculty_ada',
      academicYear: '',
      date: '2024-09-01'
    }
  ]);

  const noticesBeforeD4 = await Notice.find({}).lean();
  const delUnfoundNoticeRes = await request('POST', '/api/academic/sync', {
    deletedNotices: ['notice_does_not_exist_999']
  }, adminToken);
  const delUnverNoticeRes = await request('POST', '/api/academic/sync', {
    deletedNotices: ['notice_legacy_unver_01']
  }, adminToken);
  const backfillUnverNoticeRes = await request('POST', '/api/academic/sync', {
    notices: [{
      id: 'notice_legacy_unver_01',
      academicYear: '2025–26',
      title: 'Backfill Attempt',
      text: 'Should be rejected'
    }]
  }, adminToken);
  const facDelAdminNoticeRes = await request('POST', '/api/academic/sync', {
    deletedNotices: ['notice_admin_ver_01']
  }, facultyToken);
  const crossYrNoticeRes = await request('POST', '/api/academic/sync', {
    notices: [{
      id: 'notice_admin_ver_01',
      academicYear: '2026–27',
      title: 'Cross-Year Reassign',
      text: 'Should be rejected'
    }]
  }, adminToken);
  checkAbort();

  const noticesAfterD4 = await Notice.find({}).lean();
  const d4Passed =
    delUnfoundNoticeRes.status === 404 &&
    delUnfoundNoticeRes.body.code === 'NOTICE_NOT_FOUND' &&
    delUnverNoticeRes.status === 409 &&
    delUnverNoticeRes.body.code === 'IMMUTABLE_RECORD' &&
    backfillUnverNoticeRes.status === 409 &&
    backfillUnverNoticeRes.body.code === 'IMMUTABLE_RECORD' &&
    facDelAdminNoticeRes.status === 403 &&
    facDelAdminNoticeRes.body.code === 'FACULTY_UNAUTHORIZED' &&
    crossYrNoticeRes.status === 409 &&
    crossYrNoticeRes.body.code === 'IMMUTABLE_RECORD' &&
    JSON.stringify(noticesBeforeD4) === JSON.stringify(noticesAfterD4);
  record('D4', 'Notice sync enforces 404 unfound delete, 409 unversioned/cross-year immutability, and 403 faculty authorship boundaries', d4Passed);

  // D5. Authorless Legacy Assignment & Note Fail-Closed Protection for Allocated Faculty
  await AcademicStore.updateOne(
    { storeKey: 'default_academic_store' },
    {
      $set: {
        assignments: [{
          id: 'assign_authorless_01',
          assignmentId: 'assign_authorless_01',
          academicYear: '2025–26',
          subject: 'C Programming',
          division: 'Div A',
          semester: '1st Semester',
          title: 'Legacy Authorless Assignment',
          facultyUsername: '',
          createdBy: ''
        }],
        notes: [{
          id: 'note_authorless_01',
          noteId: 'note_authorless_01',
          academicYear: '2025–26',
          subject: 'C Programming',
          division: 'Div A',
          semester: '1st Semester',
          title: 'Legacy Authorless Note',
          uploadedBy: '',
          authorUsername: ''
        }]
      }
    },
    { upsert: true }
  );

  const storeBeforeD5 = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();
  const facOverwriteAsgnRes = await request('POST', '/api/academic/sync', {
    assignments: [{
      id: 'assign_authorless_01',
      academicYear: '2025–26',
      subject: 'C Programming',
      division: 'Div A',
      semester: '1st Semester',
      title: 'Attempted Faculty Takeover'
    }]
  }, facultyToken);
  const facDelAsgnRes = await request('POST', '/api/academic/sync', {
    deletedAssignments: ['assign_authorless_01']
  }, facultyToken);
  const facOverwriteNoteRes = await request('POST', '/api/academic/sync', {
    notes: [{
      id: 'note_authorless_01',
      academicYear: '2025–26',
      subject: 'C Programming',
      division: 'Div A',
      semester: '1st Semester',
      title: 'Attempted Note Takeover'
    }]
  }, facultyToken);
  const facDelNoteRes = await request('POST', '/api/academic/sync', {
    deletedNotes: ['note_authorless_01']
  }, facultyToken);
  checkAbort();

  const storeAfterD5 = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();
  const d5Passed =
    facOverwriteAsgnRes.status === 403 &&
    facOverwriteAsgnRes.body.code === 'FACULTY_UNAUTHORIZED' &&
    facOverwriteAsgnRes.body.message.includes('lacking authorship') &&
    facDelAsgnRes.status === 403 &&
    facDelAsgnRes.body.code === 'FACULTY_UNAUTHORIZED' &&
    facDelAsgnRes.body.message.includes('lacking authorship') &&
    facOverwriteNoteRes.status === 403 &&
    facOverwriteNoteRes.body.code === 'FACULTY_UNAUTHORIZED' &&
    facOverwriteNoteRes.body.message.includes('lacking authorship') &&
    facDelNoteRes.status === 403 &&
    facDelNoteRes.body.code === 'FACULTY_UNAUTHORIZED' &&
    facDelNoteRes.body.message.includes('lacking authorship') &&
    JSON.stringify(storeBeforeD5) === JSON.stringify(storeAfterD5);
  record('D5', 'Allocated faculty fails closed (403 lacking authorship) on authorless assignment/note overwrites and deletions', d5Passed);

  // =========================================================================
  // SCENARIO E: Student Data Isolation & Privacy
  // =========================================================================
  console.log('\n--- SCENARIO E: Student Data Isolation & Privacy ---');
  checkAbort();

  await AcademicStore.updateOne(
    { storeKey: 'default_academic_store' },
    {
      $set: {
        students: {
          student_alice: { id: 'stu_integ_01', name: 'Alice Student', attendance: 88, cieMarks: { 'C Programming': 19 } },
          student_bob: { id: 'stu_integ_02', name: 'Bob Student', attendance: 62, cieMarks: { 'C Programming': 11 } }
        },
        notices: [
          { id: 'not_div_a', title: 'Div A Notice', text: 'For Div A Only', academicYear: '2025–26', target: 'student', targetRole: 'student', targetDivision: 'Div A', targetSemester: '1st Semester' },
          { id: 'not_div_b', title: 'Div B Notice', text: 'For Div B Only', academicYear: '2025–26', target: 'student', targetRole: 'student', targetDivision: 'Div B', targetSemester: '1st Semester' },
          { id: 'not_wrong_yr', title: 'Old Year Notice', text: 'For 2024–25 Only', academicYear: '2024–25', target: 'all', targetRole: 'all', targetDivision: 'all' },
          { id: 'not_wrong_sem', title: 'Sem 3 Notice', text: 'For 3rd Sem Only', academicYear: '2025–26', target: 'student', targetRole: 'student', targetDivision: 'all', targetSemester: '3rd Semester' }
        ]
      }
    },
    { upsert: true }
  );

  // E1. Alice Request
  const aliceRes = await request('GET', '/api/academic/data', null, aliceToken);
  checkAbort();
  const aliceStudents = aliceRes.body?.data?.students || {};
  const aliceNotices = aliceRes.body?.data?.notices || [];
  const aliceIsolated = aliceRes.status === 200 &&
    aliceStudents.student_alice?.name === 'Alice Student' &&
    aliceStudents.student_bob === undefined &&
    aliceNotices.some(n => n.id === 'not_div_a') &&
    !aliceNotices.some(n => n.id === 'not_div_b') &&
    !aliceNotices.some(n => n.id === 'not_wrong_yr') &&
    !aliceNotices.some(n => n.id === 'not_wrong_sem');
  record('E1', 'Student Alice receives own record; Div B, wrong-year, and wrong-semester notices redacted', aliceIsolated);

  // E2. Bob Request
  const bobRes = await request('GET', '/api/academic/data', null, bobToken);
  checkAbort();
  const bobStudents = bobRes.body?.data?.students || {};
  const bobNotices = bobRes.body?.data?.notices || [];
  const bobIsolated = bobRes.status === 200 &&
    bobStudents.student_bob?.name === 'Bob Student' &&
    bobStudents.student_alice === undefined &&
    bobNotices.some(n => n.id === 'not_div_b') &&
    !bobNotices.some(n => n.id === 'not_div_a') &&
    !bobNotices.some(n => n.id === 'not_wrong_yr') &&
    !bobNotices.some(n => n.id === 'not_wrong_sem');
  record('E2', 'Student Bob receives own record; Div A, wrong-year, and wrong-semester notices redacted', bobIsolated);

  // =========================================================================
  // SCENARIO F: Public Academic-Year Privacy (Active Year 2025–26)
  // =========================================================================
  console.log('\n--- SCENARIO F: Public Academic-Year Privacy ---');
  checkAbort();

  const pubActiveRes = await request('GET', '/api/academic-years/active');
  checkAbort();
  const pubYear = pubActiveRes.body?.academicYear;
  const pubPrivacyValid = pubActiveRes.status === 200 &&
    pubYear?.yearCode === '2025–26' &&
    pubYear.createdBy === undefined &&
    pubYear.updatedBy === undefined &&
    pubYear.activatedAt === undefined &&
    pubYear.completedAt === undefined &&
    pubYear.archivedAt === undefined &&
    pubYear.__v === undefined;
  record('F1', 'Public /api/academic-years/active endpoint omits all internal administrative metadata', pubPrivacyValid);

  // =========================================================================
  // SCENARIO G: Historical Attendance Immutability, PUT/DELETE Guards, Sync & Archived Year Protection
  // =========================================================================
  console.log('\n--- SCENARIO G: Historical Attendance Immutability & Write Rejection ---');
  checkAbort();

  // G1. Seed Versioned Historical Record (2025–26) and Unversioned Legacy Record
  const historicDoc = await Attendance.create({
    id: 'att_historic_verif_01',
    attendanceId: 'att_historic_verif_01',
    academicYear: '2025–26',
    subject: 'C Programming',
    division: 'Div A',
    semester: '1st Semester',
    date: '15-08-25',
    isoDate: '2025-08-15',
    records: { student_alice: 'P' },
    facultyUsername: 'faculty_ada'
  });
  const legacyUnversionedDoc = await Attendance.create({
    id: 'att_legacy_unversioned_01',
    attendanceId: 'att_legacy_unversioned_01',
    academicYear: '',
    subject: 'C Programming',
    division: 'Div A',
    semester: '1st Semester',
    date: '10-08-24',
    isoDate: '2024-08-10',
    records: { student_alice: 'P' },
    facultyUsername: 'faculty_ada'
  });
  const historicPreParsed = await Attendance.findById(historicDoc._id).lean();

  // Create Successor Year 2026–27 (Upcoming) and transition 2025–26 -> completed, 2026–27 -> active
  const yr2Res = await request('POST', '/api/academic-years', {
    yearCode: '2026–27',
    title: 'Academic Year 2026–27',
    startDate: '2026-06-01',
    endDate: '2027-05-31',
    activeCycle: 'odd'
  }, adminToken);
  checkAbort();

  const yr2Id = yr2Res.body.academicYear?._id;
  if (yr2Res.status !== 201 || yr2Res.body.academicYear?.status !== 'upcoming') {
    throw new Error('Successor year creation failed in Scenario G.');
  }

  const completeYr1Res = await request('PATCH', `/api/academic-years/${yr1Id}/complete`, {
    transitionToYear: yr2Id
  }, adminToken);
  checkAbort();

  const docYr1After = await AcademicYear.findById(yr1Id).lean();
  const docYr2After = await AcademicYear.findById(yr2Id).lean();
  const activeCountAfter = await AcademicYear.countDocuments({ status: 'active' });
  const transitionSuccess = completeYr1Res.status === 200 &&
    docYr1After.status === 'completed' &&
    docYr2After.status === 'active' &&
    activeCountAfter === 1;
  record('G1', 'Verified lifecycle transition: predecessor completed, successor active, exactly one active year', transitionSuccess);
  if (!transitionSuccess) throw new Error('Prerequisite failed: Scenario G transition did not succeed.');

  // G2. Attempt Historical Write by Faculty with Valid Historical Allocation
  const historicBeforeAttempt = await Attendance.findById(historicDoc._id).lean();
  const unauthHistoricWriteRes = await request('POST', '/api/attendance', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div A',
    subject: 'C Programming',
    date: '15-08-25',
    isoDate: '2025-08-15',
    records: { student_alice: 'A' }
  }, facultyToken);
  checkAbort();

  const historicAfterAttempt = await Attendance.findById(historicDoc._id).lean();
  const historicWriteRejected = unauthHistoricWriteRes.status === 403 &&
    unauthHistoricWriteRes.body.code === 'ACADEMIC_YEAR_COMPLETED' &&
    (unauthHistoricWriteRes.body.message && unauthHistoricWriteRes.body.message.includes('strictly read-only')) &&
    JSON.stringify(historicBeforeAttempt) === JSON.stringify(historicAfterAttempt);
  record('G2', 'Attempted historical write by allocated faculty rejected (403 ACADEMIC_YEAR_COMPLETED) with zero database mutation', historicWriteRejected);

  // G3. Deep Immutability Comparison
  delete historicPreParsed._id;
  delete historicPreParsed.createdAt;
  delete historicPreParsed.updatedAt;

  const historicComparable = { ...historicAfterAttempt };
  delete historicComparable._id;
  delete historicComparable.createdAt;
  delete historicComparable.updatedAt;

  const immutabilityVerified = JSON.stringify(historicPreParsed) === JSON.stringify(historicComparable);
  record('G3', 'Historical attendance data remains completely immutable across transition and rejected write', immutabilityVerified);

  // G4. PUT /api/attendance (with/without :id) non-upsert 404, cross-year override 409, completed-year guard 403, & zero admin bypass
  const attSnapshotG4Before = await Attendance.find({}).lean();
  const putCrossYearRes = await request('PUT', `/api/attendance/${historicDoc.attendanceId}`, {
    academicYear: '2026–27',
    semester: '1st Semester',
    division: 'Div A',
    subject: 'C Programming',
    date: '15-08-25',
    isoDate: '2025-08-15',
    records: { student_alice: 'A' }
  }, facultyToken);

  const putCompletedByIdRes = await request('PUT', `/api/attendance/${historicDoc.attendanceId}`, {
    semester: '1st Semester',
    division: 'Div A',
    subject: 'C Programming',
    date: '15-08-25',
    isoDate: '2025-08-15',
    records: { student_alice: 'A' }
  }, adminToken);

  const putMissingIdRes = await request('PUT', '/api/attendance/att_nonexistent_id_999', {
    academicYear: '2026–27',
    semester: '3rd Semester',
    division: 'Div B',
    subject: 'Python Programming',
    date: '15-08-26',
    isoDate: '2026-08-15',
    records: { student_bob: 'P' }
  }, adminToken);

  const putNoParamMissingRes = await request('PUT', '/api/attendance', {
    academicYear: '2026–27',
    semester: '3rd Semester',
    division: 'Div B',
    subject: 'Python Programming',
    date: '16-08-26',
    isoDate: '2026-08-16',
    records: { student_bob: 'P' }
  }, adminToken);

  const adminCompletedWriteRes = await request('POST', '/api/attendance', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div A',
    subject: 'C Programming',
    date: '15-08-25',
    isoDate: '2025-08-15',
    records: { student_alice: 'A' }
  }, adminToken);
  checkAbort();

  const attSnapshotG4After = await Attendance.find({}).lean();
  const g4Passed =
    putCrossYearRes.status === 409 &&
    putCrossYearRes.body.code === 'IMMUTABLE_RECORD' &&
    putCompletedByIdRes.status === 403 &&
    putCompletedByIdRes.body.code === 'ACADEMIC_YEAR_COMPLETED' &&
    putMissingIdRes.status === 404 &&
    putMissingIdRes.body.code === 'ATTENDANCE_NOT_FOUND' &&
    putNoParamMissingRes.status === 404 &&
    putNoParamMissingRes.body.code === 'ATTENDANCE_NOT_FOUND' &&
    adminCompletedWriteRes.status === 403 &&
    adminCompletedWriteRes.body.code === 'ACADEMIC_YEAR_COMPLETED' &&
    JSON.stringify(attSnapshotG4Before) === JSON.stringify(attSnapshotG4After);
  record('G4', 'PUT /api/attendance (with/without :id) blocks upsert creation (404), cross-year override (409), and completed year even by admin (403)', g4Passed);

  // G4b. Completed-Year Timetable Immutability & Conflict Guards (Zero Admin Bypass)
  const ttSnapshotG4bBefore = await Timetable.find({}).lean();
  const ttPostCompletedRes = await request('POST', '/api/timetable', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div A',
    days: ['Monday'],
    timeSlots: ['09:00 - 10:00'],
    cells: [{ dayIndex: 0, slotIndex: 0, subject: 'DBMS' }]
  }, adminToken);
  const ttPutCompletedByIdRes = await request('PUT', '/api/timetable', {
    _id: String(ttDocC1._id),
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div A',
    days: ['Monday'],
    timeSlots: ['09:00 - 10:00'],
    cells: [{ dayIndex: 0, slotIndex: 0, subject: 'DBMS' }]
  }, adminToken);
  const ttDelCompletedRes = await request(
    'DELETE',
    `/api/timetable?id=${encodeURIComponent(String(ttDocC1._id))}&academicYear=${encodeURIComponent('2025–26')}`,
    null,
    adminToken
  );
  const ttSyncCompletedRes = await request('POST', '/api/timetable/sync', {
    academicYear: '2025–26',
    timetable: [{
      academicYear: '2025–26',
      semester: '1st Semester',
      division: 'Div A',
      day: 'Monday',
      time: '09:00 - 10:00',
      subject: 'C Programming',
      subjectText: 'C Programming'
    }]
  }, adminToken);
  const ttDelYearMismatchRes = await request(
    'DELETE',
    `/api/timetable?academicYear=${encodeURIComponent('2026–27')}`,
    { academicYear: '2025–26', semester: '1st Semester', division: 'Div A' },
    adminToken
  );
  checkAbort();

  const ttSnapshotG4bAfter = await Timetable.find({}).lean();
  const g4bPassed =
    ttPostCompletedRes.status === 403 &&
    ttPostCompletedRes.body.code === 'ACADEMIC_YEAR_COMPLETED' &&
    ttPutCompletedByIdRes.status === 403 &&
    ttPutCompletedByIdRes.body.code === 'ACADEMIC_YEAR_COMPLETED' &&
    ttDelCompletedRes.status === 403 &&
    ttDelCompletedRes.body.code === 'ACADEMIC_YEAR_COMPLETED' &&
    ttSyncCompletedRes.status === 403 &&
    ttSyncCompletedRes.body.code === 'ACADEMIC_YEAR_COMPLETED' &&
    ttDelYearMismatchRes.status === 400 &&
    ttDelYearMismatchRes.body.code === 'ACADEMIC_YEAR_MISMATCH' &&
    JSON.stringify(ttSnapshotG4bBefore) === JSON.stringify(ttSnapshotG4bAfter);
  record('G4b', 'Completed-year timetable save/update/delete/sync reject admin mutations (403) and query/body year mismatches (400)', g4bPassed);

  // G5. DELETE /api/attendance/:id blocks completed-year deletion, unversioned deletion, & ALL conflicting ID mismatches
  const delCompletedRes = await request('DELETE', `/api/attendance/${historicDoc.attendanceId}`, null, adminToken);
  const delLegacyRes = await request('DELETE', `/api/attendance/${legacyUnversionedDoc.attendanceId}`, null, adminToken);
  const delMismatchParamBodyAttRes = await request(
    'DELETE',
    `/api/attendance/${historicDoc.attendanceId}`,
    { attendanceId: 'conflicting_att_id_01' },
    adminToken
  );
  const delMismatchParamBodyIdRes = await request(
    'DELETE',
    `/api/attendance/${historicDoc.attendanceId}`,
    { id: 'conflicting_att_id_02' },
    adminToken
  );
  const delMismatchBodyAttBodyIdRes = await request(
    'DELETE',
    '/api/attendance',
    { attendanceId: historicDoc.attendanceId, id: 'conflicting_att_id_03' },
    adminToken
  );
  const delMismatchParamQueryIdRes = await request(
    'DELETE',
    `/api/attendance/${historicDoc.attendanceId}?id=${encodeURIComponent('conflicting_att_id_04')}`,
    null,
    adminToken
  );
  checkAbort();

  const attSnapshotG5After = await Attendance.find({}).lean();
  const g5Passed =
    delCompletedRes.status === 403 &&
    delCompletedRes.body.code === 'ACADEMIC_YEAR_COMPLETED' &&
    delLegacyRes.status === 409 &&
    delLegacyRes.body.code === 'IMMUTABLE_RECORD' &&
    delMismatchParamBodyAttRes.status === 400 &&
    delMismatchParamBodyAttRes.body.code === 'ATTENDANCE_ID_MISMATCH' &&
    delMismatchParamBodyIdRes.status === 400 &&
    delMismatchParamBodyIdRes.body.code === 'ATTENDANCE_ID_MISMATCH' &&
    delMismatchBodyAttBodyIdRes.status === 400 &&
    delMismatchBodyAttBodyIdRes.body.code === 'ATTENDANCE_ID_MISMATCH' &&
    delMismatchParamQueryIdRes.status === 400 &&
    delMismatchParamQueryIdRes.body.code === 'ATTENDANCE_ID_MISMATCH' &&
    JSON.stringify(attSnapshotG4After) === JSON.stringify(attSnapshotG5After);
  record('G5', 'DELETE /api/attendance blocks completed-year (403), unversioned legacy (409), and all conflicting ID combinations (400 ATTENDANCE_ID_MISMATCH)', g5Passed);

  // G6. POST /api/academic/sync blocks completed-year attendance/notice/timetable deletions & historical ID reuse
  const storeBeforeG6 = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();
  const noticeBeforeG6 = await Notice.find({}).lean();
  const syncDelCompletedRes = await request('POST', '/api/academic/sync', {
    deletedDailyAttendance: [historicDoc.attendanceId]
  }, adminToken);
  const syncDelLegacyRes = await request('POST', '/api/academic/sync', {
    deletedDailyAttendance: [legacyUnversionedDoc.attendanceId]
  }, adminToken);
  const syncIdReuseRes = await request('POST', '/api/academic/sync', {
    dailyAttendance: [{
      id: historicDoc.attendanceId,
      attendanceId: historicDoc.attendanceId,
      academicYear: '2026–27',
      semester: '3rd Semester',
      division: 'Div B',
      subject: 'Python Programming',
      date: '20-08-26',
      isoDate: '2026-08-20',
      records: { student_bob: 'P' }
    }]
  }, adminToken);
  const syncDelCompletedNoticeRes = await request('POST', '/api/academic/sync', {
    deletedNotices: ['notice_admin_ver_01']
  }, adminToken);
  const syncDelLegacyNoticeRes = await request('POST', '/api/academic/sync', {
    deletedNotices: ['notice_legacy_unver_01']
  }, adminToken);
  const syncCompletedTtRes = await request('POST', '/api/academic/sync', {
    timetable: [{
      academicYear: '2025–26',
      semester: '1st Semester',
      division: 'Div A',
      day: 'Monday',
      time: '09:00 - 10:00',
      subject: 'C Programming',
      subjectText: 'C Programming'
    }]
  }, adminToken);
  checkAbort();

  const attSnapshotG6After = await Attendance.find({}).lean();
  const storeAfterG6 = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();
  const noticeAfterG6 = await Notice.find({}).lean();
  const g6Passed =
    syncDelCompletedRes.status === 403 &&
    syncDelCompletedRes.body.code === 'ACADEMIC_YEAR_COMPLETED' &&
    syncDelLegacyRes.status === 409 &&
    syncDelLegacyRes.body.code === 'IMMUTABLE_RECORD' &&
    syncIdReuseRes.status === 409 &&
    syncIdReuseRes.body.code === 'IMMUTABLE_RECORD' &&
    syncDelCompletedNoticeRes.status === 403 &&
    syncDelCompletedNoticeRes.body.code === 'ACADEMIC_YEAR_COMPLETED' &&
    syncDelLegacyNoticeRes.status === 409 &&
    syncDelLegacyNoticeRes.body.code === 'IMMUTABLE_RECORD' &&
    syncCompletedTtRes.status === 403 &&
    syncCompletedTtRes.body.code === 'ACADEMIC_YEAR_COMPLETED' &&
    String(syncCompletedTtRes.body.message || '').includes('Academic timetable sync') &&
    JSON.stringify(attSnapshotG5After) === JSON.stringify(attSnapshotG6After) &&
    JSON.stringify(storeBeforeG6) === JSON.stringify(storeAfterG6) &&
    JSON.stringify(noticeBeforeG6) === JSON.stringify(noticeAfterG6);
  record('G6', 'POST /api/academic/sync blocks completed-year attendance/notice/timetable mutations, unversioned deletions, and historical ID reuse', g6Passed);

  // G7. Archived Academic Year Write Rejection (Both Direct Attendance & Academic Sync, Admin & Faculty)
  const archYr1Res = await request('PATCH', `/api/academic-years/${yr1Id}/archive`, {}, adminToken);
  if (archYr1Res.status !== 200) {
    throw new Error('Prerequisite failed in G7: unable to archive completed year 2025–26.');
  }

  const archivedAttAdminRes = await request('POST', '/api/attendance', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div A',
    subject: 'C Programming',
    date: '16-08-25',
    isoDate: '2025-08-16',
    records: { student_alice: 'A' }
  }, adminToken);
  const archivedAttFacRes = await request('POST', '/api/attendance', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div A',
    subject: 'C Programming',
    date: '16-08-25',
    isoDate: '2025-08-16',
    records: { student_alice: 'A' }
  }, facultyToken);
  const archivedSyncAdminRes = await request('POST', '/api/academic/sync', {
    dailyAttendance: [{
      id: 'att_archived_attempt_01',
      academicYear: '2025–26',
      semester: '1st Semester',
      division: 'Div A',
      subject: 'C Programming',
      date: '16-08-25',
      isoDate: '2025-08-16',
      records: { student_alice: 'A' }
    }]
  }, adminToken);
  const archivedSyncFacRes = await request('POST', '/api/academic/sync', {
    dailyAttendance: [{
      id: 'att_archived_attempt_02',
      academicYear: '2025–26',
      semester: '1st Semester',
      division: 'Div A',
      subject: 'C Programming',
      date: '16-08-25',
      isoDate: '2025-08-16',
      records: { student_alice: 'A' }
    }]
  }, facultyToken);
  checkAbort();

  const attSnapshotG7After = await Attendance.find({}).lean();
  const storeAfterG7 = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();
  const g7Passed =
    archivedAttAdminRes.status === 403 &&
    archivedAttAdminRes.body.code === 'ACADEMIC_YEAR_ARCHIVED' &&
    archivedAttFacRes.status === 403 &&
    archivedAttFacRes.body.code === 'ACADEMIC_YEAR_ARCHIVED' &&
    archivedSyncAdminRes.status === 403 &&
    archivedSyncAdminRes.body.code === 'ACADEMIC_YEAR_ARCHIVED' &&
    archivedSyncFacRes.status === 403 &&
    archivedSyncFacRes.body.code === 'ACADEMIC_YEAR_ARCHIVED' &&
    JSON.stringify(attSnapshotG6After) === JSON.stringify(attSnapshotG7After) &&
    JSON.stringify(storeAfterG6) === JSON.stringify(storeAfterG7);
  record('G7', 'Archived academic year rejects both direct attendance and sync mutations for admin and faculty (403 ACADEMIC_YEAR_ARCHIVED)', g7Passed);

  // =========================================================================
  // SCENARIO H: Timetable Compound Uniqueness (Startup-Synced Index + Partial Filter)
  // =========================================================================
  console.log('\n--- SCENARIO H: Timetable Compound Uniqueness ---');
  checkAbort();

  // Inspect Native MongoDB Catalog synced during startup initDatabase() (zero manual createIndexes()!)
  const rawTtIndexes = await mongoose.connection.db.collection('timetables').indexes();
  const ttCompoundIdx = rawTtIndexes.find(idx =>
    idx.key &&
    idx.key.academicYear === 1 &&
    idx.key.semester === 1 &&
    idx.key.division === 1
  );
  const ttIndexCatalogValid = ttCompoundIdx &&
    ttCompoundIdx.unique === true &&
    ttCompoundIdx.partialFilterExpression?.days?.$exists === true &&
    ttCompoundIdx.partialFilterExpression?.days?.$type === 'array';
  record('H1', 'Timetable compound unique index verified from startup sync in native catalog', !!ttIndexCatalogValid,
    `Key: ${JSON.stringify(ttCompoundIdx?.key)}, Partial: ${JSON.stringify(ttCompoundIdx?.partialFilterExpression)}`);

  // 1. First Timetable Record in 2026–27
  const ttH1 = await Timetable.create({
    academicYear: '2026–27',
    semester: '1st Semester',
    division: 'Div A',
    days: ['Monday'],
    timeSlots: ['09:00 - 10:00'],
    cells: [{ dayIndex: 0, slotIndex: 0, subject: 'C Programming' }]
  });

  // 2. Second Timetable Record with Identical Keys (Must Fail with Code 11000)
  let ttDupCode11000 = false;
  try {
    await Timetable.create({
      academicYear: '2026–27',
      semester: '1st Semester',
      division: 'Div A',
      days: ['Tuesday'],
      timeSlots: ['10:00 - 11:00'],
      cells: []
    });
  } catch (err) {
    if (err.code === 11000 &&
        err.keyPattern?.academicYear === 1 &&
        err.keyPattern?.semester === 1 &&
        err.keyPattern?.division === 1) {
      ttDupCode11000 = true;
    }
  }
  const ttH1Preserved = await Timetable.findById(ttH1._id).lean();
  record('H2', 'Timetable compound unique index rejects duplicate in same year with E11000 and preserves original', ttDupCode11000 && ttH1Preserved.days[0] === 'Monday');

  // 3. Cross-year coexistence & partial-filter exclusion for legacy records without days[]
  const ttCrossYear = await Timetable.create({
    academicYear: '2027–28',
    semester: '1st Semester',
    division: 'Div A',
    days: ['Monday'],
    timeSlots: ['09:00 - 10:00'],
    cells: []
  });
  const ttLegacyA = await Timetable.create({
    academicYear: '2026–27',
    semester: '1st Semester',
    division: 'Div A',
    subjectText: 'Legacy Partial Slot A'
  });
  const ttLegacyB = await Timetable.create({
    academicYear: '2026–27',
    semester: '1st Semester',
    division: 'Div A',
    subjectText: 'Legacy Partial Slot B'
  });
  record('H3', 'Timetable index permits cross-year coexistence and excludes legacy docs missing days[] array',
    !!ttCrossYear._id && !!ttLegacyA._id && !!ttLegacyB._id);

  // 4. Legacy per-slot unique index includes academicYear: 1 with partialFilterExpression so slot keys coexist across years
  const ttSlotIdx = rawTtIndexes.find(idx =>
    idx.key &&
    idx.key.academicYear === 1 &&
    idx.key.division === 1 &&
    idx.key.semester === 1 &&
    idx.key.day === 1 &&
    idx.key.time === 1
  );
  const ttSlotCatalogValid = ttSlotIdx &&
    ttSlotIdx.unique === true &&
    ttSlotIdx.partialFilterExpression?.academicYear?.$type === 'string' &&
    ttSlotIdx.partialFilterExpression?.academicYear?.$gt === '' &&
    ttSlotIdx.partialFilterExpression?.day?.$exists === true &&
    ttSlotIdx.partialFilterExpression?.day?.$type === 'string';

  const ttSlotY1 = await Timetable.create({
    academicYear: '2026–27',
    division: 'Div A',
    semester: '1st Semester',
    day: 'Monday',
    time: '09:00 - 10:00',
    subject: 'C Programming'
  });
  const ttSlotY2 = await Timetable.create({
    academicYear: '2027–28',
    division: 'Div A',
    semester: '1st Semester',
    day: 'Monday',
    time: '09:00 - 10:00',
    subject: 'C Programming'
  });
  let ttSlotDupRejected = false;
  try {
    await Timetable.create({
      academicYear: '2026–27',
      division: 'Div A',
      semester: '1st Semester',
      day: 'Monday',
      time: '09:00 - 10:00',
      subject: 'Operating Systems'
    });
  } catch (err) {
    if (err.code === 11000) ttSlotDupRejected = true;
  }
  const ttSlotUnversioned1 = await Timetable.create({
    academicYear: '',
    division: 'Div A',
    semester: '1st Semester',
    day: 'Monday',
    time: '09:00 - 10:00',
    subject: 'Legacy Slot A'
  });
  const ttSlotUnversioned2 = await Timetable.create({
    academicYear: '',
    division: 'Div A',
    semester: '1st Semester',
    day: 'Monday',
    time: '09:00 - 10:00',
    subject: 'Legacy Slot B'
  });
  record(
    'H4',
    'Timetable slot unique index enforces same-year uniqueness, allows cross-year coexistence, and excludes multiple equivalent unversioned slots',
    !!ttSlotCatalogValid && !!ttSlotY1._id && !!ttSlotY2._id && ttSlotDupRejected && !!ttSlotUnversioned1._id && !!ttSlotUnversioned2._id,
    `SlotKey: ${JSON.stringify(ttSlotIdx?.key)}, Partial: ${JSON.stringify(ttSlotIdx?.partialFilterExpression)}`
  );

  // =========================================================================
  // SCENARIO I: CIE Mark Compound Uniqueness (Startup-Synced Index + Partial Filter)
  // =========================================================================
  console.log('\n--- SCENARIO I: CIE Mark Compound Uniqueness ---');
  checkAbort();

  // Inspect Native MongoDB Catalog synced during startup initDatabase() (zero manual createIndexes()!)
  const rawMarkIndexes = await mongoose.connection.db.collection('marks').indexes();
  const markCompoundIdx = rawMarkIndexes.find(idx =>
    idx.key &&
    idx.key.academicYear === 1 &&
    idx.key.studentUsername === 1 &&
    idx.key.subject === 1
  );
  const markIndexCatalogValid = markCompoundIdx &&
    markCompoundIdx.unique === true &&
    markCompoundIdx.partialFilterExpression?.academicYear?.$type === 'string' &&
    markCompoundIdx.partialFilterExpression?.academicYear?.$gt === '';
  record('I1', 'Mark compound unique index verified from startup sync in native catalog', !!markIndexCatalogValid,
    `Key: ${JSON.stringify(markCompoundIdx?.key)}, Partial: ${JSON.stringify(markCompoundIdx?.partialFilterExpression)}`);

  // 1. First Mark Record (Explicit distinct markId to isolate compound index from markId_1)
  const markI1 = await Mark.create({
    markId: 'mark_distinct_001',
    academicYear: '2026–27',
    studentUsername: 'student_alice',
    subject: 'C Programming',
    internal1: 18,
    maxInternal1: 20
  });

  // 2. Second Mark Record with Identical Compound Keys but Distinct markId
  let markCompoundDupBlocked = false;
  try {
    await Mark.create({
      markId: 'mark_distinct_002',
      academicYear: '2026–27',
      studentUsername: 'student_alice',
      subject: 'C Programming',
      internal1: 14
    });
  } catch (err) {
    if (err.code === 11000 &&
        err.keyPattern?.academicYear === 1 &&
        err.keyPattern?.studentUsername === 1 &&
        err.keyPattern?.subject === 1) {
      markCompoundDupBlocked = true;
    }
  }
  const markI1Preserved = await Mark.findById(markI1._id).lean();
  record('I2', 'Mark compound unique index rejects duplicate on exact keyPattern with E11000 (isolated from markId_1)', markCompoundDupBlocked && markI1Preserved.internal1 === 18);

  // 3. Cross-year mark coexistence for same student & subject, plus partial filter exclusion of unversioned legacy marks
  const markCrossYear = await Mark.create({
    markId: 'mark_cross_2025_alice_cprog',
    academicYear: '2025–26',
    studentUsername: 'student_alice',
    subject: 'C Programming',
    internal1: 15
  });
  const markLegacyA = await Mark.create({
    markId: 'mark_legacy_unversioned_01',
    academicYear: '',
    studentUsername: 'student_alice',
    subject: 'C Programming',
    internal1: 12
  });
  const markLegacyB = await Mark.create({
    markId: 'mark_legacy_unversioned_02',
    academicYear: '',
    studentUsername: 'student_alice',
    subject: 'C Programming',
    internal1: 13
  });
  record('I3', 'Mark index permits same student+subject across years and excludes legacy empty-year records',
    !!markCrossYear._id && !!markLegacyA._id && !!markLegacyB._id);

  // =========================================================================
  // SCENARIO J: Unauthorized Persistence Protection (Allocated Faculty in Active Year 2026–27)
  // =========================================================================
  console.log('\n--- SCENARIO J: Unauthorized Persistence Protection ---');
  checkAbort();

  const attSnapshotJBefore = await Attendance.find({}).lean();

  // Charles has active allocation in 2026–27 for Python Programming (3rd Sem, Div B);
  // Operating System (3rd Sem, Div B) is unassigned and must fail specifically with UNAUTHORIZED_SUBJECT
  const unauthJRes = await request('POST', '/api/attendance', {
    academicYear: '2026–27',
    semester: '3rd Semester',
    division: 'Div B',
    subject: 'Operating System',
    date: '30-08-26',
    isoDate: '2026-08-30',
    records: { student_bob: 'P' }
  }, faculty2Token);
  checkAbort();

  const attSnapshotJAfter = await Attendance.find({}).lean();
  const zeroJMutation = unauthJRes.status === 403 &&
    unauthJRes.body.code === 'UNAUTHORIZED_SUBJECT' &&
    JSON.stringify(attSnapshotJBefore) === JSON.stringify(attSnapshotJAfter);
  record('J1', 'Allocated faculty in active 2026–27 rejected for unassigned subject (403 UNAUTHORIZED_SUBJECT) with zero mutation', zeroJMutation);

  // =========================================================================
  // SCENARIO L: Round 3.2/3.4 Route Protections (Division Cascade, Assignment Status, Attachment Visibility)
  // =========================================================================
  console.log('\n--- SCENARIO L: Division Cascade, Assignment Status & Student Attachment Security ---');
  checkAbort();

  // L1. Division Cascade requires operational academicYear, rejects archived 2025–26, and fails closed on standalone 503 before any mutation
  const cascMissingYrRes = await request('POST', '/api/academic/divisions/cascade', {
    action: 'rename',
    courseYear: '2nd Year',
    oldDivision: 'Div TempL1',
    newDivision: 'Div RenamedL1'
  }, adminToken);
  const cascArchivedYrRes = await request('POST', '/api/academic/divisions/cascade', {
    action: 'rename',
    courseYear: '2nd Year',
    oldDivision: 'Div TempL1',
    newDivision: 'Div RenamedL1',
    academicYear: '2025–26'
  }, adminToken);

  await Assignment.create({
    id: 'l1_act_asgn',
    assignmentId: 'l1_act_asgn',
    title: 'L1 Active Year Assignment',
    subject: 'Python Programming',
    semester: '3rd Semester',
    targetDivision: 'Div TempL1',
    academicYear: '2026–27'
  });
  await Assignment.create({
    id: 'l1_hist_asgn',
    assignmentId: 'l1_hist_asgn',
    title: 'L1 Historical Assignment',
    subject: 'C Programming',
    semester: '1st Semester',
    targetDivision: 'Div TempL1',
    academicYear: '2025–26'
  });
  await AcademicStore.updateOne(
    { storeKey: 'default_academic_store' },
    {
      $push: {
        assignments: {
          $each: [
            { id: 'l1_act_asgn', assignmentId: 'l1_act_asgn', title: 'L1 Active Year Assignment', subject: 'Python Programming', semester: '3rd Semester', targetDivision: 'Div TempL1', academicYear: '2026–27' },
            { id: 'l1_unver_asgn', assignmentId: 'l1_unver_asgn', title: 'L1 Unversioned Legacy Assignment', subject: 'C Programming', targetDivision: 'Div TempL1' }
          ]
        }
      }
    }
  );

  const cascStandaloneActiveRes = await request('POST', '/api/academic/divisions/cascade', {
    action: 'rename',
    courseYear: '2nd Year',
    oldDivision: 'Div TempL1',
    newDivision: 'Div RenamedL1',
    academicYear: '2026–27'
  }, adminToken);
  checkAbort();

  const l1ActDb = await Assignment.findOne({ assignmentId: 'l1_act_asgn' }).lean();
  const l1HistDb = await Assignment.findOne({ assignmentId: 'l1_hist_asgn' }).lean();
  const l1StoreAfter = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();
  const l1ActStore = (l1StoreAfter?.assignments || []).find(a => a.assignmentId === 'l1_act_asgn');
  const l1UnverStore = (l1StoreAfter?.assignments || []).find(a => a.assignmentId === 'l1_unver_asgn');
  await Assignment.deleteMany({ assignmentId: { $in: ['l1_act_asgn', 'l1_hist_asgn'] } });
  await AcademicStore.updateOne(
    { storeKey: 'default_academic_store' },
    { $pull: { assignments: { assignmentId: { $in: ['l1_act_asgn', 'l1_unver_asgn'] } } } }
  );

  record(
    'L1',
    'Division cascade enforces operational year, rejects archived year, and fails closed 503 on standalone with zero partial writes',
    cascMissingYrRes.status === 400 &&
      cascMissingYrRes.body.code === 'ACADEMIC_YEAR_REQUIRED' &&
      cascArchivedYrRes.status === 403 &&
      cascArchivedYrRes.body.code === 'ACADEMIC_YEAR_ARCHIVED' &&
      cascStandaloneActiveRes.status === 503 &&
      cascStandaloneActiveRes.body.code === 'TRANSACTIONS_REQUIRED' &&
      cascStandaloneActiveRes.body.atomicTransactionsSupported === false &&
      l1ActDb?.targetDivision === 'Div TempL1' &&
      l1ActStore?.targetDivision === 'Div TempL1' &&
      l1HistDb?.targetDivision === 'Div TempL1' &&
      l1UnverStore?.targetDivision === 'Div TempL1'
  );

  // L2. Assignment Status distinguishes no allocation, wrong subject, wrong division, wrong semester, wrong year, ID conflicts & updates authorized record
  await Assignment.create([
    {
      id: 'l2_active_asgn',
      assignmentId: 'l2_active_asgn',
      title: 'L2 Active Python Lab',
      subject: 'Python Programming',
      semester: '3rd Semester',
      targetDivision: 'Div B',
      student: 'student_bob',
      facultyUsername: 'faculty_charles',
      status: 'Pending',
      academicYear: '2026–27'
    },
    {
      id: 'l2_wrong_sub',
      assignmentId: 'l2_wrong_sub',
      title: 'L2 Wrong Subject OS Lab',
      subject: 'Operating System',
      semester: '3rd Semester',
      targetDivision: 'Div B',
      student: 'student_bob',
      facultyUsername: 'faculty_charles',
      status: 'Pending',
      academicYear: '2026–27'
    },
    {
      id: 'l2_wrong_div',
      assignmentId: 'l2_wrong_div',
      title: 'L2 Wrong Div Python Lab',
      subject: 'Python Programming',
      semester: '3rd Semester',
      targetDivision: 'Div A',
      student: 'student_bob',
      facultyUsername: 'faculty_charles',
      status: 'Pending',
      academicYear: '2026–27'
    },
    {
      id: 'l2_wrong_sem',
      assignmentId: 'l2_wrong_sem',
      title: 'L2 Wrong Sem Python Lab',
      subject: 'Python Programming',
      semester: '4th Semester',
      targetDivision: 'Div B',
      student: 'student_bob',
      facultyUsername: 'faculty_charles',
      status: 'Pending',
      academicYear: '2026–27'
    },
    {
      id: 'l2_wrong_yr',
      assignmentId: 'l2_wrong_yr',
      title: 'L2 Historical 2025 Task',
      subject: 'C Programming',
      semester: '1st Semester',
      targetDivision: 'Div A',
      student: 'student_bob',
      facultyUsername: 'faculty_ada',
      status: 'Pending',
      academicYear: '2025–26'
    },
    {
      id: 'l2_clash_db',
      assignmentId: 'l2_clash_db',
      title: 'L2 Ambiguous Clash Title',
      subject: 'Python Programming',
      semester: '3rd Semester',
      targetDivision: 'Div B',
      student: 'student_bob',
      facultyUsername: 'faculty_charles',
      status: 'Pending',
      academicYear: '2026–27'
    }
  ]);
  await AcademicStore.updateOne(
    { storeKey: 'default_academic_store' },
    {
      $push: {
        assignments: {
          $each: [
            {
              id: 'l2_active_asgn',
              assignmentId: 'l2_active_asgn',
              title: 'L2 Active Python Lab',
              subject: 'Python Programming',
              division: 'Div B',
              targetDivision: 'Div B',
              semester: '3rd Semester',
              student: 'student_bob',
              facultyUsername: 'faculty_charles',
              status: 'Pending',
              academicYear: '2026–27'
            },
            {
              id: 'l2_unver_asgn',
              assignmentId: 'l2_unver_asgn',
              title: 'L2 Legacy Unversioned Task',
              subject: 'C Programming',
              student: 'student_bob',
              status: 'Pending'
            },
            {
              id: 'l2_clash_store',
              assignmentId: 'l2_clash_store',
              title: 'L2 Ambiguous Clash Title',
              subject: 'Python Programming',
              targetDivision: 'Div B',
              semester: '3rd Semester',
              student: 'student_bob',
              facultyUsername: 'faculty_charles',
              status: 'Pending',
              academicYear: '2026–27'
            }
          ]
        }
      }
    }
  );

  const l2MissingYr = await request('POST', '/api/academic/assignment-status', {
    studentUsername: 'student_bob',
    title: 'L2 Active Python Lab',
    assignmentId: 'l2_active_asgn',
    status: 'Submitted'
  }, faculty2Token);
  const l2UnverReject = await request('POST', '/api/academic/assignment-status', {
    academicYear: '2026–27',
    studentUsername: 'student_bob',
    title: 'L2 Legacy Unversioned Task',
    assignmentId: 'l2_unver_asgn',
    status: 'Submitted'
  }, adminToken);
  const l2NoAlloc = await request('POST', '/api/academic/assignment-status', {
    academicYear: '2026–27',
    studentUsername: 'student_bob',
    title: 'L2 Active Python Lab',
    assignmentId: 'l2_active_asgn',
    status: 'Submitted'
  }, facultyToken);
  const l2WrongSub = await request('POST', '/api/academic/assignment-status', {
    academicYear: '2026–27',
    studentUsername: 'student_bob',
    title: 'L2 Wrong Subject OS Lab',
    assignmentId: 'l2_wrong_sub',
    status: 'Submitted'
  }, faculty2Token);
  const l2WrongDiv = await request('POST', '/api/academic/assignment-status', {
    academicYear: '2026–27',
    studentUsername: 'student_bob',
    title: 'L2 Wrong Div Python Lab',
    assignmentId: 'l2_wrong_div',
    status: 'Submitted'
  }, faculty2Token);
  const l2WrongSem = await request('POST', '/api/academic/assignment-status', {
    academicYear: '2026–27',
    studentUsername: 'student_bob',
    title: 'L2 Wrong Sem Python Lab',
    assignmentId: 'l2_wrong_sem',
    status: 'Submitted'
  }, faculty2Token);
  const l2WrongYear = await request('POST', '/api/academic/assignment-status', {
    academicYear: '2026–27',
    studentUsername: 'student_bob',
    title: 'L2 Historical 2025 Task',
    assignmentId: 'l2_wrong_yr',
    status: 'Submitted'
  }, adminToken);
  const l2IdClash = await request('POST', '/api/academic/assignment-status', {
    academicYear: '2026–27',
    studentUsername: 'student_bob',
    title: 'L2 Ambiguous Clash Title',
    status: 'Submitted'
  }, faculty2Token);
  const l2ValidFac = await request('POST', '/api/academic/assignment-status', {
    academicYear: '2026–27',
    studentUsername: 'student_bob',
    title: 'L2 Active Python Lab',
    assignmentId: 'l2_active_asgn',
    status: 'Submitted'
  }, faculty2Token);
  checkAbort();

  const l2DbAfter = await Assignment.findOne({ assignmentId: 'l2_active_asgn' }).lean();
  const l2StoreAfter = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();
  const l2StoreEntry = (l2StoreAfter?.assignments || []).find(a => a.assignmentId === 'l2_active_asgn');
  await Assignment.deleteMany({
    assignmentId: { $in: ['l2_active_asgn', 'l2_wrong_sub', 'l2_wrong_div', 'l2_wrong_sem', 'l2_wrong_yr', 'l2_clash_db'] }
  });
  await AcademicStore.updateOne(
    { storeKey: 'default_academic_store' },
    { $pull: { assignments: { assignmentId: { $in: ['l2_active_asgn', 'l2_unver_asgn', 'l2_clash_store'] } } } }
  );

  record(
    'L2',
    'Assignment status distinguishes missing year, unversioned record, no allocation, wrong subject/div/sem/year, ID conflicts, and valid updates',
    l2MissingYr.status === 400 &&
      l2MissingYr.body.code === 'ACADEMIC_YEAR_REQUIRED' &&
      l2UnverReject.status === 409 &&
      l2UnverReject.body.code === 'IMMUTABLE_RECORD' &&
      l2NoAlloc.status === 403 &&
      l2NoAlloc.body.code === 'NO_ACTIVE_ALLOCATIONS' &&
      l2WrongSub.status === 403 &&
      l2WrongSub.body.code === 'UNAUTHORIZED_SUBJECT' &&
      l2WrongDiv.status === 403 &&
      l2WrongDiv.body.code === 'UNAUTHORIZED_DIVISION' &&
      l2WrongSem.status === 403 &&
      l2WrongSem.body.code === 'UNAUTHORIZED_SEMESTER' &&
      l2WrongYear.status === 409 &&
      l2WrongYear.body.code === 'IMMUTABLE_RECORD' &&
      l2IdClash.status === 409 &&
      l2IdClash.body.code === 'AMBIGUOUS_ASSIGNMENT_RECORD' &&
      l2ValidFac.status === 200 &&
      l2DbAfter?.status === 'Submitted' &&
      l2StoreEntry?.status === 'Submitted'
  );

  // L3. Attachment download resolves active operational year (ignoring stale user.academicYear), rejects unversioned notes/assignments, and checks notice division
  const attachmentsDirL3 = path.join(PROJECT_ROOT, 'uploads', 'attachments');
  const l3DivFile = 'l3_divb_notice_test.png';
  const l3HistFile = 'l3_2025_hist_notice.png';
  const l3UnverNoteFile = 'l3_unver_note.png';
  const l3PngBuf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  let l3Passed = false;
  try {
    fs.mkdirSync(attachmentsDirL3, { recursive: true });
    fs.writeFileSync(path.join(attachmentsDirL3, l3DivFile), l3PngBuf);
    fs.writeFileSync(path.join(attachmentsDirL3, l3HistFile), l3PngBuf);
    fs.writeFileSync(path.join(attachmentsDirL3, l3UnverNoteFile), l3PngBuf);

    await Notice.create({
      id: 'notice_l3_divb',
      noticeId: 'notice_l3_divb',
      title: 'L3 Active 2026-27 Div B Notice',
      target: 'student',
      targetRole: 'student',
      targetDivision: 'Div B',
      academicYear: '2026–27',
      fileName: l3DivFile,
      fileData: `/api/academic/attachments/${l3DivFile}`
    });
    await Notice.create({
      id: 'notice_l3_hist',
      noticeId: 'notice_l3_hist',
      title: 'L3 Historical 2025-26 Notice',
      target: 'all',
      targetRole: 'all',
      targetDivision: 'all',
      academicYear: '2025–26',
      fileName: l3HistFile,
      fileData: `/api/academic/attachments/${l3HistFile}`
    });
    await Note.create({
      id: 'note_l3_unver',
      noteId: 'note_l3_unver',
      subject: 'Python Programming',
      title: 'L3 Unversioned Note',
      division: 'All Divisions',
      uploadedBy: 'faculty_charles',
      academicYear: '',
      fileName: l3UnverNoteFile,
      fileData: `/api/academic/attachments/${l3UnverNoteFile}`
    });

    const aliceWrongDiv = await request('GET', `/api/academic/attachments/${l3DivFile}`, null, aliceToken);
    const bobRightActiveDiv = await request('GET', `/api/academic/attachments/${l3DivFile}`, null, bobToken);
    const bobStaleProfileBlocked = await request('GET', `/api/academic/attachments/${l3HistFile}`, null, bobToken);
    const bobUnverNoteBlocked = await request('GET', `/api/academic/attachments/${l3UnverNoteFile}`, null, bobToken);
    const facAllowHist = await request('GET', `/api/academic/attachments/${l3HistFile}`, null, faculty2Token);
    checkAbort();

    l3Passed =
      aliceWrongDiv.status === 403 &&
      bobRightActiveDiv.status === 200 &&
      bobStaleProfileBlocked.status === 403 &&
      bobUnverNoteBlocked.status === 403 &&
      facAllowHist.status === 200;
  } finally {
    await Notice.deleteMany({ noticeId: { $in: ['notice_l3_divb', 'notice_l3_hist'] } }).catch(() => {});
    await Note.deleteMany({ noteId: 'note_l3_unver' }).catch(() => {});
    for (const f of [path.join(attachmentsDirL3, l3DivFile), path.join(attachmentsDirL3, l3HistFile), path.join(attachmentsDirL3, l3UnverNoteFile)]) {
      if (fs.existsSync(f)) {
        try { fs.unlinkSync(f); } catch (_) {}
      }
    }
  }
  record('L3', 'Attachment authorization uses active operational year (ignoring stale user.academicYear) and blocks unversioned notes/cross-division notices', l3Passed);

  // =========================================================================
  // SCENARIO K: Same-Process Serialized Queue & CAS Precondition Activation Contention
  // =========================================================================
  console.log('\n--- SCENARIO K: Same-Process Serialized Queue & CAS Activation Contention ---');
  checkAbort();

  // Create Two Competing Upcoming Years
  const yrK1Res = await request('POST', '/api/academic-years', {
    yearCode: '2028–29',
    title: 'Academic Year 2028–29',
    startDate: '2028-06-01',
    endDate: '2029-05-31',
    activeCycle: 'odd'
  }, adminToken);
  const yrK1Id = yrK1Res.body.academicYear?._id;

  const yrK2Res = await request('POST', '/api/academic-years', {
    yearCode: '2029–30',
    title: 'Academic Year 2029–30',
    startDate: '2029-06-01',
    endDate: '2030-05-31',
    activeCycle: 'odd'
  }, adminToken);
  const yrK2Id = yrK2Res.body.academicYear?._id;

  const yrK1Doc = await AcademicYear.findById(yrK1Id).lean();
  const yrK2Doc = await AcademicYear.findById(yrK2Id).lean();
  if (yrK1Res.status !== 201 || yrK2Res.status !== 201 || yrK1Doc.status !== 'upcoming' || yrK2Doc.status !== 'upcoming') {
    throw new Error('Prerequisite failed: Competing academic years were not created in upcoming status.');
  }

  // Record Active Year Prior to Race
  const prevActiveBeforeK = await AcademicYear.findOne({ status: 'active' }).lean();

  // Send Competing Concurrent Activation Requests WITH IDENTICAL EXPECTED ACTIVE-YEAR PRECONDITION
  const [cRes1, cRes2] = await Promise.all([
    request('PATCH', `/api/academic-years/${yrK1Id}/activate`, {
      expectedActiveYearId: String(prevActiveBeforeK._id),
      expectedActiveYearCode: prevActiveBeforeK.yearCode
    }, adminToken),
    request('PATCH', `/api/academic-years/${yrK2Id}/activate`, {
      expectedActiveYearId: String(prevActiveBeforeK._id),
      expectedActiveYearCode: prevActiveBeforeK.yearCode
    }, adminToken)
  ]);
  checkAbort();

  const kWinners = [cRes1, cRes2].filter(r => r.status === 200);
  const kConflicts = [cRes1, cRes2].filter(r => r.status === 409 && r.body?.code === 'LIFECYCLE_CONFLICT');
  const activeYearsInDb = await AcademicYear.find({ status: 'active' }).lean();
  const exactlyOneActive = activeYearsInDb.length === 1;
  const winningYear = activeYearsInDb[0]?.yearCode;
  const winnerValid = winningYear === '2028–29' || winningYear === '2029–30';

  const losingId = winningYear === '2028–29' ? yrK2Id : yrK1Id;
  const losingDoc = await AcademicYear.findById(losingId).lean();
  const prevDocAfterK = await AcademicYear.findById(prevActiveBeforeK._id).lean();
  const storeAfterK = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();
  const storeCountAfterK = await AcademicStore.countDocuments({});

  record('K1', 'Same-process serialized contention with shared expectedActiveYearId yields exactly 1x 200 winner and 1x 409 LIFECYCLE_CONFLICT loser', kWinners.length === 1 && kConflicts.length === 1);
  record('K2', 'Same-process queue activation leaves exactly one active academic year in database', exactlyOneActive && winnerValid, `Winning active year: "${winningYear}"`);
  record('K3', 'Previous active year completed, losing competitor remains upcoming, and single AcademicStore synced to winning year', prevDocAfterK.status === 'completed' && losingDoc.status === 'upcoming' && storeAfterK?.activeAcademicYear === winningYear && storeCountAfterK === 1);
}

// Top-Level Execution and Shutdown Pipeline
(async () => {
  try {
    await runMasterVerification();
  } catch (err) {
    harnessError = err;
    console.error('\n[FATAL ERROR IN HARNESS RUNNER]:', err.message || err);
  } finally {
    try {
      await executeShutdown('normal');
    } catch (cleanupErr) {
      console.error('\n[FATAL CLEANUP FAILURE]:', cleanupErr.message || cleanupErr);
      if (!harnessError) harnessError = cleanupErr;
    }
    printFinalDiagnosticSummary();
  }
})();
