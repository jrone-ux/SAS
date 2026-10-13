// Renders scene.html frame-by-frame in headless Chromium (WebGL via SwiftShader).
//   node render.mjs                       -> all 900 frames into frames/, 4 workers
//   node render.mjs --stills 0,3.5,20     -> preview stills (frames/still_<t>.png)
//   node render.mjs --from 0 --to 300     -> a frame range
// Needs Playwright's Chromium (PLAYWRIGHT_BROWSERS_PATH) and `npm install`.
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30, DURATION = 30, TOTAL = FPS * DURATION;
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const out = path.join(here, 'frames');
mkdirSync(out, { recursive: true });

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto('file://' + path.join(here, 'scene.html'));
  await page.waitForFunction('window.READY === true', null, { timeout: 120000 });
  return page;
}
async function shot(page, t, file) {
  await page.evaluate((tt) => window.renderAt(tt), t);
  await page.screenshot({ path: file, type: 'png', timeout: 300000, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
}

const launch = () => chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files', '--ignore-gpu-blocklist'],
});
const browser = await launch();
const stills = opt('--stills');
if (stills) {
  const page = await openPage(browser);
  for (const s of stills.split(',').map(Number)) {
    // warm up previous frames for smoothed camera tracking
    await shot(page, s, path.join(out, `still_${s.toFixed(2)}.png`));
    console.log('still', s);
  }
} else {
  const from = Number(opt('--from', 0)), to = Number(opt('--to', TOTAL));
  const workers = Number(opt('--workers', 4));
  const todo = [];
  for (let f = from; f < to; f++) if (!existsSync(path.join(out, `f_${String(f).padStart(4, '0')}.png`)) || args.includes('--force')) todo.push(f);
  console.log(`rendering ${todo.length} frames with ${workers} workers`);
  const t0 = Date.now(); let done = 0;
  // each worker renders a contiguous chunk so the camera smoothing stays continuous
  const chunks = Array.from({ length: workers }, (_, i) => todo.slice(Math.floor(i * todo.length / workers), Math.floor((i + 1) * todo.length / workers)));
  await Promise.all(chunks.map(async (chunk) => {
    if (!chunk.length) return;
    const b = await launch(); // one browser (GPU process) per worker
    const page = await openPage(b);
    // prime the tracking camera with a few frames before the chunk starts
    for (let k = Math.max(0, chunk[0] - 20); k < chunk[0]; k++) await page.evaluate((tt) => window.renderAt(tt), k / FPS);
    for (const f of chunk) {
      await shot(page, f / FPS, path.join(out, `f_${String(f).padStart(4, '0')}.png`));
      if (++done % 30 === 0) console.log(`${done}/${todo.length}  ${((Date.now() - t0) / done).toFixed(0)} ms/frame`);
    }
    await b.close();
  }));
}
await browser.close();
