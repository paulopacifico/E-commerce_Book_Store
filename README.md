# Bookstore E‑commerce API

[![CI](https://github.com/paulopacifico/E-commerce_Book_Store/actions/workflows/maven.yml/badge.svg)](https://github.com/paulopacifico/E-commerce_Book_Store/actions/workflows/maven.yml)
![Java](https://img.shields.io/badge/Java-21-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.2-brightgreen)
![Docker](https://img.shields.io/badge/Docker-ready-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Security-JWT-000000?logo=jsonwebtokens)
![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?logo=reactivex&logoColor=white)
![Angular Material](https://img.shields.io/badge/Angular%20Material-21-FF4081?logo=angular&logoColor=white)

## Overview
A production‑minded Spring Boot backend for a digital bookstore. The system focuses on secure transactions, inventory management, and clean, maintainable architecture. It’s designed to be easy to run locally (H2) or in Docker with PostgreSQL, and it ships with a full Postman collection for API exploration.

**Portfolio:** This project demonstrates core Java Backend skills for recruiters: layered architecture with Spring Boot, JPA persistence (H2/PostgreSQL), REST API with full OpenAPI/Swagger documentation, JWT security, validation, error handling, and tests.

## Highlights
- Stateless authentication with JWT and Spring Security
- Access + refresh token flow (`/api/auth/refresh`) with refresh token rotation
- In-memory request rate limiting on `/api/**` to reduce abuse
- Hardened CORS via explicit allow-list configuration properties
- Audit logging for critical auth/admin/order operations
- Input sanitization guard (`@NoHtml`) on user-controlled text fields
- Clean separation between API DTOs and domain logic
- Cart and order workflows with validation and stock checks
- Docker + PostgreSQL profile for containerized runs
- Idempotent PostgreSQL seed runner (`docker` profile)
- Consistent API error envelope and stable pagination DTO responses
- Postman collection + environment included

## Tech Stack
- **Language/Runtime:** Java 21
- **Framework:** Spring Boot 4.0.2
- **Security:** Spring Security, JWT (jjwt 0.12.3)
- **Persistence:** Spring Data JPA, H2 (local), PostgreSQL (Docker)
- **Build:** Maven
- **Testing:** JUnit 5, Mockito, Spring Test

## Architecture
- **Controllers:** Handle HTTP contracts and DTO mapping
- **Services:** Domain logic, validation, and orchestration (DTO‑free)
- **Repositories:** Data access via Spring Data JPA
- **Mappers/Validators:** Dedicated mapping and validation helpers

## Architecture Diagram
```mermaid
flowchart LR
  client["API Client"] --> controller["Controllers"]
  controller --> mapper["DTO Mappers"]
  controller --> service["Services (Domain Logic)"]
  service --> validator["Validators"]
  service --> repository["Repositories (JPA)"]
  repository --> database[(Database)]
  service --> security["Security (JWT)"]
```

## Local Run (H2)
**Prerequisites**
- JDK 21+
- Maven 3.9+

**Run**
```bash
git clone https://github.com/paulopacifico/E-commerce_Book_Store.git
cd E-commerce_Book_Store
mvn clean install
mvn spring-boot:run
```
API will be available at `http://localhost:8080`.

## Docker Run (PostgreSQL)
```bash
docker compose up --build
```
API will be available at `http://localhost:8080`.

## Postman
Postman assets are in `postman/`:
1. Import `postman/bookstore.postman_environment.json`
2. Import `postman/bookstore.postman_collection.json`
3. Select **Bookstore Local** environment

The **Login** and **Refresh Token** requests store:
- `{{authToken}}` (access token)
- `{{refreshToken}}` (refresh token)

## OpenAPI
- Static OpenAPI spec: `docs/openapi.yaml`
- Import into Postman as an API definition or use as contract documentation.
- Runtime OpenAPI JSON: `/v3/api-docs`
- Runtime Swagger UI: `/swagger-ui.html` (or `/swagger-ui/index.html`)

## Testing
```bash
mvn test
```

## Troubleshooting
- Access documentation and endpoints via:
  - Swagger UI: `http://localhost:8080/swagger-ui.html`
  - OpenAPI JSON: `http://localhost:8080/v3/api-docs`
  - Public APIs: `http://localhost:8080/api/books` and `http://localhost:8080/api/categories`

## CI
GitHub Actions runs the test suite on JDK 21.

## API Modules
- **Auth:** register, login, refresh token
- **Books:** search, list, get, admin CRUD
- **Categories:** list, get, admin CRUD
- **Cart:** add/update/remove/clear, summary totals
- **Orders:** checkout, list, get by id

## Frontend
An Angular-based frontend application is available for this API, providing a full e‑commerce experience for browsing, cart, checkout, and order management.

### Key features
- Browse and search book catalog with category filters
- Shopping cart management with real-time updates
- User authentication and registration with JWT
- Complete checkout and order placement
- Order history tracking
- Responsive design (mobile-first, breakpoints for 320px–1440px)

### Tech stack
- Angular 21+ (standalone components, signals)
- Angular Router for navigation
- Angular HttpClient for API communication
- RxJS for reactive state and HTTP
- Angular Material & CDK; custom SCSS for theme and layout

### Getting started
**Prerequisites:** Node.js 18+, npm or yarn

**Installation**
```bash
git clone <frontend-repo-url>
cd bookstore-frontend
npm install
# Set API base URL in src/environments/environment.ts (e.g. apiUrl: 'http://localhost:8080/api')
npm start
```
Default dev server: `http://localhost:4200`. The app connects to the backend API at `http://localhost:8080/api` by default.

**Production build**
```bash
npm run build
```

### Integration
The frontend consumes this backend’s REST API: auth (`/api/auth/*`), books and categories (`/api/books`, `/api/categories`), cart (`/api/cart`), and orders (`/api/orders`). JWT access tokens are sent via `Authorization: Bearer <token>`; refresh is handled via `/api/auth/refresh`.

**Frontend repository:** [Frontend app](https://github.com/example/bookstore-frontend) (placeholder)

## Response Contracts
- **Paged endpoints (`/api/books`, `/api/books/search`, `/api/books/category/{id}`):**
  return `PageResponse<T>` with: `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`, `hasNext`, `hasPrevious`.
- **Error responses (all endpoints):**
  return `ApiErrorResponse` with: `status`, `error`, `message`, `path`, `timestamp`, and optional `errors` map for validation failures.

## Security Hardening Config
- **JWT (production):** set `JWT_SECRET` in the environment; optional `JWT_EXPIRATION`, `JWT_REFRESH_EXPIRATION` (milliseconds). With profile `prod`, the app fails at startup if `JWT_SECRET` is not set.
- **Rate limit properties:** `app.security.rate-limit.max-requests`, `app.security.rate-limit.window-seconds`
- **CORS properties:** `app.security.cors.allowed-origins`, `allowed-methods`, `allowed-headers`, `exposed-headers`, `allow-credentials`, `max-age`

## Author
**Paulo Pacifico**  
Backend Java Developer
