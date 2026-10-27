// scripts/migrate-usernamelower.js
// Migration script to populate 'usernameLower' and detect case-insensitive username collisions.
// Idempotent and dry-run by default. Run with --apply to commit changes.

require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

async function runMigration() {
  const isApply = process.argv.includes("--apply");
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/CampusSphere";

  console.log("==================================================");
  console.log(`CAMPUSSPHERE — USERNAME LOWERCASE MIGRATION`);
  console.log(`MODE: ${isApply ? "COMMITTED EXECUTION (--apply)" : "DRY-RUN (default)"}`);
  console.log("==================================================\n");

  let connected = false;
  try {
    const connPromise = mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000, connectTimeoutMS: 2000 });
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 2000));
    await Promise.race([connPromise, timeoutPromise]);
    connected = true;
    console.log("✓ Connected to MongoDB");
  } catch (err) {
    console.warn(`[INFO] MongoDB offline or unreachable (${err.message}). Performing file check...`);
  }

  let users = [];

  if (connected) {
    const User = require("../models/User");
    users = await User.find({}).lean();
  } else {
    const dbFile = path.resolve(__dirname, "../data/database.json");
    if (fs.existsSync(dbFile)) {
      const raw = JSON.parse(fs.readFileSync(dbFile, "utf8"));
      users = Array.isArray(raw.users) ? raw.users : [];
    }
  }

  console.log(`Analyzing ${users.length} user records for case-insensitive collisions and missing usernameLower...\n`);

  // Detect duplicate lowercase usernames
  const seen = new Map();
  const duplicates = [];

  for (const u of users) {
    const lower = (u.username || "").trim().toLowerCase();
    if (!lower) continue;
    if (seen.has(lower)) {
      duplicates.push({
        lowercase: lower,
        user1: seen.get(lower),
        user2: { id: u.id, username: u.username, role: u.role }
      });
    } else {
      seen.set(lower, { id: u.id, username: u.username, role: u.role });
    }
  }

  if (duplicates.length > 0) {
    console.error(`[ALERT] Found ${duplicates.length} case-insensitive username collision(s):`);
    duplicates.forEach((d, i) => {
      console.error(`  Collision #${i + 1}: '${d.lowercase}' between '${d.user1.username}' (ID: ${d.user1.id}) and '${d.user2.username}' (ID: ${d.user2.id})`);
    });
    console.error("\nResolve duplicates before applying unique lowercase index!");
    if (isApply) {
      console.error("Migration halted due to collisions. No changes made.");
      if (connected) await mongoose.disconnect();
      process.exit(1);
    }
  } else {
    console.log("✓ No duplicate lowercase usernames detected.");
  }

  let needsUpdate = 0;
  for (const u of users) {
    const expected = (u.username || "").trim().toLowerCase();
    if (!u.usernameLower || u.usernameLower !== expected) {
      needsUpdate++;
    }
  }

  console.log(`\nRecords requiring usernameLower population: ${needsUpdate} / ${users.length}`);

  if (!isApply) {
    console.log("\n[DRY RUN COMPLETE] No records were modified.");
    console.log("Run with `node scripts/migrate-usernamelower.js --apply` to commit changes.");
  } else if (connected) {
    const User = require("../models/User");
    let updatedCount = 0;
    for (const u of users) {
      const expected = (u.username || "").trim().toLowerCase();
      if (!u.usernameLower || u.usernameLower !== expected) {
        await User.updateOne({ _id: u._id }, { $set: { usernameLower: expected } });
        updatedCount++;
      }
    }
    console.log(`\n✓ Successfully populated usernameLower on ${updatedCount} MongoDB document(s).`);
    // Ensure index exists
    await User.syncIndexes();
    console.log("✓ Synchronized unique index on usernameLower.");
  }

  if (connected) await mongoose.disconnect();
  console.log("\n==================================================");
  process.exit(0);
}

runMigration().catch(err => {
  console.error("Migration fatal error:", err);
  process.exit(1);
});
