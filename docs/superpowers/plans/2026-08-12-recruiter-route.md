# Recruiter Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make korbold.vercel.app usable by a hiring company — `/cv` findable from the homepage, its PDF always current, and the CV carrying a verifiable list of published apps — without changing the freelance-first framing above the fold.

**Architecture:** Astro v6 static site, no test runner. Every number that appears in more than one place is derived from a single source: `src/config/site-stats.mjs` for hand-known figures, and the `links` frontmatter of `src/content/case-studies/*.md` for anything about published apps. `scripts/check-build.mjs` is the test suite — it asserts against the built `dist/` and against `src/`, and each new assertion must be proven able to fail before it is accepted.

**Tech Stack:** Astro v6, Astro content collections (`getCollection`), plain CSS with design tokens, Node 22, `scripts/check-build.mjs` (dependency-free Node).

**Spec:** `docs/superpowers/specs/2026-08-12-recruiter-route-design.md`

## Global Constraints

- **Node:** the login shell starts on Node v20.19.2, which Astro 6 rejects. Every build/check command in this plan must be prefixed with `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null &&`.
- **Verification command:** `npm run build && npm run check`. There is no test runner; the checks in `scripts/check-build.mjs` are the tests. Currently 7 checks, all green.
- **Every check must be proven non-vacuous.** Before accepting a new check, temporarily break the thing it guards, observe FAIL, then restore. A check that has never been seen failing is not a check.
- **i18n parity is enforced.** Every `data-i18n` key used in `src/**/*.astro` must exist in both the `en` and `es` dictionaries of `src/i18n/translations.ts`. Check 7 fails the build otherwise.
- **Bilingual markup rule:** language variants are `<span class="lang-en">` / `<span class="lang-es">` siblings. Never write `style="display:none"` — visibility is driven by `html[data-lang]` rules in `src/styles/global.css`. Text that differs between languages either uses paired spans or a `data-i18n` key, never both.
- **Tap targets:** any new interactive element must measure at least 44px in its smaller dimension.
- **Spanish copy uses accents and proper punctuation** (`á é í ó ú ñ ¿ ¡ —`). The existing content is written this way; match it.
- **Do not touch** the hero, the proof band's layout, `HowIWork`, or the homepage section order. This work is invisible above the fold.
- **Commit after every task.** Conventional Commits; body explains why, not what.

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `src/content/case-studies/*.md` | Source of truth for published apps: every `links` entry is `{ label: "App Name (Store)", url }` | 1 |
| `scripts/check-build.mjs` | The test suite. Gains a shared `collectStoreLinks()` helper plus checks 8–11 | 1, 3, 4, 5 |
| `src/config/site-stats.mjs` | Hand-known figures shared by more than one file: `APP_COUNT`, `ACTIVE_USERS` | 2 |
| `src/components/Proof.astro` | Homepage proof band; reads both constants instead of hard-coding them | 2 |
| `src/components/Navbar.astro` | Site nav; gains the `CV` item in desktop + mobile | 3 |
| `src/components/Contact.astro` | Contact section; gains the "Hiring full-time?" line below the cards | 3 |
| `src/i18n/translations.ts` | EN/ES dictionaries; gains `contact.hiring`, `cv.print`, `cv.published` and loses `cv.download` | 3, 4, 5 |
| `src/pages/cv.astro` | The CV page; print button, portfolio line, published-apps section | 4, 5 |
| `public/cv/Danny_Barahona_CV.pdf` | Deleted — stale since 31 May | 4 |

**Check numbering.** Checks are numbered by the order this plan introduces them, which differs from the spec's draft numbering. The mapping: check 8 = label shape + app grouping (Task 1), check 9 = recruiter route findable (Task 3), check 10 = the dead PDF stays dead (Task 4), check 11 = the CV's figures match their sources (Task 5).

---

### Task 1: Normalize the store link labels and lock their shape

Every later task depends on labels having the form `App Name (Store)`. Today ten of the seventeen do not: four in `revo-rideshare.md` name only the store, three in `spectrum-aesthetics.md` omit the store entirely, and `sportyeah.md`, `sicmer-mobile.md` and one entry in `corp-favorita-suite.md` are wrong in their own ways.

