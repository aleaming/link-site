# Hero Section Compact Layout — Design

- **Date:** 2026-07-02
- **Status:** Approved

## Problem

The default (non-filtered) hero section (`src/components/layouts/hero-section.tsx`)
stacks headline+typewriter, subtitle, CTA buttons, "Popular Categories" tag row,
and 3 stat cards, with `py-20` section padding, before any actual resource
cards appear. This takes up too much vertical space — users scroll a long
way before reaching real content.

## Scope

This is a spacing/sizing pass on the existing hero, not a rebuild. No content,
structure, animation, or the existing `compact` prop's filtered-state behavior
changes — only three groups of Tailwind class values shrink.

## Design

### 1. Section padding

`src/components/layouts/hero-section.tsx:136` — the outer content wrapper's
conditional padding:

```tsx
<div className={cn('max-w-6xl mx-auto px-4 text-center', compact ? 'py-12' : 'py-20')}>
```

Change the non-compact case from `py-20` to `py-12` — matching what `compact`
mode already uses. This means the default (unfiltered) hero and the filtered
`compact` hero end up nearly the same overall height, which is consistent
with the point of `compact` mode (it was designed to be the "slim" version;
now "slim" becomes the default posture too).

### 2. Inter-block spacing

Three margin values shrink, each on the wrapping `motion.div` for that block:

| Block | Current | New |
|---|---|---|
| Headline wrapper (`hero-section.tsx:142`) | `mb-8` | `mb-6` |
| CTA wrapper (`hero-section.tsx:176`, non-compact branch) | `mb-12` | `mb-8` |
| Tags wrapper (`hero-section.tsx:218`) | `mb-16` | `mb-10` |

### 3. Stat cards

Currently (`hero-section.tsx:262-274`), each stat card is
`px-6 py-7` padding with a `w-14 h-14` icon box and a `text-4xl` number.
Shrink to `px-4 py-4` padding, a `w-10 h-10` icon box (icon itself stays
`size={22}` — a slightly larger icon in a smaller box reads fine and avoids
a second icon-size decision), and a `text-2xl` number. The card's
`gap-8`/grid layout, hover/glow states, and the count-up animation logic are
unchanged — only the box's own padding and typography shrink.

## Non-goals (considered and rejected)

- **Replacing stat cards with an inline text row** ("1,240 tools · 12
  categories · 89K clicks") — cuts more vertical space, but discards the
  icon + animated count-up treatment, a bigger visual/brand change than
  "take up less space" calls for. Not part of this design.
- **Auto-collapsing to `compact` mode after scroll/interaction** — reuses
  the existing prop but adds new scroll-threshold logic and a new behavior
  to test (does the hero animate-collapse as you scroll — is that jarring?).
  Solves a narrower problem with a bigger mechanism; not part of this design.

## Testing

No automated test runner in this project (established precedent). Verify via
`npm run build`/`npm run lint` plus a manual browser check: load the site
in a foreground tab, confirm the hero-to-resource-grid distance is visibly
shorter, confirm stat cards remain legible and the hover/glow/count-up
animation still works, confirm the `compact` (filtered) state still looks
correct and now closely matches the default state's height.
