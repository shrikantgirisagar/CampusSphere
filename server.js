require("dotenv").config();
const dns = require("dns");
try { dns.setDefaultResultOrder("ipv4first"); } catch (_) {}

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
const Syllabus = require("./models/Syllabus");
const PushSubscription = require("./models/PushSubscription");
const { VALID_YEAR_CONFIG, VALID_SEMESTER_YEAR_MAP } = require("./models/Syllabus");
const multer = require("multer");
const pushService = require("./services/pushNotificationService");
const fileSyncService = require("./services/fileSyncService");

// Initialize Web Push VAPID configuration
pushService.initWebPush();

// Uploads and Syllabus Storage Configuration
// NOTE: Multi-instance or containerized production environments should configure
// persistent volumes for UPLOAD_DIR or migrate to cloud object storage (S3/GCS).
const UPLOAD_BASE_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, "uploads");
const SYLLABUS_BASE_DIR = path.join(UPLOAD_BASE_DIR, "syllabi");
const SYLLABUS_YEAR_DIRS = {
  1: path.join(SYLLABUS_BASE_DIR, "first-year"),
  2: path.join(SYLLABUS_BASE_DIR, "second-year"),
  3: path.join(SYLLABUS_BASE_DIR, "third-year")
};
const ATTACHMENT_BASE_DIR = path.join(UPLOAD_BASE_DIR, "attachments");

// Guarantee all storage directories exist on boot
for (const dir of [...Object.values(SYLLABUS_YEAR_DIRS), ATTACHMENT_BASE_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Unified helper to extract yearLevel from any format (yearLevel, year, or semester)
function extractYearLevel(input) {
  if (!input) return null;
  if (typeof input === "object") {
    return extractYearLevel(input.yearLevel || input.year || input.semester);
  }
  const s = String(input).trim().toLowerCase();
  if (s === "1" || s === "first" || s === "first-year" || s === "1st year" || s === "year 1") return 1;
  if (s === "2" || s === "second" || s === "second-year" || s === "2nd year" || s === "year 2") return 2;
  if (s === "3" || s === "third" || s === "third-year" || s === "3rd year" || s === "year 3") return 3;
  const num = parseInt(s, 10);
  if (!isNaN(num)) {
    if (num >= 1 && num <= 3) return num;
    if (num === 4) return 2;
    if (num === 5 || num === 6) return 3;
  }
  if (s.includes("sem")) {
    const semNum = parseInt(s.replace(/[^0-9]/g, ""), 10);
    if (semNum === 1 || semNum === 2) return 1;
    if (semNum === 3 || semNum === 4) return 2;
    if (semNum === 5 || semNum === 6) return 3;
  }
  return null;
}

const SYLLABUS_MAX_FILE_SIZE_MB = parseInt(process.env.SYLLABUS_MAX_FILE_SIZE_MB || "100", 10);
const SYLLABUS_MAX_FILE_SIZE_BYTES = SYLLABUS_MAX_FILE_SIZE_MB * 1024 * 1024;

const syllabusStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const yr = extractYearLevel(req.body) || extractYearLevel(req.params);
    const targetDir = yr && SYLLABUS_YEAR_DIRS[yr] ? SYLLABUS_YEAR_DIRS[yr] : SYLLABUS_BASE_DIR;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: function (req, file, cb) {
    const yr = extractYearLevel(req.body) || extractYearLevel(req.params);
    const randomHex = crypto.randomBytes(16).toString("hex");
    const safeExt = ".pdf";
    const generated = `syllabus-year${yr || "x"}-${Date.now()}-${randomHex}${safeExt}`;
    cb(null, generated);
  }
});

const uploadSyllabus = multer({
  storage: syllabusStorage,
  limits: {
    fileSize: SYLLABUS_MAX_FILE_SIZE_BYTES,
    files: 1
  },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (ext !== ".pdf") {
      const err = new Error("Only PDF files are allowed.");
      err.code = "INVALID_FILE_TYPE";
      return cb(err, false);
    }
    if (file.mimetype && file.mimetype !== "application/pdf") {
      const err = new Error("Only PDF files are allowed.");
      err.code = "INVALID_FILE_TYPE";
      return cb(err, false);
    }
    cb(null, true);
  }
});

function verifyPdfMagicBytes(filePath) {
  try {
    if (!fs.existsSync(filePath)) return false;
    const fd = fs.openSync(filePath, "r");
    const buffer = Buffer.alloc(1024);
    const bytesRead = fs.readSync(fd, buffer, 0, 1024, 0);
    fs.closeSync(fd);

    if (bytesRead < 5) return false;
    const headerStr = buffer.slice(0, Math.min(bytesRead, 1024)).toString("latin1");
    return headerStr.startsWith("%PDF-") || headerStr.includes("%PDF-");
  } catch (err) {
    console.error("PDF magic bytes verification error:", err.message);
    return false;
  }
}

function verifyAttachmentMagicBytes(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const fd = fs.openSync(filePath, "r");
    const buffer = Buffer.alloc(16);
    const bytesRead = fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);
    if (bytesRead < 4) return null;

    if (buffer.slice(0, 5).toString("latin1").startsWith("%PDF-")) return "application/pdf";
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return "image/png";
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return "image/jpeg";
    if (buffer.slice(0, 4).toString("latin1") === "RIFF" && bytesRead >= 12 && buffer.slice(8, 12).toString("latin1") === "WEBP") return "image/webp";
    return null;
  } catch (_) {
    return null;
  }
}

function saveAttachmentFromBuffer(buffer, originalFileName = "attachment.pdf") {
  if (!buffer || buffer.length === 0) return null;
  if (buffer.length > 10 * 1024 * 1024) return null; // 10 MB maximum attachment limit

  let detectedType = null;
  let ext = ".pdf";
  if (buffer.slice(0, 5).toString("latin1").startsWith("%PDF-")) {
    detectedType = "application/pdf";
    ext = ".pdf";
  } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    detectedType = "image/png";
    ext = ".png";
  } else if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    detectedType = "image/jpeg";
    ext = ".jpg";
  } else if (buffer.slice(0, 4).toString("latin1") === "RIFF" && buffer.length >= 12 && buffer.slice(8, 12).toString("latin1") === "WEBP") {
    detectedType = "image/webp";
    ext = ".webp";
  } else {
    return null;
  }

  const randomHex = crypto.randomBytes(16).toString("hex");
  const filename = `att-${Date.now()}-${randomHex}${ext}`;
  const filePath = path.join(ATTACHMENT_BASE_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  return {
    filename,
    filePath,
    mimeType: detectedType,
    url: `/api/academic/attachments/${filename}`,
    originalName: originalFileName
  };
}

function processAttachmentDataUrl(dataUrl, originalName) {
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1].toLowerCase();
  const allowedMimes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowedMimes.includes(mimeType)) return null;

  try {
    const buf = Buffer.from(match[2], "base64");
    return saveAttachmentFromBuffer(buf, originalName);
  } catch (_) {
    return null;
  }
}

const app = express();
app.set("trust proxy", Number(process.env.TRUST_PROXY || 0));
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
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'self'; object-src 'none'; base-uri 'self';"
  );

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

const allowedCorsHeaders = ["Content-Type", "Authorization", "x-auth-token"];
if (process.env.NODE_ENV === "test") {
  allowedCorsHeaders.push("x-test-rate-limit");
}

const corsOptions = {
  origin: function (origin, callback) {
    // When credentials: true, Origin "null" is strictly disallowed
    if (origin === "null") {
      return callback(new Error("Origin null is not permitted when credentials are enabled"));
    }
    // Allow same-origin or non-browser/curl requests without Origin header
    if (!origin) return callback(null, true);

    const normalized = origin.toLowerCase();
    // With credentials: true, wildcard '*' is ignored and forbidden by CORS specification
    const isAllowed = configuredOrigins.some(allowed => {
      const a = allowed.toLowerCase();
      if (a === "*") return false; // Ignore wildcard when credentials are true
      return a === normalized;
    });
    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: allowedCorsHeaders,
  exposedHeaders: ["Retry-After", "RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset", "X-Refreshed-Token"]
};

app.use(cors(corsOptions));

// Higher body limit specifically for academic sync (allows base64 documents/notes)
app.use("/api/academic/sync", express.json({ limit: "15mb" }));

// Standard body limit for all other routes
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// In-memory rate limiter factory with sliding window and automatic cleanup
function normalizeClientIp(rawIp) {
  if (!rawIp || typeof rawIp !== "string") return "unknown";
  let ip = rawIp.trim();
  if (ip.startsWith("::ffff:")) {
    ip = ip.slice(7);
  }
  if (ip === "::1") {
    ip = "127.0.0.1";
  }
  return ip;
}

// Rate Limiter Store Architecture & Store Hook:
// By default, CampusSphere uses an in-memory Map store for sliding window rate limiting.
// NOTE ON PRODUCTION / MULTI-INSTANCE LIMITATIONS:
// In-memory rate limits reset when the server restarts or restarts in cluster mode, and
// limits are not synchronized across multiple load-balanced instances or worker processes.
// For clustered or multi-instance production environments, plug in a distributed store hook
// (such as Redis with ioredis or rate-limit-redis, or a MongoDB collection with TTL index)
// by passing a custom `store` object: { get(key), set(key, record, windowMs), reset(key) }.
function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  maxRequests = 100,
  message = "Too many requests. Please try again later.",
  bypassInTest = false,
  skipSuccessfulRequests = false,
  skip = null,
  store = null // Optional external store hook (e.g., Redis or Mongo-backed)
}) {
  const memoryHits = new Map();
  const effectiveStore = store || {
    get: (key) => memoryHits.get(key),
    set: (key, val) => memoryHits.set(key, val),
    delete: (key) => memoryHits.delete(key),
    entries: () => memoryHits.entries()
  };

  const cleanupTimer = setInterval(() => {
    if (store) return; // External store manages its own TTL / eviction
    const now = Date.now();
    for (const [ip, record] of memoryHits.entries()) {
      if (now - record.startTime > windowMs) {
        memoryHits.delete(ip);
      }
    }
  }, Math.min(windowMs, 60000));
  if (cleanupTimer.unref) cleanupTimer.unref();

  return function rateLimiter(req, res, next) {
    if (bypassInTest && process.env.NODE_ENV === "test" && !req.headers["x-test-rate-limit"]) {
      return next();
    }

    if (typeof skip === "function" && skip(req)) {
      return next();
    }

    const ip = normalizeClientIp(req.ip || req.socket?.remoteAddress || "unknown");
    const now = Date.now();
    let record = effectiveStore.get(ip);

    if (!record || now - record.startTime > windowMs) {
      record = { count: 1, startTime: now };
      effectiveStore.set(ip, record);
    } else {
      record.count++;
      effectiveStore.set(ip, record);
    }

    const effectiveMax = typeof maxRequests === "function" ? maxRequests(req) : maxRequests;
    const remaining = Math.max(0, effectiveMax - record.count);
    const resetSeconds = Math.ceil((record.startTime + windowMs - now) / 1000);

    res.setHeader("RateLimit-Limit", effectiveMax);
    res.setHeader("RateLimit-Remaining", remaining);
    res.setHeader("RateLimit-Reset", resetSeconds);

    if (record.count > effectiveMax) {
      res.setHeader("Retry-After", resetSeconds);
      return res.status(429).json({
        success: false,
        message,
        retryAfter: resetSeconds
      });
    }

    if (skipSuccessfulRequests) {
      res.on("finish", () => {
        if (res.statusCode < 400 && record && record.count > 0) {
          record.count--;
          if (record.count <= 0) {
            effectiveStore.delete(ip);
          } else {
            effectiveStore.set(ip, record);
          }
        }
      });
    }

    next();
  };
}

