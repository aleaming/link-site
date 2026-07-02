# CLAUDE.md

Curated link directory ("SaaSy Resources"). React 18 + TypeScript + Vite SPA,
Netlify Functions + Netlify DB (managed Neon Postgres), one Netlify site
(`link-site-800`). See README.md for the full layout.

## Commands

- `npm run dev:netlify` — full stack (Vite + functions + DB env) at :8888
- `npm run dev` — frontend only; API falls back to bundled sample data
- `npm run build` — `tsc -b && vite build`; must stay type-clean (Netlify runs this)
- `npm run lint` — eslint (keep at 0 errors)
- `npm run links:add[:dry]` / `npm run db:apply` — data workflow (docs/link-update-routine.md)

## Architecture notes

- Live components are ONLY `components/layouts/` (app-header, category-sidebar,
  hero-section, link-grid) + `components/ui/` (glow-button, link-card,
  search-command, tag-chip). There is no `features/` layer, no Zustand store,
  no Fuse.js — an older generation using those was removed in July 2026;
  don't reintroduce the pattern from stale docs or git history.
- State: plain React state in `App.tsx` + react-query for links/categories.
- The `@/` path alias is defined in BOTH `vite.config.ts` (resolve.alias) and
  `tsconfig.app.json` (paths). Change them together.
- Netlify functions own their routes via `export const config = { path: '/api/...' }`
  in each `.mts` file; `netlify.toml` only has the SPA catch-all.
- `pg` stays in `dependencies` (not dev): functions need it at deploy time;
  it never reaches the browser bundle.
- `src/lib/data.ts` bundles sample fallback data so the UI renders without a DB.

## Style

- Tailwind + design tokens from `src/design-system.css` (wire electric brand,
  glass surfaces, glow accents). Use `cn()` from `@/lib/utils` for class merging.
- Buttons: use `GlowButton` (CVA variants), not raw `<button>` for primary actions.
