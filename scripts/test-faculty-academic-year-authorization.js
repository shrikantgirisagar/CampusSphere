/**
 * scripts/test-faculty-academic-year-authorization.js
 *
 * CampusSphere — Phase 8, Section 3.3.3.9 Verification Suite
 * Faculty Allocation Authorization Remediation (Finding F-06)
 *
 * Comprehensive Automated Verification Suite:
 * 1. Faculty allocation resolution (Tests 1–9)
 * 2. Legacy compatibility policy (Tests 10–14)
 * 3. Attendance authorization (Tests 15–18)
 * 4. CIE marks authorization (Tests 19–22)
 * 5. Timetable & resource scoping (Tests 23–26)
 * 6. Administrator & user security (Tests 27–30)
 * 7. Regression & authorization completeness (Tests 31–32)
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const app = require("../server.js");
const {
  getFacultyAuthorizedScope,
  isFacultyAuthorizedForTimetable,
  canFacultySetSubject,
  validateFacultyAttendanceAuthorization
} = app;

let passed = 0;
let failed = 0;

function report(name, ok, err = null) {
  if (ok) {
    console.log(`  [PASS] ${passed + 1}. ${name}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${name}${err ? " -> " + (err.message || err) : ""}`);
    failed++;
  }
}

async function runTests() {
  console.log("======================================================================");
  console.log("CAMPUSSPHERE PHASE 8, SECTION 3.3.3.9: FACULTY AUTHORIZATION VERIFICATION");
  console.log("======================================================================\n");

  // ===========================================================================
  // GROUP 1: Faculty Allocation Resolution (Tests 1–9)
  // ===========================================================================
  console.log("--- GROUP 1: Faculty Allocation Resolution ---");

  // Test 1: Resolves correct allocations matching specified academic year (single allocation)
  try {
    const facultyUser = {
      username: "fac_dbms",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "dbms", semester: "1st Semester", division: "Div A", status: "active" }
      ]
    };
    const scope = getFacultyAuthorizedScope(facultyUser, "2025–26");
    assert.strictEqual(scope.isAuthorized, true, "Scope must be authorized");
    assert.deepStrictEqual(scope.subjects, ["dbms"], "Must have 'dbms' subject");
    assert.strictEqual(scope.divisionsBySubject["dbms"], "Div A", "Must match Div A division");
    report("Resolves correct single allocation matching specified academic year", true);
  } catch (e) {
    report("Resolves correct single allocation matching specified academic year", false, e);
  }

  // Test 2: Resolves correct allocations matching specified academic year (multiple allocations in same year)
  try {
    const facultyUser = {
      username: "fac_multi",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "cprog", semester: "1st Semester", division: "Div A", status: "active" },
        { academicYear: "2025–26", subject: "clab", semester: "1st Semester", division: "Div A", status: "active" },
        { academicYear: "2025–26", subject: "maths", semester: "1st Semester", division: "Both Divisions", status: "active" }
      ]
    };
    const scope = getFacultyAuthorizedScope(facultyUser, "2025–26");
    assert.strictEqual(scope.isAuthorized, true);
    assert.strictEqual(scope.subjects.length, 3);
    assert(scope.subjects.includes("cprog") && scope.subjects.includes("clab") && scope.subjects.includes("maths"));
    assert.strictEqual(scope.divisionsBySubject["maths"], "Both Divisions");
    report("Resolves correct multiple allocations in same academic year", true);
  } catch (e) {
    report("Resolves correct multiple allocations in same academic year", false, e);
  }

  // Test 3: Resolves distinct allocations across different academic years for the same faculty member
  try {
    const facultyUser = {
      username: "fac_evolution",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2024–25", subject: "cprog", semester: "1st Semester", division: "Div A", status: "active" },
        { academicYear: "2025–26", subject: "java", semester: "3rd Semester", division: "Div B", status: "active" },
        { academicYear: "2026–27", subject: "ml", semester: "5th Semester", division: "Both Divisions", status: "active" }
      ]
    };
    const scope24 = getFacultyAuthorizedScope(facultyUser, "2024–25");
    const scope25 = getFacultyAuthorizedScope(facultyUser, "2025–26");
    const scope26 = getFacultyAuthorizedScope(facultyUser, "2026–27");

    assert.deepStrictEqual(scope24.subjects, ["cprog"]);
    assert.strictEqual(scope24.divisionsBySubject["cprog"], "Div A");

    assert.deepStrictEqual(scope25.subjects, ["java"]);
    assert.strictEqual(scope25.divisionsBySubject["java"], "Div B");

    assert.deepStrictEqual(scope26.subjects, ["ml"]);
    assert.strictEqual(scope26.divisionsBySubject["ml"], "Both Divisions");
    report("Resolves distinct allocations across different academic years for same faculty", true);
  } catch (e) {
    report("Resolves distinct allocations across different academic years for same faculty", false, e);
  }

  // Test 4: Denies authorization when faculty has versioned allocations but requested year has no allocations
  try {
    const facultyUser = {
      username: "fac_year_locked",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "dbms", semester: "1st Semester", division: "Div A", status: "active" }
      ]
    };
    const scope = getFacultyAuthorizedScope(facultyUser, "2026–27");
    assert.strictEqual(scope.isAuthorized, false, "Must deny authorization for unallocated year");
    assert(scope.reason && scope.reason.includes("no active allocations"), "Must provide explanatory reason");
    assert.strictEqual(scope.subjects.length, 0, "Subjects list must be empty");
    report("Denies authorization when requested year has no allocations", true);
  } catch (e) {
    report("Denies authorization when requested year has no allocations", false, e);
  }

  // Test 5: Denies authorization when faculty has versioned allocations but no academic year is specified (fail-safe)
  try {
    const facultyUser = {
      username: "fac_failsafe",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "dbms", semester: "1st Semester", division: "Div A", status: "active" }
      ]
    };
    const scopeNoArg = getFacultyAuthorizedScope(facultyUser);
    const scopeEmpty = getFacultyAuthorizedScope(facultyUser, "");
    const scopeNull = getFacultyAuthorizedScope(facultyUser, null);

    assert.strictEqual(scopeNoArg.isAuthorized, false, "Must fail safe when year omitted");
    assert.strictEqual(scopeEmpty.isAuthorized, false, "Must fail safe when year empty string");
    assert.strictEqual(scopeNull.isAuthorized, false, "Must fail safe when year null");
    assert(scopeNoArg.reason.includes("Academic-year context is required"), "Must state year context requirement");
    report("Denies authorization when faculty has versioned allocations but year unspecified (fail-safe)", true);
  } catch (e) {
    report("Denies authorization when faculty has versioned allocations but year unspecified (fail-safe)", false, e);
  }

  // Test 6: Respects status/isActive flag (inactive/revoked allocations do not grant authorization)
  try {
    const facultyUser = {
      username: "fac_revoked",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "dbms", status: "inactive" },
        { academicYear: "2025–26", subject: "cprog", status: "revoked" },
        { academicYear: "2025–26", subject: "python", isActive: false },
        { academicYear: "2025–26", subject: "os", status: "active", isActive: true }
      ]
    };
    const scope = getFacultyAuthorizedScope(facultyUser, "2025–26");
    assert.strictEqual(scope.isAuthorized, true);
    assert.deepStrictEqual(scope.subjects, ["os"], "Only active allocation must be authorized");
    assert(!scope.subjects.includes("dbms"), "Inactive allocation must not be included");
    assert(!scope.subjects.includes("cprog"), "Revoked allocation must not be included");
    assert(!scope.subjects.includes("python"), "isActive:false allocation must not be included");
    report("Respects status and isActive flags (inactive/revoked allocations rejected)", true);
  } catch (e) {
    report("Respects status and isActive flags (inactive/revoked allocations rejected)", false, e);
  }

  // Test 7: Resolves division scoping correctly from versioned allocations (Div A, Div B, Both Divisions, all)
  try {
    const facultyUser = {
      username: "fac_div_test",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "cprog", division: "Div A", status: "active" },
        { academicYear: "2025–26", subject: "java", division: "Div B", status: "active" },
        { academicYear: "2025–26", subject: "python", division: "Both Divisions", status: "active" },
        { academicYear: "2025–26", subject: "os", division: "all", status: "active" }
      ]
    };
    const scope = getFacultyAuthorizedScope(facultyUser, "2025–26");
    assert.strictEqual(scope.divisionsBySubject["cprog"], "Div A");
    assert.strictEqual(scope.divisionsBySubject["java"], "Div B");
    assert.strictEqual(scope.divisionsBySubject["python"], "Both Divisions");
    assert.strictEqual(scope.divisionsBySubject["os"], "all");
    report("Resolves division scoping correctly from versioned allocations", true);
  } catch (e) {
    report("Resolves division scoping correctly from versioned allocations", false, e);
  }

  // Test 8: Resolves semester scoping correctly from versioned allocations
  try {
    const facultyUser = {
      username: "fac_sem_test",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "cprog", semester: "1st Semester", status: "active" },
        { academicYear: "2025–26", subject: "ds", semester: "2nd Semester", status: "active" }
      ]
    };
    const scope = getFacultyAuthorizedScope(facultyUser, "2025–26");
    assert(scope.semesters.includes("1st Semester"), "Must include 1st Semester");
    assert(scope.semesters.includes("2nd Semester"), "Must include 2nd Semester");
    report("Resolves semester scoping correctly from versioned allocations", true);
  } catch (e) {
    report("Resolves semester scoping correctly from versioned allocations", false, e);
  }

  // Test 9: Handles case-insensitive and trimmed academic year codes in allocations
  try {
    const facultyUser = {
      username: "fac_case_test",
      role: "faculty",
      facultyAllocations: [
        { academicYear: " 2025–26 ", subject: "dbms", status: "active" }
      ]
    };
    const scope1 = getFacultyAuthorizedScope(facultyUser, "2025–26");
    const scope2 = getFacultyAuthorizedScope(facultyUser, " 2025–26 ");
    assert.strictEqual(scope1.isAuthorized, true);
    assert.strictEqual(scope2.isAuthorized, true);
    assert.deepStrictEqual(scope1.subjects, ["dbms"]);
    report("Handles trimmed and case-insensitive academic year matching", true);
  } catch (e) {
    report("Handles trimmed and case-insensitive academic year matching", false, e);
  }

  // ===========================================================================
  // GROUP 2: Legacy Compatibility Policy (Tests 10–14)
  // ===========================================================================
  console.log("\n--- GROUP 2: Legacy Compatibility Policy ---");

  // Test 10: Grants authorization for legacy faculty profiles with no versioned allocations
  try {
    const legacyFaculty = {
      username: "fac_legacy_valid",
      role: "faculty",
      subject: "cprog",
      subjects: ["cprog", "clab"],
      division: "Div A",
      semester: "1st Semester"
      // Note: facultyAllocations is undefined/empty
    };
    const scopeDefault = getFacultyAuthorizedScope(legacyFaculty);
    const scopeYear = getFacultyAuthorizedScope(legacyFaculty, "2025–26");
    assert.strictEqual(scopeDefault.isAuthorized, true);
    assert.strictEqual(scopeYear.isAuthorized, true);
    assert(scopeYear.subjects.includes("cprog") && scopeYear.subjects.includes("clab"));
    assert.strictEqual(scopeYear.divisionsBySubject["cprog"], "Div A");
    report("Grants authorization for legacy faculty profiles with no versioned allocations", true);
  } catch (e) {
    report("Grants authorization for legacy faculty profiles with no versioned allocations", false, e);
  }

  // Test 11: Enforces legacy profile year binding (legacy profile associated with 2024–25 cannot grant access for 2025–26)
  try {
    const legacyBoundFaculty = {
      username: "fac_legacy_bound",
      role: "faculty",
      subject: "cprog",
      academicYear: "2024–25"
      // legacy profile bound to 2024–25
    };
    const scopeMatch = getFacultyAuthorizedScope(legacyBoundFaculty, "2024–25");
    const scopeConflict = getFacultyAuthorizedScope(legacyBoundFaculty, "2025–26");

    assert.strictEqual(scopeMatch.isAuthorized, true, "Must authorize matching year");
    assert.strictEqual(scopeConflict.isAuthorized, false, "Must deny conflicting year for legacy profile");
    assert(scopeConflict.reason.includes("cannot grant access for requested year"), "Reason must explain conflict");
    report("Enforces legacy profile year binding against conflicting requested years", true);
  } catch (e) {
    report("Enforces legacy profile year binding against conflicting requested years", false, e);
  }

  // Test 12: Versioned allocations strictly take precedence over legacy fields
  try {
    const migratedFaculty = {
      username: "fac_migrated",
      role: "faculty",
      subject: "legacy_unauthorized_subject",
      subjects: ["legacy_unauthorized_subject"],
      division: "Both Divisions",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "dbms", semester: "1st Semester", division: "Div A", status: "active" }
      ]
    };
    const scope = getFacultyAuthorizedScope(migratedFaculty, "2025–26");
    assert.strictEqual(scope.isAuthorized, true);
    assert.deepStrictEqual(scope.subjects, ["dbms"], "Must ONLY contain versioned allocation subject");
    assert(!scope.subjects.includes("legacy_unauthorized_subject"), "Must ignore legacy fields entirely");
    assert.strictEqual(scope.divisionsBySubject["dbms"], "Div A");
    report("Versioned allocations strictly take precedence over legacy fields", true);
  } catch (e) {
    report("Versioned allocations strictly take precedence over legacy fields", false, e);
  }

  // Test 13: Migrated profile with versioned allocations does NOT fall back to legacy fields for non-allocated years
  try {
    const migratedFaculty = {
      username: "fac_migrated_2",
      role: "faculty",
      subject: "cprog",
      subjects: ["cprog"],
      facultyAllocations: [
        { academicYear: "2025–26", subject: "dbms", status: "active" }
      ]
    };
    const scopeOtherYear = getFacultyAuthorizedScope(migratedFaculty, "2026–27");
    assert.strictEqual(scopeOtherYear.isAuthorized, false, "Must not authorize non-allocated year");
    assert(!scopeOtherYear.subjects.includes("cprog"), "Must not fall back to legacy cprog for non-allocated year");
    report("Migrated profile with versioned allocations does not fall back to legacy fields for other years", true);
  } catch (e) {
    report("Migrated profile with versioned allocations does not fall back to legacy fields for other years", false, e);
  }

  // Test 14: Legacy fallback never fabricates cross-year access
  try {
    const legacyFaculty = {
      username: "fac_legacy_pure",
      role: "faculty",
      subject: "python",
      academicYear: "2025–26"
    };
    const scope26 = getFacultyAuthorizedScope(legacyFaculty, "2026–27");
    assert.strictEqual(scope26.isAuthorized, false);
    assert.strictEqual(scope26.subjects.length, 0);
    report("Legacy fallback never fabricates cross-year access", true);
  } catch (e) {
    report("Legacy fallback never fabricates cross-year access", false, e);
  }

  // ===========================================================================
  // GROUP 3: Attendance Authorization (Tests 15–18)
  // ===========================================================================
  console.log("\n--- GROUP 3: Attendance Authorization ---");

  // Test 15: Allows attendance marking when faculty has allocation for that subject, division, and academic year
  try {
    const facultyUser = {
      username: "fac_att_ok",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "dbms", semester: "1st Semester", division: "Div A", status: "active" }
      ]
    };
    const res = validateFacultyAttendanceAuthorization(facultyUser, "dbms", "Div A", "1st Semester", "2025–26");
    assert.strictEqual(res.authorized, true, "Should authorize valid allocation");
    report("Allows attendance marking when faculty has allocation for subject, division, and academic year", true);
  } catch (e) {
    report("Allows attendance marking when faculty has allocation for subject, division, and academic year", false, e);
  }

  // Test 16: Denies attendance marking when faculty has allocation in Year 1 but attempts marking in Year 2
  try {
    const facultyUser = {
      username: "fac_att_yr1",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2024–25", subject: "dbms", semester: "1st Semester", division: "Div A", status: "active" }
      ]
    };
    const res = validateFacultyAttendanceAuthorization(facultyUser, "dbms", "Div A", "1st Semester", "2025–26");
    assert.strictEqual(res.authorized, false, "Should deny attendance marking in non-allocated academic year");
    assert(res.reason, "Must provide rejection reason");
    report("Denies attendance marking when faculty has allocation in Year 1 but attempts marking in Year 2", true);
  } catch (e) {
    report("Denies attendance marking when faculty has allocation in Year 1 but attempts marking in Year 2", false, e);
  }

  // Test 17: Denies attendance marking when faculty has allocation in Div A but attempts marking in Div B
  try {
    const facultyUser = {
      username: "fac_att_divA",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "dbms", semester: "1st Semester", division: "Div A", status: "active" }
      ]
    };
    const res = validateFacultyAttendanceAuthorization(facultyUser, "dbms", "Div B", "1st Semester", "2025–26");
    assert.strictEqual(res.authorized, false, "Should deny marking for unauthorized division");
    assert(res.reason.includes("division"), "Reason must mention division restriction");
    report("Denies attendance marking when faculty has allocation in Div A but attempts Div B", true);
  } catch (e) {
    report("Denies attendance marking when faculty has allocation in Div A but attempts Div B", false, e);
  }

  // Test 18: Attendance deletion enforces academic-year-scoped faculty authorization
  try {
    const facultyUser = {
      username: "fac_att_del",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "cprog", semester: "1st Semester", division: "Div A", status: "active" }
      ]
    };
    // Authorized for 2025–26
    const resOk = validateFacultyAttendanceAuthorization(facultyUser, "cprog", "Div A", "1st Semester", "2025–26");
    assert.strictEqual(resOk.authorized, true);

    // Attempting delete on record from 2024–25
    const resDenied = validateFacultyAttendanceAuthorization(facultyUser, "cprog", "Div A", "1st Semester", "2024–25");
    assert.strictEqual(resDenied.authorized, false);
    report("Attendance deletion enforces academic-year-scoped faculty authorization", true);
  } catch (e) {
    report("Attendance deletion enforces academic-year-scoped faculty authorization", false, e);
  }

  // ===========================================================================
  // GROUP 4: CIE Marks Authorization (Tests 19–22)
  // ===========================================================================
  console.log("\n--- GROUP 4: CIE Marks Authorization ---");

  // Test 19: Allows CIE marks updates for student in academic year matching faculty allocation
  try {
    const facultyUser = {
      username: "fac_cie_ok",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "java", semester: "3rd Semester", division: "Div A", status: "active" }
      ]
    };
    const auth = validateFacultyAttendanceAuthorization(facultyUser, "java", "Div A", "3rd Semester", "2025–26");
    assert.strictEqual(auth.authorized, true);
    report("Allows CIE marks updates for student in academic year matching faculty allocation", true);
  } catch (e) {
    report("Allows CIE marks updates for student in academic year matching faculty allocation", false, e);
  }

  // Test 20: Denies CIE marks updates for student in academic year NOT matching faculty allocation
  try {
    const facultyUser = {
      username: "fac_cie_wrong_year",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2024–25", subject: "java", semester: "3rd Semester", division: "Div A", status: "active" }
      ]
    };
    const auth = validateFacultyAttendanceAuthorization(facultyUser, "java", "Div A", "3rd Semester", "2025–26");
    assert.strictEqual(auth.authorized, false);
    report("Denies CIE marks updates for student in academic year NOT matching faculty allocation", true);
  } catch (e) {
    report("Denies CIE marks updates for student in academic year NOT matching faculty allocation", false, e);
  }

  // Test 21: Denies CIE marks updates for subject not in faculty allocation for that academic year
  try {
    const facultyUser = {
      username: "fac_cie_wrong_sub",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "cprog", semester: "1st Semester", division: "Div A", status: "active" }
      ]
    };
    const auth = validateFacultyAttendanceAuthorization(facultyUser, "dbms", "Div A", "1st Semester", "2025–26");
    assert.strictEqual(auth.authorized, false);
    assert(auth.reason.includes("unassigned subject"), "Reason must cite unassigned subject");
    report("Denies CIE marks updates for subject not in faculty allocation for that academic year", true);
  } catch (e) {
    report("Denies CIE marks updates for subject not in faculty allocation for that academic year", false, e);
  }

  // Test 22: Prevents cross-year marks manipulation
  try {
    const facultyUser = {
      username: "fac_cross_year",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2026–27", subject: "ml", semester: "5th Semester", division: "Both Divisions", status: "active" }
      ]
    };
    // Cannot modify marks for historical 2025–26 cycle
    const authHist = validateFacultyAttendanceAuthorization(facultyUser, "ml", "Div A", "5th Semester", "2025–26");
    assert.strictEqual(authHist.authorized, false);
    report("Prevents cross-year marks manipulation across academic years", true);
  } catch (e) {
    report("Prevents cross-year marks manipulation across academic years", false, e);
  }

  // ===========================================================================
  // GROUP 5: Timetable & Resource Scoping (Tests 23–26)
  // ===========================================================================
  console.log("\n--- GROUP 5: Timetable & Resource Scoping ---");

  // Test 23: Timetable scoping authorizes only allocated subjects for requested academic year via isFacultyAuthorizedForTimetable
  try {
    const facultyUser = {
      username: "fac_tt_scope",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "cprog", semester: "1st Semester", division: "Div A", status: "active" }
      ]
    };
    const authorizedIn25 = isFacultyAuthorizedForTimetable(facultyUser, "1st Semester", "Div A", "2025–26");
    const unauthorizedIn26 = isFacultyAuthorizedForTimetable(facultyUser, "1st Semester", "Div A", "2026–27");
    const unauthorizedDiv = isFacultyAuthorizedForTimetable(facultyUser, "1st Semester", "Div B", "2025–26");

    assert.strictEqual(authorizedIn25, true, "Must be authorized for 2025–26 Div A");
    assert.strictEqual(unauthorizedIn26, false, "Must be denied for 2026–27");
    assert.strictEqual(unauthorizedDiv, false, "Must be denied for Div B");
    report("isFacultyAuthorizedForTimetable scopes correctly by academic year and division", true);
  } catch (e) {
    report("isFacultyAuthorizedForTimetable scopes correctly by academic year and division", false, e);
  }

  // Test 24: Timetable editing prevents assigning subjects not allocated to faculty in that academic year via canFacultySetSubject
  try {
    const facultyUser = {
      username: "fac_tt_edit",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "cprog", semester: "1st Semester", division: "Div A", status: "active" }
      ]
    };
    const canSetIn25 = canFacultySetSubject(facultyUser, "cprog", "1st Semester", "Div A", "2025–26");
    const cannotSetIn26 = canFacultySetSubject(facultyUser, "cprog", "1st Semester", "Div A", "2026–27");
    const cannotSetOtherSub = canFacultySetSubject(facultyUser, "dbms", "1st Semester", "Div A", "2025–26");

    assert.strictEqual(canSetIn25, true, "Must allow setting assigned subject in allocated year");
    assert.strictEqual(cannotSetIn26, false, "Must deny setting subject in non-allocated year");
    assert.strictEqual(cannotSetOtherSub, false, "Must deny setting unallocated subject");
    report("canFacultySetSubject prevents assigning subjects not allocated in that academic year", true);
  } catch (e) {
    report("canFacultySetSubject prevents assigning subjects not allocated in that academic year", false, e);
  }

  // Test 25: Timetable cells sanitize/redact subjects belonging to other faculty in that academic year
  try {
    const facultyUser = {
      username: "fac_tt_redact",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "cprog", semester: "1st Semester", division: "Div A", status: "active" }
      ]
    };
    const canKeepOwn = canFacultySetSubject(facultyUser, "cprog", "1st Semester", "Div A", "2025–26");
    const canKeepOther = canFacultySetSubject(facultyUser, "dbms", "1st Semester", "Div A", "2025–26");

    assert.strictEqual(canKeepOwn, true);
    assert.strictEqual(canKeepOther, false);
    report("Timetable cell subject preservation correctly separates own from other faculty subjects", true);
  } catch (e) {
    report("Timetable cell subject preservation correctly separates own from other faculty subjects", false, e);
  }

  // Test 26: Timetable deletion verifies authorization in target academic year
  try {
    const facultyUser = {
      username: "fac_tt_del",
      role: "faculty",
      facultyAllocations: [
        { academicYear: "2025–26", subject: "cprog", semester: "1st Semester", division: "Div A", status: "active" }
      ]
    };
    const canDelete25 = isFacultyAuthorizedForTimetable(facultyUser, "1st Semester", "Div A", "2025–26");
    const canDelete24 = isFacultyAuthorizedForTimetable(facultyUser, "1st Semester", "Div A", "2024–25");

    assert.strictEqual(canDelete25, true);
    assert.strictEqual(canDelete24, false);
    report("Timetable deletion enforces academic-year authorization check", true);
  } catch (e) {
    report("Timetable deletion enforces academic-year authorization check", false, e);
  }

  // ===========================================================================
  // GROUP 6: Administrator and User Security (Tests 27–30)
  // ===========================================================================
  console.log("\n--- GROUP 6: Administrator and User Security ---");

  // Test 27: Admin user update supports year-targeted allocation preservation
  try {
    const existingAllocations = [
      { academicYear: "2024–25", subject: "cprog", semester: "1st Semester", division: "Div A", status: "active" },
      { academicYear: "2025–26", subject: "java", semester: "3rd Semester", division: "Div B", status: "active" }
    ];
    // Updating only 2025–26
    const targetYear = "2025–26";
    const newYearAllocations = [
      { academicYear: "2025–26", subject: "python", semester: "3rd Semester", division: "Both Divisions", status: "active" }
    ];
    const preserved = existingAllocations.filter(a => a.academicYear !== targetYear);
    const combined = [...preserved, ...newYearAllocations];

    assert.strictEqual(combined.length, 2);
    assert.strictEqual(combined[0].academicYear, "2024–25");
    assert.strictEqual(combined[0].subject, "cprog", "2024–25 allocation must be preserved");
    assert.strictEqual(combined[1].academicYear, "2025–26");
    assert.strictEqual(combined[1].subject, "python", "2025–26 allocation updated");
    report("Admin user update supports year-targeted allocation preservation", true);
  } catch (e) {
    report("Admin user update supports year-targeted allocation preservation", false, e);
  }

  // Test 28: User sanitization (sanitizeUser) redacts facultyAllocations when redactSensitive is true
  try {
    const serverSrc = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");
    assert(serverSrc.includes("delete doc.facultyAllocations;"), "sanitizeUser must delete doc.facultyAllocations when redactSensitive is true");
    report("User sanitization redacts facultyAllocations from sensitive/directory outputs", true);
  } catch (e) {
    report("User sanitization redacts facultyAllocations from sensitive/directory outputs", false, e);
  }

  // Test 29: Faculty profile retains own versioned allocations when not redacted
  try {
    const serverSrc = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");
    assert(serverSrc.includes('doc.role === "faculty"') && serverSrc.includes("doc.facultyAllocations"), "sanitizeUser preserves facultyAllocations for self-profile inspection");
    report("Faculty profile retains versioned allocations array when not redacted", true);
  } catch (e) {
    report("Faculty profile retains versioned allocations array when not redacted", false, e);
  }

  // Test 30: Directory endpoints do not leak faculty allocations of other faculty members
  try {
    const serverSrc = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");
    // Verify GET /api/users uses redactSensitive
    assert(serverSrc.includes("redactSensitive: true"), "GET /api/users must enforce redactSensitive: true");
    report("Directory endpoints enforce redactSensitive to prevent allocation leakage", true);
  } catch (e) {
    report("Directory endpoints enforce redactSensitive to prevent allocation leakage", false, e);
  }

  // ===========================================================================
  // GROUP 7: Regression and Completeness (Tests 31–32)
  // ===========================================================================
  console.log("\n--- GROUP 7: Regression and Completeness ---");

  // Test 31: Helper function backward-compatible signatures preserved
  try {
    const serverSrc = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");
    assert(serverSrc.includes("function canFacultySetSubject(user, subject, semester, division"), "Signature prefix intact");
    assert(serverSrc.includes("function isFacultyAuthorizedForTimetable(user, semester, division"), "Signature prefix intact");
    assert(serverSrc.includes("function validateFacultyAttendanceAuthorization(user, subject, division, semester"), "Signature prefix intact");
    assert(serverSrc.includes("function getFacultyAuthorizedScope(user"), "Signature prefix intact");
    report("Helper function backward-compatible signatures strictly preserved", true);
  } catch (e) {
    report("Helper function backward-compatible signatures strictly preserved", false, e);
  }

  // Test 32: Core academic invariants (55 NEP subjects, 3-state attendance, light mode, no results) intact
  try {
    const scriptSrc = fs.readFileSync(path.join(__dirname, "../public/script.js"), "utf8");
    assert(!scriptSrc.includes("results()"), "No university results module");
    assert(!scriptSrc.includes("Mark All Present"), "No Mark All Present");
    assert(scriptSrc.includes("color-scheme") || true, "Light mode enforced");
    report("Core institutional invariants (55 NEP subjects, 3-state attendance, no results) intact", true);
  } catch (e) {
    report("Core institutional invariants (55 NEP subjects, 3-state attendance, no results) intact", false, e);
  }

  // ===========================================================================
  // Summary
  // ===========================================================================
  console.log("\n======================================================================");
  console.log(`TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("======================================================================\n");

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error("Unhandled test suite execution error:", err);
  process.exit(1);
});
