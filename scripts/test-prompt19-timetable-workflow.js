/**
 * PROMPT 19: COMPLETE REAL-WORLD TIMETABLE WORKFLOW TEST SUITE
 *
 * Verifies the complete real-world timetable workflow from:
 * ADMIN -> FACULTY -> STUDENT
 *
 * Categories:
 * A: Database Schema & Strict Field Integrity (No Faculty/Room/Lab in cells)
 * B: Complete Split Cells Removal & Exact 4 Ribbon Formatting Tools
 * C: Fixed Monday-to-Saturday Days Enforcement (Server & UI)
 * D: Dynamic Time Slots (Add, Edit, Delete, 1-25 bounds)
 * E: Admin Full Timetable Workflow (Create, Edit, Merge, Bold, Font, Size, Save, Reload)
 * F: Faculty Assigned-Subject View & Server-Side Filtering (Identity derived from token)
 * G: Faculty Division Aggregation (Overlapping slots combined into 'Div A + Div B')
 * H: Faculty Empty State (Zero assigned subjects returns clean null/empty view)
 * I: Faculty Authorization Attacks (Unauthorized Sem, Div, Subject -> 403 Forbidden)
 * J: Faculty Peer Overwrite Protection (Overwriting peer's cell -> 403 Forbidden)
 * K: Partial-Save Attack Immunity (1 valid + 1 invalid -> 403, 0 unauthorized data persisted)
 * L: Student Read-Only Isolation & IDOR Lockdown (Server-derived profile, 403 on writes)
 * M: Student UI Cleanliness (Toolbar, Save button, and edit controls hidden)
 * N: Idempotent Non-Destructive Persistence (No deleteMany+insertMany, idempotent saves)
 * O: Cross-Division Isolation (Saving Div A never deletes or harms Div B)
 * P: Formatting & Allowlist Validation (Font family, font size, length limits)
 * Q: XSS Injection & Prototype Pollution Sanitization
 * R: Authentication & Token Verification (401 Unauthorized for unauthenticated requests)
 * S: DOM Input Commit Simulation (Active typing committed prior to payload dispatch)
 * T: Merged Cell Metadata Preservation & Rendering Integrity
 * U: PDF Export Division Resolution Integrity
 */

require("dotenv").config();
const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const TEST_PORT = 3099;
const BASE_URL = `http://localhost:${TEST_PORT}`;
let passedCount = 0;
let failedCount = 0;
let serverProcess = null;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedCount++;
  }
}

