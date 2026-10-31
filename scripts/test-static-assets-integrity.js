// scripts/test-static-assets-integrity.js
// Verification for Phase D1: Single Source of Truth for Web Assets
// (a) Every static asset link in public/*.html resolves to a file that actually exists on disk.
// (b) Requesting any file outside public/ via HTTP returns 404 (or 403).

const fs = require("fs");
const path = require("path");
const http = require("http");

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    passCount++;
    console.log(`  [PASS] ${message}`);
  } else {
    failCount++;
    console.error(`  [FAIL] ${message}`);
  }
}

async function runStaticAssetIntegrityTests() {
  console.log("=== Phase D1: Static Assets Single Source of Truth Audit ===\n");

  const rootDir = path.resolve(__dirname, "..");
  const publicDir = path.join(rootDir, "public");

  assert(fs.existsSync(publicDir), "public/ directory exists");

  // 1. Verify root duplicates are gone
  console.log("\n--- Section 1: Verify Root Duplicates Elimination ---");
  const rootDuplicates = [
    "index.html",
    "courses.html",
    "about.html",
    "students.html",
    "admin-courses-syllabus.html",
    "script.js",
    "style.css",
    "service-worker.js",
    "manifest.json"
  ];
  rootDuplicates.forEach(file => {
    assert(!fs.existsSync(path.join(rootDir, file)), `Root duplicate removed: ${file}`);
    assert(fs.existsSync(path.join(publicDir, file)), `Canonical asset exists in public/: ${file}`);
  });

  // 2. Scan every public/*.html and verify all asset links resolve to real disk files
  console.log("\n--- Section 2: Asset Link Resolution in public/*.html ---");
  const htmlFiles = fs.readdirSync(publicDir).filter(f => f.endsWith(".html"));
  assert(htmlFiles.length >= 4, `Found ${htmlFiles.length} HTML files in public/`);

  for (const htmlFile of htmlFiles) {
    const htmlContent = fs.readFileSync(path.join(publicDir, htmlFile), "utf8");
    const linkRegex = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;
    let match;
    const links = [];

    while ((match = linkRegex.exec(htmlContent)) !== null) {
      links.push(match[1]);
    }

    for (const rawLink of links) {
      // Ignore external protocols, mailto, tel, hashes, and data URIs
      if (/^(https?:|\/\/|mailto:|tel:|#|data:)/i.test(rawLink)) continue;

      // Clean query strings and hashes
      const cleanPath = rawLink.split("?")[0].split("#")[0];
      if (!cleanPath) continue;

      // Handle root-relative or relative paths
      const relPath = cleanPath.startsWith("/") ? cleanPath.slice(1) : cleanPath;
      const targetPath = path.join(publicDir, relPath);
      const exists = fs.existsSync(targetPath);

      assert(exists, `[${htmlFile}] Asset link '${rawLink}' resolves to disk at: public/${relPath}`);
    }
  }

  // 3. HTTP Server Verification: Files outside public/ return 404 or 403
  console.log("\n--- Section 3: HTTP Server Isolation & 404 for Non-Public Files ---");
  process.env.NODE_ENV = "test";
  process.env.SESSION_SECRET = "test_super_secret_session_key_32chars_long_xyz";
  const app = require("../server.js");

  const server = http.createServer(app);
  await new Promise(res => server.listen(0, "127.0.0.1", res));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  function httpGet(reqPath) {
    return new Promise((resolve, reject) => {
      http.get(`${baseUrl}${reqPath}`, res => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
      }).on("error", reject);
    });
  }

  try {
    // Valid public assets should return 200
    const resIndex = await httpGet("/");
    assert(resIndex.statusCode === 200, "GET / returns 200");
    assert(resIndex.body.includes("CampusSphere"), "GET / serves CampusSphere index.html");

    const resStyle = await httpGet("/style.css");
    assert(resStyle.statusCode === 200, "GET /style.css returns 200");

    const resVendor = await httpGet("/vendor/chart.umd.min.js");
    assert(resVendor.statusCode === 200, "GET /vendor/chart.umd.min.js returns 200");

    // Files outside public/ must return 404 (or 403 for /uploads)
    const outsideFiles = [
      "/server.js",
      "/.env.example",
      "/package.json",
      "/package-lock.json",
      "/README.md",
      "/models/User.js",
      "/services/fileSyncService.js",
      "/scripts/check-secrets.js"
    ];

    for (const extFile of outsideFiles) {
      const res = await httpGet(extFile);
      assert(res.statusCode === 404, `GET ${extFile} outside public/ returns 404 (got ${res.statusCode})`);
      assert(!res.body.includes("Antigravity") && !res.body.includes("express"), `${extFile} does not leak file content`);
    }

    // Direct /uploads path is blocked
    const resUploads = await httpGet("/uploads");
    assert(resUploads.statusCode === 403 || resUploads.statusCode === 404, "GET /uploads returns 403/404");
  } finally {
    await new Promise(res => server.close(res));
  }

  console.log(`\n======================================================`);
  console.log(`Phase D1 Results: ${passCount} Passed, ${failCount} Failed`);
  console.log(`======================================================`);

  if (failCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runStaticAssetIntegrityTests().catch(err => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
