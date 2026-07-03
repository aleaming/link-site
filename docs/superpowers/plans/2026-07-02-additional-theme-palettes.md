# Additional Theme Palettes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 new named palettes (Forest Canopy, Midnight Indigo, Golden Hour, Slate Graphite, Cherry Blossom) to the existing theme switcher, bringing the total to 13, and make the picker dropdown handle that many entries gracefully.

**Architecture:** No new architecture — this plan extends the existing `THEMES: Record<string, Palette>` data structure in `src/lib/themes.ts` (merged in PR #3) with 5 more entries, exactly matching the shape of the 8 existing palettes. The picker dropdown in `theme-switcher.tsx` currently has no scroll/max-height handling; this plan adds that so 13 entries don't risk overflowing short viewports.

**Tech Stack:** Same as the existing theme system — React 18 + TypeScript + Vite, Tailwind CSS 3. No new dependencies.

## Global Constraints

- `npm run build` (`tsc -b && vite build`) must stay type-clean after every task.
- `npm run lint` must stay at 0 errors (existing 4 pre-existing warnings in unrelated files are fine).
- This project has no automated test runner — "testing" means `npm run build`/`npm run lint` plus manual browser verification (established precedent from the original theme-switcher branch).
- New palette keys must not collide with the 8 existing keys: `electric, sunset, aurora, mint, coral, violet, solar, arctic`.
- Each new palette needs all 11 `ThemeTokens` fields (`bgPrimary`, `bgSecondary`, `bgElevated`, `textPrimary`, `textSecondary`, `textTertiary`, `borderPrimary`, `borderSecondary`, `accentPrimary`, `accentSecondary`, `accentHover`) for both `light` and `dark`, matching the exact shape already in `src/lib/themes.ts`.
- The shell's `cat` is aliased to `bat` (not installed) — write commit messages to a temp file and use `git commit -F <file>`, not a heredoc.

---

### Task 1: Add 5 new palette data entries to `src/lib/themes.ts`

**Files:**
- Modify: `src/lib/themes.ts`

**Interfaces:**
- Consumes: existing `ThemeTokens`/`Palette` interfaces, unchanged.
- Produces: 5 new keys in the `THEMES` record — `forest`, `indigo`, `golden`, `slate`, `cherry` — each a complete `Palette` object. `PALETTE_KEYS` (derived via `Object.keys(THEMES)`) automatically picks these up; no other code change needed for them to appear in the randomizer or picker.

This is a pure data addition — insert the 5 objects below into the `THEMES` record (any position; inserting them after the existing `arctic` entry, before the closing `}`, keeps the diff minimal and the 8 existing entries untouched).

- [ ] **Step 1: Add the 5 palette entries**

In `src/lib/themes.ts`, insert immediately after the `arctic` entry's closing `},` (i.e. right before the `THEMES` record's final closing `}`):

```ts
  forest: {
    name: 'Forest Canopy',
    light: {
      bgPrimary: '#dde6d0', bgSecondary: '#f5f9f0', bgElevated: '#f5f9f0',
      textPrimary: '#1f2e14', textSecondary: '#435a2e', textTertiary: '#7a9160',
      borderPrimary: '#c8d9b5', borderSecondary: '#b0c896',
      accentPrimary: '#4d7c2c', accentSecondary: '#84a83f', accentHover: '#3d6322',
    },
    dark: {
      bgPrimary: '#141f0e', bgSecondary: '#1f2e17', bgElevated: '#1f2e17',
      textPrimary: '#e6f0dd', textSecondary: '#b0c89a', textTertiary: '#7a9160',
      borderPrimary: '#2c4020', borderSecondary: '#385228',
      accentPrimary: '#84a83f', accentSecondary: '#a3c65c', accentHover: '#6b9c34',
    },
  },
  indigo: {
    name: 'Midnight Indigo',
    light: {
      bgPrimary: '#dde0f5', bgSecondary: '#f5f6fd', bgElevated: '#f5f6fd',
      textPrimary: '#1a1a3a', textSecondary: '#3f3f6b', textTertiary: '#7676a1',
      borderPrimary: '#c5c9ec', borderSecondary: '#aab0e0',
      accentPrimary: '#4f46e5', accentSecondary: '#6366f1', accentHover: '#4338ca',
    },
    dark: {
      bgPrimary: '#12122a', bgSecondary: '#1e1e3f', bgElevated: '#1e1e3f',
      textPrimary: '#e8e8fb', textSecondary: '#b0b0d6', textTertiary: '#7676a1',
      borderPrimary: '#2e2e52', borderSecondary: '#383864',
      accentPrimary: '#818cf8', accentSecondary: '#a5b4fc', accentHover: '#6366f1',
    },
  },
  golden: {
    name: 'Golden Hour',
    light: {
      bgPrimary: '#f7ecd0', bgSecondary: '#fffaf0', bgElevated: '#fffaf0',
      textPrimary: '#3a2e0f', textSecondary: '#6b552a', textTertiary: '#a1895c',
      borderPrimary: '#ecdca8', borderSecondary: '#ddc879',
      accentPrimary: '#d4a017', accentSecondary: '#f4c430', accentHover: '#b8860b',
    },
    dark: {
      bgPrimary: '#241d0e', bgSecondary: '#362c17', bgElevated: '#362c17',
      textPrimary: '#fdf5e0', textSecondary: '#d6c08a', textTertiary: '#9c8c60',
      borderPrimary: '#4a3d1f', borderSecondary: '#5e4e27',
      accentPrimary: '#f4c430', accentSecondary: '#fde047', accentHover: '#eab308',
    },
  },
  slate: {
    name: 'Slate Graphite',
    light: {
      bgPrimary: '#e2e5e9', bgSecondary: '#f7f8fa', bgElevated: '#f7f8fa',
      textPrimary: '#1e2530', textSecondary: '#4a5568', textTertiary: '#8792a2',
      borderPrimary: '#d1d5db', borderSecondary: '#b8c0cc',
      accentPrimary: '#64748b', accentSecondary: '#94a3b8', accentHover: '#475569',
    },
    dark: {
      bgPrimary: '#171a1f', bgSecondary: '#262b33', bgElevated: '#262b33',
      textPrimary: '#eef1f5', textSecondary: '#b0b8c4', textTertiary: '#7c8797',
      borderPrimary: '#333a45', borderSecondary: '#414a58',
      accentPrimary: '#94a3b8', accentSecondary: '#cbd5e1', accentHover: '#7c8fa6',
    },
  },
  cherry: {
    name: 'Cherry Blossom',
    light: {
      bgPrimary: '#fce4ec', bgSecondary: '#fff5f8', bgElevated: '#fff5f8',
      textPrimary: '#3a1526', textSecondary: '#6b2f47', textTertiary: '#a06b82',
      borderPrimary: '#f5d0dd', borderSecondary: '#eab8cc',
      accentPrimary: '#e0447e', accentSecondary: '#f472b6', accentHover: '#c2185b',
    },
    dark: {
      bgPrimary: '#26121b', bgSecondary: '#3a1d29', bgElevated: '#3a1d29',
      textPrimary: '#fbe6ee', textSecondary: '#dba8bd', textTertiary: '#a67b91',
      borderPrimary: '#4a2535', borderSecondary: '#5c2f42',
      accentPrimary: '#f472b6', accentSecondary: '#fb7ba8', accentHover: '#f9a8d4',
    },
  },
```

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: succeeds with no errors.

