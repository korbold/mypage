import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_COUNT } from '../src/config/site-stats.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DIST = join(ROOT, 'dist');
const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const css = readdirSync(join(DIST, '_astro'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync(join(DIST, '_astro', f), 'utf8'))
  .join('\n');

// Recursively collect every .astro file under src/, used by the i18n
// key-parity check below.
function collectAstroFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectAstroFiles(full));
    } else if (entry.name.endsWith('.astro')) {
      out.push(full);
    }
  }
  return out;
}

// Recursively collect every file under `dir`. Used by the stale-PDF check so
// it walks the whole `dist/` output rather than assuming the PDF could only
// ever reappear under dist/cv/ — a copy dropped anywhere under dist/ (e.g.
// public/Danny_Barahona_CV.pdf, which Astro copies verbatim) is just as stale.
function walkFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

// Parse the `en` / `es` blocks of src/i18n/translations.ts by regex rather
// than importing the .ts file directly — this is a plain Node script with
// no TypeScript loader, and adding one would mean a new dependency.
function parseTranslationKeys(source) {
  const enStart = source.indexOf('en: {');
  const esStart = source.indexOf('es: {');
  if (enStart === -1 || esStart === -1) {
    throw new Error('could not locate en:/es: blocks in translations.ts');
  }
  const enBlock = source.slice(enStart, esStart);
  const esBlock = source.slice(esStart);
  const keyPattern = /^\s*'([a-zA-Z0-9_.]+)':/gm;
  const extract = (block) => new Set([...block.matchAll(keyPattern)].map((m) => m[1]));
  return { en: extract(enBlock), es: extract(esBlock) };
}

/**
 * Each check gets its own `assert` that COLLECTS failures instead of
 * throwing on the first one. Previously `assert()` threw immediately, which
 * meant only the first assertion in any given check ever ran — that is the
 * exact mechanism that let the proof-band check's slack `>= 4` hide a real
 * regression (see F3 in the final review). Collecting means every assertion
 * in a check is always exercised and every failure is reported.
 */
function makeAssert(failures) {
  return function assert(condition, message) {
    if (!condition) failures.push(message);
  };
}

// Every published app on this site is described by a `links` entry in a case
// study. That frontmatter is the single source of truth for the app count, the
// store-listing count, and the CV's published-apps table. It is parsed by regex
// rather than by importing the collection, because this is a dependency-free
// Node script with no Astro runtime.
function collectStoreLinks() {
  const dir = join(ROOT, 'src', 'content', 'case-studies');
  const all = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const source = readFileSync(join(dir, file), 'utf8');
    const pattern = /-\s*label:\s*"([^"]+)"\s*\n\s*url:\s*"([^"]+)"/g;
    for (const match of source.matchAll(pattern)) {
      all.push({ label: match[1], url: match[2], file });
    }
  }

  const seen = new Set();
  const unique = all.filter((l) => (seen.has(l.url) ? false : seen.add(l.url)));

  // "AkíClub (Google Play)" -> app "AkíClub", store "Google Play". One app can
  // hold several listings, which is why the site's app count (13) is smaller
  // than its store-listing count (16).
  const apps = new Map();
  for (const link of unique) {
    const match = link.label.match(/^(.+) \((.+)\)$/);
    if (!match) continue;
    const [, app, store] = match;
    if (!apps.has(app)) apps.set(app, { stores: [], urls: [] });
    apps.get(app).stores.push(store);
    apps.get(app).urls.push(link.url);
  }

  return { all, unique, apps };
}

