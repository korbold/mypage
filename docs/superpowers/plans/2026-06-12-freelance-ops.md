# freelance-ops Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude Code skill that scans Upwork, validates jobs against hard filters, drafts proposals, and submits them with a single Y/N confirmation.

**Architecture:** Pure markdown skill files in `~/.claude/skills/freelance-ops/`. No compiled code. Claude reads skill files and uses browser-pilot MCP tools to interact with authenticated Upwork sessions. State persists in JSON/markdown data files.

**Tech Stack:** Claude Code skill (markdown), browser-pilot MCP (`browser_navigate`, `browser_get_content`, `browser_click`, `browser_fill`, `browser_screenshot`), JSON for config/tracker.

---

## File Map

| File | Responsibility |
|------|---------------|
| `SKILL.md` | Route `/freelance-ops` commands to mode files |
| `modes/_shared.md` | User profile, CV paths, platform config, data file paths |
| `modes/scan.md` | Browse Upwork search, collect job URLs that pass quick filters |
| `modes/validate.md` | Deep-validate a single job URL, return score + pass/skip |
| `modes/propose.md` | Full pipeline: validate → draft proposal → Y/N → send → log |
| `modes/pipeline.md` | Process all URLs in `data/pipeline.md` through propose flow |
| `modes/tracker.md` | Read `data/tracker.json`, display formatted table |
| `modes/patterns.md` | Analyze `data/tracker.json`, output filter recommendations |
| `data/filters.json` | Editable hard filter config: budget thresholds, negative keywords |
| `data/tracker.json` | Append-only proposal history |
| `data/pipeline.md` | Inbox: one Upwork job URL per line |

---

## Task 1: Scaffold directory + SKILL.md router

**Files:**
- Create: `~/.claude/skills/freelance-ops/SKILL.md`

- [ ] **Step 1: Create skill directory**

```bash
mkdir -p ~/.claude/skills/freelance-ops/modes
mkdir -p ~/.claude/skills/freelance-ops/data
```

- [ ] **Step 2: Write SKILL.md**

```bash
cat > ~/.claude/skills/freelance-ops/SKILL.md << 'EOF'
---
name: freelance-ops
description: Automated freelance job hunting — scan Upwork, validate jobs, send proposals
arguments: mode
user-invocable: true
argument-hint: "[scan | validate | propose | pipeline | tracker | patterns]"
license: MIT
---

# freelance-ops — Router

## Mode Routing

Determine mode from `$mode`:

| Input | Mode |
|-------|------|
| (empty / no args) | `discovery` |
| Upwork job URL | `auto-pipeline` |
| `scan` | `scan` |
| `validate` | `validate` |
| `propose` | `propose` |
| `pipeline` | `pipeline` |
| `tracker` | `tracker` |
| `patterns` | `patterns` |

**Auto-pipeline detection:** If `$mode` contains `upwork.com/jobs/` or `upwork.com/nx/jobs/`, execute `propose` mode with that URL as the target job.

## Discovery Mode

Show this menu:

```
freelance-ops — Command Center

  /freelance-ops {URL}      → AUTO: validate + propose
  /freelance-ops scan       → Browse Upwork, collect qualifying jobs
  /freelance-ops pipeline   → Process all URLs in data/pipeline.md
  /freelance-ops validate   → Validate single job URL (no proposal sent)
  /freelance-ops tracker    → Proposal history + reply rates
  /freelance-ops patterns   → Conversion analysis + filter recommendations
```

## Context Loading

All modes: Read `modes/_shared.md` then `modes/{mode}.md`, then execute.

For `scan`, `propose`, `pipeline`: launch as Agent with `_shared.md` + mode file content injected into subagent prompt.
EOF
```

- [ ] **Step 3: Verify file created**

```bash
cat ~/.claude/skills/freelance-ops/SKILL.md | head -5
```

Expected output: frontmatter with `name: freelance-ops`

- [ ] **Step 4: Commit**

```bash
cd ~/.claude/skills/freelance-ops
git init
git add SKILL.md
git commit -m "feat: scaffold freelance-ops skill router"
```

---

## Task 2: data/filters.json + tracker.json + pipeline.md

