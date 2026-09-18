require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const mongoose = require("mongoose");

// Mongoose Models
const User = require("./models/User");
const Notice = require("./models/Notice");
const Attendance = require("./models/Attendance");
const Mark = require("./models/Mark");
const Assignment = require("./models/Assignment");
const Timetable = require("./models/Timetable");
const Note = require("./models/Note");
const AcademicStore = require("./models/AcademicStore");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/CampusSphere";
const DB_FILE = path.join(__dirname, "data", "database.json");

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// In-memory rate limiter for authentication endpoints
const loginAttempts = new Map();
function rateLimitLogin(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 mins
  const maxAttempts = 25;
  let record = loginAttempts.get(ip);
  if (!record || now - record.startTime > windowMs) {
    record = { count: 1, startTime: now };
    loginAttempts.set(ip, record);
    return next();
  }
  record.count++;
  if (record.count > maxAttempts) {
    return res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again after 15 minutes."
    });
  }
  next();
}

// Favicon handler with safe fallback to logo if favicon.ico is not found
app.get("/favicon.ico", (req, res) => {
  const icoPath = path.join(__dirname, "favicon.ico");
  if (fs.existsSync(icoPath)) {
    return res.sendFile(icoPath);
  }
  return res.sendFile(path.join(__dirname, "CampusSphere-logo.png"));
});

// Serve static assets from project root
app.use(express.static(__dirname, { index: false }));

// Serve static portal assets and SPA entry with no-cache headers
app.get(["/", "/index.html", "/login", "/login.html", "/signup", "/signup.html"], (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get(["/courses", "/courses.html"], (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(__dirname, "courses.html"));
});
app.get(["/about", "/about.html"], (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(__dirname, "about.html"));
});
app.get(["/students", "/students.html"], (req, res) => {
  res.redirect("/#students-faculty-count");
});
app.get("/style.css", (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(__dirname, "style.css"));
});
app.get("/script.js", (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(__dirname, "script.js"));
});
app.get("/animated-background.js", (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(__dirname, "animated-background.js"));
});


const scryptAsync = promisify(crypto.scrypt);

function hasMongoOperators(obj) {
  if (!obj || typeof obj !== "object") return false;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$")) return true;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      if (hasMongoOperators(obj[key])) return true;
    }
  }
  return false;
}

function sanitizeUser(user, options = {}) {
  if (!user) return null;
  const doc = typeof user.toPublicJSON === "function" ? user.toPublicJSON() : (user.toObject ? user.toObject() : { ...user });
  delete doc.passwordHash;
  delete doc.password;
  delete doc.authToken;
  delete doc.sessionToken;
  delete doc.resetToken;
  delete doc.__v;
  delete doc._id;

  if (doc.role === "faculty") {
    if (Array.isArray(doc.subjects)) {
      doc.subjects = doc.subjects.map(s => String(s).trim()).filter(Boolean);
    } else if (doc.subject) {
      doc.subjects = [String(doc.subject).trim()];
    } else {
      doc.subjects = [];
    }
    if (!doc.subject && doc.subjects.length > 0) {
      doc.subject = doc.subjects[0];
    } else if (doc.subject && !doc.subjects.includes(doc.subject)) {
      doc.subjects.unshift(doc.subject);
    }
    if (doc.subjectDivisions instanceof Map) {
      doc.subjectDivisions = Object.fromEntries(doc.subjectDivisions);
    } else if (!doc.subjectDivisions || typeof doc.subjectDivisions !== "object") {
      doc.subjectDivisions = {};
    }
  }

  if (options.redactSensitive) {
    delete doc.email;
  }

  return doc;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}


function isValidEmailAddress(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

function normalizeUsername(username) {
  return String(username || "").trim();
}

function escapeRegex(str) {
  return String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validRole(role) {
  return ["student", "faculty", "admin"].includes(role);
}

function validateUserFields({ name, username, email, role, subject, subjects }) {
  if (!validRole(role)) return "Invalid account role.";
  if (!String(name || "").trim()) return "Full name is required.";
  if (!/^[A-Za-z0-9_.-]{4,30}$/.test(username || "")) return "Username must be 4–30 letters, numbers, dot, dash or underscore.";
  if (role !== "admin" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))) return "Enter a valid email address.";
  if (role === "admin" && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))) return "Enter a valid email address.";
  if (role === "faculty") {
    const hasSub = (Array.isArray(subjects) && subjects.length > 0) || Boolean(subject);
    if (!hasSub) return "Please select at least one faculty subject.";
  }
  return "";
}

function createId(role) {
  return `${role}-${crypto.randomBytes(8).toString("hex")}`;
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = await scryptAsync(String(password), salt, 64, {
    N: 16384,
    r: 8,
    p: 1
  });
  return `scrypt$16384$8$1$${salt.toString("base64url")}$${Buffer.from(derived).toString("base64url")}`;
}


async function verifyPassword(password, stored) {
  try {
    const parts = String(stored || "").split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const [, n, r, p, saltText, hashText] = parts;
    const salt = Buffer.from(saltText, "base64url");
    const expected = Buffer.from(hashText, "base64url");
    const actual = await scryptAsync(String(password), salt, expected.length, {
      N: Number(n), r: Number(r), p: Number(p)
    });
    return crypto.timingSafeEqual(Buffer.from(actual), expected);
  } catch {
    return false;
  }
}

// Session Token Creation & Verification
const AUTH_SECRET = process.env.SESSION_SECRET || "campussphere_session_secret_key_2026_secure";

