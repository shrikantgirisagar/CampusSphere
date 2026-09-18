const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const AcademicStore = require('../models/AcademicStore');
const Timetable = require('../models/Timetable');
const Notice = require('../models/Notice');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Assignment = require('../models/Assignment');
const Note = require('../models/Note');

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
  console.log('=== MongoDB Safe Synchronization Test Suite ===\n');

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
    if (str.includes('Error')) console.error('Server stderr:', str);
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
  const testStudent = `stu_sync_${timeTag}`;
  const testFaculty = `fac_sync_${timeTag}`;
  const testAdmin = `adm_sync_${timeTag}`;
  const testPassword = 'Password123!';

  const testDivA = `Div_A_${timeTag}`;
  const testDivB = `Div_B_${timeTag}`;

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
      { id: `id-${testStudent}`, role: 'student', username: testStudent, name: 'Test Student', email: `${testStudent}@test.edu`, passwordHash: hashedPwd, division: 'Div A' },
      { id: `id-${testFaculty}`, role: 'faculty', username: testFaculty, name: 'Test Faculty', email: `${testFaculty}@test.edu`, passwordHash: hashedPwd, subject: 'sub-cs101' },
      { id: `id-${testAdmin}`, role: 'admin', username: testAdmin, name: 'Test Admin', email: `${testAdmin}@test.edu`, passwordHash: hashedPwd }
    ]);

    // 4. Log in and get tokens
    const studentLogin = await request('POST', '/api/auth/login', {}, { role: 'student', username: testStudent, password: testPassword });
    const facultyLogin = await request('POST', '/api/auth/login', {}, { role: 'faculty', username: testFaculty, password: testPassword });
    const adminLogin = await request('POST', '/api/auth/login', {}, { role: 'admin', username: testAdmin, password: testPassword });

    const studentToken = studentLogin.body?.token;
    const facultyToken = facultyLogin.body?.token;
    const adminToken = adminLogin.body?.token;

    console.log('--- 1. Timetable Safe Synchronization Tests ---');

    // Baseline timetable count
    const baselineTtCount = await Timetable.countDocuments();

    // Test 1: Initial Timetable Sync
    const ttSlotA = { division: testDivA, semester: '1st Semester', day: 'Monday', time: '09:00-10:00', subject: 'sub-cs101', subjectText: 'Intro to CS', faculty: testFaculty };
    const ttSlotB = { division: testDivA, semester: '1st Semester', day: 'Monday', time: '10:00-11:00', subject: 'sub-cs102', subjectText: 'Data Structures', faculty: testFaculty };
    const t1 = await request('POST', '/api/timetable/sync', { Authorization: `Bearer ${facultyToken}` }, { timetable: [ttSlotA, ttSlotB] });
    const dbTt1 = await Timetable.find({ division: testDivA, day: 'Monday' });
    assertTest(t1.status === 200 && dbTt1.length === 2, 'Initial Timetable Sync creates records safely without error');

    // Test 2: Repeat Same Timetable Sync (Idempotency)
    const t2 = await request('POST', '/api/timetable/sync', { Authorization: `Bearer ${facultyToken}` }, { timetable: [ttSlotA, ttSlotB] });
    const dbTt2 = await Timetable.find({ division: testDivA, day: 'Monday' });
    assertTest(t2.status === 200 && dbTt2.length === 2, 'Repeat Timetable Sync is idempotent: 0 duplicates created');

    // Test 3: Incremental Sync (Add Slot C)
    const ttSlotC = { division: testDivA, semester: '1st Semester', day: 'Tuesday', time: '09:00-10:00', subject: 'sub-cs103', subjectText: 'Web Dev', faculty: testFaculty };
    const t3 = await request('POST', '/api/timetable/sync', { Authorization: `Bearer ${facultyToken}` }, { timetable: [ttSlotA, ttSlotB, ttSlotC] });
    const dbTt3 = await Timetable.find({ division: testDivA });
    assertTest(t3.status === 200 && dbTt3.length === 3, 'Incremental Timetable Sync adds new slot C and preserves A and B');

    // Test 4: Omitted Record Preservation (Sync Div B does not delete Div A)
    const ttSlotDivB = { division: testDivB, semester: '1st Semester', day: 'Monday', time: '09:00-10:00', subject: 'sub-cs101', subjectText: 'Intro to CS (B)', faculty: testFaculty };
    const t4 = await request('POST', '/api/timetable/sync', { Authorization: `Bearer ${facultyToken}` }, { timetable: [ttSlotDivB] });
    const dbTtDivA = await Timetable.find({ division: testDivA });
    const dbTtDivB = await Timetable.find({ division: testDivB });
    assertTest(t4.status === 200 && dbTtDivA.length === 3 && dbTtDivB.length === 1, 'Omitted Record Preservation: Syncing Div B timetable DOES NOT wipe Div A');

    // Test 5: Explicit Update of Slot A in place (Preserving MongoDB _id)
    const originalDocA = await Timetable.findOne({ division: testDivA, day: 'Monday', time: '09:00-10:00' });
    const originalIdA = String(originalDocA._id);
    const ttSlotA_Updated = { division: testDivA, semester: '1st Semester', day: 'Monday', time: '09:00-10:00', subject: 'sub-cs101', subjectText: 'Advanced CS 101', faculty: testFaculty };
    const t5 = await request('POST', '/api/timetable/sync', { Authorization: `Bearer ${facultyToken}` }, { timetable: [ttSlotA_Updated] });
    const updatedDocA = await Timetable.findOne({ division: testDivA, day: 'Monday', time: '09:00-10:00' });
    assertTest(t5.status === 200 && updatedDocA.subjectText === 'Advanced CS 101' && String(updatedDocA._id) === originalIdA, 'Explicit Update: Record updated in place and MongoDB _id preserved');

    // Test 6: Invalid Timetable Payload Rejection
    const t6_null = await request('POST', '/api/timetable/sync', { Authorization: `Bearer ${facultyToken}` }, { timetable: "invalid_string" });
    const t6_malformed = await request('POST', '/api/timetable/sync', { Authorization: `Bearer ${facultyToken}` }, { timetable: [{ division: testDivA, day: 'InvalidDay' }] });
    const countAfterInvalid = await Timetable.countDocuments();
    assertTest(t6_null.status === 400 && t6_malformed.status === 200 && countAfterInvalid === baselineTtCount + 4, 'Invalid Timetable Payload Rejected/Filtered before write, DB unharmed');

    // Test 7: Concurrent Timetable Sync
    const concurrent1 = request('POST', '/api/timetable/sync', { Authorization: `Bearer ${facultyToken}` }, {
      timetable: [{ division: testDivA, semester: '1st Semester', day: 'Wednesday', time: '11:00-12:00', subject: 'sub-1', subjectText: 'Parallel Class 1', faculty: testFaculty }]
    });
    const concurrent2 = request('POST', '/api/timetable/sync', { Authorization: `Bearer ${adminToken}` }, {
      timetable: [{ division: testDivA, semester: '1st Semester', day: 'Wednesday', time: '11:00-12:00', subject: 'sub-1', subjectText: 'Parallel Class 2', faculty: testFaculty }]
    });
    const [resConc1, resConc2] = await Promise.all([concurrent1, concurrent2]);
    const concDocs = await Timetable.find({ division: testDivA, day: 'Wednesday', time: '11:00-12:00' });
    assertTest(resConc1.status === 200 && resConc2.status === 200 && concDocs.length === 1, 'Concurrent Timetable Sync: Atomic upsert resolves safely without duplicate slots');

    console.log('\n--- 2. Academic Store & Collection Synchronization Tests ---');

    // Test 8: Initial Academic Sync
    const notice1 = { id: `notice-a-${timeTag}`, title: 'Notice Alpha', content: 'Campus alpha notice', date: '2026-09-18' };
    const notice2 = { id: `notice-b-${timeTag}`, title: 'Notice Beta', content: 'Campus beta notice', date: '2026-09-18' };
    const note1 = { id: `note-a-${timeTag}`, title: 'Algorithms Note', subject: 'sub-cs101', division: 'Div A', uploadedBy: testFaculty };
    const note2 = { id: `note-b-${timeTag}`, title: 'Database Note', subject: 'sub-cs102', division: 'Div B', uploadedBy: testFaculty };
    const asgn1 = { id: `asgn-a-${timeTag}`, title: 'Project Part 1', student: testStudent, subject: 'sub-cs101' };

    const t8 = await request('POST', '/api/academic/sync', { Authorization: `Bearer ${facultyToken}` }, {
      data: {
        notices: [notice1, notice2],
        notes: [note1, note2],
        assignments: [asgn1],
        students: { [testStudent]: { marks: { 'sub-cs101': { internal1: 19, internal2: 20, total: 39 } } } }
      }
    });

    const dbNotices8 = await Notice.find({ noticeId: { $in: [notice1.id, notice2.id] } });
    const dbNotes8 = await Note.find({ noteId: { $in: [note1.id, note2.id] } });
    const dbMarks8 = await Mark.find({ studentUsername: testStudent });
    assertTest(t8.status === 200 && dbNotices8.length === 2 && dbNotes8.length === 2 && dbMarks8.length === 1, 'Initial Academic Sync creates records safely in dedicated collections');

    // Test 9: Repeat Academic Sync (Idempotency)
    const t9 = await request('POST', '/api/academic/sync', { Authorization: `Bearer ${facultyToken}` }, {
      data: {
        notices: [notice1, notice2],
        notes: [note1, note2],
        assignments: [asgn1],
        students: { [testStudent]: { marks: { 'sub-cs101': { internal1: 19, internal2: 20, total: 39 } } } }
      }
    });
    const dbNotices9 = await Notice.find({ noticeId: { $in: [notice1.id, notice2.id] } });
    const dbNotes9 = await Note.find({ noteId: { $in: [note1.id, note2.id] } });
    const dbMarks9 = await Mark.find({ studentUsername: testStudent });
    assertTest(t9.status === 200 && dbNotices9.length === 2 && dbNotes9.length === 2 && dbMarks9.length === 1, 'Repeat Academic Sync is 100% idempotent: record counts remain identical');

    // Test 10: Omitted Record Preservation in Academic Collections
    // Sync only notice1 (notice2 omitted). Verify notice2 is NOT deleted from Notice collection
    const t10 = await request('POST', '/api/academic/sync', { Authorization: `Bearer ${facultyToken}` }, {
      data: {
        notices: [notice1]
      }
    });
    const dbNotice1 = await Notice.findOne({ noticeId: notice1.id });
    const dbNotice2 = await Notice.findOne({ noticeId: notice2.id });
    assertTest(t10.status === 200 && !!dbNotice1 && !!dbNotice2, 'Omitted Record Preservation: Omitted notice2 is NOT deleted from database');

    // Test 11: Explicit Deletion Semantics (deletedNotices and deletedNotes)
    const t11 = await request('POST', '/api/academic/sync', { Authorization: `Bearer ${facultyToken}` }, {
      data: {
        notices: [notice1],
        deletedNotices: [notice2.id],
        deletedNotes: [note2.id]
      }
    });
    const dbNotice2_after = await Notice.findOne({ noticeId: notice2.id });
    const dbNote2_after = await Note.findOne({ noteId: note2.id });
    const dbNotice1_stillExists = await Notice.findOne({ noticeId: notice1.id });
    assertTest(t11.status === 200 && !dbNotice2_after && !dbNote2_after && !!dbNotice1_stillExists, 'Explicit Deletion: deletedNotices/deletedNotes removed specifically while preserving others');

    // Test 12: Invalid Academic Payload Rejection
    const t12 = await request('POST', '/api/academic/sync', { Authorization: `Bearer ${facultyToken}` }, { data: { students: "invalid_students_string" } });
    assertTest(t12.status === 400 && t12.body?.success === false, 'Invalid Academic Payload Rejected with HTTP 400 before write begins');

    // Test 13: Concurrent Academic Sync Serialization
    const concSync1 = request('POST', '/api/academic/sync', { Authorization: `Bearer ${facultyToken}` }, {
      data: { notices: [{ id: `notice-conc1-${timeTag}`, title: 'Conc Notice 1' }] }
    });
    const concSync2 = request('POST', '/api/academic/sync', { Authorization: `Bearer ${adminToken}` }, {
      data: { notices: [{ id: `notice-conc2-${timeTag}`, title: 'Conc Notice 2' }] }
    });
    const [cRes1, cRes2] = await Promise.all([concSync1, concSync2]);
    const cNotice1 = await Notice.findOne({ noticeId: `notice-conc1-${timeTag}` });
    const cNotice2 = await Notice.findOne({ noticeId: `notice-conc2-${timeTag}` });
    assertTest(cRes1.status === 200 && cRes2.status === 200 && !!cNotice1 && !!cNotice2, 'Concurrent Academic Sync: In-flight queue serializes writes, both records safely persisted');

    console.log('\n--- 3. User Migration Safe Persistence Tests ---');

    // Test 14: Initial User Migration
    const migUser1 = `mig_user1_${timeTag}`;
    const migUser2 = `mig_user2_${timeTag}`;
    const t14 = await request('POST', '/api/users/migrate', { Authorization: `Bearer ${adminToken}` }, {
      users: {
        student: [
          { username: migUser1, name: 'Migration User 1', email: `${migUser1}@test.edu`, division: 'Div A' },
          { username: migUser2, name: 'Migration User 2', email: `${migUser2}@test.edu`, division: 'Div B' }
        ]
      }
    });
    const dbMig1 = await User.findOne({ username: migUser1 });
    const dbMig2 = await User.findOne({ username: migUser2 });
    assertTest(t14.status === 200 && !!dbMig1 && !!dbMig2 && t14.body?.added === 2, 'Initial User Migration creates new accounts safely');

    // Test 15: Repeat User Migration (Idempotency)
    const t15 = await request('POST', '/api/users/migrate', { Authorization: `Bearer ${adminToken}` }, {
      users: {
        student: [
          { username: migUser1, name: 'Migration User 1', email: `${migUser1}@test.edu`, division: 'Div A' },
          { username: migUser2, name: 'Migration User 2', email: `${migUser2}@test.edu`, division: 'Div B' }
        ]
      }
    });
    assertTest(t15.status === 200 && t15.body?.added === 0 && t15.body?.updated === 2, 'Repeat User Migration is idempotent: 0 added, existing updated, 0 duplicates');

    // Test 16: Password Preservation in User Migration
    const originalPassHash = dbMig1.passwordHash;
    const t16 = await request('POST', '/api/users/migrate', { Authorization: `Bearer ${adminToken}` }, {
      users: {
        student: [
          { username: migUser1, name: 'Migration User 1 (Renamed)', password: 'attempt_overwrite_password' }
        ]
      }
    });
    const refreshedMig1 = await User.findOne({ username: migUser1 });
    assertTest(t16.status === 200 && refreshedMig1.name === 'Migration User 1 (Renamed)' && refreshedMig1.passwordHash === originalPassHash, 'Password Preservation: Migration updates profile without overwriting existing passwordHash');

    // Test 17: Cross-Role Collision Handling (Student with same username as existing Admin)
    const t17 = await request('POST', '/api/users/migrate', { Authorization: `Bearer ${adminToken}` }, {
      users: {
        student: [
          { username: testAdmin, name: 'Fake Student Hijacker' }
        ]
      }
    });
    const targetAdminUser = await User.findOne({ username: testAdmin });
    assertTest(t17.status === 200 && targetAdminUser.role === 'admin' && targetAdminUser.name !== 'Fake Student Hijacker', 'Cross-Role Collision: Role hijacking blocked, existing user role protected');

    // Test 18: Unauthorized User Migration Blocked
    const t18_unauth = await request('POST', '/api/users/migrate', {}, { users: {} });
    const t18_student = await request('POST', '/api/users/migrate', { Authorization: `Bearer ${studentToken}` }, { users: {} });
    assertTest(t18_unauth.status === 401 && t18_student.status === 403, 'User Migration remains strictly admin-only (Unauth=401, Student=403)');

    console.log(`\n==============================================`);
    console.log(`Results: ${testPassedCount} / ${testTotalCount} tests passed.`);
    console.log(`==============================================\n`);

  } finally {
    // Clean up test data from MongoDB
    try {
      await User.deleteMany({ username: { $in: [testStudent, testFaculty, testAdmin, `mig_user1_${timeTag}`, `mig_user2_${timeTag}`] } });
      await Timetable.deleteMany({ faculty: testFaculty });
      await Timetable.deleteMany({ division: { $in: [testDivA, testDivB] } });
      await Timetable.deleteMany({ subjectText: { $regex: 'Parallel Class' } });
      await Notice.deleteMany({ title: { $regex: 'Notice Alpha|Notice Beta|Conc Notice' } });
      await Note.deleteMany({ uploadedBy: testFaculty });
      await Assignment.deleteMany({ student: testStudent });
      await Mark.deleteMany({ studentUsername: testStudent });

      const store = await AcademicStore.findOne({ storeKey: 'default_academic_store' });
      if (store) {
        if (store.students) {
          delete store.students[testStudent];
          store.markModified('students');
        }
        if (store.timetable) {
          store.timetable = store.timetable.filter(t => t.faculty !== testFaculty && !String(t.subjectText || '').includes('Parallel Class'));
          store.markModified('timetable');
        }
        if (store.notices) {
          store.notices = store.notices.filter(n => !String(n.title || '').includes('Notice Alpha') && !String(n.title || '').includes('Notice Beta') && !String(n.title || '').includes('Conc Notice'));
          store.markModified('notices');
        }
        if (store.notes) {
          store.notes = store.notes.filter(n => n.uploadedBy !== testFaculty);
          store.markModified('notes');
        }
        if (store.assignments) {
          store.assignments = store.assignments.filter(a => a.student !== testStudent);
          store.markModified('assignments');
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
