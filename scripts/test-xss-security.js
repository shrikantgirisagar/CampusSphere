// scripts/test-xss-security.js
// Dedicated automated test suite for Cross-Site Scripting (XSS) & Input Security Hardening
require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const TEST_PORT = 3099;
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

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

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
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// -------------------------------------------------------------
// Unit tests for Client-side Utility Functions (isolated test)
// -------------------------------------------------------------
function runClientUtilityUnitTests() {
  console.log("\n--- 1. Client-Side Sanitization Utility Unit Tests ---");

  // Read script.js to extract the canonical functions
  const scriptContent = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");

  // Define minimal scope for evaluating client functions
  const sandbox = {};
  const evalCode = `
    ${scriptContent.slice(scriptContent.indexOf("function escapeHtml("), scriptContent.indexOf("function getStudentPresetAvatars("))}
    sandbox.escapeHtml = escapeHtml;
    sandbox.sanitizeDownloadUrl = sanitizeDownloadUrl;
    sandbox.sanitizeImageUrl = sanitizeImageUrl;
  `;
  try {
    const fn = new Function("sandbox", evalCode);
    fn(sandbox);
  } catch (err) {
    console.error("Failed to extract client functions from script.js:", err.message);
  }

  const { escapeHtml, sanitizeDownloadUrl, sanitizeImageUrl } = sandbox;

  // 1. escapeHtml tests
  assert(typeof escapeHtml === "function", "escapeHtml function is defined in script.js");
  assert(escapeHtml(0) === "0", "escapeHtml(0) correctly preserves numeric 0");
  assert(escapeHtml(null) === "", "escapeHtml(null) returns empty string");
  assert(escapeHtml(undefined) === "", "escapeHtml(undefined) returns empty string");
  assert(escapeHtml("") === "", "escapeHtml('') returns empty string");
  assert(
    escapeHtml('<script>alert("XSS")</script>') === '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
    "escapeHtml properly escapes <, >, and double quotes"
  );
  assert(
    escapeHtml("Tom & Jerry's 'Adventure'") === "Tom &amp; Jerry&#39;s &#39;Adventure&#39;",
    "escapeHtml properly escapes ampersands and single quotes"
  );
  assert(
    escapeHtml('"><img src=x onerror=alert(1)>') === '&quot;&gt;&lt;img src=x onerror=alert(1)&gt;',
    "escapeHtml neutralizes attribute breakout payload"
  );

  // 2. sanitizeDownloadUrl tests
  assert(typeof sanitizeDownloadUrl === "function", "sanitizeDownloadUrl is defined in script.js");
  assert(sanitizeDownloadUrl("/docs/syllabus.pdf") === "/docs/syllabus.pdf", "Allows safe relative paths");
  assert(sanitizeDownloadUrl("https://example.com/file.pdf") === "https://example.com/file.pdf", "Allows safe https:// URLs");
  assert(sanitizeDownloadUrl("http://example.com/file.pdf") === "http://example.com/file.pdf", "Allows safe http:// URLs");
  assert(sanitizeDownloadUrl("data:application/pdf;base64,JVBERi0xLjc=") === "data:application/pdf;base64,JVBERi0xLjc=", "Allows safe base64 PDF data URLs");
  assert(sanitizeDownloadUrl("data:image/png;base64,iVBORw0KGgo=") === "data:image/png;base64,iVBORw0KGgo=", "Allows safe base64 image data URLs");
  assert(sanitizeDownloadUrl("javascript:alert(1)") === "#", "Blocks javascript: protocol injection in download URLs");
  assert(sanitizeDownloadUrl("JAVASCRIPT:alert(document.cookie)") === "#", "Case-insensitively blocks JAVASCRIPT: protocol");
  assert(sanitizeDownloadUrl("data:text/html,<script>alert(1)</script>") === "#", "Blocks data:text/html execution vector");
  assert(sanitizeDownloadUrl("vbscript:MsgBox(1)") === "#", "Blocks vbscript: protocol injection");

  // 3. sanitizeImageUrl tests
  assert(typeof sanitizeImageUrl === "function", "sanitizeImageUrl is defined in script.js");
  assert(sanitizeImageUrl("https://cdn.example.com/avatar.jpg") === "https://cdn.example.com/avatar.jpg", "Allows safe https:// image URL");
  assert(sanitizeImageUrl("/images/user.png") === "/images/user.png", "Allows safe relative image URL");
  assert(sanitizeImageUrl("data:image/svg+xml;utf8,<svg></svg>") === "data:image/svg+xml;utf8,<svg></svg>", "Allows safe data:image SVG");
  assert(sanitizeImageUrl("data:image/png;base64,abc==") === "data:image/png;base64,abc==", "Allows safe data:image/png URL");
  assert(sanitizeImageUrl("javascript:alert(1)") === "", "Blocks javascript: protocol in image source");
  assert(sanitizeImageUrl("data:text/html,<script>alert(1)</script>") === "", "Blocks data:text/html in image source");
  assert(sanitizeImageUrl('" onerror="alert(1)') === "", "Blocks attribute breakout payload in image source");
}