function generateAuthToken(user) {
  if (!user) return "";
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const data = JSON.stringify({
    id: String(user.id || ""),
    role: String(user.role || ""),
    username: String(user.username || ""),
    exp: expiresAt
  });
  const payload = Buffer.from(data).toString("base64url");
  const sig = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyAuthToken(token) {
  try {
    if (!token || typeof token !== "string") return { error: "malformed" };
    // New JSON-based token format (payload.sig)
    if (token.includes(".")) {
      const parts = token.split(".");
      if (parts.length !== 2) return { error: "malformed" };
      const [payload, sig] = parts;
      if (!payload || !sig) return { error: "malformed" };
      const expected = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
      if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return { error: "invalid" };
      let data;
      try {
        data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
      } catch {
        return { error: "malformed" };
      }
      if (!data || typeof data !== "object") return { error: "malformed" };
      if (!data.exp || typeof data.exp !== "number" || data.exp < Date.now()) return { error: "expired" };
      if (!data.id || !data.role || !data.username) return { error: "malformed" };
      return { id: data.id, role: data.role, username: data.username, expiresAt: data.exp };
    }
    // Backward compatibility for legacy colon-delimited token format
    let raw;
    try {
      raw = Buffer.from(token, "base64url").toString("utf8");
    } catch {
      return { error: "malformed" };
    }
    const parts = raw.split(":");
    if (parts.length !== 5) return { error: "malformed" };
    const [id, role, username, expStr, sig] = parts;
    const expiresAt = Number(expStr);
    if (!expiresAt || expiresAt < Date.now()) return { error: "expired" };
    const payload = `${id}:${role}:${username}:${expiresAt}`;
    const expected = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return { error: "invalid" };
    return { id, role, username, expiresAt };
  } catch {
    return { error: "malformed" };
  }
}

async function authenticateRequest(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["x-auth-token"];
  let token = "";
  if (authHeader && String(authHeader).startsWith("Bearer ")) {
    token = String(authHeader).slice(7).trim();
  } else if (authHeader) {
    token = String(authHeader).trim();
  }

  // If no token was supplied, continue as unauthenticated guest
  if (!token) {
    req.user = null;
    return next();
  }

  // A token was supplied; verify it strictly
  const result = verifyAuthToken(token);
  if (result.error) {
    // Exempt login endpoint so a stale client-side header does not prevent logging in
    if (req.path === "/auth/login" || req.path === "/login") {
      req.user = null;
      return next();
    }
    const message = result.error === "expired"
      ? "Authentication token has expired. Please sign in again."
      : (result.error === "malformed" ? "Malformed authentication token." : "Invalid authentication token signature.");
    return res.status(401).json({ success: false, message });
  }

  try {
    const dbUser = await User.findOne({
      id: result.id,
      role: result.role,
      username: new RegExp(`^${escapeRegex(result.username)}$`, "i")
    });
    if (!dbUser) {
      if (req.path === "/auth/login" || req.path === "/login") {
        req.user = null;
        return next();
      }
      return res.status(401).json({ success: false, message: "Authenticated user account no longer exists." });
    }
    req.user = sanitizeUser(dbUser);
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Authentication validation error." });
  }
}

function requireAuth(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required to access this resource." });
    }
    if (Array.isArray(roles) && roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Access forbidden: Requires ${roles.join(" or ")} role.` });
    }
    next();
  };
}

// Connect to MongoDB & Seed Initial Accounts
async function initDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "CampusSphere",
      serverSelectionTimeoutMS: 15000
    });
    console.log("Connected to MongoDB successfully.");

    // Seed default admin or migrate local json if user count is zero
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("No users found in MongoDB. Checking local database.json for migration...");
      if (fs.existsSync(DB_FILE)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
          const users = Array.isArray(parsed?.users) ? parsed.users : [];
          if (users.length > 0) {
            for (const u of users) {
              await User.updateOne({ id: u.id }, { $set: u }, { upsert: true });
            }
            console.log(`Migrated ${users.length} users from data/database.json into MongoDB.`);
          }
        } catch (e) {
          console.error("Auto-migration error:", e.message);
        }
      }

      // Ensure admin account exists
      const adminExists = await User.findOne({ role: "admin", username: "admin" });
      if (!adminExists) {
        const adminPasswordHash = await hashPassword("admin@123");
        await User.create({
          id: "admin-001",
          role: "admin",
          name: "Administrator",
          username: "admin",
          email: "admin@smartportal.edu",
          passwordHash: adminPasswordHash
        });
        console.log("Default admin account created in MongoDB (admin / admin@123).");
      }
    } else {
      // Ensure admin account exists regardless
      const adminExists = await User.findOne({ role: "admin" });
      if (!adminExists) {
        const adminPasswordHash = await hashPassword("admin@123");
        await User.create({
          id: "admin-001",
          role: "admin",
          name: "Administrator",
          username: "admin",
          email: "admin@smartportal.edu",
          passwordHash: adminPasswordHash
        });
        console.log("Default admin account created in MongoDB (admin / admin@123).");
      }
    }

    // Ensure all MongoDB collections (notices, attendances, marks, assignments, notes, timetables) are synchronized
    try {
      const store = await AcademicStore.findOne({ storeKey: "default_academic_store" });
      if (store) {
        await syncCollectionsFromAcademicData(store);
        console.log("Synchronized academic collections in MongoDB.");
      }
    } catch (collErr) {
      console.warn("Initial collection sync warning:", collErr.message);
    }
    try {
      await getCachedUserCounts(true);
    } catch (_) {}
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    console.log("Note: Please make sure MongoDB is running locally or set MONGODB_URI in your .env file.");
  }
}

initDatabase();

// --- API Endpoints ---

app.use("/api", async (req, res, next) => {
  if (req.path === "/status" || req.path === "/health") return next();
  if (mongoose.connection.readyState !== 1) {
    try {
      console.log("Database disconnected. Attempting to reconnect to MongoDB...");
      await mongoose.connect(MONGODB_URI, { dbName: "CampusSphere", serverSelectionTimeoutMS: 5000 });
      console.log("Reconnected to MongoDB successfully.");
    } catch (e) {
      return res.status(503).json({
        success: false,
        message: "Database connection error. Please check your MongoDB status or network access whitelist."
      });
    }
  }
  next();
});

// Authenticate all /api requests (attaches req.user if a valid token is provided)
app.use("/api", authenticateRequest);

app.get("/api/status", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = states[mongoose.connection.readyState] || "unknown";
  res.json({
    success: true,
    message: "CampusSphere backend is running.",
    database: "MongoDB",
    databaseState: dbState
  });
});

app.get("/api/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    success: true,
    databaseMode: "MongoDB",
    databaseState: states[mongoose.connection.readyState] || "unknown",
    connectionUri: MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")
  });
});

let userCountsCache = {
  data: null,
  expiresAt: 0
};

function invalidateUserCountsCache() {
  userCountsCache.expiresAt = 0;
}

async function getCachedUserCounts(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && userCountsCache.data && userCountsCache.expiresAt > now) {
    return userCountsCache.data;
  }
  try {
    const [students, faculty, total] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "faculty" }),
      User.countDocuments({})
    ]);
    userCountsCache.data = { students, faculty, total };
    userCountsCache.expiresAt = now + 30000; // 30s TTL cache for ultra-fast <1ms responses
    return userCountsCache.data;
  } catch (err) {
    if (userCountsCache.data) return userCountsCache.data;
    throw err;
  }
}

app.get(["/api/stats/counts", "/api/users/counts"], async (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    const counts = await getCachedUserCounts(req.query.fresh === "1");
    res.json({
      success: true,
      students: counts.students,
      faculty: counts.faculty,
      total: counts.total
    });
  } catch (error) {
    console.error("Stats count query error:", error);
    res.status(500).json({ success: false, message: "Unable to retrieve user counts." });
  }
});

app.get(["/api/students/count", "/api/users/count"], async (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  try {
    const role = req.query.role || "student";
    const counts = await getCachedUserCounts(req.query.fresh === "1");
    const count = role === "all" ? counts.total : (role === "faculty" ? counts.faculty : counts.students);
    res.json({ success: true, count, role });
  } catch (error) {
    console.error("Student count query error:", error);
    res.status(500).json({ success: false, message: "Unable to retrieve student count." });
  }
});

app.get("/api/users/public", async (req, res) => {
  try {
    if (req.user) {
      if (req.user.role === "admin") {
        const users = await User.find({});
        return res.json({
          success: true,
          users: users.map(u => sanitizeUser(u))
        });
      }

      if (req.user.role === "faculty") {
        // Faculty receives students (with email redacted for student privacy) and their own faculty profile
        const students = await User.find({ role: "student" });
        const facultySelf = await User.findOne({ id: req.user.id, role: "faculty" });
        const otherFaculty = await User.find({ role: "faculty", id: { $ne: req.user.id } });

        const safeStudents = students.map(s => sanitizeUser(s, { redactSensitive: true }));
        const safeSelf = facultySelf ? [sanitizeUser(facultySelf)] : [sanitizeUser(req.user)];
        const safeOtherFaculty = otherFaculty.map(f => sanitizeUser(f, { redactSensitive: true }));

        return res.json({
          success: true,
          users: [...safeStudents, ...safeSelf, ...safeOtherFaculty]
        });
      }

      if (req.user.role === "student") {
        // Students only receive their own profile. No directory of other students, faculty, or admin is exposed.
        const selfUser = await User.findOne({ id: req.user.id, role: "student" });
        return res.json({
          success: true,
          users: [sanitizeUser(selfUser || req.user)]
        });
      }
    }

    // Unauthenticated public request: return empty list to protect directory privacy
    res.json({
      success: true,
      users: []
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Unable to fetch users." });
  }
});

app.get("/api/users/:role/:username", requireAuth(), async (req, res) => {
  try {
    const { role, username } = req.params;
    const targetRole = String(role || "").trim().toLowerCase();
    if (!validRole(targetRole)) {
      return res.status(400).json({ success: false, message: "Invalid account role." });
    }

    const decodedUsername = normalizeUsername(decodeURIComponent(username || ""));
    if (!decodedUsername || !/^[A-Za-z0-9_.-]{1,50}$/.test(decodedUsername)) {
      return res.status(400).json({ success: false, message: "Invalid username format." });
    }

    const isSelf = req.user.username.toLowerCase() === decodedUsername.toLowerCase() && req.user.role === targetRole;
    const isAdmin = req.user.role === "admin";
    const isFaculty = req.user.role === "faculty";

    // Strict RBAC and IDOR protection:
    // 1. Students can ONLY view their own profile.
    if (req.user.role === "student" && !isSelf) {
      return res.status(403).json({ success: false, message: "Forbidden: Students may only view their own profile." });
    }

    // 2. Faculty can view their own profile and students, but NEVER other faculty or admin accounts.
    if (isFaculty && !isSelf) {
      if (targetRole !== "student") {
        return res.status(403).json({ success: false, message: `Forbidden: Faculty cannot access ${targetRole} profiles.` });
      }
    }

    const user = await User.findOne({
      role: targetRole,
      username: new RegExp(`^${escapeRegex(decodedUsername)}$`, "i")
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    // Privacy protection: Redact email if faculty viewing a student
    const redactSensitive = !isSelf && !isAdmin;
    res.json({ success: true, user: sanitizeUser(user, { redactSensitive }) });
  } catch (error) {
    console.error("Get single user error:", error);
    res.status(500).json({ success: false, message: "Unable to fetch user." });
  }
});

app.post("/api/users/migrate", requireAuth(["admin"]), async (req, res) => {
  try {
    if (hasMongoOperators(req.body)) {
      return res.status(400).json({ success: false, message: "Invalid request: MongoDB operators not allowed." });
    }
    const incoming = req.body?.users;
    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
      return res.status(400).json({ success: false, message: "Invalid migration data." });
    }

    let added = 0;
    let updated = 0;

    for (const role of ["student", "faculty", "admin"]) {
      const list = Array.isArray(incoming[role]) ? incoming[role] : [];
      for (const item of list) {
        if (!item || typeof item !== "object") continue;
        const username = normalizeUsername(item.username);
        if (!username) continue;

        // Check if user exists under ANY role to prevent duplicate key crashes or role hijacking
        const existing = await User.findOne({ username: new RegExp(`^${escapeRegex(username)}$`, "i") });
        if (existing) {
          // If existing user has a different role, preserve the existing role and skip to avoid collision
          if (existing.role !== role) {
            console.warn(`Migration skip: Username '${username}' is already registered with role '${existing.role}'.`);
            continue;
          }

          if (item.email !== undefined) existing.email = normalizeEmail(item.email);
          if (item.name) existing.name = String(item.name).trim();
          if (item.subject !== undefined) existing.subject = String(item.subject).trim();
          if (Array.isArray(item.subjects)) existing.subjects = item.subjects.map(s => String(s).trim()).filter(Boolean);
          else if (item.subject && (!existing.subjects || !existing.subjects.length)) existing.subjects = [existing.subject];
          if (item.department !== undefined) existing.department = String(item.department).trim();
          if (item.profilePic !== undefined) existing.profilePic = String(item.profilePic);
          if (!existing.passwordHash) {
            if (item.passwordHash) existing.passwordHash = item.passwordHash;
            else if (item.password) existing.passwordHash = await hashPassword(item.password);
          }
          if (role === "faculty") {
            if (item.subjectDivisions !== undefined && typeof item.subjectDivisions === "object") {
              existing.subjectDivisions = item.subjectDivisions;
              existing.markModified("subjectDivisions");
            }
          }
          if (role === "student") {
            if (item.division !== undefined) existing.division = String(item.division).trim();
            if (item.semester !== undefined) existing.semester = String(item.semester).trim();
            if (item.courseYear !== undefined) existing.courseYear = String(item.courseYear).trim();
            if (item.course !== undefined) existing.course = String(item.course).trim();
            if (item.languageChoice !== undefined) existing.languageChoice = String(item.languageChoice).trim();
            if (item.mathChoice !== undefined) existing.mathChoice = String(item.mathChoice).trim();
          }
          await existing.save();
          updated++;
          continue;
        }

        const facultySubs = Array.isArray(item.subjects) && item.subjects.length
          ? item.subjects.map(s => String(s).trim()).filter(Boolean)
          : (item.subject ? [String(item.subject).trim()] : []);
        const newUser = {
          id: item.id || createId(role),
          role,
          name: String(item.name || username).trim(),
          username,
          email: normalizeEmail(item.email),
          subject: role === "faculty" ? (facultySubs[0] || String(item.subject || "")) : "",
          subjects: role === "faculty" ? facultySubs : [],
          subjectDivisions: role === "faculty" && item.subjectDivisions && typeof item.subjectDivisions === "object" ? item.subjectDivisions : {},
          department: role === "faculty" ? String(item.department || "Department of Computer Science & Applications") : "",
          profilePic: String(item.profilePic || ""),
          passwordHash: item.passwordHash ? item.passwordHash : (item.password ? await hashPassword(item.password) : await hashPassword("student@123"))
        };
        if (role === "student") {
          newUser.division = String(item.division || "Div A").trim();
          newUser.semester = String(item.semester || "1st Semester").trim();
          newUser.courseYear = String(item.courseYear || "1st Year").trim();
          newUser.course = String(item.course || "Bachelor of Computer Applications (BCA)").trim();
          newUser.languageChoice = String(item.languageChoice || "Kannada").trim();
          newUser.mathChoice = String(item.mathChoice || "Mathematics").trim();
        }
        await User.create(newUser);
        added++;
      }
    }

    if (added > 0 || updated > 0) invalidateUserCountsCache();
    const allUsers = await User.find({});
    res.json({ success: true, added, updated, users: allUsers.map(sanitizeUser) });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({ success: false, message: "Unable to migrate users." });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    if (hasMongoOperators(req.body)) {
      return res.status(400).json({ success: false, message: "Invalid request: MongoDB operators not allowed." });
    }
    const { name, username, password, email, role, subject, subjects, subjectDivisions, department, division, semester, courseYear, course, languageChoice, mathChoice, profilePic } = req.body || {};
    
    if (typeof name !== "string" || typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ success: false, message: "Full name, username, and password must be string values." });
    }

    const targetRole = String(role || "student").trim().toLowerCase();

    // Privileged accounts (admin and faculty) can strictly only be created by an authenticated administrator.
    // Public self-registration is strictly restricted to students.
    if (targetRole !== "student") {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Only administrators can create ${targetRole} accounts.`
        });
      }
    }

    const validation = validateUserFields({ name, username, email, role: targetRole, subject, subjects });
    if (validation) return res.status(400).json({ success: false, message: validation });
    if (!password || String(password).length < 6) return res.status(400).json({ success: false, message: "Password must contain at least 6 characters." });

    const existingUsername = await User.findOne({ username: new RegExp(`^${escapeRegex(normalizeUsername(username))}$`, "i") });
    if (existingUsername) return res.status(409).json({ success: false, message: "That username is already in use." });

    if (email && normalizeEmail(email)) {
      const existingEmail = await User.findOne({ email: normalizeEmail(email) });
      if (existingEmail) return res.status(409).json({ success: false, message: "That email address is already in use." });
    }

    let facultySubjects = [];
    if (Array.isArray(subjects)) {
      facultySubjects = subjects.map(s => String(s).trim()).filter(Boolean);
    } else if (subject) {
      facultySubjects = [String(subject).trim()];
    }
    const primarySubject = facultySubjects.length > 0 ? facultySubjects[0] : String(subject || "");

    const userObj = {
      id: createId(targetRole),
      role: targetRole,
      name: String(name).trim(),
      username: normalizeUsername(username),
      email: normalizeEmail(email),
      subject: targetRole === "faculty" ? primarySubject : "",
      subjects: targetRole === "faculty" ? facultySubjects : [],
      subjectDivisions: targetRole === "faculty" && subjectDivisions && typeof subjectDivisions === "object" ? subjectDivisions : {},
      department: targetRole === "faculty" ? String(department || "Department of Computer Science & Applications").trim() : "",
      division: targetRole === "faculty" ? String(division || "Both Divisions").trim() : "",
      profilePic: String(profilePic || ""),
      passwordHash: await hashPassword(password)
    };

    if (targetRole === "student") {
      userObj.division = String(division || "Div A").trim();
      userObj.semester = String(semester || "1st Semester").trim();
      userObj.courseYear = String(courseYear || "1st Year").trim();
      userObj.course = String(course || "Bachelor of Computer Applications (BCA)").trim();
      userObj.languageChoice = String(languageChoice || "Kannada").trim();
      userObj.mathChoice = String(mathChoice || "Mathematics").trim();
    }

    const createdUser = await User.create(userObj);
    invalidateUserCountsCache();
    const token = generateAuthToken(createdUser);
    res.status(201).json({ success: true, token, user: sanitizeUser(createdUser) });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ success: false, message: "Unable to save the user." });
  }
});

