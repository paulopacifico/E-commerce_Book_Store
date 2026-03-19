# Modern Minimal (TweakCN) + Angular

## Why not only `npx shadcn add …`?

The official `shadcn` CLI is built for **React / Next.js / Vite**. In a plain **Angular** app it will prompt for confirmation and generate files that don’t match Angular’s structure. This project instead uses the **same theme registry JSON** as TweakCN/shadcn and wires it the Angular way.

## What’s installed

| Piece | Role |
|-------|------|
| `tailwindcss` + `@tailwindcss/postcss` | Tailwind v4, PostCSS pipeline (Angular 17.2+ application builder) |
| `.postcssrc.json` | Enables `@tailwindcss/postcss` |
| `src/tweakcn-modern-minimal.css` | Tailwind + **all** `--background`, `--primary`, `.dark { … }`, etc. |
| `tools/themes/modern-minimal.json` | Copy of [modern-minimal.json](https://tweakcn.com/r/themes/modern-minimal.json) |
| `tools/generate-tweakcn-theme.mjs` | Regenerates the CSS when you update the JSON |
| `angular.json` | Loads `tweakcn-modern-minimal.css` **before** `styles.scss` |
| `src/styles.scss` | Maps legacy tokens (`--color-primary`, etc.) onto shadcn variables |

## Regenerate after changing the theme

1. Replace or edit `tools/themes/modern-minimal.json` (e.g. paste a new export from TweakCN).
2. Run:

```bash
npm run theme:generate
```

3. Commit the updated `src/tweakcn-modern-minimal.css`.

## Using the theme in templates (Tailwind)

Utilities such as `bg-background`, `text-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, `rounded-lg` work anywhere Angular renders HTML:

```html
<section class="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
  <h2 class="font-serif text-2xl text-foreground">Featured</h2>
  <p class="text-muted-foreground">Minimal copy.</p>
  <button type="button" class="rounded-md bg-primary px-4 py-2 text-primary-foreground">
    Action
  </button>
</section>
```

## Dark mode

The theme defines `.dark { … }`. Add the class on the root element when you want dark mode, e.g. on `<html class="dark">` (toggle from a service or `app.component`).

## Optional: shadcn-style UI for Angular

For **Angular-native** primitives in the shadcn spirit, look at **[Spartan UI](https://spartan.ng/)** (`npx @spartan-ng/cli` …). You can keep this TweakCN CSS as the design tokens for those components.

## Conflicts with existing SCSS

Older rules in `styles.scss` still set many utilities (`.btn`, headers, cards). They now read **semantic** variables that point at Modern Minimal. Deeply custom terracotta-only rules may need manual tweaks. Prefer Tailwind utility classes on new UI for the cleanest match to the theme.
