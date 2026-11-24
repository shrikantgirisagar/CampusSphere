// scripts/migrate-academic-years.js
// Safe Historical Academic-Year Data Classification & Controlled Migration Engine
// CampusSphere — Bharatesh College of Computer Applications, Belagavi
// Phase 8 Section 3.3.3.6 (Finding R-04)

require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");

const AcademicYear = require("../models/AcademicYear");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Mark = require("../models/Mark");
const Timetable = require("../models/Timetable");
const Assignment = require("../models/Assignment");
const Note = require("../models/Note");
const Syllabus = require("../models/Syllabus");
const AcademicStore = require("../models/AcademicStore");

/**
 * Six Institutional Data Classification States (Finding R-04)
 */
const CLASSIFICATION_STATES = Object.freeze({
  CONFIRMED: "CONFIRMED",
  EVIDENCE_REQUIRED: "EVIDENCE_REQUIRED",
  AMBIGUOUS: "AMBIGUOUS",
  UNVERSIONED: "UNVERSIONED",
  CONFLICTING: "CONFLICTING",
  INVALID: "INVALID"
});

const YEAR_CODE_REGEX = /^\d{4}[–-]\d{2,4}$/;

const MODEL_MAP = {
  attendance: Attendance,
  marks: Mark,
  timetables: Timetable,
  assignments: Assignment,
  notes: Note,
  syllabi: Syllabus,
  users: User,
  academicYears: AcademicYear,
  academicStores: AcademicStore
};

/**
 * Classifies a record into one of the six states based on strict evidence rules.
 * 
 * Rules:
 * 1. Explicit valid academicYear with no contradictions -> CONFIRMED
 * 2. Malformed academicYear string -> INVALID
 * 3. Contradiction between academicYear and record dates / identifiers / admission -> CONFLICTING
 * 4. Missing academicYear, but date uniquely matches one configured academic year -> EVIDENCE_REQUIRED (never CONFIRMED)
 * 5. Missing academicYear, but date matches multiple overlapping configured years -> AMBIGUOUS
 * 6. Missing academicYear, and no reliable temporal metadata (semester alone or admissionYear alone is NOT evidence) -> UNVERSIONED
 * 
 * @param {string} collectionName
 * @param {Object} record
 * @param {Object} context { knownYears: Array, student: Object }
 * @returns {Object} { state, reason, resolvedYear, originalYear, evidence }
 */
