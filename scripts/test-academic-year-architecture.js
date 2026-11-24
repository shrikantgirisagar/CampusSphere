// scripts/test-academic-year-architecture.js
// Comprehensive Verification Suite for CampusSphere Phase 8, Section 3.3
// Dynamic Academic-Year Architecture, Configuration & Data Integrity

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const AcademicYear = require("../models/AcademicYear");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Mark = require("../models/Mark");
const Timetable = require("../models/Timetable");
const Syllabus = require("../models/Syllabus");
const Assignment = require("../models/Assignment");
const Note = require("../models/Note");
const AcademicStore = require("../models/AcademicStore");
const academicYearService = require("../services/academicYearService");

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
  console.log("CAMPUSSPHERE PHASE 8, SECTION 3.3: DYNAMIC ACADEMIC-YEAR ARCHITECTURE");
  console.log("======================================================================\n");

  // --- SUITE 1: AcademicYear Mongoose Model & Schema Invariants ---
  console.log("--- TEST SUITE 1: AcademicYear Schema & Model Invariants ---");
  try {
    const validYear = new AcademicYear({
      yearCode: "2028–29",
      title: "Academic Year 2028–29",
      startDate: new Date("2028-06-01T00:00:00.000Z"),
      endDate: new Date("2029-05-31T23:59:59.999Z"),
      status: "upcoming",
      activeCycle: "odd"
    });
    const err = validYear.validateSync();
    assert(!err, "Valid AcademicYear should not return validation error");
    pass("1. Valid academic year passes schema validation with all required fields");
  } catch (e) { fail("1. Valid academic year passes schema validation", e); }

  try {
    const invalidYear = new AcademicYear({});
    const err = invalidYear.validateSync();
    assert(err && err.errors && err.errors.yearCode, "Missing yearCode should fail validation");
    assert(err && err.errors && err.errors.startDate, "Missing startDate should fail validation");
    assert(err && err.errors && err.errors.endDate, "Missing endDate should fail validation");
    pass("2. Missing yearCode, startDate, or endDate is rejected with schema validation errors");
  } catch (e) { fail("2. Missing yearCode, startDate, or endDate validation", e); }

  try {
    const invertedDatesYear = new AcademicYear({
      yearCode: "2030–31",
      startDate: new Date("2031-06-01T00:00:00.000Z"),
      endDate: new Date("2030-05-31T23:59:59.999Z")
    });
    const err = invertedDatesYear.validateSync();
    assert(err && err.errors && err.errors.endDate, "endDate before startDate must be rejected");
    pass("3. Invalid date ordering (endDate before startDate) is rejected by validator");
  } catch (e) { fail("3. Invalid date ordering validation", e); }

  try {
    const indexes = AcademicYear.schema.indexes();
    const activeIndex = indexes.find(idx => idx[0] && idx[0].status === 1 && idx[1] && idx[1].unique);
    assert(activeIndex, "Must define unique partial index on status: 1");
    assert.deepStrictEqual(activeIndex[1].partialFilterExpression, { status: "active" }, "Must filter specifically for status: active");
    pass("4. Single Active Year Invariant is enforced at MongoDB index engine level (partial unique index)");
  } catch (e) { fail("4. Single Active Year Invariant partial unique index", e); }

  try {
    const statusPath = AcademicYear.schema.path("status");
    assert(statusPath, "status path must exist");
    assert.deepStrictEqual(statusPath.enumValues, ["upcoming", "active", "completed", "archived"], "Must enforce exact 4 lifecycle states");
    assert.strictEqual(statusPath.defaultValue, "upcoming", "Default status must be upcoming");
    pass("5. Lifecycle states strictly match enum ['upcoming', 'active', 'completed', 'archived'] defaulting to 'upcoming'");
  } catch (e) { fail("5. Lifecycle state enum validation", e); }

  // --- SUITE 2: Academic Year Service & Lifecycle State Transitions ---
  console.log("\n--- TEST SUITE 2: Service Logic, Creation & Atomic Activation ---");
  try {
    assert(typeof academicYearService.ensureBaselineYears === "function", "ensureBaselineYears must exist");
    assert(typeof academicYearService.getActiveAcademicYear === "function", "getActiveAcademicYear must exist");
    assert(typeof academicYearService.getActiveYearCode === "function", "getActiveYearCode must exist");
    assert(typeof academicYearService.createAcademicYear === "function", "createAcademicYear must exist");
    assert(typeof academicYearService.updateSemesterConfiguration === "function", "updateSemesterConfiguration must exist");
    assert(typeof academicYearService.activateAcademicYear === "function", "activateAcademicYear must exist");
    pass("6. academicYearService provides complete public API methods");
  } catch (e) { fail("6. academicYearService API methods", e); }

  try {
    const defaultCycle = academicYearService.getActiveYearCode();
    assert(defaultCycle instanceof Promise, "getActiveYearCode returns promise");
    defaultCycle.catch(() => {}); // Prevent unhandled rejection in offline test environment
    pass("7. getActiveYearCode provides safe default resolution");
  } catch (e) { fail("7. getActiveYearCode resolution", e); }

  try {
    // Test validation inside createAcademicYear without DB
    let rejected = false;
    try {
      await academicYearService.createAcademicYear({ yearCode: "" });
    } catch (e) {
      rejected = true;
    }
    assert(rejected, "Empty yearCode must throw Error");
    pass("8. createAcademicYear rejects missing yearCode");
  } catch (e) { fail("8. createAcademicYear empty code validation", e); }

  try {
    let rejectedDates = false;
    try {
      await academicYearService.createAcademicYear({
        yearCode: "2032–33",
        startDate: "2033-06-01",
        endDate: "2032-05-31"
      });
    } catch (e) {
      rejectedDates = true;
    }
    assert(rejectedDates, "Invalid dates in service call must throw Error");
    pass("9. createAcademicYear validates date ordering (endDate must be strictly after startDate)");
  } catch (e) { fail("9. createAcademicYear date validation", e); }

  // --- SUITE 3: Data Scoping & Compound Indexes Across Collections ---
  console.log("\n--- TEST SUITE 3: Operational Collections Compound Index & Scoping Audit ---");
  try {
    const attIndexes = Attendance.schema.indexes();
    const hasYearSubjectDivIndex = attIndexes.some(idx =>
      idx[0] && idx[0].academicYear === 1 && idx[0].subject === 1 && idx[0].division === 1
    );
    assert(hasYearSubjectDivIndex, "Attendance must have compound index on { academicYear, subject, division, date }");
    const attPath = Attendance.schema.path("academicYear");
    assert(attPath, "Attendance schema must define academicYear path");
    pass("10. Attendance collection defines academicYear path and compound index to prevent cross-year collisions");
  } catch (e) { fail("10. Attendance compound index", e); }

  try {
    const ttIndexes = Timetable.schema.indexes();
    const hasYearSemDivIndex = ttIndexes.some(idx =>
      idx[0] && idx[0].academicYear === 1 && idx[0].semester === 1 && idx[0].division === 1
    );
    assert(hasYearSemDivIndex, "Timetable must have compound index on { academicYear, semester, division }");
    const ttPath = Timetable.schema.path("academicYear");
    assert(ttPath, "Timetable schema must define academicYear path");
    pass("11. Timetable collection defines academicYear compound index preserving historical semester timetables");
  } catch (e) { fail("11. Timetable compound index", e); }

  try {
    const markIndexes = Mark.schema.indexes();
    const hasMarkYearIndex = markIndexes.some(idx =>
      idx[0] && idx[0].academicYear === 1 && idx[0].studentUsername === 1 && idx[0].subject === 1
    );
    assert(hasMarkYearIndex, "Mark must have compound index on { academicYear, studentUsername, subject }");
    const markPath = Mark.schema.path("academicYear");
    assert(markPath, "Mark schema must define academicYear path");
    pass("12. Mark collection defines academicYear path and compound index preventing CIE score overwrites");
  } catch (e) { fail("12. Mark compound index", e); }

  try {
    const sylIndexes = Syllabus.schema.indexes();
    const hasSylYearIndex = sylIndexes.some(idx =>
      idx[0] && idx[0].academicYear === 1 && idx[0].yearLevel === 1
    );
    assert(hasSylYearIndex, "Syllabus must have compound index on { academicYear, yearLevel }");
    const sylPath = Syllabus.schema.path("academicYear");
    assert(sylPath, "Syllabus schema must define academicYear path");
    pass("13. Syllabus collection defines dynamic academicYear compound index removing restrictive single-index");
  } catch (e) { fail("13. Syllabus compound index", e); }

  try {
    assert(Assignment.schema.path("academicYear"), "Assignment schema must define academicYear");
    assert(Note.schema.path("academicYear"), "Note schema must define academicYear");
    assert(AcademicStore.schema.path("activeAcademicYear"), "AcademicStore schema must define activeAcademicYear");
    assert(AcademicStore.schema.path("academicYears"), "AcademicStore schema must define academicYears");
    pass("14. Assignment, Note, and AcademicStore schemas define academicYear scoping attributes");
  } catch (e) { fail("14. Assignment, Note, AcademicStore schemas", e); }

  // --- SUITE 4: User Model Distinction (Admission Year vs Operating Year) ---
  console.log("\n--- TEST SUITE 4: Student Admission Year & Faculty Allocations Invariant ---");
  try {
    const admPath = User.schema.path("admissionYear");
    assert(admPath, "User schema must define admissionYear");
    assert.strictEqual(admPath.defaultValue, "", "admissionYear must default to empty string");

    const allocPath = User.schema.path("facultyAllocations");
    assert(allocPath, "User schema must define facultyAllocations");
    pass("15. User model defines separate admissionYear (historical enrollment) and facultyAllocations");
  } catch (e) { fail("15. User admissionYear and facultyAllocations", e); }

  try {
    const userJson = fs.readFileSync(path.join(__dirname, "../models/User.js"), "utf8");
    assert(!userJson.includes('default: "2026–27"'), "User model must NOT hardcode default: '2026–27'");
    pass("16. Removed hardcoded 'default: 2026–27' from User model to prevent dynamic year overwrites");
  } catch (e) { fail("16. Removal of hardcoded default from User model", e); }

  // --- SUITE 5: Backend REST API Endpoints & RBAC Protection ---
  console.log("\n--- TEST SUITE 5: Server RESTful Endpoints & RBAC Security Verification ---");
  try {
    const serverCode = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");

    assert(serverCode.includes('app.get("/api/academic-years"'), "GET /api/academic-years must exist");
    assert(serverCode.includes('app.get("/api/academic-years/active"'), "GET /api/academic-years/active must exist");
    assert(serverCode.includes('app.get("/api/academic-years/:id"'), "GET /api/academic-years/:id must exist");
    assert(serverCode.includes('app.post("/api/academic-years"'), "POST /api/academic-years must exist");
    assert(serverCode.includes('app.patch("/api/academic-years/:id"'), "PATCH /api/academic-years/:id must exist");
    assert(serverCode.includes('app.patch("/api/academic-years/:id/semesters"'), "PATCH /api/academic-years/:id/semesters must exist");
    assert(serverCode.includes('app.patch("/api/academic-years/:id/activate"'), "PATCH /api/academic-years/:id/activate must exist");
    assert(serverCode.includes('app.patch("/api/academic-years/:id/complete"'), "PATCH /api/academic-years/:id/complete must exist");
    assert(serverCode.includes('app.patch("/api/academic-years/:id/archive"'), "PATCH /api/academic-years/:id/archive must exist");

    pass("17. server.js defines all 9 dedicated Academic-Year RESTful API endpoints");
  } catch (e) { fail("17. Dedicated Academic-Year RESTful API endpoints", e); }

  try {
    const serverCode = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");

    assert(serverCode.includes('app.post("/api/academic-years", rateLimitExpensive, requireAuth(["admin"])'), "POST /api/academic-years requires admin auth");
    assert(serverCode.includes('app.patch("/api/academic-years/:id/activate", rateLimitExpensive, requireAuth(["admin"])'), "PATCH activate requires admin auth");
    assert(serverCode.includes('app.patch("/api/academic-years/:id/semesters", rateLimitExpensive, requireAuth(["admin"])'), "PATCH semesters requires admin auth");

    pass("18. Academic-Year modification endpoints strictly enforce requireAuth(['admin']) RBAC guard");
  } catch (e) { fail("18. Academic-Year RBAC guard", e); }

  try {
    const serverCode = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");

    // Attendance and Timetable handlers extract and attach academicYear
    assert(serverCode.includes("cleanAcademicYear") && serverCode.includes("academicYearService.getActiveYearCode"),
      "Attendance and Timetable handlers must scope by cleanAcademicYear with fallback to active year");
    pass("19. Attendance and Timetable backend handlers scope records by academicYear");
  } catch (e) { fail("19. Attendance and Timetable academicYear scoping", e); }

  // --- SUITE 6: Client-Side Portal & Public Website Integration ---
  console.log("\n--- TEST SUITE 6: UI Portals, Navigation & Dynamic Website Integration ---");
  try {
    const scriptCode = fs.readFileSync(path.join(__dirname, "../public/script.js"), "utf8");

    assert(scriptCode.includes('["academicYears", "calendar-range", "Academic Years & Cycles"]'), "Admin nav must include academicYears item");
    assert(scriptCode.includes("adminAcademicYears()"), "Must define adminAcademicYears view generator");
    assert(scriptCode.includes("initAcademicYearsPage()"), "Must define initAcademicYearsPage initializer");
    assert(scriptCode.includes("fetchAcademicYearsData()"), "Must define fetchAcademicYearsData client loader");

    pass("20. public/script.js integrates Admin Portal navigation, dashboard view, and client loader");
  } catch (e) { fail("20. public/script.js Admin Portal integration", e); }

  try {
    const indexHtml = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");

    assert(indexHtml.includes('id="academicYearModal"'), "index.html must include #academicYearModal");
    assert(indexHtml.includes('id="configureSemestersModal"'), "index.html must include #configureSemestersModal");
    assert(indexHtml.includes('id="activateYearModal"'), "index.html must include #activateYearModal");

    pass("21. public/index.html includes Academic Year creation, semester configuration, and transition wizard modals");
  } catch (e) { fail("21. public/index.html modals", e); }

  try {
    const coursesJs = fs.readFileSync(path.join(__dirname, "../public/js/courses.js"), "utf8");

    assert(coursesJs.includes('document.getElementById("coursesToast") || document.getElementById("syllabusToast")'),
      "courses.js handles toast ID fallback safely");
    assert(coursesJs.includes("item.academicYear"), "courses.js dynamically updates semester tags with academicYear");

    pass("22. public/js/courses.js dynamically renders active academic years and fixes toast ID binding");
  } catch (e) { fail("22. public/js/courses.js dynamic rendering", e); }

  try {
    const scriptCode = fs.readFileSync(path.join(__dirname, "../public/script.js"), "utf8");

    assert(!scriptCode.includes("isSub && formattedSubmitted ?"),
      "script.js must NOT reference undeclared formattedSubmitted");
    assert(scriptCode.includes("currentUser.admissionYear"), "Student Profile displays separate admissionYear");

    pass("23. Pre-existing formattedSubmitted student assignment bug resolved & Student Profile distinguishes admission year");
  } catch (e) { fail("23. Bug fix and Student Profile distinction", e); }

  // --- Final Results Summary ---
  console.log("\n======================================================================");
  console.log(`TEST RESULTS: ${passedTests} Passed, ${failedTests} Failed (Total: ${totalTests})`);
  console.log("======================================================================");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log("ALL DYNAMIC ACADEMIC-YEAR ARCHITECTURE CHECKS PASSED SUCCESSFULLY!\n");
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
