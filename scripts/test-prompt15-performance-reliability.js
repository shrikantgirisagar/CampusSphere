/**
 * Prompt 15 — Complete Performance, Reliability, Concurrency, Persistence & Recovery Audit Suite
 * 
 * Verifies:
 * 1. API Response Performance & Benchmarking (latency & payload size across all key endpoints)
 * 2. Concurrent Request Race-Condition Safety (enqueueAcademicSync & atomic bulkWrite upserts)
 * 3. Repeated Request Idempotency & Record Count Stability (multi-round identical syncs)
 * 4. Omitted Record Preservation Across Divisions (Division A vs Division B non-destructive sync)
 * 5. Bounded Payload & Memory Exhaustion Protection (bounds validation & 413 handling)
 * 6. Cache Correctness, TTL & Invalidation (/api/stats/counts in-memory caching & refresh)
 * 7. Error Handling, Input Sanitization & Recovery (safe HTTP responses without crash/leak)
 * 8. Database Persistence & Referential Verification (authoritative MongoDB persistence)
 */

require("dotenv").config();
const http = require("http");
const crypto = require("crypto");
const mongoose = require("mongoose");
const app = require("../server");

const TEST_PORT = 3197;
let server;
let baseUrl;

let passed = 0;
let failed = 0;
const failures = [];
const benchmarkResults = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.error(`  [FAIL] ${message}`);
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

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const start = process.hrtime.bigint();
    const url = new URL(path, baseUrl);
    const reqHeaders = { ...headers };
    let reqBody = null;

    if (body !== null && typeof body === "object") {
      reqBody = JSON.stringify(body);
      if (!reqHeaders["Content-Type"]) {
        reqHeaders["Content-Type"] = "application/json";
      }
      reqHeaders["Content-Length"] = Buffer.byteLength(reqBody);
    } else if (typeof body === "string") {
      reqBody = body;
      reqHeaders["Content-Length"] = Buffer.byteLength(reqBody);
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: reqHeaders
    };

    const req = http.request(options, res => {
      let data = "";
      res.on("data", chunk => {
        data += chunk;
      });
      res.on("end", () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1e6;
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          sizeBytes: Buffer.byteLength(data),
          durationMs: Math.round(durationMs * 100) / 100,
          json
        });
      });
    });

    req.on("error", reject);
    if (reqBody) {
      req.write(reqBody);
    }
    req.end();
  });
}

