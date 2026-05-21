import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { NotificationService } from '../../../../core/services/notification.service';
import { CartFacadeService } from '../../../cart/data-access/cart-facade.service';
import type { LocalCartItem } from '../../../cart/data-access/cart-state.service';
import { OrderService } from '../../../orders/data-access/order.service';
import type { Order } from '../../../orders/models/order.interface';
import { CartSubtotalPipe } from '../../../../shared/pipes/cart-subtotal.pipe';
import { CheckoutComponent } from './checkout.component';

describe('CheckoutComponent', () => {
  let fixture: ComponentFixture<CheckoutComponent>;
  let component: CheckoutComponent;
  let createOrderMock: ReturnType<typeof vi.fn>;
  let navigateMock: ReturnType<typeof vi.fn>;
  let clearCartMock: ReturnType<typeof vi.fn>;
  let refreshMock: ReturnType<typeof vi.fn>;
  let progressMock: ReturnType<typeof vi.fn>;
  let dismissMock: ReturnType<typeof vi.fn>;
  let successMock: ReturnType<typeof vi.fn>;
  let warningMock: ReturnType<typeof vi.fn>;
  let cartFacade: {
    cart$: BehaviorSubject<LocalCartItem[]>;
    clearCart: () => ReturnType<typeof of>;
    refresh: () => ReturnType<typeof of>;
  };
  let cartItems$: BehaviorSubject<LocalCartItem[]>;

  const cartItem: LocalCartItem = {
    bookId: 1,
    bookTitle: 'Clean Architecture',
    bookAuthor: 'Robert C. Martin',
    bookPrice: 45,
    quantity: 2,
  };

  const fillValidForms = (target: CheckoutComponent): void => {
    target.shippingForm.setValue({
      fullName: 'Ada Lovelace',
      addressLine1: '123 Main St',
      addressLine2: '',
      city: 'Toronto',
      state: 'ON',
      postalCode: 'M5V 2T6',
      phone: '+1 416 555 1212',
    });
  };

  beforeEach(async () => {
    cartItems$ = new BehaviorSubject<LocalCartItem[]>([cartItem]);
    createOrderMock = vi.fn();
    navigateMock = vi.fn();
    clearCartMock = vi.fn().mockReturnValue(of(void 0));
    refreshMock = vi.fn().mockReturnValue(of([cartItem]));
    progressMock = vi.fn().mockReturnValue(501);
    dismissMock = vi.fn();
    successMock = vi.fn();
    warningMock = vi.fn();
    cartFacade = {
      cart$: cartItems$,
      clearCart: clearCartMock as unknown as () => ReturnType<typeof of>,
      refresh: refreshMock as unknown as () => ReturnType<typeof of>,
    };

    await TestBed.configureTestingModule({
      declarations: [CheckoutComponent],
      imports: [CommonModule, ReactiveFormsModule, CartSubtotalPipe],
      providers: [
        {
          provide: CartFacadeService,
          useValue: cartFacade as Pick<CartFacadeService, 'cart$' | 'clearCart' | 'refresh'>,
        },
        {
          provide: OrderService,
          useValue: { createOrder: createOrderMock } as Pick<OrderService, 'createOrder'>,
        },
        { provide: Router, useValue: { navigate: navigateMock } as Pick<Router, 'navigate'> },
        {
          provide: NotificationService,
          useValue: {
            progress: progressMock,
            dismiss: dismissMock,
            success: successMock,
            warning: warningMock,
          } as Pick<NotificationService, 'progress' | 'dismiss' | 'success' | 'warning'>,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the empty-cart state when there are no items', () => {
    cartItems$.next([]);
    fixture.detectChanges();

    expect(component.isCartEmpty()).toBe(true);
    expect(fixture.nativeElement.querySelector('.cart-empty-message')?.textContent).toContain(
      'Your cart is empty',
    );
  });

  it('shows a sync state while the checkout cart is being confirmed', () => {
    refreshMock.mockReturnValueOnce(of([cartItem]));
    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;

    expect(component.cartSyncLoading()).toBe(true);
  });

  it('keeps the checkout summary total aligned with the order total when shipping is included', () => {
    const summaryTotals = fixture.nativeElement.querySelector('.summary-totals') as HTMLElement;

    expect(component.cartTotal()).toBe(90);
    expect(component.finalTotal()).toBe(90);
    expect(summaryTotals.textContent).toContain('Shipping');
    expect(summaryTotals.textContent).toContain('Included');
    expect(summaryTotals.textContent).toContain('€90.00');
  });

  it('blocks submit and shows retry guidance when the initial cart sync fails', async () => {
    refreshMock.mockReturnValueOnce(throwError(() => new Error('refresh failed')));
    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    fillValidForms(component);

    expect(component.cartSyncLoading()).toBe(false);
    expect(component.cartSyncError()).toBe(
      'We could not confirm your cart with the server. Retry before placing the order.',
    );
    expect(component.canSubmit).toBe(false);
    expect(fixture.nativeElement.querySelector('.form-banner-error')?.textContent).toContain(
      'Retry before placing the order',
    );
  });

  it('retries the checkout cart sync and re-enables submit on success', () => {
    refreshMock
      .mockReturnValueOnce(throwError(() => new Error('refresh failed')))
      .mockReturnValueOnce(of([cartItem]));
    refreshMock.mockClear();
    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fillValidForms(component);

    component.loadCheckoutCart();

    expect(refreshMock.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(component.cartSyncError()).toBeNull();
    expect(component.cartSyncLoading()).toBe(false);
    expect(component.canSubmit).toBe(true);
  });

  it('submits a valid checkout payload and clears the cart on success', () => {
    const order: Order = {
      id: 42,
      items: [],
      totalAmount: 90,
      status: 'PLACED',
      shippingAddress: 'Ada Lovelace | 123 Main St | Toronto, ON, M5V 2T6 | +1 416 555 1212',
      createdAt: '2026-03-17T12:00:00Z',
    };
    createOrderMock.mockReturnValue(of(order));
    fillValidForms(component);

    component.onSubmit();

    expect(createOrderMock).toHaveBeenCalledWith({
      shippingAddress: 'Ada Lovelace | 123 Main St | Toronto, ON, M5V 2T6 | +1 416 555 1212',
    });
    expect(progressMock).toHaveBeenCalledWith(
      'Reviewing your cart and placing the order securely.',
      { title: 'Placing Order' },
    );
    expect(refreshMock).toHaveBeenCalledTimes(2);
    expect(successMock).toHaveBeenCalledWith(
      'Order placed successfully. Redirecting to the order detail.',
      { title: 'Order Confirmed' },
    );
    expect(dismissMock).toHaveBeenCalledWith(501);
    expect(clearCartMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(['/orders', 42]);
    expect(component.errorMessage()).toBeNull();
    expect(component.loading()).toBe(false);
  });

  it('keeps the successful checkout flow even when cart clearing fails afterwards', () => {
    const order: Order = {
      id: 77,
      items: [],
      totalAmount: 90,
      status: 'PLACED',
      shippingAddress: 'Ada Lovelace | 123 Main St | Toronto, ON, M5V 2T6 | +1 416 555 1212',
      createdAt: '2026-03-17T12:00:00Z',
    };
    createOrderMock.mockReturnValue(of(order));
    clearCartMock.mockReturnValue(throwError(() => new Error('clear failed')));
    fillValidForms(component);

    component.onSubmit();

    expect(createOrderMock).toHaveBeenCalledTimes(1);
    expect(clearCartMock).toHaveBeenCalledTimes(1);
    expect(warningMock).toHaveBeenCalledWith(
      'Your order was placed, but we could not confirm that the cart was cleared. Refresh the cart if items still appear.',
      { title: 'Cart Sync Warning' },
    );
    expect(successMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(['/orders', 77]);
    expect(component.errorMessage()).toBeNull();
  });

  it('does not place the order when the synchronized backend cart is empty', () => {
    refreshMock.mockReturnValue(of([] satisfies LocalCartItem[]));
    fillValidForms(component);

    component.onSubmit();

    expect(createOrderMock).not.toHaveBeenCalled();
    expect(clearCartMock).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe(
      'Your cart is empty on the server. Review the cart and try again.',
    );
    expect(component.loading()).toBe(false);
    expect(dismissMock).toHaveBeenCalledWith(501);
  });

  it('does not place the order when sync changes the cart contents', () => {
    refreshMock.mockReturnValue(
      of([
        {
          ...cartItem,
          quantity: 1,
        },
      ]),
    );
    fillValidForms(component);

    component.onSubmit();

    expect(createOrderMock).not.toHaveBeenCalled();
    expect(clearCartMock).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe(
      'Your cart was updated while syncing with the server. Review the latest cart and submit again.',
    );
    expect(component.loading()).toBe(false);
    expect(dismissMock).toHaveBeenCalledWith(501);
  });

  it('does not submit when the forms are incomplete', () => {
    component.onSubmit();

    expect(createOrderMock).not.toHaveBeenCalled();
  });
});