**Files:**
- Create: `~/.claude/skills/freelance-ops/data/filters.json`
- Create: `~/.claude/skills/freelance-ops/data/tracker.json`
- Create: `~/.claude/skills/freelance-ops/data/pipeline.md`

- [ ] **Step 1: Write filters.json**

```bash
cat > ~/.claude/skills/freelance-ops/data/filters.json << 'EOF'
{
  "budget": {
    "fixed_min": 300,
    "hourly_min": 15
  },
  "rating_min": 4.8,
  "hires_min": 1,
  "negative_keywords": [
    "cheapest",
    "budget is $5",
    "entry level only",
    "very simple",
    "just a few hours",
    "asap cheap",
    "quick fix cheap",
    "low budget",
    "we don't have much budget",
    "just need someone cheap"
  ],
  "boost_threshold": 4,
  "cv_keywords": {
    "flutter": ["flutter", "dart", "widget", "bloc", "riverpod", "getx", "provider"],
    "react_native": ["react native", "react-native", "rn developer", "expo", "metro bundler"]
  },
  "cv_paths": {
    "flutter": "/Users/korbold/Developer/Freelancer/Korbold/Danny_Barahona_CV_Flutter_EN.pdf",
    "react_native": "/Users/korbold/Developer/Freelancer/Korbold/Danny_Barahona_CV_RN_EN.pdf",
    "default": "/Users/korbold/Developer/Freelancer/Korbold/Danny_Barahona_CV_Flutter_EN.pdf"
  }
}
EOF
```

- [ ] **Step 2: Write tracker.json (empty array)**

```bash
echo '[]' > ~/.claude/skills/freelance-ops/data/tracker.json
```

- [ ] **Step 3: Write pipeline.md**

```bash
cat > ~/.claude/skills/freelance-ops/data/pipeline.md << 'EOF'
# freelance-ops Pipeline Inbox

Add one Upwork job URL per line below. Run `/freelance-ops pipeline` to process.

<!-- JOBS -->
EOF
```

- [ ] **Step 4: Verify**

```bash
cat ~/.claude/skills/freelance-ops/data/filters.json | python3 -m json.tool > /dev/null && echo "Valid JSON"
```

Expected: `Valid JSON`

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/skills/freelance-ops
git add data/
git commit -m "feat: add data files — filters, tracker, pipeline inbox"
```

---

## Task 3: modes/_shared.md — user profile + platform config

**Files:**
- Create: `~/.claude/skills/freelance-ops/modes/_shared.md`

- [ ] **Step 1: Write _shared.md**

```bash
cat > ~/.claude/skills/freelance-ops/modes/_shared.md << 'EOF'
# freelance-ops — Shared Context

## User Profile

**Name:** Danny Barahona  
**Role:** Mobile Developer (Flutter & React Native)  
**Location:** Ecuador, LATAM  
**Timezone:** GMT-5  
**Upwork profile:** authenticated in browser session  
**Languages:** Spanish (native), English (professional)

## CV Paths

- Flutter: `/Users/korbold/Developer/Freelancer/Korbold/Danny_Barahona_CV_Flutter_EN.pdf`
- React Native: `/Users/korbold/Developer/Freelancer/Korbold/Danny_Barahona_CV_RN_EN.pdf`
- Default: Flutter CV

## Data Files

- Filters config: `~/.claude/skills/freelance-ops/data/filters.json`
- Proposal tracker: `~/.claude/skills/freelance-ops/data/tracker.json`
- Pipeline inbox: `~/.claude/skills/freelance-ops/data/pipeline.md`

## Platform: Upwork

- Base URL: `https://www.upwork.com`
- Job search URL: `https://www.upwork.com/nx/find-work/`
- Job URL pattern: `https://www.upwork.com/jobs/~*` or `/nx/jobs/~*`

## Hard Filter Rules (read from filters.json)

Before drafting any proposal, validate ALL of these. Any failure = SKIP immediately.

1. **Payment verified** — client must have payment method verified (look for verified badge)
2. **Rating** — client rating must be ≥ `rating_min` (default 4.8). If no rating, skip.
3. **Hires** — client must have ≥ `hires_min` prior hires (default 1)
4. **Budget** — for fixed jobs: budget ≥ `fixed_min`. For hourly: rate ≥ `hourly_min`
5. **Negative keywords** — if JD contains any keyword from `negative_keywords` list → SKIP

