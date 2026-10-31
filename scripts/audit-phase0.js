const fs = require('fs');
const path = require('path');

const publicFiles = [
  'public/style.css',
  'public/index.html',
  'public/about.html',
  'public/courses.html',
  'public/students.html',
  'public/admin-courses-syllabus.html',
  'public/script.js',
  'public/animated-background.js'
];
const jsDir = 'public/js';
if (fs.existsSync(jsDir)) {
  fs.readdirSync(jsDir).forEach(f => {
    if (f.endsWith('.js')) publicFiles.push(path.join(jsDir, f));
  });
}

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu;

const stats = {
  emojis: {},
  inlineStyles: {},
  backdropFilters: {},
  gradients: {},
  boxShadows: {},
  importants: {},
  fontStacks: {},
  animatedBgRefs: {},
  vendorMotion: {
    exists: fs.existsSync('public/vendor/motion.js'),
    size: fs.existsSync('public/vendor/motion.js') ? fs.statSync('public/vendor/motion.js').size : 0,
    referencedInHtml: false,
    referencedInJs: false
  }
};

publicFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('vendor/motion.js') || content.includes('motion.js')) {
    if (file.endsWith('.html')) stats.vendorMotion.referencedInHtml = true;
    if (file.endsWith('.js')) stats.vendorMotion.referencedInJs = true;
  }
  
  // Emojis
  const emojiMatches = content.match(emojiRegex);
  if (emojiMatches) {
    stats.emojis[file] = emojiMatches.length;
  }
  
  // Inline styles
  const inlineMatches = content.match(/style\s*=\s*["'][^"']*["']/gi);
  if (inlineMatches) {
    stats.inlineStyles[file] = inlineMatches.length;
  }
  
  // backdrop-filter
  const bfMatches = content.match(/backdrop-filter\s*:[^;]+;/gi);
  if (bfMatches) {
    stats.backdropFilters[file] = bfMatches.length;
  }
  
  // gradients
  const gradMatches = content.match(/(linear|radial|conic)-gradient\([^;)]+\)/gi);
  if (gradMatches) {
    stats.gradients[file] = gradMatches.length;
  }
  
  // box-shadows
  const shadowMatches = content.match(/box-shadow\s*:[^;]+;/gi);
  if (shadowMatches) {
    stats.boxShadows[file] = shadowMatches.length;
  }
  
  // !important
  const impMatches = content.match(/!important/gi);
  if (impMatches) {
    stats.importants[file] = impMatches.length;
  }
  
  // font-family
  const fontMatches = content.match(/font-family\s*:[^;]+;/gi);
  if (fontMatches) {
    stats.fontStacks[file] = fontMatches.length;
  }
  
  // animated-background.js references
  const animMatches = content.match(/animated-background/gi);
  if (animMatches) {
    stats.animatedBgRefs[file] = animMatches.length;
  }
});

console.log('AUDIT STATS SUMMARY:');
console.log(JSON.stringify(stats, null, 2));
