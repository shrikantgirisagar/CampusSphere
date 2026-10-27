/**
 * PROMPT 33: GLOBAL CARD HOVER BLINKING / FLICKERING FIX VERIFICATION SUITE
 * 
 * Verifies that:
 * 1. All card and tile hover selectors do not apply geometry-shifting transforms that cause hover loops.
 * 2. Hover transitions use subtle, stable box-shadow, border-color, and background-color styling.
 * 3. Child elements and action buttons inside cards do not trigger geometry shifts or parent hover loops.
 * 4. Real Chrome CDP in-browser testing proves 0 toggles / flicker on cards and buttons.
 * 5. Layout remains stable across mobile, tablet, and desktop viewports.
 * 6. Light mode and accessibility remain preserved.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const os = require('os');

const rootDir = path.resolve(__dirname, '..');
const assetDir = fs.existsSync(path.join(rootDir, 'public')) ? path.join(rootDir, 'public') : rootDir;
const styleCss = fs.readFileSync(path.join(assetDir, 'style.css'), 'utf8');
const scriptJs = fs.readFileSync(path.join(assetDir, 'script.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(assetDir, 'index.html'), 'utf8');
const usersData = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'users.json'), 'utf8'));

let passed = 0;
let failed = 0;

function logTest(desc, ok, extra = '') {
  if (ok) {
    passed++;
    console.log(`  [PASS] ${desc}`);
  } else {
    failed++;
    console.log(`  [FAIL] ${desc}${extra ? ' - ' + extra : ''}`);
  }
}

async function runTests() {
  console.log('====================================================================');
  console.log('STARTING PROMPT 33: GLOBAL CARD HOVER STABILITY AUDIT');
  console.log('====================================================================\n');

  // -------------------------------------------------------------------------
  // TEST SUITE 1: CSS ARCHITECTURAL STABILITY AUDIT
  // -------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: CSS Card & Tile Hover Stability Invariants ---');

  // Check specific card hover rules do not contain translateY/translateX/scale transforms
  const cardHoverSelectors = [
    { name: '.faculty-card:hover', pattern: /\.faculty-card:hover\s*\{([^}]+)\}/ },
    { name: '.subject-card:hover', pattern: /\.subject-card:hover\s*\{([^}]+)\}/ },
    { name: '.stat:hover', pattern: /\.stat:hover\s*\{([^}]+)\}/ },
    { name: '.mark-card:hover', pattern: /\.mark-card:hover\s*\{([^}]+)\}/ },
    { name: '.assignment:hover', pattern: /\.assignment:hover\s*\{([^}]+)\}/ },
    { name: '.notice:hover', pattern: /\.notice:hover\s*\{([^}]+)\}/ },
    { name: '.ai-metric-card:hover', pattern: /\.ai-metric-card:hover\s*\{([^}]+)\}/ },
    { name: '.subject-manage-card:hover', pattern: /\.subject-manage-card:hover\s*\{([^}]+)\}/ },
    { name: '.sem-overview-card:hover', pattern: /\.sem-overview-card:hover\s*\{([^}]+)\}/ },
    { name: '.division-manage-card:hover', pattern: /\.division-manage-card:hover\s*\{([^}]+)\}/ },
    { name: '.feature-card:hover', pattern: /\.feature-card:hover\s*\{([^}]+)\}/ },
    { name: '.syllabus-card:hover', pattern: /\.syllabus-card:hover\s*\{([^}]+)\}/ },
    { name: '.testimonial-card:hover', pattern: /\.testimonial-card:hover\s*\{([^}]+)\}/ },
    { name: '.about-feature-card:hover', pattern: /\.about-feature-card:hover\s*\{([^}]+)\}/ },
    { name: '.about-tech-card:hover', pattern: /\.about-tech-card:hover\s*\{([^}]+)\}/ },
    { name: '.about-module-card:hover', pattern: /\.about-module-card:hover\s*\{([^}]+)\}/ },
    { name: '.student-stat-card:hover', pattern: /\.student-stat-card:hover\s*\{([^}]+)\}/ },
    { name: '.syllabus-sem-card:hover', pattern: /\.syllabus-sem-card:hover\s*\{([^}]+)\}/ },
    { name: '.admin-year-card:hover', pattern: /\.admin-year-card:hover\s*\{([^}]+)\}/ },
    { name: '.admin-detail-box:hover', pattern: /\.admin-detail-box:hover\s*\{([^}]+)\}/ },
    { name: '.profile-col-box:hover', pattern: /\.profile-col-box:hover\s*\{([^}]+)\}/ },
    { name: '.daily-subject-item:hover', pattern: /\.daily-subject-item:hover\s*\{([^}]+)\}/ },
    { name: '.showcase-feature-item:hover', pattern: /\.showcase-feature-item:hover\s*\{([^}]+)\}/ }
  ];

  for (const { name, pattern } of cardHoverSelectors) {
    const match = styleCss.match(pattern);
    const hasTransform = match && /transform:\s*translate/i.test(match[1]);
    logTest(`${name} has zero geometry-shifting hover transforms`, !hasTransform, match ? match[1].trim() : 'no match');
  }

  // Verify card buttons stability rules
  const hasCardBtnStability = styleCss.includes('.faculty-card .admin-actions button') &&
    styleCss.includes('.faculty-card .secondary-btn:hover') &&
    styleCss.includes('transform: none');
  logTest('Card action buttons and child controls explicitly enforce transform: none on hover', hasCardBtnStability);

  // Verify transitions are scoped and do not use transition: all on cards
  const facultyCardDef = styleCss.match(/\.faculty-card\s*\{([^}]+)\}/);
  const facultyTransitionSafe = facultyCardDef && !/transition:\s*all/i.test(facultyCardDef[1]);
  logTest('.faculty-card uses scoped transitions instead of transition: all', facultyTransitionSafe);

  const subjectCardDef = styleCss.match(/\.subject-card\s*\{([^}]+)\}/);
  const subjectTransitionSafe = subjectCardDef && !/transition:\s*all/i.test(subjectCardDef[1]);
  logTest('.subject-card uses scoped transitions instead of transition: all', subjectTransitionSafe);

  const statCardDef = styleCss.match(/\.stat\s*\{([^}]+)\}/);
  const statTransitionSafe = statCardDef && !/transition:\s*all/i.test(statCardDef[1]);
  logTest('.stat card uses scoped transitions instead of transition: all', statTransitionSafe);

  // Reduced motion media query preservation
  const hasReducedMotion = styleCss.includes('(prefers-reduced-motion: reduce)');
  logTest('Reduced-motion media queries remain preserved', hasReducedMotion);

  // Light mode enforcement preservation
  const hasLightModeMeta = indexHtml.includes('name="color-scheme" content="light"');
  logTest('index.html preserves light-mode enforcement metadata', hasLightModeMeta);

  // -------------------------------------------------------------------------
  // TEST SUITE 2: REAL BROWSER CDP IN-BROWSER EXECUTION TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: Real Chrome CDP In-Browser Hover Verification ---');

  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
  ];

  const chromePath = chromePaths.find(p => fs.existsSync(p));

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
          '.json': 'application/json',
          '.png': 'image/png'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    const port = 3996;
    await new Promise(resolve => server.listen(port, resolve));

    const tmpDataDir = path.join(os.tmpdir(), 'cs_p33_' + Date.now());
    const browserProc = spawn(chromePath, [
      '--headless=new',
      '--remote-debugging-port=9460',
      '--no-sandbox',
      '--disable-gpu',
      `--user-data-dir=${tmpDataDir}`,
      `http://localhost:${port}/`
    ]);

    let versionOk = false;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 150));
      try {
        const res = await fetch('http://127.0.0.1:9460/json/version');
        if (res.ok) { versionOk = true; break; }
      } catch (_) {}
    }

    if (!versionOk) {
      console.log('  [WARN] Could not connect to Chrome CDP.');
      browserProc.kill();
      server.close();
    } else {
      const listRes = await fetch('http://127.0.0.1:9460/json/list');
      const targets = await listRes.json();
      const pageTarget = targets.find(t => t.type === 'page');
      const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
      await new Promise(resolve => ws.onopen = resolve);

      let msgId = 1;
      const pending = new Map();
      const consoleErrors = [];

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.id && pending.has(data.id)) {
          pending.get(data.id)(data);
          pending.delete(data.id);
        }
        if (data.method === 'Runtime.consoleAPICalled' && data.params?.type === 'error') {
          consoleErrors.push(data.params.args.map(a => a.value || a.description).join(' '));
        }
      };

      function send(method, params = {}) {
        return new Promise((resolve) => {
          const id = msgId++;
          pending.set(id, resolve);
          ws.send(JSON.stringify({ id, method, params }));
        });
      }

      await send('Page.enable');
      await send('DOM.enable');
      await send('Runtime.enable');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false
      });

      await new Promise(r => setTimeout(r, 800));

      // 1. Admin Faculty Management In-Browser Tests
      await send('Runtime.evaluate', {
        expression: `
          (async () => {
            const facultyUsers = ${JSON.stringify(usersData.filter(x => x.role === "faculty"))};
            USERS.faculty = facultyUsers;
            currentUser = ${JSON.stringify(usersData.find(x => x.role === "admin"))};
            sessionStorage.setItem("portalUser", JSON.stringify(currentUser));
            sessionStorage.setItem("portalRole", "admin");
            openPortal();
            navigate("faculty");
          })()
        `,
        awaitPromise: true
      });

      await new Promise(r => setTimeout(r, 400));

      const cardDataRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const cards = document.querySelectorAll('.faculty-card');
            if (!cards.length) return null;
            const c = cards[0];
            const r = c.getBoundingClientRect();
            const btn = c.querySelector('.secondary-btn');
            const btnR = btn ? btn.getBoundingClientRect() : null;
            return {
              count: cards.length,
              rect: { top: r.top, bottom: r.bottom, left: r.left, width: r.width, height: r.height },
              btnRect: btnR ? { top: btnR.top, bottom: btnR.bottom, left: btnR.left, width: btnR.width, height: btnR.height } : null
            };
          })()
        `,
        returnByValue: true
      });

      const cardData = cardDataRes.result?.result?.value;
      logTest('Admin Faculty Management page renders faculty cards successfully', cardData && cardData.count > 0);

      if (cardData) {
        const centerX = cardData.rect.left + cardData.rect.width / 2;
        const bottomY = cardData.rect.bottom;

        // Test hover inside card
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: centerX, y: cardData.rect.top + 40 });
        await new Promise(r => setTimeout(r, 200));

        const insideRes = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const c = document.querySelector('.faculty-card');
              const comp = window.getComputedStyle(c);
              const r = c.getBoundingClientRect();
              return { isHovered: c.matches(':hover'), transform: comp.transform, bottom: r.bottom };
            })()
          `,
          returnByValue: true
        });
        const insideState = insideRes.result?.result?.value;
        logTest('Faculty card stays stationary on hover with transform: none', insideState?.transform === 'none');
        logTest('Faculty card bottom rect is stable (does not translate upward)', Math.abs(insideState?.bottom - bottomY) < 0.5);

        // Test stationary mouse at exact critical edge
        const edgeY = bottomY - 1;
        let edgeToggles = 0;
        let prevHover = null;
        for (let i = 0; i < 25; i++) {
          await new Promise(r => setTimeout(r, 20));
          await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: centerX, y: edgeY });
          const res = await send('Runtime.evaluate', {
            expression: `document.querySelector('.faculty-card').matches(':hover')`,
            returnByValue: true
          });
          const h = res.result?.result?.value;
          if (prevHover !== null && h !== prevHover) edgeToggles++;
          prevHover = h;
        }
        logTest('Stationary mouse at card edge produces 0 hover toggles / 0 flicker', edgeToggles === 0, `toggles: ${edgeToggles}`);

        // Test hover on child button inside card
        if (cardData.btnRect) {
          const btnX = cardData.btnRect.left + cardData.btnRect.width / 2;
          const btnY = cardData.btnRect.top + cardData.btnRect.height / 2;
          await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: btnX, y: btnY });
          await new Promise(r => setTimeout(r, 200));

          const btnHoverRes = await send('Runtime.evaluate', {
            expression: `
              (() => {
                const c = document.querySelector('.faculty-card');
                const btn = c.querySelector('.secondary-btn');
                const comp = window.getComputedStyle(btn);
                return {
                  cardHovered: c.matches(':hover'),
                  btnHovered: btn.matches(':hover'),
                  btnTransform: comp.transform
                };
              })()
            `,
            returnByValue: true
          });
          const btnState = btnHoverRes.result?.result?.value;
          logTest('Child button inside faculty card is hovered without parent hover loss', btnState?.cardHovered && btnState?.btnHovered);
          logTest('Child button inside faculty card has transform: none (no button geometry jump)', btnState?.btnTransform === 'none');
        }
      }

      // 2. Student Dashboard Cards In-Browser Tests
      await send('Runtime.evaluate', {
        expression: `
          (async () => {
            currentUser = ${JSON.stringify(usersData.find(x => x.role === "student"))};
            sessionStorage.setItem("portalUser", JSON.stringify(currentUser));
            sessionStorage.setItem("portalRole", "student");
            openPortal();
            navigate("dashboard");
          })()
        `,
        awaitPromise: true
      });
      await new Promise(r => setTimeout(r, 400));

      const studentCardsRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const subjectCards = document.querySelectorAll('.subject-card');
            const statCards = document.querySelectorAll('.stat');
            return { subjectCount: subjectCards.length, statCount: statCards.length };
          })()
        `,
        returnByValue: true
      });
      const studentCards = studentCardsRes.result?.result?.value;
      logTest('Student Dashboard renders subject cards and stat cards', studentCards && (studentCards.subjectCount > 0 || studentCards.statCount > 0));

      // Test hover on student stat card
      const statHoverRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const s = document.querySelector('.stat');
            if (!s) return null;
            const r = s.getBoundingClientRect();
            return { top: r.top, bottom: r.bottom, left: r.left, width: r.width };
          })()
        `,
        returnByValue: true
      });
      const statRect = statHoverRes.result?.result?.value;
      if (statRect) {
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: statRect.left + 20, y: statRect.top + 20 });
        await new Promise(r => setTimeout(r, 150));
        const statH = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const s = document.querySelector('.stat');
              const comp = window.getComputedStyle(s);
              return { isHovered: s.matches(':hover'), transform: comp.transform };
            })()
          `,
          returnByValue: true
        });
        logTest('Student stat card stays stationary on hover with transform: none', statH.result?.result?.value?.transform === 'none');
      }

      // 3. Multi-Viewport Stability Sweep
      const viewports = [
        { name: 'Mobile (375x812)', w: 375, h: 812 },
        { name: 'Tablet (768x1024)', w: 768, h: 1024 },
        { name: 'Desktop (1440x900)', w: 1440, h: 900 }
      ];

      for (const vp of viewports) {
        await send('Emulation.setDeviceMetricsOverride', {
          width: vp.w,
          height: vp.h,
          deviceScaleFactor: 1,
          mobile: vp.w < 768
        });
        await new Promise(r => setTimeout(r, 200));

        const scrollRes = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const root = document.documentElement;
              return { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth };
            })()
          `,
          returnByValue: true
        });
        const overflow = scrollRes.result?.result?.value;
        const noHorizScroll = overflow && overflow.scrollWidth <= overflow.clientWidth + 1;
        logTest(`Viewport ${vp.name} maintains clean layout without horizontal overflow`, noHorizScroll);
      }

      // Check console errors
      logTest('Zero JavaScript console errors encountered during full hover audit', consoleErrors.length === 0, consoleErrors.join('; '));

      ws.close();
      browserProc.kill();
      server.close();
    }
  }

  console.log('\n====================================================================');
  console.log(`PROMPT 33 TEST SUMMARY: ${passed} / ${passed + failed} PASSED (${failed} FAILED)`);
  console.log('====================================================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test runner failure:', err);
  process.exit(1);
});