app.put("/api/users/:role/:username", requireAuth(), async (req, res) => {
  try {
    if (hasMongoOperators(req.body)) {
      return res.status(400).json({ success: false, message: "Invalid request: MongoDB operators not allowed." });
    }

    const targetRole = String(req.params.role || "").trim().toLowerCase();
    if (!validRole(targetRole)) {
      return res.status(400).json({ success: false, message: "Invalid account role." });
    }

    const targetUsername = normalizeUsername(decodeURIComponent(req.params.username || ""));
    if (!targetUsername || !/^[A-Za-z0-9_.-]{1,50}$/.test(targetUsername)) {
      return res.status(400).json({ success: false, message: "Invalid username format." });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = req.user.role === targetRole && req.user.username.toLowerCase() === targetUsername.toLowerCase();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: You are not authorized to modify another user's account." });
    }

    // Role immutability & privilege escalation prevention
    if (req.body?.role !== undefined && String(req.body.role).toLowerCase() !== targetRole) {
      if (!isAdmin) {
        return res.status(403).json({ success: false, message: "Forbidden: You cannot change account roles." });
      }
    }

    const { id, name, newUsername, password, currentPassword, email, subject, subjects, subjectDivisions, department, division, semester, courseYear, course, languageChoice, mathChoice, profilePic } = req.body || {};

    if (name !== undefined && typeof name !== "string") return res.status(400).json({ success: false, message: "Name must be a string." });
    if (newUsername !== undefined && typeof newUsername !== "string") return res.status(400).json({ success: false, message: "Username must be a string." });
    if (email !== undefined && typeof email !== "string") return res.status(400).json({ success: false, message: "Email must be a string." });
    if (password !== undefined && typeof password !== "string") return res.status(400).json({ success: false, message: "Password must be a string." });
    if (currentPassword !== undefined && typeof currentPassword !== "string") return res.status(400).json({ success: false, message: "Current password must be a string." });

    let user;
    if (isAdmin) {
      user = await User.findOne({
        role: targetRole,
        username: new RegExp(`^${escapeRegex(targetUsername)}$`, "i")
      });
      if (!user && id) {
        user = await User.findOne({ role: targetRole, id: String(id) });
      }
    } else {
      // Non-admin can ONLY modify their own authenticated record
      user = await User.findOne({ id: req.user.id, role: req.user.role });
    }
    if (!user) return res.status(404).json({ success: false, message: "Account not found." });

    const role = user.role;
    const nextUsername = normalizeUsername(newUsername || user.username);
    const nextEmail = email !== undefined ? normalizeEmail(email) : user.email;
    const validation = validateUserFields({
      name: name || user.name,
      username: nextUsername,
      email: nextEmail,
      role,
      subject: role === "faculty" ? (subject !== undefined ? subject : user.subject) : "",
      subjects: role === "faculty" ? (subjects !== undefined ? subjects : user.subjects) : []
    });
    if (validation) return res.status(400).json({ success: false, message: validation });

    if (nextUsername.toLowerCase() !== user.username.toLowerCase()) {
      const takenUser = await User.findOne({ username: new RegExp(`^${escapeRegex(nextUsername)}$`, "i"), id: { $ne: user.id } });
      if (takenUser) return res.status(409).json({ success: false, message: "That username is already in use." });

      // Synchronize AcademicStore keys so student marks, attendance, and assignments are preserved
      try {
        const store = await AcademicStore.findOne({ storeKey: "default_academic_store" });
        if (store) {
          if (store.students && store.students[user.username]) {
            store.students[nextUsername] = store.students[user.username];
            delete store.students[user.username];
            store.markModified("students");
          }
          if (Array.isArray(store.assignments)) {
            store.assignments.forEach(a => {
              if (a.student && a.student.toLowerCase() === user.username.toLowerCase()) a.student = nextUsername;
              if (a.facultyUsername && a.facultyUsername.toLowerCase() === user.username.toLowerCase()) a.facultyUsername = nextUsername;
            });
            store.markModified("assignments");
          }
          await store.save();
        }
      } catch (e) {
        console.warn("Academic username sync warning:", e.message);
      }
    }

    if (nextEmail && nextEmail !== user.email) {
      const takenEmail = await User.findOne({ email: nextEmail, id: { $ne: user.id } });
      if (takenEmail) return res.status(409).json({ success: false, message: "That email address is already in use." });
    }

    // Role-based strict field allowlists
    user.name = String(name || user.name).trim();
    user.username = nextUsername;
    if (role !== "admin" || email !== undefined) user.email = nextEmail;
    if (profilePic !== undefined) user.profilePic = String(profilePic);

    if (role === "faculty") {
      if (department !== undefined) user.department = String(department).trim();
      if (division !== undefined) user.division = String(division).trim();

      // Only administrators can assign subjects and divisions to faculty
      if (isAdmin) {
        if (subjects !== undefined && Array.isArray(subjects)) {
          user.subjects = subjects.map(s => String(s).trim()).filter(Boolean);
          if (subject !== undefined && String(subject).trim()) {
            user.subject = String(subject).trim();
          } else if (!user.subjects.includes(user.subject) && user.subjects.length > 0) {
            user.subject = user.subjects[0];
          }
        } else if (subject !== undefined) {
          user.subject = String(subject).trim();
          if (!Array.isArray(user.subjects) || !user.subjects.includes(user.subject)) {
            user.subjects = user.subject ? [user.subject] : [];
          }
        }
        if (subjectDivisions !== undefined && typeof subjectDivisions === "object") {
          user.subjectDivisions = subjectDivisions;
          user.markModified("subjectDivisions");
        }
      }
    }

    if (role === "student") {
      if (division !== undefined) user.division = String(division).trim();
      if (semester !== undefined) user.semester = String(semester).trim();
      if (courseYear !== undefined) user.courseYear = String(courseYear).trim();
      if (course !== undefined) user.course = String(course).trim();
      if (languageChoice !== undefined) user.languageChoice = String(languageChoice).trim();
      if (mathChoice !== undefined) user.mathChoice = String(mathChoice).trim();
    }

    if (password) {
      if (String(password).length < 6) return res.status(400).json({ success: false, message: "Password must contain at least 6 characters." });
      // Non-admin users must verify currentPassword before changing password
      if (!isAdmin) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: "Current password is required to change password." });
        }
        if (!user.passwordHash || !(await verifyPassword(currentPassword, user.passwordHash))) {
          return res.status(400).json({ success: false, message: "Current password is incorrect." });
        }
      }
      user.passwordHash = await hashPassword(password);
    }

    await user.save();
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, message: "Unable to update the user." });
  }
});

