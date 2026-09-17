const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const AcademicStore = require('../models/AcademicStore');

async function clearDemoAccounts() {
  console.log('--- Clearing All Demo & Test Accounts ---');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'CampusSphere', serverSelectionTimeoutMS: 8000 });
  console.log('Connected to MongoDB: CampusSphere');

  // 1. Find all demo / non-admin users
  const nonAdminUsers = await User.find({ role: { $ne: 'admin' } });
  console.log(`Found ${nonAdminUsers.length} demo/test user accounts to remove.`);

  nonAdminUsers.forEach(u => {
    console.log(` - Deleting [${u.role}] ${u.name} (username: ${u.username}, email: ${u.email})`);
  });

  // Delete all non-admin users
  const deleteResult = await User.deleteMany({ role: { $ne: 'admin' } });
  console.log(`Deleted ${deleteResult.deletedCount} demo/test accounts from MongoDB 'users' collection.`);

  // 2. Also clean up any test admin accounts if any (keep only official admin)
  const remainingUsers = await User.find({});
  console.log(`Remaining accounts in MongoDB: ${remainingUsers.length}`);
  remainingUsers.forEach(u => {
    console.log(` - Preserved: [${u.role}] ${u.name} (username: ${u.username}, email: ${u.email})`);
  });

  // 3. Clean up AcademicStore student demo records only for deleted users
  let store = await AcademicStore.findOne({ storeKey: 'default_academic_store' });
  if (store) {
    const deletedUsernames = new Set(nonAdminUsers.map(u => String(u.username || '').toLowerCase()));

    if (store.students && typeof store.students === 'object') {
      Object.keys(store.students).forEach(uname => {
        if (deletedUsernames.has(uname.toLowerCase())) {
          delete store.students[uname];
        }
      });
      store.markModified('students');
    }

    if (Array.isArray(store.dailyAttendance)) {
      store.dailyAttendance = store.dailyAttendance.map(entry => {
        if (entry && entry.records && typeof entry.records === 'object') {
          Object.keys(entry.records).forEach(u => {
            if (deletedUsernames.has(u.toLowerCase())) {
              delete entry.records[u];
            }
          });
        }
        return entry;
      });
      store.markModified('dailyAttendance');
    }

    if (Array.isArray(store.assignments)) {
      store.assignments = store.assignments.filter(a => !deletedUsernames.has(String(a.student || '').toLowerCase()));
      store.markModified('assignments');
    }

    if (Array.isArray(store.deletedAssignments)) {
      store.deletedAssignments = store.deletedAssignments.filter(key => {
        const parts = String(key || '').split('___');
        return !deletedUsernames.has(parts[0].toLowerCase());
      });
      store.markModified('deletedAssignments');
    }

    await store.save();
    console.log('Cleaned up demo academic records for removed accounts in AcademicStore.');
  }

  console.log('--- ALL DEMO & TEST ACCOUNTS REMOVED SUCCESSFULLY! ---');
  await mongoose.disconnect();
  process.exit(0);
}

clearDemoAccounts().catch(err => {
  console.error('Error clearing demo accounts:', err);
  process.exit(1);
});
