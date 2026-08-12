# korbold.vercel.app — Product-First Redesign

**Date:** 2026-08-11
**Status:** Approved, ready for planning
**Repo:** `~/Developer/Freelancer/Korbold` (Astro v6, no UI framework, CSS custom properties)

## Goal

Turn the personal site into a page that gets an Upwork client to send a message. Today it reads as a template: no app visuals, generic section copy, and a lot of empty vertical space.

**Primary reader:** freelance/Upwork clients evaluating whether to hire Danny for a mobile build. Not recruiters, not peers. Everything below optimizes for that reader.

**Success looks like:** a client who lands cold can tell within one screen that Danny ships real apps to real stores, and finds a specific reason and an easy way to write.

## Constraints

- Keep Astro v6, the existing CSS custom-property token system, and the content-collection structure. This is a rework, not a rewrite.
- Keep the EN/ES toggle. Default EN — most clients are US-based.
- No new runtime dependencies and no UI framework. The site stays zero-JS-framework.

## Current state (audited 2026-08-11)

- Homepage is 8142px tall across 10 sections with large dead gaps between them.
- Zero app screenshots on the site, while `public/upwork-portfolio/` holds ~40 screenshots and 6 collages.
- Generic template aesthetic: gradient headline, radial glow blob, three "What I do" cards.
- 45 of 51 `.reveal` elements sit at `opacity: 0` until IntersectionObserver fires.
- One anonymous testimonial ("Tech Lead, Kruger Corp"), which reads as fabricated.
- Nine case studies compete for attention; `kruger-corp` and `corp-favorita-suite` cover the same client and period and appear as cases 01 and 02.

Screenshot coverage against case studies:

| Project | Screenshots | Case study |
|---|---|---|
| Corp. Favorita (akiclub, analitix, sicmer, collage) | 9 | yes |
| Turnly | 6 | yes |
| REVO | 6 | yes |
| SportYeah | 5 | yes |
| Spectrum | 6 | **missing** |
| 360io | 6 | **missing** |
| aws-backend, beez-delivery, legaltech-ecuador | 0 | yes |
| kruger-corp | 0 | yes (duplicates corp-favorita-suite) |

Thirteen real store URLs already live in the case-study markdown. Those URLs are **listings, not apps** — REVO's rider and driver apps and AkíClub each appear on two stores, so the thirteen links resolve to roughly ten distinct published apps. The current site's `Stats` claims "9 apps shipped". These are the hard proof the page will lean on, so the headline count must be counted from the links and stated as one number used consistently everywhere, rather than carried over from the old copy. Overstating it costs exactly the credibility the section exists to build.

## Design decisions

**Visual direction: product-first.** The first screen is the work, not the bio — a mosaic of real app screenshots with the copy overlaid. Chosen over a refined-dark evolution and a light-editorial direction because an Upwork client scans for "does this person ship real apps" before reading anything.

**Featured work: five projects.** Corporación Favorita (suite), Turnly, REVO, Spectrum, 360io. Each has strong visuals, which product-first requires. `kruger-corp` merges into the Corp. Favorita case rather than standing as a second entry. SportYeah, aws-backend, beez-delivery, and legaltech-ecuador drop to a compressed text list.

**Social proof: store links, not quotes.** There is no attributable testimonial yet, so the testimonial section is removed rather than filled with an anonymous quote. Its job passes to store badges, user counts, and client logos.

## Page architecture

Ten sections become six.

| # | Section | Content |
|---|---|---|
| 1 | Hero | Screenshot mosaic, headline, availability badge, primary CTA to work + secondary to contact |
| 2 | Hard proof | 16.5K active users · published-app count · client logos — store links clickable, not decorative |
| 3 | Work | Five cases, each with screenshots and a situation → challenge → what I built → result arc |
| 4 | How I work | Replaces "What I do". Process, what to expect, which projects suit Danny and which don't. Carries his portrait and a one-line tech list. |
| 5 | More work | SportYeah, AWS, Beez, LegalTech compressed to one line each |
| 6 | Contact | Specific warm invitation ("write me if…") plus footer |

Removed: `Stats` (folds into hard proof), `Services` (three generic cards), the large `TechStack` grid (compressed to one line inside How I work), `Testimonials` (no material), `BlogPreview` (becomes a footer link).

## Components

**Hero.** Five phone frames — Turnly, Spectrum, 360io, SportYeah, REVO — behind a gradient veil with centered copy. The mosaic is chosen for visual variety across shipped apps, so it is not restricted to the five featured cases; SportYeah appears here while its written case sits in More work. Below 900px it shows three phones with the rest cropped. Performance matters more here than anywhere else on the site, since five images sit in the LCP path: they go through `astro:assets` with AVIF/WebP and `srcset`, and the center image carries `fetchpriority="high"`. The portrait (`danny.jpg`, currently loaded unoptimized at 896×1195) moves to How I work, where a client actually wants a face.

**Case card.** Number · client · period · role → headline → problem/solution paragraph → result with the numbers in bold → a row of 2–4 screenshots → tech tags → clickable store badges. The existing numbered editorial list is the strongest thing on the current site; this extends it rather than replacing it.

**Hard-proof band.** Counts and client logos in a single horizontal band, each store badge linking out.

**Reveal fix.** An inline `<head>` script adds a `.js` class to `<html>`; `.reveal` only hides under `html.js`. Without JavaScript everything renders visible, instead of the page going black below the hero.

**Spacing.** Section vertical rhythm tightens by roughly 35% and the dead gaps go. Target: 8142px → about 4500px.

## Content to write

- Two new case studies: **Spectrum Aesthetics** and **360io**, following the same frontmatter shape as the existing ones.
- New copy for hero, How I work, and contact, added to `src/i18n/translations.ts` in both EN and ES.
- **Blocked on Danny:** store URLs for Spectrum and 360io. Both were published (their screenshots came from the App Store), but no link exists in the repo. Every other featured project already has one.

## Risks

- With testimonials gone, all social proof rests on the store links. If they render as decoration rather than obvious outbound links, the page loses its only third-party validation.
- Product-first exposes screenshot quality. `revo-1.png` is 392×696, the smallest in the set; it is fine at the ~110px render width the mosaic uses, but not at larger sizes.
- Five hero images can regress LCP if the `astro:assets` work is skipped.

## Out of scope

Blog redesign, the `/cv` page, case-study detail-page layout, and any change to the Upwork profile itself ([[project-upwork-portfolio]]).
