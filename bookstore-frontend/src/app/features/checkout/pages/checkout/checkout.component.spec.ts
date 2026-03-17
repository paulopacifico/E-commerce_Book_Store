import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';

import { CartStateService, type LocalCartItem } from '../../../cart/data-access/cart-state.service';
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
  let cartStateService: { cart$: BehaviorSubject<LocalCartItem[]>; clearCart: () => void };
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
    target.paymentForm.setValue({
      cardNumber: '4242424242424242',
      cardholderName: 'Ada Lovelace',
      expiry: '12/30',
      cvv: '123',
    });
  };

  beforeEach(async () => {
    cartItems$ = new BehaviorSubject<LocalCartItem[]>([cartItem]);
    createOrderMock = vi.fn();
    navigateMock = vi.fn();
    clearCartMock = vi.fn();
    cartStateService = {
      cart$: cartItems$,
      clearCart: clearCartMock as unknown as () => void,
    };

    await TestBed.configureTestingModule({
      declarations: [CheckoutComponent],
      imports: [CommonModule, ReactiveFormsModule, CartSubtotalPipe],
      providers: [
        { provide: CartStateService, useValue: cartStateService as Pick<CartStateService, 'cart$' | 'clearCart'> },
        { provide: OrderService, useValue: { createOrder: createOrderMock } as Pick<OrderService, 'createOrder'> },
        { provide: Router, useValue: { navigate: navigateMock } as Pick<Router, 'navigate'> },
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
      'Your cart is empty'
    );
  });

  it('submits a valid checkout payload and clears the cart on success', () => {
    const order: Order = {
      id: 42,
      items: [],
      totalAmount: 94.99,
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
    expect(clearCartMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(['/orders', 42]);
    expect(component.errorMessage()).toBeNull();
    expect(component.loading()).toBe(false);
  });

  it('does not submit when the forms are incomplete', () => {
    component.onSubmit();

    expect(createOrderMock).not.toHaveBeenCalled();
  });
});