app.delete("/api/users/:role/:username", requireAuth(["admin"]), async (req, res) => {
  try {
    const { role, username } = req.params;
    const targetRole = String(role || "").trim().toLowerCase();
    if (!validRole(targetRole)) {
      return res.status(400).json({ success: false, message: "Invalid account role." });
    }

    if (targetRole === "admin") {
      return res.status(403).json({ success: false, message: "Admin accounts cannot be deleted here." });
    }

    const targetUsername = normalizeUsername(decodeURIComponent(username || ""));
    if (!targetUsername || !/^[A-Za-z0-9_.-]{1,50}$/.test(targetUsername)) {
      return res.status(400).json({ success: false, message: "Invalid username format." });
    }

    const result = await User.deleteOne({
      role: targetRole,
      username: new RegExp(`^${escapeRegex(targetUsername)}$`, "i")
    });

    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: "Account not found." });
    invalidateUserCountsCache();

    // Clean up academic records if student
    if (targetRole === "student") {
      try {
        const store = await AcademicStore.findOne({ storeKey: "default_academic_store" });
        if (store) {
          if (store.students && store.students[targetUsername]) {
            delete store.students[targetUsername];
            store.markModified("students");
          }
          if (Array.isArray(store.assignments)) {
            store.assignments.filter(a => (a.student || "").toLowerCase() !== targetUsername.toLowerCase());
          }
          if (Array.isArray(store.deletedAssignments)) {
            store.deletedAssignments = store.deletedAssignments.filter(k => !String(k || "").toLowerCase().startsWith(`${targetUsername.toLowerCase()}___`));
          }
          await store.save();
        }
      } catch (storeErr) {
        console.warn("Academic cleanup warning:", storeErr.message);
      }
    }

    const remaining = await User.countDocuments();
    res.json({ success: true, message: "Account and details removed permanently from MongoDB.", remaining });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Unable to delete the user." });
  }
});

