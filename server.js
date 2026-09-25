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
const PushSubscription = require("./models/PushSubscription");
const pushService = require("./services/pushNotificationService");

// Initialize Web Push VAPID configuration
pushService.initWebPush();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/CampusSphere";
const DB_FILE = path.join(__dirname, "data", "database.json");

app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");

  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3099",
  "http://127.0.0.1:3099"
];

const configuredOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(o => o.trim()).filter(Boolean)
  : defaultAllowedOrigins;

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser or same-origin requests with no origin header (e.g. mobile, curl, Postman)
    if (!origin) return callback(null, true);
    const normalized = origin.toLowerCase();
    const isAllowed = configuredOrigins.some(allowed => {
      const a = allowed.toLowerCase();
      return a === "*" || a === normalized;
    });
    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token", "x-test-rate-limit"],
  exposedHeaders: ["Retry-After", "RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"]
};

app.use(cors(corsOptions));

// Higher body limit specifically for academic sync (allows base64 documents/notes)
app.use("/api/academic/sync", express.json({ limit: "15mb" }));

// Standard body limit for all other routes
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// In-memory rate limiter factory with sliding window and automatic cleanup
function createRateLimiter({ windowMs = 15 * 60 * 1000, maxRequests = 100, message = "Too many requests. Please try again later.", bypassInTest = false }) {
  const hits = new Map();

  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of hits.entries()) {
      if (now - record.startTime > windowMs) {
        hits.delete(ip);
      }
    }
  }, Math.min(windowMs, 60000));
  if (cleanupTimer.unref) cleanupTimer.unref();

  return function rateLimiter(req, res, next) {
    if (bypassInTest && process.env.NODE_ENV === "test" && !req.headers["x-test-rate-limit"]) {
      return next();
    }

    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    let record = hits.get(ip);

    if (!record || now - record.startTime > windowMs) {
      record = { count: 1, startTime: now };
      hits.set(ip, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.ceil((record.startTime + windowMs - now) / 1000);

    res.setHeader("RateLimit-Limit", maxRequests);
    res.setHeader("RateLimit-Remaining", remaining);
    res.setHeader("RateLimit-Reset", resetSeconds);

    if (record.count > maxRequests) {
      res.setHeader("Retry-After", resetSeconds);
      return res.status(429).json({
        success: false,
        message
      });
    }
    next();
  };
}

// 1. Auth Login Rate Limiter (25 requests per 15 min per IP)
const rateLimitLogin = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 25,
  message: "Too many login attempts. Please try again after 15 minutes."
});

// 2. User Registration Rate Limiter (30 requests per 15 min per IP)
const rateLimitRegistration = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
  message: "Too many registration attempts. Please try again later.",
  bypassInTest: true
});

// 3. Heavy / Expensive Operations Rate Limiter (60 requests per 15 min per IP)
const rateLimitExpensive = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 60,
  message: "Too many synchronization requests. Please try again later.",
  bypassInTest: true
});

// 4. General API Rate Limiter (300 requests per 15 min per IP)
const rateLimitApi = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  maxRequests: Number(process.env.RATE_LIMIT_MAX || 300),
  message: "Too many requests to the API. Please try again later.",
  bypassInTest: true
});

// Favicon handler with safe fallback to logo if favicon.ico is not found
app.get("/favicon.ico", (req, res) => {
  const icoPath = path.join(__dirname, "favicon.ico");
  if (fs.existsSync(icoPath)) {
    return res.sendFile(icoPath);
  }
  return res.sendFile(path.join(__dirname, "CampusSphere-logo.png"));
});

// Protect server-side code, configuration, database, and system files from static serving
const BLOCKED_STATIC_FILES = new Set([
  "server.js",
  "package.json",
  "package-lock.json",
  ".env",
  ".env.example",
  ".gitignore",
  "readme.md",
  "start_campussphere.bat",
  "stop_campussphere.bat"
]);

const BLOCKED_STATIC_DIRS = new Set([
  "models",
  "scripts",
  "node_modules",
  "data",
  ".vscode",
  ".git",
  ".system_generated",
  "brain"
]);

app.use((req, res, next) => {
  const reqPath = decodeURIComponent(req.path).replace(/^\/+/, "");
  const segments = reqPath.split(/[/\\]/);
  const firstSegment = (segments[0] || "").toLowerCase();
  const filename = (segments[segments.length - 1] || "").toLowerCase();

  // Prompt 29: Exempt standard PWA & Web Push static files
  if (filename === "manifest.json" || filename === "manifest.webmanifest" || filename === "service-worker.js") {
    return next();
  }

  if (BLOCKED_STATIC_DIRS.has(firstSegment)) {
    return res.status(404).json({ success: false, message: "Resource not found." });
  }

  if (BLOCKED_STATIC_FILES.has(filename) || filename.startsWith(".")) {
    return res.status(404).json({ success: false, message: "Resource not found." });
  }

  if (/\.(json|bat|md|env|lock|log|yml|yaml)$/i.test(filename)) {
    return res.status(404).json({ success: false, message: "Resource not found." });
  }

  next();
});

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

// Prompt 29: Service Worker & PWA Manifest explicit handlers
app.get("/service-worker.js", (req, res) => {
  res.set({
    "Content-Type": "application/javascript; charset=utf-8",
    "Service-Worker-Allowed": "/",
    "Cache-Control": "no-cache, no-store, must-revalidate"
  });
  res.sendFile(path.join(__dirname, "service-worker.js"));
});

app.get(["/manifest.json", "/manifest.webmanifest"], (req, res) => {
  res.set({
    "Content-Type": "application/manifest+json; charset=utf-8",
    "Cache-Control": "no-cache, no-store, must-revalidate"
  });
  res.sendFile(path.join(__dirname, "manifest.json"));
});

// Serve remaining static assets from project root
app.use(express.static(__dirname, { index: false }));


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

function isValidImageUrl(url) {
  if (!url) return true;
  const s = String(url).trim();
  if (!s) return true;
  if (/^(javascript:|vbscript:|data:text\/html)/i.test(s)) return false;
  if (/<[^>]*>/.test(s)) return false;
  if (/^(https?:\/\/|\/|\.\/|data:image\/)/i.test(s)) return true;
  return false;
}

function containsDangerousHtml(str) {
  if (!str || typeof str !== "string") return false;
  return /<[a-z\/!?[\]]|javascript:|data:text\/html/i.test(str);
}

function stripHtmlTags(str) {
  if (!str || typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "").trim();
}

