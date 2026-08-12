# korbold.vercel.app Product-First Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage so an Upwork client sees real shipped apps in the first screen, backed by clickable store links, across six sections instead of ten.

**Architecture:** Astro v6 static site, no UI framework, CSS custom properties. Homepage components are swapped one at a time in `src/pages/index.astro`. App screenshots move from `public/upwork-portfolio/` into `src/assets/apps/` so `astro:assets` can emit AVIF/WebP with `srcset`. Verification runs as assertions against the built `dist/index.html` via a dependency-free Node script, since the repo has no test runner.

**Tech Stack:** Astro 6.4.6, TypeScript, plain CSS with custom properties, `astro:assets` (sharp already installed), Node >= 22.12.

**Spec:** `docs/superpowers/specs/2026-08-11-korbold-site-redesign-design.md`

## Global Constraints

- No new runtime dependencies. No UI framework. The site stays zero-JS-framework.
- Keep the EN/ES toggle. Every new user-facing string gets both an `en` and an `es` entry in `src/i18n/translations.ts`. Default language is EN.
- Markdown case-study content stays in English; Spanish variants go in the `*Es` frontmatter fields already defined in `src/content.config.ts`.
- The published-app count must be derived by counting distinct apps behind the store URLs — not copied from the current "9 apps shipped" text — and the same number must appear everywhere it is stated.
- Never invent a metric, a review, a rating, or a store URL. If a fact is unavailable, omit the element rather than filling it.
- Reuse the existing tokens in `src/styles/variables.css`. Do not introduce a parallel color or spacing scale.
- Run `npm run build` before every commit; it must exit 0.

---

### Task 1: Build-assertion harness and the reveal fix

The site currently renders black below the hero whenever JavaScript fails, because 45 of 51 `.reveal` elements sit at `opacity: 0` waiting for IntersectionObserver. This task adds the verification harness and uses it to drive the first fix.

**Files:**
- Create: `scripts/check-build.mjs`
- Modify: `package.json` (scripts block)
- Modify: `src/layouts/BaseLayout.astro:93-102` (inline head script)
- Modify: `src/styles/animations.css:2-13`

**Interfaces:**
- Produces: `scripts/check-build.mjs`, run via `npm run check`. It reads `dist/index.html` and `dist/_astro/*.css` and exits non-zero with a readable message on the first failed assertion. Later tasks append assertions to the `CHECKS` array; each entry is `{ name: string, run: (ctx) => void }` where `ctx` is `{ html: string, css: string }` and a check signals failure by throwing an `Error`.

- [ ] **Step 1: Write the failing check**

Create `scripts/check-build.mjs`:

```js
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const css = readdirSync(join(DIST, '_astro'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync(join(DIST, '_astro', f), 'utf8'))
  .join('\n');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const CHECKS = [
  {
    name: 'reveal degrades gracefully without JS',
    run: ({ html, css }) => {
      assert(
        /document\.documentElement\.classList\.add\(['"]js['"]\)/.test(html),
        'no inline head script adds the `js` class to <html>'
      );
      assert(
        /html\.js\s+\.reveal\s*\{/.test(css),
        '`.reveal` must be scoped to `html.js` so it stays visible without JS'
      );
      assert(
        !/(^|\})\s*\.reveal\s*\{[^}]*opacity:\s*0/.test(css),
        'unscoped `.reveal` still sets opacity: 0 — the page goes black without JS'
      );
    },
  },
];

let failed = 0;
for (const check of CHECKS) {
  try {
    check.run({ html, css });
    console.log(`  ok   ${check.name}`);
  } catch (error) {
    failed++;
    console.error(`  FAIL ${check.name}\n       ${error.message}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log(`\n${CHECKS.length} check(s) passed`);
```

Add to the `scripts` block in `package.json`:

```json
"check": "node scripts/check-build.mjs"
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `npm run build && npm run check`
Expected: FAIL — `no inline head script adds the `js` class to <html>`

- [ ] **Step 3: Add the `js` class in the head script**

In `src/layouts/BaseLayout.astro`, inside the existing `<script is:inline>` block, add the class before the language logic so it runs as early as possible:

```js
document.documentElement.classList.add('js');
```

- [ ] **Step 4: Scope the reveal styles to `html.js`**

Replace the first rule in `src/styles/animations.css` so hiding only happens when JS is running:

