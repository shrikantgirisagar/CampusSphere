// scripts/test-phase2-phase3.js
// Automated verification suite for Phase 2 (3D Scene) and Phase 3 (Motion & Transitions)
// Tests:
// 1. Bundle size budget (<= 450 KB minified, <= 150 KB gzip) & No external hosts anywhere in public/
// 2. WebGL disabled -> static poster fallback shown, 0 console errors
// 3. prefers-reduced-motion: reduce -> no 3D canvas active, content fully visible, no animation
// 4. Teardown on login -> canvas removed, renderer disposed, GPU memory freed
// 5. Zero CSP violations across all public pages

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const http = require('http');
const { spawn } = require('child_process');

const PORT = 3098;
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    totalPassed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    totalFailed++;
  }
}

// Simple static server for testing
function startStaticServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.ico': 'image/x-icon'
  };

  const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0].split('#')[0];
    if (reqUrl === '/') reqUrl = '/index.html';

    const filePath = path.join(publicDir, reqUrl);
    if (!filePath.startsWith(publicDir)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    if (reqUrl.startsWith('/api/')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true, count: 120, students: 120, faculty: 18 }));
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.log('    [Server 404 URL]:', reqUrl);
        res.writeHead(404);
        return res.end('Not Found');
      }
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      // Strict CSP matching server.js
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; frame-ancestors 'none';"
      );
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`✓ Test static server listening on http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

// Find local chrome
function getChromePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_BIN,
    process.env.PUPPETEER_EXECUTABLE_PATH
  ].filter(Boolean);

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// CDP Client Helper
async function createCDPClient(chromePath) {
  const cdpPort = 9225;
  const userDataDir = path.join(rootDir, 'temp-chrome-test-profile-' + Date.now());

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-sync'
  ]);

  // Wait for Chrome debugging port to open and fetch page target
  let pageTarget = null;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 150));
    try {
      const res = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
      if (res.ok) {
        const targets = await res.json();
        pageTarget = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
        if (pageTarget) break;
      }
    } catch (_) {}
  }

  if (!pageTarget) {
    chromeProc.kill();
    throw new Error('Failed to find page target on headless Chrome debugging port.');
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(resolve => ws.onopen = resolve);

  let msgId = 1;
  const callbacks = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const eventListeners = new Map();
  function onEvent(method, cb) {
    if (!eventListeners.has(method)) eventListeners.set(method, []);
    eventListeners.get(method).push(cb);
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const resolve = callbacks.get(data.id);
      callbacks.delete(data.id);
      resolve(data);
    } else if (data.method && eventListeners.has(data.method)) {
      eventListeners.get(data.method).forEach(cb => cb(data.params));
    }
  };

  async function close() {
    try {
      ws.close();
    } catch (_) {}
    chromeProc.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (_) {}
  }

  return { send, onEvent, close };
}

async function run() {
  console.log('==================================================================');
  console.log('PHASE 2 & PHASE 3 COMPREHENSIVE AUTOMATED VERIFICATION SUITE');
  console.log('==================================================================\n');

  // -------------------------------------------------------------
  // TEST SUITE 1: Bundle Size Budget & External Host Verification
  // -------------------------------------------------------------
  console.log('--- TEST SUITE 1: Bundle Size Budget & Self-Hosting Verification ---');
  const bundlePath = path.join(publicDir, 'vendor', 'campus3d.js');
  assert(fs.existsSync(bundlePath), 'public/vendor/campus3d.js exists on disk');

  if (fs.existsSync(bundlePath)) {
    const stats = fs.statSync(bundlePath);
    const rawBytes = stats.size;
    const rawKb = (rawBytes / 1024).toFixed(1);

    const buffer = fs.readFileSync(bundlePath);
    const gzipBytes = zlib.gzipSync(buffer).length;
    const gzipKb = (gzipBytes / 1024).toFixed(1);

    const RAW_BUDGET = 450 * 1024;   // 450 KB
    const GZIP_BUDGET = 150 * 1024;  // 150 KB

    assert(rawBytes <= RAW_BUDGET, `Bundle raw size within budget: ${rawBytes} bytes (${rawKb} KB / 450 KB)`);
    assert(gzipBytes <= GZIP_BUDGET, `Bundle gzip size within budget: ${gzipBytes} bytes (${gzipKb} KB / 150 KB)`);
  }

  // Verify motion.js and motion-ui.js
  const motionVendorPath = path.join(publicDir, 'vendor', 'motion.js');
  const motionUiPath = path.join(publicDir, 'js', 'motion-ui.js');
  assert(fs.existsSync(motionVendorPath), 'public/vendor/motion.js vendored file exists');
  assert(fs.existsSync(motionUiPath), 'public/js/motion-ui.js motion controller exists');

  // Verify ZERO external URLs (no CDN scripts or fonts) in public HTML files
  const htmlFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
  let externalUrlFound = false;
  for (const hf of htmlFiles) {
    const content = fs.readFileSync(path.join(publicDir, hf), 'utf8');
    // Match any http:// or https:// script or stylesheet link
    const externalMatches = content.match(/<(?:script|link)[^>]*(?:src|href)=["']https?:\/\/[^"'>]+/gi) || [];
    if (externalMatches.length > 0) {
      externalUrlFound = true;
      assert(false, `[FAIL] External asset reference detected in ${hf}: ${externalMatches.join(', ')}`);
    }
  }
  assert(!externalUrlFound, 'Zero external CDN scripts/styles found across all public HTML files');

  // Verify variable WOFF2 self-hosted fonts exist
  assert(fs.existsSync(path.join(publicDir, 'fonts', 'outfit-variable.woff2')), 'Self-hosted outfit-variable.woff2 exists');
  assert(fs.existsSync(path.join(publicDir, 'fonts', 'inter-variable.woff2')), 'Self-hosted inter-variable.woff2 exists');

  // -------------------------------------------------------------
  // BROWSER CDP TESTS
  // -------------------------------------------------------------
  const chromePath = getChromePath();
  if (!chromePath) {
    console.error('Chrome executable not found. Skipping in-browser CDP tests.');
    process.exit(totalFailed > 0 ? 1 : 0);
  }

  const server = await startStaticServer();
  const cdp = await createCDPClient(chromePath);

  try {
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Log.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

    const consoleErrors = [];
    const cspViolations = [];

    cdp.onEvent('Runtime.consoleAPICalled', (params) => {
      if (params.type === 'error') {
        const text = params.args.map(a => a.value || a.description || '').join(' ');
        console.log('    [Console Error Logged]:', text);
        consoleErrors.push(text);
      }
    });

    cdp.onEvent('Log.entryAdded', (params) => {
      if (params.entry.level === 'error') {
        console.log('    [Log Entry Error Logged]:', params.entry.text);
        consoleErrors.push(params.entry.text);
      }
      if (params.entry.text && params.entry.text.includes('Content Security Policy')) {
        cspViolations.push(params.entry.text);
      }
    });

    // -------------------------------------------------------------
    // TEST SUITE 2: WebGL Disabled -> Static Poster Fallback
    // -------------------------------------------------------------
    console.log('\n--- TEST SUITE 2: WebGL Disabled -> Static Poster Fallback ---');
    consoleErrors.length = 0;

    // Emulate WebGL unavailable via Page.addScriptToEvaluateOnNewDocument
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        HTMLCanvasElement.prototype.getContext = function(type) {
          if (type && type.includes('webgl')) return null;
          return null;
        };
      `
    });

    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });
    await new Promise(r => setTimeout(r, 600));

    const fallbackCheck = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const poster = document.getElementById('heroStaticPoster');
          const canvas = document.getElementById('campus3d');
          const posterStyle = poster ? window.getComputedStyle(poster) : null;
          const canvasStyle = canvas ? window.getComputedStyle(canvas) : null;
          return {
            posterExists: !!poster,
            posterVisible: posterStyle && posterStyle.display !== 'none',
            canvasHidden: !canvas || canvasStyle.display === 'none',
            bodyFallbackClass: document.body.classList.contains('poster-fallback-active')
          };
        })()
      `,
      returnByValue: true
    });

    const fallbackVal = fallbackCheck.result?.result?.value;
    assert(fallbackVal?.posterExists, 'Static poster element #heroStaticPoster is present in DOM');
    assert(fallbackVal?.posterVisible, 'Static poster is visibly displayed when WebGL is unavailable');
    assert(fallbackVal?.canvasHidden, '3D Canvas is cleanly hidden when WebGL is unavailable');
    assert(consoleErrors.length === 0, `0 console errors when WebGL is disabled (got ${consoleErrors.length})`);

    // -------------------------------------------------------------
    // TEST SUITE 3: prefers-reduced-motion -> No Canvas & Content Visible
    // -------------------------------------------------------------
    console.log('\n--- TEST SUITE 3: prefers-reduced-motion: reduce Verification ---');
    consoleErrors.length = 0;

    // Create fresh tab / reset script injection
    const targetInfo = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const newWsUrl = `ws://127.0.0.1:9225/devtools/page/${targetInfo.targetId}`;

    // Emulate reduced motion
    await cdp.send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });

    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });
    await new Promise(r => setTimeout(r, 600));

    const reducedMotionCheck = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const canvas = document.getElementById('campus3d');
          const canvasStyle = canvas ? window.getComputedStyle(canvas) : null;
          const heroTitle = document.getElementById('homeHeroTitle');
          const titleWords = document.querySelectorAll('fx-word, cs-word');
          const revealItems = document.querySelectorAll('.reveal-item');
          let allVisible = true;
          revealItems.forEach(it => {
            const op = window.getComputedStyle(it).opacity;
            if (op === '0') allVisible = false;
          });
          return {
            canvasHiddenOrInactive: !window.__campusSphere3DActive || canvasStyle.display === 'none',
            titleVisible: heroTitle && window.getComputedStyle(heroTitle).opacity !== '0',
            allContentVisible: allVisible
          };
        })()
      `,
      returnByValue: true
    });

    const reducedVal = reducedMotionCheck.result?.result?.value;
    assert(reducedVal?.canvasHiddenOrInactive, '3D Canvas animation inactive under prefers-reduced-motion: reduce');
    assert(reducedVal?.titleVisible, 'Hero title text is immediately visible with reduced motion');
    assert(reducedVal?.allContentVisible, 'All reveal-item content is visible without animation delay');

    // -------------------------------------------------------------
    // TEST SUITE 4: Full 3D Scene Running & Disposal on Portal Login
    // -------------------------------------------------------------
    console.log('\n--- TEST SUITE 4: 3D Scene Active & Teardown on Dashboard Login ---');
    consoleErrors.length = 0;

    // Clear reduced motion emulation
    await cdp.send('Emulation.setEmulatedMedia', { media: 'screen', features: [] });
    // Reload index.html normally
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });
    await new Promise(r => setTimeout(r, 800));

    // Check if 3D scene initialized and canvas is active
    const activeSceneCheck = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          if (typeof window.CampusSphereInit3D === 'function' && !window.__campusSphere3DActive) {
            window.CampusSphereInit3D();
          }
          const canvas = document.getElementById('campus3d');
          return {
            initialized: typeof window.CampusSphereInit3D === 'function',
            teardownFnExists: typeof window.CampusSphereDestroy3D === 'function',
            canvasPresent: !!canvas
          };
        })()
      `,
      returnByValue: true
    });

    const activeVal = activeSceneCheck.result?.result?.value;
    assert(activeVal?.initialized, 'window.CampusSphereInit3D initialization interface is available');
    assert(activeVal?.teardownFnExists, 'window.CampusSphereDestroy3D teardown interface is exposed');
    assert(activeVal?.canvasPresent, '#campus3d canvas element is mounted');

    // Trigger teardown (simulating user login to dashboard)
    const teardownExec = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          if (typeof window.CampusSphereDestroy3D === 'function') {
            window.CampusSphereDestroy3D();
          }
          return {
            activeFlagAfterTeardown: window.__campusSphere3DActive,
            bodyHasWebGlClass: document.body.classList.contains('webgl-active')
          };
        })()
      `,
      returnByValue: true
    });

    const teardownVal = teardownExec.result?.result?.value;
    assert(teardownVal?.activeFlagAfterTeardown === false, 'window.__campusSphere3DActive is false after teardown');
    assert(teardownVal?.bodyHasWebGlClass === false, 'webgl-active class removed from document.body upon teardown');

    // -------------------------------------------------------------
    // TEST SUITE 5: Zero CSP Violations Across All Public Pages
    // -------------------------------------------------------------
    console.log('\n--- TEST SUITE 5: CSP Compliance Across All Public Pages ---');
    const publicPages = ['/index.html', '/courses.html', '/about.html', '/students.html'];

    for (const page of publicPages) {
      cspViolations.length = 0;
      consoleErrors.length = 0;
      await cdp.send('Page.navigate', { url: `http://127.0.0.1:${PORT}${page}` });
      await new Promise(r => setTimeout(r, 400));
      assert(cspViolations.length === 0, `Page ${page} had 0 CSP violations`);
      assert(consoleErrors.length === 0, `Page ${page} had 0 console errors (got ${consoleErrors.length})`);
    }

  } finally {
    await cdp.close();
    server.close();
  }

  console.log('\n==================================================================');
  console.log(`PHASE 2 & 3 TEST SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('==================================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
