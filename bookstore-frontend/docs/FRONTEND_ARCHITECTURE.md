# Frontend Architecture

This project follows a feature-first Angular structure.

## Directory rules

- `src/app/core`
  Contains application-wide infrastructure only.
  Examples: guards, interceptors, global error handling, cross-cutting singleton services.

- `src/app/shared`
  Contains reusable UI building blocks with no feature ownership.
  Examples: generic components, pipes, and utilities reused by multiple features.

- `src/app/layout`
  Contains shell and navigation components used to compose the application frame.
  Examples: header, footer, cart icon.

- `src/app/features/<feature>`
  Contains everything owned by a single business feature.

## Feature structure

Each feature should use the following folders when applicable:

- `pages/`
  Routed containers and screen-level components.

- `data-access/`
  Feature-specific services, API clients, and state services.

- `models/`
  Interfaces and types owned by the feature.

- `*.routes.ts`
  Feature routing definition when the feature has child routes.

- `*.module.ts`
  Feature module for NgModule-based lazy loading when needed.

## Ownership rules

- Do not place feature-specific services or models inside `core`.
- Do not place layout-specific components inside `shared`.
- Reusable presentation components belong in `shared` only when they are not owned by a single feature.
- If a component is routed directly, it belongs in a feature `pages/` folder.
- If a service exists only to support one feature, it belongs in that feature's `data-access/` folder.

## Example

```text
features/
  books/
    data-access/
      book.service.ts
    models/
      book.interface.ts
    pages/
      book-list/
      book-detail/
    books.routes.ts
    books.module.ts
```
