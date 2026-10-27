// scripts/prune-admins.js
// Safe Administrator Account Pruning Utility
// Default mode is strictly DRY-RUN. Modifies data ONLY when both --apply and --confirm "DELETE EXTRA ADMINS" are provided.

require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

function printUsage() {
  console.log(`
Usage:
  node scripts/prune-admins.js --keep <username1,username2> [options]

Options:
  --keep <users>      Comma-separated list of admin usernames to KEEP (required).
  --apply             Commit deletions (default is dry-run only).
  --confirm "<phrase>" Required when --apply is used. Must be exactly "DELETE EXTRA ADMINS".

Examples:
  # Dry-run audit (safe):
  node scripts/prune-admins.js --keep admin

  # Production execution:
  node scripts/prune-admins.js --keep admin --apply --confirm "DELETE EXTRA ADMINS"
`);
}

async function runPrune() {
  const args = process.argv.slice(2);
  const isApply = args.includes("--apply");

  let keepArg = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--keep=")) {
      keepArg = args[i].slice(7);
    } else if (args[i] === "--keep" && args[i + 1]) {
      keepArg = args[i + 1];
    }
  }

  let confirmArg = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--confirm=")) {
      confirmArg = args[i].slice(10);
    } else if (args[i] === "--confirm" && args[i + 1]) {
      confirmArg = args[i + 1];
    }
  }

  console.log("==================================================");
  console.log("CAMPUSSPHERE — ADMINISTRATOR ACCOUNT PRUNING");
  console.log(`MODE: ${isApply ? "COMMITTED EXECUTION (--apply)" : "DRY-RUN (Safe Default)"}`);
  console.log("==================================================\n");

  if (!keepArg) {
    console.error("[ERROR] Missing required --keep argument. You must specify which admin username(s) to preserve.");
    printUsage();
    process.exit(1);
  }

  const keepList = keepArg
    .split(",")
    .map(u => u.trim().replace(/^@/, "").toLowerCase())
    .filter(Boolean);

  if (keepList.length === 0) {
    console.error("[ERROR] Keep list cannot be empty. Specify at least one administrator to preserve.");
    process.exit(1);
  }

  if (isApply && confirmArg !== "DELETE EXTRA ADMINS") {
    console.error('[ERROR] To commit deletion, you must provide --confirm "DELETE EXTRA ADMINS".');
    console.error(`Received: ${confirmArg ? JSON.stringify(confirmArg) : "None"}`);
    process.exit(1);
  }

  // Connect to database with safety timeout
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/CampusSphere";
  let connected = false;
  try {
    const connPromise = mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000, connectTimeoutMS: 2000 });
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 2000));
    await Promise.race([connPromise, timeoutPromise]);
    connected = true;
  } catch (err) {
    console.warn(`[INFO] MongoDB offline or unreachable (${err.message}). Reading local backup/database...`);
  }

  let admins = [];
  let User = null;

  if (connected) {
    User = require("../models/User");
    admins = await User.find({ role: "admin" })
      .select("id name username usernameLower email createdAt updatedAt tokenVersion")
      .lean();
  } else {
    const dbFile = path.resolve(__dirname, "../data/database.json");
    if (fs.existsSync(dbFile)) {
      const raw = JSON.parse(fs.readFileSync(dbFile, "utf8"));
      admins = (raw.users || []).filter(u => u.role === "admin");
    }
  }

  if (admins.length === 0) {
    console.log("No administrator accounts found in the database.");
    if (connected) await mongoose.disconnect();
    process.exit(0);
  }

  const existingLowerMap = new Map();
  for (const a of admins) {
    const lower = (a.usernameLower || a.username || "").toLowerCase();
    existingLowerMap.set(lower, a);
  }

  // Validate that every username in keepList actually exists
  const missingKeep = [];
  for (const k of keepList) {
    if (!existingLowerMap.has(k)) {
      missingKeep.push(k);
    }
  }

  if (missingKeep.length > 0) {
    console.error(`[ERROR] The following administrator(s) in --keep do NOT exist in the database: ${missingKeep.join(", ")}`);
    console.error("Refusing to prune: All accounts in the keep list must be verified existing admins.");
    if (connected) await mongoose.disconnect();
    process.exit(1);
  }

  const toKeep = [];
  const toDelete = [];

  for (const a of admins) {
    const lower = (a.usernameLower || a.username || "").toLowerCase();
    if (keepList.includes(lower)) {
      toKeep.push(a);
    } else {
      toDelete.push(a);
    }
  }

  if (toKeep.length === 0) {
    console.error("[ERROR] Protection violation: Pruning would delete all administrators. At least one administrator must remain.");
    if (connected) await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`Current Total Admins: ${admins.length}`);
  console.log(`Admins to KEEP (${toKeep.length}):`);
  for (const a of toKeep) {
    console.log(`  ✓ @${a.username} (${a.name || "N/A"}) — ID: ${a.id || a._id}`);
  }

  console.log(`\nAdmins to PRUNE (${toDelete.length}):`);
  if (toDelete.length === 0) {
    console.log("  (None: No extra administrators found to delete)");
    if (connected) await mongoose.disconnect();
    process.exit(0);
  }

  for (const a of toDelete) {
    console.log(`  ✗ @${a.username} (${a.name || "N/A"}) — ID: ${a.id || a._id} [Created: ${a.createdAt || "Unknown"}]`);
  }

  if (!isApply) {
    console.log("\n==================================================");
    console.log("[DRY-RUN COMPLETE] Zero accounts were modified or deleted.");
    console.log(`To prune the ${toDelete.length} admin account(s), run with:`);
    console.log(`  node scripts/prune-admins.js --keep "${keepArg}" --apply --confirm "DELETE EXTRA ADMINS"`);
    console.log("==================================================");
    if (connected) await mongoose.disconnect();
    process.exit(0);
  }

  // If --apply is set and confirmed
  if (!connected) {
    console.error("[ERROR] Cannot apply pruning while database is offline.");
    process.exit(1);
  }

  let deletedCount = 0;
  for (const a of toDelete) {
    await User.deleteOne({ _id: a._id });
    deletedCount++;
  }

  console.log("\n==================================================");
  console.log(`[PRUNE COMPLETE] Successfully deleted ${deletedCount} administrator account(s).`);
  console.log(`Preserved ${toKeep.length} active administrator account(s).`);
  console.log("==================================================");

  await mongoose.disconnect();
  process.exit(0);
}

runPrune().catch(err => {
  console.error("Fatal prune error:", err.message);
  process.exit(1);
});
