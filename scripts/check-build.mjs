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
        imgs.filter((img) => /fetchpriority="high"/.test(img)).length === 1,
        'exactly one hero image must carry fetchpriority="high" for LCP'
      );
      assert(
        !/danny\.jpg/.test(hero),
        'the portrait belongs in the How I work section, not the hero'
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
