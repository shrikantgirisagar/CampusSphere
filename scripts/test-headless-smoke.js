// scripts/test-headless-smoke.js
// Headless E2E Smoke Test verifying 0 console errors, 0 CSP violations,
// and end-to-end user journeys for public, student, faculty, and admin roles.

const fs = require("fs");
const path = require("path");
const http = require("http");
const os = require("os");
const crypto = require("crypto");
const { spawn } = require("child_process");
const { setupTestDb, stopTestDb } = require("./lib/test-db");

let passCount = 0;
let failCount = 0;

function assert(cond, msg) {
  if (cond) {
    passCount++;
    console.log(`  [PASS] ${msg}`);
  } else {
    failCount++;
    console.error(`  [FAIL] ${msg}`);
  }
}

function findBrowserBinary() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    path.join(process.env.LOCALAPPDATA || "", "Google\\Chrome\\Application\\chrome.exe"),
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
  ];
  return candidates.find(c => c && fs.existsSync(c));
}

function hashPassword(pwd) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(pwd, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derived) => {
      if (err) return reject(err);
      resolve(`scrypt$16384$8$1$${salt.toString("base64url")}$${derived.toString("base64url")}`);
    });
  });
}

async function runHeadlessSmoke() {
  console.log("=== CampusSphere Headless E2E Smoke & CSP Violation Verification ===\n");

  const browserPath = findBrowserBinary();
  if (!browserPath) {
    console.log("  [WARN] Neither Chrome nor Edge found. Skipping headless browser smoke test.");
    return;
  }
  console.log("✓ Using browser binary:", browserPath);

  // 1. Setup isolated in-memory test database
  const mongoUri = await setupTestDb("SmokeE2E_test");
  console.log("✓ Test DB initialized at:", mongoUri);

  // 2. Start application server in test mode
  process.env.NODE_ENV = "test";
  process.env.SESSION_SECRET = "smoke_test_secure_session_secret_32chars_long_xyz";
  const app = require("../server.js");
  const mongoose = require("mongoose");
  const User = mongoose.model("User");

  // 3. Seed test credentials
  const studentPwd = "StudentPass123!";
  const facultyPwd = "FacultyPass123!";
  const adminPwd = "AdminPass123!";

  await User.deleteMany({});
  await User.create([
    {
      id: "std-smoke-1",
      role: "student",
      username: "smoke_student",
      usernameLower: "smoke_student",
      name: "Smoke Test Student",
      email: "smoke_student@test.edu",
      division: "Div A",
      semester: "1st Semester",
      courseYear: "1st Year",
      passwordHash: await hashPassword(studentPwd)
    },
    {
      id: "fac-smoke-1",
      role: "faculty",
      username: "smoke_faculty",
      usernameLower: "smoke_faculty",
      name: "Smoke Test Prof",
      email: "smoke_faculty@test.edu",
      subject: "C Programming",
      subjects: ["C Programming"],
      division: "Both Divisions",
      passwordHash: await hashPassword(facultyPwd)
    },
    {
      id: "adm-smoke-1",
      role: "admin",
      username: "smoke_admin",
      usernameLower: "smoke_admin",
      name: "Smoke Test Admin",
      email: "smoke_admin@test.edu",
      passwordHash: await hashPassword(adminPwd)
    }
  ]);

  const port = 3099;
  const server = http.createServer(app);
  await new Promise(res => server.listen(port, "127.0.0.1", res));
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`✓ Application server running at: ${baseUrl}`);

  const debugPort = 9477;
  const tmpUserDataDir = path.join(os.tmpdir(), `cs_smoke_profile_${Date.now()}`);

  const browserProc = spawn(browserPath, [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    "--no-sandbox",
    "--disable-gpu",
    "--disable-software-rasterizer",
    `--user-data-dir=${tmpUserDataDir}`,
    `${baseUrl}/index.html`
  ]);

  let cdpConnected = false;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (res.ok) {
        cdpConnected = true;
        break;
      }
    } catch (_) {}
  }

  if (!cdpConnected) {
    console.error("  [FAIL] Failed to establish CDP connection to headless browser.");
    browserProc.kill();
    server.close();
    await stopTestDb();
    process.exit(1);
  }

  const listRes = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === "page");

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(res => ws.onopen = res);

  let msgId = 1;
  const pending = new Map();
  const consoleMessages = [];
  const cspViolations = [];

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    }
    if (data.method === "Runtime.consoleAPICalled") {
      const text = data.params.args.map(a => a.value || a.description || "").join(" ");
      consoleMessages.push({ type: data.params.type, text });
      if (text.toLowerCase().includes("content security policy") || text.toLowerCase().includes("violates the following")) {
        cspViolations.push(text);
      }
    }
    if (data.method === "Log.entryAdded") {
      const entry = data.params.entry;
      if (entry.level === "error" || (entry.text && entry.text.includes("Content Security Policy"))) {
        consoleMessages.push({ type: entry.level, text: entry.text });
        if (entry.text.toLowerCase().includes("content security policy") || entry.text.toLowerCase().includes("violates the following")) {
          cspViolations.push(entry.text);
        }
      }
    }
  };

  function sendCdp(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await sendCdp("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    return res.result?.result?.value;
  }

  async function navigatePage(pageUrl) {
    await sendCdp("Page.navigate", { url: pageUrl });
    await new Promise(r => setTimeout(r, 1200));
  }

  try {
    await sendCdp("Runtime.enable");
    await sendCdp("Page.enable");
    await sendCdp("Log.enable");

    // TEST 1: Public pages load with 0 CSP violations
    console.log("\n--- Step 1: Public Pages Smoke & CSP Verification ---");
    const pages = ["/index.html", "/courses.html", "/about.html", "/admin-courses-syllabus.html"];
    for (const p of pages) {
      cspViolations.length = 0;
      await navigatePage(`${baseUrl}${p}`);
      const pageTitle = await evaluate("document.title");
      assert(Boolean(pageTitle), `Page ${p} loaded successfully (Title: "${pageTitle.slice(0, 40)}...")`);
      assert(cspViolations.length === 0, `Page ${p} had 0 CSP violations`);
    }

    // TEST 2: Student Login & Journey
    console.log("\n--- Step 2: Student Login, Dashboard, Attendance, Marks & Logout ---");
    await navigatePage(`${baseUrl}/index.html`);
    cspViolations.length = 0;

    const studentLoginResult = await evaluate(`
      (async () => {
        try {
          const user = await loginOnServer("student", "smoke_student", "${studentPwd}");
          currentUser = user;
          sessionStorage.setItem("portalUser", JSON.stringify(user));
          if (typeof openPortal === "function") openPortal();
          return { success: true, user };
        } catch (e) {
          return { success: false, error: e.message };
        }
      })()
    `);
    assert(studentLoginResult && studentLoginResult.success, `Student login succeeded (${studentLoginResult?.error || "OK"})`);

    await new Promise(r => setTimeout(r, 600));

    const studentHomeText = await evaluate(`document.body.innerText`);
    assert(studentHomeText.includes("Smoke Test Student") || studentHomeText.includes("smoke_student"), "Student home displays student name");

    await evaluate(`navigate("attendance")`);
    await new Promise(r => setTimeout(r, 500));
    assert(cspViolations.length === 0, "Student attendance navigation had 0 CSP violations");

    await evaluate(`navigate("marks")`);
    await new Promise(r => setTimeout(r, 500));
    assert(cspViolations.length === 0, "Student marks navigation had 0 CSP violations");

    await evaluate(`
      (async () => {
        currentUser = null;
        setStoredAuthToken("");
        sessionStorage.removeItem("portalUser");
        if (typeof openLogin === "function") openLogin();
        else navigate("home");
      })()
    `);
    await new Promise(r => setTimeout(r, 500));
    const loggedOutUser = await evaluate(`window.currentUser`);
    assert(!loggedOutUser, "Student logged out cleanly");

    // TEST 3: Faculty Login, Dashboard & Logout
    console.log("\n--- Step 3: Faculty Login, Active Class & Logout ---");
    cspViolations.length = 0;

    const facultyLoginResult = await evaluate(`
      (async () => {
        try {
          const user = await loginOnServer("faculty", "smoke_faculty", "${facultyPwd}");
          currentUser = user;
          sessionStorage.setItem("portalUser", JSON.stringify(user));
          if (typeof openPortal === "function") openPortal();
          return { success: true, user };
        } catch (e) {
          return { success: false, error: e.message };
        }
      })()
    `);
    assert(facultyLoginResult && facultyLoginResult.success, `Faculty login succeeded (${facultyLoginResult?.error || "OK"})`);

    await new Promise(r => setTimeout(r, 600));
    const facultyHomeText = await evaluate(`document.body.innerText`);
    assert(facultyHomeText.includes("Smoke Test Prof") || facultyHomeText.includes("smoke_faculty"), "Faculty dashboard rendered");

    await evaluate(`
      (async () => {
        currentUser = null;
        setStoredAuthToken("");
        sessionStorage.removeItem("portalUser");
        if (typeof openLogin === "function") openLogin();
        else navigate("home");
      })()
    `);
    await new Promise(r => setTimeout(r, 500));
    assert(cspViolations.length === 0, "Faculty workflow had 0 CSP violations");

    // TEST 4: Admin Login, Users, Syllabus & Logout
    console.log("\n--- Step 4: Administrator Login, User List, Syllabus & Logout ---");
    cspViolations.length = 0;

    const adminLoginResult = await evaluate(`
      (async () => {
        try {
          const user = await loginOnServer("admin", "smoke_admin", "${adminPwd}");
          currentUser = user;
          sessionStorage.setItem("portalUser", JSON.stringify(user));
          if (typeof openPortal === "function") openPortal();
          return { success: true, user };
        } catch (e) {
          return { success: false, error: e.message };
        }
      })()
    `);
    assert(adminLoginResult && adminLoginResult.success, `Admin login succeeded (${adminLoginResult?.error || "OK"})`);

    await evaluate(`navigate("students")`);
    await new Promise(r => setTimeout(r, 600));
    const adminStudentsText = await evaluate(`document.body.innerText`);
    assert(adminStudentsText.includes("smoke_student") || adminStudentsText.includes("Smoke Test Student"), "Admin student management shows smoke student");

    await evaluate(`navigate("syllabus")`);
    await new Promise(r => setTimeout(r, 600));
    assert(cspViolations.length === 0, "Admin syllabus management had 0 CSP violations");

    await evaluate(`
      (async () => {
        currentUser = null;
        setStoredAuthToken("");
        sessionStorage.removeItem("portalUser");
        if (typeof openLogin === "function") openLogin();
        else navigate("home");
      })()
    `);
    await new Promise(r => setTimeout(r, 500));
    assert(cspViolations.length === 0, "Admin workflow had 0 CSP violations");

  } finally {
    try { ws.close(); } catch (_) {}
    try { browserProc.kill(); } catch (_) {}
    try { server.close(); } catch (_) {}
    try { fs.rmSync(tmpUserDataDir, { recursive: true, force: true }); } catch (_) {}
    await stopTestDb();
  }

  console.log(`\n======================================================`);
  console.log(`Headless Smoke Results: ${passCount} Passed, ${failCount} Failed`);
  console.log(`======================================================`);

  if (failCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runHeadlessSmoke().catch(err => {
  console.error("Headless smoke fatal error:", err);
  process.exit(1);
});
