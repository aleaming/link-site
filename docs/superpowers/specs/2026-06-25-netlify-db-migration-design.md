# Design: Migrate storage from Supabase → Netlify DB (Neon)

**Date:** 2026-06-25
**Status:** Approved design, pending implementation plan
**Driver:** Consolidate onto Netlify (one vendor: hosting + database).

## Goal

Replace Supabase as the storage/backend for the link directory with **Netlify
DB (Neon serverless Postgres)** fronted by **Netlify Functions**. Preserve the
existing React UI and the batch link-add workflow.

## Scope

In scope (the only features the site needs):

- **Public read** of approved links (the homepage grid).
- **Click analytics** — record clicks and increment a per-link counter.
- **Admin batch-add** — the existing `npm run links:add` routine.

Explicitly **out of scope** (YAGNI — none are used today, all addable later):

- Auth / login / user accounts
- `user_profiles` table and per-user saved links (saved links stay local React state)
- Row Level Security (no browser-direct DB access, so not needed)
- Realtime subscriptions
- Server-side search (search is already client-side via Fuse.js)
- Stored DB functions (`search_links`, `get_trending_links`, etc.)

## Architecture

```
Browser (React + React Query)
      │  fetch('/api/links'), fetch('/api/track/:id')
      ▼
Netlify Functions
  • GET  /api/links      → approved links + category, in AppLinkItem shape
  • POST /api/track/:id  → insert link_clicks row, increment links.click_count
      │  NETLIFY_DATABASE_URL (server-side only, never shipped to browser)
      ▼
Neon Postgres (Netlify DB)
  tables: categories, links, link_clicks

Admin: npm run links:add → connects to Neon directly, INSERT … ON CONFLICT (url)
```

The browser **never** connects to Postgres directly. The Neon connection
string lives only in Netlify's server-side env (`NETLIFY_DATABASE_URL`,
auto-provisioned by `netlify db init`) and, for the local admin script, in a
gitignored `.env`.

## Data access

**Raw parameterized SQL** via `@netlify/neon` (`const sql = neon()`), which
wraps `@neondatabase/serverless` and auto-reads `NETLIFY_DATABASE_URL`. No ORM.
All values passed as parameters (`sql(query, [params])`) — never string
interpolation — to prevent SQL injection. The admin script (run outside the
Functions runtime) uses `@neondatabase/serverless`'s `neon(process.env.NETLIFY_DATABASE_URL)`.

## Database schema

Consolidated into a single `db/schema.sql`, applied once via `npm run db:setup`
(runs the SQL against Neon through `netlify dev:exec`). Ported and simplified
from the existing `supabase/migrations/*.sql`:

| Table | Change from Supabase version |
|-------|------------------------------|
| `categories` | Kept. Drop RLS policies. Seed default categories. |
| `links` | Kept. **Drop `submitted_by`** (FK to `auth.users`). Drop RLS. Keep unique `url`, generated `domain` column, `status` enum, `click_count`. |
| `link_clicks` | Kept. **Drop `user_id`** (FK to `auth.users`). Keep `ip_address`, `user_agent`, `referrer`, `clicked_at`. |
| `user_profiles` | **Dropped entirely.** |

No RLS is enabled: the only DB clients are the server-side Functions and the
admin script, both using a privileged connection.

## Components

### `GET /api/links` (Netlify Function)

- Query: approved links left-joined to `categories`, ordered by `created_at desc`.
- Maps DB rows (snake_case) → `AppLinkItem` (camelCase, flat `category` name).
  This mapping logic moves out of `lib/data.ts` into the function.
- Returns `200` with `AppLinkItem[]` JSON.

### `POST /api/track/:id` (Netlify Function)

- `INSERT INTO link_clicks (link_id, user_agent, referrer) VALUES (…)`.
- `UPDATE links SET click_count = click_count + 1 WHERE id = :id`.
- Returns `204`. Failures are swallowed server-side (analytics must never break
  navigation) but logged.

### `lib/data.ts` (frontend)

- `fetchLinks()` → `fetch('/api/links')`; on any error, fall back to the
  existing bundled `sampleLinks` (unchanged behavior).
- New `trackClick(id: string)` → `fetch('/api/track/' + id, { method: 'POST' })`,
  fire-and-forget. Wired into the link-click handler that is currently a
  `console.log` in `App.tsx` / `LinkCard`.
- `AppLinkItem` interface and `sampleLinks` stay here.

### Removals

- Delete `src/lib/supabase.ts` and the unused `Database` type in `src/lib/types.ts`.
- Remove `@supabase/supabase-js` from `package.json`.
- Remove the `supabase/` directory once the schema is ported (or keep as
  historical reference — decided in the plan).

### `scripts/upsert-links.mjs` (admin)

- Keep all CLI parsing, validation, dry-run, category slug/name resolution, and
  output. Only the write backend changes:
  - Swap `createClient` (supabase-js) for `neon(process.env.NETLIFY_DATABASE_URL)`.
  - Category lookup: `SELECT id, name, slug FROM categories`.
  - Write: `INSERT INTO links (...) VALUES (...) ON CONFLICT (url) DO UPDATE SET ...`.
- `npm run links:add` and `npm run links:add:dry` keep identical UX.

### Config

- New `netlify.toml`: build `vite build`, publish `dist`, functions dir,
  `/api/*` → functions redirect, SPA fallback `/* → /index.html` (200).
- `.env.example` rewritten: remove all `SUPABASE_*` / `VITE_SUPABASE_*`; document
  that `NETLIFY_DATABASE_URL` is auto-provisioned and retrievable via
  `netlify env:get NETLIFY_DATABASE_URL` for local script runs.
- New scripts: `db:setup` (apply schema), and `netlify dev` for local run.

## Data flow

1. **Read:** `App.tsx` `useQuery(['links'], fetchLinks)` → `GET /api/links` →
   Neon → `AppLinkItem[]` → React Query cache (5-min stale) → grid. On error,
   `sampleLinks`.
2. **Click:** user clicks a card → `trackClick(id)` (non-blocking) → `POST
   /api/track/:id` → Neon insert + increment.
3. **Admin add:** edit `data/links-inbox.json` → `npm run links:add:dry`
   (validate) → `npm run links:add` (upsert to Neon).

## Error handling

- Read function DB error → `500`; frontend catches and shows `sampleLinks`.
- Track function error → logged, `204` anyway (never block UX).
- Admin script → existing fail-fast validation; surface Neon errors clearly.
- Missing `NETLIFY_DATABASE_URL` in Functions → `500` with a clear log; in the
  script → existing "missing credentials" guard, reworded for Neon.

## Testing

- **Local:** `netlify dev`, confirm grid loads from Neon; click a card and verify
  a `link_clicks` row + incremented `click_count`.
- **Admin script:** `--dry-run` against a sample batch, then a real upsert; re-run
  to confirm upsert (no duplicates).
- **Fallback:** with the DB unreachable, confirm the UI still renders `sampleLinks`.
- **Deploy preview:** verify Netlify's preview DB branch is used, not production.

## Migration / rollout

1. Provision: `npm install @netlify/neon`, `netlify link`, `netlify db init`.
2. Apply `db/schema.sql` (`npm run db:setup`); seed categories.
3. Backfill existing links via `npm run links:add` (if any production data must
   carry over from Supabase, export it to `links-inbox.json` first).
4. Land Functions + frontend swap; verify on a deploy preview.
5. Remove Supabase deps/files. Deprovision the Supabase project once verified.

## Open questions

- None blocking. Production-data backfill from the current Supabase instance is
  only relevant if live data exists there (TBD with user at implementation time).
