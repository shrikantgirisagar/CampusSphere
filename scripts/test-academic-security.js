const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const AcademicStore = require('../models/AcademicStore');
const Timetable = require('../models/Timetable');

const TEST_PORT = 3099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) {}
        resolve({ status: res.statusCode, headers: res.headers, body: json, raw: data });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function run() {
  console.log('=== Academic Data APIs Security Test Suite ===\n');

  // 1. Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'CampusSphere', serverSelectionTimeoutMS: 8000 });
  console.log('✓ Connected to MongoDB');

  // 2. Start server instance on test port
  console.log(`Starting test server on port ${TEST_PORT}...`);
  const serverProc = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(TEST_PORT) },
    stdio: 'pipe'
  });

  serverProc.stderr.on('data', d => {
    const str = d.toString();
    if (str.includes('Error')) console.error('Server proc stderr:', str);
  });

  // Wait for server to become responsive
  let online = false;
  for (let i = 0; i < 30; i++) {
    await wait(500);
    try {
      const res = await request('GET', '/api/status');
      if (res.status === 200 && res.body?.success) {
        online = true;
        break;
      }
    } catch (_) {}
  }

  if (!online) {
    serverProc.kill();
    throw new Error('Test server failed to start within 15 seconds.');
  }
  console.log(`✓ Test server responsive at ${BASE_URL}\n`);

  const timeTag = Date.now();
  const aliceUser = `alice_stu_${timeTag}`;
  const bobUser = `bob_stu_${timeTag}`;
  const facultyUser = `carol_fac_${timeTag}`;
  const adminUser = `dave_adm_${timeTag}`;
  const testPassword = 'Password123!';

  let testPassedCount = 0;
  let testTotalCount = 0;

  function assertTest(condition, name, details = '') {
    testTotalCount++;
    if (condition) {
      testPassedCount++;
      console.log(`  [PASS] Test ${testTotalCount}: ${name}`);
    } else {
      console.error(`  [FAIL] Test ${testTotalCount}: ${name} ${details ? '(' + details + ')' : ''}`);
    }
  }

  try {
    // 3. Create test accounts in MongoDB
    function hashPass(pwd) {
      return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16);
        crypto.scrypt(pwd, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
          if (err) return reject(err);
          resolve(`scrypt$16384$8$1$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`);
        });
      });
    }

    const hashedPwd = await hashPass(testPassword);

    await User.create([
      { id: `id-${aliceUser}`, role: 'student', username: aliceUser, name: 'Alice Student', email: `${aliceUser}@test.edu`, passwordHash: hashedPwd, division: 'Div A', courseYear: '1st Year' },
      { id: `id-${bobUser}`, role: 'student', username: bobUser, name: 'Bob Student', email: `${bobUser}@test.edu`, passwordHash: hashedPwd, division: 'Div B', courseYear: '1st Year' },
      { id: `id-${facultyUser}`, role: 'faculty', username: facultyUser, name: 'Carol Faculty', email: `${facultyUser}@test.edu`, passwordHash: hashedPwd, subject: 'sub-bca101' },
      { id: `id-${adminUser}`, role: 'admin', username: adminUser, name: 'Dave Admin', email: `${adminUser}@test.edu`, passwordHash: hashedPwd }
    ]);

    // 4. Log in and get authentic tokens
    const aliceLogin = await request('POST', '/api/auth/login', {}, { role: 'student', username: aliceUser, password: testPassword });
    const bobLogin = await request('POST', '/api/auth/login', {}, { role: 'student', username: bobUser, password: testPassword });
    const facultyLogin = await request('POST', '/api/auth/login', {}, { role: 'faculty', username: facultyUser, password: testPassword });
    const adminLogin = await request('POST', '/api/auth/login', {}, { role: 'admin', username: adminUser, password: testPassword });

    const aliceToken = aliceLogin.body?.token;
    const bobToken = bobLogin.body?.token;
    const facultyToken = facultyLogin.body?.token;
    const adminToken = adminLogin.body?.token;

    if (!aliceToken || !bobToken || !facultyToken || !adminToken) {
      throw new Error('Failed to obtain auth tokens for test users.');
    }

    // 5. Seed test academic store
    let store = await AcademicStore.findOne({ storeKey: 'default_academic_store' });
    if (!store) {
      store = new AcademicStore({ storeKey: 'default_academic_store' });
    }

    if (!store.students) store.students = {};
    store.students[aliceUser] = {
      marks: { math: { internal1: 20, internal2: 19, final: 55, total: 94, grade: 'A+' } },
      attendance: { math: 95 }
    };
    store.students[bobUser] = {
      marks: { math: { internal1: 12, internal2: 11, final: 40, total: 63, grade: 'B' } },
      attendance: { math: 70 }
    };
    store.markModified('students');

    if (!Array.isArray(store.dailyAttendance)) store.dailyAttendance = [];
    store.dailyAttendance.push({
      id: `att-${timeTag}`,
      date: '2026-09-18',
      subject: 'math',
      records: {
        [aliceUser]: 'present',
        [bobUser]: 'absent'
      }
    });
    store.markModified('dailyAttendance');

    if (!Array.isArray(store.assignments)) store.assignments = [];
    store.assignments.push(
      { id: `asgn-alice-${timeTag}`, title: 'Alice Private Homework', student: aliceUser, status: 'Submitted' },
      { id: `asgn-bob-${timeTag}`, title: 'Bob Private Homework', student: bobUser, status: 'Submitted' },
      { id: `asgn-broadcast-diva-${timeTag}`, title: 'Div A Broadcast Assignment', student: 'all', targetDivision: 'Div A' },
      { id: `asgn-broadcast-divb-${timeTag}`, title: 'Div B Broadcast Assignment', student: 'all', targetDivision: 'Div B' }
    );
    store.markModified('assignments');

    if (!Array.isArray(store.deletedAssignments)) store.deletedAssignments = [];
    store.deletedAssignments.push(
      `${aliceUser}___del-1`,
      `${bobUser}___del-2`
    );
    store.markModified('deletedAssignments');

    if (!Array.isArray(store.notes)) store.notes = [];
    store.notes.push(
      { id: `note-diva-${timeTag}`, title: 'Div A Exclusive Notes', division: 'Div A' },
      { id: `note-divb-${timeTag}`, title: 'Div B Exclusive Notes', division: 'Div B' },
      { id: `note-all-${timeTag}`, title: 'All Divisions Shared Notes', division: 'All Divisions' }
    );
    store.markModified('notes');

    if (!Array.isArray(store.notices)) store.notices = [];
    store.notices.push(
      { id: `not-fac-${timeTag}`, title: 'Faculty Secret Notice', target: 'faculty' },
      { id: `not-diva-${timeTag}`, title: 'Div A Student Notice', target: 'student', targetDivision: 'Div A' },
      { id: `not-all-${timeTag}`, title: 'Campus General Notice', target: 'all' }
    );
    store.markModified('notices');

    await store.save();

    // Seed timetable collection
    await Timetable.deleteMany({});
    await Timetable.create([
      { division: 'Div A', semester: '1st Semester', day: 'Monday', time: '10:00 AM', subject: 'math', subjectText: 'Mathematics', faculty: facultyUser }
    ]);

    console.log('Running Security Checks:\n');

    // Test 1: GET /api/academic/data without token -> 401
    const t1 = await request('GET', '/api/academic/data');
    assertTest(t1.status === 401 && t1.body?.success === false, 'GET /api/academic/data without token returns 401 Unauthorized');

    // Test 2: GET /api/academic/data with invalid token -> 401
    const t2 = await request('GET', '/api/academic/data', { Authorization: 'Bearer forged.invalid.token' });
    assertTest(t2.status === 401 && t2.body?.success === false, 'GET /api/academic/data with invalid token returns 401');

    // Test 3: GET /api/academic/data with expired token -> 401
    const expiredPayload = Buffer.from(JSON.stringify({ id: 'any', role: 'student', username: aliceUser, exp: Date.now() - 10000 })).toString('base64url');
    const secret = process.env.AUTH_SECRET || process.env.SESSION_SECRET || 'campussphere_default_dev_secret_key_change_in_production';
    const expiredSig = crypto.createHmac('sha256', secret).update(expiredPayload).digest('base64url');
    const expiredToken = `${expiredPayload}.${expiredSig}`;
    const t3 = await request('GET', '/api/academic/data', { Authorization: `Bearer ${expiredToken}` });
    assertTest(t3.status === 401 && t3.body?.success === false, 'GET /api/academic/data with expired token returns 401');

    // Test 4: GET /api/timetable without token -> 401
    const t4 = await request('GET', '/api/timetable');
    assertTest(t4.status === 401 && t4.body?.success === false, 'GET /api/timetable without token returns 401 Unauthorized');

    // Test 5: GET /api/timetable with invalid token -> 401
    const t5 = await request('GET', '/api/timetable', { Authorization: 'Bearer invalid.sig' });
    assertTest(t5.status === 401 && t5.body?.success === false, 'GET /api/timetable with invalid token returns 401');

    // Test 6: GET /api/timetable with expired token -> 401
    const t6 = await request('GET', '/api/timetable', { Authorization: `Bearer ${expiredToken}` });
    assertTest(t6.status === 401 && t6.body?.success === false, 'GET /api/timetable with expired token returns 401');

    // Test 7: GET /api/timetable with student token -> 200
    const t7 = await request('GET', '/api/timetable', { Authorization: `Bearer ${aliceToken}` });
    assertTest(t7.status === 200 && Array.isArray(t7.body?.timetable), 'GET /api/timetable with student token returns 200 OK');

    // Test 8: GET /api/timetable with faculty token -> 200
    const t8 = await request('GET', '/api/timetable', { Authorization: `Bearer ${facultyToken}` });
    assertTest(t8.status === 200 && Array.isArray(t8.body?.timetable), 'GET /api/timetable with faculty token returns 200 OK');

    // Test 9: GET /api/timetable with admin token -> 200
    const t9 = await request('GET', '/api/timetable', { Authorization: `Bearer ${adminToken}` });
    assertTest(t9.status === 200 && Array.isArray(t9.body?.timetable), 'GET /api/timetable with admin token returns 200 OK');

    // Test 10: GET /api/academic/data with student token (Alice, Div A)
    const t10 = await request('GET', '/api/academic/data', { Authorization: `Bearer ${aliceToken}` });
    const d10 = t10.body?.data || {};

    const hasAliceStudent = !!d10.students?.[aliceUser];
    const hasBobStudent = !!d10.students?.[bobUser];
    const attendanceRecords = d10.dailyAttendance?.[0]?.records || {};
    const hasAliceAttendance = attendanceRecords[aliceUser] === 'present';
    const hasBobAttendance = attendanceRecords[bobUser] !== undefined;

    const asgns = d10.assignments || [];
    const hasAliceAsgn = asgns.some(a => a.student === aliceUser);
    const hasBobAsgn = asgns.some(a => a.student === bobUser);
    const hasDivAAsgn = asgns.some(a => a.targetDivision === 'Div A');
    const hasDivBAsgn = asgns.some(a => a.targetDivision === 'Div B');

    const notes = d10.notes || [];
    const hasDivANote = notes.some(n => n.division === 'Div A');
    const hasDivBNote = notes.some(n => n.division === 'Div B');
    const hasAllNote = notes.some(n => n.division === 'All Divisions');

    const notices = d10.notices || [];
    const hasFacultyNotice = notices.some(n => n.target === 'faculty');

    const delAsgns = d10.deletedAssignments || [];
    const hasAliceDel = delAsgns.some(k => k.startsWith(`${aliceUser}___`));
    const hasBobDel = delAsgns.some(k => k.startsWith(`${bobUser}___`));

    const studentIsolationPass = t10.status === 200 &&
      hasAliceStudent && !hasBobStudent &&
      hasAliceAttendance && !hasBobAttendance &&
      hasAliceAsgn && !hasBobAsgn && hasDivAAsgn && !hasDivBAsgn &&
      hasDivANote && !hasDivBNote && hasAllNote &&
      !hasFacultyNotice &&
      hasAliceDel && !hasBobDel;

    assertTest(studentIsolationPass, 'Student academic data isolation & redaction strictly enforced',
      `AliceStu:${hasAliceStudent} BobStu:${hasBobStudent} BobAtt:${hasBobAttendance} BobAsgn:${hasBobAsgn} DivBAsgn:${hasDivBAsgn} DivBNote:${hasDivBNote} FacNot:${hasFacultyNotice} BobDel:${hasBobDel}`);

    // Test 11: IDOR Attack Prevention: Alice tries to fetch Bob's data via query param
    const t11 = await request('GET', `/api/academic/data?username=${bobUser}&studentId=${bobUser}&role=admin`, { Authorization: `Bearer ${aliceToken}` });
    const d11 = t11.body?.data || {};
    const idorPrevented = !d11.students?.[bobUser] && !!d11.students?.[aliceUser] && d11.dailyAttendance?.[0]?.records?.[bobUser] === undefined;
    assertTest(idorPrevented, 'IDOR attack blocked: Client query parameters (?username=bob) completely ignored');

    // Test 12: GET /api/academic/data with faculty token -> full operational data
    const t12 = await request('GET', '/api/academic/data', { Authorization: `Bearer ${facultyToken}` });
    const d12 = t12.body?.data || {};
    const facultyFullAccess = t12.status === 200 && !!d12.students?.[aliceUser] && !!d12.students?.[bobUser];
    assertTest(facultyFullAccess, 'Faculty receives complete operational academic store data');

    // Test 13: GET /api/academic/data with admin token -> full operational data
    const t13 = await request('GET', '/api/academic/data', { Authorization: `Bearer ${adminToken}` });
    const d13 = t13.body?.data || {};
    const adminFullAccess = t13.status === 200 && !!d13.students?.[aliceUser] && !!d13.students?.[bobUser];
    assertTest(adminFullAccess, 'Admin receives complete operational academic store data');

    // Test 14: POST /api/timetable/sync RBAC
    const t14_noAuth = await request('POST', '/api/timetable/sync', {}, { timetable: [] });
    const t14_student = await request('POST', '/api/timetable/sync', { Authorization: `Bearer ${aliceToken}` }, { timetable: [] });
    const t14_faculty = await request('POST', '/api/timetable/sync', { Authorization: `Bearer ${facultyToken}` }, { timetable: [] });
    const t14_admin = await request('POST', '/api/timetable/sync', { Authorization: `Bearer ${adminToken}` }, { timetable: [] });

    const timetableRbacPass = t14_noAuth.status === 401 && t14_student.status === 403 && t14_faculty.status === 200 && t14_admin.status === 200;
    assertTest(timetableRbacPass, 'POST /api/timetable/sync RBAC (Unauth=401, Student=403, Faculty=200, Admin=200)');

    // Test 15: POST /api/academic/sync RBAC & Notice Author Sanitization
    const t15_noAuth = await request('POST', '/api/academic/sync', {}, { data: {} });
    const t15_student = await request('POST', '/api/academic/sync', { Authorization: `Bearer ${aliceToken}` }, { data: {} });
    const t15_faculty = await request('POST', '/api/academic/sync', { Authorization: `Bearer ${facultyToken}` }, {
      data: {
        notices: [{ id: `not-spoof-${timeTag}`, title: 'Spoofed Admin Notice', authorRole: 'admin', postedBy: facultyUser }]
      }
    });
    const t15_admin = await request('POST', '/api/academic/sync', { Authorization: `Bearer ${adminToken}` }, { data: {} });

    // Verify spoofed notice in store was sanitized
    const verifyStore = await AcademicStore.findOne({ storeKey: 'default_academic_store' });
    const spoofNotice = (verifyStore.notices || []).find(n => n.id === `not-spoof-${timeTag}`);
    const authorRoleSanitized = spoofNotice ? spoofNotice.authorRole === 'faculty' : true;

    const academicSyncPass = t15_noAuth.status === 401 && t15_student.status === 403 && t15_faculty.status === 200 && t15_admin.status === 200 && authorRoleSanitized;
    assertTest(academicSyncPass, 'POST /api/academic/sync RBAC & Faculty Notice authorRole spoof prevention');

    console.log(`\n==============================================`);
    console.log(`Results: ${testPassedCount} / ${testTotalCount} tests passed.`);
    console.log(`==============================================\n`);

  } finally {
    // Clean up test data from MongoDB
    try {
      await User.deleteMany({ username: { $in: [aliceUser, bobUser, facultyUser, adminUser] } });
      const store = await AcademicStore.findOne({ storeKey: 'default_academic_store' });
      if (store) {
        if (store.students) {
          delete store.students[aliceUser];
          delete store.students[bobUser];
          store.markModified('students');
        }
        if (store.dailyAttendance) {
          store.dailyAttendance = store.dailyAttendance.filter(a => a.id !== `att-${timeTag}`);
          store.markModified('dailyAttendance');
        }
        if (store.assignments) {
          store.assignments = store.assignments.filter(a => !a.id.includes(String(timeTag)));
          store.markModified('assignments');
        }
        if (store.deletedAssignments) {
          store.deletedAssignments = store.deletedAssignments.filter(k => !k.includes(aliceUser) && !k.includes(bobUser));
          store.markModified('deletedAssignments');
        }
        if (store.notes) {
          store.notes = store.notes.filter(n => !n.id.includes(String(timeTag)));
          store.markModified('notes');
        }
        if (store.notices) {
          store.notices = store.notices.filter(n => !n.id.includes(String(timeTag)));
          store.markModified('notices');
        }
        await store.save();
      }
      await mongoose.disconnect();
    } catch (cleanErr) {
      console.warn('Cleanup warning:', cleanErr.message);
    }
    serverProc.kill();
  }

  if (testPassedCount !== testTotalCount) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
