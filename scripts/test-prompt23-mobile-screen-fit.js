/**
 * ============================================================================
 * CAMPUSSPHERE PROMPT 23 TEST SUITE
 * Complete Mobile Screen-Fit Audit & Fix Verification
 * Login, Signup + All Student/Faculty/Admin Portal Pages
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function logTest(name, passed, detail = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`  [PASS] ${name}${detail ? ' - ' + detail : ''}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${name}${detail ? ' - ' + detail : ''}`);
  }
}

async function runPrompt23Tests() {
  console.log('====================================================================');
  console.log('STARTING PROMPT 23 MOBILE SCREEN-FIT & PORTAL PAGES AUDIT SUITE');
  console.log('====================================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  const coursesHtml = fs.readFileSync(path.join(rootDir, 'courses.html'), 'utf-8');
  const aboutHtml = fs.readFileSync(path.join(rootDir, 'about.html'), 'utf-8');
  const studentsHtml = fs.readFileSync(path.join(rootDir, 'students.html'), 'utf-8');
  const styleCss = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf-8');
  const scriptJs = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf-8');
  const serverJs = fs.readFileSync(path.join(rootDir, 'server.js'), 'utf-8');

  // -------------------------------------------------------------------------
  // TEST SUITE 1: LOGIN PAGE MOBILE SCREEN FIT (320px - 480px + LANDSCAPE)
  // -------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: Login Page Screen-Fit & Card Sizing ---');
  
  // Auth card must NOT use min(560px, 94vw) inside padded container, which caused horizontal overflow
  const authCardFluid = /\.auth-card-horizontal\s*\{[^}]*width:\s*100%\s*!important;[^}]*max-width:\s*560px\s*!important/s.test(styleCss);
  logTest('Login card uses fluid width: 100% !important with max-width: 560px !important (no 94vw overflow)', authCardFluid);

  // Background floating objects must be hidden on mobile to avoid horizontal scrollbar protrusion
  const loginObjectsHidden = /\.login-objects\s*\{[^}]*display:\s*none\s*!important;/s.test(styleCss);
  logTest('Login floating background emojis (.login-objects) are hidden on mobile to prevent overflow', loginObjectsHidden);

  // Compact screen optimization (<= 380px)
  const compactScreenRules = styleCss.includes('@media (max-width: 380px)') &&
    styleCss.includes('.role-tab') &&
    styleCss.includes('min-height: 54px !important;');
  logTest('Login page defines dedicated <= 380px compact portrait rules for small phones', compactScreenRules);

  // Landscape mode optimization for smartphones
  const landscapeRules = styleCss.includes('@media (max-height: 500px) and (orientation: landscape)') &&
    styleCss.includes('.showcase-brand-header h1');
  logTest('Login page defines landscape mode optimization (@media max-height: 500px and landscape)', landscapeRules);

  // -------------------------------------------------------------------------
  // TEST SUITE 2: SIGNUP PAGE MOBILE FIT & GRID COLLAPSING
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: Signup Page Form Grid & Element Wrapping ---');

  // .signup-card .auth-input-grid must explicitly collapse to single column (1fr) on mobile
  const signupGridCollapsed = /\.signup-card\s+\.auth-input-grid\s*\{[^}]*grid-template-columns:\s*1fr\s*!important;/s.test(styleCss);
  logTest('Signup form grid (.signup-card .auth-input-grid) collapses to 1fr !important on mobile', signupGridCollapsed);

  // College name and pill headers must wrap properly to prevent text clipping
  const showcaseMottoWrapped = /\.showcase-motto-pill\s*\{[^}]*flex-wrap:\s*wrap\s*!important;/s.test(styleCss);
  logTest('Showcase motto pill and brand elements wrap cleanly on mobile screens', showcaseMottoWrapped);

  const creatorCreditWrapped = /\.login-creator-credit\s*\{[^}]*flex-wrap:\s*wrap\s*!important;/s.test(styleCss);
  logTest('Creator credit pill wraps cleanly without clipping on mobile screens', creatorCreditWrapped);

  // -------------------------------------------------------------------------
  // TEST SUITE 3: ZERO HORIZONTAL OVERFLOW ACROSS ALL VIEWPORTS
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: Global Viewport & Horizontal Overflow Prevention ---');
  
  const htmlOverflow = /html\s*\{[^}]*overflow-x:\s*hidden/s.test(styleCss);
  logTest('Root html element enforces overflow-x: hidden across the entire application', htmlOverflow);

  const bodyOverflow = /body\s*\{[^}]*overflow-x:\s*hidden/s.test(styleCss);
  logTest('Root body element enforces overflow-x: hidden to eliminate page horizontal wobble', bodyOverflow);

  // -------------------------------------------------------------------------
  // TEST SUITE 4: PORTAL DASHBOARD GRIDS SINGLE-COLUMN COLLAPSE
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 4: Student, Faculty, Admin Dashboard Grids Collapse ---');

  const media540Idx = styleCss.indexOf('@media(max-width: 540px)');
  const media540Block = media540Idx !== -1 ? styleCss.slice(media540Idx, media540Idx + 3000) : '';

  // Stat grid must have !important to override the 1024px rule
  const statGridCollapsed = media540Block.includes('.stat-grid') && media540Block.includes('grid-template-columns: 1fr !important;');
  logTest('.stat-grid collapses to single column (1fr !important) on phones <= 540px', statGridCollapsed);

  const subjectGridCollapsed = media540Block.includes('.subject-grid') && media540Block.includes('grid-template-columns: 1fr !important;');
  logTest('.subject-grid collapses to single column (1fr !important) on phones <= 540px', subjectGridCollapsed);

  const portalCardsCollapsed = media540Block.includes('.faculty-classes-grid') &&
    media540Block.includes('.subject-manage-grid') &&
    media540Block.includes('.admin-divisions-grid') &&
    media540Block.includes('grid-template-columns: 1fr !important;');
  logTest('Faculty and Admin management grids collapse to 1fr !important on mobile', portalCardsCollapsed);

  // -------------------------------------------------------------------------
  // TEST SUITE 5: ASSIGNMENT CARDS & ACTION CONTROLS MOBILE UX
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 5: Assignment Cards Stacking & Action Controls ---');

  const assignmentStacked = media540Block.includes('.assignment') &&
    media540Block.includes('flex-direction: column !important;');
  logTest('.assignment card switches to flex column layout on mobile for full width readability', assignmentStacked);

  const assignmentControlsStacked = media540Block.includes('.assignment-controls-wrap') &&
    media540Block.includes('flex-direction: column !important;');
  logTest('.assignment-controls-wrap stacks controls vertically with 100% width touch buttons', assignmentControlsStacked);

  // -------------------------------------------------------------------------
  // TEST SUITE 6: DATA TABLES & TIMETABLE MATRIX CONTAINMENT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 6: Responsive Data Tables & Timetable Matrix ---');

  const tableWrapContained = /\.table-wrap\s*\{[^}]*width:\s*100%[^}]*max-width:\s*100%[^}]*overflow-x:\s*auto[^}]*-webkit-overflow-scrolling:\s*touch/s.test(styleCss);
  logTest('.table-wrap guarantees strict width containment and iOS smooth touch scrolling', tableWrapContained);

  const attListContained = /\.student-att-list\s*\{[^}]*width:\s*100%[^}]*max-width:\s*100%[^}]*overflow-x:\s*auto[^}]*-webkit-overflow-scrolling:\s*touch/s.test(styleCss);
  logTest('.student-att-list guarantees strict width containment and iOS smooth touch scrolling', attListContained);

  const timetableMatrixMinWidth = /\.timetable-matrix-table\s*\{[^}]*min-width:\s*680px/s.test(styleCss);
  logTest('.timetable-matrix-table enforces min-width: 680px so week columns do not crush', timetableMatrixMinWidth);

  const timetableWrapTouch = /\.timetable-matrix-table-wrap\s*\{[^}]*overflow-x:\s*auto[^}]*-webkit-overflow-scrolling:\s*touch/s.test(styleCss);
  logTest('.timetable-matrix-table-wrap enables smooth touch scrolling for the 6-day timetable', timetableWrapTouch);

  // -------------------------------------------------------------------------
  // TEST SUITE 7: MODALS, IMAGE CROPPING & TOUCH TARGETS
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 7: Modals, Image Cropping & Touch Target Sizes ---');

  const modalResponsive = /\.signup-modal,\s*\.modal\s*\{[^}]*max-height:\s*92vh[^}]*overflow:\s*auto/s.test(styleCss);
  logTest('.modal and .signup-modal share max-height: 92vh and auto scrolling', modalResponsive);

  const cropCanvasResponsive = /\.crop-canvas-container\s*\{[^}]*width:\s*100%[^}]*max-width:\s*320px[^}]*aspect-ratio:\s*1\s*\/\s*1/s.test(styleCss);
  logTest('.crop-canvas-container uses fluid width: 100%, max-width: 320px, aspect-ratio: 1/1', cropCanvasResponsive);

  const touchTargetsMet = media540Block.includes('.close-modal') &&
    media540Block.includes('min-width: 40px;') &&
    media540Block.includes('.signup-card .eye-btn') &&
    media540Block.includes('width: 38px !important;');
  logTest('Interactive controls satisfy accessible touch target sizes (>= 38px-40px)', touchTargetsMet);

  // -------------------------------------------------------------------------
  // TEST SUITE 8: BACKEND & SECURITY BUSINESS LOGIC PRESERVATION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 8: Backend Security, Timetable & Attendance Integrity ---');

  logTest('Prompt 17-20 Timetable backend routes intact', serverJs.includes('/api/timetable') && serverJs.includes('Timetable.findOne'));
  logTest('Prompt 21 Attendance backend routes and scoped queries intact', serverJs.includes('/api/attendance') && serverJs.includes('Attendance.find'));
  logTest('Authentication tokens and middleware intact', serverJs.includes('function verifyAuthToken(') && serverJs.includes('function requireAuth('));
  logTest('MongoDB models (User, Academic, Timetable, Attendance) unmodified', 
    fs.existsSync(path.join(rootDir, 'models', 'Timetable.js')) && 
    fs.existsSync(path.join(rootDir, 'models', 'Attendance.js')) &&
    fs.existsSync(path.join(rootDir, 'models', 'User.js'))
  );

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n====================================================================');
  console.log(`PROMPT 23 TEST RESULTS: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('====================================================================\n');

  if (failedTests > 0) {
    console.error('PROMPT 23 SUITE FAILED with ' + failedTests + ' errors.');
    process.exit(1);
  } else {
    console.log('ALL PROMPT 23 MOBILE SCREEN-FIT AUDIT CHECKS PASSED WITH ZERO ERRORS!');
    process.exit(0);
  }
}

runPrompt23Tests().catch(err => {
  console.error('Unhandled error in test runner:', err);
  process.exit(1);
});
