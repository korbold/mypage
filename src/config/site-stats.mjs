// Single source of truth for the "apps published" figure in the proof band.
// scripts/check-build.mjs imports this exact file so the rendered count and
// the enforced count can never drift apart — see Proof.astro for the
// derivation (distinct apps behind the store URLs in src/content/case-studies/).
export const APP_COUNT = 13;
