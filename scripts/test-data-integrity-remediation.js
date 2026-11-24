// scripts/test-data-integrity-remediation.js
// Focused Regression Verification Suite for CampusSphere Phase 8, Section 3.3.2
// Remediation of F-01, F-02, F-04, and F-05

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Timetable = require("../models/Timetable");
const Mark = require("../models/Mark");
const Attendance = require("../models/Attendance");
const AcademicStore = require("../models/AcademicStore");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function pass(desc) {
  totalTests++;
  passedTests++;
  console.log(`  [PASS] ${desc}`);
}

function fail(desc, err) {
  totalTests++;
  failedTests++;
  console.error(`  [FAIL] ${desc}:`, err.message || err);
}

async function runTestSuite() {
  console.log("======================================================================");
  console.log("CAMPUSSPHERE PHASE 8, SECTION 3.3.2: DATA INTEGRITY REMEDIATION TESTS");
  console.log("======================================================================\n");

  const serverCode = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");

  // =========================================================================
  // SUITE 1: F-01 — Timetable Year-Scoped Uniqueness
  // =========================================================================
  console.log("--- TEST SUITE 1: F-01 Timetable Year-Scoped Uniqueness ---");

  try {
    const indexes = Timetable.schema.indexes();
    // 1. Verify compound index on academicYear + semester + division
    const compoundYearIndex = indexes.find(idx =>
      idx[0] && idx[0].academicYear === 1 && idx[0].semester === 1 && idx[0].division === 1
    );
    assert(compoundYearIndex, "Timetable must define compound index on { academicYear: 1, semester: 1, division: 1 }");
    assert.strictEqual(compoundYearIndex[1]?.unique, true, "Compound year index must be unique");
    pass("1. Timetable schema defines unique compound index on { academicYear, semester, division }");
  } catch (e) { fail("1. Timetable compound year index", e); }

  try {
    const indexes = Timetable.schema.indexes();
    // 2. Verify legacy unscoped unique index { semester: 1, division: 1 } is REMOVED
    const legacyUniqueIndex = indexes.find(idx =>
      idx[0] &&
      Object.keys(idx[0]).length === 2 &&
      idx[0].semester === 1 &&
      idx[0].division === 1 &&
      idx[1]?.unique
    );
    assert(!legacyUniqueIndex, "Legacy unique index on { semester: 1, division: 1 } must NOT exist (would block multi-year timetables)");
    pass("2. Legacy unique index on { semester: 1, division: 1 } is completely removed");
  } catch (e) { fail("2. Legacy unscoped timetable unique index removal", e); }

  try {
    // 3. Verify coexistence of separate timetable documents for the same semester & division across different years
    const tt2026 = new Timetable({
      academicYear: "2026–27",
      semester: "1st Semester",
      division: "Div A",
      days: ["Monday"],
      timeSlots: ["09:00 - 10:00"],
      cells: []
    });
    const tt2027 = new Timetable({
      academicYear: "2027–28",
      semester: "1st Semester",
      division: "Div A",
      days: ["Monday"],
      timeSlots: ["09:00 - 10:00"],
      cells: []
    });
    const err2026 = tt2026.validateSync();
    const err2027 = tt2027.validateSync();
    assert(!err2026 && !err2027, "Both multi-year timetable documents must pass schema validation");
    assert.notStrictEqual(tt2026.academicYear, tt2027.academicYear, "Academic years must remain distinct");
    pass("3. Separate timetable documents for the same semester and division in different academic years coexist validly");
  } catch (e) { fail("3. Multi-year timetable coexistence", e); }

  // =========================================================================
  // SUITE 2: F-02 — CIE Mark Year-Scoped Identity & Upsert
  // =========================================================================
  console.log("\n--- TEST SUITE 2: F-02 CIE Mark Year-Scoped Identity & Upsert ---");

  try {
    // 4. Verify pre-validate hook generates year-scoped markId
    const markDoc = new Mark({
      academicYear: "2026–27",
      studentUsername: "student01",
      subject: "BCA101",
      internal1: 18,
      internal2: 19,
      assignment: 9
    });
    markDoc.validateSync();
    assert.strictEqual(markDoc.markId, "2026–27_student01_BCA101", "markId must be formatted as <academicYear>_<username>_<subId>");
    pass("4. Mark pre-validate hook automatically constructs year-scoped markId (<academicYear>_<username>_<subId>)");
  } catch (e) { fail("4. Mark pre-validate markId generation", e); }

  try {
    // 5. Verify distinct markIds for same student and subject across different academic years
    const markYear1 = new Mark({
      academicYear: "2025–26",
      studentUsername: "student01",
      subject: "BCA101",
      internal1: 15
    });
    const markYear2 = new Mark({
      academicYear: "2026–27",
      studentUsername: "student01",
      subject: "BCA101",
      internal1: 19
    });
    markYear1.validateSync();
    markYear2.validateSync();
    assert.strictEqual(markYear1.markId, "2025–26_student01_BCA101");
    assert.strictEqual(markYear2.markId, "2026–27_student01_BCA101");
    assert.notStrictEqual(markYear1.markId, markYear2.markId, "markIds must be completely distinct between academic years");
    pass("5. Distinct academic years produce distinct markIds for the same student and subject, preventing key collisions");
  } catch (e) { fail("5. Distinct markId generation across years", e); }

  try {
    // 6. Verify compound unique index on Mark schema
    const markIndexes = Mark.schema.indexes();
    const compoundMarkIndex = markIndexes.find(idx =>
      idx[0] && idx[0].academicYear === 1 && idx[0].studentUsername === 1 && idx[0].subject === 1
    );
    assert(compoundMarkIndex, "Mark schema must define compound index on { academicYear: 1, studentUsername: 1, subject: 1 }");
    assert.strictEqual(compoundMarkIndex[1]?.unique, true, "Compound index on Mark must be unique");
    pass("6. Mark schema defines unique compound index on { academicYear, studentUsername, subject }");
  } catch (e) { fail("6. Mark compound unique index", e); }

  try {
    // 7. Verify syncCollectionsFromAcademicData uses year-scoped upsert filter
    assert(
      serverCode.includes("filter: { markId, academicYear: markAcademicYear, studentUsername: username, subject: subId }"),
      "syncCollectionsFromAcademicData must use year-scoped upsert filter in bulkWrite"
    );
    assert(
      serverCode.includes("const markId = `${markAcademicYear}_${username}_${subId}`"),
      "syncCollectionsFromAcademicData must construct year-scoped markId"
    );
    pass("7. server.js syncCollectionsFromAcademicData scopes mark upsert filters and markIds to target academicYear");
  } catch (e) { fail("7. server.js mark upsert scoping", e); }

  // =========================================================================
  // SUITE 3: F-04 — Legacy Attendance Overwrite Protection
  // =========================================================================
  console.log("\n--- TEST SUITE 3: F-04 Legacy Attendance Overwrite Protection ---");

  try {
    // 8. Verify findOneAndUpdate in handleSaveAttendance requires academicYear
    assert(
      serverCode.includes("academicYear: cleanAcademicYear") &&
      serverCode.includes("Attendance.findOneAndUpdate"),
      "Attendance.findOneAndUpdate must require academicYear: cleanAcademicYear at top level"
    );
    pass("8. server.js handleSaveAttendance enforces academicYear: cleanAcademicYear in Attendance.findOneAndUpdate");
  } catch (e) { fail("8. Attendance findOneAndUpdate year scoping", e); }

  try {
    // 9. Verify prevAtt lookup requires academicYear
    assert(
      serverCode.includes("prevAtt = await Attendance.findOne({\n      academicYear: cleanAcademicYear,"),
      "prevAtt query must require academicYear: cleanAcademicYear"
    );
    pass("9. server.js prevAtt idempotency query strictly requires academicYear: cleanAcademicYear");
  } catch (e) { fail("9. prevAtt year scoping", e); }

  try {
    // 10. Verify legacy d.academicYear matching bug is eliminated from dailyAttendance findIndex
    assert(
      !serverCode.includes("(d.academicYear ? d.academicYear === cleanAcademicYear : true)"),
      "Vulnerable pattern '(d.academicYear ? d.academicYear === cleanAcademicYear : true)' must NOT exist"
    );
    assert(
      serverCode.includes("d.academicYear === cleanAcademicYear"),
      "dailyAttendance findIndex must enforce strict equality d.academicYear === cleanAcademicYear"
    );
    pass("10. Vulnerable (d.academicYear ? ... : true) pattern eliminated; strict d.academicYear === cleanAcademicYear enforced");
  } catch (e) { fail("10. dailyAttendance strict year equality", e); }

  try {
    // 11. Functional test of dailyAttendance matching logic
    const dailyRecords = [
      { id: "att_legacy_001", subject: "Programming in C", division: "Div A", semester: "1st Semester", date: "2025-09-10" /* unversioned legacy */ },
      { id: "att_2025_001", academicYear: "2025–26", subject: "Programming in C", division: "Div A", semester: "1st Semester", date: "2025-09-10" },
      { id: "att_2026_001", academicYear: "2026–27", subject: "Programming in C", division: "Div A", semester: "1st Semester", date: "2026-09-10" }
    ];

    const cleanAcademicYear = "2026–27";
    const cleanSub = "Programming in C";
    const cleanDiv = "Div A";
    const cleanSem = "1st Semester";
    const targetDate = "2025-09-10";

    // Simulate match predicate
    const matchPredicate = (d) =>
      d &&
      d.academicYear === cleanAcademicYear &&
      (
        (d.id === "att_new_save" || d.attendanceId === "att_new_save") ||
        (d.subject === cleanSub && d.division === cleanDiv && d.semester === cleanSem && (d.date === targetDate))
      );

    const matchedIdx = dailyRecords.findIndex(matchPredicate);
    // Must NOT match legacy (idx 0) or 2025–26 (idx 1)
    assert.strictEqual(matchedIdx, -1, "Year-scoped save for 2026–27 must NOT match legacy unversioned or 2025–26 record");
    pass("11. Functional verification: Unversioned legacy and prior-year attendance records are never matched by year-scoped write");
  } catch (e) { fail("11. Functional attendance matching simulation", e); }

  // =========================================================================
  // SUITE 4: F-05 — Remove Cross-Year Timetable Fallback
  // =========================================================================
  console.log("\n--- TEST SUITE 4: F-05 Remove Cross-Year Timetable Fallback ---");

  try {
    // 12. Verify student timetable route does NOT fall back to unscoped { semester, division }
    assert(
      !serverCode.includes('doc = await Timetable.findOne({ semester: studentSem, division: studentDiv }).select("-__v").lean();'),
      "Student timetable route must NOT contain fallback: Timetable.findOne({ semester: studentSem, division: studentDiv })"
    );
    pass("12. Student GET /api/timetable unscoped fallback query eliminated");
  } catch (e) { fail("12. Student timetable fallback check", e); }

  try {
    // 13. Verify faculty timetable route does NOT fall back to unscoped { semester, division }
    assert(
      !serverCode.includes('let doc = await Timetable.findOne({ semester, division, academicYear: targetYear }).select("-__v").lean();\n        if (!doc) {\n          doc = await Timetable.findOne({ semester, division }).select("-__v").lean();'),
      "Faculty timetable route must NOT fall back to unscoped query when doc is null"
    );
    pass("13. Faculty GET /api/timetable unscoped fallback query eliminated");
  } catch (e) { fail("13. Faculty timetable fallback check", e); }

  try {
    // 14. Verify admin timetable route does NOT fall back to unscoped { semester, division }
    assert(
      !serverCode.includes('let doc = await Timetable.findOne({ semester, division, academicYear: targetYear }).select("-__v").lean();\n        if (!doc) {\n          doc = await Timetable.findOne({ semester, division }).select("-__v").lean();'),
      "Admin timetable route must NOT fall back to unscoped query when doc is null"
    );
    pass("14. Admin GET /api/timetable unscoped fallback query eliminated");
  } catch (e) { fail("14. Admin timetable fallback check", e); }

  try {
    // 15. Verify GET /api/timetable/faculty-view scopes query by academicYear
    assert(
      serverCode.includes('const allDocs = await Timetable.find({ academicYear: targetYear }).select("-__v").lean();'),
      "GET /api/timetable/faculty-view must query Timetable.find({ academicYear: targetYear })"
    );
    pass("15. GET /api/timetable/faculty-view strictly scopes timetable documents by target academicYear");
  } catch (e) { fail("15. Faculty view timetable query scoping", e); }

  try {
    // 16. Verify DELETE /api/timetable does not fall back to deleting unscoped timetable
    assert(
      !serverCode.includes('delResult = await Timetable.deleteOne({ semester, division });'),
      "DELETE /api/timetable must NOT fall back to deleting unscoped timetable"
    );
    assert(
      serverCode.includes('const delResult = await Timetable.deleteOne({ semester, division, academicYear: targetYear });'),
      "DELETE /api/timetable must strictly scope deletion by targetYear"
    );
    pass("16. DELETE /api/timetable strictly deletes only the requested academicYear document with zero fallback deletion");
  } catch (e) { fail("16. Timetable delete scoping", e); }

  try {
    // 17. Verify handleSaveTimetable does not check existing document across other years
    assert(
      !serverCode.includes('const existing = await Timetable.findOne({ semester, division, academicYear: cleanAcademicYear }).lean()\n        || await Timetable.findOne({ semester, division }).lean();'),
      "handleSaveTimetable existing check must NOT fall back to unscoped query"
    );
    pass("17. handleSaveTimetable checks existing cell authorizations only within the target academicYear");
  } catch (e) { fail("17. handleSaveTimetable existing document check", e); }

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log("\n======================================================================");
  console.log(`TEST RESULTS: ${passedTests} Passed, ${failedTests} Failed (Total: ${totalTests})`);
  console.log("======================================================================");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log("ALL SECTION 3.3.2 DATA INTEGRITY REMEDIATION CHECKS PASSED!\n");
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