const isDev = process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test";

// 1. Auth Login Rate Limiter (25 requests per 15 min per IP in prod/test, 100 in dev)
const rateLimitLogin = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: Number(process.env.RATE_LIMIT_LOGIN_MAX || (isDev ? 100 : 25)),
  message: "Too many login attempts. Please try again after 15 minutes.",
  skipSuccessfulRequests: true
});

// 2. User Registration Rate Limiter (30 requests per 15 min per IP)
const rateLimitRegistration = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: Number(process.env.RATE_LIMIT_REGISTER_MAX || (isDev ? 100 : 30)),
  message: "Too many registration attempts. Please try again later.",
  bypassInTest: true
});

// 3. Heavy / Expensive Operations Rate Limiter (60 requests per 15 min per IP)
const rateLimitExpensive = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: Number(process.env.RATE_LIMIT_EXPENSIVE_MAX || (isDev ? 200 : 60)),
  message: "Too many synchronization requests. Please try again later.",
  bypassInTest: true
});

// 4. General API Rate Limiter (300 requests per 15 min per IP in prod/test, 2000 in dev)
// Excludes dedicated auth login endpoint so general background polling,
// divisions sync, or stats traffic never exhausts the login limiter or blocks logins.
const rateLimitApi = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  maxRequests: Number(process.env.RATE_LIMIT_MAX || (isDev ? 2000 : 300)),
  message: "Too many requests to the API. Please try again later.",
  bypassInTest: true,
  skip: (req) => {
    const pathStr = req.path || "";
    const origStr = req.originalUrl ? req.originalUrl.split("?")[0] : "";
    return pathStr === "/auth/login" || origStr === "/api/auth/login";
  }
});

// Isolated public directory static serving: guarantees sensitive system files (.env, server.js, package.json)
// are strictly isolated outside the public directory. (Preserves BLOCKED_STATIC_FILES reference for legacy audits)
const BLOCKED_STATIC_FILES = new Set([".env", ".env.example", "server.js", "package.json", "package-lock.json"]);
const PUBLIC_DIR = path.join(__dirname, "public");

// Favicon handler with safe fallback to logo if favicon.ico is not found
app.get("/favicon.ico", (req, res) => {
  const icoPath = path.join(PUBLIC_DIR, "favicon.ico");
  if (fs.existsSync(icoPath)) {
    return res.sendFile(icoPath);
  }
  return res.sendFile(path.join(PUBLIC_DIR, "CampusSphere-logo.png"));
});

// Serve static portal assets and SPA entry with no-cache headers from public/ directory
app.get(["/", "/index.html", "/login", "/login.html", "/signup", "/signup.html"], (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});
app.get(["/courses", "/courses.html"], (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(PUBLIC_DIR, "courses.html"));
});
app.get(["/about", "/about.html"], (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(PUBLIC_DIR, "about.html"));
});
app.get(["/students", "/students.html"], (req, res) => {
  res.redirect("/#students-faculty-count");
});
app.get("/style.css", (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(PUBLIC_DIR, "style.css"));
});
app.get("/script.js", (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(PUBLIC_DIR, "script.js"));
});
app.get("/animated-background.js", (req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(PUBLIC_DIR, "animated-background.js"));
});

// Service Worker & PWA Manifest explicit handlers
app.get("/service-worker.js", (req, res) => {
  res.set({
    "Content-Type": "application/javascript; charset=utf-8",
    "Service-Worker-Allowed": "/",
    "Cache-Control": "no-cache, no-store, must-revalidate"
  });
  res.sendFile(path.join(PUBLIC_DIR, "service-worker.js"));
});

app.get(["/manifest.json", "/manifest.webmanifest"], (req, res) => {
  res.set({
    "Content-Type": "application/manifest+json; charset=utf-8",
    "Cache-Control": "no-cache, no-store, must-revalidate"
  });
  res.sendFile(path.join(PUBLIC_DIR, "manifest.json"));
});

// Protect uploads directory against direct unauthenticated static access
app.use("/uploads", (req, res) => {
  res.status(403).json({ success: false, message: "Direct access to uploads directory is forbidden." });
});

// Serve remaining static assets strictly from public/ directory
app.use(express.static(PUBLIC_DIR, { index: false }));


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
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .trim();
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

function validatePasswordStrength(password) {
  if (!password || typeof password !== "string") {
    return "Password is required and must be a string.";
  }
  if (password.length < 10) {
    return "Password must contain at least 10 characters.";
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain at least one letter and one number.";
  }
  return null;
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
  "replace_with_a_secure_random_32_character_key_in_production",
  "your_super_secret_session_key_replace_in_production",
  "campussphere_session_secret_key_2026_secure",
  "campussphere_dev_session_secret_2026_insecure",
  "secret",
  "password",
  "123456",
  "change_me",
  "changeme",
  "session_secret"
]);

function isPlaceholderOrWeak(secret) {
  if (!secret || typeof secret !== "string") return true;
  const s = secret.trim().toLowerCase();
  if (KNOWN_PLACEHOLDER_SECRETS.has(s)) return true;
  if (s.startsWith("replace_with")) return true;
  if (
    s.includes("placeholder") ||
    s.includes("changeme") ||
    s.includes("change_me") ||
    s === "secret" ||
    s === "password" ||
    s === "session_secret"
  ) {
    return true;
  }
  return false;
}

function validateAuthConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV;
  const isProd = nodeEnv === "production";
  const secret = env.SESSION_SECRET;

  if (isProd) {
    if (!secret || typeof secret !== "string" || !secret.trim()) {
      return {
        valid: false,
        error: "In production (NODE_ENV=production), SESSION_SECRET must be configured with a cryptographically secure key of at least 32 characters."
      };
    }
    const trimmed = secret.trim();
    if (trimmed.length < 32) {
      return {
        valid: false,
        error: "In production (NODE_ENV=production), SESSION_SECRET must contain at least 32 characters and cannot be a common placeholder."
      };
    }
    if (isPlaceholderOrWeak(trimmed)) {
      return {
        valid: false,
        error: "In production (NODE_ENV=production), SESSION_SECRET cannot be a placeholder or start with 'replace_with' or contain 'placeholder', 'changeme', 'secret', or 'password'."
      };
    }
    return { valid: true, secret: trimmed };
  }

  // Non-production (development, test, local, or unset):
  if (secret && typeof secret === "string" && secret.trim()) {
    const trimmed = secret.trim();
    if (trimmed.length >= 32 && !isPlaceholderOrWeak(trimmed)) {
      return { valid: true, secret: trimmed };
    }
    if (nodeEnv === "development" || !nodeEnv) {
      return { valid: true, secret: trimmed };
    }
  }

  // Derive stable dev secret from gitignored .dev-secret when missing or short in development
  const devSecretPath = path.resolve(__dirname, ".dev-secret");
  let devSecret = "";
  if (fs.existsSync(devSecretPath)) {
    try {
      devSecret = fs.readFileSync(devSecretPath, "utf8").trim();
    } catch (_) {}
  }
  if (!devSecret || devSecret.length < 32) {
    devSecret = crypto.randomBytes(32).toString("hex");
    try {
      fs.writeFileSync(devSecretPath, devSecret, { mode: 0o600 });
    } catch (_) {}
  }
  console.warn("[WARNING] SESSION_SECRET is missing or shorter than 32 characters; derived stable dev secret from .dev-secret for local session persistence.");
  return { valid: true, secret: devSecret, generated: true };
}

function validateStartupConfig(env = process.env, options = { silent: false }) {
  const nodeEnv = env.NODE_ENV ? env.NODE_ENV.trim() : "";
  const isProd = nodeEnv === "production";
  const errors = [];
  const warnings = [];

  // 1. Session Secret
  const authRes = validateAuthConfig(env);
  let sessionSecretStatus = "";
  if (authRes.valid) {
    if (authRes.generated) {
      sessionSecretStatus = "Derived from .dev-secret (development persistence)";
    } else {
      sessionSecretStatus = "Configured & Valid (>= 32 chars)";
    }
  } else {
    sessionSecretStatus = "INVALID / MISSING";
    errors.push(authRes.error);
  }

  // 2. MONGODB_URI (host only)
  let mongoHost = "(unset)";
  const rawMongoUri = env.MONGODB_URI || "mongodb://127.0.0.1:27017/CampusSphere";
  try {
    const parsed = new URL(rawMongoUri);
    mongoHost = parsed.host || parsed.hostname || "(unknown)";
  } catch (_) {
    mongoHost = "(unparseable host)";
    if (isProd) {
      errors.push("Invalid MONGODB_URI format.");
    }
  }

  // 3. CORS Origins count
  const corsOrigins = env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(",").map(o => o.trim()).filter(Boolean)
    : defaultAllowedOrigins;
  const corsCount = corsOrigins.length;

  // 4. Trust proxy
  const trustProxy = Number(env.TRUST_PROXY || 0);

  // 5. VAPID Keys
  const vapidPresent = Boolean(
    (env.VAPID_PUBLIC_KEY || env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) &&
    env.VAPID_PRIVATE_KEY
  );

  // 6. Upload Directory
  const uploadDir = env.UPLOAD_DIR
    ? path.resolve(env.UPLOAD_DIR)
    : path.resolve(__dirname, "uploads");

  const summary = {
    NODE_ENV: nodeEnv || "(unset - defaults to development)",
    SESSION_SECRET: sessionSecretStatus,
    MONGODB_HOST: mongoHost,
    CORS_ORIGINS_COUNT: corsCount,
    TRUST_PROXY: trustProxy,
    VAPID_KEYS_CONFIGURED: vapidPresent ? "Yes" : "No",
    UPLOAD_DIR: uploadDir
  };

  if (!options.silent) {
    console.log("==================================================");
    console.log("           CAMPUSSPHERE STARTUP CONFIG            ");
    console.log("==================================================");
    console.log(` Environment      : ${summary.NODE_ENV}`);
    console.log(` Session Secret   : ${summary.SESSION_SECRET}`);
    console.log(` MongoDB Host     : ${summary.MONGODB_HOST}`);
    console.log(` CORS Origins     : ${summary.CORS_ORIGINS_COUNT} configured`);
    console.log(` Trust Proxy      : ${summary.TRUST_PROXY}`);
    console.log(` Push VAPID Keys  : ${summary.VAPID_KEYS_CONFIGURED}`);
    console.log(` Upload Directory : ${summary.UPLOAD_DIR}`);
    console.log("==================================================");
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings, summary };
  }
  return { valid: true, errors: [], warnings, summary };
}

const startupValidation = validateStartupConfig(process.env, { silent: process.env.NODE_ENV === "test" });
if (!startupValidation.valid) {
  console.error(`[FATAL] ${startupValidation.errors[0] || "Startup configuration validation failed."}`);
  process.exit(1);
}

const authConfigResult = validateAuthConfig();
if (!authConfigResult.valid) {
  console.error(`[FATAL] ${authConfigResult.error}`);
  process.exit(1);
}

const AUTH_SECRET = authConfigResult.secret;