function validateUserFields({ name, username, email, role, subject, subjects }) {
  if (!validRole(role)) return "Invalid account role.";
  if (!String(name || "").trim()) return "Full name is required.";
  if (/<[a-z\/!?[\]]/i.test(String(name || ""))) return "Full name cannot contain HTML or script tags.";
  if (String(name).trim().length > 100) return "Full name cannot exceed 100 characters.";
  if (!/^[A-Za-z0-9_.-]{4,30}$/.test(username || "")) return "Username must be 4–30 letters, numbers, dot, dash or underscore.";
  if (role !== "admin" && !isValidEmailAddress(normalizeEmail(email))) return "Enter a valid email address.";
  if (role === "admin" && email && !isValidEmailAddress(normalizeEmail(email))) return "Enter a valid email address.";
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

// Session Token Secret Management & Production Validation
const KNOWN_PLACEHOLDER_SECRETS = new Set([
  "your_super_secret_session_key_replace_in_production",
  "campussphere_session_secret_key_2026_secure",
  "campussphere_dev_session_secret_2026_insecure",
  "secret",
  "password",
  "123456",
  "change_me",
  "session_secret"
]);

function validateAuthConfig(env = process.env) {
  const isProd = env.NODE_ENV === "production";
  const secret = env.SESSION_SECRET;

  if (isProd) {
    if (!secret || typeof secret !== "string" || !secret.trim()) {
      return {
        valid: false,
        error: "In production (NODE_ENV=production), SESSION_SECRET must be configured with a cryptographically secure key of at least 32 characters."
      };
    }
    const trimmed = secret.trim();
    if (KNOWN_PLACEHOLDER_SECRETS.has(trimmed.toLowerCase()) || trimmed.length < 32) {
      return {
        valid: false,
        error: "In production (NODE_ENV=production), SESSION_SECRET must contain at least 32 characters and cannot be a common placeholder."
      };
    }
    return { valid: true, secret: trimmed };
  }

  if (secret && typeof secret === "string" && secret.trim()) {
    return { valid: true, secret: secret.trim() };
  }
  return { valid: true, secret: "campussphere_dev_session_secret_2026_insecure" };
}

const authConfigResult = validateAuthConfig();
if (!authConfigResult.valid) {
  console.error(`[FATAL] ${authConfigResult.error}`);
  process.exit(1);
}

const AUTH_SECRET = authConfigResult.secret;

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
      const sigBuf = Buffer.from(sig);
      const expBuf = Buffer.from(expected);
      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return { error: "invalid" };
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
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return { error: "invalid" };
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
    }).lean();
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
    await Attendance.syncIndexes().catch(err => {
      console.warn("Attendance index sync warning:", err.message);
    });

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
    }

    // Ensure administrator account exists or provision securely
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      const isProd = process.env.NODE_ENV === "production";
      if (!isProd) {
        // Development/Test mode: seed development admin account for local workflows and testing
        const adminPasswordHash = await hashPassword("admin@123");
        await User.create({
          id: "admin-001",
          role: "admin",
          name: "Administrator",
          username: "admin",
          email: "admin@smartportal.edu",
          passwordHash: adminPasswordHash
        });
        console.log("Default development admin account created in MongoDB (admin / admin@123).");
      } else {
        // Production mode: NEVER create a default account with admin@123
        const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
        if (bootstrapPassword && typeof bootstrapPassword === "string" && bootstrapPassword.trim()) {
          const trimmedPass = bootstrapPassword.trim();
          if (trimmedPass.length < 12 || trimmedPass === "admin@123" || trimmedPass.toLowerCase() === "password") {
            console.error("[FATAL] In production, ADMIN_BOOTSTRAP_PASSWORD must contain at least 12 characters and cannot be a common placeholder.");
            process.exit(1);
          }
          const bootstrapUsername = (process.env.ADMIN_BOOTSTRAP_USERNAME || "admin").trim();
          const bootstrapEmail = (process.env.ADMIN_BOOTSTRAP_EMAIL || "admin@campussphere.edu").trim();
          const adminPasswordHash = await hashPassword(trimmedPass);
          await User.create({
            id: `admin-${crypto.randomBytes(4).toString("hex")}`,
            role: "admin",
            name: "Production Administrator",
            username: bootstrapUsername,
            email: bootstrapEmail,
            passwordHash: adminPasswordHash
          });
          console.log("[SECURITY] Initial production administrator account provisioned from ADMIN_BOOTSTRAP_PASSWORD. Please remove ADMIN_BOOTSTRAP_PASSWORD from your environment once initial access is verified.");
        } else {
          console.warn("[SECURITY WARNING] No administrator account found in MongoDB. In production, configure ADMIN_BOOTSTRAP_PASSWORD to initialize the administrator, or seed an admin account via a secure administrative script.");
        }
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

// General API rate limiter for all /api endpoints
app.use("/api", rateLimitApi);

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
        const users = await User.find({}).select("-passwordHash -__v").limit(500).lean();
        return res.json({
          success: true,
          users: users.map(u => sanitizeUser(u))
        });
      }

      if (req.user.role === "faculty") {
        // Faculty receives students (with email redacted for student privacy) and their own faculty profile concurrently
        const [students, facultySelf, otherFaculty] = await Promise.all([
          User.find({ role: "student" }).select("-passwordHash -__v").limit(500).lean(),
          User.findOne({ id: req.user.id, role: "faculty" }).select("-passwordHash -__v").lean(),
          User.find({ role: "faculty", id: { $ne: req.user.id } }).select("-passwordHash -__v").limit(100).lean()
        ]);

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
        const selfUser = await User.findOne({ id: req.user.id, role: "student" }).lean();
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

app.post("/api/users/migrate", rateLimitExpensive, requireAuth(["admin"]), async (req, res) => {
  try {
    if (hasMongoOperators(req.body)) {
      return res.status(400).json({ success: false, message: "Invalid request: MongoDB operators not allowed." });
    }
    const incoming = req.body?.users;
    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
      return res.status(400).json({ success: false, message: "Invalid migration data." });
    }

    const totalIncoming = ["student", "faculty", "admin"].reduce((sum, r) => sum + (Array.isArray(incoming[r]) ? incoming[r].length : 0), 0);
    if (totalIncoming > 1000) {
      return res.status(400).json({ success: false, message: "Migration batch exceeds maximum allowed limit of 1000 users." });
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

app.post("/api/users", rateLimitRegistration, async (req, res) => {
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

    if (profilePic !== undefined && profilePic !== "" && !isValidImageUrl(profilePic)) {
      return res.status(400).json({ success: false, message: "Invalid profile picture URL format." });
    }

    if (
      containsDangerousHtml(department) ||
      containsDangerousHtml(division) ||
      containsDangerousHtml(semester) ||
      containsDangerousHtml(courseYear) ||
      containsDangerousHtml(course) ||
      containsDangerousHtml(languageChoice) ||
      containsDangerousHtml(mathChoice)
    ) {
      return res.status(400).json({ success: false, message: "Input fields cannot contain HTML or script tags." });
    }

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
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "username or email";
      return res.status(409).json({ success: false, message: `That ${field} is already in use.` });
    }
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

    const { id, name, username: incomingUser, newUsername, password, currentPassword, email, subject, subjects, subjectDivisions, department, division, semester, courseYear, course, languageChoice, mathChoice, profilePic } = req.body || {};

    const chosenNewUsername = newUsername !== undefined ? newUsername : incomingUser;

    if (name !== undefined && typeof name !== "string") return res.status(400).json({ success: false, message: "Name must be a string." });
    if (chosenNewUsername !== undefined && typeof chosenNewUsername !== "string") return res.status(400).json({ success: false, message: "Username must be a string." });
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
    const nextUsername = normalizeUsername(chosenNewUsername || user.username);
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

    if (profilePic !== undefined && profilePic !== "" && !isValidImageUrl(profilePic)) {
      return res.status(400).json({ success: false, message: "Invalid profile picture URL format." });
    }

    if (
      containsDangerousHtml(department) ||
      containsDangerousHtml(division) ||
      containsDangerousHtml(semester) ||
      containsDangerousHtml(courseYear) ||
      containsDangerousHtml(course) ||
      containsDangerousHtml(languageChoice) ||
      containsDangerousHtml(mathChoice)
    ) {
      return res.status(400).json({ success: false, message: "Input fields cannot contain HTML or script tags." });
    }

    if (nextUsername.toLowerCase() !== user.username.toLowerCase()) {
      const takenUser = await User.findOne({ username: new RegExp(`^${escapeRegex(nextUsername)}$`, "i"), id: { $ne: user.id } });
      if (takenUser) return res.status(409).json({ success: false, message: "That username is already in use." });

      // Synchronize AcademicStore keys and dedicated collections so student marks, attendance, and assignments are preserved
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
        await Attendance.updateMany({ studentUsername: user.username }, { $set: { studentUsername: nextUsername } });
        await Mark.updateMany({ studentUsername: user.username }, { $set: { studentUsername: nextUsername } });
        await Assignment.updateMany({ student: user.username }, { $set: { student: nextUsername } });
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
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "username or email";
      return res.status(409).json({ success: false, message: `That ${field} is already in use.` });
    }
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

// ============================================================================
// PROMPT 29: REAL SYSTEM-LEVEL WEB PUSH SUBSCRIPTION ENDPOINTS
// ============================================================================

app.get("/api/push/public-key", (req, res) => {
  const publicKey = pushService.getVapidPublicKey();
  if (!publicKey) {
    return res.status(503).json({
      success: false,
      message: "Web Push notifications are not configured on this server."
    });
  }
  res.json({ success: true, publicKey });
});

app.post("/api/push/subscribe", rateLimitExpensive, requireAuth(), async (req, res) => {
  try {
    const { subscription } = req.body || {};
    if (!subscription || typeof subscription !== "object") {
      return res.status(400).json({ success: false, message: "Missing or invalid subscription payload." });
    }
    const endpoint = String(subscription.endpoint || "").trim();
    if (!endpoint || !endpoint.startsWith("http")) {
      return res.status(400).json({ success: false, message: "A valid push subscription endpoint URL is required." });
    }
    if (!subscription.keys?.p256dh || !subscription.keys?.auth) {
      return res.status(400).json({ success: false, message: "Cryptographic subscription keys (p256dh, auth) are required." });
    }

    const saved = await pushService.saveSubscription(req.user, subscription, req.headers["user-agent"]);
    res.json({
      success: true,
      message: "Push notification subscription registered successfully.",
      endpoint: saved.endpoint
    });
  } catch (err) {
    console.error("Push subscribe error:", err.message);
    res.status(500).json({ success: false, message: err.message || "Failed to register push subscription." });
  }
});

const handlePushUnsubscribe = async (req, res) => {
  try {
    const endpoint = String(req.body?.endpoint || req.query?.endpoint || "").trim();
    if (!endpoint) {
      return res.status(400).json({ success: false, message: "Subscription endpoint is required for unsubscription." });
    }
    const removed = await pushService.removeSubscription(req.user, endpoint);
    res.json({
      success: true,
      message: removed ? "Unsubscribed from push notifications successfully." : "Subscription not found or already removed."
    });
  } catch (err) {
    console.error("Push unsubscribe error:", err.message);
    res.status(500).json({ success: false, message: "Failed to unsubscribe from push notifications." });
  }
};

app.delete("/api/push/subscribe", rateLimitExpensive, requireAuth(), handlePushUnsubscribe);
app.post("/api/push/unsubscribe", rateLimitExpensive, requireAuth(), handlePushUnsubscribe);

// --- Prompt 17: Timetable Dynamic Builder & Server-Side RBAC ---

const TIMETABLE_ALLOWED_FONTS = ["Arial", "Inter", "Roboto", "Times New Roman", "Georgia", "Courier New", "Outfit", "Plus Jakarta Sans"];
const TIMETABLE_ALLOWED_FONT_SIZES = ["11px", "12px", "13px", "14px", "16px", "18px", "20px"];
const TIMETABLE_ALLOWED_ALIGNMENTS = ["left", "center", "right"];
const TIMETABLE_ALLOWED_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const SUBJECT_SEMESTER_CATALOGUE = {
  // 1st Semester
  "cprog": "1st Semester", "c_programming": "1st Semester", "c programming": "1st Semester",
  "digital_electronics": "1st Semester", "digital electronics": "1st Semester",
  "dbms": "1st Semester", "ic": "1st Semester",
  "clab": "1st Semester", "dbmslab": "1st Semester", "oalab": "1st Semester",
  "maths": "1st Semester", "accountancy": "1st Semester",
  "kannada": "1st Semester", "english": "1st Semester", "hindi": "1st Semester",
  "sub-bca101": "1st Semester", "sub-cs101": "1st Semester", "sub-cs102": "1st Semester", "sub-cs103": "1st Semester",
  // 2nd Semester
  "nsm": "2nd Semester", "ds": "2nd Semester", "java": "2nd Semester", "data_structures": "2nd Semester",
  "nsmlab": "2nd Semester", "dslab": "2nd Semester", "javalab": "2nd Semester",
  "kannada_sem2": "2nd Semester", "english_sem2": "2nd Semester", "hindi_sem2": "2nd Semester",
  // 3rd Semester
  "python": "3rd Semester", "python_programming": "3rd Semester", "python programming": "3rd Semester",
  "os": "3rd Semester", "advjava": "3rd Semester",
  "ost": "3rd Semester", "evs": "3rd Semester", "oslab": "3rd Semester",
  "pythonlab": "3rd Semester", "advjavalab": "3rd Semester",
  "kannada_sem3": "3rd Semester", "english_sem3": "3rd Semester", "hindi_sem3": "3rd Semester",
  // 4th Semester
  "cn": "4th Semester", "se": "4th Semester", "webtech": "4th Semester",
  "cnlab": "4th Semester", "weblab": "4th Semester",
  "kannada_sem4": "4th Semester", "english_sem4": "4th Semester", "hindi_sem4": "4th Semester",
  // 5th Semester
  "ai": "5th Semester", "cloud": "5th Semester", "cyber": "5th Semester",
  "ailab": "5th Semester", "cloudlab": "5th Semester",
  "kannada_sem5": "5th Semester", "english_sem5": "5th Semester", "hindi_sem5": "5th Semester",
  // 6th Semester
  "ml": "6th Semester", "iot": "6th Semester", "majorproject": "6th Semester",
  "mllab": "6th Semester", "iotlab": "6th Semester",
  "kannada_sem6": "6th Semester", "english_sem6": "6th Semester", "hindi_sem6": "6th Semester"
};

function getSubjectSemester(subId) {
  if (!subId) return "";
  const norm = String(subId).trim().toLowerCase();
  const cleanNorm = norm.replace(/[\s_-]+/g, "");
  if (SUBJECT_SEMESTER_CATALOGUE[norm]) return SUBJECT_SEMESTER_CATALOGUE[norm];
  for (const [k, sem] of Object.entries(SUBJECT_SEMESTER_CATALOGUE)) {
    const cleanK = k.replace(/[\s_-]+/g, "");
    if (cleanNorm === cleanK || cleanNorm.includes(cleanK) || cleanK.includes(cleanNorm)) return sem;
  }
  if (norm.includes("sem1") || norm.includes("1st")) return "1st Semester";
  if (norm.includes("sem2") || norm.includes("2nd")) return "2nd Semester";
  if (norm.includes("sem3") || norm.includes("3rd")) return "3rd Semester";
  if (norm.includes("sem4") || norm.includes("4th")) return "4th Semester";
  if (norm.includes("sem5") || norm.includes("5th")) return "5th Semester";
  if (norm.includes("sem6") || norm.includes("6th")) return "6th Semester";
  return "";
}

function getFacultyAuthorizedScope(user) {
  if (!user || user.role !== "faculty") {
    return { isAuthorized: false, subjects: [], semesters: [], divisionsBySubject: {}, defaultDivision: "all" };
  }

  const assignedSubjects = Array.from(new Set([
    ...(Array.isArray(user.subjects) ? user.subjects : []),
    ...(user.subject ? [user.subject] : [])
  ].map(s => String(s).trim()).filter(Boolean)));

  const subjectDivs = {};
  const userSubDivs = user.subjectDivisions && typeof user.subjectDivisions === "object" ? user.subjectDivisions : {};

  assignedSubjects.forEach(sub => {
    const rawDiv = userSubDivs[sub] || user.division || "all";
    subjectDivs[sub] = rawDiv;
  });

  const authorizedSemesters = new Set();
  if (user.semester) authorizedSemesters.add(user.semester);
  assignedSubjects.forEach(sub => {
    const sem = getSubjectSemester(sub);
    if (sem) authorizedSemesters.add(sem);
  });

  return {
    isAuthorized: true,
    subjects: assignedSubjects,
    semesters: Array.from(authorizedSemesters),
    divisionsBySubject: subjectDivs,
    defaultDivision: user.division || "all"
  };
}

const CANONICAL_SUBJECT_MAP = {
  cprog: ["cprog", "c programming", "c_programming", "c prog"],
  dbms: ["dbms", "database management systems"],
  ic: ["ic", "indian constitution"],
  clab: ["clab", "c lab"],
  dbmslab: ["dbmslab", "dbms lab"],
  oalab: ["oalab", "oa lab", "office automation lab"],
  maths: ["maths", "mathematics"],
  accountancy: ["accountancy", "acc"],
  kannada: ["kannada"],
  english: ["english"],
  hindi: ["hindi"],
  nsm: ["nsm", "numerical & statistical methods", "numerical and statistical methods"],
  ds: ["ds", "data structure", "data structures"],
  java: ["java", "core java"],
  nsmlab: ["nsmlab", "nsm lab"],
  dslab: ["dslab", "ds lab"],
  javalab: ["javalab", "java lab"],
  python: ["python", "python programming"],
  os: ["os", "operating system", "operating systems"],
  advjava: ["advjava", "advance java", "advanced java", "adv java", "adv.java"],
  ost: ["ost", "open source tool", "open source tools"],
  evs: ["evs", "environmental studies"],
  oslab: ["oslab", "os lab"],
  pythonlab: ["pythonlab", "python lab"],
  advjavalab: ["advjavalab", "advance java lab", "adv java lab", "adv.java lab"],
  cn: ["cn", "computer networks", "computer network"],
  se: ["se", "software engineering"],
  webtech: ["webtech", "web technology", "web technologies"],
  cnlab: ["cnlab", "cn lab"],
  weblab: ["weblab", "web lab"],
  ai: ["ai", "artificial intelligence"],
  cloud: ["cloud", "cloud computing"],
  cyber: ["cyber", "cyber security"],
  ailab: ["ailab", "ai lab"],
  cloudlab: ["cloudlab", "cloud lab"],
  ml: ["ml", "machine learning"],
  iot: ["iot", "internet of things"],
  majorproject: ["majorproject", "major project", "project"],
  mllab: ["mllab", "ml lab"],
  iotlab: ["iotlab", "iot lab"]
};

function resolveCanonicalSubjectKey(clean) {
  if (!clean) return null;
  for (const [key, aliases] of Object.entries(CANONICAL_SUBJECT_MAP)) {
    if (clean === key) return key;
    for (const a of aliases) {
      const ca = a.replace(/[\s_.-]+/g, "");
      if (clean === ca) return key;
      if (ca.length <= 3) {
        if (clean === ca) return key;
      } else if (ca.length >= 5) {
        if (clean === ca || clean.endsWith(ca) || clean.startsWith(ca)) {
          return key;
        }
      }
    }
  }
  return null;
}

function isSameSubject(subA, subB) {
  if (!subA || !subB) return false;
  const sA = String(subA).trim().toLowerCase();
  const sB = String(subB).trim().toLowerCase();
  if (sA === sB) return true;
  const cleanA = sA.replace(/[\s_.-]+/g, "");
  const cleanB = sB.replace(/[\s_.-]+/g, "");
  if (cleanA === cleanB) return true;

  const keyA = resolveCanonicalSubjectKey(cleanA);
  const keyB = resolveCanonicalSubjectKey(cleanB);
  if (keyA && keyB && keyA === keyB) return true;

  return false;
}

function isFacultyAuthorizedForTimetable(user, semester, division) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role !== "faculty") return false;

  const scope = getFacultyAuthorizedScope(user);
  if (!scope.subjects.length) return false;

  const normTargetDiv = String(division || "").trim().toLowerCase();
  const normTargetSem = String(semester || "").trim().toLowerCase();

  return scope.subjects.some(sub => {
    const subSem = getSubjectSemester(sub);
    if (subSem && normTargetSem && subSem.toLowerCase() !== normTargetSem) {
      return false;
    }
    const divRule = String(scope.divisionsBySubject[sub] || scope.defaultDivision || "all").toLowerCase();
    if (divRule === "all" || divRule === "both divisions" || divRule === "all divisions") {
      return true;
    }
    const cleanRule = divRule.replace(/^div\s*/i, "").trim();
    const cleanTarget = normTargetDiv.replace(/^div\s*/i, "").trim();
    return (divRule === normTargetDiv || cleanRule === cleanTarget);
  });
}

function canFacultySetSubject(user, subject, semester, division) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role !== "faculty") return false;

  const cleanSub = String(subject || "").trim();
  if (!cleanSub) return true;

  const scope = getFacultyAuthorizedScope(user);
  return scope.subjects.some(assigned => {
    if (!isSameSubject(assigned, cleanSub)) {
      return false;
    }
    const divRule = String(scope.divisionsBySubject[assigned] || scope.defaultDivision || "all").toLowerCase();
    if (divRule !== "all" && divRule !== "both divisions" && divRule !== "all divisions") {
      const normDiv = String(division || "").trim().toLowerCase();
      const cleanRule = divRule.replace(/^div\s*/i, "").trim();
      const cleanTarget = normDiv.replace(/^div\s*/i, "").trim();
      if (divRule !== normDiv && cleanRule !== cleanTarget) return false;
    }
    return true;
  });
}


function validateTimetablePayload(body) {
  const { semester, division, days, timeSlots, cells } = body || {};
  if (!semester || typeof semester !== "string" || !semester.trim()) {
    return { error: "Semester is required and must be a valid string." };
  }
  if (!division || typeof division !== "string" || !division.trim()) {
    return { error: "Division is required and must be a valid string." };
  }
  if (!Array.isArray(days) || days.length === 0 || days.length > 6) {
    return { error: "Days must be an array of up to 6 fixed day labels (Monday to Saturday)." };
  }
  if (!Array.isArray(timeSlots) || timeSlots.length === 0 || timeSlots.length > 25) {
    return { error: "Time slots must be an array with 1 to 25 slot labels." };
  }
  if (cells !== undefined && !Array.isArray(cells)) {
    return { error: "Cells must be an array of grid cell items." };
  }

  const cleanDays = days.map(d => stripHtmlTags(String(d || "").trim())).filter(Boolean);
  if (cleanDays.length !== days.length) {
    return { error: "All day column labels must be non-empty strings." };
  }

  const invalidDay = cleanDays.find(d => !TIMETABLE_ALLOWED_DAYS.includes(d));
  if (invalidDay) {
    return { error: `Invalid day column '${invalidDay}'. Timetable is strictly fixed to Monday through Saturday.` };
  }

  const cleanTimeSlots = timeSlots.map(t => stripHtmlTags(String(t || "").trim())).filter(Boolean);
  if (cleanTimeSlots.length !== timeSlots.length) {
    return { error: "All time slot row labels must be non-empty strings." };
  }

  const cleanCells = [];
  if (Array.isArray(cells)) {
    for (const c of cells) {
      if (!c || typeof c !== "object") continue;
      const dayIdx = Number(c.dayIndex);
      const slotIdx = Number(c.slotIndex);
      if (isNaN(dayIdx) || dayIdx < 0 || dayIdx >= cleanDays.length) {
        return { error: `Invalid cell dayIndex: ${c.dayIndex}. Out of bounds.` };
      }
      if (isNaN(slotIdx) || slotIdx < 0 || slotIdx >= cleanTimeSlots.length) {
        return { error: `Invalid cell slotIndex: ${c.slotIndex}. Out of bounds.` };
      }

      const subject = stripHtmlTags(String(c.subject || "")).trim();
      if (subject.length > 200) {
        return { error: "Subject text exceeds maximum allowed length of 200 characters." };
      }

      const bold = Boolean(c.bold);
      const fontFamily = String(c.fontFamily || "Inter").trim();
      if (!TIMETABLE_ALLOWED_FONTS.includes(fontFamily)) {
        return { error: `Invalid fontFamily: '${fontFamily}'. Allowed: ${TIMETABLE_ALLOWED_FONTS.join(", ")}` };
      }

      const fontSize = String(c.fontSize || "14px").trim();
      if (!TIMETABLE_ALLOWED_FONT_SIZES.includes(fontSize)) {
        return { error: `Invalid fontSize: '${fontSize}'. Allowed: ${TIMETABLE_ALLOWED_FONT_SIZES.join(", ")}` };
      }

      const textAlign = String(c.textAlign || "center").trim().toLowerCase();
      if (!TIMETABLE_ALLOWED_ALIGNMENTS.includes(textAlign)) {
        return { error: `Invalid textAlign: '${textAlign}'. Allowed: ${TIMETABLE_ALLOWED_ALIGNMENTS.join(", ")}` };
      }

      const rowSpan = Math.max(1, Math.min(20, Number(c.rowSpan) || 1));
      const colSpan = Math.max(1, Math.min(20, Number(c.colSpan) || 1));

      if (dayIdx + colSpan > cleanDays.length) {
        return { error: "Cell colSpan exceeds grid day column boundaries." };
      }
      if (slotIdx + rowSpan > cleanTimeSlots.length) {
        return { error: "Cell rowSpan exceeds grid time slot row boundaries." };
      }

      let mergedInto = null;
      if (c.mergedInto && typeof c.mergedInto === "object") {
        const mDay = Number(c.mergedInto.dayIndex);
        const mSlot = Number(c.mergedInto.slotIndex);
        if (!isNaN(mDay) && !isNaN(mSlot)) {
          mergedInto = { dayIndex: mDay, slotIndex: mSlot };
        }
      }

      cleanCells.push({
        dayIndex: dayIdx,
        slotIndex: slotIdx,
        subject,
        bold,
        fontFamily,
        fontSize,
        textAlign,
        rowSpan,
        colSpan,
        mergedInto
      });
    }
  }

  return {
    semester: stripHtmlTags(String(semester).trim()),
    division: stripHtmlTags(String(division).trim()),
    days: cleanDays,
    timeSlots: cleanTimeSlots,
    cells: cleanCells
  };
}

function sanitizeTimetableForFaculty(doc, user) {
  if (!doc) return null;
  const sanitized = JSON.parse(JSON.stringify(doc));
  if (Array.isArray(sanitized.cells)) {
    sanitized.cells = sanitized.cells.map(cell => {
      if (!cell || !cell.subject) {
        return {
          ...cell,
          textAlign: "center"
        };
      }
      // Keep cell subject only if assigned to this faculty member
      if (canFacultySetSubject(user, cell.subject, sanitized.semester, sanitized.division)) {
        return {
          ...cell,
          textAlign: "center"
        };
      }
      // Redact subject belonging to other faculty members
      return {
        ...cell,
        subject: "",
        bold: false,
        textAlign: "center"
      };
    });
  }
  return sanitized;
}

app.get("/api/timetable", requireAuth(), async (req, res) => {
  try {
    const { semester, division } = req.query;

    // 1. Student role: strictly lock to authenticated user's semester & division (IDOR protection)
    if (req.user.role === "student") {
      const studentSem = req.user.semester || "1st Semester";
      const studentDiv = req.user.division || "Div A";
      const doc = await Timetable.findOne({ semester: studentSem, division: studentDiv }).select("-__v").lean();
      if (!doc) {
        return res.json({
          success: true,
          timetable: (semester || division) ? null : [],
          timetableDoc: null,
          semester: studentSem,
          division: studentDiv
        });
      }
      if (!Array.isArray(doc.days)) {
        const legacyDocs = await Timetable.find({ semester: studentSem, division: studentDiv }).select("-__v").limit(1000).lean();
        return res.json({
          success: true,
          timetable: legacyDocs,
          timetableDoc: legacyDocs[0] || null,
          semester: studentSem,
          division: studentDiv
        });
      }
      return res.json({
        success: true,
        timetable: doc,
        timetableDoc: doc,
        semester: studentSem,
        division: studentDiv
      });
    }

    // 2. Faculty role: verify scope & filter strictly to assigned subjects
    if (req.user.role === "faculty") {
      const scope = getFacultyAuthorizedScope(req.user);
      if (!scope.subjects || !scope.subjects.length) {
        return res.json({
          success: true,
          timetable: null,
          timetableDoc: null,
          message: "No assigned subjects found for this faculty member."
        });
      }

      if (semester && division) {
        if (!isFacultyAuthorizedForTimetable(req.user, semester, division)) {
          return res.status(403).json({ success: false, message: "Access forbidden: You are not authorized to view this timetable." });
        }
        const doc = await Timetable.findOne({ semester, division }).select("-__v").lean();
        const facultyDoc = sanitizeTimetableForFaculty(doc, req.user);
        return res.json({ success: true, timetable: facultyDoc || null, timetableDoc: facultyDoc || null });
      }

      // If no query parameters, return all timetables within faculty scope sanitized for this faculty
      const allDocs = await Timetable.find({}).select("-__v").limit(1000).lean();
      const authorizedDocs = allDocs
        .filter(doc => isFacultyAuthorizedForTimetable(req.user, doc.semester, doc.division))
        .map(doc => sanitizeTimetableForFaculty(doc, req.user));
      return res.json({ success: true, timetable: authorizedDocs, timetableDoc: authorizedDocs[0] || null });
    }

    // 3. Admin role: unrestricted
    if (req.user.role === "admin") {
      if (semester && division) {
        const doc = await Timetable.findOne({ semester, division }).select("-__v").lean();
        return res.json({
          success: true,
          timetable: doc || null,
          timetableDoc: doc || null
        });
      }

      const filter = {};
      if (semester) filter.semester = semester;
      if (division) filter.division = division;
      const docs = await Timetable.find(filter).select("-__v").limit(1000).lean();
      return res.json({
        success: true,
        timetable: docs,
        timetableDoc: docs[0] || null
      });
    }

    return res.status(403).json({ success: false, message: "Access forbidden." });
  } catch (error) {
    console.error("Fetch timetable error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch timetable." });
  }
});

