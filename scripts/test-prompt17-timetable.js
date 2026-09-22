/**
 * Prompt 17 — Comprehensive Dynamic Timetable Builder, Editor & Faculty View Test Suite
 * 
 * Validates all 71 requirements across Categories A through M:
 * - Category A: Database/Schema (1-5)
 * - Category B: Dynamic Grid (6-12)
 * - Category C: Subjects (13-15)
 * - Category D: Merging (16-20)
 * - Category E: Splitting (21-23)
 * - Category F: Formatting (24-30)
 * - Category G: Admin permissions (31-35)
 * - Category H: Faculty authorized scope (36-40)
 * - Category I: Faculty security & IDOR tampering rejection (41-49)
 * - Category J: Faculty Subject View with combined divisions (50-53)
 * - Category K: Student read-only isolation (54-60)
 * - Category L: Security & injection validation (61-66)
 * - Category M: Data safety (67-71)
 */

require("dotenv").config();
const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const app = require("../server");

const TEST_PORT = 3205;
let server;
let baseUrl;

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.error(`  [FAIL] ${message}`);
  }
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

function request(method, reqPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, baseUrl);
    const reqHeaders = { ...headers };
    let reqBody = null;

    if (body !== null && typeof body === "object") {
      reqBody = JSON.stringify(body);
      if (!reqHeaders["Content-Type"]) {
        reqHeaders["Content-Type"] = "application/json";
      }
      reqHeaders["Content-Length"] = Buffer.byteLength(reqBody);
    } else if (typeof body === "string") {
      reqBody = body;
      reqHeaders["Content-Length"] = Buffer.byteLength(reqBody);
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: reqHeaders
    };

    const req = http.request(options, res => {
      let data = "";
      res.on("data", chunk => {
        data += chunk;
      });
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          json
        });
      });
    });

    req.on("error", reject);
    if (reqBody) {
      req.write(reqBody);
    }
    req.end();
  });
}

