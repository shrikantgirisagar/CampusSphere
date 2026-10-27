// scripts/test-phase1a-regression.js
// Isolated, non-destructive regression test suite for Phase 1A:
// DATA-001 (Student deletion assignment cleanup) and SEC-002 (Syllabus token removal)
//
// ZERO DATABASE CALLS: All tests run with in-memory mocks without connecting to MongoDB Atlas.
// ZERO OPERATIONAL FILE MUTATIONS: No writes to data/*.json or project files.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// Test Group 1: DATA-001 — Student Account Deletion Assignment Cleanup
// -----------------------------------------------------------------------------
function createMockAcademicStore(initialData) {
  const modifiedProperties = new Set();
  let saveCount = 0;
  let saveShouldFail = false;

  const store = {
    storeKey: "default_academic_store",
    students: JSON.parse(JSON.stringify(initialData.students || {})),
    assignments: JSON.parse(JSON.stringify(initialData.assignments || [])),
    deletedAssignments: JSON.parse(JSON.stringify(initialData.deletedAssignments || [])),
    markModified(prop) {
      modifiedProperties.add(prop);
    },
    async save() {
      saveCount++;
      if (saveShouldFail) {
        throw new Error("Simulated AcademicStore database error on save");
      }
      return this;
    },
    // Test inspection helpers
    _getModified() {
      return Array.from(modifiedProperties);
    },
    _getSaveCount() {
      return saveCount;
    },
    _setSaveShouldFail(val) {
      saveShouldFail = val;
    }
  };

  return store;
}

// Simulate the exact deletion handler logic in server.js:1488-1507
async function executeAcademicCleanup(store, targetUsername) {
  let warningMessage = null;
  try {
    if (store) {
      if (store.students && typeof store.students === "object") {
        const studentKey = Object.keys(store.students).find(k => k.toLowerCase() === targetUsername.toLowerCase()) || targetUsername;
        if (store.students[studentKey]) {
          delete store.students[studentKey];
          store.markModified("students");
        }
      }
      if (Array.isArray(store.assignments)) {
        store.assignments = store.assignments.filter(a => (a.student || "").toLowerCase() !== targetUsername.toLowerCase());
        store.markModified("assignments");
      }
      if (Array.isArray(store.deletedAssignments)) {
        store.deletedAssignments = store.deletedAssignments.filter(k => !String(k || "").toLowerCase().startsWith(`${targetUsername.toLowerCase()}___`));
        store.markModified("deletedAssignments");
      }
      await store.save();
    }
  } catch (storeErr) {
    warningMessage = storeErr.message;
  }
  return { warningMessage };
}

