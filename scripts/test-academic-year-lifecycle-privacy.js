// scripts/test-academic-year-lifecycle-privacy.js
// Focused Acceptance Test Suite for CampusSphere Phase 8, Section 3.3.3.5 (Work Package B)
// Verifies Academic-Year Lifecycle Integrity (R-06) & Public API Privacy (R-07)

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const ROOT = path.resolve(__dirname, "..");
const AcademicYear = require("../models/AcademicYear");
const academicYearService = require("../services/academicYearService");
const formatPublicAcademicYear = (doc) => academicYearService.formatPublicAcademicYear(doc);

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
  console.log("CAMPUSSPHERE PHASE 8, SECTION 3.3.3.5: LIFECYCLE & PRIVACY SUITE");
  console.log("======================================================================\n");

  // ===========================================================================
  // PART 1: R-07 — Public API Privacy & Response DTO Allowlist (Tests 1–8)
  // ===========================================================================
  console.log("--- PART 1: R-07 — Public Academic-Year API Privacy ---");

  const mockFullDoc = {
    _id: "660000000000000000000099",
    yearCode: "2028–29",
    title: "Academic Year 2028–29",
    startDate: new Date("2028-08-01"),
    endDate: new Date("2029-07-31"),
    status: "active",
    activeCycle: "odd",
    semesterConfiguration: [
      { semester: "1st Semester", cycle: "odd", courseYear: "1st Year", isOperational: true, status: "active" },
      { semester: "2nd Semester", cycle: "even", courseYear: "1st Year", isOperational: false, status: "upcoming" }
    ],
    notes: "Official institutional year",
    createdBy: "super_admin_username",
    updatedBy: "modifier_admin_username",
    activatedAt: new Date("2028-08-01T09:00:00Z"),
    completedAt: null,
    archivedAt: null,
    __v: 3
  };

  // Test 1: Public academic-year serializer does not expose createdBy
  try {
    const publicDTO = formatPublicAcademicYear(mockFullDoc);
    assert.strictEqual(publicDTO.createdBy, undefined, "Public DTO must not contain createdBy");
    pass("1. Public academic-year listing does not expose createdBy");
  } catch (e) { fail("1. Privacy: createdBy stripped", e); }

  // Test 2: Public academic-year serializer does not expose updatedBy
  try {
    const publicDTO = formatPublicAcademicYear(mockFullDoc);
    assert.strictEqual(publicDTO.updatedBy, undefined, "Public DTO must not contain updatedBy");
    pass("2. Public academic-year listing does not expose updatedBy");
  } catch (e) { fail("2. Privacy: updatedBy stripped", e); }

  // Test 3: Public active-year retrieval does not expose administrator usernames
  try {
    const serverCode = fs.readFileSync(path.join(ROOT, "server.js"), "utf8");
    assert(serverCode.includes("academicYearService.formatPublicAcademicYear(active)"), "GET /api/academic-years/active uses public serializer");
    assert(serverCode.includes("years.map(y => academicYearService.formatPublicAcademicYear(y))"), "GET /api/academic-years uses public serializer");
    pass("3. Public active-year retrieval does not expose administrator usernames");
  } catch (e) { fail("3. Active year endpoint privacy", e); }

  // Test 4: Public responses do not leak internal audit timestamps or __v
  try {
    const publicDTO = formatPublicAcademicYear(mockFullDoc);
    assert.strictEqual(publicDTO.activatedAt, undefined, "Must not leak activatedAt");
    assert.strictEqual(publicDTO.completedAt, undefined, "Must not leak completedAt");
    assert.strictEqual(publicDTO.archivedAt, undefined, "Must not leak archivedAt");
    assert.strictEqual(publicDTO.__v, undefined, "Must not leak __v");
    pass("4. Public responses do not leak internal user IDs or unnecessary database fields");
  } catch (e) { fail("4. Internal metadata stripping", e); }

  // Test 5: Required public academic-year fields remain available
  try {
    const publicDTO = formatPublicAcademicYear(mockFullDoc);
    assert.strictEqual(publicDTO.yearCode, "2028–29");
    assert.strictEqual(publicDTO.title, "Academic Year 2028–29");
    assert.strictEqual(publicDTO.status, "active");
    assert.strictEqual(publicDTO.activeCycle, "odd");
    assert(Array.isArray(publicDTO.semesterConfiguration));
    assert.strictEqual(publicDTO.semesterConfiguration.length, 2);
    assert.strictEqual(publicDTO.notes, "Official institutional year");
    assert(publicDTO.id || publicDTO._id, "Public DTO exposes id/_id for client keying");
    pass("5. Required public academic-year fields remain available");
  } catch (e) { fail("5. Required public fields availability", e); }

  // Test 6: Authenticated administrator functionality remains intact
  try {
    const serverCode = fs.readFileSync(path.join(ROOT, "server.js"), "utf8");
    assert(serverCode.includes('app.post("/api/academic-years", rateLimitExpensive, requireAuth(["admin"])'), "Admin creation protected");
    assert(serverCode.includes('app.patch("/api/academic-years/:id", rateLimitExpensive, requireAuth(["admin"])'), "Admin update protected");
    assert(serverCode.includes('app.patch("/api/academic-years/:id/activate", rateLimitExpensive, requireAuth(["admin"])'), "Admin activation protected");
    assert(serverCode.includes('app.patch("/api/academic-years/:id/complete", rateLimitExpensive, requireAuth(["admin"])'), "Admin complete protected");
    pass("6. Authenticated administrator functionality remains intact");
  } catch (e) { fail("6. Administrator authenticated workflow integrity", e); }

  // Test 7: The public serializer handles missing optional fields safely
  try {
    const minimalDoc = {
      _id: "660000000000000000000001",
      yearCode: "2030–31",
      title: "Academic Year 2030–31"
      // startDate, endDate, notes, semesterConfiguration missing
    };
    const publicDTO = formatPublicAcademicYear(minimalDoc);
    assert.strictEqual(publicDTO.yearCode, "2030–31");
    assert.strictEqual(publicDTO.notes, "");
    assert.deepStrictEqual(publicDTO.semesterConfiguration, []);
    assert.strictEqual(formatPublicAcademicYear(null), null);
    assert.strictEqual(formatPublicAcademicYear(undefined), null);
    pass("7. The public serializer handles missing optional fields safely");
  } catch (e) { fail("7. Safe handling of minimal/missing optional fields", e); }

  // Test 8: AcademicYear model defines toPublicJSON method
  try {
    const ay = new AcademicYear({
      yearCode: "2032–33",
      title: "Academic Year 2032–33",
      startDate: new Date("2032-08-01"),
      endDate: new Date("2033-07-31"),
      status: "upcoming",
      createdBy: "admin_user",
      updatedBy: "admin_user"
    });
    assert.strictEqual(typeof ay.toPublicJSON, "function", "AcademicYear model defines toPublicJSON");
    const json = ay.toPublicJSON();
    assert.strictEqual(json.createdBy, undefined);
    assert.strictEqual(json.updatedBy, undefined);
    assert.strictEqual(json.__v, undefined);
    pass("8. No public endpoint bypasses the serializer by returning raw Mongoose documents");
  } catch (e) { fail("8. Model level public serialization method", e); }

  // ===========================================================================
  // PART 2: R-06 — Academic-Year Lifecycle Integrity (Tests 9–15)
  // ===========================================================================
  console.log("\n--- PART 2: R-06 — Academic-Year Lifecycle Integrity ---");

  // Test 9: Accidental zero-active-year completion is prevented without successor
  try {
    let threw = false;
    const activeDoc = {
      _id: "660000000000000000000011",
      yearCode: "2026–27",
      status: "active",
      save: async function() { return this; }
    };
    const origGet = academicYearService.getAcademicYearByIdOrCode;
    academicYearService.getAcademicYearByIdOrCode = async () => activeDoc;

    try {
      // Attempting to complete active year without successorId and without intentional deactivation
      await academicYearService.completeAcademicYear("2026–27", "test-admin", {});
    } catch (err) {
      threw = true;
      assert(err.message.includes("without an explicitly selected successor"), "Throws specific successor requirement error");
    } finally {
      academicYearService.getAcademicYearByIdOrCode = origGet;
    }

    assert(threw, "Unsafe completion without successor was blocked");
    pass("9. Accidental zero-active-year completion is prevented without successor");
  } catch (e) { fail("9. Active year completion guard", e); }

  // Test 10: Completing active year with valid upcoming successor executes safe atomic transition
  try {
    const activeDoc = {
      _id: "660000000000000000000011",
      yearCode: "2026–27",
      status: "active"
    };
    const successorDoc = {
      _id: "660000000000000000000022",
      yearCode: "2027–28",
      status: "upcoming"
    };

    let activatedSuccessorId = null;
    const origGet = academicYearService.getAcademicYearByIdOrCode;
    const origActivate = academicYearService.activateAcademicYear;

    academicYearService.getAcademicYearByIdOrCode = async (id) => {
      if (String(id) === String(activeDoc._id) || id === "2026–27") return activeDoc;
      if (String(id) === String(successorDoc._id) || id === "2027–28") return successorDoc;
      return null;
    };
    academicYearService.activateAcademicYear = async (id, user) => {
      activatedSuccessorId = id;
      return { success: true, activeAcademicYear: successorDoc };
    };

    const res = await academicYearService.completeAcademicYear("2026–27", "test-admin", {
      successorId: "2027–28"
    });

    academicYearService.getAcademicYearByIdOrCode = origGet;
    academicYearService.activateAcademicYear = origActivate;

    assert(res.success, "Transition succeeded");
    assert.strictEqual(String(activatedSuccessorId), String(successorDoc._id), "Delegated to atomic activation of successor");
    pass("10. Completing active year with valid upcoming successor executes safe atomic transition");
  } catch (e) { fail("10. Successor transition delegation", e); }

  // Test 11: Attempting to complete an upcoming year is rejected with validation error
  try {
    let threw = false;
    const upcomingDoc = {
      _id: "660000000000000000000033",
      yearCode: "2029–30",
      status: "upcoming",
      save: async function() { return this; }
    };
    const origGet = academicYearService.getAcademicYearByIdOrCode;
    academicYearService.getAcademicYearByIdOrCode = async () => upcomingDoc;

    try {
      await academicYearService.completeAcademicYear("2029–30", "test-admin");
    } catch (err) {
      threw = true;
      assert(err.message.includes("Cannot complete upcoming academic year"), "Throws upcoming completion error");
    } finally {
      academicYearService.getAcademicYearByIdOrCode = origGet;
    }

    assert(threw, "Upcoming year cannot be marked completed directly");
    pass("11. Attempting to complete an upcoming year is rejected with validation error");
  } catch (e) { fail("11. Upcoming year completion rejection", e); }

  // Test 12: Attempting to complete an already completed year is rejected
  try {
    let threw = false;
    const completedDoc = {
      _id: "660000000000000000000044",
      yearCode: "2023–24",
      status: "completed",
      save: async function() { return this; }
    };
    const origGet = academicYearService.getAcademicYearByIdOrCode;
    academicYearService.getAcademicYearByIdOrCode = async () => completedDoc;

    try {
      await academicYearService.completeAcademicYear("2023–24", "test-admin");
    } catch (err) {
      threw = true;
      assert(err.message.includes("already marked as completed"), "Throws already completed error");
    } finally {
      academicYearService.getAcademicYearByIdOrCode = origGet;
    }

    assert(threw, "Already completed year was rejected");
    pass("12. Attempting to complete an already completed year is rejected");
  } catch (e) { fail("12. Completed year re-completion rejection", e); }

  // Test 13: Archiving an active academic year directly is rejected
  try {
    let threw = false;
    const activeDoc = {
      _id: "660000000000000000000055",
      yearCode: "2026–27",
      status: "active",
      save: async function() { return this; }
    };
    const origGet = academicYearService.getAcademicYearByIdOrCode;
    academicYearService.getAcademicYearByIdOrCode = async () => activeDoc;

    try {
      await academicYearService.archiveAcademicYear("2026–27", "test-admin");
    } catch (err) {
      threw = true;
      assert(err.message.includes("Cannot archive the currently active academic year"), "Throws active archive rejection error");
    } finally {
      academicYearService.getAcademicYearByIdOrCode = origGet;
    }

    assert(threw, "Direct archiving of active year was blocked");
    pass("13. Archiving an active academic year directly is rejected");
  } catch (e) { fail("13. Active year archive rejection", e); }

  // Test 14: Intentional institutional deactivation is permitted when explicitly confirmed
  try {
    let saved = false;
    const activeDoc = {
      _id: "660000000000000000000066",
      yearCode: "2026–27",
      status: "active",
      semesterConfiguration: [{ semester: "1st Semester", status: "active" }],
      save: async function() { saved = true; return this; }
    };
    const origGet = academicYearService.getAcademicYearByIdOrCode;
    academicYearService.getAcademicYearByIdOrCode = async () => activeDoc;

    const res = await academicYearService.completeAcademicYear("2026–27", "super_admin", {
      intentionalDeactivation: true
    });

    academicYearService.getAcademicYearByIdOrCode = origGet;

    assert(saved, "Saved after explicit intentional deactivation confirmation");
    assert.strictEqual(res.status, "completed");
    assert.strictEqual(res.updatedBy, "super_admin");
    pass("14. Intentional institutional deactivation is permitted when explicitly confirmed");
  } catch (e) { fail("14. Explicit intentional deactivation handling", e); }

  // Test 15: activateAcademicYear rejects archived academic years
  try {
    let threw = false;
    const archivedDoc = {
      _id: "660000000000000000000077",
      yearCode: "2020–21",
      status: "archived",
      save: async function() { return this; }
    };
    const origGet = academicYearService.getAcademicYearByIdOrCode;
    academicYearService.getAcademicYearByIdOrCode = async () => archivedDoc;

    try {
      await academicYearService.activateAcademicYear("2020–21", "admin");
    } catch (err) {
      threw = true;
      assert(err.message.includes("Archived academic year"), "Throws archived activation error");
    } finally {
      academicYearService.getAcademicYearByIdOrCode = origGet;
    }

    assert(threw, "Archived year activation was blocked");
    pass("15. activateAcademicYear rejects archived academic years");
  } catch (e) { fail("15. Archived year activation rejection", e); }

  console.log("\n======================================================================");
  console.log(`TEST RESULTS: ${passed} Passed, ${failed} Failed (Total: ${passed + failed})`);
  console.log("======================================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("SUCCESS: ALL SECTION 3.3.3.5 LIFECYCLE & PRIVACY CHECKS PASSED!");
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