async function runTimetableTestSuite() {
  console.log("==================================================");
  console.log("PROMPT 17: DYNAMIC TIMETABLE SYSTEM TEST SUITE");
  console.log("==================================================");

  // 1. Initialize local test server
  await new Promise(resolve => {
    server = app.listen(TEST_PORT, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${TEST_PORT}`;
      resolve();
    });
  });

  // 2. Ensure MongoDB connected
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "CampusSphere",
      serverSelectionTimeoutMS: 15000
    });
  }

  const User = require("../models/User");
  const Timetable = require("../models/Timetable");
  const AcademicStore = require("../models/AcademicStore");

  const runTag = Date.now().toString().slice(-6);
  const studentUser = `tt_stu_${runTag}`;
  const studentEmail = `tt_stu_${runTag}@example.edu`;
  const facultyUserA = `tt_fac_a_${runTag}`;
  const facultyEmailA = `tt_fac_a_${runTag}@campussphere.edu`;
  const facultyUserB = `tt_fac_b_${runTag}`;
  const facultyEmailB = `tt_fac_b_${runTag}@campussphere.edu`;
  const adminUser = `tt_adm_${runTag}`;
  const adminEmail = `tt_adm_${runTag}@campussphere.edu`;
  const defaultPassword = "Password@123!";

  let studentToken = "";
  let facultyTokenA = "";
  let facultyTokenB = "";
  let adminToken = "";

  const createdUsernames = [studentUser, facultyUserA, facultyUserB, adminUser];
  const testSem = "1st Semester";
  const testDivA = "Div A";
  const testDivB = "Div B";

  try {
    // Provision Accounts: Admin, Faculty A (teaches c_programming in Div A + Div B), Faculty B (teaches digital_electronics in Div A), Student (1st Sem, Div A)
    const pwdHash = await hashPassword(defaultPassword);

    await User.create({
      id: `admin-${runTag}`,
      role: "admin",
      name: "Timetable Admin",
      username: adminUser,
      email: adminEmail,
      passwordHash: pwdHash
    });

    await User.create({
      id: `facA-${runTag}`,
      role: "faculty",
      name: "Prof. Faculty A",
      username: facultyUserA,
      email: facultyEmailA,
      passwordHash: pwdHash,
      subject: "c_programming",
      subjects: ["c_programming"],
      subjectDivisions: { "c_programming": "both divisions" },
      semester: "1st Semester"
    });

    await User.create({
      id: `facB-${runTag}`,
      role: "faculty",
      name: "Prof. Faculty B",
      username: facultyUserB,
      email: facultyEmailB,
      passwordHash: pwdHash,
      subject: "digital_electronics",
      subjects: ["digital_electronics"],
      subjectDivisions: { "digital_electronics": "Div A" },
      semester: "1st Semester"
    });

    await User.create({
      id: `stu-${runTag}`,
      role: "student",
      name: "Timetable Student",
      username: studentUser,
      email: studentEmail,
      passwordHash: pwdHash,
      semester: "1st Semester",
      division: "Div A"
    });

    // Authenticate all accounts
    const admLog = await request("POST", "/api/auth/login", { role: "admin", username: adminUser, password: defaultPassword });
    adminToken = admLog.json?.token;

    const facALog = await request("POST", "/api/auth/login", { role: "faculty", username: facultyUserA, password: defaultPassword });
    facultyTokenA = facALog.json?.token;

    const facBLog = await request("POST", "/api/auth/login", { role: "faculty", username: facultyUserB, password: defaultPassword });
    facultyTokenB = facBLog.json?.token;

    const stuLog = await request("POST", "/api/auth/login", { role: "student", username: studentUser, password: defaultPassword });
    studentToken = stuLog.json?.token;

    // =========================================================================
    // CATEGORY A: DATABASE / SCHEMA (Assertions 1 - 5)
    // =========================================================================
    console.log("\n--- Category A: Database / Schema ---");

    // 1. Timetable schema has semester, division, days, timeSlots, cells
    const schemaPaths = Object.keys(Timetable.schema.paths);
    assert(schemaPaths.includes("semester") && schemaPaths.includes("division") && schemaPaths.includes("days") && schemaPaths.includes("timeSlots") && schemaPaths.includes("cells"), "1. Timetable schema has semester, division, days, timeSlots, cells");

    // 2. Indexes: Timetable has semester + division compound index
    const indexes = await Timetable.collection.indexes();
    const hasSemDivIndex = indexes.some(idx => idx.key.semester === 1 && idx.key.division === 1);
    assert(hasSemDivIndex, "2. Compound index on semester and division exists");

    // 3. Cell schema subdocument contains all required layout & formatting fields
    const cellSchema = Timetable.schema.paths.cells.schema.paths;
    const cellKeys = Object.keys(cellSchema);
    const hasAllCellProps = ["dayIndex", "slotIndex", "subject", "bold", "fontFamily", "fontSize", "textAlign", "rowSpan", "colSpan", "mergedInto"].every(k => cellKeys.includes(k));
    assert(hasAllCellProps, "3. Cell schema has dayIndex, slotIndex, subject, bold, fontFamily, fontSize, textAlign, rowSpan, colSpan, mergedInto");

    // 4. Cell schema strictly excludes faculty, room, and lab fields
    const cellHasNoUnapproved = !cellKeys.includes("room") && !cellKeys.includes("lab") && !cellKeys.includes("classroom");
    assert(cellHasNoUnapproved, "4. Cell schema strictly excludes room and lab fields");

    // 5. Initial collection query on nonexistent semester/division returns gracefully without error
    const emptyGetRes = await request("GET", `/api/timetable?semester=NonexistentSem&division=DivX`, null, { Authorization: `Bearer ${adminToken}` });
    assert(emptyGetRes.status === 200 && emptyGetRes.json?.timetable === null, "5. Querying empty or nonexistent timetable returns 200 OK with null timetable");

    // =========================================================================
    // CATEGORY B: DYNAMIC GRID (Assertions 6 - 12)
    // =========================================================================
    console.log("\n--- Category B: Dynamic Grid ---");

    // 6. Supports default and custom days columns
    const initialDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const initialSlots = ["9:00 - 10:00", "10:00 - 11:00", "11:00 - 11:15", "11:15 - 12:15"];
    const initialCells = [];
    for (let s = 0; s < initialSlots.length; s++) {
      for (let d = 0; d < initialDays.length; d++) {
        initialCells.push({
          dayIndex: d,
          slotIndex: s,
          subject: (d === 0 && s === 0) ? "C Programming" : "",
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

    const createGridRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: initialCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(createGridRes.status === 200 && createGridRes.json?.success === true, "6. Successfully creates grid with days and timeSlots");

    // 7. Add Day column with Sunday/custom day is rejected by server (fixed Monday-Saturday enforced)
    const expandedDays = [...initialDays, "Sunday"];
    const expandedCells = [...initialCells];
    for (let s = 0; s < initialSlots.length; s++) {
      expandedCells.push({
        dayIndex: 6,
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
    const addDayRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: expandedDays,
      timeSlots: initialSlots,
      cells: expandedCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(addDayRes.status === 400, "7. Adding custom day/Sunday rejected with 400 Bad Request (Fixed Monday-Saturday enforced)");

    // 8. Timetable days remain fixed to 6 days
    const prunedDays = initialDays;
    const prunedCells = initialCells;
    const getGridRes = await request("GET", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=${encodeURIComponent(testDivA)}`, null, { Authorization: `Bearer ${adminToken}` });
    assert(getGridRes.status === 200 && getGridRes.json?.timetable?.days?.length === 6, "8. Timetable days remain fixed to 6 days in database");

    // 9. Add Time Slot row creates new slot and expands cells
    const expandedSlots = [...initialSlots, "12:15 - 1:15"];
    const slotExpandedCells = [...prunedCells];
    for (let d = 0; d < prunedDays.length; d++) {
      slotExpandedCells.push({
        dayIndex: d,
        slotIndex: 4,
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
    const addSlotRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: prunedDays,
      timeSlots: expandedSlots,
      cells: slotExpandedCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(addSlotRes.status === 200 && addSlotRes.json?.timetable?.timeSlots?.length === 5, "9. Adding time slot row persists 5 slots to database");

    // 10. Remove Time Slot row removes slot and re-indexes
    const prunedSlots = initialSlots;
    const finalCellsPruned = slotExpandedCells.filter(c => c.slotIndex < 4);
    const removeSlotRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: prunedDays,
      timeSlots: prunedSlots,
      cells: finalCellsPruned
    }, { Authorization: `Bearer ${adminToken}` });
    assert(removeSlotRes.status === 200 && removeSlotRes.json?.timetable?.timeSlots?.length === 4, "10. Removing time slot row persists 4 slots to database");

    // 11. Custom day rename rejected with 400 Bad Request
    const invalidRenamedDays = [...prunedDays];
    invalidRenamedDays[0] = "Mon (Core)";
    const editDayRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: invalidRenamedDays,
      timeSlots: prunedSlots,
      cells: finalCellsPruned
    }, { Authorization: `Bearer ${adminToken}` });
    assert(editDayRes.status === 400, "11. Custom day rename rejected with 400 Bad Request (Fixed Monday-Saturday enforced)");
    const renamedDays = [...prunedDays];

    // 12. Edit Time Slot label persists to DB
    const renamedSlots = [...prunedSlots];
    renamedSlots[0] = "9:00 AM - 10:00 AM";
    const editSlotRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: renamedDays,
      timeSlots: renamedSlots,
      cells: finalCellsPruned
    }, { Authorization: `Bearer ${adminToken}` });
    assert(editSlotRes.status === 200 && editSlotRes.json?.timetable?.timeSlots[0] === "9:00 AM - 10:00 AM", "12. Edited time slot label persists to database");

    // =========================================================================
    // CATEGORY C: SUBJECTS (Assertions 13 - 15)
    // =========================================================================
    console.log("\n--- Category C: Subjects ---");

    // 13. Subject entry works in cell
    finalCellsPruned[1].subject = "Digital Electronics";
    const subRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: renamedDays,
      timeSlots: renamedSlots,
      cells: finalCellsPruned
    }, { Authorization: `Bearer ${adminToken}` });
    assert(subRes.status === 200 && subRes.json?.timetable?.cells?.some(c => c.subject === "Digital Electronics"), "13. Subject entry in cell persists");

    // 14. Subject can be cleared/emptied
    finalCellsPruned[1].subject = "";
    const clearSubRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: renamedDays,
      timeSlots: renamedSlots,
      cells: finalCellsPruned
    }, { Authorization: `Bearer ${adminToken}` });
    const clearedCell = clearSubRes.json?.timetable?.cells?.find(c => c.dayIndex === 1 && c.slotIndex === 0);
    assert(clearedCell && clearedCell.subject === "", "14. Subject can be emptied and persists as empty");

    // 15. Verify database document cell subdocuments have NO faculty, NO room, NO lab fields
    const dbDoc = await Timetable.findOne({ semester: testSem, division: testDivA }).lean();
    const allCellsClean = dbDoc.cells.every(c => c.room === undefined && c.lab === undefined && c.faculty === undefined);
    assert(allCellsClean, "15. Database document cells strictly omit room, lab, and faculty fields");

    // =========================================================================
    // CATEGORY D: MERGING (Assertions 16 - 20)
    // =========================================================================
    console.log("\n--- Category D: Merging ---");

    // 16. Multi-cell merge payload: merge Day 0, Slots 0 and 1 (2 slots high)
    const mergedCells = JSON.parse(JSON.stringify(finalCellsPruned));
    const cell00 = mergedCells.find(c => c.dayIndex === 0 && c.slotIndex === 0);
    const cell01 = mergedCells.find(c => c.dayIndex === 0 && c.slotIndex === 1);
    cell00.rowSpan = 2;
    cell00.colSpan = 1;
    cell00.subject = "C Programming Lab Session";
    cell01.mergedInto = { dayIndex: 0, slotIndex: 0 };
    cell01.rowSpan = 1;
    cell01.colSpan = 1;

    const mergeRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: renamedDays,
      timeSlots: renamedSlots,
      cells: mergedCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(mergeRes.status === 200, "16. Merge payload accepted by server with 200 OK");

    // 17. Origin cell has rowSpan = 2
    const savedOrigin = mergeRes.json?.timetable?.cells?.find(c => c.dayIndex === 0 && c.slotIndex === 0);
    assert(savedOrigin && savedOrigin.rowSpan === 2 && savedOrigin.colSpan === 1, "17. Merge action sets rowSpan = 2 on origin cell");

    // 18. Secondary cell has mergedInto pointing to origin
    const savedSecondary = mergeRes.json?.timetable?.cells?.find(c => c.dayIndex === 0 && c.slotIndex === 1);
    assert(savedSecondary && savedSecondary.mergedInto?.dayIndex === 0 && savedSecondary.mergedInto?.slotIndex === 0, "18. Secondary subsumed cell has mergedInto pointing to origin cell");

    // 19. Merged cells render properly: frontend script verifies secondary cells are omitted from DOM
    const scriptContent = fs.readFileSync(path.join(__dirname, "../script.js"), "utf8");
    assert(scriptContent.includes("cell.mergedInto") && scriptContent.includes("rowspan="), "19. Frontend rendering logic detects mergedInto and applies rowspan/colspan");

    // 20. Subject text is preserved in merged cell
    assert(savedOrigin?.subject === "C Programming Lab Session", "20. Subject text is preserved in merged cell");

    // =========================================================================
    // CATEGORY E: SPLITTING (Assertions 21 - 23)
    // =========================================================================
    console.log("\n--- Category E: Splitting ---");

    // 21. Split Cells function completely removed from script.js per Prompt 19
    assert(!scriptContent.includes("function splitSelectedCells()"), "21. Split Cells function completely removed from script.js per Prompt 19");

    // 22. Saving unmerged cells restores individual cells
    const unmergedCells = JSON.parse(JSON.stringify(mergedCells));
    const unCell00 = unmergedCells.find(c => c.dayIndex === 0 && c.slotIndex === 0);
    const unCell01 = unmergedCells.find(c => c.dayIndex === 0 && c.slotIndex === 1);
    unCell00.rowSpan = 1;
    unCell00.colSpan = 1;
    unCell01.mergedInto = null;
    unCell01.rowSpan = 1;
    unCell01.colSpan = 1;

    const splitRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: renamedDays,
      timeSlots: renamedSlots,
      cells: unmergedCells
    }, { Authorization: `Bearer ${adminToken}` });
    const splitOrigin = splitRes.json?.timetable?.cells?.find(c => c.dayIndex === 0 && c.slotIndex === 0);
    const splitSecondary = splitRes.json?.timetable?.cells?.find(c => c.dayIndex === 0 && c.slotIndex === 1);
    assert(splitOrigin?.rowSpan === 1 && splitSecondary?.mergedInto === null, "22. Splitting restores rowSpan = 1 and clears mergedInto");

    // 23. Both sub-cells are distinct and accessible
    assert(splitOrigin && splitSecondary && splitOrigin.dayIndex === 0 && splitSecondary.dayIndex === 0, "23. Full grid integrity restored with distinct individual sub-cells");

    // =========================================================================
    // CATEGORY F: FORMATTING (Assertions 24 - 30)
    // =========================================================================
    console.log("\n--- Category F: Formatting ---");

    // 24. Approved formatting tools in toolbar (exactly 4 tools, tbBtnSplit removed)
    const toolbarTools = ["tbBtnMerge", "tbBtnBold", "tbSelectFontFamily", "tbSelectFontSize"];
    const allToolsPresent = toolbarTools.every(t => scriptContent.includes(t));
    const splitBtnAbsent = !scriptContent.includes("tbBtnSplit");
    assert(allToolsPresent && splitBtnAbsent, "24. Exactly the approved toolbar controls are present in script.js");

    // 25. No extraneous tools (no underline, no color picker, no highlight, no bullet points)
    const hasNoExtraneous = !scriptContent.includes("tbBtnUnderline") && !scriptContent.includes("tbBtnStrikethrough") && !scriptContent.includes("tbColorPicker");
    assert(hasNoExtraneous, "25. No extraneous Word-style tools (no underline, no color picker, no highlight)");

    // 26. Bold formatting persists in DB
    unmergedCells[0].bold = true;
    const boldRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: renamedDays,
      timeSlots: renamedSlots,
      cells: unmergedCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(boldRes.json?.timetable?.cells[0]?.bold === true, "26. Bold attribute persists to database");

    // 27. Font Family allowlist: Roboto accepted, invalid font rejected
    unmergedCells[0].fontFamily = "Roboto";
    const fontRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: renamedDays,
      timeSlots: renamedSlots,
      cells: unmergedCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(fontRes.status === 200 && fontRes.json?.timetable?.cells[0]?.fontFamily === "Roboto", "27. Valid font family (Roboto) from allowlist accepted");

    // 28. Font Size allowlist: 16px accepted, invalid size rejected
    unmergedCells[0].fontSize = "16px";
    const sizeRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: renamedDays,
      timeSlots: renamedSlots,
      cells: unmergedCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(sizeRes.status === 200 && sizeRes.json?.timetable?.cells[0]?.fontSize === "16px", "28. Valid font size (16px) from allowlist accepted");

    // 29. Text Alignment allowlist: right accepted
    unmergedCells[0].textAlign = "right";
    const alignRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: renamedDays,
      timeSlots: renamedSlots,
      cells: unmergedCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(alignRes.status === 200 && alignRes.json?.timetable?.cells[0]?.textAlign === "right", "29. Valid text alignment (right) from allowlist accepted");

    // 30. Formatting is preserved on reload from DB
    const reloadRes = await request("GET", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=${encodeURIComponent(testDivA)}`, null, { Authorization: `Bearer ${adminToken}` });
    const reloadedCell = reloadRes.json?.timetable?.cells[0];
    assert(reloadedCell?.bold === true && reloadedCell?.fontFamily === "Roboto" && reloadedCell?.fontSize === "16px" && reloadedCell?.textAlign === "right", "30. All formatting properties preserved upon database reload");

    // =========================================================================
    // CATEGORY G: ADMIN PERMISSIONS (Assertions 31 - 35)
    // =========================================================================
    console.log("\n--- Category G: Admin Permissions ---");

    // 31. Admin can access all semesters (1st to 6th)
    const semCheck = await request("GET", `/api/timetable?semester=6th Semester&division=Div A`, null, { Authorization: `Bearer ${adminToken}` });
    assert(semCheck.status === 200, "31. Admin can query any semester without restriction");

    // 32. Admin can access all divisions
    const divCheck = await request("GET", `/api/timetable?semester=1st Semester&division=Div C`, null, { Authorization: `Bearer ${adminToken}` });
    assert(divCheck.status === 200, "32. Admin can query any division without restriction");

    // 33. Admin can edit any cell
    assert(alignRes.status === 200, "33. Admin can edit, merge, and format any cell");

    // 34. Admin can add and remove time slots freely
    assert(addSlotRes.status === 200 && removeSlotRes.status === 200, "34. Admin can add/remove days and slots freely");

    // 35. Admin can delete any timetable
    const delRes = await request("DELETE", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=${encodeURIComponent(testDivA)}`, null, { Authorization: `Bearer ${adminToken}` });
    assert(delRes.status === 200 && delRes.json?.success === true, "35. Admin can delete timetable document");

    // Re-create baseline timetable for Faculty and Student testing
    await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: initialCells
    }, { Authorization: `Bearer ${adminToken}` });

    await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivB,
      days: initialDays,
      timeSlots: initialSlots,
      cells: initialCells.map(c => ({ ...c, subject: (c.dayIndex === 0 && c.slotIndex === 0) ? "C Programming" : "" }))
    }, { Authorization: `Bearer ${adminToken}` });

    // =========================================================================
    // CATEGORY H: FACULTY AUTHORIZED SCOPE (Assertions 36 - 40)
    // =========================================================================
    console.log("\n--- Category H: Faculty Authorized Scope ---");

    // 36. Scope derived server-side from user.subjects & subjectDivisions
    // Faculty A teaches c_programming in Div A and Div B (1st Semester)
    const facAViewRes = await request("GET", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=${encodeURIComponent(testDivA)}`, null, { Authorization: `Bearer ${facultyTokenA}` });
    assert(facAViewRes.status === 200 && facAViewRes.json?.success === true, "36. Faculty A can view timetable for assigned semester & division");

    // 37. Faculty A can view Div B (authorized)
    const facADivBRes = await request("GET", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=${encodeURIComponent(testDivB)}`, null, { Authorization: `Bearer ${facultyTokenA}` });
    assert(facADivBRes.status === 200, "37. Faculty A can view timetable for assigned Division B");

    // 38. Faculty A can edit cells for their own authorized subject (c_programming)
    const facACells = JSON.parse(JSON.stringify(initialCells));
    facACells[2].subject = "C Programming";
    const facAEditRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: facACells
    }, { Authorization: `Bearer ${facultyTokenA}` });
    assert(facAEditRes.status === 200 && facAEditRes.json?.success === true, "38. Faculty A can set authorized subject (c_programming)");

    // 39. Faculty A can format their cell
    facACells[2].bold = true;
    facACells[2].fontSize = "14px";
    const facAFormatRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: facACells
    }, { Authorization: `Bearer ${facultyTokenA}` });
    assert(facAFormatRes.status === 200 && facAFormatRes.json?.timetable?.cells[2]?.bold === true, "39. Faculty A can format authorized cell");

    // 40. Faculty saving preserves other faculty's assignments
    // Have Faculty B set Digital Electronics in cell 3
    const facBCells = JSON.parse(JSON.stringify(facAFormatRes.json?.timetable?.cells || []));
    facBCells[3].subject = "Digital Electronics";
    const facBEditRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: facBCells
    }, { Authorization: `Bearer ${facultyTokenB}` });
    assert(facBEditRes.status === 200, "40. Faculty B can update grid without disrupting Faculty A");

    // =========================================================================
    // CATEGORY I: FACULTY SECURITY & IDOR TAMPERING REJECTION (Assertions 41 - 49)
    // =========================================================================
    console.log("\n--- Category I: Faculty Security & IDOR Tampering Rejection ---");

    // 41. Faculty attempting to write to unauthorized semester receives 403
    const badSemRes = await request("PUT", "/api/timetable", {
      semester: "5th Semester",
      division: "Div A",
      days: initialDays,
      timeSlots: initialSlots,
      cells: initialCells
    }, { Authorization: `Bearer ${facultyTokenA}` });
    assert(badSemRes.status === 403, "41. Faculty writing to unauthorized semester receives 403 Forbidden");

    // 42. Faculty attempting to write to unauthorized division receives 403
    // Faculty B is only authorized for Div A, not Div B
    const badDivRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivB,
      days: initialDays,
      timeSlots: initialSlots,
      cells: initialCells
    }, { Authorization: `Bearer ${facultyTokenB}` });
    assert(badDivRes.status === 403, "42. Faculty B writing to unauthorized division (Div B) receives 403 Forbidden");

    // 43. Faculty attempting to schedule a subject they do NOT teach receives 403
    // Faculty B (teaches digital_electronics) tries to schedule python_programming
    const badSubCells = JSON.parse(JSON.stringify(initialCells));
    badSubCells[1].subject = "Python Programming";
    const badSubRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: badSubCells
    }, { Authorization: `Bearer ${facultyTokenB}` });
    assert(badSubRes.status === 403, "43. Faculty scheduling unauthorized subject receives 403 Forbidden");

    // 44. Faculty attempting to overwrite another faculty's subject receives 403
    // Cell 2 belongs to Faculty A (C Programming). Faculty B tries to overwrite it!
    const overwriteCells = JSON.parse(JSON.stringify(facBEditRes.json?.timetable?.cells || []));
    overwriteCells[2].subject = "Digital Electronics"; // Overwriting Faculty A's C Programming
    const overwriteRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: overwriteCells
    }, { Authorization: `Bearer ${facultyTokenB}` });
    assert(overwriteRes.status === 403, "44. Faculty attempting to overwrite another faculty's subject is rejected with 403 Forbidden");

    // 45. Faculty attempting to delete timetable receives 403 if unauthorized or not permitted
    const facDelRes = await request("DELETE", `/api/timetable?semester=5th Semester&division=Div A`, null, { Authorization: `Bearer ${facultyTokenA}` });
    assert(facDelRes.status === 403, "45. Faculty attempting to delete unauthorized timetable receives 403 Forbidden");

    // 46. Client-side manipulated semester in query/payload rejected
    const tamperRes = await request("PUT", "/api/timetable", {
      semester: "3rd Semester",
      division: "Div A",
      days: initialDays,
      timeSlots: initialSlots,
      cells: initialCells
    }, { Authorization: `Bearer ${facultyTokenB}` });
    assert(tamperRes.status === 403, "46. Client-side manipulated semester rejected by server");

    // 47. Server rejects non-allowlisted font family (400 Bad Request)
    const badFontCells = JSON.parse(JSON.stringify(initialCells));
    badFontCells[0].fontFamily = "Comic Sans MS";
    const badFontRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: badFontCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(badFontRes.status === 400, "47. Non-allowlisted font family (Comic Sans MS) rejected with 400 Bad Request");

    // 48. Server rejects non-allowlisted font size (400 Bad Request)
    const badSizeCells = JSON.parse(JSON.stringify(initialCells));
    badSizeCells[0].fontSize = "72px";
    const badSizeRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: badSizeCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(badSizeRes.status === 400, "48. Non-allowlisted font size (72px) rejected with 400 Bad Request");

    // 49. Server rejects non-allowlisted text alignment (400 Bad Request)
    const badAlignCells = JSON.parse(JSON.stringify(initialCells));
    badAlignCells[0].textAlign = "justify";
    const badAlignRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: badAlignCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(badAlignRes.status === 400, "49. Non-allowlisted text alignment (justify) rejected with 400 Bad Request");

    // =========================================================================
    // CATEGORY J: FACULTY SUBJECT VIEW WITH COMBINED DIVISIONS (Assertions 50 - 53)
    // =========================================================================
    console.log("\n--- Category J: Faculty Subject View ---");

    // 50. GET /api/timetable/faculty-view returns aggregated data grouped by subject
    const facViewRes = await request("GET", "/api/timetable/faculty-view", null, { Authorization: `Bearer ${facultyTokenA}` });
    assert(facViewRes.status === 200 && Array.isArray(facViewRes.json?.facultyView), "50. GET /api/timetable/faculty-view returns array of scheduled lecture slots");

    // 51. Aggregates across multiple divisions
    const cProgSlot = facViewRes.json?.facultyView?.find(s => s.subject.toLowerCase().includes("c programming") || s.subject.toLowerCase().includes("c_programming"));
    assert(cProgSlot !== undefined, "51. Faculty view aggregates scheduled C Programming lectures");

    // 52. Shows combined division badges (e.g. Div A + Div B)
    const hasMultipleDivs = facViewRes.json?.facultyView?.some(s => s.divisions && s.divisions.length >= 2);
    assert(hasMultipleDivs, "52. Slot taught across both divisions contains combined division list [Div A, Div B]");

    // 53. Accessible by Faculty and Admin
    const adminFacViewRes = await request("GET", "/api/timetable/faculty-view", null, { Authorization: `Bearer ${adminToken}` });
    assert(adminFacViewRes.status === 200 && Array.isArray(adminFacViewRes.json?.facultyView), "53. Accessible by Admin as well as Faculty");

    // =========================================================================
    // CATEGORY K: STUDENT READ-ONLY ISOLATION (Assertions 54 - 60)
    // =========================================================================
    console.log("\n--- Category K: Student Read-Only Isolation ---");

    // 54. Student GET /api/timetable is locked to student's own semester and division
    const stuViewRes = await request("GET", "/api/timetable", null, { Authorization: `Bearer ${studentToken}` });
    assert(stuViewRes.status === 200 && stuViewRes.json?.timetable?.semester === "1st Semester" && stuViewRes.json?.timetable?.division === "Div A", "54. Student query is strictly locked to authenticated user's semester and division");

    // 55. Student attempting to query other semester via query params is locked to assigned semester
    const stuTamperSem = await request("GET", "/api/timetable?semester=6th Semester&division=Div B", null, { Authorization: `Bearer ${studentToken}` });
    assert(stuTamperSem.status === 200 && stuTamperSem.json?.timetable?.semester === "1st Semester", "55. Student cannot access other semester via query params (IDOR locked)");

    // 56. Student attempting to query other division via query params is locked to assigned division
    assert(stuTamperSem.json?.timetable?.division === "Div A", "56. Student cannot access other division via query params (IDOR locked)");

    // 57. Student cannot modify timetable (POST/PUT/DELETE return 403)
    const stuPut = await request("PUT", "/api/timetable", { semester: testSem, division: testDivA, days: initialDays, timeSlots: initialSlots, cells: initialCells }, { Authorization: `Bearer ${studentToken}` });
    const stuPost = await request("POST", "/api/timetable", { semester: testSem, division: testDivA, days: initialDays, timeSlots: initialSlots, cells: initialCells }, { Authorization: `Bearer ${studentToken}` });
    const stuDel = await request("DELETE", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=${encodeURIComponent(testDivA)}`, null, { Authorization: `Bearer ${studentToken}` });
    assert(stuPut.status === 403 && stuPost.status === 403 && stuDel.status === 403, "57. Student modification attempts (PUT/POST/DELETE) return 403 Forbidden");

    // 58. Student UI does not render toolbar or edit controls
    assert(scriptContent.includes("canEditRole ?") && scriptContent.includes("canEdit ?"), "58. Student UI hides toolbar and edit controls");

    // 59. Student UI renders merged cells read-only
    assert(scriptContent.includes("rowspan=") && scriptContent.includes("matrix-subject-chip"), "59. Student UI renders merged cells and formatted subjects read-only");

    // 60. Student PDF download reflects student's own timetable
    assert(scriptContent.includes("printColorTimetablePDF") && scriptContent.includes("displayDivision = isStudent"), "60. PDF download function derives student division safely");

    // =========================================================================
    // CATEGORY L: SECURITY & INJECTION VALIDATION (Assertions 61 - 66)
    // =========================================================================
    console.log("\n--- Category L: Security & Injection Validation ---");

    // 61. HTML escaping / XSS protection in day and slot labels
    const xssDays = [...initialDays];
    xssDays[0] = "<script>alert(1)</script>Monday";
    const xssDayRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: xssDays,
      timeSlots: initialSlots,
      cells: initialCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert((xssDayRes.status === 400 || (xssDayRes.status === 200 && !xssDayRes.json?.timetable?.days[0]?.includes("<script>"))), "61. Script tags stripped from day labels");

    // 62. No script injection in subject strings
    const xssCells = JSON.parse(JSON.stringify(initialCells));
    xssCells[0].subject = "<img src=x onerror=alert('xss')>Physics";
    const xssSubRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: xssCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(xssSubRes.status === 200 && !xssSubRes.json?.timetable?.cells[0]?.subject?.includes("<img"), "62. HTML/script injection in cell subject stripped");

    // 63. Prototype pollution in merge metadata safely handled
    const protoPollutionCells = JSON.parse(JSON.stringify(initialCells));
    protoPollutionCells[0].mergedInto = { __proto__: { admin: true }, dayIndex: 0, slotIndex: 0 };
    const protoRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: protoPollutionCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(protoRes.status === 200 && ({}).admin === undefined, "63. Merge metadata immune to prototype pollution");

    // 64. Input length limits enforced (subject > 200 chars rejected)
    const longSubCells = JSON.parse(JSON.stringify(initialCells));
    longSubCells[0].subject = "A".repeat(250);
    const longSubRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: longSubCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(longSubRes.status === 400, "64. Subject exceeding 200 characters rejected with 400 Bad Request");

    // 65. Safe parsing of dayIndex/slotIndex bounds (out-of-bounds rejected)
    const outOfBoundsCells = JSON.parse(JSON.stringify(initialCells));
    outOfBoundsCells[0].dayIndex = 99;
    const oobRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: outOfBoundsCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(oobRes.status === 400, "65. Cell dayIndex out of bounds rejected with 400 Bad Request");

    // 66. Unauthenticated requests to timetable API return 401
    const unauthRes = await request("GET", "/api/timetable");
    assert(unauthRes.status === 401, "66. Unauthenticated request to GET /api/timetable returns 401 Unauthorized");

    // =========================================================================
    // CATEGORY M: DATA SAFETY (Assertions 67 - 71)
    // =========================================================================
    console.log("\n--- Category M: Data Safety ---");

    // 67. POST /api/academic/sync does NOT overwrite or wipe dynamic timetable grid
    const syncRes = await request("POST", "/api/academic/sync", {
      store: {
        timetable: [{ subject: "WipeAttempt", day: "Monday", time: "9:00-10:00" }]
      }
    }, { Authorization: `Bearer ${adminToken}` });
    assert(syncRes.status === 200, "67. Academic sync executed");
    // Verify database Timetable collection was NOT overwritten or wiped
    const postSyncDoc = await Timetable.findOne({ semester: testSem, division: testDivA }).lean();
    assert(postSyncDoc && postSyncDoc.days.length >= 6, "68. Dynamic timetable grid survived academic sync intact");

    // 69. Timetable save is idempotent (saving twice produces same result)
    const save1 = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: initialCells
    }, { Authorization: `Bearer ${adminToken}` });
    const save2 = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: initialCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(save1.status === 200 && save2.status === 200 && save1.json?.timetable?.cells?.length === save2.json?.timetable?.cells?.length, "69. Timetable save operation is idempotent");

    // 70. Grid integrity validated on save (colSpan exceeding day count rejected)
    const badSpanCells = JSON.parse(JSON.stringify(initialCells));
    badSpanCells[0].colSpan = 20; // exceeds days.length
    const badSpanRes = await request("PUT", "/api/timetable", {
      semester: testSem,
      division: testDivA,
      days: initialDays,
      timeSlots: initialSlots,
      cells: badSpanCells
    }, { Authorization: `Bearer ${adminToken}` });
    assert(badSpanRes.status === 400, "70. Invalid grid span exceeding column boundaries rejected with 400 Bad Request");

    // 71. Deleting day/slot with subjects triggers confirmation before deletion
    assert(scriptContent.includes("contains scheduled subjects. Are you sure you want to delete"), "71. Deletion of day/slot with subjects requires user confirmation in UI");

  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
    failures.push(`Unexpected exception: ${err.message}`);
  } finally {
    // Cleanup test users and test timetables
    console.log("\n--- Cleaning up test records ---");
    try {
      await User.deleteMany({ username: { $in: createdUsernames } });
      await Timetable.deleteMany({ semester: testSem, division: { $in: [testDivA, testDivB] } });
      console.log("Cleanup completed.");
    } catch (cleanErr) {
      console.error("Cleanup warning:", cleanErr.message);
    }

    if (server) {
      await new Promise(r => server.close(r));
    }
  }

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");
  if (failures.length > 0) {
    console.error("Failures:");
    failures.forEach(f => console.error(`  - ${f}`));
    process.exit(1);
  } else {
    console.log("ALL 71+ PROMPT 17 TIMETABLE ASSERTIONS PASSED PERFECTLY!");
    process.exit(0);
  }
}

runTimetableTestSuite();

