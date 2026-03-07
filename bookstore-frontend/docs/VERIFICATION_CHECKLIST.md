# Verification Checklist - Angular E-commerce

> Paths below are relative to `bookstore-frontend/src/app/`.

## ✅ Before Starting

- [ ] Node.js installed (v18+)
- [ ] Angular CLI installed (`npm install -g @angular/cli`)
- [ ] Backend running at `http://localhost:8080`
- [ ] Postman Collection tested and working
- [ ] Cursor installed and configured

---

## 📁 File Structure Created

### Core Module
- [ ] `core/services/auth.service.ts`
- [ ] `core/services/book.service.ts`
- [ ] `core/services/cart-state.service.ts`
- [ ] `core/services/order.service.ts`
- [ ] `core/services/notification.service.ts`
- [ ] `core/guards/auth.guard.ts`
- [ ] `core/interceptors/jwt.interceptor.ts`
- [ ] `core/interceptors/error.interceptor.ts`
- [ ] `core/models/user.interface.ts`
- [ ] `core/models/book.interface.ts`
- [ ] `core/models/cart.interface.ts`
- [ ] `core/models/order.interface.ts`

### Shared Module
- [ ] `shared/components/book-card/book-card.component.ts`
- [ ] `shared/components/loading-spinner/loading-spinner.component.ts`
- [ ] `shared/components/confirmation-dialog/confirmation-dialog.component.ts`
- [ ] `shared/components/pagination/pagination.component.ts`

### Features
- [ ] `features/auth/login/login.component.ts`
- [ ] `features/auth/register/register.component.ts`
- [ ] `features/books/book-list/book-list.component.ts`
- [ ] `features/books/book-detail/book-detail.component.ts`
- [ ] `features/cart/cart.component.ts`
- [ ] `features/orders/order-list/order-list.component.ts`
- [ ] `features/orders/order-detail/order-detail.component.ts`
- [ ] `features/checkout/checkout.component.ts`

### Layout
- [ ] `layout/header/header.component.ts`
- [ ] `layout/footer/footer.component.ts`
- [ ] `layout/cart-icon/cart-icon.component.ts`

---

## 🔍 Code Quality Checklist

### For each Service created
- [ ] Uses `@Injectable({ providedIn: 'root' })`
- [ ] Methods return typed `Observable<T>`
- [ ] Implements error handling with `catchError`
- [ ] Uses `private readonly` for apiUrl
- [ ] No subscribe inside service

### For each Component created
- [ ] Uses `ChangeDetectionStrategy.OnPush` (when possible)
- [ ] Implements `OnInit` if necessary
- [ ] Implements `OnDestroy` if using subscriptions
- [ ] Uses `async pipe` instead of subscribe (preferred)
- [ ] Has types for all properties
- [ ] No `any` without justification
- [ ] Template uses `trackBy` in `*ngFor` with arrays

### For each Form created
- [ ] Uses `ReactiveFormsModule`
- [ ] Validations implemented
- [ ] Error messages displayed
- [ ] Submit button disabled when invalid
- [ ] Loading state during submit
- [ ] Visual feedback for success/error

---

## 🎨 UI/UX Checklist

- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states on all requests
- [ ] User-friendly error messages
- [ ] Visual feedback for actions (toast/snackbar)
- [ ] Confirmation before destructive actions (remove from cart)
- [ ] Intuitive navigation (breadcrumbs, back button)
- [ ] Basic accessibility (ARIA labels)
- [ ] Proper color contrast

---

## 🔐 Security Checklist

- [ ] JWT stored securely (localStorage)
- [ ] Token added to all authenticated requests
- [ ] Protected routes with AuthGuard
- [ ] Redirect to login when not authenticated
- [ ] Logout clears token and redirects
- [ ] Interceptor handles 401/403 globally
- [ ] Passwords never logged to console
- [ ] Separate environment variables (dev/prod)

---

## ⚡ Performance Checklist

- [ ] Lazy loading implemented in modules
- [ ] OnPush change detection where possible
- [ ] Async pipe instead of subscribe
- [ ] TrackBy functions in *ngFor
- [ ] Debounce on searches (300ms)
- [ ] ShareReplay on shared Observables
- [ ] No memory leaks (unsubscribe/takeUntil)
- [ ] Optimized images (lazy loading, webp)

---

## 🧪 Testing Checklist (Optional for MVP)

