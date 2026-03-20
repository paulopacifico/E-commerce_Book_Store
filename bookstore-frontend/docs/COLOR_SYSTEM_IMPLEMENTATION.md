# Color System Implementation

This document describes the enforced color hierarchy for the Angular storefront.

## 1) Audit Summary

- Component SCSS hardcoded colors (`src/app/**/*.scss`): **0**
- Inline color styles in templates (`src/**/*.html`): **0**
- Global style hardcoded values in `src/styles.scss`: **163** (intentional for token declaration, gradients, and visual effects)

Key inconsistency found before this update:

- Multiple components used independent blue/red/gray hex values (`#1976d2`, `#c62828`, `#666`, etc.) instead of shared tokens.
- Semantic states (success/warning/error/info) were implemented with per-component literals.

## 2) Color Hierarchy

### Primary

- `--color-primary`, `--color-primary-dark`, `--color-primary-light`
- Usage: CTA emphasis, focus rings, links, active controls

### Secondary / Accent

- `--color-secondary`, `--color-secondary-dark`, `--color-secondary-light`
- Usage: supporting actions, less-prominent actions

### Semantic

- Success: `--state-success-bg`, `--state-success-text`
- Warning: `--state-warning-bg`, `--state-warning-text`
- Error: `--state-error-bg`, `--state-error-text`
- Info: `--state-info-bg`, `--state-info-text`

### Neutral / Structural

- Text: `--text-primary`, `--text-secondary`, `--text-disabled`, `--text-inverse`
- Background: `--bg-primary`, `--bg-secondary`, `--bg-elevated`, `--bg-overlay`
- Borders: `--border-subtle`, `--border-medium`, `--border-strong`

## 3) Source of Truth

Centralized palette and semantic mapping:

- `src/styles/_colors.scss`

Global application tokens and utility classes:

- `src/styles.scss`

Theme engine input:

- `src/tweakcn-modern-minimal.css` (generated from TweakCN JSON + Spartan preset)

## 4) Utility Classes Added

- `.text-primary`, `.text-secondary`, `.text-disabled`
- `.bg-primary`, `.bg-surface`
- `.border-subtle`, `.border-strong`

## 5) Components Updated to Tokenized Colors

- `book-detail.component.scss`
- `pagination.component.scss`
- `order-list.component.scss`
- `order-detail.component.scss`
- `loading-spinner.component.scss`
- `app.component.scss`
- `cart-icon.component.scss`
- `notification-container.component.scss`
- `checkout.component.scss`
- `footer.component.scss`
- `cart.component.scss`
- `confirmation-dialog.component.scss`

## 6) Usage Rules

- Use semantic tokens for status messaging, never raw red/green literals.
- Use `--text-*` tokens for typography hierarchy.
- Use `--bg-*` and `--border-*` tokens for surface layering.
- Keep decorative gradients in global styles, but source stops from palette variables when possible.
