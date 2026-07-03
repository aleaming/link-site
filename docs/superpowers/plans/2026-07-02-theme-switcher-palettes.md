# Theme Switcher (Palette Randomizer) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a palette theme switcher (dice/randomize + manual picker) with 8 named palettes, each with a light and dark variant, that visibly recolors the whole site — not just a handful of elements.

**Architecture:** A single `src/lib/themes.ts` data module (`THEMES` record + `applyTheme()`) writes 11 CSS custom properties onto `document.documentElement` at runtime. `tailwind.config.js` maps semantic color/shadow names to those variables so existing Tailwind classes become palette-reactive with zero per-component JS. The ~125 hardcoded `dark:`/`cyan-*`/`lime-*` class occurrences across 8 component files get migrated to the new semantic classes.

**Tech Stack:** React 18 + TypeScript + Vite, Tailwind CSS 3, framer-motion, lucide-react. No new dependencies.

## Global Constraints

- `npm run build` (`tsc -b && vite build`) must stay type-clean after every task.
- `npm run lint` must stay at 0 errors (project requirement, see CLAUDE.md).
- Live components are ONLY `src/components/layouts/*` and `src/components/ui/*` — do not introduce a `features/` layer, Zustand, or Fuse.js.
- **This project has no automated test runner** (`package.json` has no `vitest`/`jest`; confirmed during spec research). Per the approved spec's Testing Plan, "tests" in this plan means `npm run build` type-checking plus manual browser verification — there is no test framework to wire up, and adding one is out of scope.
- Verify all UI changes in a **foreground** browser tab. A prior session's gotcha: backgrounded/occluded tabs throttle `requestAnimationFrame`, so framer-motion animations can look frozen/broken in a way that has nothing to do with the code.
- The shell's `cat` is aliased to `bat` (not installed) — `$(cat <<EOF ...)` heredocs in commit messages silently produce an empty message. Write the commit message to a scratch file and use `git commit -F <file>` instead.
- Spec reference: `docs/superpowers/specs/2026-07-02-theme-switcher-design.md`.

---

## Setup: create the feature branch

- [ ] **Step 1: Create the branch off `main`**

```bash
git checkout main && git pull
git checkout -b feature/theme-switcher-palettes
```

If the `validate-branch-name.py` hook rejects this name, re-read its message and
adjust per the Conventional Branch grammar — do not bypass the hook.

---

### Task 1: Palette-reactive Tailwind tokens

**Files:**
- Modify: `tailwind.config.js`

**Interfaces:**
- Produces: Tailwind color utilities `bg-bg`, `bg-surface`, `bg-elevated`,
  `text-fg`, `text-fg-secondary`, `text-fg-tertiary`, `border-line`,
  `border-line-secondary`, `bg-accent`/`text-accent`/`border-accent`,
  `bg-accent-secondary`/`text-accent-secondary`, `bg-accent-hover`/`text-accent-hover`
  — all resolving to the CSS custom properties already defined in
  `src/design-system.css` (`--bg-primary`, `--text-primary`, `--accent-primary`,
  etc.), which Task 2's `applyTheme()` will overwrite at runtime.
- Produces: box-shadow utilities `shadow-glow-cyan-sm`, `shadow-glow-cyan`,
  `shadow-glow-cyan-lg`, `shadow-glow-lime` (existing class names, now
  palette-reactive) and four new ones: `shadow-glow-accent-xs`,
  `shadow-glow-accent-sm`, `shadow-glow-accent-md`, `shadow-glow-accent-lg`.

This task only adds/repoints Tailwind tokens — it does not change any
component's classes yet, so the site's visual output is byte-for-byte
identical before and after (the new tokens currently resolve to the same
values the hardcoded classes already produced, since `--accent-primary` etc.
default to the current cyan/lime values in `design-system.css`).

- [ ] **Step 1: Edit `tailwind.config.js` — add semantic colors**

In the `theme.extend.colors` object, after the existing `cream: '#fbf8f0',`
line, add:

```js
        // Palette-reactive semantic tokens — resolve to CSS custom properties
        // written at runtime by applyTheme() in src/lib/themes.ts.
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
```

- [ ] **Step 2: Edit `tailwind.config.js` — make glow shadows palette-reactive**

Replace the existing `boxShadow` block:

```js
      boxShadow: {
        'glow-cyan-sm': '0 0 4px rgb(11 249 255 / 0.3)',
        'glow-cyan': '0 0 8px rgb(11 249 255 / 0.45), 0 0 20px rgb(11 249 255 / 0.2)',
        'glow-cyan-lg': '0 0 12px rgb(11 249 255 / 0.5), 0 0 28px rgb(11 249 255 / 0.3), 0 0 48px rgb(11 249 255 / 0.12)',
        'glow-lime': '0 0 8px rgb(211 255 26 / 0.45), 0 0 20px rgb(211 255 26 / 0.2)',
        // Layered, realistic elevation
        'elevated': '0 1px 2px rgb(0 0 0 / 0.18), 0 4px 8px rgb(0 0 0 / 0.16), 0 12px 24px rgb(0 0 0 / 0.18)',
      },
```

with:

```js
      boxShadow: {
        // rgb(from ...) is CSS relative color syntax (Chrome/Edge 119+,
        // Safari 16.4+, Firefox 128+) — it re-derives r/g/b from whatever
        // --accent-primary currently holds, so these stay in sync with the
        // active palette with zero JS.
        'glow-cyan-sm': '0 0 4px rgb(from var(--accent-primary) r g b / 0.3)',
        'glow-cyan': '0 0 8px rgb(from var(--accent-primary) r g b / 0.45), 0 0 20px rgb(from var(--accent-primary) r g b / 0.2)',
        'glow-cyan-lg': '0 0 12px rgb(from var(--accent-primary) r g b / 0.5), 0 0 28px rgb(from var(--accent-primary) r g b / 0.3), 0 0 48px rgb(from var(--accent-primary) r g b / 0.12)',
        'glow-lime': '0 0 8px rgb(from var(--accent-secondary) r g b / 0.45), 0 0 20px rgb(from var(--accent-secondary) r g b / 0.2)',
        'glow-accent-xs': '0 0 8px rgb(from var(--accent-primary) r g b / 0.3)',
        'glow-accent-sm': '0 0 12px rgb(from var(--accent-primary) r g b / 0.4)',
        'glow-accent-md': '0 0 20px rgb(from var(--accent-primary) r g b / 0.3)',
        'glow-accent-lg': '0 0 24px rgb(from var(--accent-primary) r g b / 0.5)',
        // Layered, realistic elevation
        'elevated': '0 1px 2px rgb(0 0 0 / 0.18), 0 4px 8px rgb(0 0 0 / 0.16), 0 12px 24px rgb(0 0 0 / 0.18)',
      },
```