## Priority Score

After passing hard filters, calculate:
- Client total spent > $10,000 → +2 pts
- Client total reviews > 10 → +1 pt
- Job description word count > 200 → +1 pt
- Max possible: 4 pts

If score ≥ `boost_threshold` (default 4): mark job for Boost proposal.

## CV Selection Logic

Check JD (title + description) for keywords in priority order:
1. Any `flutter` keyword → use Flutter CV
2. Any `react_native` keyword → use RN CV
3. Neither → use default (Flutter CV)

## Proposal Writing Rules

Structure every proposal:
1. **Hook** (1 sentence): Reference their specific problem or goal from the JD. Do NOT start with "Hi, I'm Danny" or generic openers.
2. **Relevant experience** (2-3 sentences): Name a specific project from portfolio that matches their need. Be concrete — app name, platform, result.
3. **CTA** (1 sentence): "Can we connect this week to discuss?" or similar low-friction ask.

Total length: 80-120 words. No bullet points. Conversational tone.

## Bid Calculation

- Fixed price job: bid = midpoint of client's stated range, or 90% of max if range not shown
- Hourly job: bid $25-35/hr depending on complexity (junior task → $25, senior arch → $35)

## Tracker Entry Schema

When logging to tracker.json, append this object:
```json
{
  "date": "YYYY-MM-DD",
  "job_title": "...",
  "job_url": "...",
  "client_rating": 0.0,
  "client_hires": 0,
  "client_spent": "$0",
  "budget": "...",
  "bid": "...",
  "cv_used": "flutter | react_native | default",
  "score": 0,
  "boosted": false,
  "status": "sent"
}
```
EOF
```

- [ ] **Step 2: Verify**

```bash
wc -l ~/.claude/skills/freelance-ops/modes/_shared.md
```

Expected: > 80 lines

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/skills/freelance-ops
git add modes/_shared.md
git commit -m "feat: add _shared.md with user profile and platform config"
```

---

## Task 4: modes/validate.md — deep job validation

**Files:**
- Create: `~/.claude/skills/freelance-ops/modes/validate.md`

- [ ] **Step 1: Write validate.md**

```bash
cat > ~/.claude/skills/freelance-ops/modes/validate.md << 'EOF'
# freelance-ops — Validate Mode

Validate a single Upwork job URL against all hard filters and calculate priority score.

## Input

`$mode` contains the job URL, or the user provided it in the invocation.

## Steps

### 1. Read config

Read `~/.claude/skills/freelance-ops/data/filters.json`. Extract:
- `budget.fixed_min`, `budget.hourly_min`
- `rating_min`, `hires_min`
- `negative_keywords` list

### 2. Load job page

```
browser_navigate(job_url)
browser_get_content()  # get full page HTML/text
```

### 3. Extract job fields

From page content, extract:
- `job_title` — title of the posting
- `client_rating` — star rating (e.g. 4.93)
- `payment_verified` — boolean (look for "Payment verified" badge)
- `client_hires` — number of hires (e.g. "47 hires")
- `client_total_spent` — total spend (e.g. "$12K+ spent")
- `client_reviews` — number of reviews
- `budget` — fixed amount or hourly range
- `job_description` — full description text

### 4. Run hard filters (stop at first failure)

Check in this order:

**Filter 1 — Payment verified:**
If `payment_verified == false` → return:
```
SKIP: Payment not verified
Job: {job_title}
```

**Filter 2 — Client rating:**
If `client_rating < rating_min` OR rating missing → return:
```
SKIP: Client rating {client_rating} below minimum {rating_min}
Job: {job_title}
```

**Filter 3 — Prior hires:**
If `client_hires < hires_min` → return:
```
SKIP: Client has {client_hires} hires (minimum: {hires_min})
Job: {job_title}
```

**Filter 4 — Budget:**
Parse budget type (fixed vs hourly):
- Fixed: if amount < `fixed_min` → SKIP
- Hourly: if rate < `hourly_min` → SKIP
Return:
```
SKIP: Budget {budget} below minimum (fixed: ${fixed_min} / hourly: ${hourly_min}/hr)
Job: {job_title}
```

**Filter 5 — Negative keywords:**
Check `job_description.toLowerCase()` for each keyword in `negative_keywords`.
If any match → return:
```
SKIP: Negative keyword detected — "{matched_keyword}"
Job: {job_title}
```

### 5. Calculate priority score (only if all filters pass)

| Condition | Points |
|-----------|--------|
| client_total_spent > $10,000 | +2 |
| client_reviews > 10 | +1 |
| job_description word count > 200 | +1 |

### 6. Output validation result

**If PASS:**
```
✅ PASS — {job_title}
─────────────────────────────────────
Client: ⭐ {client_rating} | {client_hires} hires | {client_total_spent} spent
Budget: {budget}
Score: {score}/4 {boosted_marker}
CV: {cv_selected}

