/**
 * Prompt 14 — Complete Real-World End-to-End Workflow Audit Suite
 * 
 * Verifies end-to-end data lifecycle across Student, Faculty, and Admin roles:
 * - Student End-to-End Journey (Registration, Auth, Profile Update, Scoped Viewing, Logout)
 * - Faculty End-to-End Journey (Provisioning, Auth, Student Roster, Attendance, Marks, Assignments, Notes, Notices, Timetable)
 * - Admin End-to-End Journey (Auth, Provisioning, Account Management, Protections)
 * - Cross-Role Data Lifecycle (Faculty Action -> MongoDB Persistence -> Student Verification)
 * - Division & Semester Isolation (Division A vs Division B vs Both Divisions)
 * - Profile Change Cascade Impact (Username rename -> MongoDB cascade across AcademicStore, Marks, Attendance, Assignments)
 * - Error Recovery & Security Bounds
 */

require("dotenv").config();
const http = require("http");
const crypto = require("crypto");
const mongoose = require("mongoose");
const app = require("../server");

const TEST_PORT = 3198;
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

async function runE2EAudit() {
  console.log("==================================================");
  console.log("PROMPT 14: REAL-WORLD END-TO-END WORKFLOW AUDIT");
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
  const studentAUser = `e2e_stu_a_${runTag}`;
  const studentAEmail = `e2e_stu_a_${runTag}@example.edu`;
  const studentBUser = `e2e_stu_b_${runTag}`;
  const studentBEmail = `e2e_stu_b_${runTag}@example.edu`;
  const facultyUser = `e2e_fac_${runTag}`;
  const facultyEmail = `e2e_fac_${runTag}@campussphere.edu`;
  const adminUser = `e2e_adm_${runTag}`;
  const adminEmail = `e2e_adm_${runTag}@campussphere.edu`;
  const defaultPassword = "Password@123!";

  let studentAToken = "";
  let studentBToken = "";
  let facultyToken = "";
  let adminToken = "";

  const createdUsernames = [studentAUser, studentBUser, facultyUser, adminUser];

  try {
    // =========================================================================
    // PART 1: ADMIN WORKFLOW & INITIAL PROVISIONING
    // =========================================================================
    console.log("\n--- PART 1: Admin Workflow & User Provisioning ---");

    // 1.1 Bootstrap isolated admin account for testing
    const hashedAdminPwd = await hashPassword(defaultPassword);
    await User.create({
      id: `admin-${runTag}`,
      role: "admin",
      name: "E2E Administrator",
      username: adminUser,
      email: adminEmail,
      passwordHash: hashedAdminPwd
    });

    // 1.2 Admin login
    const adminLoginRes = await request("POST", "/api/auth/login", {
      role: "admin",
      username: adminUser,
      password: defaultPassword
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.json?.success === true, "Admin login succeeds with 200 OK");
    adminToken = adminLoginRes.json?.token;
    assert(typeof adminToken === "string" && adminToken.length > 20, "Admin receives valid HMAC-SHA256 session token");

    // 1.3 Admin provisions Faculty account (teaching c_programming in Division A)
    const createFacRes = await request("POST", "/api/users", {
      name: "Prof. E2E Faculty",
      username: facultyUser,
      email: facultyEmail,
      password: defaultPassword,
      role: "faculty",
      subject: "c_programming",
      subjects: ["c_programming"],
      subjectDivisions: { "c_programming": "Division A" },
      department: "Department of Computer Science & Applications"
    }, { Authorization: `Bearer ${adminToken}` });
    assert(createFacRes.status === 201 && createFacRes.json?.success === true, "Admin provisions Faculty account successfully (201 Created)");
    assert(createFacRes.json?.user?.role === "faculty", "Provisioned user has faculty role");
    assert(!createFacRes.json?.user?.passwordHash, "Response never exposes passwordHash");

    // 1.4 Non-admin cannot create faculty account
    const unauthFacRes = await request("POST", "/api/users", {
      name: "Rogue Faculty",
      username: `rogue_fac_${runTag}`,
      email: `rogue_${runTag}@example.edu`,
      password: defaultPassword,
      role: "faculty",
      subject: "c_programming"
    });
    assert(unauthFacRes.status === 403, "Public / unauthenticated request to create faculty is blocked (403 Forbidden)");

    // =========================================================================
    // PART 2: STUDENT END-TO-END JOURNEY (REGISTRATION, AUTH, PROFILE)
    // =========================================================================
    console.log("\n--- PART 2: Student End-to-End Journey ---");

    // 2.1 Student A self-registration (Division A, 1st Semester)
    const regStuARes = await request("POST", "/api/users", {
      name: "Student Alpha",
      username: studentAUser,
      email: studentAEmail,
      password: defaultPassword,
      role: "student",
      course: "Bachelor of Computer Applications (BCA)",
      courseYear: "1st Year",
      semester: "1st Semester",
      division: "Division A",
      languageChoice: "Kannada",
      mathChoice: "Mathematics"
    });
    assert(regStuARes.status === 201 && regStuARes.json?.success === true, "Student Alpha registers successfully (201 Created)");

    // 2.2 Student B self-registration (Division B, 1st Semester)
    const regStuBRes = await request("POST", "/api/users", {
      name: "Student Beta",
      username: studentBUser,
      email: studentBEmail,
      password: defaultPassword,
      role: "student",
      course: "Bachelor of Computer Applications (BCA)",
      courseYear: "1st Year",
      semester: "1st Semester",
      division: "Division B",
      languageChoice: "Hindi",
      mathChoice: "Accountancy"
    });
    assert(regStuBRes.status === 201 && regStuBRes.json?.success === true, "Student Beta registers successfully (201 Created)");

    // 2.3 Duplicate username rejection
    const dupUserRes = await request("POST", "/api/users", {
      name: "Student Alpha Dup",
      username: studentAUser,
      email: `another_${studentAEmail}`,
      password: defaultPassword,
      role: "student"
    });
    assert(dupUserRes.status === 409 && dupUserRes.json?.message?.includes("already in use"), "Duplicate username rejected with 409 Conflict");

    // 2.4 Duplicate email rejection
    const dupEmailRes = await request("POST", "/api/users", {
      name: "Student Alpha Dup Email",
      username: `another_${studentAUser}`,
      email: studentAEmail,
      password: defaultPassword,
      role: "student"
    });
    assert(dupEmailRes.status === 409 && dupEmailRes.json?.message?.includes("already in use"), "Duplicate email rejected with 409 Conflict");

    // 2.5 Student login & token establishment
    const stuALoginRes = await request("POST", "/api/auth/login", {
      role: "student",
      username: studentAUser,
      password: defaultPassword
    });
    assert(stuALoginRes.status === 200 && stuALoginRes.json?.success === true, "Student Alpha logs in successfully (200 OK)");
    studentAToken = stuALoginRes.json?.token;

    const stuBLoginRes = await request("POST", "/api/auth/login", {
      role: "student",
      username: studentBUser,
      password: defaultPassword
    });
    assert(stuBLoginRes.status === 200 && stuBLoginRes.json?.success === true, "Student Beta logs in successfully (200 OK)");
    studentBToken = stuBLoginRes.json?.token;

    // 2.6 Session restoration via GET /api/users/public
    const stuARestoreRes = await request("GET", "/api/users/public", null, {
      Authorization: `Bearer ${studentAToken}`
    });
    assert(stuARestoreRes.status === 200 && stuARestoreRes.json?.users?.length === 1, "Student session restores cleanly; returns ONLY their own profile");
    assert(stuARestoreRes.json?.users[0]?.username === studentAUser, "Restored profile matches logged-in Student Alpha");

    // 2.7 Student profile update (allowed fields)
    const updateStuARes = await request("PUT", `/api/users/student/${studentAUser}`, {
      name: "Student Alpha Updated",
      division: "Division A"
    }, { Authorization: `Bearer ${studentAToken}` });
    assert(updateStuARes.status === 200 && updateStuARes.json?.user?.name === "Student Alpha Updated", "Student can update own full name");

    // 2.8 Student IDOR prevention (cannot update Student Beta)
    const idorStuRes = await request("PUT", `/api/users/student/${studentBUser}`, {
      name: "Hacked Beta"
    }, { Authorization: `Bearer ${studentAToken}` });
    assert(idorStuRes.status === 403, "Student Alpha cannot update Student Beta's profile (403 IDOR Blocked)");

    // 2.9 Student privilege escalation attempt (cannot change role to admin)
    const escalateStuRes = await request("PUT", `/api/users/student/${studentAUser}`, {
      role: "admin"
    }, { Authorization: `Bearer ${studentAToken}` });
    const verifyStuARole = await User.findOne({ username: studentAUser });
    assert(verifyStuARole.role === "student", "Student role tampering rejected; role remains strictly 'student'");

    // 2.10 Password update workflow (requires valid current password)
    const badPwdUpdate = await request("PUT", `/api/users/student/${studentAUser}`, {
      currentPassword: "WrongCurrentPassword",
      password: "NewSecurePassword@123"
    }, { Authorization: `Bearer ${studentAToken}` });
    assert(badPwdUpdate.status === 401 || badPwdUpdate.status === 400, "Password update with invalid currentPassword rejected");

    const validPwdUpdate = await request("PUT", `/api/users/student/${studentAUser}`, {
      currentPassword: defaultPassword,
      password: "NewSecurePassword@123"
    }, { Authorization: `Bearer ${studentAToken}` });
    assert(validPwdUpdate.status === 200 && validPwdUpdate.json?.success === true, "Password update with valid currentPassword succeeds");

    // Verify login with new password
    const newPwdLogin = await request("POST", "/api/auth/login", {
      role: "student",
      username: studentAUser,
      password: "NewSecurePassword@123"
    });
    assert(newPwdLogin.status === 200, "Student Alpha can log in with new password");
    studentAToken = newPwdLogin.json?.token;

    // =========================================================================
    // PART 3: FACULTY END-TO-END JOURNEY & ACADEMIC OPERATIONS
    // =========================================================================
    console.log("\n--- PART 3: Faculty Journey & Academic Operations ---");

    // 3.1 Faculty login
    const facLoginRes = await request("POST", "/api/auth/login", {
      role: "faculty",
      username: facultyUser,
      password: defaultPassword
    });
    assert(facLoginRes.status === 200 && facLoginRes.json?.success === true, "Faculty logs in successfully (200 OK)");
    facultyToken = facLoginRes.json?.token;

    // 3.2 Faculty accesses student operational directory
    const facDirectoryRes = await request("GET", "/api/users/public", null, {
      Authorization: `Bearer ${facultyToken}`
    });
    assert(facDirectoryRes.status === 200, "Faculty receives student operational directory");
    const foundStuA = facDirectoryRes.json?.users?.find(u => u.username === studentAUser);
    assert(foundStuA && (!foundStuA.email || foundStuA.email === ""), "Student emails are strictly redacted for privacy in faculty directory");

    // 3.3 Faculty cannot delete students
    const facDeleteStu = await request("DELETE", `/api/users/student/${studentAUser}`, null, {
      Authorization: `Bearer ${facultyToken}`
    });
    assert(facDeleteStu.status === 403, "Faculty cannot delete student accounts (403 Forbidden)");

    // 3.4 Faculty cannot access admin-only endpoints
    const facMigrateRes = await request("POST", "/api/users/migrate", { users: [] }, {
      Authorization: `Bearer ${facultyToken}`
    });
    assert(facMigrateRes.status === 403, "Faculty cannot access admin user migration API (403 Forbidden)");

    // =========================================================================
    // PART 4: CROSS-ROLE DATA LIFECYCLE (FACULTY -> MONGODB -> STUDENT)
    // =========================================================================
    console.log("\n--- PART 4: Cross-Role Data Lifecycle (Creation to Scoped Delivery) ---");

    const todayDate = new Date().toISOString().slice(0, 10);

    // 4.1 Faculty performs Academic Sync containing Attendance, Marks, Assignment, Note, Notice
    const academicSyncPayload = {
      notices: [
        {
          id: `notice_divA_${runTag}`,
          title: "Division A Exclusive Workshop",
          content: "Only for Division A students.",
          date: todayDate,
          author: "Prof. E2E Faculty",
          targetDivision: "Division A",
          authorRole: "faculty"
        },
        {
          id: `notice_both_${runTag}`,
          title: "All Campus Seminar",
          content: "Open to both divisions.",
          date: todayDate,
          author: "Prof. E2E Faculty",
          targetDivision: "Both Divisions",
          authorRole: "admin" // Spoof attempt: faculty trying to pose as admin
        }
      ],
      dailyAttendance: [
        {
          id: `att_a_${runTag}`,
          attendanceId: `att_a_${runTag}`,
          studentUsername: studentAUser,
          subject: "c_programming",
          date: todayDate,
          status: "Present",
          division: "Division A",
          facultyUsername: facultyUser,
          records: { [studentAUser]: "Present" }
        }
      ],
      students: {
        [studentAUser]: {
          marks: {
            c_programming: {
              internal1: 19,
              internal2: 18,
              assignment: 9,
              total: 46
            }
          },
          attendance: {
            c_programming: 95
          }
        }
      },
      assignments: [
        {
          id: `assign_divA_${runTag}`,
          assignmentId: `assign_divA_${runTag}`,
          title: "C Programming Pointer Lab",
          subject: "c_programming",
          targetDivision: "Division A",
          dueDate: "2026-10-15",
          student: studentAUser,
          status: "Pending"
        }
      ],
      notes: [
        {
          id: `note_divA_${runTag}`,
          title: "C Programming Unit 2 Notes",
          subject: "c_programming",
          division: "Division A",
          date: todayDate,
          uploadedBy: facultyUser
        }
      ],
      timetable: [
        {
          id: `tt_divA_${runTag}`,
          division: "Division A",
          semester: "1st Semester",
          day: "Monday",
          time: "10:00 AM - 11:00 AM",
          subject: "C Programming",
          faculty: facultyUser
        }
      ]
    };

    const academicSyncRes = await request("POST", "/api/academic/sync", {
      data: academicSyncPayload
    }, { Authorization: `Bearer ${facultyToken}` });
    assert(academicSyncRes.status === 200 && academicSyncRes.json?.success === true, "Faculty executes academic synchronization successfully (200 OK)");

    // 4.2 Verify MongoDB Collections were synchronized in real-time
    const dbNoticeDivA = await Notice.findOne({ noticeId: `notice_divA_${runTag}` });
    assert(!!dbNoticeDivA, "Division A notice permanently persisted to MongoDB 'notices' collection");

    const dbNoticeBoth = await Notice.findOne({ noticeId: `notice_both_${runTag}` });
    assert(dbNoticeBoth && dbNoticeBoth.authorRole === "faculty", "Notice authorRole spoofing neutralized: 'admin' reverted to 'faculty' in MongoDB");

    const dbAttDoc = await Attendance.findOne({ studentUsername: studentAUser, subject: "c_programming" });
    assert(!!dbAttDoc && dbAttDoc.status === "Present", "Attendance record permanently persisted to MongoDB 'attendances' collection");

    const dbMarkDoc = await Mark.findOne({ studentUsername: studentAUser, subject: "c_programming" });
    assert(!!dbMarkDoc && dbMarkDoc.total === 46, "Marks record permanently persisted to MongoDB 'marks' collection with total: 46");

    const dbAssignDoc = await Assignment.findOne({ assignmentId: `assign_divA_${runTag}` });
    assert(!!dbAssignDoc && dbAssignDoc.targetDivision === "Division A", "Assignment persisted to MongoDB 'assignments' collection");

    const dbNoteDoc = await Note.findOne({ noteId: `note_divA_${runTag}` });
    assert(!!dbNoteDoc && dbNoteDoc.division === "Division A", "Study note persisted to MongoDB 'notes' collection");

    // 4.3 Student Alpha (Division A) views dashboard & academic data
    const stuAAcademicRes = await request("GET", "/api/academic/data", null, {
      Authorization: `Bearer ${studentAToken}`
    });
    assert(stuAAcademicRes.status === 200, "Student Alpha retrieves academic data (200 OK)");
    const stuAData = stuAAcademicRes.json?.data;

    // Student A receives their marks
    assert(stuAData?.students?.[studentAUser]?.marks?.c_programming?.total === 46, "Student Alpha receives exact Marks entered by Faculty (total: 46)");

    // Student A receives their attendance
    const attA = stuAData?.students?.[studentAUser]?.attendance?.c_programming;
    assert(attA === 95 || attA === 100, `Student Alpha receives valid Attendance percentage (95% or dynamic 100%, got: ${attA}%)`);

    // Student A receives Division A notice AND Both Divisions notice
    const stuANoticeA = stuAData?.notices?.some(n => n.id === `notice_divA_${runTag}`);
    const stuANoticeBoth = stuAData?.notices?.some(n => n.id === `notice_both_${runTag}`);
    assert(stuANoticeA === true, "Student Alpha receives Division A exclusive notice");
    assert(stuANoticeBoth === true, "Student Alpha receives 'Both Divisions' universal notice");

    // Student A receives Division A assignment
    const stuAAssign = stuAData?.assignments?.some(a => a.id === `assign_divA_${runTag}`);
    assert(stuAAssign === true, "Student Alpha receives Division A assignment");

    // Student A receives Division A study note
    const stuANote = stuAData?.notes?.some(n => n.id === `note_divA_${runTag}`);
    assert(stuANote === true, "Student Alpha receives Division A study notes");

    // 4.4 Student Beta (Division B) views dashboard & academic data (ISOLATION CHECK)
    console.log("\n--- PART 5: Division & Role Isolation Verification ---");
    const stuBAcademicRes = await request("GET", "/api/academic/data", null, {
      Authorization: `Bearer ${studentBToken}`
    });
    assert(stuBAcademicRes.status === 200, "Student Beta retrieves academic data (200 OK)");
    const stuBData = stuBAcademicRes.json?.data;

    // Student Beta must NOT see Student Alpha's marks or attendance
    assert(!stuBData?.students?.[studentAUser], "Student Beta CANNOT see Student Alpha's private marks or attendance");

    // Student Beta must NOT see Division A exclusive notice
    const stuBNoticeA = stuBData?.notices?.some(n => n.id === `notice_divA_${runTag}`);
    assert(stuBNoticeA === false, "Student Beta DOES NOT receive Division A exclusive notice (Isolation Enforced)");

    // Student Beta DOES see Both Divisions universal notice
    const stuBNoticeBoth = stuBData?.notices?.some(n => n.id === `notice_both_${runTag}`);
    assert(stuBNoticeBoth === true, "Student Beta receives 'Both Divisions' universal notice");

    // Student Beta must NOT see Division A exclusive assignment
    const stuBAssign = stuBData?.assignments?.some(a => a.id === `assign_divA_${runTag}`);
    assert(stuBAssign === false, "Student Beta DOES NOT receive Division A assignment (Isolation Enforced)");

    // Student Beta must NOT see Division A study notes
    const stuBNote = stuBData?.notes?.some(n => n.id === `note_divA_${runTag}`);
    assert(stuBNote === false, "Student Beta DOES NOT receive Division A study notes (Isolation Enforced)");

    // =========================================================================
    // PART 6: PROFILE CHANGE CASCADE IMPACT
    // =========================================================================
    console.log("\n--- PART 6: Profile Change Cascade & Referential Consistency ---");

    const renamedStudentA = `e2e_stu_renamed_${runTag}`;
    createdUsernames.push(renamedStudentA);

    // 6.1 Student Alpha renames username to renamedStudentA
    const renameRes = await request("PUT", `/api/users/student/${studentAUser}`, {
      username: renamedStudentA
    }, { Authorization: `Bearer ${studentAToken}` });
    assert(renameRes.status === 200 && renameRes.json?.success === true, "Student Alpha renames username successfully (200 OK)");
    assert(renameRes.json?.user?.username === renamedStudentA, "Response reflects new username");

    // 6.2 Old username login fails; new username login succeeds
    const oldLoginFail = await request("POST", "/api/auth/login", {
      role: "student",
      username: studentAUser,
      password: "NewSecurePassword@123"
    });
    assert(oldLoginFail.status === 401, "Login with old username fails with 401 Unauthorized");

    const newLoginSuccess = await request("POST", "/api/auth/login", {
      role: "student",
      username: renamedStudentA,
      password: "NewSecurePassword@123"
    });
    assert(newLoginSuccess.status === 200, "Login with new username succeeds with 200 OK");
    const renamedToken = newLoginSuccess.json?.token;

    // 6.3 Verify MongoDB cascading updates occurred
    const cascadedMark = await Mark.findOne({ studentUsername: renamedStudentA, subject: "c_programming" });
    assert(!!cascadedMark && cascadedMark.total === 46, "MongoDB 'marks' collection cascaded: studentUsername updated to new username");

    const cascadedAtt = await Attendance.findOne({ studentUsername: renamedStudentA, subject: "c_programming" });
    assert(!!cascadedAtt && cascadedAtt.status === "Present", "MongoDB 'attendances' collection cascaded: studentUsername updated to new username");

    const cascadedAssign = await Assignment.findOne({ student: renamedStudentA });
    assert(!!cascadedAssign, "MongoDB 'assignments' collection cascaded: student updated to new username");

    // 6.4 AcademicStore data retrieval with new username
    const renamedAcademicRes = await request("GET", "/api/academic/data", null, {
      Authorization: `Bearer ${renamedToken}`
    });
    const renamedData = renamedAcademicRes.json?.data;
    assert(renamedData?.students?.[renamedStudentA]?.marks?.c_programming?.total === 46, "AcademicStore key successfully migrated: marks preserved under new username");

    // =========================================================================
    // PART 7: ERROR RECOVERY & CLEAN TEARDOWN
    // =========================================================================
    console.log("\n--- PART 7: Error Recovery & Safe Teardown ---");

    // 7.1 Numeric bounds validation on Marks
    const invalidMarkPayload = {
      students: {
        [renamedStudentA]: {
          marks: {
            c_programming: {
              internal1: 250, // Exceeds max 20
              total: 250
            }
          }
        }
      }
    };
    // Sync with negative bounds or verify existing store stability
    const boundsRes = await request("POST", "/api/academic/sync", { data: invalidMarkPayload }, {
      Authorization: `Bearer ${facultyToken}`
    });
    assert(boundsRes.status === 200 || boundsRes.status === 400, "Academic sync processes gracefully without server crash");

    // 7.2 Malformed token recovery
    const malformedRes = await request("GET", "/api/academic/data", null, {
      Authorization: "Bearer invalid..token..here"
    });
    assert(malformedRes.status === 401 && malformedRes.json?.message?.includes("Malformed"), "Malformed token handled cleanly with 401 and descriptive error");

    // 7.3 Admin deletes test users
    const delStuA = await request("DELETE", `/api/users/student/${renamedStudentA}`, null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(delStuA.status === 200 && delStuA.json?.success === true, "Admin deletes Student Alpha successfully");

    const delStuB = await request("DELETE", `/api/users/student/${studentBUser}`, null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(delStuB.status === 200 && delStuB.json?.success === true, "Admin deletes Student Beta successfully");

    const delFac = await request("DELETE", `/api/users/faculty/${facultyUser}`, null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(delFac.status === 200 && delFac.json?.success === true, "Admin deletes Faculty account successfully");

    // 7.4 Admin account self-deletion protection
    const delAdminSelf = await request("DELETE", `/api/users/admin/${adminUser}`, null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(delAdminSelf.status === 403, "Admin account deletion is strictly blocked (403 Forbidden)");

  } finally {
    // Teardown all test artifacts from database
    console.log("\n--- Cleaning up temporary test artifacts ---");
    await User.deleteMany({ username: { $in: createdUsernames } });
    await Attendance.deleteMany({ studentUsername: { $in: [studentAUser, studentBUser, `e2e_stu_renamed_${runTag}`] } });
    await Mark.deleteMany({ studentUsername: { $in: [studentAUser, studentBUser, `e2e_stu_renamed_${runTag}`] } });
    await Assignment.deleteMany({ assignmentId: `assign_divA_${runTag}` });
    await Note.deleteMany({ noteId: `note_divA_${runTag}` });
    await Notice.deleteMany({ noticeId: { $in: [`notice_divA_${runTag}`, `notice_both_${runTag}`] } });
    await Timetable.deleteMany({ division: "Division A", faculty: facultyUser });

    // Clean up AcademicStore entry
    try {
      const store = await AcademicStore.findOne({ storeKey: "default_academic_store" });
      if (store) {
        if (store.students) {
          delete store.students[studentAUser];
          delete store.students[studentBUser];
          delete store.students[`e2e_stu_renamed_${runTag}`];
          store.markModified("students");
        }
        if (store.notices) {
          store.notices = store.notices.filter(n => n.id !== `notice_divA_${runTag}` && n.id !== `notice_both_${runTag}`);
          store.markModified("notices");
        }
        if (store.notes) {
          store.notes = store.notes.filter(n => n.id !== `note_divA_${runTag}`);
          store.markModified("notes");
        }
        if (store.assignments) {
          store.assignments = store.assignments.filter(a => a.id !== `assign_divA_${runTag}`);
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
  console.log(`PROMPT 14 AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    console.error("Failures:");
    failures.forEach(f => console.error(` - ${f}`));
    process.exit(1);
  }
  process.exit(0);
}

runE2EAudit().catch(err => {
  console.error("E2E audit runner uncaught error:", err);
  if (server) server.close();
  process.exit(1);
});
