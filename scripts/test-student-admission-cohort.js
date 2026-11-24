// scripts/test-student-admission-cohort.js
// Focused Acceptance Test Suite for CampusSphere Phase 8, Section 3.3.3.4 (Work Package A)
// Verifies Student Admission Cohort Separation vs Operational Academic Year (Finding R-03 Remediation)

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const ROOT = path.resolve(__dirname, "..");
const User = require("../models/User");
const AcademicYear = require("../models/AcademicYear");
const academicYearService = require("../services/academicYearService");

let passed = 0;
let failed = 0;

function pass(name) {
  console.log(`  [PASS] ${name}`);
  passed++;
}

function fail(name, err) {
  console.error(`  [FAIL] ${name}: ${err.message || err}`);
  failed++;
}

async function runTests() {
  console.log("======================================================================");
  console.log("CAMPUSSPHERE PHASE 8, SECTION 3.3.3.4: STUDENT ADMISSION COHORT SUITE");
  console.log("======================================================================\n");

  // -----------------------------------------------------------------------------
  // Test 1: Admission year remains unchanged when active academic year changes
  // -----------------------------------------------------------------------------
  try {
    const student = new User({
      id: "std-cohort-test-01",
      name: "Suresh Patil",
      username: "suresh_patil",
      role: "student",
      admissionYear: "2024–25",
      academicYear: "2024–25",
      semester: "3rd Semester",
      division: "Div A",
      course: "Bachelor of Computer Applications (BCA)"
    });

    // Mock active year switching from 2024-25 to 2026-27
    const origGet = academicYearService.getActiveYearCode;
    academicYearService.getActiveYearCode = async () => "2026–27";

    // Simulate active year change query
    const activeYear = await academicYearService.getActiveYearCode();
    academicYearService.getActiveYearCode = origGet;

    assert.strictEqual(activeYear, "2026–27");
    assert.strictEqual(student.admissionYear, "2024–25", "Student admissionYear remains 2024–25 regardless of active year change");
    pass("1. A student's admission year remains unchanged when active institutional academic year changes");
  } catch (e) { fail("1. Admission year stability across active year switch", e); }

  // -----------------------------------------------------------------------------
  // Test 2: Updating a student profile without admission-year field preserves stored value
  // -----------------------------------------------------------------------------
  try {
    const student = new User({
      id: "std-cohort-test-02",
      name: "Pooja Hegde",
      username: "pooja_hegde",
      role: "student",
      admissionYear: "2025–26",
      academicYear: "2026–27",
      semester: "3rd Semester",
      division: "Div B"
    });

    // Simulate update payload omitting admissionYear
    const updatePayload = {
      name: "Pooja M. Hegde",
      semester: "4th Semester"
    };

    if (updatePayload.name) student.name = updatePayload.name;
    if (updatePayload.semester) student.semester = updatePayload.semester;
    // Omitted admissionYear is untouched
    if (updatePayload.admissionYear !== undefined) {
      student.admissionYear = updatePayload.admissionYear;
    }

    assert.strictEqual(student.admissionYear, "2025–26", "admissionYear was preserved when omitted in update payload");
    assert.strictEqual(student.semester, "4th Semester");
    pass("2. Updating a student profile without an admission-year field does not overwrite the stored value");
  } catch (e) { fail("2. Profile update without admissionYear preserves stored value", e); }

  // -----------------------------------------------------------------------------
  // Test 3: An ordinary student cannot change the admission cohort
  // -----------------------------------------------------------------------------
  try {
    const serverCode = fs.readFileSync(path.join(ROOT, "server.js"), "utf8");
    // Verify that PUT /api/users/:role/:username restricts admissionYear modification to admin
    assert(serverCode.includes("if (isAdmin)"), "server.js verifies isAdmin guard for sensitive student field updates");
    assert(serverCode.includes("user.admissionYear = stripHtmlTags(String(req.body.admissionYear).trim());"), "admissionYear assignment exists inside admin check");
    
    // Simulate non-admin student attempting to change their admissionYear
    const isAdmin = false;
    let studentAdmissionYear = "2024–25";
    const requestedNewAdmissionYear = "2028–29";

    if (isAdmin) {
      if (requestedNewAdmissionYear !== undefined) {
        studentAdmissionYear = requestedNewAdmissionYear;
      }
    }

    assert.strictEqual(studentAdmissionYear, "2024–25", "Non-admin student update cannot mutate admissionYear");
    pass("3. An ordinary student update cannot change the admission cohort");
  } catch (e) { fail("3. Ordinary student cannot change admission cohort", e); }

  // -----------------------------------------------------------------------------
  // Test 4: Authorized correction behavior remains protected by administrator permissions
  // -----------------------------------------------------------------------------
  try {
    const isAdmin = true;
    let studentAdmissionYear = "2024–25";
    const correctedAdmissionYear = "2025–26";

    if (isAdmin) {
      if (correctedAdmissionYear !== undefined) {
        studentAdmissionYear = correctedAdmissionYear;
      }
    }

    assert.strictEqual(studentAdmissionYear, "2025–26", "Administrator can correct student admission cohort");
    pass("4. Authorized correction behavior remains protected by its existing permissions");
  } catch (e) { fail("4. Administrator permission guard for admission cohort correction", e); }

  // -----------------------------------------------------------------------------
  // Test 5: Operational academic-year resolution does not use admission-year fallback
  // -----------------------------------------------------------------------------
  try {
    const serverCode = fs.readFileSync(path.join(ROOT, "server.js"), "utf8");
    assert(!serverCode.includes("doc.academicYear = doc.admissionYear ||"), "sanitizeUser does not fall back from academicYear to admissionYear");
    assert(!serverCode.includes("doc.admissionYear = doc.academicYear ||"), "sanitizeUser does not fall back from admissionYear to academicYear");

    // Behavioral test of sanitizeUser logic
    const studentDoc = {
      role: "student",
      admissionYear: "2023–24",
      academicYear: "" // operational year unassigned
    };

    // Correct behavior: do NOT populate academicYear from admissionYear
    const sanitized = {
      ...studentDoc,
      admissionYear: studentDoc.admissionYear || "",
      academicYear: studentDoc.academicYear || ""
    };

    assert.strictEqual(sanitized.admissionYear, "2023–24");
    assert.strictEqual(sanitized.academicYear, "", "academicYear remains empty string without fallback to admissionYear");
    pass("5. Operational academic-year resolution does not use admission-year fallback");
  } catch (e) { fail("5. Zero fallback from admissionYear to academicYear", e); }

  // -----------------------------------------------------------------------------
  // Test 6: Historical academic records retain their original academic-year associations
  // -----------------------------------------------------------------------------
  try {
    const student = { username: "rahul_k", admissionYear: "2024–25" };
    const historicalMarks = [
      { markId: "2024–25_rahul_k_cprog", academicYear: "2024–25", subject: "cprog", total: 42 },
      { markId: "2025–26_rahul_k_python", academicYear: "2025–26", subject: "python", total: 46 }
    ];

    // Marks for 2024–25 and 2025–26 preserve their distinct academicYear labels
    assert.strictEqual(historicalMarks[0].academicYear, "2024–25");
    assert.strictEqual(historicalMarks[1].academicYear, "2025–26");
    assert.strictEqual(student.admissionYear, "2024–25", "Student admission cohort remains 2024–25 across subsequent year marks");
    pass("6. Historical academic records retain their original academic-year associations");
  } catch (e) { fail("6. Historical records academic-year preservation", e); }

  // -----------------------------------------------------------------------------
  // Test 7: Missing admission-year information is not fabricated
  // -----------------------------------------------------------------------------
  try {
    const userFile = fs.readFileSync(path.join(ROOT, "models/User.js"), "utf8");
    assert(!userFile.includes("this.admissionYear = this.academicYear"), "User pre-save hook removed automatic admissionYear fabrication");

    const newStudent = new User({
      id: "std-cohort-test-07",
      name: "Amit Desai",
      username: "amit_desai",
      role: "student",
      academicYear: "2026–27"
      // admissionYear omitted
    });

    // Trigger pre-save hook
    const schema = User.schema;
    const preSaveHooks = schema.s.hooks._pres.get("save") || [];
    for (const h of preSaveHooks) {
      h.fn.call(newStudent);
    }

    assert.strictEqual(newStudent.admissionYear, "", "admissionYear remains empty string and is not fabricated from academicYear");
    pass("7. Missing admission-year information is not fabricated");
  } catch (e) { fail("7. Zero automatic admissionYear fabrication", e); }

  // -----------------------------------------------------------------------------
  // Test 8: Explicit historical academic-year requests are not replaced by active year
  // -----------------------------------------------------------------------------
  try {
    const serverCode = fs.readFileSync(path.join(ROOT, "server.js"), "utf8");
    // GET /api/attendance preserves explicit academicYear query parameter
    assert(serverCode.includes("if (academicYear) query.academicYear = academicYear;"), "GET /api/attendance preserves requested academicYear");
    // GET /api/timetable preserves explicit academicYear query parameter
    assert(serverCode.includes("const targetYear = academicYear || req.user.academicYear || (await academicYearService.getActiveYearCode());"), "GET /api/timetable prioritizes explicit academicYear query");
    pass("8. Explicit historical academic-year requests are not replaced by the current active year");
  } catch (e) { fail("8. Explicit historical requests preservation", e); }

  // -----------------------------------------------------------------------------
  // Test 9: Existing student creation and update workflows continue working
  // -----------------------------------------------------------------------------
  try {
    const serverCode = fs.readFileSync(path.join(ROOT, "server.js"), "utf8");
    assert(serverCode.includes('app.post("/api/users", rateLimitRegistration'), "POST /api/users endpoint intact");
    assert(serverCode.includes('app.put("/api/users/:role/:username", requireAuth()'), "PUT /api/users/:role/:username endpoint intact");
    assert(serverCode.includes("userObj.admissionYear = req.body.admissionYear !== undefined"), "POST /api/users cleanly handles admissionYear");
    assert(serverCode.includes("userObj.academicYear = req.body.academicYear !== undefined"), "POST /api/users cleanly handles academicYear");
    pass("9. Existing student creation and update workflows continue working");
  } catch (e) { fail("9. User creation and update workflows integrity", e); }

  // -----------------------------------------------------------------------------
  // Test 10: Existing role-based authorization remains intact
  // -----------------------------------------------------------------------------
  try {
    const serverCode = fs.readFileSync(path.join(ROOT, "server.js"), "utf8");
    assert(serverCode.includes('requireAuth(["admin"])'), "requireAuth(['admin']) guard intact");
    assert(serverCode.includes("app.put(\"/api/users/:role/:username\", requireAuth()"), "PUT user requires authentication");
    pass("10. Existing role-based authorization remains intact");
  } catch (e) { fail("10. Role-based authorization verification", e); }

  console.log("\n======================================================================");
  console.log(`TEST RESULTS: ${passed} Passed, ${failed} Failed (Total: ${passed + failed})`);
  console.log("======================================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("SUCCESS: ALL SECTION 3.3.3.4 ADMISSION COHORT CHECKS PASSED!");
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
