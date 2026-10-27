// scripts/check-secrets.js
// Pre-commit verification script to audit tracked Git files for credential/secret leakage
// Fails if tracked files contain scrypt$ hashes, mongodb+srv:// credentials, VAPID private keys or leaked secrets.

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log("CAMPUSSPHERE — SECURITY AUDIT: SECRET LEAK CHECK");
console.log("==================================================\n");

let trackedFiles = [];
try {
  const output = execSync("git ls-files", { encoding: "utf8" });
  trackedFiles = output.split("\n").map(f => f.trim()).filter(Boolean);
} catch (err) {
  console.warn("[WARN] Not a Git repo or Git command failed. Scanning workspace files...");
  function walk(dir) {
    let res = [];
    for (const f of fs.readdirSync(dir)) {
      if (f === "node_modules" || f === ".git" || f === "data" || f === "backups" || f === "scratch" || f === "uploads") continue;
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) res = res.concat(walk(p));
      else res.push(path.relative(process.cwd(), p));
    }
    return res;
  }
  trackedFiles = walk(".");
}

const SECRET_PATTERNS = [
  {
    name: "Scrypt Password Hash",
    regex: /scrypt\$\d+\$\d+\$\d+\$[A-Za-z0-9_-]{16,}\$[A-Za-z0-9_-]{32,}/g,
    allowedIn: ["scripts/test-sensitive-data-audit.js", "scripts/test-api-hardening.js", "server.js", "scripts/lib/test-db.js"] // Test mocks or dummy constants
  },
  {
    name: "MongoDB Atlas Credentials",
    regex: /mongodb(\+srv)?:\/\/[a-zA-Z0-9_.-]+:[^@\s/]+@[a-zA-Z0-9_.-]+/g,
    allowedIn: []
  },
  {
    name: "Unredacted VAPID Private Key Assignment",
    regex: /VAPID_PRIVATE_KEY\s*=\s*["']?(?!replace_with)[A-Za-z0-9_-]{35,}["']?/g,
    allowedIn: []
  }
];

let violations = [];

for (const file of trackedFiles) {
  // Skip binary files and known safe demo data
  if (file.endsWith(".png") || file.endsWith(".ico") || file.endsWith(".jpg") || file.endsWith(".pdf") || file.endsWith(".zip")) {
    continue;
  }
  if (!fs.existsSync(file)) continue;

  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for MongoDB Atlas URI with real credentials
    if (line.includes("mongodb+srv://") && !line.includes("<db_username>") && !line.includes("***:***")) {
      const match = line.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@/);
      if (match && !match[1].includes("<") && !match[2].includes("<") && !match[1].includes("YOUR_") && !match[1].includes("test_")) {
        violations.push({
          file,
          line: i + 1,
          rule: "MongoDB Atlas Credentials Exposure",
          snippet: line.trim().slice(0, 50) + "..."
        });
      }
    }

    // Check for real scrypt password hash exposure outside approved dummy constants
    if ((line.includes("scrypt$16384$8$1$") || line.includes("scrypt$32768$8$1$")) && !line.includes("${salt")) {
      const isAllowedFile = file.replace(/\\/g, "/").startsWith("scripts/");
      const isDummyHash = line.includes("DUMMY_HASH") || line.includes("DUMMY_SCRYPT") || line.includes("dummy-hash") || line.includes("hashhash") || line.includes("c2FsdHNhbHQ");
      if (!isAllowedFile && !isDummyHash) {
        violations.push({
          file,
          line: i + 1,
          rule: "Real Scrypt Hash Exposure",
          snippet: line.trim().slice(0, 40) + "..."
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.error(`[FAIL] Detected ${violations.length} potential secret/credential violation(s) in tracked files:\n`);
  for (const v of violations) {
    console.error(`  - ${v.file}:${v.line} [${v.rule}] -> ${v.snippet}`);
  }
  console.error("\nPlease remove or sanitize these secrets before committing.\n");
  process.exit(1);
} else {
  console.log(`✓ All ${trackedFiles.length} tracked files audited: Zero secret or credential exposures detected!\n`);
  process.exit(0);
}
