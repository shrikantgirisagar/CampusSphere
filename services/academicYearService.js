// services/academicYearService.js
// Central business logic & single source of truth for Academic Years in CampusSphere.
// Manages dynamic academic year creation, lifecycle transitions, one-active-year enforcement,
// semester configuration, and backward-compatible record resolution.

const AcademicYear = require("../models/AcademicYear");

const DEFAULT_SEMESTER_CONFIG = [
  { semester: "1st Semester", cycle: "odd", courseYear: "1st Year", isOperational: true, status: "active" },
  { semester: "2nd Semester", cycle: "even", courseYear: "1st Year", isOperational: false, status: "upcoming" },
  { semester: "3rd Semester", cycle: "odd", courseYear: "2nd Year", isOperational: true, status: "active" },
  { semester: "4th Semester", cycle: "even", courseYear: "2nd Year", isOperational: false, status: "upcoming" },
  { semester: "5th Semester", cycle: "odd", courseYear: "3rd Year", isOperational: true, status: "active" },
  { semester: "6th Semester", cycle: "even", courseYear: "3rd Year", isOperational: false, status: "upcoming" }
];

class AcademicYearService {
  constructor() {
    // In-memory serialized promise chain for single-process activation concurrency protection
    this._activationQueue = Promise.resolve();
  }

  /**
   * Deprecated baseline provisioning method (Phase 8 Section 3.3.3.2).
   * Preserved for backward-compatible interface contract with external callers/tests,
   * but strictly a no-op that performs zero database writes, zero insertions, and zero fallback activations.
   * Academic year creation and activation must be deliberate, authorized administrative operations.
   */
  async ensureBaselineYears() {
    // No-op: Automatic baseline seeding and fallback activation have been eliminated
    return;
  }

  /**
   * Get single active institutional academic year (Strictly Read-Only)
   * 
   * 1. Queries for documents with { status: "active" }.
   * 2. Returns the active document when exactly one exists.
   * 3. Returns null when zero active documents exist.
   * 4. Throws an error (code: MULTIPLE_ACTIVE_YEARS) if more than one document is active.
   * 5. Performs ZERO database writes (no save, insertMany, updateOne, or repair).
   */
  async getActiveAcademicYear() {
    const activeDocs = await AcademicYear.find({ status: "active" }).exec();
    if (!activeDocs || activeDocs.length === 0) {
      return null;
    }
    if (activeDocs.length > 1) {
      const err = new Error("Data integrity error: Multiple academic years are marked active.");
      err.code = "MULTIPLE_ACTIVE_YEARS";
      throw err;
    }
    return activeDocs[0];
  }

  /**
   * Quick helper to get active yearCode string (Strictly Read-Only)
   * Returns the verified active yearCode, or null if no active academic year is configured.
   * Never returns a hardcoded academic-year value (e.g. 2026–27).
   * Never hides database or infrastructure errors by silently returning a default year.
   */
  async getActiveYearCode() {
    const active = await this.getActiveAcademicYear();
    return active ? active.yearCode : null;
  }

  /**
   * Get all academic years with optional lifecycle filtering (Strictly Read-Only)
   * Performs zero database writes or automatic seeding.
   */
  async getAllAcademicYears(filter = {}) {
    const query = {};
    if (filter.status) query.status = filter.status;
    return AcademicYear.find(query).sort({ startDate: -1 }).exec();
  }

  /**
   * Retrieve academic year by Mongo ID or yearCode (e.g. "2026–27")
   */
  async getAcademicYearByIdOrCode(identifier) {
    if (!identifier) return null;
    const trimmed = String(identifier).trim();
    if (trimmed.match(/^[0-9a-fA-F]{24}$/)) {
      const byId = await AcademicYear.findById(trimmed).exec();
      if (byId) return byId;
    }
    return AcademicYear.findOne({ yearCode: trimmed }).exec();
  }

