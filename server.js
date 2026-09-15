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



app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Favicon handler
app.get("/favicon.ico", (req, res) => res.sendFile(path.join(__dirname, "favicon.ico")));

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


const scryptAsync = promisify(crypto.scrypt);

function sanitizeUser(user) {
  if (!user) return null;
  const doc = typeof user.toPublicJSON === "function" ? user.toPublicJSON() : (user.toObject ? user.toObject() : { ...user });
  delete doc.passwordHash;
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
    const users = await User.find({});
    res.json({
      success: true,
      users: users.map(sanitizeUser)
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Unable to fetch users." });
  }
});

app.get("/api/users/:role/:username", async (req, res) => {
  try {
    const { role, username } = req.params;
    const decodedUsername = normalizeUsername(decodeURIComponent(username));
    const user = await User.findOne({
      role: String(role).toLowerCase(),
      username: new RegExp(`^${decodedUsername}$`, "i")
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Get single user error:", error);
    res.status(500).json({ success: false, message: "Unable to fetch user." });
  }
});

app.post("/api/users/migrate", async (req, res) => {
  try {
    const incoming = req.body?.users;
    if (!incoming || typeof incoming !== "object") {
      return res.status(400).json({ success: false, message: "Invalid migration data." });
    }

    let added = 0;
    let updated = 0;

    for (const role of ["student", "faculty", "admin"]) {
      const list = Array.isArray(incoming[role]) ? incoming[role] : [];
      for (const item of list) {
        const username = normalizeUsername(item.username);
        if (!username) continue;

        const existing = await User.findOne({ role, username: new RegExp(`^${username}$`, "i") });
        if (existing) {
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
          passwordHash: item.passwordHash ? item.passwordHash : (item.password ? await hashPassword(item.password) : "")
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
    const { name, username, password, email, role, subject, subjects, subjectDivisions, department, division, semester, courseYear, course, languageChoice, mathChoice, profilePic } = req.body || {};
    const validation = validateUserFields({ name, username, email, role, subject, subjects });
    if (validation) return res.status(400).json({ success: false, message: validation });
    if (!password || String(password).length < 6) return res.status(400).json({ success: false, message: "Password must contain at least 6 characters." });

    const existingUsername = await User.findOne({ username: new RegExp(`^${normalizeUsername(username)}$`, "i") });
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
      id: createId(role),
      role,
      name: String(name).trim(),
      username: normalizeUsername(username),
      email: normalizeEmail(email),
      subject: role === "faculty" ? primarySubject : "",
      subjects: role === "faculty" ? facultySubjects : [],
      subjectDivisions: role === "faculty" && subjectDivisions && typeof subjectDivisions === "object" ? subjectDivisions : {},
      department: role === "faculty" ? String(department || "Department of Computer Science & Applications").trim() : "",
      division: role === "faculty" ? String(division || "Both Divisions").trim() : "",
      profilePic: String(profilePic || ""),
      passwordHash: await hashPassword(password)
    };

    if (role === "student") {
      userObj.division = String(division || "Div A").trim();
      userObj.semester = String(semester || "1st Semester").trim();
      userObj.courseYear = String(courseYear || "1st Year").trim();
      userObj.course = String(course || "Bachelor of Computer Applications (BCA)").trim();
      userObj.languageChoice = String(languageChoice || "Kannada").trim();
      userObj.mathChoice = String(mathChoice || "Mathematics").trim();
    }

    const createdUser = await User.create(userObj);
    invalidateUserCountsCache();
    res.status(201).json({ success: true, user: sanitizeUser(createdUser) });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ success: false, message: "Unable to save the user." });
  }
});

app.put("/api/users/:role/:username", async (req, res) => {
  try {
    const { role, username } = req.params;
    const decodedUsername = normalizeUsername(decodeURIComponent(username || ""));
    const { id, name, newUsername, password, currentPassword, email, subject, subjects, subjectDivisions, department, division, semester, courseYear, course, languageChoice, mathChoice, profilePic } = req.body || {};

    let user = await User.findOne({ role, username: new RegExp(`^${decodedUsername}$`, "i") });
    if (!user && id) {
      user = await User.findOne({ role, id: String(id) });
    }
    if (!user && newUsername) {
      user = await User.findOne({ role, username: new RegExp(`^${normalizeUsername(newUsername)}$`, "i") });
    }
    if (!user) {
      user = await User.findOne({ username: new RegExp(`^${decodedUsername}$`, "i") });
    }
    if (!user && id) {
      user = await User.findOne({ id: String(id) });
    }
    if (!user) return res.status(404).json({ success: false, message: "Account not found." });

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
      const takenUser = await User.findOne({ username: new RegExp(`^${nextUsername}$`, "i"), id: { $ne: user.id } });
      if (takenUser) return res.status(409).json({ success: false, message: "That username is already in use." });
    }

    if (nextEmail && nextEmail !== user.email) {
      const takenEmail = await User.findOne({ email: nextEmail, id: { $ne: user.id } });
      if (takenEmail) return res.status(409).json({ success: false, message: "That email address is already in use." });
    }

    user.name = String(name || user.name).trim();
    user.username = nextUsername;
    if (role !== "admin" || email !== undefined) user.email = nextEmail;
    if (profilePic !== undefined) user.profilePic = String(profilePic);

    if (role === "faculty") {
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
      if (department !== undefined) user.department = String(department).trim();
      if (division !== undefined) user.division = String(division).trim();
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
      if (currentPassword !== undefined) {
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

app.delete("/api/users/:role/:username", async (req, res) => {
  try {
    const { role, username } = req.params;
    if (role === "admin") return res.status(403).json({ success: false, message: "Admin accounts cannot be deleted here." });

    const targetRole = String(role || "").trim().toLowerCase();
    const targetUsername = normalizeUsername(decodeURIComponent(username));

    const result = await User.deleteOne({
      role: targetRole,
      username: new RegExp(`^${targetUsername}$`, "i")
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
            store.assignments = store.assignments.filter(a => (a.student || "").toLowerCase() !== targetUsername.toLowerCase());
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

app.post("/api/auth/login", async (req, res) => {
  try {
    const { role, username, password } = req.body || {};
    if (!validRole(role) || !username || !password) return res.status(400).json({ success: false, message: "Role, username and password are required." });

    const user = await User.findOne({
      role,
      username: new RegExp(`^${normalizeUsername(username)}$`, "i")
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Account not found in database." });
    }

    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await verifyPassword(password, user.passwordHash);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid username or password." });
    }

    res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Unable to sign in right now." });
  }
});


// --- Timetable Endpoints ---

app.get("/api/timetable", async (req, res) => {
  try {
    const entries = await Timetable.find({});
    res.json({ success: true, timetable: entries });
  } catch (error) {
    console.error("Fetch timetable error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch timetable." });
  }
});

app.post("/api/timetable/sync", async (req, res) => {
  try {
    const { timetable } = req.body || {};
    if (Array.isArray(timetable)) {
      await Timetable.deleteMany({});
      if (timetable.length > 0) {
        const docs = timetable.map(item => ({
          division: item.division || "Div A",
          semester: item.semester || "",
          day: item.day,
          time: item.time,
          subject: item.subject || "",
          subjectText: item.subjectText || item.subject || "Class",
          faculty: item.faculty || ""
        }));
        await Timetable.insertMany(docs);
      }
    }
    res.json({ success: true, message: "Timetable synchronized." });
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

app.get("/api/academic/data", async (req, res) => {
  try {
    let store = await AcademicStore.findOne({ storeKey: "default_academic_store" });
    if (!store) {
      store = await AcademicStore.create({ storeKey: "default_academic_store" });
    }
    res.json({
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
  } catch (error) {
    console.error("Fetch academic data error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch academic data." });
  }
});

async function syncCollectionsFromAcademicData(payload = {}) {
  try {
    // 1. Sync Notices into MongoDB 'notices' collection
    if (Array.isArray(payload.notices)) {
      await Notice.deleteMany({});
      if (payload.notices.length > 0) {
        const noticeDocs = payload.notices.map((n, idx) => ({
          noticeId: n.id || `notice-${Date.now()}-${idx}`,
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
        }));
        await Notice.insertMany(noticeDocs, { ordered: false }).catch(err => console.warn("Notice sync warning:", err.message));
      }
    }

    // 2. Sync Daily Attendance into MongoDB 'attendances' collection
    if (Array.isArray(payload.dailyAttendance)) {
      await Attendance.deleteMany({});
      if (payload.dailyAttendance.length > 0) {
        const attDocs = payload.dailyAttendance.map((a, idx) => ({
          attendanceId: a.id || `att-${Date.now()}-${idx}`,
          subject: a.subject || "",
          division: a.division || "",
          semester: a.semester || "",
          courseYear: a.courseYear || "",
          date: a.date || "",
          isoDate: a.isoDate || "",
          records: a.records || {},
          studentUsername: a.studentUsername || "",
          status: a.status || "",
          facultyUsername: a.facultyUsername || ""
        }));
        await Attendance.insertMany(attDocs, { ordered: false }).catch(err => console.warn("Attendance sync warning:", err.message));
      }
    }

    // 3. Sync Student Marks into MongoDB 'marks' collection
    if (payload.students && typeof payload.students === "object") {
      await Mark.deleteMany({});
      const markDocs = [];
      for (const [username, record] of Object.entries(payload.students)) {
        if (record && record.marks && typeof record.marks === "object") {
          for (const [subId, m] of Object.entries(record.marks)) {
            if (m && typeof m === "object") {
              markDocs.push({
                markId: `${username}_${subId}`,
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
                total: typeof m.total === "number" ? m.total : (
                  (typeof m.internal1 === "number" ? m.internal1 : 0) +
                  (typeof m.internal2 === "number" ? m.internal2 : 0) +
                  (typeof m.assignment === "number" ? m.assignment : 0)
                ),
                grade: m.grade || "",
                marksObtained: typeof m.total === "number" ? m.total : null
              });
            }
          }
        }
      }
      if (markDocs.length > 0) {
        await Mark.insertMany(markDocs, { ordered: false }).catch(err => console.warn("Mark sync warning:", err.message));
      }
    }

    // 4. Sync Assignments into MongoDB 'assignments' collection
    if (Array.isArray(payload.assignments)) {
      await Assignment.deleteMany({});
      if (payload.assignments.length > 0) {
        const assignDocs = payload.assignments.map((as, idx) => ({
          assignmentId: as.id || `assign-${Date.now()}-${idx}`,
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
        }));
        await Assignment.insertMany(assignDocs, { ordered: false }).catch(err => console.warn("Assignment sync warning:", err.message));
      }
    }

    // 5. Sync Study Notes into MongoDB 'notes' collection
    if (Array.isArray(payload.notes)) {
      await Note.deleteMany({});
      if (payload.notes.length > 0) {
        const noteDocs = payload.notes.map((n, idx) => ({
          noteId: n.id || `note-${Date.now()}-${idx}`,
          subject: n.subject || "",
          title: n.title || "Untitled Note",
          division: n.division || "All Divisions",
          fileName: n.fileName || "",
          fileData: n.fileData || "",
          uploadedBy: n.uploadedBy || "",
          uploadedByName: n.uploadedByName || "Faculty",
          date: n.date || new Date().toISOString().slice(0, 10)
        }));
        await Note.insertMany(noteDocs, { ordered: false }).catch(err => console.warn("Note sync warning:", err.message));
      }
    }

    // 6. Sync Timetable into MongoDB 'timetables' collection
    if (Array.isArray(payload.timetable)) {
      await Timetable.deleteMany({});
      if (payload.timetable.length > 0) {
        const ttDocs = payload.timetable.map(item => ({
          division: item.division || "Div A",
          semester: item.semester || "",
          day: item.day,
          time: item.time,
          subject: item.subject || "",
          subjectText: item.subjectText || item.subject || "Class",
          faculty: item.faculty || ""
        }));
        await Timetable.insertMany(ttDocs, { ordered: false }).catch(err => console.warn("Timetable sync warning:", err.message));
      }
    }
  } catch (syncErr) {
    console.warn("Collection sync helper warning:", syncErr.message);
  }
}

app.post("/api/academic/sync", async (req, res) => {
  try {
    const payload = req.body?.data || req.body || {};
    const update = {};

    if (payload.students && typeof payload.students === "object") update.students = payload.students;
    if (Array.isArray(payload.notices)) update.notices = payload.notices;
    if (Array.isArray(payload.timetable)) update.timetable = payload.timetable;
    if (payload.timetableHeader && typeof payload.timetableHeader === "object") update.timetableHeader = payload.timetableHeader;
    if (payload.customBreakRows && typeof payload.customBreakRows === "object") update.customBreakRows = payload.customBreakRows;
    if (Array.isArray(payload.assignments)) update.assignments = payload.assignments;
    if (Array.isArray(payload.notes)) update.notes = payload.notes;
    if (Array.isArray(payload.deletedAssignments)) update.deletedAssignments = payload.deletedAssignments;
    if (Array.isArray(payload.dailyAttendance)) update.dailyAttendance = payload.dailyAttendance;
    if (payload.subjectMarksConfig && typeof payload.subjectMarksConfig === "object") update.subjectMarksConfig = payload.subjectMarksConfig;
    if (Array.isArray(payload.subjects)) update.subjects = payload.subjects;
    if (payload.divisions) update.divisions = normalizeStoreDivisions(payload.divisions);

    await AcademicStore.findOneAndUpdate(
      { storeKey: "default_academic_store" },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Synchronize dedicated MongoDB collections in real-time
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
  console.log(`Database Mode: MongoDB (${MONGODB_URI})`);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});
