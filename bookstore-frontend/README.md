# Bookstore Frontend

Angular 21 storefront application for the E-commerce Book Store project.

## Requirements

- Node.js 20+
- npm 11+
- JDK 21 and Maven for the full-stack end-to-end smoke test

## Local development

Install dependencies and start the development server:

```bash
npm install
npm start
```

The app runs at `http://localhost:4200/`.

## Production runtime

The production Angular environment uses `/api` as a same-origin backend base URL. The repository
Docker Compose stack builds this app into an Nginx runtime image that serves SPA route refreshes and
proxies `/api` to the Spring Boot `app` service:

```bash
cd ..
docker compose up --build
```

The containerized storefront runs at `http://localhost:3000/`.

## Available scripts

```bash
npm start
```

Starts the Angular development server.

```bash
npm run build
```

Creates a production-ready build using non-interactive CI mode so local verification matches automated delivery checks.

```bash
npm run build:prod
```

Explicit non-interactive production build command for local verification and CI.

```bash
npm run lint
```

Runs the engineering lint gate:

1. Prettier formatting verification
2. TypeScript type-checking for app and spec configurations

```bash
npm run format
```

Applies Prettier formatting across the repository.

```bash
npm run typecheck
```

Runs TypeScript compilation checks without emitting build artifacts.

```bash
npm test
```

Runs the unit test runner in watch mode for local development.

```bash
npm run test:ci
```

Runs the unit test suite once without watch mode. This is the command intended for CI and delivery validation.

```bash
npm run test:e2e
```

Runs the Playwright purchase-funnel smoke test against an isolated full-stack harness. The command
starts the Spring Boot backend on `http://127.0.0.1:8081` and an Angular E2E server on
`http://127.0.0.1:4300`.

```bash
npm run check
```

Runs the required delivery gate:

1. Formatting and type checks
2. Unit tests in CI mode
3. Production build

## Quality gate

A change is not considered ready for delivery until `npm run check` passes locally.

Recommended workflow before opening a PR or handing off work:

```bash
npm run check
npx playwright install chromium
npm run test:e2e
```

The browser install step is only needed when Chromium is not already present in the Playwright
cache.

## Project focus

This frontend includes:

- Angular routing with lazy-loaded feature areas
- Typed HTTP services for backend integration
- Responsive commerce screens such as catalog, cart, checkout, and orders
- Shared UI components and reusable pipes

## Backend configuration

The application currently expects the backend API at:

```text
http://localhost:8080/api
```

Update the environment files if the backend runs on a different host or port.
