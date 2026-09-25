# SAS GHL Section Guide — paste this at the start of a new chat

You are converting sections of my GoHighLevel (GHL) website. Each section is a
standalone HTML/CSS/JS snippet pasted into ONE GHL "Custom Code" element.
Rewrite every section I paste so the whole site shares ONE design system, ONE
font system, ONE animation style, loads fast, and works on every screen width.

**Always reply with the FULL finished code** (HTML + one `<style>` + optional one
`<script>`), ready to paste. Then a short plain-language list of what changed.
If a GitHub repo is available, the work lives in `jrone-ux/SAS`, branch
`claude/ghl-design-system-standardize-xy6ftp` (`output/` = finished sections).

---

## 1. Hard rules

1. **Never change visible wording, links, URLs or images.** Keep every `href`,
   `target`, `rel` and image `src` exactly as it is.
2. SEO ideas that would change wording are **not applied** — list them separately
   (file, current text, suggested text, why).
3. Each file stays self-contained: HTML + one `<style>` + optional one `<script>`.
4. Scope ALL CSS to the section's unique id (`#sas-name .sas-name-title`).
   Every section gets a unique id `sas-<name>` and class prefix `sas-<name>-`.
5. Never style global selectors (`html, body, h1, p, a, img`) unscoped.
6. **Top/bottom padding is always 0** (`--sas-section-y: 0px`). I add spacing in GHL.
   Keep the left/right gutter.
7. **Background is pure black** (`#000`). No grid lines, no ambient glows, no
   blurred decorative blobs.
8. **No `backdrop-filter`** and no `filter: blur()` decorations (slow, invisible on black).
9. No external libraries (no jQuery, GSAP, AOS). Vanilla JS only, only when needed.
   No font `<link>`s — Inter is loaded site-wide.

---

## 2. Design tokens (declare on EVERY section's root id, identical values)

```css
#sas-name {
    /* Colours */
    --sas-bg: #000000;
    --sas-surface: rgba(15,15,15,0.9);
    --sas-gold: #D6A743;
    --sas-gold-hover: #E2B85A;
    --sas-white: #FFFFFF;
    --sas-muted: #AAAAAA;
    --sas-border: rgba(255,255,255,0.08);

    /* Type */
    --sas-font: "Inter", Arial, Helvetica, sans-serif;
    --sas-fs-eyebrow: 13px;                              /* 12px at ≤600px */
    --sas-fs-h1: clamp(38px, 3.6vw + 14px, 64px);
    --sas-fs-h2: clamp(30px, 2.4vw + 14px, 48px);
    --sas-fs-h3: clamp(20px, 0.8vw + 14px, 24px);
    --sas-fs-body: clamp(16px, 0.25vw + 15px, 18px);
    --sas-fs-small: 15px;
    --sas-fs-btn: 15px;

    /* Layout — same side spacing as the header & footer */
    --sas-gutter: clamp(20px, 4vw, 64px);                /* 16px at ≤480px */
    --sas-max: 1440px;
    --sas-section-y: 0px;               /* top/bottom spacing is set in GHL */

    /* Motion */
    --sas-ease: cubic-bezier(0.22, 1, 0.36, 1);
    --sas-dur: 0.8s;
}
```

Mobile overrides are done by changing the token, not the property:
```css
@media (max-width: 600px) { #sas-name { --sas-fs-eyebrow: 12px; } }
@media (max-width: 480px) { #sas-name { --sas-gutter: 16px; } }
```

---

## 3. Section root + container (copy exactly)

```css
#sas-name {
    position: relative;

    /* BREAK OUT OF THE GHL ROW / COLUMN */
    width: 100vw !important;
    max-width: 100vw !important;
    left: 50%;
    right: 50%;
    margin: 0 -50vw !important;

    padding: var(--sas-section-y) var(--sas-gutter);

    overflow-x: clip;          /* clip sideways only, so card shadows aren't cut */

    background: var(--sas-bg);
    color: var(--sas-white);

    font-family: var(--sas-font);
    -webkit-font-smoothing: antialiased;

    box-sizing: border-box;
}

#sas-name *,
#sas-name *::before,
#sas-name *::after {
    box-sizing: border-box;
}

#sas-name .sas-name-inner {
    width: 100%;
    max-width: var(--sas-max);
    margin: 0 auto;
}
```

Grids use `repeat(N, minmax(0, 1fr))` and every grid/flex child gets `min-width: 0`.

---

## 4. Typography

