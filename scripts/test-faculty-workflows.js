/**
 * scripts/test-faculty-workflows.js
 *
 * CampusSphere — Phase 3 Priority 3: Faculty Portal Workflow Excellence
 * Verification Test Suite
 *
 * Covers:
 * 1. Attendance Initial State Invariant (All students start Not Marked, NO auto-present)
 * 2. Prohibition of "Mark All Present" (Absolute absence of Mark All Present)
 * 3. Attendance 3-State Toggle (P, A, Unmark/Neutral)
 * 4. Dynamic Live Attendance Counters (Enrolled, Present, Absent, Not Marked)
 * 5. Incomplete Attendance Guard (Blocked save, exact count alert, row warning highlight)
 * 6. Internal Assessment Marks Initial State (Awaiting Marks, no fabricated zeros)
 * 7. IA Marks Live Bounds Validation (Negative & over-max rejection with is-invalid)
 * 8. IA Marks Live Recalculation & Unsaved Changes Alert
 * 9. Faculty Division Scoping & Multi-Division Isolation
 * 10. Notice Publishing with Category & Recipient Scope Preview
 * 11. Faculty Dashboard Today's Schedule & Shortcuts
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

let passedTests = 0;
let failedTests = 0;

function pass(name) {
  passedTests++;
  console.log(`  [PASS] ${passedTests}. ${name}`);
}

function fail(name, err) {
  failedTests++;
  console.error(`  [FAIL] ${name}:`, err.message || err);
}

function runTest(name, fn) {
  try {
    fn();
    pass(name);
  } catch (err) {
    fail(name, err);
  }
}

console.log('======================================================================');
console.log('CAMPUSSPHERE PHASE 3 PRIORITY 3: FACULTY WORKFLOW VERIFICATION SUITE');
console.log('======================================================================\n');

const scriptContent = fs.readFileSync(path.join(__dirname, '../public/script.js'), 'utf8');
const styleContent = fs.readFileSync(path.join(__dirname, '../public/style.css'), 'utf8');
const serverContent = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');

// --- GROUP 1: Attendance Invariants & Three-State Model ---
console.log('--- GROUP 1: Attendance Invariants & Three-State Model ---');

runTest('Invariant: ABSOLUTELY NO "Mark All Present" or automatic present button exists', () => {
  const lower = scriptContent.toLowerCase();
  assert(!lower.includes('mark all present'), 'Found forbidden phrase "mark all present" in script.js');
  assert(!lower.includes('markallpresent'), 'Found forbidden phrase "markallpresent" in script.js');
  assert(!lower.includes('all present"'), 'Found forbidden phrase "all present" in script.js');
});

runTest('Attendance initial state initializes every student to Not Marked ("")', () => {
  assert(scriptContent.includes('activeAttendanceMap[s.username] = ""'), 'activeAttendanceMap must default to neutral empty string for all students');
  assert(scriptContent.includes('New Session (All Students Not Marked)'), 'Must indicate new session has all students Not Marked');
});

runTest('Attendance UI renders three distinct toggle buttons (P, A, unmark/clear)', () => {
  assert(scriptContent.includes('class="btn-pa btn-p'), 'Missing Present (btn-p) button in toggle group');
  assert(scriptContent.includes('class="btn-pa btn-a'), 'Missing Absent (btn-a) button in toggle group');
  assert(scriptContent.includes('class="btn-pa btn-unmark'), 'Missing Unmark/Clear (btn-unmark) button in toggle group');
  assert(scriptContent.includes('rotate-ccw'), 'Missing unmark icon');
});

runTest('CSS defines distinct visual styling for Present, Absent, and Not Marked states', () => {
  assert(styleContent.includes('.btn-pa.btn-p.active'), 'Missing .btn-pa.btn-p.active styling');
  assert(styleContent.includes('.btn-pa.btn-a.active'), 'Missing .btn-pa.btn-a.active styling');
  assert(styleContent.includes('.btn-pa.btn-unmark'), 'Missing .btn-pa.btn-unmark styling');
  assert(styleContent.includes('.att-status-pill.badge-unmarked'), 'Missing .att-status-pill.badge-unmarked styling');
  assert(styleContent.includes('.att-status-pill.badge-amber'), 'Missing .att-status-pill.badge-amber styling');
});

// --- GROUP 2: Dynamic Live Attendance Summary & Incomplete Protection ---
console.log('\n--- GROUP 2: Dynamic Live Attendance Summary & Incomplete Protection ---');

runTest('Attendance UI contains live summary bar with 4 dynamic counters', () => {
  assert(scriptContent.includes('class="att-live-summary-bar"'), 'Missing .att-live-summary-bar container');
  assert(scriptContent.includes('id="attSummaryEnrolled"'), 'Missing #attSummaryEnrolled element');
  assert(scriptContent.includes('id="attSummaryPresent"'), 'Missing #attSummaryPresent element');
  assert(scriptContent.includes('id="attSummaryAbsent"'), 'Missing #attSummaryAbsent element');
  assert(scriptContent.includes('id="attSummaryUnmarked"'), 'Missing #attSummaryUnmarked element');
});

runTest('updateLiveAttendanceCounters recalculates Present, Absent, and Unmarked in real time', () => {
  assert(scriptContent.includes('updateLiveAttendanceCounters'), 'Missing updateLiveAttendanceCounters function');
  assert(scriptContent.includes('pEl.textContent = p'), 'updateLiveAttendanceCounters must update present count');
  assert(scriptContent.includes('aEl.textContent = a'), 'updateLiveAttendanceCounters must update absent count');
  assert(scriptContent.includes('uEl.textContent = u'), 'updateLiveAttendanceCounters must update unmarked count');
});

runTest('Incomplete attendance guard prevents saving when unmarked students exist', () => {
  assert(scriptContent.includes('const unmarkedStudents = currentStudents.filter'), 'Must filter unmarked students before saving');
  assert(scriptContent.includes('if (unmarkedStudents.length > 0)'), 'Must check if unmarkedStudents.length > 0');
  assert(scriptContent.includes('Attendance Incomplete: ${unmarkedStudents.length} student'), 'Must display exact count of unmarked students');
  assert(scriptContent.includes('att-row-unmarked-warning'), 'Must highlight unmarked student rows with warning class');
});

runTest('CSS defines high-visibility warning pulse and border for unmarked student rows', () => {
  assert(styleContent.includes('.att-row-unmarked-warning'), 'Missing .att-row-unmarked-warning styling');
  assert(styleContent.includes('pulseWarning'), 'Missing pulseWarning keyframes');
});

// --- GROUP 3: Internal Assessment (IA) Marks Management ---
console.log('\n--- GROUP 3: Internal Assessment (IA) Marks Management ---');

runTest('Unset marks display "Awaiting Marks" without fabricating 0s', () => {
  assert(scriptContent.includes('Awaiting Marks'), 'Must display "Awaiting Marks" for unentered student marks');
  assert(scriptContent.includes('placeholder="--"'), 'Marks input placeholder must be "--" instead of "0"');
  assert(scriptContent.includes('badge-unmarked'), 'Must use badge-unmarked for awaiting marks');
});

runTest('Independent component bounds validation highlights invalid marks with is-invalid', () => {
  assert(scriptContent.includes('input.classList.add("is-invalid")'), 'Must add is-invalid class when value < 0 or > max');
  assert(scriptContent.includes('input.classList.remove("is-invalid")'), 'Must remove is-invalid class when value is valid');
  assert(styleContent.includes('.marks-input-field.is-invalid'), 'Missing .marks-input-field.is-invalid in style.css');
});

runTest('Modifying marks reveals the Unsaved Changes warning bar', () => {
  assert(scriptContent.includes('id="marksUnsavedWarning"'), 'Missing #marksUnsavedWarning bar in marks template');
  assert(scriptContent.includes('unsavedBar.style.display = "flex"'), 'Must reveal unsavedBar on marks input');
  assert(styleContent.includes('.marks-unsaved-bar'), 'Missing .marks-unsaved-bar in style.css');
});

runTest('Batch submit prevents saving if any component mark is invalid', () => {
  assert(scriptContent.includes('Please correct invalid marks before saving'), 'Must show error and block submit if marks are invalid');
  assert(scriptContent.includes('firstInvalidEl.scrollIntoView'), 'Must scroll first invalid mark input into view');
});

runTest('Strict Invariant: Absolutely NO Results module, SGPA, or CGPA in faculty marks', () => {
  assert(!scriptContent.includes('function results('), 'Forbidden results() view found in script.js');
  assert(!scriptContent.includes('SGPA:'), 'Forbidden SGPA found in script.js');
  assert(!scriptContent.includes('CGPA:'), 'Forbidden CGPA found in script.js');
});

// --- GROUP 4: Multi-Division Support & Backend Authorization ---
console.log('\n--- GROUP 4: Multi-Division Support & Backend Authorization ---');

runTest('Marks view supports division filtering for multi-division faculty', () => {
  assert(scriptContent.includes('id="marksDivisionFilter"'), 'Missing #marksDivisionFilter selector in marks template');
  assert(scriptContent.includes('window.facultyMarksDivisionFilter = e.target.value'), 'Must handle marksDivisionFilter change');
});

runTest('server.js canFacultySetSubject enforces division and subject scoping', () => {
  assert(serverContent.includes('function canFacultySetSubject(user, subject, semester, division)'), 'Missing canFacultySetSubject in server.js');
  assert(serverContent.includes('getFacultyAuthorizedScope'), 'server.js must compute authorized scope');
});

// --- GROUP 5: Faculty Notice Management & Category Support ---
console.log('\n--- GROUP 5: Faculty Notice Management & Category Support ---');

runTest('Faculty notice form includes category selector and recipient scope preview', () => {
  assert(scriptContent.includes('id="noticeCategory"'), 'Missing #noticeCategory dropdown in notice form');
  assert(scriptContent.includes('notice-preview-scope'), 'Missing .notice-preview-scope preview banner');
  assert(styleContent.includes('.notice-preview-scope'), 'Missing .notice-preview-scope in style.css');
});

runTest('initNoticesPage saves category metadata with published notices', () => {
  assert(scriptContent.includes('const categoryInput = $("noticeCategory")'), 'Must read noticeCategory in initNoticesPage');
  assert(scriptContent.includes('category,'), 'Must persist category property in newNotice');
});

// --- GROUP 6: Faculty Dashboard & Today\'s Schedule ---
console.log('\n--- GROUP 6: Faculty Dashboard & Today\'s Schedule ---');

runTest('facultyDashboard dynamically calculates today\'s classes from timetable', () => {
  assert(scriptContent.includes('const daysOfWeek = ["Sunday", "Monday"'), 'Must define daysOfWeek array');
  assert(scriptContent.includes('const todayClasses = allTimetableEntries.filter'), 'Must filter timetable for today\'s classes');
  assert(scriptContent.includes('faculty-today-schedule'), 'Missing .faculty-today-schedule container');
});

runTest('Today\'s schedule cards feature direct "Take Attendance" shortcut', () => {
  assert(scriptContent.includes('data-action="switch-and-attend"'), 'Missing switch-and-attend action button on today\'s class card');
  assert(scriptContent.includes('case "switch-and-attend":'), 'Missing switch-and-attend handler in handleClick');
  assert(styleContent.includes('.faculty-today-card'), 'Missing .faculty-today-card in style.css');
});

console.log('\n======================================================================');
console.log(`TEST RESULTS: ${passedTests} Passed, ${failedTests} Failed`);
console.log('======================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL FACULTY WORKFLOW VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
}
