# Link‑update routine

A repeatable way to add or update the links shown on the site — the same kind
of "give Claude a batch, it does the rest" flow you already use for your Reddit
links, but the destination here is the project's **Supabase `links` table**.

There are two halves:

1. **The routine prompt** (below) — you run this in Claude. You paste raw links
   or notes; Claude turns them into clean JSON and runs the writer for you.
2. **The writer** — [`scripts/upsert-links.mjs`](../scripts/upsert-links.mjs),
   which validates the JSON and **upserts** it into Supabase. "Upsert" means
   re-running with the same URL **updates** that link instead of creating a
   duplicate, so the routine is safe to run as often as you like.

Once a link's `status` is `approved`, it shows up on the site.

---

## One‑time setup

The storage backend is the **built-in Netlify Database** (managed Postgres),
reached through Netlify Functions. There are **no database keys to configure** —
`getConnectionString()` from `@netlify/database` resolves the connection
automatically (a local Postgres under `netlify dev`, the production DB once
deployed).

Do this once per machine/project.

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Link the project to its Netlify site** (once per machine):
   ```bash
   netlify link        # this project is the `link-site-800` site
   ```
3. **Apply the schema to your local DB.** Start the dev environment (which boots
   a local Postgres) and apply the baseline migration:
   ```bash
   netlify dev         # in one terminal — serves the app + functions on :8888
   npm run db:apply    # in another — applies netlify/database/migrations/*
   ```
   The schema (`categories`, `links`, `link_clicks` + seed data) lives in
   [`netlify/database/migrations/`](../netlify/database/migrations) and is
   applied **automatically on deploy**.

> The site still works without any backend — it falls back to a few bundled
> sample links — but nothing you add will persist or appear until the database
> is connected.

---

## The routine prompt

Paste this into Claude (Desktop or Code) whenever you want to add links. Replace
the example block at the bottom with whatever you're adding — a list of URLs,
a messy paste, bookmarks, notes, anything.

> **You are running my "add links to the site" routine.**
>
> For each item I give you below, produce one object for the `links`
> table with these fields:
> - `title` — short product/resource name
> - `url` — full `https://` URL (required)
> - `description` — one clear sentence
> - `category` — pick the single best **slug** from this list:
>   `development`, `design`, `ai-ml`, `analytics`, `marketing`,
>   `productivity`, `security`, `database`, `api`, `mobile`
> - `tags` — 2–5 short lowercase tags
> - `featured` — `true` only if I say so (default `false`)
> - `verified` — `true` if it's a well‑known/official resource
> - `status` — `"approved"` unless I say otherwise
>
> Then:
> 1. Write the full JSON array to `data/links-inbox.json`.
> 2. Run `npm run links:add:dry` and show me the validation output.
> 3. If it looks right, run `npm run links:add` to write to the database and
>    report what was added/updated.
>
> Here are the links:
>
> ```
> <paste your links / URLs / notes here>
> ```

That's the whole loop. Claude fills `data/links-inbox.json`, dry‑runs it,
then upserts. You can also tweak the JSON by hand before the final run.

---

## Running the writer manually

You don't need Claude in the loop — the script stands alone:

```bash
# 1. Put your links in data/links-inbox.json (see data/links-inbox.example.json)
cp data/links-inbox.example.json data/links-inbox.json

# 2. Validate without writing (no DB connection needed)
npm run links:add:dry

# 3. Write to the database. `links:add` runs through `netlify dev:exec` so the
#    DB connection is wired up automatically.
npm run links:add
```

Other ways to call it (wrap in `netlify dev:exec` so the connection resolves):

```bash
netlify dev:exec node scripts/upsert-links.mjs path/to/your-links.json   # custom file
echo '[{"title":"X","url":"https://x.com"}]' | netlify dev:exec node scripts/upsert-links.mjs --stdin
```

### Input format

Only `title` and `url` are required; everything else has sensible defaults.

```json
[
  {
    "title": "Linear",
    "url": "https://linear.app",
    "description": "Streamlined issue tracking for software teams",
    "category": "productivity",
    "tags": ["project-management", "issues"],
    "featured": true,
    "verified": true,
    "status": "approved"
  }
]
```

| Field            | Required | Default      | Notes |
|------------------|----------|--------------|-------|
| `title`          | yes      | —            | |
| `url`            | yes      | —            | must start with `http(s)://`; the unique key for upserts |
| `description`    | no       | `null`       | |
| `category`       | no       | uncategorized| slug **or** name; unknown values warn and leave it uncategorized |
| `tags`           | no       | `[]`         | array, or a comma‑separated string |
| `featured`       | no       | `false`      | |
| `verified`       | no       | `false`      | |
| `status`         | no       | `approved`   | `pending` \| `approved` \| `rejected` |
| `icon_url`       | no       | `null`       | |
| `screenshot_url` | no       | `null`       | |

> `domain` is derived automatically by the database from `url` — don't set it.

### Category slugs

`development` · `design` · `ai-ml` · `analytics` · `marketing` ·
`productivity` · `security` · `database` · `api` · `mobile`

---

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