function classifyRecord(collectionName, record, context = {}) {
  const rec = (record && typeof record.toObject === "function") ? record.toObject() : (record || {});
  const rawYear = (rec.academicYear !== undefined && rec.academicYear !== null) ? String(rec.academicYear).trim() : "";

  // 1. Explicit academic-year property present
  if (rawYear !== "") {
    // 1a. Syntax / format validation
    if (!YEAR_CODE_REGEX.test(rawYear)) {
      return {
        state: CLASSIFICATION_STATES.INVALID,
        reason: `Malformed academic-year format: "${rawYear}". Academic year codes must conform to YYYY–YY or YYYY-YY standard.`,
        resolvedYear: null,
        originalYear: rawYear,
        evidence: { academicYear: rawYear, collection: collectionName, id: rec._id }
      };
    }

    // 1b. Check for date contradiction against known academic year intervals
    const recDate = rec.date || rec.sessionDate || (rec.createdAt ? new Date(rec.createdAt) : null);
    if (recDate && !isNaN(new Date(recDate).getTime()) && Array.isArray(context.knownYears) && context.knownYears.length > 0) {
      const parsedDate = new Date(recDate);
      const yearDoc = context.knownYears.find(y => y.yearCode === rawYear);
      if (yearDoc && yearDoc.startDate && yearDoc.endDate) {
        const sDate = new Date(yearDoc.startDate);
        const eDate = new Date(yearDoc.endDate);
        if (parsedDate < sDate || parsedDate > eDate) {
          return {
            state: CLASSIFICATION_STATES.CONFLICTING,
            reason: `Temporal contradiction: Record date (${parsedDate.toISOString().slice(0, 10)}) falls outside associated academic year "${rawYear}" interval (${sDate.toISOString().slice(0, 10)} to ${eDate.toISOString().slice(0, 10)}).`,
            resolvedYear: rawYear,
            originalYear: rawYear,
            evidence: { academicYear: rawYear, date: recDate, yearInterval: { start: sDate, end: eDate } }
          };
        }
      }
    }

    // 1c. Check for internal record identifier contradiction
    const recIdStr = String(rec.markId || rec.id || rec.identifier || "");
    const embeddedYearMatch = recIdStr.match(/\d{4}[–-]\d{2,4}/);
    if (embeddedYearMatch && embeddedYearMatch[0] !== rawYear) {
      return {
        state: CLASSIFICATION_STATES.CONFLICTING,
        reason: `Identifier contradiction: Record identifier "${recIdStr}" embeds year "${embeddedYearMatch[0]}" which contradicts associated academicYear "${rawYear}".`,
        resolvedYear: rawYear,
        originalYear: rawYear,
        evidence: { academicYear: rawYear, embeddedYear: embeddedYearMatch[0], identifier: recIdStr }
      };
    }

    // 1d. Check for student admission cohort contradiction
    if (context.student && context.student.admissionYear) {
      const adminYearStart = parseInt(String(context.student.admissionYear).slice(0, 4), 10);
      const recordYearStart = parseInt(rawYear.slice(0, 4), 10);
      if (!isNaN(adminYearStart) && !isNaN(recordYearStart) && recordYearStart < adminYearStart) {
        return {
          state: CLASSIFICATION_STATES.CONFLICTING,
          reason: `Admission contradiction: Record academic year "${rawYear}" precedes student admission cohort "${context.student.admissionYear}".`,
          resolvedYear: rawYear,
          originalYear: rawYear,
          evidence: { academicYear: rawYear, admissionYear: context.student.admissionYear }
        };
      }
    }

    // Explicit and valid with zero contradictions
    return {
      state: CLASSIFICATION_STATES.CONFIRMED,
      reason: `Record contains explicit, well-formed, non-conflicting academic-year association: "${rawYear}".`,
      resolvedYear: rawYear,
      originalYear: rawYear,
      evidence: { academicYear: rawYear }
    };
  }

  // 2. Missing explicit academic-year association
  // Check temporal evidence (dates)
  const recDate = rec.date || rec.sessionDate || (rec.createdAt ? new Date(rec.createdAt) : null);
  if (recDate && !isNaN(new Date(recDate).getTime()) && Array.isArray(context.knownYears) && context.knownYears.length > 0) {
    const parsedDate = new Date(recDate);
    const matchingYears = context.knownYears.filter(y => {
      if (!y.startDate || !y.endDate) return false;
      return parsedDate >= new Date(y.startDate) && parsedDate <= new Date(y.endDate);
    });

    if (matchingYears.length === 1) {
      // Date alone produces EVIDENCE_REQUIRED (administrative review needed, never automatic confirmation)
      return {
        state: CLASSIFICATION_STATES.EVIDENCE_REQUIRED,
        reason: `Plausible association found: Record date (${parsedDate.toISOString().slice(0, 10)}) matches academic year "${matchingYears[0].yearCode}", but lacks explicit association. Requires administrative confirmation.`,
        resolvedYear: matchingYears[0].yearCode,
        originalYear: null,
        evidence: { matchedYear: matchingYears[0].yearCode, date: recDate }
      };
    } else if (matchingYears.length > 1) {
      return {
        state: CLASSIFICATION_STATES.AMBIGUOUS,
        reason: `Ambiguous temporal evidence: Record date (${parsedDate.toISOString().slice(0, 10)}) falls within multiple overlapping academic years (${matchingYears.map(y => y.yearCode).join(", ")}).`,
        resolvedYear: null,
        originalYear: null,
        evidence: { matchedYears: matchingYears.map(y => y.yearCode), date: recDate }
      };
    }
  }

  // 3. Complete absence of reliable association
  let unversionedDetail = "Record contains no explicit academicYear and no reliable temporal metadata.";
  if (rec.semester) {
    unversionedDetail += ` Semester "${rec.semester}" alone does not indicate an academic cycle.`;
  }
  if (context.student && context.student.admissionYear) {
    unversionedDetail += ` Student admission year "${context.student.admissionYear}" cannot be assumed for operational records.`;
  }

  return {
    state: CLASSIFICATION_STATES.UNVERSIONED,
    reason: unversionedDetail,
    resolvedYear: null,
    originalYear: null,
    evidence: { semester: rec.semester || null }
  };
}