- [ ] **Step 3: Verify no visual regression**

Run: `npm run dev` (or `npm run dev:netlify`)
Open the site in a foreground browser tab. It must look pixel-identical to
before this change — no component references the new classes yet.

- [ ] **Step 4: Type-check**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.js
git commit -m "feat(theme): add palette-reactive Tailwind color and shadow tokens"
```

---

### Task 2: Theme data + engine (`src/lib/themes.ts`)

**Files:**
- Create: `src/lib/themes.ts`

**Interfaces:**
- Produces: `ThemeMode` (`'light' | 'dark'`), `ThemeTokens` interface (11
  string fields), `Palette` interface (`{ name, light, dark }`),
  `THEMES: Record<string, Palette>` (8 entries, keys in this order:
  `electric, sunset, aurora, mint, coral, violet, solar, arctic`),
  `PALETTE_KEYS: string[]`, `StoredTheme` interface (`{ palette, mode }`),
  `applyTheme(paletteKey, mode): void`, `getStoredTheme(): StoredTheme`,
  `persistTheme(state): void`, `randomPaletteKey(excludeKey): string`.
- Consumes: nothing (leaf module).

`electric`'s values are copied verbatim from the current `:root` and
`[data-theme="dark"]` blocks in `src/design-system.css`, so calling
`applyTheme('electric', 'dark')` reproduces today's live site exactly.

- [ ] **Step 1: Create `src/lib/themes.ts`**

```ts
export type ThemeMode = 'light' | 'dark'

export interface ThemeTokens {
  bgPrimary: string
  bgSecondary: string
  bgElevated: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  borderPrimary: string
  borderSecondary: string
  accentPrimary: string
  accentSecondary: string
  accentHover: string
}

export interface Palette {
  name: string
  light: ThemeTokens
  dark: ThemeTokens
}

export const THEMES: Record<string, Palette> = {
  electric: {
    name: 'Electric',
    light: {
      bgPrimary: '#d4c5a0', bgSecondary: '#fbf8f0', bgElevated: '#fbf8f0',
      textPrimary: '#262626', textSecondary: '#57554a', textTertiary: '#8b8977',
      borderPrimary: '#e7e5d3', borderSecondary: '#d3d1bd',
      accentPrimary: '#0bf9ff', accentSecondary: '#d3ff1a', accentHover: '#00d9e6',
    },
    dark: {
      bgPrimary: '#262626', bgSecondary: '#3d3b33', bgElevated: '#3d3b33',
      textPrimary: '#fafaf9', textSecondary: '#d3d1bd', textTertiary: '#a8a694',
      borderPrimary: '#57554a', borderSecondary: '#6f6d5c',
      accentPrimary: '#33e5ff', accentSecondary: '#e9ff33', accentHover: '#66ecff',
    },
  },
  sunset: {
    name: 'Sunset',
    light: {
      bgPrimary: '#f5e0d3', bgSecondary: '#fff8f0', bgElevated: '#fff8f0',
      textPrimary: '#3a2a24', textSecondary: '#6b4f43', textTertiary: '#9c8478',
      borderPrimary: '#ecd9c8', borderSecondary: '#ddc2ab',
      accentPrimary: '#e8623d', accentSecondary: '#f2a640', accentHover: '#d1502c',
    },
    dark: {
      bgPrimary: '#2b1f2e', bgSecondary: '#3c2c3f', bgElevated: '#3c2c3f',
      textPrimary: '#fbeee6', textSecondary: '#d9b8c4', textTertiary: '#a98a97',
      borderPrimary: '#4d3a51', borderSecondary: '#5f4a63',
      accentPrimary: '#ff7a4d', accentSecondary: '#ffb347', accentHover: '#ff9466',
    },
  },
  aurora: {
    name: 'Aurora',
    light: {
      bgPrimary: '#dbeef0', bgSecondary: '#f4fcfd', bgElevated: '#f4fcfd',
      textPrimary: '#16333a', textSecondary: '#3f6169', textTertiary: '#7b9ba1',
      borderPrimary: '#c3e2e5', borderSecondary: '#a9d2d6',
      accentPrimary: '#14b8a6', accentSecondary: '#8b5cf6', accentHover: '#0f9c8c',
    },
    dark: {
      bgPrimary: '#0d1b2a', bgSecondary: '#16283a', bgElevated: '#16283a',
      textPrimary: '#e6f7f8', textSecondary: '#a8c8cc', textTertiary: '#6f8f94',
      borderPrimary: '#223a4d', borderSecondary: '#2c4a60',
      accentPrimary: '#2dd4bf', accentSecondary: '#a78bfa', accentHover: '#5eead4',
    },
  },
  mint: {
    name: 'Mint Circuit',
    light: {
      bgPrimary: '#d9f2e3', bgSecondary: '#f2fcf6', bgElevated: '#f2fcf6',
      textPrimary: '#113322', textSecondary: '#3f6b52', textTertiary: '#7a9e8b',
      borderPrimary: '#c0e6d1', borderSecondary: '#a3d6bb',
      accentPrimary: '#10b981', accentSecondary: '#34d399', accentHover: '#059669',
    },
    dark: {
      bgPrimary: '#0b1f16', bgSecondary: '#142e21', bgElevated: '#142e21',
      textPrimary: '#e3f9ee', textSecondary: '#a3d6bb', textTertiary: '#6f9c82',
      borderPrimary: '#1f4531', borderSecondary: '#295a3f',
      accentPrimary: '#34d399', accentSecondary: '#6ee7b7', accentHover: '#6ee7b7',
    },
  },
  coral: {
    name: 'Coral Reef',
    light: {
      bgPrimary: '#fbdad0', bgSecondary: '#fff5f1', bgElevated: '#fff5f1',
      textPrimary: '#3a1f1a', textSecondary: '#6e453c', textTertiary: '#a17d73',
      borderPrimary: '#f0c3b6', borderSecondary: '#e3ab9a',
      accentPrimary: '#f4587a', accentSecondary: '#fb923c', accentHover: '#db3f61',
    },
    dark: {
      bgPrimary: '#0e2626', bgSecondary: '#163636', bgElevated: '#163636',
      textPrimary: '#fbeae4', textSecondary: '#d6a89c', textTertiary: '#9c7a70',
      borderPrimary: '#234848', borderSecondary: '#2d5b5b',
      accentPrimary: '#fb7185', accentSecondary: '#fdba74', accentHover: '#fda4af',
    },
  },
  violet: {
    name: 'Violet Nebula',
    light: {
      bgPrimary: '#e4dbf5', bgSecondary: '#f8f5fd', bgElevated: '#f8f5fd',
      textPrimary: '#2a1d3a', textSecondary: '#5a4770', textTertiary: '#9284a6',
      borderPrimary: '#d3c4ea', borderSecondary: '#bfa8dc',
      accentPrimary: '#9333ea', accentSecondary: '#d946ef', accentHover: '#7e22ce',
    },
    dark: {
      bgPrimary: '#160f26', bgSecondary: '#241a38', bgElevated: '#241a38',
      textPrimary: '#f1eaf9', textSecondary: '#c3aedb', textTertiary: '#8d76a6',
      borderPrimary: '#33244a', borderSecondary: '#40305c',
      accentPrimary: '#c084fc', accentSecondary: '#f0abfc', accentHover: '#d8b4fe',
    },
  },
  solar: {
    name: 'Solar Flare',
    light: {
      bgPrimary: '#f5e6c8', bgSecondary: '#fffaf0', bgElevated: '#fffaf0',
      textPrimary: '#3a2a10', textSecondary: '#6b4f23', textTertiary: '#a1875c',
      borderPrimary: '#ecd9a8', borderSecondary: '#ddc27e',
      accentPrimary: '#f59e0b', accentSecondary: '#dc2626', accentHover: '#d97706',
    },
    dark: {
      bgPrimary: '#241a0f', bgSecondary: '#362718', bgElevated: '#362718',
      textPrimary: '#fdf3e0', textSecondary: '#d6b98a', textTertiary: '#9c8560',
      borderPrimary: '#4a381f', borderSecondary: '#5e4827',
      accentPrimary: '#fbbf24', accentSecondary: '#f87171', accentHover: '#fcd34d',
    },
  },
  arctic: {
    name: 'Arctic',
    light: {
      bgPrimary: '#dbe9f7', bgSecondary: '#f3f9fe', bgElevated: '#f3f9fe',
      textPrimary: '#10233a', textSecondary: '#3d5a75', textTertiary: '#7f9cb3',
      borderPrimary: '#c2ddf0', borderSecondary: '#a6cbe6',
      accentPrimary: '#2563eb', accentSecondary: '#06b6d4', accentHover: '#1d4ed8',
    },
    dark: {
      bgPrimary: '#0a1929', bgSecondary: '#142d47', bgElevated: '#142d47',
      textPrimary: '#e6f1fb', textSecondary: '#a8c7e0', textTertiary: '#6f92ad',
      borderPrimary: '#1e3a5c', borderSecondary: '#275075',
      accentPrimary: '#60a5fa', accentSecondary: '#22d3ee', accentHover: '#93c5fd',
    },
  },
}

