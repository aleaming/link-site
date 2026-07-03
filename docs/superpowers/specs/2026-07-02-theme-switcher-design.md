# Theme Switcher (Palette Randomizer) — Design

- **Date:** 2026-07-02
- **Status:** Draft — awaiting user review (two clarifying questions went unanswered mid-session; see "Assumptions requiring confirmation" below)
- **Related:** Inspired by the theme randomizer in a reference project (ASCII-Art-Genie); adapted to this codebase's actual theming architecture.

## Problem / Goal

Add a theme switcher to increase engagement: a playful "randomize" control that lets
visitors see the site's look transform, plus a way to deliberately pick and keep a
palette they like. Stated goal: **at least 7 themes, each with a light and dark
mode** (14+ total color combinations).

## Why this isn't a drop-in port of the reference architecture

The reference app is a single-file app where **all** color comes from ~8 CSS custom
properties per theme, written at runtime via `Ui.applyTheme()`. Nothing is
hardcoded, so swapping those variables recolors the entire UI for free.

This codebase is a hybrid:

- `src/design-system.css` already defines a similar-shaped token set
  (`--bg-primary/secondary/elevated`, `--text-primary/secondary/tertiary`,
  `--border-primary/secondary`, `--accent-primary/secondary/hover`) with light
  values in `:root` and dark overrides in `[data-theme="dark"]`.
- But ~125 color-bearing Tailwind class occurrences across 8 component files
  are hardcoded literals — `dark:bg-neutral-900`, `bg-cream`, `text-cyan-500`,
  etc. — and do **not** read from those CSS variables at all.
- Brand colors (`sand`, `cream`, `cyan-*`, `lime-*`) are literal values in
  `tailwind.config.js`, not variable references.

Swapping only the CSS variables (the cheap option) would recolor a handful of
elements and leave most of the UI frozen — not the dramatic effect the user is
after. This spec chooses the full-recolor path: migrate the hardcoded classes to
read from the same variable system, so palette swaps behave like the reference.
(Confirmed with user: "Full recolor" selected over "Accent-only recolor.")

## Assumptions requiring confirmation

Two follow-up questions went unanswered (user away from keyboard) after the scope
question was confirmed. This spec proceeds on the recommended answers below —
**please confirm or correct these before implementation starts:**

1. **Two independent axes** — palette (8 options) × light/dark (2) = 16 combinations.
   The existing Sun/Moon toggle keeps controlling light/dark exactly as today; a new
   control picks the palette independently. (Rejected alternative: baked
   one-look-per-theme with no separate toggle — doesn't match "light and dark mode"
   per theme from the stated goal.)
2. **Dice button + manual picker, both present.** The dice rolls a random palette
   (keeping whatever light/dark mode is currently active, so it doesn't fight the
   Sun/Moon toggle); a small swatch/dropdown lets a user deliberately pick and keep
   a specific palette. Choice persists to `localStorage`.

## Architecture

**JS theme-data object + runtime CSS variable injection**, mirroring the reference
app's model inside this codebase's existing variable system.

```ts
// src/lib/themes.ts
interface ThemeTokens {
  bgPrimary: string; bgSecondary: string; bgElevated: string
  textPrimary: string; textSecondary: string; textTertiary: string
  borderPrimary: string; borderSecondary: string
  accentPrimary: string; accentSecondary: string; accentHover: string
}
interface Palette {
  name: string
  light: ThemeTokens
  dark: ThemeTokens
}
const THEMES: Record<string, Palette> = { electric: {...}, sunset: {...}, ... }

function applyTheme(paletteKey: string, mode: 'light' | 'dark') {
  const tokens = THEMES[paletteKey][mode]
  const root = document.documentElement.style
  root.setProperty('--bg-primary', tokens.bgPrimary)
  // ...one setProperty call per token
  document.documentElement.dataset.palette = paletteKey
}
```

- Adding a 9th palette later = adding one object to `THEMES`. No CSS edits needed.
- `tailwind.config.js` maps semantic names to the variables so utility classes work
  regardless of active palette:
  ```js
  colors: {
    bg: 'var(--bg-primary)',
    surface: 'var(--bg-secondary)',
    elevated: 'var(--bg-elevated)',
    fg: 'var(--text-primary)',
    'fg-secondary': 'var(--text-secondary)',
    'fg-tertiary': 'var(--text-tertiary)',
    line: 'var(--border-primary)',
    'line-secondary': 'var(--border-secondary)',
    accent: 'var(--accent-primary)',
    'accent-secondary': 'var(--accent-secondary)',
    'accent-hover': 'var(--accent-hover)',
  }
  ```
- Existing `--cyan-*`, `--lime-*`, `--neutral-*`, `sand`, `cream` Tailwind colors and
  `design-system.css` custom properties remain defined (nothing deletes the current
  "Electric" look) — palette 1 ("Electric") simply equals today's values, so the
  default experience is visually unchanged before any interaction.

## Proposed palette set (8 total)

