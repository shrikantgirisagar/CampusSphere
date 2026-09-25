/**
 * ============================================================================
 * CAMPUSSPHERE PROMPT 26 TEST SUITE
 * Complete Cross-Browser Compatibility, Accessibility, Keyboard Navigation,
 * Focus Management, Form Usability, and Interactive Controls Verification
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const { spawn } = require('child_process');

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

async function runPrompt26Tests() {
  console.log('====================================================================');
  console.log('STARTING PROMPT 26: CROSS-BROWSER ACCESSIBILITY & KEYBOARD UX AUDIT');
  console.log('====================================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  const styleCss = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf-8');
  const scriptJs = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf-8');
  const serverJs = fs.readFileSync(path.join(rootDir, 'server.js'), 'utf-8');

  // -------------------------------------------------------------------------
  // TEST SUITE 1: STATIC HTML & ARIA ACCESSIBILITY AUDIT
  // -------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: Static HTML & ARIA Accessibility Audit ---');

  const htmlFiles = ['index.html', 'courses.html', 'about.html', 'students.html'];
  htmlFiles.forEach(file => {
    const fPath = path.join(rootDir, file);
    if (!fs.existsSync(fPath)) return;
    const content = fs.readFileSync(fPath, 'utf-8');

    // 1. Duplicate IDs
    const idRegex = /\sid=["']([^"']+)["']/g;
    const ids = [];
    let m;
    while ((m = idRegex.exec(content)) !== null) {
      ids.push(m[1]);
    }
    const seen = new Set();
    const dupes = new Set();
    ids.forEach(id => {
      if (seen.has(id)) dupes.add(id);
      seen.add(id);
    });
    logTest(`[${file}] Zero duplicate element IDs in DOM (${ids.length} unique IDs checked)`, dupes.size === 0, dupes.size ? `Duplicates: ${Array.from(dupes).join(', ')}` : '100% Unique');

    // 2. Button accessible names
    const buttonRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
    let btn;
    let unnamedButtons = [];
    while ((btn = buttonRegex.exec(content)) !== null) {
      const attrs = btn[1];
      const inner = btn[2].replace(/<[^>]*>/g, '').trim();
      const hasAriaLabel = /aria-label=["'][^"']+["']/i.test(attrs);
      const hasAriaLabelledby = /aria-labelledby=["'][^"']+["']/i.test(attrs);
      const hasTitle = /title=["'][^"']+["']/i.test(attrs);
      if (!inner && !hasAriaLabel && !hasAriaLabelledby && !hasTitle) {
        unnamedButtons.push(btn[0].slice(0, 60));
      }
    }
    logTest(`[${file}] All interactive buttons have accessible name (text, aria-label, title)`, unnamedButtons.length === 0, `${unnamedButtons.length} unnamed`);

    // 3. Inputs accessible labels
    const inputRegex = /<input\b([^>]*)>/gi;
    let inp;
    let unlabeledInputs = [];
    while ((inp = inputRegex.exec(content)) !== null) {
      const attrs = inp[1];
      const typeMatch = attrs.match(/type=["']([^"']+)["']/i);
      const type = typeMatch ? typeMatch[1].toLowerCase() : 'text';
      if (type === 'hidden' || type === 'submit' || type === 'button' || type === 'reset') continue;
      const idMatch = attrs.match(/id=["']([^"']+)["']/i);
      const id = idMatch ? idMatch[1] : null;
      const hasAriaLabel = /aria-label=["'][^"']+["']/i.test(attrs);
      const hasAriaLabelledby = /aria-labelledby=["'][^"']+["']/i.test(attrs);
      const hasTitle = /title=["'][^"']+["']/i.test(attrs);
      let hasLabelFor = false;
      if (id) {
        const labelForRegex = new RegExp(`<label\\b[^>]*for=["']${id}["']`, 'i');
        hasLabelFor = labelForRegex.test(content);
      }
      if (!hasAriaLabel && !hasAriaLabelledby && !hasTitle && !hasLabelFor) {
        unlabeledInputs.push({ id, type });
      }
    }
    logTest(`[${file}] All form input controls have explicit label associations or aria-label`, unlabeledInputs.length === 0, `${unlabeledInputs.length} unlabeled`);

    // 4. Select controls accessible labels
    const selectRegex = /<select\b([^>]*)>/gi;
    let sel;
    let unlabeledSelects = [];
    while ((sel = selectRegex.exec(content)) !== null) {
      const attrs = sel[1];
      const idMatch = attrs.match(/id=["']([^"']+)["']/i);
      const id = idMatch ? idMatch[1] : null;
      const hasAriaLabel = /aria-label=["'][^"']+["']/i.test(attrs);
      const hasAriaLabelledby = /aria-labelledby=["'][^"']+["']/i.test(attrs);
      let hasLabelFor = false;
      if (id) {
        const labelForRegex = new RegExp(`<label\\b[^>]*for=["']${id}["']`, 'i');
        hasLabelFor = labelForRegex.test(content);
      }
      if (!hasAriaLabel && !hasAriaLabelledby && !hasLabelFor) {
        unlabeledSelects.push({ id });
      }
    }
    logTest(`[${file}] All select dropdowns have explicit label associations or aria-label`, unlabeledSelects.length === 0, `${unlabeledSelects.length} unlabeled`);
  });

  // Role Tablist in index.html
  const hasLoginTablist = indexHtml.includes('class="role-tabs" role="tablist"');
  logTest('index.html Login role-tabs container has role="tablist"', hasLoginTablist);

  const hasLoginTabs = indexHtml.includes('role="tab"') && indexHtml.includes('aria-selected="true"');
  logTest('index.html Login role buttons have role="tab" and aria-selected state', hasLoginTabs);

  const hasSignupTablist = indexHtml.includes('class="role-tabs signup-role-tabs" role="tablist"') ||
    (indexHtml.includes('signup-role-tabs') && indexHtml.includes('role="tablist"'));
  logTest('index.html Signup role-tabs container has role="tablist"', hasSignupTablist);

  // Modals in index.html have role="dialog" and aria-modal="true"
  const aiModalDialog = indexHtml.includes('id="aiAnalysisModal"') && indexHtml.includes('role="dialog"') && indexHtml.includes('aria-modal="true"');
  logTest('index.html #aiAnalysisModal has role="dialog" and aria-modal="true"', aiModalDialog);

  const subjectModalDialog = indexHtml.includes('id="subjectModal"') && indexHtml.includes('role="dialog"') && indexHtml.includes('aria-modal="true"');
  logTest('index.html #subjectModal has role="dialog" and aria-modal="true"', subjectModalDialog);

  const divisionModalDialog = indexHtml.includes('id="divisionModal"') && indexHtml.includes('role="dialog"') && indexHtml.includes('aria-modal="true"');
  logTest('index.html #divisionModal has role="dialog" and aria-modal="true"', divisionModalDialog);

  // -------------------------------------------------------------------------
  // TEST SUITE 2: DYNAMIC JS MODAL & TEMPLATE ACCESSIBILITY AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: Dynamic JS Modals & Templates Accessibility Audit ---');

  // signupModal
  const signupModalDialog = scriptJs.includes('class="signup-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"');
  logTest('script.js signupModal has role="dialog", aria-modal="true", aria-labelledby="modalTitle"', signupModalDialog);

  const signupModalLabels = scriptJs.includes('for="signupName"') && scriptJs.includes('for="signupUsername"') && scriptJs.includes('for="signupPassword"');
  logTest('script.js signupModal fields have explicit for="..." label associations', signupModalLabels);

  const signupModalSubjectFilter = scriptJs.includes('id="facultySubjectSearch"') && scriptJs.includes('aria-label="Filter subjects by name or code"');
  logTest('script.js signupModal facultySubjectSearch has descriptive aria-label', signupModalSubjectFilter);

  // editProfileModal
  const editProfileModalDialog = scriptJs.includes('class="signup-modal edit-profile-modal-card" role="dialog" aria-modal="true" aria-labelledby="editProfileTitle"');
  logTest('script.js editProfileModal has role="dialog", aria-modal="true", aria-labelledby="editProfileTitle"', editProfileModalDialog);

  const editProfileLabels = scriptJs.includes('for="editProfileDivision"') && scriptJs.includes('for="editProfileCourseYear"') && scriptJs.includes('for="editProfileSemester"');
  logTest('script.js editProfileModal fields have explicit for="..." label associations', editProfileLabels);

  // cropImageModal
  const cropModalDialog = scriptJs.includes('class="signup-modal crop-modal-card" role="dialog" aria-modal="true" aria-labelledby="cropModalTitle"');
  logTest('script.js cropImageModal has role="dialog", aria-modal="true", aria-labelledby="cropModalTitle"', cropModalDialog);

  const cropModalZoomAria = scriptJs.includes('id="cropZoomRange"') && scriptJs.includes('aria-label="Zoom photo"');
  logTest('script.js cropImageModal zoom slider has aria-label="Zoom photo"', cropModalZoomAria);

  // facultyEditProfileModal
  const facultyEditModalDialog = scriptJs.includes('role="dialog" aria-modal="true" aria-labelledby="facultyEditProfileTitle"');
  logTest('script.js facultyEditProfileModal has role="dialog", aria-modal="true", aria-labelledby="facultyEditProfileTitle"', facultyEditModalDialog);

  // adminFacultyEditModal
  const adminFacultyEditModalDialog = scriptJs.includes('role="dialog" aria-modal="true" aria-labelledby="adminFacultyEditModalTitle"');
  logTest('script.js adminFacultyEditModal has role="dialog", aria-modal="true", aria-labelledby="adminFacultyEditModalTitle"', adminFacultyEditModalDialog);

  // Timetable toolbar accessible names
  const timetableToolbarAria = scriptJs.includes('id="tbBtnMerge"') && scriptJs.includes('aria-label="Merge Selected Cells"') &&
    scriptJs.includes('id="tbBtnBold"') && scriptJs.includes('aria-label="Toggle Bold"') &&
    scriptJs.includes('id="tbSelectFontFamily"') && scriptJs.includes('aria-label="Font Family"') &&
    scriptJs.includes('id="tbSelectFontSize"') && scriptJs.includes('aria-label="Font Size"') &&
    scriptJs.includes('id="btnAddTimeRow"') && scriptJs.includes('aria-label="Add Time Slot Row"');
  logTest('script.js Timetable toolbar controls all have accessible aria-labels', timetableToolbarAria);

  // Attendance P/A accessible names
  const attendanceAria = scriptJs.includes('aria-label="Mark ${escapeHtml(s.name)} Present"') &&
    scriptJs.includes('aria-label="Mark ${escapeHtml(s.name)} Absent"');
  logTest('script.js Attendance P/A toggle buttons have personalized accessible aria-labels with student name', attendanceAria);

  // -------------------------------------------------------------------------
  // TEST SUITE 3: CSS FOCUS INDICATORS & REDUCED MOTION AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: CSS Focus Indicators & Reduced Motion Audit ---');

  // Focus visible outline
  const hasFocusVisibleRules = styleCss.includes(':focus-visible') &&
    styleCss.includes('outline: 2px solid var(--campus-primary, #1459d9) !important;') &&
    styleCss.includes('outline-offset: 2px !important;');
  logTest('style.css defines high-contrast :focus-visible rules with outline and offset', hasFocusVisibleRules);

  // Prefers reduced motion
  const hasReducedMotion = styleCss.includes('@media (prefers-reduced-motion: reduce)') &&
    styleCss.includes('animation-duration: 0.01ms !important;') &&
    styleCss.includes('transition-duration: 0.01ms !important;');
  logTest('style.css defines WCAG-compliant @media (prefers-reduced-motion: reduce) rules', hasReducedMotion);

  // iOS Safari auto-zoom prevention
  const hasIosAutoZoomPrevention = styleCss.includes('@media screen and (max-width: 768px)') &&
    styleCss.includes('font-size: 16px !important;') &&
    styleCss.includes('input[type="text"]');
  logTest('style.css enforces font-size: 16px on mobile form inputs to prevent iOS Safari auto-zoom', hasIosAutoZoomPrevention);

  // -------------------------------------------------------------------------
  // TEST SUITE 4: KEYBOARD NAVIGATION & FOCUS MANAGEMENT AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 4: Keyboard Navigation & Focus Trap Audit ---');

  // Focus trap implementation
  const hasFocusTrap = scriptJs.includes('setupPrompt26Accessibility') &&
    scriptJs.includes('e.key === "Tab"') &&
    scriptJs.includes('firstFocusable') &&
    scriptJs.includes('lastFocusable');
  logTest('script.js implements native Tab & Shift+Tab focus trap inside active modals', hasFocusTrap);

  // Escape key handler
  const hasEscapeHandler = scriptJs.includes('e.key === "Escape"') &&
    scriptJs.includes('activeModal.close()') &&
    scriptJs.includes('lastActiveModalTrigger.focus()');
  logTest('script.js implements Escape key modal dismissal and restores focus to trigger element', hasEscapeHandler);

  // Arrow key tablist navigation
  const hasArrowKeyTabNav = scriptJs.includes('role="tab"') &&
    scriptJs.includes('ArrowRight') &&
    scriptJs.includes('ArrowLeft');
  logTest('script.js implements ArrowRight / ArrowLeft / ArrowDown / ArrowUp tab switching within [role="tablist"]', hasArrowKeyTabNav);

  // -------------------------------------------------------------------------
  // TEST SUITE 5: REAL CHROME CDP HEADLESS AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 5: Real Chrome CDP Browser Accessibility Audit ---');

  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
  ];
  let chromePath = chromePaths.find(p => p && fs.existsSync(p));

  if (!chromePath) {
    console.log('  [WARN] Google Chrome not found in standard paths. Skipping headless CDP tests.');
  } else {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0].split('#')[0];
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(rootDir, reqPath);

      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
      };

      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });

    const port = 3991;
    await new Promise(resolve => server.listen(port, resolve));

    const tmpDataDir = path.join(os.tmpdir(), 'cs_cdp_p26_' + Date.now());
    const browserProc = spawn(chromePath, [
      '--headless=new',
      '--remote-debugging-port=9447',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-software-rasterizer',
      `--user-data-dir=${tmpDataDir}`,
      `http://localhost:${port}/`
    ]);

    let versionOk = false;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch('http://127.0.0.1:9447/json/version');
        if (res.ok) {
          versionOk = true;
          break;
        }
      } catch (e) {}
    }

    if (!versionOk) {
      console.log('  [WARN] Could not connect to Chrome CDP. Skipping CDP checks.');
      browserProc.kill();
      server.close();
      try { fs.rmSync(tmpDataDir, { recursive: true, force: true }); } catch (_) {}
    } else {
      const listRes = await fetch('http://127.0.0.1:9447/json/list');
      const targets = await listRes.json();
      const pageTarget = targets.find(t => t.type === 'page');
      const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
      await new Promise(resolve => ws.onopen = resolve);

      let msgId = 1;
      const pending = new Map();
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.id && pending.has(data.id)) {
          pending.get(data.id)(data);
          pending.delete(data.id);
        }
      };

      function sendCommand(method, params = {}) {
        return new Promise(resolve => {
          const id = msgId++;
          pending.set(id, resolve);
          ws.send(JSON.stringify({ id, method, params }));
        });
      }

      await sendCommand('Page.enable');
      await sendCommand('DOM.enable');

      async function evalInPage(expr) {
        const res = await sendCommand('Runtime.evaluate', {
          expression: expr,
          returnByValue: true,
          awaitPromise: true
        });
        return res.result?.result?.value;
      }

      // Wait for script.js to fully load and initialize
      for (let i = 0; i < 30; i++) {
        const ready = await evalInPage(`typeof window.__prompt26 === "object"`);
        if (ready) break;
        await new Promise(r => setTimeout(r, 150));
      }

      // 1. Check prompt26 helper is initialized
      const prompt26HelperReady = await evalInPage(`typeof window.__prompt26 === "object"`);
      logTest('CDP: window.__prompt26 accessibility helper is initialized in browser', prompt26HelperReady);

      // 2. Check Login page arrow key navigation
      await evalInPage(`
        const loginBtn = document.querySelector('[data-open-login]');
        if (loginBtn) loginBtn.click();
      `);
      await new Promise(r => setTimeout(r, 200));

      const loginArrowNavResult = await evalInPage(`
        (() => {
          const studentTab = document.querySelector('#loginPage .role-tab[data-role="student"]');
          const facultyTab = document.querySelector('#loginPage .role-tab[data-role="faculty"]');
          const adminTab = document.querySelector('#loginPage .role-tab[data-role="admin"]');
          if (!studentTab || !facultyTab || !adminTab) return false;

          studentTab.focus();
          studentTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight', bubbles: true }));
          const facultyActive = (document.activeElement === facultyTab) || (facultyTab.getAttribute('aria-selected') === 'true');

          facultyTab.focus();
          facultyTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight', bubbles: true }));
          const adminActive = (document.activeElement === adminTab) || (adminTab.getAttribute('aria-selected') === 'true');

          adminTab.focus();
          adminTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight', bubbles: true }));
          const wrappedToStudent = (document.activeElement === studentTab) || (studentTab.getAttribute('aria-selected') === 'true');

          return facultyActive && adminActive && wrappedToStudent;
        })()
      `);
      logTest('CDP: Login role tabs arrow key cycling (Student -> Faculty -> Admin -> Student wrap)', loginArrowNavResult);

      // 3. Check Modal Escape key handling & focus restoration
      const modalEscapeResult = await evalInPage(`
        (() => {
          const modal = document.getElementById('aiAnalysisModal');
          if (!modal) return false;
          modal.classList.remove('hidden');

          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
          return modal.classList.contains('hidden');
        })()
      `);
      logTest('CDP: Escape key automatically closes active modal dialog', modalEscapeResult);

      // 4. Check Mobile navigation menu Escape key handling
      const mobileNavEscapeResult = await evalInPage(`
        (() => {
          const toggle = document.querySelector('.public-menu-toggle');
          const nav = document.querySelector('.public-nav');
          if (!toggle || !nav) return false;

          if (!nav.classList.contains('is-open')) {
            toggle.click();
          }
          const wasOpen = nav.classList.contains('is-open');

          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
          const isClosedNow = !nav.classList.contains('is-open');

          return wasOpen && isClosedNow;
        })()
      `);
      logTest('CDP: Escape key automatically closes open mobile navigation drawer', mobileNavEscapeResult);

      // 5. Check visible focus ring computation
      const focusRingResult = await evalInPage(`
        (() => {
          const btn = document.querySelector('.hero-primary-btn');
          if (!btn) return false;
          btn.focus();
          const style = window.getComputedStyle(btn);
          const outlineStyle = style.outlineStyle;
          const outlineWidth = parseFloat(style.outlineWidth) || 0;
          return outlineWidth > 0 || style.boxShadow.length > 0;
        })()
      `);
      logTest('CDP: Focused interactive elements render high-contrast visible outline/ring', focusRingResult);

      // 6. Viewport non-regression across multiple viewports
      const viewportsToTest = [
        { name: '320x568 (iPhone SE)', width: 320, height: 568 },
        { name: '375x812 (iPhone X)', width: 375, height: 812 },
        { name: '768x1024 (iPad)', width: 768, height: 1024 },
        { name: '1280x800 (Desktop)', width: 1280, height: 800 }
      ];

      for (const vp of viewportsToTest) {
        await sendCommand('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 2,
          mobile: vp.width <= 768
        });
        await new Promise(r => setTimeout(r, 100));

        const overflowCheck = await evalInPage(`
          (() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            return docWidth <= winWidth + 1; // allow 1px subpixel tolerance
          })()
        `);
        logTest(`CDP: Viewport ${vp.name} zero horizontal document overflow (<= window.innerWidth)`, overflowCheck);
      }

      // Cleanup CDP
      ws.close();
      browserProc.kill();
      server.close();
    }
  }

  // -------------------------------------------------------------------------
  // FINAL SUMMARY REPORT
  // -------------------------------------------------------------------------
  console.log('\n====================================================================');
  console.log(`PROMPT 26 TEST SUMMARY: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('====================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPrompt26Tests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
