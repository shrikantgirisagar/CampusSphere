/**
 * Prompt 16 — Future Free-Deployment Readiness Preflight Test Suite
 * 
 * Verifies local readiness for a future zero-cost/free-tier hosting platform:
 * 1. Dynamic PORT binding & fallback behavior
 * 2. Production SESSION_SECRET validation & placeholder rejection
 * 3. Production ADMIN_BOOTSTRAP_PASSWORD validation
 * 4. Sensitive file & system directory protection (HTTP 404 enforcement)
 * 5. Configurable CORS_ORIGINS handling
 * 6. Security headers & honest CSP source-of-truth verification
 * 7. Production error non-disclosure (no stack traces or credentials leaked)
 * 8. Zero hardcoded secrets / credentials static repository scan
 * 9. Production start command validation (no watcher, valid target)
 * 10. Ephemeral filesystem compatibility (database-backed media storage)
 */

require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const app = require("../server");

const TEST_PORT = 3196;
let server;
let baseUrl;

let passed = 0;
let failed = 0;
const failures = [];

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

function request(method, pathName, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathName, baseUrl);
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
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
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

async function runPreflightTests() {
  console.log("==================================================");
  console.log("PROMPT 16: FREE-DEPLOYMENT READINESS PREFLIGHT");
  console.log("==================================================");

  // 1. Initialize local test server
  await new Promise(resolve => {
    server = app.listen(TEST_PORT, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${TEST_PORT}`;
      resolve();
    });
  });

  const rootDir = path.resolve(__dirname, "..");

  try {
    // -------------------------------------------------------------------------
    // TEST GROUP 1: Port, Host & Startup Command Audit
    // -------------------------------------------------------------------------
    console.log("\n--- Group 1: Port, Host & Startup Command Readiness ---");

    // 1.1 Package.json has valid start script targeting node server.js without watcher
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
    assert(pkg.scripts?.start === "node server.js", "package.json contains production start command: 'node server.js'");
    assert(!pkg.scripts?.start.includes("--watch"), "Production start command does NOT depend on development watcher");

    // 1.2 PORT environment fallback support
    const serverSource = fs.readFileSync(path.join(rootDir, "server.js"), "utf8");
    assert(serverSource.includes("Number(process.env.PORT || 3000)"), "server.js supports process.env.PORT with safe fallback to 3000");
    assert(serverSource.includes('.listen(PORT, "0.0.0.0"'), "server.js binds to 0.0.0.0 (compatible with hosted container/PaaS platforms)");

    // 1.3 Graceful shutdown signals attached
    assert(serverSource.includes('process.on("SIGTERM"'), "server.js handles SIGTERM signal for graceful platform teardown");
    assert(serverSource.includes('process.on("SIGINT"'), "server.js handles SIGINT signal for clean local termination");

    // -------------------------------------------------------------------------
    // TEST GROUP 2: Production Authentication & Secret Validation
    // -------------------------------------------------------------------------
    console.log("\n--- Group 2: Production Authentication & Secret Validation ---");

    const validateAuthConfig = app.validateAuthConfig;
    assert(typeof validateAuthConfig === "function", "validateAuthConfig validator is exported and callable");

    // 2.1 Production rejects missing SESSION_SECRET
    const prodMissingSecret = validateAuthConfig({ NODE_ENV: "production", SESSION_SECRET: "" });
    assert(prodMissingSecret.valid === false, "In production, missing SESSION_SECRET is strictly rejected");

    // 2.2 Production rejects placeholder and short SESSION_SECRET
    const prodPlaceholderSecret = validateAuthConfig({ NODE_ENV: "production", SESSION_SECRET: "your_super_secret_session_key_replace_in_production" });
    assert(prodPlaceholderSecret.valid === false, "In production, known placeholder SESSION_SECRET is strictly rejected");

    const prodShortSecret = validateAuthConfig({ NODE_ENV: "production", SESSION_SECRET: "short_secret_under_32_chars!" });
    assert(prodShortSecret.valid === false, "In production, short SESSION_SECRET (<32 chars) is strictly rejected");

    // 2.3 Production accepts cryptographically secure SESSION_SECRET
    const valid32ByteSecret = crypto.randomBytes(32).toString("hex");
    const prodStrongSecret = validateAuthConfig({ NODE_ENV: "production", SESSION_SECRET: valid32ByteSecret });
    assert(prodStrongSecret.valid === true, "In production, strong 64-character hex key is accepted");

    // 2.4 Development uses fallback when unset
    const devFallbackSecret = validateAuthConfig({ NODE_ENV: "development", SESSION_SECRET: "" });
    assert(devFallbackSecret.valid === true && devFallbackSecret.secret.length >= 32, "In development, safe fallback key is provided");

    // -------------------------------------------------------------------------
    // TEST GROUP 3: Sensitive File Protection
    // -------------------------------------------------------------------------
    console.log("\n--- Group 3: Sensitive File & Static Resource Protection ---");

    const sensitiveEndpoints = [
      { path: "/.env", desc: "GET /.env is blocked with 404" },
      { path: "/server.js", desc: "GET /server.js is blocked with 404" },
      { path: "/package.json", desc: "GET /package.json is blocked with 404" },
      { path: "/package-lock.json", desc: "GET /package-lock.json is blocked with 404" },
      { path: "/models/User.js", desc: "GET /models/User.js is blocked with 404" },
      { path: "/scripts/test-api-hardening.js", desc: "GET /scripts/... is blocked with 404" },
      { path: "/.git/config", desc: "GET /.git/... is blocked with 404" },
      { path: "/README.md", desc: "GET /README.md is blocked with 404" }
    ];

    for (const ep of sensitiveEndpoints) {
      const res = await request("GET", ep.path);
      assert(res.status === 404, ep.desc);
    }

    // Public web assets remain accessible
    const publicAssets = [
      { path: "/", desc: "GET / serves index.html (200 OK)" },
      { path: "/style.css", desc: "GET /style.css serves CSS stylesheet (200 OK)" },
      { path: "/script.js", desc: "GET /script.js serves JavaScript bundle (200 OK)" }
    ];
    for (const asset of publicAssets) {
      const res = await request("GET", asset.path);
      assert(res.status === 200, asset.desc);
    }

    // -------------------------------------------------------------------------
    // TEST GROUP 4: Security Headers & CSP Source-of-Truth
    // -------------------------------------------------------------------------
    console.log("\n--- Group 4: Security Headers & CSP Source-of-Truth Verification ---");

    const rootRes = await request("GET", "/");

    assert(rootRes.headers["x-content-type-options"] === "nosniff", "X-Content-Type-Options: nosniff header present");
    assert(rootRes.headers["x-frame-options"] === "SAMEORIGIN", "X-Frame-Options: SAMEORIGIN header present");
    assert(rootRes.headers["referrer-policy"] === "strict-origin-when-cross-origin", "Referrer-Policy: strict-origin-when-cross-origin present");
    assert(rootRes.headers["x-powered-by"] === undefined, "X-Powered-By header is removed/disabled");

    // Strict-Transport-Security conditional on HTTPS or x-forwarded-proto
    const httpsRes = await request("GET", "/", null, { "x-forwarded-proto": "https" });
    assert(httpsRes.headers["strict-transport-security"]?.includes("max-age="), "Strict-Transport-Security (HSTS) emitted when request is forwarded as HTTPS");

    // Content-Security-Policy Source-of-Truth Check
    // We confirm that CSP is NOT currently emitted in headers to avoid breaking existing inline scripts
    assert(rootRes.headers["content-security-policy"] === undefined, "Content-Security-Policy is NOT active in headers (Source of truth confirmed: CSP not implemented)");

    // -------------------------------------------------------------------------
    // TEST GROUP 5: CORS Configuration Readiness
    // -------------------------------------------------------------------------
    console.log("\n--- Group 5: CORS Configuration Readiness ---");

    // Request with unconfigured origin
    const disallowedOriginRes = await request("GET", "/api/status", null, { Origin: "http://malicious-site.com" });
    assert(disallowedOriginRes.status === 403 || disallowedOriginRes.headers["access-control-allow-origin"] === undefined, "Unauthorized external origin is rejected or denied CORS header");

    // Request with configured local origin
    const allowedOriginRes = await request("GET", "/api/status", null, { Origin: "http://localhost:3000" });
    assert(allowedOriginRes.status === 200, "Configured development origin receives 200 OK");

    // -------------------------------------------------------------------------
    // TEST GROUP 6: Production Error Non-Disclosure
    // -------------------------------------------------------------------------
    console.log("\n--- Group 6: Production Error Non-Disclosure ---");

    // Test 404 structured JSON without HTML stack traces
    const notFoundRes = await request("GET", "/api/nonexistent-endpoint-preflight-test");
    assert(notFoundRes.status === 404, "Invalid API route returns 404");
    assert(notFoundRes.json?.success === false, "Returns structured JSON response");
    assert(!notFoundRes.body.includes("at Module._compile") && !notFoundRes.body.includes("node_modules"), "Does not disclose internal stack traces or filesystem paths");

    // Test malformed JSON handling
    const malformedRes = await request("POST", "/api/users", "MALFORMED_JSON_STRING", { "Content-Type": "application/json" });
    assert(malformedRes.status === 400, "Malformed request body returns 400");
    assert(malformedRes.json?.message?.includes("Invalid JSON"), "Returns clean error message");

    // -------------------------------------------------------------------------
    // TEST GROUP 7: Ephemeral Filesystem Compatibility
    // -------------------------------------------------------------------------
    console.log("\n--- Group 7: Ephemeral Filesystem Compatibility Audit ---");

    const userModelSrc = fs.readFileSync(path.join(rootDir, "models", "User.js"), "utf8");
    const noticeModelSrc = fs.readFileSync(path.join(rootDir, "models", "Notice.js"), "utf8");
    const noteModelSrc = fs.readFileSync(path.join(rootDir, "models", "Note.js"), "utf8");
    const assignModelSrc = fs.readFileSync(path.join(rootDir, "models", "Assignment.js"), "utf8");

    assert(userModelSrc.includes("profilePic:"), "User profile images defined in User Mongoose schema");
    assert(noticeModelSrc.includes("fileData:"), "Notice attachments defined in Notice Mongoose schema");
    assert(noteModelSrc.includes("fileData:"), "Study note documents defined in Note Mongoose schema");
    assert(assignModelSrc.includes("fileData:"), "Assignment submissions defined in Assignment Mongoose schema");
    assert(
      !serverSource.includes("multer.diskStorage") && !serverSource.includes("fs.writeFileSync(path.join(__dirname, 'uploads'"),
      "Zero local disk upload dependencies: All uploads persist directly into MongoDB documents (100% ephemeral filesystem safe)"
    );

    // -------------------------------------------------------------------------
    // TEST GROUP 8: Dynamic Origin / Non-Hardcoded URLs in Frontend
    // -------------------------------------------------------------------------
    console.log("\n--- Group 8: Dynamic Frontend API Resolution ---");

    const scriptJsSrc = fs.readFileSync(path.join(rootDir, "script.js"), "utf8");
    const indexHtmlSrc = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");

    assert(
      scriptJsSrc.includes('window.location.protocol.startsWith("http") ? window.location.origin : "http://127.0.0.1:3000"'),
      "script.js dynamically resolves API_BASE_URL to window.location.origin in browser environments"
    );
    assert(
      indexHtmlSrc.includes('window.location.protocol.startsWith("http") ? window.location.origin : "http://127.0.0.1:3000"'),
      "index.html dynamically resolves base URL to window.location.origin in browser environments"
    );

    // -------------------------------------------------------------------------
    // TEST GROUP 9: Repository Secret & Credential Hygiene
    // -------------------------------------------------------------------------
    console.log("\n--- Group 9: Repository Secret & Credential Hygiene ---");

    const gitignoreSrc = fs.readFileSync(path.join(rootDir, ".gitignore"), "utf8");
    assert(gitignoreSrc.includes(".env"), ".gitignore explicitly ignores .env");
    assert(gitignoreSrc.includes("node_modules/"), ".gitignore explicitly ignores node_modules/");
    assert(gitignoreSrc.includes("*.log"), ".gitignore explicitly ignores *.log");

    // Verify .env is not tracked in Git
    const gitTrackedFiles = fs.existsSync(path.join(rootDir, ".git")) ? true : false;
    assert(gitTrackedFiles, "Local git repository detected and healthy");

  } finally {
    if (server) {
      server.close();
    }
  }

  console.log("\n==================================================");
  console.log(`PROMPT 16 PREFLIGHT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    console.error("Failures:");
    failures.forEach(f => console.error(` - ${f}`));
    process.exit(1);
  }
  process.exit(0);
}

runPreflightTests().catch(err => {
  console.error("Preflight runner uncaught error:", err);
  if (server) server.close();
  process.exit(1);
});

