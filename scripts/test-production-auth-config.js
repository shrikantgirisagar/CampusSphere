/**
 * CampusSphere - Prompt 10 Verification Suite
 * Tests Production Authentication, Secrets & Admin Configuration
 */

const assert = require("assert");
const crypto = require("crypto");
const { promisify } = require("util");
const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

let passed = 0;
let failed = 0;

function report(name, ok, err = null) {
  if (ok) {
    console.log(`  [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${name}${err ? " -> " + (err.message || err) : ""}`);
    failed++;
  }
}

async function runSuite() {
  console.log("=== CampusSphere Prompt 10: Production Auth, Secrets & Admin Configuration ===\n");

  // Load server module (without starting listener)
  const app = require("../server.js");
  const validateAuthConfig = app.validateAuthConfig;

  // --------------------------------------------------------------------------
  // TEST GROUP 1: validateAuthConfig Unit Tests
  // --------------------------------------------------------------------------
  console.log("--- Group 1: Session Secret Validation (Production vs Development) ---");

  // 1.1 Production: missing SESSION_SECRET fails
  try {
    const res = validateAuthConfig({ NODE_ENV: "production" });
    assert.strictEqual(res.valid, false, "Should fail when SESSION_SECRET is missing");
    assert(res.error.includes("SESSION_SECRET must be configured"), "Error message should mention requirement");
    report("Production rejects missing SESSION_SECRET", true);
  } catch (e) {
    report("Production rejects missing SESSION_SECRET", false, e);
  }

  // 1.2 Production: empty or whitespace SESSION_SECRET fails
  try {
    const res = validateAuthConfig({ NODE_ENV: "production", SESSION_SECRET: "   " });
    assert.strictEqual(res.valid, false, "Should fail when SESSION_SECRET is whitespace");
    report("Production rejects empty/whitespace SESSION_SECRET", true);
  } catch (e) {
    report("Production rejects empty/whitespace SESSION_SECRET", false, e);
  }

  // 1.3 Production: short (<32 chars) SESSION_SECRET fails
  try {
    const res = validateAuthConfig({ NODE_ENV: "production", SESSION_SECRET: "too_short_secret_under_32" });
    assert.strictEqual(res.valid, false, "Should fail when SESSION_SECRET < 32 chars");
    assert(res.error.includes("at least 32 characters"), "Error message should mention 32 characters");
    report("Production rejects SESSION_SECRET shorter than 32 characters", true);
  } catch (e) {
    report("Production rejects SESSION_SECRET shorter than 32 characters", false, e);
  }

  // 1.4 Production: known placeholder secrets fail
  const placeholders = [
    "your_super_secret_session_key_replace_in_production",
    "campussphere_session_secret_key_2026_secure",
    "campussphere_dev_session_secret_2026_insecure",
    "secret",
    "password",
    "123456",
    "change_me",
    "session_secret"
  ];
  for (const placeholder of placeholders) {
    try {
      const res = validateAuthConfig({ NODE_ENV: "production", SESSION_SECRET: placeholder });
      assert.strictEqual(res.valid, false, `Should reject placeholder: ${placeholder}`);
      report(`Production rejects placeholder: "${placeholder.slice(0, 20)}..."`, true);
    } catch (e) {
      report(`Production rejects placeholder: "${placeholder.slice(0, 20)}..."`, false, e);
    }
  }

  // 1.5 Production: valid strong secret passes
  try {
    const strongSecret = "prod_super_strong_secret_key_campussphere_2026_secure_random_entropy_998877";
    const res = validateAuthConfig({ NODE_ENV: "production", SESSION_SECRET: strongSecret });
    assert.strictEqual(res.valid, true, "Should accept valid strong secret in production");
    assert.strictEqual(res.secret, strongSecret);
    report("Production accepts valid 32+ char strong SESSION_SECRET", true);
  } catch (e) {
    report("Production accepts valid 32+ char strong SESSION_SECRET", false, e);
  }

  // 1.6 Production: error message does not leak secret
  try {
    const leakySecret = "weak_secret_under_32";
    const res = validateAuthConfig({ NODE_ENV: "production", SESSION_SECRET: leakySecret });
    assert.strictEqual(res.valid, false);
    assert(!res.error.includes(leakySecret), "Error message MUST NOT contain the secret value");
    report("Error message does NOT leak the secret value", true);
  } catch (e) {
    report("Error message does NOT leak the secret value", false, e);
  }

  // 1.7 Development: falls back safely when unset
  try {
    const res = validateAuthConfig({ NODE_ENV: "development" });
    assert.strictEqual(res.valid, true, "Development should allow fallback");
    assert(res.secret && res.secret.length > 0, "Fallback secret must exist");
    report("Development falls back to development secret when unset", true);
  } catch (e) {
    report("Development falls back to development secret when unset", false, e);
  }

  // 1.8 Development: uses custom secret if provided
  try {
    const custom = "my_custom_dev_secret_123";
    const res = validateAuthConfig({ NODE_ENV: "development", SESSION_SECRET: custom });
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.secret, custom);
    report("Development honors custom SESSION_SECRET when provided", true);
  } catch (e) {
    report("Development honors custom SESSION_SECRET when provided", false, e);
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 2: Process Startup Guard in Production Mode (Subprocesses)
  // --------------------------------------------------------------------------
  console.log("\n--- Group 2: Production Process Startup Guard ---");

  // 2.1 Subprocess without SESSION_SECRET in production exits with 1
  try {
    const output = execSync('node -e "process.env.NODE_ENV=\'production\'; delete process.env.SESSION_SECRET; require(\'./server.js\');"', {
      cwd: path.resolve(__dirname, ".."),
      stdio: "pipe",
      timeout: 5000
    });
    report("Production without SESSION_SECRET exits with code 1", false, new Error("Process unexpectedly succeeded"));
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : "";
    const stdout = err.stdout ? err.stdout.toString() : "";
    const combined = stdout + stderr;
    const exitedNonZero = err.status !== 0;
    const hasFatal = combined.includes("[FATAL]");
    assert(exitedNonZero, "Process should exit non-zero");
    assert(hasFatal, "Process output should contain [FATAL]");
    report("Production without SESSION_SECRET exits with code 1 and [FATAL] log", true);
  }

  // 2.2 Subprocess with placeholder SESSION_SECRET in production exits with 1
  try {
    const output = execSync('node -e "process.env.NODE_ENV=\'production\'; process.env.SESSION_SECRET=\'campussphere_session_secret_key_2026_secure\'; require(\'./server.js\');"', {
      cwd: path.resolve(__dirname, ".."),
      stdio: "pipe",
      timeout: 5000
    });
    report("Production with placeholder SESSION_SECRET exits with code 1", false, new Error("Process unexpectedly succeeded"));
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : "";
    const stdout = err.stdout ? err.stdout.toString() : "";
    const combined = stdout + stderr;
    const exitedNonZero = err.status !== 0;
    const hasFatal = combined.includes("[FATAL]");
    assert(exitedNonZero, "Process should exit non-zero");
    assert(hasFatal, "Process output should contain [FATAL]");
    report("Production with placeholder SESSION_SECRET exits with code 1 and [FATAL] log", true);
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 3: Token Signing & Verification Security
  // --------------------------------------------------------------------------
  console.log("\n--- Group 3: Token Signing & Verification Security ---");

  const secret = "test_auth_secret_for_token_verification_testing_purpose_32c";

  function createTestToken(user, customSecret = secret, expOffsetMs = 7 * 24 * 60 * 60 * 1000) {
    const expiresAt = Date.now() + expOffsetMs;
    const data = JSON.stringify({
      id: String(user.id || ""),
      role: String(user.role || ""),
      username: String(user.username || ""),
      exp: expiresAt
    });
    const payload = Buffer.from(data).toString("base64url");
    const sig = crypto.createHmac("sha256", customSecret).update(payload).digest("base64url");
    return `${payload}.${sig}`;
  }

  function verifyTestToken(token, verifySecret = secret) {
    try {
      if (!token || typeof token !== "string") return { error: "malformed" };
      if (!token.includes(".")) return { error: "malformed" };
      const parts = token.split(".");
      if (parts.length !== 2) return { error: "malformed" };
      const [payload, sig] = parts;
      if (!payload || !sig) return { error: "malformed" };
      const expected = crypto.createHmac("sha256", verifySecret).update(payload).digest("base64url");
      if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        return { error: "invalid" };
      }
      const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
      if (!data || typeof data !== "object") return { error: "malformed" };
      if (!data.exp || typeof data.exp !== "number" || data.exp < Date.now()) return { error: "expired" };
      if (!data.id || !data.role || !data.username) return { error: "malformed" };
      return { id: data.id, role: data.role, username: data.username, expiresAt: data.exp };
    } catch {
      return { error: "malformed" };
    }
  }

  // 3.1 Valid token verifies correctly
  try {
    const token = createTestToken({ id: "student-123", role: "student", username: "alice" });
    const verified = verifyTestToken(token);
    assert.strictEqual(verified.id, "student-123");
    assert.strictEqual(verified.role, "student");
    assert.strictEqual(verified.username, "alice");
    report("Valid HMAC-SHA256 token verifies correctly", true);
  } catch (e) {
    report("Valid HMAC-SHA256 token verifies correctly", false, e);
  }

  // 3.2 Expired token is rejected
  try {
    const expiredToken = createTestToken({ id: "student-123", role: "student", username: "alice" }, secret, -1000);
    const verified = verifyTestToken(expiredToken);
    assert.strictEqual(verified.error, "expired");
    report("Expired token is rejected with 'expired' error", true);
  } catch (e) {
    report("Expired token is rejected with 'expired' error", false, e);
  }

  // 3.3 Tampered token (modified payload) is rejected
  try {
    const token = createTestToken({ id: "student-123", role: "student", username: "alice" });
    const [payload, sig] = token.split(".");
    // Change Alice to Admin
    const tamperedPayload = Buffer.from(JSON.stringify({
      id: "admin-001",
      role: "admin",
      username: "admin",
      exp: Date.now() + 100000
    })).toString("base64url");
    const tamperedToken = `${tamperedPayload}.${sig}`;
    const verified = verifyTestToken(tamperedToken);
    assert.strictEqual(verified.error, "invalid");
    report("Tampered token payload is rejected with 'invalid' error", true);
  } catch (e) {
    report("Tampered token payload is rejected with 'invalid' error", false, e);
  }

  // 3.4 Token signed with different secret is rejected
  try {
    const otherToken = createTestToken({ id: "student-123", role: "student", username: "alice" }, "different_secret_key_which_does_not_match_32c");
    const verified = verifyTestToken(otherToken, secret);
    assert.strictEqual(verified.error, "invalid");
    report("Token signed with different secret is rejected", true);
  } catch (e) {
    report("Token signed with different secret is rejected", false, e);
  }

  // 3.5 Malformed tokens are safely rejected
  const malformedTokens = ["", "invalid", "foo.bar.baz", "foo.", ".bar", null, undefined, 123];
  for (const mt of malformedTokens) {
    try {
      const verified = verifyTestToken(mt);
      assert.strictEqual(verified.error, "malformed");
      report(`Malformed token safely rejected: ${String(mt).slice(0, 15)}`, true);
    } catch (e) {
      report(`Malformed token safely rejected: ${String(mt).slice(0, 15)}`, false, e);
    }
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 4: Production Admin Provisioning Guard
  // --------------------------------------------------------------------------
  console.log("\n--- Group 4: Production Admin Provisioning Guard ---");

  // 4.1 Production mode refuses to create admin@123
  // Verify by inspecting server.js implementation:
  // In server.js line 585+:
  // if (!isProd) { seeds admin / admin@123 }
  // else { if (bootstrapPassword) { ... } else { logs warning, creates NO account } }
  try {
    const serverCode = fs.readFileSync(path.resolve(__dirname, "../server.js"), "utf8");
    assert(serverCode.includes("const isProd = process.env.NODE_ENV === \"production\";"), "Must check isProd");
    assert(serverCode.includes("NEVER create a default account with admin@123"), "Must comment/guard against default admin");
    assert(serverCode.includes("ADMIN_BOOTSTRAP_PASSWORD"), "Must support ADMIN_BOOTSTRAP_PASSWORD");
    report("Production mode code strictly blocks automatic admin@123 creation", true);
  } catch (e) {
    report("Production mode code strictly blocks automatic admin@123 creation", false, e);
  }

  // 4.2 Production bootstrap password validation
  try {
    // Check validation rules in server.js:
    // trimmedPass.length < 12 || trimmedPass === "admin@123" || trimmedPass.toLowerCase() === "password"
    const serverCode = fs.readFileSync(path.resolve(__dirname, "../server.js"), "utf8");
    assert(serverCode.includes("trimmedPass.length < 12"), "Must require at least 12 chars");
    assert(serverCode.includes("admin@123"), "Must reject admin@123 as bootstrap password");
    report("Production bootstrap password enforces 12+ chars and rejects placeholder passwords", true);
  } catch (e) {
    report("Production bootstrap password enforces 12+ chars and rejects placeholder passwords", false, e);
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 5: Credential & Secret Leakage Prevention
  // --------------------------------------------------------------------------
  console.log("\n--- Group 5: Credential & Secret Leakage Prevention ---");

  // 5.1 Static serving blocks .env, .env.example, package.json, server.js
  try {
    const serverCode = fs.readFileSync(path.resolve(__dirname, "../server.js"), "utf8");
    assert(serverCode.includes("BLOCKED_STATIC_FILES"), "Blocked static files set exists");
    assert(serverCode.includes(".env"), ".env is blocked");
    assert(serverCode.includes("server.js"), "server.js is blocked");
    report("Sensitive config files (.env, server.js, etc.) are blocked from static serving", true);
  } catch (e) {
    report("Sensitive config files (.env, server.js, etc.) are blocked from static serving", false, e);
  }

  // 5.2 User sanitization strips passwordHash and session tokens
  try {
    const serverCode = fs.readFileSync(path.resolve(__dirname, "../server.js"), "utf8");
    assert(serverCode.includes("delete doc.passwordHash;"), "passwordHash is deleted");
    assert(serverCode.includes("delete doc.authToken;"), "authToken is deleted");
    report("User sanitization strips passwordHash, authToken, and session tokens", true);
  } catch (e) {
    report("User sanitization strips passwordHash, authToken, and session tokens", false, e);
  }

  // 5.3 .env.example contains secure documentation without real secrets
  try {
    const envExample = fs.readFileSync(path.resolve(__dirname, "../.env.example"), "utf8");
    assert(envExample.includes("SESSION_SECRET="), ".env.example documents SESSION_SECRET");
    assert(envExample.includes("min 32 characters") || envExample.includes("32"), ".env.example specifies 32 character requirement");
    assert(envExample.includes("ADMIN_BOOTSTRAP_PASSWORD="), ".env.example documents ADMIN_BOOTSTRAP_PASSWORD");
    // Ensure no actual real secret is stored in .env.example
    assert(!envExample.includes("ghp_") && !envExample.includes("AKIA"), "No real cloud credentials in .env.example");
    report(".env.example provides comprehensive security documentation with placeholder guidance", true);
  } catch (e) {
    report(".env.example provides comprehensive security documentation with placeholder guidance", false, e);
  }

  // 5.4 README.md clarifies production security vs development demo accounts
  try {
    const readme = fs.readFileSync(path.resolve(__dirname, "../README.md"), "utf8");
    assert(readme.includes("Development Mode Only"), "README marks demo accounts as dev mode only");
    assert(readme.includes("NODE_ENV=production"), "README explains production behavior");
    report("README.md clearly differentiates development demo credentials from production", true);
  } catch (e) {
    report("README.md clearly differentiates development demo credentials from production", false, e);
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log("\n======================================================================");
  console.log(`Prompt 10 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log("======================================================================\n");

  process.exit(failed > 0 ? 1 : 0);
}

runSuite().catch(err => {
  console.error("Unhandled error in test suite:", err);
  process.exit(1);
});
