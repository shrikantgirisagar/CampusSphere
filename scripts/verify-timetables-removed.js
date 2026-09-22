/**
 * scripts/verify-timetables-removed.js
 *
 * Verifies that all timetables across all semesters and divisions have been
 * completely removed and that API endpoints return empty arrays cleanly.
 */

require('dotenv').config();
const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');
const mongoose = require('mongoose');

const User = require('../models/User');
const Timetable = require('../models/Timetable');
const AcademicStore = require('../models/AcademicStore');

const TEST_PORT = 3099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch (_) {
            json = raw;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      }
    );
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
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

async function runVerification() {
  console.log('=== Verifying All Semesters Timetables Removed ===\n');

  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI');
  }

  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'CampusSphere' });
  console.log('✓ Connected to MongoDB');

  // Check 1: Timetables collection count
  const ttCount = await Timetable.countDocuments({});
  console.log(`1. Timetable collection document count: ${ttCount}`);
  if (ttCount !== 0) {
    throw new Error(`Expected 0 documents in timetables collection, found ${ttCount}`);
  }
  console.log('   [PASS] Dedicated timetables collection is completely empty.');

  // Check 2: AcademicStore timetable array
  const store = await AcademicStore.findOne({ storeKey: 'default_academic_store' }).lean();
  if (!store) {
    throw new Error('AcademicStore not found');
  }
  const storeTTCount = (store.timetable || []).length;
  console.log(`2. AcademicStore timetable array length: ${storeTTCount}`);
  if (storeTTCount !== 0) {
    throw new Error(`Expected empty timetable array in AcademicStore, found ${storeTTCount}`);
  }
  console.log('   [PASS] AcademicStore timetable array is completely empty.');

  // Check 3: Start test server and verify API endpoints
  console.log(`\nStarting test server on port ${TEST_PORT}...`);
  const serverProc = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(TEST_PORT) },
    stdio: 'pipe'
  });

  // Wait for server to be responsive AND database connected
  let online = false;
  for (let i = 0; i < 30; i++) {
    await wait(500);
    try {
      const res = await request('GET', '/api/status');
      if (res.status === 200 && res.body?.success && res.body?.databaseState === 'connected') {
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

  const tag = Date.now();
  const stuUser = `verify_stu_${tag}`;
  const facUser = `verify_fac_${tag}`;
  const admUser = `verify_adm_${tag}`;
  const pwd = 'Password123!';
  const hashedPwd = await hashPass(pwd);

  try {
    await User.create([
      { id: `id-${stuUser}`, role: 'student', username: stuUser, name: 'Verify Student', email: `${stuUser}@test.edu`, passwordHash: hashedPwd, division: 'Div A', courseYear: '1st Year' },
      { id: `id-${facUser}`, role: 'faculty', username: facUser, name: 'Verify Faculty', email: `${facUser}@test.edu`, passwordHash: hashedPwd, subject: 'sub-bca101' },
      { id: `id-${admUser}`, role: 'admin', username: admUser, name: 'Verify Admin', email: `${admUser}@test.edu`, passwordHash: hashedPwd }
    ]);

    const stuLogin = await request('POST', '/api/auth/login', {}, { role: 'student', username: stuUser, password: pwd });
    const facLogin = await request('POST', '/api/auth/login', {}, { role: 'faculty', username: facUser, password: pwd });
    const adminLogin = await request('POST', '/api/auth/login', {}, { role: 'admin', username: admUser, password: pwd });

    const stuToken = stuLogin.body?.token;
    const facToken = facLogin.body?.token;
    const admToken = adminLogin.body?.token;

    // Test GET /api/timetable for student
    const ttStudent = await request('GET', '/api/timetable', { Authorization: `Bearer ${stuToken}` });
    if (ttStudent.status !== 200 || !Array.isArray(ttStudent.body?.timetable) || ttStudent.body.timetable.length !== 0) {
      throw new Error(`Expected 200 with empty array for student, got ${JSON.stringify(ttStudent.body)}`);
    }
    console.log('   [PASS] GET /api/timetable returns { success: true, timetable: [] } for Student');

    // Test GET /api/timetable for faculty
    const ttFaculty = await request('GET', '/api/timetable', { Authorization: `Bearer ${facToken}` });
    if (ttFaculty.status !== 200 || !Array.isArray(ttFaculty.body?.timetable) || ttFaculty.body.timetable.length !== 0) {
      throw new Error(`Expected 200 with empty array for faculty, got ${JSON.stringify(ttFaculty.body)}`);
    }
    console.log('   [PASS] GET /api/timetable returns { success: true, timetable: [] } for Faculty');

    // Test GET /api/timetable for admin
    const ttAdmin = await request('GET', '/api/timetable', { Authorization: `Bearer ${admToken}` });
    if (ttAdmin.status !== 200 || !Array.isArray(ttAdmin.body?.timetable) || ttAdmin.body.timetable.length !== 0) {
      throw new Error(`Expected 200 with empty array for admin, got ${JSON.stringify(ttAdmin.body)}`);
    }
    console.log('   [PASS] GET /api/timetable returns { success: true, timetable: [] } for Admin');

    // Test GET /api/academic/data for student
    const acadStudent = await request('GET', '/api/academic/data', { Authorization: `Bearer ${stuToken}` });
    if (acadStudent.status !== 200 || !Array.isArray(acadStudent.body?.data?.timetable) || acadStudent.body.data.timetable.length !== 0) {
      throw new Error(`Expected academic data timetable to be empty array, got ${JSON.stringify(acadStudent.body?.data?.timetable)}`);
    }
    console.log('   [PASS] GET /api/academic/data returns data.timetable: [] for Student');

    // Test GET /api/academic/data for faculty
    const acadFaculty = await request('GET', '/api/academic/data', { Authorization: `Bearer ${facToken}` });
    if (acadFaculty.status !== 200 || !Array.isArray(acadFaculty.body?.data?.timetable) || acadFaculty.body.data.timetable.length !== 0) {
      throw new Error(`Expected academic data timetable to be empty array, got ${JSON.stringify(acadFaculty.body?.data?.timetable)}`);
    }
    console.log('   [PASS] GET /api/academic/data returns data.timetable: [] for Faculty');

    // Test GET /api/academic/data for admin
    const acadAdmin = await request('GET', '/api/academic/data', { Authorization: `Bearer ${admToken}` });
    if (acadAdmin.status !== 200 || !Array.isArray(acadAdmin.body?.data?.timetable) || acadAdmin.body.data.timetable.length !== 0) {
      throw new Error(`Expected academic data timetable to be empty array, got ${JSON.stringify(acadAdmin.body?.data?.timetable)}`);
    }
    console.log('   [PASS] GET /api/academic/data returns data.timetable: [] for Admin');

    console.log('\n==============================================');
    console.log('✅ ALL TIMETABLES VERIFIED REMOVED ACROSS ALL SEMESTERS!');
    console.log('==============================================');
  } finally {
    await User.deleteMany({ username: { $in: [stuUser, facUser, admUser] } });
    serverProc.kill();
    await mongoose.disconnect();
  }
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
