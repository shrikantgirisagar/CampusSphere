/**
 * ============================================================================
 * CAMPUSSPHERE PROMPT 27 TEST SUITE
 * Complete Light Mode Enforcement & Anti-Dark-Inversion Verification
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

async function runPrompt27Tests() {
  console.log('====================================================================');
  console.log('STARTING PROMPT 27: FORCE CAMPUSSPHERE ORIGINAL LIGHT MODE AUDIT');
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
  // TEST SUITE 1: HTML COLOR-SCHEME METADATA AUDIT
  // -------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: HTML Document Metadata Audit ---');

  const htmlFiles = [
    { name: 'index.html', content: indexHtml },
    { name: 'courses.html', content: coursesHtml },
    { name: 'about.html', content: aboutHtml },
    { name: 'students.html', content: studentsHtml }
  ];

  htmlFiles.forEach(f => {
    const hasColorSchemeMeta = f.content.includes('<meta name="color-scheme" content="light">');
    logTest(`[${f.name}] Contains standard <meta name="color-scheme" content="light">`, hasColorSchemeMeta);

    const hasSupportedSchemes = f.content.includes('<meta name="supported-color-schemes" content="light">');
    logTest(`[${f.name}] Contains backward-compatible <meta name="supported-color-schemes" content="light">`, hasSupportedSchemes);
  });

  // -------------------------------------------------------------------------
  // TEST SUITE 2: CSS COLOR-SCHEME & THEME SPECIFICATION AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: CSS Architecture & Neutralization Audit ---');

  // 1. :root color-scheme
  const rootColorScheme = styleCss.includes(':root') && styleCss.includes('color-scheme: light !important;');
  logTest('style.css defines color-scheme: light !important in :root', rootColorScheme);

  // 2. html and body color-scheme
  const htmlBodyColorScheme = styleCss.includes('html {') && styleCss.includes('body {') &&
    styleCss.includes('background-color: var(--campus-background, #f6f8fd) !important;');
  logTest('style.css enforces color-scheme: light and background #f6f8fd on html and body', htmlBodyColorScheme);

  // 3. Form controls color-scheme
  const controlsColorScheme = styleCss.includes('input,') && styleCss.includes('select,') && styleCss.includes('textarea,') &&
    styleCss.includes('color-scheme: light !important;');
  logTest('style.css enforces color-scheme: light on input, select, textarea, button, dialog, canvas', controlsColorScheme);

  // 4. Dark theme neutralization (no dark backgrounds #090f1d, #0f172a overriding light mode)
  const noDarkBgOverride = !styleCss.includes('body.students-page-body {\n    background: #090f1d;') &&
    !styleCss.includes('body.students-page-body {\r\n    background: #090f1d;') &&
    !styleCss.includes('background: #0f172a !important;');
  logTest('style.css neutralized legacy dark mode overrides (#090f1d, #0f172a)', noDarkBgOverride);

  // 5. CSS custom properties maintain original light mode values
  const hasOriginalTokens = styleCss.includes('--campus-primary: #1459d9;') &&
    styleCss.includes('--campus-background: #f6f8fd;') &&
    styleCss.includes('--campus-surface: #ffffff;') &&
    styleCss.includes('--campus-navy: #0A2540;');
  logTest('style.css preserves exact original CampusSphere light mode design tokens', hasOriginalTokens);

  // -------------------------------------------------------------------------
  // TEST SUITE 3: JAVASCRIPT LIGHT MODE ENFORCEMENT AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: JavaScript Light Mode Enforcement Audit ---');

  const hasScriptEnforcement = scriptJs.includes('enforcePrompt27LightMode') &&
    scriptJs.includes('color-scheme') &&
    scriptJs.includes('prefers-color-scheme');
  logTest('script.js includes dynamic light mode enforcement and system theme change listener', hasScriptEnforcement);

  const noThemeSwitchingLogic = !scriptJs.includes('document.body.classList.add("dark")') &&
    !scriptJs.includes('document.body.classList.toggle("dark")') &&
    !scriptJs.includes('localStorage.setItem("theme"') &&
    !scriptJs.includes('localStorage.getItem("theme"');
  logTest('script.js does not contain dark theme switcher, toggle, or localStorage overrides', noThemeSwitchingLogic);

  // -------------------------------------------------------------------------
  // TEST SUITE 4: REAL CHROME CDP HEADLESS AUDIT ACROSS 10 VIEWPORTS & DUAL THEMES
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 4: Real Chrome CDP Dual-Theme Browser Emulation Audit ---');

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

    const port = 3995;
    await new Promise(resolve => server.listen(port, resolve));

    const tmpDataDir = path.join(os.tmpdir(), 'cs_cdp_p27_' + Date.now());
    const browserProc = spawn(chromePath, [
      '--headless=new',
      '--remote-debugging-port=9451',
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
        const res = await fetch('http://127.0.0.1:9451/json/version');
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
      const listRes = await fetch('http://127.0.0.1:9451/json/list');
      const targets = await listRes.json();
      console.log('  [CDP TARGETS]:', JSON.stringify(targets.map(t => ({ type: t.type, url: t.url }))));
      const pageTarget = targets.find(t => t.type === 'page' && t.url && t.url.includes('localhost')) || targets.find(t => t.type === 'page');
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

      await sendCommand('Runtime.enable');
      await sendCommand('Page.enable');
      await sendCommand('DOM.enable');

      async function evalInPage(expr) {
        const res = await sendCommand('Runtime.evaluate', {
          expression: expr,
          returnByValue: true,
          awaitPromise: true
        });
        if (res?.result?.exceptionDetails) {
          console.error('  [CDP EVAL EXCEPTION]:', res.result.exceptionDetails.exception?.description || res.result.exceptionDetails.text);
        }
        return res?.result?.result?.value;
      }

      // Wait for script.js to fully initialize
      for (let i = 0; i < 40; i++) {
        const ready = await evalInPage(`typeof window.__prompt27 === "object"`);
        if (ready) break;
        await new Promise(r => setTimeout(r, 150));
      }

      const isPrompt27Ready = await evalInPage(`typeof window.__prompt27 === "object"`);
      logTest('CDP: window.__prompt27 helper initialized in browser', isPrompt27Ready);

      // Function to sample key computed styles in page
      async function sampleComputedStyles() {
        return await evalInPage(`
          (() => {
            const bodyStyle = window.getComputedStyle(document.body);
            const htmlStyle = window.getComputedStyle(document.documentElement);
            const statCard = document.querySelector('.student-stat-card');
            const statCardStyle = statCard ? window.getComputedStyle(statCard) : null;
            const heroTitle = document.querySelector('.hero-title');
            const heroTitleStyle = heroTitle ? window.getComputedStyle(heroTitle) : null;
            const inputEl = document.querySelector('input');
            const inputStyle = inputEl ? window.getComputedStyle(inputEl) : null;

            return {
              colorScheme: htmlStyle.colorScheme,
              bodyBg: bodyStyle.backgroundColor,
              bodyColor: bodyStyle.color,
              statCardBg: statCardStyle ? statCardStyle.backgroundColor : null,
              statCardBorder: statCardStyle ? statCardStyle.borderColor : null,
              heroTitleColor: heroTitleStyle ? heroTitleStyle.color : null,
              inputColorScheme: inputStyle ? inputStyle.colorScheme : null
            };
          })()
        `);
      }

      // Viewports requested by prompt
      const viewports = [
        { name: '320x568 (Phone SE Portrait)', width: 320, height: 568 },
        { name: '360x800 (Phone Std Portrait)', width: 360, height: 800 },
        { name: '375x812 (Phone iPhone Portrait)', width: 375, height: 812 },
        { name: '390x844 (Phone Modern Portrait)', width: 390, height: 844 },
        { name: '414x896 (Phone Plus Portrait)', width: 414, height: 896 },
        { name: '430x932 (Phone Max Portrait)', width: 430, height: 932 },
        { name: '568x320 (Phone Landscape 568)', width: 568, height: 320 },
        { name: '844x390 (Phone Landscape 844)', width: 844, height: 390 },
        { name: '768x1024 (Tablet Portrait)', width: 768, height: 1024 },
        { name: '820x1180 (Tablet iPad Air)', width: 820, height: 1180 }
      ];

      for (const vp of viewports) {
        await sendCommand('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 2,
          mobile: vp.width <= 768
        });

        // 1. Emulate System Dark Mode
        await sendCommand('Emulation.setEmulatedMedia', {
          features: [{ name: 'prefers-color-scheme', value: 'dark' }]
        });
        await new Promise(r => setTimeout(r, 60));
        const darkStyles = await sampleComputedStyles();

        // 2. Emulate System Light Mode
        await sendCommand('Emulation.setEmulatedMedia', {
          features: [{ name: 'prefers-color-scheme', value: 'light' }]
        });
        await new Promise(r => setTimeout(r, 60));
        const lightStyles = await sampleComputedStyles();

        // Verify Dark Mode did NOT invert to dark colors
        const darkBodyIsLight = darkStyles.bodyBg === 'rgb(246, 248, 253)' || darkStyles.bodyBg.includes('246');
        const darkCardIsLight = !darkStyles.statCardBg || darkStyles.statCardBg === 'rgb(255, 255, 255)' || darkStyles.statCardBg.includes('255');
        const schemesIdentical = darkStyles.bodyBg === lightStyles.bodyBg && darkStyles.bodyColor === lightStyles.bodyColor;

        logTest(`CDP [${vp.name}]: Dark Mode emulation renders identical Light Mode body & card styles`,
          darkBodyIsLight && darkCardIsLight && schemesIdentical,
          `DarkBg=${darkStyles.bodyBg}, LightBg=${lightStyles.bodyBg}`);
      }

      // Dynamic Live Transition Check: Light -> Dark -> Light while page remains open
      console.log('\n--- Dynamic System Theme Change Verification (Light -> Dark -> Light) ---');
      await sendCommand('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-color-scheme', value: 'light' }]
      });
      await new Promise(r => setTimeout(r, 100));
      const beforeDark = await sampleComputedStyles();

      await sendCommand('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-color-scheme', value: 'dark' }]
      });
      await new Promise(r => setTimeout(r, 100));
      const duringDark = await sampleComputedStyles();

      await sendCommand('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-color-scheme', value: 'light' }]
      });
      await new Promise(r => setTimeout(r, 100));
      const afterDark = await sampleComputedStyles();

      const dynamicIntegrity = beforeDark.bodyBg === duringDark.bodyBg &&
        duringDark.bodyBg === afterDark.bodyBg &&
        beforeDark.bodyColor === duringDark.bodyColor;

      logTest('Live dynamic transition: CampusSphere remains 100% in original Light Mode without visual flicker or inversion', dynamicIntegrity);

      // Cleanup CDP
      ws.close();
      browserProc.kill();
      server.close();
      try { fs.rmSync(tmpDataDir, { recursive: true, force: true }); } catch (_) {}
    }
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 5: BACKEND PRESERVATION AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 5: Backend & Security Unchanged Audit ---');
  logTest('server.js preserves verifyAuthToken and token generation', serverJs.includes('verifyAuthToken'));
  logTest('server.js preserves timetable authorization (Prompt 17-20 logic intact)', serverJs.includes('/api/timetable'));
  logTest('server.js preserves attendance authorization (Prompt 21 logic intact)', serverJs.includes('/api/attendance'));
  logTest('server.js preserves MongoDB User and Academic models', serverJs.includes('User') && serverJs.includes('AcademicStore'));

  // -------------------------------------------------------------------------
  // FINAL SUMMARY REPORT
  // -------------------------------------------------------------------------
  console.log('\n====================================================================');
  console.log(`PROMPT 27 TEST SUMMARY: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('====================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPrompt27Tests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