  /**
   * Create a new Academic Year (Admin only)
   */
  async createAcademicYear(data, adminUser = "admin") {
    const { yearCode, title, startDate, endDate, notes, semesterConfiguration, activeCycle } = data;

    if (!yearCode || !String(yearCode).trim()) {
      throw new Error("Academic year code is required (e.g. 2028–29).");
    }

    const cleanCode = String(yearCode).trim();
    const existing = await AcademicYear.findOne({ yearCode: cleanCode }).exec();
    if (existing) {
      throw new Error(`Academic year with code "${cleanCode}" already exists.`);
    }

    if (!startDate || !endDate) {
      throw new Error("Both start date and end date are required.");
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
      throw new Error("Invalid start date or end date format.");
    }
    if (sDate >= eDate) {
      throw new Error("End date must be strictly after start date.");
    }

    const newYear = new AcademicYear({
      yearCode: cleanCode,
      title: title && String(title).trim() ? String(title).trim() : `Academic Year ${cleanCode}`,
      startDate: sDate,
      endDate: eDate,
      status: "upcoming", // New years always start as upcoming
      activeCycle: activeCycle || "odd",
      notes: notes ? String(notes).trim() : "",
      createdBy: adminUser,
      updatedBy: adminUser,
      semesterConfiguration: Array.isArray(semesterConfiguration)
        ? semesterConfiguration
        : DEFAULT_SEMESTER_CONFIG.map(s => ({
            ...s,
            isOperational: false,
            status: "upcoming"
          }))
    });

    return newYear.save();
  }

  /**
   * Update configuration fields of an existing Academic Year
   */
  async updateAcademicYear(id, data, adminUser = "admin") {
    const year = await this.getAcademicYearByIdOrCode(id);
    if (!year) throw new Error("Academic year not found.");

    if (data.title !== undefined) year.title = String(data.title).trim();
    if (data.notes !== undefined) year.notes = String(data.notes).trim();
    if (data.activeCycle !== undefined) year.activeCycle = String(data.activeCycle).trim();

    if (data.startDate) {
      const sDate = new Date(data.startDate);
      if (isNaN(sDate.getTime())) throw new Error("Invalid start date.");
      year.startDate = sDate;
    }

    if (data.endDate) {
      const eDate = new Date(data.endDate);
      if (isNaN(eDate.getTime())) throw new Error("Invalid end date.");
      year.endDate = eDate;
    }

    if (year.startDate >= year.endDate) {
      throw new Error("End date must be strictly after start date.");
    }

    year.updatedBy = adminUser;
    return year.save();
  }

  /**
   * Configure operational semesters for a specific academic year
   * Validates semester values, prevents duplicates, and allows custom operational states.
   */
  async updateSemesterConfiguration(id, semestersList, adminUser = "admin") {
    const year = await this.getAcademicYearByIdOrCode(id);
    if (!year) throw new Error("Academic year not found.");

    if (!Array.isArray(semestersList)) {
      throw new Error("Semester configuration must be an array of semester settings.");
    }

    const validNames = [
      "1st Semester", "2nd Semester", "3rd Semester",
      "4th Semester", "5th Semester", "6th Semester"
    ];

    if (semestersList.length === 0) {
      year.semesterConfiguration = [];
      year.updatedBy = adminUser;
      return year.save();
    }

    // Validate inputs and guard against duplicates
    const seen = new Set();
    const updatedConfig = [];
    for (const item of semestersList) {
      if (!item || typeof item !== "object") continue;
      const rawName = String(item.semester || "").trim();
      if (!rawName) continue;
      const canonical = validNames.find(v => v.toLowerCase() === rawName.toLowerCase());
      if (!canonical) {
        throw new Error(`Invalid semester value: "${rawName}". Valid semesters are: ${validNames.join(", ")}`);
      }
      if (seen.has(canonical)) {
        throw new Error(`Duplicate semester configuration detected for "${canonical}". Each semester may only be configured once.`);
      }
      seen.add(canonical);

      const base = DEFAULT_SEMESTER_CONFIG.find(b => b.semester.toLowerCase() === canonical.toLowerCase()) || {};
      const isOperational = item.isOperational !== undefined ? Boolean(item.isOperational) : (base.isOperational !== undefined ? base.isOperational : true);
      const status = item.status || (isOperational ? "active" : "upcoming");
      updatedConfig.push({
        semester: canonical,
        cycle: item.cycle || base.cycle || (canonical.includes("1") || canonical.includes("3") || canonical.includes("5") ? "odd" : "even"),
        courseYear: item.courseYear || base.courseYear || (canonical.includes("1") || canonical.includes("2") ? "1st Year" : canonical.includes("3") || canonical.includes("4") ? "2nd Year" : "3rd Year"),
        isOperational,
        status
      });
    }

    year.semesterConfiguration = updatedConfig;
    year.updatedBy = adminUser;
    return year.save();
  }

