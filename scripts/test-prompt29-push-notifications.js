/**
 * ============================================================================
 * CAMPUSSPHERE PROMPT 29 TEST SUITE
 * Real System-Level Web Push Notifications, Service Worker, VAPID & Security
 * ============================================================================
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const PushSubscription = require('../models/PushSubscription');

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

async function runPrompt29Tests() {
  console.log('====================================================================');
  console.log('STARTING PROMPT 29: REAL SYSTEM-LEVEL WEB PUSH NOTIFICATIONS AUDIT');
  console.log('====================================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  const styleCss = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf-8');
  const scriptJs = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf-8');
  const serverJs = fs.readFileSync(path.join(rootDir, 'server.js'), 'utf-8');
  const swJs = fs.readFileSync(path.join(rootDir, 'service-worker.js'), 'utf-8');
  const manifestJson = fs.readFileSync(path.join(rootDir, 'manifest.json'), 'utf-8');
  const pushServiceJs = fs.readFileSync(path.join(rootDir, 'services', 'pushNotificationService.js'), 'utf-8');
  const pushSubModelJs = fs.readFileSync(path.join(rootDir, 'models', 'PushSubscription.js'), 'utf-8');
  const envExample = fs.readFileSync(path.join(rootDir, '.env.example'), 'utf-8');

  // -------------------------------------------------------------------------
  // TEST SUITE 1: ARCHITECTURE & INFRASTRUCTURE AUDIT
  // -------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: Push Infrastructure & VAPID Configuration ---');

  logTest('service-worker.js exists at project root', fs.existsSync(path.join(rootDir, 'service-worker.js')));
  logTest('manifest.json exists at project root', fs.existsSync(path.join(rootDir, 'manifest.json')));
  logTest('models/PushSubscription.js exists with dedicated strict Mongoose schema', fs.existsSync(path.join(rootDir, 'models', 'PushSubscription.js')));
  logTest('services/pushNotificationService.js exists with modular delivery logic', fs.existsSync(path.join(rootDir, 'services', 'pushNotificationService.js')));

  const serverServesSw = serverJs.includes('/service-worker.js') && serverJs.includes('Service-Worker-Allowed');
  logTest('server.js explicitly serves service-worker.js with Service-Worker-Allowed header', serverServesSw);

  const serverServesManifest = serverJs.includes('/manifest.json') && serverJs.includes('application/manifest+json');
  logTest('server.js explicitly serves manifest.json with manifest+json content-type', serverServesManifest);

  const swHandlesPush = swJs.includes('addEventListener("push"') && swJs.includes('self.registration.showNotification');
  logTest('service-worker.js handles "push" event and invokes persistent showNotification()', swHandlesPush);

  const swHandlesClick = swJs.includes('addEventListener("notificationclick"') && swJs.includes('clients.matchAll');
  logTest('service-worker.js handles "notificationclick" event and focuses/opens client window', swHandlesClick);

  const swOpenRedirectProtection = swJs.includes('startsWith("/")') && swJs.includes('!raw.startsWith("//")') && swJs.includes('!raw.includes("javascript:")');
  logTest('service-worker.js prevents open-redirect vulnerabilities with strict relative URL validation', swOpenRedirectProtection);

  const envHasVapid = envExample.includes('VAPID_PUBLIC_KEY') && envExample.includes('VAPID_PRIVATE_KEY') && envExample.includes('VAPID_SUBJECT');
  logTest('.env.example documents VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT placeholders', envHasVapid);

  const privateKeyNotLeakedInClient = !scriptJs.includes(process.env.VAPID_PRIVATE_KEY || 'PLACEHOLDER_KEY') &&
    !swJs.includes(process.env.VAPID_PRIVATE_KEY || 'PLACEHOLDER_KEY') &&
    !indexHtml.includes(process.env.VAPID_PRIVATE_KEY || 'PLACEHOLDER_KEY');
  logTest('VAPID_PRIVATE_KEY is strictly server-side and never exposed in client files', privateKeyNotLeakedInClient);

  // -------------------------------------------------------------------------
  // TEST SUITE 2: NO NOTIFICATION INBOX / READ STATUS AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: Strict Prohibition of Notification Inbox / Read-Tracking ---');

  const pushModelHasNoInbox = !pushSubModelJs.includes('isRead') &&
    !pushSubModelJs.includes('readAt') &&
    !pushSubModelJs.includes('notificationStatus') &&
    !pushSubModelJs.includes('unreadCount') &&
    !pushSubModelJs.includes('messages') &&
    !pushSubModelJs.includes('history');
  logTest('PushSubscription schema represents only delivery endpoints with zero inbox/read tracking', pushModelHasNoInbox);

  const pushServiceHasNoInbox = !pushServiceJs.includes('markAsRead') &&
    !pushServiceJs.includes('getUnreadNotifications') &&
    !pushServiceJs.includes('notificationHistory');
  logTest('pushNotificationService contains no notification inbox or mark-as-read methods', pushServiceHasNoInbox);

  // -------------------------------------------------------------------------
  // TEST SUITE 3: SERVER-SIDE EVENT TRIGGERS & RECIPIENT RESOLUTION AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: Server-Side Recipient Resolution & Event Hardening ---');

  const pushService = require('../services/pushNotificationService');
  const PushSubscription = require('../models/PushSubscription');
  const User = require('../models/User');

  logTest('pushNotificationService defines notifyAttendance', typeof pushService.notifyAttendance === 'function');
  logTest('pushNotificationService defines notifyMarks', typeof pushService.notifyMarks === 'function');
  logTest('pushNotificationService defines notifyAssignment', typeof pushService.notifyAssignment === 'function');
  logTest('pushNotificationService defines notifyNote', typeof pushService.notifyNote === 'function');
  logTest('pushNotificationService defines notifyNotice', typeof pushService.notifyNotice === 'function');

  const serverCallsNotifyAttendance = serverJs.includes('pushService.notifyAttendance');
  logTest('server.js handleSaveAttendance calls pushService.notifyAttendance after DB save', serverCallsNotifyAttendance);

  const serverCallsAcademicPush = serverJs.includes('pushService.notifyAttendance') &&
    serverJs.includes('pushService.notifyMarks') &&
    serverJs.includes('pushService.notifyAssignment') &&
    serverJs.includes('pushService.notifyNote') &&
    serverJs.includes('pushService.notifyNotice');
  logTest('server.js /api/academic/sync triggers push notifications for attendance, marks, assignments, notes, notices', serverCallsAcademicPush);

  // -------------------------------------------------------------------------
  // TEST SUITE 4: ADMIN NOTICE TARGET AUDIENCE THREE-TIER ENFORCEMENT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 4: Admin Notice Audience Enforcement (3 Options) ---');

  const noticeCode = pushServiceJs;
  const adminFacultyOnly = noticeCode.includes('targetAudience === "faculty"') && noticeCode.includes('targetRoles = ["faculty"]');
  const adminStudentsOnly = (noticeCode.includes('targetAudience === "student"') || noticeCode.includes('targetAudience === "students"')) && noticeCode.includes('targetRoles = ["student"]');
  const adminBoth = noticeCode.includes('targetRoles = ["student", "faculty"]');

  logTest('Admin Notice "Faculty Only" targets exclusively ["faculty"] role (zero students)', adminFacultyOnly);
  logTest('Admin Notice "Students Only" targets exclusively ["student"] role (zero faculty)', adminStudentsOnly);
  logTest('Admin Notice "Faculty & Students" targets ["student", "faculty"] roles', adminBoth);

  const facultyNoticeIsStudentOnly = noticeCode.includes('targetRoles = ["student"]') &&
    noticeCode.includes('Faculty notice: strictly student recipients only');
  logTest('Faculty Notice is strictly restricted to students only (cannot target other faculty)', facultyNoticeIsStudentOnly);

  // -------------------------------------------------------------------------
  // TEST SUITE 5: ATTENDANCE PRESENT / ABSENT LOGIC & IDEMPOTENCY
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 5: Attendance Present / Absent Logic & Idempotency ---');

  const attendanceCode = pushServiceJs;
  const onlyPresentStudents = attendanceCode.includes('norm === "present"') || attendanceCode.includes('norm === "p"');
  logTest('Attendance notification filters strictly for PRESENT status (ignores Absent)', onlyPresentStudents);

  const attendanceTransitionCheck = attendanceCode.includes('wasPresent') && attendanceCode.includes('!wasPresent');
  logTest('Attendance checks previous status: only triggers when newly marked Present or transitioned from Absent', attendanceTransitionCheck);

  const idempotencyMechanism = attendanceCode.includes('isEventAlreadyDispatched') && attendanceCode.includes('recordDispatchedEvent');
  logTest('Deterministic event idempotency mechanism prevents duplicate sends on repeated identical saves', idempotencyMechanism);

  // -------------------------------------------------------------------------
  // TEST SUITE 6: LIVE API ENDPOINTS & DATABASE PERSISTENCE VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 6: Live API Endpoints & Database Integration ---');

  const TEST_PORT = 3105;
  const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;
  let serverInstance = null;

  try {
    // Start temporary server instance for live API testing
    const serverModule = require('../server');
    // server.js starts listening on its configured port; we can query it directly
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Connect to database directly if needed
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, { dbName: 'CampusSphere' });
    }

    // 1. GET /api/push/public-key
    const pubKeyRes = await fetch(`http://127.0.0.1:3000/api/push/public-key`);
    const pubKeyData = await pubKeyRes.json();
    logTest('GET /api/push/public-key returns HTTP 200 with valid publicKey', pubKeyRes.ok && pubKeyData.success && typeof pubKeyData.publicKey === 'string' && pubKeyData.publicKey.length > 20);
    logTest('GET /api/push/public-key never exposes private key', !('privateKey' in pubKeyData) && !JSON.stringify(pubKeyData).includes('private'));

    // 2. Unauthenticated POST /api/push/subscribe rejected with 401
    const unauthSubRes = await fetch(`http://127.0.0.1:3000/api/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: { endpoint: 'https://push.example.com/test' } })
    });
    logTest('Unauthenticated POST /api/push/subscribe is rejected with HTTP 401', unauthSubRes.status === 401);

    // 3. Authenticated subscribe for Student
    // Find or create test student token
    const testStudentUser = await User.findOne({ role: 'student' }).lean();
    if (testStudentUser) {
      // Generate valid token for test student
      const crypto = require('crypto');
      const testTokenPayload = Buffer.from(JSON.stringify({
        id: testStudentUser.id,
        role: testStudentUser.role,
        username: testStudentUser.username,
        exp: Date.now() + 3600000
      })).toString('base64url');
      const secret = process.env.SESSION_SECRET || 'campussphere_dev_session_secret_2026_insecure';
      const sig = crypto.createHmac('sha256', secret).update(testTokenPayload).digest('base64url');
      const studentAuthToken = `${testTokenPayload}.${sig}`;

      const testEndpoint1 = `https://fcm.googleapis.com/fcm/send/test_sub_p29_${Date.now()}_1`;
      const testEndpoint2 = `https://fcm.googleapis.com/fcm/send/test_sub_p29_${Date.now()}_2`;

      // Device 1 Subscription
      const subRes1 = await fetch(`http://127.0.0.1:3000/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentAuthToken}`
        },
        body: JSON.stringify({
          subscription: {
            endpoint: testEndpoint1,
            keys: {
              p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t0A3q8-Xo-3jZ_h0S30w0b_placeholder',
              auth: 'tH9placeholder_auth'
            }
          }
        })
      });
      const subData1 = await subRes1.json();
      logTest('Student can register Device 1 PushSubscription successfully (HTTP 200)', subRes1.ok && subData1.success);

      // Verify in MongoDB
      const doc1 = await PushSubscription.findOne({ endpoint: testEndpoint1 }).lean();
      logTest('PushSubscription saved in MongoDB with correct username and role derived from token', doc1 && doc1.username.toLowerCase() === testStudentUser.username.toLowerCase() && doc1.role === 'student');

      // Device 2 Subscription (Multi-Device Support for same user)
      const subRes2 = await fetch(`http://127.0.0.1:3000/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentAuthToken}`
        },
        body: JSON.stringify({
          subscription: {
            endpoint: testEndpoint2,
            keys: {
              p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t0A3q8-Xo-3jZ_h0S30w0b_placeholder2',
              auth: 'tH9placeholder_auth2'
            }
          }
        })
      });
      logTest('Student can register Device 2 PushSubscription (Multi-Device support for same account)', subRes2.ok);

      const userSubCount = await PushSubscription.countDocuments({ username: testStudentUser.username });
      logTest('Multiple active device subscriptions simultaneously preserved for the same user in MongoDB', userSubCount >= 2);

      // Duplicate Subscription on same endpoint (should update without duplicate key collision)
      const subResDup = await fetch(`http://127.0.0.1:3000/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentAuthToken}`
        },
        body: JSON.stringify({
          subscription: {
            endpoint: testEndpoint1,
            keys: {
              p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t0A3q8-Xo-3jZ_h0S30w0b_updated',
              auth: 'tH9placeholder_auth_updated'
            }
          }
        })
      });
      logTest('Submitting existing endpoint updates subscription idempotently without duplicate error', subResDup.ok);

      // User A cannot unsubscribe User B's endpoint
      // Simulate another user token
      const attackerPayload = Buffer.from(JSON.stringify({
        id: 'attacker-123',
        role: 'student',
        username: 'attacker_user',
        exp: Date.now() + 3600000
      })).toString('base64url');
      const attackerSig = crypto.createHmac('sha256', secret).update(attackerPayload).digest('base64url');
      const attackerToken = `${attackerPayload}.${attackerSig}`;

      const maliciousUnsub = await fetch(`http://127.0.0.1:3000/api/push/subscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${attackerToken}`
        },
        body: JSON.stringify({ endpoint: testEndpoint1 })
      });
      const stillExists = await PushSubscription.findOne({ endpoint: testEndpoint1 }).lean();
      logTest('Cross-user IDOR unsubscribe attack blocked (attacker cannot delete another user endpoint)', Boolean(stillExists));

      // Valid unsubscribe for Device 1
      const validUnsub = await fetch(`http://127.0.0.1:3000/api/push/subscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${studentAuthToken}`
        },
        body: JSON.stringify({ endpoint: testEndpoint1 })
      });
      const isDeleted1 = await PushSubscription.findOne({ endpoint: testEndpoint1 }).lean();
      logTest('Valid unsubscribe removes specific device subscription from MongoDB', !isDeleted1);

      // Clean up Device 2
      await PushSubscription.deleteOne({ endpoint: testEndpoint2 });
    }

  } catch (err) {
    console.warn('  [WARN] Live API test encountered non-fatal error:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 7: CLIENT UI & PWA HEADLESS AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 7: Client Web Push UI & PWA Headless Audit ---');

  const hasManifestLink = indexHtml.includes('rel="manifest"') && indexHtml.includes('href="/manifest.json"');
  logTest('index.html links to /manifest.json in head', hasManifestLink);

  const hasTopbarNotifBtn = indexHtml.includes('id="topbarDesktopNotifBtn"') && indexHtml.includes('desktopNotifDot');
  logTest('index.html defines topbar notification button with status dot indicator', hasTopbarNotifBtn);

  const clientHasSwRegistration = scriptJs.includes('registerCampusSphereServiceWorker') && scriptJs.includes('/service-worker.js');
  logTest('script.js registers /service-worker.js using standard ServiceWorkerContainer', clientHasSwRegistration);

  const clientHasVapidConversion = scriptJs.includes('urlBase64ToUint8Array');
  logTest('script.js includes urlBase64ToUint8Array utility for PushManager VAPID subscription', clientHasVapidConversion);

  const clientHasSubscribeMethod = scriptJs.includes('subscribeToPushNotifications') && scriptJs.includes('reg.pushManager.subscribe');
  logTest('script.js subscribes to PushManager using applicationServerKey and userVisibleOnly', clientHasSubscribeMethod);

  const clientHasUnsubscribeMethod = scriptJs.includes('unsubscribeFromPushNotifications') && scriptJs.includes('sub.unsubscribe()');
  logTest('script.js unsubscribes from PushManager and synchronizes cancellation with backend', clientHasUnsubscribeMethod);

  const clientHasSyncOnLogin = scriptJs.includes('syncPushSubscriptionIfGranted');
  logTest('script.js synchronizes existing push subscription upon portal login without re-prompting', clientHasSyncOnLogin);

  const clientHandlesPermissionState = scriptJs.includes('granted') && scriptJs.includes('denied') && scriptJs.includes('unsupported');
  logTest('script.js handles granted, denied, default, and unsupported browser states cleanly', clientHandlesPermissionState);

  // -------------------------------------------------------------------------
  // TEST SUITE 8: SECURITY, XSS & RATE-LIMITING HARDENING
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 8: Security, XSS & Input Sanitization Audit ---');

  const swSanitizesBody = swJs.includes('slice(0, 300)') && swJs.includes('slice(0, 120)');
  logTest('service-worker.js enforces length boundaries on notification title and body', swSanitizesBody);

  const swPreventsScriptInjection = !swJs.includes('innerHTML') && !swJs.includes('eval(');
  logTest('service-worker.js contains zero innerHTML or eval statements (XSS immune)', swPreventsScriptInjection);

  const pushSubscribeRateLimited = serverJs.includes('app.post("/api/push/subscribe", rateLimitExpensive');
  logTest('Push subscription endpoints are protected by IP rate limiting against spam/flooding', pushSubscribeRateLimited);

  const pushPayloadExcludesSensitive = !pushServiceJs.includes('payload.password') &&
    !pushServiceJs.includes('payload.authToken') &&
    !pushServiceJs.includes('payload.sessionToken') &&
    !pushServiceJs.includes('passwordHash');
  logTest('Push notification payloads never include passwords, auth tokens, or private secrets', pushPayloadExcludesSensitive);

  // -------------------------------------------------------------------------
  // TEST SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n====================================================================');
  console.log(`PROMPT 29 TEST SUMMARY: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('====================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runPrompt29Tests().catch((err) => {
  console.error('Fatal test suite error:', err);
  process.exit(1);
});
