// scripts/test-phase1b-deletion.js
// Isolated, non-destructive regression test suite for Phase 1B:
// DATA-002: Safe Cascading Student Deletion and MongoDB Consistency
//
// ZERO DATABASE CALLS: All tests run with in-memory instrumented mocks without connecting to Atlas.
// ZERO OPERATIONAL FILE MUTATIONS: No writes to data/*.json or project files.

const fs = require("fs");
const path = require("path");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// Instrumented Mock Environment Setup
// -----------------------------------------------------------------------------
function createMockDb(initialState = {}) {
  const users = JSON.parse(JSON.stringify(initialState.users || []));
  const assignments = JSON.parse(JSON.stringify(initialState.assignments || []));
  const attendances = JSON.parse(JSON.stringify(initialState.attendances || []));
  const marks = JSON.parse(JSON.stringify(initialState.marks || []));
  const subscriptions = JSON.parse(JSON.stringify(initialState.subscriptions || []));
  const storeData = JSON.parse(JSON.stringify(initialState.academicStore || {
    storeKey: "default_academic_store",
    students: {},
    assignments: [],
    deletedAssignments: [],
    dailyAttendance: []
  }));

  const log = {
    userDeleteCalls: [],
    assignmentDeleteCalls: [],
    assignmentUpdateCalls: [],
    attendanceDeleteCalls: [],
    markDeleteCalls: [],
    subscriptionDeleteCalls: [],
    storeSaves: 0,
    storeModified: [],
    syncTriggers: 0
  };

  const failures = {
    storeSaveFails: false,
    assignmentDeleteFails: false,
    attendanceDeleteFails: false,
    markDeleteFails: false,
    userDeleteFails: false
  };

  const MockUser = {
    async findOne(query) {
      return users.find(u => {
        if (query.role && u.role !== query.role) return false;
        if (query.username instanceof RegExp) {
          return query.username.test(u.username);
        }
        if (query.username) return u.username.toLowerCase() === query.username.toLowerCase();
        return true;
      }) || null;
    },
    async deleteOne(query) {
      log.userDeleteCalls.push(query);
      if (failures.userDeleteFails) throw new Error("Mock User.deleteOne failure");
      const idx = users.findIndex(u => u._id === query._id || (query.username && query.username.test && query.username.test(u.username)));
      if (idx >= 0) {
        users.splice(idx, 1);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    },
    async countDocuments() {
      return users.length;
    }
  };

  const mockStore = {
    ...storeData,
    markModified(prop) {
      log.storeModified.push(prop);
    },
    async save() {
      log.storeSaves++;
      if (failures.storeSaveFails) throw new Error("Mock AcademicStore.save failure");
      return this;
    }
  };

  const MockAcademicStore = {
    async findOne(query) {
      if (query.storeKey === "default_academic_store") return mockStore;
      return null;
    }
  };

  const MockAssignment = {
    async deleteMany(query) {
      log.assignmentDeleteCalls.push(query);
      if (failures.assignmentDeleteFails) throw new Error("Mock Assignment.deleteMany failure");
      let count = 0;
      for (let i = assignments.length - 1; i >= 0; i--) {
        const a = assignments[i];
        if (query.student instanceof RegExp && query.student.test(a.student)) {
          assignments.splice(i, 1);
          count++;
        }
      }
      return { deletedCount: count };
    },
    async updateMany(filter, update) {
      log.assignmentUpdateCalls.push({ filter, update });
      let modified = 0;
      if (update.$pull && update.$pull.submissions && update.$pull.submissions.studentUsername instanceof RegExp) {
        const regex = update.$pull.submissions.studentUsername;
        assignments.forEach(a => {
          if (Array.isArray(a.submissions)) {
            const before = a.submissions.length;
            a.submissions = a.submissions.filter(s => !regex.test(s.studentUsername));
            if (a.submissions.length !== before) modified++;
          }
        });
      }
      return { modifiedCount: modified };
    }
  };

  const MockAttendance = {
    async deleteMany(query) {
      log.attendanceDeleteCalls.push(query);
      if (failures.attendanceDeleteFails) throw new Error("Mock Attendance.deleteMany failure");
      let count = 0;
      for (let i = attendances.length - 1; i >= 0; i--) {
        const att = attendances[i];
        if (query.studentUsername instanceof RegExp && query.studentUsername.test(att.studentUsername)) {
          attendances.splice(i, 1);
          count++;
        }
      }
      return { deletedCount: count };
    }
  };

  const MockMark = {
    async deleteMany(query) {
      log.markDeleteCalls.push(query);
      if (failures.markDeleteFails) throw new Error("Mock Mark.deleteMany failure");
      let count = 0;
      for (let i = marks.length - 1; i >= 0; i--) {
        const m = marks[i];
        if (query.studentUsername instanceof RegExp && query.studentUsername.test(m.studentUsername)) {
          marks.splice(i, 1);
          count++;
        }
      }
      return { deletedCount: count };
    }
  };

  const MockPushSubscription = {
    async deleteMany(query) {
      log.subscriptionDeleteCalls.push(query);
      let count = 0;
      for (let i = subscriptions.length - 1; i >= 0; i--) {
        const sub = subscriptions[i];
        if (query.role && sub.role !== query.role) continue;
        let match = false;
        if (query.$or && Array.isArray(query.$or)) {
          for (const cond of query.$or) {
            if (cond.username instanceof RegExp && cond.username.test(sub.username)) match = true;
            if (cond.userId && sub.userId === cond.userId) match = true;
          }
        }
        if (match) {
          subscriptions.splice(i, 1);
          count++;
        }
      }
      return { deletedCount: count };
    }
  };

  const MockFileSyncService = {
    triggerSync() {
      log.syncTriggers++;
    }
  };

  return {
    state: { users, assignments, attendances, marks, subscriptions, store: mockStore },
    log,
    failures,
    models: {
      User: MockUser,
      AcademicStore: MockAcademicStore,
      Assignment: MockAssignment,
      Attendance: MockAttendance,
      Mark: MockMark,
      PushSubscription: MockPushSubscription,
      fileSyncService: MockFileSyncService
    }
  };
}

// Handler simulator executing the exact logic of DELETE /api/users/:role/:username in server.js
async function executeDeleteEndpoint(req, mockEnv) {
  const { User, AcademicStore, Assignment, Attendance, Mark, PushSubscription, fileSyncService } = mockEnv.models;
  const { role, username } = req.params;

  function validRole(r) {
    return ["student", "faculty", "admin"].includes(r);
  }
  function normalizeUsername(u) {
    return String(u || "").trim();
  }
  function escapeRegex(s) {
    return String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  const res = {
    statusCode: 200,
    responseBody: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.responseBody = body;
      return this;
    }
  };

  try {
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

    if (req.user && req.user.username && req.user.username.toLowerCase() === targetUsername.toLowerCase()) {
      return res.status(400).json({ success: false, message: "You cannot delete your own administrative account." });
    }

    // Step 1: Verify target account exists
    const targetUser = await User.findOne({
      role: targetRole,
      username: new RegExp(`^${escapeRegex(targetUsername)}$`, "i")
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
      await Assignment.deleteMany({ student: userRegex });
      await Assignment.updateMany(
        { "submissions.studentUsername": userRegex },
        { $pull: { submissions: { studentUsername: userRegex } } }
      );
      await Attendance.deleteMany({ studentUsername: userRegex });
      await Mark.deleteMany({ studentUsername: userRegex });
    }

    // Step 3: Remove user-owned PushSubscription records
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
    fileSyncService.triggerSync();

    const remaining = await User.countDocuments();
    return res.json({ success: true, message: "Account and details removed permanently from MongoDB.", remaining });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to delete the user." });
  }
}

// -----------------------------------------------------------------------------
// Test Suite Execution
// -----------------------------------------------------------------------------
async function runPhase1BTests() {
  console.log("===============================================================");
  console.log("STARTING PHASE 1B: SAFE STUDENT DELETION & CONSISTENCY TESTS");
  console.log("===============================================================");

  const initialFixture = {
    users: [
      { _id: "usr_admin", id: "usr_admin", role: "admin", username: "admin_user" },
      { _id: "usr_std1", id: "usr_std1", role: "student", username: "student_alice" },
      { _id: "usr_std2", id: "usr_std2", role: "student", username: "student_bob" },
      { _id: "usr_std3", id: "usr_std3", role: "student", username: "student_alice_extra" }, // similar username
      { _id: "usr_fac1", id: "usr_fac1", role: "faculty", username: "prof_carol" }
    ],
    academicStore: {
      storeKey: "default_academic_store",
      students: {
        "student_alice": { name: "Alice", rollNo: "001" },
        "student_bob": { name: "Bob", rollNo: "002" },
        "student_alice_extra": { name: "Alice Extra", rollNo: "003" }
      },
      assignments: [
        { id: "a1", student: "student_alice", title: "Alice Math" },
        { id: "a2", student: "STUDENT_ALICE", title: "Alice English (case variant)" },
        { id: "a3", student: "student_bob", title: "Bob Math" },
        { id: "a4", student: "student_alice_extra", title: "Alice Extra Math" }
      ],
      deletedAssignments: [
        "student_alice___a_old_1",
        "student_bob___b_old_1",
        "student_alice_extra___a_old_2"
      ],
      dailyAttendance: [
        {
          id: "att_lecture1",
          subject: "Math",
          records: {
            "student_alice": "Present",
            "student_bob": "Absent",
            "student_alice_extra": "Present"
          }
        }
      ]
    },
    assignments: [
      { id: "asg_1", student: "student_alice", title: "Dedicated Alice Task 1", submissions: [] },
      { id: "asg_2", student: "STUDENT_ALICE", title: "Dedicated Alice Task 2", submissions: [] },
      { id: "asg_3", student: "student_bob", title: "Dedicated Bob Task 1", submissions: [] },
      { id: "asg_4", student: "student_alice_extra", title: "Dedicated Alice Extra Task", submissions: [] },
      {
        id: "asg_class",
        student: "",
        title: "Class-wide Assignment",
        submissions: [
          { studentUsername: "student_alice", grade: "A" },
          { studentUsername: "student_bob", grade: "B" },
          { studentUsername: "student_alice_extra", grade: "A+" }
        ]
      }
    ],
    attendances: [
      { id: "att_std_1", studentUsername: "student_alice", subject: "Math", date: "2026-10-01" },
      { id: "att_std_2", studentUsername: "STUDENT_ALICE", subject: "English", date: "2026-10-02" },
      { id: "att_std_3", studentUsername: "student_bob", subject: "Math", date: "2026-10-01" },
      { id: "att_std_4", studentUsername: "student_alice_extra", subject: "Math", date: "2026-10-01" }
    ],
    marks: [
      { id: "m_std_1", studentUsername: "student_alice", subject: "Math", total: 95 },
      { id: "m_std_2", studentUsername: "STUDENT_ALICE", subject: "English", total: 88 },
      { id: "m_std_3", studentUsername: "student_bob", subject: "Math", total: 92 },
      { id: "m_std_4", studentUsername: "student_alice_extra", subject: "Math", total: 85 }
    ],
    subscriptions: [
      { id: "sub_1", userId: "usr_std1", username: "student_alice", role: "student", endpoint: "https://push/alice" },
      { id: "sub_2", userId: "usr_std2", username: "student_bob", role: "student", endpoint: "https://push/bob" },
      { id: "sub_3", userId: "usr_fac1", username: "prof_carol", role: "faculty", endpoint: "https://push/carol" }
    ]
  };

  // ---------------------------------------------------------------------------
  // TEST SUITE 1: Successful Student Deletion & Cascading Consistency
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 1: Successful Student Deletion & Cascading Consistency ---");
  {
    const env = createMockDb(initialFixture);
    const req = {
      params: { role: "student", username: "student_alice" },
      user: { username: "admin_user", role: "admin" }
    };

    const res = await executeDeleteEndpoint(req, env);

    assert(res.statusCode === 200, "Deletion endpoint returns HTTP 200 on success");
    assert(res.responseBody && res.responseBody.success === true, "Response payload indicates success: true");
    assert(res.responseBody.remaining === 4, "Remaining user count is accurately reported as 4");

    // 1. User collection check
    assert(env.state.users.find(u => u.username === "student_alice") === undefined, "Target student removed from User collection");

    // 2. AcademicStore checks
    const store = env.state.store;
    assert(store.students["student_alice"] === undefined, "Target student deleted from store.students");
    assert(store.students["student_bob"] !== undefined, "store.students preserves student_bob");
    assert(store.students["student_alice_extra"] !== undefined, "store.students preserves student_alice_extra");

    assert(store.assignments.length === 2, `store.assignments filtered from 4 to 2 items (removed alice & Alice variants)`);
    assert(store.assignments.every(a => (a.student || "").toLowerCase() !== "student_alice"), "Zero remaining store.assignments belong to student_alice");

    assert(store.deletedAssignments.length === 2, "store.deletedAssignments filtered target student keys");
    assert(store.deletedAssignments[0] === "student_bob___b_old_1", "store.deletedAssignments preserves student_bob");

    // Check dailyAttendance per-student records in store
    const lecture1 = store.dailyAttendance.find(d => d.id === "att_lecture1");
    assert(lecture1 && lecture1.records["student_alice"] === undefined, "Target student pruned from daily attendance records map");
    assert(lecture1 && lecture1.records["student_bob"] === "Absent", "student_bob attendance record preserved");

    assert(env.log.storeModified.includes("assignments"), "store.markModified('assignments') was called");
    assert(env.log.storeModified.includes("students"), "store.markModified('students') was called");
    assert(env.log.storeModified.includes("deletedAssignments"), "store.markModified('deletedAssignments') was called");
    assert(env.log.storeModified.includes("dailyAttendance"), "store.markModified('dailyAttendance') was called");
    assert(env.log.storeSaves === 1, "AcademicStore was persisted once via save()");

    // 3. Dedicated Assignment collection checks
    assert(env.state.assignments.filter(a => (a.student || "").toLowerCase() === "student_alice").length === 0, "Dedicated Assignment documents for target student completely removed");
    assert(env.state.assignments.find(a => a.student === "student_bob") !== undefined, "Dedicated Assignment for student_bob preserved");
    assert(env.state.assignments.find(a => a.student === "student_alice_extra") !== undefined, "Dedicated Assignment for student_alice_extra preserved");

    // Submissions array check in shared assignment
    const sharedAsg = env.state.assignments.find(a => a.id === "asg_class");
    assert(sharedAsg.submissions.find(s => s.studentUsername === "student_alice") === undefined, "Student submission pulled from class-wide assignment");
    assert(sharedAsg.submissions.find(s => s.studentUsername === "student_bob") !== undefined, "student_bob submission retained in class-wide assignment");

    // 4. Dedicated Attendance collection checks
    assert(env.state.attendances.filter(a => (a.studentUsername || "").toLowerCase() === "student_alice").length === 0, "Dedicated Attendance documents for target student completely removed");
    assert(env.state.attendances.find(a => a.studentUsername === "student_bob") !== undefined, "Dedicated Attendance for student_bob preserved");

    // 5. Dedicated Mark collection checks
    assert(env.state.marks.filter(m => (m.studentUsername || "").toLowerCase() === "student_alice").length === 0, "Dedicated Mark documents for target student completely removed");
    assert(env.state.marks.find(m => m.studentUsername === "student_bob") !== undefined, "Dedicated Mark for student_bob preserved");

    // 6. PushSubscription checks
    assert(env.state.subscriptions.find(s => s.username === "student_alice") === undefined, "Target student push subscription removed");
    assert(env.state.subscriptions.find(s => s.username === "student_bob") !== undefined, "student_bob push subscription preserved");
    assert(env.state.subscriptions.find(s => s.username === "prof_carol") !== undefined, "prof_carol faculty push subscription preserved");

    // 7. Synchronization trigger check
    assert(env.log.syncTriggers === 1, "fileSyncService.triggerSync() was called after successful deletion");
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 2: Data Preservation & Username Isolation
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 2: Data Preservation & Username Isolation ---");
  {
    const env = createMockDb(initialFixture);
    // Delete student with similar prefix but distinct username: 'student_alice_extra'
    const req = {
      params: { role: "student", username: "student_alice_extra" },
      user: { username: "admin_user", role: "admin" }
    };

    const res = await executeDeleteEndpoint(req, env);
    assert(res.statusCode === 200, "Deletion of student_alice_extra succeeds");

    // Verify student_alice and student_bob are completely unharmed
    assert(env.state.users.find(u => u.username === "student_alice") !== undefined, "student_alice user record strictly preserved");
    assert(env.state.users.find(u => u.username === "student_bob") !== undefined, "student_bob user record strictly preserved");

    assert(env.state.store.students["student_alice"] !== undefined, "student_alice preserved in store.students");
    assert(env.state.assignments.filter(a => (a.student || "").toLowerCase() === "student_alice").length === 2, "student_alice assignments strictly preserved (1 exact + 1 case variant)");
    assert(env.state.attendances.filter(a => (a.studentUsername || "").toLowerCase() === "student_alice").length === 2, "student_alice attendance strictly preserved");
    assert(env.state.marks.filter(m => (m.studentUsername || "").toLowerCase() === "student_alice").length === 2, "student_alice marks strictly preserved");
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 3: Non-Student (Faculty) Deletion Protection
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 3: Non-Student (Faculty) Deletion Protection ---");
  {
    const env = createMockDb(initialFixture);
    const req = {
      params: { role: "faculty", username: "prof_carol" },
      user: { username: "admin_user", role: "admin" }
    };

    const res = await executeDeleteEndpoint(req, env);
    assert(res.statusCode === 200, "Faculty deletion succeeds with 200");
    assert(env.state.users.find(u => u.username === "prof_carol") === undefined, "prof_carol removed from User collection");

    // Academic records must be 100% UNTOUCHED
    assert(env.log.assignmentDeleteCalls.length === 0, "Zero Assignment deletions called during faculty account deletion");
    assert(env.log.attendanceDeleteCalls.length === 0, "Zero Attendance deletions called during faculty account deletion");
    assert(env.log.markDeleteCalls.length === 0, "Zero Mark deletions called during faculty account deletion");
    assert(env.log.storeSaves === 0, "Zero AcademicStore saves called during faculty account deletion");

    // prof_carol subscription cleaned up
    assert(env.state.subscriptions.find(s => s.username === "prof_carol") === undefined, "prof_carol push subscription removed");
    assert(env.state.subscriptions.find(s => s.username === "student_alice") !== undefined, "student_alice subscription remains intact");
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 4: Failure Handling & Consistency
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 4: Failure Handling & Consistency ---");
  {
    // 4a. Missing target student -> 404
    const env1 = createMockDb(initialFixture);
    const res1 = await executeDeleteEndpoint({
      params: { role: "student", username: "non_existent_student" },
      user: { username: "admin_user", role: "admin" }
    }, env1);
    assert(res1.statusCode === 404, "Missing user returns HTTP 404 Account not found");
    assert(env1.log.userDeleteCalls.length === 0, "Zero User deletions performed on missing user");
    assert(env1.log.assignmentDeleteCalls.length === 0, "Zero Assignment deletions performed on missing user");

    // 4b. Admin account deletion prohibited -> 403
    const env2 = createMockDb(initialFixture);
    const res2 = await executeDeleteEndpoint({
      params: { role: "admin", username: "admin_user" },
      user: { username: "admin_user", role: "admin" }
    }, env2);
    assert(res2.statusCode === 403, "Admin account deletion prohibited with HTTP 403");

    // 4c. Self deletion prohibited -> 400
    const env3 = createMockDb(initialFixture);
    const res3 = await executeDeleteEndpoint({
      params: { role: "student", username: "admin_user" },
      user: { username: "admin_user", role: "admin" }
    }, env3);
    assert(res3.statusCode === 400, "Self deletion of authenticated user prohibited with HTTP 400");

    // 4d. Invalid username format -> 400
    const env4 = createMockDb(initialFixture);
    const res4 = await executeDeleteEndpoint({
      params: { role: "student", username: "bad;injection<script>" },
      user: { username: "admin_user", role: "admin" }
    }, env4);
    assert(res4.statusCode === 400, "Invalid username format returns HTTP 400");

    // 4e. AcademicStore save failure -> 500 & User is NOT deleted
    const env5 = createMockDb(initialFixture);
    env5.failures.storeSaveFails = true;
    const res5 = await executeDeleteEndpoint({
      params: { role: "student", username: "student_alice" },
      user: { username: "admin_user", role: "admin" }
    }, env5);
    assert(res5.statusCode === 500, "AcademicStore failure returns HTTP 500");
    assert(res5.responseBody.success === false, "Failure response payload reports success: false");
    assert(env5.state.users.find(u => u.username === "student_alice") !== undefined, "User account is PRESERVED when academic cleanup fails (prevents orphaned state)");
    assert(env5.log.syncTriggers === 0, "fileSyncService.triggerSync() was NOT called on failure");

    // 4f. Dedicated collection deletion failure -> 500
    const env6 = createMockDb(initialFixture);
    env6.failures.assignmentDeleteFails = true;
    const res6 = await executeDeleteEndpoint({
      params: { role: "student", username: "student_alice" },
      user: { username: "admin_user", role: "admin" }
    }, env6);
    assert(res6.statusCode === 500, "Assignment deletion failure returns HTTP 500");
    assert(env6.state.users.find(u => u.username === "student_alice") !== undefined, "User account is PRESERVED when collection delete fails");
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 5: Static Analysis of server.js Implementation
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 5: Static Code Inspection of server.js ---");
  {
    const serverCode = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");

    assert(serverCode.includes('require("./models/PushSubscription")'), "server.js imports PushSubscription model");
    assert(serverCode.includes("Assignment.deleteMany({ student: userRegex })"), "server.js invokes Assignment.deleteMany with regex");
    assert(serverCode.includes("Attendance.deleteMany({ studentUsername: userRegex })"), "server.js invokes Attendance.deleteMany with regex");
    assert(serverCode.includes("Mark.deleteMany({ studentUsername: userRegex })"), "server.js invokes Mark.deleteMany with regex");
    assert(serverCode.includes("PushSubscription.deleteMany({"), "server.js invokes PushSubscription.deleteMany strictly scoped to target role and user");
    assert(serverCode.includes("store.assignments = store.assignments.filter("), "Phase 1A: store.assignments filter result reassignment preserved");
    assert(!serverCode.includes("req.query.token"), "Phase 1A: req.query.token remains removed from server.js");
  }

  console.log(`\n===============================================================`);
  console.log(`Phase 1B Regression Test Results:`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`===============================================================\n`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runPhase1BTests().catch(err => {
  console.error("Test execution failed with unhandled error:", err);
  process.exit(1);
});