export const PALETTE_KEYS = Object.keys(THEMES)

const TOKEN_TO_VAR: Record<keyof ThemeTokens, string> = {
  bgPrimary: '--bg-primary',
  bgSecondary: '--bg-secondary',
  bgElevated: '--bg-elevated',
  textPrimary: '--text-primary',
  textSecondary: '--text-secondary',
  textTertiary: '--text-tertiary',
  borderPrimary: '--border-primary',
  borderSecondary: '--border-secondary',
  accentPrimary: '--accent-primary',
  accentSecondary: '--accent-secondary',
  accentHover: '--accent-hover',
}

export function applyTheme(paletteKey: string, mode: ThemeMode) {
  const palette = THEMES[paletteKey] ?? THEMES.electric
  const tokens = palette[mode]
  const root = document.documentElement
  for (const key of Object.keys(TOKEN_TO_VAR) as (keyof ThemeTokens)[]) {
    root.style.setProperty(TOKEN_TO_VAR[key], tokens[key])
  }
  root.dataset.palette = paletteKey
  root.setAttribute('data-theme', mode)
  root.classList.toggle('dark', mode === 'dark')
}

export interface StoredTheme {
  palette: string
  mode: ThemeMode
}

const STORAGE_KEY = 'theme-state'
const DEFAULT_THEME: StoredTheme = { palette: 'electric', mode: 'dark' }

export function getStoredTheme(): StoredTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (
        parsed &&
        typeof parsed.palette === 'string' &&
        parsed.palette in THEMES &&
        (parsed.mode === 'light' || parsed.mode === 'dark')
      ) {
        return { palette: parsed.palette, mode: parsed.mode }
      }
    }
  } catch {
    // localStorage unavailable (private browsing) or corrupt value — use default
  }
  return DEFAULT_THEME
}

export function persistTheme(state: StoredTheme) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable — theme still applies for this session
  }
}

export function randomPaletteKey(excludeKey: string): string {
  const candidates = PALETTE_KEYS.filter((key) => key !== excludeKey)
  return candidates[Math.floor(Math.random() * candidates.length)]
}
```

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: succeeds with no errors (this module isn't imported anywhere yet,
but it must compile standalone — no `any`, no unresolved types).

- [ ] **Step 3: Manual sanity check in the browser console**

Run: `npm run dev`, open the dev server in a foreground tab, open devtools
console, and paste:

```js
document.documentElement.style.setProperty('--accent-primary', '#ff0000')
```

Expected: any element using `text-accent`/`bg-accent`/`shadow-glow-cyan`
(e.g. the primary "Submit Tool" area, once Task 1's tokens are wired up in
later tasks) visibly turns red. This confirms the CSS variable →Tailwind
class plumbing from Task 1 actually works before wiring `applyTheme` into
React state. Reload the page afterward to clear the manual override.

- [ ] **Step 4: Commit**

```bash
git add src/lib/themes.ts
git commit -m "feat(theme): add THEMES data and applyTheme engine"
```

---

### Task 3: Header state — persist palette + fix light/dark reload bug

**Files:**
- Modify: `src/components/layouts/app-header.tsx`

**Interfaces:**
- Consumes: `applyTheme(paletteKey, mode)`, `getStoredTheme()`,
  `persistTheme(state)` from `@/lib/themes` (Task 2).
- Produces: `theme: StoredTheme` state and `setTheme` setter, `toggleMode()`
  handler, `darkMode: boolean` derived value — all used by Task 4's
  `ThemeSwitcher` integration and by this same file's own class migration
  below.

This task also migrates every remaining hardcoded `dark:`/`cyan-*`/`lime-*`
class in `app-header.tsx` to the new semantic tokens from Task 1, **except**
the logo's ambient pulse animation (an explicit scope decision — see note
after the edits).

- [ ] **Step 1: Add the themes import**

In `src/components/layouts/app-header.tsx`, replace:

```tsx
import { GlowButton } from '@/components/ui/glow-button'
import { cn } from '@/lib/utils'
```

with:

```tsx
import { GlowButton } from '@/components/ui/glow-button'
import { cn } from '@/lib/utils'
import { applyTheme, getStoredTheme, persistTheme } from '@/lib/themes'
```

- [ ] **Step 2: Replace the `darkMode` boolean with persisted `theme` state**

Replace:

```tsx
  const [scrolled, setScrolled] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)