app.post("/api/auth/login", rateLimitLogin, async (req, res) => {
  try {
    if (hasMongoOperators(req.body)) {
      return res.status(400).json({ success: false, message: "Invalid request: MongoDB operators not allowed." });
    }

    const { role, username, password } = req.body || {};
    if (typeof role !== "string" || typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({ success: false, message: "Invalid input types: expected string values." });
    }

    if (!validRole(role) || !username.trim() || !password) {
      return res.status(400).json({ success: false, message: "Role, username and password are required." });
    }

    const user = await User.findOne({
      role,
      username: new RegExp(`^${escapeRegex(normalizeUsername(username))}$`, "i")
    });

    let isMatch = false;
    if (user && user.passwordHash) {
      isMatch = await verifyPassword(password, user.passwordHash);
    } else {
      // Dummy check to equalize response time against username enumeration
      await verifyPassword(password, "scrypt$16384$8$1$c2FsdHNhbHQ$aGFzaGhhc2g");
    }

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: "Invalid username or password." });
    }

    const token = generateAuthToken(user);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Unable to sign in right now." });
  }
});


// --- Timetable Endpoints ---

app.get("/api/timetable", requireAuth(), async (req, res) => {
  try {
    const entries = await Timetable.find({});
    res.json({ success: true, timetable: entries });
  } catch (error) {
    console.error("Fetch timetable error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch timetable." });
  }
});

app.post("/api/timetable/sync", requireAuth(["faculty", "admin"]), async (req, res) => {
  try {
    const { timetable } = req.body || {};
    if (!timetable || !Array.isArray(timetable)) {
      return res.status(400).json({ success: false, message: "Timetable must be an array of schedule entries." });
    }

    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const validEntries = [];

    for (const item of timetable) {
      if (!item || typeof item !== "object") continue;
      const division = String(item.division || "Div A").trim();
      const semester = String(item.semester || "").trim();
      const day = String(item.day || "").trim();
      const time = String(item.time || "").trim();
      const subject = String(item.subject || "").trim();
      const subjectText = String(item.subjectText || item.subject || "Class").trim();
      const faculty = String(item.faculty || "").trim();

      if (!division || !day || !time || !subjectText || !validDays.includes(day)) {
        continue;
      }

      validEntries.push({
        division,
        semester,
        day,
        time,
        subject,
        subjectText,
        faculty
      });
    }

    if (validEntries.length > 0) {
      const ops = validEntries.map(item => ({
        updateOne: {
          filter: {
            division: item.division,
            semester: item.semester,
            day: item.day,
            time: item.time
          },
          update: {
            $set: {
              division: item.division,
              semester: item.semester,
              day: item.day,
              time: item.time,
              subject: item.subject,
              subjectText: item.subjectText,
              faculty: item.faculty
            }
          },
          upsert: true
        }
      }));

      await Timetable.bulkWrite(ops, { ordered: false });

      // Synchronize AcademicStore.timetable so both layers stay consistent without wiping
      try {
        const store = await AcademicStore.findOne({ storeKey: "default_academic_store" });
        if (store) {
          const ttMap = new Map();
          (store.timetable || []).forEach(t => {
            if (t && t.division && t.day && t.time) {
              ttMap.set(`${t.division}_${t.semester || ""}_${t.day}_${t.time}`, t);
            }
          });
          validEntries.forEach(t => {
            ttMap.set(`${t.division}_${t.semester || ""}_${t.day}_${t.time}`, t);
          });
          store.timetable = Array.from(ttMap.values());
          store.markModified("timetable");
          await store.save();
        }
      } catch (storeErr) {
        console.warn("Timetable AcademicStore sync warning:", storeErr.message);
      }
    }

    res.json({ success: true, message: "Timetable synchronized safely." });
  } catch (error) {
    console.error("Sync timetable error:", error);
    res.status(500).json({ success: false, message: "Failed to sync timetable." });
  }
});



