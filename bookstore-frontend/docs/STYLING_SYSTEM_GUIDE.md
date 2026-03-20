# Styling System Guide

This project uses a layered styling model to keep typography and layout predictable.

## 1) Style Hierarchy

Load order in `angular.json`:

1. `src/tweakcn-modern-minimal.css`
   - Tailwind v4 engine (`@import "tailwindcss"`)
   - Spartan preset (`@import "@spartan-ng/brain/hlm-tailwind-preset.css"`)
   - Theme variables (`--background`, `--foreground`, `--primary`, etc.)
2. `src/styles.scss`
   - Product design tokens (`--font-*`, `--color-*`, spacing/radius/shadow)
   - Typography scale and utility classes
   - Shared UI primitives (`.btn`, forms, cards, states)
   - Feature-level global selectors (`.home-page`, `.header-toolbar`, etc.)

Component SCSS files remain Angular-scoped (default `ViewEncapsulation.Emulated`).

## 2) Typography Contract

Primary tokens:

- `--font-body`, `--font-display`
- `--font-size-xs` ... `--font-size-4xl`
- `--font-size-display`, `--font-size-title`, `--font-size-subtitle` (responsive `clamp`)
- `--line-height-tight`, `--line-height-heading`, `--line-height-body`

Utility classes:

- `.text-display`
- `.text-title`
- `.text-body`
- `.text-caption`
- `.text-muted`
- `.text-balance`

Alignment utilities:

- `.text-left` (`start`)
- `.text-center`
- `.text-right` (`end`)

## 3) Layout + Alignment Rules

- Default document alignment is `text-align: start`.
- Avoid setting `text-align: center` on large containers unless all children need it.
- Keep spacing on token scale (`--space-*` / generated margin and padding utilities).
- Prefer flex/grid on wrappers for layout alignment, text utilities for text alignment.

## 4) Build and Cache Verification

Recommended when style changes are not reflected:

```bash
ng cache clean
rm -rf .angular/cache
npm run build
npm run build:prod
```

If deploying behind CDN, purge cached CSS assets after each release.

## 5) Maintenance Notes

- Keep global typography definitions in `styles.scss` only.
- Keep theme variable generation in `tools/generate-tweakcn-theme.mjs`.
- After changing `tools/themes/modern-minimal.json`, run:

```bash
npm run theme:generate
```
