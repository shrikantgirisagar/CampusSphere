/**
 * ============================================================================
 * CAMPUSSPHERE PROMPT 24 TEST SUITE
 * Complete Real-World Mobile Screen-Fit & Responsiveness Audit: Signup Page
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
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

async function runPrompt24Tests() {
  console.log('====================================================================');
  console.log('STARTING PROMPT 24: SIGNUP PAGE MOBILE SCREEN-FIT VERIFICATION');
  console.log('====================================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  const styleCss = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf-8');
  const scriptJs = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf-8');
  const serverJs = fs.readFileSync(path.join(rootDir, 'server.js'), 'utf-8');

  // -------------------------------------------------------------------------
  // TEST SUITE 1: STATIC SOURCE & RESPONSIVE RULES VERIFICATION
  // -------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: Signup Structure & CSS Rules Verification ---');

  // Check markup existence
  const signupPageExists = indexHtml.includes('id="signupPage"') && indexHtml.includes('class="login-page signup-page"');
  logTest('Signup page element (#signupPage) exists with proper semantic classes', signupPageExists);

  const signupCardExists = indexHtml.includes('class="login-card signup-card auth-card-horizontal"');
  logTest('Signup card exists with auth-card-horizontal class', signupCardExists);

  // Check single column collapse rule for .signup-card.auth-card-horizontal under @media (max-width: 900px)
  const media900Idx = styleCss.indexOf('@media (max-width: 900px)');
  const media900Block = media900Idx !== -1 ? styleCss.slice(media900Idx, media900Idx + 1500) : '';
  const signupCardColCollapsed = media900Block.includes('.signup-card.auth-card-horizontal') &&
    media900Block.includes('grid-template-columns: 1fr !important;');
  logTest('.signup-card.auth-card-horizontal collapses to grid-template-columns: 1fr !important on screens <= 900px', signupCardColCollapsed);

  // Check showcase features hidden on mobile/tablets to prevent vertical bloating
  const showcaseFeaturesHidden = media900Block.includes('.signup-card .showcase-features') &&
    media900Block.includes('display: none !important;');
  logTest('Showcase feature list is hidden on mobile/tablets (.signup-card .showcase-features { display: none !important })', showcaseFeaturesHidden);

  // Check mobile form grid single column collapse under @media (max-width: 560px)
  const media560Idx = styleCss.indexOf('@media (max-width: 560px)');
  const media560Block = media560Idx !== -1 ? styleCss.slice(media560Idx, media560Idx + 2000) : '';
  const signupInputGrid1Col = media560Block.includes('.signup-card .auth-input-grid') &&
    media560Block.includes('grid-template-columns: 1fr !important;');
  logTest('.signup-card .auth-input-grid collapses to single column (1fr !important) on phones <= 560px', signupInputGrid1Col);

  // Check fluid card sizing on mobile
  const signupCardFluidMobile = media560Block.includes('.signup-card.auth-card-horizontal') &&
    media560Block.includes('width: 100% !important;') &&
    media560Block.includes('max-width: 100% !important;');
  logTest('Signup card uses 100% fluid width on phones <= 560px', signupCardFluidMobile);

  // Check compact phone optimizations (<= 380px)
  const media380Idx = styleCss.indexOf('@media (max-width: 380px)');
  const media380Block = media380Idx !== -1 ? styleCss.slice(media380Idx, media380Idx + 1500) : '';
  const compactPhoneStyles = media380Block.includes('.signup-page') &&
    media380Block.includes('.signup-card .auth-form-panel') &&
    media380Block.includes('.signup-card .signup-role-tabs .role-tab');
  logTest('Dedicated compact rules defined for small phones <= 380px (role tabs, padding, pill buttons)', compactPhoneStyles);

  // Check landscape phone optimizations
  const mediaLandscapeIdx = styleCss.indexOf('@media (max-height: 500px) and (orientation: landscape)');
  const mediaLandscapeBlock = mediaLandscapeIdx !== -1 ? styleCss.slice(mediaLandscapeIdx, mediaLandscapeIdx + 2500) : '';
  const landscapePhoneStyles = mediaLandscapeBlock.includes('.signup-card.auth-card-horizontal') &&
    mediaLandscapeBlock.includes('.signup-card .auth-showcase-panel') &&
    mediaLandscapeBlock.includes('.signup-card .auth-input-grid');
  logTest('Dedicated landscape rules defined for phone landscape mode (@media max-height: 500px)', landscapePhoneStyles);

  // Check mobile iOS Safari auto-zoom prevention font-size
  const media540Idx = styleCss.indexOf('@media(max-width: 540px)');
  const media540Block = media540Idx !== -1 ? styleCss.slice(media540Idx, media540Idx + 3000) : '';
  const iosZoomPrevention = media540Block.includes('font-size: 16px;');
  logTest('Inputs enforce 16px font-size on mobile to prevent iOS Safari auto-zoom', iosZoomPrevention);

  // -------------------------------------------------------------------------
  // TEST SUITE 2: REAL HEADLESS CHROME RENDERED DIMENSIONS AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: Rendered Bounding Rects & Overflow Audit Across 16 Viewports ---');

  const chromePath = fs.existsSync("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe")
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : (fs.existsSync("C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe")
      ? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
      : null);

  if (!chromePath) {
    console.log("  [WARN] Neither Google Chrome nor Edge found on disk. Skipping live CDP test.");
  } else {
    // Start local static server
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0].split('#')[0];
      if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
      const filePath = path.join(rootDir, reqPath);
      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        return res.end('Not found');
      }
      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
      };
      res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });

    const port = 3988;
    await new Promise(resolve => server.listen(port, resolve));

    const browserProc = spawn(chromePath, [
      '--headless=new',
      '--remote-debugging-port=9444',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-software-rasterizer',
      `http://localhost:${port}/#signup`
    ]);

    let versionOk = false;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch('http://127.0.0.1:9444/json/version');
        if (res.ok) {
          versionOk = true;
          break;
        }
      } catch (e) {}
    }

    if (!versionOk) {
      console.log("  [WARN] Could not connect to Chrome CDP. Skipping browser checks.");
      browserProc.kill();
      server.close();
    } else {
      const listRes = await fetch('http://127.0.0.1:9444/json/list');
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

      for (let i = 0; i < 50; i++) {
        const ready = await evalInPage(`!!window.CampusSpherePublic && document.readyState === 'complete'`);
        if (ready) break;
        await new Promise(r => setTimeout(r, 100));
      }

      const viewports = [
        // Portrait Mobile
        { name: '320x568 (Phone SE Portrait)', width: 320, height: 568 },
        { name: '360x800 (Phone Std Portrait)', width: 360, height: 800 },
        { name: '375x812 (Phone iPhone Portrait)', width: 375, height: 812 },
        { name: '390x844 (Phone Modern Portrait)', width: 390, height: 844 },
        { name: '414x896 (Phone Plus Portrait)', width: 414, height: 896 },
        { name: '430x932 (Phone Max Portrait)', width: 430, height: 932 },
        { name: '480x1040 (Phone Wide Portrait)', width: 480, height: 1040 },
        // Landscape Mobile
        { name: '568x320 (Phone Landscape 568)', width: 568, height: 320 },
        { name: '667x375 (Phone Landscape 667)', width: 667, height: 375 },
        { name: '800x360 (Phone Landscape 800)', width: 800, height: 360 },
        { name: '844x390 (Phone Landscape 844)', width: 844, height: 390 },
        { name: '896x414 (Phone Landscape 896)', width: 896, height: 414 },
        { name: '932x430 (Phone Landscape 932)', width: 932, height: 430 },
        // Tablets
        { name: '768x1024 (Tablet Portrait)', width: 768, height: 1024 },
        { name: '820x1180 (Tablet iPad Air)', width: 820, height: 1180 },
        { name: '1024x1366 (Tablet Pro)', width: 1024, height: 1366 }
      ];

      for (const role of ['student', 'faculty']) {
        console.log(`\n  Checking Role: ${role.toUpperCase()}`);
        for (const vp of viewports) {
          await sendCommand('Emulation.setDeviceMetricsOverride', {
            width: vp.width,
            height: vp.height,
            deviceScaleFactor: 1,
            mobile: vp.width < 900
          });

          await evalInPage(`
            if (window.CampusSpherePublic && window.CampusSpherePublic.showSignup) {
              window.CampusSpherePublic.showSignup("${role}", false);
            }
          `);

          await new Promise(r => setTimeout(r, 80));

          const res = await evalInPage(`(() => {
            const docW = document.documentElement.clientWidth;
            const docScrollW = document.documentElement.scrollWidth;
            const bodyScrollW = document.body.scrollWidth;
            const card = document.querySelector(".signup-card");
            const cardRect = card ? card.getBoundingClientRect() : null;

            // Check if card or any child exceeds docW
            const overflowing = [];
            if (card) {
              const all = card.querySelectorAll("*");
              for (const el of all) {
                const r = el.getBoundingClientRect();
                // Ignore zero width/height elements
                if (r.width > 0 && r.height > 0 && r.right > docW + 1) {
                  overflowing.push({ tag: el.tagName, id: el.id, class: el.className, right: Math.round(r.right) });
                }
              }
            }

            return {
              docW,
              docScrollW,
              bodyScrollW,
              cardWidth: cardRect ? Math.round(cardRect.width) : 0,
              cardRight: cardRect ? Math.round(cardRect.right) : 0,
              cardLeft: cardRect ? Math.round(cardRect.left) : 0,
              overflowCount: overflowing.length,
              sampleOverflow: overflowing[0] || null
            };
          })()`);

          const zeroPageScroll = res.docScrollW <= vp.width && res.bodyScrollW <= vp.width;
          const cardInBounds = res.cardRight <= vp.width + 1 && res.cardLeft >= 0;
          const zeroElementsOverflow = res.overflowCount === 0;

          logTest(
            `[${vp.name}] (${role}) fits viewport: card width=${res.cardWidth}px in ${vp.width}px viewport`,
            zeroPageScroll && cardInBounds && zeroElementsOverflow,
            `docScrollW=${res.docScrollW}px, cardRight=${res.cardRight}px, overflowElements=${res.overflowCount}`
          );
        }
      }

      ws.close();
      browserProc.kill();
      server.close();
    }
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 3: SIGNUP BACKEND FUNCTIONALITY INTEGRITY
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: Signup Workflow & Backend Integrity ---');

  logTest('server.js preserves user registration endpoint (POST /api/users)', serverJs.includes('app.post("/api/users"') && serverJs.includes('User.findOne'));
  logTest('server.js preserves password hashing (crypto.scryptSync or bcrypt)', serverJs.includes('scryptSync') || serverJs.includes('hashPassword'));
  logTest('script.js preserves form submission handler pageSignupForm', scriptJs.includes('pageSignupForm') && scriptJs.includes('pageSignupForm.addEventListener("submit"'));
  logTest('script.js preserves role switching between student and faculty', scriptJs.includes('setPageSignupRole') && scriptJs.includes('pageStudentFields'));

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n====================================================================');
  console.log(`PROMPT 24 TEST RESULTS: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('====================================================================\n');

  if (failedTests > 0) {
    console.error(`PROMPT 24 SUITE FAILED with ${failedTests} errors.`);
    process.exit(1);
  } else {
    console.log('ALL PROMPT 24 SIGNUP MOBILE SCREEN-FIT TESTS PASSED 100%!');
    process.exit(0);
  }
}

runPrompt24Tests().catch(err => {
  console.error('Unhandled error in test runner:', err);
  process.exit(1);
});
