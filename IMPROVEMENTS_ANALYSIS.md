# Project Analysis — Best Practices and Software Engineering

Analysis of the E-commerce Book Store backend with a focus on improvements aligned to best practices and advanced software engineering. Complements [ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md) and [PROJECT_ANALYSIS_REPORT.md](PROJECT_ANALYSIS_REPORT.md).

---

## 1. Strengths (already in place)

| Area | Practice |
|------|----------|
| **Architecture** | Clear layers: Controller → Service → Repository; DTOs isolated from domain logic |
| **Security** | JWT stateless, BCrypt, roles (USER/ADMIN), configurable CORS and rate limit |
| **Validation** | Bean Validation + domain validators (StockValidator, OwnershipValidator) reused |
| **Errors** | GlobalExceptionHandler with single envelope (ApiErrorResponse); generic message in production (isLocalProfile) |
| **Transactions** | @Transactional on state-changing operations (cart, checkout) |
| **JPA** | FetchType.LAZY, open-in-view: false, BaseEntity with proxy-safe equals/hashCode |
| **API** | Stable PageResponse, documented OpenAPI/Swagger |
| **DevOps** | Docker, CI (Maven), Postman, idempotent seed in docker profile |

---

## 2. Recommended improvements

### 2.1 Architecture and responsibilities

**A) Logic in Controller (CategoryController)**

In `createCategory` and `updateCategory` the controller builds the entity from the DTO:

```java
Category category = new Category();
category.setName(categoryDTO.getName());
category.setDescription(categoryDTO.getDescription());
Category created = categoryService.createCategory(category);
```

- **Issue:** "DTO → entity" responsibility should live in the service or a mapper, keeping the controller focused on HTTP contract only.
- **Suggestion:** Have `CategoryService` accept `CategoryDTO` (or an input record) and create the entity internally; or have `CategoryMapper` expose `toEntity(CategoryDTO)` and the controller call `categoryService.createCategory(categoryMapper.toEntity(dto))`.

**B) Book vs Category consistency**

In `BookController` the DTO → entity mapping is in the controller via `BookMapper.toEntity(bookDTO, category)`. In Category the controller builds the entity manually. Standardize: a single place (service or mapper) for "create/update entity from DTO".

---

### 2.2 Performance and N+1

**A) CategoryMapper and bookCount**

`CategoryMapper.toDTO` uses `category.getBooks().size()`, which initializes the lazy collection and can cause N+1 when listing many categories.

- **Suggestion:** Add a method in `CategoryRepository` that returns categories with count in a single query (e.g. a DTO/projection with `COUNT(b.id)`). The mapper would receive this value instead of calling `getBooks().size()`.

**B) Cart and Order: association fetch**

- `CartService.getCart`: for each `CartItem` it accesses `item.getBook().getPrice()` → one query per item (N+1).
- `OrderMapper.toDTO`: for each `OrderItem` it accesses `orderItem.getBook()` → N+1 when listing orders with items.

**Suggestion:**

- In `CartItemRepository`: method with `JOIN FETCH` to load `Book` when fetching user items, e.g. `@Query("SELECT ci FROM CartItem ci JOIN FETCH ci.book WHERE ci.user.id = :userId")`.
- In `OrderRepository` (or a method used by the list/detail API): query with `JOIN FETCH orderItems` and `JOIN FETCH orderItems.book` to load order + items + book in 1–2 queries.

**C) Explicit indexes (PostgreSQL)**

For production, define indexes on entities (or via migration) for frequent queries:

- `Book`: `category_id`, `isbn` (unique already helps), optionally `(title, author)` for search.
- `CartItem`: `(user_id, book_id)` for `findByUserIdAndBookId` and `deleteByUserId`.
- `Order`: `user_id`, `(user_id, created_at)` for user-ordered list.

Example in JPA (or equivalent in Flyway/Liquibase):

```java
@Table(name = "cart_items", indexes = {
    @Index(name = "idx_cart_items_user_book", columnList = "user_id, book_id")
})
```

---

### 2.3 Security and observability

**A) JwtTokenProvider: logging**

Using `System.err.println` in `validateToken` hinders log control and aggregation.

- **Suggestion:** Use a `Logger` (e.g. SLF4J) and log at DEBUG or WARN level, without exposing token details.

**B) JWT secret in production**

The secret is in `application.yml`. In production it should come from an environment variable or secret manager (e.g. `JWT_SECRET`), with no strong default in the repository.

**C) H2 console**

`/h2-console/**` is permitAll in `SecurityConfig`. In production (non-local profile) it should be disabled or restricted (e.g. `requestMatchers("/h2-console/**").denyAll()` when profile != local).

**D) Correlation ID / request tracing**

