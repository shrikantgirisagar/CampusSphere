require("dotenv").config();
const dns = require("dns");
try { dns.setDefaultResultOrder("ipv4first"); } catch (_) {}

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { AsyncLocalStorage } = require("async_hooks");
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
const AcademicYear = require("./models/AcademicYear");
const academicYearService = require("./services/academicYearService");
const { COURSE_YEAR_LEVELS } = require("./models/Syllabus");
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

function inspectAttachmentBuffer(buffer, originalFileName = "attachment.pdf") {
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
  return {
    filename,
    filePath,
    mimeType: detectedType,
    url: `/api/academic/attachments/${filename}`,
    originalName: originalFileName,
    buffer
  };
}

function saveAttachmentFromBuffer(buffer, originalFileName = "attachment.pdf") {
  const prepared = inspectAttachmentBuffer(buffer, originalFileName);
  if (!prepared) return null;
  fs.writeFileSync(prepared.filePath, prepared.buffer);
  return {
    filename: prepared.filename,
    filePath: prepared.filePath,
    mimeType: prepared.mimeType,
    url: prepared.url,
    originalName: prepared.originalName
  };
}

function prepareAttachmentDataUrl(dataUrl, originalName) {
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1].toLowerCase();
  const allowedMimes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowedMimes.includes(mimeType)) return null;

  try {
    const buf = Buffer.from(match[2], "base64");
    return inspectAttachmentBuffer(buf, originalName);
  } catch (_) {
    return null;
  }
}

function processAttachmentDataUrl(dataUrl, originalName) {
  const prepared = prepareAttachmentDataUrl(dataUrl, originalName);
  if (!prepared) return null;
  fs.writeFileSync(prepared.filePath, prepared.buffer);
  return {
    filename: prepared.filename,
    filePath: prepared.filePath,
    mimeType: prepared.mimeType,
    url: prepared.url,
    originalName: prepared.originalName
  };
}

function cleanupAttachmentFiles(filePaths = []) {
  for (const fp of filePaths) {
    if (!fp) continue;
    try {
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    } catch (_) {}
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
    "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'self'; object-src 'none'; base-uri 'self';"
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

function getCourseYearForSemester(sem) {
  if (!sem) return "1st Year";
  const s = String(sem).toLowerCase();
  if (s.includes("1") || s.includes("2")) return "1st Year";
  if (s.includes("3") || s.includes("4")) return "2nd Year";
  if (s.includes("5") || s.includes("6")) return "3rd Year";
  return "1st Year";
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
    delete doc.facultyAllocations;
  }

  if (doc.role === "student") {
    // Section 3.3.3.4: Preserve admission cohort and operational academic context as separate attributes.
    // Zero cross-fallback or fabrication between admissionYear and academicYear.
    doc.admissionYear = doc.admissionYear || "";
    doc.academicYear = doc.academicYear || "";
  }

  if (doc.role === "faculty") {
    doc.facultyAllocations = Array.isArray(doc.facultyAllocations) ? doc.facultyAllocations : [];
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

// Track database initialization and critical index readiness honestly
let isDatabaseInitialized = false;
let databaseInitStatus = "pending"; // "pending" | "initializing" | "ready" | "failed"
let databaseInitError = null;
let databaseIndexReady = false;
let databaseIndexErrors = [];

// Connect to MongoDB & Seed Initial Accounts
async function initDatabase() {
  isDatabaseInitialized = false;
  databaseInitStatus = "initializing";
  databaseInitError = null;
  databaseIndexReady = false;
  databaseIndexErrors = [];

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

    // Explicitly synchronize critical model indexes and capture any index failure honestly
    const criticalIndexTargets = [
      { name: "Attendance", sync: () => Attendance.syncIndexes() },
      { name: "AcademicYear", sync: () => AcademicYear.syncIndexes() },
      { name: "Timetable", sync: () => Timetable.syncIndexes() },
      { name: "Mark", sync: () => Mark.syncIndexes() }
    ];
    for (const target of criticalIndexTargets) {
      try {
        await target.sync();
      } catch (idxErr) {
        const msg = `${target.name} index sync failed: ${idxErr.message || String(idxErr)}`;
        console.error(`[INIT INDEX ERROR] ${msg}`);
        databaseIndexErrors.push(msg);
      }
    }

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
        const collisionMsg = `Case-insensitive username collisions detected: ${collisionList}`;
        console.error(`[COLLISION] ${collisionMsg}`);
        if (process.env.NODE_ENV === "production") {
          console.error("[FATAL] Server cannot start in production with conflicting username variations. Please resolve collisions or run 'node scripts/migrate-usernamelower.js' before starting.");
          process.exit(1);
        } else {
          console.warn("[WARNING] Running with colliding username variations in non-production. User unique index sync blocked.");
          databaseIndexErrors.push(`User index sync skipped: ${collisionMsg}`);
        }
      } else {
        await User.syncIndexes();
      }
    } catch (indexSyncErr) {
      const msg = `User index sync failed: ${indexSyncErr.message || String(indexSyncErr)}`;
      console.error(`[INIT INDEX ERROR] ${msg}`);
      databaseIndexErrors.push(msg);
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

    // Startup does not run full-store write-through synchronization across collections
    // (explicit synchronization runs strictly via authorized transactional POST /api/academic/sync).
    try {
      await getCachedUserCounts(true);
    } catch (_) {}
    try {
      await fileSyncService.syncFromMongoToFiles();
    } catch (fsErr) {
      console.warn("[FileSync] Initial sync warning:", fsErr.message);
    }

    databaseIndexReady = mongoose.connection.readyState === 1 && databaseIndexErrors.length === 0;
    if (!databaseIndexReady) {
      databaseInitStatus = "failed";
      isDatabaseInitialized = false;
      databaseInitError = databaseIndexErrors.join("; ") || "Required database index synchronization failed.";
      console.error("[INIT] Startup initialization failed index readiness:", databaseInitError);
      if (process.env.NODE_ENV === "production") {
        console.error("[FATAL] Exiting due to critical index synchronization failure in production.");
        process.exit(1);
      }
    } else {
      databaseInitStatus = "ready";
      isDatabaseInitialized = true;
      databaseInitError = null;
    }
  } catch (error) {
    isDatabaseInitialized = false;
    databaseInitStatus = "failed";
    databaseIndexReady = false;
    databaseInitError = error.message || String(error);
    console.error("MongoDB Initialization Error:", error.message);
    if (process.env.NODE_ENV === "production") {
      console.error("[FATAL] Exiting due to MongoDB initialization failure in production environment.");
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
  const isConnected = mongoose.connection.readyState === 1;
  const effectiveReady = isConnected && databaseInitStatus === "ready" && isDatabaseInitialized && databaseIndexReady;
  const publicStatus = effectiveReady
    ? "ready"
    : (databaseInitStatus === "failed" ? "failed" : "initializing");
  res.json({
    success: true,
    message: "CampusSphere backend is running.",
    status: publicStatus,
    ready: effectiveReady
  });
});

app.get("/api/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const effectiveReady = isConnected && databaseInitStatus === "ready" && isDatabaseInitialized && databaseIndexReady;
  res.json({
    success: true,
    status: effectiveReady ? "ready" : (databaseInitStatus === "failed" ? "failed" : "initializing"),
    ready: effectiveReady
  });
});

// Admin-only database & index diagnostic endpoint (full diagnostics logged server-side; never public)
app.get("/api/admin/diagnostics/database", requireAuth(["admin"]), (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = states[mongoose.connection.readyState] || "unknown";
  const effectiveReady = dbState === "connected" && databaseInitStatus === "ready" && isDatabaseInitialized && databaseIndexReady;
  res.json({
    success: true,
    database: "MongoDB",
    databaseState: dbState,
    initStatus: databaseInitStatus,
    initialized: isDatabaseInitialized,
    indexReady: databaseIndexReady,
    ready: effectiveReady,
    initError: databaseInitError,
    indexErrors: databaseIndexErrors
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

    if (targetRole === "faculty" && Array.isArray(req.body.facultyAllocations)) {
      userObj.facultyAllocations = req.body.facultyAllocations;
    }

    if (targetRole === "student") {
      userObj.division = stripHtmlTags(String(division || "Div A").trim());
      userObj.semester = stripHtmlTags(String(semester || "1st Semester").trim());
      userObj.courseYear = stripHtmlTags(String(courseYear || "1st Year").trim());
      userObj.course = stripHtmlTags(String(course || "Bachelor of Computer Applications (BCA)").trim());
      userObj.languageChoice = stripHtmlTags(String(languageChoice || "Kannada").trim());
      userObj.mathChoice = stripHtmlTags(String(mathChoice || "Mathematics").trim());
      userObj.admissionYear = req.body.admissionYear !== undefined ? stripHtmlTags(String(req.body.admissionYear).trim()) : "";
      userObj.academicYear = req.body.academicYear !== undefined ? stripHtmlTags(String(req.body.academicYear).trim()) : "";
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
      const normOld = oldUsername.toLowerCase();
      const normNext = nextUsername.toLowerCase();
      const oldUserRegex = new RegExp(`^${escapeRegex(oldUsername)}$`, "i");
      try {
        const outcomeRename = await academicYearService.runWithYearMutationGuard(async () => {
          const oldStoreBackup = await AcademicStore.findOne({ storeKey: "default_academic_store" }).lean();
          const activeYearCode = (await resolveActiveYearCodeWithSession(null)) || "";

          // B1. Historical & unversioned protection across ALL schemas & attendance.records map (no operator injection on keys)
          const nonActiveFilter = activeYearCode
            ? { $or: [{ academicYear: { $ne: activeYearCode } }, { academicYear: { $exists: false } }, { academicYear: null }, { academicYear: "" }] }
            : {};

          const [allAttDocs, hasHistMark, hasHistAsgn, hasHistNote, hasHistNotice] = await Promise.all([
            Attendance.find({}).select("academicYear studentUsername facultyUsername records").lean(),
            Mark.exists({ studentUsername: oldUserRegex, ...nonActiveFilter }).then(Boolean),
            Assignment.exists({
              $or: [{ student: oldUserRegex }, { facultyUsername: oldUserRegex }, { "submissions.studentUsername": oldUserRegex }],
              ...nonActiveFilter
            }).then(Boolean),
            Note.exists({ uploadedBy: oldUserRegex, ...nonActiveFilter }).then(Boolean),
            Notice.exists({
              $or: [{ authorUsername: oldUserRegex }, { postedBy: oldUserRegex }],
              ...nonActiveFilter
            }).then(Boolean)
          ]);

          const hasHistAtt = allAttDocs.some(doc => {
            if (!doc) return false;
            const docYear = typeof doc.academicYear === "string" ? doc.academicYear.trim() : "";
            const isNonActive = !activeYearCode || !docYear || docYear !== activeYearCode;
            if (!isNonActive) return false;
            if (String(doc.studentUsername || "").trim().toLowerCase() === normOld) return true;
            if (String(doc.facultyUsername || "").trim().toLowerCase() === normOld) return true;
            if (doc.records && typeof doc.records === "object") {
              return Object.keys(doc.records).some(k => !k.startsWith("$") && String(k).trim().toLowerCase() === normOld);
            }
            return false;
          });

          const storeHasHistStudentMarks = (() => {
            if (!oldStoreBackup?.students || typeof oldStoreBackup.students !== "object") return false;
            const sKey = Object.keys(oldStoreBackup.students).find(k => k.toLowerCase() === normOld);
            if (!sKey || !oldStoreBackup.students[sKey]) return false;
            const marks = oldStoreBackup.students[sKey].marks && typeof oldStoreBackup.students[sKey].marks === "object"
              ? Object.values(oldStoreBackup.students[sKey].marks)
              : [];
            return marks.some(m => m && (!activeYearCode || String(m.academicYear || "").trim() !== activeYearCode));
          })();
          const storeHasHistAsgn = (oldStoreBackup?.assignments || []).some(a => {
            if (!a) return false;
            const aYr = typeof a.academicYear === "string" ? a.academicYear.trim() : "";
            if (activeYearCode && aYr === activeYearCode) return false;
            if (String(a.student || "").toLowerCase() === normOld || String(a.facultyUsername || "").toLowerCase() === normOld) return true;
            return Array.isArray(a.submissions) && a.submissions.some(s => s && String(s.studentUsername || "").toLowerCase() === normOld);
          });
          const storeHasHistAtt = (oldStoreBackup?.dailyAttendance || []).some(att =>
            att &&
            (!activeYearCode || String(att.academicYear || "").trim() !== activeYearCode) &&
            (String(att.studentUsername || "").toLowerCase() === normOld ||
             String(att.facultyUsername || "").toLowerCase() === normOld ||
             (att.records && typeof att.records === "object" && Object.keys(att.records).some(k => !k.startsWith("$") && k.toLowerCase() === normOld)))
          );
          const storeHasHistNotes = (oldStoreBackup?.notes || []).some(n =>
            n &&
            (!activeYearCode || String(n.academicYear || "").trim() !== activeYearCode) &&
            String(n.uploadedBy || n.authorUsername || "").toLowerCase() === normOld
          );
          const storeHasHistNotices = (oldStoreBackup?.notices || []).some(n =>
            n &&
            (!activeYearCode || String(n.academicYear || "").trim() !== activeYearCode) &&
            (String(n.authorUsername || "").toLowerCase() === normOld || String(n.postedBy || "").toLowerCase() === normOld)
          );

          if (hasHistAtt || hasHistMark || hasHistAsgn || hasHistNote || hasHistNotice ||
              storeHasHistStudentMarks || storeHasHistAsgn || storeHasHistAtt || storeHasHistNotes || storeHasHistNotices) {
            return {
              earlyResponse: {
                status: 409,
                body: {
                  success: false,
                  code: "IMMUTABLE_RECORD",
                  message: "Username rename rejected: Account references immutable historical or unversioned academic records."
                }
              }
            };
          }

          if (!activeYearCode) {
            return { earlyResponse: null };
          }

          const runActiveScopedRename = async (opts = {}) => {
            const yrCheck = await validateAcademicYearOperationalForWrite(activeYearCode, {
              session: opts.session || null,
              bumpEpoch: Boolean(opts.session),
              actionLabel: "Username rename"
            });
            if (!yrCheck.valid) {
              return {
                earlyResponse: { status: yrCheck.status, body: { success: false, code: yrCheck.code, message: yrCheck.message } }
              };
            }
            const cleanYear = yrCheck.academicYear;

            const activeAttDocs = await Attendance.find({ academicYear: cleanYear })
              .setOptions(opts.session ? { session: opts.session } : {})
              .lean();
            const store = await AcademicStore.findOne({ storeKey: "default_academic_store" }, null, opts);

            // B2. Collision check: reject if target username key already exists in attendance.records or AcademicStore.students
            const hasDbRecordCollision = activeAttDocs.some(doc => {
              if (!doc?.records || typeof doc.records !== "object") return false;
              const keys = Object.keys(doc.records).filter(k => !k.startsWith("$"));
              const hasOld = keys.some(k => k.toLowerCase() === normOld);
              const hasDest = keys.some(k => k.toLowerCase() === normNext);
              return hasOld && hasDest && normOld !== normNext;
            });
            const hasStoreCollision = (() => {
              if (!store) return false;
              const stuKeys = store.students && typeof store.students === "object" ? Object.keys(store.students) : [];
              if (stuKeys.some(k => k.toLowerCase() === normOld) && stuKeys.some(k => k.toLowerCase() === normNext) && normOld !== normNext) {
                return true;
              }
              return Array.isArray(store.dailyAttendance) && store.dailyAttendance.some(att => {
                if (!att || String(att.academicYear || "").trim() !== cleanYear || !att.records || typeof att.records !== "object") return false;
                const keys = Object.keys(att.records).filter(k => !k.startsWith("$"));
                return keys.some(k => k.toLowerCase() === normOld) && keys.some(k => k.toLowerCase() === normNext) && normOld !== normNext;
              });
            })();
            if (hasDbRecordCollision || hasStoreCollision) {
              return {
                earlyResponse: {
                  status: 409,
                  body: {
                    success: false,
                    code: "IMMUTABLE_RECORD",
                    message: "Username rename rejected: Target username would collide with existing attendance or student store records."
                  }
                }
              };
            }

            if (store) {
              if (store.students && typeof store.students === "object") {
                const oldStuKey = Object.keys(store.students).find(k => k.toLowerCase() === normOld);
                if (oldStuKey && store.students[oldStuKey]) {
                  store.students[nextUsername] = store.students[oldStuKey];
                  if (oldStuKey !== nextUsername) delete store.students[oldStuKey];
                  store.markModified("students");
                }
              }
              if (Array.isArray(store.assignments)) {
                store.assignments.forEach(a => {
                  if (a && String(a.academicYear || "").trim() === cleanYear) {
                    if (a.student && a.student.toLowerCase() === normOld) a.student = nextUsername;
                    if (a.facultyUsername && a.facultyUsername.toLowerCase() === normOld) a.facultyUsername = nextUsername;
                    if (Array.isArray(a.submissions)) {
                      a.submissions.forEach(s => {
                        if (s && String(s.studentUsername || "").toLowerCase() === normOld) s.studentUsername = nextUsername;
                      });
                    }
                  }
                });
                store.markModified("assignments");
              }
              if (Array.isArray(store.dailyAttendance)) {
                let attMod = false;
                store.dailyAttendance.forEach(att => {
                  if (att && String(att.academicYear || "").trim() === cleanYear) {
                    if (att.studentUsername && att.studentUsername.toLowerCase() === normOld) {
                      att.studentUsername = nextUsername;
                      attMod = true;
                    }
                    if (att.facultyUsername && att.facultyUsername.toLowerCase() === normOld) {
                      att.facultyUsername = nextUsername;
                      attMod = true;
                    }
                    if (att.records && typeof att.records === "object") {
                      const matchedKey = Object.keys(att.records).find(k => !k.startsWith("$") && k.toLowerCase() === normOld);
                      if (matchedKey) {
                        const val = att.records[matchedKey];
                        if (matchedKey !== nextUsername) delete att.records[matchedKey];
                        att.records[nextUsername] = val;
                        attMod = true;
                      }
                    }
                  }
                });
                if (attMod) store.markModified("dailyAttendance");
              }
              if (Array.isArray(store.notes)) {
                store.notes.forEach(n => {
                  if (n && String(n.academicYear || "").trim() === cleanYear && String(n.uploadedBy || "").toLowerCase() === normOld) {
                    n.uploadedBy = nextUsername;
                  }
                });
                store.markModified("notes");
              }
              if (Array.isArray(store.notices)) {
                store.notices.forEach(n => {
                  if (n && String(n.academicYear || "").trim() === cleanYear) {
                    if (String(n.authorUsername || "").toLowerCase() === normOld) n.authorUsername = nextUsername;
                    if (String(n.postedBy || "").toLowerCase() === normOld) n.postedBy = nextUsername;
                  }
                });
                store.markModified("notices");
              }
              await store.save(opts);
            }

            for (const doc of activeAttDocs) {
              let changed = false;
              const setUpdate = {};
              if (doc.studentUsername && String(doc.studentUsername).trim().toLowerCase() === normOld) {
                setUpdate.studentUsername = nextUsername;
                changed = true;
              }
              if (doc.facultyUsername && String(doc.facultyUsername).trim().toLowerCase() === normOld) {
                setUpdate.facultyUsername = nextUsername;
                changed = true;
              }
              if (doc.records && typeof doc.records === "object") {
                const matchedKeys = Object.keys(doc.records).filter(k => !k.startsWith("$") && k.toLowerCase() === normOld);
                if (matchedKeys.length > 0) {
                  const nextRecords = { ...doc.records };
                  const val = nextRecords[matchedKeys[0]];
                  for (const mk of matchedKeys) {
                    if (mk !== nextUsername) delete nextRecords[mk];
                  }
                  nextRecords[nextUsername] = val;
                  setUpdate.records = nextRecords;
                  changed = true;
                }
              }
              if (changed) {
                await Attendance.updateOne({ _id: doc._id, academicYear: cleanYear }, { $set: setUpdate }, opts);
              }
            }

            const activeMarks = await Mark.find({ academicYear: cleanYear, studentUsername: oldUserRegex })
              .setOptions(opts.session ? { session: opts.session } : {})
              .lean();
            for (const mk of activeMarks) {
              await Mark.updateOne(
                { _id: mk._id, academicYear: cleanYear },
                { $set: { studentUsername: nextUsername, markId: `${cleanYear}_${nextUsername}_${mk.subject}` } },
                opts
              );
            }

            await Assignment.updateMany({ academicYear: cleanYear, student: oldUserRegex }, { $set: { student: nextUsername } }, opts);
            await Assignment.updateMany({ academicYear: cleanYear, facultyUsername: oldUserRegex }, { $set: { facultyUsername: nextUsername } }, opts);
            const activeSubAsgns = await Assignment.find({ academicYear: cleanYear, "submissions.studentUsername": oldUserRegex })
              .setOptions(opts.session ? { session: opts.session } : {});
            for (const asgnDoc of activeSubAsgns) {
              asgnDoc.submissions.forEach(sub => {
                if (sub && String(sub.studentUsername || "").toLowerCase() === normOld) sub.studentUsername = nextUsername;
              });
              await asgnDoc.save(opts);
            }

            await Note.updateMany({ academicYear: cleanYear, uploadedBy: oldUserRegex }, { $set: { uploadedBy: nextUsername } }, opts);
            await Notice.updateMany({ academicYear: cleanYear, authorUsername: oldUserRegex }, { $set: { authorUsername: nextUsername } }, opts);
            await Notice.updateMany({ academicYear: cleanYear, postedBy: oldUserRegex }, { $set: { postedBy: nextUsername } }, opts);
            await PushSubscription.updateMany({ role, username: oldUserRegex }, { $set: { username: nextUsername } }, opts);
            return { earlyResponse: null, cleanYear };
          };

          if (academicYearService.isTransactionSupported()) {
            const session = await mongoose.startSession();
            let txOutcome = null;
            try {
              await session.withTransaction(async () => {
                txOutcome = null;
                txOutcome = await runActiveScopedRename({ session });
              });
            } finally {
              await session.endSession();
            }
            return txOutcome;
          }

          // Snapshot affected active-year collections for standalone rollback symmetry
          const activeAttSnap = await Attendance.find({ academicYear: activeYearCode }).lean();
          const activeMarkSnap = await Mark.find({ academicYear: activeYearCode, studentUsername: oldUserRegex }).lean();
          const activeAsgnSnap = await Assignment.find({ academicYear: activeYearCode }).lean();
          const activeNoteSnap = await Note.find({ academicYear: activeYearCode, uploadedBy: oldUserRegex }).lean();
          const activeNoticeSnap = await Notice.find({
            academicYear: activeYearCode,
            $or: [{ authorUsername: oldUserRegex }, { postedBy: oldUserRegex }]
          }).lean();

          try {
            return await runActiveScopedRename({});
          } catch (syncErr) {
            try {
              for (const doc of activeAttSnap) {
                const { _id, ...rest } = doc;
                await Attendance.replaceOne({ _id }, rest);
              }
              for (const mk of activeMarkSnap) {
                const { _id, ...rest } = mk;
                await Mark.replaceOne({ _id }, rest);
              }
              for (const a of activeAsgnSnap) {
                const { _id, ...rest } = a;
                await Assignment.replaceOne({ _id }, rest);
              }
              for (const n of activeNoteSnap) {
                const { _id, ...rest } = n;
                await Note.replaceOne({ _id }, rest);
              }
              for (const nt of activeNoticeSnap) {
                const { _id, ...rest } = nt;
                await Notice.replaceOne({ _id }, rest);
              }
              if (oldStoreBackup) {
                await AcademicStore.updateOne(
                  { storeKey: "default_academic_store" },
                  {
                    $set: {
                      students: oldStoreBackup.students,
                      assignments: oldStoreBackup.assignments,
                      dailyAttendance: oldStoreBackup.dailyAttendance,
                      notes: oldStoreBackup.notes,
                      notices: oldStoreBackup.notices
                    }
                  }
                );
              }
            } catch (rbErr) {
              console.error("Compensating rollback failed:", rbErr.message);
            }
            throw syncErr;
          }
        });

        if (outcomeRename?.earlyResponse) {
          return res.status(outcomeRename.earlyResponse.status).json(outcomeRename.earlyResponse.body);
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
        if (req.body.facultyAllocations !== undefined && Array.isArray(req.body.facultyAllocations)) {
          user.facultyAllocations = req.body.facultyAllocations.filter(a => a && typeof a === "object").map(a => ({
            ...a,
            academicYear: stripHtmlTags(String(a.academicYear || a.yearCode || "").trim()),
            subject: a.subject ? stripHtmlTags(String(a.subject).trim()) : undefined,
            division: a.division ? stripHtmlTags(String(a.division).trim()) : undefined,
            semester: a.semester ? stripHtmlTags(String(a.semester).trim()) : undefined
          }));
          user.markModified("facultyAllocations");
        }
        if (req.body.allocationAcademicYear && Array.isArray(req.body.yearAllocations)) {
          const targetYear = stripHtmlTags(String(req.body.allocationAcademicYear).trim());
          const otherYearsAllocs = (user.facultyAllocations || []).filter(a => {
            const y = String(a.academicYear || a.yearCode || "").trim();
            return y !== targetYear;
          });
          const newYearAllocs = req.body.yearAllocations.map(a => ({
            ...a,
            academicYear: targetYear
          }));
          user.facultyAllocations = [...otherYearsAllocs, ...newYearAllocs];
          user.markModified("facultyAllocations");
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
      // Section 3.3.3.4: Admission cohort is an immutable historical attribute.
      // Ordinary profile updates cannot overwrite admissionYear. Only authorized admin can correct it.
      if (isAdmin) {
        if (req.body.admissionYear !== undefined) {
          user.admissionYear = stripHtmlTags(String(req.body.admissionYear).trim());
        }
        if (req.body.academicYear !== undefined) {
          user.academicYear = stripHtmlTags(String(req.body.academicYear).trim());
        }
      }
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
    const normCanon = canonicalUsername.toLowerCase();
    const userRegex = new RegExp(`^${escapeRegex(canonicalUsername)}$`, "i");

    // Step 2: Atomic deletion boundary across academic cleanup, subscriptions, and User document
    const executeAccountDeletion = async (session) => {
      const writeOpts = { session };

      if (targetRole === "admin") {
        const remainingAdmins = await User.countDocuments({ role: "admin" }).session(session);
        if (remainingAdmins <= 1) {
          return {
            earlyResponse: {
              status: 400,
              body: { success: false, message: "The last remaining administrator account cannot be deleted." }
            }
          };
        }
      }

      if (targetRole === "student") {
        const activeYearCode = (await resolveActiveYearCodeWithSession(session)) || "";
        let cleanYear = "";
        if (activeYearCode) {
          const yrCheck = await validateAcademicYearOperationalForWrite(activeYearCode, {
            session,
            bumpEpoch: true,
            actionLabel: "Student deletion"
          });
          if (yrCheck.valid) {
            cleanYear = yrCheck.academicYear;
          }
        }

        if (!cleanYear) {
          // Zero active operational year: remove only empty student shell if zero historical data references account
          const store = await AcademicStore.findOne({ storeKey: "default_academic_store" }).setOptions(writeOpts);
          if (store && store.students && typeof store.students === "object") {
            const studentKey = Object.keys(store.students).find(k => k.toLowerCase() === normCanon);
            if (studentKey && store.students[studentKey]) {
              const stuMarks = store.students[studentKey].marks && typeof store.students[studentKey].marks === "object"
                ? Object.values(store.students[studentKey].marks)
                : [];
              const hasHistInAttendance = Array.isArray(store.dailyAttendance) && store.dailyAttendance.some(att =>
                att && (
                  String(att.studentUsername || "").toLowerCase() === normCanon ||
                  (att.records && typeof att.records === "object" && Object.keys(att.records).some(k => !k.startsWith("$") && k.toLowerCase() === normCanon))
                )
              );
              const allDbAtt = await Attendance.find({}).select("studentUsername records").setOptions(writeOpts).lean();
              const hasHistDbAtt = allDbAtt.some(doc =>
                doc && (
                  String(doc.studentUsername || "").trim().toLowerCase() === normCanon ||
                  (doc.records && typeof doc.records === "object" && Object.keys(doc.records).some(k => !k.startsWith("$") && k.toLowerCase() === normCanon))
                )
              );
              const hasOtherDb = await Promise.all([
                Mark.exists({ studentUsername: userRegex }).session(session).then(Boolean),
                Assignment.exists({ $or: [{ student: userRegex }, { "submissions.studentUsername": userRegex }] }).session(session).then(Boolean)
              ]).then(vals => vals.some(Boolean));
              if (stuMarks.length === 0 && !hasHistInAttendance && !hasHistDbAtt && !hasOtherDb) {
                delete store.students[studentKey];
                store.markModified("students");
                await store.save(writeOpts);
              }
            }
          }
        } else {
          const allDbAtt = await Attendance.find({})
            .select("_id academicYear studentUsername records")
            .setOptions(writeOpts)
            .lean();
          const histDbAtt = allDbAtt.some(doc => {
            if (!doc) return false;
            const dYr = typeof doc.academicYear === "string" ? doc.academicYear.trim() : "";
            if (dYr === cleanYear) return false;
            return String(doc.studentUsername || "").trim().toLowerCase() === normCanon ||
              (doc.records && typeof doc.records === "object" && Object.keys(doc.records).some(k => !k.startsWith("$") && k.toLowerCase() === normCanon));
          });

          const nonActiveFilter = {
            $or: [
              { academicYear: { $ne: cleanYear } },
              { academicYear: { $exists: false } },
              { academicYear: null },
              { academicYear: "" }
            ]
          };
          const [histDbMark, histDbAssign] = await Promise.all([
            Mark.exists({ studentUsername: userRegex, ...nonActiveFilter }).session(session).then(Boolean),
            Assignment.exists({
              $or: [{ student: userRegex }, { "submissions.studentUsername": userRegex }],
              ...nonActiveFilter
            }).session(session).then(Boolean)
          ]);

          // Remove ONLY student's attendance identity inside active-year Attendance docs (preserve class-session docs!)
          const activeDbAtt = allDbAtt.filter(doc => doc && typeof doc.academicYear === "string" && doc.academicYear.trim() === cleanYear);
          for (const doc of activeDbAtt) {
            const stuMatches = String(doc.studentUsername || "").trim().toLowerCase() === normCanon;
            const recObj = doc.records && typeof doc.records === "object" ? doc.records : {};
            const recKeys = Object.keys(recObj).filter(k => !k.startsWith("$"));
            const matchedRecKeys = recKeys.filter(k => k.toLowerCase() === normCanon);
            if (!stuMatches && matchedRecKeys.length === 0) continue;

            const remainingRecords = { ...recObj };
            for (const mk of matchedRecKeys) {
              delete remainingRecords[mk];
            }
            const remainingKeys = Object.keys(remainingRecords).filter(k => !k.startsWith("$"));
            if (remainingKeys.length > 0) {
              await Attendance.updateOne(
                { _id: doc._id, academicYear: cleanYear },
                { $set: { records: remainingRecords, studentUsername: stuMatches ? "" : doc.studentUsername } },
                writeOpts
              );
            } else {
              await Attendance.deleteOne({ _id: doc._id, academicYear: cleanYear }, writeOpts);
            }
          }

          const store = await AcademicStore.findOne({ storeKey: "default_academic_store" }).setOptions(writeOpts);
          if (store) {
            const histStoreAtt = Array.isArray(store.dailyAttendance) && store.dailyAttendance.some(att =>
              att &&
              String(att.academicYear || "").trim() !== cleanYear &&
              (String(att.studentUsername || "").toLowerCase() === normCanon ||
               (att.records && typeof att.records === "object" && Object.keys(att.records).some(k => !k.startsWith("$") && k.toLowerCase() === normCanon)))
            );
            const histStoreAsgn = Array.isArray(store.assignments) && store.assignments.some(a =>
              a &&
              String(a.academicYear || "").trim() !== cleanYear &&
              String(a.student || "").toLowerCase() === normCanon
            );

            if (Array.isArray(store.dailyAttendance)) {
              let dailyAttModified = false;
              const nextDaily = [];
              for (const att of store.dailyAttendance) {
                if (att && String(att.academicYear || "").trim() === cleanYear) {
                  const stuMatches = String(att.studentUsername || "").toLowerCase() === normCanon;
                  let recChanged = false;
                  if (att.records && typeof att.records === "object") {
                    const matchedKeys = Object.keys(att.records).filter(k => !k.startsWith("$") && k.toLowerCase() === normCanon);
                    for (const mk of matchedKeys) {
                      delete att.records[mk];
                      recChanged = true;
                      dailyAttModified = true;
                    }
                  }
                  const remainingKeys = att.records && typeof att.records === "object"
                    ? Object.keys(att.records).filter(k => !k.startsWith("$"))
                    : [];
                  if (stuMatches && remainingKeys.length === 0) {
                    dailyAttModified = true;
                    continue; // drop single-student active row matching deleted student
                  }
                  if (stuMatches && remainingKeys.length > 0) {
                    att.studentUsername = "";
                    dailyAttModified = true;
                  }
                  if (recChanged || stuMatches) dailyAttModified = true;
                }
                nextDaily.push(att);
              }
              if (dailyAttModified) {
                store.dailyAttendance = nextDaily;
                store.markModified("dailyAttendance");
              }
            }

            if (store.students && typeof store.students === "object") {
              const studentKey = Object.keys(store.students).find(k => k.toLowerCase() === normCanon);
              if (studentKey && store.students[studentKey]) {
                const existingMarks = store.students[studentKey].marks && typeof store.students[studentKey].marks === "object"
                  ? store.students[studentKey].marks
                  : {};
                const preservedMarks = {};
                for (const [subId, markObj] of Object.entries(existingMarks)) {
                  if (!markObj || typeof markObj !== "object") continue;
                  const mYear = String(markObj.academicYear || "").trim();
                  if (!mYear || mYear !== cleanYear) {
                    preservedMarks[subId] = markObj;
                  }
                }
                const hasHistoricalMarks = Object.keys(preservedMarks).length > 0;
                if (hasHistoricalMarks || histDbAtt || histDbMark || histDbAssign || histStoreAtt || histStoreAsgn) {
                  // Reset and recompute cached attendance summary from remaining historical daily logs only (no stale active percentages)
                  store.students[studentKey] = {
                    ...store.students[studentKey],
                    marks: preservedMarks,
                    attendance: {}
                  };
                  recalculateOverallAttendance(store.dailyAttendance || [], { [studentKey]: store.students[studentKey] });
                } else {
                  delete store.students[studentKey];
                }
                store.markModified("students");
              }
            }

            if (Array.isArray(store.assignments)) {
              store.assignments = store.assignments.filter(a =>
                !(a && String(a.academicYear || "").trim() === cleanYear && (a.student || "").toLowerCase() === normCanon)
              );
              store.markModified("assignments");
            }
            if (Array.isArray(store.deletedAssignments) && !histDbAssign && !histStoreAsgn) {
              store.deletedAssignments = store.deletedAssignments.filter(k => !String(k || "").toLowerCase().startsWith(`${normCanon}___`));
              store.markModified("deletedAssignments");
            }
            await store.save(writeOpts);
          }

          await Assignment.deleteMany({ academicYear: cleanYear, student: userRegex }, writeOpts);
          await Assignment.updateMany(
            { academicYear: cleanYear, "submissions.studentUsername": userRegex },
            { $pull: { submissions: { studentUsername: userRegex } } },
            writeOpts
          );
          await Mark.deleteMany({ academicYear: cleanYear, studentUsername: userRegex }, writeOpts);
        }
      }

      await PushSubscription.deleteMany({
        role: targetRole,
        $or: [
          { username: userRegex },
          { userId: targetUser.id || String(targetUser._id) }
        ]
      }, writeOpts);

      const deleteResult = await User.deleteOne({ _id: targetUser._id }, writeOpts);
      if (deleteResult.deletedCount === 0) {
        return {
          earlyResponse: { status: 404, body: { success: false, message: "Account not found." } }
        };
      }
      return { earlyResponse: null };
    };

    const outcomeDel = await academicYearService.runWithYearMutationGuard(async () => {
      if (!academicYearService.isTransactionSupported()) {
        return {
          earlyResponse: {
            status: 503,
            body: {
              success: false,
              code: "TRANSACTIONS_REQUIRED",
              atomicTransactionsSupported: false,
              message: "Account deletion rejected: Deleting accounts across user and academic collections requires a transaction-capable MongoDB deployment (replica set or sharded cluster)."
            }
          }
        };
      }

      const session = await mongoose.startSession();
      let txResult = null;
      try {
        await session.withTransaction(async () => {
          txResult = null;
          txResult = await executeAccountDeletion(session);
        });
      } finally {
        await session.endSession();
      }
      return txResult;
    });

    if (outcomeDel?.earlyResponse) {
      return res.status(outcomeDel.earlyResponse.status).json(outcomeDel.earlyResponse.body);
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

// ============================================================================
// --- Dynamic Academic Year Architecture REST API Endpoints ---
// ============================================================================

// GET /api/academic-years - List all academic years
app.get("/api/academic-years", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = String(req.query.status).trim().toLowerCase();
    }
    const years = await academicYearService.getAllAcademicYears(filter);
    const publicYears = years.map(y => academicYearService.formatPublicAcademicYear(y));
    res.json({ success: true, academicYears: publicYears, count: publicYears.length });
  } catch (error) {
    console.error("Fetch academic years error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve academic years." });
  }
});

// GET /api/academic-years/active - Get currently active academic year
app.get("/api/academic-years/active", async (req, res) => {
  try {
    const active = await academicYearService.getActiveAcademicYear();
    if (!active) {
      return res.status(404).json({ success: false, message: "No active academic year configured." });
    }
    res.json({ success: true, academicYear: academicYearService.formatPublicAcademicYear(active) });
  } catch (error) {
    if (error && error.code === "MULTIPLE_ACTIVE_YEARS") {
      return res.status(500).json({
        success: false,
        code: "MULTIPLE_ACTIVE_YEARS",
        message: "Data integrity error: Multiple academic years are marked active. Please contact administrator."
      });
    }
    console.error("Fetch active academic year error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve active academic year." });
  }
});

// GET /api/academic-years/:id - Get specific academic year by id or yearCode
app.get("/api/academic-years/:id", async (req, res) => {
  try {
    const year = await academicYearService.getAcademicYearByIdOrCode(req.params.id);
    if (!year) {
      return res.status(404).json({ success: false, message: "Academic year not found." });
    }
    res.json({ success: true, academicYear: academicYearService.formatPublicAcademicYear(year) });
  } catch (error) {
    console.error("Fetch academic year by ID error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve academic year." });
  }
});

// GET /api/academic-years/:id/semesters - Get operational semesters for a specific academic year
app.get("/api/academic-years/:id/semesters", async (req, res) => {
  try {
    const year = await academicYearService.getAcademicYearByIdOrCode(req.params.id);
    if (!year) {
      return res.status(404).json({ success: false, message: "Academic year not found." });
    }
    const rawSemesters = Array.isArray(year.semesterConfiguration) ? year.semesterConfiguration : [];
    const semesters = rawSemesters.map(s => ({
      semester: s.semester,
      cycle: s.cycle,
      courseYear: s.courseYear,
      isOperational: Boolean(s.isOperational),
      status: s.status
    }));
    const operationalSemesters = semesters
      .filter(s => s && s.isOperational && s.status === "active")
      .map(s => s.semester);
    res.json({
      success: true,
      academicYear: year.yearCode,
      semesters,
      operationalSemesters,
      count: semesters.length
    });
  } catch (error) {
    console.error("Fetch year semesters error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve semester configuration." });
  }
});

// POST /api/academic-years - Create new academic year (Admin only)
app.post("/api/academic-years", rateLimitExpensive, requireAuth(["admin"]), async (req, res) => {
  try {
    if (hasMongoOperators(req.body)) {
      return res.status(400).json({ success: false, message: "MongoDB operators are not permitted." });
    }
    const created = await academicYearService.createAcademicYear(req.body, req.user?.username || "admin");
    fileSyncService.triggerSync();
    res.status(201).json({ success: true, message: "Academic year created successfully.", academicYear: created });
  } catch (error) {
    console.error("Create academic year error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to create academic year." });
  }
});

// PATCH /api/academic-years/:id - Update academic year metadata (Admin only)
app.patch("/api/academic-years/:id", rateLimitExpensive, requireAuth(["admin"]), async (req, res) => {
  try {
    if (hasMongoOperators(req.body)) {
      return res.status(400).json({ success: false, message: "MongoDB operators are not permitted." });
    }
    const updated = await academicYearService.updateAcademicYear(req.params.id, req.body, req.user?.username || "admin");
    fileSyncService.triggerSync();
    res.json({ success: true, message: "Academic year updated successfully.", academicYear: updated });
  } catch (error) {
    console.error("Update academic year error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to update academic year." });
  }
});

// PATCH /api/academic-years/:id/semesters - Update operational semesters (Admin only)
app.patch("/api/academic-years/:id/semesters", rateLimitExpensive, requireAuth(["admin"]), async (req, res) => {
  try {
    if (hasMongoOperators(req.body)) {
      return res.status(400).json({ success: false, message: "MongoDB operators are not permitted." });
    }
    const semesters = req.body.semesterConfiguration || req.body.semesters || req.body;
    const updated = await academicYearService.updateSemesterConfiguration(req.params.id, semesters, req.user?.username || "admin");
    fileSyncService.triggerSync();
    res.json({ success: true, message: "Semester configuration updated successfully.", academicYear: updated });
  } catch (error) {
    console.error("Update semester configuration error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to update semester configuration." });
  }
});

