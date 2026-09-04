/**
 * Real-time screenshot helper for local development.
 *
 * Chrome's --screenshot flag captures with virtual time fast-forwarded, which never
 * lets a requestAnimationFrame-driven scene settle. This drives Chrome over CDP so the
 * page gets real wall-clock time to animate before the capture.
 *
 * Usage: node scripts/shot.mjs <url> <out.png> [waitMs] [width] [height]
 */
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, out, waitMs = '3500', width = '1400', height = '900'] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node scripts/shot.mjs <url> <out.png> [waitMs] [w] [h]');
  process.exit(1);
}

const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9222 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), 'gdp-shot-'));

const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  `--window-size=${width},${height}`,
  '--hide-scrollbars',
  '--no-first-run',
  '--disable-extensions',
  'about:blank',
]);
chrome.stderr.on('data', () => {});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function targets() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page;
    } catch {
      /* chrome not up yet */
    }
    await sleep(200);
  }
  throw new Error('Chrome did not start');
}

const page = await targets();
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();

ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  }
});
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const msgId = ++id;
    pending.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url });
await sleep(Number(waitMs));

// Optional probe, for checking live DOM/scene state at capture time.
if (process.env.EVAL) {
  const probe = await send('Runtime.evaluate', {
    expression: process.env.EVAL,
    returnByValue: true,
    awaitPromise: true,
  });
  console.log(JSON.stringify(probe.result?.value ?? probe, null, 2));
}

// CLIP=w,h captures an exact pixel box regardless of window chrome — used for the
// fixed-size social card and icons.
const clip = process.env.CLIP?.split(',').map(Number);
const { data } = await send('Page.captureScreenshot', {
  format: 'png',
  ...(clip
    ? { clip: { x: 0, y: 0, width: clip[0], height: clip[1], scale: 1 }, captureBeyondViewport: true }
    : {}),
});
writeFileSync(out, Buffer.from(data, 'base64'));
console.log(`wrote ${out}`);

ws.close();
chrome.kill();
process.exit(0);
