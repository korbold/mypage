# freelance-ops — Design Spec
**Date:** 2026-06-12  
**Status:** Approved for implementation

---

## Overview

Claude Code skill for automated freelance job hunting on Upwork (MVP), extensible to Workana and others. Uses browser-pilot MCP to browse authenticated sessions, validate job posts, draft proposals, and submit them with user confirmation.

---

## Architecture

### Skill location
```
~/.claude/skills/freelance-ops/
  SKILL.md                    # router
  modes/
    _shared.md                # user profile, CV paths, platform config
    scan.md                   # browse Upwork, collect qualifying jobs
    validate.md               # score a single job URL
    propose.md                # full-auto: validate → draft → confirm → send
    pipeline.md               # process queue from data/pipeline.md
    tracker.md                # view proposal history + reply rates
    patterns.md               # analyze what converts
  data/
    filters.json              # editable: budget thresholds, negative keywords
    tracker.json              # append-only: every proposal sent
    pipeline.md               # inbox: one job URL per line
```

### Commands
```
/freelance-ops                  → show menu
/freelance-ops {URL}            → auto-pipeline: validate + propose
/freelance-ops scan             → browse Upwork, populate pipeline
/freelance-ops pipeline         → process all URLs in data/pipeline.md
/freelance-ops validate {URL}   → validate only, no proposal sent
/freelance-ops tracker          → proposal history table
/freelance-ops patterns         → conversion analysis + filter recommendations
```

---

## Validation Logic

### Hard filters (any fail = SKIP, no Connects spent)

| Check | Condition |
|-------|-----------|
| Payment verified | Not verified → SKIP |
| Client rating | < 4.8★ → SKIP |
| Prior hires | 0 → SKIP |
| Budget | < `filters.json` thresholds → SKIP |
| Negative keywords | Any match in JD → SKIP |

### Default `filters.json`
```json
{
  "budget": {
    "fixed_min": 300,
    "hourly_min": 15
  },
  "negative_keywords": [
    "cheapest", "budget is $5", "entry level only", "very simple",
    "just a few hours", "asap cheap", "quick fix cheap", "low budget"
  ],
  "boost_threshold": 4
}
```

### Priority score (orders queue, does not block)

| Signal | Points |
|--------|--------|
| Client total spent > $10k | +2 |
| Reviews > 10 | +1 |
| JD length > 200 words | +1 |

Jobs with score ≥ `boost_threshold` (default: 4) get a Boost proposal.

---

## CV Auto-Selection

| Keywords in JD | CV used |
|----------------|---------|
| flutter, dart, widget, bloc, riverpod | `Danny_Barahona_CV_Flutter_EN.pdf` |
| react native, RN, expo, metro | `Danny_Barahona_CV_RN_EN.pdf` |
| anything else / fullstack / ambiguous | `Danny_Barahona_CV_Flutter_EN.pdf` |

---

## Full-Auto Proposal Flow

```
1. VALIDATE
   └─ browser_get_content(job URL)
   └─ Extract: client rating, payment verified, hires, budget, keywords
   └─ If any hard filter fails → log SKIPPED + reason → next job

2. DRAFT
   └─ Read full JD
   └─ Identify primary pain point
   └─ Select CV based on keywords
   └─ Write proposal:
       - Hook (1 sentence): address their specific problem
       - Relevant experience (2-3 sentences): concrete portfolio example
       - CTA: "Can we talk this week?"
   └─ Calculate bid: midpoint of client's budget range

3. CONFIRM (Y/N)
   └─ Display to user:
       - Job title + client info (rating, hires, total spent)
       - Score breakdown + approval reason
       - Full proposal draft
       - CV selected + bid amount
   └─ Wait for Y/N

4. SEND (if Y)
   └─ browser_navigate(job URL)
   └─ browser_click("Submit a Proposal")
   └─ browser_fill(cover letter, proposal text)
   └─ browser_fill(bid amount)
   └─ browser_click("Send Proposal")
   └─ browser_screenshot() → verify success

5. LOG
   └─ Append to tracker.json:
       { date, job_title, client_rating, client_hires, budget,
         bid, cv_used, score, status: "sent" }
```

---

## Tracker Schema

```json
{
  "date": "2026-06-12",
  "job_title": "Flutter Developer for E-commerce App",
  "client_rating": 4.9,
  "client_hires": 5,
  "budget": "$800",
  "bid": "$750",
  "cv_used": "Flutter",
  "score": 5,
  "boosted": true,
  "status": "sent | replied | hired | rejected | ghosted"
}
```

---

## Tracker View (`/freelance-ops tracker`)

```
Proposals — last 30 days
─────────────────────────────────────
Sent: 12  |  Replied: 4  |  Hired: 1  |  Ghosted: 7
Reply rate: 33%  |  Win rate: 8%

PENDING REPLY (>48h):
- Flutter E-commerce (Jun 10) — $750 bid
- RN Food App (Jun 11) — $1,200 bid
```

---

## Patterns Analysis (`/freelance-ops patterns`)

Analyzes `tracker.json` and outputs:
- Job categories with highest reply rate
- Budget ranges that convert best
- Minimum score worth applying to
- Flutter CV vs RN CV win comparison
- Recommendations to update `filters.json`

---

## Extensibility

New platforms (Workana, Indeed) added as `adapters/workana.md` with platform-specific DOM selectors and validation field mappings. Core validation logic and proposal flow in `_shared.md` stays unchanged.

---

## Dependencies

- `browser-pilot` MCP server running (`upwork.com` in allowlist)
- User authenticated in Upwork in browser
- CV PDFs at:
  - `/Users/korbold/Developer/Freelancer/Korbold/Danny_Barahona_CV_Flutter_EN.pdf`
  - `/Users/korbold/Developer/Freelancer/Korbold/Danny_Barahona_CV_RN_EN.pdf`
