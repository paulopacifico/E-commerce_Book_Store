# Color System Before/After

## Before

- Component-level hardcoded literals (`#1976d2`, `#c62828`, `#666`, `rgba(...)`) were repeated across many feature styles.
- Semantic meanings varied by component (e.g., warning/info shades changed between pages).
- Borders/backgrounds were inconsistent in cards, tables, and dialogs.
- Global and component color definitions were mixed without a strict hierarchy.

## After

- All component SCSS under `src/app/**` uses tokenized variables only.
- Central palette + semantic mapping live in `src/styles/_colors.scss`.
- Runtime CSS variable hierarchy is exposed in `:root`.
- Shared utilities now enforce common text/background/border token usage.
- CTA button contrast was improved by moving primary button background to `--color-primary-dark`.

## Impact

- Better visual consistency across pages.
- Easier future theming (light/dark and brand refreshes).
- Lower regression risk when updating component styles.