function generateAuthToken(user) {
  if (!user) return "";
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000; // 12 hours
  const tokenVersion = typeof user.tokenVersion === "number" ? user.tokenVersion : 0;
  const data = JSON.stringify({
    id: String(user.id || ""),
    role: String(user.role || ""),
    username: String(user.username || ""),
    tokenVersion,
    exp: expiresAt
  });
  const payload = Buffer.from(data).toString("base64url");
  const sig = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyAuthToken(token) {
  try {
    if (!token || typeof token !== "string") return { error: "malformed" };
    if (!token.includes(".")) return { error: "malformed" };
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
    return {
      id: data.id,
      role: data.role,
      username: data.username,
      tokenVersion: typeof data.tokenVersion === "number" ? data.tokenVersion : 0,
      expiresAt: data.exp
    };
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
      ? "Authentication token has expired. Please log in again."
      : (result.error === "malformed" ? "Malformed authentication token." : "Invalid authentication token signature.");
    return res.status(401).json({ success: false, message });
  }

  try {
    const dbUser = await User.findOne({
      id: result.id,
      role: result.role,
      $or: [
        { usernameLower: result.username.toLowerCase() },
        { username: new RegExp(`^${escapeRegex(result.username)}$`, "i") }
      ]
    }).lean();
    if (!dbUser) {
      if (req.path === "/auth/login" || req.path === "/login") {
        req.user = null;
        return next();
      }
      return res.status(401).json({ success: false, message: "Authenticated user account no longer exists." });
    }

    // Token revocation check
    const expectedVersion = typeof dbUser.tokenVersion === "number" ? dbUser.tokenVersion : 0;
    const providedVersion = typeof result.tokenVersion === "number" ? result.tokenVersion : 0;
    if (providedVersion !== expectedVersion) {
      if (req.path === "/auth/login" || req.path === "/login") {
        req.user = null;
        return next();
      }
      return res.status(401).json({ success: false, message: "Authentication token has been revoked. Please log in again." });
    }

    // Sliding refresh: if token has < 6 hours remaining, send new token in response header
    if (result.expiresAt && (result.expiresAt - Date.now()) < 6 * 60 * 60 * 1000) {
      try {
        const refreshedToken = generateAuthToken(dbUser);
        res.setHeader("X-Refreshed-Token", refreshedToken);
      } catch (_) {}
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

// Global Mongoose Connection Event Listeners (Single Reconnect Strategy)
mongoose.connection.on("connected", () => {
  console.log("[MongoDB] Connection established successfully.");
});
mongoose.connection.on("error", (err) => {
  console.error("[MongoDB] Connection error:", err.message);
});
mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Connection lost. Built-in driver reconnecting...");
});

// Connect to MongoDB & Seed Initial Accounts
async function initDatabase() {
  try {
    let targetDbName = "CampusSphere";
    try {
      const parsedPath = new URL(MONGODB_URI).pathname.replace(/^\//, "").split("?")[0];
      if (parsedPath) targetDbName = parsedPath;
    } catch (_) {}

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, {
        dbName: targetDbName,
        serverSelectionTimeoutMS: 5000
      });
      console.log("Connected to MongoDB successfully.");
    } else if (mongoose.connection.readyState === 2) {
      await new Promise(resolve => mongoose.connection.once("open", resolve));
    }
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

    // Idempotent backfill of usernameLower for all users missing the field
    try {
      const usersNeedingBackfill = await User.find({
        $or: [
          { usernameLower: { $exists: false } },
          { usernameLower: "" },
          { usernameLower: null }
        ]
      });
      for (const u of usersNeedingBackfill) {
        if (u.username) {
          await User.updateOne(
            { _id: u._id },
            { $set: { usernameLower: String(u.username).trim().toLowerCase() } }
          );
        }
      }
    } catch (backfillErr) {
      console.warn("[WARNING] Failed usernameLower backfill check:", backfillErr.message);
    }

    // Case-insensitive username collision detection before syncing unique index
    try {
      const collisions = await User.aggregate([
        {
          $group: {
            _id: { $toLower: "$username" },
            count: { $sum: 1 },
            variants: { $push: "$username" }
          }
        },
        {
          $match: {
            count: { $gt: 1 }
          }
        }
      ]);

      if (collisions.length > 0) {
        const collisionList = collisions
          .map(c => `"${c._id}" (found: ${c.variants.join(", ")})`)
          .join("; ");
        console.error(`[COLLISION] Case-insensitive username collisions detected: ${collisionList}`);
        if (process.env.NODE_ENV === "production") {
          console.error("[FATAL] Server cannot start in production with conflicting username variations. Please resolve collisions or run 'node scripts/migrate-usernamelower.js' before starting.");
          process.exit(1);
        } else {
          console.warn("[WARNING] Running with colliding username variations in non-production. Unique index creation may be skipped.");
        }
      } else {
        await User.syncIndexes().catch(err => {
          console.warn("User index sync warning:", err.message);
        });
      }
    } catch (indexSyncErr) {
      console.warn("User index sync warning:", indexSyncErr.message);
    }

    // AcademicStore size threshold check (8 MB startup warning)
    try {
      const currentStore = await AcademicStore.findOne({ storeKey: "default_academic_store" }).lean();
      if (currentStore) {
        const storeBytes = Buffer.byteLength(JSON.stringify(currentStore), "utf8");
        const storeMb = (storeBytes / (1024 * 1024)).toFixed(2);
        if (storeBytes >= 8 * 1024 * 1024) {
          console.warn(`[WARNING] AcademicStore document size is ${storeMb} MB (exceeds 8 MB warning threshold). Consider archiving old semester data.`);
        }
      }
    } catch (_) {}

    // Ensure administrator account exists or provision securely
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      const isProd = process.env.NODE_ENV === "production";
      const isExplicitDev = process.env.NODE_ENV === "development";
      if (isExplicitDev) {
        // Development mode: seed development admin account for local workflows and testing
        const adminPasswordHash = await hashPassword("admin@123");
        await User.create({
          id: "admin-001",
          role: "admin",
          name: "Administrator",
          username: "admin",
          usernameLower: "admin",
          email: "admin@campussphere.edu",
          passwordHash: adminPasswordHash,
          tokenVersion: 0
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
    try {
      await fileSyncService.syncFromMongoToFiles();
    } catch (fsErr) {
      console.warn("[FileSync] Initial sync warning:", fsErr.message);
    }
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    if (process.env.NODE_ENV === "production") {
      console.error("[FATAL] Exiting due to MongoDB connection failure in production environment.");
      process.exit(1);
    }
    console.log("Note: Please make sure MongoDB is running locally or set MONGODB_URI in your .env file.");
  }
}

initDatabase();

// --- API Endpoints ---

// General API rate limiter for all /api endpoints
app.use("/api", rateLimitApi);

app.use("/api", (req, res, next) => {
  if (req.path === "/status" || req.path === "/health") return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database connection error. Please check your MongoDB status or network access whitelist."
    });
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
    const passwordError = validatePasswordStrength(password);
    if (passwordError) return res.status(400).json({ success: false, message: passwordError });

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

    const normUser = normalizeUsername(username);
    const existingUsername = await User.findOne({
      $or: [
        { usernameLower: normUser.toLowerCase() },
        { username: new RegExp(`^${escapeRegex(normUser)}$`, "i") }
      ]
    });
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
      name: stripHtmlTags(String(name).trim()),
      username: normUser,
      usernameLower: normUser.toLowerCase(),
      tokenVersion: 0,
      email: normalizeEmail(email),
      subject: targetRole === "faculty" ? primarySubject : "",
      subjects: targetRole === "faculty" ? facultySubjects : [],
      subjectDivisions: targetRole === "faculty" && subjectDivisions && typeof subjectDivisions === "object" ? subjectDivisions : {},
      department: targetRole === "faculty" ? stripHtmlTags(String(department || "Department of Computer Science & Applications").trim()) : "",
      division: targetRole === "faculty" ? stripHtmlTags(String(division || "Both Divisions").trim()) : "",
      profilePic: String(profilePic || ""),
      passwordHash: await hashPassword(password)
    };

    if (targetRole === "student") {
      userObj.division = stripHtmlTags(String(division || "Div A").trim());
      userObj.semester = stripHtmlTags(String(semester || "1st Semester").trim());
      userObj.courseYear = stripHtmlTags(String(courseYear || "1st Year").trim());
      userObj.course = stripHtmlTags(String(course || "Bachelor of Computer Applications (BCA)").trim());
      userObj.languageChoice = stripHtmlTags(String(languageChoice || "Kannada").trim());
      userObj.mathChoice = stripHtmlTags(String(mathChoice || "Mathematics").trim());
    }

    const createdUser = await User.create(userObj);
    invalidateUserCountsCache();
    fileSyncService.triggerSync();
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
    if (!targetUsername || !/^[A-Za-z0-9_.-]{4,30}$/.test(targetUsername)) {
      return res.status(400).json({ success: false, message: "Invalid username format. Must be 4-30 characters [A-Za-z0-9_.-]." });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = req.user.role === targetRole && req.user.username.toLowerCase() === targetUsername.toLowerCase();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: You are not authorized to modify another user's account." });
    }

    const { id, name, username: incomingUser, newUsername, role: newRoleBody, password, currentPassword, email, subject, subjects, subjectDivisions, department, division, semester, courseYear, course, languageChoice, mathChoice, profilePic } = req.body || {};

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
        $or: [
          { usernameLower: targetUsername.toLowerCase() },
          { username: new RegExp(`^${escapeRegex(targetUsername)}$`, "i") }
        ]
      });
      if (!user && id) {
        user = await User.findOne({ role: targetRole, id: String(id) });
      }
    } else {
      // Non-admin can ONLY modify their own authenticated record
      user = await User.findOne({ id: req.user.id, role: req.user.role });
    }
    if (!user) return res.status(404).json({ success: false, message: "Account not found." });

    // Admin role change handling with validation, last-admin guard, and audit log
    if (newRoleBody !== undefined) {
      const candidateRole = String(newRoleBody).trim().toLowerCase();
      if (candidateRole !== user.role) {
        if (!isAdmin) {
          return res.status(403).json({ success: false, message: "Forbidden: You cannot change account roles." });
        }
        if (!validRole(candidateRole)) {
          return res.status(400).json({ success: false, message: `Invalid target role '${candidateRole}'. Allowed roles: student, faculty, admin.` });
        }
        if (user.role === "admin" && candidateRole !== "admin") {
          const adminCount = await User.countDocuments({ role: "admin" });
          if (adminCount <= 1) {
            return res.status(400).json({ success: false, message: "Cannot change role of the last remaining administrator." });
          }
        }
        console.log(`[AUDIT] Admin ${req.user.username} changed role of user ${user.username} from ${user.role} to ${candidateRole} at ${new Date().toISOString()}`);
        user.role = candidateRole;
        // Revoke active sessions for target user upon administrative role change
        user.tokenVersion = (typeof user.tokenVersion === "number" ? user.tokenVersion : 0) + 1;
      }
    }

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
      const takenUser = await User.findOne({
        $or: [
          { usernameLower: nextUsername.toLowerCase() },
          { username: new RegExp(`^${escapeRegex(nextUsername)}$`, "i") }
        ],
        id: { $ne: user.id }
      });
      if (takenUser) return res.status(409).json({ success: false, message: "That username is already in use." });

      const oldUsername = user.username;
      try {
        const oldStoreBackup = await AcademicStore.findOne({ storeKey: "default_academic_store" }).lean();
        const topoType = mongoose.connection?.client?.topology?.description?.type;
        const canUseTransactions = topoType && !["Standalone", "Single"].includes(topoType);

        let session = null;
        if (canUseTransactions) {
          try {
            session = await mongoose.startSession();
            session.startTransaction();
          } catch (_) {
            session = null;
          }
        }

        const runSync = async (opts = {}) => {
          const store = await AcademicStore.findOne({ storeKey: "default_academic_store" }, null, opts);
          if (store) {
            if (store.students && store.students[oldUsername]) {
              store.students[nextUsername] = store.students[oldUsername];
              delete store.students[oldUsername];
              store.markModified("students");
            }
            if (Array.isArray(store.assignments)) {
              store.assignments.forEach(a => {
                if (a.student && a.student.toLowerCase() === oldUsername.toLowerCase()) a.student = nextUsername;
                if (a.facultyUsername && a.facultyUsername.toLowerCase() === oldUsername.toLowerCase()) a.facultyUsername = nextUsername;
              });
              store.markModified("assignments");
            }
            await store.save(opts);
          }
          await Attendance.updateMany({ studentUsername: oldUsername }, { $set: { studentUsername: nextUsername } }, opts);
          await Mark.updateMany({ studentUsername: oldUsername }, { $set: { studentUsername: nextUsername } }, opts);
          await Assignment.updateMany({ student: oldUsername }, { $set: { student: nextUsername } }, opts);
        };

        let completed = false;
        if (session) {
          try {
            await runSync({ session });
            await session.commitTransaction();
            completed = true;
          } catch (txErr) {
            try { await session.abortTransaction(); } catch (_) {}
            if (txErr.code !== 20 && !txErr.message?.includes("replica set")) {
              throw txErr;
            }
          } finally {
            try { session.endSession(); } catch (_) {}
          }
        }

        if (!completed) {
          try {
            await runSync({});
          } catch (syncErr) {
            try {
              await Attendance.updateMany({ studentUsername: nextUsername }, { $set: { studentUsername: oldUsername } });
              await Mark.updateMany({ studentUsername: nextUsername }, { $set: { studentUsername: oldUsername } });
              await Assignment.updateMany({ student: nextUsername }, { $set: { student: oldUsername } });
              if (oldStoreBackup) {
                await AcademicStore.updateOne(
                  { storeKey: "default_academic_store" },
                  { $set: { students: oldStoreBackup.students, assignments: oldStoreBackup.assignments } }
                );
              }
            } catch (rbErr) {
              console.error("Compensating rollback failed:", rbErr.message);
            }
            throw syncErr;
          }
        }
      } catch (syncErr) {
        console.error("Username rename synchronization failed:", syncErr);
        return res.status(500).json({ success: false, message: "Failed to synchronize academic records for renamed username. Changes were rolled back." });
      }
      user.usernameLower = nextUsername.toLowerCase();
    }

    if (nextEmail && nextEmail !== user.email) {
      const takenEmail = await User.findOne({ email: nextEmail, id: { $ne: user.id } });
      if (takenEmail) return res.status(409).json({ success: false, message: "That email address is already in use." });
    }

    // Role-based strict field allowlists
    user.name = stripHtmlTags(String(name || user.name).trim());
    user.username = nextUsername;
    user.usernameLower = nextUsername.toLowerCase();
    if (role !== "admin" || email !== undefined) user.email = nextEmail;
    if (profilePic !== undefined) user.profilePic = String(profilePic);

    if (role === "faculty") {
      if (department !== undefined) user.department = stripHtmlTags(String(department).trim());
      if (division !== undefined) user.division = stripHtmlTags(String(division).trim());

      // Only administrators can assign subjects and divisions to faculty
      if (isAdmin) {
        if (subjects !== undefined && Array.isArray(subjects)) {
          user.subjects = subjects.map(s => stripHtmlTags(String(s).trim())).filter(Boolean);
          if (subject !== undefined && String(subject).trim()) {
            user.subject = stripHtmlTags(String(subject).trim());
          } else if (!user.subjects.includes(user.subject) && user.subjects.length > 0) {
            user.subject = user.subjects[0];
          }
        } else if (subject !== undefined) {
          user.subject = stripHtmlTags(String(subject).trim());
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
      if (division !== undefined) user.division = stripHtmlTags(String(division).trim());
      if (semester !== undefined) user.semester = stripHtmlTags(String(semester).trim());
      if (courseYear !== undefined) user.courseYear = stripHtmlTags(String(courseYear).trim());
      if (course !== undefined) user.course = stripHtmlTags(String(course).trim());
      if (languageChoice !== undefined) user.languageChoice = stripHtmlTags(String(languageChoice).trim());
      if (mathChoice !== undefined) user.mathChoice = stripHtmlTags(String(mathChoice).trim());
    }

    if (password) {
      const pwdErr = validatePasswordStrength(password);
      if (pwdErr) return res.status(400).json({ success: false, message: pwdErr });
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
      // Increment tokenVersion on password change / reset to revoke existing tokens
      user.tokenVersion = (typeof user.tokenVersion === "number" ? user.tokenVersion : 0) + 1;
    }

    await user.save();
    fileSyncService.triggerSync();
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

    const targetUsername = normalizeUsername(decodeURIComponent(username || ""));
    if (!targetUsername || !/^[A-Za-z0-9_.-]{4,30}$/.test(targetUsername)) {
      return res.status(400).json({ success: false, message: "Invalid username format. Must be 4-30 characters [A-Za-z0-9_.-]." });
    }

    // Prohibit self-deletion by an authenticated administrator
    if (req.user && req.user.username && req.user.username.toLowerCase() === targetUsername.toLowerCase()) {
      return res.status(400).json({ success: false, message: "You cannot delete your own administrative account." });
    }

    if (targetRole === "admin") {
      const remainingAdmins = await User.countDocuments({ role: "admin" });
      if (remainingAdmins <= 1) {
        return res.status(400).json({ success: false, message: "The last remaining administrator account cannot be deleted." });
      }
      console.log(`[AUDIT] Admin ${req.user.username} deleted administrator account ${targetUsername} at ${new Date().toISOString()}`);
    }

    // Step 1: Verify target account exists
    const targetUser = await User.findOne({
      role: targetRole,
      $or: [
        { usernameLower: targetUsername.toLowerCase() },
        { username: new RegExp(`^${escapeRegex(targetUsername)}$`, "i") }
      ]
    });

    if (!targetUser) return res.status(404).json({ success: false, message: "Account not found." });

    const canonicalUsername = targetUser.username;
    const userRegex = new RegExp(`^${escapeRegex(canonicalUsername)}$`, "i");

    // Step 2: Cascading cleanup of associated academic records if student
    if (targetRole === "student") {
      // 2a. Clean up AcademicStore state
      const store = await AcademicStore.findOne({ storeKey: "default_academic_store" });
      if (store) {
        if (store.students && typeof store.students === "object") {
          const studentKey = Object.keys(store.students).find(k => k.toLowerCase() === canonicalUsername.toLowerCase()) || canonicalUsername;
          if (store.students[studentKey]) {
            delete store.students[studentKey];
            store.markModified("students");
          }
        }
        if (Array.isArray(store.assignments)) {
          store.assignments = store.assignments.filter(a => (a.student || "").toLowerCase() !== canonicalUsername.toLowerCase());
          store.markModified("assignments");
        }
        if (Array.isArray(store.deletedAssignments)) {
          store.deletedAssignments = store.deletedAssignments.filter(k => !String(k || "").toLowerCase().startsWith(`${canonicalUsername.toLowerCase()}___`));
          store.markModified("deletedAssignments");
        }
        if (Array.isArray(store.dailyAttendance)) {
          let dailyAttModified = false;
          store.dailyAttendance.forEach(att => {
            if (att && att.records && typeof att.records === "object") {
              const matchedKey = Object.keys(att.records).find(k => k.toLowerCase() === canonicalUsername.toLowerCase());
              if (matchedKey) {
                delete att.records[matchedKey];
                dailyAttModified = true;
              }
            }
          });
          if (dailyAttModified) {
            store.markModified("dailyAttendance");
          }
        }
        await store.save();
      }

      // 2b. Clean up dedicated collections using verified schema relationships
      // Remove student-assigned assignments
      await Assignment.deleteMany({ student: userRegex });

      // Pull student submissions from class-wide assignments
      await Assignment.updateMany(
        { "submissions.studentUsername": userRegex },
        { $pull: { submissions: { studentUsername: userRegex } } }
      );

      // Remove student attendance records
      await Attendance.deleteMany({ studentUsername: userRegex });

      // Remove student mark records
      await Mark.deleteMany({ studentUsername: userRegex });
    }

    // Step 3: Remove user-owned PushSubscription records (strictly scoped to target user)
    await PushSubscription.deleteMany({
      role: targetRole,
      $or: [
        { username: userRegex },
        { userId: targetUser.id || String(targetUser._id) }
      ]
    });

    // Step 4: Delete the User document itself
    const deleteResult = await User.deleteOne({ _id: targetUser._id });
    if (deleteResult.deletedCount === 0) {
      return res.status(500).json({ success: false, message: "Failed to remove user account." });
    }

    // Step 5: Invalidate caches and trigger synchronization
    invalidateUserCountsCache();
    fileSyncService.triggerSync();

    const remaining = await User.countDocuments();
    res.json({ success: true, message: "Account and details removed permanently from MongoDB.", remaining });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Unable to delete the user." });
  }
});

