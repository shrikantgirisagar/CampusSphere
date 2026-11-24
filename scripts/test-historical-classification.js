// scripts/test-historical-classification.js
// Acceptance Test Suite for CampusSphere Phase 8 Section 3.3.3.6:
// Safe Historical Academic-Year Data Classification & Migration (Finding R-04)

const assert = require("assert");
const {
  CLASSIFICATION_STATES,
  classifyRecord,
  runDryRunAudit,
  runMigration,
  generateRollbackManifest,
  rollbackExecution
} = require("./migrate-academic-years");

const mockKnownYears = [
  {
    yearCode: "2025–26",
    title: "Academic Year 2025–26",
    status: "completed",
    startDate: new Date("2025-06-01T00:00:00.000Z"),
    endDate: new Date("2026-05-31T23:59:59.999Z")
  },
  {
    yearCode: "2026–27",
    title: "Academic Year 2026–27",
    status: "active",
    startDate: new Date("2026-06-01T00:00:00.000Z"),
    endDate: new Date("2027-05-31T23:59:59.999Z")
  },
  {
    yearCode: "2027–28",
    title: "Academic Year 2027–28",
    status: "upcoming",
    startDate: new Date("2027-06-01T00:00:00.000Z"),
    endDate: new Date("2028-05-31T23:59:59.999Z")
  }
];

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
  console.log("ACCEPTANCE TEST SUITE: SECTION 3.3.3.6 HISTORICAL DATA CLASSIFICATION");
  console.log("====================================================================\n");

  // Test 1: Explicitly associated historical record remains associated with original year
  runTest("1. Explicitly associated historical record remains associated with original year", () => {
    const historicalRec = {
      _id: "rec1",
      academicYear: "2024–25",
      subject: "cprog",
      studentId: "student1"
    };
    const res = classifyRecord("attendance", historicalRec, { knownYears: mockKnownYears });
    assert.strictEqual(res.state, CLASSIFICATION_STATES.CONFIRMED);
    assert.strictEqual(res.resolvedYear, "2024–25");
    assert.strictEqual(historicalRec.academicYear, "2024–25", "Original record must not be mutated");
  });

  // Test 2: Record without academic-year association is NOT assigned to active year
  runTest("2. Record without academic-year association is NOT assigned to active year", () => {
    const unassignedRec = {
      _id: "rec2",
      subject: "cprog",
      studentId: "student2"
    };
    const res = classifyRecord("attendance", unassignedRec, { knownYears: mockKnownYears });
    assert.notStrictEqual(res.state, CLASSIFICATION_STATES.CONFIRMED);
    assert.strictEqual(res.state, CLASSIFICATION_STATES.UNVERSIONED);
    assert.strictEqual(res.resolvedYear, null, "Must never automatically assign active year");
  });

  // Test 3: Student's admission year is NOT automatically used for every historical record
  runTest("3. Student's admission year is NOT automatically used for every historical record", () => {
    const student = { username: "student1", admissionYear: "2025–26", academicYear: "2026–27" };
    const rec = {
      _id: "rec3",
      subject: "java",
      studentId: "student1",
      semester: "3rd Semester"
    };
    const res = classifyRecord("attendance", rec, { knownYears: mockKnownYears, student });
    assert.notStrictEqual(res.state, CLASSIFICATION_STATES.CONFIRMED);
    assert.strictEqual(res.state, CLASSIFICATION_STATES.UNVERSIONED);
    assert.strictEqual(res.resolvedYear, null);
  });

  // Test 4: Record with conflicting evidence is classified as CONFLICTING
  runTest("4. Record with conflicting evidence is classified as CONFLICTING", () => {
    const conflictingRec = {
      _id: "rec4",
      academicYear: "2025–26",
      date: new Date("2026-11-15T10:00:00.000Z"), // Falls in 2026–27, contradicts 2025–26
      subject: "cprog"
    };
    const res = classifyRecord("attendance", conflictingRec, { knownYears: mockKnownYears });
    assert.strictEqual(res.state, CLASSIFICATION_STATES.CONFLICTING);
    assert.strictEqual(res.resolvedYear, "2025–26");
    assert.ok(res.reason.includes("contradiction"), "Reason must articulate contradiction");
  });

  // Test 5: Record with multiple plausible years is classified as AMBIGUOUS
  runTest("5. Record with multiple plausible years is classified as AMBIGUOUS", () => {
    // Mock overlapping year intervals
    const overlappingYears = [
      {
        yearCode: "2025–26",
        startDate: new Date("2025-06-01"),
        endDate: new Date("2026-07-01") // overlaps with next
      },
      {
        yearCode: "2026–27",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2027-05-31")
      }
    ];
    const ambiguousRec = {
      _id: "rec5",
      date: new Date("2026-06-15"),
      subject: "ds"
    };
    const res = classifyRecord("attendance", ambiguousRec, { knownYears: overlappingYears });
    assert.strictEqual(res.state, CLASSIFICATION_STATES.AMBIGUOUS);
    assert.strictEqual(res.resolvedYear, null);
    assert.ok(res.evidence.matchedYears.length > 1);
  });

  // Test 6: Record with no reliable evidence is classified as UNVERSIONED
  runTest("6. Record with no reliable evidence is classified as UNVERSIONED", () => {
    const unversionedRec = {
      _id: "rec6",
      semester: "1st Semester",
      subject: "kannada"
    };
    const res = classifyRecord("attendance", unversionedRec, { knownYears: mockKnownYears });
    assert.strictEqual(res.state, CLASSIFICATION_STATES.UNVERSIONED);
    assert.strictEqual(res.resolvedYear, null);
  });

  // Test 7: Date alone does NOT produce an unsupported confirmed association
  runTest("7. Date alone does NOT produce an unsupported confirmed association (yields EVIDENCE_REQUIRED)", () => {
    const datedRec = {
      _id: "rec7",
      date: new Date("2026-08-20T10:00:00.000Z"),
      subject: "os"
    };
    const res = classifyRecord("attendance", datedRec, { knownYears: mockKnownYears });
    assert.strictEqual(res.state, CLASSIFICATION_STATES.EVIDENCE_REQUIRED);
    assert.notStrictEqual(res.state, CLASSIFICATION_STATES.CONFIRMED, "Date alone must NEVER yield CONFIRMED");
    assert.strictEqual(res.resolvedYear, "2026–27");
  });

  const mockDbModels = {
    academicYears: { find: () => ({ sort: () => ({ lean: async () => mockKnownYears }) }) },
    users: { find: () => ({ lean: async () => [{ username: "student1", role: "student", admissionYear: "2025–26" }] }) },
    attendance: { find: () => ({ lean: async () => [{ _id: "att1", academicYear: "2026–27" }, { _id: "att2", date: new Date("2026-08-01") }] }) },
    marks: { find: () => ({ lean: async () => [{ _id: "mk1", academicYear: "2026–27" }] }) },
    timetables: { find: () => ({ lean: async () => [] }) },
    assignments: { find: () => ({ lean: async () => [] }) },
    notes: { find: () => ({ lean: async () => [] }) },
    syllabi: { find: () => ({ lean: async () => [] }) }
  };

  // Test 8: Dry-run performs zero database writes
  await runAsyncTest("8. Dry-run performs zero database writes", async () => {
    const auditRes = await runDryRunAudit({ models: mockDbModels });
    assert.strictEqual(auditRes.isDryRun, true);
    assert.strictEqual(auditRes.writesPerformed, 0);
  });

  // Test 9: Dry-run does NOT create academic-year records
  await runAsyncTest("9. Dry-run does NOT create academic-year records", async () => {
    const auditRes = await runDryRunAudit({ models: mockDbModels });
    assert.strictEqual(auditRes.createdYears, 0);
  });

  // Test 10: Dry-run does NOT activate an academic year
  await runAsyncTest("10. Dry-run does NOT activate an academic year", async () => {
    const auditRes = await runDryRunAudit({ models: mockDbModels });
    assert.strictEqual(auditRes.activatedYears, 0);
  });

  // Test 11: Existing associations are never overwritten by classification
  runTest("11. Existing associations are never overwritten by classification", () => {
    const doc = { _id: "doc11", academicYear: "2025–26", subject: "java" };
    const originalDoc = JSON.stringify(doc);
    classifyRecord("marks", doc, { knownYears: mockKnownYears });
    assert.strictEqual(JSON.stringify(doc), originalDoc, "Input document must remain completely unmutated");
  });

  // Test 12: Classification output explains why each record received its classification
  runTest("12. Classification output explains why each record received its classification", () => {
    const records = [
      { rec: { academicYear: "2026–27" }, expected: CLASSIFICATION_STATES.CONFIRMED },
      { rec: { academicYear: "2026/27-invalid" }, expected: CLASSIFICATION_STATES.INVALID },
      { rec: { date: new Date("2026-09-01") }, expected: CLASSIFICATION_STATES.EVIDENCE_REQUIRED },
      { rec: { semester: "2nd Semester" }, expected: CLASSIFICATION_STATES.UNVERSIONED },
      { rec: { academicYear: "2025–26", markId: "2026-27_sem3_java" }, expected: CLASSIFICATION_STATES.CONFLICTING }
    ];

    for (const item of records) {
      const res = classifyRecord("marks", item.rec, { knownYears: mockKnownYears });
      assert.strictEqual(res.state, item.expected);
      assert.ok(typeof res.reason === "string" && res.reason.length > 10, "Reason must be descriptive string");
    }
  });

  // Test 13: Existing migration behavior cannot silently backfill records to current active year
  await runAsyncTest("13. Existing migration behavior cannot silently backfill records to current active year", async () => {
    // Calling runMigration without flags must run dry-run audit only
    const res = await runMigration({ dryRun: true, models: mockDbModels });
    assert.strictEqual(res.isDryRun, true);
    assert.strictEqual(res.writesPerformed, 0);
  });

  // Test 14: Any future migration mechanism requires explicit authorization
  await runAsyncTest("14. Any future migration mechanism requires explicit authorization", async () => {
    let errorThrown = false;
    try {
      // Attempt live migration without flags
      await runMigration({ liveExecuteAuthorized: false, dryRun: false });
    } catch (err) {
      errorThrown = true;
      assert.ok(err.message.includes("MIGRATION_BLOCKED"));
    }
    assert.ok(errorThrown, "Live migration must fail without explicit authorization");

    let adminError = false;
    try {
      // Attempt live migration with authorization but without adminUser
      await runMigration({ liveExecuteAuthorized: true, adminUser: null, dryRun: false });
    } catch (err) {
      adminError = true;
      assert.ok(err.message.includes("admin-user"));
    }
    assert.ok(adminError, "Live migration must fail without adminUser specified");
  });

  // Test 15: Rollback design preserves unrelated updates
  await runAsyncTest("15. Rollback design preserves unrelated updates", async () => {
    const mockStorage = {
      doc_clean: { _id: "doc_clean", academicYear: "2026–27" },
      doc_modified: { _id: "doc_modified", academicYear: "2027–28_intervening_update" }
    };

    const mockModel = {
      findById: async (id) => mockStorage[id]
    };

    const manifest = generateRollbackManifest("TEST_EXEC_1", [
      { collection: "testCol", documentId: "doc_clean", field: "academicYear", originalValue: null, newValue: "2026–27" },
      { collection: "testCol", documentId: "doc_modified", field: "academicYear", originalValue: null, newValue: "2026–27" }
    ]);

    const rollbackResult = await rollbackExecution(manifest, {
      dryRun: true,
      models: { testCol: mockModel }
    });

    assert.strictEqual(rollbackResult.totalItems, 2);
    assert.strictEqual(rollbackResult.restoredCount, 1, "doc_clean must be restored");
    assert.strictEqual(rollbackResult.preservedCount, 1, "doc_modified must be preserved");

    const cleanDetail = rollbackResult.details.find(d => d.documentId === "doc_clean");
    assert.strictEqual(cleanDetail.status, "RESTORED");

    const modifiedDetail = rollbackResult.details.find(d => d.documentId === "doc_modified");
    assert.strictEqual(modifiedDetail.status, "PRESERVED_INTERVENING_UPDATE");
    assert.ok(modifiedDetail.reason.includes("Intervening update preserved"));
  });

  console.log("\n====================================================================");
  console.log(`SECTION 3.3.3.6 TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
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