**Files:**
- Modify: `src/content/case-studies/revo-rideshare.md` (4 labels)
- Modify: `src/content/case-studies/spectrum-aesthetics.md` (3 labels)
- Modify: `src/content/case-studies/corp-favorita-suite.md` (1 label)
- Modify: `src/content/case-studies/sportyeah.md` (1 label)
- Modify: `src/content/case-studies/sicmer-mobile.md` (1 label)
- Modify: `scripts/check-build.mjs` (add `collectStoreLinks()` + check 8)

**Interfaces:**
- Consumes: `APP_COUNT` from `src/config/site-stats.mjs` (already exists, value 13)
- Produces: `collectStoreLinks()` in `scripts/check-build.mjs`, returning `{ all, unique, apps }` where `all` is every `{label, url}` found (17), `unique` is deduplicated by `url` (16), and `apps` is a `Map<appName, {stores: string[], urls: string[]}>` keyed by the label text before ` (` (13 entries). Tasks 5's check reuses this.

- [ ] **Step 1: Write the failing check**

Add to `scripts/check-build.mjs`, above the `CHECKS` array — the helper first:

```js
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
```

Then the check itself, appended to the `CHECKS` array:

```js
  {
    name: 'store link labels are shaped "App Name (Store)" and group to APP_COUNT',
    run: ({ assert }) => {
      const { all, unique, apps } = collectStoreLinks();

      assert(all.length === 17, `found ${all.length} store links in case studies, expected 17`);
      assert(unique.length === 16, `found ${unique.length} unique store URLs, expected 16 (SICMER's Google Play URL is listed in two case studies)`);

      for (const link of all) {
        assert(
          /^.+ \(.+\)$/.test(link.label),
          `${link.file}: link label "${link.label}" is not shaped "App Name (Store)" — the CV's published-apps table groups by the text before " ("`
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
```

- [ ] **Step 2: Run the check to verify it fails**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null && npm run build && npm run check
```

Expected: FAIL on the new check, listing ten labels that are not shaped `App Name (Store)` — the four REVO entries, the three Spectrum entries, `"Google Play"` in `sportyeah.md`, `"Google Play"` in `sicmer-mobile.md`, and `"AkíClub / Supermercados Akí (App Store)"` in `corp-favorita-suite.md`. Because assertions collect rather than throw, all ten appear in one run.

The `apps.size === APP_COUNT` assertion will also fail here, at a number below 13, since unshaped labels are skipped by the grouping.

- [ ] **Step 3: Normalize the labels**

In `src/content/case-studies/revo-rideshare.md`, replace the four labels (leave every `url` untouched):

```yaml
links:
  - label: "REVO Rider (App Store)"
    url: "https://apps.apple.com/ni/app/revo-rideshare/id6476524112"
  - label: "REVO Rider (Google Play)"
    url: "https://play.google.com/store/apps/details?id=com.revoride.rider"
  - label: "REVO Driver (App Store)"
    url: "https://apps.apple.com/ni/app/revo-rideshare-driver/id6476524424"
  - label: "REVO Driver (Google Play)"
    url: "https://play.google.com/store/apps/details?id=com.revoride.driver"
```

In `src/content/case-studies/spectrum-aesthetics.md`:

```yaml
  - label: "Spectrum Aesthetics (App Store)"
  - label: "Spectrum HIPAA Portal (App Store)"
  - label: "ibody Aesthetics (App Store)"
```

In `src/content/case-studies/corp-favorita-suite.md`, the one entry pointing at `id6503321015`:

```yaml
  - label: "AkíClub (App Store)"
```

In `src/content/case-studies/sportyeah.md`:

```yaml
  - label: "SportYeah (Google Play)"
```

In `src/content/case-studies/sicmer-mobile.md`:

```yaml
  - label: "SICMER (Google Play)"
```

Leave the six already-correct labels in `corp-favorita-suite.md` (`En Percha (Google Play)`, `Flux (Google Play)`, `Flux Proveedores (Google Play)`, `Analitix (Google Play)`, `SICMER (Google Play)`, `AkíClub (Google Play)`) and the one in `turnly.md` (`Turnly (App Store)`) exactly as they are.

- [ ] **Step 4: Run the check to verify it passes**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null && npm run build && npm run check
```

Expected: 8/8 pass. The grouping now yields exactly 13 apps: En Percha, Flux, Flux Proveedores, Analitix, SICMER, AkíClub, REVO Rider, REVO Driver, Spectrum Aesthetics, Spectrum HIPAA Portal, ibody Aesthetics, SportYeah, Turnly.

- [ ] **Step 5: Prove the APP_COUNT assertion is non-vacuous**

Temporarily change `APP_COUNT` in `src/config/site-stats.mjs` from `13` to `14`, run `npm run build && npm run check`, and confirm check 8 FAILS with "yields 13 apps, but ... APP_COUNT=14". Restore `13` and confirm 8/8 again.

- [ ] **Step 6: Confirm the rendered labels changed**

SportYeah is a non-featured case, so it appears on the homepage only as a title in the More work list — its links render on its own case-study page. Check there:

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null && grep -c 'SportYeah (Google Play)' dist/case-studies/sportyeah/index.html && grep -c 'REVO Rider (App Store)' dist/index.html
```

Expected: both greps return at least 1. REVO is a featured case, so its normalized chip labels ship on the homepage.

- [ ] **Step 7: Commit**

```bash
git add src/content/case-studies scripts/check-build.mjs
git commit -m "refactor(content): normalize store link labels to 'App Name (Store)'

Ten of the seventeen link labels named only the store ('Google Play',
'App Store (Rider)') or omitted it entirely ('Spectrum Aesthetics'). The
CV's published-apps table groups listings by app, and needs the app name
in the label to do it — rendered as-is it would print rows reading
'Google Play — SportYeah'.

Normalizing also makes APP_COUNT derivable: grouping the 16 unique store
URLs by app name yields exactly 13, so check 8 now verifies the constant
instead of trusting it. Publish an app, add its link, forget the bump, and
the build fails."
```

---

### Task 2: Move the active-users figure into site-stats

`Proof.astro` hard-codes `16,500+`. The CV's published-apps heading needs the same figure, and copying the literal into a second file would recreate finding I1 from the whole-branch review — two places holding one number, free to drift.

**Files:**
- Modify: `src/config/site-stats.mjs`
- Modify: `src/components/Proof.astro:28`

**Interfaces:**
- Produces: `ACTIVE_USERS` exported from `src/config/site-stats.mjs`, a display string (`'16,500+'`), not a number — it carries its own thousands separator and `+`, and is rendered verbatim.

- [ ] **Step 1: Add the constant**

In `src/config/site-stats.mjs`, below the existing `APP_COUNT` export:

```js
// Active users across the published B2B apps, as shown in the homepage proof
// band and in the CV's published-apps heading. A display string, not a number:
// it carries its own separator and "+", and both call sites render it verbatim.
// Source: Corporación Favorita suite — En Percha 10K+, Flux 5K+, Flux
// Proveedores 1K+, Analitix 500+.
export const ACTIVE_USERS = '16,500+';
```

- [ ] **Step 2: Read it in Proof.astro**

In the frontmatter of `src/components/Proof.astro`, extend the existing import:

```js
import { APP_COUNT, ACTIVE_USERS } from '../config/site-stats.mjs';
```

And replace the hard-coded figure on line 28:

```astro
        <dd>{ACTIVE_USERS}</dd>
```

- [ ] **Step 3: Verify the rendered output is unchanged**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null && npm run build && npm run check && grep -o '<dd>16,500+</dd>' dist/index.html
```

Expected: 8/8 checks pass and the grep matches exactly once. This is a pure refactor — the built HTML must be byte-identical in this region.

- [ ] **Step 4: Commit**

```bash
git add src/config/site-stats.mjs src/components/Proof.astro
git commit -m "refactor: move the active-users figure to site-stats

The CV's published-apps heading needs the same 16,500+ the proof band
shows. Copying the literal would put one number in two files — the exact
shape of finding I1 from the branch review."
```

---

### Task 3: Make `/cv` findable from the homepage

Two touchpoints, both below the fold: a nav item and a line under the contact cards. This deliberately takes the nav from three items to four, reversing the Task 6 ruling that kept it at three — that ruling was about `/blog`, which is not a hiring surface.

**Files:**
- Modify: `src/components/Navbar.astro` (desktop list + mobile menu)
- Modify: `src/components/Contact.astro` (line + styles)
- Modify: `src/i18n/translations.ts` (`contact.hiring` in both dictionaries)
- Modify: `scripts/check-build.mjs` (check 9)

**Interfaces:**
- Consumes: the `nav.cv` key, already present in both dictionaries since commit `99cdefa`.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Write the failing check**

Append to the `CHECKS` array in `scripts/check-build.mjs`:

```js
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

      const nav = html.slice(0, html.indexOf('</nav>'));
      assert(/href="\/cv"/.test(nav), 'the navbar does not link to /cv');
    },
  },
```

- [ ] **Step 2: Run the check to verify it fails**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null && npm run build && npm run check
```

Expected: FAIL with "homepage has 1 links to /cv" (the footer's, added in `99cdefa`), plus the contact and navbar assertions.

- [ ] **Step 3: Add the nav item**

In `src/components/Navbar.astro`, in the desktop list, after the "How I work" item and before "Contact":

```astro
      <li><a href="/cv" data-i18n="nav.cv">CV</a></li>
```

And in the mobile menu, in the same position:

```astro
    <a href="/cv" data-i18n="nav.cv" onclick="document.getElementById('nav-toggle').checked=false">CV</a>
```

- [ ] **Step 4: Add the contact line**

In `src/components/Contact.astro`, immediately after the closing `</div>` of `.contact-grid` and before the closing `</div>` of `.container`:

```astro
    <p class="contact-hiring reveal">
      <a href="/cv" data-i18n="contact.hiring">Hiring full-time? See the CV</a>
      <span aria-hidden="true">&#8599;</span>
    </p>
```

And in that component's `<style>` block:

```css
  .contact-hiring {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: var(--space-xl);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--color-border);
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  .contact-hiring a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--color-text-muted);
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color var(--transition);
  }

  .contact-hiring a:hover {
    color: var(--color-accent);
  }
```

The line sits after the four contact cards on purpose: the freelance reader's path stays first.

- [ ] **Step 5: Add the translation key**

In `src/i18n/translations.ts`, in the `en` block beside the other `contact.*` keys:

```ts
    'contact.hiring': 'Hiring full-time? See the CV',
```

And in the `es` block:

```ts
    'contact.hiring': '¿Contratando a tiempo completo? Mira el CV',
```

- [ ] **Step 6: Run the checks to verify they pass**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null && npm run build && npm run check
```

Expected: 9/9 pass. Check 7 (i18n parity) must stay green, which proves `contact.hiring` landed in both dictionaries.

- [ ] **Step 7: Prove check 9 is non-vacuous**

Temporarily delete the `<li>` you added to the desktop nav, rebuild, and confirm check 9 FAILS on the navbar assertion. Restore it and confirm 9/9.

- [ ] **Step 8: Verify the tap target in a browser**

Serve `dist/` and measure the new nav link and the contact line's anchor:

```js
[...document.querySelectorAll('.navbar__links a, .contact-hiring a')]
  .map(e => ({ text: e.innerText, h: Math.round(e.getBoundingClientRect().height) }))
  .filter(x => x.h < 44)
```

Expected: an empty array. If the nav link measures under 44px, it inherits the navbar's existing link styles — fix it there rather than special-casing `/cv`, since every nav item has the same problem.

- [ ] **Step 9: Commit**

```bash
git add src/components/Navbar.astro src/components/Contact.astro src/i18n/translations.ts scripts/check-build.mjs
git commit -m "feat: make /cv findable for hiring companies

A recruiter arriving from LinkedIn had no path to the CV — it was built,
in the sitemap, and linked only from the footer. Adds it to the nav and a
line below the contact cards.

Both touchpoints sit below the fold and the contact line comes after the
four cards, so the freelance reader's path is unchanged."
```

---

### Task 4: Replace the stale PDF with a print button

`public/cv/Danny_Barahona_CV.pdf` is dated 31 May; the page has been edited since. The page already carries `@media print` styles, so the browser can render a current PDF on demand.

**Files:**
- Modify: `src/pages/cv.astro:13-16` (the download anchor)
- Modify: `src/i18n/translations.ts` (`cv.print` replaces `cv.download` in both dictionaries)
- Delete: `public/cv/Danny_Barahona_CV.pdf`
- Modify: `scripts/check-build.mjs` (check 10)

**Interfaces:**
- Consumes: `.cv__print-btn`, already styled as a button (`border: none`, `cursor: pointer`, explicit `font-family`) — it was a `<button>` originally and was later swapped to `<a download>`. No CSS changes are needed.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Write the failing check**

Append to the `CHECKS` array in `scripts/check-build.mjs`:

```js
  {
    name: 'the stale CV PDF stays deleted',
    run: ({ assert }) => {
      assert(
        !existsSync(join(DIST, 'cv', 'Danny_Barahona_CV.pdf')),
        'dist/cv/Danny_Barahona_CV.pdf is back — a PDF that drifts from the page is worse than no PDF; the print button renders a current one'
      );

      const cvHtml = readFileSync(join(DIST, 'cv', 'index.html'), 'utf8');
      assert(
        !/Danny_Barahona_CV\.pdf/.test(cvHtml),
        '/cv still references the deleted static PDF'
      );
      assert(
        /window\.print\(\)/.test(cvHtml),
        '/cv has no window.print() handler — the download button was replaced by a print button'
      );
    },
  },
```

This needs `existsSync` — extend the `node:fs` import at the top of the file:

```js
import { readFileSync, readdirSync, existsSync } from 'node:fs';
```

- [ ] **Step 2: Run the check to verify it fails**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null && npm run build && npm run check
```

Expected: FAIL on all three assertions — the PDF is still copied into `dist/cv/`, the page still links it, and there is no `window.print()`.

- [ ] **Step 3: Swap the anchor for a button**

In `src/pages/cv.astro`, replace lines 13–16:

```astro
      <button class="cv__print-btn" type="button" onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
        <span data-i18n="cv.print">Print / Save as PDF</span>
      </button>
```

The icon changes from a download arrow to a printer, because the action changed.

- [ ] **Step 4: Swap the translation key**

In `src/i18n/translations.ts`, replace `'cv.download': 'Download PDF',` with:

```ts
    'cv.print': 'Print / Save as PDF',
```

And in the `es` block, replace `'cv.download': 'Descargar PDF',` with:

```ts
    'cv.print': 'Imprimir / Guardar como PDF',
```

`cv.download` must be removed, not left orphaned — check 7 only catches keys used without a translation, not translations without a use, so a stale key would sit there unnoticed.

- [ ] **Step 5: Delete the PDF**

```bash
git rm public/cv/Danny_Barahona_CV.pdf
```

Leave `public/cv/Certificado_Laboral_Kruger.pdf` alone. It is unlinked but it is a signed document that does not go stale, and Danny attaches it to applications by hand.

- [ ] **Step 6: Run the checks to verify they pass**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null && npm run build && npm run check
```

Expected: 10/10 pass.

- [ ] **Step 7: Verify the button actually prints**

Serve `dist/`, open `/cv`, and intercept the print call rather than opening the dialog:

```js
let called = false;
window.print = () => { called = true; };
document.querySelector('.cv__print-btn').click();
called;  // must be true
```

Expected: `true`.

- [ ] **Step 8: Verify the print layout**

With the page open, emulate print media and confirm the button is hidden and the page renders on white:

```js
[...document.querySelectorAll('.no-print')].map(e => getComputedStyle(e).display)
```

Expected: every entry is `none` when print media is emulated (the `.cv__actions` wrapper carries `.no-print`). Record the observed values.

- [ ] **Step 9: Commit**

```bash
git add src/pages/cv.astro src/i18n/translations.ts scripts/check-build.mjs
git commit -m "feat(cv): print the page instead of serving a stale PDF

public/cv/Danny_Barahona_CV.pdf was dated 31 May and the page had been
edited since — a recruiter downloading it got old data. The page already
has @media print styles, so the browser can render a current PDF and the
two can never diverge.

Deleting the file matters as much as unlinking it: with the button gone it
would still be reachable by direct URL and listed in the sitemap."
```

---

### Task 5: Add the published-apps bridge to the CV

The CV's Experience bullets already say what Danny built. What they cannot say is where to verify it. This adds the one thing a recruiter can check without trusting the document.

**Files:**
- Modify: `src/pages/cv.astro` (frontmatter, header line, new section before line 227's Cloud Infrastructure block)
- Modify: `src/i18n/translations.ts` (`cv.published` in both dictionaries)
- Modify: `scripts/check-build.mjs` (check 11)

**Interfaces:**
- Consumes: `collectStoreLinks()` from Task 1 (in the check), `APP_COUNT` and `ACTIVE_USERS` from Task 2.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Write the failing check**

Append to the `CHECKS` array in `scripts/check-build.mjs`:

```js
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

      for (const app of apps.keys()) {
        assert(
          section.includes(app),
          `the CV's published-apps section does not name "${app}"`
        );
      }

      assert(
        /korbold\.vercel\.app/.test(cvHtml),
        'the CV header does not spell out the portfolio URL — in a printed or forwarded PDF an <a> is dead'
      );
    },
  },