async function runGroup1() {
  console.log("\n--- Group 1: DATA-001 AcademicStore Student Deletion Logic ---");

  const initialStoreData = {
    students: {
      "student_alpha": { name: "Alpha", rollNo: "001" },
      "Student_Beta": { name: "Beta", rollNo: "002" },
      "student_gamma": { name: "Gamma", rollNo: "003" }
    },
    assignments: [
      { id: 101, title: "Math Homework 1", student: "student_alpha", score: 95 },
      { id: 102, title: "English Essay", student: "STUDENT_ALPHA", score: 88 },
      { id: 103, title: "History Paper", student: "Student_Beta", score: 91 },
      { id: 104, title: "Math Homework 1", student: "student_gamma", score: 84 },
      { id: 105, title: "Science Lab", student: "student_alpha", score: 90 }
    ],
    deletedAssignments: [
      "student_alpha___assignment_old_1",
      "student_beta___assignment_old_2",
      "STUDENT_ALPHA___assignment_old_3"
    ]
  };

  // 1. Delete student_alpha
  const store = createMockAcademicStore(initialStoreData);
  const result = await executeAcademicCleanup(store, "student_alpha");

  assert(result.warningMessage === null, "Cleanup completed without errors");
  assert(store._getSaveCount() === 1, "store.save() was called exactly once");

  // Verify assignments belonging to student_alpha (case-insensitive) are removed
  const remainingAssignments = store.assignments;
  assert(remainingAssignments.length === 2, `Assignments array filtered down to 2 items (was ${initialStoreData.assignments.length})`);
  assert(remainingAssignments.every(a => (a.student || "").toLowerCase() !== "student_alpha"), "No remaining assignments belong to student_alpha");

  // Verify assignments belonging to other students remain intact
  const betaAssignment = remainingAssignments.find(a => a.student === "Student_Beta");
  const gammaAssignment = remainingAssignments.find(a => a.student === "student_gamma");
  assert(!!betaAssignment && betaAssignment.score === 91, "Student_Beta assignment preserved with intact data");
  assert(!!gammaAssignment && gammaAssignment.score === 84, "student_gamma assignment preserved with intact data");

  // Verify Mongoose markModified calls
  const modified = store._getModified();
  assert(modified.includes("assignments"), "store.markModified('assignments') was called");
  assert(modified.includes("deletedAssignments"), "store.markModified('deletedAssignments') was called");
  assert(modified.includes("students"), "store.markModified('students') was called");

  // Verify deletedAssignments filtered
  assert(store.deletedAssignments.length === 1, "deletedAssignments array filtered down to 1 item");
  assert(store.deletedAssignments[0] === "student_beta___assignment_old_2", "Only non-target deletedAssignments remain");

  // Verify student entry removed from store.students
  assert(store.students["student_alpha"] === undefined, "student_alpha removed from store.students");
  assert(store.students["Student_Beta"] !== undefined, "Student_Beta preserved in store.students");

  // 2. Test case-insensitive username targeting (e.g. target is 'STUDENT_BETA')
  const store2 = createMockAcademicStore(initialStoreData);
  await executeAcademicCleanup(store2, "STUDENT_BETA");
  assert(store2.assignments.length === 4, "Case-insensitive target deleted exactly 1 assignment for Beta");
  assert(store2.students["Student_Beta"] === undefined, "Case-insensitive target removed 'Student_Beta' from store.students");

  // 3. Test resilience when store.save() fails (must catch and warn without throwing)
  const failingStore = createMockAcademicStore(initialStoreData);
  failingStore._setSaveShouldFail(true);
  const failResult = await executeAcademicCleanup(failingStore, "student_alpha");
  assert(failResult.warningMessage !== null, "Store save error was caught and recorded as a warning");
  assert(failResult.warningMessage.includes("Simulated"), "Warning contains the expected failure reason");
}

// -----------------------------------------------------------------------------
// Test Group 2: SEC-002 — Auth Middleware & Query Parameter Token Rejection
// -----------------------------------------------------------------------------
const TEST_SECRET = "mock_phase1a_test_auth_secret_32bytes_long!";

function createTestToken(user, expiresInMs = 3600000) {
  const exp = Date.now() + expiresInMs;
  const payload = {
    id: user.id || "usr_123",
    role: user.role || "student",
    username: user.username || "testuser",
    exp
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", TEST_SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

function verifyTestToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return { error: "malformed" };
  const parts = token.split(".");
  if (parts.length !== 2) return { error: "malformed" };
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac("sha256", TEST_SECRET).update(payload).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return { error: "invalid" };
  let data;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return { error: "malformed" };
  }
  if (!data.exp || data.exp < Date.now()) return { error: "expired" };
  return { id: data.id, role: data.role, username: data.username };
}

// Mock of server.js authenticateRequest
function mockAuthenticateRequest(req, res, next) {
  // SEC-002 fix: req.query.token REMOVED
  const authHeader = req.headers["authorization"] || req.headers["x-auth-token"];
  let token = "";
  if (authHeader && String(authHeader).startsWith("Bearer ")) {
    token = String(authHeader).slice(7).trim();
  } else if (authHeader) {
    token = String(authHeader).trim();
  }

  if (!token) {
    req.user = null;
    return next();
  }

  const result = verifyTestToken(token);
  if (result.error) {
    return res.status(401).json({ success: false, message: `Token ${result.error}` });
  }

  req.user = { id: result.id, role: result.role, username: result.username };
  next();
}

