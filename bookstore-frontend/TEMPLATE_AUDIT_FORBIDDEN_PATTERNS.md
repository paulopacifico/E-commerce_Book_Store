# Complete audit: forbidden template patterns (change detection loop)

## Summary of fixes applied

All instances below were **FIXED** by replacing method calls with pure properties, signals, pipes, or track-by-ID.

---

## 1. order-detail.component.html (OrderDetailComponent)

| Line | Problematic code | Type | Fix applied |
|------|------------------|------|-------------|
| 16–18, 22 | `[class.completed]="isStepCompleted(getStatusIndex(order.status), i)"`, `[class.current]="isStepCurrent(...)"`, `@if (isStepCompleted(...))` | Methods in [class] and @if | Use `(order.status \| statusIndex) > i` and `=== i` with StatusIndexPipe |
| 50 | `{{ getPaymentLastFour() }}` | Method in interpolation | Replaced with pure property `paymentLastFour` |
| 70 | `track trackByItemId($index, item)` | trackBy method | Replaced with `track item.id` |
| 78 | `{{ getItemSubtotal(item) \| currency }}` | Method in interpolation | Replaced with `item \| orderItemSubtotal \| currency` |
| 87 | `{{ getItemsSubtotal(order) \| currency }}` | Method in interpolation | Replaced with `order \| orderSubtotal \| currency` |
| 94–96 | `getShippingDisplay(order) === 'included'`, `{{ getShippingDisplay(order) \| currency }}` | Method in @if and interpolation | Replaced with `order \| shippingDisplay` pipe |

---

## 2. cart.component.html (CartComponent)

| Line | Problematic code | Type | Fix applied |
|------|------------------|------|-------------|
| 24, 76 | `track trackByBookId($index, item)` | trackBy method | Replaced with `track item.bookId` |
| 57 | `{{ getSubtotal(item) \| currency }}` | Method in interpolation | Replaced with `item \| cartSubtotal \| currency` |
| 110 | `{{ getSubtotal(item) \| currency }}` | Method in interpolation | Same pipe |
| 127 | `{{ getCartTotal() \| currency }}` | Method in interpolation | Replaced with `cartTotal()` signal (computed from cart items) |

---

## 3. checkout.component.html (CheckoutComponent)

| Line | Problematic code | Type | Fix applied |
|------|------------------|------|-------------|
| 124 | `track trackByBookId($index, item)` | trackBy method | Replaced with `track item.bookId` |
| 127 | `{{ getSubtotal(item) \| currency }}` | Method in interpolation | Replaced with `item \| cartSubtotal \| currency` |

**Note:** `cartItems()`, `cartTotal()`, `finalTotal()`, `isCartEmpty()` are **computed signals** – allowed.

---

## 4. order-list.component.html (OrderListComponent)

| Line | Problematic code | Type | Fix applied |
|------|------------------|------|-------------|
| 12 | `track trackById($index, order)` | trackBy method | Replaced with `track order.id` |

---

## 5. book-list.component.html (BookListComponent)

Already fixed earlier: `track book.id`, `onCategoryChange($event)` (no template method).

---

## 6. notification-container.component.html

Already fixed earlier: `iconMap[notification.type]`, `track notification.id`.

---

## Files checked – no forbidden patterns

- **book-card.component.html** – only `(click)="onAddToCart()"` (event handler).
- **header.component.html** – `mobileMenuOpen()`, `showNavLinks()`, `searchQuery()`, `userMenuOpen()` are **signals/computed** – allowed.
- **cart-icon.component.html** – `cartCount$ \| async` only.
- **login.component.html**, **register.component.html** – `loading()` is a signal; form getters (e.g. `username`) are Angular form API.
- **footer.component.html**, **app.component.html**, **pagination.component.html**, **confirmation-dialog.component.html** – no problematic patterns found.

---

## New shared pipes (pure, no state)

- `CartSubtotalPipe` – cart item subtotal (cart + checkout).
- `OrderItemSubtotalPipe` – order line subtotal.
- `OrderSubtotalPipe` – order items total.
- `ShippingDisplayPipe` – shipping amount or `'included'`.
- `StatusIndexPipe` – status string to stepper index.

All are standalone, pure, and exported from `SharedModule`.
