// scripts/build-scene.js
// Bundles and tree-shakes Three.js scene into public/js/scene.js via esbuild

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

async function build() {
  console.log('=== Building CampusSphere 3D Scene ===\n');

  const rootDir = path.resolve(__dirname, '..');
  const entryPoint = path.join(rootDir, 'src', 'scene', 'main.js');
  const outfile = path.join(rootDir, 'public', 'js', 'scene.js');

  const result = await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    minify: true,
    treeShaking: true,
    sourcemap: false,
    target: ['es2020'],
    format: 'iife',
    outfile: outfile,
    metafile: true
  });

  const stats = fs.statSync(outfile);
  const rawBytes = stats.size;
  const rawKb = (rawBytes / 1024).toFixed(1);

  const fileBuffer = fs.readFileSync(outfile);
  const gzipBuffer = zlib.gzipSync(fileBuffer);
  const gzipBytes = gzipBuffer.length;
  const gzipKb = (gzipBytes / 1024).toFixed(1);

  console.log(`✓ Output generated: public/js/scene.js`);
  console.log(`  Raw size : ${rawBytes} bytes (${rawKb} KB)`);
  console.log(`  Gzip size: ${gzipBytes} bytes (${gzipKb} KB)`);

  const GZIP_BUDGET = 220 * 1024; // 220 KB
  if (gzipBytes > GZIP_BUDGET) {
    console.error(`  [FAIL] Gzip size exceeds budget of 220 KB!`);
    process.exit(1);
  } else {
    console.log(`  [PASS] Well within <= 220KB gzip budget (${gzipKb} KB / 220 KB)!\n`);
  }
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