const CHECKS = [
  {
    name: 'reveal degrades gracefully without JS',
    run: ({ html, css, assert }) => {
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
    run: ({ html, assert }) => {
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
    run: ({ html, assert }) => {
      const start = html.indexOf('id="proof"');
      assert(start !== -1, 'no <section id="proof"> on the page');
      const band = html.slice(start, html.indexOf('</section>', start));
      const storeLinks = band.match(/href="https:\/\/(apps\.apple\.com|play\.google\.com)[^"]*"/g) || [];
      // Tightened from `>= 4` to `=== 6`: the proof band ships exactly 6
      // chips (see the `stores` array in Proof.astro). `>= 4` let a real
      // regression (2 chips silently dropped) pass at 6/6 checks — see F3.
      assert(
        storeLinks.length === 6,
        `proof band has ${storeLinks.length} store links, expected exactly 6 — store links are the only social proof on the page`
      );
      assert(!/class="stats"/.test(html), 'the old stats section is still rendered');

      // The rendered "Apps published" figure must match the single exported
      // APP_COUNT constant (src/config/site-stats.mjs) that Proof.astro also
      // reads. Because both sides read the same source, they cannot drift —
      // this check exists to catch anyone who hardcodes a different number
      // in either place instead of importing the constant.
      const figureMatch = band.match(/Apps published<\/dt>\s*<dd[^>]*>(\d+)<\/dd>/);
      assert(figureMatch !== null, 'could not find the "Apps published" figure in the proof band');
      if (figureMatch) {
        const rendered = Number(figureMatch[1]);
        assert(
          rendered === APP_COUNT,
          `proof band renders an app count of ${rendered}, but src/config/site-stats.mjs exports APP_COUNT=${APP_COUNT}`
        );
      }
    },
  },
  {
    name: 'exactly four featured cases, no duplicate Kruger or 360io entry',
    run: ({ html, assert }) => {
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
    run: ({ html, assert }) => {
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
    run: ({ html, assert }) => {
      const start = html.indexOf('id="contact"');
      const section = html.slice(start, html.indexOf('</section>', start));
      assert(
        /mailto:korboldev@gmail\.com/.test(section),
        'contact must expose a direct mailto to korboldev@gmail.com'
      );
      assert(
        !/Got a project in mind/.test(html),
        'the old generic contact headline is still in place'
      );
    },
  },
  {
    name: 'every data-i18n key resolves in both en and es dictionaries',
    run: ({ assert }) => {
      const translationsPath = join(ROOT, 'src', 'i18n', 'translations.ts');
      const translationsSource = readFileSync(translationsPath, 'utf8');
      const { en, es } = parseTranslationKeys(translationsSource);

      const astroFiles = collectAstroFiles(join(ROOT, 'src'));
      const usedKeys = new Set();
      const keyPattern = /data-i18n="([^"]+)"/g;
      for (const file of astroFiles) {
        const source = readFileSync(file, 'utf8');
        for (const match of source.matchAll(keyPattern)) {
          usedKeys.add(match[1]);
        }
      }

      assert(usedKeys.size > 0, 'no data-i18n keys found in src/**/*.astro — the extraction is broken');

      let checked = 0;
      for (const key of usedKeys) {
        assert(en.has(key), `data-i18n="${key}" is used but missing from the en dictionary`);
        assert(es.has(key), `data-i18n="${key}" is used but missing from the es dictionary`);
        checked++;
      }
      console.log(`       (checked ${checked} data-i18n keys against ${en.size} en / ${es.size} es dictionary entries)`);
    },
  },
  {
    name: 'store link labels are shaped "App Name (Store)" and group to APP_COUNT',
    run: ({ assert }) => {
      const { all, unique, apps } = collectStoreLinks();

      assert(all.length === 17, `found ${all.length} store links in case studies, expected 17`);
      assert(unique.length === 16, `found ${unique.length} unique store URLs, expected 16 (SICMER's Google Play URL is listed in two case studies)`);

      for (const link of all) {
        assert(
          /^(.+) \((App Store|Google Play)\)$/.test(link.label),
          `${link.file}: link label "${link.label}" is not shaped "App Name (App Store)" or "App Name (Google Play)" — the CV's published-apps table groups by the text before " ("`
        );
      }

      // This is what makes APP_COUNT a derived number rather than a trusted one:
      // publish an app, add its link, forget to bump the constant, and the build fails.
      assert(
        apps.size === APP_COUNT,
        `grouping the ${unique.length} unique store links by app name yields ${apps.size} apps, but src/config/site-stats.mjs exports APP_COUNT=${APP_COUNT}`
      );
    },
  },
  {
    name: 'the recruiter route is reachable from the homepage',
    run: ({ html, assert }) => {
      const links = html.match(/href="\/cv"/g) || [];
      assert(
        links.length >= 2,
        `homepage has ${links.length} links to /cv, expected at least 2 (navbar and contact) — a CV nobody can find is the same as no CV`
      );

      const contactStart = html.indexOf('id="contact"');
      const contact = html.slice(contactStart, html.indexOf('</section>', contactStart));
      assert(
        /href="\/cv"/.test(contact),
        'the contact section does not link to /cv'
      );

      // Scope each menu separately rather than testing the whole <nav>: a
      // single blanket assertion over the entire <nav>...</nav> block passes
      // as long as /cv appears ANYWHERE inside it, so dropping the link from
      // one menu while keeping it in the other still reports green. The
      // class-attribute regex tolerates extra attributes (Astro stamps
      // scoped-style attributes like data-astro-cid-... onto rendered tags),
      // so it does not assume the tag ends immediately after the class.
      const desktopTag = html.match(/<ul[^>]*\bclass="navbar__links"[^>]*>/);
      assert(desktopTag !== null, 'could not find <ul class="navbar__links"> on the page');
      if (desktopTag) {
        const start = desktopTag.index + desktopTag[0].length;
        const end = html.indexOf('</ul>', start);
        const desktopMenu = html.slice(start, end);
        assert(
          /href="\/cv"/.test(desktopMenu),
          'the desktop navbar menu (.navbar__links) does not link to /cv'
        );
      }

      const mobileTag = html.match(/<div[^>]*\bclass="navbar__mobile-menu"[^>]*>/);
      assert(mobileTag !== null, 'could not find <div class="navbar__mobile-menu"> on the page');
      if (mobileTag) {
        const start = mobileTag.index + mobileTag[0].length;
        const end = html.indexOf('</div>', start);
        const mobileMenu = html.slice(start, end);
        assert(
          /href="\/cv"/.test(mobileMenu),
          'the mobile navbar menu (.navbar__mobile-menu) does not link to /cv'
        );
      }
    },
  },
  {
    name: 'the stale CV PDF stays deleted',
    run: ({ assert }) => {
      // Walk the whole dist/ tree, not just dist/cv/: a copy reintroduced at
      // public/Danny_Barahona_CV.pdf (which Astro copies verbatim to
      // dist/Danny_Barahona_CV.pdf) and linked from, say, the footer would
      // pass a check scoped to dist/cv/ while still shipping a stale PDF.
      const allFiles = walkFiles(DIST);
      const pdfHit = allFiles.find((f) => f.endsWith('Danny_Barahona_CV.pdf'));
      assert(
        !pdfHit,
        `${pdfHit ? pdfHit.slice(DIST.length + 1) : ''} is back somewhere under dist/ — a PDF that drifts from the page is worse than no PDF; the print button renders a current one`
      );

      const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));
      for (const file of htmlFiles) {
        const contents = readFileSync(file, 'utf8');
        assert(
          !/Danny_Barahona_CV\.pdf/.test(contents),
          `dist/${file.slice(DIST.length + 1)} references the deleted static PDF`
        );
      }

      const cvHtml = readFileSync(join(DIST, 'cv', 'index.html'), 'utf8');
      assert(
        /window\.print\(\)/.test(cvHtml),
        '/cv has no window.print() handler — the download button was replaced by a print button'
      );
    },
  },
  {
    name: 'the CV cannot contradict the homepage',
    run: ({ assert }) => {
      const cvHtml = readFileSync(join(DIST, 'cv', 'index.html'), 'utf8');
      const { unique, apps } = collectStoreLinks();

      const start = cvHtml.indexOf('id="published-apps"');
      assert(start !== -1, 'no published-apps section on /cv');
      const section = cvHtml.slice(start, cvHtml.indexOf('</section>', start));

      // Every unique store listing must appear as a link in the section — this
      // is what makes the block self-maintaining rather than hand-typed.
      const rendered = section.match(/href="https:\/\/(apps\.apple\.com|play\.google\.com)[^"]*"/g) || [];
      assert(
        rendered.length === unique.length,
        `the CV renders ${rendered.length} store links, but the case studies hold ${unique.length} unique ones`
      );

      const appsFigure = section.match(/data-app-count="(\d+)"/);
      assert(appsFigure !== null, 'the published-apps heading carries no data-app-count');
      if (appsFigure) {
        assert(
          Number(appsFigure[1]) === APP_COUNT,
          `the CV renders an app count of ${appsFigure[1]}, but APP_COUNT=${APP_COUNT}`
        );
      }

      // The data-app-count attribute is invisible to a reader — it guards
      // nothing a human ever sees. Assert the RENDERED figures too, in both
      // languages independently, so the visible heading cannot say "20 apps"
      // or "99 store listings" while the hidden attribute (and the homepage)
      // still say the true numbers.
      const headingBlock = section.match(/<p[^>]*\bclass="cv__job-context"[^>]*>([\s\S]*?)<\/p>/);
      assert(headingBlock !== null, 'could not find the published-apps heading (p.cv__job-context)');
      if (headingBlock) {
        const langs = [
          { code: 'en', tag: 'lang-en', listingWord: 'store listings' },
          { code: 'es', tag: 'lang-es', listingWord: 'publicaciones en tiendas' },
        ];
        for (const { code, tag, listingWord } of langs) {
          const spanMatch = headingBlock[1].match(new RegExp(`<span[^>]*\\bclass="${tag}"[^>]*>([\\s\\S]*?)<\\/span>`));
          assert(spanMatch !== null, `the published-apps heading has no .${tag} span`);
          if (!spanMatch) continue;
          const text = spanMatch[1];
          assert(
            new RegExp(`\\b${APP_COUNT}\\s+apps\\b`).test(text),
            `the ${code} published-apps heading does not render "${APP_COUNT} apps" (APP_COUNT) — rendered: "${text.trim()}"`
          );
          assert(
            new RegExp(`\\b${unique.length}\\s+${listingWord}\\b`).test(text),
            `the ${code} published-apps heading does not render "${unique.length} ${listingWord}" (collectStoreLinks().unique.length) — rendered: "${text.trim()}"`
          );
        }
      }

      // Match each app name as a COMPLETE rendered <span class="cv__app-name">
      // value, not a substring of the section's raw text. A substring test
      // lets "Flux" pass even when that row is missing, because "Flux"
      // occurs inside the separately-rendered "Flux Proveedores" row.
      const renderedAppNames = [...section.matchAll(/<span[^>]*\bclass="cv__app-name"[^>]*>([^<]+)<\/span>/g)].map(
        (m) => m[1]
      );
      for (const app of apps.keys()) {
        assert(
          renderedAppNames.includes(app),
          `the CV's published-apps section has no exact "${app}" row (cv__app-name) — a substring match would let this pass even when the row is missing`
        );
      }

      // Scope this to the <p class="cv__portfolio"> element itself, not the
      // whole document: astro.config.ts sets site: 'https://korbold.vercel.app',
      // so that string already appears 6 times in the canonical link and the
      // og: tags — a whole-document test cannot fail even if this block is
      // deleted entirely. The class regex tolerates extra attributes because
      // Astro stamps scoped-style attributes (data-astro-cid-...) onto every
      // rendered tag.
      const portfolioBlock = cvHtml.match(/<p[^>]*\bclass="cv__portfolio"[^>]*>([\s\S]*?)<\/p>/);
      assert(
        portfolioBlock !== null,
        'no <p class="cv__portfolio"> on /cv — in a printed or forwarded PDF an <a> is dead, so the URL must be spelled out in text'
      );
      if (portfolioBlock) {
        assert(
          /korbold\.vercel\.app/.test(portfolioBlock[1]),
          'the cv__portfolio block does not spell out the portfolio URL'
        );
      }
    },
  },
];

let failed = 0;
for (const check of CHECKS) {
  const failures = [];
  const assert = makeAssert(failures);
  try {
    check.run({ html, css, assert });
  } catch (error) {
    failures.push(`unexpected error while running check: ${error.message}`);
  }

  if (failures.length === 0) {
    console.log(`  ok   ${check.name}`);
  } else {
    failed++;
    console.error(`  FAIL ${check.name}`);
    for (const message of failures) {
      console.error(`       ${message}`);
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log(`\n${CHECKS.length} check(s) passed`);
