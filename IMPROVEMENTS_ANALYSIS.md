# Análise do Projeto — Boas Práticas e Engenharia de Software

Análise do backend E-commerce Book Store com foco em melhorias alinhadas a boas práticas e engenharia de software avançada. Complementa [ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md) e [PROJECT_ANALYSIS_REPORT.md](PROJECT_ANALYSIS_REPORT.md).

---

## 1. Pontos fortes (já adotados)

| Área | Prática |
|------|--------|
| **Arquitetura** | Camadas claras: Controller → Service → Repository; DTOs isolados da lógica de domínio |
| **Segurança** | JWT stateless, BCrypt, roles (USER/ADMIN), CORS e rate limit configuráveis |
| **Validação** | Bean Validation + validators de domínio (StockValidator, OwnershipValidator) reutilizados |
| **Erros** | GlobalExceptionHandler com envelope único (ApiErrorResponse); mensagem genérica em produção (isLocalProfile) |
| **Transações** | @Transactional em operações que alteram estado (cart, checkout) |
| **JPA** | FetchType.LAZY, open-in-view: false, BaseEntity com equals/hashCode seguro para proxies |
| **API** | PageResponse estável, OpenAPI/Swagger documentado |
| **DevOps** | Docker, CI (Maven), Postman, seed idempotente no perfil docker |

---

## 2. Melhorias recomendadas

### 2.1 Arquitetura e responsabilidades

**A) Lógica no Controller (CategoryController)**

Em `createCategory` e `updateCategory` o controller monta a entidade a partir do DTO:

```java
Category category = new Category();
category.setName(categoryDTO.getName());
category.setDescription(categoryDTO.getDescription());
Category created = categoryService.createCategory(category);
```

- **Problema:** Responsabilidade de “DTO → entidade” deveria estar no service ou em um mapper, mantendo o controller apenas com contrato HTTP.
- **Sugestão:** O `CategoryService` aceitar `CategoryDTO` (ou um record de entrada) e fazer a criação da entidade internamente; ou o `CategoryMapper` expor `toEntity(CategoryDTO)` e o controller chamar `categoryService.createCategory(categoryMapper.toEntity(dto))`.

**B) Consistência Book vs Category**

Em `BookController` o mapeamento DTO → entidade está no controller via `BookMapper.toEntity(bookDTO, category)`. Em Category o controller monta a entidade manualmente. Padronizar: um único ponto (service ou mapper) para “criar/atualizar entidade a partir de DTO”.

---

### 2.2 Performance e N+1

**A) CategoryMapper e bookCount**

`CategoryMapper.toDTO` usa `category.getBooks().size()`, o que inicializa a coleção lazy e pode gerar N+1 ao listar várias categorias.

- **Sugestão:** Incluir no `CategoryRepository` um método que retorne categorias com contagem em uma única query, por exemplo com `@Query("SELECT c, size(c.books) FROM Category c")` ou um DTO/projeção com `COUNT(b.id)`. O mapper passaria a receber esse valor (ou a entidade com contagem já resolvida) em vez de acessar `getBooks().size()`.

**B) Cart e Order: fetch de associações**

- `CartService.getCart`: para cada `CartItem` acessa `item.getBook().getPrice()` → uma query por item (N+1).
- `OrderMapper.toDTO`: para cada `OrderItem` acessa `orderItem.getBook()` → N+1 ao listar pedidos com itens.

**Sugestão:**

- Em `CartItemRepository`: método com `JOIN FETCH` para carregar `Book` ao buscar itens do usuário, por exemplo `@Query("SELECT ci FROM CartItem ci JOIN FETCH ci.book WHERE ci.user.id = :userId")`.
- Em `OrderRepository` (ou em um método usado pela API de listagem/detalhe): query que faça `JOIN FETCH orderItems` e `JOIN FETCH orderItems.book` para carregar pedido + itens + livro em 1–2 queries.

**C) Índices explícitos (PostgreSQL)**

Para produção, definir índices nas entidades (ou via migration) para consultas frequentes:

- `Book`: `category_id`, `isbn` (único já ajuda), eventualmente `(title, author)` para busca.
- `CartItem`: `(user_id, book_id)` para `findByUserIdAndBookId` e `deleteByUserId`.
- `Order`: `user_id`, `(user_id, created_at)` para listagem por usuário ordenada.

Exemplo em JPA (ou equivalente em Flyway/Liquibase):

```java
@Table(name = "cart_items", indexes = {
    @Index(name = "idx_cart_items_user_book", columnList = "user_id, book_id")
})
```

---

### 2.3 Segurança e observabilidade

**A) JwtTokenProvider: logging**

Uso de `System.err.println` em `validateToken` atrapalha controle de log e agregação.

- **Sugestão:** Usar `Logger` (ex.: SLF4J) e log em nível DEBUG ou WARN, sem expor detalhes do token.

**B) JWT secret em produção**

O secret está em `application.yml`. Em produção deve vir de variável de ambiente ou secret manager (ex.: `JWT_SECRET`), sem valor default forte no repositório.

**C) H2 console**

`/h2-console/**` está permitAll no `SecurityConfig`. Em produção (perfil não-local) deve ser desabilitado ou restrito (ex.: `requestMatchers("/h2-console/**").denyAll()` quando profile != local).

**D) Correlation ID / request tracing**

