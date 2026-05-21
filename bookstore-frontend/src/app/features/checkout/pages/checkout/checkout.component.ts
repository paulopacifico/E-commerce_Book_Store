import {
  Component,
  inject,
  ChangeDetectionStrategy,
  DestroyRef,
  computed,
  signal,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { CartFacadeService } from '../../../cart/data-access/cart-facade.service';
import type { LocalCartItem } from '../../../cart/data-access/cart-state.service';
import { OrderService } from '../../../orders/data-access/order.service';
import { NotificationService } from '../../../../core/services/notification.service';

const PHONE_PATTERN = /^[\d\s\-+()]{10,20}$/;

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cartFacade = inject(CartFacadeService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);

  readonly loading = signal(false);
  readonly cartSyncLoading = signal(true);
  readonly cartSyncError = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly cart$ = this.cartFacade.cart$;
  protected readonly cartItems = toSignal(this.cartFacade.cart$, {
    initialValue: [] as LocalCartItem[],
  });
  readonly totalUnits = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0),
  );
  readonly cartTotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.bookPrice * item.quantity, 0),
  );
  readonly finalTotal = this.cartTotal;
  readonly isCartEmpty = computed(() => this.cartItems().length === 0);

  readonly shippingForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    addressLine1: ['', [Validators.required, Validators.minLength(3)]],
    addressLine2: [''],
    city: ['', [Validators.required, Validators.minLength(2)]],
    state: ['', [Validators.required, Validators.minLength(2)]],
    postalCode: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
  });

  ngOnInit(): void {
    this.loadCheckoutCart();
  }

  loadCheckoutCart(): void {
    this.cartSyncLoading.set(true);
    this.cartSyncError.set(null);
    this.cartFacade
      .refresh()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cartSyncLoading.set(false);
        },
        error: () => {
          this.cartSyncLoading.set(false);
          this.cartSyncError.set(
            'We could not confirm your cart with the server. Retry before placing the order.',
          );
          this.errorMessage.set('Unable to refresh your cart right now. Please try again.');
        },
      });
  }

  get canSubmit(): boolean {
    return (
      !this.loading() &&
      !this.cartSyncLoading() &&
      !this.cartSyncError() &&
      this.shippingForm.valid &&
      !this.isCartEmpty()
    );
  }

  get fullName() {
    return this.shippingForm.get('fullName');
  }
  get addressLine1() {
    return this.shippingForm.get('addressLine1');
  }
  get city() {
    return this.shippingForm.get('city');
  }
  get state() {
    return this.shippingForm.get('state');
  }
  get postalCode() {
    return this.shippingForm.get('postalCode');
  }
  get phone() {
    return this.shippingForm.get('phone');
  }

  /** Build single shipping address string for API (backend expects one field). */
  private buildShippingAddress(): string {
    const v = this.shippingForm.getRawValue();
    const parts = [
      v.fullName,
      v.addressLine1,
      v.addressLine2?.trim() || '',
      [v.city, v.state, v.postalCode].filter(Boolean).join(', '),
      v.phone,
    ].filter(Boolean);
    return parts.join(' | ');
  }

  private hasSameCart(expected: LocalCartItem[], actual: LocalCartItem[]): boolean {
    if (expected.length !== actual.length) {
      return false;
    }

    const toSignature = (items: LocalCartItem[]) =>
      items
        .map((item) => `${item.bookId}:${item.quantity}:${item.bookPrice}`)
        .sort()
        .join('|');

    return toSignature(expected) === toSignature(actual);
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    if (!this.canSubmit) return;
    if (this.isCartEmpty()) return;

    this.loading.set(true);
    const shippingAddress = this.buildShippingAddress();
    const cartBeforeSync = this.cartItems();
    const progressId = this.notificationService.progress(
      'Reviewing your cart and placing the order securely.',
      { title: 'Placing Order' },
    );

    this.cartFacade
      .refresh()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((syncedCart) => {
          if (syncedCart.length === 0) {
            this.errorMessage.set(
              'Your cart is empty on the server. Review the cart and try again.',
            );
            return EMPTY;
          }

          if (!this.hasSameCart(cartBeforeSync, syncedCart)) {
            this.errorMessage.set(
              'Your cart was updated while syncing with the server. Review the latest cart and submit again.',
            );
            return EMPTY;
          }

          return this.orderService.createOrder({ shippingAddress });
        }),
        switchMap((order) =>
          this.cartFacade.clearCart().pipe(
            map(() => order),
            catchError(() => {
              this.notificationService.warning(
                'Your order was placed, but we could not confirm that the cart was cleared. Refresh the cart if items still appear.',
                { title: 'Cart Sync Warning' },
              );
              return of(order);
            }),
          ),
        ),
        finalize(() => {
          this.loading.set(false);
          this.notificationService.dismiss(progressId);
        }),
      )
      .subscribe({
        next: (order) => {
          this.notificationService.success(
            'Order placed successfully. Redirecting to the order detail.',
            {
              title: 'Order Confirmed',
            },
          );
          this.router.navigate(['/orders', order.id]);
        },
        error: (err) => {
          const msg =
            err?.error?.message ?? err?.message ?? 'Unable to place order. Please try again.';
          this.errorMessage.set(msg);
        },
      });
  }
}
