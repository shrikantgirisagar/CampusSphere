// scripts/generate-webp-images.js
// Generate responsive WebP versions of campus-students.jpg (480, 768, 1200px widths)

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
  console.error('Chrome not found to convert WebP images.');
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '..');
const srcImage = path.join(rootDir, 'public', 'campus-students.jpg');

if (!fs.existsSync(srcImage)) {
  console.error('Source image not found:', srcImage);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (req.url === '/image') {
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    fs.createReadStream(srcImage).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html><html><body><img id="img" src="/image" /></body></html>`);
  }
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const debugPort = 9488;
  const tmpDir = path.join(os.tmpdir(), 'cs_webp_' + Date.now());

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

  // Wait for image to load
  await new Promise(r => setTimeout(r, 600));

  const widths = [480, 768, 1200];
  for (const w of widths) {
    const evalResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const img = document.getElementById('img');
          const aspect = img.naturalHeight / img.naturalWidth;
          const h = Math.round(${w} * aspect);
          const canvas = document.createElement('canvas');
          canvas.width = ${w};
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, ${w}, h);
          return canvas.toDataURL('image/webp', 0.85);
        })()
      `,
      returnByValue: true
    });

    const dataUrl = evalResult.result?.result?.value;
    if (dataUrl && dataUrl.startsWith('data:image/webp;base64,')) {
      const base64 = dataUrl.replace(/^data:image\/webp;base64,/, '');
      const outPath = path.join(rootDir, 'public', `campus-students-${w}.webp`);
      fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
      console.log(`Generated: public/campus-students-${w}.webp (${fs.statSync(outPath).size} bytes)`);
    } else {
      console.error(`Failed to generate ${w}px WebP`);
    }
  }

  ws.close();
  browser.kill();
  server.close();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  console.log('WebP generation complete!');
});
