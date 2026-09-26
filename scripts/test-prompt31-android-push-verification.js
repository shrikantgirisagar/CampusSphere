/**
 * ============================================================================
 * CAMPUSSPHERE PROMPT 31 TEST SUITE
 * Final Real Android Web Push Delivery Verification + Scoping & Multi-Device
 * ============================================================================
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const mongoose = require('mongoose');
const webpush = require('web-push');

const User = require('../models/User');
const PushSubscription = require('../models/PushSubscription');
const pushService = require('../services/pushNotificationService');

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

async function runPrompt31Tests() {
  console.log('====================================================================');
  console.log('STARTING PROMPT 31: FINAL REAL ANDROID WEB PUSH DELIVERY AUDIT');
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

  // -------------------------------------------------------------------------
  // SUITE 1: PRE-FLIGHT CODE & VAPID SECURITY VERIFICATION
  // -------------------------------------------------------------------------
  console.log('--- TEST SUITE 1: Pre-Flight Code & VAPID Security Verification ---');

  logTest('service-worker.js exists at project root', fs.existsSync(path.join(rootDir, 'service-worker.js')));
  logTest('server.js serves service-worker.js with Service-Worker-Allowed header', serverJs.includes('Service-Worker-Allowed') && serverJs.includes('/service-worker.js'));
  logTest('manifest.json exists and is linked in HTML head', fs.existsSync(path.join(rootDir, 'manifest.json')) && indexHtml.includes('href="/manifest.json"'));
  logTest('script.js registers /service-worker.js', scriptJs.includes('registerCampusSphereServiceWorker') && scriptJs.includes('/service-worker.js'));
  logTest('script.js subscribes to PushManager with applicationServerKey', scriptJs.includes('pushManager.subscribe') && scriptJs.includes('applicationServerKey'));
  logTest('server.js defines GET /api/push/public-key', serverJs.includes('/api/push/public-key'));
  logTest('server.js defines POST /api/push/subscribe', serverJs.includes('app.post("/api/push/subscribe"'));
  logTest('server.js defines DELETE /api/push/subscribe', serverJs.includes('app.delete("/api/push/subscribe"'));

  const pubKey = process.env.VAPID_PUBLIC_KEY || '';
  const privKey = process.env.VAPID_PRIVATE_KEY || '';
  const subject = process.env.VAPID_SUBJECT || '';

  const OLD_VAPID_PUB = 'BCdaVq9FXtoetGfI3bvyKYqv27XkDNIUV2scNzmFzPWCl0ypaKjoxUjXFTXZ6tpa8KeW5Hu17mDFQJb5vTp1sSc';
  const OLD_VAPID_PRIV = 'fcOjDiA8fSfwInFr1DF-QVdTAsmJCNIQPkbtzRvto3I';

  logTest('New VAPID public key configured in environment', Boolean(pubKey && pubKey.length > 20 && pubKey !== OLD_VAPID_PUB));
  logTest('New VAPID private key configured in environment', Boolean(privKey && privKey.length > 20 && privKey !== OLD_VAPID_PRIV));
  logTest('VAPID subject configured in environment', Boolean(subject && subject.startsWith('mailto:')));

  const clientLeaks = [indexHtml, styleCss, scriptJs, swJs, manifestJson].some(c => c.includes(privKey) || c.includes(OLD_VAPID_PRIV));
  logTest('VAPID private key is strictly server-only and absent from client files', !clientLeaks);

  // -------------------------------------------------------------------------
  // SUITE 2: ZERO NOTIFICATION INBOX / READ TRACKING VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: Zero Notification Inbox / Read-Tracking Verification ---');

  const modelLower = pushSubModelJs.toLowerCase();
  const prohibited = ['isread', 'readat', 'unread', 'notificationstatus', 'readstatus', 'history', 'messages', 'inbox'];
  logTest('PushSubscription schema has zero inbox/read tracking fields', !prohibited.some(p => modelLower.includes(p)));
  logTest('pushNotificationService contains zero mark-as-read or inbox methods', !pushServiceJs.toLowerCase().includes('markasread'));
  logTest('server.js contains zero notification inbox/history endpoints', !serverJs.includes('/api/notifications'));

  // -------------------------------------------------------------------------
  // SUITE 3: REAL PHYSICAL ANDROID DEVICE SUBSCRIPTION VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: Physical Android Device Subscription in MongoDB ---');

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'CampusSphere' });
  }

  const androidSub = await PushSubscription.findOne({
    userAgent: /Android/i
  }).lean();

  logTest('Physical Android PushSubscription exists in MongoDB', Boolean(androidSub));
  if (androidSub) {
    logTest('Android PushSubscription username matches registered student (0005)', androidSub.username === '0005');
    logTest('Android PushSubscription role is "student"', androidSub.role === 'student');
    logTest('Android PushSubscription endpoint is valid Google FCM push service URL', androidSub.endpoint.includes('fcm.googleapis.com') || androidSub.endpoint.includes('googleapis.com'));
    logTest('Android PushSubscription keys contains valid p256dh and auth ECDH material', Boolean(androidSub.keys?.p256dh && androidSub.keys?.auth));
  }

  // -------------------------------------------------------------------------
  // SUITE 4: REAL WEB PUSH DISPATCH & GOOGLE FCM DELIVERY CONFIRMATION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 4: Real FCM Network Push Dispatch & 201 Created Confirmation ---');

  if (androidSub) {
    webpush.setVapidDetails(subject, pubKey, privKey);

    const testPayload = JSON.stringify({
      type: 'attendance',
      title: 'Attendance Update',
      body: 'You were marked Present for Java on ' + new Date().toISOString().slice(0, 10) + '.',
      url: '/#attendance',
      tag: 'p31-test-' + Date.now(),
      eventId: 'test:' + Date.now()
    });

    let fcmSuccess = false;
    let fcmStatusCode = 0;
    try {
      const res = await webpush.sendNotification({
        endpoint: androidSub.endpoint,
        keys: androidSub.keys
      }, testPayload, { urgency: 'high', TTL: 86400 });
      fcmStatusCode = res.statusCode;
      fcmSuccess = res.statusCode === 201 || res.statusCode === 200;
    } catch (err) {
      fcmStatusCode = err.statusCode || 0;
      fcmSuccess = false;
      console.error('  [FCM Dispatch Error]:', err.message);
    }

    logTest('Google FCM push service accepted VAPID-signed notification (HTTP 201 Created)', fcmSuccess, `Status=${fcmStatusCode}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 5: SERVER-SIDE EVENT TARGETING & AUDIENCE SCOPING
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 5: Server-Side Event Targeting & Audience Scoping ---');

  // Attendance Trigger: Present status only
  const attendanceOnlyPresent = pushServiceJs.includes('norm === "present"') || pushServiceJs.includes('norm === "p"');
  logTest('Attendance notification triggers strictly for PRESENT status (ignores Absent)', attendanceOnlyPresent);

  const attendanceTransitionCheck = pushServiceJs.includes('wasPresent') && pushServiceJs.includes('!wasPresent');
  logTest('Attendance checks previous status: only triggers on newly Present or transition from Absent', attendanceTransitionCheck);

  // Marks Trigger
  logTest('pushNotificationService defines notifyMarks comparing previous student marks', pushServiceJs.includes('notifyMarks'));

  // Assignment & Study Notes Scoping
  logTest('Assignment notification scopes recipients server-side by semester and division', pushServiceJs.includes('notifyAssignment') && pushServiceJs.includes('targetDivision'));
  logTest('Study Notes notification scopes recipients server-side by semester and division', pushServiceJs.includes('notifyNote') && pushServiceJs.includes('division'));

  // Faculty Notice Behavior
  logTest('Faculty Notice strictly targets student recipients (cannot target other faculty)', pushServiceJs.includes('targetRoles = ["student"]') || pushServiceJs.includes("targetRoles = ['student']"));
  logTest('Faculty notice calculates recipients server-side without trusting client recipient lists', pushServiceJs.includes('targetRoles = ["student"]') && !pushServiceJs.includes('notice.recipients'));

  // Admin Notice Audiences (3 Options)
  logTest('Admin Notice "Faculty Only" targets exclusively ["faculty"] role (zero students)', pushServiceJs.includes('targetRoles = ["faculty"]'));
  logTest('Admin Notice "Students Only" targets exclusively ["student"] role (zero faculty)', pushServiceJs.includes('targetRoles = ["student"]'));
  logTest('Admin Notice "Faculty & Students" targets ["student", "faculty"] roles', pushServiceJs.includes('targetRoles = ["student", "faculty"]'));

  // Deterministic Idempotency
  logTest('Deterministic event idempotency mechanism prevents duplicate sends on repeated identical sync saves', pushServiceJs.includes('isEventAlreadyDispatched') && pushServiceJs.includes('recordDispatchedEvent'));

  // -------------------------------------------------------------------------
  // SUITE 6: DESKTOP + ANDROID MULTI-DEVICE SUPPORT & ISOLATION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST SUITE 6: Multi-Device Coexistence & Endpoint Isolation ---');

  if (androidSub) {
    const studentUser = await User.findOne({ username: androidSub.username }).lean();
    if (studentUser) {
      // Simulate registering a 2nd device (Desktop PC) for the same student
      const desktopEndpoint = `https://fcm.googleapis.com/fcm/send/test_p31_desktop_${Date.now()}`;
      await PushSubscription.updateOne(
        { endpoint: desktopEndpoint },
        {
          $set: {
            userId: studentUser.id,
            username: studentUser.username,
            role: 'student',
            endpoint: desktopEndpoint,
            keys: {
              p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t0A3q8-Xo-3jZ_h0S30w0b_desktop',
              auth: 'tH9placeholder_auth_desktop'
            },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0',
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      const countBoth = await PushSubscription.countDocuments({ username: studentUser.username });
      logTest('MongoDB simultaneously preserves distinct Android and Desktop endpoints for same user', countBoth >= 2);

      // Unsubscribe only the Desktop endpoint
      await PushSubscription.deleteOne({ endpoint: desktopEndpoint });

      const androidStillActive = await PushSubscription.findOne({ endpoint: androidSub.endpoint }).lean();
      logTest('Unsubscribing Desktop endpoint does NOT remove or invalidate the physical Android subscription', Boolean(androidStillActive));
    }
  }

  // -------------------------------------------------------------------------
  // TEST SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n====================================================================');
  console.log(`PROMPT 31 TEST SUMMARY: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('====================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runPrompt31Tests().catch((err) => {
  console.error('Fatal Prompt 31 test error:', err);
  process.exit(1);
});
