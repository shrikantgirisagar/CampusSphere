// scripts/generate-scene-poster.js
// Generates static WebP poster (<= 60KB) from the 3D Three.js scene via headless Chrome

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const os = require('os');

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
];
const chromePath = chromePaths.find(p => p && fs.existsSync(p));

if (!chromePath) {
  console.error('Chrome not found to render 3D scene poster.');
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '..');
const sceneJsPath = path.join(rootDir, 'public', 'js', 'scene.js');

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background-color: #FBF8F2; overflow: hidden; }
    #hero3dWrap { width: 600px; height: 600px; position: relative; }
    #heroCanvas { width: 100%; height: 100%; display: block; }
  </style>
</head>
<body>
  <div id="hero3dWrap">
    <canvas id="heroCanvas"></canvas>
  </div>
  <script src="/js/scene.js"></script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  if (req.url === '/js/scene.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    fs.createReadStream(sceneJsPath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
  }
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const debugPort = 9489;
  const tmpDir = path.join(os.tmpdir(), 'cs_poster_' + Date.now());

  const browser = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--no-sandbox',
    '--disable-gpu',
    `--user-data-dir=${tmpDir}`,
    `http://127.0.0.1:${port}/`
  ]);

  let connected = false;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 150));
    try {
      const res = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (res.ok) { connected = true; break; }
    } catch (_) {}
  }

  if (!connected) {
    console.error('Failed to connect to CDP');
    browser.kill();
    server.close();
    process.exit(1);
  }

  const listRes = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
  const targets = await listRes.json();
  const pageTarget = targets.find(t => t.type === 'page');

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const pending = new Map();
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.id && pending.has(d.id)) {
      pending.get(d.id)(d);
      pending.delete(d.id);
    }
  };

  function send(method, params = {}) {
    return new Promise(res => {
      const msgId = id++;
      pending.set(msgId, res);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Runtime.enable');
  await send('Page.enable');

  // Wait for 3D scene to initialize and render
  await new Promise(r => setTimeout(r, 1200));

  const evalResult = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return null;
        return canvas.toDataURL('image/webp', 0.82);
      })()
    `,
    returnByValue: true
  });

  const dataUrl = evalResult.result?.result?.value;
  if (dataUrl && dataUrl.startsWith('data:image/webp;base64,')) {
    const base64 = dataUrl.replace(/^data:image\/webp;base64,/, '');
    const outPath = path.join(rootDir, 'public', 'images', 'hero-poster.webp');
    const buf = Buffer.from(base64, 'base64');
    fs.writeFileSync(outPath, buf);
    const size = buf.length;
    const kb = (size / 1024).toFixed(1);
    console.log(`Generated: public/images/hero-poster.webp (${size} bytes, ${kb} KB)`);
    if (size <= 60 * 1024) {
      console.log(`  [PASS] Static poster is within <= 60KB budget!`);
    } else {
      console.warn(`  [WARN] Static poster is ${kb} KB (budget: 60KB)`);
    }
  } else {
    console.error('Failed to extract canvas data URL');
  }

  ws.close();
  browser.kill();
  server.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  process.exit(0);
});
