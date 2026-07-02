# SaaSy Resources (link-site)

A curated link directory for SaaS and developer tools. React SPA on the front,
Netlify Functions + Netlify DB (managed Neon Postgres) on the back, deployed as
a single Netlify site (`link-site-800`).

## Stack

- **React 18 + TypeScript** built with Vite
- **Tailwind CSS** plus a custom token layer in `src/design-system.css`
- **@tanstack/react-query** for server state (links, categories)
- **Framer Motion** for animation, **cmdk** for the ⌘K search palette,
  **Radix UI** primitives (dialog, dropdown, slot)
- **Netlify Functions** (`.mts`, esbuild) speaking to Postgres via `pg`

## Project layout

```
src/
├── App.tsx                        # Root: state, react-query, layout composition
├── design-system.css              # Design tokens (colors, glass, glow)
├── components/
│   ├── layouts/
│   │   ├── app-header.tsx         # Sticky glass header, search trigger
│   │   ├── category-sidebar.tsx   # Category nav + stats footer
│   │   ├── hero-section.tsx       # Hero with live stats
│   │   └── link-grid.tsx          # Grid/list/masonry views, sorting
│   └── ui/
│       ├── glow-button.tsx        # CVA-variant button (brand glow)
│       ├── link-card.tsx          # Link tile with dropdown actions
│       ├── search-command.tsx     # cmdk palette in a Radix dialog
│       └── tag-chip.tsx           # Tag pills / groups
└── lib/
    ├── data.ts                    # API client + types + offline fallback data
    └── utils.ts                   # cn() class merger

netlify/
├── functions/
│   ├── links.mts                  # GET /api/links
│   ├── categories.mts             # GET /api/categories
│   └── track.mts                  # POST /api/track (click counting)
└── database/migrations/           # Netlify DB (Neon Postgres) migrations

scripts/upsert-links.mjs           # Bulk add/update links from a JSON inbox
data/links-inbox.example.json      # Template for the link-update routine
docs/link-update-routine.md        # How to add new links
```

Functions own their routes via `export const config = { path: '/api/...' }`;
everything else falls through to the SPA (see `netlify.toml`).

## Development

```bash
npm install
npm run dev:netlify   # full stack: Vite + functions + DB env at :8888
npm run dev           # frontend only (API calls fall back to sample data)
```

The UI renders bundled sample data from `src/lib/data.ts` whenever the API is
unreachable, so the frontend works without a provisioned database.

## Checks & build

```bash
npm run lint          # eslint
npm run build         # tsc -b (type-check) + vite build — same command Netlify runs
```

## Data workflow

```bash
npm run db:apply      # apply migrations (netlify database migrations apply)
npm run links:add:dry # preview upserts from data/links-inbox.json
npm run links:add     # apply them (runs inside netlify dev:exec for DB env)
```

See `docs/link-update-routine.md` for the full routine.
