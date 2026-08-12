// Single source of truth for the "apps published" figure, rendered on the
// homepage proof band (Proof.astro) and on the CV's published-apps heading
// (src/pages/cv.astro). scripts/check-build.mjs imports this exact file so
// the rendered count and the enforced count can never drift apart — the
// derivation (distinct apps behind the store URLs in
// src/content/case-studies/) is mechanized in that script's
// collectStoreLinks(), not hand-counted.
export const APP_COUNT = 13;

// Active users across the published B2B apps, as shown in the homepage proof
// band and in the CV's published-apps heading. A display string, not a number:
// it carries its own separator and "+", and both call sites render it verbatim.
// Source: Corporación Favorita suite — En Percha 10K+, Flux 5K+, Flux
// Proveedores 1K+, Analitix 500+.
export const ACTIVE_USERS = '16,500+';
