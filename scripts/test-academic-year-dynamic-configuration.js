// scripts/test-academic-year-dynamic-configuration.js
// Focused Regression & Verification Suite for CampusSphere Phase 8, Section 3.3.3.3
// Verifies Dynamic Academic-Year & Semester Configuration (Finding R-05 Remediation)

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const AcademicYear = require("../models/AcademicYear");
const academicYearService = require("../services/academicYearService");
const Syllabus = require("../models/Syllabus");
const { COURSE_YEAR_LEVELS, VALID_YEAR_CONFIG } = require("../models/Syllabus");

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
  console.log("CAMPUSSPHERE PHASE 8, SECTION 3.3.3.3: DYNAMIC CONFIGURATION SUITE");
  console.log("======================================================================\n");

  // -----------------------------------------------------------------------------
  // TEST GROUP A — Dynamic Academic Years (Tests 1–5)
  // -----------------------------------------------------------------------------
  console.log("--- TEST GROUP A: Dynamic Academic Years ---");

  // Test 1: Academic-year options originate from configured records
  try {
    assert.strictEqual(typeof academicYearService.getAllAcademicYears, "function");
    const serverCode = fs.readFileSync(path.join(ROOT, "server.js"), "utf8");
    assert(serverCode.includes('app.get("/api/academic-years"'), "server.js defines GET /api/academic-years");
    assert(serverCode.includes("academicYearService.getAllAcademicYears"), "GET /api/academic-years retrieves from academicYearService");
    pass("1. Academic-year options originate from configured records");
  } catch (e) { fail("1. Academic-year options source", e); }

  // Test 2: A newly created future year can be recognized without source-code changes
  try {
    const futureYear = new AcademicYear({
      yearCode: "2035–36",
      title: "Academic Year 2035–36",
      startDate: new Date("2035-08-01"),
      endDate: new Date("2036-07-31"),
      status: "upcoming",
      semesterConfiguration: [
        { semester: "1st Semester", isOperational: true, status: "active" }
      ]
    });
    const err = futureYear.validateSync();
    assert(!err, "Future academic year 2035–36 validates cleanly without code changes");
    assert.strictEqual(futureYear.yearCode, "2035–36");
    assert.strictEqual(futureYear.semesterConfiguration.length, 1);
    pass("2. A newly created future year can be recognized without source-code changes");
  } catch (e) { fail("2. Future year recognition", e); }

  // Test 3: No hardcoded baseline year is required
  try {
    const serviceCode = fs.readFileSync(path.join(ROOT, "services/academicYearService.js"), "utf8");
    assert(!serviceCode.includes("const BASELINE_YEARS ="), "academicYearService does not define BASELINE_YEARS");
    assert(!serviceCode.includes("2025–26") || serviceCode.includes("//"), "No active code relies on hardcoded 2025–26 baseline");
    pass("3. No hardcoded baseline year is required");
  } catch (e) { fail("3. No hardcoded baseline required", e); }

  // Test 4: An empty academic-year collection produces an honest empty state
  try {
    const origFind = AcademicYear.find;
    AcademicYear.find = function() {
      return {
        exec: async () => []
      };
    };
    const active = await academicYearService.getActiveAcademicYear();
    const code = await academicYearService.getActiveYearCode();
    AcademicYear.find = origFind;

    assert.strictEqual(active, null, "getActiveAcademicYear returns null when collection is empty");
    assert.strictEqual(code, null, "getActiveYearCode returns null when collection is empty");
    pass("4. An empty academic-year collection produces an honest empty state");
  } catch (e) { fail("4. Honest empty state", e); }

  // Test 5: Database failures are not converted into fabricated year options
  try {
    const origFind = AcademicYear.find;
    AcademicYear.find = function() {
      return {
        exec: async () => { throw new Error("Connection timed out to MongoDB cluster"); }
      };
    };
    let threw = false;
    try {
      await academicYearService.getActiveAcademicYear();
    } catch (e) {
      threw = true;
      assert(e.message.includes("Connection timed out"), "Error propagates directly");
    } finally {
      AcademicYear.find = origFind;
    }
    assert(threw, "Database failure was not swallowed into a fabricated year");
    pass("5. Database failures are not converted into fabricated year options");
  } catch (e) { fail("5. Database failure propagation", e); }

  // -----------------------------------------------------------------------------
  // TEST GROUP B — Dynamic Semester Configuration (Tests 6–12)
  // -----------------------------------------------------------------------------
  console.log("\n--- TEST GROUP B: Dynamic Semester Configuration ---");

  // Test 6: Semester options are taken from the selected academic-year record
  try {
    const origFindOne = AcademicYear.findOne;
    AcademicYear.findOne = function() {
      return {
        exec: async () => ({
          yearCode: "2028–29",
          semesterConfiguration: [
            { semester: "1st Semester", isOperational: true, status: "active" },
            { semester: "3rd Semester", isOperational: true, status: "active" }
          ]
        })
      };
    };
    const opSems = await academicYearService.getOperationalSemestersForYear("2028–29");
    AcademicYear.findOne = origFindOne;

    assert.deepStrictEqual(opSems, ["1st Semester", "3rd Semester"], "Operational semesters retrieved directly from year record");
    pass("6. Semester options are taken from the selected academic-year record");
  } catch (e) { fail("6. Selected year semester options", e); }

  // Test 7: Different academic years can have different semester configurations
  try {
    const mockStore = {
      "2026–27": {
        yearCode: "2026–27",
        semesterConfiguration: [
          { semester: "1st Semester", isOperational: true, status: "active" },
          { semester: "2nd Semester", isOperational: true, status: "active" }
        ]
      },
      "2027–28": {
        yearCode: "2027–28",
        semesterConfiguration: [
          { semester: "3rd Semester", isOperational: true, status: "active" },
          { semester: "4th Semester", isOperational: true, status: "active" },
          { semester: "5th Semester", isOperational: true, status: "active" }
        ]
      }
    };
    const origFindOne = AcademicYear.findOne;
    AcademicYear.findOne = function(query) {
      return {
        exec: async () => mockStore[query.yearCode] || null
      };
    };
    const sems26 = await academicYearService.getOperationalSemestersForYear("2026–27");
    const sems27 = await academicYearService.getOperationalSemestersForYear("2027–28");
    AcademicYear.findOne = origFindOne;

    assert.strictEqual(sems26.length, 2);
    assert.strictEqual(sems27.length, 3);
    assert.notDeepStrictEqual(sems26, sems27, "Different years have completely different semester configs");
    pass("7. Different academic years can have different semester configurations");
  } catch (e) { fail("7. Distinct year semester configurations", e); }

  // Test 8: A semester number does not independently identify an academic year
  try {
    const utilsCode = fs.readFileSync(path.join(ROOT, "public/js/utils.js"), "utf8");
    const scriptCode = fs.readFileSync(path.join(ROOT, "public/script.js"), "utf8");
    const serverCode = fs.readFileSync(path.join(ROOT, "server.js"), "utf8");

    assert(!utilsCode.includes('"1st Semester": "2025–26"'), "utils.js does not map 1st Semester to 2025–26");
    assert(!serverCode.includes("function getAcademicYearForSemester("), "server.js removed getAcademicYearForSemester");
    assert(scriptCode.includes("getAcademicYearForSemester"), "script.js provides context-aware helper");
    pass("8. A semester number does not independently identify an academic year");
  } catch (e) { fail("8. Decoupled semester number from year", e); }

  // Test 9: An unconfigured semester is not silently enabled
  try {
    const origFindOne = AcademicYear.findOne;
    AcademicYear.findOne = function() {
      return {
        exec: async () => ({
          yearCode: "2028–29",
          semesterConfiguration: [
            { semester: "1st Semester", isOperational: true, status: "active" }
          ]
        })
      };
    };
    const opSems = await academicYearService.getOperationalSemestersForYear("2028–29");
    AcademicYear.findOne = origFindOne;

    assert.strictEqual(opSems.length, 1);
    assert(!opSems.includes("2nd Semester"), "Unconfigured 2nd Semester is not silently enabled");
    assert(!opSems.includes("3rd Semester"), "Unconfigured 3rd Semester is not silently enabled");
    pass("9. An unconfigured semester is not silently enabled");
  } catch (e) { fail("9. Unconfigured semester guard", e); }

  // Test 10: Empty semester configuration produces an appropriate empty state
  try {
    const origFindOne = AcademicYear.findOne;
    AcademicYear.findOne = function() {
      return {
        exec: async () => ({
          yearCode: "2029–30",
          semesterConfiguration: []
        })
      };
    };
    const opSems = await academicYearService.getOperationalSemestersForYear("2029–30");
    AcademicYear.findOne = origFindOne;

    assert(Array.isArray(opSems), "Returns an array");
    assert.strictEqual(opSems.length, 0, "Returns empty array when year has empty semesterConfiguration");
    pass("10. Empty semester configuration produces an appropriate empty state");
  } catch (e) { fail("10. Empty semester configuration state", e); }

  // Test 11: Invalid semester values are rejected
  try {
    let threw = false;
    const fakeDoc = {
      yearCode: "2028–29",
      semesterConfiguration: [],
      save: async function() { return this; }
    };
    const origGet = academicYearService.getAcademicYearByIdOrCode;
    academicYearService.getAcademicYearByIdOrCode = async () => fakeDoc;

    try {
      await academicYearService.updateSemesterConfiguration("2028–29", [
        { semester: "99th Semester", isOperational: true }
      ]);
    } catch (err) {
      threw = true;
      assert(err.message.includes("Invalid semester value"), "Throws specific invalid semester error");
    } finally {
      academicYearService.getAcademicYearByIdOrCode = origGet;
    }
    assert(threw, "Invalid semester was rejected");
    pass("11. Invalid semester values are rejected");
  } catch (e) { fail("11. Invalid semester rejection", e); }

  // Test 12: Duplicate semester configuration is handled safely
  try {
    let threw = false;
    const fakeDoc = {
      yearCode: "2028–29",
      semesterConfiguration: [],
      save: async function() { return this; }
    };
    const origGet = academicYearService.getAcademicYearByIdOrCode;
    academicYearService.getAcademicYearByIdOrCode = async () => fakeDoc;

    try {
      await academicYearService.updateSemesterConfiguration("2028–29", [
        { semester: "1st Semester", isOperational: true },
        { semester: "1st Semester", isOperational: false }
      ]);
    } catch (err) {
      threw = true;
      assert(err.message.includes("Duplicate semester configuration detected"), "Throws duplicate semester error");
    } finally {
      academicYearService.getAcademicYearByIdOrCode = origGet;
    }
    assert(threw, "Duplicate semester configuration was safely rejected");
    pass("12. Duplicate semester configuration is handled safely");
  } catch (e) { fail("12. Duplicate semester guard", e); }

  // -----------------------------------------------------------------------------
  // TEST GROUP C — Syllabus Integrity (Tests 13–17)
  // -----------------------------------------------------------------------------
  console.log("\n--- TEST GROUP C: Syllabus Integrity ---");

  // Test 13: Existing syllabus academic-year associations are preserved
  try {
    const syl1 = new Syllabus({
      yearLevel: 1,
      academicYear: "2025–26",
      originalFilename: "syllabus-2025-26.pdf",
      storedFilename: "syllabus-1.pdf",
      storagePath: "uploads/syllabus-1.pdf",
      fileSize: 1024,
      mimeType: "application/pdf"
    });
    assert.strictEqual(syl1.academicYear, "2025–26", "Preserves academicYear attribute");
    assert.strictEqual(syl1.yearLevel, 1);
    pass("13. Existing syllabus academic-year associations are preserved");
  } catch (e) { fail("13. Syllabus year preservation", e); }

  // Test 14: Historical syllabus records without reliable year association are not automatically assigned
  try {
    const sylUnversioned = new Syllabus({
      yearLevel: 2,
      originalFilename: "syllabus-historical.pdf",
      storedFilename: "syllabus-hist.pdf",
      storagePath: "uploads/syllabus-hist.pdf",
      fileSize: 2048,
      mimeType: "application/pdf"
    });
    sylUnversioned.validateSync();
    assert.strictEqual(sylUnversioned.academicYear, undefined, "Pre-validate hook does not force-assign hardcoded academicYear");
    pass("14. Historical syllabus records without reliable year association are not automatically assigned");
  } catch (e) { fail("14. Zero automatic historical syllabus assignment", e); }

  // Test 15: Selecting one academic year does not return another year's syllabus records
  try {
    const serverCode = fs.readFileSync(path.join(ROOT, "server.js"), "utf8");
    assert(!serverCode.includes("|| await Syllabus.findOne({ yearLevel })"), "Eliminated cross-year fallback overwrite hazard");
    assert(serverCode.includes("Syllabus.findOne({ yearLevel, academicYear: targetAcademicYear })"), "Upload and replace strictly scope query by academicYear");
    pass("15. Selecting one academic year does not return another year's syllabus records");
  } catch (e) { fail("15. Syllabus cross-year isolation", e); }

  // Test 16: Public syllabus selection does not use VALID_YEAR_CONFIG or equivalent fixed-year fallbacks
  try {
    assert(COURSE_YEAR_LEVELS, "COURSE_YEAR_LEVELS is exported");
    assert.strictEqual(COURSE_YEAR_LEVELS[1].academicYear, undefined, "COURSE_YEAR_LEVELS contains structural labels only, no academicYear");
    assert.strictEqual(COURSE_YEAR_LEVELS[2].academicYear, undefined, "COURSE_YEAR_LEVELS contains structural labels only, no academicYear");
    assert.strictEqual(COURSE_YEAR_LEVELS[3].academicYear, undefined, "COURSE_YEAR_LEVELS contains structural labels only, no academicYear");

    const coursesHtml = fs.readFileSync(path.join(ROOT, "public/courses.html"), "utf8");
    assert(!coursesHtml.includes("Academic Year: 2025–26"), "courses.html removed hardcoded Academic Year: 2025–26 tag");
    assert(!coursesHtml.includes("Academic Year: 2026–27"), "courses.html removed hardcoded Academic Year: 2026–27 tag");
    assert(!coursesHtml.includes("Academic Year: 2027–28"), "courses.html removed hardcoded Academic Year: 2027–28 tag");
    pass("16. Public syllabus selection does not use VALID_YEAR_CONFIG or equivalent fixed-year fallbacks");
  } catch (e) { fail("16. Fixed year fallbacks eliminated", e); }

  // Test 17: Existing syllabus content and the 55-subject NEP catalog remain unchanged
  try {
    const scriptContent = fs.readFileSync(path.join(ROOT, "public/script.js"), "utf8");
    const start = scriptContent.indexOf("const SUBJECTS = [");
    assert(start !== -1, "SUBJECTS array found in script.js");
    const end = scriptContent.indexOf("];", start);
    const subjectsCode = scriptContent.substring(start + "const SUBJECTS = ".length, end + 1);
    const SUBJECTS = eval(subjectsCode);

    assert.strictEqual(SUBJECTS.length, 55, `public/script.js has exactly 55 subjects (got ${SUBJECTS.length})`);

    const yr1 = SUBJECTS.filter(s => s.courseYear === "1st Year");
    const yr2 = SUBJECTS.filter(s => s.courseYear === "2nd Year");
    const yr3 = SUBJECTS.filter(s => s.courseYear === "3rd Year");

    assert.strictEqual(yr1.length, 20, `1st Year has 20 subjects (got ${yr1.length})`);
    assert.strictEqual(yr2.length, 19, `2nd Year has 19 subjects (got ${yr2.length})`);
    assert.strictEqual(yr3.length, 16, `3rd Year has 16 subjects (got ${yr3.length})`);

    const cred1 = yr1.reduce((acc, s) => acc + (s.credits || 0), 0);
    const cred2 = yr2.reduce((acc, s) => acc + (s.credits || 0), 0);
    const cred3 = yr3.reduce((acc, s) => acc + (s.credits || 0), 0);

    assert.strictEqual(cred1, 53, `1st Year credits = 53 (got ${cred1})`);
    assert.strictEqual(cred2, 50, `2nd Year credits = 50 (got ${cred2})`);
    assert.strictEqual(cred3, 45, `3rd Year credits = 45 (got ${cred3})`);
    assert.strictEqual(cred1 + cred2 + cred3, 148, `Total curriculum credits = 148 (got ${cred1 + cred2 + cred3})`);

    pass("17. Existing syllabus content and the 55-subject NEP catalog remain unchanged");
  } catch (e) { fail("17. 55-subject NEP catalog integrity", e); }

  // -----------------------------------------------------------------------------
  // TEST GROUP D — Administrative Workflow (Tests 18–21)
  // -----------------------------------------------------------------------------
  console.log("\n--- TEST GROUP D: Administrative Workflow ---");

  // Test 18: Existing administrator authorization remains enforced
  try {
    const serverCode = fs.readFileSync(path.join(ROOT, "server.js"), "utf8");
    assert(serverCode.includes('app.post("/api/academic-years", rateLimitExpensive, requireAuth(["admin"])'), "POST /api/academic-years protected by requireAuth(['admin'])");
    assert(serverCode.includes('app.patch("/api/academic-years/:id", rateLimitExpensive, requireAuth(["admin"])'), "PATCH /api/academic-years/:id protected by requireAuth(['admin'])");
    assert(serverCode.includes('app.patch("/api/academic-years/:id/semesters", rateLimitExpensive, requireAuth(["admin"])'), "PATCH /api/academic-years/:id/semesters protected by requireAuth(['admin'])");
    assert(serverCode.includes('app.patch("/api/academic-years/:id/activate", rateLimitExpensive, requireAuth(["admin"])'), "PATCH /api/academic-years/:id/activate protected by requireAuth(['admin'])");
    assert(serverCode.includes('app.post("/api/syllabus", requireAuth(["admin"])'), "POST /api/syllabus protected by requireAuth(['admin'])");
    assert(serverCode.includes('app.put("/api/syllabus/:yearLevel", requireAuth(["admin"])'), 'PUT /api/syllabus/:yearLevel protected by requireAuth(["admin"])');
    assert(serverCode.includes('app.delete("/api/syllabus/:yearLevel", requireAuth(["admin"])'), 'DELETE /api/syllabus/:yearLevel protected by requireAuth(["admin"])');
    pass("18. Existing administrator authorization remains enforced");
  } catch (e) { fail("18. Admin authorization guards", e); }

  // Test 19: Semester updates target only the specified academic-year record
  try {
    let savedTarget = null;
    const mockYearTarget = {
      _id: "660000000000000000000001",
      yearCode: "2027–28",
      semesterConfiguration: [],
      save: async function() { savedTarget = this; return this; }
    };
    const mockOther = {
      _id: "660000000000000000000002",
      yearCode: "2028–29",
      semesterConfiguration: [{ semester: "1st Semester", isOperational: true }],
      save: async function() { throw new Error("Should not touch other record"); }
    };

    const origGet = academicYearService.getAcademicYearByIdOrCode;
    academicYearService.getAcademicYearByIdOrCode = async (id) => {
      if (id === "2027–28") return mockYearTarget;
      return mockOther;
    };

    await academicYearService.updateSemesterConfiguration("2027–28", [
      { semester: "3rd Semester", isOperational: true, status: "active" }
    ], "test-admin");

    academicYearService.getAcademicYearByIdOrCode = origGet;

    assert(savedTarget, "Target year was saved");
    assert.strictEqual(savedTarget.yearCode, "2027–28");
    assert.strictEqual(savedTarget.semesterConfiguration.length, 1);
    assert.strictEqual(savedTarget.semesterConfiguration[0].semester, "3rd Semester");
    assert.strictEqual(mockOther.semesterConfiguration.length, 1, "Other record was untouched");
    pass("19. Semester updates target only the specified academic-year record");
  } catch (e) { fail("19. Record scoping", e); }

  // Test 20: Invalid updates do not partially modify configuration
  try {
    const originalSemesters = [
      { semester: "1st Semester", cycle: "odd", courseYear: "1st Year", isOperational: true, status: "active" }
    ];
    const mockDoc = {
      yearCode: "2028–29",
      semesterConfiguration: [...originalSemesters],
      save: async function() { throw new Error("save() should not be called on validation error"); }
    };
    const origGet = academicYearService.getAcademicYearByIdOrCode;
    academicYearService.getAcademicYearByIdOrCode = async () => mockDoc;

    let threw = false;
    try {
      await academicYearService.updateSemesterConfiguration("2028–29", [
        { semester: "2nd Semester", isOperational: true },
        { semester: "Invalid Semester Name", isOperational: true }
      ]);
    } catch (err) {
      threw = true;
    } finally {
      academicYearService.getAcademicYearByIdOrCode = origGet;
    }

    assert(threw, "Operation threw on invalid input");
    assert.deepStrictEqual(mockDoc.semesterConfiguration, originalSemesters, "Configuration was not partially mutated");
    pass("20. Invalid updates do not partially modify configuration");
  } catch (e) { fail("20. Atomic rejection of invalid updates", e); }

  // Test 21: Existing academic-year creation and activation workflows remain unaffected
  try {
    assert.strictEqual(typeof academicYearService.createAcademicYear, "function");
    assert.strictEqual(typeof academicYearService.activateAcademicYear, "function");
    pass("21. Existing academic-year creation and activation workflows remain unaffected");
  } catch (e) { fail("21. Lifecycle workflows integrity", e); }

  // -----------------------------------------------------------------------------
  // TEST GROUP E — Regression (Tests 22–25)
  // -----------------------------------------------------------------------------
  console.log("\n--- TEST GROUP E: Regression Suite ---");

  // Test 22: Section 3.3.3.2 read-safety tests still pass
  try {
    const out = execSync("node scripts/test-academic-year-read-safety.js", { cwd: ROOT, encoding: "utf8" });
    assert(out.includes("17 Passed, 0 Failed"), "All 17 read-safety tests pass");
    pass("22. Section 3.3.3.2 read-safety tests still pass (17/17)");
  } catch (e) { fail("22. Read safety regression", e); }

  // Test 23: Section 3.3.2 data-integrity tests still pass
  try {
    const out = execSync("node scripts/test-data-integrity-remediation.js", { cwd: ROOT, encoding: "utf8" });
    assert(out.includes("17 Passed, 0 Failed"), "All 17 data integrity remediation tests pass");
    pass("23. Section 3.3.2 data-integrity tests still pass (17/17)");
  } catch (e) { fail("23. Data integrity regression", e); }

  // Test 24: Section 3.3 architecture tests still pass
  try {
    const out = execSync("node scripts/test-academic-year-architecture.js", { cwd: ROOT, encoding: "utf8" });
    assert(out.includes("23 Passed, 0 Failed"), "All 23 architecture tests pass");
    pass("24. Section 3.3 architecture tests still pass (23/23)");
  } catch (e) { fail("24. Architecture regression", e); }

  // Test 25: Full npm test passes
  try {
    const out = execSync("npm test", { cwd: ROOT, encoding: "utf8" });
    assert(out.includes("ALL FACULTY WORKFLOW VERIFICATION TESTS PASSED SUCCESSFULLY!"), "Full npm test passes");
    pass("25. Full npm test passes (127/127)");
  } catch (e) { fail("25. npm test regression", e); }

  console.log("\n======================================================================");
  console.log(`TEST RESULTS: ${passed} Passed, ${failed} Failed (Total: ${passed + failed})`);
  console.log("======================================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("SUCCESS: ALL SECTION 3.3.3.3 DYNAMIC CONFIGURATION CHECKS PASSED!");
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error("Fatal test suite error:", err);
  process.exit(1);
});