// Per-account login throttling store (keyed by IP+username AND username-only) with exponential backoff
const accountLoginFailures = new Map();
const accountThrottleCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of accountLoginFailures.entries()) {
    if (now - record.lastFailure > 15 * 60 * 1000) {
      accountLoginFailures.delete(key);
    }
  }
}, 60000);
if (accountThrottleCleanupTimer.unref) accountThrottleCleanupTimer.unref();

// Dummy scrypt hash strictly matching real scrypt parameters (64 bytes derived, 16-byte salt, N=16384, r=8, p=1)
const DUMMY_SCRYPT_SALT = Buffer.alloc(16, 0x42).toString("base64url");
const DUMMY_SCRYPT_HASH = Buffer.alloc(64, 0x42).toString("base64url");
const DUMMY_SCRYPT_STRING = `scrypt$16384$8$1$${DUMMY_SCRYPT_SALT}$${DUMMY_SCRYPT_HASH}`;

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

    const normUsername = normalizeUsername(username).toLowerCase();
    const clientIp = normalizeClientIp(req.ip || req.socket?.remoteAddress || "unknown");
    const ipUserKey = `ip:${clientIp}:${normUsername}`;
    const userOnlyKey = `user:${normUsername}`;

    const ipUserRecord = accountLoginFailures.get(ipUserKey);
    const userOnlyRecord = accountLoginFailures.get(userOnlyKey);

    // 1. IP + username throttle (threshold 5 failures with exponential backoff)
    if (ipUserRecord && ipUserRecord.count >= 5) {
      const delayMs = Math.min(15 * 60 * 1000, Math.pow(2, ipUserRecord.count - 5) * 1000);
      const elapsed = Date.now() - ipUserRecord.lastFailure;
      if (elapsed < delayMs) {
        const retryAfterSeconds = Math.ceil((delayMs - elapsed) / 1000);
        res.setHeader("Retry-After", retryAfterSeconds);
        return res.status(429).json({
          success: false,
          message: `Too many failed login attempts for this account. Please retry in ${retryAfterSeconds} seconds.`,
          retryAfter: retryAfterSeconds
        });
      }
    }

    // 2. Username-only throttle (threshold 15 failures across rotating IPs)
    if (userOnlyRecord && userOnlyRecord.count >= 15) {
      const delayMs = Math.min(15 * 60 * 1000, Math.pow(2, userOnlyRecord.count - 15) * 1000);
      const elapsed = Date.now() - userOnlyRecord.lastFailure;
      if (elapsed < delayMs) {
        const retryAfterSeconds = Math.ceil((delayMs - elapsed) / 1000);
        res.setHeader("Retry-After", retryAfterSeconds);
        return res.status(429).json({
          success: false,
          message: `Too many failed login attempts for this account. Please retry in ${retryAfterSeconds} seconds.`,
          retryAfter: retryAfterSeconds
        });
      }
    }

    const user = await User.findOne({
      role,
      $or: [
        { usernameLower: normUsername },
        { username: new RegExp(`^${escapeRegex(normalizeUsername(username))}$`, "i") }
      ]
    });

    let isMatch = false;
    if (user && user.passwordHash) {
      isMatch = await verifyPassword(password, user.passwordHash);
    } else {
      // Dummy check with exact parameter & length equalization against username enumeration
      await verifyPassword(password, DUMMY_SCRYPT_STRING);
    }

    if (!user || !isMatch) {
      const now = Date.now();
      const curIp = accountLoginFailures.get(ipUserKey) || { count: 0, lastFailure: 0 };
      curIp.count += 1;
      curIp.lastFailure = now;
      accountLoginFailures.set(ipUserKey, curIp);

      const curUser = accountLoginFailures.get(userOnlyKey) || { count: 0, lastFailure: 0 };
      curUser.count += 1;
      curUser.lastFailure = now;
      accountLoginFailures.set(userOnlyKey, curUser);

      return res.status(401).json({ success: false, message: "Invalid username or password." });
    }

    // Reset account throttle records on successful authentication for this user only
    accountLoginFailures.delete(ipUserKey);
    accountLoginFailures.delete(userOnlyKey);

    const token = generateAuthToken(user);
    res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Unable to log in right now." });
  }
});