app.get("/api/timetable/faculty-view", requireAuth(["faculty", "admin"]), async (req, res) => {
  try {
    let subjects = [];
    if (req.user.role === "admin") {
      subjects = Object.keys(SUBJECT_SEMESTER_CATALOGUE);
    } else {
      const scope = getFacultyAuthorizedScope(req.user);
      subjects = scope.subjects;
      // If query param 'subject' was requested by faculty, verify it is in their scope
      if (req.query.subject) {
        const requestedSub = String(req.query.subject).trim().toLowerCase().replace(/[\s_-]+/g, "");
        const isAllowed = scope.subjects.some(s => s.toLowerCase().replace(/[\s_-]+/g, "") === requestedSub);
        if (!isAllowed) {
          return res.status(403).json({ success: false, message: "Access forbidden: You are not authorized to view this subject schedule." });
        }
        subjects = scope.subjects.filter(s => s.toLowerCase().replace(/[\s_-]+/g, "") === requestedSub);
      }
    }
    if (!subjects || !subjects.length) {
      return res.json({ success: true, facultyView: [] });
    }

    const allDocs = await Timetable.find({}).select("-__v").lean();
    const facultyViewList = [];

    for (const sub of subjects) {
      const cleanSub = sub.toLowerCase();
      const normSub = cleanSub.replace(/[\s_-]+/g, "");
      const slotMap = new Map();

      for (const tt of allDocs) {
        if (!tt.days || !tt.timeSlots || !Array.isArray(tt.cells)) continue;
        for (const cell of tt.cells) {
          if (!cell || !cell.subject) continue;
          const cellSub = String(cell.subject).trim().toLowerCase();
          const normCellSub = cellSub.replace(/[\s_-]+/g, "");
          if (normCellSub === normSub || normCellSub.includes(normSub) || normSub.includes(normCellSub)) {
            const dayName = tt.days[cell.dayIndex] || `Day ${cell.dayIndex + 1}`;
            const timeName = tt.timeSlots[cell.slotIndex] || `Slot ${cell.slotIndex + 1}`;
            const key = `${tt.semester}__${dayName}__${timeName}`;

            if (!slotMap.has(key)) {
              slotMap.set(key, {
                subject: cell.subject,
                semester: tt.semester,
                day: dayName,
                time: timeName,
                dayIndex: cell.dayIndex,
                slotIndex: cell.slotIndex,
                divisions: [tt.division]
              });
            } else {
              const existing = slotMap.get(key);
              if (!existing.divisions.includes(tt.division)) {
                existing.divisions.push(tt.division);
              }
            }
          }
        }
      }

      for (const item of slotMap.values()) {
        const sortedDivs = item.divisions.sort();
        facultyViewList.push({
          subject: item.subject,
          semester: item.semester,
          day: item.day,
          time: item.time,
          dayIndex: item.dayIndex,
          slotIndex: item.slotIndex,
          divisions: sortedDivs,
          divisionLabel: sortedDivs.join(" + "),
          divisionsLabel: sortedDivs.join(" + ")
        });
      }
    }

    res.json({ success: true, facultyView: facultyViewList });
  } catch (error) {
    console.error("Fetch faculty view timetable error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch faculty timetable view." });
  }
});