function request(method, pathName, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathName, BASE_URL);
    const payload = body ? (typeof body === "string" ? body : JSON.stringify(body)) : null;
    const reqHeaders = { ...headers };
    if (payload && !reqHeaders["Content-Type"]) {
      reqHeaders["Content-Type"] = "application/json";
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json, json });
      });
    });

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function hashPassword(pwd) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(pwd, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$16384$8$1$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`);
    });
  });
}

async function runPrompt19TestSuite() {
  console.log("==================================================");
  console.log("PROMPT 19: COMPLETE TIMETABLE WORKFLOW TEST SUITE");
  console.log("==================================================");

  // 1. Connect to MongoDB directly
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("Missing MONGODB_URI in environment.");

  while (mongoose.connection.readyState === 2) {
    await new Promise(r => setTimeout(r, 100));
  }
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongoUri, { dbName: "CampusSphere" });
  }
  console.log("Connected to MongoDB successfully for test assertions.");

  const User = require("../models/User");
  const Timetable = require("../models/Timetable");

  // 2. Start Test Server
  process.env.PORT = String(TEST_PORT);
  process.env.NODE_ENV = "test";
  serverProcess = require("../server.js");
  await new Promise(res => setTimeout(res, 1200));

  const ts = Date.now();
  const testPassword = "Password@123456";
  const pwdHash = await hashPassword(testPassword);

  const testSem = `1st Semester`;
  const testDivA = "Div A";
  const testDivB = "Div B";

  const adminUname = `admin_p19_${ts}`;
  const facAUname = `facA_p19_${ts}`;
  const facBUname = `facB_p19_${ts}`;
  const facNoSubUname = `facNoSub_p19_${ts}`;
  const studentUname = `stud_p19_${ts}`;

  // Create test accounts
  await User.create([
    {
      id: `id-${adminUname}`,
      role: "admin",
      username: adminUname,
      name: "Admin User P19",
      email: `${adminUname}@test.edu`,
      passwordHash: pwdHash
    },
    {
      id: `id-${facAUname}`,
      role: "faculty",
      username: facAUname,
      name: "Prof. Alice A (P19)",
      email: `${facAUname}@test.edu`,
      passwordHash: pwdHash,
      subject: "c_programming",
      subjects: ["c_programming"],
      subjectDivisions: { c_programming: "Both Divisions" },
      division: "Both Divisions"
    },
    {
      id: `id-${facBUname}`,
      role: "faculty",
      username: facBUname,
      name: "Prof. Bob B (P19)",
      email: `${facBUname}@test.edu`,
      passwordHash: pwdHash,
      subject: "digital_electronics",
      subjects: ["digital_electronics"],
      subjectDivisions: { digital_electronics: "Div A" },
      division: "Div A"
    },
    {
      id: `id-${facNoSubUname}`,
      role: "faculty",
      username: facNoSubUname,
      name: "Prof. Charlie NoSub (P19)",
      email: `${facNoSubUname}@test.edu`,
      passwordHash: pwdHash,
      subject: "",
      subjects: [],
      subjectDivisions: {},
      division: "Div A"
    },
    {
      id: `id-${studentUname}`,
      role: "student",
      username: studentUname,
      name: "Dave Student P19",
      email: `${studentUname}@test.edu`,
      passwordHash: pwdHash,
      semester: testSem,
      division: "Div A"
    }
  ]);

  // Login and obtain authentic tokens
  const admLogin = await request("POST", "/api/auth/login", { role: "admin", username: adminUname, password: testPassword });
  const facALogin = await request("POST", "/api/auth/login", { role: "faculty", username: facAUname, password: testPassword });
  const facBLogin = await request("POST", "/api/auth/login", { role: "faculty", username: facBUname, password: testPassword });
  const facNoSubLogin = await request("POST", "/api/auth/login", { role: "faculty", username: facNoSubUname, password: testPassword });
  const stuLogin = await request("POST", "/api/auth/login", { role: "student", username: studentUname, password: testPassword });

  const adminToken = admLogin.json?.token;
  const facultyTokenA = facALogin.json?.token;
  const facultyTokenB = facBLogin.json?.token;
  const facultyTokenNoSub = facNoSubLogin.json?.token;
  const studentToken = stuLogin.json?.token;

  const fixedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const initialSlots = ["09:00 - 10:00", "10:00 - 11:00", "11:15 - 12:15", "01:00 - 02:00"];

  const buildEmptyGrid = (daysArr, slotsArr) => {
    const cells = [];
    for (let s = 0; s < slotsArr.length; s++) {
      for (let d = 0; d < daysArr.length; d++) {
        cells.push({
          dayIndex: d,
          slotIndex: s,
          subject: "",
          bold: false,
          fontFamily: "Inter",
          fontSize: "13px",
          textAlign: "center",
          rowSpan: 1,
          colSpan: 1,
          mergedInto: null
        });
      }
    }
    return cells;
  };

  const initialCells = buildEmptyGrid(fixedDays, initialSlots);
  initialCells[0].subject = "C Programming";
  initialCells[1].subject = "Digital Electronics";

  try {
    // =========================================================================
    // CATEGORY A: DATABASE SCHEMA & FIELD INTEGRITY
    // =========================================================================
    console.log("\n--- Category A: Database Schema & Strict Field Integrity ---");
    const schemaPaths = Object.keys(Timetable.schema.paths);
    assert(schemaPaths.includes("semester") && schemaPaths.includes("division") && schemaPaths.includes("days") && schemaPaths.includes("timeSlots") && schemaPaths.includes("cells"), "1. Timetable schema has semester, division, days, timeSlots, cells");

    const cellPaths = Object.keys(Timetable.schema.paths.cells.schema.paths);
    assert(cellPaths.includes("dayIndex") && cellPaths.includes("slotIndex") && cellPaths.includes("subject") && cellPaths.includes("bold") && cellPaths.includes("fontFamily") && cellPaths.includes("fontSize") && cellPaths.includes("textAlign") && cellPaths.includes("rowSpan") && cellPaths.includes("colSpan") && cellPaths.includes("mergedInto"), "2. Cell subdocument has dayIndex, slotIndex, subject, bold, fontFamily, fontSize, textAlign, rowSpan, colSpan, mergedInto");
    assert(!cellPaths.includes("faculty") && !cellPaths.includes("room") && !cellPaths.includes("lab"), "3. Cell schema strictly excludes faculty, room, and lab fields");

    // =========================================================================
    // CATEGORY B: SPLIT CELLS REMOVAL & EXACT 4 RIBBON FORMATTING TOOLS
    // =========================================================================
    console.log("\n--- Category B: Split Cells Removal & Exact 4 Ribbon Formatting Tools ---");
    const scriptContent = fs.readFileSync(path.join(__dirname, "../script.js"), "utf8");
    assert(!scriptContent.includes('id="tbBtnSplit"'), "4. Button #tbBtnSplit completely absent from script.js HTML");
    assert(!scriptContent.includes("function splitSelectedCells"), "5. Function splitSelectedCells completely removed from script.js");
    assert(!scriptContent.includes("tbBtnSplit.addEventListener") && !scriptContent.includes("splitSelectedCells);"), "6. Split Cells event listeners absent from script.js");

    const hasMerge = scriptContent.includes('id="tbBtnMerge"');
    const hasBold = scriptContent.includes('id="tbBtnBold"');
    const hasFontFamily = scriptContent.includes('id="tbSelectFontFamily"');
    const hasFontSize = scriptContent.includes('id="tbSelectFontSize"');
    assert(hasMerge && hasBold && hasFontFamily && hasFontSize, "7. Exactly the 4 approved formatting ribbon tools are present (Merge, Bold, Font Family, Font Size)");

    const hasAlignmentButtons = scriptContent.includes('id="tbAlignLeft"') || scriptContent.includes('id="tbAlignRight"') || scriptContent.includes('id="tbAlignCenter"');
    const hasWordStyleTools = scriptContent.includes('id="tbBtnUnderline"') || scriptContent.includes('id="tbBtnItalic"') || scriptContent.includes('id="tbColorPicker"');
    assert(!hasAlignmentButtons && !hasWordStyleTools, "8. No alignment buttons and no extraneous Word-style tools in toolbar");

    // =========================================================================
    // CATEGORY C: FIXED MONDAY-TO-SATURDAY DAYS ENFORCEMENT
    // =========================================================================
    console.log("\n--- Category C: Fixed Monday-to-Saturday Days Enforcement ---");
    assert(!scriptContent.includes('id="btnAddDayCol"') && !scriptContent.includes("+ Add Day"), "9. Add Day toolbar button absent from script.js UI");
    assert(!scriptContent.includes('class="btn-delete-col"'), "10. Day column deletion buttons absent from script.js UI");

    // Server-side enforcement: rejecting Sunday
    const sundayDays = [...fixedDays, "Sunday"];
    const sundayCells = buildEmptyGrid(sundayDays, initialSlots);
    const rejectSundayRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: sundayDays,
      timeSlots: initialSlots,
      cells: sundayCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(rejectSundayRes.status === 400, "11. Server-side validation rejects payload containing Sunday with 400 Bad Request");

    // Server-side enforcement: rejecting custom days
    const customDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "CustomDay"];
    const rejectCustomDayRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: customDays,
      timeSlots: initialSlots,
      cells: initialCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(rejectCustomDayRes.status === 400, "12. Server-side validation rejects payload containing custom day with 400 Bad Request");

    // =========================================================================
    // CATEGORY D: DYNAMIC TIME SLOTS WORKFLOW
    // =========================================================================
    console.log("\n--- Category D: Dynamic Time Slots Workflow ---");
    // Seed initial timetable
    const seedRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: initialSlots,
      cells: initialCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(seedRes.status === 200 && seedRes.json?.success === true, "13. Admin seeds baseline timetable with 4 initial slots");

    // Add 5th slot
    const expandedSlots = [...initialSlots, "02:00 - 03:00"];
    const expandedCells = buildEmptyGrid(fixedDays, expandedSlots);
    expandedCells[0].subject = "C Programming";
    expandedCells[1].subject = "Digital Electronics";

    const addSlotRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: expandedSlots,
      cells: expandedCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(addSlotRes.status === 200 && addSlotRes.json?.timetable?.timeSlots?.length === 5, "14. Adding time slot row persists 5 slots to database");

    // Edit slot label
    const editedSlots = [...expandedSlots];
    editedSlots[0] = "08:30 - 09:30";
    const editSlotRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: editedSlots,
      cells: expandedCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(editSlotRes.status === 200 && editSlotRes.json?.timetable?.timeSlots[0] === "08:30 - 09:30", "15. Inline editing of time slot row label persists to database");

    // Remove slot row
    const reducedSlots = editedSlots.slice(0, 4);
    const reducedCells = expandedCells.filter(c => c.slotIndex < 4);
    const removeSlotRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: reducedCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(removeSlotRes.status === 200 && removeSlotRes.json?.timetable?.timeSlots?.length === 4, "16. Removing time slot row persists 4 slots to database");

    // Time slots out of bounds (> 25) rejected
    const excessiveSlots = Array.from({ length: 26 }, (_, i) => `Slot ${i + 1}`);
    const excessiveRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: excessiveSlots,
      cells: []
    }, { Authorization: `Bearer ${adminToken}` });
    assert(excessiveRes.status === 400, "17. Payload exceeding 25 time slots rejected with 400 Bad Request");

    // =========================================================================
    // CATEGORY E: ADMIN FULL WORKFLOW & FORMATTING
    // =========================================================================
    console.log("\n--- Category E: Admin Full Workflow & Formatting ---");
    // Admin merges cell (0, 0) and (0, 1)
    const mergedCells = JSON.parse(JSON.stringify(reducedCells));
    mergedCells[0].subject = "C Programming Lab Session";
    mergedCells[0].bold = true;
    mergedCells[0].fontFamily = "Roboto";
    mergedCells[0].fontSize = "16px";
    mergedCells[0].rowSpan = 2;
    mergedCells[0].colSpan = 1;

    // Secondary subsumed cell
    const subsumed = mergedCells.find(c => c.dayIndex === 0 && c.slotIndex === 1);
    subsumed.mergedInto = { dayIndex: 0, slotIndex: 0 };
    subsumed.rowSpan = 1;
    subsumed.colSpan = 1;

    const adminSaveRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: mergedCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(adminSaveRes.status === 200, "18. Admin saves timetable with merged and formatted cells with 200 OK");

    // Verify reload from MongoDB
    const adminReloadRes = await request("GET", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=${encodeURIComponent(testDivA)}`, null, { Authorization: `Bearer ${adminToken}` });
    const reloadedOrigin = adminReloadRes.json?.timetable?.cells?.find(c => c.dayIndex === 0 && c.slotIndex === 0);
    const reloadedSubsumed = adminReloadRes.json?.timetable?.cells?.find(c => c.dayIndex === 0 && c.slotIndex === 1);
    assert(reloadedOrigin?.subject === "C Programming Lab Session" && reloadedOrigin?.bold === true && reloadedOrigin?.fontFamily === "Roboto" && reloadedOrigin?.fontSize === "16px" && reloadedOrigin?.rowSpan === 2, "19. Reloaded timetable accurately reflects subject, bold, fontFamily, fontSize, and rowSpan");
    assert(reloadedSubsumed?.mergedInto?.dayIndex === 0 && reloadedSubsumed?.mergedInto?.slotIndex === 0, "20. Reloaded timetable accurately reflects secondary cell mergedInto pointer");

    // =========================================================================
    // CATEGORY F: FACULTY ASSIGNED-SUBJECT ISOLATION & SERVER-SIDE FILTERING
    // =========================================================================
    console.log("\n--- Category F: Faculty Assigned-Subject Isolation ---");
    // Also seed Div B where Faculty A teaches C Programming
    const divBCells = buildEmptyGrid(fixedDays, reducedSlots);
    divBCells[0].subject = "C Programming";
    await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivB,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: divBCells
    }, { Authorization: `Bearer ${adminToken}` });

    // Faculty A queries Div A: should see 'C Programming Lab Session'
    const facAGetRes = await request("GET", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=${encodeURIComponent(testDivA)}`, null, { Authorization: `Bearer ${facultyTokenA}` });
    assert(facAGetRes.status === 200, "21. Faculty A queries assigned semester/division with 200 OK");
    const facACells = facAGetRes.json?.timetable?.cells || [];
    const cProgCell = facACells.find(c => c.dayIndex === 0 && c.slotIndex === 0);
    assert(cProgCell && cProgCell.subject === "C Programming Lab Session", "22. Faculty A sees their assigned subject 'C Programming'");

    // Faculty B queries Div A: Faculty A's subject is redacted to ""
    const facBGetRes = await request("GET", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=${encodeURIComponent(testDivA)}`, null, { Authorization: `Bearer ${facultyTokenB}` });
    const facBCells = facBGetRes.json?.timetable?.cells || [];
    const redactedForB = facBCells.find(c => c.dayIndex === 0 && c.slotIndex === 0);
    assert(redactedForB && redactedForB.subject === "", "23. Server-side filtering redacts unassigned subject 'C Programming' to empty string for Faculty B");

    // =========================================================================
    // CATEGORY G: FACULTY DIVISION AGGREGATION
    // =========================================================================
    console.log("\n--- Category G: Faculty Division Aggregation ---");
    const facAViewRes = await request("GET", "/api/timetable/faculty-view", null, { Authorization: `Bearer ${facultyTokenA}` });
    const facASlots = facAViewRes.json?.facultyView || facAViewRes.json?.slots || [];
    assert(facAViewRes.status === 200 && Array.isArray(facASlots), "24. GET /api/timetable/faculty-view responds with 200 and slots array");
    const combinedSlot = facASlots.find(s => s.divisions && s.divisions.length >= 2);
    assert(combinedSlot && (combinedSlot.divisionLabel === "Div A + Div B" || combinedSlot.divisionsLabel === "Div A + Div B"), "25. Overlapping lecture slot taught across Div A and Div B is aggregated into 'Div A + Div B'");

    // =========================================================================
    // CATEGORY H: FACULTY EMPTY STATE (NO ASSIGNED SUBJECTS)
    // =========================================================================
    console.log("\n--- Category H: Faculty Empty State ---");
    const facNoneGetRes = await request("GET", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=${encodeURIComponent(testDivA)}`, null, { Authorization: `Bearer ${facultyTokenNoSub}` });
    assert(facNoneGetRes.status === 200 && (facNoneGetRes.json?.timetable === null || facNoneGetRes.json?.timetable?.cells?.every(c => !c.subject)), "26. Faculty with no assigned subjects receives empty/null timetable response safely");

    const facNoneViewRes = await request("GET", "/api/timetable/faculty-view", null, { Authorization: `Bearer ${facultyTokenNoSub}` });
    const facNoneSlots = facNoneViewRes.json?.facultyView || facNoneViewRes.json?.slots || [];
    assert(facNoneViewRes.status === 200 && Array.isArray(facNoneSlots) && facNoneSlots.length === 0, "27. Faculty with no assigned subjects receives empty slots array [] in faculty-view");

    // =========================================================================
    // CATEGORY I: FACULTY AUTHORIZATION ATTACKS & IDOR
    // =========================================================================
    console.log("\n--- Category I: Faculty Authorization Attacks & IDOR ---");
    // Faculty A attempts to save to unauthorized semester
    const facAUnauthSemRes = await request("PUT", "/api/timetable", {
      semester: "Unauthorized Semester 99",
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: reducedCells
    }, { Authorization: `Bearer ${facultyTokenA}` });
    assert(facAUnauthSemRes.status === 403, "28. Faculty attempting to write to unauthorized semester rejected with 403 Forbidden");

    // Faculty B attempts to write to unauthorized division (Div B)
    const facBUnauthDivRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivB,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: reducedCells
    }, { Authorization: `Bearer ${facultyTokenB}` });
    assert(facBUnauthDivRes.status === 403, "29. Faculty B attempting to write to unauthorized division (Div B) rejected with 403 Forbidden");

    // Faculty A attempts to schedule unassigned subject ('Digital Electronics')
    const maliciousCells = JSON.parse(JSON.stringify(reducedCells));
    maliciousCells[2].subject = "Digital Electronics";
    const facASubAttackRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: maliciousCells
    }, { Authorization: `Bearer ${facultyTokenA}` });
    assert(facASubAttackRes.status === 403, "30. Faculty A attempting to schedule unassigned subject returns 403 Forbidden");

    // =========================================================================
    // CATEGORY J: FACULTY PEER OVERWRITE PROTECTION
    // =========================================================================
    console.log("\n--- Category J: Faculty Peer Overwrite Protection ---");
    // Seed a cell owned by Faculty B in Div A at cell (1, 0)
    const seedPeerCells = JSON.parse(JSON.stringify(reducedCells));
    seedPeerCells[1].subject = "Digital Electronics";
    await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: seedPeerCells
    }, { Authorization: `Bearer ${adminToken}` });

    // Faculty A attempts to overwrite Faculty B's cell with their own subject
    const overwriteCells = JSON.parse(JSON.stringify(seedPeerCells));
    overwriteCells[1].subject = "C Programming";
    const overwriteRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: overwriteCells
    }, { Authorization: `Bearer ${facultyTokenA}` });
    assert(overwriteRes.status === 403, "31. Faculty A attempting to overwrite peer faculty's cell returns 403 Forbidden");

    // Verify database was NOT modified
    const verifyDoc = await Timetable.findOne({ semester: testSem, division: testDivA }).lean();
    const targetPeerCell = verifyDoc?.cells?.find(c => c.dayIndex === 1 && c.slotIndex === 0);
    assert(targetPeerCell?.subject === "Digital Electronics", "32. Peer faculty's subject was safely preserved in MongoDB without unauthorized mutation");

    // =========================================================================
    // CATEGORY K: PARTIAL-SAVE ATTACK IMMUNITY
    // =========================================================================
    console.log("\n--- Category K: Partial-Save Attack Immunity ---");
    // Request containing 1 valid change (C Programming on slot 2) and 1 invalid change (Physics on slot 3)
    const partialAttackCells = JSON.parse(JSON.stringify(verifyDoc.cells));
    const validChangeCell = partialAttackCells.find(c => c.dayIndex === 2 && c.slotIndex === 0);
    const invalidChangeCell = partialAttackCells.find(c => c.dayIndex === 3 && c.slotIndex === 0);
    if (validChangeCell) validChangeCell.subject = "C Programming";
    if (invalidChangeCell) invalidChangeCell.subject = "Quantum Physics";

    const partialRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: partialAttackCells
    }, { Authorization: `Bearer ${facultyTokenA}` });
    assert(partialRes.status === 403, "33. Partial-save attack containing 1 valid and 1 invalid change rejected with 403 Forbidden");

    const postPartialDoc = await Timetable.findOne({ semester: testSem, division: testDivA }).lean();
    const checkValidCell = postPartialDoc?.cells?.find(c => c.dayIndex === 2 && c.slotIndex === 0);
    const checkInvalidCell = postPartialDoc?.cells?.find(c => c.dayIndex === 3 && c.slotIndex === 0);
    assert(checkValidCell?.subject === "" && checkInvalidCell?.subject === "", "34. Database remains completely untainted: zero unauthorized or partial changes were persisted");

    // =========================================================================
    // CATEGORY L: STUDENT READ-ONLY ISOLATION & IDOR LOCKDOWN
    // =========================================================================
    console.log("\n--- Category L: Student Read-Only Isolation & IDOR Lockdown ---");
    // Student query derives semester and division strictly from authenticated profile
    const stuGetRes = await request("GET", "/api/timetable", null, { Authorization: `Bearer ${studentToken}` });
    assert(stuGetRes.status === 200 && stuGetRes.json?.semester === testSem && stuGetRes.json?.division === "Div A", "35. Student query is server-derived to authenticated profile semester and division");

    // Student tampering via query params is locked to authenticated profile
    const stuTamperRes = await request("GET", "/api/timetable?semester=OtherSem&division=DivB", null, { Authorization: `Bearer ${studentToken}` });
    assert(stuTamperRes.status === 200 && stuTamperRes.json?.semester === testSem && stuTamperRes.json?.division === "Div A", "36. Query parameter tampering by student is completely ignored/locked to profile");

    // Student write attempts return 403 Forbidden
    const stuPutRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: reducedCells
    }, { Authorization: `Bearer ${studentToken}` });
    assert(stuPutRes.status === 403, "37. Student PUT request rejected with 403 Forbidden");

    const stuPostRes = await request("POST", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: reducedCells
    }, { Authorization: `Bearer ${studentToken}` });
    assert(stuPostRes.status === 403, "38. Student POST request rejected with 403 Forbidden");

    const stuDelRes = await request("DELETE", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=${encodeURIComponent(testDivA)}`, null, { Authorization: `Bearer ${studentToken}` });
    assert(stuDelRes.status === 403, "39. Student DELETE request rejected with 403 Forbidden");

    // =========================================================================
    // CATEGORY M: STUDENT UI CLEANLINESS
    // =========================================================================
    console.log("\n--- Category M: Student UI Cleanliness ---");
    const studentHasToolbarCondition = scriptContent.includes("canEditRole ?") && scriptContent.includes("!isTimetableEditMode");
    assert(studentHasToolbarCondition, "40. Student UI hides toolbar, Save button, and edit mode controls");

    // =========================================================================
    // CATEGORY N: IDEMPOTENT NON-DESTRUCTIVE PERSISTENCE
    // =========================================================================
    console.log("\n--- Category N: Idempotent Non-Destructive Persistence ---");
    const serverContent = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");
    const handleSaveSnippet = serverContent.substring(serverContent.indexOf("async function handleSaveTimetable"), serverContent.indexOf("app.delete(\"/api/timetable\""));
    const hasDestructiveDeleteMany = handleSaveSnippet.includes("deleteMany");
    assert(!hasDestructiveDeleteMany, "41. Server timetable save handler strictly avoids destructive deleteMany({}) + insertMany(...)");

    // Repeated saves are idempotent: document count remains exactly 1
    for (let i = 0; i < 3; i++) {
      await request("PUT", "/api/timetable", {
        semester: testSem,
        division: testDivA,
        days: fixedDays,
        timeSlots: reducedSlots,
        cells: verifyDoc.cells
      }, { Authorization: `Bearer ${adminToken}` });
    }
    const countDocs = await Timetable.countDocuments({ semester: testSem, division: testDivA });
    assert(countDocs === 1, "42. Repeated timetable saves are idempotent: exactly 1 document exists in MongoDB");

    // =========================================================================
    // CATEGORY O: CROSS-DIVISION ISOLATION
    // =========================================================================
    console.log("\n--- Category O: Cross-Division Isolation ---");
    const divBDocBefore = await Timetable.findOne({ semester: testSem, division: testDivB }).lean();
    assert(divBDocBefore !== null, "43. Div B document exists prior to Div A modification");

    // Perform multiple modifications and saves on Div A
    await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: verifyDoc.cells
    }, { Authorization: `Bearer ${adminToken}` });

    const divBDocAfter = await Timetable.findOne({ semester: testSem, division: testDivB }).lean();
    assert(divBDocAfter !== null && divBDocAfter.cells[0]?.subject === "C Programming", "44. Saving Div A does not overwrite, delete, or harm Div B timetable");

    // =========================================================================
    // CATEGORY P: FORMATTING & ALLOWLIST VALIDATION
    // =========================================================================
    console.log("\n--- Category P: Formatting & Allowlist Validation ---");
    const invalidFontCells = JSON.parse(JSON.stringify(verifyDoc.cells));
    invalidFontCells[0].fontFamily = "Comic Sans MS";
    const invalidFontRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: invalidFontCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(invalidFontRes.status === 400, "45. Non-allowlisted font family (Comic Sans MS) rejected with 400 Bad Request");

    const invalidSizeCells = JSON.parse(JSON.stringify(verifyDoc.cells));
    invalidSizeCells[0].fontSize = "100px";
    const invalidSizeRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: invalidSizeCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(invalidSizeRes.status === 400, "46. Non-allowlisted font size (100px) rejected with 400 Bad Request");

    const invalidAlignCells = JSON.parse(JSON.stringify(verifyDoc.cells));
    invalidAlignCells[0].textAlign = "justify";
    const invalidAlignRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: invalidAlignCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(invalidAlignRes.status === 400, "47. Non-allowlisted text alignment (justify) rejected with 400 Bad Request");

    // Max subject length (200 characters)
    const longSubjectCells = JSON.parse(JSON.stringify(verifyDoc.cells));
    longSubjectCells[0].subject = "A".repeat(201);
    const longSubRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: longSubjectCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(longSubRes.status === 400, "48. Cell subject text exceeding 200 characters rejected with 400 Bad Request");

    // =========================================================================
    // CATEGORY Q: XSS & PROTOTYPE POLLUTION SANITIZATION
    // =========================================================================
    console.log("\n--- Category Q: XSS & Prototype Pollution Sanitization ---");
    const xssCells = JSON.parse(JSON.stringify(verifyDoc.cells));
    xssCells[0].subject = "<script>alert('p19')</script>Mathematics";
    const xssRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: xssCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(xssRes.status === 200 && !xssRes.json?.timetable?.cells[0]?.subject?.includes("<script>"), "49. Script tags in subject text are stripped server-side prior to persistence");

    // Prototype pollution attempt
    const protoCells = JSON.parse(JSON.stringify(verifyDoc.cells));
    protoCells[0].mergedInto = JSON.parse('{"__proto__": {"polluted": true}, "dayIndex": 0, "slotIndex": 0}');
    const protoRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: protoCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(protoRes.status === 200 && ({}).polluted === undefined, "50. Prototype pollution in mergedInto metadata safely handled and Object prototype remains unpolluted");

    // =========================================================================
    // CATEGORY R: AUTHENTICATION & TOKEN VERIFICATION
    // =========================================================================
    console.log("\n--- Category R: Authentication & Token Verification ---");
    const unauthGetRes = await request("GET", "/api/timetable");
    assert(unauthGetRes.status === 401, "51. Unauthenticated request to GET /api/timetable rejected with 401 Unauthorized");

    const unauthPutRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: fixedDays,
      timeSlots: reducedSlots,
      cells: []
    });
    assert(unauthPutRes.status === 401, "52. Unauthenticated request to PUT /api/timetable rejected with 401 Unauthorized");

    // =========================================================================
    // CATEGORY S: DOM INPUT COMMIT SIMULATION
    // =========================================================================
    console.log("\n--- Category S: DOM Input Commit Simulation ---");
    assert(scriptContent.includes("function commitTimetableDomInputs()"), "53. Frontend defines commitTimetableDomInputs() helper to flush active inputs");
    assert(scriptContent.includes("commitTimetableDomInputs();") && scriptContent.includes("async function saveTimetableDoc"), "54. saveTimetableDoc() calls commitTimetableDomInputs() prior to compiling payload");

    // =========================================================================
    // CATEGORY T: MERGED CELL METADATA & RENDERING INTEGRITY
    // =========================================================================
    console.log("\n--- Category T: Merged Cell Metadata & Rendering Integrity ---");
    const hasMergedRenderLogic = scriptContent.includes("cell.mergedInto") && scriptContent.includes("rowspan=");
    assert(hasMergedRenderLogic, "55. Timetable renderer handles merged cells: renders primary cell with rowspan and skips secondary subsumed cells");

    // =========================================================================
    // CATEGORY U: PDF EXPORT DIVISION RESOLUTION INTEGRITY
    // =========================================================================
    console.log("\n--- Category U: PDF Export Division Resolution Integrity ---");
    const hasSafePdfDiv = scriptContent.includes("printColorTimetablePDF") && scriptContent.includes("displayDivision = isStudent ? (currentUser.division || \"Div A\") : (division || activeTimetableDivision || \"Div A\")");
    assert(hasSafePdfDiv, "56. PDF export resolves division safely for students and faculty without null references");

  } finally {
    // =========================================================================
    // CLEANUP TEST DATA
    // =========================================================================
    console.log("\n--- Cleaning up test records ---");
    await User.deleteMany({ username: { $in: [adminUname, facAUname, facBUname, facNoSubUname, studentUname] } });
    await Timetable.deleteMany({ semester: testSem, division: { $in: [testDivA, testDivB] } });
    console.log("✓ Prompt 19 test records cleaned up successfully.");

    if (serverProcess && typeof serverProcess.close === "function") {
      serverProcess.close();
    }
  }

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("==================================================");
  if (failedCount === 0) {
    console.log("ALL 56 PROMPT 19 TIMETABLE WORKFLOW ASSERTIONS PASSED PERFECTLY!");
    process.exit(0);
  } else {
    console.error(`FAILED: ${failedCount} assertions failed.`);
    process.exit(1);
  }
}

runPrompt19TestSuite().catch(err => {
  console.error("Test execution failed with error:", err);
  process.exit(1);
});
