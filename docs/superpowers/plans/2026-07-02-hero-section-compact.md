# Hero Section Compact Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Shrink the default hero section's vertical footprint (padding, inter-block spacing, stat card sizing) so resource cards appear sooner, per the approved design.

**Architecture:** Pure Tailwind class-value changes in one file — no structural, content, or animation changes.

**Tech Stack:** React 18 + TypeScript + Vite, Tailwind CSS 3. No new dependencies.

## Global Constraints

- `npm run build` (`tsc -b && vite build`) must stay type-clean.
- `npm run lint` must stay at 0 errors (existing 4 pre-existing warnings in unrelated files are fine).
- No automated test runner exists in this project — verification is `npm run build`/`npm run lint` plus manual browser check.
- Spec reference: `docs/superpowers/specs/2026-07-02-hero-section-compact-design.md`.
- Do not change content, structure, the `compact` prop's filtered-state logic, or any animation behavior — only the specific class values below.

---

### Task 1: Shrink hero section padding, spacing, and stat card sizing

**Files:**
- Modify: `src/components/layouts/hero-section.tsx`

**Interfaces:** None — no props, exports, or function signatures change.

- [ ] **Step 1: Shrink the section's outer padding**

Replace:

```tsx
      <div className={cn('max-w-6xl mx-auto px-4 text-center', compact ? 'py-12' : 'py-20')}>
```

with:

```tsx
      <div className={cn('max-w-6xl mx-auto px-4 text-center', compact ? 'py-12' : 'py-12')}>
```

- [ ] **Step 2: Shrink the headline wrapper's bottom margin**

Replace:

```tsx
          className="mb-8"
        >
          <h1 className="font-display font-bold tracking-tight leading-[1.05] mb-6 text-[clamp(2.75rem,7vw,5.5rem)]">
```

with:

```tsx
          className="mb-6"
        >
          <h1 className="font-display font-bold tracking-tight leading-[1.05] mb-6 text-[clamp(2.75rem,7vw,5.5rem)]">
```

- [ ] **Step 3: Shrink the CTA wrapper's bottom margin (non-compact case)**

Replace:

```tsx
            compact ? 'grid-rows-[0fr] opacity-0 pointer-events-none' : 'grid-rows-[1fr] opacity-100 mb-12'
          )}
        >
        <div className={cn('min-h-0', compact ? 'overflow-hidden' : 'overflow-visible')}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
```

with:

```tsx
            compact ? 'grid-rows-[0fr] opacity-0 pointer-events-none' : 'grid-rows-[1fr] opacity-100 mb-8'
          )}
        >
        <div className={cn('min-h-0', compact ? 'overflow-hidden' : 'overflow-visible')}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
```

- [ ] **Step 4: Shrink the tags wrapper's bottom margin**

Replace:

```tsx
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-lg font-semibold text-fg-secondary mb-4">
```

with:

```tsx
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-10"
        >
          <h3 className="text-lg font-semibold text-fg-secondary mb-4">
```

- [ ] **Step 5: Shrink the stat cards**

Replace:

```tsx
                className="group relative rounded-2xl border border-line/70 bg-surface/70 backdrop-blur-sm px-6 py-7 text-center transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-accent-hover/50 hover:shadow-glow-cyan"
                whileTap={{ scale: 0.98 }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-secondary/20 border border-accent/30 mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={22} className="text-accent-hover" />
                </div>
                <div className="font-display text-4xl font-bold text-fg mb-1 tabular-nums">
```

with:

```tsx
                className="group relative rounded-2xl border border-line/70 bg-surface/70 backdrop-blur-sm px-4 py-4 text-center transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-accent-hover/50 hover:shadow-glow-cyan"
                whileTap={{ scale: 0.98 }}
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-secondary/20 border border-accent/30 mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Icon size={22} className="text-accent-hover" />
                </div>
                <div className="font-display text-2xl font-bold text-fg mb-1 tabular-nums">
```

- [ ] **Step 6: Type-check and lint**

Run: `npm run build && npm run lint`
Expected: both succeed with no errors (4 pre-existing warnings in unrelated files are fine).

- [ ] **Step 7: Manual browser verification**

Run `npm run dev`, open the site in a **foreground** browser tab:
1. Confirm the hero-to-resource-grid vertical distance is visibly shorter than before.
2. Confirm the 3 stat cards are smaller but still legible, and their hover
   (lift + glow), count-up animation, and icon still work.
3. Click a category filter to trigger `compact` mode — confirm it still
   looks correct, and now closely matches the default state's height
   (both use `py-12`).
4. Confirm no console errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/layouts/hero-section.tsx
git commit -m "refactor(hero): shrink hero section spacing and stat card sizing"
```