- [ ] AuthService tested
- [ ] BookService tested
- [ ] CartStateService tested
- [ ] AuthGuard tested
- [ ] JWT Interceptor tested
- [ ] Critical components tested (Login, Checkout)

---

## 📦 Build and Deploy Checklist

- [ ] `ng build --configuration production` without errors
- [ ] No console.log in production
- [ ] environment.prod.ts configured correctly
- [ ] Optimized bundle size (<2MB initial)
- [ ] Gzip compression enabled
- [ ] CORS configured in backend
- [ ] Global error handling implemented

---

## 🐛 Debug Checklist

### If API doesn't respond:
- [ ] Is backend running?
- [ ] Is API URL correct in environment?
- [ ] Is CORS configured in backend?
- [ ] Is JWT token being sent?

### If component doesn't update:
- [ ] Using async pipe?
- [ ] ChangeDetectorRef.markForCheck() called if using OnPush?
- [ ] Is Observable emitting values?

### If route doesn't work:
- [ ] Route defined in routing module?
- [ ] AuthGuard configured correctly?
- [ ] Module imported in app.module?
- [ ] Lazy loading configured correctly?

---

## 📊 Quality Metrics

### Code Coverage (if implementing tests)
- [ ] Services: >80%
- [ ] Guards/Interceptors: >90%
- [ ] Components: >60%

### Bundle Size Targets
- [ ] Initial Bundle: <500KB (gzipped)
- [ ] Lazy Chunks: <200KB each (gzipped)
- [ ] Total: <2MB (gzipped)

### Performance (Lighthouse)
- [ ] Performance: >90
- [ ] Accessibility: >90
- [ ] Best Practices: >90
- [ ] SEO: >80

---

## 🔄 Git Workflow

### Branches
- [ ] `main` - stable production
- [ ] `develop` - active development
- [ ] `feature/feature-name` - individual features

### Commits
- [ ] Descriptive messages
- [ ] Convention: `feat:`, `fix:`, `refactor:`, `style:`
- [ ] Small, focused commits
- [ ] No commented code
- [ ] No console.log

### Pull Requests
- [ ] Descriptive title
- [ ] Description of what was implemented
- [ ] Screenshots if visual changes
- [ ] Build passing
- [ ] Code review before merge

---

## 📚 Documentation

- [ ] README.md with setup instructions
- [ ] Comments in complex code
- [ ] JSDoc on public services
- [ ] Changelog maintained
- [ ] API endpoints documented
- [ ] Environment variables documented

---

## 🎯 Milestone Checklist

### MVP (Minimum Viable Product)
- [ ] Login/Register working
- [ ] Book listing with search
- [ ] Add to cart
- [ ] Simple checkout
- [ ] Order history
- [ ] Deploy to test environment

### V1.0
- [ ] All MVP features
- [ ] Unit tests implemented
- [ ] Performance optimized
- [ ] UI/UX polished
- [ ] Complete documentation
- [ ] Production deployment

### Future Features (Backlog)
- [ ] Wishlist (favorites)
- [ ] Book reviews
- [ ] Personalized recommendations
- [ ] Discount coupons
- [ ] Points/loyalty system
- [ ] Real payment integration
- [ ] Delivery tracking
- [ ] Support chat

---

## 🚀 Pre-Launch Checklist

- [ ] All endpoints tested with Postman
- [ ] All flows tested manually
- [ ] Performance tested (Lighthouse)
- [ ] Accessibility tested
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Mobile tested (iOS, Android)
- [ ] Basic SEO implemented
- [ ] Analytics configured (GA4)
- [ ] Error tracking configured (Sentry)
- [ ] Backup strategy defined
- [ ] Rollback plan prepared

---

## 📞 Troubleshooting Guide

### Problem: "NullInjectorError"
**Solution**: Service is not in `providedIn: 'root'` or module was not imported

### Problem: "Cannot read property of undefined"
**Solution**: Use optional chaining (`?.`) or check with `*ngIf`

### Problem: "CORS error"
**Solution**: Configure CORS in Spring Boot backend

### Problem: "404 on page refresh"
**Solution**: Configure fallback to index.html on server

### Problem: "Memory leak detected"
**Solution**: Use `takeUntil` or `async pipe` to unsubscribe

### Problem: "Change detection not working"
**Solution**: Remove `OnPush` or call `markForCheck()`

---

**Last updated**: 2026-03-07
**Version**: 1.0