async function handleSaveTimetable(req, res) {
  try {
    const validated = validateTimetablePayload(req.body);
    if (validated.error) {
      return res.status(400).json({ success: false, message: validated.error });
    }

    const { semester, division, days, timeSlots, cells } = validated;

    // Faculty authorization verification
    if (req.user.role === "faculty") {
      if (!isFacultyAuthorizedForTimetable(req.user, semester, division)) {
        return res.status(403).json({ success: false, message: "Access forbidden: You are not authorized to manage timetable for this Semester and Division." });
      }

      // Check existing document to prevent faculty from modifying other subjects' cells
      const existing = await Timetable.findOne({ semester, division }).lean();

      // 1. Faculty can ONLY author/assign subjects that are authorized for them
      for (const c of cells) {
        if (!c.subject) continue;
        const matchingExisting = existing && Array.isArray(existing.cells)
          ? existing.cells.find(ec => ec.dayIndex === c.dayIndex && ec.slotIndex === c.slotIndex)
          : null;
        const isUnchangedSubject = matchingExisting && isSameSubject(matchingExisting.subject, c.subject);
        if (!isUnchangedSubject && !canFacultySetSubject(req.user, c.subject, semester, division)) {
          return res.status(403).json({
            success: false,
            message: `Access forbidden: You are not authorized to assign subject '${c.subject}'.`
          });
        }
      }

      // 2. Protect existing cells belonging to other faculty members
      if (existing && Array.isArray(existing.cells)) {
        for (const ec of existing.cells) {
          if (ec.subject && !canFacultySetSubject(req.user, ec.subject, semester, division)) {
            const matchingNewCell = cells.find(nc => nc.dayIndex === ec.dayIndex && nc.slotIndex === ec.slotIndex);
            if (matchingNewCell) {
              if (matchingNewCell.subject && !isSameSubject(matchingNewCell.subject, ec.subject)) {
                return res.status(403).json({
                  success: false,
                  message: `Access forbidden: You cannot overwrite subject '${ec.subject}' belonging to another faculty member.`
                });
              }
              // Safely preserve other faculty member's existing cell content
              matchingNewCell.subject = ec.subject;
              matchingNewCell.bold = ec.bold;
              matchingNewCell.fontFamily = ec.fontFamily;
              matchingNewCell.fontSize = ec.fontSize;
              matchingNewCell.textAlign = "center";
              matchingNewCell.rowSpan = ec.rowSpan || 1;
              matchingNewCell.colSpan = ec.colSpan || 1;
              matchingNewCell.mergedInto = ec.mergedInto || null;
            } else {
              cells.push(ec);
            }
          }
        }
      }
    }

    const updated = await Timetable.findOneAndUpdate(
      { semester, division },
      { $set: { semester, division, days, timeSlots, cells } },
      { upsert: true, returnDocument: "after", runValidators: true }
    );

    const returnDoc = req.user.role === "faculty"
      ? sanitizeTimetableForFaculty(updated.toObject ? updated.toObject() : updated, req.user)
      : updated;

    res.json({ success: true, message: "Timetable saved successfully.", timetable: returnDoc });
  } catch (error) {
    console.error("Save timetable error:", error);
    res.status(500).json({ success: false, message: "Failed to save timetable." });
  }
}

