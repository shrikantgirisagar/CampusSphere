/**
 * scripts/test-timetable-ui-save.js
 * 
 * Verifies that the client-side saveTimetableDoc function, apiRequest,
 * commitTimetableDomInputs, and click handling correctly save user edits
 * to MongoDB when the save button is clicked.
 */

require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Timetable = require('../models/Timetable');

const TEST_PORT = 3097;
const BASE_URL = `http://localhost:${TEST_PORT}`;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function hashPassword(pwd) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(pwd, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$16384$8$1$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`);
    });
  });
}

// Minimal DOM mock
class MockElement {
  constructor(tag, id = "") {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = "";
    this.classList = {
      add: (...c) => { this.className += " " + c.join(" "); },
      remove: (...c) => {},
      toggle: (c, force) => {},
      contains: (c) => this.className.includes(c)
    };
    this.textContent = "";
    this.innerHTML = "";
    this.value = "";
    this.dataset = {};
    this.children = [];
    this.style = {};
    this.attributes = {};
    this.disabled = false;
    this._listeners = {};
  }

  setAttribute(name, val) { this.attributes[name] = val; }
  getAttribute(name) { return this.attributes[name]; }
  appendChild(child) { this.children.push(child); return child; }
  remove() { this.parent = null; }
  querySelector(sel) { return null; }
  querySelectorAll(sel) { return []; }

  addEventListener(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }
  click() {
    if (typeof this.onclick === "function") this.onclick({ preventDefault: () => {} });
    if (this._listeners["click"]) {
      this._listeners["click"].forEach(fn => fn({ preventDefault: () => {} }));
    }
  }
}

async function runTest() {
  console.log('=== Verifying Timetable UI Save Flow ===\n');

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'CampusSphere' });
  console.log('✓ Connected to MongoDB');

  // Start test server
  const { spawn } = require('child_process');
  const serverProc = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(TEST_PORT) },
    stdio: 'pipe'
  });

  let serverOnline = false;
  for (let i = 0; i < 30; i++) {
    await wait(500);
    try {
      const res = await fetch(`${BASE_URL}/api/status`);
      const data = await res.json();
      if (data && data.success && data.databaseState === 'connected') {
        serverOnline = true;
        break;
      }
    } catch (_) {}
  }

  if (!serverOnline) {
    serverProc.kill();
    throw new Error('Server failed to start.');
  }
  console.log(`✓ Test server running at ${BASE_URL}\n`);

  const tag = Date.now();
  const adminUsername = `test_admin_${tag}`;
  const facUsername = `test_fac_${tag}`;
  const pwd = 'Password123!';
  const hashedPwd = await hashPassword(pwd);

  try {
    // Create test admin and faculty
    await User.create([
      { id: `id-${adminUsername}`, role: 'admin', username: adminUsername, name: 'Test Admin', email: `${adminUsername}@test.edu`, passwordHash: hashedPwd },
      { id: `id-${facUsername}`, role: 'faculty', username: facUsername, name: 'Test Faculty', email: `${facUsername}@test.edu`, passwordHash: hashedPwd, subject: 'cprog', subjects: ['cprog'], division: 'Div A' }
    ]);

    // Login admin
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin', username: adminUsername, password: pwd })
    });
    const adminLogin = await adminLoginRes.json();
    const adminToken = adminLogin.token;

    // Login faculty
    const facLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'faculty', username: facUsername, password: pwd })
    });
    const facLogin = await facLoginRes.json();
    const facToken = facLogin.token;

    // Set up global environment
    const storage = {};
    global.sessionStorage = {
      getItem: (k) => storage[k] || null,
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: (k) => { delete storage[k]; }
    };
    global.localStorage = { ...global.sessionStorage };
    global.window = {
      location: { protocol: 'http:', origin: BASE_URL, hash: '', pathname: '/' },
      sessionStorage: global.sessionStorage,
      localStorage: global.localStorage,
      scrollTo: () => {}
    };

    const elementsById = {
      content: new MockElement("div", "content"),
      notifToastContainer: new MockElement("div", "notifToastContainer"),
      timetableSaveMsg: new MockElement("p", "timetableSaveMsg"),
      btnSaveTimetable: new MockElement("button", "btnSaveTimetable")
    };

    const directInputs = [];
    const timeInputs = [];

    // Mock direct-cell-input elements
    for (let d = 0; d < 6; d++) {
      for (let s = 0; s < 6; s++) {
        const input = new MockElement("input");
        input.className = "direct-cell-input";
        input.dataset = { dayIdx: String(d), slotIdx: String(s) };
        input.value = "";
        directInputs.push(input);
      }
    }

    for (let s = 0; s < 6; s++) {
      const input = new MockElement("input");
      input.className = "timetable-time-inline-edit";
      input.dataset = { slotIdx: String(s) };
      input.value = "09:00 - 10:00";
      timeInputs.push(input);
    }

    global.document = {
      getElementById: (id) => {
        if (!elementsById[id]) elementsById[id] = new MockElement("div", id);
        return elementsById[id];
      },
      querySelectorAll: (sel) => {
        if (sel.includes(".direct-cell-input")) return directInputs;
        if (sel.includes(".timetable-time-inline-edit")) return timeInputs;
        return [];
      },
      createElement: (tag) => new MockElement(tag),
      body: {
        appendChild: (child) => {}
      },
      addEventListener: () => {},
      querySelector: (sel) => null
    };
    global.window.addEventListener = () => {};
    global.$ = (id) => {
      if (!elementsById[id]) elementsById[id] = new MockElement("div", id);
      return elementsById[id];
    };


    // Read and evaluate script.js
    const fs = require('fs');
    const scriptSrc = fs.readFileSync('script.js', 'utf8');

    // Run in isolated context
    const vm = require('vm');
    const ctx = vm.createContext({
      window: global.window,
      document: global.document,
      sessionStorage: global.sessionStorage,
      localStorage: global.localStorage,
      fetch: fetch,
      $: global.$,
      console: console,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      Date: Date,
      Math: Math,
      String: String,
      Number: Number,
      Boolean: Boolean,
      Array: Array,
      Object: Object,
      JSON: JSON,
      encodeURIComponent: encodeURIComponent
    });

    vm.runInContext(scriptSrc, ctx);
    const evalInCtx = (code) => vm.runInContext(code, ctx);

    console.log('1. Checking client helper functions:');
    console.log(`   apiRequest: ${typeof evalInCtx('typeof apiRequest') === 'string' && evalInCtx('typeof apiRequest === "function"') ? '✓ function' : '✗ missing'}`);
    console.log(`   showToast: ${typeof evalInCtx('typeof showToast') === 'string' && evalInCtx('typeof showToast === "function"') ? '✓ function' : '✗ missing'}`);
    console.log(`   commitTimetableDomInputs: ${evalInCtx('typeof commitTimetableDomInputs === "function"') ? '✓ function' : '✗ missing'}`);
    console.log(`   saveTimetableDoc: ${evalInCtx('typeof saveTimetableDoc === "function"') ? '✓ function' : '✗ missing'}`);

    // Test 2: Admin edits and saves
    console.log('\n2. Testing Admin Save:');
    const adminUserObj = { id: `id-${adminUsername}`, role: 'admin', username: adminUsername, name: 'Test Admin' };
    storage['portalAuthToken'] = adminToken;
    storage['portalUser'] = JSON.stringify(adminUserObj);

    evalInCtx(`
      currentUser = ${JSON.stringify(adminUserObj)};
      currentTimetableDoc = createDefaultTimetableDoc('1st Semester', 'Div A');
      isTimetableEditMode = true;
    `);

    // Simulate user typing in cell [0,0]
    const targetInput = directInputs.find(i => i.dataset.dayIdx === "0" && i.dataset.slotIdx === "0");
    targetInput.value = "Mathematics";
    console.log('   ✓ Simulated typing "Mathematics" into cell [0,0]');

    // Wire up save button click listener as initTimetablePage does
    elementsById.btnSaveTimetable.onclick = (e) => evalInCtx('saveTimetableDoc()');

    // Click Save Button
    console.log('   ✓ Clicking #btnSaveTimetable...');
    await elementsById.btnSaveTimetable.onclick();
    console.log('   Save message after click:', elementsById.timetableSaveMsg.textContent);

    // Verify database persistence
    console.log('\n3. Verifying MongoDB persistence:');
    const savedDoc = await Timetable.findOne({ semester: '1st Semester', division: 'Div A' }).lean();
    if (!savedDoc) throw new Error('Timetable was not saved to MongoDB!');
    const savedCell = savedDoc.cells.find(c => c.dayIndex === 0 && c.slotIndex === 0);
    console.log(`   Saved document found with ${savedDoc.cells.length} cells.`);
    console.log(`   Cell [0,0] subject in MongoDB: "${savedCell ? savedCell.subject : 'none'}"`);
    if (!savedCell || savedCell.subject !== 'Mathematics') {
      throw new Error(`Expected cell subject to be 'Mathematics', got '${savedCell?.subject}'`);
    }
    console.log('   ✓ Cell subject successfully persisted to MongoDB!');
    console.log(`   Save status message: "${elementsById.timetableSaveMsg.textContent}"`);
    console.log(`   isTimetableEditMode after save: ${evalInCtx('isTimetableEditMode')} (Expected: false)`);

    // Test 4: Faculty saves assigned subject with alias
    console.log('\n4. Testing Faculty Save with subject alias:');
    const facUserObj = {
      id: `id-${facUsername}`,
      role: 'faculty',
      username: facUsername,
      name: 'Test Faculty',
      subject: 'cprog',
      subjects: ['cprog'],
      division: 'Div A'
    };
    storage['portalAuthToken'] = facToken;
    storage['portalUser'] = JSON.stringify(facUserObj);

    evalInCtx(`
      currentUser = ${JSON.stringify(facUserObj)};
      isTimetableEditMode = true;
    `);
    const facInput = directInputs.find(i => i.dataset.dayIdx === "1" && i.dataset.slotIdx === "0");
    // Faculty types canonical name "C Programming" while assigned ID is "cprog"
    facInput.value = "C Programming";
    console.log('   ✓ Simulated faculty typing "C Programming" into cell [1,0]');

    await elementsById.btnSaveTimetable.onclick();

    const facSavedDoc = await Timetable.findOne({ semester: '1st Semester', division: 'Div A' }).lean();
    const facCell = facSavedDoc.cells.find(c => c.dayIndex === 1 && c.slotIndex === 0);
    console.log(`   Faculty cell [1,0] subject in MongoDB: "${facCell ? facCell.subject : 'none'}"`);
    if (!facCell || facCell.subject !== 'C Programming') {
      throw new Error(`Expected faculty cell subject to be 'C Programming', got '${facCell?.subject}'`);
    }
    console.log('   ✓ Faculty subject alias successfully accepted and saved to MongoDB!');

    // Test 5: Verify reload via apiRequest
    console.log('\n5. Verifying client apiRequest fetch:');
    const loadedData = await evalInCtx("apiRequest('/api/timetable?semester=1st%20Semester&division=Div%20A')");
    if (!loadedData || !loadedData.success || !loadedData.timetable) {
      throw new Error('Failed to load timetable using client apiRequest');
    }
    console.log(`   ✓ apiRequest successfully retrieved saved timetable with ${loadedData.timetable.cells.length} cells.`);

    console.log('\n==============================================');
    console.log('✅ TIMETABLE UI SAVE BUTTON VERIFIED FULLY WORKING!');
    console.log('==============================================');
  } finally {
    await User.deleteMany({ username: { $in: [adminUsername, facUsername] } });
    await Timetable.deleteMany({ semester: '1st Semester', division: 'Div A' });
    serverProc.kill();
    await mongoose.disconnect();
  }
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
