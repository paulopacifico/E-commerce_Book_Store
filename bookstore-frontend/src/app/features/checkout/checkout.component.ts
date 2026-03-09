import {
  Component,
  inject,
  ChangeDetectionStrategy,
  DestroyRef,
  computed,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { CartStateService, type LocalCartItem } from '../../core/services/cart-state.service';
import { OrderService } from '../../core/services/order.service';

const SHIPPING_COST = 4.99;

const PHONE_PATTERN = /^[\d\s\-+()]{10,20}$/;
const CARD_NUMBER_PATTERN = /^\d{16}$/;
const EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CVV_PATTERN = /^\d{3}$/;

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent {
  private readonly fb = inject(FormBuilder);
  private readonly cartState = inject(CartStateService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly cart$ = this.cartState.cart$;
  protected readonly cartItems = toSignal(this.cartState.cart$, { initialValue: [] as LocalCartItem[] });
  readonly cartTotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.bookPrice * item.quantity, 0)
  );
  readonly finalTotal = computed(() => this.cartTotal() + SHIPPING_COST);
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

  readonly paymentForm = this.fb.nonNullable.group({
    cardNumber: ['', [Validators.required, Validators.pattern(CARD_NUMBER_PATTERN)]],
    cardholderName: ['', [Validators.required, Validators.minLength(2)]],
    expiry: ['', [Validators.required, Validators.pattern(EXPIRY_PATTERN)]],
    cvv: ['', [Validators.required, Validators.pattern(CVV_PATTERN)]],
  });

  readonly shippingCost = SHIPPING_COST;

  get canSubmit(): boolean {
    return (
      !this.loading() &&
      this.shippingForm.valid &&
      this.paymentForm.valid &&
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
  get cardNumber() {
    return this.paymentForm.get('cardNumber');
  }
  get cardholderName() {
    return this.paymentForm.get('cardholderName');
  }
  get expiry() {
    return this.paymentForm.get('expiry');
  }
  get cvv() {
    return this.paymentForm.get('cvv');
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

  onSubmit(): void {
    this.errorMessage.set(null);
    if (!this.canSubmit) return;
    if (this.isCartEmpty()) return;

    this.loading.set(true);
    const shippingAddress = this.buildShippingAddress();

    this.orderService
      .createOrder({ shippingAddress })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (order) => {
          this.cartState.clearCart();
          this.router.navigate(['/orders', order.id]);
        },
        error: (err) => {
          const msg =
            err?.error?.message ??
            err?.message ??
            'Unable to place order. Please try again.';
          this.errorMessage.set(msg);
        },
      });
  }
}