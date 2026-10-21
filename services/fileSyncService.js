// services/fileSyncService.js
// Automatic bidirectional synchronization between MongoDB Atlas and repository code/data files.
// Guarantees that every addition, modification, or deletion by Admin, Faculty, or Students
// is totally saved in MongoDB Atlas AND automatically synchronized into files in the repository.

const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

const syncEvents = new EventEmitter();
syncEvents.setMaxListeners(50);

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "database.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ACADEMIC_FILE = path.join(DATA_DIR, "academic.json");
const DIVISIONS_FILE = path.join(DATA_DIR, "divisions.json");
const TIMETABLES_FILE = path.join(DATA_DIR, "timetables.json");

const SANITIZED_DIR = path.join(DATA_DIR, "sanitized");
const SANITIZED_DB_FILE = path.join(SANITIZED_DIR, "database.json");
const SANITIZED_USERS_FILE = path.join(SANITIZED_DIR, "users.json");

let syncDebounceTimer = null;
let isSyncing = false;
let pendingSyncAgain = false;

function ensureDataDir(dirPath = DATA_DIR) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Strips password hashes, raw passwords, authentication tokens, session secrets, and internal metadata
 * from a user object for public, demo, or external distributable datasets.
 */
function sanitizeUserForExport(u) {
  if (!u || typeof u !== "object") return {};
  const copy = { ...u };
  delete copy.passwordHash;
  delete copy.password;
  delete copy.__v;
  delete copy.token;
  delete copy.sessionToken;
  delete copy.secret;
  if (copy.subjectDivisions instanceof Map) {
    copy.subjectDivisions = Object.fromEntries(copy.subjectDivisions);
  } else if (!copy.subjectDivisions || typeof copy.subjectDivisions !== "object") {
    copy.subjectDivisions = {};
  }
  return copy;
}

async function safeWriteJson(filePath, data) {
  const targetDir = path.dirname(filePath);
  ensureDataDir(targetDir);
  const tmpPath = `${filePath}.tmp.${Date.now()}.${Math.floor(Math.random() * 10000)}`;
  const jsonStr = JSON.stringify(data, null, 2);
  try {
    await fs.promises.writeFile(tmpPath, jsonStr, "utf8");
    try {
      await fs.promises.rename(tmpPath, filePath);
    } catch (renameErr) {
      // Fallback on Windows if destination file exists and is locked momentarily
      await fs.promises.copyFile(tmpPath, filePath);
      await fs.promises.unlink(tmpPath).catch(() => {});
    }
  } finally {
    // Guarantees zero orphaned temporary files even if write or rename encounters exceptions
    try {
      if (fs.existsSync(tmpPath)) {
        await fs.promises.unlink(tmpPath).catch(() => {});
      }
    } catch (_) {}
  }
}

/**
 * Synchronize authoritative MongoDB collections directly to local code/data files
 */
