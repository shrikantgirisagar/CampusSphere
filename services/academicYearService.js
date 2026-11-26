// services/academicYearService.js
// Central business logic & single source of truth for Academic Years in CampusSphere.
// Manages dynamic academic year creation, lifecycle transitions, one-active-year enforcement,
// semester configuration, and backward-compatible record resolution.

const { AsyncLocalStorage } = require("async_hooks");
const mongoose = require("mongoose");
const AcademicYear = require("../models/AcademicYear");
const AcademicStore = require("../models/AcademicStore");

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
    // Re-entrant context so nested lifecycle delegation (e.g. completeAcademicYear -> activateAcademicYear)
    // does not deadlock on the exclusive lifecycle barrier
    this._transitionAls = new AsyncLocalStorage();
    // Writer-preference reader-writer coordinator serializing lifecycle transitions against
    // same-process year-scoped mutations (attendance writes/deletes and academic sync)
    this._lifecycleQueue = Promise.resolve();
    this._pendingTransitions = 0;
    this._activeTransition = false;
    this._activeMutations = 0;
    this._idleWaiters = [];
    this._mutationGateWaiters = [];
  }

  /**
   * Check whether the connected MongoDB topology supports multi-document ACID transactions.
   * Standalone "Single" instances return false; replica sets and sharded clusters return true.
   */
  isTransactionSupported() {
    if (!mongoose.connection || mongoose.connection.readyState !== 1 || !mongoose.connection.client) {
      return false;
    }
    const topologyType = mongoose.connection.client.topology?.description?.type;
    return Boolean(topologyType && topologyType !== "Single");
  }

  /**
   * Acquire exclusive same-process lifecycle lock (writer-preference).
   * New mutations queue behind pending transitions; execution waits for in-flight mutations to finish.
   */
  async runWithLifecycleTransition(fn) {
    if (this._transitionAls.getStore()?.inLifecycleTransition) {
      return fn();
    }

    this._pendingTransitions += 1;
    let released = false;
    const releasePending = () => {
      if (released) return;
      released = true;
      this._pendingTransitions = Math.max(0, this._pendingTransitions - 1);
      if (!this._activeTransition && this._pendingTransitions === 0 && this._mutationGateWaiters.length > 0) {
        const waiters = this._mutationGateWaiters.splice(0);
        for (const w of waiters) w();
      }
    };

    const runExclusive = async () => {
      this._activeTransition = true;
      try {
        if (this._activeMutations > 0) {
          await new Promise(resolve => this._idleWaiters.push(resolve));
        }
        return await this._transitionAls.run({ inLifecycleTransition: true }, fn);
      } finally {
        this._activeTransition = false;
        releasePending();
      }
    };

    const nextPromise = this._lifecycleQueue.then(runExclusive, runExclusive);
    this._lifecycleQueue = nextPromise.catch(() => {});
    return nextPromise;
  }

  /**
   * Acquire shared same-process mutation guard so attendance/sync validation and commit
   * cannot interleave with concurrent activate/complete/archive operations.
   */
  async runWithYearMutationGuard(fn) {
    if (this._transitionAls.getStore()?.inLifecycleTransition) {
      return fn();
    }
    while (this._activeTransition || this._pendingTransitions > 0) {
      await new Promise(resolve => this._mutationGateWaiters.push(resolve));
    }
    this._activeMutations += 1;
    try {
      return await fn();
    } finally {
      this._activeMutations = Math.max(0, this._activeMutations - 1);
      if (this._activeMutations === 0 && this._idleWaiters.length > 0) {
        const waiters = this._idleWaiters.splice(0);
        for (const w of waiters) w();
      }
    }
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
  async getAcademicYearByIdOrCode(identifier, session = null) {
    if (!identifier) return null;
    const trimmed = String(identifier).trim();
    if (trimmed.match(/^[0-9a-fA-F]{24}$/)) {
      const byIdQuery = AcademicYear.findById(trimmed);
      if (session) byIdQuery.session(session);
      const byId = await byIdQuery.exec();
      if (byId) return byId;
    }
    const byCodeQuery = AcademicYear.findOne({ yearCode: trimmed });
    if (session) byCodeQuery.session(session);
    return byCodeQuery.exec();
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
  async activateAcademicYear(id, adminUser = "admin", options = {}) {
    return this.runWithLifecycleTransition(async () => {
      const supportsTransactions = this.isTransactionSupported();
      const {
        expectedActiveYearId = null,
        expectedActiveYearCode = null,
        requireSuccessorUpcoming = false,
        requireNoActiveYear = false
      } = options || {};

      if (supportsTransactions) {
        const session = await mongoose.startSession();
        let txResult = null;
        try {
          await session.withTransaction(async () => {
            txResult = null;
            const targetYear = await this.getAcademicYearByIdOrCode(id, session);
            if (!targetYear) {
              throw new Error("Target academic year not found.");
            }

            if (targetYear.status === "archived") {
              throw new Error(`Archived academic year "${targetYear.yearCode}" cannot be directly activated. Restore to completed or upcoming first.`);
            }

            if (requireSuccessorUpcoming && targetYear.status !== "upcoming") {
              const conflictErr = new Error(`Successor academic year "${targetYear.yearCode}" is now '${targetYear.status}' and can no longer be activated as upcoming.`);
              conflictErr.code = "LIFECYCLE_CONFLICT";
              conflictErr.status = 409;
              throw conflictErr;
            }

            const currentActive = await AcademicYear.findOne({ status: "active" }).session(session).exec();

            if (requireNoActiveYear && currentActive) {
              const conflictErr = new Error(`Concurrent lifecycle transition detected: expected no active academic year, found '${currentActive.yearCode}'.`);
              conflictErr.code = "LIFECYCLE_CONFLICT";
              conflictErr.status = 409;
              throw conflictErr;
            }

            if (expectedActiveYearId) {
              if (!currentActive || String(currentActive._id) !== String(expectedActiveYearId)) {
                const conflictErr = new Error(
                  `Concurrent lifecycle transition detected: expected active year '${expectedActiveYearCode || expectedActiveYearId}', found '${currentActive ? currentActive.yearCode : "none"}'.`
                );
                conflictErr.code = "LIFECYCLE_CONFLICT";
                conflictErr.status = 409;
                throw conflictErr;
              }
            }

            if (expectedActiveYearCode) {
              if (!currentActive || String(currentActive.yearCode) !== String(expectedActiveYearCode)) {
                const conflictErr = new Error(
                  `Concurrent lifecycle transition detected: expected active year '${expectedActiveYearCode}', found '${currentActive ? currentActive.yearCode : "none"}'.`
                );
                conflictErr.code = "LIFECYCLE_CONFLICT";
                conflictErr.status = 409;
                throw conflictErr;
              }
            }

            if (targetYear.status === "active") {
              txResult = {
                alreadyActive: true,
                academicYear: targetYear,
                message: `Academic year "${targetYear.yearCode}" is already active.`
              };
              return;
            }

            if (currentActive && String(currentActive._id) !== String(targetYear._id)) {
              currentActive.status = "completed";
              currentActive.completedAt = new Date();
              currentActive.updatedBy = adminUser;
              currentActive.mutationEpoch = (Number(currentActive.mutationEpoch) || 0) + 1;
              if (Array.isArray(currentActive.semesterConfiguration)) {
                currentActive.semesterConfiguration.forEach(s => { s.status = "completed"; });
              }
              await currentActive.save({ session });
            }

            targetYear.status = "active";
            targetYear.activatedAt = new Date();
            targetYear.updatedBy = adminUser;
            targetYear.mutationEpoch = (Number(targetYear.mutationEpoch) || 0) + 1;
            // Activate configured operational semesters
            if (Array.isArray(targetYear.semesterConfiguration)) {
              targetYear.semesterConfiguration.forEach(s => {
                if (s.isOperational) s.status = "active";
              });
            }
            await targetYear.save({ session });

            const storeRes = await AcademicStore.updateOne(
              { storeKey: "default_academic_store" },
              { $set: { activeAcademicYear: targetYear.yearCode } },
              { upsert: true, session }
            );
            if (!storeRes?.acknowledged || (storeRes.matchedCount === 0 && storeRes.upsertedCount === 0)) {
              throw new Error("Failed to synchronize AcademicStore.activeAcademicYear inside transaction.");
            }

            txResult = {
              success: true,
              previousActiveYear: currentActive ? currentActive.yearCode : null,
              activeAcademicYear: targetYear,
              message: `Academic year "${targetYear.yearCode}" is now active.`
            };
          });
        } finally {
          await session.endSession();
        }
        return txResult;
      }

      // Connected standalone ("Single") MongoDB path: DB-enforced conditional CAS with mutationEpoch
      // and partial unique active-year index; cross-process multi-doc crash atomicity still requires replica sets.
      const isConnectedStandalone = mongoose.connection && mongoose.connection.readyState === 1;
      const targetYear = await this.getAcademicYearByIdOrCode(id);
      if (!targetYear) {
        throw new Error("Target academic year not found.");
      }

      if (targetYear.status === "archived") {
        throw new Error(`Archived academic year "${targetYear.yearCode}" cannot be directly activated. Restore to completed or upcoming first.`);
      }

      if (requireSuccessorUpcoming && targetYear.status !== "upcoming") {
        const conflictErr = new Error(`Successor academic year "${targetYear.yearCode}" must have status 'upcoming' to be activated upon completion.`);
        conflictErr.code = "LIFECYCLE_CONFLICT";
        conflictErr.status = 409;
        throw conflictErr;
      }

      const currentActive = await AcademicYear.findOne({ status: "active" }).exec();

      if (requireNoActiveYear && currentActive) {
        const conflictErr = new Error(`Concurrent lifecycle transition detected: expected no active academic year, found '${currentActive.yearCode}'.`);
        conflictErr.code = "LIFECYCLE_CONFLICT";
        conflictErr.status = 409;
        throw conflictErr;
      }

      if (expectedActiveYearId) {
        if (!currentActive || String(currentActive._id) !== String(expectedActiveYearId)) {
          const conflictErr = new Error(
            `Concurrent lifecycle transition detected: expected active year '${expectedActiveYearCode || expectedActiveYearId}', found '${currentActive ? currentActive.yearCode : "none"}'.`
          );
          conflictErr.code = "LIFECYCLE_CONFLICT";
          conflictErr.status = 409;
          throw conflictErr;
        }
      }

      if (expectedActiveYearCode) {
        if (!currentActive || String(currentActive.yearCode) !== String(expectedActiveYearCode)) {
          const conflictErr = new Error(
            `Concurrent lifecycle transition detected: expected active year '${expectedActiveYearCode}', found '${currentActive ? currentActive.yearCode : "none"}'.`
          );
          conflictErr.code = "LIFECYCLE_CONFLICT";
          conflictErr.status = 409;
          throw conflictErr;
        }
      }

      if (targetYear.status === "active") {
        return {
          alreadyActive: true,
          academicYear: targetYear,
          message: `Academic year "${targetYear.yearCode}" is already active.`
        };
      }

      if (!isConnectedStandalone) {
        // Disconnected mock unit-test path preserving legacy .save() stub interfaces
        if (currentActive && String(currentActive._id) !== String(targetYear._id)) {
          currentActive.status = "completed";
          currentActive.completedAt = new Date();
          currentActive.updatedBy = adminUser;
          currentActive.mutationEpoch = (Number(currentActive.mutationEpoch) || 0) + 1;
          if (Array.isArray(currentActive.semesterConfiguration)) {
            currentActive.semesterConfiguration.forEach(s => { s.status = "completed"; });
          }
          await currentActive.save();
        }
        targetYear.status = "active";
        targetYear.activatedAt = new Date();
        targetYear.updatedBy = adminUser;
        targetYear.mutationEpoch = (Number(targetYear.mutationEpoch) || 0) + 1;
        if (Array.isArray(targetYear.semesterConfiguration)) {
          targetYear.semesterConfiguration.forEach(s => {
            if (s.isOperational) s.status = "active";
          });
        }
        await targetYear.save();

        return {
          success: true,
          previousActiveYear: currentActive ? currentActive.yearCode : null,
          activeAcademicYear: targetYear,
          message: `Academic year "${targetYear.yearCode}" is now active.`
        };
      }

      const prevEpoch = Number(currentActive?.mutationEpoch) || 0;
      const targetEpoch = Number(targetYear.mutationEpoch) || 0;
      const prevSemSnapshot = Array.isArray(currentActive?.semesterConfiguration)
        ? currentActive.semesterConfiguration.map(s => (typeof s.toObject === "function" ? s.toObject() : { ...s }))
        : null;
      const previousState = currentActive
        ? {
            id: currentActive._id,
            yearCode: currentActive.yearCode,
            status: currentActive.status,
            completedAt: currentActive.completedAt,
            updatedBy: currentActive.updatedBy,
            semesterConfiguration: prevSemSnapshot
          }
        : null;
      const existingStoreBefore = await AcademicStore.findOne({ storeKey: "default_academic_store" })
        .select("activeAcademicYear")
        .lean();

      let deactivatedCurrent = null;
      let activatedTarget = null;
      let storeUpsertedFresh = false;

      try {
        if (currentActive && String(currentActive._id) !== String(targetYear._id)) {
          const prevSetPayload = {
            status: "completed",
            completedAt: new Date(),
            updatedBy: adminUser
          };
          if (Array.isArray(prevSemSnapshot)) {
            prevSetPayload.semesterConfiguration = prevSemSnapshot.map(s => ({ ...s, status: "completed" }));
          }
          deactivatedCurrent = await AcademicYear.findOneAndUpdate(
            { _id: currentActive._id, status: "active", mutationEpoch: prevEpoch },
            {
              $set: prevSetPayload,
              $inc: { mutationEpoch: 1 }
            },
            { returnDocument: "after" }
          );
          if (!deactivatedCurrent) {
            const conflictErr = new Error(`Concurrent modification prevented deactivating active academic year "${currentActive.yearCode}".`);
            conflictErr.code = "LIFECYCLE_CONFLICT";
            conflictErr.status = 409;
            throw conflictErr;
          }
        }

        const updatedSemConfig = Array.isArray(targetYear.semesterConfiguration)
          ? targetYear.semesterConfiguration.map(s => {
              const plain = typeof s.toObject === "function" ? s.toObject() : { ...s };
              if (plain.isOperational) plain.status = "active";
              return plain;
            })
          : [];

        activatedTarget = await AcademicYear.findOneAndUpdate(
          { _id: targetYear._id, status: targetYear.status, mutationEpoch: targetEpoch },
          {
            $set: {
              status: "active",
              activatedAt: new Date(),
              updatedBy: adminUser,
              semesterConfiguration: updatedSemConfig
            },
            $inc: { mutationEpoch: 1 }
          },
          { returnDocument: "after" }
        );
        if (!activatedTarget) {
          const conflictErr = new Error(`Concurrent modification prevented activating academic year "${targetYear.yearCode}".`);
          conflictErr.code = "LIFECYCLE_CONFLICT";
          conflictErr.status = 409;
          throw conflictErr;
        }

        const storeRes = await AcademicStore.updateOne(
          { storeKey: "default_academic_store" },
          { $set: { activeAcademicYear: activatedTarget.yearCode } },
          { upsert: true }
        );
        if (!storeRes?.acknowledged || (storeRes.matchedCount === 0 && storeRes.upsertedCount === 0)) {
          throw new Error("Failed to persist AcademicStore.activeAcademicYear during standalone activation.");
        }
        storeUpsertedFresh = Boolean(storeRes.upsertedCount > 0 && !existingStoreBefore);
      } catch (activationErr) {
        if (activationErr?.code === 11000) {
          activationErr.code = "LIFECYCLE_CONFLICT";
          activationErr.status = 409;
        }
        const rollbackErrors = [];
        if (activatedTarget) {
          try {
            await AcademicYear.findOneAndUpdate(
              { _id: activatedTarget._id, status: "active", mutationEpoch: activatedTarget.mutationEpoch },
              {
                $set: {
                  status: targetYear.status,
                  activatedAt: targetYear.activatedAt || null,
                  semesterConfiguration: targetYear.semesterConfiguration
                },
                $inc: { mutationEpoch: 1 }
              }
            );
          } catch (rbTargetErr) {
            rollbackErrors.push(`Target rollback failed: ${rbTargetErr.message}`);
          }
        }
        if (deactivatedCurrent && previousState) {
          try {
            const restoreSet = {
              status: previousState.status,
              completedAt: previousState.completedAt || null,
              updatedBy: previousState.updatedBy || "admin"
            };
            if (Array.isArray(previousState.semesterConfiguration)) {
              restoreSet.semesterConfiguration = previousState.semesterConfiguration;
            }
            await AcademicYear.findOneAndUpdate(
              { _id: previousState.id, mutationEpoch: deactivatedCurrent.mutationEpoch },
              {
                $set: restoreSet,
                $inc: { mutationEpoch: 1 }
              }
            );
          } catch (rbPrevErr) {
            rollbackErrors.push(`Previous year rollback failed: ${rbPrevErr.message}`);
          }
        }
        if (existingStoreBefore && activatedTarget) {
          try {
            await AcademicStore.updateOne(
              { storeKey: "default_academic_store" },
              { $set: { activeAcademicYear: existingStoreBefore.activeAcademicYear || "" } }
            );
          } catch (rbStoreErr) {
            rollbackErrors.push(`AcademicStore rollback failed: ${rbStoreErr.message}`);
          }
        } else if (storeUpsertedFresh && activatedTarget) {
          try {
            await AcademicStore.updateOne(
              { storeKey: "default_academic_store" },
              { $set: { activeAcademicYear: "" } }
            );
          } catch (rbStoreErr) {
            rollbackErrors.push(`AcademicStore rollback failed: ${rbStoreErr.message}`);
          }
        }
        if (rollbackErrors.length > 0) {
          console.error("[AcademicYear] Standalone activation rollback error(s):", rollbackErrors.join("; "));
          activationErr.rollbackErrors = rollbackErrors;
        }
        throw activationErr;
      }

      return {
        success: true,
        previousActiveYear: currentActive ? currentActive.yearCode : null,
        activeAcademicYear: activatedTarget,
        message: `Academic year "${activatedTarget.yearCode}" is now active.`
      };
    });
  }

  /**
   * Complete an academic year with lifecycle guard (R-06 Lifecycle Integrity)
   * Prevents accidental zero-active-year states by requiring an explicit successor upcoming year,
   * or explicit administrative confirmation of intentional institutional deactivation.
   */
  async completeAcademicYear(id, adminUser = "admin", options = {}) {
    return this.runWithLifecycleTransition(async () => {
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
          // Enforce inside activateAcademicYear's transaction/CAS that `year._id` is STILL active
          // and `successor` is still upcoming when committed
          return this.activateAcademicYear(successor._id, adminUser, {
            expectedActiveYearId: year._id,
            expectedActiveYearCode: year.yearCode,
            requireSuccessorUpcoming: true
          });
        }

        const isIntentional = Boolean(options.intentionalDeactivation || options.allowZeroActive);
        if (!isIntentional) {
          throw new Error(
            `Cannot complete active academic year "${year.yearCode}" without an explicitly selected successor upcoming academic year to activate. To transition academic years, provide a successorId or activate the successor year directly.`
          );
        }
      }

      if (this.isTransactionSupported()) {
        const session = await mongoose.startSession();
        let completedYear = null;
        try {
          await session.withTransaction(async () => {
            completedYear = null;
            const txYear = await this.getAcademicYearByIdOrCode(id, session);
            if (!txYear) throw new Error("Academic year not found.");
            if (txYear.status !== "active") {
              const conflictErr = new Error(`Academic year "${txYear.yearCode}" is already '${txYear.status}' and cannot be completed.`);
              conflictErr.code = "LIFECYCLE_CONFLICT";
              conflictErr.status = 409;
              throw conflictErr;
            }
            txYear.status = "completed";
            txYear.completedAt = new Date();
            txYear.updatedBy = adminUser;
            txYear.mutationEpoch = (Number(txYear.mutationEpoch) || 0) + 1;
            if (Array.isArray(txYear.semesterConfiguration)) {
              txYear.semesterConfiguration.forEach(s => { s.status = "completed"; });
            }
            completedYear = await txYear.save({ session });

            const storeRes = await AcademicStore.updateOne(
              { storeKey: "default_academic_store" },
              { $set: { activeAcademicYear: "" } },
              { upsert: true, session }
            );
            if (!storeRes?.acknowledged || (storeRes.matchedCount === 0 && storeRes.upsertedCount === 0)) {
              throw new Error("Failed to clear AcademicStore.activeAcademicYear inside transaction.");
            }
          });
        } finally {
          await session.endSession();
        }
        return completedYear;
      }

      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const expectedEpoch = Number(year.mutationEpoch) || 0;
        const prevSemesters = Array.isArray(year.semesterConfiguration)
          ? year.semesterConfiguration.map(s => (typeof s.toObject === "function" ? s.toObject() : { ...s }))
          : [];
        const completedSems = prevSemesters.map(s => ({ ...s, status: "completed" }));
        const updatedYear = await AcademicYear.findOneAndUpdate(
          { _id: year._id, status: "active", mutationEpoch: expectedEpoch },
          {
            $set: {
              status: "completed",
              completedAt: new Date(),
              updatedBy: adminUser,
              semesterConfiguration: completedSems
            },
            $inc: { mutationEpoch: 1 }
          },
          { returnDocument: "after" }
        );
        if (!updatedYear) {
          const conflictErr = new Error(`Concurrent lifecycle transition prevented completing "${year.yearCode}".`);
          conflictErr.code = "LIFECYCLE_CONFLICT";
          conflictErr.status = 409;
          throw conflictErr;
        }
        try {
          const storeRes = await AcademicStore.updateOne(
            { storeKey: "default_academic_store" },
            { $set: { activeAcademicYear: "" } },
            { upsert: true }
          );
          if (!storeRes?.acknowledged || (storeRes.matchedCount === 0 && storeRes.upsertedCount === 0)) {
            throw new Error("Failed to persist empty activeAcademicYear in AcademicStore during standalone completion.");
          }
        } catch (storeErr) {
          try {
            await AcademicYear.findOneAndUpdate(
              { _id: updatedYear._id, status: "completed", mutationEpoch: updatedYear.mutationEpoch },
              {
                $set: {
                  status: "active",
                  completedAt: year.completedAt || null,
                  updatedBy: year.updatedBy || "admin",
                  semesterConfiguration: prevSemesters
                },
                $inc: { mutationEpoch: 1 }
              }
            );
          } catch (rbErr) {
            console.error("[AcademicYear] Standalone completion rollback failed:", rbErr.message);
            storeErr.rollbackErrors = [rbErr.message];
          }
          throw storeErr;
        }
        return updatedYear;
      }

      year.status = "completed";
      year.completedAt = new Date();
      year.updatedBy = adminUser;
      year.mutationEpoch = (Number(year.mutationEpoch) || 0) + 1;
      if (Array.isArray(year.semesterConfiguration)) {
        year.semesterConfiguration.forEach(s => { s.status = "completed"; });
      }
      return year.save();
    });
  }

  /**
   * Archive an academic year
   */
  async archiveAcademicYear(id, adminUser = "admin") {
    return this.runWithLifecycleTransition(async () => {
      if (this.isTransactionSupported()) {
        const session = await mongoose.startSession();
        let archivedYear = null;
        try {
          await session.withTransaction(async () => {
            archivedYear = null;
            const txYear = await this.getAcademicYearByIdOrCode(id, session);
            if (!txYear) throw new Error("Academic year not found.");

            if (txYear.status === "active") {
              throw new Error(`Cannot archive the currently active academic year "${txYear.yearCode}". Activate another year first.`);
            }
            if (txYear.status === "archived") {
              throw new Error(`Academic year "${txYear.yearCode}" is already archived.`);
            }

            txYear.status = "archived";
            txYear.archivedAt = new Date();
            txYear.updatedBy = adminUser;
            txYear.mutationEpoch = (Number(txYear.mutationEpoch) || 0) + 1;
            archivedYear = await txYear.save({ session });
          });
        } finally {
          await session.endSession();
        }
        return archivedYear;
      }

      const year = await this.getAcademicYearByIdOrCode(id);
      if (!year) throw new Error("Academic year not found.");

      if (year.status === "active") {
        throw new Error(`Cannot archive the currently active academic year "${year.yearCode}". Activate another year first.`);
      }
      if (year.status === "archived") {
        throw new Error(`Academic year "${year.yearCode}" is already archived.`);
      }

      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const expectedEpoch = Number(year.mutationEpoch) || 0;
        const archivedYear = await AcademicYear.findOneAndUpdate(
          { _id: year._id, status: year.status, mutationEpoch: expectedEpoch },
          {
            $set: { status: "archived", archivedAt: new Date(), updatedBy: adminUser },
            $inc: { mutationEpoch: 1 }
          },
          { returnDocument: "after" }
        );
        if (!archivedYear) {
          const conflictErr = new Error(`Concurrent lifecycle transition prevented archiving "${year.yearCode}".`);
          conflictErr.code = "LIFECYCLE_CONFLICT";
          conflictErr.status = 409;
          throw conflictErr;
        }
        return archivedYear;
      }

      year.status = "archived";
      year.archivedAt = new Date();
      year.updatedBy = adminUser;
      year.mutationEpoch = (Number(year.mutationEpoch) || 0) + 1;
      return year.save();
    });
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
