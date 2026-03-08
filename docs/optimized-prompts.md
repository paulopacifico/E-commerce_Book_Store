# Optimized Prompts for Cursor - E-commerce Bookstore

## 🚀 Phase 1: Setup and Initial Configuration

### 1.1 Base Structure
```
Create Angular directory structure for a book e-commerce with:
- core/ (guards, interceptors, services, models)
- shared/ (components, pipes, directives)
- features/ (auth, books, cart, orders, categories)
- layout/ (header, footer, sidebar)

Generate only folder structure, no files yet.
```

### 1.2 Environment Configuration
```
Create environment.ts and environment.prod.ts files with:
- apiUrl: 'http://localhost:8080/api'
- production: false/true
- HTTP timeout and retry configurations
```

### 1.3 Models and Interfaces
```
Create TypeScript interfaces for:
1. User (id, username, email, role)
2. Book (id, title, author, isbn, price, stock, category)
3. Category (id, name, description)
4. CartItem (bookId, quantity, price)
5. Order (id, userId, items, total, status, createdAt)

Based on the Spring Boot backend API.
```

---

## 🔐 Phase 2: Authentication

### 2.1 Auth Service
```
Create an AuthService that:
- Makes login POST /auth/login (username, password) returns JWT
- Makes register POST /auth/register (username, email, password)
- Stores token in localStorage
- Provides isAuthenticated() method that checks token
- Provides logout() method that clears token
- Returns typed Observables
- Uses Angular HttpClient
```

### 2.2 JWT Interceptor
```
Create a JwtInterceptor that:
- Implements HttpInterceptor
- Adds Authorization: Bearer {token} header to all requests
- Gets token from localStorage
- Ignores /auth/login and /auth/register requests
```

### 2.3 Auth Guard
```
Create an AuthGuard that:
- Implements CanActivate
- Checks if user is authenticated
- Redirects to /login if not authenticated
- Allows route access if authenticated
```

### 2.4 Login Component
```
Create a login component with:
- Reactive FormGroup with validation
- Fields: username (required, minLength 3), password (required, minLength 6)
- Submit button disabled if form invalid
- Loading state during request
- Validation error display
- Redirect after successful login
- Link to register page
```

---

## 📚 Phase 3: Books (Listing and Details)

### 3.1 Book Service
```
Create a BookService with methods:
- getBooks(page?, size?, sort?): Observable<PageResponse<Book>>
- getBookById(id): Observable<Book>
- searchBooks(query, category?): Observable<Book[]>
- Base endpoint: ${environment.apiUrl}/books
- Error handling with catchError
- Automatic retry on network failure
```

### 3.2 Book List Component
```
Create a book listing component that:
- Lists books using async pipe
- Implements pagination (10 books per page)
- Has category filter (dropdown)
- Has title/author search (input + 300ms debounce)
- Displays loading spinner during loading
- Each book shows: image, title, author, price, "Add to Cart" button
- Uses OnPush change detection
- Uses trackBy for optimization
```

### 3.3 Book Detail Component
```
Create a book detail component that:
- Receives book ID from route (/books/:id)
- Loads book data via BookService
- Displays: large image, title, author, ISBN, description, price, available stock
- "Add to Cart" button with selectable quantity
- "Back" button to listing
- Loading state and error handling
```

### 3.4 Book Card Shared Component
```
Create a reusable BookCardComponent that:
- Receives @Input() book: Book
- Receives @Output() addToCart: EventEmitter
- Displays: image, title (limited to 2 lines), author, formatted price
- "Out of Stock" badge if stock === 0
- Add to cart button
- Hover effect with elevation
- Responsive (grid/flex)
```

---

## 🛒 Phase 4: Shopping Cart

### 4.1 Cart State Service
```
Create a CartStateService that:
- Uses BehaviorSubject<CartItem[]> for cart state
- Exposes cart$ Observable
- Methods: addItem, removeItem, updateQuantity, clearCart
- Automatically calculates total
- Persists cart to localStorage
- Loads cart from localStorage on init
```

### 4.2 Cart Service (API)
```
Create a CartService for API integration:
- addToCart(bookId, quantity): Observable<Cart>
- getCart(): Observable<Cart>
- updateItem(itemId, quantity): Observable<Cart>
- removeItem(itemId): Observable<void>
- checkout(): Observable<Order>
- Endpoint: ${environment.apiUrl}/cart
```

### 4.3 Cart Component
```
Create a cart component that:
- Lists all cart items
- Allows quantity change (+/- buttons)
- Allows item removal (X button with confirmation)
- Displays subtotal per item and grand total
- "Continue Shopping" button returns to /books
- "Checkout" button goes to /checkout
- If cart empty, displays message and button to /books
- Uses async pipe for cart$
```

### 4.4 Cart Icon Component (Header)
```
Create a cart icon component that:
- Shows cart icon in header
- Badge with item count
- Automatically updates when cart changes
- Click navigates to /cart
- Uses async pipe
```

---

## 📦 Phase 5: Checkout and Orders

### 5.1 Order Service
```
Create an OrderService with:
- checkout(cartItems): Observable<Order>
- getOrders(): Observable<Order[]>
- getOrderById(id): Observable<Order>
- Endpoint: ${environment.apiUrl}/orders
```

### 5.2 Checkout Component
```
Create a checkout component that:
- Displays cart items summary (readonly)
- Reactive form for shipping address
- Reactive form for payment data (simulated)
- All fields validation
- Shipping calculation (simulated)
- Final total (items + shipping)
- "Confirm Order" button calls OrderService.checkout()
- Redirect to /orders/:id after success
- Loading state during processing
```