app.post("/api/timetable", rateLimitExpensive, requireAuth(["faculty", "admin"]), handleSaveTimetable);
app.put("/api/timetable", rateLimitExpensive, requireAuth(["faculty", "admin"]), handleSaveTimetable);

app.delete("/api/timetable", rateLimitExpensive, requireAuth(["faculty", "admin"]), async (req, res) => {
  try {
    const semester = stripHtmlTags(String(req.query.semester || "").trim());
    const division = stripHtmlTags(String(req.query.division || "").trim());

    if (!semester || !division) {
      return res.status(400).json({ success: false, message: "Both semester and division are required to delete a timetable." });
    }

    if (req.user.role === "faculty") {
      if (!isFacultyAuthorizedForTimetable(req.user, semester, division)) {
        return res.status(403).json({ success: false, message: "Access forbidden: You are not authorized to delete this timetable." });
      }
    }

    const delResult = await Timetable.deleteOne({ semester, division });
    if (delResult.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "No timetable found for the specified Semester and Division." });
    }

    res.json({ success: true, message: "Timetable deleted successfully." });
  } catch (error) {
    console.error("Delete timetable error:", error);
    res.status(500).json({ success: false, message: "Failed to delete timetable." });
  }
});

// Backward compatibility endpoint for legacy slot sync
app.post("/api/timetable/sync", rateLimitExpensive, requireAuth(["faculty", "admin"]), async (req, res) => {
  try {
    const { timetable } = req.body || {};
    if (!timetable || !Array.isArray(timetable)) {
      return res.status(400).json({ success: false, message: "Timetable must be an array of schedule entries." });
    }
    if (timetable.length > 1000) {
      return res.status(400).json({ success: false, message: "Timetable exceeds maximum allowed limit of 1000 entries." });
    }

    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const validEntries = [];

    for (const item of timetable) {
      if (!item || typeof item !== "object") continue;
      const division = stripHtmlTags(String(item.division || "Div A"));
      const semester = stripHtmlTags(String(item.semester || "1st Semester"));
      const day = stripHtmlTags(String(item.day || ""));
      const time = stripHtmlTags(String(item.time || ""));
      const subject = stripHtmlTags(String(item.subject || ""));
      const subjectText = stripHtmlTags(String(item.subjectText || item.subject || "Class"));
      const faculty = stripHtmlTags(String(item.faculty || ""));

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
    }

    res.json({ success: true, message: "Timetable synchronized safely." });
  } catch (error) {
    console.error("Sync timetable error:", error);
    res.status(500).json({ success: false, message: "Failed to sync timetable." });
  }
});



// --- Attendance Validation & Authorization Helpers ---

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

function validateAttendanceDate(dateStr, isoDateStr) {
  const target = (isoDateStr || dateStr || "").trim();
  if (!target) {
    return { valid: false, error: "Attendance date is required." };
  }
  let y, m, d;

  if (/^\d{4}-\d{2}-\d{2}$/.test(target)) {
    const parts = target.split("-").map(Number);
    y = parts[0];
    m = parts[1];
    d = parts[2];
  } else if (/^\d{2}-\d{2}-\d{2,4}$/.test(target)) {
    const parts = target.split("-").map(Number);
    d = parts[0];
    m = parts[1];
    y = parts[2] < 100 ? parts[2] + 2000 : parts[2];
  } else {
    return { valid: false, error: "Invalid date format. Expected YYYY-MM-DD or DD-MM-YY." };
  }

  if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) {
    return { valid: false, error: "Impossible calendar date: month or day out of bounds." };
  }

  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  if (d > daysInMonth) {
    return { valid: false, error: `Invalid calendar date: Month ${m} has only ${daysInMonth} days.` };
  }

  const entryDate = new Date(Date.UTC(y, m - 1, d));
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  if (entryDate > tomorrow) {
    return { valid: false, error: "Attendance date cannot be in the future." };
  }

  const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const display = `${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${String(y).slice(-2)}`;

  return { valid: true, isoDate: iso, date: display };
}

function normalizeAttendanceStatus(status) {
  if (status === null || status === undefined) return null;
  const s = String(status).trim().toUpperCase();
  if (s === "P" || s === "PRESENT") return "P";
  if (s === "A" || s === "ABSENT") return "A";
  return null;
}

function validateAttendanceRecords(records) {
  if (!records || typeof records !== "object" || Array.isArray(records)) {
    return { valid: false, error: "Attendance records must be an object mapping student usernames to statuses." };
  }
  const normalized = {};
  for (const [username, status] of Object.entries(records)) {
    const cleanUser = String(username).trim();
    if (!cleanUser || cleanUser.length < 2 || cleanUser.length > 50 || cleanUser.includes("$") || /<[^>]+>/.test(cleanUser)) {
      return { valid: false, error: `Invalid student username in attendance records: ${cleanUser}` };
    }
    const normStatus = normalizeAttendanceStatus(status);
    if (!normStatus) {
      return { valid: false, error: `Invalid attendance status '${status}' for student ${cleanUser}. Allowed values: P, A, Present, Absent.` };
    }
    normalized[cleanUser] = normStatus;
  }
  return { valid: true, records: normalized };
}

function validateFacultyAttendanceAuthorization(user, subject, division, semester) {
  if (!user) return { authorized: false, reason: "Authentication required." };
  if (user.role === "admin") return { authorized: true };
  if (user.role !== "faculty") return { authorized: false, reason: "Requires faculty or admin role." };

  const cleanSub = String(subject || "").trim();
  if (!cleanSub) return { authorized: false, reason: "Subject is required." };

  const scope = getFacultyAuthorizedScope(user);
  if (!scope.subjects || scope.subjects.length === 0) {
    return { authorized: false, reason: "Faculty has no assigned subjects." };
  }

  const isAssignedSubject = scope.subjects.some(assigned => isSameSubject(assigned, cleanSub));
  if (!isAssignedSubject) {
    return { authorized: false, reason: `Faculty is not authorized to manage attendance for unassigned subject: ${cleanSub}` };
  }

  // Division check
  if (division) {
    const normDiv = String(division).trim().toLowerCase();
    const cleanTargetDiv = normDiv.replace(/^div\s*/i, "").trim();

    const matchedSubject = scope.subjects.find(assigned => isSameSubject(assigned, cleanSub));
    const divRule = String(scope.divisionsBySubject[matchedSubject] || scope.defaultDivision || "all").toLowerCase();

    if (divRule !== "all" && divRule !== "both divisions" && divRule !== "all divisions") {
      const cleanRule = divRule.replace(/^div\s*/i, "").trim();
      if (divRule !== normDiv && cleanRule !== cleanTargetDiv) {
        return { authorized: false, reason: `Faculty is not authorized to manage attendance for division: ${division}` };
      }
    }
  }

  // Semester check
  if (semester) {
    const normSem = String(semester).trim().toLowerCase();
    const cleanTargetSem = normSem.replace(/[\s_-]+/g, "");
    const matchedSubject = scope.subjects.find(assigned => isSameSubject(assigned, cleanSub));
    const assignedSem = getSubjectSemester(matchedSubject) || user.semester;
    if (assignedSem) {
      const normAssignedSem = String(assignedSem).trim().toLowerCase().replace(/[\s_-]+/g, "");
      if (normAssignedSem && cleanTargetSem && normAssignedSem !== cleanTargetSem) {
        return { authorized: false, reason: `Faculty is not authorized to manage attendance for semester: ${semester}` };
      }
    }
  }

  return { authorized: true };
}