For debugging and auditing in production, each request can have a unique ID (e.g. `X-Request-Id` or MDC). This improves traceability in logs and APM tools.

- **Suggestion:** Filter or interceptor that reads or generates a request ID, puts it in MDC and optionally in the response header.

---

### 2.4 Code quality

**A) README: duplicate section**

There were two "Troubleshooting" sections and two identical blocks ("Access documentation and endpoints via…"). Removing the duplicate keeps a single source of truth.

**B) Exception handling in JWT**

In `JwtTokenProvider.validateToken` exceptions are caught and only printed; the method returns `false`. Correct from a flow perspective, but using a logger (instead of `System.err`) and optionally metrics for invalid/expired tokens helps operations.

**C) OwnershipValidator and HTTP status**

[ARCHITECTURE_REVIEW](ARCHITECTURE_REVIEW.md) suggests 403 Forbidden for "resource does not belong to the user". The project already has `ForbiddenException` and handler; ensure all "not your resource" cases use `ForbiddenException` (403) instead of `BadRequestException` (400).

---

### 2.5 Testing

**A) Coverage**

There are tests for controller (Auth, Ownership), security, services (Cart, Order), exception handler and validators. Useful areas to expand:

- **CategoryService** (create/update/delete and duplicate-name rules).
- **BookService** (CRUD and search), especially scenarios that trigger `ResourceNotFoundException` and validations.
- **Order integration:** checkout with empty cart, insufficient stock, and that the cart is cleared after success.

**B) CI: test step**

The current workflow uses `mvn clean install`, which already runs tests. Making it explicit helps pipeline readability, for example:

```yaml
- name: Run tests
  run: mvn test
- name: Build
  run: mvn package -DskipTests
```

or keep `install` and document in the README that tests run in CI.

**C) Contract and resilience tests**

- Explicit assertions on error body (ApiErrorResponse) for 400/401/403/404 scenarios.
- If there is an HTTP client (e.g. in integration tests), consider a contract test (e.g. Spring Cloud Contract or assertion against OpenAPI) to avoid API breakage.

---

### 2.6 Configuration and operations

**A) Connection pool (Hikari)**

In production, configure pool size (e.g. `spring.datasource.hikari.maximum-pool-size`, `minimum-idle`) according to load and database limits.

**B) Profiles**

- Keep `local` for development (H2, show-sql, debug).
- `docker` profile already uses PostgreSQL and idempotent seed.
- A `prod` or `production` profile can disable H2 console, Swagger (or restrict it), and use generic error message (already covered by `isLocalProfile()`).

**C) Health and metrics**

Actuator is in the project; in production, expose only needed endpoints (e.g. `health`, `info`) and protect or disable sensitive ones. Optional: DB health and, later, metrics (Micrometer) for latency and error rate.

---

### 2.7 API and documentation

**A) API versioning**

The current prefix is `/api`. For future evolution, consider `/api/v1` and a version header or path, documented in OpenAPI.

**B) Static OpenAPI**

Keep `docs/openapi.yaml` in sync with the code (or generate it from code in the build) to avoid documentation and API behaviour drifting apart.

**C) Pagination defaults**

Define default and maximum values for `page` and `size` (e.g. max 100) in the controller or in a `@ControllerAdvice` to avoid accidentally heavy queries.

---

## 3. Suggested prioritization

| Priority | Item | Impact | Effort |
|----------|------|--------|--------|
| High | N+1 in cart/order (fetch join) | List performance | Low |
| High | CategoryMapper bookCount without lazy load | Category list performance | Low |
| High | JwtTokenProvider: replace System.err with Logger | Operations and consistency | Minimal |
| High | H2 console restricted outside local profile | Security | Minimal |
| Medium | DTO→Category logic in service/mapper | Consistency and maintenance | Low |
| Medium | Indexes on CartItem, Order, Book | Production performance | Low |
| Medium | CategoryService and BookService tests | Reliability | Medium |
| Medium | Remove README duplicate | Documentation | Minimal |
| Low | Correlation ID / request ID | Observability | Medium |
| Low | Hikari pool and actuator in prod | Operations | Low |
| Low | /api/v1 versioning and pagination limits | API evolution | Low |

---

## 4. Summary

The project is well structured, with clear separation of responsibilities, security and error handling aligned to best practices. Improvements have the most impact in:

1. **Performance:** eliminate N+1 (cart, order, categories) and add indexes.
2. **Security and operations:** logger in JWT, restrict H2 and configure secret/pool in production.
3. **Consistency:** DTO→entity in a single place (service/mapper) and 403 for ownership.
4. **Testing and documentation:** more service tests and README without duplicates.

Implementing high and medium priority items first yields quick gains with contained effort.