// PATCH /api/academic-years/:id/activate - Safe atomic academic year activation (Admin only)
app.patch("/api/academic-years/:id/activate", rateLimitExpensive, requireAuth(["admin"]), async (req, res) => {
  try {
    if (hasMongoOperators(req.body)) {
      return res.status(400).json({ success: false, message: "MongoDB operators are not permitted." });
    }
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const activateOptions = {};
    if (body.expectedActiveYearId !== undefined && body.expectedActiveYearId !== null) {
      if (typeof body.expectedActiveYearId !== "string" || !stripHtmlTags(body.expectedActiveYearId).trim()) {
        return res.status(400).json({ success: false, message: "expectedActiveYearId must be a valid non-empty identifier." });
      }
      activateOptions.expectedActiveYearId = stripHtmlTags(body.expectedActiveYearId).trim();
    }
    if (body.expectedActiveYearCode !== undefined && body.expectedActiveYearCode !== null) {
      if (typeof body.expectedActiveYearCode !== "string" || !stripHtmlTags(body.expectedActiveYearCode).trim()) {
        return res.status(400).json({ success: false, message: "expectedActiveYearCode must be a valid non-empty year code." });
      }
      activateOptions.expectedActiveYearCode = stripHtmlTags(body.expectedActiveYearCode).trim();
    }
    if (body.requireNoActiveYear !== undefined) {
      activateOptions.requireNoActiveYear = Boolean(body.requireNoActiveYear);
    }

    const result = await academicYearService.activateAcademicYear(req.params.id, req.user?.username || "admin", activateOptions);
    fileSyncService.triggerSync();
    res.json({
      success: true,
      message: result.message,
      previousActiveYear: result.previousActiveYear,
      activeAcademicYear: result.activeAcademicYear
    });
  } catch (error) {
    console.error("Activate academic year error:", error);
    const code = error.code === 11000 ? "LIFECYCLE_CONFLICT" : error.code;
    const status = typeof error.status === "number" ? error.status : (code === "LIFECYCLE_CONFLICT" ? 409 : 400);
    res.status(status).json({
      success: false,
      ...(code ? { code } : {}),
      message: error.message || "Failed to activate academic year."
    });
  }
});

// PATCH /api/academic-years/:id/complete - Mark academic year completed (Admin only)
app.patch("/api/academic-years/:id/complete", rateLimitExpensive, requireAuth(["admin"]), async (req, res) => {
  try {
    const options = {
      successorId: req.body.successorId || req.body.transitionToYear,
      intentionalDeactivation: Boolean(req.body.intentionalDeactivation || req.body.allowZeroActive)
    };
    const completed = await academicYearService.completeAcademicYear(req.params.id, req.user?.username || "admin", options);
    fileSyncService.triggerSync();
    res.json({ success: true, message: `Academic year transition completed successfully.`, academicYear: completed });
  } catch (error) {
    console.error("Complete academic year error:", error);
    const status = typeof error.status === "number" ? error.status : (error.code === "LIFECYCLE_CONFLICT" ? 409 : 400);
    res.status(status).json({
      success: false,
      ...(error.code ? { code: error.code } : {}),
      message: error.message || "Failed to complete academic year."
    });
  }
});

// PATCH /api/academic-years/:id/archive - Archive academic year (Admin only)
app.patch("/api/academic-years/:id/archive", rateLimitExpensive, requireAuth(["admin"]), async (req, res) => {
  try {
    const archived = await academicYearService.archiveAcademicYear(req.params.id, req.user?.username || "admin");
    fileSyncService.triggerSync();
    res.json({ success: true, message: `Academic year "${archived.yearCode}" archived.`, academicYear: archived });
  } catch (error) {
    console.error("Archive academic year error:", error);
    const status = typeof error.status === "number" ? error.status : (error.code === "LIFECYCLE_CONFLICT" ? 409 : 400);
    res.status(status).json({
      success: false,
      ...(error.code ? { code: error.code } : {}),
      message: error.message || "Failed to archive academic year."
    });
  }
});

// --- Prompt 17: Timetable Dynamic Builder & Server-Side RBAC ---

const TIMETABLE_ALLOWED_FONTS = ["DM Sans", "Sora", "Arial", "Inter", "Roboto", "Times New Roman", "Georgia", "Courier New", "Outfit", "Plus Jakarta Sans"];
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

