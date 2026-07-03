# Notion Link Ingestion — Design

- **Date:** 2026-07-03
- **Status:** Approved

## Problem

The user maintains several Notion databases ("hubs") where interesting AI
tools/resources get saved as they're found (mostly from Reddit). Two of
these — **Reddit Links** (368 entries and growing) and **Claude Skills and
Agents** — contain real, currently-relevant tool links with reusable
AI-written summaries, but none of it flows into this site's directory. Adding
it today means manually re-typing everything through the existing
`docs/link-update-routine.md` paste-a-batch flow.

A third hub, **Claude Resource and Docs Hub**, was considered and excluded —
its categories (Proposal, Customer research, Strategy doc, Planning, "UX
MessageMate") and lack of an AI-summary/Type field indicate internal planning
docs for a product, not a links collection. Not part of this design.

## Scope

Build a repeatable pipeline: pull raw rows from the two source hubs → filter
out non-tool content → dedupe near-identical entries → categorize → land
candidates in a **new Notion database** for human review → sync only the
approved rows into the site's Postgres `links` table via the existing writer.

Nothing here changes `scripts/upsert-links.mjs` or the `links` table schema.

## Design

### 1. Source hubs

| Hub | Data source ID | Notes |
|---|---|---|
| Reddit Links | `2e3ec682-ad09-805e-8774-000b59905e0a` | Has `Type` (Tool/Application/Process/Reference), `Category` (multi-select), `AI summary`. ~67% of rows have Type+Category populated; the rest need inference from title+summary. |
| Claude Skills and Agents | `2daec682-ad09-8070-8c0f-000b2c623f4e` | Has `AI summary`, `GitHub Directions`, `Gathered Links from post`, `Category` (Claude-Code-specific tags). Only ~4% of rows have a URL at all — most are personal notes about the user's own custom skills/commands with nothing to link to. |

Both are configured in one place so a third hub can be added later without
restructuring anything.

### 2. `scripts/pull-notion-links.mjs` (new, deterministic)

- Calls the public Notion API directly (`POST /v1/data_sources/{id}/query`,
  paginated) using a `NOTION_API_TOKEN` env var — not the `ntn` CLI, so this
  runs on any machine/CI without depending on local keychain auth.
- Retries with backoff on HTTP 429 (Notion rate-limits are real — hit
  repeatedly during exploration).
- Supports an optional `--since <ISO date>` flag (filtering on Notion's
  `Created time`) for future incremental runs. First run omits it — full pull.
- Writes one raw JSON dump per hub to `data/notion-raw/<hub-slug>.json`.
  This directory is **gitignored** — it's a mirror of the user's personal
  Notion data, not something to commit.

### 3. Setup requirement (one-time, user action)

The puller needs a Notion **internal integration token**
(notion.so/my-integrations), shared explicitly with both source databases
and the new review database (§5). This can't be automated — it requires the
user's Notion account. Add a `NOTION_API_TOKEN=` placeholder to
`.env.example`.

### 4. Curation pass (Claude-run, documented routine)

A new section in `docs/link-update-routine.md`, parallel to the existing
"paste a batch" routine. Given raw dump(s) from step 2, for each row:

**Drop** if any of:
- No URL present.
- It's a raw model-weight listing (e.g. a bare Hugging Face model card with
  no product wrapper around it).
- It's a pure how-to/docs page, or a news/blog article *about* a tool rather
  than the tool's own site.
- Notion `Type` is `Process` or `Reference`, or `Category` includes `Tip`,
  `Workflow`, or `Prompt` (Reddit Links) — these describe techniques/notes,
  not standalone tools.
- Notion `Category` includes `IN PROGRESS` (Claude Skills and Agents) —
  not finished enough to submit.

**Merge** when multiple rows describe the same underlying product (seen in
practice: a product's own site + a blog post about it + its GitHub repo, all
saved separately). Canonical URL preference: product's own domain > GitHub
repo > article about it. Combine into the single best description.

