const webpush = require("web-push");
const mongoose = require("mongoose");
const PushSubscription = require("../models/PushSubscription");
const User = require("../models/User");

// Operational in-memory idempotency cache (expires after 24 hours, strictly operational, no inbox)
const recentDispatchedEvents = new Map();
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

function cleanupIdempotencyCache() {
  const now = Date.now();
  for (const [key, timestamp] of recentDispatchedEvents.entries()) {
    if (now - timestamp > IDEMPOTENCY_TTL_MS) {
      recentDispatchedEvents.delete(key);
    }
  }
}
const cleanupTimer = setInterval(cleanupIdempotencyCache, 60 * 60 * 1000);
if (cleanupTimer.unref) cleanupTimer.unref();

function isEventAlreadyDispatched(eventId) {
  if (!eventId) return false;
  return recentDispatchedEvents.has(eventId);
}

function recordDispatchedEvent(eventId) {
  if (!eventId) return;
  recentDispatchedEvents.set(eventId, Date.now());
}

// Subject display name mapping for professional notifications
const SUBJECT_DISPLAY_NAMES = {
  kannada: "Kannada",
  hindi: "Hindi",
  english: "English",
  maths: "Mathematics",
  accountancy: "Accountancy",
  cprog: "C Programming",
  dbms: "DBMS",
  ic: "Indian Constitution",
  clab: "C Lab",
  dbmslab: "DBMS Lab",
  oalab: "OA Lab",
  nsm: "Numerical & Statistical Methods",
  ds: "Data Structure",
  java: "Java",
  nsmlab: "NSM Lab",
  dslab: "DS Lab",
  javalab: "Java Lab",
  python: "Python",
  os: "Operating System",
  advjava: "Advance Java",
  ost: "Open Source Tool",
  evs: "Environmental Studies",
  oslab: "OS Lab",
  pythonlab: "Python Lab",
  advjavalab: "Adv.Java Lab",
  cn: "Computer Networks",
  se: "Software Engineering",
  webtech: "Web Technology",
  cnlab: "CN Lab",
  weblab: "Web Lab",
  ai: "Artificial Intelligence",
  cloud: "Cloud Computing",
  cyber: "Cyber Security",
  ailab: "AI Lab",
  cloudlab: "Cloud Lab"
};

function getSubjectDisplayName(subjectId) {
  if (!subjectId) return "Academic Course";
  const clean = String(subjectId).trim().toLowerCase();
  return SUBJECT_DISPLAY_NAMES[clean] || String(subjectId).trim();
}

function initWebPush(env = process.env) {
  const publicKey = env.VAPID_PUBLIC_KEY || "";
  const privateKey = env.VAPID_PRIVATE_KEY || "";
  const subject = env.VAPID_SUBJECT || "mailto:admin@campussphere.edu";

  if (publicKey && privateKey) {
    try {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      return true;
    } catch (err) {
      console.warn("[WebPush] Failed to initialize VAPID details:", err.message);
      return false;
    }
  }
  return false;
}

function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || "";
}

function isPushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

/**
 * Saves or updates a PushSubscription for an authenticated user.
 * Strictly derives identity from the authenticated user token (req.user).
 */
