const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

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
  console.log('=== CampusSphere User API Security, Privacy & IDOR Test Suite ===\n');

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
  const studentA = `stu_a_${timeTag}`;
  const studentB = `stu_b_${timeTag}`;
  const facultyA = `fac_a_${timeTag}`;
  const facultyB = `fac_b_${timeTag}`;
  const adminUser = `adm_u_${timeTag}`;
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

  function hashPass(pwd) {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16);
      crypto.scrypt(pwd, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
        if (err) return reject(err);
        resolve(`scrypt$16384$8$1$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`);
      });
    });
  }

  try {
    const hashedPwd = await hashPass(testPassword);

    await User.create([
      { id: `id-${studentA}`, role: 'student', username: studentA, name: 'Student Alpha', email: `${studentA}@test.edu`, passwordHash: hashedPwd, division: 'Div A' },
      { id: `id-${studentB}`, role: 'student', username: studentB, name: 'Student Beta', email: `${studentB}@test.edu`, passwordHash: hashedPwd, division: 'Div B' },
      { id: `id-${facultyA}`, role: 'faculty', username: facultyA, name: 'Faculty Alpha', email: `${facultyA}@test.edu`, passwordHash: hashedPwd, subject: 'sub-cs101' },
      { id: `id-${facultyB}`, role: 'faculty', username: facultyB, name: 'Faculty Beta', email: `${facultyB}@test.edu`, passwordHash: hashedPwd, subject: 'sub-cs102' },
      { id: `id-${adminUser}`, role: 'admin', username: adminUser, name: 'Admin Master', email: `${adminUser}@test.edu`, passwordHash: hashedPwd }
    ]);

    // Acquire tokens
    const sLoginA = await request('POST', '/api/auth/login', {}, { role: 'student', username: studentA, password: testPassword });
    const sLoginB = await request('POST', '/api/auth/login', {}, { role: 'student', username: studentB, password: testPassword });
    const fLoginA = await request('POST', '/api/auth/login', {}, { role: 'faculty', username: facultyA, password: testPassword });
    const fLoginB = await request('POST', '/api/auth/login', {}, { role: 'faculty', username: facultyB, password: testPassword });
    const aLogin = await request('POST', '/api/auth/login', {}, { role: 'admin', username: adminUser, password: testPassword });

    const tokenStudentA = sLoginA.body?.token;
    const tokenStudentB = sLoginB.body?.token;
    const tokenFacultyA = fLoginA.body?.token;
    const tokenFacultyB = fLoginB.body?.token;
    const tokenAdmin = aLogin.body?.token;

    console.log('--- 1. Authentication & Directory Enumeration Tests ---');

    // 1. Unauthenticated user-list request returns empty list
    const t1 = await request('GET', '/api/users/public');
    assertTest(t1.status === 200 && Array.isArray(t1.body?.users) && t1.body.users.length === 0, 'Unauthenticated user-list request returns empty list (no enumeration)');

    // 2. Invalid token rejected with 401
    const t2 = await request('GET', `/api/users/student/${studentA}`, { Authorization: 'Bearer invalid.token.signature' });
    assertTest(t2.status === 401, 'Invalid token returns 401 Unauthorized');

    // 3. Expired token rejected with 401
    const expiredPayload = Buffer.from(JSON.stringify({ id: `id-${studentA}`, role: 'student', username: studentA, exp: Date.now() - 10000 })).toString('base64url');
    const secret = process.env.SESSION_SECRET || 'campussphere_session_secret_key_2026_secure';
    const expiredSig = crypto.createHmac('sha256', secret).update(expiredPayload).digest('base64url');
    const t3 = await request('GET', `/api/users/student/${studentA}`, { Authorization: `Bearer ${expiredPayload}.${expiredSig}` });
    assertTest(t3.status === 401, 'Expired token returns 401 Unauthorized');

    // 4. Authenticated valid request succeeds
    const t4 = await request('GET', `/api/users/student/${studentA}`, { Authorization: `Bearer ${tokenStudentA}` });
    assertTest(t4.status === 200 && t4.body?.user?.username === studentA, 'Authenticated valid request succeeds');

    console.log('\n--- 2. IDOR Protection Tests ---');

    // 5. Student accessing own profile -> 200 OK
    const t5 = await request('GET', `/api/users/student/${studentA}`, { Authorization: `Bearer ${tokenStudentA}` });
    assertTest(t5.status === 200 && t5.body?.user?.username === studentA, 'Student accessing own profile -> 200 OK');

    // 6. Student accessing another student -> 403 Forbidden
    const t6 = await request('GET', `/api/users/student/${studentB}`, { Authorization: `Bearer ${tokenStudentA}` });
    assertTest(t6.status === 403, 'Student accessing another student profile -> 403 Forbidden');

    // 7. Student accessing faculty -> 403 Forbidden
    const t7 = await request('GET', `/api/users/faculty/${facultyA}`, { Authorization: `Bearer ${tokenStudentA}` });
    assertTest(t7.status === 403, 'Student accessing faculty account -> 403 Forbidden');

    // 8. Student accessing admin -> 403 Forbidden
    const t8 = await request('GET', `/api/users/admin/${adminUser}`, { Authorization: `Bearer ${tokenStudentA}` });
    assertTest(t8.status === 403, 'Student accessing admin account -> 403 Forbidden');

    // 9. Faculty accessing unauthorized user (another faculty or admin) -> 403 Forbidden
    const t9_fac = await request('GET', `/api/users/faculty/${facultyB}`, { Authorization: `Bearer ${tokenFacultyA}` });
    const t9_adm = await request('GET', `/api/users/admin/${adminUser}`, { Authorization: `Bearer ${tokenFacultyA}` });
    assertTest(t9_fac.status === 403 && t9_adm.status === 403, 'Faculty accessing another faculty or admin -> 403 Forbidden');

    // 10. Admin accessing legitimate user -> 200 OK
    const t10 = await request('GET', `/api/users/student/${studentA}`, { Authorization: `Bearer ${tokenAdmin}` });
    assertTest(t10.status === 200 && t10.body?.user?.username === studentA, 'Admin accessing any user -> 200 OK');

    console.log('\n--- 3. User Updates, Field Allowlists & Privilege Escalation Tests ---');

    // 11. Student updating own allowed fields succeeds
    const t11 = await request('PUT', `/api/users/student/${studentA}`, { Authorization: `Bearer ${tokenStudentA}` }, {
      name: 'Student Alpha Renamed',
      division: 'Div A',
      semester: '2nd Semester'
    });
    const refreshedA = await User.findOne({ username: studentA });
    assertTest(t11.status === 200 && refreshedA.name === 'Student Alpha Renamed' && refreshedA.semester === '2nd Semester', 'Student updating own allowed fields succeeds');

    // 12. Student attempting to modify another user -> 403 Forbidden
    const t12 = await request('PUT', `/api/users/student/${studentB}`, { Authorization: `Bearer ${tokenStudentA}` }, {
      name: 'Hijacked Student Beta'
    });
    const checkB = await User.findOne({ username: studentB });
    assertTest(t12.status === 403 && checkB.name === 'Student Beta', 'Student attempting to modify another user -> 403 Forbidden');

    // 13. Student attempting role escalation -> 403 Forbidden / role unchanged
    const t13 = await request('PUT', `/api/users/student/${studentA}`, { Authorization: `Bearer ${tokenStudentA}` }, {
      role: 'admin',
      isAdmin: true,
      permissions: ['all']
    });
    const checkRoleA = await User.findOne({ username: studentA });
    assertTest(t13.status === 403 && checkRoleA.role === 'student', 'Student attempting role escalation -> 403 Forbidden and role untouched');

    // 14. Student attempting passwordHash injection -> ignored / hash not replaced with raw text
    const t14 = await request('PUT', `/api/users/student/${studentA}`, { Authorization: `Bearer ${tokenStudentA}` }, {
      passwordHash: 'injected_plain_hash_value'
    });
    const checkHashA = await User.findOne({ username: studentA });
    assertTest(checkHashA.passwordHash !== 'injected_plain_hash_value', 'Direct passwordHash injection rejected/ignored');

    // 15. Student attempting MongoDB operator injection -> 400 Bad Request
    const t15 = await request('PUT', `/api/users/student/${studentA}`, { Authorization: `Bearer ${tokenStudentA}` }, {
      $set: { role: 'admin' }
    });
    assertTest(t15.status === 400, 'MongoDB operator injection ($set) rejected with 400 Bad Request');

    // 16. Faculty attempting unauthorized role modification -> 403 Forbidden
    const t16 = await request('PUT', `/api/users/faculty/${facultyA}`, { Authorization: `Bearer ${tokenFacultyA}` }, {
      role: 'admin'
    });
    const checkRoleFac = await User.findOne({ username: facultyA });
    assertTest(t16.status === 403 && checkRoleFac.role === 'faculty', 'Faculty attempting unauthorized role modification -> 403 Forbidden');

    // 17. Admin legitimate update succeeds
    const t17 = await request('PUT', `/api/users/student/${studentA}`, { Authorization: `Bearer ${tokenAdmin}` }, {
      name: 'Student Alpha Admin-Edited'
    });
    const checkAdminEdit = await User.findOne({ username: studentA });
    assertTest(t17.status === 200 && checkAdminEdit.name === 'Student Alpha Admin-Edited', 'Admin legitimate update succeeds');

    console.log('\n--- 4. Password Security & Hash Leakage Tests ---');

    // 18. passwordHash never returned in API responses
    const t18 = await request('GET', `/api/users/student/${studentA}`, { Authorization: `Bearer ${tokenStudentA}` });
    assertTest(t18.body?.user && t18.body.user.passwordHash === undefined && t18.body.user.password === undefined, 'passwordHash is NEVER returned in GET /api/users/:role/:username');

    // 19. plaintext password never returned in login or signup response
    assertTest(sLoginA.body?.user && sLoginA.body.user.password === undefined && sLoginA.body.user.passwordHash === undefined, 'Plaintext password and hash NEVER returned in login response');

    // 20. existing password hash preserved across regular profile updates
    const hashBeforeUpdate = checkAdminEdit.passwordHash;
    await request('PUT', `/api/users/student/${studentA}`, { Authorization: `Bearer ${tokenStudentA}` }, {
      name: 'Student Alpha Re-edited'
    });
    const docAfterUpdate = await User.findOne({ username: studentA });
    assertTest(docAfterUpdate.passwordHash === hashBeforeUpdate, 'Existing passwordHash preserved across non-password profile updates');

    // 21. password update requires currentPassword and updates hash securely
    const badPassUpdate = await request('PUT', `/api/users/student/${studentA}`, { Authorization: `Bearer ${tokenStudentA}` }, {
      password: 'NewPassword999!',
      currentPassword: 'WrongPassword!'
    });
    const goodPassUpdate = await request('PUT', `/api/users/student/${studentA}`, { Authorization: `Bearer ${tokenStudentA}` }, {
      password: 'NewPassword999!',
      currentPassword: testPassword
    });
    const docAfterPassChange = await User.findOne({ username: studentA });
    const verifyNewPass = await User.findOne({ username: studentA });
    const testNewLogin = await request('POST', '/api/auth/login', {}, { role: 'student', username: studentA, password: 'NewPassword999!' });
    assertTest(badPassUpdate.status === 400 && goodPassUpdate.status === 200 && testNewLogin.status === 200, 'Password update verifies currentPassword, re-hashes, and authenticates with new password');

    console.log('\n--- 5. User Deletion Security Tests ---');

    // 22. Student delete attempt -> 403 Forbidden
    const t22 = await request('DELETE', `/api/users/student/${studentB}`, { Authorization: `Bearer ${tokenStudentA}` });
    assertTest(t22.status === 403, 'Student delete attempt blocked with 403 Forbidden');

    // 23. Faculty delete attempt -> 403 Forbidden
    const t23 = await request('DELETE', `/api/users/student/${studentB}`, { Authorization: `Bearer ${tokenFacultyA}` });
    assertTest(t23.status === 403, 'Faculty delete attempt blocked with 403 Forbidden');

    // 24. Admin legitimate delete -> 200 OK
    const t24 = await request('DELETE', `/api/users/student/${studentB}`, { Authorization: `Bearer ${tokenAdmin}` });
    const checkDeleted = await User.findOne({ username: studentB });
    assertTest(t24.status === 200 && !checkDeleted, 'Admin legitimate delete removes user permanently');

    // 25. Deletion of admin accounts blocked -> 403 Forbidden
    const t25 = await request('DELETE', `/api/users/admin/${adminUser}`, { Authorization: `Bearer ${tokenAdmin}` });
    const checkAdminStillAlive = await User.findOne({ username: adminUser });
    assertTest(t25.status === 403 && Boolean(checkAdminStillAlive), 'Admin account deletion strictly blocked with 403 Forbidden');

    console.log('\n--- 6. User Migration Security Tests ---');

    // 26. Unauthorized migration attempt -> 401
    const t26 = await request('POST', '/api/users/migrate', {}, { users: {} });
    assertTest(t26.status === 401, 'Unauthorized migration returns 401 Unauthorized');

    // 27. Student migration attempt -> 403
    const t27 = await request('POST', '/api/users/migrate', { Authorization: `Bearer ${tokenStudentA}` }, { users: {} });
    assertTest(t27.status === 403, 'Student migration attempt blocked with 403 Forbidden');

    // 28. Admin migration succeeds
    const migStu = `mig_stu_${timeTag}`;
    const t28 = await request('POST', '/api/users/migrate', { Authorization: `Bearer ${tokenAdmin}` }, {
      users: {
        student: [{ username: migStu, name: 'Migration Student', division: 'Div A' }]
      }
    });
    const checkMigStu = await User.findOne({ username: migStu });
    assertTest(t28.status === 200 && Boolean(checkMigStu), 'Admin user migration executes safely');

    // 29. Duplicate migration is idempotent
    const t29 = await request('POST', '/api/users/migrate', { Authorization: `Bearer ${tokenAdmin}` }, {
      users: {
        student: [{ username: migStu, name: 'Migration Student (Updated)', division: 'Div A' }]
      }
    });
    const countMig = await User.countDocuments({ username: migStu });
    assertTest(t29.status === 200 && countMig === 1, 'Duplicate migration is idempotent (0 duplicate accounts created)');

    // 30. Cross-role collision in migration blocked
    const t30 = await request('POST', '/api/users/migrate', { Authorization: `Bearer ${tokenAdmin}` }, {
      users: {
        student: [{ username: adminUser, name: 'Fake Hijacker' }]
      }
    });
    const checkAdminRole = await User.findOne({ username: adminUser });
    assertTest(t30.status === 200 && checkAdminRole.role === 'admin' && checkAdminRole.name !== 'Fake Hijacker', 'Cross-role collision blocked during migration (existing role protected)');

    console.log('\n--- 7. Privacy & Data Leakage Tests ---');

    // 31. Public endpoint does not expose sensitive user fields to Students (Students only receive own profile)
    const t31_student = await request('GET', '/api/users/public', { Authorization: `Bearer ${tokenStudentA}` });
    const studentPublicUsers = t31_student.body?.users || [];
    const hasOnlySelf = studentPublicUsers.length === 1 && studentPublicUsers[0].username === studentA;
    assertTest(hasOnlySelf, 'GET /api/users/public for Student returns ONLY their own profile (directory protected)');

    // 32. Faculty public user list redacts student emails and excludes admin accounts
    const t32_faculty = await request('GET', '/api/users/public', { Authorization: `Bearer ${tokenFacultyA}` });
    const facultyPublicUsers = t32_faculty.body?.users || [];
    const exposedAdmin = facultyPublicUsers.some(u => u.role === 'admin');
    const studentWithEmail = facultyPublicUsers.filter(u => u.role === 'student' && u.email);
    assertTest(!exposedAdmin && studentWithEmail.length === 0, 'GET /api/users/public for Faculty redacts student emails and excludes admin accounts');

    console.log(`\n==============================================`);
    console.log(`Results: ${testPassedCount} / ${testTotalCount} tests passed.`);
    console.log(`==============================================\n`);

  } finally {
    // Clean up test users
    try {
      await User.deleteMany({
        username: {
          $in: [studentA, studentB, facultyA, facultyB, adminUser, `mig_stu_${timeTag}`]
        }
      });
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