| Element | Tag | Size | Weight | Line-height | Other |
|---|---|---|---|---|---|
| Eyebrow | `<p>` | `--sas-fs-eyebrow` | 800 | 1.3 | uppercase, letter-spacing 3px, gold, no decorative line |
| Page title | `<h1>` (only in the page's first section) | `--sas-fs-h1` | 900 | 1.05 | letter-spacing -0.035em, `text-wrap: balance` |
| Section title | `<h2>` | `--sas-fs-h2` | 900 | 1.1 | letter-spacing -0.03em, `text-wrap: balance` |
| Card title | `<h3>` | `--sas-fs-h3` | 800 | 1.25 | |
| Body / intro | `<p>` | `--sas-fs-body` | 400 | 1.7 | muted, `max-width: 65ch` |
| Small text, lists, answers | | `--sas-fs-small` (15px) | 400–500 | 1.5–1.75 | muted |
| Big stat numbers | `<p>` (not headings) | `--sas-fs-h2` | 900 | 1 | gold |

- Gold accent words in headings: `<span>` with `display:block; color: var(--sas-gold)`
  (keep the existing ones, never add new).
- Never `white-space: nowrap` on headings. To keep a pair of words together
  (e.g. "40-Hour") wrap just those words in a nowrap span.
- Mobile text is never larger than desktop — no separate mobile font sizes; the
  clamp tokens handle it. Nothing below 11px.
- Exactly ONE `<h1>` per page (in the first section). Everything else `<h2>`/`<h3>`.
- Headings get an `id` and the `<section>` gets `aria-labelledby` pointing to it.
  If a section has no visible title, use `aria-label` instead (don't add visible text).

---

## 5. Components (identical everywhere)

**Card (SAS standard)**
```css
.card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 28px;                 /* 24px ≤600px, 20px ≤480px */
    background:
        linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 38%, rgba(0,0,0,0.20) 100%),
        rgba(10,10,10,0.62);
    box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.06),
        inset 0 -1px 0 rgba(255,255,255,0.015),
        0 25px 70px rgba(0,0,0,0.30);
    transition: transform 0.35s var(--sas-ease), border-color 0.35s ease;
}
.card::before {                          /* soft top highlight */
    content: ""; position: absolute; top: 0; left: 0; z-index: 1;
    width: 100%; height: 42%; pointer-events: none;
    background: linear-gradient(180deg, rgba(255,255,255,0.035), transparent);
}
.card > * { position: relative; z-index: 2; }
.card:hover { transform: translateY(-4px); border-color: rgba(214,167,67,0.22); }
```
- If something must hide behind the card (e.g. a connecting line) or it's a flip
  card, use solid `#060606` instead of `rgba(10,10,10,0.62)` (looks identical on black).
- No extra hover glows, no background change on hover, no blur.
- On phones (≤600px) turn off hover lifts: `transform: none`.

**Primary button** — gold bg, black text, pill `border-radius: 999px`,
`min-height: 54px`, `padding: 0 28px`, 15px/800, hover `translateY(-2px)` +
`--sas-gold-hover`. Not uppercase, no shine sweep.

**Secondary button** — `--sas-surface` bg, `1px solid var(--sas-border)`, white
text; hover gold text + border `rgba(214,167,67,0.35)`.

**Buttons on mobile (≤600px)** — `width: 100%; max-width: 380px;`, stacked.

**Text link with arrow** — muted, 15px/700, `min-height: 44px`, hover gold +
`translateX(3px)`. Arrow `<span aria-hidden="true">→</span>`.

**Focus** — every link/button: `:focus-visible { outline: 2px solid var(--sas-gold); outline-offset: 3px; }`

**Icons** — SVG with `aria-hidden="true" focusable="false"`, colour via
`stroke="currentColor"`/`fill` + CSS `color: var(--sas-gold)`.

**Check bullets (✓)** — `<span aria-hidden="true">✓</span>` inside a gold-tinted circle.

**Lists of cards/features/steps** — `<ul>`/`<li>` (steps in order → `<ol>`).
Reset with `list-style:none; margin:0; padding:0`.

---

## 6. Breakpoints (use only these)

- **1100px** laptop — reduce columns (e.g. 5→3, 4→2, 3→2 with last card full width)
- **860px** tablet — multi-column layouts stack to 1 column (small cards like
  steps/videos may stay 2 columns); centre text where it looks right;
  remove card stagger delays (`--sas-delay: 0s !important` on items)
- **600px** mobile — eyebrow 12px, buttons full width max 380px, radius 24px,
  no hover lifts, cards stack to 1 column
- **480px** small mobile — gutter 16px, radius 20px, slightly less card padding

Must work with no horizontal scroll from 320px to 2560px.

---

## 7. Animation (SAS standard)

- Fade up 24px, 0.8s, `var(--sas-ease)`, stagger 0.08s:
  eyebrow 0s → heading 0.08s → text 0.16s → buttons/cards 0.24s, 0.32s, …
- Images may fade in + `scale(0.98)` instead.
- Only animate `opacity` and `transform` — never width/height/top/left/max-height/filter.
- **First section of a page (hero):** CSS keyframes on page load.
- **All other sections:** scroll reveal with this exact pattern (content stays visible if JS fails):

```css
#sas-name.sas-js-reveal .sas-reveal {
    opacity: 0;
    transform: translate3d(0,24px,0);
    transition: opacity var(--sas-dur) var(--sas-ease), transform var(--sas-dur) var(--sas-ease);
    transition-delay: var(--sas-delay, 0s);
}
#sas-name.sas-js-reveal .sas-reveal.is-visible { opacity: 1; transform: none; }
```
```html
<script>
(function(){
  var root = document.getElementById('sas-name');
  if (!root || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.classList.add('sas-js-reveal');
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  root.querySelectorAll('.sas-reveal').forEach(function(el){ io.observe(el); });
})();
</script>
```
- Put `class="sas-reveal" style="--sas-delay: 0.08s;"` on items.
- Put `.sas-reveal` on a **wrapper** (`<li>`), not on the card that has a hover
  effect — otherwise the reveal delay slows the hover.
- Always include `@media (prefers-reduced-motion: reduce)` that turns off
  transitions/animations and hover transforms and forces `.sas-reveal` visible.

---

## 8. Interactive patterns (lessons learned)

- **Accordion / FAQ:** native `<details name="sas-x"><summary>…</summary>…</details>`
  (works without JS, one open at a time). Answer fades in with a keyframe
  (opacity + translateY). Plus→minus icon: rotate **180°** and fade the vertical bar.
  Add a tiny `toggle` listener as fallback for browsers without `details[name]`.
- **Flip cards:** 3D flip **only** in `@media (hover: hover) and (min-width: 861px)`.
  Everywhere else (phones, tablets, touch) **cross-fade** the faces with
  opacity/visibility — never leave `rotateY(180deg)` on the back face outside the
  desktop media query (it shows mirrored text on phones). Both faces share one grid
  cell (`grid-area: 1/1`) so the card fits its content — no fixed heights.
  Use a real `<button>` to flip; move focus to the visible face in cross-fade mode.
  Faces: `isolation: isolate`, highlight `::before` at `z-index: -1`, no z-index on
  children (Safari backface bug).
- **Video pop-up (modal):** native `<dialog>` + `showModal()` (always on top, even
  inside GHL rows with transforms). Style: `width: min(900px, calc(100vw - 40px));
  margin: auto; padding-top: 56px` (room for the × above the video); darken with
  `::backdrop` only (no extra overlay div). Inject the `<iframe>` on click
  (youtube-nocookie.com, `?autoplay=1&rel=0`), remove it on the `close` event
  (stops the video), return focus to the button, close on click outside
  (`e.target === dialog`). No inline `onclick`, no global functions.
- **Auto slideshows:** ALWAYS auto-advance (every 2.5s) — also with the mouse over
  it and for reduce-motion users (they get a fade only, no zoom/slide). Pause only
  when off screen (IntersectionObserver), tab hidden, keyboard focus inside, or the
  visitor presses the icon pause/play `<button>` (with `aria-label`). Only animate
  opacity/transform. Never `will-change` on many images.
- **`:has()`** rules go in their own rule block so unsupported browsers skip only that rule.
- **Wide tables:** keep in a card, table in a wrapper with `overflow-x: auto`,
  `role="region" tabindex="0" aria-labelledby`, "Swipe to compare" hint only ≤860px,
  row names as `<th scope="row">`.
- **Clickable things:** `<a>` for navigation, `<button>` for actions, never clickable divs.

---

## 9. Images & video

- First-screen (hero) image: `loading="eager" fetchpriority="high" decoding="async"`.
- All other images: `loading="lazy" decoding="async"`.
- Every `<img>` has `width` + `height` (real ratio, or a sensible estimate) and CSS
  `width:100%; height:auto` (or `object-fit: cover` inside a fixed-ratio box).
- Meaningful `alt`; decorative images `alt="" aria-hidden="true"`.
- YouTube **iframes** → click-to-play facade (`https://i.ytimg.com/vi/<ID>/hqdefault.jpg`,
  youtube-nocookie.com embed on click). YouTube **links** stay links (don't change hrefs).
- Self-hosted `<video>`: `preload="none"`, `poster`, `playsinline`; background video
  also `muted loop` and paused off-screen.
- Other iframes (forms, calendars, maps): `loading="lazy"`, `width:100%`.
- Large PNG/JPG photos → note in SEO suggestions: re-upload as WebP under ~200 KB.

---

## 10. Accessibility checklist

- `<section id="sas-name" aria-labelledby="sas-name-title">`
- Decorative icons, numbers ("01"), browser-dots, status badges → `aria-hidden="true"`
- External links with `target="_blank"` keep their existing `rel`
- Tap targets at least 44px tall
- Text contrast: body never darker than `#AAAAAA` on black

---

## 11. Testing (when a browser is available)

Render each section inside `<div style="max-width:1170px;margin:0 auto">` at
2560, 1920, 1440, 1024, 820, 390, 360 and 320px wide. Confirm: section spans the
full viewport, `document.documentElement.scrollWidth === viewport width`, no text
spills out or gets cut off, reveal animation finishes. Screenshot and look at them.
Also test interactive parts (flip, accordion) with mouse, touch and keyboard.

---

## 12. Reply format

1. Full code in one block, ready to paste into GHL.
2. "What changed" — short bullets in plain language (no jargon).
3. SEO notes (wording ideas, image-format tips) — suggestions only, never applied.
