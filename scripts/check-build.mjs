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
        imgs.filter((img) => /fetchpriority="high"/.test(img) && /srcset=/.test(img)).length === 1,
        'exactly one optimized hero image (with srcset) must carry fetchpriority="high" for LCP'
      );
      assert(
        !/danny\.jpg/.test(hero),
        'the portrait belongs in the How I work section, not the hero'
      );
    },
  },
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
      assert(!/class="stats"/.test(html), 'the old stats section is still rendered');
    },
  },
  {
    name: 'exactly four featured cases, no duplicate Kruger or 360io entry',
    run: ({ html }) => {
      const start = html.indexOf('id="cases"');
      assert(start !== -1, 'no <section id="cases"> on the page');
      const section = html.slice(start, html.indexOf('id="more-work"'));
      const cards = section.match(/class="case-card(?:\s[^"]*)?"/g) || [];
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
