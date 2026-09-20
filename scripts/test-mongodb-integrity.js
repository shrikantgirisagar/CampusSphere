// scripts/test-mongodb-integrity.js
// Dedicated automated test suite for MongoDB Schema, Index, Query & Data Integrity Hardening (Prompt 9)

require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const crypto = require("crypto");

const TEST_PORT = 3097;
const BASE_URL = `http://localhost:${TEST_PORT}`;

let serverProcess = null;
let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedCount++;
  }
}

async function request(method, reqPath, body = null, token = null, extraHeaders = {}) {
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

function hashPassword(pwd) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(pwd, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$16384$8$1$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`);
    });
  });
}

async function main() {
  console.log("=== CampusSphere MongoDB Schema, Index & Data Integrity Test Suite (Prompt 9) ===");

  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/CampusSphere";
  await mongoose.connect(mongoUri);
  console.log("✓ Connected to MongoDB");

  // Load models
  const User = require("../models/User");
  const Notice = require("../models/Notice");
  const Attendance = require("../models/Attendance");
  const Mark = require("../models/Mark");
  const Assignment = require("../models/Assignment");
  const Note = require("../models/Note");
  const Timetable = require("../models/Timetable");
  const AcademicStore = require("../models/AcademicStore");

  // Start test server instance
  process.env.PORT = String(TEST_PORT);
  process.env.NODE_ENV = "test";
  serverProcess = require("../server.js");
  await new Promise(res => setTimeout(res, 1200));
  console.log(`✓ Test server running at ${BASE_URL}\n`);

  // Ensure Mongoose creates all indexes on MongoDB
  await Promise.all([
    User.syncIndexes(),
    Notice.syncIndexes(),
    Attendance.syncIndexes(),
    Mark.syncIndexes(),
    Assignment.syncIndexes(),
    Note.syncIndexes(),
    Timetable.syncIndexes(),
    AcademicStore.syncIndexes()
  ]);
  console.log("✓ Synchronized Mongoose indexes with MongoDB\n");

  const timestamp = Date.now();
  const adminUser = `admin_integ_${timestamp}`;
  const testPassword = "AdminPassword@123";
  const hashedPwd = await hashPassword(testPassword);

  await User.create({
    id: `id-${adminUser}`,
    role: "admin",
    username: adminUser,
    name: "Test Admin Integrity",
    email: `${adminUser}@test.edu`,
    passwordHash: hashedPwd
  });

  const adminLogin = await request("POST", "/api/auth/login", {
    role: "admin",
    username: adminUser,
    password: testPassword
  });
  const adminToken = adminLogin.body?.token;
  assert(adminLogin.status === 200 && !!adminToken, "Admin logged in successfully to obtain auth token");

  // -------------------------------------------------------------
  // 1. Schema Strictness Verification
  // -------------------------------------------------------------
  console.log("\n--- 1. Schema Strictness Tests ---");

  assert(User.schema.get("strict") === true, "User model has strict: true");
  assert(Notice.schema.get("strict") === true, "Notice model has strict: true");
  assert(Attendance.schema.get("strict") === true, "Attendance model has strict: true");
  assert(Mark.schema.get("strict") === true, "Mark model has strict: true");
  assert(Assignment.schema.get("strict") === true, "Assignment model has strict: true");
  assert(Note.schema.get("strict") === true, "Note model has strict: true");
  assert(Timetable.schema.get("strict") === true, "Timetable model has strict: true");
  assert(AcademicStore.schema.get("strict") === true, "AcademicStore model has strict: true");

  // Test that rogue properties are stripped upon saving
  const testNoticeId = `notice_strict_${timestamp}`;
  await Notice.create({
    noticeId: testNoticeId,
    title: "Strictness Test Notice",
    rogueProperty: "should_be_stripped"
  });
  const rawNoticeDoc = await mongoose.connection.db.collection("notices").findOne({ noticeId: testNoticeId });
  assert(rawNoticeDoc && rawNoticeDoc.rogueProperty === undefined, "Rogue top-level properties are stripped on Notice save");

  const testNoteId = `note_strict_${timestamp}`;
  await Note.create({
    noteId: testNoteId,
    subject: "Mathematics",
    title: "Strictness Test Note",
    uploadedBy: "prof_test",
    injectedField: "danger_payload"
  });
  const rawNoteDoc = await mongoose.connection.db.collection("notes").findOne({ noteId: testNoteId });
  assert(rawNoteDoc && rawNoteDoc.injectedField === undefined, "Rogue top-level properties are stripped on Note save");

  // -------------------------------------------------------------
  // 2. Field Validation & Bounds Tests
  // -------------------------------------------------------------
  console.log("\n--- 2. Field Validation Tests ---");

  // Role enum validation
  let roleErr = null;
  try {
    await User.create({
      id: `id-invalid-role-${timestamp}`,
      role: "superadmin_invalid",
      username: `invalid_role_${timestamp}`,
      name: "Invalid Role User",
      passwordHash: "dummy"
    });
  } catch (err) {
    roleErr = err;
  }
  assert(roleErr && roleErr.name === "ValidationError", "Invalid role is rejected by Mongoose enum validation");

  // Numeric marks range validation (negative marks rejected)
  let negMarkErr = null;
  try {
    await Mark.create({
      markId: `mark_neg_${timestamp}`,
      studentUsername: `student_${timestamp}`,
      subject: "Physics",
      marksObtained: -15
    });
  } catch (err) {
    negMarkErr = err;
  }
  assert(negMarkErr && negMarkErr.name === "ValidationError", "Negative marks are rejected by numeric min: 0 validation");

  // Numeric marks range validation (excessive marks > 1000 rejected)
  let excessMarkErr = null;
  try {
    await Mark.create({
      markId: `mark_excess_${timestamp}`,
      studentUsername: `student_${timestamp}`,
      subject: "Physics",
      marksObtained: 5000
    });
  } catch (err) {
    excessMarkErr = err;
  }
  assert(excessMarkErr && excessMarkErr.name === "ValidationError", "Excessive marks (>1000) are rejected by numeric max validation");

  // Valid marks within range are accepted
  const validMark = await Mark.create({
    markId: `mark_valid_${timestamp}`,
    studentUsername: `student_${timestamp}`,
    subject: "Physics",
    marksObtained: 85,
    maxMarks: 100
  });
  assert(validMark && validMark.marksObtained === 85, "Valid marks (85/100) are accepted successfully");

  // -------------------------------------------------------------
  // 3. Uniqueness & Partial Unique Index Tests
  // -------------------------------------------------------------
  console.log("\n--- 3. Uniqueness & Partial Unique Index Tests ---");

  // Duplicate username rejection
  const dupUser1 = `dup_user_${timestamp}`;
  await User.create({
    id: `id-${dupUser1}-1`,
    role: "student",
    username: dupUser1,
    name: "Original User",
    email: `orig_${timestamp}@test.edu`,
    passwordHash: hashedPwd
  });

  let dupUserErr = null;
  try {
    await User.create({
      id: `id-${dupUser1}-2`,
      role: "student",
      username: dupUser1,
      name: "Duplicate User",
      email: `diff_${timestamp}@test.edu`,
      passwordHash: hashedPwd
    });
  } catch (err) {
    dupUserErr = err;
  }
  assert(dupUserErr && dupUserErr.code === 11000, "Duplicate username is strictly rejected with MongoDB error code 11000");

  // Partial unique index: duplicate non-empty email rejected
  const sharedEmail = `shared_unique_${timestamp}@test.edu`;
  await User.create({
    id: `id-email-1-${timestamp}`,
    role: "student",
    username: `email_user_1_${timestamp}`,
    name: "Email User 1",
    email: sharedEmail,
    passwordHash: hashedPwd
  });

  let dupEmailErr = null;
  try {
    await User.create({
      id: `id-email-2-${timestamp}`,
      role: "student",
      username: `email_user_2_${timestamp}`,
      name: "Email User 2",
      email: sharedEmail,
      passwordHash: hashedPwd
    });
  } catch (err) {
    dupEmailErr = err;
  }
  assert(dupEmailErr && dupEmailErr.code === 11000, "Duplicate non-empty email is strictly rejected by partial unique index");

  // Multiple users with empty email ("") MUST succeed
  const emptyEmailUser1 = await User.create({
    id: `id-empty-1-${timestamp}`,
    role: "student",
    username: `empty_email_1_${timestamp}`,
    name: "Empty Email User 1",
    email: "",
    passwordHash: hashedPwd
  });
  const emptyEmailUser2 = await User.create({
    id: `id-empty-2-${timestamp}`,
    role: "student",
    username: `empty_email_2_${timestamp}`,
    name: "Empty Email User 2",
    email: "",
    passwordHash: hashedPwd
  });
  assert(
    emptyEmailUser1 && emptyEmailUser2,
    "Multiple users with empty email ('') coexist safely without collision"
  );

  // -------------------------------------------------------------
  // 4. Compound Index Verification
  // -------------------------------------------------------------
  console.log("\n--- 4. Compound Index Verification Tests ---");

  const userIndexes = await mongoose.connection.db.collection("users").indexes();
  const hasRoleUserIndex = userIndexes.some(idx => idx.key.role === 1 && idx.key.username === 1);
  assert(hasRoleUserIndex, "User collection has compound index { role: 1, username: 1 }");

  const hasEmailPartialIndex = userIndexes.some(idx => idx.key.email === 1 && idx.unique && idx.partialFilterExpression);
  assert(hasEmailPartialIndex, "User collection has partial unique index on non-empty email");

  const markIndexes = await mongoose.connection.db.collection("marks").indexes();
  const hasMarkCompoundIndex = markIndexes.some(idx => idx.key.studentUsername === 1 && idx.key.subject === 1);
  assert(hasMarkCompoundIndex, "Mark collection has compound index { studentUsername: 1, subject: 1 }");

  const attIndexes = await mongoose.connection.db.collection("attendances").indexes();
  const hasAttCompoundIndex = attIndexes.some(idx => idx.key.studentUsername === 1 && idx.key.date === -1);
  assert(hasAttCompoundIndex, "Attendance collection has compound index { studentUsername: 1, date: -1 }");

  const noteIndexes = await mongoose.connection.db.collection("notes").indexes();
  const hasNoteCompoundIndex = noteIndexes.some(idx => idx.key.subject === 1 && idx.key.division === 1);
  assert(hasNoteCompoundIndex, "Note collection has compound index { subject: 1, division: 1 }");

  const asgnIndexes = await mongoose.connection.db.collection("assignments").indexes();
  const hasAsgnCompoundIndex = asgnIndexes.some(idx => idx.key.subject === 1 && idx.key.targetDivision === 1);
  assert(hasAsgnCompoundIndex, "Assignment collection has compound index { subject: 1, targetDivision: 1 }");

  const ttIndexes = await mongoose.connection.db.collection("timetables").indexes();
  const hasTtCompoundIndex = ttIndexes.some(idx => idx.key.division === 1 && idx.key.semester === 1 && idx.key.day === 1 && idx.key.time === 1 && idx.unique);
  assert(hasTtCompoundIndex, "Timetable collection has compound unique index { division: 1, semester: 1, day: 1, time: 1 }");

  // -------------------------------------------------------------
  // 5. Referential Integrity: Username Update Cascade
  // -------------------------------------------------------------
  console.log("\n--- 5. Referential Integrity Tests ---");

  const shortTs = String(timestamp).slice(-6);
  const origStudentName = `stud_ref_${shortTs}`;
  const nextStudentName = `stud_upd_${shortTs}`;

  // Create student
  await User.create({
    id: `id-${origStudentName}`,
    role: "student",
    username: origStudentName,
    name: "Ref Student",
    email: `${origStudentName}@test.edu`,
    passwordHash: hashedPwd
  });

  // Create attendance & mark referencing origStudentName
  await Attendance.create({
    attendanceId: `att_${origStudentName}`,
    studentUsername: origStudentName,
    subject: "Data Structures",
    status: "Present",
    date: "2026-09-20"
  });
  await Mark.create({
    markId: `mark_${origStudentName}`,
    studentUsername: origStudentName,
    subject: "Data Structures",
    marksObtained: 92
  });

  // Perform username update via API
  const updateRes = await request("PUT", `/api/users/student/${origStudentName}`, {
    username: nextStudentName
  }, adminToken);
  assert(updateRes.status === 200, "Student username updated successfully via API");

  // Verify that Attendance and Mark updated their studentUsername reference in lockstep
  const updatedAtt = await Attendance.findOne({ attendanceId: `att_${origStudentName}` });
  const updatedMark = await Mark.findOne({ markId: `mark_${origStudentName}` });
  assert(updatedAtt && updatedAtt.studentUsername === nextStudentName, "Attendance reference automatically synchronized to new username");
  assert(updatedMark && updatedMark.studentUsername === nextStudentName, "Mark reference automatically synchronized to new username");

  // -------------------------------------------------------------
  // 6. Query Projections & Sensitive Data Protection
  // -------------------------------------------------------------
  console.log("\n--- 6. Query Projections & Data Minimization Tests ---");

  const publicUsersRes = await request("GET", "/api/users/public", null, adminToken);
  assert(publicUsersRes.status === 200, "GET /api/users/public responds with 200");
  const sampleRetrievedUser = (publicUsersRes.body?.users || [])[0];
  assert(sampleRetrievedUser && sampleRetrievedUser.passwordHash === undefined, "passwordHash is excluded by database projection and sanitization");

  // -------------------------------------------------------------
  // 7. Cleanup Test Records
  // -------------------------------------------------------------
  console.log("\n--- 7. Cleanup Test Records ---");
  await User.deleteMany({ username: { $in: [adminUser, dupUser1, `email_user_1_${timestamp}`, `empty_email_1_${timestamp}`, `empty_email_2_${timestamp}`, origStudentName, nextStudentName] } });
  await Notice.deleteMany({ noticeId: testNoticeId });
  await Note.deleteMany({ noteId: testNoteId });
  await Mark.deleteMany({ markId: { $in: [`mark_valid_${timestamp}`, `mark_${origStudentName}`] } });
  await Attendance.deleteMany({ attendanceId: `att_${origStudentName}` });
  console.log("✓ Cleaned up all test records successfully");
}

main()
  .then(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    console.log("\n==============================================");
    console.log(`Results: ${passedCount} passed, ${failedCount} failed.`);
    console.log("==============================================");
    process.exit(failedCount === 0 ? 0 : 1);
  })
  .catch(async (err) => {
    console.error("Test execution error:", err);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  });
