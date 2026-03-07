# Implementation Roadmap — Remaining Work

Consolidated view of what is **already implemented** vs **still to implement**, based on [IMPROVEMENTS_ANALYSIS.md](IMPROVEMENTS_ANALYSIS.md), [ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md), and [PROJECT_ANALYSIS_REPORT.md](PROJECT_ANALYSIS_REPORT.md).

---

## 1. Already implemented

| Area | Item | Status |
|------|------|--------|
| **Security** | JWT + refresh token flow | Done |
| **Security** | JWT secret (and expiration) from env: `JWT_SECRET`, optional `JWT_EXPIRATION`/`JWT_REFRESH_EXPIRATION`; `prod` profile requires `JWT_SECRET` | Done |
| **Consistency** | Category create/update: DTO → entity via CategoryMapper.toEntity(CategoryDTO); controller no longer builds entity | Done |
| **Consistency** | CategoryWithCount in `domain.projection` (mapper no longer depends on repository for it) | Done |
| **Security** | BCrypt, roles, CORS allow-list, rate limiting | Done |
| **Security** | JwtTokenProvider: SLF4J Logger (no System.err) | Done |
| **Security** | H2 console allowed only when profile `local` is active | Done |
| **Security** | OwnershipValidator uses ForbiddenException (403) | Done |
| **Security** | Generic error message in production (isLocalProfile), no ex.getMessage() in response | Done |
| **API** | PageResponse&lt;T&gt; for pagination | Done |
| **API** | ApiErrorResponse for all errors | Done |
| **API** | OpenAPI/Swagger + annotations on controllers/DTOs | Done |
| **Performance** | CartItemRepository: JOIN FETCH book in findByUserId | Done |
| **Performance** | OrderRepository: JOIN FETCH orderItems + book (list and getById) | Done |
| **Performance** | Category: CategoryWithCount projection, no lazy load for bookCount | Done |
| **Performance** | JPA indexes on Book, CartItem, Order | Done |
| **Validation** | StockValidator used in CartService and OrderService.checkout | Done |
| **Validation** | @NoHtml on user-controlled fields | Done |
| **Ops** | Idempotent PostgresDataSeeder (docker profile) | Done |
| **Docs** | README without duplicate Troubleshooting | Done |
| **Architecture** | Layered structure verified (see ARCHITECTURE_VERIFICATION.md) | Done |

---

## 2. Implementations still needed

### High priority (recommended next)

| # | Item | Description | Effort |
|---|------|-------------|--------|
| ~~1~~ | ~~**JWT secret from environment**~~ | **Done.** `jwt.secret` (and optional `JWT_EXPIRATION`, `JWT_REFRESH_EXPIRATION`) read from env; default in `application.yml` for local; `application-prod.yml` requires `JWT_SECRET` (no default). README updated. | — |
| 2 | **Pagination max cap** | Cap `size` (e.g. max 100) in book/category paged endpoints to avoid heavy queries. Use `@RequestParam(defaultValue = "10") @Max(100) int size` or a `@ControllerAdvice` to clamp. | Low |

### Medium priority (consistency and quality)

| # | Item | Description | Effort |
|---|------|-------------|--------|
| ~~3~~ | ~~**DTO → Category in service or mapper**~~ | **Done.** CategoryMapper.toEntity(CategoryDTO); controller create/update use it. | — |
| ~~4~~ | ~~**CategoryWithCount package**~~ | **Done.** CategoryWithCount moved to `com.bookstore.domain.projection`. | — |
| 5 | **CategoryService tests** | Add unit tests for create/update/delete and duplicate-name validation. | Medium |
| 6 | **BookService tests** | Add unit tests for CRUD, getById (ResourceNotFoundException), search, and validation. | Medium |
| 7 | **Order integration tests** | Test checkout with empty cart (400), insufficient stock (400), and cart cleared after successful checkout. | Medium |
| 8 | **CI: explicit test step** | In GitHub Actions, add a dedicated “Run tests” step (e.g. `mvn test`) before or instead of only `mvn clean install`, and document in README that tests run in CI. | Minimal |

### Lower priority (evolution and operations)

| # | Item | Description | Effort |
|---|------|-------------|--------|
| 9 | **Correlation ID / request ID** | Filter or interceptor: generate or read `X-Request-Id`, put in MDC and optionally in response header for log tracing. | Medium |
| 10 | **Hikari pool in production** | In `application-docker.yml` or a `prod` profile, set `spring.datasource.hikari.maximum-pool-size` and `minimum-idle`. | Low |
| 11 | **Actuator in production** | Restrict exposed endpoints (e.g. only `health`, `info`) and disable or secure sensitive ones. | Low |
| 12 | **API versioning** | Introduce `/api/v1` and document in OpenAPI. Keep existing `/api` as alias during transition if needed. | Low |
| 13 | **OpenAPI sync** | Keep `docs/openapi.yaml` in sync with code (e.g. generate from SpringDoc in build or a CI step). | Low |
| 14 | **Error response tests** | In integration tests, assert ApiErrorResponse shape (status, message, path, errors) for 400/401/403/404. | Low |

### Backlog (optional features)

| # | Item | Effort |
|---|------|--------|
| 15 | Payment (e.g. Stripe/PayPal) | 4–7 days |
| 16 | Email notifications (order confirmation, etc.) | 1–2 days |
| 17 | Inventory alerts (low stock) | ~1 day |
| 18 | Wishlist | 2–3 days |
| 19 | Reviews/ratings | 3–4 days |
| 20 | Micrometer metrics + dashboards | 1–2 days |

---

## 3. Suggested order of implementation

1. **Quick wins:** #1 (JWT secret from env), #2 (pagination cap), #8 (CI test step).  
2. **Consistency:** #3 (Category DTO in service/mapper), #4 (CategoryWithCount package).  
3. **Tests:** #5, #6, #7, #14.  
4. **Operations:** #10, #11, #9 (correlation ID).  
5. **API evolution:** #12, #13.  
6. **Features:** #15–20 as needed.

---

## 4. Summary

- **Already in place:** Security hardening (JWT logger, H2 by profile, 403 for ownership), N+1 fixes, indexes, category projection, error contract, pagination DTO, audit/rate limit/CORS/NoHtml, idempotent seed, and README/OpenAPI/docs.  
- **Next focus:** Production config (JWT secret, pagination cap), small consistency refactors (Category DTO, projection package), and tests (CategoryService, BookService, Order integration, error contract).  
- **Later:** Correlation ID, Hikari/Actuator tuning, API versioning, OpenAPI sync, and optional features (payment, email, wishlist, reviews, metrics).

Use this roadmap to pick the next set of implementations (e.g. 1–2–8, then 3–4, then 5–6–7).