function getFacultyAuthorizedScope(user, academicYear) {
  if (!user || user.role !== "faculty") {
    return {
      isAuthorized: false,
      subjects: [],
      semesters: [],
      divisionsBySubject: {},
      defaultDivision: "all",
      reason: "User is not authenticated or not in faculty role.",
      code: "ROLE_NOT_AUTHORIZED"
    };
  }

  const rawYear = academicYear !== undefined && academicYear !== null ? String(academicYear).trim() : "";
  const targetYear = rawYear || null;
  const hasVersionedAllocations = Array.isArray(user.facultyAllocations) && user.facultyAllocations.length > 0;

  if (hasVersionedAllocations) {
    if (!targetYear) {
      return {
        isAuthorized: false,
        subjects: [],
        semesters: [],
        divisionsBySubject: {},
        defaultDivision: "all",
        reason: "Academic-year context is required to resolve versioned faculty allocations.",
        code: "ACADEMIC_YEAR_REQUIRED"
      };
    }

    const normTargetYear = targetYear.toLowerCase();
    const matchingAllocations = user.facultyAllocations.filter(alloc => {
      if (!alloc || typeof alloc !== "object") return false;
      const allocYear = String(alloc.academicYear || alloc.yearCode || "").trim().toLowerCase();
      if (allocYear !== normTargetYear) return false;
      if (alloc.status && (alloc.status === "inactive" || alloc.status === "revoked")) return false;
      if (alloc.isActive === false) return false;
      return true;
    });

    if (matchingAllocations.length === 0) {
      return {
        isAuthorized: false,
        subjects: [],
        semesters: [],
        divisionsBySubject: {},
        defaultDivision: "all",
        reason: `Faculty has no active allocations for academic year '${targetYear}'.`,
        code: "NO_ACTIVE_ALLOCATIONS"
      };
    }

    const assignedSubjects = new Set();
    const authorizedSemesters = new Set();
    const divisionsBySubject = {};
    const allocSemestersBySubject = {};

    matchingAllocations.forEach(alloc => {
      const sub = alloc.subject ? String(alloc.subject).trim() : null;
      if (sub) {
        assignedSubjects.add(sub);
        const div = alloc.division ? String(alloc.division).trim() : (user.division || "all");
        if (divisionsBySubject[sub]) {
          const prev = divisionsBySubject[sub].toLowerCase();
          const curr = div.toLowerCase();
          if (prev !== curr) {
            if (
              (prev.includes("a") && curr.includes("b")) ||
              (prev.includes("b") && curr.includes("a")) ||
              prev === "all" || curr === "all" ||
              prev === "both divisions" || curr === "both divisions" ||
              prev === "all divisions" || curr === "all divisions"
            ) {
              divisionsBySubject[sub] = "Both Divisions";
            }
          }
        } else {
          divisionsBySubject[sub] = div;
        }

        const explicitSem = alloc.semester ? String(alloc.semester).trim() : "";
        if (explicitSem) {
          if (!allocSemestersBySubject[sub]) allocSemestersBySubject[sub] = [];
          if (!allocSemestersBySubject[sub].includes(explicitSem)) {
            allocSemestersBySubject[sub].push(explicitSem);
          }
        }

        const sem = explicitSem || getSubjectSemester(sub);
        if (sem) authorizedSemesters.add(sem);
      }
      if (alloc.semester) authorizedSemesters.add(String(alloc.semester).trim());
    });

    return {
      isAuthorized: true,
      subjects: Array.from(assignedSubjects),
      semesters: Array.from(authorizedSemesters),
      divisionsBySubject,
      allocSemestersBySubject,
      defaultDivision: user.division || "all"
    };
  }

  // Legacy fallback policy: applies ONLY to legacy-only profiles without versioned allocations
  if (targetYear && user.academicYear) {
    const normProfileYear = String(user.academicYear).trim().toLowerCase();
    const normTargetYear = targetYear.toLowerCase();
    if (normProfileYear && normProfileYear !== normTargetYear) {
      return {
        isAuthorized: false,
        subjects: [],
        semesters: [],
        divisionsBySubject: {},
        defaultDivision: "all",
        reason: `Legacy profile associated with academic year '${user.academicYear}' cannot grant access for requested year '${targetYear}'.`,
        code: "LEGACY_YEAR_MISMATCH"
      };
    }
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

function isFacultyAuthorizedForTimetable(user, semester, division, academicYear) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role !== "faculty") return false;

  const scope = getFacultyAuthorizedScope(user, academicYear);
  if (!scope.isAuthorized || !scope.subjects.length) return false;

  const normTargetDiv = String(division || "").trim().toLowerCase();
  const normTargetSem = String(semester || "").trim().toLowerCase();

  return scope.subjects.some(sub => {
    const explicitSems = scope.allocSemestersBySubject && Array.isArray(scope.allocSemestersBySubject[sub])
      ? scope.allocSemestersBySubject[sub]
      : [];
    const allowedSems = explicitSems.length > 0
      ? explicitSems
      : (getSubjectSemester(sub) ? [getSubjectSemester(sub)] : []);
    if (allowedSems.length > 0 && normTargetSem && !allowedSems.some(s => s.toLowerCase() === normTargetSem)) {
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
  const academicYear = arguments[4];
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role !== "faculty") return false;

  const cleanSub = String(subject || "").trim();
  if (!cleanSub) return true;

  const scope = getFacultyAuthorizedScope(user, academicYear);
  if (!scope.isAuthorized) return false;

  const normTargetSem = String(semester || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
  const normDiv = String(division || "").trim().toLowerCase();
  const cleanTargetDiv = normDiv.replace(/^div\s*/i, "").trim();

  return scope.subjects.some(assigned => {
    if (!isSameSubject(assigned, cleanSub)) {
      return false;
    }

    // Enforce exact semester match from versioned allocation or catalog semester (never cross-semester)
    const allocSems = scope.allocSemestersBySubject && Array.isArray(scope.allocSemestersBySubject[assigned])
      ? scope.allocSemestersBySubject[assigned]
      : [];
    const allowedSems = allocSems.length > 0
      ? allocSems
      : [getSubjectSemester(assigned)].filter(Boolean);
    if (normTargetSem) {
      if (allowedSems.length === 0) return false;
      const semMatch = allowedSems.some(s => String(s || "").trim().toLowerCase().replace(/[\s_-]+/g, "") === normTargetSem);
      if (!semMatch) return false;
    } else if (Array.isArray(user.facultyAllocations) && user.facultyAllocations.length > 0) {
      return false;
    }

    const divRule = String(scope.divisionsBySubject[assigned] || scope.defaultDivision || "all").toLowerCase();
    if (divRule !== "all" && divRule !== "both divisions" && divRule !== "all divisions") {
      const cleanRule = divRule.replace(/^div\s*/i, "").trim();
      if (divRule !== normDiv && cleanRule !== cleanTargetDiv) return false;
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
      const fontFamily = String(c.fontFamily || "DM Sans").trim();
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

function sanitizeTimetableForFaculty(doc, user, academicYear) {
  if (!doc) return null;
  const sanitized = JSON.parse(JSON.stringify(doc));
  const targetYear = academicYear || sanitized.academicYear || null;
  if (Array.isArray(sanitized.cells)) {
    sanitized.cells = sanitized.cells.map(cell => {
      if (!cell || !cell.subject) {
        return {
          ...cell,
          textAlign: "center"
        };
      }
      // Keep cell subject only if assigned to this faculty member
      if (canFacultySetSubject(user, cell.subject, sanitized.semester, sanitized.division, targetYear)) {
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
    const { semester, division, academicYear } = req.query;

    // 1. Student role: strictly lock to authenticated user's semester & division (IDOR protection)
    if (req.user.role === "student") {
      const studentSem = req.user.semester || "1st Semester";
      const studentDiv = req.user.division || "Div A";
      const targetYear = academicYear || req.user.academicYear || (await academicYearService.getActiveYearCode());
      let doc = await Timetable.findOne({ semester: studentSem, division: studentDiv, academicYear: targetYear }).select("-__v").lean();
      if (!doc) {
        return res.json({
          success: true,
          timetable: (semester || division) ? null : [],
          timetableDoc: null,
          semester: studentSem,
          division: studentDiv,
          academicYear: targetYear
        });
      }
      if (!Array.isArray(doc.days)) {
        const legacyDocs = await Timetable.find({ semester: studentSem, division: studentDiv, academicYear: targetYear }).select("-__v").limit(1000).lean();
        return res.json({
          success: true,
          timetable: legacyDocs,
          timetableDoc: legacyDocs[0] || null,
          semester: studentSem,
          division: studentDiv,
          academicYear: targetYear
        });
      }
      return res.json({
        success: true,
        timetable: doc,
        timetableDoc: doc,
        semester: studentSem,
        division: studentDiv,
        academicYear: targetYear
      });
    }

    // 2. Faculty role: verify scope & filter strictly to assigned subjects
    if (req.user.role === "faculty") {
      const targetYear = academicYear || (await academicYearService.getActiveYearCode());
      const scope = getFacultyAuthorizedScope(req.user, targetYear);
      if (!scope.isAuthorized || !scope.subjects || !scope.subjects.length) {
        return res.json({
          success: true,
          timetable: null,
          timetableDoc: null,
          message: scope.reason || "No assigned subjects found for this faculty member."
        });
      }

      if (semester && division) {
        if (!isFacultyAuthorizedForTimetable(req.user, semester, division, targetYear)) {
          return res.status(403).json({ success: false, message: "Access forbidden: You are not authorized to view this timetable." });
        }
        let doc = await Timetable.findOne({ semester, division, academicYear: targetYear }).select("-__v").lean();
        const facultyDoc = doc ? sanitizeTimetableForFaculty(doc, req.user, targetYear) : null;
        return res.json({ success: true, timetable: facultyDoc, timetableDoc: facultyDoc, academicYear: targetYear });
      }

      // If no query parameters, return all timetables within faculty scope sanitized for this faculty
      const query = { academicYear: targetYear };
      const allDocs = await Timetable.find(query).select("-__v").limit(1000).lean();
      const authorizedDocs = allDocs
        .filter(doc => isFacultyAuthorizedForTimetable(req.user, doc.semester, doc.division, targetYear))
        .map(doc => sanitizeTimetableForFaculty(doc, req.user, targetYear));
      return res.json({ success: true, timetable: authorizedDocs, timetableDoc: authorizedDocs[0] || null, academicYear: targetYear });
    }

    // 3. Admin role: unrestricted
    if (req.user.role === "admin") {
      const targetYear = academicYear || (await academicYearService.getActiveYearCode());
      if (semester && division) {
        let doc = await Timetable.findOne({ semester, division, academicYear: targetYear }).select("-__v").lean();
        return res.json({
          success: true,
          timetable: doc || null,
          timetableDoc: doc || null,
          academicYear: targetYear
        });
      }

      const filter = { academicYear: targetYear };
      if (semester) filter.semester = semester;
      if (division) filter.division = division;
      const docs = await Timetable.find(filter).select("-__v").limit(1000).lean();
      return res.json({
        success: true,
        timetable: docs,
        timetableDoc: docs[0] || null,
        academicYear: targetYear
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
    const targetYear = req.query.academicYear ? stripHtmlTags(String(req.query.academicYear)).trim() : (await academicYearService.getActiveYearCode());
    let subjects = [];
    if (req.user.role === "admin") {
      subjects = Object.keys(SUBJECT_SEMESTER_CATALOGUE);
    } else {
      const scope = getFacultyAuthorizedScope(req.user, targetYear);
      if (!scope.isAuthorized) {
        return res.json({ success: true, facultyView: [] });
      }
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

    const allDocs = await Timetable.find({ academicYear: targetYear }).select("-__v").lean();
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

async function executeSaveTimetableWrite({ req, validated, explicitYear, explicitId }, session = null) {
  const { semester, division, days, timeSlots, cells } = validated;

  let existingById = null;
  if (explicitId) {
    if (!mongoose.Types.ObjectId.isValid(explicitId)) {
      return {
        earlyResponse: {
          status: 400,
          body: { success: false, code: "INVALID_TIMETABLE_ID", message: "Invalid timetable identifier." }
        }
      };
    }
    existingById = await Timetable.findById(explicitId)
      .setOptions(session ? { session } : {})
      .lean();
    if (!existingById) {
      return {
        earlyResponse: {
          status: 404,
          body: { success: false, code: "TIMETABLE_NOT_FOUND", message: `Timetable '${explicitId}' not found.` }
        }
      };
    }
    const idStoredYear = existingById.academicYear && typeof existingById.academicYear === "string"
      ? existingById.academicYear.trim()
      : "";
    if (!idStoredYear) {
      return {
        earlyResponse: {
          status: 409,
          body: {
            success: false,
            code: "IMMUTABLE_RECORD",
            message: "Timetable modification rejected: Unversioned historical timetables are immutable."
          }
        }
      };
    }
    if (idStoredYear !== explicitYear) {
      return {
        earlyResponse: {
          status: 409,
          body: {
            success: false,
            code: "IMMUTABLE_RECORD",
            message: `Timetable modification rejected: Record '${explicitId}' belongs to '${idStoredYear}' and cannot be reassigned to '${explicitYear}'.`
          }
        }
      };
    }
    if (existingById.semester !== semester || existingById.division !== division) {
      return {
        earlyResponse: {
          status: 409,
          body: {
            success: false,
            code: "IMMUTABLE_RECORD",
            message: "Timetable modification rejected: Stored timetable semester or division cannot be reassigned via ID reuse."
          }
        }
      };
    }
  }

  // Resolve matching grid timetable(s) strictly within target academicYear
  const naturalMatches = await Timetable.find({
    semester,
    division,
    academicYear: explicitYear,
    days: { $exists: true, $type: "array" }
  }).setOptions(session ? { session } : {}).lean();

  if (naturalMatches.length > 1) {
    return {
      earlyResponse: {
        status: 409,
        body: {
          success: false,
          code: "AMBIGUOUS_TIMETABLE_RECORD",
          message: "Timetable modification rejected: Multiple ambiguous timetable records match target key."
        }
      }
    };
  }

  const existing = existingById || naturalMatches[0] || null;
  if (existing) {
    const storedYear = existing.academicYear && typeof existing.academicYear === "string"
      ? existing.academicYear.trim()
      : "";
    if (!storedYear) {
      return {
        earlyResponse: {
          status: 409,
          body: {
            success: false,
            code: "IMMUTABLE_RECORD",
            message: "Timetable modification rejected: Unversioned historical timetables are immutable."
          }
        }
      };
    }
    if (storedYear !== explicitYear) {
      return {
        earlyResponse: {
          status: 409,
          body: {
            success: false,
            code: "IMMUTABLE_RECORD",
            message: `Timetable modification rejected: Stored academic year '${storedYear}' conflicts with '${explicitYear}'.`
          }
        }
      };
    }
  }

  // Fail-closed lifecycle check for BOTH admin and faculty + mutationEpoch fence inside tx
  const yearCheck = await validateAcademicYearOperationalForWrite(explicitYear, {
    session,
    bumpEpoch: Boolean(session),
    actionLabel: "Timetable modification"
  });
  if (!yearCheck.valid) {
    return {
      earlyResponse: {
        status: yearCheck.status,
        body: { success: false, code: yearCheck.code, message: yearCheck.message }
      }
    };
  }
  const cleanAcademicYear = yearCheck.academicYear;

  const workingCells = Array.isArray(cells) ? cells.map(c => ({ ...c })) : [];

  // Faculty authorization verification
  if (req.user.role === "faculty") {
    if (!isFacultyAuthorizedForTimetable(req.user, semester, division, cleanAcademicYear)) {
      return {
        earlyResponse: {
          status: 403,
          body: { success: false, message: "Access forbidden: You are not authorized to manage timetable for this Semester and Division." }
        }
      };
    }

    // 1. Faculty can ONLY author/assign subjects that are authorized for them
    for (const c of workingCells) {
      if (!c.subject) continue;
      const matchingExisting = existing && Array.isArray(existing.cells)
        ? existing.cells.find(ec => ec.dayIndex === c.dayIndex && ec.slotIndex === c.slotIndex)
        : null;
      const isUnchangedSubject = matchingExisting && isSameSubject(matchingExisting.subject, c.subject);
      if (!isUnchangedSubject && !canFacultySetSubject(req.user, c.subject, semester, division, cleanAcademicYear)) {
        return {
          earlyResponse: {
            status: 403,
            body: {
              success: false,
              message: `Access forbidden: You are not authorized to assign subject '${c.subject}'.`
            }
          }
        };
      }
    }

    // 2. Protect existing cells belonging to other faculty members
    if (existing && Array.isArray(existing.cells)) {
      for (const ec of existing.cells) {
        if (ec.subject && !canFacultySetSubject(req.user, ec.subject, semester, division, cleanAcademicYear)) {
          const matchingNewCell = workingCells.find(nc => nc.dayIndex === ec.dayIndex && nc.slotIndex === ec.slotIndex);
          if (matchingNewCell) {
            if (matchingNewCell.subject && !isSameSubject(matchingNewCell.subject, ec.subject)) {
              return {
                earlyResponse: {
                  status: 403,
                  body: {
                    success: false,
                    message: `Access forbidden: You cannot overwrite subject '${ec.subject}' belonging to another faculty member.`
                  }
                }
              };
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
            workingCells.push(ec);
          }
        }
      }
    }
  }

  const updateFilter = existingById
    ? { _id: existingById._id, academicYear: cleanAcademicYear }
    : { semester, division, academicYear: cleanAcademicYear, days: { $exists: true, $type: "array" } };

  const updated = await Timetable.findOneAndUpdate(
    updateFilter,
    { $set: { semester, division, academicYear: cleanAcademicYear, days, timeSlots, cells: workingCells } },
    { upsert: !existingById, returnDocument: "after", runValidators: true, ...(session ? { session } : {}) }
  );

  return { earlyResponse: null, updated, cleanAcademicYear };
}

async function handleSaveTimetable(req, res) {
  try {
    if (hasMongoOperators(req.body)) {
      return res.status(400).json({ success: false, message: "MongoDB operators are not permitted." });
    }

    const validated = validateTimetablePayload(req.body);
    if (validated.error) {
      return res.status(400).json({ success: false, message: validated.error });
    }

    const rawYear = req.body?.academicYear;
    if (typeof rawYear !== "string" || !stripHtmlTags(rawYear).trim()) {
      return res.status(400).json({
        success: false,
        code: "ACADEMIC_YEAR_REQUIRED",
        message: "Timetable modification rejected: Explicit active 'academicYear' is required."
      });
    }
    const explicitYear = stripHtmlTags(rawYear).trim();
    const explicitId = req.body?._id || req.body?.id ? stripHtmlTags(String(req.body._id || req.body.id)).trim() : "";

    const outcome = await academicYearService.runWithYearMutationGuard(async () => {
      if (academicYearService.isTransactionSupported()) {
        const session = await mongoose.startSession();
        let txResult = null;
        try {
          await session.withTransaction(async () => {
            txResult = null;
            txResult = await executeSaveTimetableWrite({ req, validated, explicitYear, explicitId }, session);
          });
        } finally {
          await session.endSession();
        }
        return txResult;
      }
      return executeSaveTimetableWrite({ req, validated, explicitYear, explicitId }, null);
    });

    if (outcome?.earlyResponse) {
      return res.status(outcome.earlyResponse.status).json(outcome.earlyResponse.body);
    }

    const returnDoc = req.user.role === "faculty"
      ? sanitizeTimetableForFaculty(outcome.updated.toObject ? outcome.updated.toObject() : outcome.updated, req.user, outcome.cleanAcademicYear)
      : outcome.updated;

    fileSyncService.triggerSync();
    res.json({ success: true, message: "Timetable saved successfully.", timetable: returnDoc });
  } catch (error) {
    console.error("Save timetable error:", error);
    res.status(500).json({ success: false, message: "Failed to save timetable." });
  }
}

app.post("/api/timetable", rateLimitExpensive, requireAuth(["faculty", "admin"]), handleSaveTimetable);
app.put("/api/timetable", rateLimitExpensive, requireAuth(["faculty", "admin"]), handleSaveTimetable);

async function executeDeleteTimetableWrite({ req, semester, division, targetYear, targetId }, session = null) {
  let matches = [];
  if (targetId) {
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return {
        earlyResponse: { status: 400, body: { success: false, code: "INVALID_TIMETABLE_ID", message: "Invalid timetable identifier." } }
      };
    }
    const byId = await Timetable.findById(targetId).setOptions(session ? { session } : {}).lean();
    if (byId) matches = [byId];
  } else {
    matches = await Timetable.find({ semester, division, academicYear: targetYear })
      .setOptions(session ? { session } : {})
      .lean();
  }

  for (const doc of matches) {
    const docYear = doc.academicYear && typeof doc.academicYear === "string" ? doc.academicYear.trim() : "";
    if (!docYear) {
      return {
        earlyResponse: {
          status: 409,
          body: { success: false, code: "IMMUTABLE_RECORD", message: "Timetable deletion rejected: Unversioned historical timetables are immutable." }
        }
      };
    }
    if (docYear !== targetYear) {
      return {
        earlyResponse: {
          status: 409,
          body: {
            success: false,
            code: "IMMUTABLE_RECORD",
            message: `Timetable deletion rejected: Stored academic year '${docYear}' does not match '${targetYear}'.`
          }
        }
      };
    }
  }

  if (matches.length > 1) {
    return {
      earlyResponse: {
        status: 409,
        body: { success: false, code: "AMBIGUOUS_TIMETABLE_RECORD", message: "Timetable deletion rejected: Multiple ambiguous timetable records match target." }
      }
    };
  }

  // Fail-closed lifecycle check for BOTH admin and faculty + mutationEpoch fence inside tx
  const yearCheck = await validateAcademicYearOperationalForWrite(targetYear, {
    session,
    bumpEpoch: Boolean(session),
    actionLabel: "Timetable deletion"
  });
  if (!yearCheck.valid) {
    return {
      earlyResponse: { status: yearCheck.status, body: { success: false, code: yearCheck.code, message: yearCheck.message } }
    };
  }

  if (matches.length === 0) {
    return {
      earlyResponse: {
        status: 404,
        body: { success: false, code: "TIMETABLE_NOT_FOUND", message: "No timetable found for the specified Semester, Division, and Academic Year." }
      }
    };
  }

  const targetDoc = matches[0];
  if (req.user.role === "faculty") {
    if (!isFacultyAuthorizedForTimetable(req.user, targetDoc.semester || semester, targetDoc.division || division, yearCheck.academicYear)) {
      return {
        earlyResponse: {
          status: 403,
          body: { success: false, message: "Access forbidden: You are not authorized to delete this timetable." }
        }
      };
    }
  }

  await Timetable.deleteOne(
    { _id: targetDoc._id, academicYear: yearCheck.academicYear },
    session ? { session } : {}
  );
  return { earlyResponse: null };
}

app.delete("/api/timetable", rateLimitExpensive, requireAuth(["faculty", "admin"]), async (req, res) => {
  try {
    const queryYear = req.query?.academicYear !== undefined ? stripHtmlTags(String(req.query.academicYear)).trim() : "";
    const bodyYear = req.body?.academicYear !== undefined ? stripHtmlTags(String(req.body.academicYear)).trim() : "";
    if (req.query?.academicYear !== undefined && req.body?.academicYear !== undefined && queryYear !== bodyYear) {
      return res.status(400).json({
        success: false,
        code: "ACADEMIC_YEAR_MISMATCH",
        message: "Query and body 'academicYear' parameters conflict."
      });
    }
    const rawYear = req.query?.academicYear !== undefined ? req.query.academicYear : req.body?.academicYear;
    if (typeof rawYear !== "string" || !stripHtmlTags(rawYear).trim()) {
      return res.status(400).json({
        success: false,
        code: "ACADEMIC_YEAR_REQUIRED",
        message: "Timetable deletion rejected: Explicit active 'academicYear' is required."
      });
    }
    const targetYear = stripHtmlTags(rawYear).trim();

    const queryId = req.query?.id ? stripHtmlTags(String(req.query.id)).trim() : "";
    const bodyId = req.body?._id || req.body?.id ? stripHtmlTags(String(req.body._id || req.body.id)).trim() : "";
    if (queryId && bodyId && queryId !== bodyId) {
      return res.status(400).json({
        success: false,
        code: "INVALID_TIMETABLE_ID",
        message: "Conflicting timetable IDs in query and request body."
      });
    }
    const targetId = queryId || bodyId;

    const semester = stripHtmlTags(String(req.query?.semester || req.body?.semester || "").trim());
    const division = stripHtmlTags(String(req.query?.division || req.body?.division || "").trim());

    if (!targetId && (!semester || !division)) {
      return res.status(400).json({ success: false, message: "Both semester and division are required to delete a timetable." });
    }

    const outcome = await academicYearService.runWithYearMutationGuard(async () => {
      if (academicYearService.isTransactionSupported()) {
        const session = await mongoose.startSession();
        let txResult = null;
        try {
          await session.withTransaction(async () => {
            txResult = null;
            txResult = await executeDeleteTimetableWrite({ req, semester, division, targetYear, targetId }, session);
          });
        } finally {
          await session.endSession();
        }
        return txResult;
      }
      return executeDeleteTimetableWrite({ req, semester, division, targetYear, targetId }, null);
    });

    if (outcome?.earlyResponse) {
      return res.status(outcome.earlyResponse.status).json(outcome.earlyResponse.body);
    }

    fileSyncService.triggerSync();
    res.json({ success: true, message: "Timetable deleted successfully." });
  } catch (error) {
    console.error("Delete timetable error:", error);
    res.status(500).json({ success: false, message: "Failed to delete timetable." });
  }
});

// Backward compatibility endpoint for legacy slot sync (hardened with explicit academicYear & auth checks)
async function executeSyncTimetableSlotsWrite({ req, cleanYear, validEntries }, session = null) {
  // Check existing slot keys and explicit IDs for unversioned or cross-year immutable conflicts
  if (validEntries.length > 0) {
    for (const item of validEntries) {
      if (item.rawMongoId && !mongoose.Types.ObjectId.isValid(item.rawMongoId)) {
        return {
          earlyResponse: {
            status: 400,
            body: { success: false, code: "INVALID_TIMETABLE_ID", message: "Invalid timetable identifier in sync payload." }
          }
        };
      }
      const lookupId = item.rawMongoId || (item.explicitId && mongoose.Types.ObjectId.isValid(item.explicitId) ? item.explicitId : "");
      if (lookupId) {
        const idDoc = await Timetable.findById(lookupId).setOptions(session ? { session } : {}).lean();
        if (idDoc) {
          const idYear = idDoc.academicYear && typeof idDoc.academicYear === "string" ? idDoc.academicYear.trim() : "";
          if (!idYear || idYear !== cleanYear) {
            return {
              earlyResponse: {
                status: 409,
                body: {
                  success: false,
                  code: "IMMUTABLE_RECORD",
                  message: `Timetable sync rejected: Record '${lookupId}' belongs to ${idYear || "unversioned historical storage"}, not '${cleanYear}'.`
                }
              }
            };
          }
        }
      }
    }

    const slotQueries = validEntries.map(item => ({
      division: item.division,
      semester: item.semester,
      day: item.day,
      time: item.time
    }));
    // Reject only unversioned legacy slot collisions while permitting legitimate cross-year slot coexistence
    const existingUnversionedSlots = await Timetable.find({
      $and: [
        { $or: slotQueries },
        { $or: [{ academicYear: { $exists: false } }, { academicYear: null }, { academicYear: "" }] }
      ]
    })
      .setOptions(session ? { session } : {})
      .lean();

    if (existingUnversionedSlots.length > 0) {
      return {
        earlyResponse: {
          status: 409,
          body: {
            success: false,
            code: "IMMUTABLE_RECORD",
            message: "Timetable sync rejected: Unversioned historical timetable slot records are immutable."
          }
        }
      };
    }
  }

  const yearCheck = await validateAcademicYearOperationalForWrite(cleanYear, {
    session,
    bumpEpoch: Boolean(session),
    actionLabel: "Timetable sync"
  });
  if (!yearCheck.valid) {
    return {
      earlyResponse: { status: yearCheck.status, body: { success: false, code: yearCheck.code, message: yearCheck.message } }
    };
  }
  const activeYear = yearCheck.academicYear;

  if (req.user.role === "faculty") {
    for (const item of validEntries) {
      if (!isFacultyAuthorizedForTimetable(req.user, item.semester, item.division, activeYear) ||
          !canFacultySetSubject(req.user, item.subject || item.subjectText, item.semester, item.division, activeYear)) {
        return {
          earlyResponse: {
            status: 403,
            body: {
              success: false,
              code: "FACULTY_UNAUTHORIZED",
              message: `Access forbidden: Not authorized to sync timetable slot for '${item.subject || item.subjectText}' in ${item.semester} ${item.division}.`
            }
          }
        };
      }
    }
  }

  if (validEntries.length > 0) {
    const ops = validEntries.map(item => ({
      updateOne: {
        filter: {
          academicYear: activeYear,
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
            faculty: item.faculty,
            academicYear: activeYear
          }
        },
        upsert: true
      }
    }));
    await Timetable.bulkWrite(ops, { ordered: true, ...(session ? { session } : {}) });
  }

  return { earlyResponse: null };
}

app.post("/api/timetable/sync", rateLimitExpensive, requireAuth(["faculty", "admin"]), async (req, res) => {
  try {
    if (hasMongoOperators(req.body)) {
      return res.status(400).json({ success: false, message: "MongoDB operators are not permitted." });
    }

    const { timetable, academicYear } = req.body || {};
    if (!timetable || !Array.isArray(timetable)) {
      return res.status(400).json({ success: false, message: "Timetable must be an array of schedule entries." });
    }
    if (timetable.length > 1000) {
      return res.status(400).json({ success: false, message: "Timetable exceeds maximum allowed limit of 1000 entries." });
    }
    if (typeof academicYear !== "string" || !stripHtmlTags(academicYear).trim()) {
      return res.status(400).json({
        success: false,
        code: "ACADEMIC_YEAR_REQUIRED",
        message: "Timetable sync rejected: Explicit active 'academicYear' is required."
      });
    }
    const cleanYear = stripHtmlTags(academicYear).trim();

    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const validEntries = [];

    for (const item of timetable) {
      if (!item || typeof item !== "object") continue;
      if (Object.prototype.hasOwnProperty.call(item, "academicYear")) {
        if (typeof item.academicYear !== "string" || !stripHtmlTags(item.academicYear).trim()) {
          return res.status(400).json({
            success: false,
            code: "ACADEMIC_YEAR_REQUIRED",
            message: "Timetable entry contains empty or invalid 'academicYear'."
          });
        }
        const itemYr = stripHtmlTags(item.academicYear).trim();
        if (itemYr !== cleanYear) {
          return res.status(409).json({
            success: false,
            code: "IMMUTABLE_RECORD",
            message: `Timetable entry academicYear '${itemYr}' conflicts with payload academicYear '${cleanYear}'.`
          });
        }
      }

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

      const rawMongoId = item._id !== undefined && item._id !== null ? stripHtmlTags(String(item._id)).trim() : "";
      const explicitId = item.id !== undefined && item.id !== null ? stripHtmlTags(String(item.id)).trim() : "";
      validEntries.push({
        rawMongoId,
        explicitId,
        division,
        semester,
        day,
        time,
        subject,
        subjectText,
        faculty
      });
    }

    const outcome = await academicYearService.runWithYearMutationGuard(async () => {
      if (academicYearService.isTransactionSupported()) {
        const session = await mongoose.startSession();
        let txResult = null;
        try {
          await session.withTransaction(async () => {
            txResult = null;
            txResult = await executeSyncTimetableSlotsWrite({ req, cleanYear, validEntries }, session);
          });
        } finally {
          await session.endSession();
        }
        return txResult;
      }
      return executeSyncTimetableSlotsWrite({ req, cleanYear, validEntries }, null);
    });

    if (outcome?.earlyResponse) {
      return res.status(outcome.earlyResponse.status).json(outcome.earlyResponse.body);
    }

    fileSyncService.triggerSync();
    res.json({ success: true, message: "Timetable synchronized safely." });
  } catch (error) {
    console.error("Sync timetable error:", error);
    res.status(500).json({ success: false, message: "Failed to sync timetable." });
  }
});



// --- Attendance Validation & Authorization Helpers ---

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

function validateFacultyAttendanceAuthorization(user, subject, division, semester, academicYear) {
  if (!user) return { authorized: false, reason: "Authentication required.", code: "AUTH_REQUIRED" };
  if (user.role === "admin") return { authorized: true };
  if (user.role !== "faculty") return { authorized: false, reason: "Requires faculty or admin role.", code: "ROLE_NOT_AUTHORIZED" };

  const cleanSub = String(subject || "").trim();
  if (!cleanSub) return { authorized: false, reason: "Subject is required.", code: "SUBJECT_REQUIRED" };

  const scope = getFacultyAuthorizedScope(user, academicYear);
  if (!scope.isAuthorized) {
    return {
      authorized: false,
      reason: scope.reason || "Faculty is not authorized for the requested academic year.",
      code: scope.code || "ACADEMIC_YEAR_SCOPE_UNAUTHORIZED"
    };
  }
  if (!scope.subjects || scope.subjects.length === 0) {
    return { authorized: false, reason: "Faculty has no assigned subjects.", code: "NO_ASSIGNED_SUBJECTS" };
  }

  const isAssignedSubject = scope.subjects.some(assigned => isSameSubject(assigned, cleanSub));
  if (!isAssignedSubject) {
    return {
      authorized: false,
      reason: `Faculty is not authorized to manage attendance for unassigned subject: ${cleanSub}`,
      code: "UNAUTHORIZED_SUBJECT"
    };
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
        return {
          authorized: false,
          reason: `Faculty is not authorized to manage attendance for division: ${division}`,
          code: "UNAUTHORIZED_DIVISION"
        };
      }
    }
  }

  // Semester check
  if (semester) {
    const normSem = String(semester).trim().toLowerCase();
    const cleanTargetSem = normSem.replace(/[\s_-]+/g, "");
    const matchedSubject = scope.subjects.find(assigned => isSameSubject(assigned, cleanSub));
    const assignedSem = (scope.semesters && scope.semesters.find(s => String(s).trim().toLowerCase().replace(/[\s_-]+/g, "") === cleanTargetSem)) ||
      getSubjectSemester(matchedSubject) || user.semester;
    if (assignedSem) {
      const normAssignedSem = String(assignedSem).trim().toLowerCase().replace(/[\s_-]+/g, "");
      if (normAssignedSem && cleanTargetSem && normAssignedSem !== cleanTargetSem) {
        return {
          authorized: false,
          reason: `Faculty is not authorized to manage attendance for semester: ${semester}`,
          code: "UNAUTHORIZED_SEMESTER"
        };
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
    const { semester, division, subject, date, isoDate, studentUsername, academicYear } = req.query;

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
      if (academicYear) query.academicYear = academicYear;

      let docs = await Attendance.find(query).sort({ date: -1, createdAt: -1 }).lean();

      if (!docs || docs.length === 0) {
        const store = await AcademicStore.findOne({ storeKey: "default_academic_store" }).lean();
        docs = (store?.dailyAttendance || []).filter(a => {
          if (!a) return false;
          if (subject && !isSameSubject(a.subject, subject)) return false;
          if (academicYear && a.academicYear && a.academicYear !== academicYear) return false;
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
      const targetYear = academicYear || (await academicYearService.getActiveYearCode());
      if (subject) {
        const authCheck = validateFacultyAttendanceAuthorization(req.user, subject, division, semester, targetYear);
        if (!authCheck.authorized) {
          return res.status(403).json({ success: false, message: authCheck.reason });
        }
      }
      if (division) {
        const authCheck = validateFacultyAttendanceAuthorization(req.user, subject || req.user.subject, division, semester, targetYear);
        if (!authCheck.authorized) {
          return res.status(403).json({ success: false, message: authCheck.reason });
        }
      }

      const scope = getFacultyAuthorizedScope(req.user, targetYear);
      if (!scope.isAuthorized) {
        return res.status(403).json({ success: false, message: scope.reason || "Access forbidden." });
      }
      const query = {};
      if (subject) {
        query.subject = subject;
      } else {
        query.subject = { $in: scope.subjects };
      }
      if (division) query.division = division;
      if (semester) query.semester = semester;
      if (targetYear) query.academicYear = targetYear;
      if (isoDate || date) query.$or = [{ isoDate: isoDate || date }, { date: date || isoDate }];

      let docs = await Attendance.find(query).sort({ date: -1, createdAt: -1 }).lean();

      if (!docs || docs.length === 0) {
        const store = await AcademicStore.findOne({ storeKey: "default_academic_store" }).lean();
        docs = (store?.dailyAttendance || []).filter(a => {
          if (!a || !a.subject) return false;
          if (subject && !isSameSubject(a.subject, subject)) return false;
          if (division && a.division !== division) return false;
          if (semester && a.semester !== semester) return false;
          if (targetYear && a.academicYear && a.academicYear !== targetYear) return false;
          return canFacultySetSubject(req.user, a.subject, a.semester, a.division, targetYear);
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
      if (academicYear) query.academicYear = academicYear;
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
          if (academicYear && a.academicYear && a.academicYear !== academicYear) return false;
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

async function resolveActiveYearCodeWithSession(session = null) {
  if (session) {
    const activeDocs = await AcademicYear.find({ status: "active" }).session(session).exec();
    if (!activeDocs || activeDocs.length === 0) return "";
    if (activeDocs.length > 1) {
      const err = new Error("Data integrity error: Multiple academic years are marked active.");
      err.code = "MULTIPLE_ACTIVE_YEARS";
      throw err;
    }
    return activeDocs[0].yearCode || "";
  }
  const activeCode = await academicYearService.getActiveYearCode();
  return activeCode || "";
}

/**
 * Strict fail-closed academic-year operational write guard for ALL roles (faculty and admin).
 * Requires a non-empty academicYear resolving to an existing AcademicYear document with status === "active".
 * Optionally increments mutationEpoch inside replica-set transactions to catch concurrent transitions.
 */
async function validateAcademicYearOperationalForWrite(yearCode, options = {}) {
  const {
    session = null,
    bumpEpoch = false,
    actionLabel = "Academic modification"
  } = options;

  if (typeof yearCode !== "string" || !yearCode.trim()) {
    return {
      valid: false,
      status: 400,
      code: "ACADEMIC_YEAR_REQUIRED",
      message: `${actionLabel} rejected: Valid active academicYear is required.`
    };
  }

  const cleanYear = stripHtmlTags(yearCode).trim();
  if (!cleanYear) {
    return {
      valid: false,
      status: 400,
      code: "ACADEMIC_YEAR_REQUIRED",
      message: `${actionLabel} rejected: Valid active academicYear is required.`
    };
  }

  const yearDoc = await academicYearService.getAcademicYearByIdOrCode(cleanYear, session);
  if (!yearDoc) {
    return {
      valid: false,
      status: 400,
      code: "ACADEMIC_YEAR_NOT_FOUND",
      message: `${actionLabel} rejected: Academic year '${cleanYear}' does not exist.`
    };
  }

  if (yearDoc.status === "completed") {
    return {
      valid: false,
      status: 403,
      code: "ACADEMIC_YEAR_COMPLETED",
      message: `${actionLabel} rejected: Academic year '${yearDoc.yearCode}' is completed and strictly read-only.`
    };
  }

  if (yearDoc.status === "archived") {
    return {
      valid: false,
      status: 403,
      code: "ACADEMIC_YEAR_ARCHIVED",
      message: `${actionLabel} rejected: Academic year '${yearDoc.yearCode}' is archived and strictly read-only.`
    };
  }

  if (yearDoc.status !== "active") {
    return {
      valid: false,
      status: 403,
      code: "ACADEMIC_YEAR_NOT_ACTIVE",
      message: `${actionLabel} rejected: Academic year '${yearDoc.yearCode}' has status '${yearDoc.status}' and is not active.`
    };
  }

  if (bumpEpoch && session) {
    const fenced = await AcademicYear.findOneAndUpdate(
      { _id: yearDoc._id, status: "active" },
      { $inc: { mutationEpoch: 1 } },
      { session, returnDocument: "after" }
    );
    if (!fenced) {
      return {
        valid: false,
        status: 409,
        code: "ACADEMIC_YEAR_CONFLICT",
        message: `${actionLabel} rejected: Academic year '${yearDoc.yearCode}' changed status concurrently during mutation.`
      };
    }
  }

  return {
    valid: true,
    academicYear: yearDoc.yearCode,
    yearDoc
  };
}

async function executeSaveAttendanceWrite(ctx, session = null) {
  const {
    req,
    cleanSub,
    cleanDiv,
    cleanSem,
    cleanYear,
    dateRes,
    validatedRecords,
    topStatus,
    studentUsername,
    facultyUser,
    explicitTargetId,
    isPathIdUpdate,
    isUpdateMethod,
    requestedYear
  } = ctx;

  let store = await AcademicStore.findOne({ storeKey: "default_academic_store" })
    .setOptions(session ? { session } : {});

  let storedYear = "";
  let allExistingById = [];
  if (explicitTargetId) {
    const existingAttMatches = await Attendance.find({
      $or: [{ attendanceId: explicitTargetId }, { id: explicitTargetId }]
    }).setOptions(session ? { session } : {}).lean();

    const existingStoreMatches = store
      ? (store.dailyAttendance || []).filter(d => d && (d.id === explicitTargetId || d.attendanceId === explicitTargetId))
      : [];

    allExistingById = [...existingAttMatches, ...existingStoreMatches];

    if ((isPathIdUpdate || isUpdateMethod) && allExistingById.length === 0) {
      return {
        earlyResponse: {
          status: 404,
          body: {
            success: false,
            code: "ATTENDANCE_NOT_FOUND",
            message: `Attendance record '${explicitTargetId}' not found.`
          }
        }
      };
    }

    if (allExistingById.length > 0) {
      const hasUnversioned = allExistingById.some(d => !d.academicYear || typeof d.academicYear !== "string" || !d.academicYear.trim());
      if (hasUnversioned) {
        return {
          earlyResponse: {
            status: 409,
            body: {
              success: false,
              code: "IMMUTABLE_RECORD",
              message: "Attendance modification rejected: Unversioned historical attendance records are immutable."
            }
          }
        };
      }

      const existingYears = new Set(allExistingById.map(d => String(d.academicYear).trim()));
      if (existingYears.size > 1) {
        return {
          earlyResponse: {
            status: 409,
            body: {
              success: false,
              code: "IMMUTABLE_RECORD",
              message: "Attendance modification rejected: Target attendance ID spans multiple academic years."
            }
          }
        };
      }

      storedYear = Array.from(existingYears)[0];
      if (requestedYear && requestedYear !== storedYear) {
        return {
          earlyResponse: {
            status: 409,
            body: {
              success: false,
              code: "IMMUTABLE_RECORD",
              message: `Attendance modification rejected: Record '${explicitTargetId}' belongs to academic year '${storedYear}' and cannot be reassigned to '${requestedYear}'.`
            }
          }
        };
      }
    }
  }

  let cleanAcademicYear = storedYear || requestedYear || (await resolveActiveYearCodeWithSession(session));

  const targetAttId = explicitTargetId ||
    ("att_" + crypto.createHash("sha256").update(`${dateRes.isoDate}_${cleanSub}_${cleanDiv}_${cleanSem}_${cleanAcademicYear}`).digest("hex").slice(0, 16));

  // Verify natural deterministic IDs also cannot silently collide with unversioned or cross-year records
  if (!explicitTargetId && cleanAcademicYear) {
    const idCollAtt = await Attendance.find({
      $or: [{ attendanceId: targetAttId }, { id: targetAttId }]
    }).setOptions(session ? { session } : {}).lean();
    const idCollStore = store
      ? (store.dailyAttendance || []).filter(d => d && (d.id === targetAttId || d.attendanceId === targetAttId))
      : [];
    const idCollAll = [...idCollAtt, ...idCollStore];
    if (idCollAll.some(d => !d.academicYear || String(d.academicYear).trim() !== cleanAcademicYear)) {
      return {
        earlyResponse: {
          status: 409,
          body: {
            success: false,
            code: "IMMUTABLE_RECORD",
            message: "Attendance modification rejected: Deterministic attendance ID conflicts with historical or cross-year data."
          }
        }
      };
    }
  }

  // Fail-closed lifecycle check for BOTH faculty and admin
  const yearValidation = await validateAcademicYearOperationalForWrite(cleanAcademicYear, {
    session,
    bumpEpoch: Boolean(session),
    actionLabel: "Attendance modification"
  });
  if (!yearValidation.valid) {
    return {
      earlyResponse: {
        status: yearValidation.status,
        body: {
          success: false,
          code: yearValidation.code,
          message: yearValidation.message
        }
      }
    };
  }
  cleanAcademicYear = yearValidation.academicYear;

  // Faculty authorization against existing matched records AND target payload scope
  if (req.user.role === "faculty") {
    for (const rec of allExistingById) {
      const existingAuth = validateFacultyAttendanceAuthorization(
        req.user,
        rec.subject,
        rec.division,
        rec.semester,
        cleanAcademicYear
      );
      if (!existingAuth.authorized) {
        return {
          earlyResponse: {
            status: 403,
            body: {
              success: false,
              code: existingAuth.code || "FACULTY_UNAUTHORIZED",
              message: `Attendance modification rejected for existing record scope: ${existingAuth.reason}`
            }
          }
        };
      }
    }

    const auth = validateFacultyAttendanceAuthorization(
      req.user,
      req.body.subject,
      req.body.division,
      req.body.semester,
      cleanAcademicYear
    );
    if (!auth.authorized) {
      return {
        earlyResponse: {
          status: 403,
          body: {
            success: false,
            code: auth.code || "FACULTY_UNAUTHORIZED",
            message: auth.reason
          }
        }
      };
    }
  }

  // Capture previous state to ensure idempotency and prevent duplicate pushes on identical saves
  // Strictly scoped by academicYear: unversioned legacy or other years' records will never match
  const prevAtt = await Attendance.findOne({
      academicYear: cleanAcademicYear,
      $or: [
        { attendanceId: targetAttId },
        { subject: cleanSub, division: cleanDiv, semester: cleanSem, isoDate: dateRes.isoDate }
      ]
    }).setOptions(session ? { session } : {}).lean();

  const prevStoreMatch = store
    ? (store.dailyAttendance || []).some(d =>
        d &&
        d.academicYear === cleanAcademicYear &&
        (
          (d.id === targetAttId || d.attendanceId === targetAttId) ||
          (isSameSubject(d.subject, cleanSub) && d.division === cleanDiv && d.semester === cleanSem && (d.isoDate === dateRes.isoDate || d.date === dateRes.date))
        )
      )
    : false;

  if (isUpdateMethod && !prevAtt && !prevStoreMatch) {
    return {
      earlyResponse: {
        status: 404,
        body: {
          success: false,
          code: "ATTENDANCE_NOT_FOUND",
          message: "Attendance record not found for update. Use POST /api/attendance to create a new record."
        }
      }
    };
  }

  // 1. Non-destructive update in dedicated Attendance collection
  // Guaranteed to match ONLY records belonging to the exact target academicYear
  const attDoc = await Attendance.findOneAndUpdate(
    {
      academicYear: cleanAcademicYear,
      $or: [
        { attendanceId: targetAttId },
        { subject: cleanSub, division: cleanDiv, semester: cleanSem, isoDate: dateRes.isoDate }
      ]
    },
    {
      $set: {
        id: targetAttId,
        attendanceId: targetAttId,
        subject: cleanSub,
        division: cleanDiv,
        semester: cleanSem,
        courseYear: cleanYear,
        academicYear: cleanAcademicYear,
        date: dateRes.date,
        isoDate: dateRes.isoDate,
        records: validatedRecords,
        studentUsername: studentUsername ? stripHtmlTags(studentUsername) : "",
        status: topStatus,
        facultyUsername: facultyUser
      }
    },
    { upsert: !isUpdateMethod || prevStoreMatch, returnDocument: "after", setDefaultsOnInsert: true, ...(session ? { session } : {}) }
  );

  // 2. Synchronize AcademicStore.dailyAttendance
  if (!store) {
    store = new AcademicStore({
      storeKey: "default_academic_store",
      activeAcademicYear: cleanAcademicYear,
      students: {},
      notices: [],
      assignments: [],
      notes: [],
      dailyAttendance: []
    });
  }
  if (!store.students) store.students = {};
  const daily = store.dailyAttendance || [];
  // Strict year-scoped matching: unversioned legacy attendance (d.academicYear is empty/missing)
  // or attendance records from different academic years will NEVER match and are 100% preserved.
  const existingIdx = daily.findIndex(d =>
    d &&
    d.academicYear === cleanAcademicYear &&
    (
      (d.id === targetAttId || d.attendanceId === targetAttId) ||
      (isSameSubject(d.subject, cleanSub) && d.division === cleanDiv && d.semester === cleanSem && (d.isoDate === dateRes.isoDate || d.date === dateRes.date))
    )
  );

  const entryToSave = {
    id: targetAttId,
    attendanceId: targetAttId,
    subject: cleanSub,
    division: cleanDiv,
    semester: cleanSem,
    courseYear: cleanYear,
    academicYear: cleanAcademicYear,
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

  try {
    await store.save(session ? { session } : {});
  } catch (storeErr) {
    // On standalone MongoDB (without multi-doc transactions), compensate Attendance update
    if (!session) {
      try {
        if (prevAtt && prevAtt._id) {
          const restoreDoc = { ...prevAtt };
          delete restoreDoc._id;
          await Attendance.replaceOne({ _id: prevAtt._id }, restoreDoc);
        } else if (attDoc && attDoc._id) {
          await Attendance.deleteOne({ _id: attDoc._id });
        }
      } catch (compErr) {
        console.error("[Attendance] Standalone rollback compensation failed:", compErr.message);
      }
    }
    throw storeErr;
  }

  return {
    earlyResponse: null,
    attDoc,
    targetAttId,
    prevAtt
  };
}

// Common handler for POST and PUT /api/attendance and PUT /api/attendance/:id
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

    const paramId = req.params?.id ? stripHtmlTags(String(req.params.id)).trim() : "";
    const bodyAttId = attendanceId ? stripHtmlTags(String(attendanceId)).trim() : "";
    const bodyId = id ? stripHtmlTags(String(id)).trim() : "";

    if (paramId && ((bodyAttId && bodyAttId !== paramId) || (bodyId && bodyId !== paramId))) {
      return res.status(400).json({
        success: false,
        code: "ATTENDANCE_ID_MISMATCH",
        message: "Path attendance ID does not match body attendance ID."
      });
    }
    if (bodyAttId && bodyId && bodyAttId !== bodyId) {
      return res.status(400).json({
        success: false,
        code: "ATTENDANCE_ID_MISMATCH",
        message: "Conflicting 'attendanceId' and 'id' fields in request body."
      });
    }

    const explicitTargetId = paramId || bodyAttId || bodyId;
    const isPathIdUpdate = Boolean(paramId);
    const isUpdateMethod = req.method === "PUT";

    const hasAcademicYearField = Boolean(req.body && Object.prototype.hasOwnProperty.call(req.body, "academicYear"));
    let requestedYear = "";
    if (hasAcademicYearField) {
      if (typeof req.body.academicYear !== "string") {
        return res.status(400).json({
          success: false,
          code: "ACADEMIC_YEAR_REQUIRED",
          message: "Attendance modification rejected: 'academicYear' must be a valid non-empty string."
        });
      }
      requestedYear = stripHtmlTags(req.body.academicYear).trim();
      if (!requestedYear) {
        return res.status(400).json({
          success: false,
          code: "ACADEMIC_YEAR_REQUIRED",
          message: "Attendance modification rejected: 'academicYear' cannot be empty or whitespace."
        });
      }
    }

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

    const cleanSub = stripHtmlTags(subject).trim();
    const cleanDiv = stripHtmlTags(division).trim();
    const cleanSem = stripHtmlTags(semester).trim();
    const cleanYear = stripHtmlTags(courseYear || "").trim();
    const facultyUser = req.user.role === "faculty" ? req.user.username : (stripHtmlTags(facultyUsername || "admin"));

    const writeContext = {
      req,
      cleanSub,
      cleanDiv,
      cleanSem,
      cleanYear,
      dateRes,
      validatedRecords,
      topStatus,
      studentUsername,
      facultyUser,
      explicitTargetId,
      isPathIdUpdate,
      isUpdateMethod,
      requestedYear
    };

    const outcome = await academicYearService.runWithYearMutationGuard(async () => {
      if (academicYearService.isTransactionSupported()) {
        const session = await mongoose.startSession();
        let txResult = null;
        try {
          await session.withTransaction(async () => {
            txResult = null;
            txResult = await executeSaveAttendanceWrite(writeContext, session);
          });
        } finally {
          await session.endSession();
        }
        return txResult;
      }
      return executeSaveAttendanceWrite(writeContext, null);
    });

    if (outcome?.earlyResponse) {
      return res.status(outcome.earlyResponse.status).json(outcome.earlyResponse.body);
    }

    const { attDoc, targetAttId, prevAtt } = outcome;

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

async function executeDeleteAttendanceWrite({ req, targetId, requestedYear }, session = null) {
  const attMatches = await Attendance.find({
    $or: [{ attendanceId: targetId }, { id: targetId }]
  }).setOptions(session ? { session } : {}).lean();

  const store = await AcademicStore.findOne({ storeKey: "default_academic_store" })
    .setOptions(session ? { session } : {});
  const storeMatches = (store?.dailyAttendance || []).filter(
    d => d && (d.id === targetId || d.attendanceId === targetId)
  );

  const allMatches = [...attMatches, ...storeMatches];
  if (allMatches.length === 0) {
    return {
      earlyResponse: {
        status: 404,
        body: { success: false, code: "ATTENDANCE_NOT_FOUND", message: "Attendance record not found." }
      }
    };
  }

  // Fail closed on unversioned historical records: never fall back to the currently active year
  const hasUnversioned = allMatches.some(d => !d.academicYear || typeof d.academicYear !== "string" || !d.academicYear.trim());
  if (hasUnversioned) {
    return {
      earlyResponse: {
        status: 409,
        body: {
          success: false,
          code: "IMMUTABLE_RECORD",
          message: "Attendance deletion rejected: Unversioned historical attendance records are immutable."
        }
      }
    };
  }

  const foundYears = new Set(allMatches.map(d => String(d.academicYear).trim()));
  if (foundYears.size > 1) {
    return {
      earlyResponse: {
        status: 409,
        body: {
          success: false,
          code: "AMBIGUOUS_ATTENDANCE_RECORD",
          message: "Attendance deletion rejected: Attendance ID spans multiple academic years."
        }
      }
    };
  }

  const recYear = Array.from(foundYears)[0];
  if (requestedYear && requestedYear !== recYear) {
    return {
      earlyResponse: {
        status: 409,
        body: {
          success: false,
          code: "IMMUTABLE_RECORD",
          message: `Attendance deletion rejected: Record belongs to academic year '${recYear}', not '${requestedYear}'.`
        }
      }
    };
  }

  // Fail-closed lifecycle check for BOTH faculty and admin
  const yearValidation = await validateAcademicYearOperationalForWrite(recYear, {
    session,
    bumpEpoch: Boolean(session),
    actionLabel: "Attendance deletion"
  });
  if (!yearValidation.valid) {
    return {
      earlyResponse: {
        status: yearValidation.status,
        body: {
          success: false,
          code: yearValidation.code,
          message: yearValidation.message
        }
      }
    };
  }

  if (req.user.role === "faculty") {
    for (const rec of allMatches) {
      const auth = validateFacultyAttendanceAuthorization(
        req.user,
        rec.subject || "",
        rec.division || "",
        rec.semester || "",
        recYear
      );
      if (!auth.authorized) {
        return {
          earlyResponse: {
            status: 403,
            body: { success: false, code: auth.code || "FACULTY_UNAUTHORIZED", message: auth.reason }
          }
        };
      }
    }
  }

  const primaryRecSubject = attMatches[0]?.subject || storeMatches[0]?.subject || "";

  await Attendance.deleteMany(
    {
      academicYear: recYear,
      $or: [{ attendanceId: targetId }, { id: targetId }]
    },
    session ? { session } : {}
  );

  if (store) {
    store.dailyAttendance = (store.dailyAttendance || []).filter(
      d => !d || !(d.academicYear === recYear && (d.id === targetId || d.attendanceId === targetId))
    );
    if (store.students) {
      recalculateOverallAttendance(store.dailyAttendance, store.students, primaryRecSubject);
      store.markModified("students");
    }
    store.markModified("dailyAttendance");

    try {
      await store.save(session ? { session } : {});
    } catch (storeErr) {
      if (!session && attMatches.length > 0) {
        try {
          await Attendance.insertMany(attMatches, { ordered: false });
        } catch (compErr) {
          console.error("[Attendance] Standalone delete rollback compensation failed:", compErr.message);
        }
      }
      throw storeErr;
    }
  }

  return { earlyResponse: null };
}

// DELETE /api/attendance/:id and DELETE /api/attendance
async function handleDeleteAttendance(req, res) {
  try {
    if (hasMongoOperators(req.body) || hasMongoOperators(req.query)) {
      return res.status(400).json({ success: false, message: "MongoDB operators are not permitted." });
    }

    const paramId = req.params?.id ? stripHtmlTags(String(req.params.id)).trim() : "";
    const bodyAttId = req.body?.attendanceId ? stripHtmlTags(String(req.body.attendanceId)).trim() : "";
    const bodyId = req.body?.id ? stripHtmlTags(String(req.body.id)).trim() : "";
    const queryAttId = req.query?.attendanceId ? stripHtmlTags(String(req.query.attendanceId)).trim() : "";
    const queryId = req.query?.id ? stripHtmlTags(String(req.query.id)).trim() : "";

    const suppliedIds = [paramId, bodyAttId, bodyId, queryAttId, queryId].filter(Boolean);
    if (new Set(suppliedIds).size > 1) {
      return res.status(400).json({
        success: false,
        code: "ATTENDANCE_ID_MISMATCH",
        message: "Conflicting attendance identifiers provided across path, body, and query parameters."
      });
    }

    const targetId = suppliedIds[0] || "";
    if (!targetId) {
      return res.status(400).json({ success: false, message: "Attendance ID is required for deletion." });
    }

    const hasBodyYear = Boolean(req.body && Object.prototype.hasOwnProperty.call(req.body, "academicYear"));
    const hasQueryYear = Boolean(req.query && Object.prototype.hasOwnProperty.call(req.query, "academicYear"));
    let requestedYear = "";
    if (hasBodyYear || hasQueryYear) {
      if (hasBodyYear && (typeof req.body.academicYear !== "string" || !stripHtmlTags(req.body.academicYear).trim())) {
        return res.status(400).json({
          success: false,
          code: "ACADEMIC_YEAR_REQUIRED",
          message: "Attendance deletion rejected: Explicit 'academicYear' cannot be empty or invalid."
        });
      }
      if (hasQueryYear && (typeof req.query.academicYear !== "string" || !stripHtmlTags(req.query.academicYear).trim())) {
        return res.status(400).json({
          success: false,
          code: "ACADEMIC_YEAR_REQUIRED",
          message: "Attendance deletion rejected: Explicit query 'academicYear' cannot be empty or invalid."
        });
      }
      const cleanBodyYr = hasBodyYear ? stripHtmlTags(req.body.academicYear).trim() : "";
      const cleanQueryYr = hasQueryYear ? stripHtmlTags(req.query.academicYear).trim() : "";
      if (cleanBodyYr && cleanQueryYr && cleanBodyYr !== cleanQueryYr) {
        return res.status(400).json({
          success: false,
          code: "ACADEMIC_YEAR_MISMATCH",
          message: "Conflicting 'academicYear' values in request body and query."
        });
      }
      requestedYear = cleanBodyYr || cleanQueryYr;
    }

    const outcome = await academicYearService.runWithYearMutationGuard(async () => {
      if (academicYearService.isTransactionSupported()) {
        const session = await mongoose.startSession();
        let txResult = null;
        try {
          await session.withTransaction(async () => {
            txResult = null;
            txResult = await executeDeleteAttendanceWrite({ req, targetId, requestedYear }, session);
          });
        } finally {
          await session.endSession();
        }
        return txResult;
      }
      return executeDeleteAttendanceWrite({ req, targetId, requestedYear }, null);
    });

    if (outcome?.earlyResponse) {
      return res.status(outcome.earlyResponse.status).json(outcome.earlyResponse.body);
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
      store = {
        storeKey: "default_academic_store",
        students: {},
        notices: [],
        timetable: [],
        timetableHeader: {},
        customBreakRows: {},
        assignments: [],
        notes: [],
        deletedAssignments: [],
        deletedDailyAttendance: [],
        dailyAttendance: [],
        subjectMarksConfig: {},
        subjects: [],
        divisions: DEFAULT_COURSE_YEAR_DIVISIONS,
        activeAcademicYear: ""
      };
    }

    const activeYearCode = (await academicYearService.getActiveYearCode()) || "";

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
      const studentDiv = String(req.user.division || "").trim();
      const studentSem = String(req.user.semester || "").trim().toLowerCase();
      const isUniversalDiv = (d) => !d || d === "all" || d === "All Divisions" || d === "Both Divisions" || d.toLowerCase() === "all divisions" || d.toLowerCase() === "both divisions";

      const hasYearQuery = req.query && Object.prototype.hasOwnProperty.call(req.query, "academicYear");
      const requestedYear = hasYearQuery ? stripHtmlTags(String(req.query.academicYear || "")).trim() : "";
      if (hasYearQuery && !requestedYear) {
        return res.status(400).json({ success: false, code: "ACADEMIC_YEAR_REQUIRED", message: "Invalid academicYear query parameter." });
      }
      const targetStudentYear = requestedYear || activeYearCode;
      let historicalAllowed = !requestedYear || requestedYear === activeYearCode;
      if (!historicalAllowed && targetStudentYear) {
        const yrDoc = await academicYearService.getAcademicYearByIdOrCode(targetStudentYear);
        if (yrDoc) {
          const stuRegex = new RegExp(`^${escapeRegex(username)}$`, "i");
          const [mHit, aHit, asgnHit] = await Promise.all([
            Mark.exists({ academicYear: yrDoc.yearCode, studentUsername: stuRegex }).then(Boolean),
            Attendance.exists({ academicYear: yrDoc.yearCode, $or: [{ studentUsername: stuRegex }, { [`records.${username}`]: { $exists: true } }] }).then(Boolean),
            Assignment.exists({ academicYear: yrDoc.yearCode, $or: [{ student: stuRegex }, { "submissions.studentUsername": stuRegex }] }).then(Boolean)
          ]);
          historicalAllowed = mHit || aHit || asgnHit || String(req.user.academicYear || "").trim() === yrDoc.yearCode;
        }
      }

      const scopedNotices = (store.notices || []).filter(n => {
        if (!n || typeof n !== "object") return false;
        const nYear = String(n.academicYear || "").trim();
        if (!targetStudentYear || !nYear || nYear !== targetStudentYear || !historicalAllowed) return false;
        const tRole = String(n.target || n.targetRole || "all").trim().toLowerCase();
        if (tRole !== "all" && tRole !== "student") return false;
        const nDiv = String(n.targetDivision || "all").trim();
        if (!isUniversalDiv(nDiv) && (!studentDiv || nDiv.toLowerCase() !== studentDiv.toLowerCase())) return false;
        const nSem = String(n.targetSemester || "all").trim().toLowerCase();
        if (nSem && nSem !== "all" && nSem !== "all semesters" && (!studentSem || nSem !== studentSem)) return false;
        return true;
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
          divisions: normalizeStoreDivisions(store.divisions),
          activeAcademicYear: activeYearCode
        }
      });
    }

    // Faculty role: scope dailyAttendance to authorized subjects & divisions
    if (req.user.role === "faculty") {
      const targetYear = req.query.academicYear ? stripHtmlTags(String(req.query.academicYear)).trim() : activeYearCode;
      const scope = getFacultyAuthorizedScope(req.user, targetYear);
      const facultyAttendance = (store.dailyAttendance || []).filter(att => {
        if (!att || !att.subject) return false;
        return canFacultySetSubject(req.user, att.subject, att.semester, att.division, targetYear);
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
          divisions: normalizeStoreDivisions(store.divisions),
          activeAcademicYear: activeYearCode
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
          divisions: normalizeStoreDivisions(store.divisions),
          activeAcademicYear: activeYearCode
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

// Re-entrant concurrency serializer for academic collection synchronization
const _syncQueueAls = new AsyncLocalStorage();
let academicSyncQueue = Promise.resolve();

function enqueueAcademicSync(task) {
  if (_syncQueueAls.getStore()?.inSyncQueue) {
    return task();
  }
  const runTask = () => _syncQueueAls.run({ inSyncQueue: true }, task);
  const next = academicSyncQueue.then(runTask, runTask);
  academicSyncQueue = next.catch(() => {});
  return next;
}

async function syncCollectionsFromAcademicData(payload = {}, options = {}) {
  const {
    session = null,
    ordered = false,
    throwOnError = false,
    deletedNoticesScoped = null,
    deletedAttendanceScoped = null,
    deletedAssignmentsScoped = null,
    deletedNotesScoped = null
  } = options || {};

  return enqueueAcademicSync(async () => {
    try {
      const bulkOpts = { ordered, ...(session ? { session } : {}) };
      const writeOpts = session ? { session } : {};

      // 1. Sync Notices into MongoDB 'notices' collection via year-scoped bulkWrite upsert
      if (Array.isArray(payload.notices) && payload.notices.length > 0) {
        const noticeOps = payload.notices
          .filter(n => n && typeof n === "object")
          .map((n, idx) => {
            const noticeId = getDeterministicNoticeId(n, idx);
            const nYear = n.academicYear ? String(n.academicYear).trim() : "";
            const canonicalAuthorUser = stripHtmlTags(n.authorUsername || n.postedBy || "");
            const canonicalDisplayName = stripHtmlTags(n.postedByName || n.authorName || n.author || "");
            const canonicalAuthorRole = stripHtmlTags(n.authorRole || "");
            return {
              updateOne: {
                filter: nYear ? { noticeId, academicYear: nYear } : { noticeId },
                update: {
                  $set: {
                    id: n.id ? String(n.id).trim() : noticeId,
                    noticeId,
                    title: stripHtmlTags(n.title) || "Untitled Notice",
                    text: stripHtmlTags(n.text || n.content || ""),
                    content: stripHtmlTags(n.content || n.text || ""),
                    date: n.date ? stripHtmlTags(String(n.date)).trim() : "",
                    target: n.target || "all",
                    postedBy: canonicalAuthorUser,
                    postedByName: canonicalDisplayName,
                    authorRole: canonicalAuthorRole,
                    authorName: canonicalDisplayName,
                    authorUsername: canonicalAuthorUser,
                    academicYear: nYear,
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
          await Notice.bulkWrite(noticeOps, bulkOpts);
        }
      }

      // Explicit year-scoped notice deletion ONLY (unscoped bare noticeId deletion prohibited)
      if (Array.isArray(deletedNoticesScoped) && deletedNoticesScoped.length > 0) {
        const scopedNoticeConditions = deletedNoticesScoped
          .filter(item => item && typeof item.academicYear === "string" && item.academicYear.trim() && item.noticeId)
          .map(item => ({
            academicYear: String(item.academicYear).trim(),
            $or: [{ noticeId: item.noticeId }, { id: item.noticeId }]
          }));
        if (scopedNoticeConditions.length > 0) {
          await Notice.deleteMany({ $or: scopedNoticeConditions }, writeOpts);
        }
      }

      // 2. Sync Daily Attendance into MongoDB 'attendances' collection via year-scoped bulkWrite upsert
      if (Array.isArray(payload.dailyAttendance) && payload.dailyAttendance.length > 0) {
        const attOps = payload.dailyAttendance
          .filter(a => a && typeof a === "object")
          .map((a, idx) => {
            const attendanceId = getDeterministicAttendanceId(a, idx);
            const attYear = a.academicYear ? String(a.academicYear).trim() : "";
            return {
              updateOne: {
                filter: attYear ? { attendanceId, academicYear: attYear } : { attendanceId },
                update: {
                  $set: {
                    id: a.id ? String(a.id).trim() : attendanceId,
                    attendanceId,
                    subject: a.subject || "",
                    division: a.division || "",
                    semester: a.semester || "",
                    courseYear: a.courseYear || "",
                    academicYear: attYear,
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
          await Attendance.bulkWrite(attOps, bulkOpts);
        }
      }

      // Explicit year-scoped attendance deletion ONLY (unscoped bare ID deletion prohibited)
      if (Array.isArray(deletedAttendanceScoped) && deletedAttendanceScoped.length > 0) {
        const scopedConditions = deletedAttendanceScoped
          .filter(item => item && typeof item.academicYear === "string" && item.academicYear.trim() && item.id)
          .map(item => ({
            academicYear: String(item.academicYear).trim(),
            $or: [{ attendanceId: item.id }, { id: item.id }]
          }));
        if (scopedConditions.length > 0) {
          await Attendance.deleteMany({ $or: scopedConditions }, writeOpts);
        }
      }

      // 3. Sync Student Marks into MongoDB 'marks' collection via safe bulkWrite upsert
      // F-02 & WP-E Remediation: Year-scoped identity (<academicYear>_<username>_<subId>); zero active-year fallback attribution
      if (payload.students && typeof payload.students === "object") {
        const markOps = [];
        for (const [username, record] of Object.entries(payload.students)) {
          if (record && record.marks && typeof record.marks === "object") {
            const studentAcademicYear = (record.academicYear && String(record.academicYear).trim()) || "";
            for (const [subId, m] of Object.entries(record.marks)) {
              if (m && typeof m === "object") {
                const markAcademicYear = (m.academicYear && String(m.academicYear).trim()) || studentAcademicYear;
                if (!markAcademicYear) {
                  console.warn(`[SyncMarks] Skipping mark for ${username}/${subId}: Missing required academicYear context.`);
                  continue;
                }
                const markId = `${markAcademicYear}_${username}_${subId}`;
                const totalVal = typeof m.total === "number" ? m.total : (
                  (typeof m.internal1 === "number" ? m.internal1 : 0) +
                  (typeof m.internal2 === "number" ? m.internal2 : 0) +
                  (typeof m.assignment === "number" ? m.assignment : 0)
                );
                markOps.push({
                  updateOne: {
                    filter: { markId, academicYear: markAcademicYear, studentUsername: username, subject: subId },
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
                        marksObtained: totalVal,
                        academicYear: markAcademicYear
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
          await Mark.bulkWrite(markOps, bulkOpts);
        }
      }

      // 4. Sync Assignments into MongoDB 'assignments' collection via year-scoped bulkWrite upsert
      if (Array.isArray(payload.assignments) && payload.assignments.length > 0) {
        const assignOps = payload.assignments
          .filter(as => as && typeof as === "object")
          .map((as, idx) => {
            const assignmentId = getDeterministicAssignmentId(as, idx);
            const asgnYear = as.academicYear ? String(as.academicYear).trim() : "";
            return {
              updateOne: {
                filter: asgnYear ? { assignmentId, academicYear: asgnYear } : { assignmentId },
                update: {
                  $set: {
                    id: as.id ? String(as.id).trim() : assignmentId,
                    assignmentId,
                    title: stripHtmlTags(as.title) || "Untitled Assignment",
                    description: stripHtmlTags(as.description || ""),
                    subject: as.subject || "",
                    semester: as.semester ? stripHtmlTags(String(as.semester)).trim() : (getSubjectSemester(as.subject) || ""),
                    student: as.student || "",
                    targetDivision: as.targetDivision || "",
                    fileName: stripHtmlTags(as.fileName || ""),
                    fileData: as.fileData || "",
                    due: as.due || "",
                    status: as.status || "Pending",
                    submittedDate: as.submittedDate || "",
                    facultyUsername: as.facultyUsername || "",
                    submissions: Array.isArray(as.submissions) ? as.submissions : [],
                    academicYear: asgnYear
                  }
                },
                upsert: true
              }
            };
          });
        if (assignOps.length > 0) {
          await Assignment.bulkWrite(assignOps, bulkOpts);
        }
      }

      // Explicit year-scoped assignment deletions ONLY (unscoped bare assignmentId/title deletion prohibited)
      if (Array.isArray(deletedAssignmentsScoped) && deletedAssignmentsScoped.length > 0) {
        const validDelAsgn = deletedAssignmentsScoped.filter(
          item => item && typeof item.academicYear === "string" && item.academicYear.trim() && item.assignmentId
        );
        if (validDelAsgn.length > 0) {
          await Assignment.deleteMany({ $or: validDelAsgn }, writeOpts);
        }
      }

      // 5. Sync Study Notes into MongoDB 'notes' collection via year-scoped bulkWrite upsert
      if (Array.isArray(payload.notes) && payload.notes.length > 0) {
        const noteOps = payload.notes
          .filter(n => n && typeof n === "object")
          .map((n, idx) => {
            const noteId = getDeterministicNoteId(n, idx);
            const noteYear = n.academicYear ? String(n.academicYear).trim() : "";
            return {
              updateOne: {
                filter: noteYear ? { noteId, academicYear: noteYear } : { noteId },
                update: {
                  $set: {
                    id: n.id ? String(n.id).trim() : noteId,
                    noteId,
                    subject: n.subject || "",
                    title: stripHtmlTags(n.title) || "Untitled Note",
                    division: stripHtmlTags(n.division || "All Divisions"),
                    fileName: stripHtmlTags(n.fileName || ""),
                    fileData: n.fileData || "",
                    uploadedBy: n.uploadedBy || "",
                    uploadedByName: stripHtmlTags(n.uploadedByName || "Faculty"),
                    date: n.date ? stripHtmlTags(String(n.date)).trim() : "",
                    academicYear: noteYear
                  }
                },
                upsert: true
              }
            };
          });
        if (noteOps.length > 0) {
          await Note.bulkWrite(noteOps, bulkOpts);
        }
      }

      // Explicit year-scoped study notes deletion ONLY (unscoped bare noteId deletion prohibited)
      if (Array.isArray(deletedNotesScoped) && deletedNotesScoped.length > 0) {
        const validDelNotes = deletedNotesScoped.filter(
          item => item && typeof item.academicYear === "string" && item.academicYear.trim() && item.$or
        );
        if (validDelNotes.length > 0) {
          await Note.deleteMany({ $or: validDelNotes }, writeOpts);
        }
      }
    } catch (syncErr) {
      console.warn("Collection sync helper warning:", syncErr.message);
      if (throwOnError) {
        throw syncErr;
      }
    }
  });
}

function makeSyncRejection(status, code, message) {
  return { earlyResponse: { status, body: { success: false, code, message } } };
}

/**
 * Validate EVERY entity and mutation in POST /api/academic/sync inside the active session (when present)
 * BEFORE staging attachments, modifying AcademicStore, running collection bulkWrites, or performing deletes.
 */
async function prepareAndValidateAcademicSync(req, payload, existingStore, session = null) {
  const hasPayloadYear = Boolean(payload && Object.prototype.hasOwnProperty.call(payload, "academicYear"));
  let explicitPayloadYear = "";
  if (hasPayloadYear) {
    if (typeof payload.academicYear !== "string" || !payload.academicYear.trim()) {
      return makeSyncRejection(
        400,
        "ACADEMIC_YEAR_REQUIRED",
        "Academic sync rejected: 'academicYear' must be a valid non-empty string."
      );
    }
    explicitPayloadYear = stripHtmlTags(payload.academicYear).trim();
  }

  const touchedActiveYears = new Set();
  const validatedYearCache = new Map();

  async function requireOperationalYear(rawYear, actionLabel) {
    if (typeof rawYear !== "string" || !rawYear.trim()) {
      return {
        ok: false,
        rejection: makeSyncRejection(
          400,
          "ACADEMIC_YEAR_REQUIRED",
          `${actionLabel} rejected: Valid active academicYear is required.`
        )
      };
    }
    const clean = stripHtmlTags(rawYear).trim();
    if (validatedYearCache.has(clean)) {
      return validatedYearCache.get(clean);
    }
    // Always bind read to active transaction session so Snapshot Isolation sees consistent year state
    const resCheck = await validateAcademicYearOperationalForWrite(clean, { session, actionLabel });
    if (!resCheck.valid) {
      return {
        ok: false,
        rejection: makeSyncRejection(resCheck.status, resCheck.code, resCheck.message)
      };
    }
    touchedActiveYears.add(resCheck.academicYear);
    const cached = { ok: true, academicYear: resCheck.academicYear };
    validatedYearCache.set(clean, cached);
    validatedYearCache.set(resCheck.academicYear, cached);
    return cached;
  }

  if (hasPayloadYear) {
    const topCheck = await requireOperationalYear(explicitPayloadYear, "Academic sync");
    if (!topCheck.ok) return topCheck.rejection;
    explicitPayloadYear = topCheck.academicYear;
  }

  const defaultAcademicYear = explicitPayloadYear || (await resolveActiveYearCodeWithSession(session));
  const update = {};
  const pendingAttachmentWrites = [];

  // 0. Timetable items (if sent inside sync payload, validate operational year & reject legacy bypass)
  if (Array.isArray(payload.timetable) && payload.timetable.length > 0) {
    for (const tItem of payload.timetable) {
      if (!tItem || typeof tItem !== "object") {
        return makeSyncRejection(400, "INVALID_TIMETABLE_ENTRY", "Invalid timetable entry inside academic sync.");
      }
      const rawTYear = Object.prototype.hasOwnProperty.call(tItem, "academicYear")
        ? tItem.academicYear
        : defaultAcademicYear;
      const tYearCheck = await requireOperationalYear(rawTYear, "Academic timetable sync");
      if (!tYearCheck.ok) return tYearCheck.rejection;
      if (req.user.role === "faculty") {
        if (!isFacultyAuthorizedForTimetable(req.user, tItem.semester, tItem.division, tYearCheck.academicYear) ||
            !canFacultySetSubject(req.user, tItem.subject || tItem.subjectText, tItem.semester, tItem.division, tYearCheck.academicYear)) {
          return makeSyncRejection(403, "FACULTY_UNAUTHORIZED", "Access forbidden: Not authorized to sync timetable entry.");
        }
      }
    }
  }

  // 1. Per-student & CIE Marks validation (all subjects/years fail-closed for BOTH faculty & admin)
  let stagedStudents = null;
  if (payload.students && typeof payload.students === "object") {
    const mergedStudents = { ...(existingStore?.students || {}) };
    for (const [studentKey, studentData] of Object.entries(payload.students)) {
      if (!studentData || typeof studentData !== "object") {
        return makeSyncRejection(400, "INVALID_STUDENT_RECORD", `Invalid student entry '${studentKey}' in sync payload.`);
      }
      if (hasMongoOperators(studentData)) {
        return makeSyncRejection(400, "INVALID_PAYLOAD", "MongoDB operators are not permitted in student records.");
      }
      const existingStudent = mergedStudents[studentKey] || { marks: {}, attendance: {} };
      const updatedStudent = {
        ...existingStudent,
        marks: existingStudent.marks && typeof existingStudent.marks === "object" ? { ...existingStudent.marks } : {},
        attendance: existingStudent.attendance && typeof existingStudent.attendance === "object" ? { ...existingStudent.attendance } : {}
      };

      if (Object.prototype.hasOwnProperty.call(studentData, "academicYear")) {
        if (typeof studentData.academicYear !== "string" || !studentData.academicYear.trim()) {
          return makeSyncRejection(400, "ACADEMIC_YEAR_REQUIRED", `Student '${studentKey}' has empty or invalid academicYear.`);
        }
      }
      const studentYear = studentData.academicYear
        ? stripHtmlTags(String(studentData.academicYear)).trim()
        : defaultAcademicYear;

      if (req.user.role === "admin") {
        for (const [prop, val] of Object.entries(studentData)) {
          if (prop !== "marks") {
            updatedStudent[prop] = prop === "attendance" && val && typeof val === "object" ? { ...val } : val;
          }
        }
      } else {
        if (!updatedStudent.name && studentData.name) updatedStudent.name = stripHtmlTags(String(studentData.name));
        if (!updatedStudent.division && studentData.division) updatedStudent.division = stripHtmlTags(String(studentData.division));
      }

      if (studentData.marks && typeof studentData.marks === "object") {
        updatedStudent.marks = { ...(existingStudent.marks || {}) };
        const stagedMarks = {};
        for (const [subId, markVal] of Object.entries(studentData.marks)) {
          if (!markVal || typeof markVal !== "object") continue;

          if (Object.prototype.hasOwnProperty.call(markVal, "academicYear")) {
            if (typeof markVal.academicYear !== "string" || !markVal.academicYear.trim()) {
              return makeSyncRejection(400, "ACADEMIC_YEAR_REQUIRED", `Mark entry '${studentKey}/${subId}' has empty or invalid academicYear.`);
            }
          }
          const rawMarkYear = markVal.academicYear
            ? stripHtmlTags(String(markVal.academicYear)).trim()
            : studentYear;

          const markYearCheck = await requireOperationalYear(rawMarkYear, "Academic marks sync");
          if (!markYearCheck.ok) return markYearCheck.rejection;

          const numericFields = ["internal1", "internal2", "assignment", "final"];
          for (const nf of numericFields) {
            if (typeof markVal[nf] === "number" && (Number.isNaN(markVal[nf]) || markVal[nf] < 0)) {
              return makeSyncRejection(400, "INVALID_MARKS", `Invalid negative or NaN score for '${subId}' (${nf}).`);
            }
          }
          if (typeof markVal.internal1 === "number" && typeof markVal.maxInternal1 === "number" && markVal.internal1 > markVal.maxInternal1) {
            return makeSyncRejection(400, "INVALID_MARKS", `Marks for '${subId}' internal1 exceed configured maximum.`);
          }
          if (typeof markVal.internal2 === "number" && typeof markVal.maxInternal2 === "number" && markVal.internal2 > markVal.maxInternal2) {
            return makeSyncRejection(400, "INVALID_MARKS", `Marks for '${subId}' internal2 exceed configured maximum.`);
          }
          if (typeof markVal.assignment === "number" && typeof markVal.maxAssignment === "number" && markVal.assignment > markVal.maxAssignment) {
            return makeSyncRejection(400, "INVALID_MARKS", `Marks for '${subId}' assignment exceed configured maximum.`);
          }

          if (req.user.role === "faculty") {
            const subAuth = validateFacultyAttendanceAuthorization(
              req.user,
              subId,
              studentData.division || updatedStudent.division,
              studentData.semester || updatedStudent.semester,
              markYearCheck.academicYear
            );
            if (!subAuth.authorized) {
              return makeSyncRejection(
                403,
                subAuth.code || "FACULTY_UNAUTHORIZED",
                `Unauthorized: Faculty cannot modify marks for unassigned subject '${subId}'. ${subAuth.reason}`
              );
            }
          }

          updatedStudent.marks[subId] = {
            ...markVal,
            academicYear: markYearCheck.academicYear
          };
          stagedMarks[subId] = updatedStudent.marks[subId];
        }
        if (Object.keys(stagedMarks).length > 0) {
          if (!stagedStudents) stagedStudents = {};
          stagedStudents[studentKey] = {
            ...updatedStudent,
            marks: stagedMarks
          };
        }
      }
      mergedStudents[studentKey] = updatedStudent;
    }
    update.students = mergedStudents;
  }

  // 2. Notices & Notice Deletions: year-scoped immutability, canonical authorship & DB+Store sync
  let stagedNotices = null;
  let deletedNoticesScoped = null;
  if (Array.isArray(payload.notices) || Array.isArray(payload.deletedNotices)) {
    const incomingNotices = Array.isArray(payload.notices) ? payload.notices : [];
    const rawDelNotices = Array.isArray(payload.deletedNotices) ? payload.deletedNotices : [];
    const delNoticeIds = [];
    for (const rawId of rawDelNotices) {
      if (typeof rawId !== "string" || !rawId.trim()) {
        return makeSyncRejection(400, "INVALID_NOTICE_ID", "Notice deletion list contains an empty or invalid notice ID.");
      }
      delNoticeIds.push(stripHtmlTags(rawId).trim());
    }

    const referencedNoticeIds = new Set(delNoticeIds);
    incomingNotices.forEach((n, idx) => {
      if (n && typeof n === "object") {
        if (n.id) referencedNoticeIds.add(String(n.id).trim());
        if (n.noticeId) referencedNoticeIds.add(String(n.noticeId).trim());
        referencedNoticeIds.add(getDeterministicNoticeId(n, idx));
      }
    });

    const refNoticeArr = Array.from(referencedNoticeIds).filter(Boolean);
    const dbNotices = refNoticeArr.length > 0
      ? await Notice.find({
          $or: [{ noticeId: { $in: refNoticeArr } }, { id: { $in: refNoticeArr } }]
        }).setOptions(session ? { session } : {}).lean()
      : [];

    const noticeMap = new Map();
    const storeNoticeById = new Map();
    (existingStore?.notices || []).forEach((n, idx) => {
      if (!n || typeof n !== "object") return;
      const nYear = n.academicYear && typeof n.academicYear === "string" ? n.academicYear.trim() : "";
      const primaryKey = String(n.id || n.noticeId || n.title || `__idx_${idx}`).trim();
      noticeMap.set(`${nYear || "__unversioned__"}::${primaryKey}`, n);
      for (const k of [n.id, n.noticeId]) {
        if (!k) continue;
        const cleanK = String(k).trim();
        if (!storeNoticeById.has(cleanK)) storeNoticeById.set(cleanK, []);
        storeNoticeById.get(cleanK).push({ entry: n, mapKey: `${nYear || "__unversioned__"}::${primaryKey}` });
      }
    });

    const dbNoticeById = new Map();
    for (const doc of dbNotices) {
      for (const k of [doc.noticeId, doc.id]) {
        if (!k) continue;
        const cleanK = String(k).trim();
        if (!dbNoticeById.has(cleanK)) dbNoticeById.set(cleanK, []);
        if (!dbNoticeById.get(cleanK).includes(doc)) dbNoticeById.get(cleanK).push(doc);
      }
    }

    stagedNotices = [];
    for (let idx = 0; idx < incomingNotices.length; idx++) {
      const rawNotice = incomingNotices[idx];
      if (!rawNotice || typeof rawNotice !== "object") continue;
      if (hasMongoOperators(rawNotice)) {
        return makeSyncRejection(400, "INVALID_PAYLOAD", "MongoDB operators are not permitted in notices.");
      }

      if (Object.prototype.hasOwnProperty.call(rawNotice, "academicYear")) {
        if (typeof rawNotice.academicYear !== "string" || !rawNotice.academicYear.trim()) {
          return makeSyncRejection(400, "ACADEMIC_YEAR_REQUIRED", "Notice entry contains empty or invalid academicYear.");
        }
      }

      const candidateIds = Array.from(new Set([
        rawNotice.id ? String(rawNotice.id).trim() : "",
        rawNotice.noticeId ? String(rawNotice.noticeId).trim() : "",
        getDeterministicNoticeId(rawNotice, idx)
      ].filter(Boolean)));

      const existingMatches = [];
      for (const cid of candidateIds) {
        (storeNoticeById.get(cid) || []).forEach(hit => existingMatches.push(hit.entry));
        (dbNoticeById.get(cid) || []).forEach(doc => existingMatches.push(doc));
      }

      let effectiveNoticeYear = "";
      if (existingMatches.length > 0) {
        const hasUnversioned = existingMatches.some(ex => !ex.academicYear || typeof ex.academicYear !== "string" || !ex.academicYear.trim());
        if (hasUnversioned) {
          return makeSyncRejection(
            409,
            "IMMUTABLE_RECORD",
            "Academic notice sync rejected: Unversioned historical notices are immutable and cannot be modified or backfilled."
          );
        }
        const exYears = new Set(existingMatches.map(ex => String(ex.academicYear).trim()));
        if (exYears.size > 1) {
          return makeSyncRejection(
            409,
            "AMBIGUOUS_NOTICE_RECORD",
            "Academic notice sync rejected: Notice ID spans multiple academic years."
          );
        }
        const storedNoticeYear = Array.from(exYears)[0];
        const explicitNoticeYear = rawNotice.academicYear
          ? stripHtmlTags(String(rawNotice.academicYear)).trim()
          : explicitPayloadYear;
        if (explicitNoticeYear && explicitNoticeYear !== storedNoticeYear) {
          return makeSyncRejection(
            409,
            "IMMUTABLE_RECORD",
            `Academic notice sync rejected: Existing notice belongs to '${storedNoticeYear}' and cannot be reassigned to '${explicitNoticeYear}'.`
          );
        }
        const yrCheck = await requireOperationalYear(storedNoticeYear, "Academic notice sync");
        if (!yrCheck.ok) return yrCheck.rejection;
        effectiveNoticeYear = yrCheck.academicYear;

        if (req.user.role === "faculty") {
          for (const ex of existingMatches) {
            const owner = String(ex.authorUsername || ex.postedBy || "").trim().toLowerCase();
            if (ex.authorRole === "admin" || !owner || owner !== req.user.username.toLowerCase()) {
              return makeSyncRejection(403, "FACULTY_UNAUTHORIZED", "Forbidden: Faculty cannot overwrite notices authored by other faculty, administrators, or lacking canonical authorship.");
            }
          }
        }
      } else {
        const rawNoticeYear = rawNotice.academicYear
          ? stripHtmlTags(String(rawNotice.academicYear)).trim()
          : defaultAcademicYear;
        const nYearCheck = await requireOperationalYear(rawNoticeYear, "Academic notice sync");
        if (!nYearCheck.ok) return nYearCheck.rejection;
        effectiveNoticeYear = nYearCheck.academicYear;
      }

      const resolvedNoticeId = getDeterministicNoticeId(rawNotice, idx);
      const effectiveAuthorRole = req.user.role === "admin" ? (rawNotice.authorRole || "admin") : "faculty";
      const canonicalAuthorUser = req.user.role === "faculty"
        ? req.user.username
        : (stripHtmlTags(rawNotice.authorUsername || rawNotice.postedBy || req.user.username).trim() || req.user.username);
      const canonicalDisplayName = req.user.role === "faculty"
        ? req.user.name
        : (stripHtmlTags(rawNotice.postedByName || rawNotice.authorName || rawNotice.author || req.user.name).trim() || req.user.name);

      const cleanNotice = {
        ...rawNotice,
        id: rawNotice.id ? stripHtmlTags(String(rawNotice.id)).trim() : resolvedNoticeId,
        noticeId: rawNotice.noticeId ? stripHtmlTags(String(rawNotice.noticeId)).trim() : resolvedNoticeId,
        title: stripHtmlTags(rawNotice.title),
        text: stripHtmlTags(rawNotice.text),
        content: stripHtmlTags(rawNotice.content || rawNotice.text),
        author: canonicalDisplayName,
        authorName: canonicalDisplayName,
        postedByName: canonicalDisplayName,
        postedBy: canonicalAuthorUser,
        authorUsername: canonicalAuthorUser,
        authorRole: effectiveAuthorRole,
        academicYear: effectiveNoticeYear
      };
      stagedNotices.push(cleanNotice);
      const mapKey = String(cleanNotice.id || cleanNotice.noticeId || cleanNotice.title).trim();
      noticeMap.set(`${effectiveNoticeYear}::${mapKey}`, cleanNotice);
    }

    if (delNoticeIds.length > 0) {
      deletedNoticesScoped = [];
      for (const delKey of delNoticeIds) {
        const storeHits = storeNoticeById.get(delKey) || [];
        const dbHits = dbNoticeById.get(delKey) || [];
        const allMatched = [...storeHits.map(h => h.entry), ...dbHits];

        if (allMatched.length === 0) {
          return makeSyncRejection(404, "NOTICE_NOT_FOUND", `Academic notice deletion rejected: Notice '${delKey}' was not found.`);
        }

        const hasUnversioned = allMatched.some(m => !m.academicYear || typeof m.academicYear !== "string" || !m.academicYear.trim());
        if (hasUnversioned) {
          return makeSyncRejection(
            409,
            "IMMUTABLE_RECORD",
            `Academic notice deletion rejected: Unversioned historical notice '${delKey}' is immutable.`
          );
        }

        const delYears = new Set(allMatched.map(m => String(m.academicYear).trim()));
        if (delYears.size > 1) {
          return makeSyncRejection(
            409,
            "AMBIGUOUS_NOTICE_RECORD",
            `Academic notice deletion rejected: Notice '${delKey}' spans multiple academic years.`
          );
        }

        const delYear = Array.from(delYears)[0];
        if (explicitPayloadYear && explicitPayloadYear !== delYear) {
          return makeSyncRejection(
            409,
            "IMMUTABLE_RECORD",
            `Academic notice deletion rejected: Notice '${delKey}' belongs to '${delYear}', not '${explicitPayloadYear}'.`
          );
        }

        const delYearCheck = await requireOperationalYear(delYear, "Academic notice deletion");
        if (!delYearCheck.ok) return delYearCheck.rejection;

        if (req.user.role === "faculty") {
          for (const m of allMatched) {
            const owner = String(m.authorUsername || m.postedBy || "").trim().toLowerCase();
            if (m.authorRole === "admin" || !owner || owner !== req.user.username.toLowerCase()) {
              return makeSyncRejection(403, "FACULTY_UNAUTHORIZED", "Forbidden: Faculty cannot delete notices authored by other faculty, administrators, or lacking canonical authorship.");
            }
          }
        }

        storeHits.forEach(hit => noticeMap.delete(hit.mapKey));
        noticeMap.delete(`${delYearCheck.academicYear}::${delKey}`);
        deletedNoticesScoped.push({
          noticeId: dbHits[0]?.noticeId || storeHits[0]?.entry?.noticeId || delKey,
          academicYear: delYearCheck.academicYear
        });
      }
    }

    if (Array.isArray(payload.notices) || Array.isArray(payload.deletedNotices)) {
      update.notices = Array.from(noticeMap.values());
    }
  }

  // 3. Daily Attendance & Deletions: fail-closed year validation, cross-collection deletion lookup, & ID reuse guard
  let stagedDailyAttendance = null;
  let deletedAttendanceScoped = null;
  if (Array.isArray(payload.dailyAttendance) || Array.isArray(payload.deletedDailyAttendance) || Array.isArray(payload.deletedAttendance)) {
    const rawDelDaily = [
      ...(Array.isArray(payload.deletedDailyAttendance) ? payload.deletedDailyAttendance : []),
      ...(Array.isArray(payload.deletedAttendance) ? payload.deletedAttendance : [])
    ];
    const cleanDelIds = [];
    for (const dId of rawDelDaily) {
      if (typeof dId !== "string" || !dId.trim()) {
        return makeSyncRejection(400, "INVALID_ATTENDANCE_ID", "Deletion list contains an empty or invalid attendance ID.");
      }
      cleanDelIds.push(stripHtmlTags(dId).trim());
    }

    const referencedIds = new Set(cleanDelIds);
    const incomingAtt = Array.isArray(payload.dailyAttendance) ? payload.dailyAttendance : [];
    incomingAtt.forEach((a, idx) => {
      if (a && typeof a === "object") {
        const cid = a.attendanceId || a.id ? String(a.attendanceId || a.id).trim() : getDeterministicAttendanceId(a, idx);
        if (cid) referencedIds.add(cid);
      }
    });

    const refIdArray = Array.from(referencedIds);
    const dbAttMatches = refIdArray.length > 0
      ? await Attendance.find({
          $or: [{ attendanceId: { $in: refIdArray } }, { id: { $in: refIdArray } }]
        }).setOptions(session ? { session } : {}).lean()
      : [];

    const storeByBareId = new Map();
    const attMap = new Map();
    (existingStore?.dailyAttendance || []).forEach((entry, idx) => {
      if (!entry || typeof entry !== "object") return;
      const entryYear = entry.academicYear && typeof entry.academicYear === "string" ? entry.academicYear.trim() : "";
      const rawId = entry.id || entry.attendanceId ? String(entry.id || entry.attendanceId).trim() : "";
      const mapKey = `${entryYear || "__unversioned__"}::${rawId || `__anon_${idx}`}`;
      attMap.set(mapKey, entry);
      if (rawId) {
        if (!storeByBareId.has(rawId)) storeByBareId.set(rawId, []);
        storeByBareId.get(rawId).push(entry);
      }
    });

    const dbByBareId = new Map();
    for (const doc of dbAttMatches) {
      for (const k of [doc.attendanceId, doc.id]) {
        if (!k) continue;
        const cleanK = String(k).trim();
        if (!dbByBareId.has(cleanK)) dbByBareId.set(cleanK, []);
        if (!dbByBareId.get(cleanK).includes(doc)) dbByBareId.get(cleanK).push(doc);
      }
    }

    stagedDailyAttendance = [];
    for (let idx = 0; idx < incomingAtt.length; idx++) {
      const raw = incomingAtt[idx];
      if (!raw || typeof raw !== "object") {
        return makeSyncRejection(400, "INVALID_ATTENDANCE_ENTRY", "Invalid attendance entry: Expected an object.");
      }
      if (hasMongoOperators(raw)) {
        return makeSyncRejection(400, "INVALID_PAYLOAD", "MongoDB operators are not permitted in attendance payloads.");
      }
      if (!raw.subject || typeof raw.subject !== "string" || !raw.subject.trim()) {
        return makeSyncRejection(400, "INVALID_ATTENDANCE_ENTRY", "Attendance entry requires a valid subject.");
      }

      const entryCopy = { ...raw };
      if (entryCopy.date || entryCopy.isoDate) {
        const dateCheck = validateAttendanceDate(entryCopy.date, entryCopy.isoDate);
        if (!dateCheck.valid) {
          return makeSyncRejection(400, "INVALID_ATTENDANCE_DATE", dateCheck.error);
        }
        entryCopy.isoDate = dateCheck.isoDate;
        entryCopy.date = dateCheck.date;
      }
      if (entryCopy.records && typeof entryCopy.records === "object") {
        const recCheck = validateAttendanceRecords(entryCopy.records);
        if (!recCheck.valid) {
          return makeSyncRejection(400, "INVALID_ATTENDANCE_RECORDS", recCheck.error);
        }
        entryCopy.records = recCheck.records;
      }
      if (entryCopy.status !== undefined && entryCopy.status !== "") {
        const stNorm = normalizeAttendanceStatus(entryCopy.status);
        if (!stNorm) {
          return makeSyncRejection(400, "INVALID_ATTENDANCE_STATUS", `Invalid attendance status '${entryCopy.status}'. Allowed values: P, A, Present, Absent.`);
        }
        entryCopy.status = stNorm === "P" ? "Present" : "Absent";
      }

      if (Object.prototype.hasOwnProperty.call(entryCopy, "academicYear")) {
        if (typeof entryCopy.academicYear !== "string" || !entryCopy.academicYear.trim()) {
          return makeSyncRejection(400, "ACADEMIC_YEAR_REQUIRED", "Attendance entry contains empty or invalid academicYear.");
        }
      }
      const rawAttYear = entryCopy.academicYear
        ? stripHtmlTags(String(entryCopy.academicYear)).trim()
        : defaultAcademicYear;

      const attYearCheck = await requireOperationalYear(rawAttYear, "Academic attendance sync");
      if (!attYearCheck.ok) return attYearCheck.rejection;
      entryCopy.academicYear = attYearCheck.academicYear;

      const rawId = entryCopy.attendanceId || entryCopy.id
        ? stripHtmlTags(String(entryCopy.attendanceId || entryCopy.id)).trim()
        : "";
      const resolvedId = rawId || getDeterministicAttendanceId(entryCopy, idx);
      entryCopy.id = entryCopy.id ? stripHtmlTags(String(entryCopy.id)).trim() : resolvedId;
      entryCopy.attendanceId = entryCopy.attendanceId ? stripHtmlTags(String(entryCopy.attendanceId)).trim() : resolvedId;

      // Prevent historical ID reuse or cross-year ID reassignment across Store AND Attendance collection
      const existingMatches = [
        ...(storeByBareId.get(resolvedId) || []),
        ...(dbByBareId.get(resolvedId) || [])
      ];
      for (const ex of existingMatches) {
        const exYear = ex.academicYear && typeof ex.academicYear === "string" ? ex.academicYear.trim() : "";
        if (!exYear) {
          return makeSyncRejection(
            409,
            "IMMUTABLE_RECORD",
            `Academic sync rejected: Attendance ID '${resolvedId}' references an unversioned historical record.`
          );
        }
        if (exYear !== entryCopy.academicYear) {
          return makeSyncRejection(
            409,
            "IMMUTABLE_RECORD",
            `Academic sync rejected: Attendance ID '${resolvedId}' belongs to academic year '${exYear}' and cannot be reassigned to '${entryCopy.academicYear}'.`
          );
        }
      }

      if (req.user.role === "faculty") {
        for (const ex of existingMatches) {
          const exAuth = validateFacultyAttendanceAuthorization(req.user, ex.subject, ex.division, ex.semester, entryCopy.academicYear);
          if (!exAuth.authorized) {
            return makeSyncRejection(403, exAuth.code || "FACULTY_UNAUTHORIZED", exAuth.reason);
          }
        }
        const authCheck = validateFacultyAttendanceAuthorization(req.user, entryCopy.subject, entryCopy.division, entryCopy.semester, entryCopy.academicYear);
        if (!authCheck.authorized) {
          return makeSyncRejection(403, authCheck.code || "FACULTY_UNAUTHORIZED", authCheck.reason);
        }
      }

      attMap.set(`${entryCopy.academicYear}::${resolvedId}`, entryCopy);
      stagedDailyAttendance.push(entryCopy);
    }

    // Resolve and authorize every attendance deletion target across Store AND Attendance collection
    for (const delId of cleanDelIds) {
      const storeMatches = storeByBareId.get(delId) || [];
      const dbMatches = dbByBareId.get(delId) || [];
      const allDelMatches = [...storeMatches, ...dbMatches];

      if (allDelMatches.length > 0) {
        const hasUnversioned = allDelMatches.some(d => !d.academicYear || typeof d.academicYear !== "string" || !d.academicYear.trim());
        if (hasUnversioned) {
          return makeSyncRejection(
            409,
            "IMMUTABLE_RECORD",
            `Academic sync deletion rejected: Attendance ID '${delId}' refers to an unversioned historical record.`
          );
        }
        const delYears = new Set(allDelMatches.map(d => String(d.academicYear).trim()));
        if (delYears.size > 1) {
          return makeSyncRejection(
            409,
            "AMBIGUOUS_ATTENDANCE_RECORD",
            `Academic sync deletion rejected: Attendance ID '${delId}' spans multiple academic years.`
          );
        }
        const delYear = Array.from(delYears)[0];
        if (explicitPayloadYear && explicitPayloadYear !== delYear) {
          return makeSyncRejection(
            409,
            "IMMUTABLE_RECORD",
            `Academic sync deletion rejected: Attendance ID '${delId}' belongs to '${delYear}', not '${explicitPayloadYear}'.`
          );
        }

        const delYearCheck = await requireOperationalYear(delYear, "Academic attendance sync deletion");
        if (!delYearCheck.ok) return delYearCheck.rejection;

        if (req.user.role === "faculty") {
          for (const m of allDelMatches) {
            const authCheck = validateFacultyAttendanceAuthorization(req.user, m.subject, m.division, m.semester, delYearCheck.academicYear);
            if (!authCheck.authorized) {
              return makeSyncRejection(403, authCheck.code || "FACULTY_UNAUTHORIZED", authCheck.reason);
            }
          }
        }

        if (!deletedAttendanceScoped) deletedAttendanceScoped = [];
        deletedAttendanceScoped.push({ id: delId, academicYear: delYearCheck.academicYear });
        attMap.delete(`${delYearCheck.academicYear}::${delId}`);
      } else {
        // Even if the target ID does not exist in Store or Attendance, fail closed when no active year context exists
        const fallbackYearCheck = await requireOperationalYear(defaultAcademicYear, "Academic attendance sync deletion");
        if (!fallbackYearCheck.ok) return fallbackYearCheck.rejection;
      }
    }

    update.dailyAttendance = Array.from(attMap.values());
  }

  // 4. Assignments & Assignment Deletions: fail-closed year/auth/ID-reuse & tombstone hygiene
  let stagedAssignments = null;
  let deletedAssignmentsScoped = null;
  if (Array.isArray(payload.assignments) || Array.isArray(payload.deletedAssignments)) {
    const incomingAssignments = Array.isArray(payload.assignments) ? payload.assignments : [];
    const rawDelAsgnKeys = Array.isArray(payload.deletedAssignments) ? payload.deletedAssignments : [];
    const delAsgnKeys = [];
    for (const rawKey of rawDelAsgnKeys) {
      if (typeof rawKey !== "string" || !rawKey.trim()) {
        return makeSyncRejection(400, "INVALID_ASSIGNMENT_ID", "Assignment deletion list contains an empty or invalid key.");
      }
      delAsgnKeys.push(stripHtmlTags(rawKey).trim());
    }

    const asgnIds = incomingAssignments
      .filter(a => a && typeof a === "object" && (a.assignmentId || a.id))
      .map((a, idx) => getDeterministicAssignmentId(a, idx));

    const delConditions = [];
    for (const k of delAsgnKeys) {
      if (k.includes("___")) {
        const [stu, titleOrId] = k.split("___");
        delConditions.push({ assignmentId: `${titleOrId}_${stu}` });
        delConditions.push({ student: new RegExp(`^${escapeRegex(stu)}$`, "i"), title: new RegExp(`^${escapeRegex(titleOrId)}$`, "i") });
      } else {
        delConditions.push({ assignmentId: k });
        delConditions.push({ id: k });
      }
    }

    const dbAsgnQuery = [];
    if (asgnIds.length > 0) dbAsgnQuery.push({ assignmentId: { $in: asgnIds } });
    if (delConditions.length > 0) dbAsgnQuery.push(...delConditions);
    const dbAssignments = dbAsgnQuery.length > 0
      ? await Assignment.find({ $or: dbAsgnQuery }).setOptions(session ? { session } : {}).lean()
      : [];

    const dbAsgnById = new Map();
    for (const doc of dbAssignments) {
      for (const dk of [doc.assignmentId, doc.id]) {
        if (dk && !dbAsgnById.has(String(dk))) dbAsgnById.set(String(dk), doc);
      }
    }

    const asgnMap = new Map();
    const storeAsgnByComposite = new Map();
    (existingStore?.assignments || []).forEach((a, idx) => {
      if (!a || typeof a !== "object") return;
      const aYear = a.academicYear && typeof a.academicYear === "string" ? a.academicYear.trim() : "";
      const keyBase = a.id || a.assignmentId || `__anon_${idx}`;
      asgnMap.set(`${aYear || "__unversioned__"}::${keyBase}_${a.student || ""}`, a);
      if (a.id) storeAsgnByComposite.set(`${a.id}_${a.student || ""}`, a);
      if (a.assignmentId) storeAsgnByComposite.set(String(a.assignmentId), a);
    });

    stagedAssignments = [];
    for (let idx = 0; idx < incomingAssignments.length; idx++) {
      const raw = incomingAssignments[idx];
      if (!raw || typeof raw !== "object") continue;
      if (hasMongoOperators(raw)) {
        return makeSyncRejection(400, "INVALID_PAYLOAD", "MongoDB operators are not permitted in assignments.");
      }
      if (Object.prototype.hasOwnProperty.call(raw, "academicYear")) {
        if (typeof raw.academicYear !== "string" || !raw.academicYear.trim()) {
          return makeSyncRejection(400, "ACADEMIC_YEAR_REQUIRED", "Assignment entry contains empty or invalid academicYear.");
        }
      }
      const rawAsgnYear = raw.academicYear
        ? stripHtmlTags(String(raw.academicYear)).trim()
        : defaultAcademicYear;
      const asgnYearCheck = await requireOperationalYear(rawAsgnYear, "Academic assignment sync");
      if (!asgnYearCheck.ok) return asgnYearCheck.rejection;

      const resolvedAsgnId = getDeterministicAssignmentId(raw, idx);
      const compositeKey = `${raw.id || ""}_${raw.student || ""}`;
      const existingMatches = [
        storeAsgnByComposite.get(compositeKey),
        raw.assignmentId ? storeAsgnByComposite.get(String(raw.assignmentId)) : null,
        dbAsgnById.get(resolvedAsgnId)
      ].filter(Boolean);

      for (const ex of existingMatches) {
        const exYear = ex.academicYear && typeof ex.academicYear === "string" ? ex.academicYear.trim() : "";
        if (!exYear || exYear !== asgnYearCheck.academicYear) {
          return makeSyncRejection(
            409,
            "IMMUTABLE_RECORD",
            `Academic sync rejected: Assignment '${resolvedAsgnId}' cannot overwrite record from ${exYear || "unversioned historical storage"}.`
          );
        }
      }

      if (req.user.role === "faculty") {
        const authCheck = validateFacultyAttendanceAuthorization(req.user, raw.subject, raw.division, raw.semester, asgnYearCheck.academicYear);
        if (!authCheck.authorized) {
          return makeSyncRejection(
            403,
            authCheck.code || "FACULTY_UNAUTHORIZED",
            `Unauthorized: Faculty cannot create/modify assignments for unassigned subject '${raw.subject}'. ${authCheck.reason}`
          );
        }
        // Fail closed on missing authorship fields for faculty overwrites
        for (const existingAsgn of existingMatches) {
          const owner = String(existingAsgn.facultyUsername || existingAsgn.authorUsername || existingAsgn.createdBy || "").trim().toLowerCase();
          if (!owner || owner !== req.user.username.toLowerCase()) {
            return makeSyncRejection(403, "FACULTY_UNAUTHORIZED", "Forbidden: Faculty cannot overwrite assignments created by other faculty or lacking authorship metadata.");
          }
        }
      }

      const cleanEntry = {
        ...raw,
        id: raw.id ? stripHtmlTags(String(raw.id)).trim() : resolvedAsgnId,
        assignmentId: raw.assignmentId ? stripHtmlTags(String(raw.assignmentId)).trim() : resolvedAsgnId,
        title: stripHtmlTags(raw.title),
        description: stripHtmlTags(raw.description),
        semester: raw.semester ? stripHtmlTags(String(raw.semester)).trim() : (getSubjectSemester(raw.subject) || ""),
        fileName: stripHtmlTags(raw.fileName),
        academicYear: asgnYearCheck.academicYear
      };
      if (cleanEntry.fileData && String(cleanEntry.fileData).startsWith("data:")) {
        const prepared = prepareAttachmentDataUrl(cleanEntry.fileData, cleanEntry.fileName);
        if (prepared) {
          pendingAttachmentWrites.push(prepared);
          cleanEntry.fileData = prepared.url;
          cleanEntry.attachmentPath = prepared.filename;
        } else {
          delete cleanEntry.fileData;
        }
      }
      stagedAssignments.push(cleanEntry);
      asgnMap.set(`${asgnYearCheck.academicYear}::${cleanEntry.id}_${cleanEntry.student || ""}`, cleanEntry);
    }

    if (delAsgnKeys.length > 0) {
      deletedAssignmentsScoped = [];
      const confirmedDelAsgnKeys = [];
      const existingDelTombstones = new Set(existingStore?.deletedAssignments || []);

      for (const k of delAsgnKeys) {
        const matched = [];
        if (k.includes("___")) {
          const [stu, titleOrId] = k.split("___");
          const stuLower = stu.toLowerCase();
          const tLower = titleOrId.toLowerCase();
          (existingStore?.assignments || []).forEach(a => {
            if (a && String(a.student || "").toLowerCase() === stuLower &&
                (String(a.id || "").toLowerCase() === tLower || String(a.title || "").toLowerCase() === tLower)) {
              matched.push(a);
            }
          });
          dbAssignments.forEach(a => {
            if (a && (a.assignmentId === `${titleOrId}_${stu}` ||
                (String(a.student || "").toLowerCase() === stuLower && String(a.title || "").toLowerCase() === tLower))) {
              matched.push(a);
            }
          });
        } else {
          (existingStore?.assignments || []).forEach(a => {
            if (a && (a.id === k || a.assignmentId === k)) matched.push(a);
          });
          if (dbAsgnById.has(k)) matched.push(dbAsgnById.get(k));
        }

        if (matched.length > 0) {
          const hasUnversioned = matched.some(m => !m.academicYear || typeof m.academicYear !== "string" || !m.academicYear.trim());
          if (hasUnversioned) {
            return makeSyncRejection(409, "IMMUTABLE_RECORD", `Assignment deletion rejected: Unversioned historical assignment '${k}' is immutable.`);
          }
          const matchedYears = new Set(matched.map(m => String(m.academicYear).trim()));
          if (matchedYears.size > 1) {
            return makeSyncRejection(409, "AMBIGUOUS_ASSIGNMENT_RECORD", `Assignment deletion rejected: Target '${k}' spans multiple academic years.`);
          }
          const matchedYear = Array.from(matchedYears)[0];
          if (explicitPayloadYear && explicitPayloadYear !== matchedYear) {
            return makeSyncRejection(409, "IMMUTABLE_RECORD", `Assignment deletion rejected: Record '${k}' belongs to '${matchedYear}', not '${explicitPayloadYear}'.`);
          }

          const yCheck = await requireOperationalYear(matchedYear, "Academic assignment sync deletion");
          if (!yCheck.ok) return yCheck.rejection;

          for (const m of matched) {
            if (req.user.role === "faculty") {
              const aCheck = validateFacultyAttendanceAuthorization(req.user, m.subject, m.division, m.semester, yCheck.academicYear);
              if (!aCheck.authorized) return makeSyncRejection(403, aCheck.code || "FACULTY_UNAUTHORIZED", aCheck.reason);
              const owner = String(m.facultyUsername || m.authorUsername || m.createdBy || "").trim().toLowerCase();
              if (!owner || owner !== req.user.username.toLowerCase()) {
                return makeSyncRejection(403, "FACULTY_UNAUTHORIZED", "Forbidden: Faculty cannot delete assignments created by other faculty or lacking authorship metadata.");
              }
            }
            const mapKeyBase = m.id || m.assignmentId || k;
            asgnMap.delete(`${yCheck.academicYear}::${mapKeyBase}_${m.student || ""}`);
            deletedAssignmentsScoped.push({
              assignmentId: m.assignmentId || (m.student ? `${m.id}_${m.student}` : k),
              academicYear: yCheck.academicYear
            });
          }
          confirmedDelAsgnKeys.push(k);
        } else if (!existingDelTombstones.has(k)) {
          // Only validate operational year when non-existent/stale tombstone wasn't already recorded;
          // NEVER append non-existent IDs to update.deletedAssignments
          const fallbackCheck = await requireOperationalYear(defaultAcademicYear, "Academic assignment sync deletion");
          if (!fallbackCheck.ok) return fallbackCheck.rejection;
        }
      }

      if (confirmedDelAsgnKeys.length > 0) {
        update.deletedAssignments = Array.from(new Set([...existingDelTombstones, ...confirmedDelAsgnKeys]));
      }
    }

    if (Array.isArray(payload.assignments) || (Array.isArray(payload.deletedAssignments) && (deletedAssignmentsScoped || []).length > 0)) {
      update.assignments = Array.from(asgnMap.values());
    }
  }

  // 5. Study Notes & Deletions: year/auth/ID-reuse & authorless fail-closed checks
  let stagedNotes = null;
  let deletedNotesScoped = null;
  if (Array.isArray(payload.notes) || Array.isArray(payload.deletedNotes)) {
    const incomingNotes = Array.isArray(payload.notes) ? payload.notes : [];
    const rawDelNoteIds = Array.isArray(payload.deletedNotes) ? payload.deletedNotes : [];
    const delNoteIds = [];
    for (const rawId of rawDelNoteIds) {
      if (typeof rawId !== "string" || !rawId.trim()) {
        return makeSyncRejection(400, "INVALID_NOTE_ID", "Note deletion list contains an empty or invalid note ID.");
      }
      delNoteIds.push(stripHtmlTags(rawId).trim());
    }

    const noteRefIds = Array.from(new Set([
      ...incomingNotes.filter(n => n && typeof n === "object").flatMap((n, idx) => [
        n.id ? String(n.id).trim() : "",
        n.noteId ? String(n.noteId).trim() : "",
        getDeterministicNoteId(n, idx)
      ]),
      ...delNoteIds
    ].filter(Boolean)));

    const dbNotes = noteRefIds.length > 0
      ? await Note.find({
          $or: [{ noteId: { $in: noteRefIds } }, { id: { $in: noteRefIds } }]
        }).setOptions(session ? { session } : {}).lean()
      : [];

    const dbNoteById = new Map();
    for (const doc of dbNotes) {
      for (const nk of [doc.noteId, doc.id]) {
        if (!nk) continue;
        const cleanK = String(nk).trim();
        if (!dbNoteById.has(cleanK)) dbNoteById.set(cleanK, []);
        if (!dbNoteById.get(cleanK).includes(doc)) dbNoteById.get(cleanK).push(doc);
      }
    }

    const noteMap = new Map();
    const storeNoteById = new Map();
    (existingStore?.notes || []).forEach((n, idx) => {
      if (!n || typeof n !== "object") return;
      const nYear = n.academicYear && typeof n.academicYear === "string" ? n.academicYear.trim() : "";
      const primaryKey = String(n.id || n.noteId || `__anon_${idx}`).trim();
      const mapKey = `${nYear || "__unversioned__"}::${primaryKey}`;
      noteMap.set(mapKey, n);
      for (const sk of [n.id, n.noteId]) {
        if (!sk) continue;
        const cleanSk = String(sk).trim();
        if (!storeNoteById.has(cleanSk)) storeNoteById.set(cleanSk, []);
        storeNoteById.get(cleanSk).push({ entry: n, mapKey });
      }
    });

    stagedNotes = [];
    for (let idx = 0; idx < incomingNotes.length; idx++) {
      const raw = incomingNotes[idx];
      if (!raw || typeof raw !== "object") continue;
      if (hasMongoOperators(raw)) {
        return makeSyncRejection(400, "INVALID_PAYLOAD", "MongoDB operators are not permitted in notes.");
      }
      if (Object.prototype.hasOwnProperty.call(raw, "academicYear")) {
        if (typeof raw.academicYear !== "string" || !raw.academicYear.trim()) {
          return makeSyncRejection(400, "ACADEMIC_YEAR_REQUIRED", "Study note entry contains empty or invalid academicYear.");
        }
      }
      const rawNoteYear = raw.academicYear
        ? stripHtmlTags(String(raw.academicYear)).trim()
        : defaultAcademicYear;
      const noteYearCheck = await requireOperationalYear(rawNoteYear, "Academic notes sync");
      if (!noteYearCheck.ok) return noteYearCheck.rejection;

      const resolvedNoteId = getDeterministicNoteId(raw, idx);
      const lookupKeys = Array.from(new Set([
        raw.id ? String(raw.id).trim() : "",
        raw.noteId ? String(raw.noteId).trim() : "",
        resolvedNoteId
      ].filter(Boolean)));
      const existingMatches = [];
      for (const lk of lookupKeys) {
        (storeNoteById.get(lk) || []).forEach(h => existingMatches.push(h.entry));
        (dbNoteById.get(lk) || []).forEach(d => existingMatches.push(d));
      }

      for (const ex of existingMatches) {
        const exYear = ex.academicYear && typeof ex.academicYear === "string" ? ex.academicYear.trim() : "";
        if (!exYear || exYear !== noteYearCheck.academicYear) {
          return makeSyncRejection(
            409,
            "IMMUTABLE_RECORD",
            `Academic sync rejected: Study note '${resolvedNoteId}' cannot overwrite record from ${exYear || "unversioned historical storage"}.`
          );
        }
      }

      if (req.user.role === "faculty") {
        const authCheck = validateFacultyAttendanceAuthorization(req.user, raw.subject, raw.division, raw.semester, noteYearCheck.academicYear);
        if (!authCheck.authorized) {
          return makeSyncRejection(
            403,
            authCheck.code || "FACULTY_UNAUTHORIZED",
            `Unauthorized: Faculty cannot create/modify notes for unassigned subject '${raw.subject}'. ${authCheck.reason}`
          );
        }
        // Fail closed on missing authorship fields for faculty overwrites
        for (const existingNote of existingMatches) {
          const owner = String(existingNote.uploadedBy || existingNote.authorUsername || "").trim().toLowerCase();
          if (!owner || owner !== req.user.username.toLowerCase()) {
            return makeSyncRejection(403, "FACULTY_UNAUTHORIZED", "Forbidden: Faculty cannot overwrite notes uploaded by other faculty or lacking authorship metadata.");
          }
        }
      }

      const cleanNote = {
        ...raw,
        id: raw.id ? stripHtmlTags(String(raw.id)).trim() : resolvedNoteId,
        noteId: raw.noteId ? stripHtmlTags(String(raw.noteId)).trim() : resolvedNoteId,
        title: stripHtmlTags(raw.title),
        division: stripHtmlTags(raw.division),
        fileName: stripHtmlTags(raw.fileName),
        uploadedByName: stripHtmlTags(raw.uploadedByName),
        academicYear: noteYearCheck.academicYear
      };
      if (cleanNote.fileData && String(cleanNote.fileData).startsWith("data:")) {
        const prepared = prepareAttachmentDataUrl(cleanNote.fileData, cleanNote.fileName);
        if (prepared) {
          pendingAttachmentWrites.push(prepared);
          cleanNote.fileData = prepared.url;
          cleanNote.attachmentPath = prepared.filename;
        } else {
          delete cleanNote.fileData;
        }
      }
      stagedNotes.push(cleanNote);
      noteMap.set(`${noteYearCheck.academicYear}::${cleanNote.id}`, cleanNote);
    }

    if (delNoteIds.length > 0) {
      deletedNotesScoped = [];
      for (const delId of delNoteIds) {
        const storeHits = storeNoteById.get(delId) || [];
        const dbHits = dbNoteById.get(delId) || [];
        const matched = [...storeHits.map(h => h.entry), ...dbHits];

        if (matched.length > 0) {
          const hasUnversioned = matched.some(m => !m.academicYear || typeof m.academicYear !== "string" || !m.academicYear.trim());
          if (hasUnversioned) {
            return makeSyncRejection(409, "IMMUTABLE_RECORD", `Note deletion rejected: Unversioned historical note '${delId}' is immutable.`);
          }
          const matchedYears = new Set(matched.map(m => String(m.academicYear).trim()));
          if (matchedYears.size > 1) {
            return makeSyncRejection(409, "AMBIGUOUS_NOTE_RECORD", `Note deletion rejected: Note '${delId}' spans multiple academic years.`);
          }
          const matchedYear = Array.from(matchedYears)[0];
          if (explicitPayloadYear && explicitPayloadYear !== matchedYear) {
            return makeSyncRejection(409, "IMMUTABLE_RECORD", `Note deletion rejected: Note '${delId}' belongs to '${matchedYear}', not '${explicitPayloadYear}'.`);
          }

          const yCheck = await requireOperationalYear(matchedYear, "Academic notes sync deletion");
          if (!yCheck.ok) return yCheck.rejection;

          for (const m of matched) {
            if (req.user.role === "faculty") {
              const authCheck = validateFacultyAttendanceAuthorization(req.user, m.subject, m.division, m.semester, yCheck.academicYear);
              if (!authCheck.authorized) return makeSyncRejection(403, authCheck.code || "FACULTY_UNAUTHORIZED", authCheck.reason);
              const owner = String(m.uploadedBy || m.authorUsername || "").trim().toLowerCase();
              if (!owner || owner !== req.user.username.toLowerCase()) {
                return makeSyncRejection(403, "FACULTY_UNAUTHORIZED", "Forbidden: Faculty cannot delete notes uploaded by other faculty or lacking authorship metadata.");
              }
            }
          }

          storeHits.forEach(h => noteMap.delete(h.mapKey));
          noteMap.delete(`${yCheck.academicYear}::${delId}`);
          deletedNotesScoped.push({
            academicYear: yCheck.academicYear,
            $or: [{ noteId: dbHits[0]?.noteId || storeHits[0]?.entry?.noteId || delId }, { id: delId }]
          });
        } else {
          const fallbackCheck = await requireOperationalYear(defaultAcademicYear, "Academic notes sync deletion");
          if (!fallbackCheck.ok) return fallbackCheck.rejection;
        }
      }
    }

    if (Array.isArray(payload.notes) || Array.isArray(payload.deletedNotes)) {
      update.notes = Array.from(noteMap.values());
    }
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
    if (!update.students) {
      const clonedStudents = {};
      for (const [sKey, sVal] of Object.entries(existingStore?.students || {})) {
        if (sVal && typeof sVal === "object") {
          clonedStudents[sKey] = {
            ...sVal,
            marks: sVal.marks && typeof sVal.marks === "object" ? { ...sVal.marks } : {},
            attendance: sVal.attendance && typeof sVal.attendance === "object" ? { ...sVal.attendance } : {}
          };
        }
      }
      update.students = clonedStudents;
    }
    recalculateOverallAttendance(update.dailyAttendance, update.students);
  }

  return {
    earlyResponse: null,
    update,
    defaultAcademicYear: defaultAcademicYear || "",
    touchedActiveYears: Array.from(touchedActiveYears),
    pendingAttachmentWrites,
    stagedStudents,
    stagedDailyAttendance,
    stagedNotices,
    stagedAssignments,
    stagedNotes,
    deletedNoticesScoped,
    deletedAttendanceScoped,
    deletedAssignmentsScoped,
    deletedNotesScoped
  };
}

app.post("/api/academic/sync", rateLimitExpensive, requireAuth(["faculty", "admin"]), async (req, res) => {
  const writtenAttachmentPaths = [];
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

    // 2. Validate payload structure before locks or database operations
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return res.status(400).json({ success: false, message: "Invalid academic synchronization payload." });
    }
    if (hasMongoOperators(payload)) {
      return res.status(400).json({ success: false, message: "MongoDB operators are not permitted in academic synchronization payloads." });
    }
    if (payload.students !== undefined && (typeof payload.students !== "object" || Array.isArray(payload.students) || payload.students === null)) {
      return res.status(400).json({ success: false, message: "Invalid students payload format: Expected an object." });
    }
    const arrayPayloadFields = {
      notices: "Invalid notices payload format: Expected an array.",
      dailyAttendance: "Invalid dailyAttendance payload format: Expected an array.",
      deletedDailyAttendance: "Invalid deletedDailyAttendance payload format: Expected an array.",
      deletedAttendance: "Invalid deletedAttendance payload format: Expected an array.",
      assignments: "Invalid assignments payload format: Expected an array.",
      notes: "Invalid notes payload format: Expected an array.",
      timetable: "Invalid timetable payload format: Expected an array.",
      deletedNotices: "Invalid deletedNotices payload format: Expected an array.",
      deletedAssignments: "Invalid deletedAssignments payload format: Expected an array.",
      deletedNotes: "Invalid deletedNotes payload format: Expected an array."
    };
    for (const [field, msg] of Object.entries(arrayPayloadFields)) {
      if (payload[field] !== undefined && !Array.isArray(payload[field])) {
        return res.status(400).json({ success: false, message: msg });
      }
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

    const supportsTx = academicYearService.isTransactionSupported();
    const outcome = await academicYearService.runWithYearMutationGuard(() =>
      enqueueAcademicSync(async () => {
        if (supportsTx) {
          const session = await mongoose.startSession();
          let txOutcome = null;
          let preparedAttachmentsCommitted = false;
          try {
            await session.withTransaction(async () => {
              txOutcome = null;
              const existingStore = await AcademicStore.findOne({ storeKey: "default_academic_store" }).session(session);
              const validated = await prepareAndValidateAcademicSync(req, payload, existingStore, session);
              if (validated.earlyResponse) {
                txOutcome = { earlyResponse: validated.earlyResponse, existingStoreSnapshot: null };
                return;
              }

              // Fence every touched active academic year against concurrent lifecycle transitions
              for (const yrCode of validated.touchedActiveYears) {
                const yrFence = await validateAcademicYearOperationalForWrite(yrCode, {
                  session,
                  bumpEpoch: true,
                  actionLabel: "Academic sync"
                });
                if (!yrFence.valid) {
                  txOutcome = {
                    earlyResponse: {
                      status: yrFence.status,
                      body: { success: false, code: yrFence.code, message: yrFence.message }
                    },
                    existingStoreSnapshot: null
                  };
                  return;
                }
              }

              // Commit validated attachments ONLY after all validation passes
              if (!preparedAttachmentsCommitted && validated.pendingAttachmentWrites.length > 0) {
                for (const p of validated.pendingAttachmentWrites) {
                  fs.writeFileSync(p.filePath, p.buffer);
                  writtenAttachmentPaths.push(p.filePath);
                }
                preparedAttachmentsCommitted = true;
              }

              const existingSnapshot = existingStore ? existingStore.toObject() : null;
              let storeDoc = existingStore;
              if (!storeDoc) {
                storeDoc = new AcademicStore({
                  storeKey: "default_academic_store",
                  activeAcademicYear: validated.defaultAcademicYear || (await resolveActiveYearCodeWithSession(session)) || "",
                  ...validated.update
                });
              } else {
                Object.assign(storeDoc, validated.update);
              }
              await storeDoc.save({ session });

              await syncCollectionsFromAcademicData(
                {
                  ...(validated.stagedStudents ? { students: validated.stagedStudents } : {}),
                  ...(validated.stagedNotices ? { notices: validated.stagedNotices } : {}),
                  ...(validated.stagedDailyAttendance ? { dailyAttendance: validated.stagedDailyAttendance } : {}),
                  ...(validated.stagedAssignments ? { assignments: validated.stagedAssignments } : {}),
                  ...(validated.stagedNotes ? { notes: validated.stagedNotes } : {})
                },
                {
                  session,
                  ordered: true,
                  throwOnError: true,
                  deletedNoticesScoped: validated.deletedNoticesScoped,
                  deletedAttendanceScoped: validated.deletedAttendanceScoped,
                  deletedAssignmentsScoped: validated.deletedAssignmentsScoped,
                  deletedNotesScoped: validated.deletedNotesScoped
                }
              );

              txOutcome = { earlyResponse: null, validated, existingStoreSnapshot: existingSnapshot };
            });
          } finally {
            await session.endSession();
          }
          return txOutcome;
        }

        // Standalone topology path: validate inputs first so malformed/unauthorized/lifecycle rejections
        // return exact 4xx codes, then fail closed BEFORE any filesystem or DB persistent write
        // because standalone MongoDB cannot guarantee multi-collection ACID atomicity.
        const existingStore = await AcademicStore.findOne({ storeKey: "default_academic_store" });
        const validated = await prepareAndValidateAcademicSync(req, payload, existingStore, null);
        if (validated.earlyResponse) {
          return { earlyResponse: validated.earlyResponse, existingStoreSnapshot: null };
        }

        return {
          earlyResponse: {
            status: 503,
            body: {
              success: false,
              code: "TRANSACTIONS_REQUIRED",
              atomicTransactionsSupported: false,
              message: "Academic synchronization rejected: Multi-collection synchronization requires a transaction-capable MongoDB deployment (replica set or sharded cluster)."
            }
          },
          existingStoreSnapshot: null
        };
      })
    );

    if (outcome?.earlyResponse) {
      cleanupAttachmentFiles(writtenAttachmentPaths);
      return res.status(outcome.earlyResponse.status).json(outcome.earlyResponse.body);
    }

    const { validated, existingStoreSnapshot } = outcome;

    // Prompt 29: Immediate real-time Web Push event delivery for academic operations
    // 1. Attendance notifications for newly marked Present students
    if (Array.isArray(validated.stagedDailyAttendance)) {
      for (const a of validated.stagedDailyAttendance) {
        if (!a || typeof a !== "object") continue;
        const targetId = a.attendanceId || a.id;
        const prevEntry = (existingStoreSnapshot?.dailyAttendance || []).find(d =>
          d && d.academicYear === a.academicYear &&
          (d.attendanceId === targetId || d.id === targetId || (d.subject === a.subject && d.isoDate === a.isoDate && d.division === a.division))
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
          const prevStudentMarks = existingStoreSnapshot?.students?.[username]?.marks || {};
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
    if (Array.isArray(validated.stagedAssignments)) {
      const prevAssignIds = new Set((existingStoreSnapshot?.assignments || []).map(a => a && (a.id || a.title)));
      for (const asgn of validated.stagedAssignments) {
        if (asgn && asgn.id && !prevAssignIds.has(asgn.id)) {
          pushService.notifyAssignment(asgn)
            .catch(err => console.warn("[WebPush] Assignment sync push error:", err.message));
        }
      }
    }

    // 4. Study Notes notifications for newly published notes
    if (Array.isArray(validated.stagedNotes)) {
      const prevNoteIds = new Set((existingStoreSnapshot?.notes || []).map(n => n && (n.id || n.title)));
      for (const note of validated.stagedNotes) {
        if (note && note.id && !prevNoteIds.has(note.id)) {
          pushService.notifyNote(note)
            .catch(err => console.warn("[WebPush] Notes sync push error:", err.message));
        }
      }
    }

    // 5. Notices notifications for newly published notices
    if (Array.isArray(validated.stagedNotices)) {
      const prevNoticeIds = new Set((existingStoreSnapshot?.notices || []).map(n => n && (n.id || n.noticeId || n.title)));
      for (const notice of validated.stagedNotices) {
        if (notice && (notice.id || notice.noticeId) && !prevNoticeIds.has(notice.id || notice.noticeId)) {
          pushService.notifyNotice(notice, req.user)
            .catch(err => console.warn("[WebPush] Notice sync push error:", err.message));
        }
      }
    }

    fileSyncService.triggerSync();
    res.json({ success: true, message: "Academic data permanently saved to MongoDB!" });
  } catch (error) {
    cleanupAttachmentFiles(writtenAttachmentPaths);
    console.error("Sync academic data error:", error);
    const errStatus = error.status === 413 || error.statusCode === 413
      ? 413
      : (typeof error.status === "number" && error.status >= 400 ? error.status : 500);
    res.status(errStatus).json({
      success: false,
      code: error.code || "SYNC_PERSISTENCE_FAILED",
      atomicTransactionsSupported: error.atomicTransactionsSupported !== undefined
        ? error.atomicTransactionsSupported
        : academicYearService.isTransactionSupported(),
      message: "Failed to synchronize academic data cleanly across persistent storage."
    });
  }
});

// Authenticated Academic File Attachment Endpoint with nosniff, magic byte validation, and strict student authorization
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

    // Authorization check: Admins and faculty have access; students require an explicit, unambiguous association
    const user = req.user;
    if (user.role === "student") {
      const attachUrl = `/api/academic/attachments/${filename}`;
      const [store, dbNotes, dbAssigns, dbNotices] = await Promise.all([
        AcademicStore.findOne({ storeKey: "default_academic_store" }).lean(),
        Note.find({ fileData: attachUrl }).lean(),
        Assignment.find({ fileData: attachUrl }).lean(),
        Notice.find({ fileData: attachUrl }).lean()
      ]);

      const activeYearCode = (await academicYearService.getActiveYearCode()) || "";
      const hasYearQuery = req.query && Object.prototype.hasOwnProperty.call(req.query, "academicYear");
      let requestedAttYear = "";
      if (hasYearQuery) {
        requestedAttYear = stripHtmlTags(String(req.query.academicYear || "")).trim();
        if (!requestedAttYear) {
          return res.status(400).json({ success: false, code: "ACADEMIC_YEAR_REQUIRED", message: "Invalid academicYear query parameter." });
        }
      }
      const targetStudentYear = requestedAttYear || activeYearCode;
      let historicalEntitled = !requestedAttYear || requestedAttYear === activeYearCode;
      if (!historicalEntitled && targetStudentYear) {
        const yrDoc = await academicYearService.getAcademicYearByIdOrCode(targetStudentYear);
        if (yrDoc) {
          const stuRegex = new RegExp(`^${escapeRegex(user.username)}$`, "i");
          const [mHit, aHit, asgnHit] = await Promise.all([
            Mark.exists({ academicYear: yrDoc.yearCode, studentUsername: stuRegex }).then(Boolean),
            Attendance.exists({ academicYear: yrDoc.yearCode, $or: [{ studentUsername: stuRegex }, { [`records.${user.username}`]: { $exists: true } }] }).then(Boolean),
            Assignment.exists({ academicYear: yrDoc.yearCode, $or: [{ student: stuRegex }, { "submissions.studentUsername": stuRegex }] }).then(Boolean)
          ]);
          historicalEntitled = mHit || aHit || asgnHit || String(user.academicYear || "").trim() === yrDoc.yearCode;
        }
      }

      const userDiv = String(user.division || "").trim().toLowerCase();
      const userSem = String(user.semester || "").trim().toLowerCase();
      const normUser = String(user.username || "").trim().toLowerCase();
      const matchesFileRef = (rec) => Boolean(
        rec && (rec.attachmentPath === filename || rec.fileData === attachUrl || (typeof rec.fileData === "string" && rec.fileData.endsWith(`/${filename}`)))
      );

      const storeNotes = (store?.notes || []).filter(matchesFileRef);
      const storeAssigns = (store?.assignments || []).filter(matchesFileRef);
      const storeNotices = (store?.notices || []).filter(matchesFileRef);

      const allNotices = [...storeNotices, ...dbNotices];
      const allNotes = [...storeNotes, ...dbNotes];
      const allAssigns = [...storeAssigns, ...dbAssigns];

      let authorized = false;

      if (targetStudentYear && historicalEntitled) {
        // 1. Validate associated notices (academicYear, target role, target division, target semester, and ambiguity fail-closed)
        if (allNotices.length > 0) {
          const noticeYears = new Set(allNotices.map(n => String(n.academicYear || "").trim()));
          const isNoticeVisibleToStudent = (n) => {
            const nYear = String(n.academicYear || "").trim();
            if (!nYear || nYear !== targetStudentYear) return false;
            const tRole = String(n.target || n.targetRole || "all").trim().toLowerCase();
            if (tRole !== "all" && tRole !== "student") return false;
            const nDiv = String(n.targetDivision || "all").trim().toLowerCase();
            const isUniversalDiv = !nDiv || nDiv === "all" || nDiv === "all divisions" || nDiv === "both divisions";
            if (!isUniversalDiv && (!userDiv || nDiv !== userDiv)) return false;
            const nSem = String(n.targetSemester || "all").trim().toLowerCase();
            if (nSem && nSem !== "all" && nSem !== "all semesters" && (!userSem || nSem !== userSem)) return false;
            return true;
          };

          // Fail closed if conflicting/unversioned/forbidden notice claims exist
          if (noticeYears.size === 1 && !noticeYears.has("") && allNotices.every(isNoticeVisibleToStudent)) {
            authorized = true;
          }
        }

        // 2. Validate associated study notes (unversioned fails closed; validate year, division, and optional semester on same entry)
        if (!authorized && allNotices.length === 0 && allNotes.length > 0) {
          const noteYears = new Set(allNotes.map(n => String(n.academicYear || "").trim()));
          const isNoteVisibleToStudent = (n) => {
            const nYear = String(n.academicYear || "").trim();
            if (!nYear || nYear !== targetStudentYear) return false;
            const nDiv = String(n.division || "").trim().toLowerCase();
            const divOk = !nDiv || nDiv === "all divisions" || nDiv === "all" || nDiv === "both divisions" || (userDiv && nDiv === userDiv);
            if (!divOk) return false;
            const nSem = String(n.semester || "").trim().toLowerCase();
            if (nSem && nSem !== "all" && nSem !== "all semesters" && (!userSem || nSem !== userSem)) return false;
            return true;
          };
          if (noteYears.size === 1 && !noteYears.has("") && allNotes.every(isNoteVisibleToStudent)) {
            authorized = true;
          }
        }

        // 3. Validate associated assignments (unversioned fails closed; all target dimensions verified on the same entry)
        if (!authorized && allNotices.length === 0 && allAssigns.length > 0) {
          const assignYears = new Set(allAssigns.map(a => String(a.academicYear || "").trim()));
          const isAssignVisibleToStudent = (a) => {
            const aYear = String(a.academicYear || "").trim();
            if (!aYear || aYear !== targetStudentYear) return false;
            const assignStudent = String(a.student || "").trim().toLowerCase();
            const assignDiv = String(a.targetDivision || a.division || "").trim().toLowerCase();
            const divOk = !assignDiv || assignDiv === "all" || assignDiv === "all divisions" || assignDiv === "both divisions" || (userDiv && assignDiv === userDiv);
            if (!divOk) return false;
            const aSem = String(a.semester || "").trim().toLowerCase();
            if (aSem && aSem !== "all" && aSem !== "all semesters" && (!userSem || aSem !== userSem)) return false;
            return assignStudent === normUser || !assignStudent || assignStudent === "all";
          };
          if (!assignYears.has("") && allAssigns.some(isAssignVisibleToStudent)) {
            authorized = true;
          }
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

// --- Student & Faculty Assignment Submission Status Update (Year-Scoped & Lifecycle-Protected) ---
app.post("/api/academic/assignment-status", rateLimitExpensive, requireAuth(["student", "faculty", "admin"]), async (req, res) => {
  try {
    if (hasMongoOperators(req.body)) {
      return res.status(400).json({ success: false, message: "MongoDB operators are not permitted." });
    }

    const { studentUsername, title, due, status, assignmentId, id, academicYear } = req.body || {};
    if (typeof academicYear !== "string" || !stripHtmlTags(academicYear).trim()) {
      return res.status(400).json({
        success: false,
        code: "ACADEMIC_YEAR_REQUIRED",
        message: "Assignment status update rejected: Explicit operational 'academicYear' is required."
      });
    }
    const requestedYear = stripHtmlTags(academicYear).trim();

    if (!studentUsername || typeof studentUsername !== "string" || !studentUsername.trim() ||
        !title || typeof title !== "string" || !title.trim() ||
        !status || typeof status !== "string") {
      return res.status(400).json({ success: false, message: "studentUsername, title, academicYear, and status are required." });
    }

    const cleanStudent = stripHtmlTags(studentUsername).trim();
    const cleanTitle = stripHtmlTags(title).trim();
    const cleanDue = due ? stripHtmlTags(String(due)).trim() : "";
    const cleanStatus = stripHtmlTags(status).trim();
    if (!["Pending", "Submitted"].includes(cleanStatus)) {
      return res.status(400).json({ success: false, message: "Status must be 'Pending' or 'Submitted'." });
    }

    const explicitAsgnId = assignmentId ? stripHtmlTags(String(assignmentId)).trim() : "";
    const explicitAltId = id ? stripHtmlTags(String(id)).trim() : "";
    if (explicitAsgnId && explicitAltId && explicitAsgnId !== explicitAltId) {
      return res.status(400).json({
        success: false,
        code: "ASSIGNMENT_ID_MISMATCH",
        message: "Conflicting 'assignmentId' and 'id' values provided."
      });
    }
    const targetAssignId = explicitAsgnId || explicitAltId;

    // Students can strictly only update their own assignments
    if (req.user.role === "student" && req.user.username.toLowerCase() !== cleanStudent.toLowerCase()) {
      return res.status(403).json({ success: false, message: "Forbidden: Students can only update their own assignments." });
    }

    const normUser = cleanStudent.toLowerCase();
    const normTitle = cleanTitle.toLowerCase();
    const todayISO = new Date().toISOString().split("T")[0];

    const executeStatusWrite = async (session = null) => {
      const yearCheck = await validateAcademicYearOperationalForWrite(requestedYear, {
        session,
        bumpEpoch: Boolean(session),
        actionLabel: "Assignment status update"
      });
      if (!yearCheck.valid) {
        return {
          earlyResponse: {
            status: yearCheck.status,
            body: { success: false, code: yearCheck.code, message: yearCheck.message }
          }
        };
      }
      const cleanYear = yearCheck.academicYear;

      const store = await AcademicStore.findOne({ storeKey: "default_academic_store" })
        .setOptions(session ? { session } : {});
      const storeAssignments = Array.isArray(store?.assignments) ? store.assignments : [];

      let dbMatches = [];
      let storeMatches = [];

      if (targetAssignId) {
        dbMatches = await Assignment.find({
          $or: [{ assignmentId: targetAssignId }, { id: targetAssignId }]
        }).setOptions(session ? { session } : {}).lean();

        storeMatches = storeAssignments.filter(a =>
          a && (a.assignmentId === targetAssignId || a.id === targetAssignId)
        );
      } else {
        const dbFilter = {
          student: new RegExp(`^${escapeRegex(cleanStudent)}$`, "i"),
          title: new RegExp(`^${escapeRegex(cleanTitle)}$`, "i")
        };
        if (cleanDue) dbFilter.due = cleanDue;
        dbMatches = await Assignment.find(dbFilter).setOptions(session ? { session } : {}).lean();

        storeMatches = storeAssignments.filter(a =>
          a &&
          String(a.student || "").trim().toLowerCase() === normUser &&
          String(a.title || "").trim().toLowerCase() === normTitle &&
          (!cleanDue || String(a.due || "").trim() === cleanDue)
        );
      }

      const allMatches = [...dbMatches, ...storeMatches];
      const inYearDb = dbMatches.filter(m => String(m.academicYear || "").trim() === cleanYear);
      const inYearStore = storeMatches.filter(m => String(m.academicYear || "").trim() === cleanYear);
      const inYearMatches = [...inYearDb, ...inYearStore];
      const nonYearMatches = allMatches.filter(m => String(m.academicYear || "").trim() !== cleanYear);

      if (targetAssignId && nonYearMatches.length > 0) {
        const otherYear = String(nonYearMatches[0].academicYear || "").trim();
        return {
          earlyResponse: {
            status: 409,
            body: {
              success: false,
              code: "IMMUTABLE_RECORD",
              message: `Assignment status update rejected: Assignment '${targetAssignId}' belongs to ${otherYear || "unversioned historical storage"}, not '${cleanYear}'.`
            }
          }
        };
      }

      if (inYearMatches.length === 0) {
        if (nonYearMatches.length > 0) {
          return {
            earlyResponse: {
              status: 409,
              body: {
                success: false,
                code: "IMMUTABLE_RECORD",
                message: "Assignment status update rejected: Matching records exist only in unversioned or non-matching historical storage."
              }
            }
          };
        }
        return {
          earlyResponse: {
            status: 404,
            body: {
              success: false,
              code: "ASSIGNMENT_NOT_FOUND",
              message: `No matching assignment found in academic year '${cleanYear}'.`
            }
          }
        };
      }

      // Check ambiguity within target academic year
      const distinctDbIds = new Set(inYearDb.map(d => String(d.assignmentId || d._id)));
      const distinctStoreKeys = new Set(
        inYearStore.map(s => String(s.assignmentId || s.id || `${s.subject || ""}_${s.due || ""}_${s.student || ""}`))
      );
      if (distinctDbIds.size > 1 || distinctStoreKeys.size > 1) {
        return {
          earlyResponse: {
            status: 409,
            body: {
              success: false,
              code: "AMBIGUOUS_ASSIGNMENT_RECORD",
              message: "Assignment status update rejected: Multiple ambiguous assignments match target criteria in the specified academic year."
            }
          }
        };
      }

      const primaryMatch = inYearDb[0] || inYearStore[0];
      if (inYearDb.length === 1 && inYearStore.length === 1) {
        const dbIds = new Set([inYearDb[0].assignmentId, inYearDb[0].id].map(x => String(x || "").trim()).filter(Boolean));
        const storeIds = new Set([
          inYearStore[0].assignmentId,
          inYearStore[0].id,
          inYearStore[0].id && inYearStore[0].student ? `${inYearStore[0].id}_${inYearStore[0].student}` : ""
        ].map(x => String(x || "").trim()).filter(Boolean));
        const idsOverlap = Array.from(dbIds).some(val => storeIds.has(val));
        if (!idsOverlap) {
          return {
            earlyResponse: {
              status: 409,
              body: {
                success: false,
                code: "AMBIGUOUS_ASSIGNMENT_RECORD",
                message: "Assignment status update rejected: MongoDB and store assignment records have conflicting identifiers."
              }
            }
          };
        }
      }

      const matchedStudent = String(primaryMatch.student || "").trim().toLowerCase();
      if (matchedStudent && matchedStudent !== "all" && matchedStudent !== normUser) {
        return {
          earlyResponse: {
            status: 409,
            body: {
              success: false,
              code: "IMMUTABLE_RECORD",
              message: "Assignment identifier does not belong to the specified studentUsername."
            }
          }
        };
      }

      if (req.user.role === "faculty") {
        const recSubject = String(primaryMatch.subject || "").trim();
        const recDivision = String(primaryMatch.targetDivision || primaryMatch.division || "").trim();
        const recSemester = String(
          primaryMatch.semester ||
          (inYearStore[0] && inYearStore[0].semester) ||
          (inYearDb[0] && inYearDb[0].semester) ||
          getSubjectSemester(recSubject) ||
          ""
        ).trim();
        if (!recSubject) {
          return {
            earlyResponse: {
              status: 403,
              body: {
                success: false,
                code: "FACULTY_UNAUTHORIZED",
                message: "Forbidden: Assignment lacks required subject metadata for faculty authorization."
              }
            }
          };
        }
        if (!recSemester) {
          return {
            earlyResponse: {
              status: 403,
              body: {
                success: false,
                code: "FACULTY_UNAUTHORIZED",
                message: "Forbidden: Assignment lacks required semester metadata for faculty authorization."
              }
            }
          };
        }
        const facAuth = validateFacultyAttendanceAuthorization(req.user, recSubject, recDivision, recSemester, cleanYear);
        if (!facAuth.authorized) {
          return {
            earlyResponse: {
              status: 403,
              body: { success: false, code: facAuth.code || "FACULTY_UNAUTHORIZED", message: facAuth.reason }
            }
          };
        }
        const owner = String(primaryMatch.facultyUsername || primaryMatch.authorUsername || primaryMatch.createdBy || "").trim().toLowerCase();
        if (!owner || owner !== req.user.username.toLowerCase()) {
          return {
            earlyResponse: {
              status: 403,
              body: {
                success: false,
                code: "FACULTY_UNAUTHORIZED",
                message: "Forbidden: Faculty cannot modify assignment status for assignments owned by other faculty or lacking authorship metadata."
              }
            }
          };
        }
      }

      const dbTarget = inYearDb[0] || null;
      const storeTarget = inYearStore[0] || null;
      const nextSubmittedDate = cleanStatus === "Submitted"
        ? ((storeTarget && storeTarget.submittedDate) || (dbTarget && dbTarget.submittedDate) || todayISO)
        : "";

      const prevDbStatus = dbTarget ? dbTarget.status : null;
      const prevDbSubmittedDate = dbTarget ? dbTarget.submittedDate : null;

      if (dbTarget) {
        await Assignment.updateOne(
          { _id: dbTarget._id, academicYear: cleanYear },
          { $set: { status: cleanStatus, submittedDate: nextSubmittedDate } },
          session ? { session } : {}
        );
      }

      let updatedAssign = null;
      if (storeTarget && store) {
        storeTarget.status = cleanStatus;
        storeTarget.submittedDate = nextSubmittedDate;
        store.markModified("assignments");
        try {
          await store.save(session ? { session } : {});
        } catch (storeErr) {
          if (!session && dbTarget) {
            try {
              await Assignment.updateOne(
                { _id: dbTarget._id, academicYear: cleanYear },
                { $set: { status: prevDbStatus, submittedDate: prevDbSubmittedDate } }
              );
            } catch (rbErr) {
              console.error("[AssignmentStatus] Standalone rollback failed:", rbErr.message);
            }
          }
          throw storeErr;
        }
        updatedAssign = storeTarget;
      } else if (dbTarget) {
        updatedAssign = { ...dbTarget, status: cleanStatus, submittedDate: nextSubmittedDate };
      }

      return { earlyResponse: null, updatedAssign };
    };

    const outcome = await academicYearService.runWithYearMutationGuard(async () => {
      if (academicYearService.isTransactionSupported()) {
        const session = await mongoose.startSession();
        let txResult = null;
        try {
          await session.withTransaction(async () => {
            txResult = null;
            txResult = await executeStatusWrite(session);
          });
        } finally {
          await session.endSession();
        }
        return txResult;
      }
      return executeStatusWrite(null);
    });

    if (outcome?.earlyResponse) {
      return res.status(outcome.earlyResponse.status).json(outcome.earlyResponse.body);
    }

    fileSyncService.triggerSync();

    return res.json({
      success: true,
      message: `Assignment status updated to '${cleanStatus}'.`,
      assignment: outcome.updatedAssign
    });
  } catch (err) {
    console.error("Assignment status update error:", err);
    return res.status(500).json({ success: false, message: "Failed to update assignment status." });
  }
});

// --- Administrator Academic Divisions Cascade Synchronization (Year-Scoped & Lifecycle-Fenced) ---
app.post("/api/academic/divisions/cascade", rateLimitExpensive, requireAuth(["admin"]), async (req, res) => {
  try {
    if (hasMongoOperators(req.body)) {
      return res.status(400).json({ success: false, message: "MongoDB operators are not permitted." });
    }

    const { action, courseYear, oldDivision, newDivision, fallbackDivision, academicYear } = req.body || {};
    if (typeof academicYear !== "string" || !stripHtmlTags(academicYear).trim()) {
      return res.status(400).json({
        success: false,
        code: "ACADEMIC_YEAR_REQUIRED",
        message: "Division cascade rejected: Explicit operational 'academicYear' is required."
      });
    }
    const requestedYear = stripHtmlTags(academicYear).trim();

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

    if (action === "add" && !cleanNewDiv) {
      return res.status(400).json({ success: false, message: "New division name is required." });
    }
    if (action === "rename" && (!cleanOldDiv || !cleanNewDiv)) {
      return res.status(400).json({ success: false, message: "Old division and new division names are required." });
    }
    if (action === "delete" && !cleanOldDiv) {
      return res.status(400).json({ success: false, message: "Division to delete is required." });
    }

    const isRecordInCourseYearScope = (rec, { isNotice = false } = {}) => {
      if (!rec || typeof rec !== "object") return false;
      if (yr === "All Years") return true;
      if (isNotice) {
        const sem = String(rec.targetSemester || "").trim().toLowerCase();
        return Boolean(sem && targetSemesters.some(ts => ts.toLowerCase() === sem));
      }
      if (rec.courseYear && typeof rec.courseYear === "string" && rec.courseYear.trim()) {
        return targetYears.some(ty => ty.toLowerCase() === rec.courseYear.trim().toLowerCase());
      }
      if (rec.semester && typeof rec.semester === "string" && rec.semester.trim()) {
        return targetSemesters.some(ts => ts.toLowerCase() === rec.semester.trim().toLowerCase());
      }
      const subSem = getSubjectSemester(rec.subject);
      return Boolean(subSem && targetSemesters.some(ts => ts.toLowerCase() === subSem.toLowerCase()));
    };

    const executeCascade = async (session = null) => {
      const yearCheck = await validateAcademicYearOperationalForWrite(requestedYear, {
        session,
        bumpEpoch: Boolean(session),
        actionLabel: "Division cascade"
      });
      if (!yearCheck.valid) {
        return {
          earlyResponse: {
            status: yearCheck.status,
            body: { success: false, code: yearCheck.code, message: yearCheck.message }
          }
        };
      }
      const cleanYear = yearCheck.academicYear;
      const writeOpts = session ? { session } : {};

      let store = await AcademicStore.findOne({ storeKey: "default_academic_store" })
        .setOptions(writeOpts);
      if (!store) {
        store = new AcademicStore({
          storeKey: "default_academic_store",
          activeAcademicYear: cleanYear
        });
      }
      const currentDivs = normalizeStoreDivisions(store.divisions);

      if (action === "add") {
        targetYears.forEach(y => {
          if (!Array.isArray(currentDivs[y])) currentDivs[y] = ["Div A", "Div B"];
          if (!currentDivs[y].some(d => d.toLowerCase() === cleanNewDiv.toLowerCase())) {
            currentDivs[y].push(cleanNewDiv);
          }
        });
        store.divisions = currentDivs;
        store.markModified("divisions");
        await store.save(writeOpts);

        return {
          earlyResponse: null,
          status: 200,
          body: {
            success: true,
            academicYear: cleanYear,
            message: `Division '${cleanNewDiv}' added successfully.`,
            divisions: currentDivs
          }
        };
      }

      if (action === "rename") {
        if (cleanOldDiv.toLowerCase() === cleanNewDiv.toLowerCase()) {
          return {
            earlyResponse: null,
            status: 200,
            body: { success: true, academicYear: cleanYear, message: "Division name unchanged.", divisions: currentDivs }
          };
        }

        // 1. Update AcademicStore divisions
        targetYears.forEach(y => {
          if (Array.isArray(currentDivs[y])) {
            currentDivs[y] = currentDivs[y].map(d => d.toLowerCase() === cleanOldDiv.toLowerCase() ? cleanNewDiv : d);
          }
        });
        store.divisions = currentDivs;

        // 2. Cascade ONLY AcademicStore entries explicitly stamped with cleanYear AND matching target courseYear/semester
        const matchesYear = (entry) => entry && typeof entry.academicYear === "string" && entry.academicYear.trim() === cleanYear;

        if (Array.isArray(store.timetable)) {
          store.timetable.forEach(t => {
            if (matchesYear(t) && t.division && t.division.toLowerCase() === cleanOldDiv.toLowerCase() &&
                (yr === "All Years" || !t.semester || targetSemesters.includes(t.semester))) {
              t.division = cleanNewDiv;
            }
          });
          store.markModified("timetable");
        }
        if (Array.isArray(store.assignments)) {
          store.assignments.forEach(a => {
            if (matchesYear(a) && a.targetDivision && a.targetDivision.toLowerCase() === cleanOldDiv.toLowerCase() &&
                isRecordInCourseYearScope(a)) {
              a.targetDivision = cleanNewDiv;
            }
          });
          store.markModified("assignments");
        }
        if (Array.isArray(store.dailyAttendance)) {
          store.dailyAttendance.forEach(att => {
            if (matchesYear(att) && att.division && att.division.toLowerCase() === cleanOldDiv.toLowerCase() &&
                (yr === "All Years" || (att.courseYear && targetYears.includes(att.courseYear)) || (att.semester && targetSemesters.includes(att.semester)))) {
              att.division = cleanNewDiv;
            }
          });
          store.markModified("dailyAttendance");
        }
        if (Array.isArray(store.notes)) {
          store.notes.forEach(n => {
            if (matchesYear(n) && n.division && n.division.toLowerCase() === cleanOldDiv.toLowerCase() &&
                isRecordInCourseYearScope(n)) {
              n.division = cleanNewDiv;
            }
          });
          store.markModified("notes");
        }
        if (Array.isArray(store.notices)) {
          store.notices.forEach(n => {
            if (matchesYear(n) && n.targetDivision && n.targetDivision.toLowerCase() === cleanOldDiv.toLowerCase() &&
                isRecordInCourseYearScope(n, { isNotice: true })) {
              n.targetDivision = cleanNewDiv;
            }
          });
          store.markModified("notices");
        }
        store.markModified("divisions");
        await store.save(writeOpts);

        const oldDivRegex = new RegExp(`^${escapeRegex(cleanOldDiv)}$`, "i");

        // 3. Cascade Students belonging strictly to cleanYear
        await User.updateMany(
          {
            role: "student",
            academicYear: cleanYear,
            division: oldDivRegex,
            $or: [
              { courseYear: { $in: targetYears } },
              { semester: { $in: targetSemesters } }
            ]
          },
          { $set: { division: cleanNewDiv } },
          writeOpts
        );

        // 4. Cascade Faculty allocations scoped to cleanYear (never altering other-year or other-courseYear allocations)
        const facultyUsers = await User.find({ role: "faculty" }).setOptions(writeOpts);
        for (const fac of facultyUsers) {
          let changed = false;
          if (Array.isArray(fac.facultyAllocations) && fac.facultyAllocations.length > 0) {
            fac.facultyAllocations = fac.facultyAllocations.map(alloc => {
              if (!alloc || typeof alloc !== "object") return alloc;
              const allocYr = String(alloc.academicYear || alloc.yearCode || "").trim();
              if (allocYr === cleanYear && alloc.division && String(alloc.division).toLowerCase() === cleanOldDiv.toLowerCase() &&
                  isRecordInCourseYearScope(alloc)) {
                changed = true;
                return { ...alloc, division: cleanNewDiv };
              }
              return alloc;
            });
            if (changed) fac.markModified("facultyAllocations");
          } else if (String(fac.academicYear || "").trim() === cleanYear) {
            if (fac.division && fac.division.toLowerCase() === cleanOldDiv.toLowerCase()) {
              fac.division = cleanNewDiv;
              changed = true;
            }
            let subDivs = fac.subjectDivisions;
            if (subDivs instanceof Map) subDivs = Object.fromEntries(subDivs);
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
              }
            }
          }
          if (changed) {
            await fac.save(writeOpts);
          }
        }

        // 5-7. Year-scoped & courseYear-scoped collection updates
        await Timetable.updateMany(
          { academicYear: cleanYear, semester: { $in: targetSemesters }, division: oldDivRegex },
          { $set: { division: cleanNewDiv } },
          writeOpts
        );
        await Attendance.updateMany(
          {
            academicYear: cleanYear,
            division: oldDivRegex,
            $or: [{ courseYear: { $in: targetYears } }, { semester: { $in: targetSemesters } }]
          },
          { $set: { division: cleanNewDiv } },
          writeOpts
        );

        const candidateAsgns = await Assignment.find({ academicYear: cleanYear, targetDivision: oldDivRegex })
          .setOptions(writeOpts).select("_id subject courseYear semester").lean();
        const asgnIdsToRename = candidateAsgns.filter(a => isRecordInCourseYearScope(a)).map(a => a._id);
        if (asgnIdsToRename.length > 0) {
          await Assignment.updateMany({ _id: { $in: asgnIdsToRename }, academicYear: cleanYear }, { $set: { targetDivision: cleanNewDiv } }, writeOpts);
        }

        const candidateNotes = await Note.find({ academicYear: cleanYear, division: oldDivRegex })
          .setOptions(writeOpts).select("_id subject courseYear semester").lean();
        const noteIdsToRename = candidateNotes.filter(n => isRecordInCourseYearScope(n)).map(n => n._id);
        if (noteIdsToRename.length > 0) {
          await Note.updateMany({ _id: { $in: noteIdsToRename }, academicYear: cleanYear }, { $set: { division: cleanNewDiv } }, writeOpts);
        }

        const candidateNotices = await Notice.find({ academicYear: cleanYear, targetDivision: oldDivRegex })
          .setOptions(writeOpts).select("_id targetSemester").lean();
        const noticeIdsToRename = candidateNotices.filter(n => isRecordInCourseYearScope(n, { isNotice: true })).map(n => n._id);
        if (noticeIdsToRename.length > 0) {
          await Notice.updateMany({ _id: { $in: noticeIdsToRename }, academicYear: cleanYear }, { $set: { targetDivision: cleanNewDiv } }, writeOpts);
        }

        return {
          earlyResponse: null,
          status: 200,
          body: {
            success: true,
            academicYear: cleanYear,
            message: `Division '${cleanOldDiv}' renamed to '${cleanNewDiv}' cleanly within academic year '${cleanYear}'.`,
            divisions: currentDivs
          }
        };
      }

      // action === "delete"
      for (const y of targetYears) {
        const remaining = (currentDivs[y] || []).filter(d => d.toLowerCase() !== cleanOldDiv.toLowerCase());
        if (remaining.length === 0) {
          return {
            earlyResponse: {
              status: 400,
              body: {
                success: false,
                message: `Cannot delete division: At least one division must remain configured for ${y}.`
              }
            }
          };
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

      // 2. Cascade ONLY AcademicStore entries belonging strictly to cleanYear & matching courseYear/semester
      const matchesYearDel = (entry) => entry && typeof entry.academicYear === "string" && entry.academicYear.trim() === cleanYear;

      if (Array.isArray(store.timetable)) {
        store.timetable = store.timetable.map(t => {
          if (matchesYearDel(t) && t.division && t.division.toLowerCase() === cleanOldDiv.toLowerCase() &&
              (yr === "All Years" || !t.semester || targetSemesters.includes(t.semester))) {
            return { ...t, division: effectiveFallback };
          }
          return t;
        });
        store.markModified("timetable");
      }
      if (Array.isArray(store.assignments)) {
        store.assignments.forEach(a => {
          if (matchesYearDel(a) && a.targetDivision && a.targetDivision.toLowerCase() === cleanOldDiv.toLowerCase() &&
              isRecordInCourseYearScope(a)) {
            a.targetDivision = "All Divisions";
          }
        });
        store.markModified("assignments");
      }
      if (Array.isArray(store.dailyAttendance)) {
        store.dailyAttendance.forEach(att => {
          if (matchesYearDel(att) && att.division && att.division.toLowerCase() === cleanOldDiv.toLowerCase() &&
              (yr === "All Years" || (att.courseYear && targetYears.includes(att.courseYear)) || (att.semester && targetSemesters.includes(att.semester)))) {
            att.division = effectiveFallback;
          }
        });
        store.markModified("dailyAttendance");
      }
      if (Array.isArray(store.notes)) {
        store.notes.forEach(n => {
          if (matchesYearDel(n) && n.division && n.division.toLowerCase() === cleanOldDiv.toLowerCase() &&
              isRecordInCourseYearScope(n)) {
            n.division = "All Divisions";
          }
        });
        store.markModified("notes");
      }
      if (Array.isArray(store.notices)) {
        store.notices.forEach(n => {
          if (matchesYearDel(n) && n.targetDivision && n.targetDivision.toLowerCase() === cleanOldDiv.toLowerCase() &&
              isRecordInCourseYearScope(n, { isNotice: true })) {
            n.targetDivision = "all";
          }
        });
        store.markModified("notices");
      }
      store.markModified("divisions");
      await store.save(writeOpts);

      const oldDivRegex = new RegExp(`^${escapeRegex(cleanOldDiv)}$`, "i");

      // 3. Cascade Students strictly in cleanYear
      await User.updateMany(
        {
          role: "student",
          academicYear: cleanYear,
          division: oldDivRegex,
          $or: [{ courseYear: { $in: targetYears } }, { semester: { $in: targetSemesters } }]
        },
        { $set: { division: effectiveFallback } },
        writeOpts
      );

      // 4. Cascade Faculty allocations scoped to cleanYear
      const facultyUsers = await User.find({ role: "faculty" }).setOptions(writeOpts);
      for (const fac of facultyUsers) {
        let changed = false;
        if (Array.isArray(fac.facultyAllocations) && fac.facultyAllocations.length > 0) {
          fac.facultyAllocations = fac.facultyAllocations.map(alloc => {
            if (!alloc || typeof alloc !== "object") return alloc;
            const allocYr = String(alloc.academicYear || alloc.yearCode || "").trim();
            if (allocYr === cleanYear && alloc.division && String(alloc.division).toLowerCase() === cleanOldDiv.toLowerCase() &&
                isRecordInCourseYearScope(alloc)) {
              changed = true;
              return { ...alloc, division: effectiveFallback };
            }
            return alloc;
          });
          if (changed) fac.markModified("facultyAllocations");
        } else if (String(fac.academicYear || "").trim() === cleanYear) {
          if (fac.division && fac.division.toLowerCase() === cleanOldDiv.toLowerCase()) {
            fac.division = effectiveFallback;
            changed = true;
          }
          let subDivs = fac.subjectDivisions;
          if (subDivs instanceof Map) subDivs = Object.fromEntries(subDivs);
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
            }
          }
        }
        if (changed) {
          await fac.save(writeOpts);
        }
      }

      // 5. Year-scoped Timetable delete/reassign (never deletes or modifies historical years)
      for (const sem of targetSemesters) {
        const fallbackDoc = await Timetable.findOne({ academicYear: cleanYear, semester: sem, division: effectiveFallback })
          .setOptions(writeOpts);
        if (fallbackDoc) {
          await Timetable.deleteMany({ academicYear: cleanYear, semester: sem, division: oldDivRegex }, writeOpts);
        } else {
          await Timetable.updateMany(
            { academicYear: cleanYear, semester: sem, division: oldDivRegex },
            { $set: { division: effectiveFallback } },
            writeOpts
          );
        }
      }

      // 6-7. Year-scoped & courseYear-scoped collection reassignments
      await Attendance.updateMany(
        {
          academicYear: cleanYear,
          division: oldDivRegex,
          $or: [{ courseYear: { $in: targetYears } }, { semester: { $in: targetSemesters } }]
        },
        { $set: { division: effectiveFallback } },
        writeOpts
      );

      const candidateAsgnsDel = await Assignment.find({ academicYear: cleanYear, targetDivision: oldDivRegex })
        .setOptions(writeOpts).select("_id subject courseYear semester").lean();
      const asgnIdsToReassign = candidateAsgnsDel.filter(a => isRecordInCourseYearScope(a)).map(a => a._id);
      if (asgnIdsToReassign.length > 0) {
        await Assignment.updateMany({ _id: { $in: asgnIdsToReassign }, academicYear: cleanYear }, { $set: { targetDivision: "All Divisions" } }, writeOpts);
      }

      const candidateNotesDel = await Note.find({ academicYear: cleanYear, division: oldDivRegex })
        .setOptions(writeOpts).select("_id subject courseYear semester").lean();
      const noteIdsToReassign = candidateNotesDel.filter(n => isRecordInCourseYearScope(n)).map(n => n._id);
      if (noteIdsToReassign.length > 0) {
        await Note.updateMany({ _id: { $in: noteIdsToReassign }, academicYear: cleanYear }, { $set: { division: "All Divisions" } }, writeOpts);
      }

      const candidateNoticesDel = await Notice.find({ academicYear: cleanYear, targetDivision: oldDivRegex })
        .setOptions(writeOpts).select("_id targetSemester").lean();
      const noticeIdsToReassign = candidateNoticesDel.filter(n => isRecordInCourseYearScope(n, { isNotice: true })).map(n => n._id);
      if (noticeIdsToReassign.length > 0) {
        await Notice.updateMany({ _id: { $in: noticeIdsToReassign }, academicYear: cleanYear }, { $set: { targetDivision: "all" } }, writeOpts);
      }

      return {
        earlyResponse: null,
        status: 200,
        body: {
          success: true,
          academicYear: cleanYear,
          message: `Division '${cleanOldDiv}' deleted cleanly for academic year '${cleanYear}'; active-year records reassigned to '${effectiveFallback}'.`,
          divisions: currentDivs
        }
      };
    };

    const outcome = await academicYearService.runWithYearMutationGuard(async () => {
      if (academicYearService.isTransactionSupported()) {
        const session = await mongoose.startSession();
        let txResult = null;
        try {
          await session.withTransaction(async () => {
            txResult = null;
            txResult = await executeCascade(session);
          });
        } finally {
          await session.endSession();
        }
        return txResult;
      }

      // Standalone topology: validate year & inputs read-only first, then fail closed 503 BEFORE any persistent write
      const standaloneYearCheck = await validateAcademicYearOperationalForWrite(requestedYear, {
        session: null,
        bumpEpoch: false,
        actionLabel: "Division cascade"
      });
      if (!standaloneYearCheck.valid) {
        return {
          earlyResponse: {
            status: standaloneYearCheck.status,
            body: { success: false, code: standaloneYearCheck.code, message: standaloneYearCheck.message }
          }
        };
      }
      return {
        earlyResponse: {
          status: 503,
          body: {
            success: false,
            code: "TRANSACTIONS_REQUIRED",
            atomicTransactionsSupported: false,
            message: "Division cascade rejected: Multi-collection cascade requires a transaction-capable MongoDB deployment (replica set or sharded cluster)."
          }
        }
      };
    });

    if (outcome?.earlyResponse) {
      return res.status(outcome.earlyResponse.status).json(outcome.earlyResponse.body);
    }

    fileSyncService.triggerSync();
    return res.status(outcome.status || 200).json(outcome.body);
  } catch (err) {
    console.error("Division cascade error:", err);
    res.status(500).json({ success: false, message: "Failed to cascade division change." });
  }
});

// ============================================================================
// COURSES & SYLLABUS MANAGEMENT API (Admin + Student/Faculty + PDF)
// ============================================================================

const COURSE_YEAR_METADATA = [
  {
    yearLevel: 1,
    yearTitle: "First Year BCA",
    semesterLabel: "Semester I & II",
    semesters: [1, 2],
    semester: 1
  },
  {
    yearLevel: 2,
    yearTitle: "Second Year BCA",
    semesterLabel: "Semester III & IV",
    semesters: [3, 4],
    semester: 2
  },
  {
    yearLevel: 3,
    yearTitle: "Third Year BCA",
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

  const courseMeta = COURSE_YEAR_METADATA.find(m => m.yearLevel === doc.yearLevel) || {};

  return {
    yearLevel: doc.yearLevel,
    yearTitle: doc.yearTitle || courseMeta.yearTitle || `Year ${doc.yearLevel} BCA`,
    academicYear: doc.academicYear || "",
    semesterLabel: doc.semesterLabel || courseMeta.semesterLabel || "",
    semesters: courseMeta.semesters || [],
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

// GET /api/syllabus - Returns 3 year cards syllabus metadata dynamically scoped by academicYear
app.get("/api/syllabus", async (req, res) => {
  try {
    const requestedYear = req.query.academicYear ? stripHtmlTags(String(req.query.academicYear)).trim() : "";
    const activeCode = await academicYearService.getActiveYearCode();
    const targetAcademicYear = requestedYear || activeCode || "";

    const query = {};
    if (targetAcademicYear) {
      query.academicYear = targetAcademicYear;
    }
    const docs = targetAcademicYear ? await Syllabus.find(query).lean() : [];
    const docMap = new Map();
    for (const d of docs) {
      docMap.set(d.yearLevel, d);
    }

    const syllabi = COURSE_YEAR_METADATA.map(meta => {
      const existing = docMap.get(meta.yearLevel);
      if (existing) {
        return {
          ...meta,
          academicYear: existing.academicYear || targetAcademicYear,
          ...formatSyllabus(existing)
        };
      }
      return {
        ...meta,
        academicYear: targetAcademicYear,
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
      syllabi,
      activeAcademicYear: activeCode,
      selectedAcademicYear: targetAcademicYear
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

      const courseMeta = COURSE_YEAR_METADATA.find(m => m.yearLevel === yearLevel);
      if (!courseMeta) {
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

      const targetAcademicYear = req.body.academicYear
        ? stripHtmlTags(String(req.body.academicYear).trim())
        : (await academicYearService.getActiveYearCode());

      if (!targetAcademicYear) {
        if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
        return res.status(400).json({
          success: false,
          message: "An academic year must be specified or an active academic year must be configured before uploading syllabus."
        });
      }

      let existing = await Syllabus.findOne({ yearLevel, academicYear: targetAcademicYear });
      let oldPathToDelete = null;

      if (existing) {
        oldPathToDelete = existing.storagePath;
        existing.yearTitle = courseMeta.yearTitle;
        existing.academicYear = targetAcademicYear;
        existing.semesterLabel = courseMeta.semesterLabel;
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
          yearTitle: courseMeta.yearTitle,
          academicYear: targetAcademicYear,
          semesterLabel: courseMeta.semesterLabel,
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

      const courseMeta = COURSE_YEAR_METADATA.find(m => m.yearLevel === yearLevel);
      if (!courseMeta) {
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

      const targetAcademicYear = req.body.academicYear
        ? stripHtmlTags(String(req.body.academicYear).trim())
        : (await academicYearService.getActiveYearCode());

      if (!targetAcademicYear) {
        if (fs.existsSync(uploadedFilePath)) fs.unlinkSync(uploadedFilePath);
        return res.status(400).json({
          success: false,
          message: "An academic year must be specified or an active academic year must be configured before replacing syllabus."
        });
      }

      let existing = await Syllabus.findOne({ yearLevel, academicYear: targetAcademicYear });
      let oldPathToDelete = null;

      if (existing) {
        oldPathToDelete = existing.storagePath;
        existing.yearTitle = courseMeta.yearTitle;
        existing.academicYear = targetAcademicYear;
        existing.semesterLabel = courseMeta.semesterLabel;
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
          yearTitle: courseMeta.yearTitle,
          academicYear: targetAcademicYear,
          semesterLabel: courseMeta.semesterLabel,
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
        message: `${courseMeta.yearTitle} syllabus replaced successfully.`,
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

    const targetAcademicYear = req.query.academicYear
      ? stripHtmlTags(String(req.query.academicYear)).trim()
      : (await academicYearService.getActiveYearCode());

    const query = { yearLevel };
    if (targetAcademicYear) {
      query.academicYear = targetAcademicYear;
    }

    const doc = await Syllabus.findOne(query);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `Syllabus not found for Year ${yearLevel}${targetAcademicYear ? ` in academic year ${targetAcademicYear}` : ""}.`
      });
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
app.getFacultyAuthorizedScope = getFacultyAuthorizedScope;
app.isFacultyAuthorizedForTimetable = isFacultyAuthorizedForTimetable;
app.canFacultySetSubject = canFacultySetSubject;
app.validateFacultyAttendanceAuthorization = validateFacultyAttendanceAuthorization;

module.exports = app;

