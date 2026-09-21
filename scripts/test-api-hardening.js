// scripts/test-api-hardening.js
// Dedicated automated test suite for API & Application Hardening (Prompt 8)
// Tests: Rate Limiting, CORS, Security Headers, Request Limits, Error Handling & Abuse Protection

require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const crypto = require("crypto");
const path = require("path");

const TEST_PORT = 3098;
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
  console.log("=== CampusSphere API & Application Hardening Test Suite (Prompt 8) ===");

  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/CampusSphere";
  await mongoose.connect(mongoUri);
  console.log("✓ Connected to MongoDB");

  // Start test server instance
  process.env.PORT = String(TEST_PORT);
  process.env.NODE_ENV = "test";
  serverProcess = require("../server.js");
  await new Promise(res => setTimeout(res, 1200));
  console.log(`✓ Test server running at ${BASE_URL}\n`);

  // Create test admin user for authenticated tests
  const User = mongoose.model("User");
  const adminUser = `admin_harden_${Date.now()}`;
  const testPassword = "AdminSecurePassword@123";
  const hashedPwd = await hashPassword(testPassword);

  await User.create({
    id: `id-${adminUser}`,
    role: "admin",
    username: adminUser,
    name: "Test Admin Hardening",
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
  // 1. Security Headers Verification
  // -------------------------------------------------------------
  console.log("\n--- 1. Security Headers Tests ---");
  const headerRes = await request("GET", "/api/status");

  assert(headerRes.headers["x-content-type-options"] === "nosniff", "Header X-Content-Type-Options is nosniff");
  assert(headerRes.headers["x-frame-options"] === "SAMEORIGIN", "Header X-Frame-Options is SAMEORIGIN");
  assert(headerRes.headers["referrer-policy"] === "strict-origin-when-cross-origin", "Header Referrer-Policy is strict-origin-when-cross-origin");
  assert(headerRes.headers["x-xss-protection"] === "0", "Header X-XSS-Protection is 0 (modern OWASP standard)");
  assert(headerRes.headers["permissions-policy"] === "geolocation=(), camera=(), microphone=()", "Header Permissions-Policy restricts sensitive device APIs");
  assert(headerRes.headers["cross-origin-opener-policy"] === "same-origin", "Header Cross-Origin-Opener-Policy is same-origin");
  assert(headerRes.headers["cross-origin-resource-policy"] === "same-origin", "Header Cross-Origin-Resource-Policy is same-origin");
  assert(!headerRes.headers["x-powered-by"], "Header X-Powered-By is suppressed");

  // -------------------------------------------------------------
  // 2. CORS Hardening Tests
  // -------------------------------------------------------------
  console.log("\n--- 2. CORS Hardening Tests ---");

  // Allowed origin
  const allowedOriginRes = await request("GET", "/api/status", null, null, {
    "Origin": "http://localhost:3000"
  });
  assert(
    allowedOriginRes.headers["access-control-allow-origin"] === "http://localhost:3000",
    "Allowed origin receives Access-Control-Allow-Origin matching requested origin"
  );
  assert(
    allowedOriginRes.headers["access-control-allow-credentials"] === "true",
    "Allowed origin receives Access-Control-Allow-Credentials: true"
  );

  // Disallowed origin
  const disallowedOriginRes = await request("GET", "/api/status", null, null, {
    "Origin": "http://malicious-attacker-site.com"
  });
  assert(
    disallowedOriginRes.status === 403 || !disallowedOriginRes.headers["access-control-allow-origin"],
    "Disallowed origin does NOT receive Access-Control-Allow-Origin header (or returns 403)"
  );

  // Preflight OPTIONS request
  const preflightRes = await request("OPTIONS", "/api/auth/login", null, null, {
    "Origin": "http://localhost:3000",
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "Content-Type, Authorization"
  });
  assert(
    preflightRes.status === 204 || preflightRes.status === 200,
    "Preflight OPTIONS request succeeds with 200/204"
  );
  assert(
    preflightRes.headers["access-control-allow-methods"]?.includes("POST"),
    "Preflight response allows POST method"
  );

  // Non-browser / same-origin request (no Origin header)
  const noOriginRes = await request("GET", "/api/status");
  assert(noOriginRes.status === 200, "Non-browser / curl requests without Origin header succeed normally");

  // -------------------------------------------------------------
  // 3. Static File Protection Tests
  // -------------------------------------------------------------
  console.log("\n--- 3. Static File Protection Tests ---");

  // Sensitive files must NOT be accessible
  const serverJsRes = await request("GET", "/server.js");
  assert(serverJsRes.status === 404, "Direct request to /server.js is blocked with 404");

  const packageJsonRes = await request("GET", "/package.json");
  assert(packageJsonRes.status === 404, "Direct request to /package.json is blocked with 404");

  const envRes = await request("GET", "/.env");
  assert(envRes.status === 404, "Direct request to /.env is blocked with 404");

  const modelRes = await request("GET", "/models/User.js");
  assert(modelRes.status === 404, "Direct request to /models/User.js is blocked with 404");

  const scriptRes = await request("GET", "/scripts/test-mongodb-users.js");
  assert(scriptRes.status === 404, "Direct request to /scripts/ is blocked with 404");

  const batRes = await request("GET", "/Start_CampusSphere.bat");
  assert(batRes.status === 404, "Direct request to .bat scripts is blocked with 404");

  // Legitimate public assets MUST remain accessible
  const styleRes = await request("GET", "/style.css");
  assert(styleRes.status === 200 && styleRes.headers["content-type"]?.includes("text/css"), "Legitimate public asset /style.css is accessible with 200");

  const frontendScriptRes = await request("GET", "/script.js");
  assert(frontendScriptRes.status === 200, "Legitimate public asset /script.js is accessible with 200");

  // -------------------------------------------------------------
  // 4. Request Body Limits & Malformed JSON Tests
  // -------------------------------------------------------------
  console.log("\n--- 4. Request Body Limits & Malformed JSON Tests ---");

  // Malformed JSON should return 400 with clean JSON error, not crash or leak stack trace
  const malformedRes = await request("POST", "/api/auth/login", "{ not valid json: true }", null, {
    "Content-Type": "application/json"
  });
  assert(malformedRes.status === 400, "Malformed JSON returns HTTP 400");
  assert(
    malformedRes.body?.success === false && malformedRes.body?.message?.includes("JSON"),
    "Malformed JSON returns clean JSON error message without stack trace"
  );

  // Oversized JSON payload (>1MB) to standard endpoint
  const largeString = "A".repeat(1.2 * 1024 * 1024); // 1.2 MB
  const oversizedRes = await request("POST", "/api/users", {
    role: "student",
    name: "Oversized User",
    username: "oversized_user",
    password: "Password@123",
    padding: largeString
  });
  assert(oversizedRes.status === 413, "Payload exceeding 1MB on standard route is rejected with HTTP 413");
  assert(
    oversizedRes.body?.success === false && oversizedRes.body?.message?.includes("too large"),
    "Oversized payload returns structured JSON 413 response"
  );

  // Academic sync route accepts larger payload (e.g. 2MB) within 15MB limit
  const mediumPayload = "B".repeat(1.5 * 1024 * 1024); // 1.5 MB
  const acadSyncRes = await request("POST", "/api/academic/sync", {
    data: {
      notes: [
        { id: `note_large_${Date.now()}`, title: "Large Syllabus", division: "Div A", content: mediumPayload }
      ]
    }
  }, adminToken);
  assert(
    acadSyncRes.status === 200,
    "Academic sync accepts payloads larger than 1MB (within 15MB dedicated limit)"
  );

  // -------------------------------------------------------------
  // 5. Input Bounds & Bulk Operation Guardrails
  // -------------------------------------------------------------
  console.log("\n--- 5. Input Bounds & Bulk Limits Tests ---");

  // User migration batch > 1000 rejected
  const massiveUsers = Array.from({ length: 1005 }, (_, i) => ({
    username: `mig_user_${i}`,
    name: `Mig User ${i}`,
    password: "Password@123"
  }));
  const migOversizeRes = await request("POST", "/api/users/migrate", {
    users: { student: massiveUsers }
  }, adminToken);
  assert(migOversizeRes.status === 400, "Migration batch exceeding 1000 users rejected with HTTP 400");
  assert(
    migOversizeRes.body?.message?.includes("1000"),
    "Migration rejection message specifies 1000 user limit"
  );

  // Academic sync notices > 500 rejected
  const massiveNotices = Array.from({ length: 505 }, (_, i) => ({
    title: `Notice ${i}`,
    text: `Text ${i}`
  }));
  const acadOversizeRes = await request("POST", "/api/academic/sync", {
    data: { notices: massiveNotices }
  }, adminToken);
  assert(acadOversizeRes.status === 400, "Academic sync with > 500 notices rejected with HTTP 400");

  // Timetable sync entries > 1000 rejected
  const massiveTimetable = Array.from({ length: 1005 }, (_, i) => ({
    division: "Div A",
    semester: "1st Semester",
    day: "Monday",
    time: `10:0${i} AM`,
    subject: "Math"
  }));
  const ttOversizeRes = await request("POST", "/api/timetable/sync", {
    timetable: massiveTimetable
  }, adminToken);
  assert(ttOversizeRes.status === 400, "Timetable sync with > 1000 entries rejected with HTTP 400");

  // -------------------------------------------------------------
  // 6. Centralized Error Handling & 404 Tests
  // -------------------------------------------------------------
  console.log("\n--- 6. Centralized Error Handling & 404 Tests ---");

  // Unknown API GET endpoint
  const unknownGetRes = await request("GET", "/api/nonexistent-path");
  assert(unknownGetRes.status === 404, "Unknown API GET route returns HTTP 404");
  assert(unknownGetRes.body?.success === false, "Unknown API GET route returns structured JSON (not HTML)");

  // Unknown API POST endpoint
  const unknownPostRes = await request("POST", "/api/another-fake-endpoint", {});
  assert(unknownPostRes.status === 404, "Unknown API POST route returns HTTP 404");
  assert(unknownPostRes.body?.success === false, "Unknown API POST route returns structured JSON (not HTML)");

  // Unknown API DELETE endpoint
  const unknownDelRes = await request("DELETE", "/api/unknown-delete");
  assert(unknownDelRes.status === 404, "Unknown API DELETE route returns HTTP 404");
  assert(unknownDelRes.body?.success === false, "Unknown API DELETE route returns structured JSON");

  // -------------------------------------------------------------
  // 7. Rate Limiting Tests
  // -------------------------------------------------------------
  console.log("\n--- 7. Rate Limiting Tests ---");

  // Test Rate Limit on /api/auth/login (25 max requests)
  console.log("  Testing /api/auth/login rate limiter (25 attempts threshold)...");
  let triggered429 = false;
  let retryAfterHeader = null;
  let rateLimitLimit = null;

  for (let i = 0; i < 28; i++) {
    const res = await request("POST", "/api/auth/login", {
      role: "admin",
      username: "rate_limit_test",
      password: "WrongPassword@123"
    });
    if (res.status === 429) {
      triggered429 = true;
      retryAfterHeader = res.headers["retry-after"];
      rateLimitLimit = res.headers["ratelimit-limit"];
      break;
    }
  }

  assert(triggered429, "Rate limiter triggers HTTP 429 after exceeding max login attempts");
  assert(!!retryAfterHeader, "HTTP 429 response includes Retry-After header");
  assert(rateLimitLimit === "25", "HTTP 429 response includes RateLimit-Limit: 25 header");

  // Test registration rate limiter with explicit test header
  console.log("  Testing registration rate limiter with explicit test header...");
  let reg429 = false;
  for (let i = 0; i < 33; i++) {
    const res = await request("POST", "/api/users", {
      role: "student",
      name: `Spam User ${i}`,
      username: `spam_${Date.now()}_${i}`,
      password: "Password@123"
    }, null, { "x-test-rate-limit": "1" });
    if (res.status === 429) {
      reg429 = true;
      break;
    }
  }
  assert(reg429, "Registration rate limiter triggers HTTP 429 on spam account creation");

  // Clean up test admin user and test notes
  await User.deleteMany({ username: adminUser });
  const Note = require("../models/Note");
  const AcademicStore = require("../models/AcademicStore");
  await Note.deleteMany({ title: "Large Syllabus" });
  try {
    const store = await AcademicStore.findOne({ storeKey: "default_academic_store" });
    if (store && Array.isArray(store.notes)) {
      store.notes = store.notes.filter(n => n.title !== "Large Syllabus");
      store.markModified("notes");
      await store.save();
    }
  } catch (_) {}
  console.log("✓ Cleaned up test admin user and temporary test note artifacts");
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