// --- Academic Data MongoDB Persistence Endpoints ---

function normalizeStoreDivisions(divisions) {
  const defaultDivs = {
    "1st Year": ["Div A", "Div B"],
    "2nd Year": ["Div A", "Div B"],
    "3rd Year": ["Div A", "Div B"]
  };
  if (!divisions) return defaultDivs;
  if (Array.isArray(divisions)) {
    const list = divisions.length ? divisions : ["Div A", "Div B"];
    return {
      "1st Year": [...list],
      "2nd Year": [...list],
      "3rd Year": [...list]
    };
  }
  if (typeof divisions === "object") {
    const result = { ...defaultDivs };
    for (const [yr, list] of Object.entries(divisions)) {
      if (Array.isArray(list) && list.length) {
        result[yr] = list;
      }
    }
    return result;
  }
  return defaultDivs;
}

app.get("/api/academic/data", requireAuth(), async (req, res) => {
  try {
    let store = await AcademicStore.findOne({ storeKey: "default_academic_store" });
    if (!store) {
      store = await AcademicStore.create({ storeKey: "default_academic_store" });
    }

    // Student role: SCOPE academic data so student only receives their own private records
    if (req.user.role === "student") {
      const username = req.user.username;
      const normUsername = String(username).toLowerCase();
      let studentRec = {};
      if (store.students && typeof store.students === "object") {
        for (const [sKey, sVal] of Object.entries(store.students)) {
          if (String(sKey).toLowerCase() === normUsername) {
            studentRec = { [sKey]: sVal };
            break;
          }
        }
      }
      const studentDiv = req.user.division || "";
      
      const scopedNotices = (store.notices || []).filter(n => {
        if (!n.target || n.target === "all" || n.target === "student") {
          if (n.targetDivision && n.targetDivision !== "all" && n.targetDivision !== "All Divisions" && studentDiv && n.targetDivision !== studentDiv) return false;
          return true;
        }
        return false;
      });

      const scopedAssignments = (store.assignments || []).filter(a => {
        if (a.student && a.student.toLowerCase() === normUsername) return true;
        if (a.student === "all") {
          if (a.targetDivision && studentDiv && a.targetDivision !== "All Divisions" && a.targetDivision !== studentDiv) return false;
          return true;
        }
        return false;
      });

      const scopedNotes = (store.notes || []).filter(n => {
        if (!n.division || n.division === "All Divisions" || (studentDiv && n.division === studentDiv)) return true;
        return false;
      });

      // Redact other students' records from daily attendance logs
      const scopedAttendance = (store.dailyAttendance || []).map(att => {
        const logObj = { ...att };
        if (logObj.records && typeof logObj.records === "object") {
          let status = "";
          for (const [rKey, rVal] of Object.entries(logObj.records)) {
            if (String(rKey).toLowerCase() === normUsername) {
              status = rVal;
              break;
            }
          }
          logObj.records = { [username]: status };
        }
        return logObj;
      });

      return res.json({
        success: true,
        data: {
          students: studentRec,
          notices: scopedNotices,
          timetable: store.timetable || [],
          timetableHeader: store.timetableHeader || {},
          customBreakRows: store.customBreakRows || {},
          assignments: scopedAssignments,
          notes: scopedNotes,
          deletedAssignments: (store.deletedAssignments || []).filter(k => String(k || "").toLowerCase().startsWith(`${normUsername}___`)),
          dailyAttendance: scopedAttendance,
          subjectMarksConfig: store.subjectMarksConfig || {},
          subjects: store.subjects || [],
          divisions: normalizeStoreDivisions(store.divisions)
        }
      });
    }

    // Faculty or Admin role: return complete operational store data
    if (req.user.role === "faculty" || req.user.role === "admin") {
      return res.json({
        success: true,
        data: {
          students: store.students || {},
          notices: store.notices || [],
          timetable: store.timetable || [],
          timetableHeader: store.timetableHeader || {},
          customBreakRows: store.customBreakRows || {},
          assignments: store.assignments || [],
          notes: store.notes || [],
          deletedAssignments: store.deletedAssignments || [],
          dailyAttendance: store.dailyAttendance || [],
          subjectMarksConfig: store.subjectMarksConfig || {},
          subjects: store.subjects || [],
          divisions: normalizeStoreDivisions(store.divisions)
        }
      });
    }

    return res.status(403).json({ success: false, message: "Access forbidden." });
  } catch (error) {
    console.error("Fetch academic data error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch academic data." });
  }
});