{job_description first 100 words...}
```

Where `{boosted_marker}` = "⚡ BOOST" if score ≥ boost_threshold, else "".
Where `{cv_selected}` = determined by CV Selection Logic from _shared.md.

**If SKIP:**
```
❌ SKIP — {job_title}
Reason: {reason}
```
EOF
```

- [ ] **Step 2: Verify**

```bash
wc -l ~/.claude/skills/freelance-ops/modes/validate.md
```

Expected: > 80 lines

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/skills/freelance-ops
git add modes/validate.md
git commit -m "feat: add validate mode with hard filter pipeline"
```

---

## Task 5: modes/propose.md — full-auto proposal flow

**Files:**
- Create: `~/.claude/skills/freelance-ops/modes/propose.md`

- [ ] **Step 1: Write propose.md**

```bash
cat > ~/.claude/skills/freelance-ops/modes/propose.md << 'EOF'
# freelance-ops — Propose Mode

Full pipeline: validate job → draft proposal → show Y/N confirmation → send → log.

## Input

Job URL from `$mode` (auto-pipeline) or user-provided.

## Phase 1: VALIDATE

Run the full validation logic from `validate.md`. 

If result is SKIP: display the skip reason and stop. Do NOT proceed to draft.

If result is PASS: continue to Phase 2.

## Phase 2: DRAFT

Using the validated job data:

### 2a. Select CV

Apply CV Selection Logic from `_shared.md`:
- Flutter keywords in title/description → Flutter CV
- RN keywords → RN CV
- Otherwise → default (Flutter CV)

### 2b. Calculate bid

- Fixed price: use midpoint of stated range. If single number shown, use 95% of it.
- Hourly: $25/hr for straightforward tasks, $30/hr for standard mobile dev, $35/hr for architecture/tech lead work.

### 2c. Write proposal

Follow Proposal Writing Rules from `_shared.md`:
1. Hook: 1 sentence referencing their specific problem
2. Experience: 2-3 sentences with a named project from Danny's portfolio
3. CTA: 1 sentence asking to connect

**Portfolio references to draw from (pick most relevant):**
- **Turnly** — appointment management app (Flutter), self-funded, 500+ active users
- **LegalTech Ecuador** — legal document automation (Flutter), self-funded
- **AkíClub** — loyalty app for Corporación Favorita (Flutter, Android + iOS), 100k+ users
- **Kruger Corp projects** — enterprise mobile apps for Ecuador's largest retailer
- React Native projects for BairesDev clients (if RN job)

### 2d. Determine boost

If `score >= boost_threshold` from filters.json → set `boosted = true`

## Phase 3: CONFIRM

Display confirmation screen and wait for Y/N:

```
┌─────────────────────────────────────────────────────────┐
│  freelance-ops — PROPOSAL READY                         │
├─────────────────────────────────────────────────────────┤
│  Job:    {job_title}                                     │
│  Client: ⭐{rating} | {hires} hires | {spent} spent     │
│  Budget: {budget}   Bid: {bid}                          │
│  Score:  {score}/4  {BOOST if applicable}               │
│  CV:     {cv_name}                                      │
├─────────────────────────────────────────────────────────┤
│  PROPOSAL:                                              │
│                                                         │
│  {proposal_text}                                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Send this proposal? [Y/N]                              │
└─────────────────────────────────────────────────────────┘
```