```

- [ ] **Step 2: Run the check to verify it fails**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null && npm run build && npm run check
```

Expected: FAIL with "no published-apps section on /cv".

- [ ] **Step 3: Build the app list in the page frontmatter**

At the top of `src/pages/cv.astro`, replace the frontmatter with:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import { APP_COUNT, ACTIVE_USERS } from '../config/site-stats.mjs';

// The published-apps table is derived from the `links` frontmatter of the case
// studies, which is the site's single source of truth for what shipped and
// where. Adding a link to a case study is all it takes to appear here, on the
// homepage, and in the counts.
const cases = await getCollection('case-studies');

const seen = new Set();
const apps = new Map();
for (const entry of cases) {
  for (const link of entry.data.links ?? []) {
    if (seen.has(link.url)) continue;
    seen.add(link.url);

    // "AkíClub (Google Play)" -> app "AkíClub", store "Google Play"
    const match = link.label.match(/^(.+) \((.+)\)$/);
    if (!match) continue;
    const [, name, store] = match;

    if (!apps.has(name)) {
      apps.set(name, {
        name,
        client: entry.data.client,
        clientEs: entry.data.clientEs ?? entry.data.client,
        stores: [],
      });
    }
    apps.get(name).stores.push({ store, url: link.url });
  }
}

