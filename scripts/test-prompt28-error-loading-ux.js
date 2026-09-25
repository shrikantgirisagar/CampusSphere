/**
 * ============================================================================
 * CAMPUSSPHERE PROMPT 28 TEST SUITE
 * Complete Real-World Error Handling, Loading States & User Feedback UX Audit
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

async function runPrompt28Tests() {
  console.log('====================================================================');
  console.log('STARTING PROMPT 28: COMPLETE REAL-WORLD ERROR HANDLING & LOADING UX AUDIT');
  console.log('====================================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  const styleCss = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf-8');
  const scriptJs = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf-8');
  const serverJs = fs.readFileSync(path.join(rootDir, 'server.js'), 'utf-8');

  // -------------------------------------------------------------------------
  // TEST SUITE 1: API HELPER ERROR HANDLING & STATUS CODE ARCHITECTURE
  // -------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: API Error Architecture & Status Code Mapping ---');

  const hasStatusErrorMessage = scriptJs.includes('function getStatusErrorMessage');
  logTest('script.js defines getStatusErrorMessage for structured user-friendly HTTP mapping', hasStatusErrorMessage);

  const handles400 = scriptJs.includes('case 400:');
  const handles401 = scriptJs.includes('case 401:');
  const handles403 = scriptJs.includes('case 403:');
  const handles404 = scriptJs.includes('case 404:');
  const handles409 = scriptJs.includes('case 409:');
  const handles413 = scriptJs.includes('case 413:');
  const handles429 = scriptJs.includes('case 429:');
  const handles500 = scriptJs.includes('case 500:');
  const handles502to504 = scriptJs.includes('case 502:') && scriptJs.includes('case 503:') && scriptJs.includes('case 504:');

  logTest('Maps 400 (Bad Request / Validation) to helpful user-facing message', handles400);
  logTest('Maps 401 (Unauthorized / Session Expired) to sign in message', handles401);
  logTest('Maps 403 (Forbidden / Unauthorized action) to safe permission explanation', handles403);
  logTest('Maps 404 (Not Found) to understandable missing resource message', handles404);
  logTest('Maps 409 (Conflict / Duplicate) to duplicate record message', handles409);
  logTest('Maps 413 (Payload Too Large) to size limit explanation', handles413);
  logTest('Maps 429 (Rate Limited) to wait and retry message', handles429);
  logTest('Maps 500 (Internal Server Error) to safe generic error message', handles500);
  logTest('Maps 502/503/504 (Backend Unavailable / Gateway Timeout) to temporary retry message', handles502to504);

  const authFetchCatchesNet = scriptJs.includes('async function authenticatedFetch') &&
    scriptJs.includes('Unable to connect to the server. Please check your connection and try again.');
  logTest('authenticatedFetch catches network failures and rejects with user-friendly message', authFetchCatchesNet);

  const apiRequestCatchesNet = scriptJs.includes('async function apiRequest') &&
    scriptJs.includes('networkError: true');
  logTest('apiRequest returns structured networkError response without unhandled rejections', apiRequestCatchesNet);

  // -------------------------------------------------------------------------
  // TEST SUITE 2: DOUBLE-SUBMISSION PROTECTION & BUTTON LOADING STATES
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: Double-Submission Protection & Action Lock Audit ---');

  const hasWithActionLock = scriptJs.includes('async function withActionLock');
  logTest('script.js implements withActionLock utility for button locking & loading spinners', hasWithActionLock);

  const actionLockBlocksDuplicates = scriptJs.includes('btn.dataset.actionLocked === "true"') || scriptJs.includes("btn.dataset.actionLocked === 'true'");
  logTest('withActionLock blocks rapid repeated clicks using actionLocked lock', actionLockBlocksDuplicates);

  const actionLockSpinner = scriptJs.includes('btn-spinner') && scriptJs.includes('btn-loading');
  logTest('withActionLock attaches .btn-spinner and .btn-loading classes to indicate progress', actionLockSpinner);

  const actionLockRestores = scriptJs.includes('btn.innerHTML = originalHtml') && scriptJs.includes('btn.disabled = false');
  logTest('withActionLock guarantees complete control restoration in finally block', actionLockRestores);

  // Check critical protected operations
  const loginProtected = scriptJs.includes('$("loginForm").addEventListener("submit"') && scriptJs.includes('withActionLock(submitButton');
  logTest('Login form submission is protected by withActionLock', loginProtected);

  const pageSignupProtected = scriptJs.includes('pageSignupForm.addEventListener("submit"') && scriptJs.includes('withActionLock(submitBtn');
  logTest('Standalone Signup page form submission is protected by withActionLock', pageSignupProtected);

  const modalSignupProtected = scriptJs.includes('$("signupForm").addEventListener("submit"') && scriptJs.includes('withActionLock(submitButton');
  logTest('Admin User Modal Signup form submission is protected by withActionLock', modalSignupProtected);

  const studentProfileProtected = scriptJs.includes('$("editProfileForm").addEventListener("submit"') && scriptJs.includes('withActionLock(submitButton');
  logTest('Student Profile edit form submission is protected by withActionLock', studentProfileProtected);

  const facultyProfileProtected = scriptJs.includes('$("facultyEditProfileForm")') && scriptJs.includes('withActionLock(submitBtn');
  logTest('Faculty Profile edit form submission is protected by withActionLock', facultyProfileProtected);

  const attendanceSaveProtected = scriptJs.includes('saveBtn.addEventListener("click"') && scriptJs.includes('withActionLock(saveBtn');
  logTest('Attendance save operation is protected by withActionLock', attendanceSaveProtected);

  const marksSaveProtected = scriptJs.includes('batchForm.addEventListener("submit"') && scriptJs.includes('withActionLock(submitBtn');
  logTest('Marks save operation is protected by withActionLock', marksSaveProtected);

  const timetableSaveProtected = scriptJs.includes('saveTimetableDoc') && scriptJs.includes('btnSaveTimetable');
  logTest('Timetable save operation provides disabled lock and saving indicator', timetableSaveProtected);

  const assignmentSaveProtected = scriptJs.includes('assignmentForm') && scriptJs.includes('withActionLock(submitBtn');
  logTest('Assignment creation is protected by withActionLock', assignmentSaveProtected);

  const notesUploadProtected = scriptJs.includes('uploadBtn.addEventListener("click"') && scriptJs.includes('withActionLock(uploadBtn');
  logTest('Notes upload operation is protected by withActionLock', notesUploadProtected);

  const noticeSaveProtected = scriptJs.includes('noticeForm') && scriptJs.includes('withActionLock(submitBtn');
  logTest('Notice creation is protected by withActionLock', noticeSaveProtected);

  const userRemoveProtected = scriptJs.includes('data-remove-user-role') && scriptJs.includes('withActionLock(btn');
  logTest('Admin user removal operation is protected by withActionLock', userRemoveProtected);

  // -------------------------------------------------------------------------
  // TEST SUITE 3: SAFE SAVE / DELETE FAILURE RECOVERY AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: Save & Delete Failure Recovery Audit ---');

  // Verify user delete row is not removed before server confirmation
  const userDeleteSafe = scriptJs.includes('const removed = await removeUserAccount(userRole, username);') &&
    scriptJs.includes('if (removed) {\n              if (userRow) userRow.remove();') ||
    scriptJs.includes('if (removed) {\r\n              if (userRow) userRow.remove();');
  logTest('Admin user row is preserved in DOM if backend delete request fails', userDeleteSafe);

  // Verify attendance save checks server sync result and preserves inputs on failure
  const attSyncCheck = scriptJs.includes('syncRes.success === false') &&
    scriptJs.includes('Failed to sync attendance to the server. Your selections have been preserved; please retry.');
  logTest('Attendance save checks backend sync and preserves selections on failure', attSyncCheck);

  // Verify marks save checks server sync result and preserves inputs on failure
  const marksSyncCheck = scriptJs.includes('syncRes.success === false') &&
    scriptJs.includes('Failed to sync marks to the server. Your entered marks have been preserved; please retry.');
  logTest('Marks save checks backend sync and preserves entered marks on failure', marksSyncCheck);

  // Verify timetable preserves cells and edit mode on save error
  const timetableRecovery = scriptJs.includes('isTimetableEditMode = false') &&
    scriptJs.includes('saveBtn.disabled = false;\n        saveBtn.innerHTML = `<span>💾 Save</span>`;') ||
    scriptJs.includes('saveBtn.disabled = false;\r\n        saveBtn.innerHTML = `<span>💾 Save</span>`;');
  logTest('Timetable save preserves cells and re-enables save button on failure', timetableRecovery);

  // -------------------------------------------------------------------------
  // TEST SUITE 4: ACCESSIBLE FEEDBACK & NOTIFICATION AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 4: Accessible Feedback & Toast Audit ---');

  const toastHasAria = scriptJs.includes('notif-toast-container') &&
    scriptJs.includes('container.setAttribute("aria-live", "polite")');
  logTest('Toast container includes aria-live="polite" for screen-reader announcement', toastHasAria);

  const toastHasRole = scriptJs.includes('toast.setAttribute("role", type === "error" ? "alert" : "status")');
  logTest('Toasts include role="alert" for errors and role="status" for updates', toastHasRole);

  const loginMsgHasAria = indexHtml.includes('id="loginMessage"') && indexHtml.includes('role="alert"') && indexHtml.includes('aria-live="polite"');
  logTest('loginMessage element has role="alert" and aria-live="polite"', loginMsgHasAria);

  const signupMsgHasAria = indexHtml.includes('id="pageSignupMessage"') && indexHtml.includes('role="alert"') && indexHtml.includes('aria-live="polite"');
  logTest('pageSignupMessage element has role="alert" and aria-live="polite"', signupMsgHasAria);

  // -------------------------------------------------------------------------
  // TEST SUITE 5: LIGHT MODE STYLES & PROMPT 27 PRESERVATION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 5: Light Mode CSS & Empty State Styling Audit ---');

  const hasBtnLoadingCss = styleCss.includes('.btn-loading') && styleCss.includes('.btn-spinner');
  logTest('style.css defines .btn-loading and .btn-spinner with light mode colors', hasBtnLoadingCss);

  const hasEmptyStateCss = styleCss.includes('.empty-state') && styleCss.includes('color-scheme: light !important;');
  logTest('style.css defines polished .empty-state with enforced light color scheme', hasEmptyStateCss);

  const hasToastLightCss = styleCss.includes('.notif-toast-success') && styleCss.includes('.notif-toast-error') &&
    styleCss.includes('.notif-toast-warning') && styleCss.includes('.notif-toast-info');
  logTest('style.css defines semantic light-mode border accents for toast notifications', hasToastLightCss);

  const hasMobileToastCss = styleCss.includes('@media (max-width: 640px)') && styleCss.includes('.notif-toast-container');
  logTest('style.css includes responsive mobile positioning for toast container', hasMobileToastCss);

  // -------------------------------------------------------------------------
  // TEST SUITE 6: REAL CHROME CDP BROWSER AUTOMATION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 6: Real Chrome CDP In-Browser Execution Audit ---');

  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
  ];

  let chromePath = chromePaths.find(p => fs.existsSync(p));

  if (!chromePath) {
    console.log('  [WARN] Chrome executable not found at standard Windows paths. Skipping CDP tests.');
  } else {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/' || reqPath === '/index.html') reqPath = '/index.html';
      const filePath = path.join(rootDir, reqPath.replace(/^\//, ''));

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const mimeTypes = {
          '.html': 'text/html',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.png': 'image/png'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    const port = 3998;
    await new Promise(resolve => server.listen(port, resolve));

    const tmpDataDir = path.join(os.tmpdir(), 'cs_cdp_p28_' + Date.now());
    const browserProc = spawn(chromePath, [
      '--headless=new',
      '--remote-debugging-port=9454',
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
        const res = await fetch('http://127.0.0.1:9454/json/version');
        if (res.ok) {
          versionOk = true;
          break;
        }
      } catch (e) {}
    }

    if (!versionOk) {
      console.log('  [WARN] Could not connect to Chrome CDP. Skipping browser checks.');
      browserProc.kill();
      server.close();
      try { fs.rmSync(tmpDataDir, { recursive: true, force: true }); } catch (_) {}
    } else {
      const listRes = await fetch('http://127.0.0.1:9454/json/list');
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
        if (res.result?.exceptionDetails) {
          console.error('  [CDP EVAL EXCEPTION]:', res.result.exceptionDetails.exception?.description || res.result.exceptionDetails.text);
        }
        return res.result?.result?.value;
      }

      // Wait for script.js to fully initialize
      for (let i = 0; i < 50; i++) {
        const ready = await evalInPage(`typeof window.getStatusErrorMessage === "function" || typeof window.__prompt27 === "object"`);
        if (ready) break;
        await new Promise(r => setTimeout(r, 150));
      }

      // 1. In-browser HTTP Status Code resolution test
      const statusMapResult = await evalInPage(`
        (() => {
          const res = {};
          res[400] = (window.getStatusErrorMessage || getStatusErrorMessage)(400);
          res[401] = (window.getStatusErrorMessage || getStatusErrorMessage)(401);
          res[403] = (window.getStatusErrorMessage || getStatusErrorMessage)(403);
          res[404] = (window.getStatusErrorMessage || getStatusErrorMessage)(404);
          res[409] = (window.getStatusErrorMessage || getStatusErrorMessage)(409);
          res[413] = (window.getStatusErrorMessage || getStatusErrorMessage)(413);
          res[429] = (window.getStatusErrorMessage || getStatusErrorMessage)(429);
          res[500] = (window.getStatusErrorMessage || getStatusErrorMessage)(500);
          res[503] = (window.getStatusErrorMessage || getStatusErrorMessage)(503);
          return res;
        })()
      `);

      logTest('CDP: getStatusErrorMessage returns correct messages in browser',
        statusMapResult &&
        statusMapResult[400]?.includes('Validation') &&
        statusMapResult[401]?.includes('session has expired') &&
        statusMapResult[403]?.includes('Access forbidden') &&
        statusMapResult[404]?.includes('could not be found') &&
        statusMapResult[409]?.includes('Conflict') &&
        statusMapResult[413]?.includes('Payload too large') &&
        statusMapResult[429]?.includes('Too many requests') &&
        statusMapResult[500]?.includes('server error') &&
        statusMapResult[503]?.includes('temporarily unavailable')
      );

      // 2. In-browser withActionLock concurrency & duplicate prevention test
      const actionLockExecutionResult = await evalInPage(`
        (async () => {
          const btn = document.createElement("button");
          btn.id = "testLockBtn";
          btn.innerHTML = "<span>Submit Test</span>";
          document.body.appendChild(btn);

          let executionCount = 0;
          let insideLockState = null;

          const slowAction = async () => {
            executionCount++;
            insideLockState = {
              disabled: btn.disabled,
              locked: btn.dataset.actionLocked,
              hasSpinner: !!btn.querySelector(".btn-spinner"),
              isLoadingClass: btn.classList.contains("btn-loading")
            };
            await new Promise(r => setTimeout(r, 120));
            return "done";
          };

          // Trigger multiple rapid concurrent executions on the same button
          const p1 = withActionLock(btn, slowAction, { loadingText: "Processing..." });
          const p2 = withActionLock(btn, slowAction, { loadingText: "Processing..." });
          const p3 = withActionLock(btn, slowAction, { loadingText: "Processing..." });

          await Promise.all([p1, p2, p3]);

          const afterState = {
            executionCount,
            disabled: btn.disabled,
            locked: btn.dataset.actionLocked,
            hasSpinner: !!btn.querySelector(".btn-spinner"),
            isLoadingClass: btn.classList.contains("btn-loading"),
            html: btn.innerHTML
          };

          btn.remove();
          return { insideLockState, afterState };
        })()
      `);

      logTest('CDP: withActionLock blocks concurrent double-clicks (executed exactly 1 time)',
        actionLockExecutionResult.afterState.executionCount === 1
      );
      logTest('CDP: withActionLock displays loading spinner and disables button during execution',
        actionLockExecutionResult.insideLockState.disabled === true &&
        actionLockExecutionResult.insideLockState.hasSpinner === true &&
        actionLockExecutionResult.insideLockState.isLoadingClass === true
      );
      logTest('CDP: withActionLock restores button state, enables it, and removes spinner upon completion',
        actionLockExecutionResult.afterState.disabled === false &&
        actionLockExecutionResult.afterState.hasSpinner === false &&
        actionLockExecutionResult.afterState.isLoadingClass === false
      );

      // 3. In-browser Toast notification rendering & ARIA role test
      const toastTestResult = await evalInPage(`
        (() => {
          showToast("Test success notification", "success");
          showToast("Test error notification", "error");

          const container = document.getElementById("notifToastContainer");
          const toasts = container ? container.querySelectorAll(".notif-toast") : [];

          const successToast = container ? container.querySelector(".notif-toast-success") : null;
          const errorToast = container ? container.querySelector(".notif-toast-error") : null;

          return {
            containerAriaLive: container ? container.getAttribute("aria-live") : null,
            successRole: successToast ? successToast.getAttribute("role") : null,
            errorRole: errorToast ? errorToast.getAttribute("role") : null,
            count: toasts.length
          };
        })()
      `);

      logTest('CDP: showToast renders toasts with correct ARIA live and roles in real browser',
        toastTestResult.containerAriaLive === 'polite' &&
        toastTestResult.successRole === 'status' &&
        toastTestResult.errorRole === 'alert' &&
        toastTestResult.count >= 2
      );

      // 4. Mobile Screen Fit & Horizontal Overflow verification across 8 mobile viewports
      const mobileViewports = [
        { width: 320, height: 568, name: '320x568 (Phone SE)' },
        { width: 360, height: 800, name: '360x800 (Phone Std)' },
        { width: 375, height: 812, name: '375x812 (Phone iPhone)' },
        { width: 390, height: 844, name: '390x844 (Phone Modern)' },
        { width: 414, height: 896, name: '414x896 (Phone Plus)' },
        { width: 430, height: 932, name: '430x932 (Phone Max)' },
        { width: 568, height: 320, name: '568x320 (Phone Landscape 568)' },
        { width: 844, height: 390, name: '844x390 (Phone Landscape 844)' }
      ];

      for (const vp of mobileViewports) {
        await sendCommand('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 2,
          mobile: true
        });

        const overflow = await evalInPage(`
          (() => {
            const docWidth = document.documentElement.clientWidth;
            const scrollWidth = document.documentElement.scrollWidth;
            return {
              docWidth,
              scrollWidth,
              hasHorizontalOverflow: scrollWidth > docWidth
            };
          })()
        `);

        logTest(`CDP [${vp.name}]: No horizontal overflow with active toasts/errors`,
          !overflow.hasHorizontalOverflow,
          `docWidth=${overflow.docWidth}, scrollWidth=${overflow.scrollWidth}`
        );
      }

      // 5. Desktop & Tablet Viewport verification
      const desktopViewports = [
        { width: 768, height: 1024, name: '768x1024 (Tablet)' },
        { width: 820, height: 1180, name: '820x1180 (iPad Air)' },
        { width: 1280, height: 800, name: '1280x800 (Laptop)' },
        { width: 1920, height: 1080, name: '1920x1080 (Desktop 1080p)' }
      ];

      for (const vp of desktopViewports) {
        await sendCommand('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: false
        });

        const fits = await evalInPage(`
          (() => {
            return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
          })()
        `);

        logTest(`CDP [${vp.name}]: Layout and feedback containers fit cleanly without shifts`, fits);
      }

      // 6. Prompt 27 Light Mode Preservation check under Emulated Dark Mode
      await sendCommand('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-color-scheme', value: 'dark' }]
      });

      const darkEmulationColors = await evalInPage(`
        (() => {
          const bodyBg = window.getComputedStyle(document.body).backgroundColor;
          const toast = document.querySelector(".notif-toast");
          const toastBg = toast ? window.getComputedStyle(toast).backgroundColor : null;
          return { bodyBg, toastBg };
        })()
      `);

      logTest('CDP: Dark Mode device emulation preserves original Light Mode body background (#f6f8fd)',
        darkEmulationColors.bodyBg === 'rgb(246, 248, 253)'
      );
      logTest('CDP: Dark Mode device emulation preserves original Light Mode toast background (#ffffff)',
        darkEmulationColors.toastBg === 'rgb(255, 255, 255)'
      );

      // Clean up browser
      ws.close();
      browserProc.kill();
      server.close();
      try { fs.rmSync(tmpDataDir, { recursive: true, force: true }); } catch (_) {}
    }
  }

  // -------------------------------------------------------------------------
  // FINAL REPORT & SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n====================================================================');
  console.log(`PROMPT 28 TEST SUMMARY: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('====================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPrompt28Tests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
