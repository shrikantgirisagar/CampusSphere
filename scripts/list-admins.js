// scripts/list-admins.js
// Safe, read-only administrative inspection tool for CampusSphere admin accounts.
// Lists active administrator accounts without displaying passwords, password hashes, or secrets.

require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");

async function listAdmins() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/CampusSphere";
  
  console.log("==================================================");
  console.log("CAMPUSSPHERE — ADMINISTRATOR ACCOUNT INVENTORY");
  console.log("==================================================");

  let connected = false;
  try {
    const connPromise = mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000, connectTimeoutMS: 2000 });
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 2000));
    await Promise.race([connPromise, timeoutPromise]);
    connected = true;
  } catch (err) {
    console.warn(`[INFO] MongoDB offline or unreachable (${err.message}). Checking local fallback...`);
  }

  let admins = [];

  if (connected) {
    try {
      const User = require("../models/User");
      admins = await User.find({ role: "admin" })
        .select("id name username usernameLower email createdAt updatedAt tokenVersion")
        .sort({ createdAt: 1 })
        .lean();
    } catch (dbErr) {
      console.error("[ERROR] Failed to query User collection:", dbErr.message);
    } finally {
      await mongoose.disconnect();
    }
  } else {
    // Read from sanitized or database.json if offline
    const fs = require("fs");
    const dbFile = path.resolve(__dirname, "../data/database.json");
    if (fs.existsSync(dbFile)) {
      try {
        const raw = JSON.parse(fs.readFileSync(dbFile, "utf8"));
        const users = Array.isArray(raw.users) ? raw.users : [];
        admins = users
          .filter(u => u.role === "admin")
          .map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            email: u.email,
            createdAt: u.createdAt || "N/A"
          }));
      } catch (_) {}
    }
  }

  console.log(`\nFound ${admins.length} administrator account(s):\n`);

  if (admins.length === 0) {
    console.log("No administrator accounts registered.");
  } else {
    admins.forEach((admin, index) => {
      console.log(`[Admin #${index + 1}]`);
      console.log(`  ID:           ${admin.id || "N/A"}`);
      console.log(`  Name:         ${admin.name || "N/A"}`);
      console.log(`  Username:     @${admin.username}`);
      console.log(`  Email:        ${admin.email || "(no email registered)"}`);
      console.log(`  Token Version: ${admin.tokenVersion ?? 0}`);
      console.log(`  Created At:   ${admin.createdAt || "N/A"}`);
      console.log("--------------------------------------------------");
    });
  }

  console.log("\nRules for administrator management:");
  console.log("1. Self-deletion is prohibited (you cannot delete your own admin account).");
  console.log("2. The last remaining administrator account can never be deleted or demoted.");
  console.log("==================================================\n");
  process.exit(0);
}

listAdmins().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