```css
/* Scroll reveal — only hides when JS is present to un-hide it */
html.js .reveal {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 600ms var(--ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
    transform 600ms var(--ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1));
}

html.js .reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

Leave the `.reveal-delay-*` rules and the `prefers-reduced-motion` block as they are, but add `html.js` in front of `.reveal` inside the reduced-motion block so the selectors keep matching specificity:

```css
@media (prefers-reduced-motion: reduce) {
  html.js .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
```

- [ ] **Step 5: Run the check to verify it passes**

Run: `npm run build && npm run check`
Expected: PASS — `1 check(s) passed`

- [ ] **Step 6: Verify in a real browser with JS disabled**

Run: `npm run preview`, open the site, disable JavaScript in DevTools, hard-reload.
Expected: every section is readable. Before this fix the page was black below the hero.

- [ ] **Step 7: Commit**

```bash
git add scripts/check-build.mjs package.json src/layouts/BaseLayout.astro src/styles/animations.css
git commit -m "fix: keep content visible when JavaScript fails

Scroll-reveal hid 45 of 51 elements behind IntersectionObserver, so any JS
failure rendered the page black below the hero. Hiding is now scoped to
html.js, which only exists once the inline head script runs.

Adds scripts/check-build.mjs as the assertion harness for this redesign."
```

---

### Task 2: Move app screenshots into `src/assets` and build the hero mosaic

**Files:**
- Create: `src/assets/apps/` (moved image files)
- Rewrite: `src/components/Hero.astro`
- Modify: `src/i18n/translations.ts` (hero keys, both languages)
- Modify: `scripts/check-build.mjs` (append a check)

**Interfaces:**
- Consumes: `npm run check` harness from Task 1.
- Produces: `src/assets/apps/{turnly,spectrum,akiclub-ss,sportyeah,revo}-1.{jpg,png}`, imported by `Hero.astro`. Later tasks import from the same directory.

- [ ] **Step 1: Write the failing check**

Append to the `CHECKS` array in `scripts/check-build.mjs`:

```js
  {
    name: 'hero renders 5 optimized app screenshots',
    run: ({ html }) => {
      const hero = html.split('</section>')[0];
      const imgs = hero.match(/<img[^>]*>/g) || [];
      assert(imgs.length === 5, `hero has ${imgs.length} <img> tags, expected 5`);
      assert(
        imgs.every((img) => /srcset=/.test(img)),
        'every hero image must ship a srcset — import it via astro:assets, not a /public path'
      );
      assert(
        imgs.filter((img) => /fetchpriority="high"/.test(img)).length === 1,
        'exactly one hero image must carry fetchpriority="high" for LCP'
      );
      assert(
        !/danny\.jpg/.test(hero),
        'the portrait belongs in the How I work section, not the hero'
      );
    },
  },
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `npm run build && npm run check`
Expected: FAIL — the hero still renders the portrait, not five screenshots.

- [ ] **Step 3: Move the screenshots into `src/assets`**

```bash
mkdir -p src/assets/apps
git mv public/upwork-portfolio/turnly-1.jpg src/assets/apps/turnly-1.jpg
git mv public/upwork-portfolio/spectrum-1.jpg src/assets/apps/spectrum-1.jpg
git mv public/upwork-portfolio/akiclub-ss-1.png src/assets/apps/akiclub-ss-1.png
git mv public/upwork-portfolio/sportyeah-1.png src/assets/apps/sportyeah-1.png
git mv public/upwork-portfolio/revo-1.png src/assets/apps/revo-1.png
```

`public/upwork-portfolio/` is untracked, so if `git mv` errors use plain `mv` and `git add src/assets/apps`.

- [ ] **Step 4: Rewrite the hero**

Replace `src/components/Hero.astro` entirely. The mosaic sits behind a gradient veil with the copy overlaid; the center image is the LCP candidate. The portrait is gone — it moves to How I work in Task 6.

```astro
---
import { Image } from 'astro:assets';
import turnly from '../assets/apps/turnly-1.jpg';
import spectrum from '../assets/apps/spectrum-1.jpg';
import akiclub from '../assets/apps/akiclub-ss-1.png';
import sportyeah from '../assets/apps/sportyeah-1.png';
import revo from '../assets/apps/revo-1.png';

// Center image (index 2) is the LCP candidate and loads eagerly.
const shots = [
  { src: revo, alt: 'REVO Rideshare app' },
  { src: spectrum, alt: 'Spectrum Aesthetics app' },
  { src: turnly, alt: 'Turnly booking app' },
  { src: akiclub, alt: 'AkiClub loyalty app' },
  { src: sportyeah, alt: 'SportYeah app' },
];
---

<section class="hero">
  <div class="hero__mosaic" aria-hidden="false">
    {shots.map((shot, i) => (
      <div class="hero__phone" data-pos={i}>
        <Image
          src={shot.src}
          alt={shot.alt}
          widths={[160, 240, 320]}
          sizes="(max-width: 700px) 30vw, 200px"
          format="avif"
          loading={i === 2 ? 'eager' : 'lazy'}
          fetchpriority={i === 2 ? 'high' : 'auto'}
        />
      </div>
    ))}
  </div>
  <div class="hero__veil" aria-hidden="true"></div>

  <div class="container hero__inner">
    <p class="hero__badge">
      <span class="hero__badge-dot" aria-hidden="true"></span>
      <span data-i18n="hero.badge">Available for new projects</span>
    </p>
    <h1 class="hero__headline" data-i18n="hero.headline">
      Real apps. Real stores. Real users.
    </h1>
    <p class="hero__sub" data-i18n="hero.subheadline">
      Flutter and React Native for founders and product teams who need to ship, not prototype.
    </p>
    <div class="hero__ctas">
      <a href="#cases" class="btn btn-primary" data-i18n="hero.cta.work">See the work</a>
      <a href="#contact" class="btn btn-outline" data-i18n="hero.cta.contact">Start a project</a>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    min-height: min(100vh, 860px);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow: hidden;
    padding-top: var(--navbar-height);
    background: var(--color-bg);
  }

  .hero__mosaic {
    position: absolute;
    inset: var(--navbar-height) 0 auto 0;
    display: flex;
    gap: clamp(0.5rem, 1.5vw, 0.9rem);
    justify-content: center;
    padding-top: clamp(1.5rem, 4vw, 3rem);
  }

  .hero__phone {
    width: clamp(96px, 14vw, 200px);
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid color-mix(in oklch, var(--color-text) 10%, transparent);
    box-shadow: 0 24px 48px -28px rgba(0, 0, 0, 0.8);
  }

  .hero__phone:nth-child(odd) {
    margin-top: clamp(1rem, 3vw, 2.5rem);
  }

  .hero__phone :global(img) {
    display: block;
    width: 100%;
    height: auto;
  }

  /* Below 700px only the middle three phones stay — the outer two are cropped. */
  @media (max-width: 700px) {
    .hero__phone[data-pos="0"],
    .hero__phone[data-pos="4"] {
      display: none;
    }
  }

  .hero__veil {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      color-mix(in oklch, var(--color-bg) 20%, transparent) 0%,
      color-mix(in oklch, var(--color-bg) 88%, transparent) 45%,
      var(--color-bg) 74%
    );
  }

  .hero__inner {
    position: relative;
    z-index: 1;
    text-align: center;
    padding-bottom: clamp(2.5rem, 6vw, 4.5rem);
  }

  .hero__badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 0.4rem 0.85rem;
    margin-bottom: var(--space-lg);
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--color-secondary);
    background: rgba(6, 182, 212, 0.08);
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: var(--radius-full);
  }

  .hero__badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
  }

  .hero__headline {
    font-size: var(--font-size-4xl);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin-bottom: var(--space-md);
    max-width: 18ch;
    margin-inline: auto;
  }

  @media (min-width: 768px) {
    .hero__headline {
      font-size: var(--font-size-5xl);
    }
  }

  .hero__sub {
    font-size: var(--font-size-lg);
    color: var(--color-text-muted);
    max-width: 48ch;
    margin: 0 auto var(--space-xl);
  }

  .hero__ctas {
    display: flex;
    gap: var(--space-md);
    justify-content: center;
    flex-wrap: wrap;
  }
</style>
```

The headline drops the gradient text fill and the glow blob on purpose — both were flagged in the spec as template signals.

- [ ] **Step 5: Update the hero strings in both languages**

In `src/i18n/translations.ts`, replace the four hero values under `en` and their counterparts under `es`. Delete `hero.cta.cv` from both objects — the CV button leaves the hero.

Under `en`:

```ts
    'hero.headline': 'Real apps. Real stores. Real users.',
    'hero.subheadline': 'Flutter and React Native for founders and product teams who need to ship, not prototype.',
    'hero.cta.work': 'See the work',
    'hero.cta.contact': 'Start a project',
    'hero.badge': 'Available for new projects',
```

Under `es`:

```ts
    'hero.headline': 'Apps reales. Stores reales. Usuarios reales.',
    'hero.subheadline': 'Flutter y React Native para fundadores y equipos de producto que necesitan enviar, no prototipar.',
    'hero.cta.work': 'Ver el trabajo',
    'hero.cta.contact': 'Empezar un proyecto',
    'hero.badge': 'Disponible para nuevos proyectos',
```

- [ ] **Step 6: Run the check to verify it passes**

Run: `npm run build && npm run check`
Expected: PASS — `2 check(s) passed`

- [ ] **Step 7: Verify the hero visually at two widths**

Run: `npm run preview`. Look at the hero at 1440px and at 390px.
Expected: five phones at desktop, three at mobile, copy legible over the veil at both, no horizontal scrollbar.

- [ ] **Step 8: Commit**

```bash
git add src/assets/apps src/components/Hero.astro src/i18n/translations.ts scripts/check-build.mjs
git commit -m "feat(hero): lead with shipped app screenshots

The work is now the first thing on the page instead of a portrait and a
gradient headline. Screenshots move into src/assets so astro:assets emits
AVIF with srcset; the center phone is the LCP candidate."
```

---

### Task 3: Hard-proof band replacing Stats

**Files:**
- Create: `src/components/Proof.astro`
- Delete: `src/components/Stats.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/i18n/translations.ts`
- Modify: `scripts/check-build.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks beyond the check harness.
- Produces: `src/components/Proof.astro`, rendering `<section id="proof">`.

- [ ] **Step 1: Establish the real app count**

Run this to list every store URL currently in the content:

```bash
grep -rhoE 'https?://(apps\.apple\.com|play\.google\.com)[^ ")]+' src/content/case-studies/ | sort -u
```

Count **distinct apps**, not URLs: REVO rider and REVO driver each appear on two stores, and AkíClub appears on both. Write the resulting number down — it is used verbatim in this task and must not contradict any other number on the site. Do not reuse the old "9 apps shipped" figure without confirming it against this list.

- [ ] **Step 2: Write the failing check**

Append to `CHECKS` in `scripts/check-build.mjs`:

```js
  {
    name: 'proof band links out to the stores',
    run: ({ html }) => {
      const start = html.indexOf('id="proof"');
      assert(start !== -1, 'no <section id="proof"> on the page');
      const band = html.slice(start, html.indexOf('</section>', start));
      const storeLinks = band.match(/href="https:\/\/(apps\.apple\.com|play\.google\.com)[^"]*"/g) || [];
      assert(
        storeLinks.length >= 4,
        `proof band has ${storeLinks.length} store links, expected at least 4 — store links are the only social proof on the page`
      );
      assert(!/id="stats"/.test(html), 'the old stats section is still rendered');
    },
  },
```

- [ ] **Step 3: Run the check to verify it fails**

Run: `npm run build && npm run check`
Expected: FAIL — `no <section id="proof"> on the page`

- [ ] **Step 4: Create the proof band**

Create `src/components/Proof.astro`. Replace `APP_COUNT` with the number established in Step 1, and keep the logo list to companies whose logo file already exists in `public/logos/`.

```astro
---
// Store links are the page's only third-party validation — they must be
// visibly clickable, not decorative.
const stores = [
  { label: 'En Percha', url: 'https://play.google.com/store/apps/details?id=ec.com.smx.enpercha2' },
  { label: 'Flux', url: 'https://play.google.com/store/apps/details?id=ec.com.smx.flux' },
  { label: 'AkíClub', url: 'https://apps.apple.com/ec/app/supermercados-aki/id6503321015' },
  { label: 'REVO Rideshare', url: 'https://apps.apple.com/ni/app/revo-rideshare/id6476524112' },
  { label: 'Turnly', url: 'https://apps.apple.com/ec/app/turnly/id6767881423' },
  { label: 'SportYeah', url: 'https://play.google.com/store/apps/details?id=com.sportyeah.sportyeah_mobile_app' },
];

const APP_COUNT = 10; // set from Step 1 — must match every other count on the site
---

<section id="proof" class="proof">
  <div class="container proof__inner">
    <dl class="proof__figures">
      <div class="proof__figure">
        <dt data-i18n="proof.users">Active users</dt>
        <dd>16,500+</dd>
      </div>
      <div class="proof__figure">
        <dt data-i18n="proof.apps">Apps published</dt>
        <dd>{APP_COUNT}</dd>
      </div>
      <div class="proof__figure">
        <dt data-i18n="proof.years">Years in production</dt>
        <dd>4+</dd>
      </div>
    </dl>

    <ul class="proof__stores" aria-label="Published apps">
      {stores.map((store) => (
        <li>
          <a href={store.url} target="_blank" rel="noopener noreferrer">
            {store.label}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>
          </a>
        </li>
      ))}
    </ul>
  </div>
</section>

<style>
  .proof {
    border-block: 1px solid var(--color-border);
    padding-block: clamp(1.75rem, 4vw, 2.75rem);
  }

  .proof__inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-xl);
  }

  .proof__figures {
    display: flex;
    gap: clamp(1.5rem, 4vw, 3rem);
    margin: 0;
  }

  .proof__figure dt {
    order: 2;
    font-size: var(--font-size-xs);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .proof__figure dd {
    order: 1;
    margin: 0 0 0.2rem;
    font-size: var(--font-size-2xl);
    font-weight: 650;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  .proof__figure {
    display: flex;
    flex-direction: column;
  }

  .proof__stores {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .proof__stores a {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.7rem;
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    text-decoration: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    transition: color var(--transition), border-color var(--transition);
  }

  .proof__stores a:hover {
    color: var(--color-text);
    border-color: var(--color-accent);
  }
</style>
```

- [ ] **Step 5: Swap it into the page**

In `src/pages/index.astro`, replace the `Stats` import with `Proof` and replace `<Stats />` with `<Proof />`. Then delete the old component:

```bash
git rm src/components/Stats.astro
```

- [ ] **Step 6: Add the proof strings**

Add to `en`:

```ts
    'proof.users': 'Active users',
    'proof.apps': 'Apps published',
    'proof.years': 'Years in production',
```

Add to `es`:

```ts
    'proof.users': 'Usuarios activos',
    'proof.apps': 'Apps publicadas',
    'proof.years': 'Años en producción',
```

Remove the now-unused `stats.*` keys from both objects.

- [ ] **Step 7: Run the check to verify it passes**

Run: `npm run build && npm run check`
Expected: PASS — `3 check(s) passed`

- [ ] **Step 8: Click every store link**

Run: `npm run preview` and open each of the six links.
Expected: each resolves to a live store listing. Remove any link that 404s rather than leaving it in.

- [ ] **Step 9: Commit**

```bash
git add -A src/components src/pages/index.astro src/i18n/translations.ts scripts/check-build.mjs
git commit -m "feat: replace stats with a store-linked proof band

The anonymous numbers become clickable evidence. App count is derived from
the distinct apps behind the store URLs rather than the old copy."
```

---

### Task 4: Case-study data — merge the duplicates, add the missing case

Two separate merges happen here.

`kruger-corp` and `corp-favorita-suite` describe the same client over the same period and currently render as cases 01 and 02, which reads as padding.

**Revised 2026-08-11, mid-execution:** `spectrum-*` and `360io-*` turned out to be *the same App Store screenshot set* — both show 360 Integrations branding over Spectrum Aesthetics content. Danny confirmed they are one engagement: 360 Integrations built the Spectrum Aesthetics portal. So this task creates **one** case study, not two, and the featured set is **four**, not five: `corp-favorita-suite`, `turnly`, `revo-rideshare`, `spectrum-aesthetics`. SportYeah stays in More work. Every count in Tasks 4 and 5 reflects four.

**Files:**
- Modify: `src/content/case-studies/corp-favorita-suite.md`
- Delete: `src/content/case-studies/kruger-corp.md`
- Create: `src/content/case-studies/spectrum-aesthetics.md`
- Modify: `src/content/case-studies/*.md` (`order` and `featured` fields)
- Modify: `src/content.config.ts`

**Interfaces:**
- Consumes: the existing frontmatter schema in `src/content.config.ts`.
- Produces: a `featured: boolean` frontmatter field and a `shots: string[]` field holding screenshot filenames relative to `src/assets/apps/`. Task 5 reads both.

- [ ] **Step 1: Facts already gathered — no need to ask again**

**Resolved 2026-08-12.** Danny could not retrieve the links himself because the apps are published in the US App Store and he browses the Ecuadorian one. They were found through the iTunes lookup API and confirmed by an exact image match: screenshot 1 of the `id6504781797` listing is pixel-identical to the local `spectrum-1.jpg`.

All three of these are Danny's work, built on one white-label Flutter codebase — he confirmed this. They are three distinct published apps: different App Store IDs, different bundle IDs, different sellers.

| App | Bundle | Store URL |
|---|---|---|
| Spectrum Aesthetics | `com.spectrum-aesthetics.portal` | `https://apps.apple.com/us/app/spectrum-aesthetics/id6504781797` |
| Spectrum HIPAA Portal | `com.integrations.io.app360` | `https://apps.apple.com/us/app/spectrum-hipaa-portal/id6746419349` |
| ibody Aesthetics | `com.360io.ibody` | `https://apps.apple.com/us/app/ibody-aesthetics/id6772275647` |

Framework: **Flutter** (confirmed by Danny).

**This raises the published-app count from 10 to 13.** None of these three appeared among the 13 store URLs already in the repo — those covered Corp. Favorita (6), REVO (4), SportYeah, Turnly, and AkíClub. Update `APP_COUNT` in `src/components/Proof.astro` from 10 to 13 as part of this task, so the count stays consistent with the global constraint. Do not add store-link chips to the proof band — Danny chose to keep that row at six.

Do not state a user count, rating, or download figure for any of the three — none is known.

- [ ] **Step 2: Extend the schema**

In `src/content.config.ts`, add two fields inside the `caseStudies` schema object, after `order`:

```ts
    featured: z.boolean().default(false),
    shots: z.array(z.string()).default([]),
```

- [ ] **Step 3: Write the failing check**

Append to `CHECKS` in `scripts/check-build.mjs`:

```js
  {
    name: 'exactly four featured cases, no duplicate Kruger or 360io entry',
    run: ({ html }) => {
      const start = html.indexOf('id="cases"');
      assert(start !== -1, 'no <section id="cases"> on the page');
      const section = html.slice(start, html.indexOf('id="more-work"'));
      const cards = section.match(/class="case-card[^"]*"/g) || [];
      assert(cards.length === 4, `found ${cards.length} featured cases, expected 4`);
      assert(
        !/case-studies\/kruger-corp/.test(html),
        'kruger-corp should be merged into corp-favorita-suite, not listed separately'
      );
      assert(
        !/case-studies\/360io/.test(html),
        '360io and Spectrum are one engagement — they must not appear as two cases'
      );
    },
  },
```

This check fails until Task 5 renders the cards; that is expected and it is the check that drives Task 5.

- [ ] **Step 4: Merge Kruger into the Corporación Favorita case**

The Kruger case holds the engineering metrics worth keeping — login failures down ~35% after Keycloak SSO, TTI from ~3.2s to ~1.8s, `.aab` size down ~22%, release cycles from weeks to days. Move those sentences into the body of `corp-favorita-suite.md`, keeping its own `result` line about the 6 shipped apps and 16,500+ users. Then:

```bash
git rm src/content/case-studies/kruger-corp.md
```

- [ ] **Step 5: Create the one new case study**

Create `src/content/case-studies/spectrum-aesthetics.md` exactly as below. The screenshots are App Store marketing images for a HIPAA-compliant client portal; Danny has confirmed they are cleared for use on the site.

```markdown
---
title: "White-Label HIPAA Client Portal — 3 Apps on the App Store"
client: "360 Integrations / Spectrum Aesthetics"
role: "Mobile Developer (Flutter)"
period: "2024 – 2026"
problem: "Patients and practice staff coordinated consultations across consumer chat apps and email, leaving clinical photos and signed documents scattered across channels with no HIPAA guarantees."
solution: "A white-label Flutter client portal: secure messaging with the practice, media sharing, and a document library covering evaluation, financing, consent, and pre/post-op files."
result: "Three apps published on the US App Store from one white-label Flutter codebase — Spectrum Aesthetics, Spectrum HIPAA Portal, and ibody Aesthetics."
tech: ["Flutter", "Dart", "iOS"]
order: 4
featured: true
shots: ["spectrum-2.jpg", "spectrum-3.jpg", "spectrum-4.jpg"]
links:
  - label: "Spectrum Aesthetics"
    url: "https://apps.apple.com/us/app/spectrum-aesthetics/id6504781797"
  - label: "Spectrum HIPAA Portal"
    url: "https://apps.apple.com/us/app/spectrum-hipaa-portal/id6746419349"
  - label: "ibody Aesthetics"
    url: "https://apps.apple.com/us/app/ibody-aesthetics/id6772275647"
---

Three aesthetic practices run the same portal under their own branding. Patients message the practice, share clinical photos, and exchange documents — evaluation files, financing, signed consents, pre-op and post-op records — inside one HIPAA-compliant channel instead of across chat apps and email.

The `result` line is the only claim in this case study with a number in it, and it is verifiable: three distinct App Store listings, three distinct bundle IDs.
```

**The `problem` and `solution` lines are a draft written from the App Store listing and the screenshots, at Danny's request** — he chose "draft it from the listing" over writing them himself. They assert only what the listing and screenshots support. Flag them in your report as copy Danny should read and correct; do not add any metric, rating, or download figure to them.

Remove the trailing explanatory sentence about the `result` line from the committed markdown body — it is a note to you, not site copy.

Delete the now-redundant `360io-*` screenshots rather than leaving a duplicate set on disk:

```bash
rm public/upwork-portfolio/360io-*.jpg
```

- [ ] **Step 6: Set `featured`, `order`, and `shots` across all cases**

Featured, in order: `corp-favorita-suite` (1), `turnly` (2), `revo-rideshare` (3), `spectrum-aesthetics` (4) — each `featured: true`.

Not featured, keeping their relative order: `sportyeah`, `aws-backend`, `beez-delivery`, `legaltech-ecuador`, `sicmer-mobile` — each `featured: false` (or the field omitted, since it defaults to false).

Add `shots` to each featured case, listing files that exist in `public/upwork-portfolio/`:
- `corp-favorita-suite`: `["akiclub-1.png", "akiclub-2.png", "analitix-ss-1.png"]`
- `turnly`: `["turnly-2.jpg", "turnly-3.jpg", "turnly-4.jpg"]`
- `revo-rideshare`: `["revo-2.png", "revo-3.png", "revo-4.png"]`

- [ ] **Step 7: Move the featured screenshots into `src/assets/apps`**

```bash
mv public/upwork-portfolio/{akiclub-1.png,akiclub-2.png,analitix-ss-1.png} src/assets/apps/
mv public/upwork-portfolio/{turnly-2.jpg,turnly-3.jpg,turnly-4.jpg} src/assets/apps/
mv public/upwork-portfolio/{revo-2.png,revo-3.png,revo-4.png} src/assets/apps/
mv public/upwork-portfolio/{spectrum-2.jpg,spectrum-3.jpg,spectrum-4.jpg} src/assets/apps/
git add src/assets/apps
```

- [ ] **Step 8: Verify the content builds**

Run: `npm run build`
Expected: exit 0. A schema error here means a `featured` or `shots` value is malformed.

- [ ] **Step 9: Commit**

```bash
git add -A src/content src/content.config.ts scripts/check-build.mjs src/assets/apps
git commit -m "content: merge duplicate cases, add Spectrum

Kruger and Corp. Favorita covered the same client and period and read as
padding at positions 01 and 02. Spectrum and 360io turned out to be one
engagement sharing a single App Store screenshot set, and had no written case. Adds featured/shots frontmatter for the new work grid."
```

---

### Task 5: Featured work section with screenshots, plus the compressed More work list

**Files:**
- Create: `src/components/CaseCard.astro`
- Create: `src/components/MoreWork.astro`
- Rewrite: `src/components/CaseStudies.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Consumes: `featured` and `shots` frontmatter from Task 4; `src/assets/apps/*` from Tasks 2 and 4.
- Produces: `CaseCard.astro` with props `{ entry: CollectionEntry<'case-studies'>, index: number }`, rendering an element carrying `class="case-card"` — the class the Task 4 check counts.

- [ ] **Step 1: Run the Task 4 check to confirm it still fails**

Run: `npm run build && npm run check`
Expected: FAIL — `found 0 featured cases, expected 5`

- [ ] **Step 2: Build the case card**

Create `src/components/CaseCard.astro`. `import.meta.glob` is how Astro resolves a runtime filename to an optimizable image.

```astro
---
import { Image } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';

interface Props {
  entry: CollectionEntry<'case-studies'>;
  index: number;
}

const { entry, index } = Astro.props;
const { title, titleEs, client, role, roleEs, period, problem, problemEs, result, resultEs, tech, shots, links } = entry.data;

const images = import.meta.glob<{ default: ImageMetadata }>('../assets/apps/*.{jpg,png}', { eager: true });
const resolved = shots
  .map((name) => images[`../assets/apps/${name}`]?.default)
  .filter((img): img is ImageMetadata => Boolean(img));

const num = String(index + 1).padStart(2, '0');
---

<article class="case-card reveal">
  <div class="case-card__text">
    <p class="case-card__meta">
      <span class="case-card__num" aria-hidden="true">{num}</span>
      <span>{client}</span>
      <span aria-hidden="true">·</span>
      <span>{period}</span>
      <span aria-hidden="true">·</span>
      <span class="lang-en">{role}</span>
      {roleEs && <span class="lang-es" style="display:none;">{roleEs}</span>}
    </p>

    <h3 class="lang-en">{title}</h3>
    {titleEs && <h3 class="lang-es" style="display:none;">{titleEs}</h3>}

    <p class="case-card__problem lang-en">{problem}</p>
    {problemEs && <p class="case-card__problem lang-es" style="display:none;">{problemEs}</p>}

    <p class="case-card__result lang-en">{result}</p>
    {resultEs && <p class="case-card__result lang-es" style="display:none;">{resultEs}</p>}

    <ul class="case-card__tech">
      {tech.slice(0, 5).map((t) => <li>{t}</li>)}
    </ul>

    <div class="case-card__links">
      <a href={`/case-studies/${entry.id}`} class="case-card__more" data-i18n="cases.view">View case study</a>
      {(links ?? []).map((link) => (
        <a href={link.url} target="_blank" rel="noopener noreferrer" class="case-card__store">{link.label}</a>
      ))}
    </div>
  </div>

  {resolved.length > 0 && (
    <div class="case-card__shots">
      {resolved.map((img, i) => (
        <Image
          src={img}
          alt={`${title} screenshot ${i + 1}`}
          widths={[140, 220]}
          sizes="(max-width: 700px) 28vw, 150px"
          format="avif"
          loading="lazy"
        />
      ))}
    </div>
  )}
</article>

<style>
  .case-card {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-xl);
    padding-block: clamp(2rem, 4vw, 3rem);
    border-top: 1px solid var(--color-border);
  }

  @media (min-width: 900px) {
    .case-card {
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
      align-items: center;
    }
  }

  .case-card__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: var(--space-sm);
    font-size: var(--font-size-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .case-card__num {
    color: var(--color-accent);
    font-variant-numeric: tabular-nums;
  }

  .case-card h3 {
    font-size: var(--font-size-2xl);
    letter-spacing: -0.02em;
    margin-bottom: var(--space-md);
  }

  .case-card__problem {
    color: var(--color-text-muted);
    margin-bottom: var(--space-sm);
    max-width: 56ch;
  }

  .case-card__result {
    color: var(--color-text);
    font-weight: 550;
    margin-bottom: var(--space-lg);
    max-width: 56ch;
  }

  .case-card__tech {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    list-style: none;
    padding: 0;
    margin: 0 0 var(--space-lg);
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .case-card__links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md);
    align-items: center;
    font-size: var(--font-size-sm);
  }

  .case-card__more {
    color: var(--color-text);
  }

  .case-card__store {
    color: var(--color-text-muted);
  }

  .case-card__shots {
    display: flex;
    gap: var(--space-sm);
    justify-content: flex-start;
  }

  .case-card__shots :global(img) {
    width: 100%;
    max-width: 150px;
    height: auto;
    border-radius: 12px;
    border: 1px solid var(--color-border);
    display: block;
  }
</style>
```

- [ ] **Step 3: Rewrite the work section to render only featured cases**

Replace the frontmatter and markup of `src/components/CaseStudies.astro`, keeping its existing `<style>` block for `.cases__header` and `.cases__count`:

```astro
---
import { getCollection } from 'astro:content';
import CaseCard from './CaseCard.astro';

const featured = (await getCollection('case-studies'))
  .filter((c) => c.data.featured)
  .sort((a, b) => a.data.order - b.data.order);
---

<section id="cases" class="section section--cases">
  <div class="container">
    <header class="cases__header reveal">
      <h2 class="section-title" data-i18n="cases.title">Selected work</h2>
      <span class="cases__count" aria-hidden="true">
        {String(featured.length).padStart(2, '0')} <span class="cases__count-label" data-i18n="cases.count">projects</span>
      </span>
    </header>

    {featured.map((entry, i) => <CaseCard entry={entry} index={i} />)}
  </div>
</section>
```

- [ ] **Step 4: Build the More work list**

Create `src/components/MoreWork.astro` — one line per non-featured case, no images.

```astro
---
import { getCollection } from 'astro:content';

const rest = (await getCollection('case-studies'))
  .filter((c) => !c.data.featured)
  .sort((a, b) => a.data.order - b.data.order);
---

<section id="more-work" class="section section--more">
  <div class="container">
    <h2 class="section-title" data-i18n="more.title">More work</h2>
    <ul class="more__list">
      {rest.map((entry) => (
        <li>
          <a href={`/case-studies/${entry.id}`}>
            <span class="more__title">{entry.data.title}</span>
            <span class="more__client">{entry.data.client}</span>
            <span class="more__period">{entry.data.period}</span>
          </a>
        </li>
      ))}
    </ul>
  </div>
</section>

<style>
  .section--more {
    padding-block: clamp(2rem, 5vw, 3.5rem);
  }

  .more__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .more__list a {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: var(--space-md);
    align-items: baseline;
    padding-block: var(--space-md);
    border-top: 1px solid var(--color-border);
    color: var(--color-text);
    text-decoration: none;
  }

  .more__list a:hover .more__title {
    color: var(--color-accent);
  }

  .more__client,
  .more__period {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .more__list a {
      grid-template-columns: 1fr;
      gap: 0.2rem;
    }
  }
</style>
```

- [ ] **Step 5: Wire both into the page and add strings**

In `src/pages/index.astro`, import `MoreWork` and place `<MoreWork />` directly after `<CaseStudies />`.

Add to `en`: `'more.title': 'More work',` and change `'cases.title'` to `'Selected work'`.
Add to `es`: `'more.title': 'Más trabajo',` and change `'cases.title'` to `'Trabajo seleccionado'`.

- [ ] **Step 6: Run the check to verify it passes**

Run: `npm run build && npm run check`
Expected: PASS — `4 check(s) passed`

- [ ] **Step 7: Verify the screenshots render**

Run: `npm run preview` and scroll the work section.
Expected: each of the five cases shows its screenshots. A case rendering no images means a filename in its `shots` array does not match a file in `src/assets/apps/` — `import.meta.glob` fails silently by design here, so check the filenames.

- [ ] **Step 8: Commit**

```bash
git add -A src/components src/pages/index.astro src/i18n/translations.ts
git commit -m "feat(work): show five cases with real screenshots

Featured cases now carry the app screenshots and store links alongside the
problem and result. The remaining four drop to a one-line list."
```

---

### Task 6: How I work — replacing Services and the TechStack grid

**Files:**
- Create: `src/components/HowIWork.astro`
- Delete: `src/components/Services.astro`, `src/components/TechStack.astro`, `src/components/CurrentProjects.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/i18n/translations.ts`
- Modify: `scripts/check-build.mjs`

`CurrentProjects` goes because Turnly and LegalTech — the projects it covered — are now a featured case and a More work entry respectively, so it duplicates them.

**Interfaces:**
- Consumes: `public/danny.jpg`, which the hero released in Task 2.
- Produces: `<section id="how">`.

- [ ] **Step 1: Write the failing check**

Append to `CHECKS`:

```js
  {
    name: 'homepage is six sections, generic ones gone',
    run: ({ html }) => {
      const ids = [...html.matchAll(/<section[^>]*id="([^"]+)"/g)].map((m) => m[1]);
      const expected = ['proof', 'cases', 'more-work', 'how', 'contact'];
      for (const id of expected) {
        assert(ids.includes(id), `missing <section id="${id}">`);
      }
      for (const gone of ['services', 'tech', 'current', 'blog']) {
        assert(!ids.includes(gone), `section #${gone} should have been removed`);
      }
      assert(
        !/What people say|testimonial/i.test(html),
        'the anonymous testimonial is still on the page'
      );
    },
  },
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `npm run build && npm run check`
Expected: FAIL — `missing <section id="how">`

- [ ] **Step 3: Move the portrait into `src/assets` first**

The component created in the next step imports this file, so it has to exist before the build runs.

```bash
mv public/danny.jpg src/assets/danny.jpg
git add src/assets/danny.jpg
```

Then grep for other references — the `/cv` page or an og-image script may point at `/danny.jpg`:

```bash
grep -rn "danny.jpg" src/ public/ --include="*.astro" --include="*.ts" --include="*.html"
```

Fix any hit to import from `../assets/danny.jpg` instead. If a reference cannot use `astro:assets` (for example inside a raw HTML string in `src/pages/cv.astro`), copy the file back into `public/` as well rather than breaking that page.

- [ ] **Step 4: Create the section**

Create `src/components/HowIWork.astro`. The "not a fit" list is deliberate — it is the one place on the page with a point of view, and it filters out bad-fit enquiries before they reach the inbox.

```astro
---
import { Image } from 'astro:assets';
import portrait from '../assets/danny.jpg';
---

<section id="how" class="section section--how">
  <div class="container how__inner">
    <div class="how__text">
      <h2 class="section-title" data-i18n="how.title">How I work</h2>

      <p class="how__lead" data-i18n="how.lead">
        I take a project from the first screen to a signed build in the store. No subcontractors, no handoffs — you talk to the person writing the code.
      </p>

      <dl class="how__points">
        <div>
          <dt data-i18n="how.point1.title">You see it running every week</dt>
          <dd data-i18n="how.point1.desc">A build on your phone, not a status update.</dd>
        </div>
        <div>
          <dt data-i18n="how.point2.title">I own the store submission</dt>
          <dd data-i18n="how.point2.desc">Review rejections are my problem, not yours.</dd>
        </div>
        <div>
          <dt data-i18n="how.point3.title">The backend comes with it</dt>
          <dd data-i18n="how.point3.desc">NestJS, Laravel, Spring Boot, AWS — the app does not stop at the API boundary.</dd>
        </div>
      </dl>

      <p class="how__fit" data-i18n="how.fit">
        Good fit: a founder or product team with a real app to ship. Bad fit: a two-day fix, an unpaid trial, or a project that needs a designer more than an engineer.
      </p>

      <p class="how__stack">Flutter · Dart · React Native · TypeScript · NestJS · Laravel · Spring Boot · Firebase · AWS</p>
    </div>

    <figure class="how__portrait">
      <Image src={portrait} alt="Danny Barahona" widths={[280, 420]} sizes="(max-width: 900px) 60vw, 320px" format="avif" loading="lazy" />
    </figure>
  </div>
</section>

<style>
  .section--how {
    padding-block: clamp(2.5rem, 6vw, 4rem);
  }

  .how__inner {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-2xl);
    align-items: start;
  }

  @media (min-width: 900px) {
    .how__inner {
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.6fr);
    }
  }

  .how__lead {
    font-size: var(--font-size-lg);
    max-width: 54ch;
    margin-bottom: var(--space-xl);
  }

  .how__points {
    margin: 0 0 var(--space-xl);
    display: grid;
    gap: var(--space-lg);
  }

  .how__points dt {
    font-weight: 600;
    margin-bottom: 0.2rem;
  }

  .how__points dd {
    margin: 0;
    color: var(--color-text-muted);
  }

  .how__fit {
    color: var(--color-text-muted);
    max-width: 60ch;
    padding-left: var(--space-lg);
    border-left: 2px solid var(--color-accent);
    margin-bottom: var(--space-lg);
  }

  .how__stack {
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
  }

  .how__portrait {
    margin: 0;
  }

  .how__portrait :global(img) {
    width: 100%;
    height: auto;
    border-radius: var(--radius);
    border: 1px solid var(--color-border);
    display: block;
  }
</style>
```

- [ ] **Step 5: Remove the replaced sections**

```bash
git rm src/components/Services.astro src/components/TechStack.astro src/components/CurrentProjects.astro src/components/Testimonials.astro src/components/BlogPreview.astro
```

In `src/pages/index.astro`, delete those five imports and their tags, and add `HowIWork` after `<MoreWork />`. The resulting body is:

```astro
  <Navbar />
  <Hero />
  <Proof />
  <CaseStudies />
  <MoreWork />
  <HowIWork />
  <Contact />
  <Footer />
```

- [ ] **Step 6: Add the strings**

Add to `en`:

```ts
    'how.title': 'How I work',
    'how.lead': 'I take a project from the first screen to a signed build in the store. No subcontractors, no handoffs — you talk to the person writing the code.',
    'how.point1.title': 'You see it running every week',
    'how.point1.desc': 'A build on your phone, not a status update.',
    'how.point2.title': 'I own the store submission',
    'how.point2.desc': 'Review rejections are my problem, not yours.',
    'how.point3.title': 'The backend comes with it',
    'how.point3.desc': 'NestJS, Laravel, Spring Boot, AWS — the app does not stop at the API boundary.',
    'how.fit': 'Good fit: a founder or product team with a real app to ship. Bad fit: a two-day fix, an unpaid trial, or a project that needs a designer more than an engineer.',
```

Add to `es`:

```ts
    'how.title': 'Cómo trabajo',
    'how.lead': 'Llevo el proyecto de la primera pantalla al build firmado en la store. Sin subcontratistas, sin traspasos — hablas con quien escribe el código.',
    'how.point1.title': 'Lo ves corriendo cada semana',
    'how.point1.desc': 'Un build en tu teléfono, no un reporte de avance.',
    'how.point2.title': 'Yo me encargo del envío a la store',
    'how.point2.desc': 'Los rechazos de revisión son mi problema, no el tuyo.',
    'how.point3.title': 'El backend viene incluido',
    'how.point3.desc': 'NestJS, Laravel, Spring Boot, AWS — la app no se detiene en el borde de la API.',
    'how.fit': 'Buen encaje: un fundador o equipo de producto con una app real que enviar. Mal encaje: un arreglo de dos días, una prueba no pagada, o un proyecto que necesita más un diseñador que un ingeniero.',
```

Delete the now-unused `services.*`, `tech.*`, `testimonials.*`, `blog.*`, and `current.*` keys from both objects. Also drop `nav.services` and `nav.tech`, and update `src/components/Navbar.astro` so its links point at `#cases`, `#how`, and `#contact` only.

- [ ] **Step 7: Run the check to verify it passes**

Run: `npm run build && npm run check`
Expected: PASS — `5 check(s) passed`

- [ ] **Step 8: Commit**

```bash
git add -A src scripts
git commit -m "feat: replace generic sections with How I work

Services, TechStack, CurrentProjects, Testimonials and BlogPreview all
described the work in the abstract or duplicated it. One section now states
the process, what to expect, and which projects are a bad fit."
```

---

### Task 7: Contact rewrite and the spacing pass

**Files:**
- Modify: `src/components/Contact.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/styles/global.css:52-54`
- Modify: `src/i18n/translations.ts`
- Modify: `scripts/check-build.mjs`

**Interfaces:**
- Consumes: every section from Tasks 2–6.
- Produces: the final page. No later task depends on it.

- [ ] **Step 1: Write the failing check**

Append to `CHECKS`:

```js
  {
    name: 'contact tells the reader exactly who should write',
    run: ({ html }) => {
      const start = html.indexOf('id="contact"');
      const section = html.slice(start, html.indexOf('</section>', start));
      assert(
        /mailto:danny@lupio\.dev/.test(section),
        'contact must expose a direct mailto to danny@lupio.dev'
      );
      assert(
        !/Got a project in mind/.test(html),
        'the old generic contact headline is still in place'
      );
    },
  },
```

Note the current site uses `dmmarketingads@gmail.com` in the hero social links while the schema in `BaseLayout.astro` declares `danny@lupio.dev`. Standardize on `danny@lupio.dev` everywhere.

- [ ] **Step 2: Run the check to verify it fails**

Run: `npm run build && npm run check`
Expected: FAIL — `the old generic contact headline is still in place`

- [ ] **Step 3: Rewrite the contact copy**

In `src/components/Contact.astro`, replace the headline and subtitle markup so it names who should write and what to send. Keep the existing link list markup and styles.

Add to `en`:

```ts
    'contact.title': 'Tell me what you are building.',
    'contact.subtitle': 'Write me if you have an app to ship and a date it needs to be live. One paragraph is enough: what it does, who it is for, and where it stands today. I reply within a day.',
```

Add to `es`:

```ts
    'contact.title': 'Cuéntame qué estás construyendo.',
    'contact.subtitle': 'Escríbeme si tienes una app que enviar y una fecha en la que debe estar viva. Con un párrafo basta: qué hace, para quién es, y en qué punto está hoy. Respondo en menos de un día.',
```

- [ ] **Step 4: Standardize the email address**

```bash
grep -rn "dmmarketingads@gmail.com" src/
```

Replace every hit with `danny@lupio.dev`.

- [ ] **Step 5: Add the blog link to the footer**

`BlogPreview` was removed in Task 6, but `/blog` still builds and should stay reachable. In `src/components/Footer.astro`, add a link to `/blog` alongside the existing copyright line.

- [ ] **Step 6: Tighten the vertical rhythm**

In `src/styles/global.css`, change the section padding from the fixed `--space-4xl` (6rem) to a responsive clamp, and reduce the section-title gap:

```css
.section {
  padding-block: clamp(2.5rem, 6vw, 4rem);
}

.section-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin-bottom: clamp(1.25rem, 3vw, 2rem);
  color: var(--color-text);
}
```

- [ ] **Step 7: Run the check to verify it passes**

Run: `npm run build && npm run check`
Expected: PASS — `6 check(s) passed`

- [ ] **Step 8: Measure the page height**

Run `npm run preview`, open the site at 1440px wide, and in the console:

```js
document.body.scrollHeight
```

Expected: roughly 4500px, down from 8142px. If it is still above 5500px, find the section with the largest gap and reduce its own `padding-block` before moving on.

- [ ] **Step 9: Commit**

```bash
git add -A src scripts
git commit -m "feat(contact): ask for a specific message, tighten page rhythm

Contact now states who should write and what to send instead of a generic
invitation. Section padding becomes responsive, cutting the page roughly in
half."
```

---

### Task 8: Final verification pass

**Files:**
- Modify: `scripts/check-build.mjs` (only if a real defect turns up)

- [ ] **Step 1: Run the full check suite**

Run: `npm run build && npm run check`
Expected: all six checks pass.

- [ ] **Step 2: Verify without JavaScript**

Run `npm run preview`, disable JS, hard-reload.
Expected: every section readable, all links clickable.

- [ ] **Step 3: Verify both languages**

Toggle EN/ES in the navbar and read every section.
Expected: no English string left visible in ES mode. Any element still in English is missing a key in `translations.ts` or a `lang-es` variant in a component.

- [ ] **Step 4: Verify mobile at 390px**

Expected: three hero phones, no horizontal scroll anywhere, case screenshots wrap rather than overflow, tap targets at least 44px.

- [ ] **Step 5: Check LCP**

Run a Lighthouse audit on the preview build.
Expected: LCP under 2.5s and no "properly size images" warning. If the hero mosaic is the LCP element and it is slow, reduce the `widths` array in `Hero.astro` — the phones render at roughly 200px, so 320px is the largest useful width.

- [ ] **Step 6: Confirm the app count is consistent**

```bash
grep -rn "apps" src/i18n/translations.ts src/components/Proof.astro | grep -E "[0-9]+"
```

Expected: one number, matching the count established in Task 3 Step 1. Any second, different figure is a credibility bug — fix it.

- [ ] **Step 7: Commit any fixes and push**

```bash
git add -A
git commit -m "fix: address findings from the final verification pass"
git push
```

---

## Open items for Danny

All resolved as of 2026-08-12. Nothing blocks execution.

1. ~~Store URL for the Spectrum / 360 Integrations app~~ — found via the iTunes lookup API and confirmed by exact image match; three apps, not one. See Task 4 Step 1.
2. ~~Problem and solution sentences, and the framework~~ — framework is Flutter, confirmed. The problem and solution lines are drafted from the store listing at Danny's request and still need his read-through.
3. ~~Published-app count~~ — Danny confirmed 10, then the three Spectrum apps raised it to **13**. Task 4 updates `APP_COUNT`.

Remaining for Danny, non-blocking: read the drafted Spectrum problem/solution copy, and decide whether the ES hero subheadline should say `lanzar`/`publicar` instead of `enviar` (a reviewer flagged `enviar` as reading like "send" rather than "ship").
