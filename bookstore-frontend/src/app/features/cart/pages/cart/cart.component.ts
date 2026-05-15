import {
  Component,
  inject,
  ChangeDetectionStrategy,
  computed,
  DestroyRef,
  OnInit,
  signal,
} from '@angular/core';
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
  readonly loading = signal(true);
  readonly syncError = signal<string | null>(null);
  readonly hasItems = computed(() => this.cartItems().length > 0);
  readonly cartTotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.bookPrice * item.quantity, 0),
  );

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading.set(true);
    this.syncError.set(null);
    this.cartFacade
      .refresh()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.syncError.set(
            'We could not confirm your cart with the server. Retry before changing quantities or checking out.',
          );
          this.notificationService.error('Unable to refresh your cart right now.');
        },
      });
  }

  get canEditCart(): boolean {
    return !this.loading() && !this.syncError();
  }

  updateQuantity(bookId: number, quantity: number): void {
    if (!this.canEditCart) return;
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
    if (!this.canEditCart) return;
    if (!confirm(`Remove "${item.bookTitle}" from your cart?`)) return;
    this.cartFacade
      .removeItem(item.bookId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => this.notificationService.error('Unable to remove this item right now.'),
      });
  }
}
