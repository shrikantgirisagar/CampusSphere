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

  // 3. Clean up AcademicStore student demo records
  let store = await AcademicStore.findOne({ storeKey: 'default_academic_store' });
  if (store) {
    store.students = {};
    store.dailyAttendance = [];
    if (Array.isArray(store.assignments)) {
      // Clear demo assignment submissions or assignments assigned to demo students
      store.assignments = [];
    }
    if (Array.isArray(store.deletedAssignments)) {
      store.deletedAssignments = [];
    }
    store.markModified('students');
    store.markModified('dailyAttendance');
    store.markModified('assignments');
    store.markModified('deletedAssignments');
    await store.save();
    console.log('Cleaned up demo academic records in AcademicStore.');
  }

  console.log('--- ALL DEMO & TEST ACCOUNTS REMOVED SUCCESSFULLY! ---');
  await mongoose.disconnect();
  process.exit(0);
}

clearDemoAccounts().catch(err => {
  console.error('Error clearing demo accounts:', err);
  process.exit(1);
});