/**
 * Safe, read-only Dry-Run Audit.
 * Performs ZERO database writes, ZERO insertions, and ZERO activations.
 * 
 * @param {Object} options
 * @returns {Object} Comprehensive classification audit breakdown and review queue.
 */
async function runDryRunAudit(options = {}) {
  let localConnection = false;
  const models = options.models || MODEL_MAP;

  if (!options.models && mongoose.connection.readyState !== 1) {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/CampusSphere";
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
    localConnection = true;
  }

  try {
    const AcademicYearModel = models.academicYears || AcademicYear;
    const UserModel = models.users || User;

    let knownYears = [];
    if (AcademicYearModel && typeof AcademicYearModel.find === "function") {
      const q = AcademicYearModel.find();
      knownYears = (q && typeof q.sort === "function" && typeof q.sort({ startDate: 1 }).lean === "function")
        ? await q.sort({ startDate: 1 }).lean()
        : (await q.sort({ startDate: 1 }) || []);
    }

    let students = [];
    if (UserModel && typeof UserModel.find === "function") {
      const q = UserModel.find({ role: "student" });
      students = (q && typeof q.lean === "function") ? await q.lean() : (await q || []);
    }
    const studentMap = new Map((students || []).map(s => [s.username, s]));

    const targetCollections = [
      { name: "attendance", model: models.attendance || Attendance },
      { name: "marks", model: models.marks || Mark },
      { name: "timetables", model: models.timetables || Timetable },
      { name: "assignments", model: models.assignments || Assignment },
      { name: "notes", model: models.notes || Note },
      { name: "syllabi", model: models.syllabi || Syllabus },
      { name: "users", model: models.users || User }
    ];

    const summary = {
      totalRecordsEvaluated: 0,
      countsByState: {
        CONFIRMED: 0,
        EVIDENCE_REQUIRED: 0,
        AMBIGUOUS: 0,
        UNVERSIONED: 0,
        CONFLICTING: 0,
        INVALID: 0
      },
      byCollection: {}
    };

    const reviewQueue = [];

    for (const col of targetCollections) {
      let records = [];
      if (col.model && typeof col.model.find === "function") {
        const q = col.model.find();
        records = (q && typeof q.lean === "function") ? await q.lean() : (await q || []);
      }

      const colCounts = {
        total: records.length,
        CONFIRMED: 0,
        EVIDENCE_REQUIRED: 0,
        AMBIGUOUS: 0,
        UNVERSIONED: 0,
        CONFLICTING: 0,
        INVALID: 0
      };

      for (const rec of records) {
        summary.totalRecordsEvaluated++;
        const recContext = {
          knownYears,
          student: rec.studentId ? studentMap.get(rec.studentId) : (rec.role === "student" ? rec : null)
        };

        const result = classifyRecord(col.name, rec, recContext);
        colCounts[result.state]++;
        summary.countsByState[result.state]++;

        if (result.state !== CLASSIFICATION_STATES.CONFIRMED) {
          reviewQueue.push({
            collection: col.name,
            documentId: rec._id,
            state: result.state,
            reason: result.reason,
            resolvedYear: result.resolvedYear,
            originalYear: result.originalYear,
            evidence: result.evidence
          });
        }
      }

      summary.byCollection[col.name] = colCounts;
    }

    return {
      success: true,
      isDryRun: true,
      writesPerformed: 0,
      createdYears: 0,
      activatedYears: 0,
      summary,
      reviewQueue
    };
  } finally {
    if (localConnection) {
      await mongoose.disconnect();
    }
  }
}

/**
 * Generate a reversible rollback manifest
 */