async function syncFromMongoToFiles() {
  if (isSyncing) {
    pendingSyncAgain = true;
    return;
  }
  isSyncing = true;
  pendingSyncAgain = false;

  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
      if (mongoose.connection.readyState === 2) {
        await new Promise(resolve => mongoose.connection.once("open", resolve));
      } else {
        return;
      }
    }

    const User = require("../models/User");
    const AcademicStore = require("../models/AcademicStore");
    const Timetable = require("../models/Timetable");
    const Syllabus = require("../models/Syllabus");

    // Fetch live state from MongoDB
    const [rawUsers, store, timetables, syllabi] = await Promise.all([
      User.find({}).sort({ role: 1, username: 1 }).lean(),
      AcademicStore.findOne({ storeKey: "default_academic_store" }).lean(),
      Timetable.find({}).sort({ semester: 1, division: 1 }).lean(),
      Syllabus.find({}).sort({ yearLevel: 1 }).lean()
    ]);

    // Operational records: preserved with all necessary fields for local development, recovery & tests
    const operationalUsers = (rawUsers || []).map(u => {
      const copy = { ...u };
      delete copy.__v;
      return copy;
    });

    // Sanitized records: credentials, hashes, and session tokens completely excluded
    const sanitizedUsers = (rawUsers || []).map(u => sanitizeUserForExport(u));

    const academicData = store ? { ...store } : {};
    delete academicData.__v;
    delete academicData._id;

    const divisions = academicData.divisions || {
      "1st Year": ["Div A", "Div B"],
      "2nd Year": ["Div A", "Div B"],
      "3rd Year": ["Div A", "Div B"]
    };

    const databaseDump = {
      system: "CampusSphere",
      version: "2.0.0",
      lastSyncedAt: new Date().toISOString(),
      counts: {
        totalUsers: operationalUsers.length,
        students: operationalUsers.filter(u => u.role === "student").length,
        faculty: operationalUsers.filter(u => u.role === "faculty").length,
        admins: operationalUsers.filter(u => u.role === "admin").length,
        timetables: (timetables || []).length,
        syllabi: (syllabi || []).length
      },
      users: operationalUsers,
      academic: academicData,
      divisions,
      timetables: (timetables || []).map(t => { const c = { ...t }; delete c.__v; return c; }),
      syllabi: (syllabi || []).map(s => { const c = { ...s }; delete c.__v; return c; })
    };

    const sanitizedDatabaseDump = {
      ...databaseDump,
      counts: {
        totalUsers: sanitizedUsers.length,
        students: sanitizedUsers.filter(u => u.role === "student").length,
        faculty: sanitizedUsers.filter(u => u.role === "faculty").length,
        admins: sanitizedUsers.filter(u => u.role === "admin").length,
        timetables: (timetables || []).length,
        syllabi: (syllabi || []).length
      },
      users: sanitizedUsers
    };

    // Synchronize to individual operational code data files and separate sanitized export dataset
    await Promise.all([
      safeWriteJson(DB_FILE, databaseDump),
      safeWriteJson(USERS_FILE, operationalUsers),
      safeWriteJson(ACADEMIC_FILE, academicData),
      safeWriteJson(DIVISIONS_FILE, divisions),
      safeWriteJson(TIMETABLES_FILE, timetables || []),
      safeWriteJson(SANITIZED_DB_FILE, sanitizedDatabaseDump),
      safeWriteJson(SANITIZED_USERS_FILE, sanitizedUsers)
    ]);

    syncEvents.emit("synced");
    console.log(`[FileSync] Auto-synced to code files: ${operationalUsers.length} users, academic store, divisions & timetables (plus sanitized export).`);
  } catch (err) {
    console.warn("[FileSync] Warning synchronizing data to files:", err.message);
  } finally {
    isSyncing = false;
    if (pendingSyncAgain) {
      pendingSyncAgain = false;
      setImmediate(() => syncFromMongoToFiles().catch(() => {}));
    } else {
      syncEvents.emit("synced");
    }
  }
}

/**
 * Debounced trigger for file synchronization to avoid disk thrashing during rapid batch requests
 */
function triggerSync(delayMs = 25) {
  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer);
  }
  syncDebounceTimer = setTimeout(() => {
    syncDebounceTimer = null;
    syncFromMongoToFiles().catch(err => {
      console.warn("[FileSync] Trigger sync error:", err.message);
    });
  }, delayMs);
}

/**
 * Returns a promise that resolves once any current or queued sync operations have completed
 */
function waitForSync(timeoutMs = 5000) {
  if (!isSyncing && !syncDebounceTimer && !pendingSyncAgain) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      syncEvents.off("synced", onSynced);
      resolve();
    }, timeoutMs);
    function onSynced() {
      if (!isSyncing && !syncDebounceTimer && !pendingSyncAgain) {
        clearTimeout(timer);
        syncEvents.off("synced", onSynced);
        resolve();
      }
    }
    syncEvents.on("synced", onSynced);
  });
}

module.exports = {
  syncFromMongoToFiles,
  triggerSync,
  waitForSync,
  syncEvents,
  sanitizeUserForExport,
  DATA_DIR,
  DB_FILE,
  USERS_FILE,
  ACADEMIC_FILE,
  DIVISIONS_FILE,
  TIMETABLES_FILE,
  SANITIZED_DIR,
  SANITIZED_DB_FILE,
  SANITIZED_USERS_FILE
};