```

with:

```tsx
  const [scrolled, setScrolled] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [theme, setTheme] = useState(() => getStoredTheme())
  const [scrollProgress, setScrollProgress] = useState(0)
  const darkMode = theme.mode === 'dark'
```

- [ ] **Step 3: Replace the theme-apply effect and add a mode toggle helper**

Replace:

```tsx
  // Apply theme — set both the design-system data attribute and the Tailwind
  // `dark` class so CSS variables and `dark:` utilities stay in sync.
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    root.classList.toggle('dark', darkMode)
  }, [darkMode])
```

with:

```tsx
  // Apply + persist the active palette/mode. Runs on mount (with whatever
  // getStoredTheme() read from localStorage) and on every change.
  useEffect(() => {
    applyTheme(theme.palette, theme.mode)
    persistTheme(theme)
  }, [theme])

  const toggleMode = () => {
    setTheme((prev) => ({ ...prev, mode: prev.mode === 'dark' ? 'light' : 'dark' }))
  }
```

- [ ] **Step 4: Wire the existing Sun/Moon button to `toggleMode`**

Replace:

```tsx
              <GlowButton
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="relative overflow-hidden"
              >
```

with:

```tsx
              <GlowButton
                variant="ghost"
                size="icon"
                onClick={toggleMode}
                className="relative overflow-hidden"
              >
```

- [ ] **Step 5: Migrate the file's remaining hardcoded color classes**

Apply each of these exact replacements (all in `app-header.tsx`):

| Old | New |
|---|---|
| `className="fixed top-0 left-0 right-0 h-1 z-50 bg-gradient-to-r from-cyan-500 to-lime-500 origin-left"` | `className="fixed top-0 left-0 right-0 h-1 z-50 bg-gradient-to-r from-accent to-accent-secondary origin-left"` |
| `"bg-cream/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-700/50 shadow-lg"` | `"bg-surface/80 backdrop-blur-xl border-b border-line/50 shadow-lg"` |
| `className="text-cyan-500 drop-shadow-lg"` | `className="text-accent drop-shadow-lg"` |
| `className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-lime-500 bg-clip-text text-transparent"` | `className="text-xl font-bold bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent"` |
| `className="text-xs text-neutral-500 dark:text-neutral-400 -mt-1"` | `className="text-xs text-fg-tertiary -mt-1"` |
| `className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group bg-cream/60 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(11,249,255,0.3)] backdrop-blur-sm"` | `className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group bg-surface/60 border border-line/50 hover:border-accent/50 hover:shadow-glow-accent-md backdrop-blur-sm"` |
| `<Search size={16} className="text-neutral-400 group-hover:text-cyan-500 transition-colors" />` | `<Search size={16} className="text-fg-tertiary group-hover:text-accent transition-colors" />` |
| `<span className="flex-1 text-left text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300">` | `<span className="flex-1 text-left text-fg-tertiary group-hover:text-fg-secondary">` |
| `className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-600"` | `className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-elevated text-fg-secondary border border-line"` |
| `<div className="flex items-center gap-2 p-3 rounded-xl bg-cream dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xl">` | `<div className="flex items-center gap-2 p-3 rounded-xl bg-surface border border-line shadow-xl">` |
| `className="flex-1 bg-transparent border-none outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400"` | `className="flex-1 bg-transparent border-none outline-none text-fg placeholder:text-fg-tertiary"` |
| `className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"` | `className="p-1 rounded-md hover:bg-elevated"` |
| `<Sun size={20} className="text-lime-500" />` | `<Sun size={20} className="text-accent-secondary" />` |
| `<Moon size={20} className="text-cyan-500" />` | `<Moon size={20} className="text-accent" />` |

**Explicit scope decision — leave as-is:** the logo's pulsing glow
(`motion.div` with `animate={{ boxShadow: ["0 0 20px rgba(11, 249, 255, 0.5)", ...] }}`,
around the `Zap` icon) stays hardcoded cyan. It's a framer-motion keyframe
array evaluated in JS, not a Tailwind class — making it palette-reactive
would require re-reading `--accent-primary` via `getComputedStyle` on every
theme change and is out of scope per the spec's non-goals (ambient
decoration, not a themed surface). Do not touch those lines.

- [ ] **Step 6: Verify in browser**

Run: `npm run dev`, open in a foreground tab.
- Toggle the Sun/Moon button: page should flip light/dark exactly as before.
- Reload the page after toggling to light mode: it must **stay** light
  (this is the persistence bug fix — previously it always reset to dark).
- Visually confirm the header looks unchanged from before this task (since
  palette is still always "electric" until Task 4 adds a way to change it).

- [ ] **Step 7: Type-check and lint**

Run: `npm run build && npm run lint`
Expected: both succeed with no errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/layouts/app-header.tsx
git commit -m "fix(theme): persist light/dark mode and migrate header to semantic color tokens"
```

---

### Task 4: ThemeSwitcher component (dice + picker) and header integration

**Files:**
- Create: `src/components/ui/theme-switcher.tsx`
- Modify: `src/components/layouts/app-header.tsx`

**Interfaces:**
- Consumes: `THEMES`, `PALETTE_KEYS`, `randomPaletteKey` from `@/lib/themes`
  (Task 2); `theme`/`setTheme` state from `app-header.tsx` (Task 3).
- Produces: `ThemeSwitcher` component with props
  `{ paletteKey: string, mode: 'light' | 'dark', onPaletteChange: (key: string) => void }`.

- [ ] **Step 1: Create `src/components/ui/theme-switcher.tsx`**

```tsx
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Shuffle, Palette as PaletteIcon, Check } from 'lucide-react'
import { GlowButton } from '@/components/ui/glow-button'
import { THEMES, PALETTE_KEYS, randomPaletteKey, type ThemeMode } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface ThemeSwitcherProps {
  paletteKey: string
  mode: ThemeMode
  onPaletteChange: (key: string) => void
}