const publishedApps = [...apps.values()];
const listingCount = seen.size;
---
```

- [ ] **Step 4: Add the portfolio line to the header**

In `src/pages/cv.astro`, immediately after the `.cv__open-to` paragraph:

```astro
      <p class="cv__portfolio">
        <span class="lang-en">Portfolio with screenshots and store links &rarr; </span>
        <span class="lang-es">Portfolio con capturas y links a tiendas &rarr; </span>
        <a href="https://korbold.vercel.app">korbold.vercel.app</a>
      </p>
```

The URL is written as text, not hidden behind link words, because on paper and in a forwarded PDF an `<a>` is dead.

- [ ] **Step 5: Add the published-apps section**

In `src/pages/cv.astro`, immediately before the `<!-- Cloud Infrastructure Highlights -->` comment (line 227 before this task's edits):

```astro
    <!-- Published apps -->
    <section id="published-apps" class="cv__section">
      <h2 class="cv__section-title">
        <span class="lang-es">Apps Publicadas</span>
        <span class="lang-en">Published Apps</span>
      </h2>
      <p class="cv__job-context" data-app-count={APP_COUNT}>
        <span class="lang-en">{ACTIVE_USERS} active users &middot; {APP_COUNT} apps &middot; {listingCount} store listings across the US and Ecuador</span>
        <span class="lang-es">{ACTIVE_USERS} usuarios activos &middot; {APP_COUNT} apps &middot; {listingCount} publicaciones en tiendas de EE.UU. y Ecuador</span>
      </p>
      <ul class="cv__apps">
        {publishedApps.map((app) => (
          <li class="cv__app">
            <span class="cv__app-name">{app.name}</span>
            <span class="cv__app-stores">
              {app.stores.map((s, i) => (
                <Fragment>
                  {i > 0 && <span aria-hidden="true"> &middot; </span>}
                  <a href={s.url} target="_blank" rel="noopener noreferrer">{s.store}</a>
                </Fragment>
              ))}
            </span>
            <span class="cv__app-client lang-en">{app.client}</span>
            <span class="cv__app-client lang-es">{app.clientEs}</span>
          </li>
        ))}
      </ul>
    </section>
