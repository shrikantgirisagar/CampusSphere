// scripts/test-courses-syllabus.js
// Automated verification suite for Courses & Syllabus Management (Admin + Student + Faculty + Security + Responsiveness)

require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const crypto = require("crypto");

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

async function request(method, reqPath, body = null, token = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, BASE_URL);
    const headers = { ...extraHeaders };
    if (body !== null && typeof body === "object" && !Buffer.isBuffer(body) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let payload = null;
    if (body !== null) {
      if (Buffer.isBuffer(body)) {
        payload = body;
        headers["Content-Length"] = body.length;
      } else if (typeof body === "string") {
        payload = body;
        headers["Content-Length"] = Buffer.byteLength(body);
      } else {
        payload = JSON.stringify(body);
        headers["Content-Length"] = Buffer.byteLength(payload);
      }
    }

    const req = http.request(url, { method, headers }, (res) => {
      const chunks = [];
      res.on("data", chunk => { chunks.push(chunk); });
      res.on("end", () => {
        const fullBuffer = Buffer.concat(chunks);
        const text = fullBuffer.toString("utf8");
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (_) {
          json = text;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json, buffer: fullBuffer });
      });
    });

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function createMultipartPayload(fields, fileField) {
  const boundary = `----WebKitFormBoundary${crypto.randomBytes(16).toString("hex")}`;
  const crlf = "\r\n";
  const parts = [];

  for (const [name, val] of Object.entries(fields)) {
    parts.push(Buffer.from(
      `--${boundary}${crlf}` +
      `Content-Disposition: form-data; name="${name}"${crlf}${crlf}` +
      `${val}${crlf}`
    ));
  }

  if (fileField) {
    const filename = fileField.filename || "test.pdf";
    const contentType = fileField.contentType || "application/pdf";
    const header = `--${boundary}${crlf}` +
      `Content-Disposition: form-data; name="${fileField.name || "file"}"; filename="${filename}"${crlf}` +
      `Content-Type: ${contentType}${crlf}${crlf}`;
    parts.push(Buffer.from(header));
    parts.push(fileField.buffer);
    parts.push(Buffer.from(crlf));
  }

  parts.push(Buffer.from(`--${boundary}--${crlf}`));
  const body = Buffer.concat(parts);
  const headers = {
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
    "Content-Length": body.length
  };
  return { body, headers };
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
  console.log("==================================================================");
  console.log("CAMPUSSPHERE COURSES & SYLLABUS AUTOMATED VERIFICATION SUITE");
  console.log("==================================================================\n");

  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/CampusSphere";
  await mongoose.connect(mongoUri, { dbName: "CampusSphere" });
  console.log("✓ Connected to MongoDB");

  const User = require("../models/User");
  const Syllabus = require("../models/Syllabus");

  // Start test server
  process.env.PORT = String(TEST_PORT);
  process.env.NODE_ENV = "test";
  serverProcess = require("../server.js");
  await new Promise(res => setTimeout(res, 1200));
  console.log(`✓ Test server running at ${BASE_URL}\n`);

  await Syllabus.syncIndexes();

  // Create test accounts: Admin, Student, Faculty
  const timestamp = Date.now();
  const adminUsername = `test_syl_admin_${timestamp}`;
  const studentUsername = `test_syl_student_${timestamp}`;
  const facultyUsername = `test_syl_faculty_${timestamp}`;
  const testPassword = "Password@123";
  const hashedPwd = await hashPassword(testPassword);

  await User.create([
    {
      id: `id-${adminUsername}`,
      role: "admin",
      username: adminUsername,
      name: "Syllabus Admin",
      email: `${adminUsername}@test.edu`,
      passwordHash: hashedPwd
    },
    {
      id: `id-${studentUsername}`,
      role: "student",
      username: studentUsername,
      name: "Syllabus Student",
      email: `${studentUsername}@test.edu`,
      passwordHash: hashedPwd,
      courseYear: "1st Year",
      semester: "1st Semester",
      division: "Div A"
    },
    {
      id: `id-${facultyUsername}`,
      role: "faculty",
      username: facultyUsername,
      name: "Syllabus Faculty",
      email: `${facultyUsername}@test.edu`,
      passwordHash: hashedPwd,
      subject: "Data Structures",
      division: "Both Divisions"
    }
  ]);

  // Login to acquire auth tokens
  const adminLogin = await request("POST", "/api/auth/login", { role: "admin", username: adminUsername, password: testPassword });
  const adminToken = adminLogin.body?.token;
  assert(adminLogin.status === 200 && adminToken, "Admin logged in successfully and acquired token");

  const studentLogin = await request("POST", "/api/auth/login", { role: "student", username: studentUsername, password: testPassword });
  const studentToken = studentLogin.body?.token;
  assert(studentLogin.status === 200 && studentToken, "Student logged in successfully and acquired token");

  const facultyLogin = await request("POST", "/api/auth/login", { role: "faculty", username: facultyUsername, password: testPassword });
  const facultyToken = facultyLogin.body?.token;
  assert(facultyLogin.status === 200 && facultyToken, "Faculty logged in successfully and acquired token");

  // Sample valid PDF buffer (%PDF-1.4 header)
  const validPdfBuffer = Buffer.from(
    "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n" +
    "xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n" +
    "trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n187\n%%EOF\n"
  );

  // -------------------------------------------------------------
  // TEST SECTION 1: Unauthenticated Endpoint Security (401)
  // -------------------------------------------------------------
  console.log("\n--- SECTION 1: Unauthenticated Endpoint Security ---");
  const unauthGetList = await request("GET", "/api/syllabus");
  assert(unauthGetList.status === 401, "Unauthenticated GET /api/syllabus returns 401");

  const unauthGetSingle = await request("GET", "/api/syllabus/1");
  assert(unauthGetSingle.status === 401, "Unauthenticated GET /api/syllabus/1 returns 401");

  const unauthDownload = await request("GET", "/api/syllabus/1/download");
  assert(unauthDownload.status === 401, "Unauthenticated GET /api/syllabus/1/download returns 401");

  const unauthUpload = await request("POST", "/api/syllabus");
  assert(unauthUpload.status === 401, "Unauthenticated POST /api/syllabus returns 401");

  const unauthDelete = await request("DELETE", "/api/syllabus/1");
  assert(unauthDelete.status === 401, "Unauthenticated DELETE /api/syllabus/1 returns 401");

  // -------------------------------------------------------------
  // TEST SECTION 2: Role-Based Access Control (RBAC)
  // -------------------------------------------------------------
  console.log("\n--- SECTION 2: Role-Based Access Control (RBAC) ---");
  // Student read metadata: Allowed
  const studentGet = await request("GET", "/api/syllabus", null, studentToken);
  assert(studentGet.status === 200 && Array.isArray(studentGet.body?.syllabi), "Student can read GET /api/syllabus");
  assert(studentGet.body.syllabi.length === 3, "GET /api/syllabus returns exactly 3 year items (1 PDF per year card)");

  // Student upload: Forbidden (403)
  const studentUploadPayload = createMultipartPayload({ yearLevel: "1" }, { filename: "test.pdf", buffer: validPdfBuffer });
  const studentUpload = await request("POST", "/api/syllabus", studentUploadPayload.body, studentToken, studentUploadPayload.headers);
  assert(studentUpload.status === 403, "Student upload POST /api/syllabus is rejected with 403 Forbidden");

  // Student replace: Forbidden (403)
  const studentReplace = await request("PUT", "/api/syllabus/1", studentUploadPayload.body, studentToken, studentUploadPayload.headers);
  assert(studentReplace.status === 403, "Student replace PUT /api/syllabus/1 is rejected with 403 Forbidden");

  // Student delete: Forbidden (403)
  const studentDelete = await request("DELETE", "/api/syllabus/1", null, studentToken);
  assert(studentDelete.status === 403, "Student delete DELETE /api/syllabus/1 is rejected with 403 Forbidden");

  // Faculty upload: Forbidden (403)
  const facultyUpload = await request("POST", "/api/syllabus", studentUploadPayload.body, facultyToken, studentUploadPayload.headers);
  assert(facultyUpload.status === 403, "Faculty upload POST /api/syllabus is rejected with 403 Forbidden");

  // Faculty replace: Forbidden (403)
  const facultyReplace = await request("PUT", "/api/syllabus/1", studentUploadPayload.body, facultyToken, studentUploadPayload.headers);
  assert(facultyReplace.status === 403, "Faculty replace PUT /api/syllabus/1 is rejected with 403 Forbidden");

  // Faculty delete: Forbidden (403)
  const facultyDelete = await request("DELETE", "/api/syllabus/1", null, facultyToken);
  assert(facultyDelete.status === 403, "Faculty delete DELETE /api/syllabus/1 is rejected with 403 Forbidden");

  // Faculty read metadata: Allowed
  const facultyGet = await request("GET", "/api/syllabus", null, facultyToken);
  assert(facultyGet.status === 200, "Faculty can read GET /api/syllabus");

  // -------------------------------------------------------------
  // TEST SECTION 3: Academic Structure Mapping
  // -------------------------------------------------------------
  console.log("\n--- SECTION 3: Academic Structure Mapping ---");
  const yearsData = studentGet.body.syllabi;
  const yr1 = yearsData.find(y => y.yearLevel === 1);
  const yr2 = yearsData.find(y => y.yearLevel === 2);
  const yr3 = yearsData.find(y => y.yearLevel === 3);

  assert(yr1 && yr1.yearTitle === "First Year BCA" && yr1.academicYear === "2025–26", "Year 1 maps to First Year BCA (2025–26, Semester I & II)");
  assert(yr2 && yr2.yearTitle === "Second Year BCA" && yr2.academicYear === "2026–27", "Year 2 maps to Second Year BCA (2026–27, Semester III & IV)");
  assert(yr3 && yr3.yearTitle === "Third Year BCA" && yr3.academicYear === "2027–28", "Year 3 maps to Third Year BCA (2027–28, Semester V & VI)");

  // Rejection of invalid year level (e.g. year 7 or 0)
  const invalidSemPayload = createMultipartPayload({ yearLevel: "7" }, { filename: "test.pdf", buffer: validPdfBuffer });
  const invalidSemUpload = await request("POST", "/api/syllabus", invalidSemPayload.body, adminToken, invalidSemPayload.headers);
  assert(invalidSemUpload.status === 400, "Invalid year upload rejected with 400 Bad Request");

  // -------------------------------------------------------------
  // TEST SECTION 4: File Type and Magic Bytes Security
  // -------------------------------------------------------------
  console.log("\n--- SECTION 4: File Type & Magic Bytes Security ---");
  // Non-PDF extension (.txt)
  const txtPayload = createMultipartPayload({ yearLevel: "1" }, { filename: "notes.txt", contentType: "text/plain", buffer: Buffer.from("Hello world") });
  const txtUpload = await request("POST", "/api/syllabus", txtPayload.body, adminToken, txtPayload.headers);
  assert(txtUpload.status === 415, "Non-PDF file extension (.txt) rejected with 415 Unsupported Media Type");

  // Fake PDF (named fake.pdf but containing plain text without %PDF- magic bytes)
  const fakePdfBuffer = Buffer.from("Not a real PDF file! Just random plain text pretending to be PDF.");
  const fakePdfPayload = createMultipartPayload({ yearLevel: "1" }, { filename: "fake.pdf", contentType: "application/pdf", buffer: fakePdfBuffer });
  const fakePdfUpload = await request("POST", "/api/syllabus", fakePdfPayload.body, adminToken, fakePdfPayload.headers);
  assert(fakePdfUpload.status === 415, "Fake PDF missing %PDF- magic bytes rejected with 415");

  // Executable disguised as PDF
  const fakeExeBuffer = Buffer.from("MZ\x90\x00\x03\x00\x00\x00Windows Executable Binary");
  const fakeExePayload = createMultipartPayload({ yearLevel: "1" }, { filename: "malware.pdf", contentType: "application/pdf", buffer: fakeExeBuffer });
  const fakeExeUpload = await request("POST", "/api/syllabus", fakeExePayload.body, adminToken, fakeExePayload.headers);
  assert(fakeExeUpload.status === 415, "Executable binary disguised as PDF rejected with 415");

  // Path traversal attempt in yearLevel parameter
  const traversalDownload = await request("GET", "/api/syllabus/..%2F..%2Fpackage.json/download", null, adminToken);
  assert(traversalDownload.status === 400 || traversalDownload.status === 404, "Path traversal in syllabus parameter rejected");

  // Configurable max file size check
  assert(studentGet.body.maxFileSizeMb === 100, "Configurable maxFileSizeMb reported to clients (default 100MB)");

  // -------------------------------------------------------------
  // TEST SECTION 5: Admin Upload, Replace, View, Download, Delete
  // -------------------------------------------------------------
  console.log("\n--- SECTION 5: Admin Full Lifecycle ---");
  // 5a. Admin Upload Valid PDF for First Year BCA (Year 1)
  const validPayload = createMultipartPayload({ yearLevel: "1" }, { filename: "First_Year_BCA_Official_Syllabus.pdf", buffer: validPdfBuffer });
  const uploadRes = await request("POST", "/api/syllabus", validPayload.body, adminToken, validPayload.headers);
  assert(uploadRes.status === 200 && uploadRes.body?.success, "Admin uploads genuine PDF for First Year BCA successfully (200)");
  assert(uploadRes.body.syllabus?.originalFilename === "First_Year_BCA_Official_Syllabus.pdf", "Original filename preserved in response");
  assert(uploadRes.body.syllabus?.yearLevel === 1, "Correct yearLevel 1 in response");
  assert(uploadRes.body.syllabus?.academicYear === "2025–26", "Correct academicYear 2025–26 in response");

  // Verify DB record
  const dbDoc = await Syllabus.findOne({ yearLevel: 1 });
  assert(dbDoc !== null, "MongoDB record created for First Year BCA");
  assert(dbDoc.storedFilename.endsWith(".pdf"), "Server-controlled storedFilename generated");
  assert(fs.existsSync(dbDoc.storagePath), "Physical file exists on disk in uploads/syllabi directory");

  // Verify no binary is stored in MongoDB
  const rawDoc = await Syllabus.findOne({ yearLevel: 1 }).lean();
  assert(rawDoc.storagePath && !rawDoc.fileBuffer && !rawDoc.data && !rawDoc.buffer, "MongoDB stores file metadata only, no binary blobs");

  // 5b. Authenticated Download by Student
  const studentDownload = await request("GET", "/api/syllabus/1/download", null, studentToken);
  assert(studentDownload.status === 200, "Student can download First Year BCA syllabus PDF (200)");
  assert(studentDownload.headers["content-type"] === "application/pdf", "Response has Content-Type: application/pdf");
  assert(studentDownload.headers["content-disposition"]?.includes("attachment"), "Content-Disposition specifies attachment");
  assert(studentDownload.buffer.slice(0, 5).toString() === "%PDF-", "Downloaded file stream begins with %PDF-");

  // 5c. Authenticated Inline View by Faculty
  const facultyView = await request("GET", "/api/syllabus/1/download?inline=1", null, facultyToken);
  assert(facultyView.status === 200, "Faculty can view First Year BCA syllabus inline (200)");
  assert(facultyView.headers["content-disposition"]?.includes("inline"), "Inline query param sets Content-Disposition: inline");

  // 5d. Token in query parameter for direct browser links
  const queryTokenDownload = await request("GET", `/api/syllabus/1/download?token=${encodeURIComponent(studentToken)}`);
  assert(queryTokenDownload.status === 200, "Direct link with ?token=... successfully authenticates file stream");

  // 5e. Admin Replace Syllabus PDF
  const replacePdfBuffer = Buffer.from(
    "%PDF-1.4\n% Replacement PDF\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n" +
    "xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000076 00000 n \n0000000133 00000 n \n" +
    "trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n205\n%%EOF\n"
  );
  const oldStoragePath = dbDoc.storagePath;
  const replacePayload = createMultipartPayload({}, { filename: "First_Year_BCA_Revised_v2.pdf", buffer: replacePdfBuffer });
  const replaceRes = await request("PUT", "/api/syllabus/1", replacePayload.body, adminToken, replacePayload.headers);
  assert(replaceRes.status === 200 && replaceRes.body?.success, "Admin replaces First Year BCA syllabus successfully (200)");
  assert(replaceRes.body.syllabus?.originalFilename === "First_Year_BCA_Revised_v2.pdf", "Updated originalFilename saved");

  // Verify only 1 record exists in DB for yearLevel 1
  const countYear1 = await Syllabus.countDocuments({ yearLevel: 1 });
  assert(countYear1 === 1, "Exactly one database record exists for First Year BCA after replacement");

  // Verify old physical file was unlinked and new file exists
  const updatedDoc = await Syllabus.findOne({ yearLevel: 1 });
  assert(updatedDoc.storagePath !== oldStoragePath, "New server-controlled file path assigned");
  assert(fs.existsSync(updatedDoc.storagePath), "New replacement file exists on disk");
  assert(!fs.existsSync(oldStoragePath), "Old physical file was cleanly unlinked from disk");

  // 5f. Direct static access protection
  const uploadsDirectReq = await request("GET", "/uploads/syllabi/first-year/" + path.basename(updatedDoc.storagePath));
  assert(uploadsDirectReq.status === 403, "Direct unauthenticated access to /uploads is blocked with 403 Forbidden");

  // 5g. Admin Delete Syllabus PDF
  const deleteRes = await request("DELETE", "/api/syllabus/1", null, adminToken);
  assert(deleteRes.status === 200 && deleteRes.body?.success, "Admin deletes First Year BCA syllabus successfully (200)");

  // Verify DB record and file are removed
  const deletedDoc = await Syllabus.findOne({ yearLevel: 1 });
  assert(deletedDoc === null, "MongoDB record for First Year BCA deleted");
  assert(!fs.existsSync(updatedDoc.storagePath), "Physical file deleted from disk on syllabus removal");

  // -------------------------------------------------------------
  // TEST SECTION 6: UI Files & Responsiveness Verification
  // -------------------------------------------------------------
  console.log("\n--- SECTION 6: UI Files & Responsiveness Verification ---");
  const coursesHtml = fs.readFileSync(path.join(__dirname, "../courses.html"), "utf8");
  assert(coursesHtml.includes("First Year BCA"), "courses.html contains First Year BCA card");
  assert(coursesHtml.includes("Second Year BCA"), "courses.html contains Second Year BCA card");
  assert(coursesHtml.includes("Third Year BCA"), "courses.html contains Third Year BCA card");
  assert(coursesHtml.includes("coursesBtnSem1"), "courses.html contains Semester 1 download element");
  assert(coursesHtml.includes("coursesBtnSem6"), "courses.html contains Semester 6 download element");
  assert(coursesHtml.includes("coursesAdminBanner"), "courses.html contains admin banner element");
  assert(!coursesHtml.includes("_Syllabus.txt"), "courses.html dummy text download completely removed");

  const adminHtml = fs.readFileSync(path.join(__dirname, "../admin-courses-syllabus.html"), "utf8");
  assert(adminHtml.includes("Courses &amp; Syllabus Management") || adminHtml.includes("COURSES &amp; SYLLABUS MANAGEMENT"), "admin-courses-syllabus.html header title verified");
  assert(adminHtml.includes("openSyllabusUploadModal"), "admin-courses-syllabus.html references openSyllabusUploadModal");
  assert(adminHtml.includes("adminAuthGate"), "admin-courses-syllabus.html contains admin authentication gate");

  const scriptJs = fs.readFileSync(path.join(__dirname, "../script.js"), "utf8");
  assert(scriptJs.includes('["syllabus", "📖", "Courses & Syllabus"]'), "script.js buildNav() contains syllabus navigation item");
  assert(scriptJs.includes("openSyllabusUploadModal"), "script.js includes openSyllabusUploadModal");
  assert(scriptJs.includes("confirmDeleteSyllabus"), "script.js includes confirmDeleteSyllabus");
  assert(scriptJs.includes("downloadSyllabusPdf"), "script.js includes downloadSyllabusPdf");

  const styleCss = fs.readFileSync(path.join(__dirname, "../style.css"), "utf8");
  assert(styleCss.includes(".syllabus-mgmt-page"), "style.css contains .syllabus-mgmt-page");
  assert(styleCss.includes(".syllabus-sem-card"), "style.css contains .syllabus-sem-card");
  assert(styleCss.includes(".syllabus-dropzone"), "style.css contains .syllabus-dropzone");
  assert(styleCss.includes("@media (max-width: 768px)"), "style.css contains 768px responsive rules");
  assert(styleCss.includes("@media (max-width: 480px)"), "style.css contains 480px mobile screen-fit rules");

  // Verify no horizontal overflow issues in CSS
  assert(styleCss.includes("max-width: 100%"), "style.css enforces max-width: 100% on syllabus containers");

  // -------------------------------------------------------------
  // TEST SECTION 7: Cleanup Test Users
  // -------------------------------------------------------------
  console.log("\n--- SECTION 7: Cleanup Test Artifacts ---");
  await User.deleteMany({ username: { $in: [adminUsername, studentUsername, facultyUsername] } });
  await Syllabus.deleteMany({ $or: [{ yearLevel: { $in: [1, 2, 3] } }, { semester: { $in: [1, 2, 3, 4, 5, 6] } }] });
  console.log("✓ Cleaned up test database accounts and records");
}

main()
  .then(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    console.log("\n==================================================================");
    console.log(`FINAL RESULT: ${passedCount} PASSED, ${failedCount} FAILED.`);
    console.log("==================================================================");
    process.exit(failedCount === 0 ? 0 : 1);
  })
  .catch(async (err) => {
    console.error("Test execution fatal error:", err);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  });