async function runPerformanceAndReliabilityAudit() {
  console.log("==================================================");
  console.log("PROMPT 15: PERFORMANCE, RELIABILITY & CONCURRENCY AUDIT");
  console.log("==================================================");

  // 1. Initialize local test server
  await new Promise(resolve => {
    server = app.listen(TEST_PORT, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${TEST_PORT}`;
      resolve();
    });
  });

  // 2. Ensure MongoDB connected
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "CampusSphere",
      serverSelectionTimeoutMS: 15000
    });
  }

  const User = require("../models/User");
  const AcademicStore = require("../models/AcademicStore");
  const Attendance = require("../models/Attendance");
  const Mark = require("../models/Mark");
  const Assignment = require("../models/Assignment");
  const Note = require("../models/Note");
  const Notice = require("../models/Notice");
  const Timetable = require("../models/Timetable");

  const runTag = Date.now().toString().slice(-6);
  const studentUser = `perf_stu_${runTag}`;
  const studentEmail = `perf_stu_${runTag}@example.edu`;
  const facultyUser = `perf_fac_${runTag}`;
  const facultyEmail = `perf_fac_${runTag}@campussphere.edu`;
  const adminUser = `perf_adm_${runTag}`;
  const adminEmail = `perf_adm_${runTag}@campussphere.edu`;
  const defaultPassword = "Password@123!";

  let studentToken = "";
  let facultyToken = "";
  let adminToken = "";

  const createdUsernames = [studentUser, facultyUser, adminUser];

  try {
    // Bootstrap Admin for authenticated testing
    const hashedAdminPwd = await hashPassword(defaultPassword);
    await User.create({
      id: `admin-${runTag}`,
      role: "admin",
      name: "Performance Administrator",
      username: adminUser,
      email: adminEmail,
      passwordHash: hashedAdminPwd
    });

    const adminLoginRes = await request("POST", "/api/auth/login", {
      role: "admin",
      username: adminUser,
      password: defaultPassword
    });
    adminToken = adminLoginRes.json?.token;

    // Bootstrap Faculty
    const createFacRes = await request("POST", "/api/users", {
      name: "Prof. Performance Faculty",
      username: facultyUser,
      email: facultyEmail,
      password: defaultPassword,
      role: "faculty",
      subject: "c_programming",
      subjects: ["c_programming"],
      subjectDivisions: { "c_programming": "Division A" },
      department: "Computer Applications"
    }, { Authorization: `Bearer ${adminToken}` });
    assert(createFacRes.status === 201, "Admin provisions Faculty successfully");

    const facLoginRes = await request("POST", "/api/auth/login", {
      role: "faculty",
      username: facultyUser,
      password: defaultPassword
    });
    facultyToken = facLoginRes.json?.token;

    // Bootstrap Student
    const createStuRes = await request("POST", "/api/users", {
      name: "Performance Student",
      username: studentUser,
      email: studentEmail,
      password: defaultPassword,
      role: "student",
      course: "Bachelor of Computer Applications (BCA)",
      courseYear: "1st Year",
      semester: "1st Semester",
      division: "Division A",
      languageChoice: "Kannada",
      mathChoice: "Mathematics"
    });
    assert(createStuRes.status === 201, "Student registers successfully");

    const stuLoginRes = await request("POST", "/api/auth/login", {
      role: "student",
      username: studentUser,
      password: defaultPassword
    });
    studentToken = stuLoginRes.json?.token;

    // =========================================================================
    // PART 1: API RESPONSE PERFORMANCE & BENCHMARKING
    // =========================================================================
    console.log("\n--- PART 1: API Response Performance & Latency Benchmarks ---");

    // Warm up server and cache
    await request("GET", "/api/stats/counts");

    const endpointsToMeasure = [
      { name: "GET /api/stats/counts (Cached)", method: "GET", path: "/api/stats/counts", token: null, maxMs: 50 },
      { name: "GET /api/stats/counts (Fresh)", method: "GET", path: "/api/stats/counts?fresh=1", token: null, maxMs: 1500 },
      { name: "GET /api/students/count", method: "GET", path: "/api/students/count", token: null, maxMs: 50 },
      { name: "GET /api/users/public (Student Scoped)", method: "GET", path: "/api/users/public", token: studentToken, maxMs: 1500 },
      { name: "GET /api/users/public (Faculty Roster)", method: "GET", path: "/api/users/public", token: facultyToken, maxMs: 2500 },
      { name: "GET /api/users/public (Admin All)", method: "GET", path: "/api/users/public", token: adminToken, maxMs: 2000 },
      { name: "GET /api/academic/data (Student Scoped)", method: "GET", path: "/api/academic/data", token: studentToken, maxMs: 2000 },
      { name: "GET /api/academic/data (Faculty Complete)", method: "GET", path: "/api/academic/data", token: facultyToken, maxMs: 2500 },
      { name: "GET /api/timetable (Authenticated)", method: "GET", path: "/api/timetable", token: studentToken, maxMs: 1500 }
    ];

    for (const ep of endpointsToMeasure) {
      const headers = ep.token ? { Authorization: `Bearer ${ep.token}` } : {};
      const res = await request(ep.method, ep.path, null, headers);
      benchmarkResults.push({
        endpoint: ep.name,
        durationMs: res.durationMs,
        sizeBytes: res.sizeBytes,
        status: res.status
      });
      assert(
        res.status === 200 && res.durationMs <= ep.maxMs,
        `${ep.name}: responded in ${res.durationMs}ms (size: ${res.sizeBytes} B, max threshold: ${ep.maxMs}ms)`
      );
    }

    // =========================================================================
    // PART 2: CONCURRENT REQUEST RACE CONDITION & QUEUE SERIALIZATION AUDIT
    // =========================================================================
    console.log("\n--- PART 2: Concurrent Request Race Condition & Synchronization Audit ---");

    const todayDate = new Date().toISOString().slice(0, 10);

    const concurrentNoticeA = {
      id: `notice_conc_A_${runTag}`,
      title: "Concurrent Notice A",
      content: "Payload A from thread 1",
      date: todayDate,
      author: "Prof. Performance Faculty",
      targetDivision: "Division A",
      authorRole: "faculty"
    };

    const concurrentNoticeB = {
      id: `notice_conc_B_${runTag}`,
      title: "Concurrent Notice B",
      content: "Payload B from thread 2",
      date: todayDate,
      author: "Prof. Performance Faculty",
      targetDivision: "Division A",
      authorRole: "faculty"
    };

    // Fire two simultaneous academic sync operations in parallel
    const [syncResA, syncResB] = await Promise.all([
      request("POST", "/api/academic/sync", {
        data: { notices: [concurrentNoticeA] }
      }, { Authorization: `Bearer ${facultyToken}` }),
      request("POST", "/api/academic/sync", {
        data: { notices: [concurrentNoticeB] }
      }, { Authorization: `Bearer ${facultyToken}` })
    ]);

    assert(syncResA.status === 200 && syncResB.status === 200, "Simultaneous academic sync requests both complete with 200 OK");

    // Verify both notices persisted safely without race condition overwriting
    const dbNoticeA = await Notice.findOne({ noticeId: `notice_conc_A_${runTag}` });
    const dbNoticeB = await Notice.findOne({ noticeId: `notice_conc_B_${runTag}` });
    assert(!!dbNoticeA && !!dbNoticeB, "In-flight concurrency serializer safely persisted both concurrent notices without data loss");

    // Concurrent Timetable Sync
    const ttSlot1 = {
      division: "Division A",
      semester: "1st Semester",
      day: "Monday",
      time: "09:00 AM - 10:00 AM",
      subject: "c_programming",
      subjectText: "C Programming",
      faculty: facultyUser
    };
    const ttSlot2 = {
      division: "Division A",
      semester: "1st Semester",
      day: "Tuesday",
      time: "09:00 AM - 10:00 AM",
      subject: "c_programming",
      subjectText: "C Programming",
      faculty: facultyUser
    };

    const [ttRes1, ttRes2] = await Promise.all([
      request("POST", "/api/timetable/sync", { timetable: [ttSlot1] }, { Authorization: `Bearer ${facultyToken}` }),
      request("POST", "/api/timetable/sync", { timetable: [ttSlot2] }, { Authorization: `Bearer ${facultyToken}` })
    ]);

    assert(ttRes1.status === 200 && ttRes2.status === 200, "Simultaneous timetable sync requests both complete with 200 OK");

    const dbSlot1 = await Timetable.findOne({ division: "Division A", day: "Monday", time: "09:00 AM - 10:00 AM" });
    const dbSlot2 = await Timetable.findOne({ division: "Division A", day: "Tuesday", time: "09:00 AM - 10:00 AM" });
    assert(!!dbSlot1 && !!dbSlot2, "Concurrent timetable upserts preserved both schedule slots safely");

    // =========================================================================
    // PART 3: REPEATED REQUEST IDEMPOTENCY & DOCUMENT COUNT STABILITY
    // =========================================================================
    console.log("\n--- PART 3: Repeated Request Idempotency & Record Count Stability ---");

    const stableMarkPayload = {
      students: {
        [studentUser]: {
          marks: {
            c_programming: {
              internal1: 18,
              internal2: 19,
              assignment: 10,
              total: 47
            }
          }
        }
      },
      notices: [
        {
          id: `notice_idem_${runTag}`,
          title: "Idempotent Notice Test",
          content: "Testing repeated sync operations",
          date: todayDate,
          author: "Prof. Performance Faculty",
          targetDivision: "Division A",
          authorRole: "faculty"
        }
      ],
      assignments: [
        {
          id: `assign_idem_${runTag}`,
          assignmentId: `assign_idem_${runTag}`,
          title: "Idempotent Assignment",
          subject: "c_programming",
          targetDivision: "Division A",
          student: studentUser,
          status: "Pending"
        }
      ]
    };

    // Execute sync Round 1
    const syncRound1 = await request("POST", "/api/academic/sync", { data: stableMarkPayload }, { Authorization: `Bearer ${facultyToken}` });
    assert(syncRound1.status === 200, "Sync Round 1 executes successfully (200 OK)");

    const countNotice1 = await Notice.countDocuments({ noticeId: `notice_idem_${runTag}` });
    const countMark1 = await Mark.countDocuments({ studentUsername: studentUser, subject: "c_programming" });
    const countAssign1 = await Assignment.countDocuments({ assignmentId: `assign_idem_${runTag}` });

    // Execute sync Round 2 with EXACT SAME payload
    const syncRound2 = await request("POST", "/api/academic/sync", { data: stableMarkPayload }, { Authorization: `Bearer ${facultyToken}` });
    assert(syncRound2.status === 200, "Sync Round 2 executes successfully (200 OK)");

    // Execute sync Round 3 with EXACT SAME payload
    const syncRound3 = await request("POST", "/api/academic/sync", { data: stableMarkPayload }, { Authorization: `Bearer ${facultyToken}` });
    assert(syncRound3.status === 200, "Sync Round 3 executes successfully (200 OK)");

    const countNotice3 = await Notice.countDocuments({ noticeId: `notice_idem_${runTag}` });
    const countMark3 = await Mark.countDocuments({ studentUsername: studentUser, subject: "c_programming" });
    const countAssign3 = await Assignment.countDocuments({ assignmentId: `assign_idem_${runTag}` });

    assert(countNotice1 === 1 && countNotice3 === 1, "Repeated notice sync is 100% idempotent: Exactly 1 record in MongoDB (0 duplicates)");
    assert(countMark1 === 1 && countMark3 === 1, "Repeated marks sync is 100% idempotent: Exactly 1 record in MongoDB (0 duplicates)");
    assert(countAssign1 === 1 && countAssign3 === 1, "Repeated assignment sync is 100% idempotent: Exactly 1 record in MongoDB (0 duplicates)");

    // Execute In-Place Update (total changes from 47 to 49)
    const updateMarkPayload = {
      students: {
        [studentUser]: {
          marks: {
            c_programming: {
              internal1: 19,
              internal2: 20,
              assignment: 10,
              total: 49
            }
          }
        }
      }
    };
    const updateSyncRes = await request("POST", "/api/academic/sync", { data: updateMarkPayload }, { Authorization: `Bearer ${facultyToken}` });
    assert(updateSyncRes.status === 200, "In-place record update sync executes successfully");

    const updatedMark = await Mark.findOne({ studentUsername: studentUser, subject: "c_programming" });
    assert(updatedMark && updatedMark.total === 49, "Record updated in-place without duplication (total: 49)");

    // Explicit Deletion Verification
    const explicitDelRes = await request("POST", "/api/academic/sync", {
      data: {
        deletedNotices: [`notice_idem_${runTag}`]
      }
    }, { Authorization: `Bearer ${facultyToken}` });
    assert(explicitDelRes.status === 200, "Explicit deletion request processed cleanly");

    const deletedNoticeCheck = await Notice.findOne({ noticeId: `notice_idem_${runTag}` });
    assert(deletedNoticeCheck === null, "Explicitly deleted notice is removed from MongoDB 'notices' collection");

    // =========================================================================
    // PART 4: OMITTED RECORD PRESERVATION ACROSS DIVISIONS
    // =========================================================================
    console.log("\n--- PART 4: Omitted Record Preservation Across Divisions ---");

    // Sync notice for Division A
    await request("POST", "/api/academic/sync", {
      data: {
        notices: [
          {
            id: `notice_pres_divA_${runTag}`,
            title: "Division A Persistent Notice",
            content: "Should not be wiped by Div B sync",
            targetDivision: "Division A",
            authorRole: "faculty"
          }
        ]
      }
    }, { Authorization: `Bearer ${facultyToken}` });

    // Sync notice for Division B (omitting Division A notice)
    await request("POST", "/api/academic/sync", {
      data: {
        notices: [
          {
            id: `notice_pres_divB_${runTag}`,
            title: "Division B Persistent Notice",
            content: "Should not wipe Div A notice",
            targetDivision: "Division B",
            authorRole: "faculty"
          }
        ]
      }
    }, { Authorization: `Bearer ${facultyToken}` });

    // Verify Division A notice is STILL in database
    const preservedNoticeA = await Notice.findOne({ noticeId: `notice_pres_divA_${runTag}` });
    const preservedNoticeB = await Notice.findOne({ noticeId: `notice_pres_divB_${runTag}` });
    assert(!!preservedNoticeA && !!preservedNoticeB, "Omitted records preserved: Division B sync DID NOT wipe Division A notices");

    // =========================================================================
    // PART 5: BOUNDED PAYLOAD & MEMORY EXHAUSTION PROTECTION
    // =========================================================================
    console.log("\n--- PART 5: Bounded Payload & Memory Exhaustion Protection ---");

    // Test 1: Excessive Notices (> 500 max)
    const oversizedNotices = Array.from({ length: 501 }, (_, i) => ({
      id: `overflow_notice_${i}`,
      title: `Notice ${i}`
    }));
    const noticeOverflowRes = await request("POST", "/api/academic/sync", {
      data: { notices: oversizedNotices }
    }, { Authorization: `Bearer ${facultyToken}` });
    assert(noticeOverflowRes.status === 400 && noticeOverflowRes.json?.message?.includes("exceeds maximum allowed items for notices"), "Oversized notices array (> 500) rejected with 400 Bad Request");

    // Test 2: Excessive Attendance (> 5000 max)
    const oversizedAttendance = Array.from({ length: 5001 }, (_, i) => ({
      id: `overflow_att_${i}`,
      studentUsername: `user_${i}`
    }));
    const attOverflowRes = await request("POST", "/api/academic/sync", {
      data: { dailyAttendance: oversizedAttendance }
    }, { Authorization: `Bearer ${facultyToken}` });
    assert(attOverflowRes.status === 400 && attOverflowRes.json?.message?.includes("exceeds maximum allowed items for dailyAttendance"), "Oversized dailyAttendance array (> 5000) rejected with 400 Bad Request");

    // Test 3: Excessive Timetable (> 1000 max on timetable sync)
    const oversizedTimetable = Array.from({ length: 1001 }, (_, i) => ({
      division: "Division A",
      day: "Monday",
      time: `${i}:00`,
      subjectText: `Subject ${i}`
    }));
    const ttOverflowRes = await request("POST", "/api/timetable/sync", {
      timetable: oversizedTimetable
    }, { Authorization: `Bearer ${facultyToken}` });
    assert(ttOverflowRes.status === 400 && ttOverflowRes.json?.message?.includes("exceeds maximum allowed limit of 1000"), "Oversized timetable (> 1000 entries) rejected with 400 Bad Request");

    // Test 4: Excessive Students map (> 2000 max)
    const oversizedStudents = {};
    for (let i = 0; i < 2001; i++) {
      oversizedStudents[`student_${i}`] = { marks: {} };
    }
    const studentOverflowRes = await request("POST", "/api/academic/sync", {
      data: { students: oversizedStudents }
    }, { Authorization: `Bearer ${facultyToken}` });
    assert(studentOverflowRes.status === 400 && studentOverflowRes.json?.message?.includes("exceeds maximum allowed students"), "Oversized students object (> 2000 keys) rejected with 400 Bad Request");

    // =========================================================================
    // PART 6: CACHE CORRECTNESS, TTL & INVALIDATION
    // =========================================================================
    console.log("\n--- PART 6: Cache Correctness & Invalidation Audit ---");

    // Baseline cached count
    const cachedRes1 = await request("GET", "/api/stats/counts");
    assert(cachedRes1.status === 200, "Initial stats count retrieves successfully");
    const baselineStudents = cachedRes1.json?.students;

    // Create a temporary user to test cache invalidation
    const tempUser = `cache_test_user_${runTag}`;
    const createTempRes = await request("POST", "/api/users", {
      name: "Temp Cache Student",
      username: tempUser,
      email: `${tempUser}@example.edu`,
      password: defaultPassword,
      role: "student"
    });
    assert(createTempRes.status === 201, "Temporary user created to trigger cache invalidation");
    createdUsernames.push(tempUser);

    // Fetch stats count again (should reflect +1 immediately due to cache invalidation)
    const postCreateRes = await request("GET", "/api/stats/counts");
    assert(postCreateRes.json?.students === baselineStudents + 1, "Cache invalidated on user creation: student count incremented immediately");

    // Bypass cache via ?fresh=1
    const freshRes = await request("GET", "/api/stats/counts?fresh=1");
    assert(freshRes.json?.students === baselineStudents + 1, "Bypass cache via ?fresh=1 returns live database count");

    // Delete temporary user to trigger cache invalidation
    const delTempRes = await request("DELETE", `/api/users/student/${tempUser}`, null, { Authorization: `Bearer ${adminToken}` });
    assert(delTempRes.status === 200, "Temporary user deleted");

    // Fetch stats count again (should decrement immediately)
    const postDeleteRes = await request("GET", "/api/stats/counts");
    assert(postDeleteRes.json?.students === baselineStudents, "Cache invalidated on user deletion: student count decremented immediately");

    // =========================================================================
    // PART 7: ERROR HANDLING & INPUT SANITIZATION RECOVERY
    // =========================================================================
    console.log("\n--- PART 7: Error Handling & Resilience Audit ---");

    // Malformed JSON body
    const malformedJsonRes = await request("POST", "/api/academic/sync", "INVALID_JSON_BODY{{{", {
      "Content-Type": "application/json",
      Authorization: `Bearer ${facultyToken}`
    });
    assert(malformedJsonRes.status === 400 && malformedJsonRes.json?.message?.includes("Invalid JSON"), "Malformed JSON handled cleanly with 400 Bad Request");

    // Dangerous HTML script tags stripped
    const xssPayload = {
      notices: [
        {
          id: `notice_xss_${runTag}`,
          title: "<script>alert('pwned')</script>Safe Title",
          content: "<b>Bold</b><img src=x onerror=alert(1)>Content",
          targetDivision: "Division A",
          authorRole: "faculty"
        }
      ]
    };
    const xssSyncRes = await request("POST", "/api/academic/sync", { data: xssPayload }, { Authorization: `Bearer ${facultyToken}` });
    assert(xssSyncRes.status === 200, "XSS test sync executes successfully");

    const xssNoticeDoc = await Notice.findOne({ noticeId: `notice_xss_${runTag}` });
    assert(
      xssNoticeDoc && !xssNoticeDoc.title.includes("<script>") && !xssNoticeDoc.content.includes("onerror"),
      "Dangerous HTML and script tags stripped before MongoDB persistence"
    );

    // =========================================================================
    // PART 8: PERSISTENCE & AUTHORITATIVE DATABASE VERIFICATION
    // =========================================================================
    console.log("\n--- PART 8: Database Persistence & Referential Verification ---");

    const finalStuDoc = await User.findOne({ username: studentUser });
    const finalFacDoc = await User.findOne({ username: facultyUser });
    assert(!!finalStuDoc && !!finalFacDoc, "Created users persistently recorded in MongoDB 'users' collection");

    const finalMarkDoc = await Mark.findOne({ studentUsername: studentUser });
    assert(!!finalMarkDoc && finalMarkDoc.total === 49, "Marks remain persistently authoritative in MongoDB 'marks' collection");

    const finalStore = await AcademicStore.findOne({ storeKey: "default_academic_store" });
    assert(!!finalStore && !!finalStore.students?.[studentUser], "AcademicStore maintains persistent synchronized student records");

    // Clean deletion of admin test account protection
    const delAdminRes = await request("DELETE", `/api/users/admin/${adminUser}`, null, { Authorization: `Bearer ${adminToken}` });
    assert(delAdminRes.status === 403, "Administrator self-deletion protection strictly enforced (403 Forbidden)");

  } finally {
    // Teardown all temporary test artifacts
    console.log("\n--- Cleaning up temporary test artifacts ---");
    await User.deleteMany({ username: { $in: createdUsernames } });
    await Attendance.deleteMany({ studentUsername: studentUser });
    await Mark.deleteMany({ studentUsername: studentUser });
    await Assignment.deleteMany({ assignmentId: `assign_idem_${runTag}` });
    await Notice.deleteMany({
      noticeId: {
        $in: [
          `notice_conc_A_${runTag}`,
          `notice_conc_B_${runTag}`,
          `notice_idem_${runTag}`,
          `notice_pres_divA_${runTag}`,
          `notice_pres_divB_${runTag}`,
          `notice_xss_${runTag}`
        ]
      }
    });
    await Timetable.deleteMany({
      division: "Division A",
      faculty: facultyUser
    });

    try {
      const store = await AcademicStore.findOne({ storeKey: "default_academic_store" });
      if (store) {
        if (store.students) {
          delete store.students[studentUser];
          store.markModified("students");
        }
        if (store.notices) {
          store.notices = store.notices.filter(n =>
            !n.id?.includes(`_${runTag}`) && !n.noticeId?.includes(`_${runTag}`)
          );
          store.markModified("notices");
        }
        if (store.assignments) {
          store.assignments = store.assignments.filter(a =>
            !a.id?.includes(`_${runTag}`) && !a.assignmentId?.includes(`_${runTag}`)
          );
          store.markModified("assignments");
        }
        await store.save();
      }
    } catch (_) {}

    if (server) {
      server.close();
    }
  }

  console.log("\n==================================================");
  console.log("LATENCY BENCHMARK SUMMARY");
  console.log("==================================================");
  console.table(benchmarkResults);

  console.log("\n==================================================");
  console.log(`PROMPT 15 AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    console.error("Failures:");
    failures.forEach(f => console.error(` - ${f}`));
    process.exit(1);
  }
  process.exit(0);
}

runPerformanceAndReliabilityAudit().catch(err => {
  console.error("Performance audit runner uncaught error:", err);
  if (server) server.close();
  process.exit(1);
});

