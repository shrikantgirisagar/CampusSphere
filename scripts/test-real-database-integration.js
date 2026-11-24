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
  mongodInstance = await MongoMemoryServer.create({
    instance: {
      dbName: TEST_DB_NAME,
      ip: TEST_HOST
    }
  });

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

  // Poll for Server Readiness
  let isOnline = false;
  for (let i = 0; i < 25; i++) {
    checkAbort();
    await new Promise((resolve) => setTimeout(resolve, 200));
    try {
      const ping = await request('GET', '/api/status');
      if (ping.status === 200 && ping.body.databaseState === 'connected' && ping.body.initialized === true) {
        isOnline = true;
        break;
      }
    } catch (_) {}
  }
  if (!isOnline) throw new Error('Express server failed to reach healthy state on 127.0.0.1:' + TEST_PORT);
  console.log('  [OK] Express application online and healthy on 127.0.0.1:' + TEST_PORT);
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

  // Seed Faculty 1 with Active Allocation for 2025–26 (Java, Div A, Sem 1)
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
      subject: 'Java Programming',
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

  // Seed Faculty 2 with Allocation for 2026–27 (Web Dev, Div B, Sem 1)
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
      subject: 'Web Development',
      division: 'Div B',
      semester: '1st Semester',
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
  // SCENARIO B: Faculty Attendance Authorization (On Active Year 2025–26)
  // =========================================================================
  console.log('\n--- SCENARIO B: Faculty Attendance Authorization ---');
  checkAbort();

  // B1. Authorized Attendance Post (Allocated: Java Programming, Div A, 1st Semester, 2025–26)
  const authAttRes = await request('POST', '/api/attendance', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div A',
    subject: 'Java Programming',
    date: '2025-08-10',
    records: { student_alice: 'P' }
  }, facultyToken);
  checkAbort();

  const authAttDoc = await Attendance.findOne({ academicYear: '2025–26', subject: 'Java Programming', date: '2025-08-10' }).lean();
  record('B1', 'Authorized faculty attendance request succeeds (200) and persists in active year', authAttRes.status === 200 && !!authAttDoc && authAttDoc.records?.student_alice === 'P');

  // B2. Unauthorized Subject Post (Python Programming not allocated)
  const attSnapshotBBefore = await Attendance.find({}).lean();
  const unauthSubRes = await request('POST', '/api/attendance', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div A',
    subject: 'Python Programming',
    date: '2025-08-10',
    records: { student_alice: 'P' }
  }, facultyToken);
  checkAbort();

  const attSnapshotBAfter = await Attendance.find({}).lean();
  const unauthSubZeroMutation = unauthSubRes.status === 403 &&
    (unauthSubRes.body.code === 'UNAUTHORIZED_SUBJECT' || (unauthSubRes.body.message && unauthSubRes.body.message.includes('unassigned subject'))) &&
    JSON.stringify(attSnapshotBBefore) === JSON.stringify(attSnapshotBAfter);
  record('B2', 'Unauthorized subject attendance rejected (403) with zero database mutation', unauthSubZeroMutation);

  // B3. Unauthorized Division Post (Div B not allocated to Ada)
  const unauthDivRes = await request('POST', '/api/attendance', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div B',
    subject: 'Java Programming',
    date: '2025-08-10',
    records: { student_bob: 'P' }
  }, facultyToken);
  checkAbort();

  const attSnapshotBFinal = await Attendance.find({}).lean();
  const unauthDivZeroMutation = unauthDivRes.status === 403 &&
    (unauthDivRes.body.code === 'UNAUTHORIZED_DIVISION' || (unauthDivRes.body.message && unauthDivRes.body.message.includes('division'))) &&
    JSON.stringify(attSnapshotBAfter) === JSON.stringify(attSnapshotBFinal);
  record('B3', 'Unauthorized division attendance rejected (403) with zero database mutation', unauthDivZeroMutation);

  // =========================================================================
  // SCENARIO C: Faculty Timetable Authorization (On Active Year 2025–26)
  // =========================================================================
  console.log('\n--- SCENARIO C: Faculty Timetable Authorization ---');
  checkAbort();

  // C1. Authorized Faculty Timetable Save
  const authTtRes = await request('POST', '/api/timetable', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div A',
    days: ['Monday'],
    timeSlots: ['09:00 - 10:00'],
    cells: [{ dayIndex: 0, slotIndex: 0, subject: 'Java Programming' }]
  }, facultyToken);
  checkAbort();

  const ttDocC1 = await Timetable.findOne({ academicYear: '2025–26', semester: '1st Semester', division: 'Div A' }).lean();
  record('C1', 'Authorized faculty timetable operation succeeds (200) and persists', authTtRes.status === 200 && ttDocC1?.cells[0]?.subject === 'Java Programming');

  // C2. Unauthorized Subject Overwrite
  const ttSnapshotCBefore = await Timetable.find({}).lean();
  const unauthTtRes = await request('POST', '/api/timetable', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div A',
    days: ['Monday'],
    timeSlots: ['09:00 - 10:00'],
    cells: [{ dayIndex: 0, slotIndex: 0, subject: 'Unauthorized Subject' }]
  }, facultyToken);
  checkAbort();

  const ttSnapshotCAfter = await Timetable.find({}).lean();
  const unauthTtZeroMutation = unauthTtRes.status === 403 &&
    unauthTtRes.body.message.includes('Access forbidden') &&
    JSON.stringify(ttSnapshotCBefore) === JSON.stringify(ttSnapshotCAfter);
  record('C2', 'Unauthorized subject timetable write rejected (403) with zero persistence', unauthTtZeroMutation);

  // =========================================================================
  // SCENARIO D: Academic Synchronization
  // =========================================================================
  console.log('\n--- SCENARIO D: Academic Synchronization ---');
  checkAbort();

  // D1. Valid Sync
  const validSyncRes = await request('POST', '/api/academic/sync', {
    notices: [{
      id: 'notice_sync_01',
      title: 'Valid Academic Sync Notice',
      text: 'Synchronized announcement text',
      authorRole: 'admin',
      date: '2025-09-01'
    }]
  }, adminToken);
  checkAbort();

  const storeD1 = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();
  const noticePersisted = (storeD1?.notices || []).some(n => n.id === 'notice_sync_01');
  record('D1', 'Valid academic sync accepted (200) and notice physically persisted in AcademicStore', validSyncRes.status === 200 && validSyncRes.body.success === true && noticePersisted);

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
          student_alice: { id: 'stu_integ_01', name: 'Alice Student', attendance: 88, cieMarks: { 'Java Programming': 19 } },
          student_bob: { id: 'stu_integ_02', name: 'Bob Student', attendance: 62, cieMarks: { 'Java Programming': 11 } }
        },
        notices: [
          { id: 'not_div_a', title: 'Div A Notice', text: 'For Div A Only', target: 'student', targetDivision: 'Div A' },
          { id: 'not_div_b', title: 'Div B Notice', text: 'For Div B Only', target: 'student', targetDivision: 'Div B' }
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
    !aliceNotices.some(n => n.id === 'not_div_b');
  record('E1', 'Student Alice receives own record; Bob is strictly absent and Div B notices redacted', aliceIsolated);

  // E2. Bob Request
  const bobRes = await request('GET', '/api/academic/data', null, bobToken);
  checkAbort();
  const bobStudents = bobRes.body?.data?.students || {};
  const bobNotices = bobRes.body?.data?.notices || [];
  const bobIsolated = bobRes.status === 200 &&
    bobStudents.student_bob?.name === 'Bob Student' &&
    bobStudents.student_alice === undefined &&
    bobNotices.some(n => n.id === 'not_div_b') &&
    !bobNotices.some(n => n.id === 'not_div_a');
  record('E2', 'Student Bob receives own record; Alice is strictly absent and Div A notices redacted', bobIsolated);

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
  // SCENARIO G: Historical Attendance Immutability & Transition Rejection
  // =========================================================================
  console.log('\n--- SCENARIO G: Historical Attendance Immutability & Write Rejection ---');
  checkAbort();

  // G1. Create and Seed Historical Attendance Record for 2025–26
  const historicDoc = await Attendance.create({
    attendanceId: 'att_historic_verif_01',
    academicYear: '2025–26',
    subject: 'Java Programming',
    division: 'Div A',
    semester: '1st Semester',
    date: '2025-08-15',
    records: { student_alice: 'P' },
    facultyUsername: 'faculty_ada'
  });
  const historicPreParsed = await Attendance.findById(historicDoc._id).lean();

  // G2. Create Successor Year 2026–27 (Upcoming)
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

  // G3. Perform Authorized Complete Transition: 2025–26 -> completed, 2026–27 -> active
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
  if (!transitionSuccess) throw new Error("Prerequisite failed: Scenario G transition did not succeed.");

  // G4. Attempt Historical Write by Faculty with Valid Historical Allocation
  // (Faculty Ada possesses a valid allocation for 2025–26 Java Programming Div A;
  // write MUST be rejected specifically because 2025–26 is completed and read-only)
  const historicBeforeAttempt = await Attendance.findById(historicDoc._id).lean();
  const unauthHistoricWriteRes = await request('POST', '/api/attendance', {
    academicYear: '2025–26',
    semester: '1st Semester',
    division: 'Div A',
    subject: 'Java Programming',
    date: '2025-08-15',
    records: { student_alice: 'A' }
  }, facultyToken);
  checkAbort();

  const historicAfterAttempt = await Attendance.findById(historicDoc._id).lean();
  const historicWriteRejected = unauthHistoricWriteRes.status === 403 &&
    unauthHistoricWriteRes.body.code === 'ACADEMIC_YEAR_COMPLETED' &&
    (unauthHistoricWriteRes.body.message && unauthHistoricWriteRes.body.message.includes('strictly read-only')) &&
    JSON.stringify(historicBeforeAttempt) === JSON.stringify(historicAfterAttempt);
  record('G2', 'Attempted historical write by allocated faculty rejected (403 ACADEMIC_YEAR_COMPLETED) with zero database mutation', historicWriteRejected);

  // G5. Deep Immutability Comparison Across Transition and Write Attempt
  delete historicPreParsed._id;
  delete historicPreParsed.createdAt;
  delete historicPreParsed.updatedAt;

  delete historicAfterAttempt._id;
  delete historicAfterAttempt.createdAt;
  delete historicAfterAttempt.updatedAt;

  const immutabilityVerified = JSON.stringify(historicPreParsed) === JSON.stringify(historicAfterAttempt);
  record('G3', 'Historical attendance data remains completely immutable across transition and rejected write', immutabilityVerified);

  // =========================================================================
  // SCENARIO H: Timetable Compound Uniqueness
  // =========================================================================
  console.log('\n--- SCENARIO H: Timetable Compound Uniqueness ---');
  checkAbort();

  // Explicitly build schema indexes on disposable database
  await Timetable.createIndexes();

  // Inspect Native MongoDB Catalog
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
  record('H1', 'Timetable compound unique index verified in native MongoDB catalog with exact partialFilterExpression', !!ttIndexCatalogValid,
    `Key: ${JSON.stringify(ttCompoundIdx?.key)}, Partial: ${JSON.stringify(ttCompoundIdx?.partialFilterExpression)}`);

  // 1. First Timetable Record
  const ttH1 = await Timetable.create({
    academicYear: '2026–27',
    semester: '1st Semester',
    division: 'Div A',
    days: ['Monday'],
    timeSlots: ['09:00 - 10:00'],
    cells: [{ dayIndex: 0, slotIndex: 0, subject: 'Java Programming' }]
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

  // =========================================================================
  // SCENARIO I: CIE Mark Compound Uniqueness
  // =========================================================================
  console.log('\n--- SCENARIO I: CIE Mark Compound Uniqueness ---');
  checkAbort();

  // Explicitly build schema indexes on disposable database
  await Mark.createIndexes();

  // Inspect Native MongoDB Catalog
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
  record('I1', 'Mark compound unique index verified in native MongoDB catalog with exact partialFilterExpression', !!markIndexCatalogValid,
    `Key: ${JSON.stringify(markCompoundIdx?.key)}, Partial: ${JSON.stringify(markCompoundIdx?.partialFilterExpression)}`);

  // 1. First Mark Record (Explicit distinct markId to isolate compound index from markId_1)
  const markI1 = await Mark.create({
    markId: 'mark_distinct_001',
    academicYear: '2026–27',
    studentUsername: 'student_alice',
    subject: 'Java Programming',
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
      subject: 'Java Programming',
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

  // =========================================================================
  // SCENARIO J: Unauthorized Persistence Protection
  // =========================================================================
  console.log('\n--- SCENARIO J: Unauthorized Persistence Protection ---');
  checkAbort();

  const attSnapshotJBefore = await Attendance.find({}).lean();

  const unauthJRes = await request('POST', '/api/attendance', {
    academicYear: '2026–27',
    semester: '1st Semester',
    division: 'Div A',
    subject: 'Completely Disallowed Course Subject',
    date: '2026-08-30',
    records: { student_alice: 'P' }
  }, facultyToken);
  checkAbort();

  const attSnapshotJAfter = await Attendance.find({}).lean();
  const zeroJMutation = unauthJRes.status === 403 &&
    (unauthJRes.body.code === 'UNAUTHORIZED_SUBJECT' || (unauthJRes.body.message && unauthJRes.body.message.includes('unassigned subject'))) &&
    JSON.stringify(attSnapshotJBefore) === JSON.stringify(attSnapshotJAfter);
  record('J1', 'Unauthorized write rejected (403 UNAUTHORIZED_SUBJECT) with deep snapshot equality (zero database mutation)', zeroJMutation);

  // =========================================================================
  // SCENARIO K: Same-Process Activation Concurrency (In-Memory Serialization)
  // =========================================================================
  console.log('\n--- SCENARIO K: Same-Process Activation Concurrency (In-Memory Serialization) ---');
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

  // Send Competing Concurrent Activation Requests
  const [cRes1, cRes2] = await Promise.all([
    request('PATCH', `/api/academic-years/${yrK1Id}/activate`, {}, adminToken),
    request('PATCH', `/api/academic-years/${yrK2Id}/activate`, {}, adminToken)
  ]);
  checkAbort();

  const atLeastOneSuccess = (cRes1.status === 200 || cRes2.status === 200);
  const activeYearsInDb = await AcademicYear.find({ status: 'active' }).lean();
  const exactlyOneActive = activeYearsInDb.length === 1;
  const winningYear = activeYearsInDb[0]?.yearCode;
  const winnerValid = winningYear === '2028–29' || winningYear === '2029–30';

  const losingId = winningYear === '2028–29' ? yrK2Id : yrK1Id;
  const losingDoc = await AcademicYear.findById(losingId).lean();
  const prevDocAfterK = await AcademicYear.findById(prevActiveBeforeK._id).lean();

  record('K1', 'Concurrent activation: at least one transition succeeded (non-vacuous)', atLeastOneSuccess);
  record('K2', 'Concurrent activation: exactly one active academic year exists afterward (same-process in-memory queue)', exactlyOneActive && winnerValid, `Winning active year: "${winningYear}"`);
  record('K3', 'Previous active year is completed and losing competitor remains upcoming/settled cleanly', prevDocAfterK.status === 'completed' && losingDoc.status !== 'active');
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
