# Software Architecture Verification

Verification of the project structure and dependency flow against a clean layered architecture.

---

## 1. Package structure

```
com.bookstore
├── BookstoreApplication.java
├── config/          (SecurityConfig, OpenApiConfig, CorsProperties, RateLimitProperties, PostgresDataSeeder)
├── controller/      (Auth, Book, Cart, Category, Order)
├── domain/          (AuthResult, CartSummary)        — value objects / result types
├── dto/              (request/response DTOs)
├── entity/           (JPA entities)
├── exception/        (custom exceptions + GlobalExceptionHandler, ApiErrorResponse)
├── mapper/           (Entity ↔ DTO conversion)
├── repository/       (JPA repositories + CategoryWithCount projection)
├── security/         (JWT, filters, UserPrincipal, CustomUserDetailsService)
├── service/          (business logic)
└── validation/       (StockValidator, OwnershipValidator, NoHtml)
```

**Assessment:** Structure is clear and aligned with a classic 3-tier + cross-cutting layers. Each package has a single, well-defined responsibility.

---

## 2. Dependency direction (layers)

| Layer        | Allowed to depend on                    | Must not depend on   |
|-------------|------------------------------------------|----------------------|
| Controller  | dto, service, mapper, domain, security*  | repository, entity** |
| Service     | entity, repository, exception, validation, domain, security | controller, dto*** |
| Repository  | entity                                  | service, controller, dto |
| Mapper      | dto, entity                             | controller, service  |
| Validation  | entity, exception                       | controller, service  |
| Exception   | (none internal)                         | —                    |
| Config      | security, (framework)                   | service, repository  |

\* Security: `UserPrincipal` in controllers for authenticated user is acceptable.  
\** Controllers currently use `entity` only to pass to mappers or to resolve references (e.g. `Category` for `BookMapper.toEntity`); they do not expose entities.  
\*** Services correctly avoid DTOs; they work with entities and domain types.

**Verified:**

- **Repositories** depend only on **entity**. No inversions.
- **Services** depend on entity, repository, exception, validation, domain, and (in one case) security. No dependency on controller or dto.
- **Controllers** depend on dto, service, mapper, domain, and in some cases entity (for mapper input) and security. No direct dependency on repository.
- **Mappers** depend on dto and entity (and in one case `CategoryWithCount`; see below).
- **Validators** depend on entity and exception only.

---

## 3. Minor inconsistencies (structure still clean)

### 3.1 CategoryWithCount in `repository` package

- **Current:** Interface `CategoryWithCount` lives in `repository` and is used by `CategoryService` and `CategoryMapper`.
- **Impact:** Mapper layer depends on the repository package for a type that is a read-model projection, not repository logic.
- **Suggestion (optional):** Move `CategoryWithCount` to a shared package such as `com.bookstore.domain.projection` or `com.bookstore.projection` so that repository and mapper both depend on it, and the “repository” package does not export a non-repository type. This would make dependency direction even clearer.

### 3.2 Controllers holding entity references

- **Current:** `BookController` and `CategoryController` use `Category` / `Book` when calling services or mappers (e.g. `resolveCategory(bookDTO.getCategoryId())` returning `Category`, then `bookMapper.toEntity(bookDTO, category)`).
- **Assessment:** Acceptable: entities are not returned to the client; they are used only as mapper inputs or service parameters. No structural change required; optional refinement is to have the service accept `categoryId` and resolve `Category` inside the service.

### 3.3 AuthController and User entity

- **Current:** `AuthController.toAuthResponse(AuthResult)` builds the response and uses `User` from `AuthResult` (e.g. `user.getEmail()`, `user.getRole().name()`).
- **Assessment:** Response building could be moved to a dedicated mapper or to `AuthService` returning a DTO. Minor; the controller remains thin.

---

## 4. Cross-cutting and infrastructure

- **Security:** Filters and `UserPrincipal` are in `security/`; config in `config/SecurityConfig`. No business logic in security layer.
- **Exception:** `GlobalExceptionHandler` and `ApiErrorResponse` in `exception/`; used by all layers via thrown exceptions. Clean.
- **Validation:** `validation/` contains domain validators (stock, ownership) and the `@NoHtml` constraint. Used by services and (indirectly) by controllers via Bean Validation. Clear.
- **Config:** Centralized in `config/` (security, CORS, rate limit, OpenAPI, data seed). No business logic.

---

## 5. Summary

| Criterion                 | Status | Notes |
|---------------------------|--------|--------|
| Clear package boundaries | OK     | One main responsibility per package. |
| Dependency direction     | OK     | No layer depends on a higher layer (e.g. repository never depends on service/controller). |
| Controller thin           | OK     | Controllers delegate to services and mappers; small entity usage for mapping only. |
| Services DTO-free         | OK     | Services use entities and domain types. |
| Repository isolation      | OK     | Repositories depend only on entities. |
| Single place for mapping  | OK     | Entity ↔ DTO conversion in mappers. |
| Projection type location  | Minor  | `CategoryWithCount` in `repository` is acceptable; moving to `domain`/`projection` would slightly clarify layers. |

**Conclusion:** The architecture is clean and the structure is consistent with a layered design. Dependency flow is correct (inward: controller → service → repository). The only optional improvement is to move the projection type `CategoryWithCount` to a neutral package if you want to avoid mapper depending on the repository package for that type.