function recalculateOverallAttendance(dailyAttendance = [], students = {}, targetSubject = null) {
  if (!Array.isArray(dailyAttendance) || !students || typeof students !== "object") return;

  // Auto-vivify student entry for any user present in dailyAttendance
  dailyAttendance.forEach(log => {
    if (log && log.records && typeof log.records === "object") {
      Object.keys(log.records).forEach(u => {
        const cleanU = String(u).trim();
        if (cleanU && !students[cleanU]) {
          students[cleanU] = { marks: {}, attendance: {} };
        }
      });
    }
  });

  for (const [username, studentRec] of Object.entries(students)) {
    if (!studentRec || typeof studentRec !== "object") continue;
    if (!studentRec.attendance || typeof studentRec.attendance !== "object") {
      studentRec.attendance = {};
    }

    const countsBySubject = {};
    dailyAttendance.forEach(log => {
      if (!log || !log.subject || !log.records || typeof log.records !== "object") return;
      if (targetSubject && !isSameSubject(log.subject, targetSubject)) return;

      const subKey = String(log.subject).trim();
      let status = "";
      for (const [rUser, rVal] of Object.entries(log.records)) {
        if (String(rUser).trim().toLowerCase() === username.trim().toLowerCase()) {
          status = normalizeAttendanceStatus(rVal);
          break;
        }
      }
      if (status) {
        if (!countsBySubject[subKey]) countsBySubject[subKey] = { total: 0, present: 0 };
        countsBySubject[subKey].total++;
        if (status === "P") countsBySubject[subKey].present++;
      }
    });

    for (const [subKey, counts] of Object.entries(countsBySubject)) {
      if (counts.total > 0) {
        studentRec.attendance[subKey] = Math.round((counts.present / counts.total) * 100);
      }
    }
  }
}

// --- Dedicated RESTful Attendance API Endpoints ---

// GET /api/attendance
app.get("/api/attendance", requireAuth(), async (req, res) => {
  try {
    const { semester, division, subject, date, isoDate, studentUsername } = req.query;

    // 1. Student role: IDOR lockdown to authenticated student profile
    if (req.user.role === "student") {
      const normStudent = req.user.username.trim().toLowerCase();

      const query = {
        $or: [
          { studentUsername: new RegExp(`^${escapeRegex(req.user.username)}$`, "i") },
          { [`records.${req.user.username}`]: { $exists: true } }
        ]
      };
      if (subject) query.subject = subject;

      let docs = await Attendance.find(query).sort({ date: -1, createdAt: -1 }).lean();

      if (!docs || docs.length === 0) {
        const store = await AcademicStore.findOne({ storeKey: "default_academic_store" }).lean();
        docs = (store?.dailyAttendance || []).filter(a => {
          if (!a) return false;
          if (subject && !isSameSubject(a.subject, subject)) return false;
          const hasRec = a.records && typeof a.records === "object" &&
            Object.keys(a.records).some(k => String(k).toLowerCase() === normStudent);
          return hasRec || (a.studentUsername && String(a.studentUsername).toLowerCase() === normStudent);
        });
      }

      // Strictly redact other students' attendance data
      const scoped = docs.map(doc => {
        const item = { ...doc };
        if (item.records && typeof item.records === "object") {
          let st = "";
          for (const [k, v] of Object.entries(item.records)) {
            if (String(k).toLowerCase() === normStudent) {
              st = v;
              break;
            }
          }
          item.records = { [req.user.username]: st };
        }
        item.studentUsername = req.user.username;
        return item;
      });

      return res.json({ success: true, attendance: scoped });
    }

    // 2. Faculty role: scope strictly to assigned subjects and divisions
    if (req.user.role === "faculty") {
      if (subject) {
        const authCheck = validateFacultyAttendanceAuthorization(req.user, subject, division, semester);
        if (!authCheck.authorized) {
          return res.status(403).json({ success: false, message: authCheck.reason });
        }
      }
      if (division) {
        const authCheck = validateFacultyAttendanceAuthorization(req.user, subject || req.user.subject, division, semester);
        if (!authCheck.authorized) {
          return res.status(403).json({ success: false, message: authCheck.reason });
        }
      }

      const scope = getFacultyAuthorizedScope(req.user);
      const query = {};
      if (subject) {
        query.subject = subject;
      } else {
        query.subject = { $in: scope.subjects };
      }
      if (division) query.division = division;
      if (semester) query.semester = semester;
      if (isoDate || date) query.$or = [{ isoDate: isoDate || date }, { date: date || isoDate }];

      let docs = await Attendance.find(query).sort({ date: -1, createdAt: -1 }).lean();

      if (!docs || docs.length === 0) {
        const store = await AcademicStore.findOne({ storeKey: "default_academic_store" }).lean();
        docs = (store?.dailyAttendance || []).filter(a => {
          if (!a || !a.subject) return false;
          if (subject && !isSameSubject(a.subject, subject)) return false;
          if (division && a.division !== division) return false;
          if (semester && a.semester !== semester) return false;
          return canFacultySetSubject(req.user, a.subject, a.semester, a.division);
        });
      }

      return res.json({ success: true, attendance: docs });
    }

    // 3. Admin role: full attendance administration
    if (req.user.role === "admin") {
      const query = {};
      if (subject) query.subject = subject;
      if (division) query.division = division;
      if (semester) query.semester = semester;
      if (studentUsername) query.$or = [{ studentUsername }, { [`records.${studentUsername}`]: { $exists: true } }];
      if (isoDate || date) query.$or = [{ isoDate: isoDate || date }, { date: date || isoDate }];

      let docs = await Attendance.find(query).sort({ date: -1, createdAt: -1 }).lean();
      if (!docs || docs.length === 0) {
        const store = await AcademicStore.findOne({ storeKey: "default_academic_store" }).lean();
        docs = (store?.dailyAttendance || []).filter(a => {
          if (!a) return false;
          if (subject && !isSameSubject(a.subject, subject)) return false;
          if (division && a.division !== division) return false;
          if (semester && a.semester !== semester) return false;
          return true;
        });
      }

      return res.json({ success: true, attendance: docs });
    }

    return res.status(403).json({ success: false, message: "Access forbidden." });
  } catch (error) {
    console.error("Fetch attendance error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch attendance." });
  }
});

