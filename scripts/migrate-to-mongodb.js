require("dotenv").config();

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");

const DB_FILE = path.join(__dirname, "..", "data", "database.json");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart_student_portal";

async function migrateData() {
  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "CampusSphere",
      serverSelectionTimeoutMS: 5000
    });
    console.log("Connected to MongoDB successfully.");

    if (!fs.existsSync(DB_FILE)) {
      console.log(`No database file found at ${DB_FILE}. Nothing to migrate.`);
      process.exit(0);
    }

    const raw = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const users = Array.isArray(parsed?.users) ? parsed.users : [];

    console.log(`Found ${users.length} users in data/database.json to migrate...`);

    let added = 0;
    let updated = 0;

    for (const u of users) {
      if (!u.id || !u.username || !u.role) continue;
      const res = await User.updateOne(
        { id: u.id },
        {
          $set: {
            id: u.id,
            role: u.role,
            name: u.name || "",
            username: u.username,
            email: u.email || "",
            subject: u.subject || "",
            department: u.department || "",
            passwordHash: u.passwordHash || "",
            division: u.division || "",
            semester: u.semester || "",
            courseYear: u.courseYear || "",
            course: u.course || "",
            languageChoice: u.languageChoice || "",
            mathChoice: u.mathChoice || "",
            profilePic: u.profilePic || ""
          }
        },
        { upsert: true }
      );

      if (res.upsertedCount > 0) added++;
      else if (res.modifiedCount > 0) updated++;
    }

    console.log(`Migration complete! Added: ${added}, Updated: ${updated}, Total processed: ${users.length}`);
  } catch (error) {
    console.error("Migration error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

migrateData();
