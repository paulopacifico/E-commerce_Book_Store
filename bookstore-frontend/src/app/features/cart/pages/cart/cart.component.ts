import { Component, inject, ChangeDetectionStrategy, computed, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../../../core/services/notification.service';
import { CartFacadeService } from '../../data-access/cart-facade.service';
import type { LocalCartItem } from '../../data-access/cart-state.service';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent implements OnInit {
  protected readonly cartFacade = inject(CartFacadeService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly cart$ = this.cartFacade.cart$;
  private readonly cartItems = toSignal(this.cartFacade.cart$, {
    initialValue: [] as LocalCartItem[],
  });
  readonly cartTotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.bookPrice * item.quantity, 0),
  );

  ngOnInit(): void {
    this.cartFacade
      .refresh()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          this.notificationService.error('Unable to refresh your cart right now.');
        },
      });
  }

  updateQuantity(bookId: number, quantity: number): void {
    this.cartFacade
      .updateQuantity(bookId, quantity)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => this.notificationService.error('Unable to update your cart right now.'),
      });
  }

  increment(item: LocalCartItem): void {
    this.updateQuantity(item.bookId, item.quantity + 1);
  }

  decrement(item: LocalCartItem): void {
    if (item.quantity <= 1) return;
    this.updateQuantity(item.bookId, item.quantity - 1);
  }

  removeItem(item: LocalCartItem): void {
    if (!confirm(`Remove "${item.bookTitle}" from your cart?`)) return;
    this.cartFacade
      .removeItem(item.bookId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => this.notificationService.error('Unable to remove this item right now.'),
      });
  }
}
