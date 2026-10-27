// scripts/make-clean-zip.js
// Creates a clean, distributable zip archive of CampusSphere
// Excludes: node_modules, .env*, data/, backups/, scratch/, uploads/, .git, *.tmp*

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const outputZip = path.join(rootDir, "CampusSphere-clean.zip");

console.log("==================================================");
console.log("CAMPUSSPHERE — CLEAN ZIP PACKAGING");
console.log("==================================================");

if (fs.existsSync(outputZip)) {
  console.log(`Removing existing archive: ${path.basename(outputZip)}`);
  fs.unlinkSync(outputZip);
}

const excludedPatterns = [
  "node_modules",
  ".env*",
  ".dev-secret",
  "data",
  "backups",
  "scratch",
  "uploads",
  ".git",
  "*.tmp*",
  "*.tmp",
  "*.log",
  "CampusSphere-clean.zip"
];

// Build exclude arguments for bsdtar
const excludeArgs = excludedPatterns.map(p => `--exclude="${p}"`).join(" ");

console.log("Packaging project files (excluding secrets, operational data, logs, dependencies)...");
try {
  // Use Windows built-in bsdtar
  execSync(`tar -a -cf "${outputZip}" ${excludeArgs} *`, {
    cwd: rootDir,
    stdio: "inherit"
  });

  const stat = fs.statSync(outputZip);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
  console.log("\n==================================================");
  console.log(`✓ Clean package created successfully!`);
  console.log(`Archive: ${outputZip}`);
  console.log(`Size:    ${sizeMb} MB`);
  console.log("==================================================");
} catch (err) {
  console.error("Packaging failed:", err.message);
  process.exit(1);
}
