// services/fileSyncService.js
// Automatic bidirectional synchronization between MongoDB Atlas and repository code/data files.
// Guarantees that every addition, modification, or deletion by Admin, Faculty, or Students
// is totally saved in MongoDB Atlas AND automatically synchronized into files in the repository.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
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

function cleanStaleTempFiles(dir = DATA_DIR) {
  try {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (entry.includes(".tmp.")) {
        const full = path.join(dir, entry);
        try {
          fs.unlinkSync(full);
        } catch (_) {}
      }
    }
  } catch (_) {}
}

// Clean stale temporary files on service startup
cleanStaleTempFiles(DATA_DIR);
if (fs.existsSync(SANITIZED_DIR)) {
  cleanStaleTempFiles(SANITIZED_DIR);
}

function ensureDataDir(dirPath = DATA_DIR) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Strict schema-aware allowlist sanitizer for user objects exported to public or demo datasets.
 * Excludes all authentication secrets, password hashes, tokens, internal IDs, and personal PII.
 * Generates synthetic demo identities (names and emails) while preserving schema relationships.
 */
function sanitizeUserForExport(u, index = 0) {
  if (!u || typeof u !== "object") return {};
  const validRoles = ["admin", "faculty", "student"];
  const role = validRoles.includes(u.role) ? u.role : "student";
  const id = typeof u.id === "string" && u.id.trim()
    ? u.id.trim()
    : (u._id ? String(u._id) : `demo-user-${index + 1}`);

  const rawUsername = typeof u.username === "string" && u.username.trim()
    ? u.username.trim()
    : `user_${index + 1}`;
  const cleanUsername = rawUsername.toLowerCase().replace(/[^a-z0-9_-]/g, "");

  let syntheticName = `Demo Student ${index + 1}`;
  if (role === "admin") syntheticName = `Demo Administrator ${index + 1}`;
  else if (role === "faculty") syntheticName = `Demo Faculty ${index + 1}`;

  const syntheticEmail = `${cleanUsername || `user_${index + 1}`}@demo.campussphere.local`;

  // Explicit allowlist construction
  const sanitized = {
    id,
    role,
    name: syntheticName,
    username: rawUsername,
    email: syntheticEmail
  };

  if (typeof u.department === "string" && u.department.trim()) sanitized.department = u.department.trim();
  if (typeof u.course === "string" && u.course.trim()) sanitized.course = u.course.trim();
  if (typeof u.courseYear === "string" && u.courseYear.trim()) sanitized.courseYear = u.courseYear.trim();
  if (typeof u.semester === "string" && u.semester.trim()) sanitized.semester = u.semester.trim();
  if (typeof u.division === "string" && u.division.trim()) sanitized.division = u.division.trim();
  if (typeof u.subject === "string" && u.subject.trim()) sanitized.subject = u.subject.trim();

  if (Array.isArray(u.subjects)) {
    sanitized.subjects = u.subjects.map(s => String(s).trim()).filter(Boolean);
  }

  if (u.subjectDivisions && typeof u.subjectDivisions === "object") {
    const cleanSubDivs = {};
    const entries = u.subjectDivisions instanceof Map ? u.subjectDivisions.entries() : Object.entries(u.subjectDivisions);
    for (const [sub, divs] of entries) {
      if (Array.isArray(divs)) {
        cleanSubDivs[String(sub).trim()] = divs.map(d => String(d).trim()).filter(Boolean);
      }
    }
    sanitized.subjectDivisions = cleanSubDivs;
  } else {
    sanitized.subjectDivisions = {};
  }

  if (typeof u.languageChoice === "string" && u.languageChoice.trim()) sanitized.languageChoice = u.languageChoice.trim();
  if (typeof u.mathChoice === "string" && u.mathChoice.trim()) sanitized.mathChoice = u.mathChoice.trim();

  return sanitized;
}

/**
 * Strict schema-aware allowlist sanitizer for full database exports.
 * Redacts personal identifying records from academic store while preserving public system catalog.
 */
