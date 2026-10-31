// scripts/build-3d.js
// Bundles and tree-shakes Three.js scene into public/vendor/campus3d.js via esbuild
// Hard budget: bundle <= 450 KB minified (<= 150 KB gzip); fail the build script above that.

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const unusedShaderChunks = [
  // Fog
  'fog_fragment', 'fog_pars_fragment', 'fog_pars_vertex', 'fog_vertex',
  // Morph & Skin
  'morphtarget_pars_vertex', 'morphnormal_vertex', 'morphtarget_vertex',
  'skinbase_vertex', 'skinnormal_vertex', 'skinning_pars_vertex', 'skinning_vertex',
  // Shadow maps (we use blurred procedural contact-shadow plane)
  'shadowmap_pars_fragment', 'shadowmap_pars_vertex', 'shadowmap_vertex', 'shadowmask_pars_fragment',
  // Unused PBR extensions
  'anisotropy_fragment', 'anisotropy_pars_fragment',
  'iridescence_fragment', 'iridescence_pars_fragment',
  'sheen_fragment', 'sheen_pars_fragment',
  'transmission_fragment', 'transmission_pars_fragment',
  'dispersion_fragment', 'dispersion_pars_fragment',
  // Texture maps (all procedural primitives and materials, no image textures)
  'alphahash_fragment', 'alphahash_pars_fragment',
  'alphamap_fragment', 'alphamap_pars_fragment',
  'bumpmap_pars_fragment',
  'displacementmap_pars_vertex', 'displacementmap_vertex',
  'emissivemap_fragment', 'emissivemap_pars_fragment',
  'gradientmap_pars_fragment',
  'lightmap_fragment', 'lightmap_pars_fragment',
  'metalnessmap_pars_fragment',
  'roughnessmap_pars_fragment',
  'normalmap_pars_fragment', 'normalmap_fragment',
  'clearcoat_normalmap_pars_fragment',
  // Batching & clipping
  'batching_pars_vertex', 'batching_vertex',
  'clipping_planes_fragment', 'clipping_planes_pars_fragment', 'clipping_planes_pars_vertex', 'clipping_planes_vertex',
  'logdepthbuf_fragment', 'logdepthbuf_pars_fragment', 'logdepthbuf_pars_vertex', 'logdepthbuf_vertex',
  // Unused light models
  'lights_toon_fragment', 'lights_toon_pars_fragment',
  'lights_phong_fragment', 'lights_phong_pars_fragment',
  'lights_lambert_fragment', 'lights_lambert_pars_fragment',
  'map_particle_fragment', 'map_particle_pars_fragment',
  'morphinstance_vertex', 'morphcolor_vertex',
  'specularmap_fragment', 'specularmap_pars_fragment'
];

async function build() {
  console.log('=== Building CampusSphere 3D Bundle (Phase 2) ===\n');

  const rootDir = path.resolve(__dirname, '..');
  const entryPoint = path.join(rootDir, 'src', '3d', 'main.js');
  const vendorDir = path.join(rootDir, 'public', 'vendor');
  const outfile = path.join(vendorDir, 'campus3d.js');

  if (!fs.existsSync(vendorDir)) {
    fs.mkdirSync(vendorDir, { recursive: true });
  }

  const result = await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    minify: true,
    treeShaking: true,
    sourcemap: false,
    target: ['es2020'],
    format: 'iife',
    globalName: 'CampusSphere3DModule',
    outfile: outfile,
    plugins: [{
      name: 'three-tree-shaking-optimization',
      setup(buildCtx) {
        // Resolve three directly to source module to enable deep granular tree-shaking
        buildCtx.onResolve({ filter: /^three$/ }, () => {
          return { path: require.resolve('three/src/Three.js') };
        });

        // Strip unused shader chunks from the bundle
        buildCtx.onLoad({ filter: /ShaderChunk\.js$/ }, async (args) => {
          let text = await fs.promises.readFile(args.path, 'utf8');
          for (const chunk of unusedShaderChunks) {
            text = text.replace(new RegExp(`import ${chunk} from [^;]+;`), `const ${chunk} = "";`);
          }
          return { contents: text, loader: 'js' };
        });

        // Strip unused material shaders from ShaderLib
        buildCtx.onLoad({ filter: /ShaderLib\.js$/ }, async (args) => {
          let text = await fs.promises.readFile(args.path, 'utf8');
          const unusedShaders = [
            'lambert', 'phong', 'toon', 'matcap', 'points', 'dashed',
            'depth', 'normal', 'sprite', 'shadow', 'distanceRGBA'
          ];
          for (const s of unusedShaders) {
            text = text.replace(
              new RegExp(`${s}:\\s*\\{[\\s\\S]*?\\n\\t\\},`),
              `${s}: { uniforms: {}, vertexShader: "", fragmentShader: "" },`
            );
          }
          const physicalUnusedProps = ['dispersion', 'iridescence', 'sheen', 'transmission', 'thickness', 'attenuation', 'anisotropy'];
          for (const prop of physicalUnusedProps) {
            text = text.replace(new RegExp(`\\t\\t\\t${prop}[\\s\\S]*?:\\s*\\{[\\s\\S]*?\\},?\\n`, 'g'), '');
          }
          return { contents: text, loader: 'js' };
        });
      }
    }]
  });

  const stats = fs.statSync(outfile);
  const rawBytes = stats.size;
  const rawKb = (rawBytes / 1024).toFixed(1);

  const fileBuffer = fs.readFileSync(outfile);
  const gzipBuffer = zlib.gzipSync(fileBuffer);
  const gzipBytes = gzipBuffer.length;
  const gzipKb = (gzipBytes / 1024).toFixed(1);

  console.log(`✓ Output generated: public/vendor/campus3d.js`);
  console.log(`  Raw size : ${rawBytes} bytes (${rawKb} KB)`);
  console.log(`  Gzip size: ${gzipBytes} bytes (${gzipKb} KB)`);

  const RAW_BUDGET = 450 * 1024;   // 450 KB minified (460,800 bytes)
  const GZIP_BUDGET = 150 * 1024;  // 150 KB gzip (153,600 bytes)

  let failed = false;
  if (rawBytes > RAW_BUDGET) {
    console.error(`  [FAIL] Raw size (${rawKb} KB) exceeds hard budget of 450 KB!`);
    failed = true;
  } else {
    console.log(`  [PASS] Raw size within budget (${rawKb} KB / 450 KB)`);
  }

  if (gzipBytes > GZIP_BUDGET) {
    console.error(`  [FAIL] Gzip size (${gzipKb} KB) exceeds hard budget of 150 KB!`);
    failed = true;
  } else {
    console.log(`  [PASS] Gzip size within budget (${gzipKb} KB / 150 KB)`);
  }

  if (failed) {
    process.exit(1);
  }

  console.log(`\n✓ 3D build succeeded cleanly within all budgets.\n`);
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
