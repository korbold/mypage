# Recruiter route on korbold.vercel.app — design

Date: 2026-08-12
Branch: `redesign/product-first` (post-`99cdefa`)
Status: approved by Danny, ready for an implementation plan

## Problem

The site is calibrated freelance-first by a deliberate 2026-08-11 decision: reader #1 is an
Upwork client. The hero, "How I work" and Contact all speak to a founder buying a project.

That leaves a second reader unserved. Danny also applies to companies — contractor work,
full-time payroll, and staff-augmentation consultancies — and those readers arrive from a
LinkedIn profile or a CV, looking for evidence, not a sales page. The site has a complete
CV at `/cv` (681 lines, bilingual, print-styled), but until `99cdefa` nothing linked to it,
and today only the footer does. A recruiter does not find it.

Danny's ruling: serve all employer types with **one generic route** — no per-contract-type
copy — and keep it **discreet**, so the freelance framing above the fold is untouched.

## Non-goals

- No change to the hero, the proof band, "How I work", or the homepage section order.
- No second CTA competing with "Start a project".
- No copy that segments recruiters by contract type.
- No redesign of the CV page itself. It is complete; it needs an entrance and one new block.

## Design

### 1. Discoverability — two touchpoints, both below the fold

**Navbar** (`src/components/Navbar.astro`): `CV` becomes the fourth item, in both the desktop
list and the mobile menu. The `nav.cv` key already exists in both dictionaries (added in
`99cdefa`).

This intentionally reverses the Task 6 ruling that kept the nav at three items. That ruling
was about `/blog`, which is not a hiring surface; the reasoning does not transfer.

**Contact** (`src/components/Contact.astro`): one line below the four contact cards.

```
EN  Hiring full-time? See the CV ↗
ES  ¿Contratando a tiempo completo? Mirá el CV ↗
```

New i18n key `contact.hiring`. Placed after the cards so the primary contact path stays
first for the freelance reader.

### 2. The CV page — print button

The download button becomes `<button onclick="window.print()">`, letting the browser render
the PDF from the page, which already carries `@media print` styles. `.cv__print-btn` is
already styled as a button (`border: none`, `cursor: pointer`, explicit `font-family`) —
it was originally a button and was later swapped to an `<a download>`.

`cv.download` is replaced by `cv.print` in both dictionaries.

**`public/cv/Danny_Barahona_CV.pdf` is deleted.** It is dated 31 May, the page has been
edited since, and the two have already diverged. With no button linking it, it would remain
reachable by direct URL — a stale PDF circulating with old data is worse than none.

`public/cv/Certificado_Laboral_Kruger.pdf` stays as-is: unlinked, but it is a signed
document that does not go stale, and Danny attaches it to applications by hand.

### 3. The CV page — bridge to the published work

Two additions, serving the two ways a CV is consumed.

**A line in the header**, under "Open to senior remote roles":

```
EN  Portfolio with screenshots and store links → korbold.vercel.app
ES  Portfolio con capturas y links a tiendas → korbold.vercel.app
```

The URL is written out, not merely linked. On paper and in a forwarded PDF an `<a>` is dead.

**A "Published apps" section after Experience**, built at build time from the `links` arrays
of `src/content/case-studies/*.md`, deduplicated by URL, grouped by app, with its client:

```
PUBLISHED APPS · 16,500+ active users · 13 apps across US and Ecuador stores

En Percha            Google Play              Corporación Favorita
Flux                 Google Play              Corporación Favorita
Flux Proveedores     Google Play              Corporación Favorita
Analitix             Google Play              Corporación Favorita
SICMER               Google Play              Corporación Favorita
AkíClub              Google Play · App Store  Corporación Favorita
REVO Rider           App Store · Google Play  PNP Capital Ventures
REVO Driver          App Store · Google Play  PNP Capital Ventures
Spectrum Aesthetics  App Store                360 Integrations
Spectrum HIPAA Portal App Store               360 Integrations
ibody Aesthetics     App Store                360 Integrations
SportYeah            Google Play              SportYeah
Turnly               App Store                Personal project
```

New i18n key `cv.published` for the heading. Client names read from `client` / `clientEs`,
so the column localizes with the rest of the page.

The `16,500+` in that heading is hand-written in `Proof.astro` today (`<dd>16,500+</dd>`).
Rather than copy the literal into a second file, move it to `src/config/site-stats.mjs` as
`ACTIVE_USERS` beside `APP_COUNT`, and have both `Proof.astro` and `/cv` read it — the same
single-source rule the app count already follows.

#### Prerequisite: normalize the link labels

The grouping above is not derivable from today's data. The 16 labels are inconsistent — six
name the app (`"AkíClub (Google Play)"`), the rest name only the store (`"Google Play"`,
`"App Store (Rider)"`). Rendered as-is, the CV would print rows like "Google Play —
SportYeah".

