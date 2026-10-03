// scripts/test-division-sync.js
// Automated verification suite for Admin Divisions Management & Automatic Synchronization

require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/User");
const AcademicStore = require("../models/AcademicStore");
const Timetable = require("../models/Timetable");
const Attendance = require("../models/Attendance");
const Assignment = require("../models/Assignment");
const Note = require("../models/Note");
const Notice = require("../models/Notice");

const TEST_PORT = 3098;
const BASE_URL = `http://localhost:${TEST_PORT}`;

let serverInstance = null;
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

function hashPassword(pwd) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(pwd, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$16384$8$1$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`);
    });
  });
}

async function request(method, reqPath, body = null, token = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, BASE_URL);
    const headers = { ...extraHeaders };
    if (body !== null && typeof body === "object" && !Buffer.isBuffer(body) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let payload = null;
    if (body !== null) {
      if (Buffer.isBuffer(body)) {
        payload = body;
        headers["Content-Length"] = body.length;
      } else if (typeof body === "string") {
        payload = body;
        headers["Content-Length"] = Buffer.byteLength(body);
      } else {
        payload = JSON.stringify(body);
        headers["Content-Length"] = Buffer.byteLength(payload);
      }
    }

    const req = http.request(url, { method, headers }, (res) => {
      const chunks = [];
      res.on("data", chunk => chunks.push(chunk));
      res.on("end", () => {
        const fullBuffer = Buffer.concat(chunks);
        const text = fullBuffer.toString("utf8");
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (_) {
          json = text;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json,
          rawBody: text
        });
      });
    });

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function run() {
  console.log("==================================================================");
  console.log("CAMPUSSPHERE DIVISION AUTOMATIC CASCADE & SYNC VERIFICATION SUITE");
  console.log("==================================================================\n");

  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/CampusSphere";
  await mongoose.connect(mongoUri, { dbName: "CampusSphere" });
  console.log("✓ Connected to MongoDB");

  // Start test server on TEST_PORT
  process.env.PORT = String(TEST_PORT);
  process.env.NODE_ENV = "test";
  serverInstance = require("../server.js");
  await new Promise(res => setTimeout(res, 1200));
  console.log(`✓ Test server running at ${BASE_URL}\n`);

  // Create temporary test users
  const timestamp = Date.now();
  const adminUsername = `test_div_admin_${timestamp}`;
  const studentUsername = `test_div_student_${timestamp}`;
  const facultyUsername = `test_div_faculty_${timestamp}`;
  const testPassword = "Password@123";
  const hashedPwd = await hashPassword(testPassword);

  const testStudentUser = new User({
    id: `id-${studentUsername}`,
    role: "student",
    username: studentUsername,
    name: "Division Test Student",
    email: `${studentUsername}@test.edu`,
    passwordHash: hashedPwd,
    courseYear: "1st Year",
    semester: "1st Semester",
    division: "Div A"
  });

  const testFacultyUser = new User({
    id: `id-${facultyUsername}`,
    role: "faculty",
    username: facultyUsername,
    name: "Division Test Faculty",
    email: `${facultyUsername}@test.edu`,
    passwordHash: hashedPwd,
    subject: "cprog",
    subjects: ["cprog"],
    subjectDivisions: { cprog: "Div A" },
    division: "Div A"
  });

  const testAdminUser = new User({
    id: `id-${adminUsername}`,
    role: "admin",
    username: adminUsername,
    name: "Division Test Admin",
    email: `${adminUsername}@test.edu`,
    passwordHash: hashedPwd
  });

  await Promise.all([testStudentUser.save(), testFacultyUser.save(), testAdminUser.save()]);

  try {
    // Acquire auth tokens
    const adminLogin = await request("POST", "/api/auth/login", { role: "admin", username: adminUsername, password: testPassword });
    const adminToken = adminLogin.body?.token;
    assert(adminLogin.status === 200 && adminToken, "Admin logged in successfully and acquired token");

    const studentLogin = await request("POST", "/api/auth/login", { role: "student", username: studentUsername, password: testPassword });
    const studentToken = studentLogin.body?.token;
    assert(studentLogin.status === 200 && studentToken, "Student logged in successfully and acquired token");

    // -------------------------------------------------------------
    // SECTION 1: Security & RBAC Checks
    // -------------------------------------------------------------
    console.log("\n--- SECTION 1: Security & RBAC Checks ---");
    const unauthRes = await request("POST", "/api/academic/divisions/cascade", { action: "add" });
    assert(unauthRes.status === 401, "Unauthenticated access rejected with 401");

    const studentRes = await request("POST", "/api/academic/divisions/cascade", { action: "add" }, studentToken);
    assert(studentRes.status === 403, "Student access rejected with 403 Forbidden");

    const invalidActionRes = await request("POST", "/api/academic/divisions/cascade", { action: "invalid" }, adminToken);
    assert(invalidActionRes.status === 400, "Invalid action rejected with 400 Bad Request");

    // -------------------------------------------------------------
    // SECTION 2: ADD DIVISION & Store Sync
    // -------------------------------------------------------------
    console.log("\n--- SECTION 2: ADD DIVISION & Store Sync ---");
    const testDivName = `Div Auto${timestamp % 1000}`;
    const addRes = await request("POST", "/api/academic/divisions/cascade", {
      action: "add",
      courseYear: "1st Year",
      newDivision: testDivName
    }, adminToken);

    assert(addRes.status === 200, `Admin successfully added '${testDivName}'`);
    assert(addRes.body?.divisions?.["1st Year"]?.includes(testDivName),
      `New division '${testDivName}' confirmed in API response divisions store`);

    const storeAfterAdd = await AcademicStore.findOne({ storeKey: "default_academic_store" });
    assert(storeAfterAdd?.divisions?.["1st Year"]?.includes(testDivName),
      `New division '${testDivName}' permanently written to MongoDB AcademicStore`);

    // -------------------------------------------------------------
    // SECTION 3: RENAME DIVISION & Universal Cascade
    // -------------------------------------------------------------
    console.log("\n--- SECTION 3: RENAME DIVISION & Universal Cascade ---");
    // Assign student, faculty, timetable, attendance, assignment, note, notice to testDivName
    testStudentUser.division = testDivName;
    await testStudentUser.save();

    testFacultyUser.division = testDivName;
    testFacultyUser.subjectDivisions = { cprog: testDivName };
    await testFacultyUser.save();

    const ttDoc = new Timetable({
      semester: "1st Semester",
      division: testDivName,
      days: ["Monday"],
      timeSlots: ["09:00 - 10:00"],
      cells: [{ dayIndex: 0, slotIndex: 0, subject: "C Programming" }]
    });
    await ttDoc.save();

    const attDoc = new Attendance({
      attendanceId: `att_test_${timestamp}`,
      studentUsername: studentUsername,
      subject: "cprog",
      division: testDivName,
      semester: "1st Semester",
      courseYear: "1st Year",
      date: "30-09-26",
      records: { [studentUsername]: "P" }
    });
    await attDoc.save();

    const asgnDoc = new Assignment({
      assignmentId: `asgn_test_${timestamp}`,
      title: "Test Sync Assignment",
      subject: "cprog",
      targetDivision: testDivName
    });
    await asgnDoc.save();

    const noteDoc = new Note({
      noteId: `note_test_${timestamp}`,
      title: "Test Sync Note",
      subject: "cprog",
      division: testDivName,
      uploadedBy: facultyUsername
    });
    await noteDoc.save();

    const noticeDoc = new Notice({
      noticeId: `notice_test_${timestamp}`,
      title: "Test Sync Notice",
      targetDivision: testDivName
    });
    await noticeDoc.save();

    const renamedDivName = `Div Renamed${timestamp % 1000}`;
    const renameRes = await request("POST", "/api/academic/divisions/cascade", {
      action: "rename",
      courseYear: "1st Year",
      oldDivision: testDivName,
      newDivision: renamedDivName
    }, adminToken);

    assert(renameRes.status === 200, `Admin successfully triggered rename to '${renamedDivName}'`);

    // Verify all 8 systems in MongoDB
    const storeAfterRename = await AcademicStore.findOne({ storeKey: "default_academic_store" });
    assert(storeAfterRename.divisions["1st Year"].includes(renamedDivName) && !storeAfterRename.divisions["1st Year"].includes(testDivName),
      `1. AcademicStore.divisions updated: '${testDivName}' -> '${renamedDivName}'`);

    const studentAfterRename = await User.findOne({ username: studentUsername });
    assert(studentAfterRename && studentAfterRename.division === renamedDivName,
      `2. Enrolled Student division automatically cascaded: '${studentAfterRename?.division}'`);

    const facultyAfterRename = await User.findOne({ username: facultyUsername });
    const facSubDiv = facultyAfterRename?.subjectDivisions instanceof Map
      ? facultyAfterRename.subjectDivisions.get("cprog")
      : facultyAfterRename?.subjectDivisions?.cprog;
    assert(facultyAfterRename && facultyAfterRename.division === renamedDivName && facSubDiv === renamedDivName,
      `3. Faculty division & subjectDivisions automatically cascaded: '${facultyAfterRename?.division}' / '${facSubDiv}'`);

    const ttAfterRename = await Timetable.findOne({ semester: "1st Semester", division: renamedDivName });
    assert(ttAfterRename !== null, `4. Timetable document division automatically cascaded: '${ttAfterRename?.division}'`);

    const attAfterRename = await Attendance.findOne({ attendanceId: `att_test_${timestamp}` });
    assert(attAfterRename && attAfterRename.division === renamedDivName, `5. Daily Attendance division automatically cascaded: '${attAfterRename?.division}'`);

    const asgnAfterRename = await Assignment.findOne({ assignmentId: `asgn_test_${timestamp}` });
    assert(asgnAfterRename && asgnAfterRename.targetDivision === renamedDivName, `6. Assignment targetDivision automatically cascaded: '${asgnAfterRename?.targetDivision}'`);

    const noteAfterRename = await Note.findOne({ noteId: `note_test_${timestamp}` });
    assert(noteAfterRename && noteAfterRename.division === renamedDivName, `7. Study Note division automatically cascaded: '${noteAfterRename?.division}'`);

    const noticeAfterRename = await Notice.findOne({ noticeId: `notice_test_${timestamp}` });
    assert(noticeAfterRename && noticeAfterRename.targetDivision === renamedDivName, `8. Notice targetDivision automatically cascaded: '${noticeAfterRename?.targetDivision}'`);

    // -------------------------------------------------------------
    // SECTION 4: DELETE DIVISION & Fallback Reassignment
    // -------------------------------------------------------------
    console.log("\n--- SECTION 4: DELETE DIVISION & Fallback Reassignment ---");
    const deleteRes = await request("POST", "/api/academic/divisions/cascade", {
      action: "delete",
      courseYear: "1st Year",
      oldDivision: renamedDivName,
      fallbackDivision: "Div A"
    }, adminToken);

    assert(deleteRes.status === 200, `Admin successfully triggered delete of '${renamedDivName}' with fallback 'Div A'`);

    const storeAfterDel = await AcademicStore.findOne({ storeKey: "default_academic_store" });
    assert(!storeAfterDel.divisions["1st Year"].includes(renamedDivName),
      `1. AcademicStore.divisions removed '${renamedDivName}' cleanly`);

    const studentAfterDel = await User.findOne({ username: studentUsername });
    assert(studentAfterDel && studentAfterDel.division === "Div A",
      `2. Enrolled Student automatically reassigned to fallback 'Div A' (was '${renamedDivName}')`);

    const facultyAfterDel = await User.findOne({ username: facultyUsername });
    const facSubDivDel = facultyAfterDel?.subjectDivisions instanceof Map
      ? facultyAfterDel.subjectDivisions.get("cprog")
      : facultyAfterDel?.subjectDivisions?.cprog;
    assert(facultyAfterDel && facultyAfterDel.division === "Div A" && facSubDivDel === "Div A",
      `3. Faculty division & subjectDivisions reassigned to fallback 'Div A'`);

    const attAfterDel = await Attendance.findOne({ attendanceId: `att_test_${timestamp}` });
    assert(attAfterDel && attAfterDel.division === "Div A", `4. Daily Attendance reassigned to fallback 'Div A'`);

    const asgnAfterDel = await Assignment.findOne({ assignmentId: `asgn_test_${timestamp}` });
    assert(asgnAfterDel && asgnAfterDel.targetDivision === "All Divisions", `5. Assignment targetDivision reassigned to 'All Divisions'`);

    const noteAfterDel = await Note.findOne({ noteId: `note_test_${timestamp}` });
    assert(noteAfterDel && noteAfterDel.division === "All Divisions", `6. Study Note division reassigned to 'All Divisions'`);

    const noticeAfterDel = await Notice.findOne({ noticeId: `notice_test_${timestamp}` });
    assert(noticeAfterDel && noticeAfterDel.targetDivision === "all", `7. Notice targetDivision reassigned to 'all'`);

    // Clean up test documents
    console.log("\n--- SECTION 5: Cleanup Test Artifacts ---");
    await User.deleteMany({ username: { $in: [studentUsername, facultyUsername, adminUsername] } });
    await Timetable.deleteMany({ semester: "1st Semester", division: { $in: [testDivName, renamedDivName] } });
    await Attendance.deleteMany({ attendanceId: `att_test_${timestamp}` });
    await Assignment.deleteMany({ assignmentId: `asgn_test_${timestamp}` });
    await Note.deleteMany({ noteId: `note_test_${timestamp}` });
    await Notice.deleteMany({ noticeId: `notice_test_${timestamp}` });
    console.log("✓ Cleaned up all temporary test accounts and documents.");

  } finally {
    if (serverInstance && typeof serverInstance.close === "function") {
      serverInstance.close();
    }
    await mongoose.disconnect();
  }

  console.log("\n==================================================================");
  console.log(`FINAL RESULT: ${passedCount} PASSED, ${failedCount} FAILED.`);
  console.log("==================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

run().catch(err => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