If user types N: log as SKIPPED_BY_USER in tracker and stop.
If user types Y: proceed to Phase 4.

## Phase 4: SEND

```
browser_navigate(job_url)
# Wait for page load
browser_wait("Apply Now" or "Submit a Proposal" button)
browser_click("Submit a Proposal" button)
# Wait for proposal form
browser_wait(cover letter textarea)
browser_fill(cover letter textarea, proposal_text)
browser_fill(bid amount field, bid_value)
# If boosted: browser_click("Boost your proposal" option)
browser_screenshot()  # capture form filled state
browser_click("Send Proposal" button)
browser_wait(confirmation message)
browser_screenshot()  # capture success confirmation
```

If any browser step fails: stop, report error, do NOT log as sent.

## Phase 5: LOG

Read current `~/.claude/skills/freelance-ops/data/tracker.json`.
Append new entry:

```json
{
  "date": "{today YYYY-MM-DD}",
  "job_title": "{job_title}",
  "job_url": "{job_url}",
  "client_rating": {client_rating},
  "client_hires": {client_hires},
  "client_spent": "{client_total_spent}",
  "budget": "{budget}",
  "bid": "{bid}",
  "cv_used": "{flutter|react_native|default}",
  "score": {score},
  "boosted": {true|false},
  "status": "sent"
}
```

Write updated array back to `tracker.json`.

Output:
```
✅ Proposal sent!
Logged to tracker. Use /freelance-ops tracker to view history.
```
EOF
```

- [ ] **Step 2: Verify**

```bash
wc -l ~/.claude/skills/freelance-ops/modes/propose.md
```

Expected: > 100 lines

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/skills/freelance-ops
git add modes/propose.md
git commit -m "feat: add propose mode — validate, draft, confirm, send, log"
```

---

## Task 6: modes/scan.md — browse Upwork for qualifying jobs

**Files:**
- Create: `~/.claude/skills/freelance-ops/modes/scan.md`

- [ ] **Step 1: Write scan.md**

```bash
cat > ~/.claude/skills/freelance-ops/modes/scan.md << 'EOF'
# freelance-ops — Scan Mode

Browse Upwork job listings, do a quick filter pass, add qualifying URLs to pipeline.

## Steps

### 1. Read config

Read `~/.claude/skills/freelance-ops/data/filters.json`. Note `negative_keywords`, `budget.fixed_min`, `budget.hourly_min`.

### 2. Navigate to Upwork search

```
browser_navigate("https://www.upwork.com/nx/find-work/")
```

Run two separate searches (to cover both specializations):

**Search A — Flutter:**
```
browser_navigate("https://www.upwork.com/nx/find-work/?q=flutter+developer&sort=recency")
```

**Search B — React Native:**
```
browser_navigate("https://www.upwork.com/nx/find-work/?q=react+native+developer&sort=recency")
```

### 3. For each search result page

Use `browser_get_content()` to extract visible job listings.

For each listing, do a quick pre-filter (no need to open the job page):
- Does title/snippet contain any `negative_keywords`? → skip
- Does stated budget look below minimum? → skip
- Does client show "Payment verified" badge? → if "Payment not verified" visible → skip

Collect URLs of listings that pass quick pre-filter.

### 4. Scroll and collect

Scroll down twice (or navigate to page 2) to collect at least 10-20 candidate URLs per search.

```
browser_evaluate("window.scrollTo(0, document.body.scrollHeight)")
browser_wait(500)
browser_get_content()  # get newly loaded listings
```

### 5. Write to pipeline

Read current `~/.claude/skills/freelance-ops/data/pipeline.md`.

Append qualifying URLs below the `<!-- JOBS -->` marker, one per line. Skip URLs already present.

### 6. Report

```
Scan complete.
Flutter search: {N} candidates found
React Native search: {N} candidates found
Total added to pipeline: {N} new URLs

Run /freelance-ops pipeline to process.
```
EOF
```

- [ ] **Step 2: Commit**

```bash
cd ~/.claude/skills/freelance-ops
git add modes/scan.md
git commit -m "feat: add scan mode — browse Upwork, populate pipeline"
```

---

## Task 7: modes/pipeline.md — process URL queue