| # | Key | Name | Light bg / Dark bg | Accent (light → dark) |
|---|-----|------|---------------------|------------------------|
| 1 | `electric` | Electric (current, default) | `#d4c5a0` / `#262626` | `#00d9e6`/`#9cbf00` → `#33e5ff`/`#e9ff33` |
| 2 | `sunset` | Sunset | `#f5e0d3` / `#2b1f2e` | `#e8623d`/`#f2a640` → `#ff7a4d`/`#ffb347` |
| 3 | `aurora` | Aurora | `#dbeef0` / `#0d1b2a` | `#14b8a6`/`#8b5cf6` → `#2dd4bf`/`#a78bfa` |
| 4 | `mint` | Mint Circuit | `#d9f2e3` / `#0b1f16` | `#10b981`/`#34d399` → `#34d399`/`#6ee7b7` |
| 5 | `coral` | Coral Reef | `#fbdad0` / `#0e2626` | `#f4587a`/`#fb923c` → `#fb7185`/`#fdba74` |
| 6 | `violet` | Violet Nebula | `#e4dbf5` / `#160f26` | `#9333ea`/`#d946ef` → `#c084fc`/`#f0abfc` |
| 7 | `solar` | Solar Flare | `#f5e6c8` / `#241a0f` | `#f59e0b`/`#dc2626` → `#fbbf24`/`#f87171` |
| 8 | `arctic` | Arctic | `#dbe9f7` / `#0a1929` | `#2563eb`/`#06b6d4` → `#60a5fa`/`#22d3ee` |

Full token tables (all 11 values × 2 modes × 8 palettes) will be written directly
into `src/lib/themes.ts` during implementation — the hex values above are the
anchor bg/accent colors; secondary/tertiary text and border shades derive by
standard tint/shade steps from each palette's bg and accent, done at
implementation time so they can be eyeballed for contrast live in the browser
rather than guessed here.

## Component migration plan

Replace hardcoded literals with the new semantic Tailwind classes. No `dark:`
prefix needed for these — the variable itself changes per mode, so one class
replaces each hardcoded pair.

| File | Approx. occurrences | Example change |
|------|---------------------|-----------------|
| `src/components/layouts/link-grid.tsx` | 26 | `bg-cream dark:bg-neutral-900` → `bg-surface` |
| `src/components/ui/link-card.tsx` | 21 | `bg-white dark:bg-neutral-800` → `bg-surface` |
| `src/components/layouts/hero-section.tsx` | 18 | `text-neutral-900 dark:text-white` → `text-fg` |
| `src/components/layouts/category-sidebar.tsx` | 16 | `border-neutral-200 dark:border-neutral-700` → `border-line` |
| `src/components/layouts/app-header.tsx` | 15 | `bg-cream/80 dark:bg-neutral-900/80` → `bg-surface/80` |
| `src/components/ui/search-command.tsx` | 15 | `text-cyan-500` → `text-accent` |
| `src/components/ui/glow-button.tsx` | 9 | CVA variant colors → `bg-accent`, `shadow-[0_0_20px_var(--accent-primary)]` |
| `src/components/ui/tag-chip.tsx` | 5 | `bg-lime-500/20` → `bg-accent-secondary/20` |

`GlowButton`'s CVA variants and any hardcoded `shadow-glow-cyan`/`shadow-glow-lime`
Tailwind box-shadow utilities need a look during implementation — those are
static box-shadow definitions in `tailwind.config.js` tied to the cyan/lime hex
values specifically, and either need a variable-based equivalent
(`shadow-[0_0_8px_var(--accent-primary)]`) or get left as an "Electric-only"
flourish that other palettes simply don't use (a real implementation-time
decision, flagged here rather than pre-decided).

## UI / UX

- **Location:** header, next to the existing Sun/Moon toggle in `app-header.tsx`.
- **Dice/shuffle button:** picks a random palette key (excluding the currently
  active one, so a click always visibly changes something), calls
  `applyTheme(newKey, currentMode)`, shows a small toast ("🎲 {Palette Name}").
- **Manual picker:** a small dropdown or popover of 8 named swatches (color dot +
  name), clicking one calls `applyTheme(key, currentMode)` directly, no toast
  needed (deliberate action, not a surprise).
- **Persistence:** `localStorage.setItem('theme-palette', key)` on every change,
  read on load before first paint (in `app-header.tsx`'s existing theme `useEffect`,
  alongside where `darkMode` is initialized) to avoid a flash of the wrong palette.
  The existing light/dark preference is not currently persisted either — this spec
  adds persistence for **both** palette and mode together as one `localStorage`
  read/write, fixing the existing "always defaults to dark on reload" gap as a
  side effect.

## Non-goals

- No animation-mode / charset / colorMode axes (those are specific to the
  reference app's ASCII-art renderer, not applicable here).
- No changes to OG images, social-share screenshots, or backend/Netlify functions.
- No per-user server-side persistence — `localStorage` only, matching how the
  rest of the site's client-only preferences work today.

## Testing plan

- `npm run build` stays type-clean (Tailwind config + new `themes.ts` module).
- Manual verification via `npm run dev` in a **foreground** browser tab (per prior
  session's gotcha: backgrounded/occluded tabs throttle rAF and can look broken
  when they're not): cycle all 8 palettes × both modes, spot-check text contrast
  on `bg-primary` and `bg-secondary` for each, confirm the dice never repeats the
  current palette back-to-back, confirm `localStorage` round-trips on reload.
- No new automated tests planned — this is a pure visual/client-state feature with
  no business logic beyond `applyTheme()`; a build type-check plus manual visual
  QA across all 16 combinations is the appropriate bar here.

## Open questions for implementation time (not blocking spec approval)

- Exact secondary/tertiary text and border shades per palette (derived live in
  browser for contrast, not hand-guessed in this doc).
- Whether `GlowButton`'s glow-shadow effect is palette-aware or an "Electric-only"
  flourish.
