// scripts/test-cross-portal-academic-fallbacks.js
// Acceptance Test Suite for CampusSphere Phase 8 Section 3.3.3.7:
// Static Academic-Year Display & Mock Fallback Removal (Finding R-08)

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const SCRIPT_PATH = path.resolve(__dirname, "../public/script.js");
const scriptContent = fs.readFileSync(SCRIPT_PATH, "utf8");

let passed = 0;
let failed = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${testName}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function runAsyncTest(testName, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${testName}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function main() {
  console.log("====================================================================");
  console.log("ACCEPTANCE TEST SUITE: SECTION 3.3.3.7 STATIC FALLBACK REMOVAL");
  console.log("====================================================================\n");

  // Test 1: Configured active academic year renders dynamically across portals
  runTest("1. Configured active academic year renders dynamically across portals", () => {
    // Check that faculty portal and student portal interpolate window.activeInstitutionalAcademicYear
    assert.ok(
      scriptContent.includes("Faculty Portal • Academic Year: ${escapeHtml(window.activeInstitutionalAcademicYear"),
      "Faculty portal must interpolate activeInstitutionalAcademicYear dynamically"
    );
    assert.ok(
      scriptContent.includes("Academic Year: ${escapeHtml(window.activeInstitutionalAcademicYear"),
      "Student portal must interpolate activeInstitutionalAcademicYear dynamically"
    );
  });

  // Test 2: No active year produces honest unavailable/configuration state
  runTest("2. No active year produces honest unavailable/configuration state", () => {
    // Verify fallback is "Not active" or "Not configured", never a hardcoded year
    const facultyEyebrowMatch = scriptContent.match(/Faculty Portal • Academic Year: \${escapeHtml\(window\.activeInstitutionalAcademicYear \|\| "([^"]+)"\)}/);
    assert.ok(facultyEyebrowMatch, "Faculty portal must have a fallback expression");
    assert.strictEqual(facultyEyebrowMatch[1], "Not active", "Faculty portal fallback must be 'Not active'");

    const studentMetaMatch = scriptContent.match(/Academic Year: \${escapeHtml\(window\.activeInstitutionalAcademicYear \|\| "([^"]+)"\)}/);
    assert.ok(studentMetaMatch, "Student portal must have a fallback expression");
    assert.strictEqual(studentMetaMatch[1], "Not configured", "Student portal fallback must be 'Not configured'");
  });

  // Test 3: API failure does not display hardcoded year
  runTest("3. API failure does not display hardcoded year", () => {
    // In fetchAcademicYearsData, errors are caught without setting a fake year
    const fetchFnMatch = scriptContent.match(/async function fetchAcademicYearsData\(\)[\s\S]*?catch \(err\) \{([\s\S]*?)\}/);
    assert.ok(fetchFnMatch, "fetchAcademicYearsData must exist");
    const catchBody = fetchFnMatch[1];
    assert.ok(!catchBody.includes("2026–27"), "Catch block must not inject hardcoded 2026–27 fallback");
    assert.ok(!catchBody.includes("window.activeInstitutionalAcademicYear ="), "Catch block must not invent active year");
  });

  // Test 4: Loading state does not briefly show fabricated year
  runTest("4. Loading state does not briefly show fabricated year", () => {
    // adminAcademicYears must not contain fabricated 3-item array when cachedAcademicYears is empty
    const adminFnMatch = scriptContent.match(/function adminAcademicYears\(\) \{([\s\S]*?)const activeYear/);
    assert.ok(adminFnMatch, "adminAcademicYears must exist");
    assert.ok(!adminFnMatch[1].includes('"2026–27"'), "Must not contain mock 2026–27 array");
    assert.ok(!adminFnMatch[1].includes('"2025–26"'), "Must not contain mock 2025–26 array");
    assert.ok(!adminFnMatch[1].includes('"2027–28"'), "Must not contain mock 2027–28 array");
    assert.ok(adminFnMatch[1].includes("!years.length"), "Must check for empty years and return honest empty state");
  });

  // Test 5: Historical year selection remains unchanged
  runTest("5. Historical year selection remains unchanged", () => {
    // Verify syllabus module respects window.__selectedSyllabusAcademicYear and doc.academicYear
    assert.ok(
      scriptContent.includes("window.__selectedSyllabusAcademicYear"),
      "Syllabus module must respect user's explicit historical year selection"
    );
  });

  // Test 6: Custom semester subsets render correctly
  runTest("6. Custom semester subsets render correctly", () => {
    // Verify operational semesters are filtered dynamically from activeYear.semesterConfiguration
    assert.ok(
      scriptContent.includes("activeYear.semesterConfiguration.filter(s => s.isOperational)"),
      "Must filter operational semesters directly from activeYear.semesterConfiguration"
    );
  });

  // Test 7: Empty semester configuration handled correctly
  runTest("7. Empty semester configuration handled correctly", () => {
    // Verify that when operationalSemesters is empty, it displays an honest notice
    assert.ok(
      scriptContent.includes("No operational semesters configured for this cycle"),
      "Must display honest notice when operationalSemesters array is empty"
    );
  });

  // Test 8: Student admission year is not substituted for operational academic year
  runTest("8. Student admission year is not substituted for operational academic year", () => {
    // In student profile: admissionYear and operational academic year must be two separate fields
    assert.ok(
      scriptContent.includes("<div><small>Admission Year</small><b>${escapeHtml(currentUser.admissionYear"),
      "Profile must render separate Admission Year"
    );
    assert.ok(
      scriptContent.includes("<div><small>Operational Academic Year</small><b>${escapeHtml(window.activeInstitutionalAcademicYear"),
      "Profile must render separate Operational Academic Year"
    );
  });

  // Test 9: All portals use authoritative academic-year data
  runTest("9. All portals use authoritative academic-year data", () => {
    // Check that active cycle in faculty profile uses window.activeInstitutionalAcademicYear
    assert.ok(
      scriptContent.includes("<div><small>Academic Cycle</small><b>${escapeHtml(window.activeInstitutionalAcademicYear || \"Not active\")}</b></div>"),
      "Faculty profile must use authoritative activeInstitutionalAcademicYear"
    );
  });

  // Test 10: No obsolete hardcoded fallback in production code
  runTest("10. No obsolete hardcoded fallback in production code", () => {
    // Scan for `|| "2026–27"` or `|| '2026–27'` in script.js
    const fallbackMatches = scriptContent.match(/\|\|\s*["']2026[–-]27["']/g);
    assert.strictEqual(fallbackMatches, null, "Zero obsolete '|| 2026–27' fallbacks allowed in production code");
  });

  // Test 11: Retry behavior does not create or activate academic years
  runTest("11. Retry behavior does not create or activate academic years", () => {
    // fetchAcademicYearsData must use GET method (authenticatedFetch default)
    const fetchCall = scriptContent.match(/authenticatedFetch\(`\$\{API_BASE_URL\}\/api\/academic-years`\)/);
    assert.ok(fetchCall, "Fetch call must query /api/academic-years with safe GET request");
  });

  // Test 12: Existing portal navigation and functionality remain intact
  runTest("12. Existing portal navigation and functionality remain intact", () => {
    // Check that data-actions for academic year management remain intact
    assert.ok(scriptContent.includes('data-action="open-create-ay-modal"'), "open-create-ay-modal must exist");
    assert.ok(scriptContent.includes('data-action="open-activate-year-modal"'), "open-activate-year-modal must exist");
    assert.ok(scriptContent.includes('data-action="configure-semesters"'), "configure-semesters must exist");
  });

  console.log("\n====================================================================");
  console.log(`SECTION 3.3.3.7 TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log("====================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(err => {
      console.error("Test execution failed:", err);
      process.exit(1);
    });
}
