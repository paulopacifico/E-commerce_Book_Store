# Revisão de Código e Arquitetura — E-commerce Book Store

## 1. Visão geral da arquitetura

O projeto segue uma **arquitetura em camadas** típica de APIs REST com Spring Boot, com boa separação de responsabilidades:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         API Client (HTTP)                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Controllers (Auth, Book, Cart, Category, Order)                         │
│  • Contratos HTTP, @Valid, DTOs de entrada/saída                         │
│  • Delegam para Services e usam Mappers para Entity → DTO                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌──────────────────────┐  ┌─────────────────┐  ┌──────────────────────┐
│  DTO Mappers          │  │  Services       │  │  Security            │
│  BookMapper,          │  │  (lógica de     │  │  JWT, UserPrincipal,  │
│  CartMapper,          │  │   domínio)      │  │  CustomUserDetails    │
│  OrderMapper,         │  │  Sem DTOs       │  │  OwnershipValidator   │
│  CategoryMapper       │  │  Entidades      │  │  StockValidator       │
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

- **Controllers**: expõem a API, recebem DTOs, chamam services e convertem entidades em DTOs com mappers.
- **Services**: orquestram regras de negócio, validações (via validators) e repositórios; trabalham com entidades, não com DTOs.
- **Mappers**: concentram a conversão Entity ↔ DTO em um único lugar.
- **Validators**: `StockValidator` e `OwnershipValidator` encapsulam regras reutilizáveis.
- **Security**: JWT stateless, `UserPrincipal` para usuário autenticado, roles (USER/ADMIN) e filtro na cadeia de segurança.

---

## 2. Pontos fortes

| Aspecto | Comentário |
|--------|------------|
| **Separação DTO vs domínio** | Services não dependem de DTOs; a API fica isolada da lógica de negócio. |
| **BaseEntity** | `equals`/`hashCode` com `Hibernate.getClass()` evita problemas com proxies e herança. |
| **Validação** | Bean Validation nas entidades/DTOs + validators de negócio (estoque, propriedade). |
| **Transações** | `@Transactional` nos métodos que alteram estado (cart, checkout). |
| **Tratamento de erros** | `GlobalExceptionHandler` com `ResourceNotFoundException`, `BadRequestException`, credenciais inválidas e validação de campos. |
| **Segurança** | Rotas públicas/autenticadas/admin bem definidas; sessão stateless. |
| **Lazy loading** | `FetchType.LAZY` em associações e `open-in-view: false` evitam N+1 e uso desnecessário de conexões. |
| **Testes** | Testes de controller, security e services (Cart, Order). |
| **DevOps** | Docker, GitHub Actions (CI), Postman collection. |

---

## 3. Pontos de atenção e melhorias

### 3.1 Segurança — JWT e tratamento de erros

**`JwtTokenProvider.getSigningKey()`**

O uso atual faz:

- `Base64.getEncoder().encodeToString(jwtSecret.getBytes())` e depois `Decoders.BASE64.decode(...)`.

Para um secret configurado como texto (ex.: em `application.yml`), o ideal é usar o secret diretamente como bytes, com tamanho adequado para HS256 (ex.: 256 bits). Exemplo:

```java
private SecretKey getSigningKey() {
    byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
    if (keyBytes.length < 32) {
        keyBytes = Arrays.copyOf(keyBytes, 32);
    }
    return Keys.hmacShaKeyFor(keyBytes);
}
```

Ou, se o secret for armazenado em Base64, apenas `Decoders.BASE64.decode(jwtSecret)`.

**Produção**

- `jwt.secret` não deve ficar em `application.yml` versionado; usar variável de ambiente ou secret manager.
- Em produção, desabilitar `/h2-console/**` ou restringir por profile.

---

### 3.2 Consistência na validação de estoque

- **CartService**: usa `StockValidator` para adicionar/atualizar item.
- **OrderService.checkout**: valida estoque manualmente em loop.

Sugestão: usar o mesmo `StockValidator` no checkout para evitar duplicação e manter uma única regra de “estoque insuficiente”:

```java
// Em OrderService.checkout, antes de criar o pedido:
for (CartItem item : cartItems) {
    stockValidator.validateAvailableStock(item.getBook(), item.getQuantity());
}
```

---

### 3.3 Código HTTP para “não é seu recurso”

- `OwnershipValidator` lança `BadRequestException` (400) quando o recurso não pertence ao usuário.
- Semanticamente, “não autorizado a acessar este recurso” é mais próximo de **403 Forbidden**.

Sugestão: criar algo como `ForbiddenException` e mapear no `GlobalExceptionHandler` para `HttpStatus.FORBIDDEN`, e usar esse tipo no `OwnershipValidator`.

---

### 3.4 Exposição de detalhes em erros genéricos

No `GlobalExceptionHandler`:

```java
"An unexpected error occurred: " + ex.getMessage()
```

Em produção, expor `ex.getMessage()` pode vazar informações. Melhor usar uma mensagem genérica e registrar o stack trace apenas em log.

---

### 3.5 Paginação na API de livros

- `BookController.getAllBooks` retorna `Page<BookDTO>`.
- O README menciona “Improved paging DTOs (Spring Data Page serialization)” no roadmap.

`Page` do Spring Data funciona, mas expõe campos como `pageable`, `sort` etc. Um DTO de página (ex.: `PageResponse<BookDTO>` com `content`, `totalElements`, `totalPages`, `number`, `size`) deixa a API mais estável e clara para o cliente.

---

### 3.6 Rota de busca vs. path param

- `GET /api/books/search?keyword=...` e `GET /api/books/{id}` podem conflitar se um cliente enviar `GET /api/books/search` interpretado como `id=search`.
- O Spring normalmente resolve pela ordem das anotações; manter a rota mais específica (`/search`) antes da genérica `/{id}` (como já está) evita esse problema. Vale documentar na API (ex.: OpenAPI) para deixar explícito.

---

## 4. Resumo

| Dimensão | Avaliação |
|----------|-----------|
| Arquitetura em camadas | Clara: Controller → Service → Repository; DTOs e mappers bem posicionados. |
| Segurança | JWT e roles bem utilizados; ajustar geração da chave e não expor secret em produção. |
| Consistência | Reaproveitar `StockValidator` no checkout e padronizar HTTP (403 para ownership). |
| Manutenção | Validators e mappers facilitam evolução; tratamento de exceção e paginação podem ser refinados. |

O código está bem estruturado, alinhado ao descrito no README (Controllers, Services, Repositories, Mappers/Validators), e as sugestões acima são refinamentos para segurança, consistência e API mais estável.