- [ ] **Step 3: Self-review**

Confirm all 5 new keys (`forest`, `indigo`, `golden`, `slate`, `cherry`) are present, each with `light`/`dark` and all 11 `ThemeTokens` fields, and that none of the 8 existing entries (`electric` through `arctic`) were altered — `git diff` should show only additions, zero deletions.

- [ ] **Step 4: Commit**

```bash
git add src/lib/themes.ts
git commit -m "feat(theme): add 5 new palettes (forest, indigo, golden, slate, cherry)"
```

---

### Task 2: Make the picker dropdown scroll for 13+ palettes

**Files:**
- Modify: `src/components/ui/theme-switcher.tsx`

**Interfaces:**
- Consumes: `PALETTE_KEYS` from `@/lib/themes` (now 13 entries after Task 1) — no signature changes.
- Produces: no new props or exports; purely a class-string change on the existing dropdown `motion.div`.

The picker's dropdown currently has no height cap, so 13 rows (~40px each ≈ 520px plus padding) could clip against the viewport bottom on short browser windows. Cap it and let it scroll internally.

- [ ] **Step 1: Add a max-height and scroll to the dropdown**

In `src/components/ui/theme-switcher.tsx`, replace:

```tsx
            <motion.div
              className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-line bg-surface shadow-elevated p-2"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
```

with:

```tsx
            <motion.div
              className="absolute right-0 top-full mt-2 z-50 w-56 max-h-80 overflow-y-auto rounded-xl border border-line bg-surface shadow-elevated p-2"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
```

- [ ] **Step 2: Type-check and lint**

Run: `npm run build && npm run lint`
Expected: both succeed with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/theme-switcher.tsx
git commit -m "feat(theme): cap picker dropdown height and add scroll for 13 palettes"
```

---

### Task 3: QA pass — verify all 13 palettes in both modes

**Files:** none (verification-only task; may produce small follow-up fixes to
`src/lib/themes.ts` if any of the 5 new palettes has a contrast issue).

- [ ] **Step 1: Run the checklist**

Run: `npm run build && npm run lint` — confirm both clean.

Run `npm run dev`, open the site in a **foreground** browser tab:

1. Open the palette picker: confirm all 13 palettes now list (8 original +
   5 new: Forest Canopy, Midnight Indigo, Golden Hour, Slate Graphite,
   Cherry Blossom), each with a distinct swatch color, and confirm the
   dropdown scrolls internally rather than overflowing the viewport.
2. Click each of the 5 new palettes in turn, in both light and dark mode
   (10 combinations): confirm background/surface/text/border/accent all
   visibly match that palette — no leftover Electric colors.
3. Click the dice button repeatedly: confirm it now also lands on the 5
   new palettes (not just the original 8), and never repeats the current
   palette back-to-back.
4. Spot-check text contrast for the 5 new palettes' `text-fg-tertiary`
   against `bg-primary`/`bg-secondary` — if any reads too faint, adjust
   that palette's `textTertiary` hex in `src/lib/themes.ts` one shade
   darker (light mode) or lighter (dark mode) and re-check.
5. Confirm no console errors at any point.

- [ ] **Step 2: Fix any contrast issues found in Step 1.4**

If adjustments are needed, edit the relevant palette's hex values in
`src/lib/themes.ts` directly — no other file changes needed.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore(theme): QA pass for 5 new palettes"
```

If Step 2 required no changes, skip this commit (nothing to commit).