  /**
   * Retrieve operational semesters for a specific academic year (Read-Only)
   * Returns list of operational semester names (e.g. ["1st Semester", "3rd Semester"]).
   * Returns empty array if none are operational or no semesters configured.
   * Returns null if academic year cannot be found.
   */
  async getOperationalSemestersForYear(identifier) {
    const year = await this.getAcademicYearByIdOrCode(identifier);
    if (!year) return null;
    if (!Array.isArray(year.semesterConfiguration) || year.semesterConfiguration.length === 0) {
      return [];
    }
    return year.semesterConfiguration
      .filter(s => s && s.isOperational && s.status === "active")
      .map(s => s.semester);
  }

  /**
   * Safe Atomic Academic-Year Transition Workflow
   * Deactivates current active year and activates target year.
   * Guarantees that exactly one academic year is active.
   */
  async activateAcademicYear(id, adminUser = "admin") {
    // Chain onto in-process queue to serialize same-process activation calls
    const executeActivation = async () => {
      const targetYear = await this.getAcademicYearByIdOrCode(id);
      if (!targetYear) {
        throw new Error("Target academic year not found.");
      }

      if (targetYear.status === "active") {
        return {
          alreadyActive: true,
          academicYear: targetYear,
          message: `Academic year "${targetYear.yearCode}" is already active.`
        };
      }

      if (targetYear.status === "archived") {
        throw new Error(`Archived academic year "${targetYear.yearCode}" cannot be directly activated. Restore to completed or upcoming first.`);
      }

      // Identify current active year
      const currentActive = await AcademicYear.findOne({ status: "active" }).exec();

      // Check if MongoDB session transactions are supported
      const mongoose = require("mongoose");
      let session = null;
      let supportsTransactions = false;

      try {
        if (mongoose.connection && mongoose.connection.client) {
          session = await mongoose.startSession();
          // Check replica set status
          supportsTransactions = !!(mongoose.connection.client.topology && mongoose.connection.client.topology.description.type !== "Single");
        }
      } catch (_) {
        session = null;
        supportsTransactions = false;
      }

      if (supportsTransactions && session) {
        try {
          await session.withTransaction(async () => {
            if (currentActive && String(currentActive._id) !== String(targetYear._id)) {
              currentActive.status = "completed";
              currentActive.completedAt = new Date();
              currentActive.updatedBy = adminUser;
              await currentActive.save({ session });
            }

            targetYear.status = "active";
            targetYear.activatedAt = new Date();
            targetYear.updatedBy = adminUser;
            // Activate configured operational semesters
            if (Array.isArray(targetYear.semesterConfiguration)) {
              targetYear.semesterConfiguration.forEach(s => {
                if (s.isOperational) s.status = "active";
              });
            }
            await targetYear.save({ session });
          });
        } finally {
          await session.endSession();
        }
      } else {
        // Fallback safe sequential transition with rollback protection
        const previousState = currentActive ? { id: currentActive._id, status: currentActive.status } : null;

        try {
          if (currentActive && String(currentActive._id) !== String(targetYear._id)) {
            // Deactivate current active first so partial unique index permits target activation
            await AcademicYear.updateOne(
              { _id: currentActive._id, status: "active" },
              { $set: { status: "completed", completedAt: new Date(), updatedBy: adminUser } }
            );
          }

          targetYear.status = "active";
          targetYear.activatedAt = new Date();
          targetYear.updatedBy = adminUser;
          if (Array.isArray(targetYear.semesterConfiguration)) {
            targetYear.semesterConfiguration.forEach(s => {
              if (s.isOperational) s.status = "active";
            });
          }
          await targetYear.save();
        } catch (activationErr) {
          // Rollback previous year state if activation fails
          if (previousState) {
            await AcademicYear.updateOne(
              { _id: previousState.id },
              { $set: { status: previousState.status } }
            ).catch(() => {});
          }
          throw activationErr;
        }
      }

      return {
        success: true,
        previousActiveYear: currentActive ? currentActive.yearCode : null,
        activeAcademicYear: targetYear,
        message: `Academic year "${targetYear.yearCode}" is now active.`
      };
    };

    const nextPromise = this._activationQueue.then(executeActivation, executeActivation);
    this._activationQueue = nextPromise.catch(() => {});
    return nextPromise;
  }

