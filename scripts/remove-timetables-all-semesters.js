/**
 * scripts/remove-timetables-all-semesters.js
 * 
 * Safely removes all timetable entries across all semesters and divisions
 * from both MongoDB storage layers:
 * 1. Dedicated 'timetables' collection (Timetable model)
 * 2. Unified 'academicstores' collection (AcademicStore model)
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function removeTimetablesAllSemesters() {
  if (!process.env.MONGODB_URI) {
    console.error("ERROR: MONGODB_URI environment variable is missing.");
    process.exit(1);
  }

  console.log("1. Connecting to MongoDB database...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✓ Connected to MongoDB.");

  const Timetable = require('../models/Timetable');
  const AcademicStore = require('../models/AcademicStore');

  // 1. Inspect Timetable collection before deletion
  const ttBeforeCount = await Timetable.countDocuments({});
  console.log(`\n2. Timetable collection before cleanup: ${ttBeforeCount} record(s).`);

  const distinctSemesters = await Timetable.distinct('semester');
  const distinctDivisions = await Timetable.distinct('division');
  console.log(`   Semesters represented: ${JSON.stringify(distinctSemesters)}`);
  console.log(`   Divisions represented: ${JSON.stringify(distinctDivisions)}`);

  // 2. Delete all records from Timetable collection
  const deleteResult = await Timetable.deleteMany({});
  console.log(`✓ Deleted ${deleteResult.deletedCount} record(s) from 'timetables' collection.`);

  // 3. Update AcademicStore using $set
  const updateRes = await AcademicStore.updateMany(
    {},
    {
      $set: {
        timetable: [],
        timetableHeader: {},
        customBreakRows: {}
      }
    }
  );
  console.log(`\n3. Updated AcademicStore documents: matched ${updateRes.matchedCount}, modified ${updateRes.modifiedCount}.`);

  // 4. Verification
  console.log("\n4. Verifying empty state in database...");
  const ttAfterCount = await Timetable.countDocuments({});
  const storesAfter = await AcademicStore.find({}).lean();
  
  let allClean = (ttAfterCount === 0);
  for (const store of storesAfter) {
    const count = (store.timetable || []).length;
    if (count !== 0) allClean = false;
    console.log(`   Store [${store.storeKey}] timetable count: ${count}`);
  }

  console.log(`   Timetable collection count: ${ttAfterCount}`);

  if (allClean) {
    console.log("\n✅ SUCCESS: All timetables across all semesters and divisions have been removed!");
  } else {
    console.error("\n❌ WARNING: Some timetable records could not be removed.");
  }

  await mongoose.disconnect();
  console.log("✓ MongoDB connection closed.");
}

removeTimetablesAllSemesters().catch(err => {
  console.error("Failed to remove timetables:", err);
  process.exit(1);
});
