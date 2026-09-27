/**
 * ============================================================================
 * CAMPUSSPHERE PROMPT 32 TEST SUITE
 * Complete Email OTP Authentication, Signup Email Verification & Forgot Password
 * ============================================================================
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');
const mongoose = require('mongoose');

const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const emailService = require('../services/emailService');

const TEST_PORT = 3099;
const BASE_URL = `http://localhost:${TEST_PORT}`;
const TEST_STORE_PATH = path.join(__dirname, '..', 'scratch', 'test_emails.json');

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

function request(method, pathName, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathName, BASE_URL);
    const req = http.request(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-test-rate-limit': 'bypass',
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) {}
        resolve({ status: res.statusCode, headers: res.headers, body: json, raw: data });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function getLatestCapturedEmail(toEmail, purpose) {
  if (!fs.existsSync(TEST_STORE_PATH)) return null;
  try {
    const records = JSON.parse(fs.readFileSync(TEST_STORE_PATH, 'utf8'));
    const matches = records.filter(r => r.to === toEmail && (!purpose || r.purpose === purpose));
    return matches.length > 0 ? matches[matches.length - 1] : null;
  } catch (_) {
    return null;
  }
}

async function runPrompt32Tests() {
  console.log('====================================================================');
  console.log('STARTING PROMPT 32: EMAIL OTP AUTHENTICATION & PASSWORD RESET AUDIT');
  console.log('====================================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  const styleCss = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf-8');
  const scriptJs = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf-8');
  const serverJs = fs.readFileSync(path.join(rootDir, 'server.js'), 'utf-8');
  const pkgJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
  const envExample = fs.readFileSync(path.join(rootDir, '.env.example'), 'utf-8');
  const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf-8');

  // Prepare scratch directory for mock email store
  const scratchDir = path.join(rootDir, 'scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  fs.writeFileSync(TEST_STORE_PATH, JSON.stringify([]));

  // -------------------------------------------------------------------------
  // SUITE 1: PACKAGE, ENVIRONMENT & INFRASTRUCTURE AUDIT
  // -------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: Package, Configuration & Architecture ---');

  logTest('resend package is installed in package.json dependencies', Boolean(pkgJson.dependencies?.resend));
  logTest('.env.example includes RESEND_API_KEY placeholder', envExample.includes('RESEND_API_KEY=your_resend_api_key_here'));
  logTest('.env.example includes RESEND_FROM_EMAIL placeholder', envExample.includes('RESEND_FROM_EMAIL='));
  logTest('.env is strictly protected by .gitignore', gitignore.includes('.env'));
  logTest('models/OtpVerification.js exists', fs.existsSync(path.join(rootDir, 'models', 'OtpVerification.js')));
  logTest('services/emailService.js exists', fs.existsSync(path.join(rootDir, 'services', 'emailService.js')));
  logTest('models/User.js includes isEmailVerified field', fs.readFileSync(path.join(rootDir, 'models', 'User.js'), 'utf-8').includes('isEmailVerified'));

  // Frontend controls
  logTest('index.html contains Forgot Password trigger (btnForgotPassword)', indexHtml.includes('id="btnForgotPassword"'));
  logTest('index.html contains forgotPasswordModal dialog', indexHtml.includes('id="forgotPasswordModal"'));
  logTest('index.html contains signupOtpModal dialog', indexHtml.includes('id="signupOtpModal"'));
  logTest('index.html forgot modal contains all 4 workflow step sections',
    indexHtml.includes('id="forgotStep1"') &&
    indexHtml.includes('id="forgotStep2"') &&
    indexHtml.includes('id="forgotStep3"') &&
    indexHtml.includes('id="forgotStep4"')
  );
  logTest('script.js contains Email OTP and Forgot Password integration', scriptJs.includes('initPrompt32EmailOtpAuth') || scriptJs.includes('openSignupOtpModal'));
  logTest('style.css defines light-mode styles for auth link buttons', styleCss.includes('.auth-link-btn'));

  // Endpoints defined in server.js
  logTest('server.js defines POST /api/auth/signup/request-otp', serverJs.includes('/api/auth/signup/request-otp'));
  logTest('server.js defines POST /api/auth/signup/verify-otp', serverJs.includes('/api/auth/signup/verify-otp'));
  logTest('server.js defines POST /api/auth/signup/resend-otp', serverJs.includes('/api/auth/signup/resend-otp'));
  logTest('server.js defines POST /api/auth/forgot-password/request-otp', serverJs.includes('/api/auth/forgot-password/request-otp'));
  logTest('server.js defines POST /api/auth/forgot-password/verify-otp', serverJs.includes('/api/auth/forgot-password/verify-otp'));
  logTest('server.js defines POST /api/auth/forgot-password/reset-password', serverJs.includes('/api/auth/forgot-password/reset-password'));

  // -------------------------------------------------------------------------
  // SUITE 2: CRYPTOGRAPHY, SECURE RANDOMNESS & UNIT TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: Cryptographic OTP & Token Generation Unit Tests ---');

  let all6Digits = true;
  let allNumeric = true;
  for (let i = 0; i < 50; i++) {
    const code = emailService.generateNumericOtp();
    if (code.length !== 6) all6Digits = false;
    if (!/^\d{6}$/.test(code)) allNumeric = false;
  }
  logTest('generateNumericOtp() always returns exactly 6 digits across 50 iterations', all6Digits && allNumeric);

  const testSecret = 'campussphere_test_secret_key_12345';
  const testOtp = '048291';
  const testHash = emailService.hashOtp(testOtp, testSecret);
  logTest('hashOtp() generates a 64-char hex HMAC-SHA256 string', testHash.length === 64 && /^[0-9a-f]{64}$/.test(testHash));
  logTest('hashOtp() does NOT store plaintext OTP', !testHash.includes(testOtp));
  logTest('verifyOtpHash() returns true for matching OTP and hash', emailService.verifyOtpHash(testOtp, testHash, testSecret));
  logTest('verifyOtpHash() returns false for incorrect OTP', !emailService.verifyOtpHash('123456', testHash, testSecret));
  logTest('verifyOtpHash() safely returns false for null/empty/truncated hash', !emailService.verifyOtpHash(testOtp, 'invalid', testSecret));

  const resetToken = emailService.generateResetToken();
  const resetTokenHash = emailService.hashResetToken(resetToken);
  logTest('generateResetToken() generates a cryptographically random 64-char hex token', resetToken.length === 64 && /^[0-9a-f]{64}$/.test(resetToken));
  logTest('hashResetToken() generates SHA-256 hash of reset token', resetTokenHash.length === 64 && /^[0-9a-f]{64}$/.test(resetTokenHash));

  // Email template verification
  const signupTmpl = emailService.buildOtpEmailTemplate({ otp: '556677', purpose: 'signup_verification' });
  logTest('buildOtpEmailTemplate for signup contains OTP and 10-minute expiry notice', signupTmpl.html.includes('556677') && signupTmpl.html.includes('10 minutes'));
  const resetTmpl = emailService.buildOtpEmailTemplate({ otp: '889900', purpose: 'password_reset' });
  logTest('buildOtpEmailTemplate for password reset contains OTP and ignore notice', resetTmpl.html.includes('889900') && resetTmpl.html.includes('ignore this email'));

  // Mock sender unit tests
  let mockCalledWith = null;
  emailService.setMockSender(async (data) => {
    mockCalledWith = data;
    return { success: true, id: 'mock-test-id-1' };
  });

  const sendRes = await emailService.sendEmailOtp({ email: 'test@example.com', otp: '112233', purpose: 'signup_verification' });
  logTest('sendEmailOtp() successfully executes registered mock sender', sendRes.success && sendRes.id === 'mock-test-id-1');
  logTest('sendEmailOtp() passes correct email and purpose to sender', mockCalledWith?.to === 'test@example.com' && mockCalledWith?.purpose === 'signup_verification');

  // Provider failure simulation
  emailService.setMockSender(async () => {
    throw new Error('Simulated provider timeout');
  });
  const failRes = await emailService.sendEmailOtp({ email: 'test@example.com', otp: '112233', purpose: 'password_reset' });
  logTest('sendEmailOtp() handles provider failure safely without unhandled exception', failRes.success === false && Boolean(failRes.error));

  // Reset mock sender
  emailService.setMockSender(null);

  // -------------------------------------------------------------------------
  // SUITE 3: DATABASE CONNECTION & SERVER LAUNCH
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: MongoDB & Test Server Initialization ---');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/CampusSphere', {
    dbName: 'CampusSphere',
    serverSelectionTimeoutMS: 8000
  });
  logTest('Connected to MongoDB database', mongoose.connection.readyState === 1);

  // Start test server process
  console.log(`Starting test server on port ${TEST_PORT}...`);
  const serverProc = spawn('node', ['server.js'], {
    cwd: rootDir,
    env: {
      ...process.env,
      PORT: String(TEST_PORT),
      NODE_ENV: 'test',
      TEST_EMAIL_STORE_PATH: TEST_STORE_PATH
    },
    stdio: 'pipe'
  });

  serverProc.stderr.on('data', d => {
    const str = d.toString();
    if (str.includes('Error') && !str.includes('test')) console.error('Server stderr:', str);
  });

  let serverOnline = false;
  for (let i = 0; i < 40; i++) {
    await wait(400);
    try {
      const res = await request('GET', '/api/push/public-key');
      if (res.status === 200 || res.status === 503) {
        serverOnline = true;
        break;
      }
    } catch (_) {}
  }

  logTest('Test server is responsive on port ' + TEST_PORT, serverOnline);
  if (!serverOnline) {
    serverProc.kill();
    throw new Error('Test server failed to start within timeout.');
  }

  // -------------------------------------------------------------------------
  // SUITE 4: SIGNUP EMAIL VERIFICATION WORKFLOW AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 4: Signup Email OTP Verification Flow ---');

  const testStudentUser = `otp_stud_${crypto.randomBytes(4).toString('hex')}`;
  const testStudentEmail = `otp_${crypto.randomBytes(4).toString('hex')}@campussphere.edu`;
  const testStudentPass = 'SecurePass987!';

  // 1. Request Signup OTP
  const signupReq = await request('POST', '/api/auth/signup/request-otp', {}, {
    name: 'OTP Verified Student',
    username: testStudentUser,
    email: testStudentEmail,
    password: testStudentPass,
    role: 'student',
    course: 'Bachelor of Computer Applications (BCA)',
    courseYear: '1st Year',
    semester: '1st Semester',
    division: 'Div A',
    languageChoice: 'Kannada',
    mathChoice: 'Mathematics'
  });

  logTest('POST /api/auth/signup/request-otp returns 200 on valid student data', signupReq.status === 200 && signupReq.body?.success);
  logTest('Signup OTP request response does NOT expose the OTP', !JSON.stringify(signupReq.body).includes(signupReq.body?.otp));

  // Verify in DB that OtpVerification document exists
  const dbSignupOtp = await OtpVerification.findOne({ email: testStudentEmail.toLowerCase(), purpose: 'signup_verification' });
  logTest('OtpVerification document is saved in MongoDB with purpose signup_verification', Boolean(dbSignupOtp));
  logTest('Stored OtpVerification hash is NOT plaintext OTP', dbSignupOtp && dbSignupOtp.otpHash.length === 64);
  logTest('User document is NOT created before OTP verification', !(await User.findOne({ username: testStudentUser })));

  // 2. Cooldown check: Immediate duplicate request returns 429
  const rapidReq = await request('POST', '/api/auth/signup/request-otp', {}, {
    name: 'OTP Verified Student',
    username: testStudentUser,
    email: testStudentEmail,
    password: testStudentPass,
    role: 'student'
  });
  logTest('Rapid signup OTP request within 60s is blocked by cooldown (429)', rapidReq.status === 429 && rapidReq.body?.message?.includes('wait'));

  // 3. Incorrect OTP verification
  const badVerify = await request('POST', '/api/auth/signup/verify-otp', {}, {
    email: testStudentEmail,
    otp: '000000'
  });
  logTest('POST /api/auth/signup/verify-otp fails with 400 for incorrect OTP', badVerify.status === 400 && !badVerify.body?.success);

  // Check attempt increment
  const dbAfterBad = await OtpVerification.findOne({ email: testStudentEmail.toLowerCase(), purpose: 'signup_verification' });
  logTest('OtpVerification attempts counter incremented to 1', dbAfterBad?.attempts === 1);

  // 4. Max attempts exhaustion: simulate 4 more failed attempts
  for (let a = 0; a < 4; a++) {
    await request('POST', '/api/auth/signup/verify-otp', {}, { email: testStudentEmail, otp: '111111' });
  }
  const exhaustedOtp = await OtpVerification.findOne({ email: testStudentEmail.toLowerCase(), purpose: 'signup_verification' });
  logTest('OtpVerification is marked used/invalidated after 5 failed attempts', exhaustedOtp?.used === true || exhaustedOtp?.attempts >= 5);

  const lockedVerify = await request('POST', '/api/auth/signup/verify-otp', {}, {
    email: testStudentEmail,
    otp: '000000'
  });
  logTest('Subsequent OTP verification is rejected with "Too many verification attempts"', lockedVerify.status === 400 && lockedVerify.body?.message?.includes('Too many'));

  // 5. Fresh Signup & Successful Verification
  const freshStudentUser = `otp_pass_${crypto.randomBytes(4).toString('hex')}`;
  const freshStudentEmail = `otp_pass_${crypto.randomBytes(4).toString('hex')}@campussphere.edu`;

  await request('POST', '/api/auth/signup/request-otp', {}, {
    name: 'Fully Verified Student',
    username: freshStudentUser,
    email: freshStudentEmail,
    password: testStudentPass,
    role: 'student',
    course: 'Bachelor of Computer Applications (BCA)',
    courseYear: '2nd Year',
    semester: '3rd Semester',
    division: 'Div B',
    languageChoice: 'Hindi',
    mathChoice: 'Mathematics'
  });

  const sentEmailObj = getLatestCapturedEmail(freshStudentEmail.toLowerCase(), 'signup_verification');
  logTest('Test mock captured dispatched signup OTP email', Boolean(sentEmailObj?.otp));

  const goodOtp = sentEmailObj?.otp || '123456';
  const goodVerify = await request('POST', '/api/auth/signup/verify-otp', {}, {
    email: freshStudentEmail,
    otp: goodOtp
  });

  logTest('POST /api/auth/signup/verify-otp returns 201 on correct OTP', goodVerify.status === 201 && goodVerify.body?.success);
  logTest('Signup verification response issues auth token', Boolean(goodVerify.body?.token));

  // Verify created user properties
  const createdStudent = await User.findOne({ username: freshStudentUser });
  logTest('Student user created in DB with isEmailVerified = true', createdStudent && createdStudent.isEmailVerified === true);
  logTest('Student preserves course ("Bachelor of Computer Applications (BCA)")', createdStudent?.course === 'Bachelor of Computer Applications (BCA)');
  logTest('Student preserves semester ("3rd Semester") and division ("Div B")', createdStudent?.semester === '3rd Semester' && createdStudent?.division === 'Div B');
  logTest('Student preserves languageChoice ("Hindi")', createdStudent?.languageChoice === 'Hindi');

  // Verify OTP cannot be reused
  const reuseVerify = await request('POST', '/api/auth/signup/verify-otp', {}, {
    email: freshStudentEmail,
    otp: goodOtp
  });
  logTest('Used signup OTP cannot be reused (400)', reuseVerify.status === 400 && !reuseVerify.body?.success);

  // 6. Role self-registration restriction
  const facultySelfReq = await request('POST', '/api/auth/signup/request-otp', {}, {
    name: 'Unauthorized Faculty Self-Signup',
    username: 'fac_self_unauth',
    email: 'fac_unauth@campussphere.edu',
    password: 'Password123!',
    role: 'faculty'
  });
  logTest('Self-registration as faculty is strictly forbidden with 403', facultySelfReq.status === 403);

  // -------------------------------------------------------------------------
  // SUITE 5: FORGOT PASSWORD & PASSWORD RESET AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 5: Forgot Password & Password Reset Flow ---');

  // 1. Anti-enumeration: Unknown email returns generic success
  const unknownEmailReq = await request('POST', '/api/auth/forgot-password/request-otp', {}, {
    email: 'nonexistent_account_xyz999@campussphere.edu'
  });
  logTest('Unknown email returns generic success (anti-enumeration)',
    unknownEmailReq.status === 200 &&
    unknownEmailReq.body?.success &&
    unknownEmailReq.body?.message?.includes('If the email is registered')
  );

  // 2. Valid user forgot password request
  const forgotReq = await request('POST', '/api/auth/forgot-password/request-otp', {}, {
    email: freshStudentEmail
  });
  logTest('POST /api/auth/forgot-password/request-otp returns 200 generic response',
    forgotReq.status === 200 &&
    forgotReq.body?.success &&
    forgotReq.body?.message?.includes('If the email is registered')
  );

  // 3. Cooldown check
  const rapidForgot = await request('POST', '/api/auth/forgot-password/request-otp', {}, {
    email: freshStudentEmail
  });
  logTest('Forgot password request within 60s is blocked by cooldown (429)', rapidForgot.status === 429);

  // 4. Capture reset OTP and verify
  const resetEmailObj = getLatestCapturedEmail(freshStudentEmail.toLowerCase(), 'password_reset');
  logTest('Test mock captured dispatched password reset OTP email', Boolean(resetEmailObj?.otp));

  const resetOtp = resetEmailObj?.otp;

  // Incorrect OTP verification
  const badResetVerify = await request('POST', '/api/auth/forgot-password/verify-otp', {}, {
    email: freshStudentEmail,
    otp: '999999'
  });
  logTest('Verify forgot-password OTP fails with 400 for incorrect OTP', badResetVerify.status === 400);

  // Correct OTP verification
  const goodResetVerify = await request('POST', '/api/auth/forgot-password/verify-otp', {}, {
    email: freshStudentEmail,
    otp: resetOtp
  });
  logTest('Verify forgot-password OTP succeeds (200) and returns resetToken',
    goodResetVerify.status === 200 &&
    goodResetVerify.body?.success &&
    Boolean(goodResetVerify.body?.resetToken)
  );

  const resetTokenReceived = goodResetVerify.body?.resetToken;
  logTest('Reset token received is a cryptographically random 64-char string', resetTokenReceived?.length === 64);

  // Verify OTP marked used
  const dbResetOtpUsed = await OtpVerification.findOne({ email: freshStudentEmail.toLowerCase(), purpose: 'password_reset' });
  logTest('Password reset OTP marked used immediately upon issuance of resetToken', dbResetOtpUsed?.used === true);

  // Reusing the same OTP fails
  const reuseResetOtp = await request('POST', '/api/auth/forgot-password/verify-otp', {}, {
    email: freshStudentEmail,
    otp: resetOtp
  });
  logTest('Consumed password reset OTP cannot be verified a second time', reuseResetOtp.status === 400);

  // 5. Password Reset Validation Checks
  const mismatchPass = await request('POST', '/api/auth/forgot-password/reset-password', {}, {
    resetToken: resetTokenReceived,
    newPassword: 'BrandNewPassword123!',
    confirmPassword: 'MismatchPassword999!'
  });
  logTest('Reset password rejects mismatched passwords with 400', mismatchPass.status === 400 && mismatchPass.body?.message?.includes('match'));

  const shortPass = await request('POST', '/api/auth/forgot-password/reset-password', {}, {
    resetToken: resetTokenReceived,
    newPassword: '123',
    confirmPassword: '123'
  });
  logTest('Reset password rejects password shorter than 6 characters (400)', shortPass.status === 400 && shortPass.body?.message?.includes('6 characters'));

  const invalidTokenReset = await request('POST', '/api/auth/forgot-password/reset-password', {}, {
    resetToken: 'invalid_forged_reset_token_0123456789abcdef0123456789abcdef',
    newPassword: 'BrandNewPassword123!',
    confirmPassword: 'BrandNewPassword123!'
  });
  logTest('Reset password rejects invalid/forged reset token with 400', invalidTokenReset.status === 400 && invalidTokenReset.body?.message?.includes('Invalid or expired'));

  // 6. Successful Password Reset
  const newPass = 'UpdatedSecurePass2026!';
  const resetSuccess = await request('POST', '/api/auth/forgot-password/reset-password', {}, {
    resetToken: resetTokenReceived,
    newPassword: newPass,
    confirmPassword: newPass
  });
  logTest('Reset password succeeds with 200 and success confirmation',
    resetSuccess.status === 200 &&
    resetSuccess.body?.success &&
    resetSuccess.body?.message?.includes('successfully')
  );

  // Verify single-use: token cannot be reused
  const replayReset = await request('POST', '/api/auth/forgot-password/reset-password', {}, {
    resetToken: resetTokenReceived,
    newPassword: 'AnotherPassword456!',
    confirmPassword: 'AnotherPassword456!'
  });
  logTest('Reset token is consumed and cannot be reused (400)', replayReset.status === 400);

  // 7. Verify Login with New vs Old Password
  const oldLogin = await request('POST', '/api/auth/login', {}, {
    role: 'student',
    username: freshStudentUser,
    password: testStudentPass // Old password
  });
  logTest('Login with OLD password fails (401)', oldLogin.status === 401 && !oldLogin.body?.success);

  const newLogin = await request('POST', '/api/auth/login', {}, {
    role: 'student',
    username: freshStudentUser,
    password: newPass // New password
  });
  logTest('Login with NEW password succeeds (200) and returns valid token', newLogin.status === 200 && newLogin.body?.success && Boolean(newLogin.body?.token));

  // -------------------------------------------------------------------------
  // SUITE 6: IDOR & SECURITY TAMPERING AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 6: Security, IDOR Protection & Secret Exposure ---');

  // Verify reset endpoint cannot accept userId or username to hijack other accounts
  const attackerEmail = `attacker_${crypto.randomBytes(4).toString('hex')}@campussphere.edu`;
  const victimEmail = `victim_${crypto.randomBytes(4).toString('hex')}@campussphere.edu`;

  // Create victim user
  await User.create({
    id: `student-vic-${crypto.randomBytes(4).toString('hex')}`,
    role: 'student',
    name: 'Victim Student',
    username: `victim_${crypto.randomBytes(4).toString('hex')}`,
    email: victimEmail,
    passwordHash: 'scrypt$16384$8$1$c2FsdHNhbHQ$aGFzaGhhc2g',
    isEmailVerified: true
  });

  // Create attacker user
  const attackerUser = `attacker_${crypto.randomBytes(4).toString('hex')}`;
  await User.create({
    id: `student-att-${crypto.randomBytes(4).toString('hex')}`,
    role: 'student',
    name: 'Attacker Student',
    username: attackerUser,
    email: attackerEmail,
    passwordHash: 'scrypt$16384$8$1$c2FsdHNhbHQ$aGFzaGhhc2g',
    isEmailVerified: true
  });

  // Attacker requests forgot-password OTP for attacker email
  await request('POST', '/api/auth/forgot-password/request-otp', {}, { email: attackerEmail });
  const attackerEmailObj = getLatestCapturedEmail(attackerEmail, 'password_reset');
  const attackerVerifyRes = await request('POST', '/api/auth/forgot-password/verify-otp', {}, {
    email: attackerEmail,
    otp: attackerEmailObj?.otp
  });
  const attackerToken = attackerVerifyRes.body?.resetToken;

  // Attacker attempts to provide victim's email or username in reset payload
  await request('POST', '/api/auth/forgot-password/reset-password', {}, {
    resetToken: attackerToken,
    newPassword: 'AttackerInjectedPass99!',
    confirmPassword: 'AttackerInjectedPass99!',
    email: victimEmail,
    username: 'victim_user',
    userId: 'victim_id'
  });

  // Verify victim's password hash remained intact (IDOR prevented)
  const victimInDb = await User.findOne({ email: victimEmail });
  logTest('IDOR Protection: Attacker cannot change victim password using attacker reset token', victimInDb.passwordHash === 'scrypt$16384$8$1$c2FsdHNhbHQ$aGFzaGhhc2g');

  // Verify secret leak audit
  const secretKeyExposed = serverJs.includes(process.env.RESEND_API_KEY || 're_FAKEKEY') ||
    scriptJs.includes(process.env.RESEND_API_KEY || 're_FAKEKEY') ||
    indexHtml.includes(process.env.RESEND_API_KEY || 're_FAKEKEY');
  logTest('RESEND_API_KEY is NEVER exposed in script.js, index.html, or client files', !secretKeyExposed);

  // -------------------------------------------------------------------------
  // CLEANUP & SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n--- Cleanup & Final Report ---');
  try {
    // Clean up test documents created during run
    await User.deleteMany({ username: { $in: [testStudentUser, freshStudentUser, attackerUser] } });
    await User.deleteMany({ email: { $in: [testStudentEmail, freshStudentEmail, attackerEmail, victimEmail] } });
    await OtpVerification.deleteMany({ email: { $in: [testStudentEmail, freshStudentEmail, attackerEmail, victimEmail] } });
    if (fs.existsSync(TEST_STORE_PATH)) fs.unlinkSync(TEST_STORE_PATH);
  } catch (cleanErr) {
    console.warn('Cleanup warning:', cleanErr.message);
  }

  serverProc.kill();
  await mongoose.disconnect();

  console.log('\n====================================================================');
  console.log(`PROMPT 32 AUDIT RESULTS: ${passedTests}/${totalTests} TESTS PASSED (${failedTests} FAILED)`);
  console.log('====================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPrompt32Tests().catch(err => {
  console.error('[FATAL] Prompt 32 test run failed:', err);
  process.exit(1);
});