So this work first rewrites every label to the form `App Name (Store)`. Ten of the seventeen
change: four in `revo-rideshare.md`, three in `spectrum-aesthetics.md`, and one each in
`corp-favorita-suite.md`, `sportyeah.md` and `sicmer-mobile.md`. The six correct labels in
`corp-favorita-suite.md` and the one in `turnly.md` stay as they are. The app name is then
the text before ` (`, and the store is the text inside the parentheses.

Two consequences beyond the CV:

- The homepage case cards stop showing a chip that reads "Google Play" and show
  "SportYeah (Google Play)" instead — an improvement to a weak label that already ships.
- Grouping the 16 deduplicated URLs by app name yields **exactly 13 groups**, matching
  `APP_COUNT`. That makes check 9 able to verify the constant instead of trusting it: publish
  an app, forget to bump `APP_COUNT`, and the build fails.

`Proof.astro` keeps its own hand-written `stores` array of 6 chips and is unaffected.

**Why store listings rather than case-study prose.** The first sketch was
`client · title · result` per featured case. Reading the actual content killed it: the
`result` fields run 2–3 lines each, and the CV's Experience section already carries bullets
naming AkíClub, En Percha and Flux under Kruger. That block would have restated half the CV.

The store listing is the one thing the CV does not already say and a recruiter can verify
without trusting anything. It also survives the forward: case-study prose is written to sell
a project and reads as marketing to a tech lead, while a list of apps and their stores reads
as evidence. And it maintains itself — a new app gets its link added to one case study and
then appears in the CV, on the homepage, and in the count.

The header metric line exists so the block does not open cold; the impact numbers themselves
stay where they are, in the Experience bullets.

### 4. Numbers come from one source

The `13` is `APP_COUNT` from `src/config/site-stats.mjs`, the constant `Proof.astro` and
`scripts/check-build.mjs` already share. The `16` is computed at build time from the
deduplicated `links`. Neither is typed by hand, so the CV cannot contradict the homepage —
which is exactly finding I1 from the whole-branch review, made structurally impossible.

## Verification

The repo has no test runner. Everything anchors on `scripts/check-build.mjs`, currently 7/7.
Three new checks, each proven non-vacuous by mutation before being accepted:

**Check 8 — the recruiter route exists and is findable.** `dist/index.html` contains
`href="/cv"` at least twice (nav + Contact), and `dist/cv/index.html` exists. Proven by
removing the nav item and observing FAIL.

**Check 9 — the CV cannot contradict the homepage, and `APP_COUNT` is derived, not trusted.**
Extract every `links` entry from `src/content/case-studies/*.md`, deduplicate by URL (17
entries, 16 unique — SICMER's Google Play URL appears in two case studies), then group by the
app name preceding ` (` in the label. Assert: the group count equals `APP_COUNT` (13), the
unique-URL count equals the listing figure rendered on `/cv` (16), and the app figure rendered
on `/cv` equals `APP_COUNT`. Also assert every label matches `/^.+ \(.+\)$/`, so a future
label written in the old shape fails loudly instead of silently mis-grouping.

**Check 10 — the dead PDF does not come back.** No file under `dist/` references
`Danny_Barahona_CV.pdf`, and the file is absent from `dist/cv/`.

The existing i18n parity check covers `contact.hiring`, `cv.print` and `cv.published` with
no modification.

**Manual verification, with evidence recorded, before the work is called done:**

- `/cv` in EN and in ES: zero elements of the opposite language computed visible.
- Emulated `@media print`: the published-apps block fits, the print button is hidden, and
  the portfolio URL is legible as text.
- The nav's `CV` item measures ≥ 44px, matching the rest.
- `window.print` fires from the button, verified by intercepting it.

## Accepted risk

If Danny publishes an app and does not add its link to a case study, the CV omits it
silently. Nothing in the repo can detect this — the store listings are the source of truth
and they live outside it. Accepted knowingly; the same gap already exists for the homepage
proof band.

## Files touched

| File | Change |
|---|---|
| `src/components/Navbar.astro` | `CV` as the fourth nav item, desktop + mobile |
| `src/components/Contact.astro` | "Hiring full-time?" line under the contact cards |
| `src/pages/cv.astro` | print button, portfolio line in the header, published-apps section |
| `src/content/case-studies/*.md` | six link labels normalized to `App Name (Store)` |
| `src/i18n/translations.ts` | `contact.hiring`, `cv.print` (replaces `cv.download`), `cv.published` |
| `src/config/site-stats.mjs` | `ACTIVE_USERS` added beside `APP_COUNT` |
| `src/components/Proof.astro` | reads `ACTIVE_USERS` instead of the hard-coded `16,500+` |
| `scripts/check-build.mjs` | checks 8, 9, 10 |
| `public/cv/Danny_Barahona_CV.pdf` | deleted |
