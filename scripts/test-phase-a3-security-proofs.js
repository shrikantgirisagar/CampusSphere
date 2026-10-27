// scripts/test-phase-a3-security-proofs.js
// Automated verification suite for Phase A3: 5 Required Core Security Proofs:
// (a) Faculty cannot overwrite another faculty's notice, marks or assignments via /api/academic/sync
// (b) Tokens stop working (HTTP 401) after logout, password change, admin password reset AND role change
// (c) Last admin cannot be deleted or demoted
// (d) Student cannot read another student's profile or restricted data
// (e) usernameLower partial unique index rejects "Admin" when "admin" exists

require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const assert = require("assert");
const { setupTestDb, stopTestDb } = require("./lib/test-db");

const TEST_PORT = 3096;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let serverInstance = null;
let passedCount = 0;
let failedCount = 0;

function report(name, ok, err = null) {
  if (ok) {
    console.log(`  [PASS] ${name}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${name}${err ? " -> " + (err.message || err) : ""}`);
    failedCount++;
  }
}

function request(method, reqPath, body = null, token = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, BASE_URL);
    const headers = { ...extraHeaders };
    if (body !== null && typeof body === "object" && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let payload = null;
    if (body !== null) {
      payload = typeof body === "string" ? body : JSON.stringify(body);
      headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(url, { method, headers }, (res) => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runProofs() {
  console.log("================================================================");
  console.log("CAMPUSSPHERE PHASE A3: 5 CORE SECURITY PROOFS VERIFICATION SUITE");
  console.log("================================================================\n");

  process.env.NODE_ENV = "test";
  process.env.SESSION_SECRET = "test_phase_a3_security_proofs_secret_key_32chars_len";
  process.env.PORT = String(TEST_PORT);

  await setupTestDb("CampusSphere_a3_proofs_test");

  const app = require("../server");
  const User = require("../models/User");
  const AcademicStore = require("../models/AcademicStore");

  serverInstance = http.createServer(app);
  await new Promise((resolve) => serverInstance.listen(TEST_PORT, "127.0.0.1", resolve));
  console.log(`✓ Test server running on http://127.0.0.1:${TEST_PORT}\n`);

  // Clear existing collections in test database
  await User.deleteMany({});
  await AcademicStore.deleteMany({});

  // Seed baseline test users with real scrypt hash
  const crypto = require("crypto");
  const { promisify } = require("util");
  const scryptAsync = promisify(crypto.scrypt);
  const salt = crypto.randomBytes(16);
  const derived = await scryptAsync("AdminPass@123", salt, 64, { N: 16384, r: 8, p: 1 });
  const adminPasswordHash = `scrypt$16384$8$1$${salt.toString("base64url")}$${Buffer.from(derived).toString("base64url")}`;
  
  // Seed admin1 and admin2
  const admin1 = await User.create({
    id: "admin-proof-01",
    role: "admin",
    name: "Primary Administrator",
    username: "admin1",
    usernameLower: "admin1",
    email: "admin1@campussphere.edu",
    passwordHash: adminPasswordHash,
    tokenVersion: 0
  });

  const admin2 = await User.create({
    id: "admin-proof-02",
    role: "admin",
    name: "Secondary Administrator",
    username: "admin2",
    usernameLower: "admin2",
    email: "admin2@campussphere.edu",
    passwordHash: adminPasswordHash,
    tokenVersion: 0
  });

  // Seed faculty1 (Java, Div A)
  const faculty1 = await User.create({
    id: "fac-proof-01",
    role: "faculty",
    name: "Prof. Alan Turing",
    username: "faculty1",
    usernameLower: "faculty1",
    email: "faculty1@campussphere.edu",
    passwordHash: adminPasswordHash,
    tokenVersion: 0,
    department: "Computer Applications",
    subject: "Java Programming",
    subjects: ["Java Programming"],
    subjectDivisions: new Map([["Java Programming", "Div A"]]),
    division: "Div A"
  });

  // Seed faculty2 (Web Dev, Div B)
  const faculty2 = await User.create({
    id: "fac-proof-02",
    role: "faculty",
    name: "Prof. Ada Lovelace",
    username: "faculty2",
    usernameLower: "faculty2",
    email: "faculty2@campussphere.edu",
    passwordHash: adminPasswordHash,
    tokenVersion: 0,
    department: "Computer Applications",
    subject: "Web Development",
    subjects: ["Web Development"],
    subjectDivisions: new Map([["Web Development", "Div B"]]),
    division: "Div B"
  });

  // Seed student1 (Div A)
  const student1 = await User.create({
    id: "stud-proof-01",
    role: "student",
    name: "Alice Student",
    username: "student_alice",
    usernameLower: "student_alice",
    email: "alice@campussphere.edu",
    passwordHash: adminPasswordHash,
    tokenVersion: 0,
    division: "Div A",
    semester: "Semester 5"
  });

  // Seed student2 (Div B)
  const student2 = await User.create({
    id: "stud-proof-02",
    role: "student",
    name: "Bob Student",
    username: "student_bob",
    usernameLower: "student_bob",
    email: "bob@campussphere.edu",
    passwordHash: adminPasswordHash,
    tokenVersion: 0,
    division: "Div B",
    semester: "Semester 5"
  });

  // Helper to log in and get token
  async function getLoginToken(role, username, password = "AdminPass@123") {
    const res = await request("POST", "/api/auth/login", { role, username, password });
    assert(res.status === 200 && res.body.token, `Failed login for ${username} (${res.status})`);
    return res.body.token;
  }

  const tokenAdmin1 = await getLoginToken("admin", "admin1");
  const tokenAdmin2 = await getLoginToken("admin", "admin2");
  const tokenFaculty1 = await getLoginToken("faculty", "faculty1");
  const tokenFaculty2 = await getLoginToken("faculty", "faculty2");
  const tokenAlice = await getLoginToken("student", "student_alice");
  const tokenBob = await getLoginToken("student", "student_bob");

  // --------------------------------------------------------------------------
  // PROOF A: Faculty Cross-Authorship Overwrite Prevention
  // --------------------------------------------------------------------------
  console.log("--- PROOF A: Faculty Cross-Authorship Overwrite Protection ---");

  // A1. Faculty 1 creates a notice
  const noticeRes = await request("POST", "/api/academic/sync", {
    notices: [{
      id: "notice_java_001",
      title: "Java Lab Exam Schedule",
      text: "Java lab exam is scheduled on Monday.",
      authorUsername: "faculty1",
      authorName: "Prof. Alan Turing",
      authorRole: "faculty",
      date: "2026-10-27"
    }]
  }, tokenFaculty1);
  report("Faculty 1 can publish own notice", noticeRes.status === 200);

  // A2. Faculty 2 attempts to overwrite Faculty 1's notice
  const overwriteNoticeRes = await request("POST", "/api/academic/sync", {
    notices: [{
      id: "notice_java_001",
      title: "Tampered Java Schedule",
      text: "Exam cancelled by unauthorized faculty.",
      authorUsername: "faculty2",
      authorName: "Prof. Ada Lovelace",
      authorRole: "faculty"
    }]
  }, tokenFaculty2);
  report("Faculty 2 CANNOT overwrite Faculty 1's notice (403 Forbidden)", overwriteNoticeRes.status === 403);

  // A3. Faculty 1 publishes assignment for Java Programming
  const assignRes = await request("POST", "/api/academic/sync", {
    assignments: [{
      id: "asgn_java_001",
      title: "Java OOP Assignment",
      subject: "Java Programming",
      division: "Div A",
      authorUsername: "faculty1",
      createdBy: "faculty1",
      due: "2026-11-01"
    }]
  }, tokenFaculty1);
  report("Faculty 1 can publish assignment for assigned subject", assignRes.status === 200);

  // A4. Faculty 2 attempts to overwrite Faculty 1's assignment
  const overwriteAssignRes = await request("POST", "/api/academic/sync", {
    assignments: [{
      id: "asgn_java_001",
      title: "Tampered Assignment Title",
      subject: "Java Programming",
      division: "Div A",
      authorUsername: "faculty2",
      createdBy: "faculty2"
    }]
  }, tokenFaculty2);
  report("Faculty 2 CANNOT overwrite Faculty 1's assignment (403 Forbidden)", overwriteAssignRes.status === 403);

  // A5. Faculty 2 attempts to modify marks for unassigned subject (Java Programming)
  const marksRes = await request("POST", "/api/academic/sync", {
    students: {
      student_alice: {
        name: "Alice Student",
        division: "Div A",
        semester: "Semester 5",
        marks: {
          "Java Programming": { internal1: 20, maxMarks: 20 }
        }
      }
    }
  }, tokenFaculty2);
  report("Faculty 2 CANNOT modify marks for unassigned subject (403 Forbidden)", marksRes.status === 403);

  // --------------------------------------------------------------------------
  // PROOF B: Token Revocation Lifecycle
  // --------------------------------------------------------------------------
  console.log("\n--- PROOF B: Token Revocation Lifecycle (Logout, Password Change, Admin Reset, Role Change) ---");

  // B1. Logout revokes token
  const aliceToken1 = await getLoginToken("student", "student_alice");
  const validBeforeLogout = await request("GET", "/api/users/student/student_alice", null, aliceToken1);
  assert(validBeforeLogout.status === 200, "Token should be valid prior to logout");

  const logoutRes = await request("POST", "/api/auth/logout", {}, aliceToken1);
  report("Logout responds with success", logoutRes.status === 200);

  const afterLogout = await request("GET", "/api/users/student/student_alice", null, aliceToken1);
  report("Token is REJECTED after logout (401 Unauthorized)", afterLogout.status === 401);

  // B2. Password change revokes token
  const aliceToken2 = await getLoginToken("student", "student_alice");
  const pwdChangeRes = await request("PUT", "/api/users/student/student_alice", {
    currentPassword: "AdminPass@123",
    password: "NewAlicePass@456"
  }, aliceToken2);
  report("User can change own password", pwdChangeRes.status === 200);

  const afterPwdChange = await request("GET", "/api/users/student/student_alice", null, aliceToken2);
  report("Token is REJECTED after password change (401 Unauthorized)", afterPwdChange.status === 401);

  // B3. Admin password reset revokes token
  const aliceToken3 = await getLoginToken("student", "student_alice", "NewAlicePass@456");
  const adminResetRes = await request("PUT", "/api/users/student/student_alice", {
    password: "AdminResetPass@789"
  }, tokenAdmin1);
  report("Admin can reset user password", adminResetRes.status === 200);

  const afterAdminReset = await request("GET", "/api/users/student/student_alice", null, aliceToken3);
  report("Token is REJECTED after admin password reset (401 Unauthorized)", afterAdminReset.status === 401);

  // B4. Admin role change revokes token
  const aliceToken4 = await getLoginToken("student", "student_alice", "AdminResetPass@789");
  const roleChangeRes = await request("PUT", "/api/users/student/student_alice", {
    role: "faculty",
    subject: "Java Programming"
  }, tokenAdmin1);
  report("Admin can change account role", roleChangeRes.status === 200);

  const afterRoleChange = await request("GET", "/api/users/student/student_alice", null, aliceToken4);
  report("Token is REJECTED after admin role change (401 Unauthorized)", afterRoleChange.status === 401);

  // Restore alice to student role for remaining tests
  await request("PUT", "/api/users/faculty/student_alice", {
    role: "student",
    division: "Div A",
    semester: "Semester 5",
    password: "AdminPass@123"
  }, tokenAdmin1);

  // --------------------------------------------------------------------------
  // PROOF C: Last Remaining Admin Cannot Be Deleted or Demoted
  // --------------------------------------------------------------------------
  console.log("\n--- PROOF C: Last Admin Deletion & Demotion Protection ---");

  // First, delete admin2 so only admin1 remains
  const delAdmin2Res = await request("DELETE", "/api/users/admin/admin2", null, tokenAdmin1);
  report("Admin 2 can be deleted while Admin 1 remains", delAdmin2Res.status === 200);

  // Verify only 1 admin remains in DB
  const remainingAdmins = await User.countDocuments({ role: "admin" });
  assert.strictEqual(remainingAdmins, 1, "Exactly one administrator must remain");

  // C1. Attempt to delete last remaining admin
  const delLastAdminRes = await request("DELETE", "/api/users/admin/admin1", null, tokenAdmin1);
  report("Last admin CANNOT be deleted (HTTP 400/403)", delLastAdminRes.status === 400 || delLastAdminRes.status === 403);

  // C2. Attempt to demote last remaining admin
  const demoteLastAdminRes = await request("PUT", "/api/users/admin/admin1", {
    role: "student"
  }, tokenAdmin1);
  report("Last admin CANNOT be demoted to student (HTTP 400/403)", demoteLastAdminRes.status === 400 || demoteLastAdminRes.status === 403);

  // --------------------------------------------------------------------------
  // PROOF D: Student Isolation & Data Protection
  // --------------------------------------------------------------------------
  console.log("\n--- PROOF D: Student Isolation & Data Protection ---");

  const aliceFreshToken = await getLoginToken("student", "student_alice", "AdminPass@123");

  // D1. Alice attempts to read Bob's account details
  const readBobRes = await request("GET", "/api/users/student/student_bob", null, aliceFreshToken);
  report("Student CANNOT read another student's account profile (403 Forbidden)", readBobRes.status === 403);

  // D2. Alice attempts to modify Bob's account
  const modifyBobRes = await request("PUT", "/api/users/student/student_bob", {
    name: "Hacked Bob"
  }, aliceFreshToken);
  report("Student CANNOT modify another student's account (403 Forbidden)", modifyBobRes.status === 403);

  // --------------------------------------------------------------------------
  // PROOF E: usernameLower Partial Unique Index Rejection
  // --------------------------------------------------------------------------
  console.log("\n--- PROOF E: Case-Insensitive Username Uniqueness via Partial Index ---");

  // "admin1" already exists with usernameLower = "admin1"
  let duplicateIndexRejected = false;
  try {
    await User.create({
      id: "admin-dup-test",
      role: "admin",
      name: "Colliding Admin",
      username: "Admin1", // Collides case-insensitively with "admin1"
      usernameLower: "admin1",
      email: "colliding@campussphere.edu",
      passwordHash: adminPasswordHash,
      tokenVersion: 0
    });
  } catch (err) {
    if (err.code === 11000) {
      duplicateIndexRejected = true;
    }
  }
  report("usernameLower partial unique index strictly rejects 'Admin1' when 'admin1' exists (E11000)", duplicateIndexRejected);

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n================================================================");
  console.log(`PHASE A3 SUITE RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("================================================================\n");

  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
  }
  await stopTestDb();

  if (failedCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runProofs().catch(async (err) => {
  console.error("FATAL SUITE ERROR:", err);
  if (serverInstance) serverInstance.close();
  await stopTestDb();
  process.exit(1);
});