### 5.3 Order List Component
```
Create an order history component that:
- Lists all user orders
- Sorts by date (most recent first)
- Displays: order number, date, status, total
- Link to each order details
- Status filter (Pending, Processing, Shipped, Delivered)
- Pagination if needed
```

### 5.4 Order Detail Component
```
Create an order detail component that:
- Receives ID from route (/orders/:id)
- Displays complete info: number, date, status, address
- Lists all order items
- Displays subtotal, shipping, total
- Invoice download button (simulated)
- Order status timeline
```

---

## 🏗️ Phase 6: Layout and Navigation

### 6.1 Header Component
```
Create a header component that:
- Store logo (clickable, goes to /)
- Global search bar (navigates to /books?search=...)
- Links: Home, Books, Categories
- Cart icon with badge
- If authenticated: dropdown with My Orders, Logout
- If not authenticated: Login, Register buttons
- Responsive (hamburger menu on mobile)
```

### 6.2 Footer Component
```
Create a footer component with:
- Store information
- Useful links (About, Contact, FAQ)
- Social media
- Copyright
- Sticky to bottom of page
```

### 6.3 App Routing
```
Configure app-routing.module.ts with:
- / → redirect to /books
- /login → LoginComponent
- /register → RegisterComponent
- /books → BookListComponent (lazy loaded)
- /books/:id → BookDetailComponent (lazy loaded)
- /cart → CartComponent (protected by AuthGuard)
- /checkout → CheckoutComponent (protected by AuthGuard)
- /orders → OrderListComponent (protected by AuthGuard)
- /orders/:id → OrderDetailComponent (protected by AuthGuard)
- /** → NotFoundComponent
```

---

## 🎨 Phase 7: UI/UX Enhancements

### 7.1 Loading Spinner Shared Component
```
Create a loading spinner component that:
- Receives @Input() size: 'small' | 'medium' | 'large'
- Receives @Input() overlay: boolean (fullscreen overlay)
- Smooth rotation animation
- Centered
```

### 7.2 Notification Service (Toast)
```
Create a NotificationService that:
- Displays success, error, warning, info messages
- Methods: success(message), error(message), warning(message), info(message)
- Auto-dismiss after 3 seconds
- Position: top-right
- Maximum 3 visible notifications simultaneously
- Uses BehaviorSubject for state
```

### 7.3 Confirmation Dialog Component
```
Create a confirmation dialog component that:
- Receives title and message
- Buttons: Confirm (primary), Cancel (secondary)
- Returns Observable<boolean>
- Dark overlay with backdrop
- Entry/exit animation
- Accessible (ESC closes, focus on first button)
```

### 7.4 Error Interceptor
```
Create an ErrorInterceptor that:
- Catches HTTP errors globally
- 401: redirects to /login and clears token
- 403: displays "Access denied" notification
- 404: displays "Resource not found" notification
- 500: displays "Server error" notification
- Others: displays generic error message
```

---

## ⚡ Phase 8: Optimizations

### 8.1 Lazy Loading Modules
```
Convert features to lazy loaded modules:
- BooksModule
- CartModule
- OrdersModule
- AuthModule

Each module with its own routing.
```

### 8.2 OnPush Change Detection
```
Add ChangeDetectionStrategy.OnPush to:
- BookCardComponent
- BookListComponent
- CartComponent
- OrderListComponent
```

### 8.3 RxJS Optimizations
```
Review all components to:
- Use async pipe instead of subscribe
- Use takeUntil for automatic unsubscribe
- Add shareReplay on shared Observables
- Use switchMap instead of nested subscribe
```

---

## 📝 Prompts for Review and Refactoring

### Code Review
```
Review [FileName] and suggest improvements for:
1. Type safety (eliminate any)
2. Performance (OnPush, trackBy, async pipe)
3. RxJS best practices
4. Accessibility
5. Responsiveness
```

### Component Refactoring
```
Refactor [ComponentName] to:
- Extract logic to service
- Use async pipe instead of subscribe
- Implement OnPush change detection
- Add error handling
- Improve responsiveness
```

### Integration Test
```
Create a basic unit test for [ServiceName] that verifies:
- Correct HTTP calls
- Error handling
- Data transformation
- Use HttpClientTestingModule mocks
```

---

## 💡 Useful Commands During Development

```bash
# Generate component
ng generate component features/books/book-list --skip-tests

# Generate service
ng generate service core/services/auth --skip-tests

# Generate guard
ng generate guard core/guards/auth --implements CanActivate

# Generate interceptor
ng generate interceptor core/interceptors/jwt

# Generate module with routing
ng generate module features/books --routing

# Run development
ng serve --open

# Production build
ng build --configuration production

# Check bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

---

## 🎯 Cursor Usage Strategy

### 1️⃣ Start with Structure
Use structure prompts first (folders, interfaces, configurations).

### 2️⃣ Develop by Layers
- First: Models and Services
- Second: Basic Components
- Third: Integration and State
- Fourth: UI/UX and polish

### 3️⃣ Reuse Patterns
After creating first CRUD (Books), use:
```
Create CategoryService using the same pattern as BookService
```

### 4️⃣ Incremental Iteration
Don't ask for everything at once. Example:
```
1. "Create basic BookListComponent structure"
2. "Add pagination to BookListComponent"
3. "Add search with debounce to BookListComponent"
```

### 5️⃣ Constant Validation
Every 2-3 components created:
```
Review the last files created and check consistency with established pattern
```

---

**Final Tip**: Keep this file open during development. Copy prompts as you progress through phases. Adapt as needed for your specific case.