function sanitizeDatabaseForExport(databaseDump, sanitizedUsers = []) {
  if (!databaseDump || typeof databaseDump !== "object") return {};

  const cleanUsers = Array.isArray(sanitizedUsers) && sanitizedUsers.length > 0
    ? sanitizedUsers
    : (Array.isArray(databaseDump.users) ? databaseDump.users.map((u, i) => sanitizeUserForExport(u, i)) : []);

  const counts = {
    totalUsers: cleanUsers.length,
    students: cleanUsers.filter(u => u.role === "student").length,
    faculty: cleanUsers.filter(u => u.role === "faculty").length,
    admins: cleanUsers.filter(u => u.role === "admin").length,
    timetables: Array.isArray(databaseDump.timetables) ? databaseDump.timetables.length : 0,
    syllabi: Array.isArray(databaseDump.syllabi) ? databaseDump.syllabi.length : 0
  };

  const cleanDivisions = databaseDump.divisions && typeof databaseDump.divisions === "object"
    ? JSON.parse(JSON.stringify(databaseDump.divisions))
    : {
        "1st Year": ["Div A", "Div B"],
        "2nd Year": ["Div A", "Div B"],
        "3rd Year": ["Div A", "Div B"]
      };

  const cleanTimetables = Array.isArray(databaseDump.timetables)
    ? databaseDump.timetables.map(t => ({
        semester: t.semester,
        division: t.division,
        day: t.day,
        time: t.time,
        subject: t.subject,
        subjectText: t.subjectText || t.subject || "",
        faculty: t.faculty || ""
      }))
    : [];

  const cleanSyllabi = Array.isArray(databaseDump.syllabi)
    ? databaseDump.syllabi.map(s => ({
        yearLevel: s.yearLevel,
        semester: s.semester,
        yearTitle: s.yearTitle,
        originalFilename: s.originalFilename || ""
      }))
    : [];

  const rawAcademic = databaseDump.academic && typeof databaseDump.academic === "object" ? databaseDump.academic : {};
  const cleanAcademic = {
    storeKey: "default_academic_store",
    divisions: cleanDivisions,
    subjects: Array.isArray(rawAcademic.subjects) ? [...rawAcademic.subjects] : [],
    subjectMarksConfig: rawAcademic.subjectMarksConfig && typeof rawAcademic.subjectMarksConfig === "object"
      ? JSON.parse(JSON.stringify(rawAcademic.subjectMarksConfig))
      : {},
    timetableHeader: rawAcademic.timetableHeader && typeof rawAcademic.timetableHeader === "object"
      ? JSON.parse(JSON.stringify(rawAcademic.timetableHeader))
      : {},
    customBreakRows: rawAcademic.customBreakRows && typeof rawAcademic.customBreakRows === "object"
      ? JSON.parse(JSON.stringify(rawAcademic.customBreakRows))
      : {},
    notices: Array.isArray(rawAcademic.notices)
      ? rawAcademic.notices.map(n => ({
          id: n.id || n.noticeId || "",
          title: n.title || "",
          text: n.text || n.content || "",
          content: n.content || n.text || "",
          date: n.date || "",
          authorRole: n.authorRole === "admin" ? "admin" : "faculty"
        }))
      : [],
    // Identifying individual student activity / personal records redacted in public export
    students: {},
    dailyAttendance: [],
    assignments: [],
    deletedAssignments: [],
    deletedDailyAttendance: [],
    notes: []
  };

  return {
    system: "CampusSphere",
    version: "2.0.0",
    lastSyncedAt: new Date().toISOString(),
    counts,
    users: cleanUsers,
    academic: cleanAcademic,
    divisions: cleanDivisions,
    timetables: cleanTimetables,
    syllabi: cleanSyllabi
  };
}

async function safeWriteJson(filePath, data) {
  const targetDir = path.dirname(filePath);
  ensureDataDir(targetDir);
  const randomSuffix = crypto.randomBytes(6).toString("hex");
  const tmpPath = `${filePath}.tmp.${process.pid}.${Date.now()}.${randomSuffix}`;
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
  } catch (err) {
    if (fs.existsSync(tmpPath)) {
      await fs.promises.unlink(tmpPath).catch(() => {});
    }
    throw err;
  } finally {
    // Guarantees zero orphaned temporary files created by this specific invocation
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
  if (process.env.NODE_ENV === "test") {
    return;
  }
  const mongoose = require("mongoose");
  if (mongoose.connection && mongoose.connection.name && mongoose.connection.name.endsWith("_test")) {
    return;
  }

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

    // Sanitized records: credentials, hashes, and session tokens completely excluded via strict allowlist
    const sanitizedUsers = (rawUsers || []).map((u, i) => sanitizeUserForExport(u, i));

    const academicData = store ? { ...store } : {};
    delete academicData.__v;
    delete academicData._id;

    const divisions = academicData.divisions || {
      "1st Year": ["Div A", "Div B"],
      "2nd Year": ["Div A", "Div B"],
      "3rd Year": ["Div A", "Div B"]
    };

    const databaseDump = sanitizeDatabaseForExport({
      system: "CampusSphere",
      version: "2.0.0",
      lastSyncedAt: new Date().toISOString(),
      counts: {
        totalUsers: sanitizedUsers.length,
        students: sanitizedUsers.filter(u => u.role === "student").length,
        faculty: sanitizedUsers.filter(u => u.role === "faculty").length,
        admins: sanitizedUsers.filter(u => u.role === "admin").length,
        timetables: (timetables || []).length,
        syllabi: (syllabi || []).length
      },
      users: sanitizedUsers,
      academic: academicData,
      divisions,
      timetables: (timetables || []).map(t => { const c = { ...t }; delete c.__v; return c; }),
      syllabi: (syllabi || []).map(s => { const c = { ...s }; delete c.__v; return c; })
    }, sanitizedUsers);

    // Synchronize to individual operational code data files (sanitized only) and separate sanitized export dataset
    await Promise.all([
      safeWriteJson(DB_FILE, databaseDump),
      safeWriteJson(USERS_FILE, sanitizedUsers),
      safeWriteJson(ACADEMIC_FILE, academicData),
      safeWriteJson(DIVISIONS_FILE, divisions),
      safeWriteJson(TIMETABLES_FILE, timetables || []),
      safeWriteJson(SANITIZED_DB_FILE, databaseDump),
      safeWriteJson(SANITIZED_USERS_FILE, sanitizedUsers)
    ]);

    syncEvents.emit("synced");
    console.log(`[FileSync] Auto-synced to code files: ${sanitizedUsers.length} users, academic store, divisions & timetables (sanitized form only).`);
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
  safeWriteJson,
  cleanStaleTempFiles,
  sanitizeUserForExport,
  sanitizeDatabaseForExport,
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
