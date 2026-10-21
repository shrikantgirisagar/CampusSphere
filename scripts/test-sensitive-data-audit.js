// scripts/test-sensitive-data-audit.js
// Regression and Integrity Test Suite for Sensitive Data Audit & Safe Remediation

require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const crypto = require("crypto");
const { spawn } = require("child_process");

const TEST_PORT = 3105;
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

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function run() {
  console.log("==================================================================");
  console.log("CAMPUSSPHERE SENSITIVE DATA AUDIT & REMEDIATION INTEGRITY SUITE");
  console.log("==================================================================\n");

  const rootDir = path.resolve(__dirname, "..");
  const DATA_DIR = path.join(rootDir, "data");
  const DB_FILE = path.join(DATA_DIR, "database.json");
  const USERS_FILE = path.join(DATA_DIR, "users.json");
  const SANITIZED_DIR = path.join(DATA_DIR, "sanitized");
  const SANITIZED_DB = path.join(SANITIZED_DIR, "database.json");
  const SANITIZED_USERS = path.join(SANITIZED_DIR, "users.json");

  // 1. Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "CampusSphere", serverSelectionTimeoutMS: 10000 });
  const User = require("../models/User");
  const fileSyncService = require("../services/fileSyncService");

  // Ensure files reflect authoritative MongoDB state
  await fileSyncService.syncFromMongoToFiles();

  // --- SECTION 1: MongoDB & Operational Files Integrity ---
  console.log("--- SECTION 1: MongoDB & Operational File Integrity ---");
  const mongoUsers = await User.find({}).lean();
  const mongoCount = mongoUsers.length;
  assert(mongoCount >= 52, `MongoDB user records intact (${mongoCount} accounts)`);

  const opUsers = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  assert(Array.isArray(opUsers) && opUsers.length === mongoCount,
    `Operational data/users.json matches MongoDB count exactly (${opUsers.length} records)`);

  const opDb = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  assert(Array.isArray(opDb.users) && opDb.users.length === mongoCount,
    `Operational data/database.json matches MongoDB count exactly (${opDb.users.length} records)`);

  const opHasHash = opUsers.every(u => typeof u.passwordHash === "string");
  assert(opHasHash, "Operational files preserve password hashes for disaster recovery and migration");

  // --- SECTION 2: Sanitized Dataset Verification ---
  console.log("\n--- SECTION 2: Sanitized Dataset Isolation & Redaction ---");
  assert(fs.existsSync(SANITIZED_USERS), "data/sanitized/users.json exists on disk");
  assert(fs.existsSync(SANITIZED_DB), "data/sanitized/database.json exists on disk");

  const sanUsers = JSON.parse(fs.readFileSync(SANITIZED_USERS, "utf8"));
  const sanDb = JSON.parse(fs.readFileSync(SANITIZED_DB, "utf8"));

  assert(sanUsers.length === mongoCount, `Sanitized users count matches authoritative count (${sanUsers.length})`);
  assert(sanDb.users.length === mongoCount, `Sanitized database.json count matches authoritative count (${sanDb.users.length})`);

  const sanUsersExposeHash = sanUsers.some(u => u.passwordHash !== undefined || u.password !== undefined || u.token !== undefined);
  assert(!sanUsersExposeHash, "Sanitized data/sanitized/users.json has ZERO passwordHash, password, or token fields");

  const sanDbExposeHash = sanDb.users.some(u => u.passwordHash !== undefined || u.password !== undefined || u.token !== undefined);
  assert(!sanDbExposeHash, "Sanitized data/sanitized/database.json has ZERO passwordHash, password, or token fields");

  // --- SECTION 3: Safe File Writing & Temp File Cleanup ---
  console.log("\n--- SECTION 3: Safe File Writing & Temp File Handling ---");
  assert(typeof fileSyncService.sanitizeUserForExport === "function", "sanitizeUserForExport helper is exported");
  assert(typeof fileSyncService.syncFromMongoToFiles === "function", "syncFromMongoToFiles is exported");
  assert(typeof fileSyncService.triggerSync === "function", "triggerSync is exported");

  // Trigger sync and verify zero new orphaned tmp files
  await fileSyncService.syncFromMongoToFiles();
  const tmpFiles = fs.readdirSync(DATA_DIR).filter(f => f.startsWith("users.json.tmp.") && Date.now() - fs.statSync(path.join(DATA_DIR, f)).mtimeMs < 10000);
  assert(tmpFiles.length === 0, "No orphaned temporary files left after file synchronization");

  // --- SECTION 4: Backup Verification ---
  console.log("\n--- SECTION 4: Backup Integrity Verification ---");
  const backupsDir = path.join(rootDir, "backups");
  assert(fs.existsSync(backupsDir), "Backups directory exists");
  const backupFolders = fs.readdirSync(backupsDir).filter(f => f.startsWith("backup_"));
  assert(backupFolders.length > 0, `At least one timestamped backup snapshot exists (${backupFolders[0]})`);
  const sampleBackup = path.join(backupsDir, backupFolders[0]);
  assert(fs.existsSync(path.join(sampleBackup, "services", "fileSyncService.js")), "Backup contains services/fileSyncService.js");
  assert(fs.existsSync(path.join(sampleBackup, ".gitignore")), "Backup contains .gitignore");
  assert(fs.existsSync(path.join(sampleBackup, "data", "users.json")), "Backup contains data/users.json");
  assert(fs.existsSync(path.join(sampleBackup, "data", "database.json")), "Backup contains data/database.json");

  // --- SECTION 5: Start Server & Test Authentication Regression ---
  console.log("\n--- SECTION 5: Authentication & API Redaction Regressions ---");
  const serverProc = spawn("node", ["server.js"], {
    cwd: rootDir,
    env: { ...process.env, PORT: String(TEST_PORT) },
    stdio: "pipe"
  });

  serverProc.stderr.on("data", d => {
    const s = d.toString();
    if (s.includes("Error")) console.error("Server stderr:", s);
  });

  let online = false;
  for (let i = 0; i < 30; i++) {
    await wait(500);
    try {
      const res = await request("GET", "/api/status");
      if (res.status === 200 && res.body?.success) {
        online = true;
        break;
      }
    } catch (_) {}
  }
  assert(online, "Server booted and responsive on test port");

  try {
    const { promisify } = require("util");
    const scryptAsync = promisify(crypto.scrypt);
    const salt = crypto.randomBytes(16);
    const testPassword = "AuditPassword123!";
    const derived = await scryptAsync(testPassword, salt, 64, { N: 16384, r: 8, p: 1 });
    const hashedPwd = `scrypt$16384$8$1$${salt.toString("base64url")}$${Buffer.from(derived).toString("base64url")}`;

    const timestamp = Date.now();
    const adminUsername = `adm_audit_${timestamp}`;
    const facultyUsername = `fac_audit_${timestamp}`;
    const studentUsername = `stu_audit_${timestamp}`;

    await User.create([
      {
        id: `id-${adminUsername}`,
        role: "admin",
        username: adminUsername,
        name: "Audit Test Admin",
        email: `${adminUsername}@audit.edu`,
        passwordHash: hashedPwd
      },
      {
        id: `id-${facultyUsername}`,
        role: "faculty",
        username: facultyUsername,
        name: "Audit Test Faculty",
        email: `${facultyUsername}@audit.edu`,
        passwordHash: hashedPwd,
        subject: "cs_security",
        subjects: ["cs_security"]
      }
    ]);

    // 1. Admin login
    const adminLogin = await request("POST", "/api/auth/login", { role: "admin", username: adminUsername, password: testPassword });
    assert(adminLogin.status === 200 && adminLogin.body?.token, "Admin authenticates successfully with preserved password hash");
    assert(adminLogin.body?.user && adminLogin.body.user.passwordHash === undefined, "Admin login response strictly redacts passwordHash");

    // 2. Faculty login
    const facultyLogin = await request("POST", "/api/auth/login", { role: "faculty", username: facultyUsername, password: testPassword });
    assert(facultyLogin.status === 200 && facultyLogin.body?.token, "Faculty authenticates successfully with preserved password hash");
    assert(facultyLogin.body?.user && facultyLogin.body.user.passwordHash === undefined, "Faculty login response strictly redacts passwordHash");

    // 3. Student public registration (POST /api/users) & authentication
    const regRes = await request("POST", "/api/users", {
      name: "Registration Test Student",
      username: studentUsername,
      email: `${studentUsername}@audit.edu`,
      password: testPassword,
      role: "student",
      courseYear: "1st Year",
      semester: "1st Semester",
      division: "Div A"
    });
    assert(regRes.status === 201, "Student self-registration succeeds with HTTP 201");

    const studLogin = await request("POST", "/api/auth/login", { role: "student", username: studentUsername, password: testPassword });
    assert(studLogin.status === 200 && studLogin.body?.token, "Newly registered student authenticates successfully");
    assert(studLogin.body?.user && studLogin.body.user.passwordHash === undefined, "Student login response strictly redacts passwordHash");

    // 4. User profile endpoint redacts passwordHash
    const getProfile = await request("GET", `/api/users/student/${studentUsername}`, null, studLogin.body.token);
    assert(getProfile.status === 200 && getProfile.body?.user?.passwordHash === undefined, "GET /api/users/student/:username strictly redacts passwordHash");

    // 5. Static file access to data and backups blocked with 404
    const dataAccess = await request("GET", "/data/users.json");
    assert(dataAccess.status === 404, "Static HTTP access to /data/users.json strictly blocked (HTTP 404)");

    const backupAccess = await request("GET", `/backups/${backupFolders[0]}/data/users.json`);
    assert(backupAccess.status === 404, "Static HTTP access to /backups strictly blocked (HTTP 404)");

    // Clean up test accounts
    await User.deleteMany({ username: { $in: [adminUsername, facultyUsername, studentUsername] } });
    await fileSyncService.syncFromMongoToFiles();
  } finally {
    serverProc.kill();
    await mongoose.disconnect();
  }

  console.log("\n==================================================================");
  console.log(`AUDIT TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("==================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
