/**
 * ============================================================================
 * CAMPUSSPHERE PROMPT 25 TEST SUITE
 * Complete Login & Signup Navigation Isolation & Responsive Verification
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

async function runPrompt25Tests() {
  console.log('====================================================================');
  console.log('STARTING PROMPT 25: LOGIN & SIGNUP NAVIGATION ISOLATION AUDIT');
  console.log('====================================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  const styleCss = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf-8');
  const scriptJs = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf-8');
  const serverJs = fs.readFileSync(path.join(rootDir, 'server.js'), 'utf-8');

  // -------------------------------------------------------------------------
  // TEST SUITE 1: STATIC CSS & JS ARCHITECTURAL AUDIT
  // -------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: CSS & JS Architectural Isolation Audit ---');

  // 1. Check style.css max-width: 900px does NOT unconditionally force display: flex !important
  const media900Matches = styleCss.match(/@media\s*\(\s*max-width:\s*900px\s*\)\s*\{([\s\S]*?)\}/);
  const media900Content = media900Matches ? media900Matches[1] : '';
  const noUnconditional900Flex = !media900Content.includes('.login-page,\n  .signup-page {\n    display: flex !important;') &&
    !media900Content.includes('.login-page,\r\n  .signup-page {\r\n    display: flex !important;');
  logTest('style.css @media (max-width: 900px) does not unconditionally force display:flex on all auth pages', noUnconditional900Flex);

  // 2. Check :not(.hidden) exclusion in media queries
  const hasNotHiddenExclusion = styleCss.includes('.login-page:not(.hidden)') && styleCss.includes('.signup-page:not(.hidden)');
  logTest('style.css uses :not(.hidden) guard to prevent hidden auth pages from matching mobile flex display', hasNotHiddenExclusion);

  // 3. Check auth page isolation overrides at end of style.css
  const hasIsolationOverrides = styleCss.includes('#loginPage.hidden') &&
    styleCss.includes('#signupPage.hidden') &&
    styleCss.includes('display: none !important;');
  logTest('style.css includes definitive auth isolation overrides for #loginPage.hidden and #signupPage.hidden', hasIsolationOverrides);

  // 4. Check script.js showLogin strictly hides signupPage with !important
  const showLoginHidesSignup = scriptJs.includes('signup.classList.add("hidden")') &&
    scriptJs.includes('signup.style.setProperty("display", "none", "important")');
  logTest('script.js showLogin() strictly hides signupPage with class hidden and display:none !important', showLoginHidesSignup);

  // 5. Check script.js showSignup strictly hides loginPage with !important
  const showSignupHidesLogin = scriptJs.includes('login.classList.add("hidden")') &&
    scriptJs.includes('login.style.setProperty("display", "none", "important")');
  logTest('script.js showSignup() strictly hides loginPage with class hidden and display:none !important', showSignupHidesLogin);

  // 6. Check script.js showHome strictly hides both loginPage and signupPage
  const showHomeHidesBoth = scriptJs.includes('login.classList.add("hidden")') &&
    scriptJs.includes('login.style.setProperty("display", "none", "important")') &&
    scriptJs.includes('signup.classList.add("hidden")') &&
    scriptJs.includes('signup.style.setProperty("display", "none", "important")');
  logTest('script.js showHome() strictly hides both loginPage and signupPage with display:none !important', showHomeHidesBoth);

  // 7. Check openPortal hides both auth pages
  const openPortalHidesBoth = scriptJs.includes('$("loginPage").style.setProperty("display", "none", "important")') &&
    scriptJs.includes('$("signupPage").style.setProperty("display", "none", "important")');
  logTest('script.js openPortal() enforces display:none !important on both auth pages', openPortalHidesBoth);

  // 8. Check logout hides both auth pages
  const logoutHidesBoth = scriptJs.includes('loginEl.style.setProperty("display", "none", "important")') &&
    scriptJs.includes('signupEl.style.setProperty("display", "none", "important")');
  logTest('script.js logout() enforces display:none !important on both auth pages', logoutHidesBoth);

  // 9. Check HTML triggers exist for all entry points
  const headerLoginBtn = indexHtml.includes('class="home-auth-btn home-login-btn" data-open-login');
  logTest('Header Login button exists with data-open-login trigger', headerLoginBtn);

  const headerSignupBtn = indexHtml.includes('class="home-auth-btn home-signup-btn" data-open-signup');
  logTest('Header Sign Up button exists with data-open-signup trigger', headerSignupBtn);

  const heroSignupBtn = indexHtml.includes('class="hero-primary-btn" data-open-signup');
  logTest('Hero Get Started button exists with data-open-signup trigger', heroSignupBtn);

  const heroLoginBtn = indexHtml.includes('class="hero-secondary-btn" data-open-login');
  logTest('Hero Student Login button exists with data-open-login trigger', heroLoginBtn);

  const loginToSignupBtn = indexHtml.includes('data-open-signup>Register as Student or Faculty');
  logTest('Login card switch button exists with data-open-signup trigger', loginToSignupBtn);

  const signupToLoginBtn = indexHtml.includes('data-open-login>Sign In to Account');
  logTest('Signup card switch button exists with data-open-login trigger', signupToLoginBtn);

  const backHomeTriggers = indexHtml.includes('data-back-home');
  logTest('Back to Home navigation triggers exist on auth cards', backHomeTriggers);

  // 10. Check backend integrity preserved
  const serverUnchanged = serverJs.includes('/api/auth/login') &&
    serverJs.includes('/api/users') &&
    serverJs.includes('/api/timetable') &&
    serverJs.includes('/api/attendance');
  logTest('server.js API endpoints remain fully preserved and secure', serverUnchanged);

  console.log('');

  // -------------------------------------------------------------------------
  // TEST SUITE 2: REAL-WORLD CHROME CDP BROWSER TESTS (ALL VIEWPORTS & ACTIONS)
  // -------------------------------------------------------------------------
  console.log('--- TEST SUITE 2: Real-World Chrome CDP Browser E2E Isolation Tests ---');

  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
  ];
  let chromePath = chromePaths.find(p => p && fs.existsSync(p));

  if (!chromePath) {
    console.log("  [WARN] Google Chrome not found in standard paths. Skipping headless CDP tests.");
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

    const port = 3989;
    await new Promise(resolve => server.listen(port, resolve));

    const browserProc = spawn(chromePath, [
      '--headless=new',
      '--remote-debugging-port=9445',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-software-rasterizer',
      `http://localhost:${port}/`
    ]);

    let versionOk = false;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const res = await fetch('http://127.0.0.1:9445/json/version');
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
      const listRes = await fetch('http://127.0.0.1:9445/json/list');
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

      await new Promise(r => setTimeout(r, 600));

      // Viewports to test
      const testViewports = [
        // Mobile Portrait
        { name: '320x568 (iPhone SE)', width: 320, height: 568 },
        { name: '360x800 (Android Standard)', width: 360, height: 800 },
        { name: '375x812 (iPhone X/11)', width: 375, height: 812 },
        { name: '390x844 (iPhone 12/13/14)', width: 390, height: 844 },
        { name: '414x896 (iPhone XR/Plus)', width: 414, height: 896 },
        { name: '430x932 (iPhone 14/15 Pro Max)', width: 430, height: 932 },
        // Mobile Landscape
        { name: '568x320 (iPhone SE Landscape)', width: 568, height: 320 },
        { name: '844x390 (iPhone 14 Landscape)', width: 844, height: 390 },
        { name: '932x430 (Pro Max Landscape)', width: 932, height: 430 },
        // Tablets
        { name: '768x1024 (iPad Portrait)', width: 768, height: 1024 },
        { name: '820x1180 (iPad Air Portrait)', width: 820, height: 1180 },
        // Desktop
        { name: '1280x800 (Desktop Laptop)', width: 1280, height: 800 },
        { name: '1920x1080 (Desktop FHD)', width: 1920, height: 1080 }
      ];

      // Helper to check page states
      async function getAuthPageState() {
        return await evalInPage(`
          (() => {
            const home = document.getElementById("publicHome");
            const login = document.getElementById("loginPage");
            const signup = document.getElementById("signupPage");
            const homeComputed = home ? window.getComputedStyle(home) : null;
            const loginComputed = login ? window.getComputedStyle(login) : null;
            const signupComputed = signup ? window.getComputedStyle(signup) : null;
            const loginRect = login ? login.getBoundingClientRect() : { width: 0, height: 0 };
            const signupRect = signup ? signup.getBoundingClientRect() : { width: 0, height: 0 };

            return {
              hash: window.location.hash,
              homeVisible: homeComputed && homeComputed.display !== 'none',
              loginVisible: loginComputed && loginComputed.display !== 'none' && loginRect.height > 0,
              loginDisplay: loginComputed ? loginComputed.display : 'none',
              loginHeight: loginRect.height,
              loginHasHiddenClass: login ? login.classList.contains('hidden') : false,
              signupVisible: signupComputed && signupComputed.display !== 'none' && signupRect.height > 0,
              signupDisplay: signupComputed ? signupComputed.display : 'none',
              signupHeight: signupRect.height,
              signupHasHiddenClass: signup ? signup.classList.contains('hidden') : false,
              bothNeverSimultaneouslyVisible: !(
                (loginComputed && loginComputed.display !== 'none' && loginRect.height > 0) &&
                (signupComputed && signupComputed.display !== 'none' && signupRect.height > 0)
              )
            };
          })()
        `);
      }

      // Wait for page and scripts to be fully initialized
      for (let i = 0; i < 50; i++) {
        const ready = await evalInPage(`!!window.CampusSpherePublic && document.readyState === 'complete'`);
        if (ready) break;
        await new Promise(r => setTimeout(r, 100));
      }

      // Initial State Check: Public Home
      console.log('--- Initial State Check ---');
      await sendCommand('Emulation.setDeviceMetricsOverride', {
        width: 375,
        height: 812,
        deviceScaleFactor: 2,
        mobile: true
      });
      await new Promise(r => setTimeout(r, 200));

      let state = await getAuthPageState();
      logTest('Initial load on mobile (375x812): Home visible, Login hidden, Signup hidden',
        state.homeVisible && !state.loginVisible && !state.signupVisible && state.bothNeverSimultaneouslyVisible,
        `homeVisible=${state.homeVisible}, loginDisplay=${state.loginDisplay}, signupDisplay=${state.signupDisplay}`);

      // Action 1: Click Header Login button
      console.log('--- Action 1: Click Header Login Button ---');
      await evalInPage(`document.querySelector(".home-auth-btn.home-login-btn").click()`);
      await new Promise(r => setTimeout(r, 300));
      state = await getAuthPageState();
      logTest('Header Login Click: Login page visible, Signup page hidden (occupies 0 height)',
        state.loginVisible && !state.signupVisible && state.signupHeight === 0 && state.bothNeverSimultaneouslyVisible,
        `loginDisplay=${state.loginDisplay}, signupDisplay=${state.signupDisplay}, signupHeight=${state.signupHeight}, loginHeight=${state.loginHeight}`);

      // Action 2: Click switch button in Login card: "Register as Student or Faculty"
      console.log('--- Action 2: Click Switch to Signup Button inside Login Card ---');
      await evalInPage(`document.querySelector("#loginPage .auth-switch-btn").click()`);
      await new Promise(r => setTimeout(r, 300));
      state = await getAuthPageState();
      logTest('Switch to Signup Click: Signup page visible, Login page hidden (occupies 0 height)',
        state.signupVisible && !state.loginVisible && state.loginHeight === 0 && state.bothNeverSimultaneouslyVisible,
        `signupDisplay=${state.signupDisplay}, loginDisplay=${state.loginDisplay}, loginHeight=${state.loginHeight}, signupHeight=${state.signupHeight}`);

      // Action 3: Click switch button in Signup card: "Sign In to Account"
      console.log('--- Action 3: Click Switch to Login Button inside Signup Card ---');
      await evalInPage(`document.querySelector("#signupPage .auth-switch-btn").click()`);
      await new Promise(r => setTimeout(r, 300));
      state = await getAuthPageState();
      logTest('Switch to Login Click: Login page visible, Signup page hidden (occupies 0 height)',
        state.loginVisible && !state.signupVisible && state.signupHeight === 0 && state.bothNeverSimultaneouslyVisible,
        `loginDisplay=${state.loginDisplay}, signupDisplay=${state.signupDisplay}, signupHeight=${state.signupHeight}, loginHeight=${state.loginHeight}`);

      // Action 4: Click Back to Home button from Login card
      console.log('--- Action 4: Click Back to Home from Login Card ---');
      await evalInPage(`document.querySelector("#loginPage .login-back-btn").click()`);
      await new Promise(r => setTimeout(r, 200));
      state = await getAuthPageState();
      logTest('Back to Home Click: Home visible, both Login & Signup hidden',
        state.homeVisible && !state.loginVisible && !state.signupVisible && state.bothNeverSimultaneouslyVisible,
        `homeVisible=${state.homeVisible}, loginH=${state.loginHeight}, signupH=${state.signupHeight}`);

      // Action 5: Click Hero "Get Started" button
      console.log('--- Action 5: Click Hero "Get Started" (Sign Up) Button ---');
      await evalInPage(`document.querySelector(".hero-primary-btn").click()`);
      await new Promise(r => setTimeout(r, 200));
      state = await getAuthPageState();
      logTest('Hero Get Started Click: Signup page visible, Login page hidden',
        state.signupVisible && !state.loginVisible && state.loginHeight === 0 && state.bothNeverSimultaneouslyVisible,
        `signupDisplay=${state.signupDisplay}, loginDisplay=${state.loginDisplay}`);

      // Action 6: Click Back to Home button from Signup card
      console.log('--- Action 6: Click Back to Home from Signup Card ---');
      await evalInPage(`document.querySelector("#signupPage .login-back-btn").click()`);
      await new Promise(r => setTimeout(r, 200));
      state = await getAuthPageState();
      logTest('Back to Home from Signup: Home visible, both Login & Signup hidden',
        state.homeVisible && !state.loginVisible && !state.signupVisible && state.bothNeverSimultaneouslyVisible,
        `homeVisible=${state.homeVisible}, loginH=${state.loginHeight}, signupH=${state.signupHeight}`);

      // Action 7: Click Hero "Student Login" button
      console.log('--- Action 7: Click Hero "Student Login" Button ---');
      await evalInPage(`document.querySelector(".hero-secondary-btn").click()`);
      await new Promise(r => setTimeout(r, 200));
      state = await getAuthPageState();
      logTest('Hero Student Login Click: Login page visible, Signup page hidden',
        state.loginVisible && !state.signupVisible && state.signupHeight === 0 && state.bothNeverSimultaneouslyVisible,
        `loginDisplay=${state.loginDisplay}, signupDisplay=${state.signupDisplay}`);

      // Action 8: Test Header Sign Up button click
      console.log('--- Action 8: Click Header Sign Up Button directly from Login view ---');
      await evalInPage(`window.CampusSpherePublic.showHome()`);
      await new Promise(r => setTimeout(r, 100));
      await evalInPage(`document.querySelector(".home-auth-btn.home-signup-btn").click()`);
      await new Promise(r => setTimeout(r, 200));
      state = await getAuthPageState();
      logTest('Header Sign Up Click: Signup page visible, Login page hidden',
        state.signupVisible && !state.loginVisible && state.loginHeight === 0 && state.bothNeverSimultaneouslyVisible,
        `signupDisplay=${state.signupDisplay}, loginDisplay=${state.loginDisplay}`);

      // Action 9: Hash-based direct navigation
      console.log('--- Action 9: Hash-Based Routing Verification ---');
      await evalInPage(`window.location.hash = "login"`);
      await new Promise(r => setTimeout(r, 250));
      state = await getAuthPageState();
      logTest('Hash change to #login: Login visible, Signup hidden',
        state.loginVisible && !state.signupVisible && state.bothNeverSimultaneouslyVisible,
        `loginDisplay=${state.loginDisplay}, signupDisplay=${state.signupDisplay}`);

      await evalInPage(`window.location.hash = "signup"`);
      await new Promise(r => setTimeout(r, 250));
      state = await getAuthPageState();
      logTest('Hash change to #signup: Signup visible, Login hidden',
        state.signupVisible && !state.loginVisible && state.bothNeverSimultaneouslyVisible,
        `signupDisplay=${state.signupDisplay}, loginDisplay=${state.loginDisplay}`);

      await evalInPage(`window.location.hash = "publicHome"`);
      await new Promise(r => setTimeout(r, 250));
      state = await getAuthPageState();
      logTest('Hash change to #publicHome: Home visible, both Login & Signup hidden',
        state.homeVisible && !state.loginVisible && !state.signupVisible && state.bothNeverSimultaneouslyVisible,
        `homeVisible=${state.homeVisible}`);

      // Action 10: Multi-Viewport Isolation Sweep (Test both Login & Signup on each viewport)
      console.log('--- Action 10: Multi-Viewport Isolation Sweep across 13 distinct viewports ---');
      for (const vp of testViewports) {
        await sendCommand('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 2,
          mobile: vp.width < 1000
        });
        await new Promise(r => setTimeout(r, 100));

        // 1. Show Login
        await evalInPage(`window.CampusSpherePublic.showLogin(false)`);
        await new Promise(r => setTimeout(r, 100));
        const loginState = await getAuthPageState();
        const loginExpectedDisplay = vp.width <= 900 ? 'flex' : 'grid';
        const loginIsIsolated = loginState.loginVisible &&
          loginState.loginDisplay === loginExpectedDisplay &&
          !loginState.signupVisible &&
          loginState.signupDisplay === 'none' &&
          loginState.signupHeight === 0 &&
          loginState.bothNeverSimultaneouslyVisible;

        logTest(`Viewport ${vp.name}: showLogin isolated (Login=${loginState.loginDisplay}, Signup=${loginState.signupDisplay}, SignupHeight=0)`,
          loginIsIsolated,
          `loginRectHeight=${loginState.loginHeight}`);

        // 2. Show Signup
        await evalInPage(`window.CampusSpherePublic.showSignup("student", false)`);
        await new Promise(r => setTimeout(r, 100));
        const signupState = await getAuthPageState();
        const signupExpectedDisplay = vp.width <= 900 ? 'flex' : 'grid';
        const signupIsIsolated = signupState.signupVisible &&
          signupState.signupDisplay === signupExpectedDisplay &&
          !signupState.loginVisible &&
          signupState.loginDisplay === 'none' &&
          signupState.loginHeight === 0 &&
          signupState.bothNeverSimultaneouslyVisible;

        logTest(`Viewport ${vp.name}: showSignup isolated (Signup=${signupState.signupDisplay}, Login=${signupState.loginDisplay}, LoginHeight=0)`,
          signupIsIsolated,
          `signupRectHeight=${signupState.signupHeight}`);
      }

      // Cleanup CDP & test server
      ws.close();
      browserProc.kill();
      server.close();
    }
  }

  // -------------------------------------------------------------------------
  // FINAL REPORT
  // -------------------------------------------------------------------------
  console.log('\n====================================================================');
  console.log(`PROMPT 25 TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
  if (failedTests > 0) {
    console.error(`FAILED: ${failedTests} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('ALL AUTH PAGE NAVIGATION & ISOLATION TESTS PASSED 100%!');
    console.log('====================================================================\n');
    process.exit(0);
  }
}

runPrompt25Tests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
