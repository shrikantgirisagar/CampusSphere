// scripts/test-prompt18-timetable.js
// Dedicated automated test suite for Prompt 18: Timetable Faculty Assigned-Subject View, Editor Cleanup & Save Fix

require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const TEST_PORT = 3098;
const BASE_URL = `http://localhost:${TEST_PORT}`;

let serverProcess = null;
let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedCount++;
  }
}

async function request(method, reqPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, BASE_URL);
    const reqHeaders = { ...headers };
    if (body !== null && typeof body === "object" && !reqHeaders["Content-Type"]) {
      reqHeaders["Content-Type"] = "application/json";
    }

    let payload = null;
    if (body !== null) {
      payload = typeof body === "string" ? body : JSON.stringify(body);
      reqHeaders["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(url, { method, headers: reqHeaders }, (res) => {
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

async function runPrompt18Tests() {
  console.log("==================================================");
  console.log("PROMPT 18: TIMETABLE FACULTY VIEW, EDITOR & SAVE FIX TEST SUITE");
  console.log("==================================================");

  // 1. Database Connection
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("Missing MONGODB_URI");

  while (mongoose.connection.readyState === 2) {
    await new Promise(r => setTimeout(r, 100));
  }
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongoUri, { dbName: "CampusSphere" });
  }

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

  const adminUname = `admin_p18_${ts}`;
  const facAUname = `facA_p18_${ts}`;
  const facBUname = `facB_p18_${ts}`;
  const facNoSubUname = `facNoSub_p18_${ts}`;
  const studentUname = `stud_p18_${ts}`;

  // Create test accounts:
  // Faculty A: assigned to 'c_programming' in Div A and Div B (1st Semester)
  // Faculty B: assigned to 'digital_electronics' in Div A (1st Semester)
  // Faculty No Sub: faculty with empty subjects array
  // Student: 1st Semester, Div A
  await User.create([
    {
      id: `id-${adminUname}`,
      role: "admin",
      username: adminUname,
      name: "Admin User",
      email: `${adminUname}@test.edu`,
      passwordHash: pwdHash
    },
    {
      id: `id-${facAUname}`,
      role: "faculty",
      username: facAUname,
      name: "Prof. Alice A",
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
      name: "Prof. Bob B",
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
      name: "Prof. Charlie NoSub",
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
      name: "Dave Student",
      email: `${studentUname}@test.edu`,
      passwordHash: pwdHash,
      semester: "1st Semester",
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

  if (!adminToken || !facultyTokenA || !facultyTokenB || !studentToken) {
    throw new Error("Failed to authenticate test accounts.");
  }

  const testSem = "1st Semester";
  const testDivA = "Div A";
  const testDivB = "Div B";

  const fixedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const fixedSlots = ["9:00 - 10:00", "10:00 - 11:00", "11:00 - 11:15", "11:15 - 12:15"];

  // Baseline cells for 1st Semester Div A:
  // Cell (0, 0) [Monday 9-10]: "C Programming" (Faculty A)
  // Cell (0, 1) [Monday 10-11]: "Digital Electronics" (Faculty B)
  // Other cells: empty
  const initialCells = [];
  for (let s = 0; s < fixedSlots.length; s++) {
    for (let d = 0; d < fixedDays.length; d++) {
      let sub = "";
      if (d === 0 && s === 0) sub = "C Programming";
      if (d === 0 && s === 1) sub = "Digital Electronics";
      initialCells.push({
        dayIndex: d,
        slotIndex: s,
        subject: sub,
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

  // Seed baseline grid in MongoDB via Admin PUT
  await request("PUT", "/api/timetable", {
    semester: testSem,
    division: testDivA,
    days: fixedDays,
    timeSlots: fixedSlots,
    cells: initialCells
  }, { Authorization: `Bearer ${adminToken}` });

  // Also seed Div B where Faculty A teaches C Programming
  const divBCells = initialCells.map(c => ({
    ...c,
    subject: (c.dayIndex === 0 && c.slotIndex === 0) ? "C Programming" : ""
  }));
  await request("PUT", "/api/timetable", {
    semester: testSem,
    division: testDivB,
    days: fixedDays,
    timeSlots: fixedSlots,
    cells: divBCells
  }, { Authorization: `Bearer ${adminToken}` });

  // =========================================================================
  // 1. FACULTY ASSIGNED-SUBJECT VIEW & SERVER-SIDE FILTERING
  // =========================================================================
  console.log("\n--- Category 1: Faculty Assigned-Subject Filtering ---");

  // 1. Faculty A queries timetable: returns 200 and assigned subjects intact
  const facAGetRes = await request("GET", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=${encodeURIComponent(testDivA)}`, null, { Authorization: `Bearer ${facultyTokenA}` });
  assert(facAGetRes.status === 200, "1. Faculty A queries assigned semester/division with 200 OK");
  const facACells = facAGetRes.json?.timetable?.cells || [];
  const cProgCellA = facACells.find(c => c.dayIndex === 0 && c.slotIndex === 0);
  assert(cProgCellA && cProgCellA.subject === "C Programming", "2. Faculty A sees their assigned subject 'C Programming'");

  // 2. Server-side redaction: Faculty A does NOT see Faculty B's subject ('Digital Electronics' is redacted to "")
  const digElecCellA = facACells.find(c => c.dayIndex === 0 && c.slotIndex === 1);
  assert(digElecCellA && digElecCellA.subject === "", "3. Server-side filtering redacts unassigned subject 'Digital Electronics' for Faculty A");

  // 3. Faculty B queries timetable: returns 200 and assigned subject intact
  const facBGetRes = await request("GET", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=${encodeURIComponent(testDivA)}`, null, { Authorization: `Bearer ${facultyTokenB}` });
  const facBCells = facBGetRes.json?.timetable?.cells || [];
  const digElecCellB = facBCells.find(c => c.dayIndex === 0 && c.slotIndex === 1);
  assert(digElecCellB && digElecCellB.subject === "Digital Electronics", "4. Faculty B sees their assigned subject 'Digital Electronics'");

  // 4. Server-side redaction: Faculty B does NOT see Faculty A's subject ('C Programming' is redacted to "")
  const cProgCellB = facBCells.find(c => c.dayIndex === 0 && c.slotIndex === 0);
  assert(cProgCellB && cProgCellB.subject === "", "5. Server-side filtering redacts unassigned subject 'C Programming' for Faculty B");

  // 5. Faculty cannot view unauthorized semester via query params (403 Forbidden)
  const facABadSem = await request("GET", `/api/timetable?semester=3rd Semester&division=Div A`, null, { Authorization: `Bearer ${facultyTokenA}` });
  assert(facABadSem.status === 403, "6. Faculty A requesting unauthorized semester receives 403 Forbidden");

  // 6. Faculty B cannot view unauthorized division (Div B) (403 Forbidden)
  const facBBadDiv = await request("GET", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=Div B`, null, { Authorization: `Bearer ${facultyTokenB}` });
  assert(facBBadDiv.status === 403, "7. Faculty B requesting unauthorized division receives 403 Forbidden");

  // 7. Faculty with no assigned subjects receives empty-state response
  const facNoSubGet = await request("GET", `/api/timetable`, null, { Authorization: `Bearer ${facultyTokenNoSub}` });
  assert(facNoSubGet.status === 200 && facNoSubGet.json?.timetable === null, "8. Faculty with no assigned subjects receives clean null timetable response");

  // 8. Faculty Subject View returns only assigned subjects and combines divisions
  const facAView = await request("GET", "/api/timetable/faculty-view", null, { Authorization: `Bearer ${facultyTokenA}` });
  assert(facAView.status === 200 && Array.isArray(facAView.json?.facultyView), "9. GET /api/timetable/faculty-view responds with 200 and slots array");
  const facASlots = facAView.json?.facultyView || [];
  const hasOnlyCProg = facASlots.every(s => s.subject.toLowerCase().includes("c programming") || s.subject.toLowerCase().includes("c_programming"));
  assert(hasOnlyCProg && facASlots.length > 0, "10. Faculty A view strictly contains ONLY assigned subject 'C Programming'");

  // 9. Combined divisions in Faculty View (Div A + Div B)
  const combinedSlot = facASlots.find(s => s.divisions && s.divisions.length >= 2);
  assert(combinedSlot && (combinedSlot.divisionLabel === "Div A + Div B" || combinedSlot.divisionsLabel === "Div A + Div B"), "11. Overlapping slot across Div A and Div B is combined into 'Div A + Div B'");

  // 10. Faculty cannot request another faculty's subject schedule via query param
  const facATamperSub = await request("GET", "/api/timetable/faculty-view?subject=digital_electronics", null, { Authorization: `Bearer ${facultyTokenA}` });
  assert(facATamperSub.status === 403, "12. Direct API subject manipulation by Faculty A for unassigned subject returns 403 Forbidden");

  // =========================================================================
  // 2. EDITOR CLEANUP: REMOVED CONTROLS & FIXED MONDAY-SATURDAY
  // =========================================================================
  console.log("\n--- Category 2: Editor Cleanup & Fixed Monday-Saturday ---");

  const scriptContent = fs.readFileSync(path.join(__dirname, "../script.js"), "utf8");

  // 11. Left Alignment control absent from script.js toolbar
  assert(!scriptContent.includes('id="tbAlignLeft"'), "13. Left alignment toolbar control absent from script.js");

  // 12. Right Alignment control absent from script.js toolbar
  assert(!scriptContent.includes('id="tbAlignRight"'), "14. Right alignment toolbar control absent from script.js");

  // 13. Center Text control absent from script.js toolbar
  assert(!scriptContent.includes('id="tbAlignCenter"') && !scriptContent.includes("Center Text"), "15. Center Text control and label absent from script.js");

  // 14. Add Day control absent from script.js toolbar
  assert(!scriptContent.includes('id="btnAddDayCol"'), "16. Add Day control absent from script.js");

  // 15. Day column delete button absent from day headers
  assert(!scriptContent.includes('class="btn-delete-col"'), "17. Day column deletion button absent from script.js");

  // 16. Split-merged-cells explanatory text absent
  const hasSplitExplanation = /Splitting|Split merged cells|Preserve data|Preserve formatting where applicable/i.test(scriptContent);
  assert(!hasSplitExplanation, "18. Split-merged-cells explanatory text absent from UI");

  // 17. Default days in frontend are fixed to Monday through Saturday
  assert(scriptContent.includes('["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]'), "19. Monday-Saturday fixed days array present in script.js");

  // 18. New cells are automatically centered
  assert(scriptContent.includes('textAlign: "center"'), "20. Default and normalized cells explicitly use center alignment");

  // 19. Dynamic Time Slot structural actions retained
  assert(scriptContent.includes('id="btnAddTimeRow"') && scriptContent.includes('btn-delete-row'), "21. Dynamic Time Slot addition and removal controls retained in editor");

  // =========================================================================
  // 3. SAVE BUTTON WORKFLOW & NON-DESTRUCTIVE PERSISTENCE
  // =========================================================================
  console.log("\n--- Category 3: Save Flow & Persistence ---");

  // 20. Admin can edit and save timetable
  const adminEditCells = JSON.parse(JSON.stringify(initialCells));
  adminEditCells[3].subject = "Mathematics"; // Admin edits slot 3
  const adminSaveRes = await request("PUT", "/api/timetable", {
    semester: testSem,
    division: testDivA,
    days: fixedDays,
    timeSlots: fixedSlots,
    cells: adminEditCells
  }, { Authorization: `Bearer ${adminToken}` });
  assert(adminSaveRes.status === 200 && adminSaveRes.json?.success === true, "22. Admin can edit and save timetable with 200 OK");

  // Verify MongoDB persistence directly
  const savedDbDoc = await Timetable.findOne({ semester: testSem, division: testDivA }).lean();
  const mathCellInDb = savedDbDoc?.cells?.find(c => c.dayIndex === 3 && c.slotIndex === 0);
  assert(mathCellInDb && mathCellInDb.subject === "Mathematics", "23. Admin saved changes successfully persisted to MongoDB");

  // 21. Authorized Faculty A can edit and save their assigned subject
  const facAEditCells = JSON.parse(JSON.stringify(facACells));
  // Faculty A updates their own C Programming cell to have bold = true
  const facACell00 = facAEditCells.find(c => c.dayIndex === 0 && c.slotIndex === 0);
  facACell00.bold = true;
  const facASaveRes = await request("PUT", "/api/timetable", {
    semester: testSem,
    division: testDivA,
    days: fixedDays,
    timeSlots: fixedSlots,
    cells: facAEditCells
  }, { Authorization: `Bearer ${facultyTokenA}` });
  assert(facASaveRes.status === 200 && facASaveRes.json?.success === true, "24. Authorized Faculty A can save assigned-subject changes with 200 OK");

  // 22. Non-destructive: Faculty B's unassigned subject ('Digital Electronics') was preserved intact in MongoDB!
  const postFacADbDoc = await Timetable.findOne({ semester: testSem, division: testDivA }).lean();
  const cell01Db = postFacADbDoc?.cells?.find(c => c.dayIndex === 0 && c.slotIndex === 1);
  assert(cell01Db && cell01Db.subject === "Digital Electronics", "25. Other faculty member's period ('Digital Electronics') was preserved safely during Faculty A's save");

  // 23. Unauthorized Faculty cannot save an unassigned subject
  const facABadSaveCells = JSON.parse(JSON.stringify(facACells));
  facABadSaveCells[2].subject = "Python Programming"; // Unauthorized subject for Faculty A
  const facABadSaveRes = await request("PUT", "/api/timetable", {
    semester: testSem,
    division: testDivA,
    days: fixedDays,
    timeSlots: fixedSlots,
    cells: facABadSaveCells
  }, { Authorization: `Bearer ${facultyTokenA}` });
  assert(facABadSaveRes.status === 403, "26. Faculty attempting to save unauthorized subject receives 403 Forbidden");

  // 24. Unauthorized Faculty cannot overwrite another faculty's subject
  const facBOverwriteCells = JSON.parse(JSON.stringify(facBCells));
  // Faculty B tries to overwrite Faculty A's C Programming cell (0, 0)
  const facBCell00 = facBOverwriteCells.find(c => c.dayIndex === 0 && c.slotIndex === 0);
  facBCell00.subject = "Digital Electronics";
  const facBOverwriteRes = await request("PUT", "/api/timetable", {
    semester: testSem,
    division: testDivA,
    days: fixedDays,
    timeSlots: fixedSlots,
    cells: facBOverwriteCells
  }, { Authorization: `Bearer ${facultyTokenB}` });
  assert(facBOverwriteRes.status === 403, "27. Faculty B attempting to overwrite Faculty A's cell receives 403 Forbidden");

  // 25. Database remains unmodified after unauthorized request
  const checkDbUnchanged = await Timetable.findOne({ semester: testSem, division: testDivA }).lean();
  const cell00Unchanged = checkDbUnchanged?.cells?.find(c => c.dayIndex === 0 && c.slotIndex === 0);
  assert(cell00Unchanged && cell00Unchanged.subject === "C Programming", "28. Database was NOT modified when unauthorized faculty request was rejected");

  // 26. Refresh retains saved changes: reload from API matches database
  const reloadRes = await request("GET", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=${encodeURIComponent(testDivA)}`, null, { Authorization: `Bearer ${adminToken}` });
  const reloadedCells = reloadRes.json?.timetable?.cells || [];
  const reloaded00 = reloadedCells.find(c => c.dayIndex === 0 && c.slotIndex === 0);
  assert(reloaded00 && reloaded00.subject === "C Programming" && reloaded00.bold === true, "29. Reloading timetable from API retains saved changes accurately");

  // 27. Repeated save is idempotent (does not duplicate records)
  const countBefore = await Timetable.countDocuments({ semester: testSem, division: testDivA });
  await request("PUT", "/api/timetable", {
    semester: testSem,
    division: testDivA,
    days: fixedDays,
    timeSlots: fixedSlots,
    cells: reloadedCells
  }, { Authorization: `Bearer ${adminToken}` });
  const countAfter = await Timetable.countDocuments({ semester: testSem, division: testDivA });
  assert(countBefore === 1 && countAfter === 1, "30. Repeated save is idempotent: document count remains exactly 1");

  // 28. Save does not delete unrelated timetable entries (Div B still exists)
  const divBDoc = await Timetable.findOne({ semester: testSem, division: testDivB }).lean();
  assert(divBDoc !== null, "31. Saving Div A does NOT delete or harm unrelated Div B timetable");

  // =========================================================================
  // 4. FORMATTING TOOLS & CELL MERGING / SPLITTING
  // =========================================================================
  console.log("\n--- Category 4: Formatting & Merging ---");

  // 29. Merge cells (rowSpan = 2)
  const mergeTestCells = JSON.parse(JSON.stringify(reloadedCells));
  const origCell = mergeTestCells.find(c => c.dayIndex === 1 && c.slotIndex === 0);
  const subCell = mergeTestCells.find(c => c.dayIndex === 1 && c.slotIndex === 1);
  origCell.subject = "Mathematics Lab";
  origCell.rowSpan = 2;
  origCell.colSpan = 1;
  origCell.fontFamily = "Roboto";
  origCell.fontSize = "16px";
  subCell.mergedInto = { dayIndex: 1, slotIndex: 0 };

  const mergeSaveRes = await request("PUT", "/api/timetable", {
    semester: testSem,
    division: testDivA,
    days: fixedDays,
    timeSlots: fixedSlots,
    cells: mergeTestCells
  }, { Authorization: `Bearer ${adminToken}` });
  assert(mergeSaveRes.status === 200, "32. Merged cell payload saved with 200 OK");

  // Verify merge in DB
  const mergedDbDoc = await Timetable.findOne({ semester: testSem, division: testDivA }).lean();
  const dbOrigCell = mergedDbDoc?.cells?.find(c => c.dayIndex === 1 && c.slotIndex === 0);
  const dbSubCell = mergedDbDoc?.cells?.find(c => c.dayIndex === 1 && c.slotIndex === 1);
  assert(dbOrigCell?.rowSpan === 2 && dbSubCell?.mergedInto?.dayIndex === 1, "33. Origin cell rowSpan = 2 and subsumed cell mergedInto verified in MongoDB");
  assert(dbOrigCell?.fontFamily === "Roboto" && dbOrigCell?.fontSize === "16px", "34. Font family and font size formatting persisted correctly");
  assert(dbOrigCell?.textAlign === "center", "35. Cell text alignment remains centered automatically");

  // 30. Split cells restores 1x1 cells
  const splitTestCells = JSON.parse(JSON.stringify(mergedDbDoc.cells));
  const splitOrig = splitTestCells.find(c => c.dayIndex === 1 && c.slotIndex === 0);
  const splitSub = splitTestCells.find(c => c.dayIndex === 1 && c.slotIndex === 1);
  splitOrig.rowSpan = 1;
  splitSub.mergedInto = null;

  const splitSaveRes = await request("PUT", "/api/timetable", {
    semester: testSem,
    division: testDivA,
    days: fixedDays,
    timeSlots: fixedSlots,
    cells: splitTestCells
  }, { Authorization: `Bearer ${adminToken}` });
  assert(splitSaveRes.status === 200, "36. Split cells payload saved with 200 OK");

  const splitDbDoc = await Timetable.findOne({ semester: testSem, division: testDivA }).lean();
  const checkSplitOrig = splitDbDoc?.cells?.find(c => c.dayIndex === 1 && c.slotIndex === 0);
  const checkSplitSub = splitDbDoc?.cells?.find(c => c.dayIndex === 1 && c.slotIndex === 1);
  assert(checkSplitOrig?.rowSpan === 1 && checkSplitSub?.mergedInto === null, "37. Split restores individual cells and clears mergedInto in MongoDB");

  // =========================================================================
  // 5. STUDENT READ-ONLY & IDOR LOCKDOWN
  // =========================================================================
  console.log("\n--- Category 5: Student Read-Only & IDOR Lockdown ---");

  // 31. Student query is strictly server-derived to authenticated semester and division
  const stuGetRes = await request("GET", "/api/timetable", null, { Authorization: `Bearer ${studentToken}` });
  assert(stuGetRes.status === 200 && stuGetRes.json?.semester === "1st Semester" && stuGetRes.json?.division === "Div A", "38. Student query is server-derived to authenticated semester and division");

  // 32. Student client-side tampering via query parameters is ignored/locked
  const stuTamperRes = await request("GET", "/api/timetable?semester=6th Semester&division=Div B", null, { Authorization: `Bearer ${studentToken}` });
  assert(stuTamperRes.status === 200 && stuTamperRes.json?.semester === "1st Semester" && stuTamperRes.json?.division === "Div A", "39. Student semester/division tampering via query params is locked to authenticated profile");

  // 33. Student modification attempts return 403 Forbidden
  const stuPutRes = await request("PUT", "/api/timetable", {
    semester: testSem,
    division: testDivA,
    days: fixedDays,
    timeSlots: fixedSlots,
    cells: splitTestCells
  }, { Authorization: `Bearer ${studentToken}` });
  assert(stuPutRes.status === 403, "40. Student PUT request rejected with 403 Forbidden");

  const stuPostRes = await request("POST", "/api/timetable", {
    semester: testSem,
    division: testDivA,
    days: fixedDays,
    timeSlots: fixedSlots,
    cells: splitTestCells
  }, { Authorization: `Bearer ${studentToken}` });
  assert(stuPostRes.status === 403, "41. Student POST request rejected with 403 Forbidden");

  const stuDelRes = await request("DELETE", `/api/timetable?semester=${encodeURIComponent(testSem)}&division=${encodeURIComponent(testDivA)}`, null, { Authorization: `Bearer ${studentToken}` });
  assert(stuDelRes.status === 403, "42. Student DELETE request rejected with 403 Forbidden");

  // 34. Student UI hides toolbar and edit controls
  assert(scriptContent.includes("canEditRole ?") && scriptContent.includes("!isTimetableEditMode"), "43. Student view hides toolbar, Save button, and edit controls");

  // =========================================================================
  // CLEANUP TEST DATA
  // =========================================================================
  console.log("\n--- Cleaning up test records ---");
  await User.deleteMany({ username: { $in: [adminUname, facAUname, facBUname, facNoSubUname, studentUname] } });
  await Timetable.deleteMany({ semester: testSem, division: { $in: [testDivA, testDivB] } });
  console.log("✓ Test records cleaned up successfully.");

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("==================================================");
  if (failedCount === 0) {
    console.log("ALL 43+ PROMPT 18 TIMETABLE ASSERTIONS PASSED PERFECTLY!\n");
  }

  process.exit(failedCount === 0 ? 0 : 1);
}

runPrompt18Tests().catch(err => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});