  /**
   * Complete an academic year with lifecycle guard (R-06 Lifecycle Integrity)
   * Prevents accidental zero-active-year states by requiring an explicit successor upcoming year,
   * or explicit administrative confirmation of intentional institutional deactivation.
   */
  async completeAcademicYear(id, adminUser = "admin", options = {}) {
    const year = await this.getAcademicYearByIdOrCode(id);
    if (!year) throw new Error("Academic year not found.");

    if (year.status === "upcoming") {
      throw new Error(`Cannot complete upcoming academic year "${year.yearCode}". An academic year must be activated before it can be completed.`);
    }
    if (year.status === "completed") {
      throw new Error(`Academic year "${year.yearCode}" is already marked as completed.`);
    }
    if (year.status === "archived") {
      throw new Error(`Cannot complete archived academic year "${year.yearCode}".`);
    }

    // Guard against accidental zero-active-year state
    if (year.status === "active") {
      const successorId = options.successorId || options.transitionToYear;
      if (successorId) {
        const successor = await this.getAcademicYearByIdOrCode(successorId);
        if (!successor) {
          throw new Error("Specified successor academic year not found.");
        }
        if (successor.status !== "upcoming") {
          throw new Error(`Successor academic year "${successor.yearCode}" must have status 'upcoming' to be activated upon completion.`);
        }
        // Safely and atomically activate the successor year (which automatically completes current active year)
        return this.activateAcademicYear(successor._id, adminUser);
      }

      const isIntentional = Boolean(options.intentionalDeactivation || options.allowZeroActive);
      if (!isIntentional) {
        throw new Error(
          `Cannot complete active academic year "${year.yearCode}" without an explicitly selected successor upcoming academic year to activate. To transition academic years, provide a successorId or activate the successor year directly.`
        );
      }
    }

    year.status = "completed";
    year.completedAt = new Date();
    year.updatedBy = adminUser;
    if (Array.isArray(year.semesterConfiguration)) {
      year.semesterConfiguration.forEach(s => { s.status = "completed"; });
    }
    return year.save();
  }

  /**
   * Archive an academic year
   */
  async archiveAcademicYear(id, adminUser = "admin") {
    const year = await this.getAcademicYearByIdOrCode(id);
    if (!year) throw new Error("Academic year not found.");

    if (year.status === "active") {
      throw new Error(`Cannot archive the currently active academic year "${year.yearCode}". Activate another year first.`);
    }
    if (year.status === "archived") {
      throw new Error(`Academic year "${year.yearCode}" is already archived.`);
    }

    year.status = "archived";
    year.archivedAt = new Date();
    year.updatedBy = adminUser;
    return year.save();
  }

  /**
   * Format academic year document for public consumption (R-07 Privacy)
   * Uses an explicit allowlist: strips createdBy, updatedBy, internal audit timestamps, and __v.
   */
  formatPublicAcademicYear(doc) {
    if (!doc) return null;
    const raw = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };

    const publicSemesters = Array.isArray(raw.semesterConfiguration)
      ? raw.semesterConfiguration.map(s => ({
          semester: s.semester,
          cycle: s.cycle,
          courseYear: s.courseYear,
          isOperational: Boolean(s.isOperational),
          status: s.status
        }))
      : [];

    return {
      _id: raw._id ? String(raw._id) : undefined,
      id: raw._id ? String(raw._id) : undefined,
      yearCode: raw.yearCode,
      title: raw.title,
      startDate: raw.startDate,
      endDate: raw.endDate,
      status: raw.status,
      activeCycle: raw.activeCycle,
      semesterConfiguration: publicSemesters,
      notes: raw.notes || ""
    };
  }
}

const academicYearService = new AcademicYearService();
module.exports = academicYearService;
