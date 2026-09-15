const mongoose = require('mongoose');
require('dotenv').config();
const AcademicStore = require('../models/AcademicStore');
const User = require('../models/User');

async function testAcademicPersistence() {
  console.log('--- Testing MongoDB Academic & Faculty Direct Storage ---');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'CampusSphere', serverSelectionTimeoutMS: 8000 });
  console.log('1. Connected to MongoDB database: CampusSphere');

  // 1. Fetch or initialize AcademicStore
  let store = await AcademicStore.findOne({ storeKey: 'default_academic_store' });
  if (!store) {
    store = new AcademicStore({ storeKey: 'default_academic_store' });
  }

  // 2. Set complete student academic record
  const studentUsername = 'test_academic_student_' + Date.now();
  const testStudentData = {
    attendance: { 'sub-bca101': 95, 'sub-bca102': 88 },
    marks: {
      'sub-bca101': { internal1: 19, internal2: 18, final: 65, total: 84, grade: 'A+' },
      'sub-bca102': { internal1: 17, internal2: 19, final: 60, total: 79, grade: 'A' }
    },
    assignments: [
      { id: 'asgn-1', title: 'Data Structures Lab 1', status: 'Submitted', score: 10, submittedAt: new Date().toISOString() }
    ]
  };

  if (!store.students) store.students = {};
  store.students[studentUsername] = testStudentData;
  store.markModified('students');

  // 3. Add daily attendance log
  const attendanceLog = {
    id: 'att-log-' + Date.now(),
    date: '2026-08-30',
    time: '10:00 AM',
    subject: 'sub-bca101',
    faculty: 'faculty1',
    division: 'Div A',
    semester: '1st Semester',
    records: { [studentUsername]: 'P' },
    totalPresent: 1,
    totalAbsent: 0
  };
  if (!Array.isArray(store.dailyAttendance)) store.dailyAttendance = [];
  store.dailyAttendance.push(attendanceLog);
  store.markModified('dailyAttendance');

  // 4. Add faculty study note
  const note = {
    id: 'note-' + Date.now(),
    title: 'Unit 1: Introduction to Algorithms',
    subject: 'sub-bca101',
    faculty: 'faculty1',
    uploadedAt: new Date().toISOString(),
    content: 'Notes content and reference links for 1st Semester students.'
  };
  if (!Array.isArray(store.notes)) store.notes = [];
  store.notes.push(note);
  store.markModified('notes');

  // 5. Add academic notice
  const notice = {
    id: 'notice-' + Date.now(),
    title: 'Midterm Examination Schedule 2026',
    content: 'Internal Assessment tests begin next Monday.',
    date: '2026-08-30',
    postedBy: 'faculty1',
    postedByName: 'Dr. Faculty Member',
    targetDivision: 'Div A',
    targetSemester: '1st Semester',
    isImportant: true
  };
  if (!Array.isArray(store.notices)) store.notices = [];
  store.notices.push(notice);
  store.markModified('notices');

  // 6. Test Admin Section/Division modifications persistence
  const originalDivisions = store.divisions ? JSON.parse(JSON.stringify(store.divisions)) : null;
  store.divisions = {
    "1st Year": ["Div A", "Div B", "Div C"],
    "2nd Year": ["Div A", "Div B"],
    "3rd Year": ["Div A", "Div B", "Div Honors"]
  };
  store.markModified('divisions');

  // Save to MongoDB
  await store.save();
  console.log('2. Academic store updated and saved permanently to MongoDB!');

  // 7. Query store from MongoDB to verify persistence
  const verifyStore = await AcademicStore.findOne({ storeKey: 'default_academic_store' });
  console.log('3. Fetched updated AcademicStore from MongoDB:');
  console.log('   - Student records count:', Object.keys(verifyStore.students || {}).length);
  console.log('   - Student marks for sub-bca101:', verifyStore.students[studentUsername]?.marks?.['sub-bca101']);
  console.log('   - Student attendance for sub-bca101:', verifyStore.students[studentUsername]?.attendance?.['sub-bca101'] + '%');
  console.log('   - Daily attendance logs count:', verifyStore.dailyAttendance?.length);
  console.log('   - Study notes count:', verifyStore.notes?.length);
  console.log('   - Notices count:', verifyStore.notices?.length);
  console.log('   - Admin Section Divisions (1st Year):', verifyStore.divisions?.['1st Year']);
  console.log('   - Admin Section Divisions (3rd Year):', verifyStore.divisions?.['3rd Year']);

  if (!verifyStore.divisions?.['1st Year']?.includes('Div C')) {
    throw new Error('Div C was not persisted to MongoDB divisions!');
  }
  if (!verifyStore.divisions?.['3rd Year']?.includes('Div Honors')) {
    throw new Error('Div Honors was not persisted to MongoDB divisions!');
  }

  // 8. Cleanup test artifacts from store
  delete verifyStore.students[studentUsername];
  verifyStore.dailyAttendance = verifyStore.dailyAttendance.filter(l => l.id !== attendanceLog.id);
  verifyStore.notes = verifyStore.notes.filter(n => n.id !== note.id);
  verifyStore.notices = verifyStore.notices.filter(n => n.id !== notice.id);
  if (originalDivisions) {
    verifyStore.divisions = originalDivisions;
  } else {
    verifyStore.divisions = {
      "1st Year": ["Div A", "Div B"],
      "2nd Year": ["Div A", "Div B"],
      "3rd Year": ["Div A", "Div B"]
    };
  }
  verifyStore.markModified('divisions');
  verifyStore.markModified('students');
  verifyStore.markModified('dailyAttendance');
  verifyStore.markModified('notes');
  verifyStore.markModified('notices');
  await verifyStore.save();
  console.log('4. Cleaned up test academic artifacts successfully.');

  console.log('--- ALL ACADEMIC DIRECT MONGODB PERSISTENCE TESTS PASSED! ---');
  await mongoose.disconnect();
  process.exit(0);
}

testAcademicPersistence().catch(err => {
  console.error('Academic test failed:', err);
  process.exit(1);
});