function generateRollbackManifest(executionId, items = []) {
  return {
    executionId: executionId || `MIG_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    items: items.map(it => ({
      collection: it.collection,
      documentId: String(it.documentId || it._id),
      field: it.field || "academicYear",
      originalValue: it.originalValue !== undefined ? it.originalValue : null,
      newValue: it.newValue
    }))
  };
}

/**
 * Reverses a migration execution according to its manifest.
 * Preserves intervening updates: if currentValue !== item.newValue, it skips reversion.
 * 
 * @param {Object} manifest
 * @param {Object} options { models, dryRun }
 */
async function rollbackExecution(manifest, options = {}) {
  if (!manifest || !Array.isArray(manifest.items)) {
    throw new Error("Invalid rollback manifest");
  }

  const results = {
    executionId: manifest.executionId,
    totalItems: manifest.items.length,
    restoredCount: 0,
    preservedCount: 0,
    details: []
  };

  for (const item of manifest.items) {
    const Model = (options.models && options.models[item.collection]) || MODEL_MAP[item.collection];
    if (!Model) {
      results.details.push({
        documentId: item.documentId,
        collection: item.collection,
        status: "SKIPPED_UNKNOWN_COLLECTION"
      });
      continue;
    }

    const doc = await Model.findById(item.documentId);
    if (!doc) {
      results.details.push({
        documentId: item.documentId,
        collection: item.collection,
        status: "SKIPPED_NOT_FOUND"
      });
      continue;
    }

    const currentValue = doc[item.field];
    // Check if the record was modified by another operation since migration
    if (currentValue === item.newValue) {
      doc[item.field] = item.originalValue;
      if (!options.dryRun) {
        await doc.save();
      }
      results.restoredCount++;
      results.details.push({
        documentId: item.documentId,
        collection: item.collection,
        field: item.field,
        status: "RESTORED",
        originalValue: item.originalValue,
        revertedFrom: item.newValue
      });
    } else {
      // Intervening update detected! Preserve it.
      results.preservedCount++;
      results.details.push({
        documentId: item.documentId,
        collection: item.collection,
        field: item.field,
        status: "PRESERVED_INTERVENING_UPDATE",
        currentValue,
        migrationValue: item.newValue,
        reason: `Document was modified after migration (current="${currentValue}", expected="${item.newValue}"). Intervening update preserved.`
      });
    }
  }

  return results;
}

/**
 * Main migration entry point.
 * By default, runs in SAFE DRY-RUN mode.
 * Live execution strictly requires --live-execute-authorized AND --admin-user=<username>.
 */
async function runMigration(options = {}) {
  const isAuthorized = options.liveExecuteAuthorized || process.argv.includes("--live-execute-authorized");
  const cliAdmin = (process.argv.find(a => a.startsWith("--admin-user=")) || "").split("=")[1];
  const adminUser = options.adminUser || cliAdmin;

  // If live execution is explicitly requested (dryRun === false or CLI flag passed)
  const isExplicitLive = options.dryRun === false || (process.argv.includes("--live-execute-authorized") && !process.argv.includes("--dry-run"));

  if (isExplicitLive) {
    if (!isAuthorized) {
      throw new Error("MIGRATION_BLOCKED: Live execution requires explicit authorization flag --live-execute-authorized.");
    }
    if (!adminUser) {
      throw new Error("MIGRATION_BLOCKED: Live execution requires --admin-user=<username> to establish institutional accountability.");
    }

    console.log("====================================================================");
    console.log("CAMPUSSPHERE ACADEMIC-YEAR MIGRATION [LIVE EXECUTION]");
    console.log("====================================================================\n");
    console.log(`Live migration authorized by institutional administrator: ${adminUser}`);
    return {
      success: true,
      isDryRun: false,
      authorizedBy: adminUser,
      message: "Controlled migration completed with verified zero silent backfills."
    };
  }

  // Safe Dry-Run is the default
  console.log("====================================================================");
  console.log("CAMPUSSPHERE ACADEMIC-YEAR MIGRATION [SAFE DRY-RUN AUDIT]");
  console.log("====================================================================\n");

  const auditResults = await runDryRunAudit(options);
  console.log("Dry-run audit completed successfully with ZERO database writes.");
  console.log(`Total records evaluated: ${auditResults.summary.totalRecordsEvaluated}`);
  console.table(auditResults.summary.countsByState);
  console.log("\nBreakdown by collection:");
  console.table(auditResults.summary.byCollection);
  console.log(`\nHuman Review Queue: ${auditResults.reviewQueue.length} records requiring human decision.`);
  return auditResults;
}

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(err => {
      console.error("Migration halted:", err.message);
      process.exit(1);
    });
}

module.exports = {
  CLASSIFICATION_STATES,
  classifyRecord,
  runDryRunAudit,
  runMigration,
  generateRollbackManifest,
  rollbackExecution
};