// Mock of server.js requireAuth
function mockRequireAuth(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required to access this resource." });
    }
    if (Array.isArray(roles) && roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Access forbidden: Requires ${roles.join(" or ")} role.` });
    }
    next();
  };
}

function createMockReqRes(options = {}) {
  const req = {
    headers: options.headers || {},
    query: options.query || {},
    params: options.params || {},
    user: null
  };

  let statusCode = 200;
  let responseData = null;
  const setHeaders = {};

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    setHeader(k, v) {
      setHeaders[k.toLowerCase()] = v;
    },
    _getStatus() {
      return statusCode;
    },
    _getData() {
      return responseData;
    },
    _getHeaders() {
      return setHeaders;
    }
  };

  return { req, res };
}

function runGroup2() {
  console.log("\n--- Group 2: SEC-002 Auth Middleware & Token In Query Rejection ---");

  const validUser = { id: "std_001", role: "student", username: "alice" };
  const validToken = createTestToken(validUser);
  const expiredToken = createTestToken(validUser, -1000); // expired 1s ago

  // 1. Authorization: Bearer <validToken> -> Success
  {
    const { req, res } = createMockReqRes({
      headers: { authorization: `Bearer ${validToken}` },
      query: {}
    });
    let nextCalled = false;
    mockAuthenticateRequest(req, res, () => { nextCalled = true; });
    assert(nextCalled === true, "Bearer auth header calls next()");
    assert(req.user && req.user.username === "alice", "req.user successfully set from Bearer header");

    let authPassed = false;
    mockRequireAuth()(req, res, () => { authPassed = true; });
    assert(authPassed === true, "requireAuth passes for authenticated user");
  }

  // 2. x-auth-token: <validToken> -> Success
  {
    const { req, res } = createMockReqRes({
      headers: { "x-auth-token": validToken },
      query: {}
    });
    let nextCalled = false;
    mockAuthenticateRequest(req, res, () => { nextCalled = true; });
    assert(nextCalled === true, "x-auth-token header calls next()");
    assert(req.user && req.user.username === "alice", "req.user successfully set from x-auth-token header");
  }

  // 3. SEC-002: Token supplied ONLY in ?token= query parameter -> REJECTED
  {
    const { req, res } = createMockReqRes({
      headers: {},
      query: { token: validToken }
    });
    let nextCalled = false;
    mockAuthenticateRequest(req, res, () => { nextCalled = true; });
    assert(nextCalled === true, "Guest request without auth headers calls next()");
    assert(req.user === null, "req.user remains null when token is only in ?token= query");

    let authPassed = false;
    mockRequireAuth()(req, res, () => { authPassed = true; });
    assert(authPassed === false, "requireAuth blocks request with token only in query param");
    assert(res._getStatus() === 401, "Rejected with 401 Unauthorized");
  }

  // 4. Missing credentials entirely -> 401 on protected route
  {
    const { req, res } = createMockReqRes({ headers: {}, query: {} });
    mockAuthenticateRequest(req, res, () => {});
    assert(req.user === null, "req.user is null for unauthenticated guest");
    mockRequireAuth()(req, res, () => {});
    assert(res._getStatus() === 401, "Protected route returns 401 for guest");
  }

  // 5. Expired token -> 401
  {
    const { req, res } = createMockReqRes({
      headers: { authorization: `Bearer ${expiredToken}` },
      query: {}
    });
    let nextCalled = false;
    mockAuthenticateRequest(req, res, () => { nextCalled = true; });
    assert(nextCalled === false, "Expired token does NOT call next()");
    assert(res._getStatus() === 401, "Expired token receives 401");
  }

  // 6. Tampered signature -> 401
  {
    const tamperedToken = validToken.slice(0, -4) + "XXXX";
    const { req, res } = createMockReqRes({
      headers: { authorization: `Bearer ${tamperedToken}` },
      query: {}
    });
    let nextCalled = false;
    mockAuthenticateRequest(req, res, () => { nextCalled = true; });
    assert(nextCalled === false, "Tampered token does NOT call next()");
    assert(res._getStatus() === 401, "Tampered token receives 401");
  }

  // 7. Role authorization check (admin vs student)
  {
    const { req, res } = createMockReqRes({
      headers: { authorization: `Bearer ${validToken}` }
    });
    mockAuthenticateRequest(req, res, () => {});
    let adminRoutePassed = false;
    mockRequireAuth(["admin"])(req, res, () => { adminRoutePassed = true; });
    assert(adminRoutePassed === false, "Student cannot access admin-only route");
    assert(res._getStatus() === 403, "Student receives 403 Forbidden on admin route");
  }
}

// -----------------------------------------------------------------------------
// Test Group 3: SEC-002 — Frontend Code Static Analysis & Token Leaks
// -----------------------------------------------------------------------------
function runGroup3() {
  console.log("\n--- Group 3: SEC-002 Static Analysis of Frontend & Server Code ---");

  const serverCode = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");
  const scriptCode = fs.existsSync(path.join(__dirname, "../public/script.js")) ? fs.readFileSync(path.join(__dirname, "../public/script.js"), "utf8") : fs.readFileSync(path.join(__dirname, "../script.js"), "utf8");
  const coursesCode = fs.existsSync(path.join(__dirname, "../public/courses.html")) ? fs.readFileSync(path.join(__dirname, "../public/courses.html"), "utf8") : fs.readFileSync(path.join(__dirname, "../courses.html"), "utf8");
  const adminCoursesCode = fs.readFileSync(path.join(__dirname, "../admin-courses-syllabus.html"), "utf8");

  // 1. Verify req.query.token is not in server.js authenticateRequest
  assert(!serverCode.includes("req.query.token"), "server.js does NOT contain req.query.token");

  // 2. Verify script.js does not append token to syllabus download URLs
  assert(!scriptCode.includes("download?token="), "script.js does NOT contain 'download?token='");
  assert(!scriptCode.includes("download?inline=1&token="), "script.js does NOT contain 'download?inline=1&token='");

  // 3. Verify courses.html does not append token to syllabus download URLs
  assert(!coursesCode.includes("/download?token="), "courses.html does NOT contain '/download?token='");

  // 4. Verify admin-courses-syllabus.html does not contain token URL parameters
  assert(!adminCoursesCode.includes("/download?token="), "admin-courses-syllabus.html does NOT contain '/download?token='");

  // 5. Verify script.js download and preview functions use authenticatedFetch and Blob handling
  assert(scriptCode.includes("async function previewSyllabusPdf("), "script.js defines async previewSyllabusPdf");
  assert(scriptCode.includes("async function downloadSyllabusPdf("), "script.js defines async downloadSyllabusPdf");
  assert(scriptCode.includes("URL.createObjectURL("), "script.js uses URL.createObjectURL for blob download");
  assert(scriptCode.includes("URL.revokeObjectURL("), "script.js revokes object URLs after download");

  // 6. Verify courses.html handleCoursesPageDownload uses fetch with Authorization header and checks response
  assert(coursesCode.includes("async function handleCoursesPageDownload("), "courses.html defines async handleCoursesPageDownload");
  assert(coursesCode.includes('"Authorization": "Bearer " + currentToken'), "courses.html passes Authorization header in fetch");
  assert(coursesCode.includes("if (!res.ok)"), "courses.html validates HTTP response status before processing");
  assert(coursesCode.includes("URL.createObjectURL(blob)"), "courses.html uses URL.createObjectURL for PDF blob");
  assert(coursesCode.includes("URL.revokeObjectURL(objectUrl)"), "courses.html revokes object URL after download");

  // 7. Verify DATA-001 in server.js: assignments array filter is assigned and markModified is called
  assert(serverCode.includes("store.assignments = store.assignments.filter("), "server.js assigns filtered assignments back to store.assignments");
  assert(serverCode.includes('store.markModified("assignments")'), "server.js calls store.markModified('assignments')");
  assert(serverCode.includes('store.markModified("deletedAssignments")'), "server.js calls store.markModified('deletedAssignments')");
}

// -----------------------------------------------------------------------------
// Test Runner
// -----------------------------------------------------------------------------
async function runAllTests() {
  await runGroup1();
  runGroup2();
  runGroup3();

  console.log(`\n==================================================`);
  console.log(`Phase 1A Regression Test Results:`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