Para debugging e auditoria em produção, cada request pode ter um ID único (ex.: `X-Request-Id` ou MDC). Isso melhora rastreio em logs e em ferramentas de APM.

- **Sugestão:** Filtro ou interceptor que leia ou gere um request ID, coloque no MDC e opcionalmente no header de resposta.

---

### 2.4 Qualidade de código

**A) README: seção duplicada**

Há duas seções “Troubleshooting” e dois blocos idênticos (“Access documentation and endpoints via…”). Remover duplicata mantém uma única fonte de verdade.

**B) Tratamento de exceção no JWT**

Em `JwtTokenProvider.validateToken` as exceções são capturadas e apenas impressas; o método retorna `false`. Está correto do ponto de vista de fluxo, mas o uso de logger (em vez de `System.err`) e, se desejado, métricas de token inválido/expirado ajudam operação.

**C) OwnershipValidator e código HTTP**

O [ARCHITECTURE_REVIEW](ARCHITECTURE_REVIEW.md) já sugere 403 Forbidden para “recurso não pertence ao usuário”. O projeto já possui `ForbiddenException` e handler; garantir que todos os casos de “não é seu recurso” usem `ForbiddenException` (403) em vez de `BadRequestException` (400).

---

### 2.5 Testes

**A) Cobertura**

Há testes de controller (Auth, Ownership), security, services (Cart, Order), exception handler e validators. Pontos úteis para ampliar:

- **CategoryService** (create/update/delete e regras de nome duplicado).
- **BookService** (CRUD e busca), principalmente cenários que disparam `ResourceNotFoundException` e validações.
- **Integração de Order**: checkout com carrinho vazio, estoque insuficiente, e que o carrinho é limpo após sucesso.

**B) CI: etapa de testes**

O workflow atual usa `mvn clean install`, que já roda testes. Deixar explícito ajuda leitura do pipeline, por exemplo:

```yaml
- name: Run tests
  run: mvn test
- name: Build
  run: mvn package -DskipTests
```

ou manter `install` e documentar no README que os testes rodam no CI.

**C) Testes de contrato e resiliência**

- Asserções explícitas sobre o corpo de erro (ApiErrorResponse) em cenários de 400/401/403/404.
- Se houver cliente HTTP (ex.: em testes de integração), considerar um teste de contrato (ex.: Spring Cloud Contract ou asserção contra OpenAPI) para evitar quebra de API.

---

### 2.6 Configuração e operação

**A) Pool de conexões (Hikari)**

Em produção, configurar tamanho do pool (ex.: `spring.datasource.hikari.maximum-pool-size`, `minimum-idle`) conforme carga e limites do banco.

**B) Perfis**

- Manter `local` para desenvolvimento (H2, show-sql, debug).
- Perfil `docker` já usa PostgreSQL e seed idempotente.
- Um perfil `prod` ou `production` pode desabilitar H2 console, Swagger (ou restringir), e usar mensagem genérica de erro (já coberto por `isLocalProfile()`).

**C) Health e métricas**

O Actuator está no projeto; em produção, expor apenas endpoints necessários (ex.: `health`, `info`) e proteger ou desabilitar os sensíveis. Opcional: health do DB e, no futuro, métricas (Micrometer) para latência e taxa de erro.

---

### 2.7 API e documentação

**A) Versionamento da API**

O prefixo atual é `/api`. Para evolução futura, considerar `/api/v1` e um header ou path de versão, documentado no OpenAPI.

**B) OpenAPI estático**

Manter `docs/openapi.yaml` em sync com o código (ou gerar a partir do código no build) evita que a documentação e o comportamento da API divirjam.

**C) Paginação padrão**

Definir valores default e máximos para `page` e `size` (ex.: max 100) no controller ou em um `@ControllerAdvice` evita consultas pesadas por engano.

---

## 3. Priorização sugerida

| Prioridade | Item | Impacto | Esforço |
|------------|------|---------|---------|
| Alta | N+1 em cart/order (fetch join) | Performance em listagens | Baixo |
| Alta | CategoryMapper bookCount sem lazy load | Performance listagem categorias | Baixo |
| Alta | JwtTokenProvider: trocar System.err por Logger | Operação e consistência | Mínimo |
| Alta | H2 console restrito fora do perfil local | Segurança | Mínimo |
| Média | Lógica DTO→Category no service/mapper | Consistência e manutenção | Baixo |
| Média | Índices em CartItem, Order, Book | Performance em produção | Baixo |
| Média | Testes CategoryService e BookService | Confiabilidade | Médio |
| Média | Remover duplicata no README | Documentação | Mínimo |
| Baixa | Correlation ID / request ID | Observabilidade | Médio |
| Baixa | Pool Hikari e actuator em prod | Operação | Baixo |
| Baixa | Versionamento /api/v1 e limites de paginação | Evolução da API | Baixo |

---

## 4. Resumo

O projeto está bem estruturado, com separação de responsabilidades, segurança e tratamento de erros alinhados a boas práticas. As melhorias têm maior impacto em:

1. **Performance:** eliminar N+1 (cart, order, categorias) e adicionar índices.
2. **Segurança e operação:** logger no JWT, restringir H2 e configurar secret/pool em produção.
3. **Consistência:** DTO→entidade em um único lugar (service/mapper) e uso de 403 para ownership.
4. **Testes e documentação:** mais testes de serviços e README sem duplicatas.

Implementar primeiro os itens de prioridade alta e média traz ganho rápido com esforço contido.