function getDeterministicNoticeId(n, idx = 0) {
  if (n.id) return String(n.id).trim();
  if (n.noticeId) return String(n.noticeId).trim();
  const raw = `${n.title || ""}_${n.date || ""}_${n.postedBy || ""}_${idx}`;
  return "notice-" + crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

function getDeterministicAttendanceId(a, idx = 0) {
  if (a.id) return String(a.id).trim();
  if (a.attendanceId) return String(a.attendanceId).trim();
  const raw = `${a.date || ""}_${a.subject || ""}_${a.division || ""}_${a.facultyUsername || ""}_${idx}`;
  return "att-" + crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

function getDeterministicAssignmentId(as, idx = 0) {
  if (as.assignmentId) return String(as.assignmentId).trim();
  if (as.id) {
    return as.student ? `${as.id}_${as.student}` : String(as.id);
  }
  const raw = `${as.title || ""}_${as.subject || ""}_${as.student || ""}_${as.due || ""}_${idx}`;
  return "assign-" + crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

function getDeterministicNoteId(n, idx = 0) {
  if (n.id) return String(n.id).trim();
  if (n.noteId) return String(n.noteId).trim();
  const raw = `${n.title || ""}_${n.subject || ""}_${n.uploadedBy || ""}_${idx}`;
  return "note-" + crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

// In-flight concurrency serializer for academic collection synchronization
let academicSyncQueue = Promise.resolve();

function enqueueAcademicSync(task) {
  const next = academicSyncQueue.then(task, task);
  academicSyncQueue = next.catch(() => {});
  return next;
}

async function syncCollectionsFromAcademicData(payload = {}) {
  return enqueueAcademicSync(async () => {
    try {
      // 1. Sync Notices into MongoDB 'notices' collection via safe bulkWrite upsert
      if (Array.isArray(payload.notices) && payload.notices.length > 0) {
        const noticeOps = payload.notices
          .filter(n => n && typeof n === "object")
          .map((n, idx) => {
            const noticeId = getDeterministicNoticeId(n, idx);
            return {
              updateOne: {
                filter: { noticeId },
                update: {
                  $set: {
                    noticeId,
                    title: n.title || "Untitled Notice",
                    text: n.text || n.content || "",
                    content: n.content || n.text || "",
                    date: n.date || new Date().toISOString().slice(0, 10),
                    target: n.target || "all",
                    postedBy: n.postedBy || n.authorName || (n.authorRole === "admin" ? "Admin" : "Faculty"),
                    postedByName: n.postedByName || n.authorName || "Faculty",
                    authorRole: n.authorRole || (n.postedBy === "admin" ? "admin" : "faculty"),
                    authorName: n.authorName || n.postedByName || "Faculty",
                    targetRole: n.targetRole || n.target || "all",
                    targetDivision: n.targetDivision || "all",
                    targetSemester: n.targetSemester || "all",
                    fileName: n.fileName || "",
                    fileData: n.fileData || "",
                    isImportant: Boolean(n.isImportant)
                  }
                },
                upsert: true
              }
            };
          });
        if (noticeOps.length > 0) {
          await Notice.bulkWrite(noticeOps, { ordered: false });
        }
      }

      // Explicit notice deletion (only when explicitly requested)
      if (Array.isArray(payload.deletedNotices) && payload.deletedNotices.length > 0) {
        const validDelNoticeIds = payload.deletedNotices.map(id => String(id).trim()).filter(Boolean);
        if (validDelNoticeIds.length > 0) {
          await Notice.deleteMany({ noticeId: { $in: validDelNoticeIds } });
        }
      }

      // 2. Sync Daily Attendance into MongoDB 'attendances' collection via safe bulkWrite upsert
      if (Array.isArray(payload.dailyAttendance) && payload.dailyAttendance.length > 0) {
        const attOps = payload.dailyAttendance
          .filter(a => a && typeof a === "object")
          .map((a, idx) => {
            const attendanceId = getDeterministicAttendanceId(a, idx);
            return {
              updateOne: {
                filter: { attendanceId },
                update: {
                  $set: {
                    attendanceId,
                    subject: a.subject || "",
                    division: a.division || "",
                    semester: a.semester || "",
                    courseYear: a.courseYear || "",
                    date: a.date || "",
                    isoDate: a.isoDate || "",
                    records: a.records && typeof a.records === "object" ? a.records : {},
                    studentUsername: a.studentUsername || "",
                    status: a.status || "",
                    facultyUsername: a.facultyUsername || ""
                  }
                },
                upsert: true
              }
            };
          });
        if (attOps.length > 0) {
          await Attendance.bulkWrite(attOps, { ordered: false });
        }
      }

      // 3. Sync Student Marks into MongoDB 'marks' collection via safe bulkWrite upsert
      if (payload.students && typeof payload.students === "object") {
        const markOps = [];
        for (const [username, record] of Object.entries(payload.students)) {
          if (record && record.marks && typeof record.marks === "object") {
            for (const [subId, m] of Object.entries(record.marks)) {
              if (m && typeof m === "object") {
                const markId = `${username}_${subId}`;
                const totalVal = typeof m.total === "number" ? m.total : (
                  (typeof m.internal1 === "number" ? m.internal1 : 0) +
                  (typeof m.internal2 === "number" ? m.internal2 : 0) +
                  (typeof m.assignment === "number" ? m.assignment : 0)
                );
                markOps.push({
                  updateOne: {
                    filter: { markId },
                    update: {
                      $set: {
                        markId,
                        studentUsername: username,
                        studentName: record.name || username,
                        subject: subId,
                        internal1: typeof m.internal1 === "number" ? m.internal1 : null,
                        internal2: typeof m.internal2 === "number" ? m.internal2 : null,
                        assignment: typeof m.assignment === "number" ? m.assignment : null,
                        final: typeof m.final === "number" ? m.final : null,
                        maxInternal1: typeof m.maxInternal1 === "number" ? m.maxInternal1 : 20,
                        maxInternal2: typeof m.maxInternal2 === "number" ? m.maxInternal2 : 20,
                        maxAssignment: typeof m.maxAssignment === "number" ? m.maxAssignment : 10,
                        maxFinal: typeof m.maxFinal === "number" ? m.maxFinal : 70,
                        total: totalVal,
                        grade: m.grade || "",
                        marksObtained: totalVal
                      }
                    },
                    upsert: true
                  }
                });
              }
            }
          }
        }
        if (markOps.length > 0) {
          await Mark.bulkWrite(markOps, { ordered: false });
        }
      }

      // 4. Sync Assignments into MongoDB 'assignments' collection via safe bulkWrite upsert
      if (Array.isArray(payload.assignments) && payload.assignments.length > 0) {
        const assignOps = payload.assignments
          .filter(as => as && typeof as === "object")
          .map((as, idx) => {
            const assignmentId = getDeterministicAssignmentId(as, idx);
            return {
              updateOne: {
                filter: { assignmentId },
                update: {
                  $set: {
                    assignmentId,
                    title: as.title || "Untitled Assignment",
                    description: as.description || "",
                    subject: as.subject || "",
                    student: as.student || "",
                    targetDivision: as.targetDivision || "",
                    fileName: as.fileName || "",
                    fileData: as.fileData || "",
                    due: as.due || "",
                    status: as.status || "Pending",
                    submittedDate: as.submittedDate || "",
                    facultyUsername: as.facultyUsername || "",
                    submissions: Array.isArray(as.submissions) ? as.submissions : []
                  }
                },
                upsert: true
              }
            };
          });
        if (assignOps.length > 0) {
          await Assignment.bulkWrite(assignOps, { ordered: false });
        }
      }

      // Explicit assignment deletions (only when explicitly requested in payload.deletedAssignments)
      if (Array.isArray(payload.deletedAssignments) && payload.deletedAssignments.length > 0) {
        const deleteConditions = [];
        for (const key of payload.deletedAssignments) {
          const k = String(key || "").trim();
          if (!k) continue;
          if (k.includes("___")) {
            const [stu, titleOrId] = k.split("___");
            deleteConditions.push({
              $or: [
                { assignmentId: `${titleOrId}_${stu}` },
                { student: new RegExp(`^${escapeRegex(stu)}$`, "i"), title: new RegExp(`^${escapeRegex(titleOrId)}$`, "i") }
              ]
            });
          } else {
            deleteConditions.push({ assignmentId: k });
          }
        }
        if (deleteConditions.length > 0) {
          await Assignment.deleteMany({ $or: deleteConditions });
        }
      }

      // 5. Sync Study Notes into MongoDB 'notes' collection via safe bulkWrite upsert
      if (Array.isArray(payload.notes) && payload.notes.length > 0) {
        const noteOps = payload.notes
          .filter(n => n && typeof n === "object")
          .map((n, idx) => {
            const noteId = getDeterministicNoteId(n, idx);
            return {
              updateOne: {
                filter: { noteId },
                update: {
                  $set: {
                    noteId,
                    subject: n.subject || "",
                    title: n.title || "Untitled Note",
                    division: n.division || "All Divisions",
                    fileName: n.fileName || "",
                    fileData: n.fileData || "",
                    uploadedBy: n.uploadedBy || "",
                    uploadedByName: n.uploadedByName || "Faculty",
                    date: n.date || new Date().toISOString().slice(0, 10)
                  }
                },
                upsert: true
              }
            };
          });
        if (noteOps.length > 0) {
          await Note.bulkWrite(noteOps, { ordered: false });
        }
      }

      // Explicit study notes deletion (only when explicitly requested)
      if (Array.isArray(payload.deletedNotes) && payload.deletedNotes.length > 0) {
        const validDelNoteIds = payload.deletedNotes.map(id => String(id).trim()).filter(Boolean);
        if (validDelNoteIds.length > 0) {
          await Note.deleteMany({ noteId: { $in: validDelNoteIds } });
        }
      }

      // 6. Sync Timetable into MongoDB 'timetables' collection via safe bulkWrite upsert
      if (Array.isArray(payload.timetable) && payload.timetable.length > 0) {
        const ttOps = payload.timetable
          .filter(item => item && typeof item === "object" && item.day && item.time)
          .map(item => ({
            updateOne: {
              filter: {
                division: item.division || "Div A",
                semester: item.semester || "",
                day: item.day,
                time: item.time
              },
              update: {
                $set: {
                  division: item.division || "Div A",
                  semester: item.semester || "",
                  day: item.day,
                  time: item.time,
                  subject: item.subject || "",
                  subjectText: item.subjectText || item.subject || "Class",
                  faculty: item.faculty || ""
                }
              },
              upsert: true
            }
          }));
        if (ttOps.length > 0) {
          await Timetable.bulkWrite(ttOps, { ordered: false });
        }
      }
    } catch (syncErr) {
      console.warn("Collection sync helper warning:", syncErr.message);
    }
  });
}

app.post("/api/academic/sync", requireAuth(["faculty", "admin"]), async (req, res) => {
  try {
    const payload = req.body?.data || req.body || {};

    // 1. Validate payload structure before database modifications
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ success: false, message: "Invalid academic synchronization payload." });
    }
    if (payload.students !== undefined && (typeof payload.students !== "object" || Array.isArray(payload.students))) {
      return res.status(400).json({ success: false, message: "Invalid students payload format: Expected an object." });
    }
    if (payload.notices !== undefined && !Array.isArray(payload.notices)) {
      return res.status(400).json({ success: false, message: "Invalid notices payload format: Expected an array." });
    }
    if (payload.dailyAttendance !== undefined && !Array.isArray(payload.dailyAttendance)) {
      return res.status(400).json({ success: false, message: "Invalid dailyAttendance payload format: Expected an array." });
    }
    if (payload.assignments !== undefined && !Array.isArray(payload.assignments)) {
      return res.status(400).json({ success: false, message: "Invalid assignments payload format: Expected an array." });
    }
    if (payload.notes !== undefined && !Array.isArray(payload.notes)) {
      return res.status(400).json({ success: false, message: "Invalid notes payload format: Expected an array." });
    }
    if (payload.timetable !== undefined && !Array.isArray(payload.timetable)) {
      return res.status(400).json({ success: false, message: "Invalid timetable payload format: Expected an array." });
    }

    const existingStore = await AcademicStore.findOne({ storeKey: "default_academic_store" });
    const update = {};

    // 2. Safe merge logic: update existing and insert new records, while preserving records from other divisions/subjects
    if (payload.students && typeof payload.students === "object") {
      update.students = { ...(existingStore?.students || {}), ...payload.students };
    }

    if (Array.isArray(payload.notices)) {
      const sanitizedNotices = payload.notices.map(n => ({
        ...n,
        authorRole: req.user.role === "faculty" && n.authorRole === "admin" ? "faculty" : (n.authorRole || (req.user.role === "admin" ? "admin" : "faculty"))
      }));
      const noticeMap = new Map();
      (existingStore?.notices || []).forEach(n => {
        if (n) noticeMap.set(n.id || n.noticeId || n.title, n);
      });
      sanitizedNotices.forEach(n => {
        if (n) noticeMap.set(n.id || n.noticeId || n.title, n);
      });
      if (Array.isArray(payload.deletedNotices)) {
        payload.deletedNotices.forEach(delId => noticeMap.delete(delId));
      }
      update.notices = Array.from(noticeMap.values());
    }

    if (Array.isArray(payload.dailyAttendance)) {
      const attMap = new Map();
      (existingStore?.dailyAttendance || []).forEach(a => {
        if (a && (a.id || a.attendanceId)) attMap.set(a.id || a.attendanceId, a);
      });
      payload.dailyAttendance.forEach(a => {
        if (a && (a.id || a.attendanceId)) attMap.set(a.id || a.attendanceId, a);
      });
      update.dailyAttendance = Array.from(attMap.values());
    }

    if (Array.isArray(payload.assignments)) {
      const asgnMap = new Map();
      (existingStore?.assignments || []).forEach(a => {
        if (a && a.id) asgnMap.set(`${a.id}_${a.student || ""}`, a);
      });
      payload.assignments.forEach(a => {
        if (a && a.id) asgnMap.set(`${a.id}_${a.student || ""}`, a);
      });
      update.assignments = Array.from(asgnMap.values());
    }

    if (Array.isArray(payload.notes)) {
      const noteMap = new Map();
      (existingStore?.notes || []).forEach(n => {
        if (n && n.id) noteMap.set(n.id, n);
      });
      payload.notes.forEach(n => {
        if (n && n.id) noteMap.set(n.id, n);
      });
      if (Array.isArray(payload.deletedNotes)) {
        payload.deletedNotes.forEach(delId => noteMap.delete(delId));
      }
      update.notes = Array.from(noteMap.values());
    }

    if (Array.isArray(payload.deletedAssignments)) {
      const combinedDel = new Set([...(existingStore?.deletedAssignments || []), ...payload.deletedAssignments]);
      update.deletedAssignments = Array.from(combinedDel);
    }

    if (payload.subjectMarksConfig && typeof payload.subjectMarksConfig === "object") {
      update.subjectMarksConfig = { ...(existingStore?.subjectMarksConfig || {}), ...payload.subjectMarksConfig };
    }

    // Privileged admin-only structural synchronizations
    if (req.user.role === "admin") {
      if (Array.isArray(payload.timetable)) {
        const ttMap = new Map();
        (existingStore?.timetable || []).forEach(t => {
          if (t && t.division && t.day && t.time) ttMap.set(`${t.division}_${t.semester || ""}_${t.day}_${t.time}`, t);
        });
        payload.timetable.forEach(t => {
          if (t && t.division && t.day && t.time) ttMap.set(`${t.division}_${t.semester || ""}_${t.day}_${t.time}`, t);
        });
        update.timetable = Array.from(ttMap.values());
      }
      if (payload.timetableHeader && typeof payload.timetableHeader === "object") {
        update.timetableHeader = { ...(existingStore?.timetableHeader || {}), ...payload.timetableHeader };
      }
      if (payload.customBreakRows && typeof payload.customBreakRows === "object") {
        update.customBreakRows = { ...(existingStore?.customBreakRows || {}), ...payload.customBreakRows };
      }
      if (Array.isArray(payload.subjects)) update.subjects = payload.subjects;
      if (payload.divisions) update.divisions = normalizeStoreDivisions(payload.divisions);
    }

    await AcademicStore.findOneAndUpdate(
      { storeKey: "default_academic_store" },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Synchronize dedicated MongoDB collections in real-time via safe bulkWrite
    await syncCollectionsFromAcademicData(payload);

    res.json({ success: true, message: "Academic data permanently saved to MongoDB!" });
  } catch (error) {
    console.error("Sync academic data error:", error);
    res.status(500).json({ success: false, message: "Failed to sync academic data." });
  }
});

// SPA fallback: any non-API GET request serves index.html
app.get(/.*/, (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ success: false, message: "Endpoint not found." });
  }
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CampusSphere backend running on port ${PORT}`);
  const maskedUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  console.log(`Database Mode: MongoDB (${maskedUri})`);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
