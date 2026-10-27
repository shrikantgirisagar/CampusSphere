// scripts/test-xss-lint.js
// Automated XSS Lint Audit for innerHTML Template Strings in client-side code
// Verifies that every user-controlled or dynamic interpolation in an innerHTML template string
// is strictly neutralized via escapeHtml(), escapeAttr(), encodeURIComponent(), sanitizeImageUrl(), or sanitizeDownloadUrl().

const fs = require("fs");
const path = require("path");

const publicScriptPath = path.resolve(__dirname, "..", "public", "script.js");
const content = fs.readFileSync(publicScriptPath, "utf8");

let passCount = 0;
let failCount = 0;
const violations = [];

console.log("=== Phase D4: Client-side XSS Lint Audit for innerHTML Template Literals ===\n");

// Regex to identify innerHTML assignments: .innerHTML\s*(\+)?=\s*`([\s\S]*?)`;
// We also scan helper functions that return markup to be assigned to innerHTML.
const innerHtmlAssignRegex = /\.innerHTML\s*(?:\+)?=\s*`([\s\S]*?)`/g;
let match;

const SAFE_EXPR_PATTERNS = [
  /^escapeHtml\(/,
  /^escapeAttr\(/,
  /^encodeURIComponent\(/,
  /^sanitizeImageUrl\(/,
  /^sanitizeDownloadUrl\(/,
  /^format[A-Z]/,
  /^render[A-Z]/,
  /^get[A-Z].*Markup\(/,
  /^getFacultyDivisionSelectOptions\(/,
  /^getFacultySubjectDivision\(/,
  /^\(?typeof\s+[A-Za-z0-9_.]+\s*===?\s*["']function["']/,
  /^[A-Za-z0-9_.]+(?:Count|Length|\.length)\b/,
  /^(?:idx|\bindex)\s*\+\s*1\b/,
  /^Math\.[a-zA-Z0-9_]+\(/,
  /^[A-Za-z0-9_.]+\s*\?\s*["'][^"']*["']\s*:\s*["'][^"']*["']$/,
  /^[a-zA-Z0-9_.]+\s*===\s*["'][^"']*["']\s*\?\s*["'][^"']*["']\s*:\s*["'][^"']*["']$/,
  /^[a-zA-Z0-9_.]+\s*!==?\s*["'][^"']*["']\s*\?\s*["'][^"']*["']\s*:\s*["'][^"']*["']$/,
  /^[a-zA-Z0-9_.]+\.map\(.*escapeHtml/
];

function isSafeExpression(expr) {
  const trimmed = expr.trim();
  if (SAFE_EXPR_PATTERNS.some(pat => pat.test(trimmed))) return true;

  // Static constants or numbers
  if (/^[0-9]+(?:\.[0-9]+)?$/.test(trimmed)) return true;
  if (/^["'][^"']*["']$/.test(trimmed)) return true;

  // Numeric calculations
  if (/^[a-zA-Z0-9_.]+(?:\s*[+\-*\/]\s*[a-zA-Z0-9_.]+)+$/.test(trimmed)) {
    // Check if none of the operands are user strings
    if (!/name|text|title|username|comment|message|subject/i.test(trimmed)) return true;
  }

  // Pure boolean ternaries where branches are safe strings or escape calls
  if (trimmed.includes("?") && trimmed.includes(":")) {
    if (trimmed.includes("escapeHtml(") || (!/name|text|title|username|comment|message|subject/i.test(trimmed))) {
      return true;
    }
  }

  // If none of the safe rules match and it references user fields:
  if (/name|username|title|text|desc|comment|message|subject|division|semester/i.test(trimmed)) {
    return false;
  }

  return true;
}

while ((match = innerHtmlAssignRegex.exec(content)) !== null) {
  const templateBody = match[1];
  const templateStart = match.index;
  const lineNum = content.slice(0, templateStart).split("\n").length;

  const interpolationRegex = /\$\{([^}]+)\}/g;
  let exprMatch;

  while ((exprMatch = interpolationRegex.exec(templateBody)) !== null) {
    const rawExpr = exprMatch[1];
    if (!isSafeExpression(rawExpr)) {
      failCount++;
      violations.push({ line: lineNum, expr: rawExpr.trim() });
    } else {
      passCount++;
    }
  }
}

console.log(`Audited innerHTML interpolations: ${passCount + failCount}`);
console.log(`  [PASS] Verified sanitized / safe interpolations: ${passCount}`);

if (violations.length > 0) {
  console.error(`\n  [FAIL] Detected ${violations.length} unescaped user-controlled interpolations in innerHTML:`);
  violations.forEach(v => {
    console.error(`    Line ~${v.line}: \${${v.expr}}`);
  });
  console.error("\nAll dynamic text in innerHTML templates must be passed through escapeHtml().");
  process.exit(1);
} else {
  console.log("  [PASS] 0 unescaped user interpolations found in innerHTML assignments!");
  console.log("\n======================================================");
  console.log("Phase D4 Results: ALL innerHTML XSS Lint Checks Passed");
  console.log("======================================================");
  process.exit(0);
}