async function runBackendXssTests() {
  console.log("\n--- 2. Backend Input Validation & Stored XSS Prevention Tests ---");

  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/CampusSphere";
  await mongoose.connect(mongoUri);
  console.log("✓ Connected to MongoDB");

  // Start test server instance
  process.env.PORT = String(TEST_PORT);
  process.env.NODE_ENV = "test";
  serverProcess = require("../server.js");
  await new Promise(res => setTimeout(res, 1200));
  console.log(`✓ Test server running at ${BASE_URL}`);

  // 1. Create and authenticate a dedicated test admin user
  const crypto = require("crypto");
  function hashPass(pwd) {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16);
      crypto.scrypt(pwd, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
        if (err) return reject(err);
        resolve(`scrypt$16384$8$1$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`);
      });
    });
  }

  const User = mongoose.model("User");
  const adminUser = `admin_xss_${Date.now()}`;
  const testPassword = "AdminSecurePassword@123";
  const hashedPwd = await hashPass(testPassword);

  await User.create({
    id: `id-${adminUser}`,
    role: "admin",
    username: adminUser,
    name: "Test Admin XSS",
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

  // 2. Test user creation rejection with HTML script tags in 'name'
  const xssNameUser = await request("POST", "/api/users", {
    role: "student",
    name: "<script>alert('XSS')</script>",
    username: `xss_user_${Date.now()}`,
    password: "Password@123",
    email: `xss_${Date.now()}@example.com`,
    division: "Div A",
    semester: "1st Semester",
    courseYear: "1st Year",
    course: "Bachelor of Computer Applications (BCA)",
    languageChoice: "Kannada",
    mathChoice: "Mathematics"
  });
  assert(
    xssNameUser.status === 400 && String(xssNameUser.body?.message).includes("HTML"),
    "User creation with <script> tag in name rejected with HTTP 400"
  );

  // 3. Test user creation rejection with javascript: in profilePic
  const xssPicUser = await request("POST", "/api/users", {
    role: "student",
    name: "Legit Name",
    username: `pic_xss_${Date.now()}`,
    password: "Password@123",
    email: `pic_xss_${Date.now()}@example.com`,
    division: "Div A",
    semester: "1st Semester",
    courseYear: "1st Year",
    course: "Bachelor of Computer Applications (BCA)",
    languageChoice: "Kannada",
    mathChoice: "Mathematics",
    profilePic: "javascript:alert(document.cookie)"
  });
  assert(
    xssPicUser.status === 400 && String(xssPicUser.body?.message).includes("profile picture"),
    "User creation with javascript: in profilePic rejected with HTTP 400"
  );

  // 4. Test user creation rejection with data:text/html in profilePic
  const xssDataPicUser = await request("POST", "/api/users", {
    role: "student",
    name: "Legit Name",
    username: `data_xss_${Date.now()}`,
    password: "Password@123",
    email: `data_xss_${Date.now()}@example.com`,
    division: "Div A",
    semester: "1st Semester",
    courseYear: "1st Year",
    course: "Bachelor of Computer Applications (BCA)",
    languageChoice: "Kannada",
    mathChoice: "Mathematics",
    profilePic: "data:text/html,<script>alert(1)</script>"
  });
  assert(
    xssDataPicUser.status === 400 && String(xssDataPicUser.body?.message).includes("profile picture"),
    "User creation with data:text/html in profilePic rejected with HTTP 400"
  );

  // 5. Test user creation rejection with HTML tags in student fields
  const xssDivUser = await request("POST", "/api/users", {
    role: "student",
    name: "Legit Student",
    username: `div_xss_${Date.now()}`,
    password: "Password@123",
    email: `div_xss_${Date.now()}@example.com`,
    division: 'Div A"><img src=x onerror=alert(1)>',
    semester: "1st Semester",
    courseYear: "1st Year",
    course: "Bachelor of Computer Applications (BCA)",
    languageChoice: "Kannada",
    mathChoice: "Mathematics"
  });
  assert(
    xssDivUser.status === 400 && String(xssDivUser.body?.message).includes("HTML"),
    "User creation with attribute breakout in division rejected with HTTP 400"
  );

  // 6. Test legitimate user creation succeeds
  const cleanUsername = `clean_user_${Date.now()}`;
  const cleanUser = await request("POST", "/api/users", {
    role: "student",
    name: "Clean & Legitimate Student (BCA)",
    username: cleanUsername,
    password: "Password@123",
    email: `${cleanUsername}@example.com`,
    division: "Div A",
    semester: "1st Semester",
    courseYear: "1st Year",
    course: "Bachelor of Computer Applications (BCA)",
    languageChoice: "Kannada",
    mathChoice: "Mathematics",
    profilePic: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  });
  assert(cleanUser.status === 201 && cleanUser.body?.success === true, "Legitimate student creation with safe special characters succeeds (201 Created)");
  const studentToken = cleanUser.body?.token;

  // 7. Test PUT /api/users/:role/:username rejection with javascript: in profilePic
  const xssUpdatePic = await request("PUT", `/api/users/student/${cleanUsername}`, {
    profilePic: "javascript:/*--></title></style></textarea></script>alert(1)"
  }, studentToken);
  assert(
    xssUpdatePic.status === 400 && String(xssUpdatePic.body?.message).includes("profile picture"),
    "Profile update with javascript: in profilePic rejected with HTTP 400"
  );

  // 8. Test PUT /api/users/:role/:username rejection with HTML tag in name
  const xssUpdateName = await request("PUT", `/api/users/student/${cleanUsername}`, {
    name: "Hacked <h1>Name</h1>"
  }, studentToken);
  assert(
    xssUpdateName.status === 400 && String(xssUpdateName.body?.message).includes("HTML"),
    "Profile update with HTML tags in name rejected with HTTP 400"
  );

  // 9. Test POST /api/timetable/sync strips HTML injection from subjectText and faculty
  const ttPayload = {
    timetable: [
      {
        division: "Div A",
        semester: "1st Semester",
        day: "Monday",
        time: "9:00-10:00",
        subject: "bca101",
        subjectText: '<script>alert("XSS")</script>Computer Architecture',
        faculty: 'Prof. X <img src=x onerror=alert(1)>'
      }
    ]
  };
  const ttSync = await request("POST", "/api/timetable/sync", ttPayload, adminToken);
  assert(ttSync.status === 200 && ttSync.body?.success === true, "POST /api/timetable/sync accepts and processes timetable");

  // Fetch timetable and verify stripped tags
  const ttGet = await request("GET", "/api/timetable", null, adminToken);
  const syncedSlot = (ttGet.body?.timetable || []).find(t => t.day === "Monday" && t.time === "9:00-10:00" && t.division === "Div A");
  assert(syncedSlot && !syncedSlot.subjectText.includes("<script>"), "Timetable subjectText HTML tags successfully stripped in MongoDB");
  assert(syncedSlot && !syncedSlot.faculty.includes("<img"), "Timetable faculty HTML tags successfully stripped in MongoDB");

  // 10. Test POST /api/academic/sync strips HTML injection from notices, assignments, and notes
  const acadSyncPayload = {
    data: {
      notices: [
        {
          id: `xss_notice_${Date.now()}`,
          title: 'Campus Notice <b onmouseover=alert(1)>Important</b>',
          text: '<script>alert("Stored Notice XSS")</script>Regular classes resume tomorrow.',
          date: "2026-09-19",
          target: "all"
        }
      ],
      assignments: [
        {
          id: `xss_asgn_${Date.now()}`,
          title: 'Unit 1 Assignment <iframe src="javascript:alert(1)"></iframe>',
          description: '<script>alert("Asgn XSS")</script>Complete exercises 1 to 5',
          subject: "bca101",
          student: cleanUsername,
          due: "2026-09-25"
        }
      ],
      notes: [
        {
          id: `xss_note_${Date.now()}`,
          subject: "bca101",
          title: 'Lecture 1 Notes <img src=x onerror=alert(1)>',
          division: "All Divisions",
          date: "2026-09-19"
        }
      ],
      timetableHeader: {
        "1st Semester_Div A": {
          title: 'Bharatesh College <script>alert("Header XSS")</script>',
          subtitle: 'Academic Year 2026 <img src=x onerror=alert(1)>'
        }
      }
    }
  };

  const acadSync = await request("POST", "/api/academic/sync", acadSyncPayload, adminToken);
  assert(acadSync.status === 200 && acadSync.body?.success === true, "POST /api/academic/sync completed successfully");

  // Fetch academic data and verify sanitization
  const acadGet = await request("GET", "/api/academic/data", null, adminToken);
  const storedNotices = acadGet.body?.data?.notices || [];
  const storedAsgns = acadGet.body?.data?.assignments || [];
  const storedNotes = acadGet.body?.data?.notes || [];
  const storedHeader = acadGet.body?.data?.timetableHeader?.["1st Semester_Div A"] || {};

  const savedNotice = storedNotices.find(n => String(n.title).includes("Campus Notice"));
  assert(savedNotice && !savedNotice.text.includes("<script>"), "Notice text stored in database is stripped of script tags");
  assert(savedNotice && !savedNotice.title.includes("<b"), "Notice title stored in database is stripped of HTML tags");

  const savedAsgn = storedAsgns.find(a => String(a.title).includes("Unit 1 Assignment"));
  assert(savedAsgn && !savedAsgn.title.includes("<iframe"), "Assignment title stored in database is stripped of iframe tags");
  assert(savedAsgn && !savedAsgn.description.includes("<script>"), "Assignment description stored in database is stripped of script tags");

  const savedNote = storedNotes.find(n => String(n.title).includes("Lecture 1 Notes"));
  assert(savedNote && !savedNote.title.includes("<img"), "Notes title stored in database is stripped of img tags");

  assert(!storedHeader.title?.includes("<script>"), "Timetable header title stored in database is stripped of script tags");
  assert(!storedHeader.subtitle?.includes("<img"), "Timetable header subtitle stored in database is stripped of img tags");

  // Clean up test users
  await request("DELETE", `/api/users/student/${cleanUsername}`, null, adminToken);
  await User.deleteMany({ username: adminUser });
  console.log("✓ Cleaned up test users");
}

async function main() {
  console.log("=== CampusSphere Cross-Site Scripting (XSS) & Input Security Test Suite ===");
  try {
    runClientUtilityUnitTests();
    await runBackendXssTests();
  } catch (err) {
    console.error("Test execution error:", err);
    failedCount++;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    console.log("\n==============================================");
    console.log(`Results: ${passedCount} passed, ${failedCount} failed.`);
    console.log("==============================================");
    process.exit(failedCount === 0 ? 0 : 1);
  }
}

main();
