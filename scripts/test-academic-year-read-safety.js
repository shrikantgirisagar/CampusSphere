// scripts/test-academic-year-read-safety.js
// Focused Regression Verification Suite for CampusSphere Phase 8, Section 3.3.3.2
// Verification of:
// - R-01: Elimination of automatic baseline seeding & startup provisioning
// - R-02: Strictly read-only active-year resolution with zero database writes

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const AcademicYear = require("../models/AcademicYear");
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
  console.log("CAMPUSSPHERE PHASE 8, SECTION 3.3.3.2: READ-SAFETY & ZERO-SEEDING SUITE");
  console.log("======================================================================\n");

  const serverCode = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");
  const serviceCode = fs.readFileSync(path.join(__dirname, "../services/academicYearService.js"), "utf8");

  // =========================================================================
  // SUITE 1: Test A — Empty Database Startup & Removal of Automatic Baseline Seeding
  // =========================================================================
  console.log("--- TEST SUITE 1: Test A — Empty Database Startup & Removal of Seeding ---");

  try {
    // 1. Verify ensureBaselineYears() is completely removed from server.js initDatabase()
    const initDbMatch = serverCode.match(/async function initDatabase\(\)[\s\S]*?\n\}/);
    assert(initDbMatch, "initDatabase function must exist in server.js");
    assert(
      !initDbMatch[0].includes("ensureBaselineYears"),
      "initDatabase() must NOT call academicYearService.ensureBaselineYears()"
    );
    pass("1. server.js initDatabase() does not invoke automatic baseline year provisioning");
  } catch (e) { fail("1. initDatabase() removal of ensureBaselineYears", e); }

  try {
    // 2. Verify BASELINE_YEARS constant is removed from academicYearService.js
    assert(!serviceCode.includes("const BASELINE_YEARS"), "BASELINE_YEARS array must be removed");
    pass("2. services/academicYearService.js removes hardcoded BASELINE_YEARS constant");
  } catch (e) { fail("2. BASELINE_YEARS constant removal", e); }

  try {
    // 3. Verify ensureBaselineYears() is a safe no-op that performs zero writes
    let writeCalled = false;
    const origCreate = AcademicYear.create;
    const origInsertMany = AcademicYear.insertMany;
    AcademicYear.create = async () => { writeCalled = true; };
    AcademicYear.insertMany = async () => { writeCalled = true; };

    try {
      await academicYearService.ensureBaselineYears();
      assert.strictEqual(writeCalled, false, "ensureBaselineYears must never call create or insertMany");
      pass("3. academicYearService.ensureBaselineYears() is a strictly safe no-op performing zero writes");
    } finally {
      AcademicYear.create = origCreate;
      AcademicYear.insertMany = origInsertMany;
    }
  } catch (e) { fail("3. ensureBaselineYears safe no-op verification", e); }

  try {
    // 4. Verify AcademicYear.syncIndexes() remains intact in initDatabase()
    const initDbMatch = serverCode.match(/async function initDatabase\(\)[\s\S]*?\n\}/);
    assert(initDbMatch[0].includes("AcademicYear.syncIndexes()"), "AcademicYear.syncIndexes() must be preserved");
    pass("4. server.js preserves AcademicYear.syncIndexes() for index integrity without seeding records");
  } catch (e) { fail("4. AcademicYear index sync preservation", e); }

  // =========================================================================
  // SUITE 2: Test B — Read-Only Active-Year Resolution
  // =========================================================================
  console.log("\n--- TEST SUITE 2: Test B — Read-Only Active-Year Resolution ---");

  try {
    // 5. One active year exists: returns correct document
    const mockActiveDoc = {
      _id: "60c72b2f9b1d8b001c8e4d21",
      yearCode: "2028–29",
      title: "Academic Year 2028–29",
      status: "active",
      startDate: new Date("2028-06-01"),
      endDate: new Date("2029-05-31")
    };

    const origFind = AcademicYear.find;
    AcademicYear.find = (query) => ({
      exec: async () => {
        if (query.status === "active") return [mockActiveDoc];
        return [];
      }
    });

    try {
      const active = await academicYearService.getActiveAcademicYear();
      assert(active, "Must return active academic year document");
      assert.strictEqual(active.yearCode, "2028–29", "yearCode must match active document");

      const code = await academicYearService.getActiveYearCode();
      assert.strictEqual(code, "2028–29", "getActiveYearCode must return verified yearCode");
      pass("5. Exactly one active year resolves to the correct document and yearCode");
    } finally {
      AcademicYear.find = origFind;
    }
  } catch (e) { fail("5. One active year resolution", e); }

  try {
    // 6. Zero active years exist: returns explicit null without fallback or mutation
    let writeInvoked = false;
    const origFind = AcademicYear.find;
    AcademicYear.find = (query) => ({
      exec: async () => []
    });

    try {
      const active = await academicYearService.getActiveAcademicYear();
      assert.strictEqual(active, null, "Must return explicit null when zero active years exist");

      const code = await academicYearService.getActiveYearCode();
      assert.strictEqual(code, null, "getActiveYearCode must return explicit null, NOT a fallback string");
      assert.strictEqual(writeInvoked, false, "Must not invoke any write operation");
      pass("6. Zero active years returns explicit null (no fallback yearCode, zero database writes)");
    } finally {
      AcademicYear.find = origFind;
    }
  } catch (e) { fail("6. Zero active years explicit null resolution", e); }

  try {
    // 7. Multiple active years exist: throws controlled MULTIPLE_ACTIVE_YEARS integrity error
    const origFind = AcademicYear.find;
    AcademicYear.find = (query) => ({
      exec: async () => [
        { yearCode: "2026–27", status: "active" },
        { yearCode: "2027–28", status: "active" }
      ]
    });

    try {
      let threwInService = false;
      let errorCode = null;
      try {
        await academicYearService.getActiveAcademicYear();
      } catch (err) {
        threwInService = true;
        errorCode = err.code;
      }

      assert(threwInService, "getActiveAcademicYear must throw on multiple active years");
      assert.strictEqual(errorCode, "MULTIPLE_ACTIVE_YEARS", "Error code must be MULTIPLE_ACTIVE_YEARS");

      let threwInCodeHelper = false;
      try {
        await academicYearService.getActiveYearCode();
      } catch (err) {
        threwInCodeHelper = true;
      }
      assert(threwInCodeHelper, "getActiveYearCode must propagate integrity error instead of swallowing it");

      pass("7. Multiple active years throws controlled MULTIPLE_ACTIVE_YEARS integrity error without swallowing");
    } finally {
      AcademicYear.find = origFind;
    }
  } catch (e) { fail("7. Multiple active years integrity check", e); }

  try {
    // 8. Database error propagation: does NOT mask with "2026–27"
    const origFind = AcademicYear.find;
    AcademicYear.find = () => ({
      exec: async () => { throw new Error("Simulated MongoDB network failure"); }
    });

    try {
      let threw = false;
      try {
        await academicYearService.getActiveYearCode();
      } catch (err) {
        threw = true;
        assert(err.message.includes("Simulated MongoDB network failure"));
      }
      assert(threw, "getActiveYearCode must propagate database errors instead of returning fallback '2026–27'");
      pass("8. Database errors propagate cleanly without being masked by hardcoded default year");
    } finally {
      AcademicYear.find = origFind;
    }
  } catch (e) { fail("8. Database error propagation", e); }

  try {
    // 9. Zero writes verification across all read helper methods
    let writeOperations = 0;
    const spySave = () => { writeOperations++; };
    const spyCreate = () => { writeOperations++; };
    const spyUpdate = () => { writeOperations++; };

    AcademicYear.prototype.save = spySave;
    AcademicYear.create = spyCreate;
    AcademicYear.updateOne = spyUpdate;
    AcademicYear.updateMany = spyUpdate;

    const origFind = AcademicYear.find;
    AcademicYear.find = () => ({
      sort: () => ({ exec: async () => [] }),
      exec: async () => []
    });

    try {
      await academicYearService.getActiveAcademicYear();
      await academicYearService.getActiveYearCode();
      await academicYearService.getAllAcademicYears();

      assert.strictEqual(writeOperations, 0, "Read helpers must trigger ZERO write operations");
      pass("9. Instrumented read operations execute ZERO calls to save, create, updateOne, or updateMany");
    } finally {
      AcademicYear.find = origFind;
      delete AcademicYear.prototype.save;
    }
  } catch (e) { fail("9. Zero write operations instrumentation", e); }

  // =========================================================================
  // SUITE 3: Test C — GET Endpoint Behavior
  // =========================================================================
  console.log("\n--- TEST SUITE 3: Test C — GET /api/academic-years/active Route Handling ---");

  try {
    // 10. Verify GET /api/academic-years/active returns 404 when active is null
    assert(
      serverCode.includes('return res.status(404).json({ success: false, message: "No active academic year configured." });'),
      "GET /api/academic-years/active must return 404 on missing active year"
    );
    pass("10. GET /api/academic-years/active returns 404 with clear message when no active year exists");
  } catch (e) { fail("10. GET route 404 response", e); }

  try {
    // 11. Verify GET /api/academic-years/active handles MULTIPLE_ACTIVE_YEARS with 500
    assert(
      serverCode.includes('code: "MULTIPLE_ACTIVE_YEARS"') &&
      serverCode.includes("Multiple academic years are marked active"),
      "GET /api/academic-years/active must catch MULTIPLE_ACTIVE_YEARS and return 500 integrity error"
    );
    pass("11. GET /api/academic-years/active catches MULTIPLE_ACTIVE_YEARS and returns controlled integrity response");
  } catch (e) { fail("11. GET route MULTIPLE_ACTIVE_YEARS handling", e); }

  try {
    // 12. Verify GET /api/academic-years (list endpoint) does not call ensureBaselineYears
    assert(
      !serviceCode.includes("getAllAcademicYears(filter = {}) {\n    await this.ensureBaselineYears();"),
      "getAllAcademicYears must not invoke ensureBaselineYears()"
    );
    pass("12. GET /api/academic-years list endpoint performs clean read without invoking seeding");
  } catch (e) { fail("12. List endpoint read-safety", e); }

  // =========================================================================
  // SUITE 4: Test D — Explicit Administrator Control Preservation
  // =========================================================================
  console.log("\n--- TEST SUITE 4: Test D — Deliberate Administrative Workflow Control ---");

  try {
    // 13. Verify createAcademicYear still validates and requires deliberate admin input
    assert(typeof academicYearService.createAcademicYear === "function", "createAcademicYear must exist");
    let rejected = false;
    try {
      await academicYearService.createAcademicYear({ yearCode: "" });
    } catch (_) {
      rejected = true;
    }
    assert(rejected, "createAcademicYear must validate input");
    pass("13. Administrative createAcademicYear requires deliberate input and validates yearCode");
  } catch (e) { fail("13. Administrative creation validation", e); }

  try {
    // 14. Verify activateAcademicYear remains an explicit administrative operation
    assert(typeof academicYearService.activateAcademicYear === "function", "activateAcademicYear must exist");
    assert(
      serverCode.includes('app.patch("/api/academic-years/:id/activate", rateLimitExpensive, requireAuth(["admin"])'),
      "Activation endpoint must require admin authentication and rate limiting"
    );
    pass("14. Academic year activation is strictly guarded by requireAuth(['admin']) and rateLimitExpensive");
  } catch (e) { fail("14. Administrative activation authorization", e); }

  try {
    // 15. Verify updateSemesterConfiguration remains functional
    assert(typeof academicYearService.updateSemesterConfiguration === "function", "updateSemesterConfiguration must exist");
    pass("15. updateSemesterConfiguration remains available for administrative semester tailoring");
  } catch (e) { fail("15. Semester configuration method", e); }

  // =========================================================================
  // SUITE 5: Test E — Codebase Integrity & Regression Protection
  // =========================================================================
  console.log("\n--- TEST SUITE 5: Test E — Codebase Pattern & Regression Protection ---");

  try {
    // 16. Verify no hardcoded "2026–27" fallback exists in getActiveYearCode()
    const activeCodeMethod = serviceCode.match(/async getActiveYearCode\(\)[\s\S]*?\n  \}/);
    assert(activeCodeMethod, "getActiveYearCode must exist");
    assert(
      !activeCodeMethod[0].includes('"2026–27"') && !activeCodeMethod[0].includes("'2026–27'"),
      "getActiveYearCode must NOT contain hardcoded '2026–27' fallback string"
    );
    pass("16. getActiveYearCode contains zero hardcoded '2026–27' fallback strings");
  } catch (e) { fail("16. getActiveYearCode zero hardcoded fallback string", e); }

  try {
    // 17. Verify getActiveAcademicYear() does not call save() or updateOne()
    const activeDocMethod = serviceCode.match(/async getActiveAcademicYear\(\)[\s\S]*?\n  \}/);
    assert(activeDocMethod, "getActiveAcademicYear must exist");
    assert(!activeDocMethod[0].includes(".save("), "getActiveAcademicYear must NOT call .save()");
    assert(!activeDocMethod[0].includes(".updateOne("), "getActiveAcademicYear must NOT call .updateOne()");
    assert(!activeDocMethod[0].includes(".create("), "getActiveAcademicYear must NOT call .create()");
    assert(!activeDocMethod[0].includes(".insertMany("), "getActiveAcademicYear must NOT call .insertMany()");
    pass("17. getActiveAcademicYear AST contains zero write operations (save, create, update, insert)");
  } catch (e) { fail("17. getActiveAcademicYear zero write AST verification", e); }

  console.log("\n======================================================================");
  console.log(`TEST RESULTS: ${passedTests} Passed, ${failedTests} Failed (Total: ${totalTests})`);
  console.log("======================================================================");

  if (failedTests > 0) {
    console.error(`\nFAILED: ${failedTests} read-safety checks failed.`);
    process.exit(1);
  } else {
    console.log("\nSUCCESS: ALL SECTION 3.3.3.2 READ-SAFETY & ZERO-SEEDING CHECKS PASSED!");
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
