// scripts/check-contrast.js
// Verify WCAG AA (>= 4.5:1 for normal text, >= 3.0:1 for large text/rules)

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  return [ (num >> 16) & 255, (num >> 8) & 255, num & 255 ];
}

function relativeLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const pairs = [
  { fg: '#0A2540', bg: '#FBF8F2', role: 'Navy ink headings on Ivory page' },
  { fg: '#0A2540', bg: '#FFFFFF', role: 'Navy ink headings on Paper cards' },
  { fg: '#0d2b67', bg: '#FBF8F2', role: 'Deep blue on Ivory page' },
  { fg: '#0d2b67', bg: '#FFFFFF', role: 'Deep blue on Paper cards' },
  { fg: '#1459d9', bg: '#FBF8F2', role: 'Royal blue links/buttons on Ivory page' },
  { fg: '#1459d9', bg: '#FFFFFF', role: 'Royal blue links on Paper cards' },
  { fg: '#FFFFFF', bg: '#1459d9', role: 'White button text on Royal blue button' },
  { fg: '#FFFFFF', bg: '#0A2540', role: 'White text on Navy surface' },
  { fg: '#475569', bg: '#FBF8F2', role: 'Secondary body slate on Ivory page' },
  { fg: '#475569', bg: '#FFFFFF', role: 'Secondary body slate on Paper cards' },
  { fg: '#2B3A4F', bg: '#FBF8F2', role: 'Primary body ink on Ivory page' },
  { fg: '#2B3A4F', bg: '#FFFFFF', role: 'Primary body ink on Paper cards' },
  { fg: '#B38B3F', bg: '#0A2540', role: 'Brass accent on Navy header (large / icon)' },
  { fg: '#7A5A28', bg: '#FBF8F2', role: 'Deep brass text on Ivory page' }
];

let allPassed = true;
console.log('=== WCAG AA Contrast Audit ===\n');
pairs.forEach(({ fg, bg, role }) => {
  const ratio = contrastRatio(fg, bg);
  const isLargeOrDecorative = role.includes('large') || role.includes('icon') || role.includes('headings');
  const threshold = isLargeOrDecorative ? 3.0 : 4.5;
  const pass = ratio >= threshold;
  if (!pass) allPassed = false;
  console.log(`${pass ? '  [PASS]' : '  [FAIL]'} ${ratio.toFixed(2)}:1 (min ${threshold}:1) - ${role} (${fg} on ${bg})`);
});

if (allPassed) {
  console.log('\nAll color combinations pass WCAG AA standards!');
} else {
  console.error('\nSome color combinations failed WCAG AA!');
  process.exit(1);
}
