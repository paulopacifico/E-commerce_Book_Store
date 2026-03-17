import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartStateService, type LocalCartItem } from '../../data-access/cart-state.service';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent {
  protected readonly cartState = inject(CartStateService);

  readonly cart$ = this.cartState.cart$;
  private readonly cartItems = toSignal(this.cartState.cart$, {
    initialValue: [] as LocalCartItem[],
  });
  readonly cartTotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.bookPrice * item.quantity, 0),
  );

  updateQuantity(bookId: number, quantity: number): void {
    this.cartState.updateQuantity(bookId, quantity);
  }

  increment(item: LocalCartItem): void {
    this.cartState.updateQuantity(item.bookId, item.quantity + 1);
  }

  decrement(item: LocalCartItem): void {
    if (item.quantity <= 1) return;
    this.cartState.updateQuantity(item.bookId, item.quantity - 1);
  }

  removeItem(item: LocalCartItem): void {
    if (!confirm(`Remove "${item.bookTitle}" from your cart?`)) return;
    this.cartState.removeItem(item.bookId);
  }
}
