// Exports an outro page (outro/<name>.html) to a 1080x1920 (9:16) MP4, frame by frame.
//
// Usage: node outro/render-outro.mjs [name] [fps]   (default: sas-outro 30)
// e.g.   node outro/render-outro.mjs sas-outro-v2
// Output: outro/<name>.mp4 and outro/<name>-poster.png
// Needs: ffmpeg on PATH and Playwright (local or global).

import { createRequire } from 'module';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { spawn, execSync } from 'child_process';
import { dirname, extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(resolve(execSync('npm root -g').toString().trim(), 'playwright')); }

const DIR = dirname(fileURLToPath(import.meta.url));
const NAME = process.argv[2] || 'sas-outro';
const FPS = Number(process.argv[3]) || 30;
const TYPES = { '.html': 'text/html', '.png': 'image/png' };

// Serve the folder over http so the CSS logo mask loads (file:// blocks it).
const server = createServer(async (req, res) => {
  try {
    const file = join(DIR, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(`http://localhost:${port}/${NAME}.html?export`);
await page.evaluate(() => window.SAS_OUTRO.ready);
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].every(i => i.complete));

const duration = await page.evaluate(() => window.SAS_OUTRO.duration);
const frames = Math.round(duration * FPS);

const ffmpeg = spawn('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  join(DIR, `${NAME}.mp4`),
], { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((ok, fail) => ffmpeg.on('close', c => c ? fail(new Error('ffmpeg ' + c)) : ok()));

const stage = page.locator('#stage');
const poster = await page.evaluate(() => window.SAS_OUTRO.poster ?? 4.4);
for (let f = 0; f < frames; f++) {
  await page.evaluate(t => window.SAS_OUTRO.render(t), f / FPS);
  const png = await stage.screenshot({ type: 'png' });
  if (!ffmpeg.stdin.write(png)) await new Promise(r => ffmpeg.stdin.once('drain', r));
  if (f % FPS === 0) process.stdout.write(`frame ${f}/${frames}\r`);
}
ffmpeg.stdin.end();
await done;

// Still of the fully built end card (handy as a thumbnail).
await page.evaluate(t => window.SAS_OUTRO.render(t), poster);
await stage.screenshot({ path: join(DIR, `${NAME}-poster.png`) });

await browser.close();
server.close();
console.log(`\nWrote ${NAME}.mp4 (${frames} frames @ ${FPS}fps) and ${NAME}-poster.png`);