async function saveSubscription(user, subscription, userAgent = "") {
  if (!user || !user.username) {
    throw new Error("Authentication required to save push subscription.");
  }
  if (!subscription || typeof subscription !== "object") {
    throw new Error("Invalid push subscription object.");
  }
  const endpoint = String(subscription.endpoint || "").trim();
  const p256dh = String(subscription.keys?.p256dh || "").trim();
  const auth = String(subscription.keys?.auth || "").trim();

  if (!endpoint || !endpoint.startsWith("http")) {
    throw new Error("Invalid push subscription endpoint URL.");
  }
  if (!p256dh || !auth) {
    throw new Error("Missing cryptographic subscription keys (p256dh, auth).");
  }

  const doc = await PushSubscription.findOneAndUpdate(
    { endpoint },
    {
      $set: {
        userId: user.id || `user_${user.username}`,
        username: user.username,
        role: user.role || "student",
        endpoint,
        keys: { p256dh, auth },
        userAgent: String(userAgent || "").slice(0, 255)
      }
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  return doc;
}

/**
 * Removes a subscription for the authenticated user and device endpoint.
 */
async function removeSubscription(user, endpoint) {
  if (!user || !user.username || !endpoint) return false;
  const res = await PushSubscription.findOneAndDelete({
    endpoint: String(endpoint).trim(),
    username: user.username
  });
  return Boolean(res);
}

/**
 * Sends Web Push to an array of subscription records using bounded concurrency.
 * Expired / invalid subscriptions (HTTP 404 or 410 Gone) are automatically pruned.
 */
async function sendPushToSubscriptions(subscriptions, payload, options = {}) {
  if (!isPushConfigured()) {
    return { total: 0, sent: 0, failed: 0, removed: 0, skipped: true };
  }
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    return { total: 0, sent: 0, failed: 0, removed: 0 };
  }

  const CONCURRENCY_LIMIT = 10;
  let sentCount = 0;
  let failedCount = 0;
  let removedCount = 0;

  const chunks = [];
  for (let i = 0; i < subscriptions.length; i += CONCURRENCY_LIMIT) {
    chunks.push(subscriptions.slice(i, i + CONCURRENCY_LIMIT));
  }

  const payloadString = JSON.stringify(payload);
  const pushOptions = {
    TTL: options.TTL || 86400, // 24 hours default
    urgency: options.urgency || "high"
  };

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async (sub) => {
        try {
          const pushConfig = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys?.p256dh,
              auth: sub.keys?.auth
            }
          };
          await webpush.sendNotification(pushConfig, payloadString, pushOptions);
          sentCount++;
        } catch (err) {
          failedCount++;
          // HTTP 404 Not Found or 410 Gone indicates subscription has expired or revoked
          if (err.statusCode === 404 || err.statusCode === 410) {
            try {
              await PushSubscription.deleteOne({ endpoint: sub.endpoint });
              removedCount++;
            } catch (_) {}
          }
        }
      })
    );
  }

  return { total: subscriptions.length, sent: sentCount, failed: failedCount, removed: removedCount };
}

/**
 * ATTENDANCE EVENT:
 * When faculty records attendance:
 * IF student status is PRESENT: send push notification ONLY to that particular student.
 * If status is ABSENT: do NOT send a Present notification.
 * Idempotent: repeated identical save of the same session does not re-send.
 */
async function notifyAttendance({ subject, date, isoDate, attendanceId, records, singleStudent, singleStatus, prevRecords, prevSingleStatus }) {
  try {
    const presentStudents = new Set();

    // Check multiple-records map
    if (records && typeof records === "object") {
      for (const [username, status] of Object.entries(records)) {
        const norm = String(status || "").trim().toLowerCase();
        if (norm === "present" || norm === "p") {
          // Verify if state meaningfully changed from previous record
          const prevStatus = prevRecords ? String(prevRecords[username] || "").trim().toLowerCase() : "";
          const wasPresent = prevStatus === "present" || prevStatus === "p";
          if (!wasPresent) {
            presentStudents.add(username);
          }
        }
      }
    }

    // Check single-student attendance payload
    if (singleStudent && singleStatus) {
      const norm = String(singleStatus || "").trim().toLowerCase();
      if (norm === "present" || norm === "p") {
        const prevNorm = String(prevSingleStatus || "").trim().toLowerCase();
        const wasPresent = prevNorm === "present" || prevNorm === "p";
        if (!wasPresent) {
          presentStudents.add(singleStudent);
        }
      }
    }

    if (presentStudents.size === 0) {
      return { sent: 0 };
    }

    const subjectName = getSubjectDisplayName(subject);
    const dateLabel = date || isoDate || "today";

    for (const studentUsername of presentStudents) {
      const eventId = `attendance:${attendanceId || (isoDate + "_" + subject)}:${studentUsername}:present`;
      if (isEventAlreadyDispatched(eventId)) continue;
      recordDispatchedEvent(eventId);

      const subscriptions = await PushSubscription.find({
        username: new RegExp(`^${studentUsername}$`, "i"),
        role: "student"
      }).lean();

      if (subscriptions.length > 0) {
        const payload = {
          type: "attendance",
          title: "Attendance Marked",
          body: `Your attendance for ${subjectName} has been marked Present.`,
          url: "/#attendance",
          tag: `attendance-${subject}`,
          eventId
        };
        await sendPushToSubscriptions(subscriptions, payload, { urgency: "high", TTL: 43200 });
      }
    }
  } catch (err) {
    console.error("[WebPush] notifyAttendance error:", err.message);
  }
}

/**
 * MARKS EVENT:
 * When faculty adds or meaningfully updates marks for a student:
 * Send push notification ONLY to that particular student.
 */