```

And in the page's `<style>` block, beside the other `.cv__*` rules:

```css
  .cv__apps {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .cv__app {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.15rem;
    padding: var(--space-sm) 0;
    border-bottom: 1px solid var(--color-border);
    font-size: var(--font-size-sm);
  }

  .cv__app-name {
    font-weight: 600;
  }

  .cv__app-client {
    color: var(--color-text-muted);
  }

  @media (min-width: 700px) {
    .cv__app {
      grid-template-columns: 1fr auto 1fr;
      align-items: baseline;
      gap: var(--space-md);
    }

    .cv__app-client {
      text-align: right;
    }
  }

  @media print {
    .cv__app {
      break-inside: avoid;
      border-bottom: 1px solid #ddd;
    }
  }
```

- [ ] **Step 6: Add the translation key**

`cv.published` is listed in the spec, but the heading above uses paired `lang-en`/`lang-es` spans like every other `.cv__section-title` on this page, so no `data-i18n` key is needed. Do **not** add `cv.published` — an unused dictionary entry is exactly the kind of dead weight `cv.download` became. Note this deviation in the ledger.

- [ ] **Step 7: Run the checks to verify they pass**

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null && npm run build && npm run check
```

Expected: 11/11 pass.

- [ ] **Step 8: Prove check 11 is non-vacuous**

Temporarily delete one `- label:`/`url:` pair from `turnly.md`, rebuild, and confirm check 11 FAILS on both the link count and the missing "Turnly" app name. Restore it and confirm 11/11.

- [ ] **Step 9: Verify both languages on the page**

Serve `dist/`, open `/cv`, and for each language confirm the opposite one is fully hidden:

```js
const vis = (el) => getComputedStyle(el).display !== 'none';
({
  dataLang: document.documentElement.getAttribute('data-lang'),
  en: [...document.querySelectorAll('.lang-en')].filter(vis).length,
  es: [...document.querySelectorAll('.lang-es')].filter(vis).length,
  apps: document.querySelectorAll('.cv__app').length,
})
```

Expected: with `data-lang="en"`, a positive `en` count and `es: 0`; with `es`, the inverse. `apps` must be 13 in both. Set the language via `localStorage.setItem('lang', 'es')` followed by a reload, not by writing the attribute by hand — that exercises the real path.

- [ ] **Step 10: Verify the print layout**

Emulate print media and confirm the section fits and breaks cleanly:

```js
[...document.querySelectorAll('.cv__app')].map(e => Math.round(e.getBoundingClientRect().width)).filter(w => w === 0).length
```

Expected: `0` — no row collapses. Take a print-media screenshot and confirm the published-apps block is legible on white, the store links read as text, and the portfolio URL is visible in the header.

- [ ] **Step 11: Commit**

```bash
git add src/pages/cv.astro scripts/check-build.mjs
git commit -m "feat(cv): list the published apps with their store listings

The CV said what Danny built; it could not say where to verify it. This
adds the 13 apps and their 16 store listings, derived at build time from
the links frontmatter of the case studies rather than typed by hand.

Store listings rather than case-study prose on purpose: the Experience
bullets already name AkiClub, En Percha and Flux, so restating them would
be half the CV again, and prose written to sell a project reads as
marketing to the tech lead the PDF gets forwarded to.

The header also spells out korbold.vercel.app as text — in print an <a>
is dead."
```

---

## Post-Plan Verification

After Task 5, run the full suite once more and record the evidence:

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22 >/dev/null && npm run build && npm run check
```

Expected: 11/11.

Then confirm end to end, in a browser against the built `dist/`:

1. From the homepage, the nav's `CV` item reaches `/cv`.
2. From the homepage's contact section, the hiring line reaches `/cv`.
3. `/cv` renders 13 apps and 16 store links, in both languages.
4. The print button opens the browser's print flow, and the printed layout hides the button and keeps the app table intact.
5. No file under `dist/` mentions `Danny_Barahona_CV.pdf`.

## Accepted Risk

If an app is published and its link is not added to a case study, it silently disappears from the CV, the homepage and the counts. Nothing in the repo can detect this — the store listings are the source of truth and they live outside it. Recorded knowingly; the same gap already applies to the proof band.
