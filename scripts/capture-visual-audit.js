// scripts/capture-visual-audit.js
// Renders screenshots at 1440, 1024, and 390 widths via headless Chrome

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const os = require('os');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const outputDir = path.join(rootDir, 'screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
];
const chromePath = chromePaths.find(p => p && fs.existsSync(p));

if (!chromePath) {
  console.error('Chrome executable not found.');
  process.exit(1);
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0].split('#')[0];
  if (reqUrl === '/') reqUrl = '/index.html';

  if (reqUrl.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, count: 120, students: 120, faculty: 18 }));
  }

  const filePath = path.join(publicDir, reqUrl);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not Found');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const debugPort = 9477;
  const tmpDir = path.join(os.tmpdir(), 'cs_audit_' + Date.now());

  const browser = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${tmpDir}`,
    '--no-first-run',
    '--disable-gpu',
    '--hide-scrollbars'
  ]);

  let pageTarget = null;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 150));
    try {
      const res = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
      if (res.ok) {
        const targets = await res.json();
        pageTarget = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
        if (pageTarget) break;
      }
    } catch (_) {}
  }

  if (!pageTarget) {
    browser.kill();
    server.close();
    console.error('Failed to establish CDP connection.');
    process.exit(1);
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let msgId = 1;
  const pending = new Map();
  function send(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.id && pending.has(data.id)) {
      const resolve = pending.get(data.id);
      pending.delete(data.id);
      resolve(data);
    }
  };

  await send('Page.enable');
  await send('DOM.enable');

  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'tablet-1024', width: 1024, height: 768 },
    { name: 'mobile-390', width: 390, height: 844 }
  ];

  for (const vp of viewports) {
    console.log(`Capturing screenshot at ${vp.width}x${vp.height} (${vp.name})...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.width <= 768
    });

    await send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html` });
    // Wait for idle and font rendering
    await new Promise(r => setTimeout(r, 1200));

    const shot = await send('Page.captureScreenshot', {
      format: 'webp',
      quality: 85,
      clip: { x: 0, y: 0, width: vp.width, height: vp.height, scale: 1 }
    });

    if (shot.result && shot.result.data) {
      const outPath = path.join(outputDir, `${vp.name}.webp`);
      fs.writeFileSync(outPath, Buffer.from(shot.result.data, 'base64'));
      console.log(`  ✓ Saved: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
    }
  }

  ws.close();
  browser.kill();
  server.close();
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (_) {}

  console.log('\n✓ Visual audit captures completed successfully.');
});
