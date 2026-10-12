// scripts/test-login-rate-limit.js
// Dedicated automated test suite for CampusSphere Local Login API Rate-Limit Fix
// Tests: Single Submission, Duplicate Prevention, Isolated Limiters, 429 Responses & Brute-Force Security

require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const TEST_PORT = 3097;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

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
  console.log("====================================================================");
  console.log("CAMPUSSPHERE — LOCAL LOGIN API RATE-LIMIT FIX VERIFICATION SUITE");
  console.log("====================================================================\n");

  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/CampusSphere";
  await mongoose.connect(mongoUri);
  console.log("✓ Connected to MongoDB");

  // Start test server instance with NODE_ENV = "test"
  process.env.PORT = String(TEST_PORT);
  process.env.NODE_ENV = "test";
  serverProcess = require("../server.js");
  await new Promise(res => setTimeout(res, 1200));
  console.log(`✓ Test server running at ${BASE_URL}\n`);

  // Create test student user
  const User = mongoose.model("User");
  const testStudentUser = `ratetest_std_${Date.now()}`;
  const validPassword = "StudentPass@123";
  const hashedPwd = await hashPassword(validPassword);

  await User.create({
    id: `id-${testStudentUser}`,
    role: "student",
    username: testStudentUser,
    name: "Rate Limit Test Student",
    passwordHash: hashedPwd,
    department: "Computer Applications",
    courseYear: "1st Year",
    semester: "1st Semester",
    division: "Div A"
  });

  // =========================================================================
  // SUITE 1: Frontend Code & Architecture Inspection
  // =========================================================================
  console.log("--- SUITE 1: Frontend Code & Architecture Inspection ---");
  const scriptContent = fs.readFileSync(path.join(__dirname, "../script.js"), "utf8");
  const serverContent = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");

  assert(
    scriptContent.includes("isLoginSubmitting"),
    "script.js declares isLoginSubmitting guard to prevent concurrent submissions"
  );
  assert(
    scriptContent.includes("if (isLoginSubmitting) return;"),
    "loginForm submit handler checks isLoginSubmitting guard before processing"
  );
  assert(
    scriptContent.includes("withActionLock(submitButton"),
    "loginForm uses withActionLock to disable submit button and display loading indicator"
  );
  assert(
    scriptContent.includes("usernameInput.disabled = true") && scriptContent.includes("passwordInput.disabled = true"),
    "loginForm temporarily disables input fields during in-flight submission"
  );
  assert(
    scriptContent.includes("usernameInput.disabled = false") && scriptContent.includes("passwordInput.disabled = false"),
    "loginForm re-enables input fields in finally block upon completion"
  );
  assert(
    serverContent.includes("res.statusCode < 400") && serverContent.includes("skipSuccessfulRequests"),
    "server.js implements skipSuccessfulRequests so legitimate logins do not consume brute-force quota"
  );
  assert(
    serverContent.includes("skip: (req) =>") && serverContent.includes("/api/auth/login"),
    "server.js general API limiter skips /api/auth/login to decouple general API traffic from login"
  );
  assert(
    serverContent.includes("normalizeClientIp"),
    "server.js normalizes IPv4/IPv6 loopback and ::ffff: mapped addresses consistently"
  );

  // =========================================================================
  // SUITE 2: Valid Authentication & Successful Request Quota Preservation
  // =========================================================================
  console.log("\n--- SUITE 2: Valid Authentication & Successful Request Preservation ---");

  // Legitimate login works
  const loginRes1 = await request("POST", "/api/auth/login", {
    role: "student",
    username: testStudentUser,
    password: validPassword
  });
  assert(loginRes1.status === 200, "Valid credentials successfully authenticate with HTTP 200");
  assert(loginRes1.body?.success === true, "Valid authentication returns success: true");
  assert(!!loginRes1.body?.token, "Valid authentication returns signed JWT/HMAC token");

  // Perform multiple successful logins to verify they do not decrement available quota
  let allSuccess = true;
  for (let i = 0; i < 5; i++) {
    const res = await request("POST", "/api/auth/login", {
      role: "student",
      username: testStudentUser,
      password: validPassword
    });
    if (res.status !== 200) allSuccess = false;
  }
  assert(allSuccess, "Multiple consecutive legitimate logins succeed without exhausting the rate limiter");

  // =========================================================================
  // SUITE 3: Invalid Credentials Rejection & Brute-Force Rate Limiting
  // =========================================================================
  console.log("\n--- SUITE 3: Invalid Credentials Rejection & Brute-Force Rate Limiting ---");

  // Single invalid login returns HTTP 401
  const invalidRes = await request("POST", "/api/auth/login", {
    role: "student",
    username: testStudentUser,
    password: "WrongPassword@999"
  });
  assert(invalidRes.status === 401, "Invalid credentials return HTTP 401 Unauthorized");
  assert(invalidRes.body?.success === false, "Invalid credentials return success: false");

  // Send repeated failed requests to trigger rate limit (threshold is 25 in test/production)
  console.log("  Testing failed login threshold (25 attempts)...");
  let triggered429 = false;
  let retryAfterHeader = null;
  let rateLimitLimit = null;
  let retryAfterJson = null;
  let rateLimitMessage = null;

  for (let i = 0; i < 28; i++) {
    const res = await request("POST", "/api/auth/login", {
      role: "student",
      username: testStudentUser,
      password: `WrongPassword_${i}`
    });
    if (res.status === 429) {
      triggered429 = true;
      retryAfterHeader = res.headers["retry-after"];
      rateLimitLimit = res.headers["ratelimit-limit"];
      retryAfterJson = res.body?.retryAfter;
      rateLimitMessage = res.body?.message;
      break;
    }
  }

  assert(triggered429, "Rate limiter triggers HTTP 429 after exceeding max failed login attempts");
  assert(!!retryAfterHeader, `HTTP 429 response includes Retry-After header: ${retryAfterHeader}`);
  assert(rateLimitLimit === "25", `HTTP 429 response includes RateLimit-Limit header: ${rateLimitLimit}`);
  assert(
    rateLimitMessage && rateLimitMessage.includes("Too many login attempts"),
    `HTTP 429 returns dedicated login message (not general API message): "${rateLimitMessage}"`
  );
  assert(
    typeof retryAfterJson === "number" && retryAfterJson > 0,
    `HTTP 429 returns structured retryAfter in JSON response body: ${retryAfterJson}`
  );

  // =========================================================================
  // SUITE 4: General API Rate Limiter Decoupling
  // =========================================================================
  console.log("\n--- SUITE 4: General API Rate Limiter Decoupling ---");

  // Verify that /api/academic/divisions and /api/stats/counts are accessible
  const divRes = await request("GET", "/api/academic/divisions");
  assert(divRes.status === 200, "Unauthenticated public endpoint /api/academic/divisions returns 200");

  const statsRes = await request("GET", "/api/stats/counts");
  assert(statsRes.status === 200, "Unauthenticated public endpoint /api/stats/counts returns 200");

  // =========================================================================
  // SUITE 5: Protected Endpoints Security
  // =========================================================================
  console.log("\n--- SUITE 5: Protected Endpoints Security ---");

  const unauthMigrate = await request("POST", "/api/users/migrate", {});
  assert(unauthMigrate.status === 401, "Protected /api/users/migrate strictly requires authentication (401)");

  const unauthTimetable = await request("POST", "/api/timetable/sync", {});
  assert(unauthTimetable.status === 401, "Protected /api/timetable/sync strictly requires authentication (401)");

  // Clean up test student
  await User.deleteMany({ username: testStudentUser });
  console.log("\n✓ Cleaned up test user data");

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log("\n====================================================================");
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED (TOTAL: ${passedCount + failedCount})`);
  console.log("====================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
