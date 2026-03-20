# Color Accessibility Report (WCAG 2.1 AA)

Sampled critical foreground/background pairs from the enforced token system.

## Contrast Checks

| Pair | Colors | Contrast | Result |
|---|---|---:|---|
| Primary text on page background | `#1f1f1f` on `#fffdf9` | 16.22:1 | PASS |
| Secondary text on page background | `#5a5a5a` on `#fffdf9` | 6.79:1 | PASS |
| Primary button text on CTA background | `#ffffff` on `#a84a1e` | 5.68:1 | PASS |
| Error text on error surface | `#b71c1c` on `#f8dddd` | 5.12:1 | PASS |
| Success text on success surface | `#1d5d24` equivalent token mix on `#dff2e3` | >=4.5:1 | PASS |

## Focus Visibility

- Focus styling uses `--color-border-focus` and `--shadow-focus`.
- Focus is not color-only: ring/outline contrast + shape/offset are retained.

## Notes

- Decorative gradients and overlays are non-text backgrounds and were not used for body text contrast scoring.
- Semantic badges/toasts rely on both color and labels/icons, reducing color-only dependence.
