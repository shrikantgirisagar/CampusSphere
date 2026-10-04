// scripts/test-file-sync.js
// Automated Verification Suite for Total MongoDB Persistence & Code File Synchronization
// Verifies that whenever Admin, Faculty, or Students change, add, or delete details:
// 1. All details are totally saved in MongoDB database collections.
// 2. All details are automatically synchronized to code data files (data/*.json).

require("dotenv").config();
const dns = require("dns");
try { dns.setDefaultResultOrder("ipv4first"); } catch (_) {}
const http = require("http");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const crypto = require("crypto");

const TEST_PORT = 3101;
const BASE_URL = `http://localhost:${TEST_PORT}`;

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "database.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ACADEMIC_FILE = path.join(DATA_DIR, "academic.json");
const DIVISIONS_FILE = path.join(DATA_DIR, "divisions.json");
const TIMETABLES_FILE = path.join(DATA_DIR, "timetables.json");

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

async function request(method, reqPath, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, BASE_URL);
    const headers = {};
    if (body !== null && typeof body === "object") {
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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForFile(predicate, maxWaitMs = 6000, intervalMs = 60) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      if (predicate()) return true;
    } catch (_) {}
    await delay(intervalMs);
  }
  return false;
}

async function run() {
  console.log("==================================================================");
  console.log("CAMPUSSPHERE MONGODB & CODE FILE SYNCHRONIZATION VERIFICATION");
  console.log("==================================================================\n");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("FATAL: MONGODB_URI is not set in environment or .env");
    process.exit(1);
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (mongoose.connection.readyState === 1) break;
      if (mongoose.connection.readyState === 2) {
        await new Promise(resolve => mongoose.connection.once("open", resolve));
        break;
      }
      await mongoose.connect(mongoUri, {
        dbName: "CampusSphere",
        serverSelectionTimeoutMS: 20000,
        connectTimeoutMS: 20000
      });
      break;
    } catch (err) {
      if (attempt === 3) throw err;
      console.warn(`[WARN] MongoDB connect retry ${attempt}/3:`, err.message);
      await delay(2000);
    }
  }
  console.log("✓ Connected to MongoDB");

  const User = require("../models/User");
  const AcademicStore = require("../models/AcademicStore");
  const Assignment = require("../models/Assignment");

  // Spin up test server instance
  process.env.PORT = String(TEST_PORT);
  process.env.NODE_ENV = "test";
  serverInstance = require("../server.js");
  await delay(2000);
  console.log(`✓ Test server running at ${BASE_URL}\n`);

  const timestamp = Date.now();
  const adminUsername = `admin_sync_${timestamp}`;
  const facultyUsername = `fac_sync_${timestamp}`;
  const studentUsername = `stud_sync_${timestamp}`;
  const testPassword = "syncPassword123";

  // Pre-seed an admin and a faculty to login
  const { promisify } = require("util");
  const scryptAsync = promisify(crypto.scrypt);
  const salt = crypto.randomBytes(16);
  const derived = await scryptAsync(testPassword, salt, 64, { N: 16384, r: 8, p: 1 });
  const hashedPwd = `scrypt$16384$8$1$${salt.toString("base64url")}$${Buffer.from(derived).toString("base64url")}`;

  await User.create([
    {
      id: `id-${adminUsername}`,
      role: "admin",
      username: adminUsername,
      name: "Sync Test Admin",
      email: `${adminUsername}@test.edu`,
      passwordHash: hashedPwd
    },
    {
      id: `id-${facultyUsername}`,
      role: "faculty",
      username: facultyUsername,
      name: "Sync Test Faculty",
      email: `${facultyUsername}@test.edu`,
      passwordHash: hashedPwd,
      subject: "cprog",
      subjects: ["cprog"],
      division: "Both Divisions"
    }
  ]);

  try {
    // -------------------------------------------------------------
    // SECTION 1: Initial Sync Verification on Server Boot
    // -------------------------------------------------------------
    console.log("--- SECTION 1: Initial Sync Verification on Server Boot ---");
    const fileSyncService = require("../services/fileSyncService");
    await fileSyncService.syncFromMongoToFiles();
    assert(fs.existsSync(DB_FILE), "data/database.json exists on disk");
    assert(fs.existsSync(USERS_FILE), "data/users.json exists on disk");
    assert(fs.existsSync(ACADEMIC_FILE), "data/academic.json exists on disk");
    assert(fs.existsSync(DIVISIONS_FILE), "data/divisions.json exists on disk");
    assert(fs.existsSync(TIMETABLES_FILE), "data/timetables.json exists on disk");

    const rawUsersJson = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    assert(Array.isArray(rawUsersJson) && rawUsersJson.some(u => u.username === adminUsername),
      "data/users.json contains pre-seeded admin user");

    // Authenticate Admin & Faculty
    const adminLogin = await request("POST", "/api/auth/login", { role: "admin", username: adminUsername, password: testPassword });
    const adminToken = adminLogin.body?.token;
    assert(adminToken, "Admin authenticated successfully");

    const facultyLogin = await request("POST", "/api/auth/login", { role: "faculty", username: facultyUsername, password: testPassword });
    const facultyToken = facultyLogin.body?.token;
    assert(facultyToken, "Faculty authenticated successfully");

    // -------------------------------------------------------------
    // SECTION 2: Admin Adds Student -> Saved in MongoDB + Synced to Files
    // -------------------------------------------------------------
    console.log("\n--- SECTION 2: Admin Adds Student (MongoDB + File Sync) ---");
    const addStudentRes = await request("POST", "/api/users", {
      name: "Original Student Name",
      username: studentUsername,
      email: `${studentUsername}@student.edu`,
      password: testPassword,
      role: "student",
      courseYear: "1st Year",
      semester: "1st Semester",
      division: "Div A",
      languageChoice: "Kannada",
      mathChoice: "Mathematics"
    }, adminToken);

    assert(addStudentRes.status === 201, `Admin created student '${studentUsername}' (HTTP 201)`);

    // Verify totally saved in MongoDB
    const studentInMongo = await User.findOne({ username: studentUsername });
    assert(studentInMongo !== null && studentInMongo.name === "Original Student Name",
      "Student successfully saved to MongoDB User collection");

    // Wait for file sync
    const syncedAddUsers = await waitForFile(() => {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      return users.some(u => u.username === studentUsername && u.name === "Original Student Name");
    });
    assert(syncedAddUsers, "data/users.json automatically synchronized with newly added student");

    const syncedAddDb = await waitForFile(() => {
      const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      return (db.users || []).some(u => u.username === studentUsername);
    });
    assert(syncedAddDb, "data/database.json automatically synchronized with newly added student");

    // Authenticate the new Student
    const studentLogin = await request("POST", "/api/auth/login", { role: "student", username: studentUsername, password: testPassword });
    const studentToken = studentLogin.body?.token;
    assert(studentToken, "Student authenticated successfully");

    // -------------------------------------------------------------
    // SECTION 3: Student Modifies Profile -> Saved in MongoDB + Synced to Files
    // -------------------------------------------------------------
    console.log("\n--- SECTION 3: Student Modifies Profile (MongoDB + File Sync) ---");
    const updatedStudentName = "Updated Student Name by Self";
    const editProfileRes = await request("PUT", `/api/users/student/${studentUsername}`, {
      name: updatedStudentName,
      languageChoice: "Hindi",
      mathChoice: "Statistics"
    }, studentToken);

    assert(editProfileRes.status === 200, `Student updated their own profile (HTTP 200)`);

    // Verify totally saved in MongoDB
    const studentAfterEdit = await User.findOne({ username: studentUsername });
    assert(studentAfterEdit && studentAfterEdit.name === updatedStudentName && studentAfterEdit.languageChoice === "Hindi",
      "Updated student details totally saved in MongoDB");

    const syncedEditUsers = await waitForFile(() => {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      return users.some(u => u.username === studentUsername && u.name === updatedStudentName && u.languageChoice === "Hindi");
    });
    assert(syncedEditUsers, "data/users.json automatically synchronized with student profile changes");

    // -------------------------------------------------------------
    // SECTION 4: Faculty Enters Marks & Attendance -> Saved in MongoDB + Synced to Files
    // -------------------------------------------------------------
    console.log("\n--- SECTION 4: Faculty Modifies Academic Records (MongoDB + File Sync) ---");
    const testAssignTitle = `DSA Lab Assignment ${timestamp % 1000}`;
    const academicSyncRes = await request("POST", "/api/academic/sync", {
      data: {
        students: {
          [studentUsername]: {
            marks: {
              cprog: { internal1: 19, internal2: 18, final: 65, total: 84, grade: "A+" }
            },
            attendance: { cprog: 92 }
          }
        },
        dailyAttendance: [
          {
            id: `att-test-${timestamp}`,
            date: "04-10-2026",
            isoDate: "2026-10-04",
            subject: "cprog",
            division: "Div A",
            semester: "1st Semester",
            courseYear: "1st Year",
            records: { [studentUsername]: "P" }
          }
        ],
        assignments: [
          {
            id: `asgn-test-${timestamp}`,
            title: testAssignTitle,
            student: studentUsername,
            subject: "cprog",
            due: "2026-10-20",
            status: "Pending"
          }
        ]
      }
    }, facultyToken);

    assert(academicSyncRes.status === 200, "Faculty saved academic data via /api/academic/sync");

    // Verify totally saved in MongoDB
    const storeInMongo = await AcademicStore.findOne({ storeKey: "default_academic_store" });
    const studentMarksInMongo = storeInMongo?.students?.[studentUsername]?.marks?.cprog;
    assert(studentMarksInMongo && studentMarksInMongo.internal1 === 19,
      "Student marks totally saved in MongoDB AcademicStore");

    const syncedMarksFile = await waitForFile(() => {
      const academic = JSON.parse(fs.readFileSync(ACADEMIC_FILE, "utf8"));
      return academic?.students?.[studentUsername]?.marks?.cprog?.internal1 === 19;
    });
    assert(syncedMarksFile, "data/academic.json automatically synchronized with student marks");

    const syncedDbAcademic = await waitForFile(() => {
      const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      return db?.academic?.students?.[studentUsername]?.marks?.cprog?.internal1 === 19;
    });
    assert(syncedDbAcademic, "data/database.json automatically synchronized with academic changes");

    // -------------------------------------------------------------
    // SECTION 5: Student Updates Assignment Status -> Saved in MongoDB + Synced to Files
    // -------------------------------------------------------------
    console.log("\n--- SECTION 5: Student Updates Assignment Status (MongoDB + File Sync) ---");
    const statusRes = await request("POST", "/api/academic/assignment-status", {
      studentUsername: studentUsername,
      title: testAssignTitle,
      subject: "cprog",
      status: "Submitted"
    }, studentToken);

    assert(statusRes.status === 200, "Student updated assignment status to 'Submitted' (HTTP 200)");

    // Verify totally saved in MongoDB
    const storeAfterStatus = await AcademicStore.findOne({ storeKey: "default_academic_store" });
    const targetAssign = (storeAfterStatus?.assignments || []).find(a =>
      a && a.student && a.student.toLowerCase() === studentUsername.toLowerCase() && a.title === testAssignTitle
    );
    assert(targetAssign && targetAssign.status === "Submitted",
      "Assignment status 'Submitted' totally saved in MongoDB AcademicStore");

    const assignDocInMongo = await Assignment.findOne({
      student: new RegExp(`^${studentUsername}$`, "i"),
      title: new RegExp(`^${testAssignTitle}$`, "i")
    });
    assert(assignDocInMongo && assignDocInMongo.status === "Submitted",
      "Assignment status totally saved in MongoDB Assignment collection");

    const syncedAssignFile = await waitForFile(() => {
      const academic = JSON.parse(fs.readFileSync(ACADEMIC_FILE, "utf8"));
      const assign = (academic?.assignments || []).find(a =>
        a && a.student && a.student.toLowerCase() === studentUsername.toLowerCase() && a.title === testAssignTitle
      );
      return assign && assign.status === "Submitted";
    });
    assert(syncedAssignFile, "data/academic.json automatically synchronized with student assignment status");

    // -------------------------------------------------------------
    // SECTION 6: Admin Modifies & Deletes Division -> Saved in MongoDB + Synced to Files
    // -------------------------------------------------------------
    console.log("\n--- SECTION 6: Admin Modifies & Deletes Division (MongoDB + File Sync) ---");
    const testDivName = `Div SyncTest${timestamp % 1000}`;
    const addDivRes = await request("POST", "/api/academic/divisions/cascade", {
      action: "add",
      courseYear: "1st Year",
      newDivision: testDivName
    }, adminToken);
    assert(addDivRes.status === 200, `Admin added '${testDivName}'`);

    const syncedDivAdd = await waitForFile(() => {
      const divs = JSON.parse(fs.readFileSync(DIVISIONS_FILE, "utf8"));
      return divs?.["1st Year"]?.includes(testDivName);
    });
    assert(syncedDivAdd, "data/divisions.json automatically synchronized with newly added division");

    const delDivRes = await request("POST", "/api/academic/divisions/cascade", {
      action: "delete",
      courseYear: "1st Year",
      oldDivision: testDivName,
      fallbackDivision: "Div A"
    }, adminToken);
    assert(delDivRes.status === 200, `Admin deleted '${testDivName}'`);

    const syncedDivDel = await waitForFile(() => {
      const divs = JSON.parse(fs.readFileSync(DIVISIONS_FILE, "utf8"));
      return !divs?.["1st Year"]?.includes(testDivName);
    });
    assert(syncedDivDel, "data/divisions.json automatically synchronized after division deletion");

    // -------------------------------------------------------------
    // SECTION 7: Admin Deletes User -> Deleted in MongoDB + Synced to Files
    // -------------------------------------------------------------
    console.log("\n--- SECTION 7: Admin Deletes Student User (MongoDB + File Sync) ---");
    const delUserRes = await request("DELETE", `/api/users/student/${studentUsername}`, null, adminToken);
    assert(delUserRes.status === 200, `Admin deleted student '${studentUsername}' (HTTP 200)`);

    const studentCheckMongo = await User.findOne({ username: studentUsername });
    assert(studentCheckMongo === null, "Student record permanently deleted from MongoDB");

    const syncedUserDel = await waitForFile(() => {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
      return !users.some(u => u.username === studentUsername);
    });
    assert(syncedUserDel, "data/users.json automatically synchronized after student deletion");

    // -------------------------------------------------------------
    // SECTION 8: Cleanup Test Artifacts
    // -------------------------------------------------------------
    console.log("\n--- SECTION 8: Cleanup Test Artifacts ---");
    await User.deleteMany({ username: { $in: [adminUsername, facultyUsername, studentUsername] } });
    await Assignment.deleteMany({ student: studentUsername });
    console.log("✓ Test accounts cleaned up cleanly.");

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
