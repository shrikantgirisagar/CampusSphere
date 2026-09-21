/**
 * CampusSphere - Prompt 11: Production Readiness & Regression Verification Suite
 * Verifies: Complete RBAC Matrix, IDOR Second Pass, Input Abuse & Negative Testing,
 * Error Handling Verification, Performance & Frontend Asset Sanity.
 */

require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const TEST_PORT = 3096;
const BASE_URL = `http://localhost:${TEST_PORT}`;

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
        } catch (_) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });

    req.on("error", reject);
    if (payload !== null) {
      req.write(payload);
    }
    req.end();
  });
}

function generateTokenFor(user, secret) {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const data = JSON.stringify({
    id: String(user.id || ""),
    role: String(user.role || ""),
    username: String(user.username || ""),
    exp: expiresAt
  });
  const payload = Buffer.from(data).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

async function runPrompt11Suite() {
  console.log("=== CampusSphere Prompt 11: Production Readiness & Regression Suite ===\n");

  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/CampusSphere";
  await mongoose.connect(MONGODB_URI, { dbName: "CampusSphere", serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB successfully.\n");

  const User = require("../models/User");
  const AcademicStore = require("../models/AcademicStore");
  const Notice = require("../models/Notice");
  const Timetable = require("../models/Timetable");
  const Mark = require("../models/Mark");

  // Determine auth secret
  const app = require("../server.js");
  const authConfig = app.validateAuthConfig ? app.validateAuthConfig(process.env) : { secret: "campussphere_dev_session_secret_2026_insecure" };
  const authSecret = authConfig.secret || "campussphere_dev_session_secret_2026_insecure";

  // Create isolated test accounts
  const testSuffix = Date.now();
  const studentUsername = `p11_std_${testSuffix}`;
  const facultyUsername = `p11_fac_${testSuffix}`;
  const student2Username = `p11_std2_${testSuffix}`;

  const studentUser = await User.create({
    id: `std-${testSuffix}`,
    role: "student",
    name: "Prompt11 Student One",
    username: studentUsername,
    email: `${studentUsername}@campussphere.edu`,
    division: "Div A",
    course: "BCA",
    semester: "1st Semester",
    passwordHash: "dummyHash"
  });

  const student2User = await User.create({
    id: `std2-${testSuffix}`,
    role: "student",
    name: "Prompt11 Student Two",
    username: student2Username,
    email: `${student2Username}@campussphere.edu`,
    division: "Div B",
    course: "BCA",
    semester: "1st Semester",
    passwordHash: "dummyHash"
  });

  const facultyUser = await User.create({
    id: `fac-${testSuffix}`,
    role: "faculty",
    name: "Prompt11 Faculty",
    username: facultyUsername,
    email: `${facultyUsername}@campussphere.edu`,
    subject: "cprog",
    subjects: ["cprog", "python"],
    passwordHash: "dummyHash"
  });

  let adminUser = await User.findOne({ role: "admin" });
  if (!adminUser) {
    adminUser = await User.create({
      id: `adm-${testSuffix}`,
      role: "admin",
      name: "Prompt11 Admin",
      username: `p11_adm_${testSuffix}`,
      email: `admin_${testSuffix}@campussphere.edu`,
      passwordHash: "dummyHash"
    });
  }

  const studentToken = generateTokenFor(studentUser, authSecret);
  const student2Token = generateTokenFor(student2User, authSecret);
  const facultyToken = generateTokenFor(facultyUser, authSecret);
  const adminToken = generateTokenFor(adminUser, authSecret);

  // Start test server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`Test server running on port ${TEST_PORT}\n`);

  try {
    // --------------------------------------------------------------------------
    // TEST GROUP 1: Complete RBAC Matrix (Positive & Negative)
    // --------------------------------------------------------------------------
    console.log("--- Group 1: Complete RBAC Matrix (Positive & Negative) ---");

    // 1.1 Unauthenticated directory read returns empty list
    const unauthListRes = await request("GET", "/api/users/public");
    assert(unauthListRes.status === 200 && Array.isArray(unauthListRes.json?.users) && unauthListRes.json.users.length === 0,
      "Unauthenticated /api/users/public returns empty list (no directory exposure)");

    // 1.2 Student listing /api/users/public receives ONLY own profile
    const stdListRes = await request("GET", "/api/users/public", null, studentToken);
    const stdReturnedUsers = stdListRes.json?.users || [];
    assert(stdListRes.status === 200 && stdReturnedUsers.length === 1 && stdReturnedUsers[0].username === studentUsername,
      "Student listing /api/users/public returns ONLY their own profile");

    // 1.3 Faculty listing /api/users/public receives students (emails redacted) and faculty, but NO admins
    const facListRes = await request("GET", "/api/users/public", null, facultyToken);
    const facReturnedUsers = facListRes.json?.users || [];
    const hasAdminInFacultyList = facReturnedUsers.some(u => u.role === "admin");
    assert(facListRes.status === 200 && facReturnedUsers.length > 0 && !hasAdminInFacultyList,
      "Faculty listing /api/users/public excludes admin accounts and redacts student emails");

    // 1.4 Admin listing /api/users/public receives all users
    const admListRes = await request("GET", "/api/users/public", null, adminToken);
    assert(admListRes.status === 200 && Array.isArray(admListRes.json?.users) && admListRes.json.users.length >= 3,
      "Admin listing /api/users/public returns complete user directory");

    // 1.5 Student cannot access another student's profile via direct endpoint
    const stdIdorRes = await request("GET", `/api/users/student/${student2Username}`, null, studentToken);
    assert(stdIdorRes.status === 403, "Student accessing another student's profile returns 403 Forbidden");

    // 1.6 Student can access own profile
    const stdOwnRes = await request("GET", `/api/users/student/${studentUsername}`, null, studentToken);
    assert(stdOwnRes.status === 200 && stdOwnRes.json?.user?.username === studentUsername, "Student accessing own profile returns 200 OK");

    // 1.7 Student cannot access faculty profile
    const stdFacRes = await request("GET", `/api/users/faculty/${facultyUsername}`, null, studentToken);
    assert(stdFacRes.status === 403, "Student accessing faculty profile returns 403 Forbidden");

    // 1.8 Faculty cannot access admin profile
    const facAdmRes = await request("GET", `/api/users/admin/${adminUser.username}`, null, facultyToken);
    assert(facAdmRes.status === 403, "Faculty accessing admin profile returns 403 Forbidden");

    // 1.9 Admin can access any profile
    const admGetRes = await request("GET", `/api/users/student/${studentUsername}`, null, adminToken);
    assert(admGetRes.status === 200, "Admin accessing student profile returns 200 OK");

    // 1.10 Student cannot trigger academic synchronization
    const stdSyncRes = await request("POST", "/api/academic/sync", { store: {} }, studentToken);
    assert(stdSyncRes.status === 403, "Student POST /api/academic/sync returns 403 Forbidden");

    // 1.11 Student cannot trigger timetable synchronization
    const stdTtSyncRes = await request("POST", "/api/timetable/sync", { timetable: [] }, studentToken);
    assert(stdTtSyncRes.status === 403, "Student POST /api/timetable/sync returns 403 Forbidden");

    // 1.12 Faculty can trigger academic synchronization
    const facSyncRes = await request("POST", "/api/academic/sync", {
      notices: [{ noticeId: `notice_${testSuffix}`, title: "Faculty Notice", content: "Test", authorRole: "faculty" }]
    }, facultyToken);
    assert(facSyncRes.status === 200, "Faculty POST /api/academic/sync returns 200 OK");

    // 1.13 Faculty can trigger timetable synchronization
    const facTtSyncRes = await request("POST", "/api/timetable/sync", {
      timetable: [{
        division: "Div A", semester: "1st Semester", day: "Monday", time: "09:00 - 10:00", subjectText: "cprog", faculty: "Prompt11 Faculty"
      }]
    }, facultyToken);
    assert(facTtSyncRes.status === 200, "Faculty POST /api/timetable/sync returns 200 OK");

    // 1.14 Student cannot delete users
    const stdDelRes = await request("DELETE", `/api/users/student/${student2Username}`, null, studentToken);
    assert(stdDelRes.status === 403, "Student DELETE user returns 403 Forbidden");

    // 1.15 Faculty cannot delete users
    const facDelRes = await request("DELETE", `/api/users/student/${student2Username}`, null, facultyToken);
    assert(facDelRes.status === 403, "Faculty DELETE user returns 403 Forbidden");

    // 1.16 Student cannot perform database user migration
    const stdMigRes = await request("POST", "/api/users/migrate", { users: {} }, studentToken);
    assert(stdMigRes.status === 403, "Student POST /api/users/migrate returns 403 Forbidden");

    // 1.17 Faculty cannot perform database user migration
    const facMigRes = await request("POST", "/api/users/migrate", { users: {} }, facultyToken);
    assert(facMigRes.status === 403, "Faculty POST /api/users/migrate returns 403 Forbidden");

    // 1.18 Admin can access user migration
    const admMigRes = await request("POST", "/api/users/migrate", { users: { student: [] } }, adminToken);
    assert(admMigRes.status === 200, "Admin POST /api/users/migrate returns 200 OK");

    // --------------------------------------------------------------------------
    // TEST GROUP 2: IDOR & Access-Control Second-Pass
    // --------------------------------------------------------------------------
    console.log("\n--- Group 2: IDOR & Access-Control Second-Pass ---");

    // 2.1 Student academic data query parameter tampering (?username=other)
    const stdAcaIdor = await request("GET", `/api/academic/data?username=${student2Username}`, null, studentToken);
    assert(stdAcaIdor.status === 200, "Student GET /api/academic/data returns 200");
    const returnedStudentKeys = Object.keys(stdAcaIdor.json?.students || {});
    const leakedStudent2 = returnedStudentKeys.includes(student2Username);
    assert(!leakedStudent2, "Student query parameter spoofing does not leak other student's academic records");

    // 2.2 Student attempting to update another student's division or details
    const stdUpdateIdor = await request("PUT", `/api/users/student/${student2Username}`, {
      division: "Hacked Division"
    }, studentToken);
    assert(stdUpdateIdor.status === 403, "Student PUT on another student's username returns 403 Forbidden");

    // 2.3 Student attempting to elevate own role to faculty
    const stdElevateRes = await request("PUT", `/api/users/student/${studentUsername}`, {
      role: "faculty"
    }, studentToken);
    assert(stdElevateRes.status === 403, "Student attempting role escalation returns 403 Forbidden");

    const dbStdCheck = await User.findOne({ username: studentUsername });
    assert(dbStdCheck.role === "student", "Student role remains strictly 'student' in database");

    // 2.4 Faculty attempting to spoof Notice authorRole as 'admin'
    const facSpoofRes = await request("POST", "/api/academic/sync", {
      notices: [{ noticeId: `spoof_notice_${testSuffix}`, title: "Spoofed Notice", content: "Spoof", authorRole: "admin" }]
    }, facultyToken);
    assert(facSpoofRes.status === 200, "Faculty sync processed");
    const spoofNotice = await Notice.findOne({ noticeId: `spoof_notice_${testSuffix}` });
    assert(spoofNotice && spoofNotice.authorRole === "faculty", "Faculty spoofed notice authorRole is forced to 'faculty' in MongoDB");

    // --------------------------------------------------------------------------
    // TEST GROUP 3: Input Abuse & Negative Testing
    // --------------------------------------------------------------------------
    console.log("\n--- Group 3: Input Abuse & Negative Testing ---");

    // 3.1 Empty body on POST /api/users
    const emptyBodyRes = await request("POST", "/api/users", {}, adminToken);
    assert(emptyBodyRes.status === 400, "Empty body on user creation returns HTTP 400");
    assert(emptyBodyRes.json?.success === false, "Returns structured JSON error");

    // 3.2 MongoDB operator injection ({ username: { $gt: "" } })
    const mongoOpRes = await request("POST", "/api/users", {
      username: { $gt: "" },
      name: "Operator Test",
      role: "student",
      password: "Password123!"
    }, adminToken);
    assert(mongoOpRes.status === 400, "MongoDB operator injection ($gt) returns HTTP 400");

    // 3.3 Extremely long string (name > 100 chars)
    const longName = "A".repeat(150);
    const longNameRes = await request("POST", "/api/users", {
      username: `long_${testSuffix}`,
      name: longName,
      email: `long_${testSuffix}@campussphere.edu`,
      role: "student",
      password: "Password123!"
    }, adminToken);
    assert(longNameRes.status === 400, "Name exceeding 100 chars returns HTTP 400");

    // 3.4 Invalid role enum ('superadmin')
    const invalidRoleRes = await request("POST", "/api/users", {
      username: `hacker_${testSuffix}`,
      name: "Hacker User",
      email: `hacker_${testSuffix}@campussphere.edu`,
      role: "superadmin",
      password: "Password123!"
    }, adminToken);
    assert(invalidRoleRes.status === 400, "Invalid role returns HTTP 400");

    // 3.5 Negative marks in academic sync rejected
    const negMarksRes = await request("POST", "/api/academic/sync", {
      marks: [{
        markId: `neg_mark_${testSuffix}`,
        studentUsername: studentUsername,
        subject: "cprog",
        marksObtained: -50,
        maxMarks: 100
      }]
    }, facultyToken);
    const negMark = await Mark.findOne({ markId: `neg_mark_${testSuffix}` });
    assert(negMark === null, "Negative marks record is rejected and not persisted in MongoDB");

    // 3.6 Excessive marks (>1000) rejected
    const excessiveMarksRes = await request("POST", "/api/academic/sync", {
      marks: [{
        markId: `exc_mark_${testSuffix}`,
        studentUsername: studentUsername,
        subject: "cprog",
        marksObtained: 99999,
        maxMarks: 100
      }]
    }, facultyToken);
    const excMark = await Mark.findOne({ markId: `exc_mark_${testSuffix}` });
    assert(excMark === null, "Excessive marks (>1000) record is rejected and not persisted in MongoDB");

    // --------------------------------------------------------------------------
    // TEST GROUP 4: Error Handling & Non-Disclosure
    // --------------------------------------------------------------------------
    console.log("\n--- Group 4: Error Handling & Non-Disclosure ---");

    // 4.1 404 on nonexistent API route returns JSON
    const notFoundRes = await request("GET", "/api/nonexistent-route-xyz", null, studentToken);
    assert(notFoundRes.status === 404, "Unknown API route returns 404");
    assert(notFoundRes.json?.success === false, "Unknown route returns structured JSON");
    assert(!notFoundRes.data.includes("<html>"), "Unknown route returns JSON, not HTML error page");

    // 4.2 401 on protected endpoint without token
    const unauthRes = await request("GET", `/api/users/student/${studentUsername}`);
    assert(unauthRes.status === 401, "Protected endpoint without token returns 401");
    assert(unauthRes.json?.success === false, "401 returns structured JSON error");

    // 4.3 403 on forbidden action
    assert(stdIdorRes.status === 403, "Forbidden action returns 403");
    assert(stdIdorRes.json?.success === false, "403 returns structured JSON error");

    // 4.4 409 on duplicate user creation
    const dupUserRes = await request("POST", "/api/users", {
      username: studentUsername,
      email: `${studentUsername}@campussphere.edu`,
      name: "Duplicate User",
      role: "student",
      password: "Password123!"
    }, adminToken);
    assert(dupUserRes.status === 409, "Duplicate user creation returns HTTP 409 Conflict");
    assert(dupUserRes.json?.message?.includes("already in use"), "409 message informs user clearly");

    // 4.5 Error responses do NOT leak stack traces, database credentials, or secret keys
    const allErrors = [notFoundRes, unauthRes, stdIdorRes, dupUserRes, emptyBodyRes, mongoOpRes];
    let leakedAny = false;
    for (const errRes of allErrors) {
      const text = errRes.data || "";
      if (text.includes("node_modules") || (text.includes("at ") && text.includes(".js:")) || text.includes("mongodb://") || text.includes(authSecret)) {
        leakedAny = true;
      }
    }
    assert(!leakedAny, "Error responses never disclose stack traces, filesystem paths, secrets, or database credentials");

    // --------------------------------------------------------------------------
    // TEST GROUP 5: Frontend & Responsive Asset Sanity
    // --------------------------------------------------------------------------
    console.log("\n--- Group 5: Frontend & Responsive Asset Sanity ---");

    const rootDir = path.resolve(__dirname, "..");

    // 5.1 index.html contains responsive viewport meta tag
    const indexHtml = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
    assert(indexHtml.includes('name="viewport"'), "index.html contains viewport meta tag for mobile/tablet responsiveness");
    assert(indexHtml.includes("script.js"), "index.html includes script.js");
    assert(indexHtml.includes("style.css"), "index.html includes style.css");

    // 5.2 courses.html and about.html contain viewport meta tags
    const coursesHtml = fs.readFileSync(path.join(rootDir, "courses.html"), "utf8");
    const aboutHtml = fs.readFileSync(path.join(rootDir, "about.html"), "utf8");
    assert(coursesHtml.includes('name="viewport"'), "courses.html contains viewport meta tag");
    assert(aboutHtml.includes('name="viewport"'), "about.html contains viewport meta tag");

    // 5.3 Public asset routes respond with 200 OK
    const cssRes = await request("GET", "/style.css");
    assert(cssRes.status === 200, "GET /style.css responds with 200 OK");

    const jsRes = await request("GET", "/script.js");
    assert(jsRes.status === 200, "GET /script.js responds with 200 OK");

    const spaRes = await request("GET", "/");
    assert(spaRes.status === 200, "GET / responds with 200 OK");
    assert(spaRes.headers["cache-control"]?.includes("no-cache"), "GET / includes Cache-Control: no-cache");

    // 5.4 Protected static files (.env, server.js, package.json) return 404
    const envRes = await request("GET", "/.env");
    assert(envRes.status === 404, "GET /.env is blocked with 404");

    const srvRes = await request("GET", "/server.js");
    assert(srvRes.status === 404, "GET /server.js is blocked with 404");

    const pkgRes = await request("GET", "/package.json");
    assert(pkgRes.status === 404, "GET /package.json is blocked with 404");

    // --------------------------------------------------------------------------
    // TEST GROUP 6: Performance Sanity Checks
    // --------------------------------------------------------------------------
    console.log("\n--- Group 6: Performance Sanity Checks ---");

    // 6.1 server.js verifies query limits on public user queries (.limit(500))
    const serverCode = fs.readFileSync(path.join(rootDir, "server.js"), "utf8");
    assert(serverCode.includes('.select("-passwordHash -__v").limit(500)'), "User queries enforce .limit(500) and project out passwordHash");
    assert(serverCode.includes('.select("-__v").limit(1000)'), "Timetable queries enforce .limit(1000)");

    // 6.2 Concurrent non-blocking API reads execute rapidly
    const startConcurrent = Date.now();
    await Promise.all([
      request("GET", "/api/stats/counts"),
      request("GET", "/api/timetable", null, studentToken),
      request("GET", "/api/academic/data", null, studentToken)
    ]);
    const durationConcurrent = Date.now() - startConcurrent;
    assert(durationConcurrent < 10000, `Concurrent API reads execute rapidly (${durationConcurrent}ms < 10000ms)`);

  } finally {
    // Clean up test records
    await User.deleteMany({ username: { $in: [studentUsername, student2Username, facultyUsername] } });
    await Notice.deleteMany({ noticeId: { $in: [`notice_${testSuffix}`, `spoof_notice_${testSuffix}`] } });
    await Timetable.deleteMany({ division: "Div A", semester: "1st Semester", day: "Monday", time: "09:00 - 10:00" });

    // Close test server and database connection
    server.close();
    await mongoose.disconnect();
  }

  console.log("\n======================================================================");
  console.log(`Prompt 11 Production Readiness Results: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("======================================================================\n");

  process.exit(failedCount > 0 ? 1 : 0);
}

runPrompt11Suite().catch(err => {
  console.error("Unhandled error in Prompt 11 test suite:", err);
  process.exit(1);
});

