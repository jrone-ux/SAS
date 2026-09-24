// Renders a section inside a simulated GHL row (max-width:1170px; margin:0 auto)
// at several viewport widths and checks: full-bleed width, no horizontal scroll,
// no text overflow, reveal animation completes. Saves screenshots.
//
// Usage: node tools/test-section.mjs output/sas-team-stats.html [more files...]

import { createRequire } from 'module';
import { readFileSync, mkdirSync } from 'fs';
import { basename, resolve } from 'path';
import { execSync } from 'child_process';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(resolve(execSync('npm root -g').toString().trim(), 'playwright')); }

const WIDTHS = [2560, 1920, 1440, 1024, 820, 390, 360, 320];
const SHOT_DIR = resolve('output/screenshots');
mkdirSync(SHOT_DIR, { recursive: true });

const files = process.argv.slice(2);
if (!files.length) { console.error('Pass at least one section file.'); process.exit(2); }

const page_html = (snippet) => `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin:0; background:#000; font-family: Inter, Arial, sans-serif; }
  .ghl-row { max-width:1170px; margin:0 auto; padding:0 15px; }
  .ghl-filler { height:400px; color:#333; }
</style></head><body>
<div class="ghl-row"><div class="ghl-filler">GHL row above</div></div>
<div class="ghl-row"><div class="ghl-col">${snippet}</div></div>
<div class="ghl-row"><div class="ghl-filler">GHL row below</div></div>
</body></html>`;

const browser = await playwright.chromium.launch();
let failures = 0;

for (const file of files) {
  const snippet = readFileSync(file, 'utf8');
  const name = basename(file, '.html');
  const rootId = (snippet.match(/<section[^>]*\sid="([^"]+)"/) || [])[1];
  console.log(`\n=== ${file} (#${rootId}) ===`);

  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    // The GHL image CDN is not reachable from the test machine: serve a grey
    // placeholder at each <img>'s declared width/height instead.
    await page.route(/filesafe\.space|leadconnectorhq|msgsndr|ytimg/, async (route) => {
      const m = snippet.match(new RegExp('src="' + route.request().url().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[^>]*?width="(\\d+)"[^>]*?height="(\\d+)"'));
      const [w, h] = m ? [m[1], m[2]] : [800, 600];
      await route.fulfill({ contentType: 'image/svg+xml',
        body: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#2a2a2a"/><text x="50%" y="50%" fill="#777" font-size="40" text-anchor="middle" font-family="Arial">image ${w}x${h}</text></svg>` });
    });
    await page.setContent(page_html(snippet), { waitUntil: 'load' });

    await page.locator('#' + rootId).scrollIntoViewIfNeeded();
    // Scroll through the section so every reveal item intersects.
    await page.evaluate(async (id) => {
      const el = document.getElementById(id);
      const top = el.getBoundingClientRect().top + scrollY;
      for (let y = top - 200; y < top + el.offsetHeight; y += 200) {
        scrollTo(0, y); await new Promise(r => setTimeout(r, 60));
      }
      el.scrollIntoView({ block: 'start' });
    }, rootId);
    await page.waitForTimeout(1600);

    const r = await page.evaluate((id) => {
      const root = document.getElementById(id);
      const rect = root.getBoundingClientRect();
      const overflow = [];
      root.querySelectorAll('*').forEach((el) => {
        const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        if (!hasText || el.getClientRects().length === 0) return;  // skip hidden (display:none)
        // Content inside an intentional sideways scroller (e.g. a wide table) is fine.
        for (let p = el.parentElement; p && p !== root; p = p.parentElement) {
          const ox = getComputedStyle(p).overflowX;
          if (ox === 'auto' || ox === 'scroll') return;
        }
        const b = el.getBoundingClientRect();
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== 'visible')
          overflow.push(`${el.className || el.tagName}: scrollWidth ${el.scrollWidth} > ${el.clientWidth}`);
        if (b.left < -1 || b.right > innerWidth + 1)
          overflow.push(`${el.className || el.tagName}: outside viewport (${b.left|0}..${b.right|0})`);
        const card = el.parentElement && el.parentElement.closest('[class*="-card"]');
        if (card) {
          const c = card.getBoundingClientRect();
          if (b.left < c.left - 1 || b.right > c.right + 1)
            overflow.push(`${el.className || el.tagName}: wider than its card`);
        }
      });
      const hidden = [...root.querySelectorAll('.sas-reveal, .sas-anim')].filter(e => getComputedStyle(e).opacity !== '1').length;
      return {
        left: rect.left, width: rect.width, vw: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        overflow, hidden,
        h1: document.querySelectorAll('h1').length,
      };
    }, rootId);

    const checks = [
      ['full width', Math.abs(r.left) < 1 && Math.abs(r.width - r.vw) < 1, `left=${r.left} width=${r.width}`],
      ['no h-scroll', r.scrollWidth === r.vw, `scrollWidth=${r.scrollWidth}`],
      ['no text overflow', r.overflow.length === 0, r.overflow.join('; ')],
      ['reveal done', r.hidden === 0, `${r.hidden} still hidden`],
      ['no JS errors', errors.length === 0, errors.join('; ')],
    ];
    const bad = checks.filter(c => !c[1]);
    failures += bad.length;
    console.log(`${String(width).padStart(4)}px  ${bad.length ? 'FAIL' : 'ok  '}  ` +
      (bad.length ? bad.map(c => `${c[0]} (${c[2]})`).join(' | ') : `vw=${r.vw} scrollWidth=${r.scrollWidth}`));

    await page.locator('#' + rootId).screenshot({ path: `${SHOT_DIR}/${name}-${width}.png` });
    await page.close();
  }
}

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