**Files:**
- Create: `~/.claude/skills/freelance-ops/modes/pipeline.md`

- [ ] **Step 1: Write pipeline.md**

```bash
cat > ~/.claude/skills/freelance-ops/modes/pipeline.md << 'EOF'
# freelance-ops — Pipeline Mode

Process all job URLs in `data/pipeline.md` through the propose flow.

## Steps

### 1. Read pipeline

Read `~/.claude/skills/freelance-ops/data/pipeline.md`.

Extract all lines below `<!-- JOBS -->` that:
- Start with `https://`
- Are not commented out (no leading `#`)

If no URLs found:
```
Pipeline is empty. Run /freelance-ops scan to find jobs, or add URLs manually to data/pipeline.md
```
Stop.

### 2. Report queue

```
Pipeline: {N} jobs queued
────────────────────────
{list of job URLs}

Processing now...
```

### 3. Process each URL

For each URL in order:

Run the full propose flow (Phase 1 through Phase 5 from propose.md).

After each proposal (sent or skipped): remove the URL from `data/pipeline.md` so it won't be processed again on next run.

### 4. Session summary

After all URLs processed:

```
Pipeline complete.
────────────────────────────────
Sent:    {N}
Skipped: {N} (hard filter failures)
Passed:  {N} (user declined)

Run /freelance-ops tracker to see full history.
```
EOF
```

- [ ] **Step 2: Commit**

```bash
cd ~/.claude/skills/freelance-ops
git add modes/pipeline.md
git commit -m "feat: add pipeline mode — process URL queue"
```

---

## Task 8: modes/tracker.md — view proposal history

**Files:**
- Create: `~/.claude/skills/freelance-ops/modes/tracker.md`

- [ ] **Step 1: Write tracker.md**

```bash
cat > ~/.claude/skills/freelance-ops/modes/tracker.md << 'EOF'
# freelance-ops — Tracker Mode

Display proposal history with stats and pending follow-ups.

## Steps

### 1. Read tracker

Read `~/.claude/skills/freelance-ops/data/tracker.json`.

If array is empty:
```
No proposals sent yet. Run /freelance-ops scan to find jobs.
```
Stop.

### 2. Calculate 30-day stats

Filter entries where `date` is within last 30 days.

Count by status:
- `sent` = still pending (no response yet)
- `replied` = client responded
- `hired` = won the job
- `rejected` = explicit rejection
- `ghosted` = sent > 5 days ago with no response

Calculate:
- Reply rate = (replied + hired + rejected) / total sent × 100
- Win rate = hired / total sent × 100

### 3. Display

```
Proposals — last 30 days
──────────────────────────────────────────
Sent: {N}  |  Replied: {N}  |  Hired: {N}  |  Ghosted: {N}
Reply rate: {X}%  |  Win rate: {X}%

PENDING REPLY (sent > 48h ago, status: sent):
{for each: "- {job_title} ({date}) — {bid} bid"}

RECENT WINS:
{for each hired: "- {job_title} ({date}) — {bid}"}

ALL PROPOSALS (newest first):
{date} | {status emoji} | {job_title} | {bid} | {cv_used}
```

Status emojis: sent=⏳ replied=💬 hired=✅ rejected=❌ ghosted=👻

### 4. Update stale entries

For any entry with status `sent` and date > 5 days ago: update status to `ghosted` in tracker.json automatically.
EOF
```

- [ ] **Step 2: Commit**

```bash
cd ~/.claude/skills/freelance-ops
git add modes/tracker.md
git commit -m "feat: add tracker mode — proposal history and stats"
```

---

## Task 9: modes/patterns.md — conversion analysis

**Files:**
- Create: `~/.claude/skills/freelance-ops/modes/patterns.md`

- [ ] **Step 1: Write patterns.md**

```bash
cat > ~/.claude/skills/freelance-ops/modes/patterns.md << 'EOF'
# freelance-ops — Patterns Mode

Analyze tracker data to find what converts. Output actionable filter recommendations.

## Steps

### 1. Read data

Read `~/.claude/skills/freelance-ops/data/tracker.json`.

If fewer than 5 entries:
```
Not enough data yet. Need at least 5 proposals to detect patterns.
Current count: {N}
```
Stop.

