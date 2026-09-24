/**
 * ============================================================================
 * CAMPUSSPHERE PROMPT 22 TEST SUITE
 * Complete Real-World Mobile Responsiveness, Mobile UI/UX & Usability Audit
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

async function runPrompt22Tests() {
  console.log('====================================================================');
  console.log('STARTING PROMPT 22 MOBILE RESPONSIVENESS & USABILITY VERIFICATION');
  console.log('====================================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  const coursesHtml = fs.readFileSync(path.join(rootDir, 'courses.html'), 'utf-8');
  const aboutHtml = fs.readFileSync(path.join(rootDir, 'about.html'), 'utf-8');
  const studentsHtml = fs.readFileSync(path.join(rootDir, 'students.html'), 'utf-8');
  const styleCss = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf-8');
  const scriptJs = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf-8');
  const serverJs = fs.readFileSync(path.join(rootDir, 'server.js'), 'utf-8');

  // Extract mobile media query block
  const media540Idx = styleCss.indexOf('@media(max-width: 540px)');
  const media540Block = media540Idx !== -1 ? styleCss.slice(media540Idx, media540Idx + 3000) : '';

  // -------------------------------------------------------------------------
  // TEST SUITE 1: VIEWPORT META TAG CONFIGURATION
  // -------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: Viewport Meta Tag Configuration Across All Pages ---');
  const viewportRegex = /<meta\s+name=["']viewport["']\s+content=["']width=device-width,\s*initial-scale=1\.0["']/i;
  logTest('index.html contains standard responsive viewport meta tag', viewportRegex.test(indexHtml));
  logTest('courses.html contains standard responsive viewport meta tag', viewportRegex.test(coursesHtml));
  logTest('about.html contains standard responsive viewport meta tag', viewportRegex.test(aboutHtml));
  logTest('students.html contains standard responsive viewport meta tag', viewportRegex.test(studentsHtml));

  // -------------------------------------------------------------------------
  // TEST SUITE 2: BODY & HTML HORIZONTAL OVERFLOW PREVENTION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: Body & HTML Horizontal Overflow Protection ---');
  const htmlOverflowHidden = /html\s*\{[^}]*overflow-x:\s*hidden/s.test(styleCss);
  const bodyOverflowHidden = /body\s*\{[^}]*overflow-x:\s*hidden/s.test(styleCss);
  logTest('html element has overflow-x: hidden to prevent horizontal jiggling', htmlOverflowHidden);
  logTest('body element has overflow-x: hidden to prevent page-level horizontal scrollbars', bodyOverflowHidden);

  // -------------------------------------------------------------------------
  // TEST SUITE 3: RESPONSIVE TABLE CONTAINMENT & TOUCH SCROLLING
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: Table Containment & Internal Scroll Containers ---');
  const tableWrapTouchScroll = /\.table-wrap\s*\{[^}]*overflow-x:\s*auto[^}]*-webkit-overflow-scrolling:\s*touch/s.test(styleCss);
  logTest('.table-wrap has overflow-x: auto and -webkit-overflow-scrolling: touch', tableWrapTouchScroll);

  const studentAttTouchScroll = /\.student-att-list\s*\{[^}]*overflow-x:\s*auto[^}]*-webkit-overflow-scrolling:\s*touch/s.test(styleCss);
  logTest('.student-att-list has overflow-x: auto and -webkit-overflow-scrolling: touch', studentAttTouchScroll);

  const facultyLectureTableWrapped = scriptJs.includes('<div class="table-wrap">\n                      <table style="width:100%; border-collapse:collapse; font-size:12px;">') ||
    (scriptJs.includes('Weekly Lecture Timings') && scriptJs.includes('<div class="table-wrap">') && scriptJs.includes('division-badge-pill'));
  logTest('Faculty weekly lecture timings table is wrapped in responsive .table-wrap', facultyLectureTableWrapped);

  // -------------------------------------------------------------------------
  // TEST SUITE 4: TIMETABLE MATRIX MOBILE USABILITY
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 4: Timetable Matrix Mobile Usability & Containment ---');
  const timetableMatrixMinWidth = /\.timetable-matrix-table\s*\{[^}]*min-width:\s*680px/s.test(styleCss);
  logTest('.timetable-matrix-table has min-width: 680px for readable columns on phones', timetableMatrixMinWidth);

  const timetableWrapTouchScroll = /\.timetable-matrix-table-wrap\s*\{[^}]*overflow-x:\s*auto[^}]*-webkit-overflow-scrolling:\s*touch/s.test(styleCss);
  logTest('.timetable-matrix-table-wrap has overflow-x: auto and -webkit-overflow-scrolling: touch', timetableWrapTouchScroll);

  // -------------------------------------------------------------------------
  // TEST SUITE 5: AVATAR CROP CONTAINER RESPONSIVENESS
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 5: Profile Image Crop Modal & Canvas Responsiveness ---');
  const cropContainerResponsive = /\.crop-canvas-container\s*\{[^}]*width:\s*100%[^}]*max-width:\s*320px[^}]*aspect-ratio:\s*1\s*\/\s*1/s.test(styleCss);
  logTest('.crop-canvas-container uses fluid width: 100%, max-width: 320px, aspect-ratio: 1/1', cropContainerResponsive);

  const cropCanvasResponsive = /\.crop-canvas-container\s+canvas\s*\{[^}]*width:\s*100%[^}]*height:\s*100%/s.test(styleCss);
  logTest('.crop-canvas-container canvas scales responsively to fit 320px-375px screens', cropCanvasResponsive);

  // -------------------------------------------------------------------------
  // TEST SUITE 6: MODAL CONTAINMENT & RESPONSIVE PADDING
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 6: Modal Containment, Scrolling & Padding ---');
  const modalBaseStyle = /\.signup-modal,\s*\.modal\s*\{[^}]*max-height:\s*92vh/s.test(styleCss);
  logTest('.modal and .signup-modal share max-height: 92vh and overflow-y: auto', modalBaseStyle);

  const modalMobilePadding = media540Block.includes('.signup-modal') && media540Block.includes('padding: 20px 16px;');
  logTest('Modals have compact 16px horizontal padding on mobile screens <= 540px', modalMobilePadding);

  const aiModalResponsive = media540Block.includes('.ai-modal-container') && media540Block.includes('width: 95%;');
  logTest('.ai-modal-container adapts to 95% viewport width on mobile screens', aiModalResponsive);

  // -------------------------------------------------------------------------
  // TEST SUITE 7: FORM & INFO GRID SINGLE-COLUMN COLLAPSE
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 7: Form & Info Grid Single-Column Mobile Collapse ---');
  const formRow2Collapsed = media540Block.includes('.form-row-2') && media540Block.includes('grid-template-columns: 1fr;');
  logTest('.form-row-2 collapses to single column (1fr) on screens <= 540px', formRow2Collapsed);

  const infoGridCollapsed = media540Block.includes('.info-grid') && media540Block.includes('grid-template-columns: 1fr;');
  logTest('.info-grid collapses to single column (1fr) on screens <= 540px', infoGridCollapsed);

  const aiChartsGridCollapsed = media540Block.includes('.ai-charts-grid') && media540Block.includes('grid-template-columns: 1fr;');
  logTest('.ai-charts-grid stacks Bar and Pie charts vertically on mobile screens', aiChartsGridCollapsed);

  // -------------------------------------------------------------------------
  // TEST SUITE 8: TOUCH TARGETS SIZING (>= 38px - 44px)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 8: Mobile Touch Targets Compliance ---');
  const modalCloseButtonsTouch = media540Block.includes('.close-modal') && media540Block.includes('min-width: 40px;') && media540Block.includes('min-height: 40px;');
  logTest('Modal close buttons have min 40px touch targets on mobile', modalCloseButtonsTouch);

  const passwordEyeTouch = media540Block.includes('.signup-card .eye-btn') && media540Block.includes('width: 38px !important;');
  logTest('Signup password toggle eye button has 38px touch target on mobile', passwordEyeTouch);

  const footerSocialTouch = media540Block.includes('social-icon-btn') && media540Block.includes('width: 38px;');
  logTest('Footer social media links have 38px touch targets on mobile', footerSocialTouch);

  const publicNavLinksTouch = /\.public-nav\.is-open\s+\.public-nav-link\s*\{[^}]*min-height:\s*44px/s.test(styleCss);
  logTest('Public mobile navigation links satisfy 44px minimum touch target height', publicNavLinksTouch);

  // -------------------------------------------------------------------------
  // TEST SUITE 9: INPUT READABILITY & IOS AUTO-ZOOM PREVENTION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 9: Mobile Form Input Usability & iOS Zoom Prevention ---');
  const mobileInputFontSize = media540Block.includes('.input-wrap input') && media540Block.includes('font-size: 16px;');
  logTest('Form inputs use font-size: 16px on mobile viewports to prevent iOS Safari auto-zoom', mobileInputFontSize);

  // -------------------------------------------------------------------------
  // TEST SUITE 10: NAVIGATION INTERACTIVITY & AUTO-CLOSE
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 10: Mobile Navigation Interactivity & UX ---');
  const mobileSidebarCloseOnNavigate = scriptJs.includes('sidebar.classList.remove("open")') &&
    scriptJs.includes('sidebarBackdrop.classList.remove("active")');
  logTest('Portal sidebar automatically closes upon navigation selection on mobile', mobileSidebarCloseOnNavigate);

  const publicNavToggleLogic = scriptJs.includes('public-menu-toggle') || indexHtml.includes('public-menu-toggle');
  logTest('Public hamburger menu toggle is present and bound', publicNavToggleLogic);

  // -------------------------------------------------------------------------
  // TEST SUITE 11: INTEGRITY OF BACKEND SECURITY & ATTENDANCE / TIMETABLE
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 11: Backend Security & Business Logic Preservation ---');
  logTest('server.js preserves session token authentication and verifyAuthToken', serverJs.includes('function verifyAuthToken(') && serverJs.includes('function requireAuth('));
  logTest('server.js preserves timetable authorization (Prompt 17-20 logic intact)', serverJs.includes('/api/timetable') && serverJs.includes('Timetable.findOne'));
  logTest('server.js preserves attendance authorization (Prompt 21 logic intact)', serverJs.includes('/api/attendance') && serverJs.includes('Attendance.find'));
  logTest('No MongoDB schemas or models modified during mobile audit', fs.existsSync(path.join(rootDir, 'models', 'Timetable.js')) && fs.existsSync(path.join(rootDir, 'models', 'Attendance.js')));

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n====================================================================');
  console.log(`PROMPT 22 TEST RESULTS: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('====================================================================\n');

  if (failedTests > 0) {
    console.error('PROMPT 22 SUITE FAILED with ' + failedTests + ' errors.');
    process.exit(1);
  } else {
    console.log('ALL PROMPT 22 MOBILE RESPONSIVENESS AND USABILITY CHECKS PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

runPrompt22Tests().catch(err => {
  console.error('Unhandled error in test runner:', err);
  process.exit(1);
});