// Common handler for POST and PUT /api/attendance
async function handleSaveAttendance(req, res) {
  try {
    if (hasMongoOperators(req.body)) {
      return res.status(400).json({ success: false, message: "MongoDB operators are not permitted." });
    }

    const {
      id,
      attendanceId,
      subject,
      division,
      semester,
      courseYear,
      date,
      isoDate,
      records,
      status,
      studentUsername,
      facultyUsername
    } = req.body || {};

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return res.status(400).json({ success: false, message: "Subject is required." });
    }
    if (!division || typeof division !== "string" || !division.trim()) {
      return res.status(400).json({ success: false, message: "Division is required." });
    }
    if (!semester || typeof semester !== "string" || !semester.trim()) {
      return res.status(400).json({ success: false, message: "Semester is required." });
    }

    // Date validation
    const dateRes = validateAttendanceDate(date, isoDate);
    if (!dateRes.valid) {
      return res.status(400).json({ success: false, message: dateRes.error });
    }

    // Status / Records validation
    let validatedRecords = {};
    if (records && typeof records === "object") {
      const recRes = validateAttendanceRecords(records);
      if (!recRes.valid) {
        return res.status(400).json({ success: false, message: recRes.error });
      }
      validatedRecords = recRes.records;
    }

    let topStatus = "";
    if (status !== undefined && status !== "") {
      const normSt = normalizeAttendanceStatus(status);
      if (!normSt) {
        return res.status(400).json({ success: false, message: `Invalid attendance status '${status}'. Allowed values: P, A, Present, Absent.` });
      }
      topStatus = normSt === "P" ? "Present" : "Absent";
    }

    // Role authorization
    if (req.user.role === "faculty") {
      const auth = validateFacultyAttendanceAuthorization(req.user, subject, division, semester);
      if (!auth.authorized) {
        return res.status(403).json({ success: false, message: auth.reason });
      }
    }

    // Stable deterministic attendanceId
    const cleanSub = stripHtmlTags(subject).trim();
    const cleanDiv = stripHtmlTags(division).trim();
    const cleanSem = stripHtmlTags(semester).trim();
    const cleanYear = stripHtmlTags(courseYear || "").trim();

    const targetAttId = attendanceId || id ||
      ("att_" + crypto.createHash("sha256").update(`${dateRes.isoDate}_${cleanSub}_${cleanDiv}_${cleanSem}`).digest("hex").slice(0, 16));

    const facultyUser = req.user.role === "faculty" ? req.user.username : (stripHtmlTags(facultyUsername || "admin"));

    // Capture previous state to ensure idempotency and prevent duplicate pushes on identical saves
    const prevAtt = await Attendance.findOne(
      { $or: [{ attendanceId: targetAttId }, { subject: cleanSub, division: cleanDiv, semester: cleanSem, isoDate: dateRes.isoDate }] }
    ).lean();

    // 1. Non-destructive update in dedicated Attendance collection
    const attDoc = await Attendance.findOneAndUpdate(
      { $or: [{ attendanceId: targetAttId }, { subject: cleanSub, division: cleanDiv, semester: cleanSem, isoDate: dateRes.isoDate }] },
      {
        $set: {
          id: targetAttId,
          attendanceId: targetAttId,
          subject: cleanSub,
          division: cleanDiv,
          semester: cleanSem,
          courseYear: cleanYear,
          date: dateRes.date,
          isoDate: dateRes.isoDate,
          records: validatedRecords,
          studentUsername: studentUsername ? stripHtmlTags(studentUsername) : "",
          status: topStatus,
          facultyUsername: facultyUser
        }
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    // 2. Synchronize AcademicStore.dailyAttendance
    const store = await AcademicStore.findOne({ storeKey: "default_academic_store" });
    if (store) {
      const daily = store.dailyAttendance || [];
      const existingIdx = daily.findIndex(d =>
        (d && (d.id === targetAttId || d.attendanceId === targetAttId)) ||
        (d && isSameSubject(d.subject, cleanSub) && d.division === cleanDiv && d.semester === cleanSem && (d.isoDate === dateRes.isoDate || d.date === dateRes.date))
      );

      const entryToSave = {
        id: targetAttId,
        attendanceId: targetAttId,
        subject: cleanSub,
        division: cleanDiv,
        semester: cleanSem,
        courseYear: cleanYear,
        date: dateRes.date,
        isoDate: dateRes.isoDate,
        records: validatedRecords,
        studentUsername: studentUsername ? stripHtmlTags(studentUsername) : "",
        status: topStatus,
        facultyUsername: facultyUser,
        updatedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        daily[existingIdx] = entryToSave;
      } else {
        daily.push(entryToSave);
      }
      store.dailyAttendance = daily;

      // Recalculate student overall percentages
      if (store.students) {
        recalculateOverallAttendance(daily, store.students, cleanSub);
        store.markModified("students");
      }
      store.markModified("dailyAttendance");
      await store.save();
    }

    // Prompt 29: Immediate Web Push Notification for Present attendance
    pushService.notifyAttendance({
      subject: cleanSub,
      date: dateRes.date,
      isoDate: dateRes.isoDate,
      attendanceId: targetAttId,
      records: validatedRecords,
      singleStudent: studentUsername ? stripHtmlTags(studentUsername) : "",
      singleStatus: topStatus,
      prevRecords: prevAtt?.records,
      prevSingleStatus: prevAtt?.status
    }).catch(pushErr => console.warn("[WebPush] notifyAttendance async error:", pushErr.message));

    res.json({ success: true, message: "Attendance saved successfully.", attendance: attDoc });
  } catch (error) {
    console.error("Save attendance error:", error);
    res.status(500).json({ success: false, message: "Failed to save attendance." });
  }
}

app.post("/api/attendance", rateLimitExpensive, requireAuth(["faculty", "admin"]), handleSaveAttendance);
app.put("/api/attendance", rateLimitExpensive, requireAuth(["faculty", "admin"]), handleSaveAttendance);
app.put("/api/attendance/:id", rateLimitExpensive, requireAuth(["faculty", "admin"]), handleSaveAttendance);

// DELETE /api/attendance/:id and DELETE /api/attendance
async function handleDeleteAttendance(req, res) {
  try {
    const targetId = String(req.params.id || req.body?.attendanceId || req.body?.id || req.query.id || "").trim();
    if (!targetId) {
      return res.status(400).json({ success: false, message: "Attendance ID is required for deletion." });
    }

    let doc = await Attendance.findOne({ $or: [{ attendanceId: targetId }, { id: targetId }] }).lean();
    const store = await AcademicStore.findOne({ storeKey: "default_academic_store" });
    const storeEntry = (store?.dailyAttendance || []).find(d => d && (d.id === targetId || d.attendanceId === targetId));

    if (!doc && !storeEntry) {
      return res.status(404).json({ success: false, message: "Attendance record not found." });
    }

    const recSubject = doc?.subject || storeEntry?.subject || "";
    const recDiv = doc?.division || storeEntry?.division || "";
    const recSem = doc?.semester || storeEntry?.semester || "";

    if (req.user.role === "faculty") {
      const auth = validateFacultyAttendanceAuthorization(req.user, recSubject, recDiv, recSem);
      if (!auth.authorized) {
        return res.status(403).json({ success: false, message: auth.reason });
      }
    }

    await Attendance.deleteMany({ $or: [{ attendanceId: targetId }, { id: targetId }] });

    if (store) {
      store.dailyAttendance = (store.dailyAttendance || []).filter(d => !d || (d.id !== targetId && d.attendanceId !== targetId));
      if (store.students) {
        recalculateOverallAttendance(store.dailyAttendance, store.students, recSubject);
        store.markModified("students");
      }
      store.markModified("dailyAttendance");
      await store.save();
    }

    res.json({ success: true, message: "Attendance record deleted successfully." });
  } catch (error) {
    console.error("Delete attendance error:", error);
    res.status(500).json({ success: false, message: "Failed to delete attendance." });
  }
}

app.delete("/api/attendance/:id", rateLimitExpensive, requireAuth(["faculty", "admin"]), handleDeleteAttendance);
app.delete("/api/attendance", rateLimitExpensive, requireAuth(["faculty", "admin"]), handleDeleteAttendance);



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
    let store = await AcademicStore.findOne({ storeKey: "default_academic_store" }).lean();
    if (!store) {
      const created = await AcademicStore.create({ storeKey: "default_academic_store" });
      store = created.toObject ? created.toObject() : created;
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
      const isUniversalDiv = (d) => !d || d === "all" || d === "All Divisions" || d === "Both Divisions";

      const scopedNotices = (store.notices || []).filter(n => {
        if (!n.target || n.target === "all" || n.target === "student") {
          if (!isUniversalDiv(n.targetDivision) && studentDiv && n.targetDivision !== studentDiv) return false;
          return true;
        }
        return false;
      });

      const scopedAssignments = (store.assignments || []).filter(a => {
        if (a.student && a.student.toLowerCase() === normUsername) return true;
        if (a.student === "all") {
          if (!isUniversalDiv(a.targetDivision) && studentDiv && a.targetDivision !== studentDiv) return false;
          return true;
        }
        return false;
      });

      const scopedNotes = (store.notes || []).filter(n => {
        if (isUniversalDiv(n.division) || (studentDiv && n.division === studentDiv)) return true;
        return false;
      });

      // Redact other students' records from daily attendance logs
      const scopedAttendance = (store.dailyAttendance || [])
        .filter(att => {
          if (!att) return false;
          const hasStudentInRecords = att.records && typeof att.records === "object" &&
            Object.keys(att.records).some(k => String(k).toLowerCase() === normUsername);
          if (hasStudentInRecords) return true;
          if (att.studentUsername && String(att.studentUsername).toLowerCase() === normUsername) return true;
          if (studentDiv && att.division && !isUniversalDiv(att.division) && att.division !== studentDiv) return false;
          if (req.user.semester && att.semester && att.semester !== req.user.semester) return false;
          return true;
        })
        .map(att => {
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
          if (logObj.studentUsername && String(logObj.studentUsername).toLowerCase() !== normUsername) {
            logObj.studentUsername = username;
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

    // Faculty role: scope dailyAttendance to authorized subjects & divisions
    if (req.user.role === "faculty") {
      const scope = getFacultyAuthorizedScope(req.user);
      const facultyAttendance = (store.dailyAttendance || []).filter(att => {
        if (!att || !att.subject) return false;
        return canFacultySetSubject(req.user, att.subject, att.semester, att.division);
      });

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
          deletedDailyAttendance: store.deletedDailyAttendance || [],
          dailyAttendance: facultyAttendance,
          subjectMarksConfig: store.subjectMarksConfig || {},
          subjects: store.subjects || [],
          divisions: normalizeStoreDivisions(store.divisions)
        }
      });
    }

    // Admin role: return complete operational store data
    if (req.user.role === "admin") {
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
          deletedDailyAttendance: store.deletedDailyAttendance || [],
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
                    title: stripHtmlTags(n.title) || "Untitled Notice",
                    text: stripHtmlTags(n.text || n.content || ""),
                    content: stripHtmlTags(n.content || n.text || ""),
                    date: n.date || new Date().toISOString().slice(0, 10),
                    target: n.target || "all",
                    postedBy: stripHtmlTags(n.postedBy || n.authorName || (n.authorRole === "admin" ? "Admin" : "Faculty")),
                    postedByName: stripHtmlTags(n.postedByName || n.authorName || "Faculty"),
                    authorRole: n.authorRole || (n.postedBy === "admin" ? "admin" : "faculty"),
                    authorName: stripHtmlTags(n.authorName || n.postedByName || "Faculty"),
                    targetRole: n.targetRole || n.target || "all",
                    targetDivision: n.targetDivision || "all",
                    targetSemester: n.targetSemester || "all",
                    fileName: stripHtmlTags(n.fileName || ""),
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

      // Explicit attendance deletion (only when explicitly requested)
      const delDailyList = [
        ...(Array.isArray(payload.deletedDailyAttendance) ? payload.deletedDailyAttendance : []),
        ...(Array.isArray(payload.deletedAttendance) ? payload.deletedAttendance : [])
      ].map(id => String(id).trim()).filter(Boolean);
      if (delDailyList.length > 0) {
        await Attendance.deleteMany({ $or: [{ attendanceId: { $in: delDailyList } }, { id: { $in: delDailyList } }] });
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
                    title: stripHtmlTags(as.title) || "Untitled Assignment",
                    description: stripHtmlTags(as.description || ""),
                    subject: as.subject || "",
                    student: as.student || "",
                    targetDivision: as.targetDivision || "",
                    fileName: stripHtmlTags(as.fileName || ""),
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
                    title: stripHtmlTags(n.title) || "Untitled Note",
                    division: stripHtmlTags(n.division || "All Divisions"),
                    fileName: stripHtmlTags(n.fileName || ""),
                    fileData: n.fileData || "",
                    uploadedBy: n.uploadedBy || "",
                    uploadedByName: stripHtmlTags(n.uploadedByName || "Faculty"),
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
    } catch (syncErr) {
      console.warn("Collection sync helper warning:", syncErr.message);
    }
  });
}