### 2. Analyze by dimension

For each dimension, group entries and calculate reply rate and win rate:

**A. CV type (flutter vs react_native vs default)**
- Which CV gets more replies? More hires?

**B. Budget range**
- Group: <$500, $500-$1000, $1000-$3000, $3000+
- Which range converts best?

**C. Client score**
- Group by score: 1-2, 3, 4
- Does higher score = better outcome?

**D. Boosted vs non-boosted**
- Did Boost proposals outperform regular ones?

**E. Job title keywords**
- Extract most common words from `job_title` of hired/replied entries
- vs most common words in ghosted/rejected entries

### 3. Output analysis

```
Patterns Analysis — {N} proposals analyzed
═══════════════════════════════════════════

CV PERFORMANCE:
  Flutter CV:       {sent} sent | {reply_rate}% reply | {win_rate}% win
  RN CV:            {sent} sent | {reply_rate}% reply | {win_rate}% win

BUDGET SWEET SPOT:
  Best range:       ${min}-${max} ({win_rate}% win rate)
  Avoid:            ${range} ({win_rate}% win rate)

BOOST IMPACT:
  Boosted:          {reply_rate}% reply | {win_rate}% win
  Not boosted:      {reply_rate}% reply | {win_rate}% win

TOP CONVERTING KEYWORDS:
  {keyword1}, {keyword2}, {keyword3}

RECOMMENDATIONS:
  {list of specific filter adjustments to make in filters.json}
```

### 4. Suggest filter updates

Based on the analysis, suggest concrete edits to `filters.json`:

Example outputs:
- "Raise `fixed_min` from $300 to $500 — jobs under $500 have 0% win rate"
- "Add 'no experience needed' to negative_keywords — all rejections contain this"
- "Lower `boost_threshold` to 3 — boosted jobs reply 2× more"

Ask user: "Apply these filter updates? [Y/N]"

If Y: read filters.json, apply changes, write back, confirm.
EOF
```

- [ ] **Step 2: Commit**

```bash
cd ~/.claude/skills/freelance-ops
git add modes/patterns.md
git commit -m "feat: add patterns mode — conversion analysis and filter recommendations"
```

---

## Task 10: Add workana.com to browser-pilot allowlist

**Files:**
- Modify: `/Users/korbold/Developer/Freelancer/browser-pilot/config/allowlist.json`

- [ ] **Step 1: View current allowlist**

```bash
cat /Users/korbold/Developer/Freelancer/browser-pilot/config/allowlist.json
```

- [ ] **Step 2: Add workana.com**

Edit `/Users/korbold/Developer/Freelancer/browser-pilot/config/allowlist.json` to:

```json
{
  "domains": ["upwork.com", "linkedin.com", "indeed.com", "workana.com"]
}
```

- [ ] **Step 3: Verify**

```bash
cat /Users/korbold/Developer/Freelancer/browser-pilot/config/allowlist.json | python3 -m json.tool
```

Expected: valid JSON with `workana.com` present

- [ ] **Step 4: Commit**

```bash
cd /Users/korbold/Developer/Freelancer/browser-pilot
git add config/allowlist.json
git commit -m "feat: add workana.com to browser-pilot allowlist"
```

---

## Task 11: Smoke test — validate a real Upwork job

**No new files — manual verification only**

- [ ] **Step 1: Open Claude Code, invoke skill**

```
/freelance-ops
```

Expected: discovery menu with all 6 commands listed

- [ ] **Step 2: Test validate mode**

```
/freelance-ops validate https://www.upwork.com/jobs/~[any real job URL]
```

Expected: either `✅ PASS` with score breakdown or `❌ SKIP` with reason

- [ ] **Step 3: Test scan mode**

```
/freelance-ops scan
```

Expected: browser opens Upwork, collects job URLs, reports count, updates `data/pipeline.md`

- [ ] **Step 4: Test tracker (empty state)**

```
/freelance-ops tracker
```

Expected: "No proposals sent yet" message

- [ ] **Step 5: Test patterns (empty state)**

```
/freelance-ops patterns
```

Expected: "Not enough data yet. Need at least 5 proposals."
