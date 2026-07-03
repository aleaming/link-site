# Notion Link Ingestion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a repeatable pipeline that pulls tool links from two Notion
hubs (Reddit Links, Claude Skills and Agents), lets Claude filter/dedupe/
categorize them, lands candidates in a new Notion review database, and
syncs only human-approved rows into the site's existing `links` table.

**Architecture:** Two small Node CLI scripts (`pull-notion-links.mjs`,
`sync-approved-from-notion.mjs`) share a tiny Notion API client + a generic
property-flattener library. Everything between "raw pull" and "approved
sync" — filtering, deduping, categorizing, creating review-database pages —
is a documented Claude routine, not code, because it requires judgment a
deterministic script can't safely make (see spec §4, Non-goals).

**Tech Stack:** Node.js (ESM, `.mjs`, already this project's convention),
built-in `fetch`/`node:assert` only — no new npm dependencies. Notion public
API version `2025-09-03` (data-source-based endpoints).

**Full design context:** `docs/superpowers/specs/2026-07-03-notion-link-ingestion-design.md`

## Global Constraints

- No automated test runner in this project (established precedent) — every
  task below verifies with a throwaway script using Node's built-in
  `node:assert/strict`, run once and deleted; nothing is added to
  `package.json`'s scripts for "test".
- No new npm dependencies. Node 22 (confirmed via `node --version`) has
  global `fetch` — use it directly.
- Category slugs are exactly: `development`, `design`, `ai-ml`, `analytics`,
  `marketing`, `productivity`, `security`, `database`, `api`, `mobile`.
- `scripts/upsert-links.mjs` and the `links` table schema are NOT modified
  by this plan.
- `data/notion-raw/` is gitignored — never commit raw Notion dumps.
- Secrets (`NOTION_API_TOKEN`, `NOTION_SUBMISSIONS_DATA_SOURCE_ID`) live in
  `.env`, never hardcoded, never committed.

---

### Task 1: One-time Notion integration setup

**Files:** none (Notion workspace configuration + local `.env`, not repo files)

**Interfaces:**
- Produces: a valid `NOTION_API_TOKEN` in the local shell environment with
  read access to both source data sources. Every later task's real-data
  steps consume this.

This is a prerequisite — nothing else in this plan can be smoke-tested
against real data without it. If you're implementing this in a context
where a human isn't available to click through Notion's UI, stop here and
ask them to do this step; it cannot be automated (Notion doesn't have an
API to create integrations).

- [ ] **Step 1: Create a Notion internal integration**

  Go to https://www.notion.so/my-integrations → "New integration" → name it
  something like "link-site ingestion" → under "Associated workspace" pick
  the workspace containing the Reddit Links database → Save. Copy the
  "Internal Integration Secret" (starts with `ntn_` or `secret_`).

- [ ] **Step 2: Share both source databases with the integration**

  In Notion, open the **Reddit Links** database
  (https://app.notion.com/p/2e3ec682ad09806cacabc0f7dbfa1515) → `···` menu
  (top right) → "Connections" → add the integration created in Step 1.
  Repeat for **Claude Skills and Agents**
  (https://app.notion.com/p/2daec682ad098071bdeaf59f0d524ac6).

- [ ] **Step 3: Add the token to your local `.env`**

  Create/edit `.env` in the project root (gitignored, never committed):

  ```
  NOTION_API_TOKEN=ntn_your_token_here
  ```

- [ ] **Step 4: Verify access with a throwaway script**

  Write `verify-notion-access.mjs` in the project root:

  ```js
  const token = process.env.NOTION_API_TOKEN
  if (!token) throw new Error('NOTION_API_TOKEN not set')

  const res = await fetch(
    'https://api.notion.com/v1/data_sources/2e3ec682-ad09-805e-8774-000b59905e0a/query',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2025-09-03',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ page_size: 1 })
    }
  )
  const body = await res.json()
  if (!res.ok) throw new Error(`Notion API error ${res.status}: ${JSON.stringify(body)}`)
  console.log(`PASS: got ${body.results.length} row(s) back, has_more=${body.has_more}`)
  ```

  Run: `node --env-file=.env verify-notion-access.mjs`
  Expected: `PASS: got 1 row(s) back, has_more=true`

- [ ] **Step 5: Delete the throwaway script**

  ```bash
  rm verify-notion-access.mjs
  ```

---

### Task 2: Notion API client (pagination + retry)

**Files:**
- Create: `scripts/lib/notion-client.mjs`

**Interfaces:**
- Produces:
  - `queryDataSourcePage(dataSourceId: string, opts: { token: string, filter?: object, startCursor?: string, fetchImpl?: Function, maxRetries?: number }): Promise<{ results: object[], has_more: boolean, next_cursor?: string }>`
  - `queryDataSourceAll(dataSourceId: string, opts: { token: string, filter?: object, fetchImpl?: Function, maxRetries?: number }): Promise<object[]>` — array of raw Notion page objects, all pages concatenated
  - `class NotionApiError extends Error { status: number }`
- Consumed by: Task 5 (puller), Task 7 (sync script).

- [ ] **Step 1: Write the implementation**

  Create `scripts/lib/notion-client.mjs`:

  ```js
  const NOTION_API_BASE = 'https://api.notion.com/v1'
  const NOTION_VERSION = '2025-09-03'

  export class NotionApiError extends Error {
    constructor(message, status) {
      super(message)
      this.name = 'NotionApiError'
      this.status = status
    }
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Queries one page of a Notion data source, retrying on 429 using the
   * server's Retry-After header (falling back to exponential backoff).
   */
  export async function queryDataSourcePage(dataSourceId, opts = {}) {
    const { token, filter, startCursor, fetchImpl = fetch, maxRetries = 3 } = opts
    if (!token) throw new Error('Missing Notion API token (pass opts.token)')

    const body = { page_size: 100 }
    if (filter) body.filter = filter
    if (startCursor) body.start_cursor = startCursor

    for (let attempt = 0; ; attempt++) {
      const res = await fetchImpl(`${NOTION_API_BASE}/data_sources/${dataSourceId}/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (res.status === 429 && attempt < maxRetries) {
        const retryAfter = Number(res.headers.get('retry-after')) || 2 ** attempt * 5
        await sleep(retryAfter * 1000)
        continue
      }

      if (!res.ok) {
        const text = await res.text()
        throw new NotionApiError(`Notion API error ${res.status}: ${text}`, res.status)
      }

      return res.json()
    }
  }

  /**
   * Queries every page of a Notion data source, following has_more/
   * next_cursor until exhausted. Returns the full flat array of raw
   * Notion page objects (not yet flattened to our own shape).
   */
  export async function queryDataSourceAll(dataSourceId, opts = {}) {
    const results = []
    let cursor
    for (;;) {
      const page = await queryDataSourcePage(dataSourceId, { ...opts, startCursor: cursor })
      results.push(...page.results)
      if (!page.has_more) return results
      cursor = page.next_cursor
    }
  }
  ```

- [ ] **Step 2: Write and run the verification script**

  Create `scripts/lib/notion-client.verify.mjs`:

  ```js
  import assert from 'node:assert/strict'
  import { queryDataSourceAll, NotionApiError } from './notion-client.mjs'

  // Pagination follows cursor across pages
  {
    let calls = 0
    const fakeFetch = async (_url, init) => {
      calls++
      const body = JSON.parse(init.body)
      if (!body.start_cursor) {
        return {
          ok: true,
          status: 200,
          headers: new Map(),
          json: async () => ({ results: [{ id: 'a' }], has_more: true, next_cursor: 'cursor-1' })
        }
      }
      return {
        ok: true,
        status: 200,
        headers: new Map(),
        json: async () => ({ results: [{ id: 'b' }], has_more: false })
      }
    }
    const rows = await queryDataSourceAll('fake-id', { token: 'fake-token', fetchImpl: fakeFetch })
    assert.deepStrictEqual(rows.map((r) => r.id), ['a', 'b'])
    assert.strictEqual(calls, 2)
    console.log('PASS: pagination follows cursor across pages')
  }

  // Retries once on 429 then succeeds
  {
    let calls = 0
    const fakeFetch = async () => {
      calls++
      if (calls === 1) {
        return { ok: false, status: 429, headers: new Map([['retry-after', '0']]), json: async () => ({}) }
      }
      return { ok: true, status: 200, headers: new Map(), json: async () => ({ results: [{ id: 'z' }], has_more: false }) }
    }
    const rows = await queryDataSourceAll('fake-id', { token: 'fake-token', fetchImpl: fakeFetch })
    assert.deepStrictEqual(rows.map((r) => r.id), ['z'])
    assert.strictEqual(calls, 2)
    console.log('PASS: retries once on 429 then succeeds')
  }

  // Throws NotionApiError on a non-retryable error status
  {
    const fakeFetch = async () => ({
      ok: false,
      status: 401,
      headers: new Map(),
      text: async () => 'unauthorized'
    })
    await assert.rejects(
      () => queryDataSourceAll('fake-id', { token: 'bad-token', fetchImpl: fakeFetch }),
      NotionApiError
    )
    console.log('PASS: throws NotionApiError on non-retryable error status')
  }

  console.log('\nAll notion-client checks passed.')
  ```

  Run: `node scripts/lib/notion-client.verify.mjs`
  Expected:
  ```
  PASS: pagination follows cursor across pages
  PASS: retries once on 429 then succeeds
  PASS: throws NotionApiError on non-retryable error status

  All notion-client checks passed.
  ```

- [ ] **Step 3: Delete the verification script and commit**

  ```bash
  rm scripts/lib/notion-client.verify.mjs
  git add scripts/lib/notion-client.mjs
  git commit -m "feat(notion): add Notion API client with pagination and 429 retry"
  ```

---

### Task 3: Notion property flattener

**Files:**
- Create: `scripts/lib/notion-flatten.mjs`

**Interfaces:**
- Produces: `flattenNotionPage(page: object): Record<string, unknown>` — a
  plain object keyed by each property's own Notion name (e.g. `flat['Doc
  name']`, `flat['URL']`, `flat['Category']`), plus `createdTime`,
  `notionPageUrl`, `notionPageId`. Generic across any database schema —
  works for both source hubs and the new review database (Task 6) without
  per-hub special-casing.
- Consumed by: Task 5 (puller), Task 7 (sync script).

- [ ] **Step 1: Write the implementation**

  Create `scripts/lib/notion-flatten.mjs`:

  ```js
  function extractPlainText(richTextArray) {
    if (!Array.isArray(richTextArray) || richTextArray.length === 0) return null
    const joined = richTextArray.map((t) => t.plain_text ?? '').join('').trim()
    return joined || null
  }

  /**
   * Flattens a raw Notion page object (from a data source query response)
   * into a plain object keyed by each property's own Notion name. Reads
   * generically by property `type`, so it works across databases with
   * different schemas — title/rich_text/url/select/multi_select are the
   * only property types this pipeline's databases use.
   */
  export function flattenNotionPage(page) {
    const props = page.properties ?? {}
    const flat = {
      createdTime: page.created_time ?? null,
      notionPageUrl: page.url ?? null,
      notionPageId: page.id ?? null
    }

    for (const [name, value] of Object.entries(props)) {
      switch (value.type) {
        case 'title':
          flat[name] = extractPlainText(value.title)
          break
        case 'rich_text':
          flat[name] = extractPlainText(value.rich_text)
          break
        case 'url':
          flat[name] = value.url ?? null
          break
        case 'select':
          flat[name] = value.select?.name ?? null
          break
        case 'multi_select':
          flat[name] = (value.multi_select ?? []).map((o) => o.name)
          break
        default:
          break
      }
    }

    return flat
  }
  ```

- [ ] **Step 2: Write and run the verification script**

  Create `scripts/lib/notion-flatten.verify.mjs`:

  ```js
  import assert from 'node:assert/strict'
  import { flattenNotionPage } from './notion-flatten.mjs'

  // Realistic Reddit-Links-shaped page (matches the real schema pulled during design)
  const fixturePage = {
    created_time: '2026-07-01T14:00:00.000Z',
    url: 'https://app.notion.com/p/Example-99c88a840f9143fda829bcd3c331ea3c',
    id: '99c88a84-0f91-43fd-a829-bcd3c331ea3c',
    properties: {
      'Doc name': { type: 'title', title: [{ plain_text: 'Example Tool · A demo entry' }] },
      URL: { type: 'url', url: 'https://example.com/' },
      Type: { type: 'select', select: { name: 'Tool' } },
      Category: { type: 'multi_select', multi_select: [{ name: 'AI Build' }, { name: 'Mac App' }] },
      'AI summary': { type: 'rich_text', rich_text: [{ plain_text: 'A concise, reusable description of the tool.' }] }
    }
  }

  const flat = flattenNotionPage(fixturePage)
  assert.strictEqual(flat['Doc name'], 'Example Tool · A demo entry')
  assert.strictEqual(flat['URL'], 'https://example.com/')
  assert.strictEqual(flat['Type'], 'Tool')
  assert.deepStrictEqual(flat['Category'], ['AI Build', 'Mac App'])
  assert.strictEqual(flat['AI summary'], 'A concise, reusable description of the tool.')
  assert.strictEqual(flat.createdTime, '2026-07-01T14:00:00.000Z')
  console.log('PASS: flattens a full Reddit-Links-shaped page correctly')

  // Directory-Submissions-shaped page (Task 6's schema — different property names/types)
  const submissionPage = {
    created_time: '2026-07-03T00:00:00.000Z',
    url: 'https://notion.so/x',
    id: 'sub-page-id',
    properties: {
      Title: { type: 'title', title: [{ plain_text: 'Example Tool' }] },
      URL: { type: 'url', url: 'https://example.com' },
      Description: { type: 'rich_text', rich_text: [{ plain_text: 'A concise description.' }] },
      Category: { type: 'select', select: { name: 'development' } },
      Tags: { type: 'multi_select', multi_select: [{ name: 'cli' }] },
      Decision: { type: 'select', select: { name: 'Approved' } }
    }
  }
  const flatSubmission = flattenNotionPage(submissionPage)
  assert.strictEqual(flatSubmission['Category'], 'development')
  assert.deepStrictEqual(flatSubmission['Tags'], ['cli'])
  assert.strictEqual(flatSubmission['Decision'], 'Approved')
  console.log('PASS: same function flattens a differently-shaped schema (select vs multi_select Category)')

  // Empty/null properties don't throw
  const emptyPage = {
    created_time: '2026-01-01T00:00:00.000Z',
    url: 'https://notion.so/empty',
    id: 'empty-id',
    properties: {
      'Doc name': { type: 'title', title: [] },
      URL: { type: 'url', url: null },
      Type: { type: 'select', select: null },
      Category: { type: 'multi_select', multi_select: [] }
    }
  }
  const flatEmpty = flattenNotionPage(emptyPage)
  assert.strictEqual(flatEmpty['Doc name'], null)
  assert.strictEqual(flatEmpty['URL'], null)
  assert.deepStrictEqual(flatEmpty['Category'], [])
  console.log('PASS: handles empty/null properties without throwing')

  console.log('\nAll notion-flatten checks passed.')
  ```

  Run: `node scripts/lib/notion-flatten.verify.mjs`
  Expected:
  ```
  PASS: flattens a full Reddit-Links-shaped page correctly
  PASS: same function flattens a differently-shaped schema (select vs multi_select Category)
  PASS: handles empty/null properties without throwing

  All notion-flatten checks passed.
  ```

- [ ] **Step 3: Delete the verification script and commit**

  ```bash
  rm scripts/lib/notion-flatten.verify.mjs
  git add scripts/lib/notion-flatten.mjs
  git commit -m "feat(notion): add generic Notion page property flattener"
  ```

---

### Task 4: `.gitignore` and `.env.example` updates

**Files:**
- Modify: `.gitignore`
- Modify: `.env.example`

**Interfaces:** none (configuration only)

- [ ] **Step 1: Add the raw-dump directory to `.gitignore`**

  In `.gitignore`, immediately after the existing links-inbox comment block:

  ```gitignore
  # Working scratch file for the link-update routine (keep the .example version)
  data/links-inbox.json

  # Raw Notion dumps from the link-ingestion pipeline — mirrors the user's
  # personal Notion data, never commit
  data/notion-raw/
  ```

- [ ] **Step 2: Add token placeholders to `.env.example`**

  Replace the current contents of `.env.example` with:

  ```
  # This project uses the built-in Netlify Database (managed Postgres).
  #
  # There is NO database environment variable to set. The connection is resolved
  # automatically by `getConnectionString()` from the @netlify/database package:
  #   • locally  — `netlify dev` starts a local Postgres and wires it up
  #   • deployed — Netlify injects the production connection at runtime

  # Notion link-ingestion pipeline (scripts/pull-notion-links.mjs,
  # scripts/sync-approved-from-notion.mjs). See docs/link-update-routine.md
  # for one-time setup (create an internal integration, share the relevant
  # databases with it).
  NOTION_API_TOKEN=
  NOTION_SUBMISSIONS_DATA_SOURCE_ID=
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add .gitignore .env.example
  git commit -m "chore(notion): add env placeholders and gitignore raw Notion dumps"
  ```

---

### Task 5: Puller script

**Files:**
- Create: `scripts/pull-notion-links.mjs`

**Interfaces:**
- Consumes: `queryDataSourceAll` (Task 2), `flattenNotionPage` (Task 3)
- Produces: `export const HUBS: { name: string, dataSourceId: string }[]`,
  `export async function pullHub(hub, opts: { token: string, since?: string, queryFn?: Function }): Promise<object[]>`
  — used directly by Task 10's real backfill run, and importable for future
  hub additions.

- [ ] **Step 1: Write the implementation**

  Create `scripts/pull-notion-links.mjs`:

  ```js
  #!/usr/bin/env node
  /**
   * pull-notion-links.mjs — pulls raw rows from configured Notion hubs and
   * writes one flattened JSON dump per hub to data/notion-raw/<hub>.json.
   *
   * Usage:
   *   node scripts/pull-notion-links.mjs                       # pull all configured hubs
   *   node scripts/pull-notion-links.mjs --hub reddit-links    # pull one hub
   *   node scripts/pull-notion-links.mjs --since 2026-07-01T00:00:00.000Z
   *
   * Requires NOTION_API_TOKEN in the environment (see .env.example and
   * docs/link-update-routine.md for one-time setup).
   */
  import { writeFileSync, mkdirSync } from 'node:fs'
  import { queryDataSourceAll } from './lib/notion-client.mjs'
  import { flattenNotionPage } from './lib/notion-flatten.mjs'

  export const HUBS = [
    { name: 'reddit-links', dataSourceId: '2e3ec682-ad09-805e-8774-000b59905e0a' },
    { name: 'claude-skills-and-agents', dataSourceId: '2daec682-ad09-8070-8c0f-000b2c623f4e' }
  ]

  function parseArgs(argv) {
    const hub = argv.find((a, i) => argv[i - 1] === '--hub')
    const since = argv.find((a, i) => argv[i - 1] === '--since')
    return { hub, since }
  }

  export async function pullHub(hub, { token, since, queryFn = queryDataSourceAll } = {}) {
    const filter = since
      ? { property: 'Created time', created_time: { after: since } }
      : undefined
    const pages = await queryFn(hub.dataSourceId, { token, filter })
    return pages.map(flattenNotionPage)
  }

  async function main() {
    const { hub: hubFilter, since } = parseArgs(process.argv.slice(2))
    const token = process.env.NOTION_API_TOKEN
    if (!token) {
      console.error('\n✖ Missing NOTION_API_TOKEN. See .env.example.\n')
      process.exit(1)
    }

    const hubs = hubFilter ? HUBS.filter((h) => h.name === hubFilter) : HUBS
    if (hubs.length === 0) {
      console.error(`\n✖ Unknown hub "${hubFilter}". Known hubs: ${HUBS.map((h) => h.name).join(', ')}\n`)
      process.exit(1)
    }

    mkdirSync('data/notion-raw', { recursive: true })

    for (const hub of hubs) {
      console.log(`Pulling "${hub.name}"...`)
      const rows = await pullHub(hub, { token, since })
      const path = `data/notion-raw/${hub.name}.json`
      writeFileSync(path, JSON.stringify(rows, null, 2))
      console.log(`  wrote ${rows.length} row(s) to ${path}`)
    }
  }

  const isMain = import.meta.url === `file://${process.argv[1]}`
  if (isMain) {
    main().catch((e) => {
      console.error(e?.stack || String(e))
      process.exit(1)
    })
  }
  ```

- [ ] **Step 2: Write and run the verification script (fixture, no network)**

  Create `scripts/pull-notion-links.verify.mjs`:

  ```js
  import assert from 'node:assert/strict'
  const { pullHub, HUBS } = await import('./pull-notion-links.mjs')

  assert.strictEqual(HUBS.length, 2)
  assert.strictEqual(HUBS[0].name, 'reddit-links')
  assert.strictEqual(HUBS[1].name, 'claude-skills-and-agents')

  const fakeRawPages = [
    {
      created_time: '2026-07-01T14:00:00.000Z',
      url: 'https://notion.so/a',
      id: 'a',
      properties: {
        'Doc name': { type: 'title', title: [{ plain_text: 'Tool A' }] },
        URL: { type: 'url', url: 'https://a.example.com' },
        Type: { type: 'select', select: { name: 'Tool' } },
        Category: { type: 'multi_select', multi_select: [] }
      }
    }
  ]
  const fakeQueryFn = async () => fakeRawPages

  const rows = await pullHub(HUBS[0], { token: 'fake', queryFn: fakeQueryFn })
  assert.strictEqual(rows.length, 1)
  assert.strictEqual(rows[0]['Doc name'], 'Tool A')
  assert.strictEqual(rows[0]['URL'], 'https://a.example.com')
  console.log('PASS: pullHub flattens rows from an injected queryFn')

  console.log('\nAll pull-notion-links checks passed.')
  ```

  Run: `node scripts/pull-notion-links.verify.mjs`
  Expected:
  ```
  PASS: pullHub flattens rows from an injected queryFn

  All pull-notion-links checks passed.
  ```

- [ ] **Step 3: Delete the verification script**

  ```bash
  rm scripts/pull-notion-links.verify.mjs
  ```

- [ ] **Step 4: Smoke-test against real Notion data (small)**

  Requires Task 1's setup to be complete.

  Run: `node --env-file=.env scripts/pull-notion-links.mjs --hub reddit-links`
  Expected: prints `Pulling "reddit-links"...` then `  wrote N row(s) to
  data/notion-raw/reddit-links.json` where N is at least 300 (368 were
  present during design; the hub grows over time, never shrinks).

  Confirm the file looks right:
  ```bash
  node -e "const rows = JSON.parse(require('fs').readFileSync('data/notion-raw/reddit-links.json')); console.log(rows[0])"
  ```
  Expected: an object with `Doc name`, `URL`, `Type`, `Category`, `AI
  summary`, `createdTime`, `notionPageUrl` keys.

- [ ] **Step 5: Commit**

  `data/notion-raw/reddit-links.json` is gitignored (Task 4), so it won't
  be staged — only the script itself is new.

  ```bash
  git add scripts/pull-notion-links.mjs
  git commit -m "feat(notion): add script to pull raw rows from configured hubs"
  ```

---

### Task 6: Create the "Directory Submissions" Notion database

**Files:** none (Notion workspace content, not repo files)

**Interfaces:**
- Produces: a Notion database with the schema below, and its data source
  ID recorded in `.env` as `NOTION_SUBMISSIONS_DATA_SOURCE_ID`. Consumed by
  Task 7 (sync script) and the curation routine (Task 9's documentation).

This creates real, visible content in the user's Notion workspace — not
just local repo changes. Confirm with the user before running Step 2 if
that hasn't already been discussed.

- [ ] **Step 1: Find the parent page to nest the new database under**

  Run: `ntn api /v1/databases/2e3ec682-ad09-806c-acab-c0f7dbfa1515`

  Look for `.parent.page_id` in the JSON output — this is the page the
  "Reddit Links" database itself lives in. Note it down; it's `<PARENT_PAGE_ID>`
  below.

- [ ] **Step 2: Create the database**

  Run (substituting the real `<PARENT_PAGE_ID>` from Step 1):

  ```bash
  ntn api /v1/databases -X POST -d '{
    "parent": { "type": "page_id", "page_id": "<PARENT_PAGE_ID>" },
    "title": [{ "type": "text", "text": { "content": "Directory Submissions" } }],
    "properties": {
      "Title": { "title": {} },
      "URL": { "url": {} },
      "Description": { "rich_text": {} },
      "Category": { "select": { "options": [
        {"name": "development"}, {"name": "design"}, {"name": "ai-ml"},
        {"name": "analytics"}, {"name": "marketing"}, {"name": "productivity"},
        {"name": "security"}, {"name": "database"}, {"name": "api"}, {"name": "mobile"}
      ]}},
      "Tags": { "multi_select": { "options": [] } },
      "Source Hub": { "select": { "options": [
        {"name": "Reddit Links"}, {"name": "Claude Skills and Agents"}
      ]}},
      "Decision": { "select": { "options": [
        {"name": "Pending Review"}, {"name": "Approved"}, {"name": "Rejected"}
      ]}}
    }
  }'
  ```

  Expected: JSON response with `"object": "database"` and an `"id"` field.
  Note this database's `id`.

- [ ] **Step 3: Resolve the data source ID and record it**

  Run: `ntn datasources resolve <DATABASE_ID_FROM_STEP_2> --json`

  Expected: JSON containing a `data_sources` array with one entry — its
  `id` is the value to use.

  Add it to `.env`:
  ```
  NOTION_SUBMISSIONS_DATA_SOURCE_ID=<the id from above>
  ```

- [ ] **Step 4: Verify the schema by fetching it back**

  Run: `ntn datasources query <DATA_SOURCE_ID> --json`
  Expected: `{"has_more": false, "next_cursor": null, "results": []}` — an
  empty database with the correct (but so-far-unpopulated) schema.

---

### Task 7: Sync script

**Files:**
- Create: `scripts/sync-approved-from-notion.mjs`

**Interfaces:**
- Consumes: `queryDataSourceAll` (Task 2), `flattenNotionPage` (Task 3),
  `NOTION_SUBMISSIONS_DATA_SOURCE_ID` (Task 6)
- Produces: writes `data/links-inbox.json` in the exact shape
  `scripts/upsert-links.mjs` already reads (see
  `data/links-inbox.example.json`) — every item has `status: "approved"`.

- [ ] **Step 1: Write the implementation**

  Create `scripts/sync-approved-from-notion.mjs`:

  ```js
  #!/usr/bin/env node
  /**
   * sync-approved-from-notion.mjs — reads rows marked Decision=Approved
   * from the "Directory Submissions" Notion database and writes them to
   * data/links-inbox.json in the shape scripts/upsert-links.mjs expects.
   *
   * This script does NOT call upsert-links.mjs itself — run the existing
   * routine afterward:
   *   npm run links:add:dry
   *   npm run links:add
   *
   * Requires NOTION_API_TOKEN and NOTION_SUBMISSIONS_DATA_SOURCE_ID in the
   * environment (see .env.example).
   */
  import { writeFileSync } from 'node:fs'
  import { queryDataSourceAll } from './lib/notion-client.mjs'
  import { flattenNotionPage } from './lib/notion-flatten.mjs'

  export const APPROVED_FILTER = { property: 'Decision', select: { equals: 'Approved' } }

  export function toLinksInboxItem(flatRow) {
    return {
      title: flatRow['Title'],
      url: flatRow['URL'],
      description: flatRow['Description'],
      category: flatRow['Category'],
      tags: flatRow['Tags'] ?? [],
      status: 'approved'
    }
  }

  export async function fetchApprovedItems({ dataSourceId, token, queryFn = queryDataSourceAll }) {
    const pages = await queryFn(dataSourceId, { token, filter: APPROVED_FILTER })
    return pages.map(flattenNotionPage).map(toLinksInboxItem)
  }

  async function main() {
    const token = process.env.NOTION_API_TOKEN
    const dataSourceId = process.env.NOTION_SUBMISSIONS_DATA_SOURCE_ID
    if (!token) {
      console.error('\n✖ Missing NOTION_API_TOKEN. See .env.example.\n')
      process.exit(1)
    }
    if (!dataSourceId) {
      console.error('\n✖ Missing NOTION_SUBMISSIONS_DATA_SOURCE_ID. See .env.example.\n')
      process.exit(1)
    }

    const items = await fetchApprovedItems({ dataSourceId, token })
    writeFileSync('data/links-inbox.json', JSON.stringify(items, null, 2))
    console.log(`Wrote ${items.length} approved item(s) to data/links-inbox.json`)
    console.log('\nNext: npm run links:add:dry   (then npm run links:add if it looks right)')
  }

  const isMain = import.meta.url === `file://${process.argv[1]}`
  if (isMain) {
    main().catch((e) => {
      console.error(e?.stack || String(e))
      process.exit(1)
    })
  }
  ```

- [ ] **Step 2: Write and run the verification script**

  Create `scripts/sync-approved-from-notion.verify.mjs`:

  ```js
  import assert from 'node:assert/strict'
  const { toLinksInboxItem, fetchApprovedItems, APPROVED_FILTER } =
    await import('./sync-approved-from-notion.mjs')

  assert.deepStrictEqual(APPROVED_FILTER, { property: 'Decision', select: { equals: 'Approved' } })

  const flatRow = {
    Title: 'Example Tool',
    URL: 'https://example.com',
    Description: 'A concise description.',
    Category: 'development',
    Tags: ['cli', 'productivity'],
    Decision: 'Approved'
  }
  const item = toLinksInboxItem(flatRow)
  assert.deepStrictEqual(item, {
    title: 'Example Tool',
    url: 'https://example.com',
    description: 'A concise description.',
    category: 'development',
    tags: ['cli', 'productivity'],
    status: 'approved'
  })
  console.log('PASS: toLinksInboxItem converts a flattened row correctly')

  const fakeRawPage = {
    created_time: '2026-07-03T00:00:00.000Z',
    url: 'https://notion.so/x',
    id: 'x',
    properties: {
      Title: { type: 'title', title: [{ plain_text: 'Example Tool' }] },
      URL: { type: 'url', url: 'https://example.com' },
      Description: { type: 'rich_text', rich_text: [{ plain_text: 'A concise description.' }] },
      Category: { type: 'select', select: { name: 'development' } },
      Tags: { type: 'multi_select', multi_select: [{ name: 'cli' }] },
      Decision: { type: 'select', select: { name: 'Approved' } }
    }
  }
  let capturedFilter
  const fakeQueryFn = async (_id, opts) => {
    capturedFilter = opts.filter
    return [fakeRawPage]
  }
  const items = await fetchApprovedItems({ dataSourceId: 'fake-id', token: 'fake', queryFn: fakeQueryFn })
  assert.deepStrictEqual(capturedFilter, APPROVED_FILTER)
  assert.strictEqual(items.length, 1)
  assert.strictEqual(items[0].title, 'Example Tool')
  assert.strictEqual(items[0].status, 'approved')
  console.log('PASS: fetchApprovedItems queries with the Approved filter and converts rows')

  console.log('\nAll sync-approved-from-notion checks passed.')
  ```

  Run: `node scripts/sync-approved-from-notion.verify.mjs`
  Expected:
  ```
  PASS: toLinksInboxItem converts a flattened row correctly
  PASS: fetchApprovedItems queries with the Approved filter and converts rows

  All sync-approved-from-notion checks passed.
  ```

- [ ] **Step 3: Delete the verification script**

  ```bash
  rm scripts/sync-approved-from-notion.verify.mjs
  ```

- [ ] **Step 4: Smoke-test against the real (currently empty) review database**

  Requires Task 6 to be complete (`NOTION_SUBMISSIONS_DATA_SOURCE_ID` set).

  Run: `node --env-file=.env scripts/sync-approved-from-notion.mjs`
  Expected: `Wrote 0 approved item(s) to data/links-inbox.json` (the review
  database is empty until the curation routine populates it — this run
  just proves the query + auth + filter work end to end).

- [ ] **Step 5: Commit**

  ```bash
  git add scripts/sync-approved-from-notion.mjs
  git commit -m "feat(notion): add script to sync Approved submissions into links-inbox.json"
  ```

---

### Task 8: `package.json` script aliases

**Files:**
- Modify: `package.json`

**Interfaces:** none

- [ ] **Step 1: Add the two new scripts**

  In `package.json`, add after the existing `"links:add:dry"` line:

  ```json
  "links:add:dry": "node scripts/upsert-links.mjs --dry-run",
  "notion:pull": "node --env-file=.env scripts/pull-notion-links.mjs",
  "notion:sync": "node --env-file=.env scripts/sync-approved-from-notion.mjs"
  ```

  (Note the trailing comma moves from `"links:add:dry"` to `"notion:sync"`
  since it's now the last entry — check `package.json`'s exact current
  formatting before editing.)

- [ ] **Step 2: Verify both run**

  Run: `npm run notion:pull -- --hub reddit-links`
  Expected: same output as Task 5 Step 4.

  Run: `npm run notion:sync`
  Expected: same output as Task 7 Step 4.

- [ ] **Step 3: Commit**

  ```bash
  git add package.json
  git commit -m "chore(notion): add notion:pull and notion:sync npm scripts"
  ```

---

### Task 9: Document the curation routine

**Files:**
- Modify: `docs/link-update-routine.md`

**Interfaces:** none (documentation only)

- [ ] **Step 1: Replace the closing "Want it to match your Reddit routine" section**

  In `docs/link-update-routine.md`, replace this existing section:

  ```markdown
  ## Want it to match your Reddit routine more closely?

  This is modeled on a generic "paste a batch → normalize → write" flow. If you
  share how your Reddit‑links routine is triggered and formatted (the exact prompt
  wording, any tags/fields it sets, where it stores results), the prompt above can
  be reworded to mirror it so both routines feel identical to run.
  ```

  with:

  ```markdown
  ## Pulling from Notion hubs instead of pasting manually

  If you keep saving tools to Notion (the "Reddit Links" and "Claude Skills
  and Agents" databases), there's a second routine that pulls from there
  directly instead of you pasting links by hand. Full design:
  `docs/superpowers/specs/2026-07-03-notion-link-ingestion-design.md`.

  ### One-time setup

  1. Create a Notion internal integration at notion.so/my-integrations,
     share both source databases with it, and add its token to `.env` as
     `NOTION_API_TOKEN`. (Full steps: see Task 1 of
     `docs/superpowers/plans/2026-07-03-notion-link-ingestion.md`.)
  2. The "Directory Submissions" review database should already exist
     (created once, alongside the source hubs) with
     `NOTION_SUBMISSIONS_DATA_SOURCE_ID` set in `.env`.

  ### The routine

  1. **Pull raw data:**
     ```bash
     npm run notion:pull
     ```
     Writes `data/notion-raw/reddit-links.json` and
     `data/notion-raw/claude-skills-and-agents.json`.

  2. **Curate (paste this into Claude):**

     > **You are running my "curate Notion links" routine.**
     >
     > Read `data/notion-raw/reddit-links.json` and
     > `data/notion-raw/claude-skills-and-agents.json`. For each row:
     >
     > **Drop** it if: there's no URL; it's a raw model-weight listing (e.g.
     > a bare Hugging Face model card); it's a pure how-to/docs page or a
     > news/blog article *about* a tool rather than the tool's own site;
     > `Type` is `Process` or `Reference`; `Category` includes `Tip`,
     > `Workflow`, `Prompt`, or `IN PROGRESS`.
     >
     > **Merge** rows that describe the same underlying product (e.g. a
     > product's own site + a blog post about it + its GitHub repo saved
     > separately) into one entry. Prefer the product's own domain > GitHub
     > repo > article about it as the canonical URL. Combine the best
     > description.
     >
     > **Categorize** into one of: `development`, `design`, `ai-ml`,
     > `analytics`, `marketing`, `productivity`, `security`, `database`,
     > `api`, `mobile`. Use `Type`/`Category` as hints, not a fixed lookup —
     > read the title + AI summary to decide. Leave genuinely ambiguous
     > items uncategorized rather than guessing.
     >
     > **Tag** each surviving item with 2-5 short lowercase tags.
     >
     > For each surviving item, create a page in the "Directory Submissions"
     > Notion database with: Title, URL, Description, Category, Tags,
     > Source Hub (which raw file it came from), and `Decision: Pending
     > Review`.
     >
     > Report final counts: rows read per hub, dropped (no URL), dropped
     > (non-tool content), merged (dedup), pages created.

  3. **Review in Notion:** open the "Directory Submissions" database, scan
     the table, fix anything inline (category, description, tags), flip
     `Decision` to `Approved` or `Rejected` per row.

  4. **Sync approved rows and write:**
     ```bash
     npm run notion:sync
     npm run links:add:dry
     npm run links:add
     ```
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add docs/link-update-routine.md
  git commit -m "docs(notion): document the Notion link-ingestion routine"
  ```

---

### Task 10: Run the first real backfill pull

**Files:** none (data files only, gitignored — nothing to commit)

**Interfaces:** none — this is the "run it for real" step, not new code.

This produces the raw material for the curation routine (Task 9's step 2)
but does NOT do the curation itself — filtering/deduping/categorizing 368+
rows is a separate, judgment-heavy pass to run afterward, not a mechanical
plan step.

- [ ] **Step 1: Pull both hubs in full (no `--since`)**

  Run: `npm run notion:pull`
  Expected:
  ```
  Pulling "reddit-links"...
    wrote N row(s) to data/notion-raw/reddit-links.json
  Pulling "claude-skills-and-agents"...
    wrote M row(s) to data/notion-raw/claude-skills-and-agents.json
  ```
  where N is at least 368 and M is whatever the hub currently holds.

- [ ] **Step 2: Sanity-check the dumps**

  ```bash
  node -e "
    const fs = require('node:fs')
    const reddit = JSON.parse(fs.readFileSync('data/notion-raw/reddit-links.json'))
    const skills = JSON.parse(fs.readFileSync('data/notion-raw/claude-skills-and-agents.json'))
    console.log('reddit-links:', reddit.length, 'rows,', reddit.filter(r => r.URL).length, 'with a URL')
    console.log('claude-skills-and-agents:', skills.length, 'rows,', skills.filter(r => r.URL).length, 'with a URL')
  "
  ```
  Expected: reddit-links shows most rows with a URL (roughly matches the
  total count); claude-skills-and-agents shows only a small fraction with
  a URL (~4% was observed during design — most rows there are the user's
  own custom skills/commands with no link).

- [ ] **Step 3: Report back and stop**

  This plan's implementation is complete once this step confirms real data
  landed in `data/notion-raw/`. Running the curation routine (Task 9's
  step 2) against this data is the next, separate action — it involves
  reading hundreds of rows with judgment, which doesn't fit a mechanical
  plan step.

---

## Self-Review Notes

- **Spec coverage:** §1 (source hubs) → Task 5's `HUBS` config. §2 (puller)
  → Task 5. §3 (setup) → Task 1. §4 (curation routine) → Task 9. §5 (review
  DB schema) → Task 6. §6 (sync script) → Task 7. Non-goals (no Postgres
  pending stage, no custom review UI, hub 3 excluded) → nothing in this
  plan reintroduces them. Testing section (dry-run first, exact counts,
  spot-check) → Tasks 5/7's smoke tests print exact counts; Task 9's
  routine prompt asks Claude to report counts; `links:add:dry` is
  unchanged and still the final gate before any write.
- **Type consistency:** `flattenNotionPage` is used identically in Task 5
  (puller) and Task 7 (sync) with the same signature; `queryDataSourceAll`'s
  `opts.queryFn` injection point is used the same way in both verification
  scripts and both real scripts.
- **No placeholders:** every step has literal, complete code or an exact
  command + expected output.