async function notifyMarks({ studentUsername, subject, mark, prevMark }) {
  try {
    if (!studentUsername || !subject || !mark) return;

    // Check if marks are new or meaningfully updated
    const isNew = !prevMark;
    const isChanged = prevMark && (
      mark.internal1 !== prevMark.internal1 ||
      mark.internal2 !== prevMark.internal2 ||
      mark.assignment !== prevMark.assignment ||
      mark.final !== prevMark.final ||
      mark.total !== prevMark.total ||
      mark.grade !== prevMark.grade
    );

    if (!isNew && !isChanged) return;

    const markSig = `${mark.internal1 ?? ""}_${mark.internal2 ?? ""}_${mark.assignment ?? ""}_${mark.final ?? ""}_${mark.total ?? ""}`;
    const eventId = `marks:${studentUsername}:${subject}:${markSig}`;
    if (isEventAlreadyDispatched(eventId)) return;
    recordDispatchedEvent(eventId);

    const subscriptions = await PushSubscription.find({
      username: new RegExp(`^${studentUsername}$`, "i"),
      role: "student"
    }).lean();

    if (subscriptions.length > 0) {
      const subjectName = getSubjectDisplayName(subject);
      const payload = {
        type: "marks",
        title: "New Marks Available",
        body: `New marks have been added for ${subjectName}.`,
        url: "/#marks",
        tag: `marks-${subject}`,
        eventId
      };
      await sendPushToSubscriptions(subscriptions, payload, { urgency: "high", TTL: 86400 });
    }
  } catch (err) {
    console.error("[WebPush] notifyMarks error:", err.message);
  }
}

/**
 * ASSIGNMENT EVENT:
 * When faculty publishes an assignment:
 * Calculates eligible students SERVER-SIDE using semester, division, and subject rules.
 * Sends push to all eligible students' subscriptions.
 */
async function notifyAssignment(assignment) {
  try {
    if (!assignment || !assignment.id || !assignment.subject) return;

    const eventId = `assignment:${assignment.id}`;
    if (isEventAlreadyDispatched(eventId)) return;
    recordDispatchedEvent(eventId);

    const subject = String(assignment.subject || "").trim();
    const targetDivision = String(assignment.targetDivision || assignment.division || "").trim();
    const semester = String(assignment.semester || "").trim();

    // Query active students from MongoDB to calculate eligibility server-side
    const students = await User.find({ role: "student" }).lean();
    const eligibleUsernames = [];

    for (const s of students) {
      // Semester filter if specified
      if (semester && s.semester && s.semester !== semester) continue;

      // Division filter
      if (targetDivision && targetDivision !== "All Divisions" && targetDivision !== "Both Divisions") {
        const sDiv = String(s.division || "").toLowerCase();
        const tDiv = targetDivision.toLowerCase();
        const matchesDiv = sDiv === tDiv ||
          (tDiv.includes("a") && sDiv.includes("a")) ||
          (tDiv.includes("b") && sDiv.includes("b")) ||
          (tDiv.includes("c") && sDiv.includes("c"));
        if (!matchesDiv) continue;
      }

      // Language / Math choice scoping
      const subLower = subject.toLowerCase();
      if (subLower.includes("kannada") && s.languageChoice && s.languageChoice !== "Kannada") continue;
      if (subLower.includes("hindi") && s.languageChoice && s.languageChoice !== "Hindi") continue;
      if (subLower.includes("math") && s.mathChoice && s.mathChoice !== "Mathematics") continue;
      if (subLower.includes("account") && s.mathChoice && s.mathChoice !== "Accountancy") continue;

      eligibleUsernames.push(s.username);
    }

    if (eligibleUsernames.length === 0) return;

    const subscriptions = await PushSubscription.find({
      username: { $in: eligibleUsernames },
      role: "student"
    }).lean();

    if (subscriptions.length > 0) {
      const subjectName = getSubjectDisplayName(subject);
      const payload = {
        type: "assignment",
        title: "New Assignment",
        body: `A new ${subjectName} assignment has been posted: ${assignment.title || "Check details in portal"}`,
        url: "/#assignments",
        tag: `assignment-${assignment.id}`,
        eventId
      };
      await sendPushToSubscriptions(subscriptions, payload, { urgency: "high", TTL: 86400 });
    }
  } catch (err) {
    console.error("[WebPush] notifyAssignment error:", err.message);
  }
}

/**
 * STUDY NOTES EVENT:
 * When faculty publishes study notes:
 * Calculates eligible students server-side using semester and division scoping.
 */
