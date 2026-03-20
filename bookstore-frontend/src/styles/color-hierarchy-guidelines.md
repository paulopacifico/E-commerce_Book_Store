# Color Hierarchy Usage Guide

## Priority Model

- **Primary action**: use `--color-primary` (filled), white text, stronger shadow.
- **Secondary action**: use surface fill (`--bg-surface`) with border (`--border-subtle`).
- **Tertiary action**: use text-level styling (`--text-secondary`) and switch to `--color-primary` on hover.

## Text Hierarchy

- **Heading / important labels**: `--text-primary` (or `--color-ink` in display contexts).
- **Body copy**: `--text-secondary`.
- **Caption / metadata**: `--text-tertiary`.
- **Disabled**: `--text-disabled`.

## Background Layering

- **Layer 1 (base page)**: `--bg-primary`.
- **Layer 2 (cards/sections)**: `--bg-surface` with subtle border.
- **Layer 3 (elevated/hover/modal surfaces)**: `--bg-elevated` and stronger shadow.
- **Layer 4 (overlays/backdrops)**: `--bg-overlay`.

## Semantic States

- **Success**: `--state-success-bg`, `--state-success-text`, `--state-success-border`.
- **Warning**: `--state-warning-bg`, `--state-warning-text`, `--state-warning-border`.
- **Error**: `--state-error-bg`, `--state-error-text`, `--state-error-border`.
- **Info**: `--state-info-bg`, `--state-info-text`, `--state-info-border`.

## Decision Tree

1. Is the element the single main task on this surface?
   - Yes -> primary button (`--color-primary`).
   - No -> go to step 2.
2. Is it an alternative but still important action?
   - Yes -> secondary button (surface + border).
   - No -> go to step 3.
3. Is it supportive navigation or utility?
   - Yes -> tertiary style (text-first, accent on hover/focus).

## 60-30-10 Rule Target

- **60%** neutrals (`--bg-primary`, `--bg-surface`).
- **30%** structure/content (`--text-primary`, borders, card shadows).
- **10%** accents (`--color-primary`, semantic highlights).
