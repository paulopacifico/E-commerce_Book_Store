# Bookstore Frontend

Angular 21 storefront application for the E-commerce Book Store project.

## Requirements

- Node.js 20+
- npm 11+

## Local development

Install dependencies and start the development server:

```bash
npm install
npm start
```

The app runs at `http://localhost:4200/`.

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
npm test
```

Runs the unit test runner in watch mode for local development.

```bash
npm run test:ci
```

Runs the unit test suite once without watch mode. This is the command intended for CI and delivery validation.

```bash
npm run check
```

Runs the required delivery gate:

1. Unit tests in CI mode
2. Production build

## Quality gate

A change is not considered ready for delivery until `npm run check` passes locally.

Recommended workflow before opening a PR or handing off work:

```bash
npm run check
```

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
