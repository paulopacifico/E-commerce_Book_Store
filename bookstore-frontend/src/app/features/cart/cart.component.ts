import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartStateService, type LocalCartItem } from '../../core/services/cart-state.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent {
  protected readonly cartState = inject(CartStateService);

  get cart$() {
    return this.cartState.cart$;
  }

  getCartTotal(): number {
    return this.cartState.getCartTotal();
  }

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

  getSubtotal(item: LocalCartItem): number {
    return item.bookPrice * item.quantity;
  }

  trackByBookId(_index: number, item: LocalCartItem): number {
    return item.bookId;
  }
}