**Categorize** into one of the site's 10 slugs (`development`, `design`,
`ai-ml`, `analytics`, `marketing`, `productivity`, `security`, `database`,
`api`, `mobile`). Notion's `Type`/`Category` are hints, not a fixed lookup —
e.g. a Claude Code skill that's fundamentally a coding tool maps to
`development`; one that's about a model itself maps to `ai-ml`. Read the
title + AI summary to decide. Leave genuinely ambiguous items uncategorized
rather than guessing — the writer already handles `null` category_id cleanly
(warns, doesn't fail).

**Tags**: derive 2-5 short lowercase tags per item, same as the existing
manual routine.

Given the volume (~368 rows in Reddit Links alone), this pass is processed
in batches rather than as one single read-through — an implementation detail
that doesn't change the output shape.

### 5. New Notion database: "Directory Submissions"

Created once, lives alongside the source hubs. Schema:

| Property | Type | Notes |
|---|---|---|
| Title | title | Tool name |
| URL | url | Canonical URL (post-dedup) |
| Description | text | From AI summary / curation pass |
| Category | select | One of the 10 site slugs, or blank |
| Tags | multi_select | 2-5 tags |
| Source Hub | select | Which origin hub this came from (traceability) |
| Decision | select | `Pending Review` (default) / `Approved` / `Rejected` |

The curation pass (§4) creates one page per surviving candidate here, via
the Notion API, with `Decision: Pending Review`. **This is the only review
gate** — nothing lands in Postgres until a row is marked `Approved` here.
(Considered keeping a second `pending` stage in Postgres too; rejected —
two separate "pending" states with no clear authority between them would
just be confusing.)

The user reviews directly in Notion's table view: scan, optionally fix a
category/description/tag inline, flip `Decision`.

### 6. `scripts/sync-approved-from-notion.mjs` (new, deterministic)

- Queries the Directory Submissions database for `Decision = Approved`.
- Converts matching rows to the JSON shape `upsert-links.mjs` already
  expects, with `status: "approved"` (not `pending` — the Notion `Decision`
  *was* the review).
- Calls `upsert-links.mjs` exactly as the existing routine does. Upsert is
  keyed on URL, so re-running this anytime is safe — nothing is duplicated,
  and rows already synced just update in place if edited afterward.
- Rejected/still-pending rows are simply never synced; no separate cleanup
  needed.

This script has zero judgment calls left in it by design — all filtering/
dedup/categorization already happened in §4. That makes it the one piece
that could later run on a schedule (Netlify scheduled function, cron) with
no LLM involved, which is the natural next step toward "more automated"
once this first pass proves out.

## Non-goals (considered and rejected)

- **Pure heuristic/regex-based filtering and dedup, no LLM involved** —
  real duplicate cases (e.g. the same tool saved as a product page, a blog
  post about it, and its GitHub repo — three different domains/titles) have
  no safe string-similarity rule that merges them without risking false
  merges of unrelated tools. Rejected in favor of an LLM curation pass.
- **A custom review UI in the app itself** — Notion's own table view already
  provides sort/filter/inline-edit for free; building a bespoke admin screen
  for this is a separate, much bigger project not justified by this need.
- **Including "Claude Resource and Docs Hub"** — see Problem section.
- **Keeping a Postgres `pending` stage in addition to Notion's `Decision`**
  — one review gate, not two.

## Testing

No automated test runner in this project (established precedent). Verify via:
- Dry run (`links:add:dry`) before every real write, as the existing routine
  already mandates.
- After the first real sync, report exact counts: rows pulled per hub,
  dropped (no URL), dropped (non-tool content), merged (dedup), pages
  created in Directory Submissions, and — once reviewed — rows actually
  upserted into Postgres. Auditable at every stage, not a black box.
- Spot-check a sample of curated entries against their original Notion rows
  before the first real sync, given the volume involved.