app.post("/api/academic/sync", rateLimitExpensive, requireAuth(["faculty", "admin"]), async (req, res) => {
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
    if (payload.deletedDailyAttendance !== undefined && !Array.isArray(payload.deletedDailyAttendance)) {
      return res.status(400).json({ success: false, message: "Invalid deletedDailyAttendance payload format: Expected an array." });
    }
    if (payload.deletedAttendance !== undefined && !Array.isArray(payload.deletedAttendance)) {
      return res.status(400).json({ success: false, message: "Invalid deletedAttendance payload format: Expected an array." });
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

    // Input bounds validation to prevent memory exhaustion
    const MAX_LIMITS = {
      notices: 500,
      dailyAttendance: 5000,
      deletedDailyAttendance: 1000,
      deletedAttendance: 1000,
      assignments: 1000,
      notes: 1000,
      timetable: 1000,
      deletedNotices: 500,
      deletedAssignments: 1000,
      deletedNotes: 1000
    };
    for (const [key, max] of Object.entries(MAX_LIMITS)) {
      if (Array.isArray(payload[key]) && payload[key].length > max) {
        return res.status(400).json({
          success: false,
          message: `Academic sync payload exceeds maximum allowed items for ${key} (max ${max}).`
        });
      }
    }
    if (payload.students && typeof payload.students === "object" && Object.keys(payload.students).length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Academic sync payload exceeds maximum allowed students (max 2000)."
      });
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
        title: stripHtmlTags(n.title),
        text: stripHtmlTags(n.text),
        content: stripHtmlTags(n.content || n.text),
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

    if (Array.isArray(payload.dailyAttendance) || Array.isArray(payload.deletedDailyAttendance) || Array.isArray(payload.deletedAttendance)) {
      if (Array.isArray(payload.dailyAttendance)) {
        for (const a of payload.dailyAttendance) {
          if (!a || typeof a !== "object") {
            return res.status(400).json({ success: false, message: "Invalid attendance entry: Expected an object." });
          }
          if (hasMongoOperators(a)) {
            return res.status(400).json({ success: false, message: "MongoDB operators are not permitted in attendance payloads." });
          }
          if (!a.subject || typeof a.subject !== "string" || !a.subject.trim()) {
            return res.status(400).json({ success: false, message: "Attendance entry requires a valid subject." });
          }
          if (a.date || a.isoDate) {
            const dateCheck = validateAttendanceDate(a.date, a.isoDate);
            if (!dateCheck.valid) {
              return res.status(400).json({ success: false, message: dateCheck.error });
            }
            a.isoDate = dateCheck.isoDate;
            a.date = dateCheck.date;
          }
          if (a.records && typeof a.records === "object") {
            const recCheck = validateAttendanceRecords(a.records);
            if (!recCheck.valid) {
              return res.status(400).json({ success: false, message: recCheck.error });
            }
            a.records = recCheck.records;
          }
          if (a.status !== undefined && a.status !== "") {
            const stNorm = normalizeAttendanceStatus(a.status);
            if (!stNorm) {
              return res.status(400).json({ success: false, message: `Invalid attendance status '${a.status}'. Allowed values: P, A, Present, Absent.` });
            }
            a.status = stNorm === "P" ? "Present" : "Absent";
          }

          // Faculty role authorization enforcement
          if (req.user.role === "faculty") {
            const authCheck = validateFacultyAttendanceAuthorization(req.user, a.subject, a.division, a.semester);
            if (!authCheck.authorized) {
              return res.status(403).json({ success: false, message: authCheck.reason });
            }
          }
        }
      }

      const attMap = new Map();
      (existingStore?.dailyAttendance || []).forEach(a => {
        if (a && (a.id || a.attendanceId)) attMap.set(a.id || a.attendanceId, a);
      });
      if (Array.isArray(payload.dailyAttendance)) {
        payload.dailyAttendance.forEach(a => {
          if (a && (a.id || a.attendanceId)) attMap.set(a.id || a.attendanceId, a);
        });
      }

      // Handle deletedDailyAttendance / deletedAttendance
      const delDaily = [
        ...(Array.isArray(payload.deletedDailyAttendance) ? payload.deletedDailyAttendance : []),
        ...(Array.isArray(payload.deletedAttendance) ? payload.deletedAttendance : [])
      ];
      if (delDaily.length > 0) {
        for (const delId of delDaily) {
          const existing = attMap.get(delId);
          if (existing && req.user.role === "faculty") {
            const authCheck = validateFacultyAttendanceAuthorization(req.user, existing.subject, existing.division, existing.semester);
            if (!authCheck.authorized) {
              return res.status(403).json({ success: false, message: authCheck.reason });
            }
          }
          attMap.delete(delId);
        }
      }

      update.dailyAttendance = Array.from(attMap.values());
    }

    if (Array.isArray(payload.assignments)) {
      const asgnMap = new Map();
      (existingStore?.assignments || []).forEach(a => {
        if (a && a.id) asgnMap.set(`${a.id}_${a.student || ""}`, a);
      });
      payload.assignments.forEach(a => {
        if (a && a.id) {
          asgnMap.set(`${a.id}_${a.student || ""}`, {
            ...a,
            title: stripHtmlTags(a.title),
            description: stripHtmlTags(a.description),
            fileName: stripHtmlTags(a.fileName)
          });
        }
      });
      update.assignments = Array.from(asgnMap.values());
    }

    if (Array.isArray(payload.notes)) {
      const noteMap = new Map();
      (existingStore?.notes || []).forEach(n => {
        if (n && n.id) noteMap.set(n.id, n);
      });
      payload.notes.forEach(n => {
        if (n && n.id) {
          noteMap.set(n.id, {
            ...n,
            title: stripHtmlTags(n.title),
            division: stripHtmlTags(n.division),
            fileName: stripHtmlTags(n.fileName),
            uploadedByName: stripHtmlTags(n.uploadedByName)
          });
        }
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
      // Note: timetables collection is the authoritative source; AcademicStore.timetable is kept empty.
      if (payload.timetableHeader && typeof payload.timetableHeader === "object") {
        const sanitizedHeader = {};
        for (const [k, v] of Object.entries(payload.timetableHeader)) {
          if (v && typeof v === "object") {
            sanitizedHeader[k] = {
              title: stripHtmlTags(v.title),
              subtitle: stripHtmlTags(v.subtitle)
            };
          } else {
            sanitizedHeader[k] = v;
          }
        }
        update.timetableHeader = { ...(existingStore?.timetableHeader || {}), ...sanitizedHeader };
      }
      if (payload.customBreakRows && typeof payload.customBreakRows === "object") {
        const sanitizedBreaks = {};
        for (const [k, v] of Object.entries(payload.customBreakRows)) {
          if (v && typeof v === "object") {
            sanitizedBreaks[k] = {
              breakTime: stripHtmlTags(v.breakTime),
              breakLabel: stripHtmlTags(v.breakLabel),
              lunchTime: stripHtmlTags(v.lunchTime),
              lunchLabel: stripHtmlTags(v.lunchLabel)
            };
          } else {
            sanitizedBreaks[k] = v;
          }
        }
        update.customBreakRows = { ...(existingStore?.customBreakRows || {}), ...sanitizedBreaks };
      }
      if (Array.isArray(payload.subjects)) update.subjects = payload.subjects;
      if (payload.divisions) update.divisions = normalizeStoreDivisions(payload.divisions);
    }

    if (update.dailyAttendance && (update.students || existingStore?.students)) {
      update.students = update.students || { ...(existingStore?.students || {}) };
      recalculateOverallAttendance(update.dailyAttendance, update.students);
    }

    await AcademicStore.findOneAndUpdate(
      { storeKey: "default_academic_store" },
      { $set: update },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    // Synchronize dedicated MongoDB collections in real-time via safe bulkWrite
    await syncCollectionsFromAcademicData({
      ...payload,
      ...(update.notices ? { notices: update.notices } : {}),
      ...(update.dailyAttendance ? { dailyAttendance: update.dailyAttendance } : {})
    });

    // Prompt 29: Immediate real-time Web Push event delivery for academic operations
    // 1. Attendance notifications for newly marked Present students
    if (Array.isArray(payload.dailyAttendance)) {
      for (const a of payload.dailyAttendance) {
        if (!a || typeof a !== "object") continue;
        const targetId = a.attendanceId || a.id;
        const prevEntry = (existingStore?.dailyAttendance || []).find(d =>
          d && (d.attendanceId === targetId || d.id === targetId || (d.subject === a.subject && d.isoDate === a.isoDate && d.division === a.division))
        );
        pushService.notifyAttendance({
          subject: a.subject,
          date: a.date,
          isoDate: a.isoDate,
          attendanceId: targetId,
          records: a.records,
          singleStudent: a.studentUsername,
          singleStatus: a.status,
          prevRecords: prevEntry?.records,
          prevSingleStatus: prevEntry?.status
        }).catch(err => console.warn("[WebPush] Attendance sync push error:", err.message));
      }
    }

    // 2. Marks notifications for added or updated student marks
    if (payload.students && typeof payload.students === "object") {
      for (const [username, sRecord] of Object.entries(payload.students)) {
        if (sRecord && sRecord.marks && typeof sRecord.marks === "object") {
          const prevStudentMarks = existingStore?.students?.[username]?.marks || {};
          for (const [subId, m] of Object.entries(sRecord.marks)) {
            if (m && typeof m === "object") {
              pushService.notifyMarks({
                studentUsername: username,
                subject: subId,
                mark: m,
                prevMark: prevStudentMarks[subId]
              }).catch(err => console.warn("[WebPush] Marks sync push error:", err.message));
            }
          }
        }
      }
    }

    // 3. Assignment notifications for newly published assignments
    if (Array.isArray(payload.assignments)) {
      const prevAssignIds = new Set((existingStore?.assignments || []).map(a => a && (a.id || a.title)));
      for (const asgn of payload.assignments) {
        if (asgn && asgn.id && !prevAssignIds.has(asgn.id)) {
          pushService.notifyAssignment(asgn)
            .catch(err => console.warn("[WebPush] Assignment sync push error:", err.message));
        }
      }
    }

    // 4. Study Notes notifications for newly published notes
    if (Array.isArray(payload.notes)) {
      const prevNoteIds = new Set((existingStore?.notes || []).map(n => n && (n.id || n.title)));
      for (const note of payload.notes) {
        if (note && note.id && !prevNoteIds.has(note.id)) {
          pushService.notifyNote(note)
            .catch(err => console.warn("[WebPush] Notes sync push error:", err.message));
        }
      }
    }

    // 5. Notices notifications for newly published notices
    if (Array.isArray(payload.notices)) {
      const prevNoticeIds = new Set((existingStore?.notices || []).map(n => n && (n.id || n.noticeId || n.title)));
      for (const notice of payload.notices) {
        if (notice && (notice.id || notice.noticeId) && !prevNoticeIds.has(notice.id || notice.noticeId)) {
          pushService.notifyNotice(notice, req.user)
            .catch(err => console.warn("[WebPush] Notice sync push error:", err.message));
        }
      }
    }

    res.json({ success: true, message: "Academic data permanently saved to MongoDB!" });
  } catch (error) {
    console.error("Sync academic data error:", error);
    res.status(500).json({ success: false, message: "Failed to sync academic data." });
  }
});

// Catch-all for unhandled API routes across all HTTP methods
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found." });
});

// SPA fallback: any non-API GET request serves index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Handle payload too large (413)
  if (err.type === "entity.too.large" || err.status === 413) {
    return res.status(413).json({
      success: false,
      message: "Payload too large. Maximum allowed size is 1MB (15MB for academic sync)."
    });
  }

  // Handle malformed JSON body (400)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format in request body."
    });
  }

  // Handle CORS blocked origin (403)
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS request blocked: origin not allowed."
    });
  }

  // Generic internal server error (500)
  console.error("Unhandled server error:", err);
  const isProd = process.env.NODE_ENV === "production";
  return res.status(500).json({
    success: false,
    message: isProd ? "Internal server error." : (err.message || "Internal server error.")
  });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`CampusSphere backend running on port ${PORT}`);
  const maskedUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  console.log(`Database Mode: MongoDB (${maskedUri})`);
});

const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Closing server gracefully...`);
  server.close(async () => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    } catch (_) {}
    process.exit(0);
  });
  if (typeof setTimeout === "function") {
    setTimeout(() => {
      process.exit(0);
    }, 10000).unref();
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

app.validateAuthConfig = validateAuthConfig;

module.exports = app;