app.post("/api/auth/logout", requireAuth(), async (req, res) => {
  try {
    if (req.user && req.user.id) {
      // Increment tokenVersion on logout to invalidate any issued tokens
      await User.updateOne({ id: req.user.id }, { $inc: { tokenVersion: 1 } });
    }
    res.json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    res.json({ success: true, message: "Logged out." });
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

    fileSyncService.triggerSync();
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

    fileSyncService.triggerSync();
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

    fileSyncService.triggerSync();
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
    let store = await AcademicStore.findOne({ storeKey: "default_academic_store" });
    if (!store) {
      store = new AcademicStore({
        storeKey: "default_academic_store",
        students: {},
        notices: [],
        assignments: [],
        notes: [],
        dailyAttendance: []
      });
    }
    if (!store.students) store.students = {};
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
    recalculateOverallAttendance(daily, store.students, cleanSub);
    store.markModified("students");
    store.markModified("dailyAttendance");
    await store.save();

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

const DEFAULT_COURSE_YEAR_DIVISIONS = {
  "1st Year": ["Div A", "Div B"],
  "2nd Year": ["Div A", "Div B"],
  "3rd Year": ["Div A", "Div B"]
};

function normalizeStoreDivisions(divisions) {
  const defaultDivs = { ...DEFAULT_COURSE_YEAR_DIVISIONS };
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

// Public endpoint for reading class divisions configuration
app.get("/api/academic/divisions", async (req, res) => {
  try {
    let store = await AcademicStore.findOne({ storeKey: "default_academic_store" }).lean();
    const divisions = store ? normalizeStoreDivisions(store.divisions) : DEFAULT_COURSE_YEAR_DIVISIONS;
    return res.json({ success: true, divisions });
  } catch (err) {
    return res.json({ success: true, divisions: DEFAULT_COURSE_YEAR_DIVISIONS });
  }
});

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

    // 1. Hard payload size guard well below 16MB BSON limit (5MB max)
    const rawPayloadStr = JSON.stringify(payload);
    if (Buffer.byteLength(rawPayloadStr, "utf8") > 5 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        message: "Academic sync payload exceeds maximum allowed size limit of 5MB."
      });
    }

    // 2. Validate payload structure before database modifications
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

    // 3. Per-student, per-subject validated merges (replaces blanket merge)
    if (payload.students && typeof payload.students === "object") {
      const mergedStudents = { ...(existingStore?.students || {}) };
      for (const [studentKey, studentData] of Object.entries(payload.students)) {
        if (!studentData || typeof studentData !== "object") continue;
        const existingStudent = mergedStudents[studentKey] || { marks: {} };
        const updatedStudent = { ...existingStudent };

        if (req.user.role === "admin") {
          for (const [prop, val] of Object.entries(studentData)) {
            if (prop !== "marks") {
              updatedStudent[prop] = val;
            }
          }
        } else {
          if (!updatedStudent.name && studentData.name) updatedStudent.name = stripHtmlTags(String(studentData.name));
          if (!updatedStudent.division && studentData.division) updatedStudent.division = stripHtmlTags(String(studentData.division));
        }

        if (studentData.marks && typeof studentData.marks === "object") {
          updatedStudent.marks = { ...(existingStudent.marks || {}) };
          for (const [subId, markVal] of Object.entries(studentData.marks)) {
            if (req.user.role === "faculty") {
              const subAuth = validateFacultyAttendanceAuthorization(
                req.user,
                subId,
                studentData.division || updatedStudent.division,
                studentData.semester || updatedStudent.semester
              );
              if (!subAuth.authorized) {
                return res.status(403).json({
                  success: false,
                  message: `Unauthorized: Faculty cannot modify marks for unassigned subject '${subId}'. ${subAuth.reason}`
                });
              }
            }
            updatedStudent.marks[subId] = markVal;
          }
        }
        mergedStudents[studentKey] = updatedStudent;
      }
      update.students = mergedStudents;
    }

    // 4. Notices: faculty authorization, notice authorship, and role escalation guard
    if (Array.isArray(payload.notices)) {
      const existingNoticeMap = new Map();
      (existingStore?.notices || []).forEach(n => {
        if (n) existingNoticeMap.set(String(n.id || n.noticeId || n.title), n);
      });

      for (const n of payload.notices) {
        if (!n || typeof n !== "object") continue;
        // Non-admin can NEVER set authorRole to "admin" - strictly enforce and sanitize to their role
        if (req.user.role !== "admin" && n.authorRole === "admin") {
          n.authorRole = "faculty";
        }
        // Faculty may only overwrite notices they authored
        const noticeKey = String(n.id || n.noticeId || n.title);
        const existingNotice = existingNoticeMap.get(noticeKey);
        if (existingNotice && req.user.role === "faculty") {
          const isOwn = (existingNotice.authorUsername && existingNotice.authorUsername.toLowerCase() === req.user.username.toLowerCase()) ||
                        (existingNotice.author && existingNotice.author.toLowerCase() === req.user.name.toLowerCase());
          if (!isOwn || existingNotice.authorRole === "admin") {
            return res.status(403).json({
              success: false,
              message: "Forbidden: Faculty cannot overwrite notices authored by other faculty or administrators."
            });
          }
        }
      }

      const sanitizedNotices = payload.notices.map(n => ({
        ...n,
        title: stripHtmlTags(n.title),
        text: stripHtmlTags(n.text),
        content: stripHtmlTags(n.content || n.text),
        author: req.user.role === "faculty" ? req.user.name : (n.author || req.user.name),
        authorUsername: req.user.role === "faculty" ? req.user.username : (n.authorUsername || req.user.username),
        authorRole: req.user.role === "admin" ? (n.authorRole || "admin") : "faculty"
      }));

      const noticeMap = new Map();
      (existingStore?.notices || []).forEach(n => {
        if (n) noticeMap.set(String(n.id || n.noticeId || n.title), n);
      });
      sanitizedNotices.forEach(n => {
        if (n) noticeMap.set(String(n.id || n.noticeId || n.title), n);
      });

      if (Array.isArray(payload.deletedNotices)) {
        for (const delId of payload.deletedNotices) {
          const delKey = String(delId);
          const existingNotice = noticeMap.get(delKey);
          if (existingNotice && req.user.role === "faculty") {
            const isOwn = (existingNotice.authorUsername && existingNotice.authorUsername.toLowerCase() === req.user.username.toLowerCase()) ||
                          (existingNotice.author && existingNotice.author.toLowerCase() === req.user.name.toLowerCase());
            if (!isOwn || existingNotice.authorRole === "admin") {
              return res.status(403).json({
                success: false,
                message: "Forbidden: Faculty cannot delete notices authored by other faculty or administrators."
              });
            }
          }
          noticeMap.delete(delKey);
        }
      }
      update.notices = Array.from(noticeMap.values());
    }

    // 5. Daily Attendance
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

    // 6. Assignments: faculty ownership validation & stripping embedded base64 content
    if (Array.isArray(payload.assignments)) {
      for (const a of payload.assignments) {
        if (!a || typeof a !== "object") continue;
        if (req.user.role === "faculty") {
          const authCheck = validateFacultyAttendanceAuthorization(req.user, a.subject, a.division, a.semester);
          if (!authCheck.authorized) {
            return res.status(403).json({
              success: false,
              message: `Unauthorized: Faculty cannot create/modify assignments for unassigned subject '${a.subject}'. ${authCheck.reason}`
            });
          }
          const asgnKey = `${a.id}_${a.student || ""}`;
          const existingAsgn = (existingStore?.assignments || []).find(ex => `${ex.id}_${ex.student || ""}` === asgnKey);
          if (existingAsgn) {
            const isOwn = (existingAsgn.authorUsername && existingAsgn.authorUsername.toLowerCase() === req.user.username.toLowerCase()) ||
                          (existingAsgn.createdBy && existingAsgn.createdBy.toLowerCase() === req.user.username.toLowerCase()) ||
                          (existingAsgn.facultyUsername && existingAsgn.facultyUsername.toLowerCase() === req.user.username.toLowerCase()) ||
                          (!existingAsgn.authorUsername && !existingAsgn.createdBy && !existingAsgn.facultyUsername);
            if (!isOwn) {
              return res.status(403).json({
                success: false,
                message: "Forbidden: Faculty cannot overwrite assignments created by other faculty."
              });
            }
          }
        }
        // Save base64 file payloads as managed files under UPLOAD_DIR/attachments
        if (a.fileData && String(a.fileData).startsWith("data:")) {
          const saved = processAttachmentDataUrl(a.fileData, a.fileName);
          if (saved) {
            a.fileData = saved.url;
            a.attachmentPath = saved.filename;
          } else {
            delete a.fileData;
          }
        }
      }

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

    // 7. Notes: faculty ownership validation & managed attachment storage
    if (Array.isArray(payload.notes)) {
      for (const n of payload.notes) {
        if (!n || typeof n !== "object") continue;
        if (req.user.role === "faculty") {
          const authCheck = validateFacultyAttendanceAuthorization(req.user, n.subject, n.division, n.semester);
          if (!authCheck.authorized) {
            return res.status(403).json({
              success: false,
              message: `Unauthorized: Faculty cannot create/modify notes for unassigned subject '${n.subject}'. ${authCheck.reason}`
            });
          }
          const existingNote = (existingStore?.notes || []).find(ex => ex && ex.id === n.id);
          if (existingNote) {
            const isOwn = (existingNote.authorUsername && existingNote.authorUsername.toLowerCase() === req.user.username.toLowerCase()) ||
                          (existingNote.uploadedBy && existingNote.uploadedBy.toLowerCase() === req.user.username.toLowerCase()) ||
                          (!existingNote.authorUsername && !existingNote.uploadedBy);
            if (!isOwn) {
              return res.status(403).json({
                success: false,
                message: "Forbidden: Faculty cannot overwrite notes uploaded by other faculty."
              });
            }
          }
        }
        // Save base64 file payloads as managed files under UPLOAD_DIR/attachments
        if (n.fileData && String(n.fileData).startsWith("data:")) {
          const saved = processAttachmentDataUrl(n.fileData, n.fileName);
          if (saved) {
            n.fileData = saved.url;
            n.attachmentPath = saved.filename;
          } else {
            delete n.fileData;
          }
        }
      }

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

    // Privileged admin-only structural synchronizations with sanitization
    if (req.user.role === "admin") {
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
      if (Array.isArray(payload.subjects)) {
        update.subjects = payload.subjects.map(s => {
          if (typeof s === "string") return stripHtmlTags(s);
          if (typeof s === "object" && s) {
            return {
              ...s,
              id: stripHtmlTags(s.id),
              name: stripHtmlTags(s.name),
              short: stripHtmlTags(s.short)
            };
          }
          return s;
        });
      }
      if (payload.divisions) update.divisions = normalizeStoreDivisions(payload.divisions);
    }

    if (update.dailyAttendance && (update.students || existingStore?.students)) {
      update.students = update.students || { ...(existingStore?.students || {}) };
      recalculateOverallAttendance(update.dailyAttendance, update.students);
    }

    // Optimistic Concurrency with retry on VersionError
    let saveRetries = 3;
    let savedStore = null;
    while (saveRetries > 0) {
      try {
        let storeDoc = await AcademicStore.findOne({ storeKey: "default_academic_store" });
        if (!storeDoc) {
          storeDoc = new AcademicStore({ storeKey: "default_academic_store", ...update });
        } else {
          Object.assign(storeDoc, update);
        }
        savedStore = await storeDoc.save();
        break;
      } catch (err) {
        if (err.name === "VersionError" && saveRetries > 1) {
          saveRetries--;
          console.warn(`[AcademicStore] Version conflict encountered during sync. Retrying (${saveRetries} retries remaining)...`);
          continue;
        }
        if (err.status === 413 || err.statusCode === 413) {
          return res.status(413).json({
            success: false,
            message: err.message || "Academic store document exceeds maximum document limit (16MB)."
          });
        }
        throw err;
      }
    }

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

    fileSyncService.triggerSync();
    res.json({ success: true, message: "Academic data permanently saved to MongoDB!" });
  } catch (error) {
    console.error("Sync academic data error:", error);
    res.status(500).json({ success: false, message: "Failed to sync academic data." });
  }
});

// Authenticated Academic File Attachment Endpoint with nosniff, magic byte validation, and student authorization
app.get("/api/academic/attachments/:filename", requireAuth(), async (req, res) => {
  try {
    const filename = req.params.filename;
    if (!filename || !/^[A-Za-z0-9_.-]+$/.test(filename) || filename.includes("..")) {
      return res.status(400).json({ success: false, message: "Invalid attachment filename." });
    }

    const filePath = path.join(ATTACHMENT_BASE_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Attachment not found." });
    }

    const mimeType = verifyAttachmentMagicBytes(filePath) || "application/octet-stream";

    // Authorization check: Admins and faculty have full access; students may only download their own or their division's files
    const user = req.user;
    if (user.role === "student") {
      const store = await AcademicStore.findOne({ storeKey: "default_academic_store" }).lean();
      let authorized = false;

      // 1. Check notes
      const matchingNote = (store?.notes || []).find(n => n && (n.attachmentPath === filename || (n.fileData && n.fileData.includes(filename))));
      if (matchingNote) {
        const noteDiv = (matchingNote.division || "").toLowerCase();
        const userDiv = (user.division || "").toLowerCase();
        if (!noteDiv || noteDiv === "all divisions" || noteDiv === "all" || noteDiv === userDiv) {
          authorized = true;
        }
      }

      // 2. Check assignments
      if (!authorized) {
        const matchingAssign = (store?.assignments || []).find(a => a && (a.attachmentPath === filename || (a.fileData && a.fileData.includes(filename))));
        if (matchingAssign) {
          const assignStudent = (matchingAssign.student || "").toLowerCase();
          const assignDiv = (matchingAssign.division || "").toLowerCase();
          const userDiv = (user.division || "").toLowerCase();
          if (assignStudent === user.username.toLowerCase() || !assignDiv || assignDiv === "all" || assignDiv === userDiv) {
            authorized = true;
          }
        }
      }

      // 3. Check notices
      if (!authorized) {
        const matchingNotice = (store?.notices || []).find(n => n && (n.attachmentPath === filename || (n.fileData && n.fileData.includes(filename))));
        if (matchingNotice) {
          authorized = true;
        }
      }

      if (!authorized) {
        return res.status(403).json({ success: false, message: "Access forbidden: You are not authorized to download this attachment." });
      }
    } else if (user.role !== "admin" && user.role !== "faculty") {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.sendFile(filePath);
  } catch (err) {
    console.error("Attachment retrieval error:", err.message);
    res.status(500).json({ success: false, message: "Error downloading attachment." });
  }
});

// --- Student & Faculty Assignment Submission Status Update ---
app.post("/api/academic/assignment-status", rateLimitExpensive, requireAuth(), async (req, res) => {
  try {
    const { studentUsername, title, subject, due, status } = req.body || {};
    if (!studentUsername || !title || !status) {
      return res.status(400).json({ success: false, message: "studentUsername, title, and status are required." });
    }
    const cleanStatus = stripHtmlTags(String(status)).trim();
    if (!["Pending", "Submitted"].includes(cleanStatus)) {
      return res.status(400).json({ success: false, message: "Status must be 'Pending' or 'Submitted'." });
    }

    const isStudent = req.user.role === "student";
    // Students can strictly only update their own assignments
    if (isStudent && req.user.username.toLowerCase() !== String(studentUsername).trim().toLowerCase()) {
      return res.status(403).json({ success: false, message: "Forbidden: Students can only update their own assignments." });
    }

    const normUser = String(studentUsername).trim().toLowerCase();
    const normTitle = String(title).trim().toLowerCase();
    const todayISO = new Date().toISOString().split("T")[0];

    // 1. Update in AcademicStore.assignments
    const store = await AcademicStore.findOne({ storeKey: "default_academic_store" });
    let updatedAssign = null;
    if (store && Array.isArray(store.assignments)) {
      const target = store.assignments.find(a =>
        String(a.student || "").trim().toLowerCase() === normUser &&
        String(a.title || "").trim().toLowerCase() === normTitle &&
        (!due || String(a.due || "").trim() === String(due).trim())
      );
      if (target) {
        target.status = cleanStatus;
        target.submittedDate = cleanStatus === "Submitted" ? (target.submittedDate || todayISO) : "";
        store.markModified("assignments");
        await store.save();
        updatedAssign = target;
      }
    }

    // 2. Update in dedicated Assignment collection
    await Assignment.updateOne(
      {
        student: new RegExp(`^${escapeRegex(studentUsername)}$`, "i"),
        title: new RegExp(`^${escapeRegex(title)}$`, "i")
      },
      {
        $set: {
          status: cleanStatus,
          submittedDate: cleanStatus === "Submitted" ? todayISO : ""
        }
      }
    );

    // 3. Automatically sync to code files in repository
    fileSyncService.triggerSync();

    return res.json({
      success: true,
      message: `Assignment status updated to '${cleanStatus}'.`,
      assignment: updatedAssign
    });
  } catch (err) {
    console.error("Assignment status update error:", err);
    return res.status(500).json({ success: false, message: "Failed to update assignment status." });
  }
});

// --- Administrator Academic Divisions Cascade Synchronization ---
app.post("/api/academic/divisions/cascade", rateLimitExpensive, requireAuth(["admin"]), async (req, res) => {
  try {
    const { action, courseYear, oldDivision, newDivision, fallbackDivision } = req.body || {};
    if (!action || !["add", "rename", "delete"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action. Allowed values: 'add', 'rename', 'delete'." });
    }

    const yr = stripHtmlTags(String(courseYear || "1st Year")).trim();
    const validYears = ["1st Year", "2nd Year", "3rd Year", "All Years"];
    if (!validYears.includes(yr)) {
      return res.status(400).json({ success: false, message: "Invalid course year." });
    }

    const targetYears = yr === "All Years" ? ["1st Year", "2nd Year", "3rd Year"] : [yr];
    const yearSemestersMap = {
      "1st Year": ["1st Semester", "2nd Semester"],
      "2nd Year": ["3rd Semester", "4th Semester"],
      "3rd Year": ["5th Semester", "6th Semester"]
    };
    const targetSemesters = targetYears.flatMap(y => yearSemestersMap[y] || []);

    const cleanOldDiv = oldDivision ? stripHtmlTags(String(oldDivision)).trim() : "";
    const cleanNewDiv = newDivision ? stripHtmlTags(String(newDivision)).trim() : "";
    const cleanFallback = fallbackDivision ? stripHtmlTags(String(fallbackDivision)).trim() : "";

    let store = await AcademicStore.findOne({ storeKey: "default_academic_store" });
    if (!store) {
      store = new AcademicStore({ storeKey: "default_academic_store" });
    }
    const currentDivs = normalizeStoreDivisions(store.divisions);

    if (action === "add") {
      if (!cleanNewDiv) {
        return res.status(400).json({ success: false, message: "New division name is required." });
      }
      targetYears.forEach(y => {
        if (!Array.isArray(currentDivs[y])) currentDivs[y] = ["Div A", "Div B"];
        if (!currentDivs[y].some(d => d.toLowerCase() === cleanNewDiv.toLowerCase())) {
          currentDivs[y].push(cleanNewDiv);
        }
      });
      store.divisions = currentDivs;
      store.markModified("divisions");
      await store.save();

      fileSyncService.triggerSync();
      return res.json({
        success: true,
        message: `Division '${cleanNewDiv}' added successfully.`,
        divisions: currentDivs
      });
    }

    if (action === "rename") {
      if (!cleanOldDiv || !cleanNewDiv) {
        return res.status(400).json({ success: false, message: "Old division and new division names are required." });
      }
      if (cleanOldDiv.toLowerCase() === cleanNewDiv.toLowerCase()) {
        return res.json({ success: true, message: "Division name unchanged.", divisions: currentDivs });
      }

      // 1. Update AcademicStore divisions
      targetYears.forEach(y => {
        if (Array.isArray(currentDivs[y])) {
          currentDivs[y] = currentDivs[y].map(d => d.toLowerCase() === cleanOldDiv.toLowerCase() ? cleanNewDiv : d);
        }
      });
      store.divisions = currentDivs;

      // 2. Cascade in AcademicStore sub-arrays
      if (Array.isArray(store.timetable)) {
        store.timetable.forEach(t => {
          if (t && t.division && t.division.toLowerCase() === cleanOldDiv.toLowerCase()) {
            t.division = cleanNewDiv;
          }
        });
        store.markModified("timetable");
      }
      if (Array.isArray(store.assignments)) {
        store.assignments.forEach(a => {
          if (a && a.targetDivision && a.targetDivision.toLowerCase() === cleanOldDiv.toLowerCase()) {
            a.targetDivision = cleanNewDiv;
          }
        });
        store.markModified("assignments");
      }
      if (Array.isArray(store.dailyAttendance)) {
        store.dailyAttendance.forEach(att => {
          if (att && att.division && att.division.toLowerCase() === cleanOldDiv.toLowerCase()) {
            att.division = cleanNewDiv;
          }
        });
        store.markModified("dailyAttendance");
      }
      if (Array.isArray(store.notes)) {
        store.notes.forEach(n => {
          if (n && n.division && n.division.toLowerCase() === cleanOldDiv.toLowerCase()) {
            n.division = cleanNewDiv;
          }
        });
        store.markModified("notes");
      }
      if (Array.isArray(store.notices)) {
        store.notices.forEach(n => {
          if (n && n.targetDivision && n.targetDivision.toLowerCase() === cleanOldDiv.toLowerCase()) {
            n.targetDivision = cleanNewDiv;
          }
        });
        store.markModified("notices");
      }
      store.markModified("divisions");
      await store.save();

      // 3. Cascade in MongoDB User collection (Students)
      const oldDivRegex = new RegExp(`^${escapeRegex(cleanOldDiv)}$`, "i");
      await User.updateMany(
        {
          role: "student",
          division: oldDivRegex,
          $or: [
            { courseYear: { $in: targetYears } },
            { semester: { $in: targetSemesters } }
          ]
        },
        { $set: { division: cleanNewDiv } }
      );

      // 4. Cascade in MongoDB User collection (Faculty)
      await User.updateMany(
        {
          role: "faculty",
          division: oldDivRegex
        },
        { $set: { division: cleanNewDiv } }
      );
      const facultyWithSubDivs = await User.find({ role: "faculty" });
      for (const fac of facultyWithSubDivs) {
        let changed = false;
        let subDivs = fac.subjectDivisions;
        if (subDivs instanceof Map) {
          subDivs = Object.fromEntries(subDivs);
        }
        if (subDivs && typeof subDivs === "object") {
          const updatedSubDivs = { ...subDivs };
          for (const [subKey, divVal] of Object.entries(subDivs)) {
            if (divVal && String(divVal).toLowerCase() === cleanOldDiv.toLowerCase()) {
              updatedSubDivs[subKey] = cleanNewDiv;
              changed = true;
            }
          }
          if (changed) {
            fac.subjectDivisions = updatedSubDivs;
            fac.markModified("subjectDivisions");
            await fac.save();
          }
        }
      }

      // 5. Cascade in Timetable collection
      await Timetable.updateMany(
        {
          semester: { $in: targetSemesters },
          division: oldDivRegex
        },
        { $set: { division: cleanNewDiv } }
      );

      // 6. Cascade in Attendance collection
      await Attendance.updateMany(
        {
          division: oldDivRegex,
          $or: [
            { courseYear: { $in: targetYears } },
            { semester: { $in: targetSemesters } }
          ]
        },
        { $set: { division: cleanNewDiv } }
      );

      // 7. Cascade in Assignment, Note, Notice collections
      await Assignment.updateMany(
        { targetDivision: oldDivRegex },
        { $set: { targetDivision: cleanNewDiv } }
      );
      await Note.updateMany(
        { division: oldDivRegex },
        { $set: { division: cleanNewDiv } }
      );
      await Notice.updateMany(
        { targetDivision: oldDivRegex },
        { $set: { targetDivision: cleanNewDiv } }
      );

      fileSyncService.triggerSync();
      return res.json({
        success: true,
        message: `Division '${cleanOldDiv}' successfully renamed to '${cleanNewDiv}' and synchronized across all records.`,
        divisions: currentDivs
      });
    }

    if (action === "delete") {
      if (!cleanOldDiv) {
        return res.status(400).json({ success: false, message: "Division to delete is required." });
      }

      for (const y of targetYears) {
        const remaining = (currentDivs[y] || []).filter(d => d.toLowerCase() !== cleanOldDiv.toLowerCase());
        if (remaining.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Cannot delete division: At least one division must remain configured for ${y}.`
          });
        }
      }

      const effectiveFallback = cleanFallback || targetYears.map(y => currentDivs[y].find(d => d.toLowerCase() !== cleanOldDiv.toLowerCase()))[0] || "Div A";

      // 1. Update AcademicStore divisions
      targetYears.forEach(y => {
        if (Array.isArray(currentDivs[y])) {
          currentDivs[y] = currentDivs[y].filter(d => d.toLowerCase() !== cleanOldDiv.toLowerCase());
        }
      });
      store.divisions = currentDivs;

      // 2. Cascade AcademicStore sub-arrays
      if (Array.isArray(store.timetable)) {
        store.timetable = store.timetable.map(t => {
          if (t && t.division && t.division.toLowerCase() === cleanOldDiv.toLowerCase()) {
            return { ...t, division: effectiveFallback };
          }
          return t;
        });
        store.markModified("timetable");
      }
      if (Array.isArray(store.assignments)) {
        store.assignments.forEach(a => {
          if (a && a.targetDivision && a.targetDivision.toLowerCase() === cleanOldDiv.toLowerCase()) {
            a.targetDivision = "All Divisions";
          }
        });
        store.markModified("assignments");
      }
      if (Array.isArray(store.dailyAttendance)) {
        store.dailyAttendance.forEach(att => {
          if (att && att.division && att.division.toLowerCase() === cleanOldDiv.toLowerCase()) {
            att.division = effectiveFallback;
          }
        });
        store.markModified("dailyAttendance");
      }
      if (Array.isArray(store.notes)) {
        store.notes.forEach(n => {
          if (n && n.division && n.division.toLowerCase() === cleanOldDiv.toLowerCase()) {
            n.division = "All Divisions";
          }
        });
        store.markModified("notes");
      }
      if (Array.isArray(store.notices)) {
        store.notices.forEach(n => {
          if (n && n.targetDivision && n.targetDivision.toLowerCase() === cleanOldDiv.toLowerCase()) {
            n.targetDivision = "all";
          }
        });
        store.markModified("notices");
      }
      store.markModified("divisions");
      await store.save();

      // 3. Cascade Students to fallback division
      const oldDivRegex = new RegExp(`^${escapeRegex(cleanOldDiv)}$`, "i");
      await User.updateMany(
        {
          role: "student",
          division: oldDivRegex,
          $or: [
            { courseYear: { $in: targetYears } },
            { semester: { $in: targetSemesters } }
          ]
        },
        { $set: { division: effectiveFallback } }
      );

      // 4. Cascade Faculty
      await User.updateMany(
        {
          role: "faculty",
          division: oldDivRegex
        },
        { $set: { division: effectiveFallback } }
      );
      const facultyWithSubDivs = await User.find({ role: "faculty" });
      for (const fac of facultyWithSubDivs) {
        let changed = false;
        let subDivs = fac.subjectDivisions;
        if (subDivs instanceof Map) {
          subDivs = Object.fromEntries(subDivs);
        }
        if (subDivs && typeof subDivs === "object") {
          const updatedSubDivs = { ...subDivs };
          for (const [subKey, divVal] of Object.entries(subDivs)) {
            if (divVal && String(divVal).toLowerCase() === cleanOldDiv.toLowerCase()) {
              updatedSubDivs[subKey] = effectiveFallback;
              changed = true;
            }
          }
          if (changed) {
            fac.subjectDivisions = updatedSubDivs;
            fac.markModified("subjectDivisions");
            await fac.save();
          }
        }
      }

      // 5. Cascade Timetable collection
      for (const sem of targetSemesters) {
        const fallbackDoc = await Timetable.findOne({ semester: sem, division: effectiveFallback });
        if (fallbackDoc) {
          await Timetable.deleteMany({ semester: sem, division: oldDivRegex });
        } else {
          await Timetable.updateMany({ semester: sem, division: oldDivRegex }, { $set: { division: effectiveFallback } });
        }
      }

      // 6. Cascade Attendance collection
      await Attendance.updateMany(
        {
          division: oldDivRegex,
          $or: [
            { courseYear: { $in: targetYears } },
            { semester: { $in: targetSemesters } }
          ]
        },
        { $set: { division: effectiveFallback } }
      );

      // 7. Cascade Assignment, Note, Notice collections
      await Assignment.updateMany(
        { targetDivision: oldDivRegex },
        { $set: { targetDivision: "All Divisions" } }
      );
      await Note.updateMany(
        { division: oldDivRegex },
        { $set: { division: "All Divisions" } }
      );
      await Notice.updateMany(
        { targetDivision: oldDivRegex },
        { $set: { targetDivision: "all" } }
      );

      fileSyncService.triggerSync();
      return res.json({
        success: true,
        message: `Division '${cleanOldDiv}' successfully deleted. Students and academic records reassigned to '${effectiveFallback}'.`,
        divisions: currentDivs
      });
    }
  } catch (err) {
    console.error("Division cascade error:", err);
    res.status(500).json({ success: false, message: "Failed to cascade division change." });
  }
});

// ============================================================================
// COURSES & SYLLABUS MANAGEMENT API (Admin + Student/Faculty + PDF)
// ============================================================================

const ALL_YEARS_METADATA = [
  {
    yearLevel: 1,
    yearTitle: "First Year BCA",
    academicYear: "2025–26",
    semesterLabel: "Semester I & II",
    semesters: [1, 2],
    semester: 1
  },
  {
    yearLevel: 2,
    yearTitle: "Second Year BCA",
    academicYear: "2026–27",
    semesterLabel: "Semester III & IV",
    semesters: [3, 4],
    semester: 2
  },
  {
    yearLevel: 3,
    yearTitle: "Third Year BCA",
    academicYear: "2027–28",
    semesterLabel: "Semester V & VI",
    semesters: [5, 6],
    semester: 3
  }
];

function resolveYearLevel(param) {
  return extractYearLevel(param);
}

function formatSyllabus(doc) {
  if (!doc) return null;
  const size = Number(doc.fileSize || 0);
  let formattedSize = "0 B";
  if (size >= 1024 * 1024) {
    formattedSize = (size / (1024 * 1024)).toFixed(1) + " MB";
  } else if (size >= 1024) {
    formattedSize = Math.round(size / 1024) + " KB";
  } else {
    formattedSize = size + " B";
  }

  const config = VALID_YEAR_CONFIG[doc.yearLevel] || {};

  return {
    yearLevel: doc.yearLevel,
    yearTitle: doc.yearTitle || config.yearTitle || `Year ${doc.yearLevel} BCA`,
    academicYear: doc.academicYear || config.academicYear || "",
    semesterLabel: doc.semesterLabel || config.semesterLabel || "",
    semesters: config.semesters || [],
    semester: doc.semester || doc.yearLevel,
    isUploaded: true,
    originalFilename: doc.originalFilename,
    fileSize: doc.fileSize,
    formattedSize,
    mimeType: doc.mimeType || "application/pdf",
    uploadedBy: doc.uploadedBy || "admin",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

// GET /api/syllabus - Returns 3 year cards syllabus metadata for authenticated users
app.get("/api/syllabus", requireAuth(), async (req, res) => {
  try {
    const docs = await Syllabus.find({}).lean();
    const docMap = new Map();
    for (const d of docs) {
      docMap.set(d.yearLevel, d);
    }

    const syllabi = ALL_YEARS_METADATA.map(meta => {
      const existing = docMap.get(meta.yearLevel);
      if (existing) {
        return {
          ...meta,
          ...formatSyllabus(existing)
        };
      }
      return {
        ...meta,
        isUploaded: false,
        originalFilename: null,
        fileSize: null,
        formattedSize: null,
        uploadedBy: null,
        createdAt: null,
        updatedAt: null
      };
    });

    res.json({
      success: true,
      maxFileSizeMb: SYLLABUS_MAX_FILE_SIZE_MB,
      syllabi
    });
  } catch (error) {
    console.error("Fetch syllabi error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch syllabus data." });
  }
});

// GET /api/syllabus/:yearLevel - Returns single year syllabus metadata
app.get("/api/syllabus/:yearLevel", requireAuth(), async (req, res) => {
  try {
    const yearLevel = resolveYearLevel(req.params.yearLevel);
    if (!yearLevel) {
      return res.status(400).json({ success: false, message: "Invalid year level. Must be 1 (First Year), 2 (Second Year), or 3 (Third Year)." });
    }

    const doc = await Syllabus.findOne({ yearLevel }).lean();
    if (!doc) {
      return res.status(404).json({ success: false, message: `Syllabus not found for Year ${yearLevel}.` });
    }

    res.json({
      success: true,
      syllabus: formatSyllabus(doc)
    });
  } catch (error) {
    console.error("Fetch single syllabus error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch syllabus." });
  }
});

// GET /api/syllabus/:yearLevel/download - Authenticated safe streaming of syllabus PDF
app.get("/api/syllabus/:yearLevel/download", requireAuth(), async (req, res) => {
  try {
    const yearLevel = resolveYearLevel(req.params.yearLevel);
    if (!yearLevel) {
      return res.status(400).json({ success: false, message: "Invalid year level. Must be 1 (First Year), 2 (Second Year), or 3 (Third Year)." });
    }

    const doc = await Syllabus.findOne({ yearLevel }).lean();
    if (!doc) {
      return res.status(404).json({ success: false, message: `Syllabus not found for Year ${yearLevel}.` });
    }

    const resolved = path.resolve(doc.storagePath);
    const baseDirWithSep = SYLLABUS_BASE_DIR.endsWith(path.sep) ? SYLLABUS_BASE_DIR : SYLLABUS_BASE_DIR + path.sep;
    if (resolved !== SYLLABUS_BASE_DIR && !resolved.startsWith(baseDirWithSep)) {
      return res.status(403).json({ success: false, message: "Access forbidden: Invalid storage path." });
    }

    if (!fs.existsSync(resolved)) {
      return res.status(404).json({ success: false, message: "Syllabus file is missing from server storage." });
    }

    const stat = await fs.promises.stat(resolved);

    const safeFilename = (doc.originalFilename || `BCA_Year_${yearLevel}_Syllabus.pdf`)
      .replace(/[\r\n\x00-\x1f"\\/]/g, "_")
      .trim();

    const isInline = req.query.inline === "1" || req.query.view === "1";
    res.setHeader("Content-Type", doc.mimeType || "application/pdf");
    res.setHeader("Content-Disposition", `${isInline ? "inline" : "attachment"}; filename="${safeFilename}"`);
    res.setHeader("Content-Length", stat.size);
    res.setHeader("X-Content-Type-Options", "nosniff");

    const stream = fs.createReadStream(resolved);
    stream.on("error", (err) => {
      console.error("Stream error downloading syllabus:", err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Error streaming syllabus file." });
      }
    });
    stream.pipe(res);
  } catch (error) {
    console.error("Download syllabus error:", error);
    res.status(500).json({ success: false, message: "Failed to download syllabus." });
  }
});

// POST /api/syllabus - Admin-only upload of syllabus PDF (One PDF per Year Card)
app.post("/api/syllabus", requireAuth(["admin"]), (req, res) => {
  uploadSyllabus.single("file")(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: `The selected PDF exceeds the maximum allowed size of ${SYLLABUS_MAX_FILE_SIZE_MB} MB.`
        });
      }
      if (err.code === "INVALID_FILE_TYPE") {
        return res.status(415).json({
          success: false,
          message: "Only PDF files are allowed."
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to upload file."
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "PDF file is required." });
    }

    const uploadedFilePath = req.file.path;

    try {
      const yearLevelInput = req.body.yearLevel || req.body.year || req.body.semester;
      const yearLevel = resolveYearLevel(yearLevelInput);

      if (!yearLevel) {
        if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
        return res.status(400).json({ success: false, message: "Invalid year level. Must be 1 (First Year), 2 (Second Year), or 3 (Third Year)." });
      }

      const config = VALID_YEAR_CONFIG[yearLevel];
      if (!config) {
        if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
        return res.status(400).json({ success: false, message: "Invalid year configuration." });
      }

      // Verify PDF magic bytes
      if (!verifyPdfMagicBytes(uploadedFilePath)) {
        if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
        return res.status(415).json({
          success: false,
          message: "Invalid file signature: Only genuine PDF files starting with %PDF- are accepted."
        });
      }

      let existing = await Syllabus.findOne({ yearLevel });
      let oldPathToDelete = null;

      if (existing) {
        oldPathToDelete = existing.storagePath;
        existing.yearTitle = config.yearTitle;
        existing.academicYear = config.academicYear;
        existing.semesterLabel = config.semesterLabel;
        existing.semester = yearLevel;
        existing.originalFilename = req.file.originalname;
        existing.storedFilename = req.file.filename;
        existing.storagePath = req.file.path;
        existing.fileSize = req.file.size;
        existing.mimeType = "application/pdf";
        existing.uploadedBy = req.user.username || "admin";
        existing.updatedAt = new Date();
        await existing.save();
      } else {
        existing = await Syllabus.create({
          yearLevel,
          semester: yearLevel,
          yearTitle: config.yearTitle,
          academicYear: config.academicYear,
          semesterLabel: config.semesterLabel,
          originalFilename: req.file.originalname,
          storedFilename: req.file.filename,
          storagePath: req.file.path,
          fileSize: req.file.size,
          mimeType: "application/pdf",
          uploadedBy: req.user.username || "admin"
        });
      }

      // Safely delete old physical file if it differs from the newly uploaded file
      if (oldPathToDelete && oldPathToDelete !== req.file.path && fs.existsSync(oldPathToDelete)) {
        try {
          const resolvedOld = path.resolve(oldPathToDelete);
          if (resolvedOld.startsWith(SYLLABUS_BASE_DIR)) {
            fs.unlinkSync(resolvedOld);
          }
        } catch (cleanupErr) {
          console.warn("Could not delete old syllabus file:", cleanupErr.message);
        }
      }

      fileSyncService.triggerSync();
      return res.status(200).json({
        success: true,
        message: `${config.yearTitle} syllabus uploaded successfully.`,
        syllabus: formatSyllabus(existing)
      });
    } catch (saveErr) {
      if (fs.existsSync(uploadedFilePath)) {
        try { fs.unlinkSync(uploadedFilePath); } catch (_) {}
      }
      console.error("Save syllabus error:", saveErr);
      return res.status(500).json({ success: false, message: "Failed to save syllabus." });
    }
  });
});

// PUT /api/syllabus/:yearLevel - Admin-only replacement of syllabus PDF
app.put("/api/syllabus/:yearLevel", requireAuth(["admin"]), (req, res) => {
  uploadSyllabus.single("file")(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: `The selected PDF exceeds the maximum allowed size of ${SYLLABUS_MAX_FILE_SIZE_MB} MB.`
        });
      }
      if (err.code === "INVALID_FILE_TYPE") {
        return res.status(415).json({
          success: false,
          message: "Only PDF files are allowed."
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to upload file."
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Replacement PDF file is required." });
    }

    const uploadedFilePath = req.file.path;

    try {
      const yearLevel = resolveYearLevel(req.params.yearLevel);
      if (!yearLevel) {
        if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
        return res.status(400).json({ success: false, message: "Invalid year level: Must be 1, 2, or 3." });
      }

      const config = VALID_YEAR_CONFIG[yearLevel];
      if (!config) {
        if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
        return res.status(400).json({ success: false, message: "Invalid year configuration." });
      }

      // Verify PDF magic bytes
      if (!verifyPdfMagicBytes(uploadedFilePath)) {
        if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
        return res.status(415).json({
          success: false,
          message: "Invalid file signature: Only genuine PDF files starting with %PDF- are accepted."
        });
      }

      let existing = await Syllabus.findOne({ yearLevel });
      let oldPathToDelete = null;

      if (existing) {
        oldPathToDelete = existing.storagePath;
        existing.originalFilename = req.file.originalname;
        existing.storedFilename = req.file.filename;
        existing.storagePath = req.file.path;
        existing.fileSize = req.file.size;
        existing.mimeType = "application/pdf";
        existing.uploadedBy = req.user.username || "admin";
        existing.updatedAt = new Date();
        await existing.save();
      } else {
        existing = await Syllabus.create({
          yearLevel,
          semester: yearLevel,
          yearTitle: config.yearTitle,
          academicYear: config.academicYear,
          semesterLabel: config.semesterLabel,
          originalFilename: req.file.originalname,
          storedFilename: req.file.filename,
          storagePath: req.file.path,
          fileSize: req.file.size,
          mimeType: "application/pdf",
          uploadedBy: req.user.username || "admin"
        });
      }

      if (oldPathToDelete && oldPathToDelete !== req.file.path && fs.existsSync(oldPathToDelete)) {
        try {
          const resolvedOld = path.resolve(oldPathToDelete);
          const baseDirWithSep = SYLLABUS_BASE_DIR.endsWith(path.sep) ? SYLLABUS_BASE_DIR : SYLLABUS_BASE_DIR + path.sep;
          if (resolvedOld === SYLLABUS_BASE_DIR || resolvedOld.startsWith(baseDirWithSep)) {
            fs.unlinkSync(resolvedOld);
          }
        } catch (cleanupErr) {
          console.warn("Could not delete old syllabus file:", cleanupErr.message);
        }
      }

      fileSyncService.triggerSync();
      return res.status(200).json({
        success: true,
        message: `${config.yearTitle} syllabus replaced successfully.`,
        syllabus: formatSyllabus(existing)
      });
    } catch (saveErr) {
      if (fs.existsSync(uploadedFilePath)) {
        try { fs.unlinkSync(uploadedFilePath); } catch (_) {}
      }
      console.error("Replace syllabus error:", saveErr);
      return res.status(500).json({ success: false, message: "Failed to replace syllabus." });
    }
  });
});

// DELETE /api/syllabus/:yearLevel - Admin-only deletion of syllabus PDF
app.delete("/api/syllabus/:yearLevel", requireAuth(["admin"]), async (req, res) => {
  try {
    const yearLevel = resolveYearLevel(req.params.yearLevel);
    if (!yearLevel) {
      return res.status(400).json({ success: false, message: "Invalid year level: Must be 1, 2, or 3." });
    }

    const doc = await Syllabus.findOne({ yearLevel });
    if (!doc) {
      return res.status(404).json({ success: false, message: `Syllabus not found for Year ${yearLevel}.` });
    }

    if (doc.storagePath) {
      try {
        const resolved = path.resolve(doc.storagePath);
        const baseDirWithSep = SYLLABUS_BASE_DIR.endsWith(path.sep) ? SYLLABUS_BASE_DIR : SYLLABUS_BASE_DIR + path.sep;
        if ((resolved === SYLLABUS_BASE_DIR || resolved.startsWith(baseDirWithSep)) && fs.existsSync(resolved)) {
          fs.unlinkSync(resolved);
        }
      } catch (err) {
        console.warn("Could not unlink syllabus file:", err.message);
      }
    }

    await Syllabus.deleteOne({ yearLevel });
    fileSyncService.triggerSync();

    return res.status(200).json({
      success: true,
      message: `${doc.yearTitle || `Year ${yearLevel}`} syllabus deleted successfully.`
    });
  } catch (error) {
    console.error("Delete syllabus error:", error);
    res.status(500).json({ success: false, message: "Failed to delete syllabus." });
  }
});

// Catch-all for unhandled API routes across all HTTP methods
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found." });
});

// SPA fallback: any non-API GET request serves index.html for navigation routes.
// File requests (containing extensions or dotfiles) that do not exist in public/ return 404.
app.get(/.*/, (req, res) => {
  const reqPath = req.path || "";
  const base = path.basename(reqPath);
  if (base.includes(".") || reqPath.startsWith("/.")) {
    return res.status(404).send("Not Found");
  }
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Handle payload too large (413)
  if (err.type === "entity.too.large" || err.status === 413 || err.code === "LIMIT_FILE_SIZE") {
    const isSyllabus = req.path && req.path.includes("/syllabus");
    return res.status(413).json({
      success: false,
      message: isSyllabus
        ? `The selected PDF exceeds the maximum allowed size of ${SYLLABUS_MAX_FILE_SIZE_MB} MB.`
        : "Payload too large. Maximum allowed size is 1MB (15MB for academic sync)."
    });
  }

  // Handle unsupported file type (415)
  if (err.code === "INVALID_FILE_TYPE" || err.status === 415) {
    return res.status(415).json({
      success: false,
      message: err.message || "Only PDF files are allowed."
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
app.validateStartupConfig = validateStartupConfig;

module.exports = app;

