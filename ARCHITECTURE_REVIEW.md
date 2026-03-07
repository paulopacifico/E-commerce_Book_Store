# Code and Architecture Review — E-commerce Book Store

## 1. Architecture overview

The project follows a **layered architecture** typical of REST APIs with Spring Boot, with clear separation of responsibilities:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         API Client (HTTP)                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Controllers (Auth, Book, Cart, Category, Order)                         │
│  • HTTP contracts, @Valid, input/output DTOs                             │
│  • Delegate to Services and use Mappers for Entity → DTO                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌──────────────────────┐  ┌─────────────────┐  ┌──────────────────────┐
│  DTO Mappers          │  │  Services       │  │  Security            │
│  BookMapper,          │  │  (domain        │  │  JWT, UserPrincipal,  │
│  CartMapper,          │  │   logic)        │  │  CustomUserDetails    │
│  OrderMapper,         │  │  No DTOs        │  │  OwnershipValidator   │
│  CategoryMapper       │  │  Entities       │  │  StockValidator       │
└──────────────────────┘  └────────┬────────┘  └──────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Repositories (JPA) — Book, CartItem, Category, Order, OrderItem, User   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Database (H2 / PostgreSQL)                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Controllers**: expose the API, receive DTOs, call services and convert entities to DTOs with mappers.
- **Services**: orchestrate business rules, validations (via validators) and repositories; work with entities, not DTOs.
- **Mappers**: centralize Entity ↔ DTO conversion in one place.
- **Validators**: `StockValidator` and `OwnershipValidator` encapsulate reusable rules.
- **Security**: JWT stateless, `UserPrincipal` for authenticated user, roles (USER/ADMIN) and filter in the security chain.

---

## 2. Strengths

| Aspect | Comment |
|--------|---------|
| **DTO vs domain separation** | Services do not depend on DTOs; the API is isolated from business logic. |
| **BaseEntity** | `equals`/`hashCode` with `Hibernate.getClass()` avoids issues with proxies and inheritance. |
| **Validation** | Bean Validation on entities/DTOs + business validators (stock, ownership). |
| **Transactions** | `@Transactional` on methods that change state (cart, checkout). |
| **Error handling** | `GlobalExceptionHandler` with `ResourceNotFoundException`, `BadRequestException`, invalid credentials and field validation. |
| **Security** | Public/authenticated/admin routes well defined; stateless session. |
| **Lazy loading** | `FetchType.LAZY` on associations and `open-in-view: false` avoid N+1 and unnecessary connection use. |
| **Tests** | Controller, security and service tests (Cart, Order). |
| **DevOps** | Docker, GitHub Actions (CI), Postman collection. |

---

## 3. Points of attention and improvements

### 3.1 Security — JWT and error handling

**`JwtTokenProvider.getSigningKey()`**

Current usage does:

- `Base64.getEncoder().encodeToString(jwtSecret.getBytes())` and then `Decoders.BASE64.decode(...)`.

For a secret configured as plain text (e.g. in `application.yml`), the preferred approach is to use the secret directly as bytes, with adequate size for HS256 (e.g. 256 bits). Example:

```java
private SecretKey getSigningKey() {
    byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
    if (keyBytes.length < 32) {
        keyBytes = Arrays.copyOf(keyBytes, 32);
    }
    return Keys.hmacShaKeyFor(keyBytes);
}
```

Or, if the secret is stored in Base64, use only `Decoders.BASE64.decode(jwtSecret)`.

**Production**

- `jwt.secret` should not live in versioned `application.yml`; use an environment variable or secret manager.
- In production, disable `/h2-console/**` or restrict by profile.

---

### 3.2 Stock validation consistency

- **CartService**: uses `StockValidator` to add/update item.
- **OrderService.checkout**: validates stock manually in a loop.

Suggestion: use the same `StockValidator` in checkout to avoid duplication and keep a single "insufficient stock" rule:

```java
// In OrderService.checkout, before creating the order:
for (CartItem item : cartItems) {
    stockValidator.validateAvailableStock(item.getBook(), item.getQuantity());
}
```

---

### 3.3 HTTP status for "not your resource"

- `OwnershipValidator` throws `BadRequestException` (400) when the resource does not belong to the user.
- Semantically, "not authorized to access this resource" is closer to **403 Forbidden**.

Suggestion: create something like `ForbiddenException` and map it in `GlobalExceptionHandler` to `HttpStatus.FORBIDDEN`, and use that type in `OwnershipValidator`.

---

### 3.4 Exposing details in generic errors

In `GlobalExceptionHandler`:

```java
"An unexpected error occurred: " + ex.getMessage()
```

In production, exposing `ex.getMessage()` can leak information. Prefer a generic message and log the stack trace only in logs.

---

### 3.5 Pagination in the books API

- `BookController.getAllBooks` returns `Page<BookDTO>`.
- The README mentions "Improved paging DTOs (Spring Data Page serialization)" in the roadmap.

Spring Data's `Page` works but exposes fields like `pageable`, `sort`, etc. A page DTO (e.g. `PageResponse<BookDTO>` with `content`, `totalElements`, `totalPages`, `number`, `size`) makes the API more stable and clear for the client.

---

### 3.6 Search route vs path param

- `GET /api/books/search?keyword=...` and `GET /api/books/{id}` can conflict if a client sends `GET /api/books/search` interpreted as `id=search`.
- Spring usually resolves by annotation order; keeping the more specific route (`/search`) before the generic `/{id}` (as already done) avoids this. Document in the API (e.g. OpenAPI) to make it explicit.

---

## 4. Summary

| Dimension | Assessment |
|-----------|------------|
| Layered architecture | Clear: Controller → Service → Repository; DTOs and mappers well placed. |
| Security | JWT and roles used well; adjust key generation and do not expose secret in production. |
| Consistency | Reuse `StockValidator` in checkout and standardize HTTP (403 for ownership). |
| Maintainability | Validators and mappers ease evolution; exception handling and pagination can be refined. |

The code is well structured, aligned with what the README describes (Controllers, Services, Repositories, Mappers/Validators), and the suggestions above are refinements for security, consistency and a more stable API.