export function ThemeSwitcher({ paletteKey, mode, onPaletteChange }: ThemeSwitcherProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const handleRandomize = () => {
    const next = randomPaletteKey(paletteKey)
    onPaletteChange(next)
    setToast(`🎲 ${THEMES[next].name}`)
    window.setTimeout(() => setToast(null), 1800)
  }

  const handlePick = (key: string) => {
    onPaletteChange(key)
    setPickerOpen(false)
  }

  return (
    <div className="relative flex items-center gap-1">
      <GlowButton
        variant="ghost"
        size="icon"
        onClick={handleRandomize}
        aria-label="Randomize theme"
        title="Randomize theme"
      >
        <Shuffle size={18} />
      </GlowButton>

      <GlowButton
        variant="ghost"
        size="icon"
        onClick={() => setPickerOpen((open) => !open)}
        aria-label="Choose theme"
        title="Choose theme"
        aria-expanded={pickerOpen}
      >
        <PaletteIcon size={18} />
      </GlowButton>

      <AnimatePresence>
        {pickerOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setPickerOpen(false)} />
            <motion.div
              className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-line bg-surface shadow-elevated p-2"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {PALETTE_KEYS.map((key) => {
                const swatch = THEMES[key][mode]
                const isActive = key === paletteKey
                return (
                  <button
                    key={key}
                    onClick={() => handlePick(key)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      isActive ? 'bg-elevated text-fg' : 'text-fg-secondary hover:bg-elevated'
                    )}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-line-secondary shrink-0"
                      style={{ backgroundColor: swatch.accentPrimary }}
                    />
                    <span className="flex-1 text-left truncate">{THEMES[key].name}</span>
                    {isActive && <Check size={14} />}
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="absolute right-0 top-full mt-2 z-50 px-3 py-1.5 rounded-lg bg-elevated border border-line text-sm text-fg shadow-elevated whitespace-nowrap"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 2: Mount it in `app-header.tsx`**

Add the import, replacing:

```tsx
import { GlowButton } from '@/components/ui/glow-button'
import { cn } from '@/lib/utils'
import { applyTheme, getStoredTheme, persistTheme } from '@/lib/themes'
```

with:

```tsx
import { GlowButton } from '@/components/ui/glow-button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { cn } from '@/lib/utils'
import { applyTheme, getStoredTheme, persistTheme } from '@/lib/themes'
```

Then render it immediately after the existing Theme Toggle `GlowButton`
block (the one with the `Sun`/`Moon` `AnimatePresence`), i.e. replace:

```tsx
              </GlowButton>

              {/* User Menu */}
```

with:

```tsx
              </GlowButton>

              {/* Palette Theme Switcher */}
              <ThemeSwitcher
                paletteKey={theme.palette}
                mode={theme.mode}
                onPaletteChange={(palette) => setTheme((prev) => ({ ...prev, palette }))}
              />

              {/* User Menu */}
```

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`, open in a foreground tab.
- Click the dice icon repeatedly: background/text/accent colors across the
  header should visibly change each time, and never repeat the same palette
  twice in a row. A toast naming the new palette should briefly appear.
- Click the palette icon: a dropdown of 8 named swatches should appear;
  clicking one applies it immediately and closes the dropdown; the active
  one shows a checkmark.
- Toggle Sun/Moon independently: the active palette should hold steady while
  only light/dark flips.

- [ ] **Step 4: Type-check and lint**

Run: `npm run build && npm run lint`
Expected: both succeed with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/theme-switcher.tsx src/components/layouts/app-header.tsx
git commit -m "feat(theme): add dice randomizer and manual palette picker"
```

---

### Task 5: Migrate `hero-section.tsx`

**Files:**
- Modify: `src/components/layouts/hero-section.tsx`

**Interfaces:**
- Consumes: nothing new (pure class-string edits).

- [ ] **Step 1: Apply these exact class replacements**

| Old | New |
|---|---|
| `<span className="block text-neutral-900 dark:text-white">` | `<span className="block text-fg">` |
| `className="block relative bg-gradient-to-r from-cyan-400 via-cyan-300 to-lime-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-pan drop-shadow-[0_0_28px_rgba(11,249,255,0.25)]"` | `className="block relative bg-gradient-to-r from-accent via-accent-hover to-accent-secondary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-pan drop-shadow-[0_0_28px_rgb(from_var(--accent-primary)_r_g_b_/_0.25)]"` |
| `className="inline-block w-[3px] h-[0.85em] align-middle ml-2 rounded-full bg-cyan-400"` | `className="inline-block w-[3px] h-[0.85em] align-middle ml-2 rounded-full bg-accent-hover"` |
| `className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed"` | `className="text-xl md:text-2xl text-fg-secondary max-w-3xl mx-auto leading-relaxed"` |
| `<span className="text-cyan-500 font-semibold"> entrepreneurs</span>` | `<span className="text-accent font-semibold"> entrepreneurs</span>` |
| `<span className="text-lime-500 font-semibold"> indie hackers</span>` | `<span className="text-accent-secondary font-semibold"> indie hackers</span>` |
| `<p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">` | `<p className="text-sm text-fg-tertiary mt-4">` |
| `<kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">⌘K</kbd>` | `<kbd className="px-2 py-1 bg-elevated rounded text-xs">⌘K</kbd>` |
| `<h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-4">` | `<h3 className="text-lg font-semibold text-fg-secondary mb-4">` |
| `className="group relative rounded-2xl border border-neutral-200/70 dark:border-white/10 bg-cream/70 dark:bg-white/[0.03] backdrop-blur-sm px-6 py-7 text-center transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-glow-cyan"` | `className="group relative rounded-2xl border border-line/70 bg-surface/70 backdrop-blur-sm px-6 py-7 text-center transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-accent-hover/50 hover:shadow-glow-cyan"` |
| `className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-lime-500/20 border border-cyan-500/30 mb-4 transition-transform duration-300 group-hover:scale-110"` | `className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-secondary/20 border border-accent/30 mb-4 transition-transform duration-300 group-hover:scale-110"` |
| `<Icon size={22} className="text-cyan-400" />` | `<Icon size={22} className="text-accent-hover" />` |
| `<div className="font-display text-4xl font-bold text-neutral-900 dark:text-white mb-1 tabular-nums">` | `<div className="font-display text-4xl font-bold text-fg mb-1 tabular-nums">` |
| `<span className="text-cyan-400">+</span>` | `<span className="text-accent-hover">+</span>` |
| `<div className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">` (stat label, appears once) | `<div className="text-sm text-fg-tertiary font-medium">` |
| `className="w-6 h-10 border-2 border-neutral-300 dark:border-neutral-600 rounded-full flex justify-center"` | `className="w-6 h-10 border-2 border-line-secondary rounded-full flex justify-center"` |
| `className="w-1 h-3 bg-gradient-to-b from-cyan-500 to-lime-500 rounded-full mt-2"` | `className="w-1 h-3 bg-gradient-to-b from-accent to-accent-secondary rounded-full mt-2"` |

**Explicit scope decision — leave as-is:** the animated background bloom
(`motion.div` with `className="... bg-gradient-to-br from-cyan-500/10 via-transparent to-lime-500/10"`
and its `animate={{ background: ["radial-gradient(... rgba(11, 249, 255, ...", ...] }}`
prop) stays hardcoded cyan/lime. Same reasoning as the header's logo pulse:
it's a JS keyframe array, not a static class, and is ambient decoration
rather than a themed surface.

- [ ] **Step 2: Verify in browser**

Run `npm run dev`, open in a foreground tab. Switch palettes via the header's
dice/picker (from Task 4) and confirm the headline, stat cards, and CTA
subtext recolor; the background bloom stays cyan/lime by design.

- [ ] **Step 3: Type-check and lint**

Run: `npm run build && npm run lint`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/layouts/hero-section.tsx
git commit -m "feat(theme): migrate hero section to semantic color tokens"
```

---

### Task 6: Migrate `category-sidebar.tsx`

**Files:**
- Modify: `src/components/layouts/category-sidebar.tsx`

- [ ] **Step 1: Apply these exact class replacements**

| Old | New |
|---|---|
| `'bg-gradient-to-r from-cyan-500/20 to-lime-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(11,249,255,0.3)]'` | `'bg-gradient-to-r from-accent/20 to-accent-secondary/20 border border-accent/50 text-accent-hover shadow-glow-accent-md'` |
| `'hover:bg-neutral-100 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 hover:text-cyan-500 dark:hover:text-cyan-400'` | `'hover:bg-elevated text-fg-secondary hover:text-accent'` |
| `'bg-cyan-500 text-white shadow-lg'` | `'bg-accent text-white shadow-lg'` |
| `'bg-neutral-100 dark:bg-neutral-800 group-hover:bg-cyan-500/20'` | `'bg-elevated group-hover:bg-accent/20'` |
| `<Star size={12} className="text-lime-500 fill-current" />` | `<Star size={12} className="text-accent-secondary fill-current" />` |
| `<div className="text-xs text-neutral-500 dark:text-neutral-400">` (category count, appears once) | `<div className="text-xs text-fg-tertiary">` |
| `<div className="h-full flex flex-col bg-cream dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">` | `<div className="h-full flex flex-col bg-surface border-r border-line">` |
| `<div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">` | `<div className="flex items-center justify-between p-4 border-b border-line">` |
| `<h2 className="font-bold text-lg text-neutral-900 dark:text-white">` | `<h2 className="font-bold text-lg text-fg">` |
| `<p className="text-sm text-neutral-500 dark:text-neutral-400">` (sidebar subtitle) | `<p className="text-sm text-fg-tertiary">` |
| `className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50"` | `className="p-4 border-t border-line bg-elevated/50"` |
| `<h3 className="font-semibold text-sm text-neutral-700 dark:text-neutral-300 mb-3">` | `<h3 className="font-semibold text-sm text-fg-secondary mb-3">` |
| `<span className="text-sm text-neutral-600 dark:text-neutral-400">Total Resources</span>` | `<span className="text-sm text-fg-secondary">Total Resources</span>` |
| `<span className="text-sm text-neutral-600 dark:text-neutral-400">Currently Showing</span>` | `<span className="text-sm text-fg-secondary">Currently Showing</span>` |
| `<span className="text-sm text-neutral-600 dark:text-neutral-400">Featured</span>` | `<span className="text-sm text-fg-secondary">Featured</span>` |
| `<TagChip size="sm" className="bg-lime-500/20 text-lime-600 dark:text-lime-400">` | `<TagChip size="sm" className="bg-accent-secondary/20 text-accent-secondary">` |

- [ ] **Step 2: Verify in browser**

Run `npm run dev`, open in a foreground tab. Switch palettes and confirm the
sidebar background, active-category highlight, and filter-stats panel all
recolor; click through a few categories to confirm the active/inactive
states still read clearly in every palette.

- [ ] **Step 3: Type-check and lint**

Run: `npm run build && npm run lint`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/layouts/category-sidebar.tsx
git commit -m "feat(theme): migrate category sidebar to semantic color tokens"
```

---

### Task 7: Migrate `link-grid.tsx`

**Files:**
- Modify: `src/components/layouts/link-grid.tsx`

- [ ] **Step 1: Apply these exact class replacements**

| Old | New |
|---|---|
| `className="bg-cream dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"` | `className="bg-surface rounded-xl border border-line overflow-hidden"` |
| `<div className="h-40 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />` | `<div className="h-40 bg-line-secondary animate-pulse" />` |
| `<div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />` | `<div className="h-5 bg-line-secondary rounded animate-pulse" />` |
| `<div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 animate-pulse" />` | `<div className="h-4 bg-line-secondary rounded w-3/4 animate-pulse" />` |
| `<div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />` | `<div className="h-6 w-16 bg-line-secondary rounded-full animate-pulse" />` |
| `<div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />` | `<div className="h-6 w-20 bg-line-secondary rounded-full animate-pulse" />` |
| `className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500/20 to-lime-500/20 flex items-center justify-center"` | `className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-accent/20 to-accent-secondary/20 flex items-center justify-center"` |
| `<Search size={32} className="text-cyan-500" />` | `<Search size={32} className="text-accent" />` |
| `<h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">` (empty state) | `<h3 className="text-2xl font-bold text-fg mb-4">` |
| `<p className="text-neutral-600 dark:text-neutral-400 mb-6">` | `<p className="text-fg-secondary mb-6">` |
| `<span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">` | `<span className="text-sm font-medium text-fg-secondary">` |
| `<TagChip size="sm" className="bg-lime-500/20 text-lime-600 dark:text-lime-400">` (featured count) | `<TagChip size="sm" className="bg-accent-secondary/20 text-accent-secondary">` |
| `className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-cream dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"` | `className="px-3 py-1.5 text-sm rounded-lg border border-line bg-surface text-fg focus:border-accent focus:ring-1 focus:ring-accent"` |
| `className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg p-1 bg-cream dark:bg-neutral-800"` | `className="flex items-center border border-line rounded-lg p-1 bg-surface"` |
| `"bg-cyan-500 text-white shadow-lg"` (view-mode active, 3 occurrences) | `"bg-accent text-white shadow-lg"` |
| `"text-neutral-600 dark:text-neutral-400 hover:text-cyan-500"` (view-mode inactive, 3 occurrences) | `"text-fg-secondary hover:text-accent"` |
| `className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-cream dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-cyan-500 hover:border-cyan-500 transition-all"` | `className="px-3 py-1.5 text-sm rounded-lg border border-line bg-surface text-fg-secondary hover:text-accent hover:border-accent transition-all"` |
| `className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-lime-500 flex items-center justify-center"` | `className="w-8 h-8 rounded-lg bg-gradient-to-r from-accent to-accent-secondary flex items-center justify-center"` |
| `<h2 className="text-xl font-bold text-neutral-900 dark:text-white">` (Featured Resources, 2 occurrences) | `<h2 className="text-xl font-bold text-fg">` |
| `className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent"` | `className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent"` |
| `className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700"` | `className="h-px flex-1 bg-line-secondary"` |

Note: `"bg-cyan-500 text-white shadow-lg"` and
`"text-neutral-600 dark:text-neutral-400 hover:text-cyan-500"` each appear
three times (grid/list/masonry view-mode buttons) — replace all three.

**Explicit scope decision — leave as-is:** the `EmptyState` component's
`motion.div animate={{ boxShadow: ["0 0 20px rgba(11, 249, 255, 0.3)", ...] }}`
pulse stays hardcoded cyan (same ambient-decoration reasoning as prior
tasks).

- [ ] **Step 2: Verify in browser**

Run `npm run dev`, open in a foreground tab. Switch palettes and confirm the
sort/view-mode/density controls, featured-section divider, and loading
skeleton all recolor. Trigger the empty state (search for nonsense) and
confirm text/button recolor while the pulse icon stays cyan by design.

- [ ] **Step 3: Type-check and lint**

Run: `npm run build && npm run lint`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/layouts/link-grid.tsx
git commit -m "feat(theme): migrate link grid to semantic color tokens"
```

---

### Task 8: Migrate `link-card.tsx`

**Files:**
- Modify: `src/components/ui/link-card.tsx`

- [ ] **Step 1: Apply these exact class replacements**

| Old | New |
|---|---|
| `"group relative rounded-2xl border border-neutral-200 dark:border-white/10 bg-cream dark:bg-neutral-900/70 dark:backdrop-blur-sm overflow-hidden cursor-pointer"` | `"group relative rounded-2xl border border-line bg-surface dark:backdrop-blur-sm overflow-hidden cursor-pointer"` |
| `"hover:border-cyan-400/60 hover:shadow-glow-cyan-lg"` | `"hover:border-accent-hover/60 hover:shadow-glow-cyan-lg"` |
| `"focus-within:border-cyan-400/60 focus-within:shadow-glow-cyan-lg"` | `"focus-within:border-accent-hover/60 focus-within:shadow-glow-cyan-lg"` |
| `className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-lime-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"` | `className="absolute inset-0 bg-gradient-to-r from-accent to-accent-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"` |
| `<div className="w-full h-full bg-cream dark:bg-neutral-800 rounded-[10px]" />` | `<div className="w-full h-full bg-surface rounded-[10px]" />` |
| `className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-cyan-500 to-lime-500 text-white text-xs font-semibold rounded-full shadow-lg"` | `className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-accent to-accent-secondary text-white text-xs font-semibold rounded-full shadow-lg"` |
| `className="relative h-40 overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-950"` | `className="relative h-40 overflow-hidden bg-gradient-to-br from-line-secondary to-line"` |
| `<ExternalLink size={24} className="text-neutral-400 dark:text-neutral-500" />` | `<ExternalLink size={24} className="text-fg-tertiary" />` |
| `className="min-w-[160px] bg-cream dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-lg p-1 z-50"` | `className="min-w-[160px] bg-surface rounded-lg border border-line shadow-lg p-1 z-50"` |
| `"flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"` (3 occurrences — Copy Link / Share on Twitter / Share on LinkedIn) | `"flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-elevated cursor-pointer"` |
| `"font-display font-semibold text-lg tracking-tight text-neutral-900 dark:text-white transition-colors duration-300 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-300"` | `"font-display font-semibold text-lg tracking-tight text-fg transition-colors duration-300 line-clamp-2 group-hover:text-accent-hover"` |
| `className="flex items-center gap-1.5 font-mono text-xs text-neutral-500 dark:text-neutral-400 mt-1.5"` | `className="flex items-center gap-1.5 font-mono text-xs text-fg-tertiary mt-1.5"` |
| `className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed"` | `className="text-sm text-fg-secondary line-clamp-2 leading-relaxed"` |
| `className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-700"` | `className="flex items-center justify-between pt-2 border-t border-line"` |
| `className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400"` | `className="flex items-center gap-1 text-xs text-fg-tertiary"` |

- [ ] **Step 2: Verify in browser**

Run `npm run dev`, open in a foreground tab. Switch palettes and confirm
link cards' background, hover border/glow, featured badge gradient, and
dropdown menu all recolor. Hover a card and confirm the border-glow effect
still reads clearly (not washed out) in at least 3 different palettes.

- [ ] **Step 3: Type-check and lint**

Run: `npm run build && npm run lint`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/link-card.tsx
git commit -m "feat(theme): migrate link card to semantic color tokens"
```

---

### Task 9: Migrate `search-command.tsx` (accent colors only)

**Files:**
- Modify: `src/components/ui/search-command.tsx`

**Scope note:** a prior session explicitly decided the ⌘K search palette
should stay a dark glass surface regardless of the site's light/dark mode
(it floats over a black backdrop overlay, not on the page canvas). This task
preserves that decision — it migrates only the brand-accent highlight
colors, and deliberately leaves the `bg-white/10 dark:bg-neutral-900/10`
glass background, borders, and neutral text colors untouched.

- [ ] **Step 1: Apply these exact class replacements**

| Old | New |
|---|---|
| `<Loader2 size={16} className="text-cyan-500 animate-spin ml-2" />` | `<Loader2 size={16} className="text-accent animate-spin ml-2" />` |
| `"flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/10 dark:hover:bg-neutral-800/50 data-[selected]:bg-cyan-500/20 data-[selected]:text-cyan-400 transition-colors"` (3 occurrences — recent searches, suggestions, grouped results) | `"flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/10 dark:hover:bg-neutral-800/50 data-[selected]:bg-accent/20 data-[selected]:text-accent-hover transition-colors"` |
| `<Zap size={16} className="text-lime-500" />` | `<Zap size={16} className="text-accent-secondary" />` |

Every other class in this file (the dialog glass background, borders, `kbd`
styling, result-item neutral text) stays exactly as it is.

- [ ] **Step 2: Verify in browser**

Run `npm run dev`, press `⌘K`. Confirm the loading spinner, selected-item
highlight, and suggestion icon now match the active accent color, while the
dialog's dark-glass background is unchanged regardless of palette or mode.

- [ ] **Step 3: Type-check and lint**

Run: `npm run build && npm run lint`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/search-command.tsx
git commit -m "feat(theme): migrate search command accent colors to semantic tokens"
```

---

### Task 10: Migrate `tag-chip.tsx`

**Files:**
- Modify: `src/components/ui/tag-chip.tsx`

- [ ] **Step 1: Apply these exact class replacements**

| Old | New |
|---|---|
| `default: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:shadow-[0_0_8px_rgba(11,249,255,0.3)]",` | `default: "bg-elevated text-fg-secondary hover:bg-line-secondary hover:shadow-glow-accent-xs",` |
| `active: "bg-gradient-to-r from-cyan-500 to-lime-500 text-white shadow-[0_0_12px_rgba(11,249,255,0.4)]",` | `active: "bg-gradient-to-r from-accent to-accent-secondary text-white shadow-glow-accent-sm",` |
| `removable: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"` | `removable: "bg-elevated text-fg-secondary hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"` |

The count badge (`bg-black/20 dark:bg-white/20`) and remove button
(`hover:bg-black/20 dark:hover:bg-white/20`) are relative-opacity overlays,
not themed surfaces — leave both unchanged.

- [ ] **Step 2: Verify in browser**

Run `npm run dev`, open in a foreground tab. Switch palettes and confirm tag
chips (in the hero's popular-categories row and on link cards) recolor for
both default and active variants; hover a chip and confirm the glow is
visible and matches the active accent.

- [ ] **Step 3: Type-check and lint**

Run: `npm run build && npm run lint`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/tag-chip.tsx
git commit -m "feat(theme): migrate tag chip to semantic color tokens"
```

---

### Task 11: Migrate `glow-button.tsx`

**Files:**
- Modify: `src/components/ui/glow-button.tsx`

- [ ] **Step 1: Apply these exact class replacements**

| Old | New |
|---|---|
| `"focus-visible:ring-cyan-400"` (in the shared base class string) | `"focus-visible:ring-accent-hover"` |
| `"bg-cyan-500 text-neutral-950 shadow-glow-cyan",` | `"bg-accent text-neutral-950 shadow-glow-cyan",` |
| `"hover:bg-cyan-400 hover:shadow-glow-cyan-lg hover:scale-[1.03]",` | `"hover:bg-accent-hover hover:shadow-glow-cyan-lg hover:scale-[1.03]",` |
| `"bg-lime-500 text-neutral-950 shadow-glow-lime",` | `"bg-accent-secondary text-neutral-950 shadow-glow-lime",` |
| `"hover:bg-lime-400 hover:shadow-glow-lime hover:scale-[1.03]",` | `"hover:bg-accent-hover hover:shadow-glow-lime hover:scale-[1.03]",` |
| `"bg-transparent text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700",` | `"bg-transparent text-fg-secondary border border-line",` |
| `"hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:shadow-[0_0_8px_rgba(11,249,255,0.3)] hover:border-cyan-400",` | `"hover:bg-elevated hover:shadow-glow-accent-xs hover:border-accent-hover",` |
| `"bg-gradient-to-r from-cyan-500 to-lime-500 text-neutral-950 relative",` | `"bg-gradient-to-r from-accent to-accent-secondary text-neutral-950 relative",` |
| `"before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-400 before:to-lime-400 before:opacity-0 before:transition-opacity before:duration-200",` | `"before:absolute before:inset-0 before:bg-gradient-to-r before:from-accent-hover before:to-accent-secondary before:opacity-0 before:transition-opacity before:duration-200",` |
| `"hover:before:opacity-100 hover:shadow-[0_0_24px_rgba(11,249,255,0.5)] hover:scale-105",` | `"hover:before:opacity-100 hover:shadow-glow-accent-lg hover:scale-105",` |

- [ ] **Step 2: Verify in browser**

Run `npm run dev`, open in a foreground tab. Switch palettes and confirm all
four `GlowButton` variants (primary, secondary, ghost, gradient — visible on
the hero's CTA row and header's "Submit Tool" button) recolor consistently
with the active palette's accent colors.

- [ ] **Step 3: Type-check and lint**

Run: `npm run build && npm run lint`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/glow-button.tsx
git commit -m "feat(theme): migrate glow button to semantic color tokens"
```

---

### Task 12: Full manual QA pass across all 8 palettes × 2 modes

**Files:** none (verification-only task; may produce small follow-up fixes
to files touched in Tasks 1–11 if contrast issues are found).

- [ ] **Step 1: Run the full checklist**

Run: `npm run dev`, open the site in a **foreground** browser tab.

1. `npm run build` — confirm the whole plan's changes still type-check clean.
2. `npm run lint` — confirm 0 errors.
3. Using the header's palette picker, cycle through all 8 palettes in dark
   mode, then all 8 again in light mode (16 combinations total). For each:
   background, surfaces, text, borders, and accent (buttons/badges/active
   states) must visibly match that palette — nothing should still look
   like "Electric" once a different palette is selected.
4. Click the dice button 10+ times in a row. Confirm it never repeats the
   immediately-previous palette back-to-back.
5. Toggle the Sun/Moon button several times without touching the palette
   picker. Confirm the palette stays constant while only light/dark flips.
6. Pick a non-default palette (e.g. "Aurora") and light mode, then reload
   the page. Confirm both the palette and light mode persist (this also
   confirms Task 3's dark-mode-reload bug fix).
7. On at least 3 palettes (recommend: Electric, Mint Circuit, Solar Flare —
   the widest contrast range), visually spot-check `text-fg-tertiary`
   against `bg-primary`/`bg-secondary` for legibility. If any combination
   reads too faint, adjust that palette's `textTertiary` hex in
   `src/lib/themes.ts` one shade darker (light mode) or lighter (dark mode)
   and re-check — this is the spec's deferred "exact tertiary shade"
   decision, finalized here against the real rendered page.
8. Open `⌘K` search on at least 2 different palettes: confirm the dialog's
   dark-glass background is unchanged (by design) while the accent
   highlights (selected item, spinner) match the active palette.

- [ ] **Step 2: Fix any contrast issues found in Step 1.7**

If adjustments are needed, edit the relevant palette's hex values in
`src/lib/themes.ts` directly (no other file changes needed — the token
system means a color fix is always a one-line hex edit in exactly one
place).

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore(theme): QA pass across all palettes and modes"
```

If Step 2 required no changes, skip this commit (nothing to commit).

---

## Out of scope (confirmed non-goals, not follow-up bugs)

- No flash-of-wrong-theme prevention on first paint (would need a
  blocking inline `<script>` in `index.html` reading `localStorage` before
  React mounts). The current code already has this same characteristic
  today — this plan does not make it worse, and fixing it is a separate,
  unscoped enhancement.
- No animation-mode/charset axes (specific to the reference app's ASCII-art
  renderer, not applicable here).
- No server-side/per-user persistence — `localStorage` only.
- Ambient decorative glow animations driven by framer-motion JS keyframe
  arrays (header logo pulse, hero background bloom, empty-state pulse)
  intentionally stay hardcoded Electric cyan — documented per-task above,
  not silently dropped.
