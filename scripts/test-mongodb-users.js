const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const crypto = require('crypto');
const { promisify } = require('util');
const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = await scryptAsync(String(password), salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString('base64url')}$${Buffer.from(derived).toString('base64url')}`;
}

async function verifyPassword(password, stored) {
  try {
    const parts = String(stored || '').split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
    const [, n, r, p, saltText, hashText] = parts;
    const salt = Buffer.from(saltText, 'base64url');
    const expected = Buffer.from(hashText, 'base64url');
    const actual = await scryptAsync(String(password), salt, expected.length, { N: Number(n), r: Number(r), p: Number(p) });
    return crypto.timingSafeEqual(Buffer.from(actual), expected);
  } catch { return false; }
}

async function runTests() {
  console.log('--- Testing MongoDB Direct User Storage ---');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'CampusSphere', serverSelectionTimeoutMS: 8000 });
  console.log('1. Connected to MongoDB database: CampusSphere');

  // 1. Seed Admin if needed
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = await User.create({
      id: 'admin-001',
      role: 'admin',
      name: 'Administrator',
      username: 'admin',
      email: 'admin@smartportal.edu',
      passwordHash: await hashPassword('admin@123')
    });
    console.log('2. Seeded default admin in MongoDB.');
  } else {
    console.log('2. Admin account found in MongoDB:', admin.username);
  }

  // 2. Create Student with all details
  const testStudentUsername = 'test_student_' + Date.now();
  const testStudentData = {
    id: 'student-' + Date.now(),
    role: 'student',
    name: 'Test Student Full Name',
    username: testStudentUsername,
    email: testStudentUsername + '@student.edu',
    passwordHash: await hashPassword('studentPass123'),
    division: 'Div A',
    semester: '1st Semester',
    courseYear: '1st Year',
    course: 'Bachelor of Computer Applications (BCA)',
    languageChoice: 'Kannada',
    mathChoice: 'Mathematics',
    profilePic: 'data:image/svg+xml;utf8,<svg></svg>'
  };

  const createdStudent = await User.create(testStudentData);
  console.log('3. Student permanently created in MongoDB:', createdStudent.username, '| ID:', createdStudent.id);

  // 3. Query student from MongoDB
  const fetchedStudent = await User.findOne({ username: testStudentUsername });
  console.log('4. Fetched student details from MongoDB:');
  console.log('   - Name:', fetchedStudent.name);
  console.log('   - Course:', fetchedStudent.course);
  console.log('   - Course Year:', fetchedStudent.courseYear);
  console.log('   - Semester:', fetchedStudent.semester);
  console.log('   - Division:', fetchedStudent.division);
  console.log('   - Language Choice:', fetchedStudent.languageChoice);
  console.log('   - Math Choice:', fetchedStudent.mathChoice);
  console.log('   - Profile Pic:', fetchedStudent.profilePic ? 'Saved (' + fetchedStudent.profilePic.substring(0, 20) + '...)' : 'None');

  // 4. Update student details
  fetchedStudent.semester = '2nd Semester';
  fetchedStudent.languageChoice = 'Hindi';
  fetchedStudent.name = 'Test Student Updated Name';
  await fetchedStudent.save();

  const verifyUpdate = await User.findOne({ username: testStudentUsername });
  console.log('5. Verified update in MongoDB:', verifyUpdate.name, '| Semester:', verifyUpdate.semester, '| Language:', verifyUpdate.languageChoice);

  // 5. Test password verification
  const isPassValid = await verifyPassword('studentPass123', verifyUpdate.passwordHash);
  console.log('6. Student password authentication valid:', isPassValid);

  // 6. Delete test student
  await User.deleteOne({ username: testStudentUsername });
  const checkDeleted = await User.findOne({ username: testStudentUsername });
  console.log('7. Student cleaned up successfully from MongoDB:', checkDeleted === null);

  // 7. Test Multi-Subject Faculty across different course years & semesters
  const testFacultyUsername = 'test_fac_' + Date.now();
  const testFacultyData = {
    id: 'faculty-' + Date.now(),
    role: 'faculty',
    name: 'Prof. Multi Subject',
    username: testFacultyUsername,
    email: testFacultyUsername + '@faculty.edu',
    passwordHash: await hashPassword('facultyPass123'),
    subject: 'cprog', // 1st Year / 1st Sem
    subjects: ['cprog', 'python', 'ai'], // 1st Year (cprog), 2nd Year (python), 3rd Year (ai)
    subjectDivisions: {
      cprog: 'Div A',
      python: 'Both Divisions',
      ai: 'Div B'
    },
    department: 'Department of Computer Science & Applications',
    division: 'Both Divisions'
  };

  const createdFaculty = await User.create(testFacultyData);
  console.log('8. Multi-subject faculty created:', createdFaculty.username, '| Subjects:', createdFaculty.subjects);

  const fetchedFaculty = await User.findOne({ username: testFacultyUsername });
  if (!fetchedFaculty || fetchedFaculty.subjects.length !== 3) {
    throw new Error('Faculty subjects array failed to persist in MongoDB!');
  }
  const publicFac = fetchedFaculty.toPublicJSON();
  if (!publicFac.subjectDivisions || publicFac.subjectDivisions.cprog !== 'Div A' || publicFac.subjectDivisions.python !== 'Both Divisions' || publicFac.subjectDivisions.ai !== 'Div B') {
    throw new Error('Faculty subjectDivisions failed to persist in MongoDB!');
  }
  console.log('9. Verified multi-subject faculty with per-subject divisions in MongoDB. Subjects:', fetchedFaculty.subjects.length, '| Divisions:', publicFac.subjectDivisions);

  // Clean up faculty
  await User.deleteOne({ username: testFacultyUsername });
  // 11. Test Dynamic Real Student Count Querying
  const initialStudentCount = await User.countDocuments({ role: 'student' });
  console.log(`11. Verified baseline student count query: ${initialStudentCount}`);

  const tempStudentUsername = 'temp_count_student_' + Date.now();
  await User.create({
    id: 'student-count-' + Date.now(),
    role: 'student',
    name: 'Temporary Count Student',
    username: tempStudentUsername,
    email: tempStudentUsername + '@student.edu',
    passwordHash: 'dummyhash'
  });
  const incrementedCount = await User.countDocuments({ role: 'student' });
  if (incrementedCount !== initialStudentCount + 1) {
    throw new Error(`Student count did not increment! Expected ${initialStudentCount + 1}, got ${incrementedCount}`);
  }
  console.log(`12. Verified student count naturally incremented to: ${incrementedCount}`);

  await User.deleteOne({ username: tempStudentUsername });
  const decrementedCount = await User.countDocuments({ role: 'student' });
  if (decrementedCount !== initialStudentCount) {
    throw new Error(`Student count did not decrement! Expected ${initialStudentCount}, got ${decrementedCount}`);
  }
  console.log(`13. Verified student count naturally decremented back to: ${decrementedCount}`);

  console.log('--- ALL MONGODB USER STORAGE TESTS PASSED SUCCESSFULLY! ---');
  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