async function notifyNote(note) {
  try {
    if (!note || !note.id || !note.subject) return;

    const eventId = `note:${note.id}`;
    if (isEventAlreadyDispatched(eventId)) return;
    recordDispatchedEvent(eventId);

    const subject = String(note.subject || "").trim();
    const division = String(note.division || "").trim();
    const semester = String(note.semester || "").trim();

    const students = await User.find({ role: "student" }).lean();
    const eligibleUsernames = [];

    for (const s of students) {
      if (semester && s.semester && s.semester !== semester) continue;

      if (division && division !== "All Divisions" && division !== "Both Divisions") {
        const sDiv = String(s.division || "").toLowerCase();
        const tDiv = division.toLowerCase();
        const matchesDiv = sDiv === tDiv ||
          (tDiv.includes("a") && sDiv.includes("a")) ||
          (tDiv.includes("b") && sDiv.includes("b")) ||
          (tDiv.includes("c") && sDiv.includes("c"));
        if (!matchesDiv) continue;
      }

      const subLower = subject.toLowerCase();
      if (subLower.includes("kannada") && s.languageChoice && s.languageChoice !== "Kannada") continue;
      if (subLower.includes("hindi") && s.languageChoice && s.languageChoice !== "Hindi") continue;
      if (subLower.includes("math") && s.mathChoice && s.mathChoice !== "Mathematics") continue;
      if (subLower.includes("account") && s.mathChoice && s.mathChoice !== "Accountancy") continue;

      eligibleUsernames.push(s.username);
    }

    if (eligibleUsernames.length === 0) return;

    const subscriptions = await PushSubscription.find({
      username: { $in: eligibleUsernames },
      role: "student"
    }).lean();

    if (subscriptions.length > 0) {
      const subjectName = getSubjectDisplayName(subject);
      const payload = {
        type: "notes",
        title: "New Study Note",
        body: `New study notes for ${subjectName} are available: ${note.title || "View in notes section"}`,
        url: "/#notes",
        tag: `notes-${note.id}`,
        eventId
      };
      await sendPushToSubscriptions(subscriptions, payload, { urgency: "high", TTL: 86400 });
    }
  } catch (err) {
    console.error("[WebPush] notifyNote error:", err.message);
  }
}

/**
 * NOTICE EVENT:
 * Faculty Notices: Target students within faculty scope (never faculty).
 * Admin Notices: Strictly enforce 3 target audience options:
 *   1. "Faculty & Students" ("all") -> sends to faculty and students
 *   2. "Faculty Only" ("faculty") -> sends ONLY to faculty (never students)
 *   3. "Students Only" ("student") -> sends ONLY to students (never faculty)
 */
async function notifyNotice(notice, authorUser) {
  try {
    if (!notice || (!notice.id && !notice.noticeId)) return;

    const noticeId = notice.id || notice.noticeId;
    const eventId = `notice:${noticeId}`;
    if (isEventAlreadyDispatched(eventId)) return;
    recordDispatchedEvent(eventId);

    const isAuthorAdmin = authorUser && authorUser.role === "admin";
    let targetRoles = [];

    if (isAuthorAdmin) {
      const targetAudience = String(notice.target || notice.targetRole || "all").toLowerCase();
      if (targetAudience === "faculty") {
        targetRoles = ["faculty"]; // Faculty Only
      } else if (targetAudience === "student" || targetAudience === "students") {
        targetRoles = ["student"]; // Students Only
      } else {
        targetRoles = ["student", "faculty"]; // Faculty & Students
      }
    } else {
      // Faculty notice: strictly student recipients only
      targetRoles = ["student"];
    }

    const subscriptions = await PushSubscription.find({
      role: { $in: targetRoles }
    }).lean();

    if (subscriptions.length > 0) {
      const authorLabel = isAuthorAdmin ? "Administration" : "Faculty";
      const payload = {
        type: "notice",
        title: "New Notice",
        body: notice.title ? String(notice.title).slice(0, 100) : `You have a new notice from ${authorLabel}.`,
        url: "/#notices",
        tag: `notice-${noticeId}`,
        eventId
      };
      await sendPushToSubscriptions(subscriptions, payload, { urgency: "high", TTL: 86400 });
    }
  } catch (err) {
    console.error("[WebPush] notifyNotice error:", err.message);
  }
}

module.exports = {
  initWebPush,
  getVapidPublicKey,
  getPublicKey: getVapidPublicKey,
  isPushConfigured,
  saveSubscription,
  removeSubscription,
  sendPushToSubscriptions,
  notifyAttendance,
  notifyMarks,
  notifyAssignment,
  notifyNote,
  notifyNotice,
  isEventAlreadyDispatched,
  recordDispatchedEvent
};
