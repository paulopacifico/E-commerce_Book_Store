import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { vi } from 'vitest';

import type { Book } from '../../books/models/book.interface';
import { AuthService } from '../../auth/data-access/auth.service';
import type { CartItem, CartResponse } from '../models/cart.interface';
import { CartService } from './cart.service';
import { CartFacadeService } from './cart-facade.service';
import { CartStateService } from './cart-state.service';

describe('CartFacadeService', () => {
  const guestStorageKey = 'bookstore_cart:guest';
  let token$: BehaviorSubject<string | null>;
  let sessionEvents$: Subject<{ type: 'authenticated'; replacedSession: boolean } | { type: 'cleared' }>;
  let isAuthenticatedMock: ReturnType<typeof vi.fn>;
  let getCartStorageScopeMock: ReturnType<typeof vi.fn>;
  let getCartMock: ReturnType<typeof vi.fn>;
  let addToCartMock: ReturnType<typeof vi.fn>;
  let updateCartItemMock: ReturnType<typeof vi.fn>;
  let removeCartItemMock: ReturnType<typeof vi.fn>;
  let clearCartMock: ReturnType<typeof vi.fn>;

  const book: Book = {
    id: 7,
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    price: 54.9,
    stockQuantity: 12,
  };

  const cartResponse: CartResponse = {
    items: [
      {
        id: 33,
        bookId: 7,
        bookTitle: 'Domain-Driven Design',
        bookAuthor: 'Eric Evans',
        bookPrice: 54.9,
        quantity: 2,
        subtotal: 109.8,
      },
    ],
    totalItems: 2,
    totalAmount: 109.8,
  };

  const setup = (): { facade: CartFacadeService; state: CartStateService } => {
    TestBed.configureTestingModule({
      providers: [
        CartFacadeService,
        CartStateService,
        {
          provide: AuthService,
          useValue: {
            token$,
            sessionEvents$,
            isAuthenticated: isAuthenticatedMock,
            getCartStorageScope: getCartStorageScopeMock,
          } as Pick<
            AuthService,
            'token$' | 'sessionEvents$' | 'isAuthenticated' | 'getCartStorageScope'
          >,
        },
        {
          provide: CartService,
          useValue: {
            getCart: getCartMock,
            addToCart: addToCartMock,
            updateCartItem: updateCartItemMock,
            removeCartItem: removeCartItemMock,
            clearCart: clearCartMock,
          } as Pick<
            CartService,
            'getCart' | 'addToCart' | 'updateCartItem' | 'removeCartItem' | 'clearCart'
          >,
        },
      ],
    });

    return {
      facade: TestBed.inject(CartFacadeService),
      state: TestBed.inject(CartStateService),
    };
  };

  beforeEach(() => {
    localStorage.clear();
    token$ = new BehaviorSubject<string | null>(null);
    sessionEvents$ = new Subject();
    isAuthenticatedMock = vi.fn().mockReturnValue(false);
    getCartStorageScopeMock = vi.fn().mockReturnValue('user:reader%40example.com');
    getCartMock = vi.fn().mockReturnValue(of({ items: [], totalItems: 0, totalAmount: 0 }));
    addToCartMock = vi.fn().mockReturnValue(of(cartResponse.items[0] as CartItem));
    updateCartItemMock = vi.fn().mockReturnValue(of(cartResponse.items[0] as CartItem));
    removeCartItemMock = vi.fn().mockReturnValue(of(void 0));
    clearCartMock = vi.fn().mockReturnValue(of(void 0));
  });

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('adds items locally for guests without touching the backend cart', () => {
    const { facade, state } = setup();

    facade.addItem(book, 1).subscribe();

    expect(addToCartMock).not.toHaveBeenCalled();
    expect(state.getCartItemCount()).toBe(1);
    expect(state.getItemsSnapshot()[0]).toMatchObject({
      bookId: 7,
      quantity: 1,
    });
  });

  it('hydrates local state from the backend when a token is present', () => {
    token$ = new BehaviorSubject<string | null>('token-123');
    isAuthenticatedMock = vi.fn().mockReturnValue(true);
    getCartMock = vi.fn().mockReturnValue(of(cartResponse));

    const { state } = setup();

    expect(getCartMock).toHaveBeenCalledTimes(1);
    expect(state.getStorageScope()).toBe('user:reader%40example.com');
    expect(state.getItemsSnapshot()[0]).toMatchObject({
      serverCartItemId: 33,
      bookId: 7,
      quantity: 2,
    });
  });

  it('routes authenticated add-to-cart through the backend and stores the server item id', () => {
    token$ = new BehaviorSubject<string | null>('token-123');
    isAuthenticatedMock = vi.fn().mockReturnValue(true);

    const { facade, state } = setup();

    facade.addItem(book, 2).subscribe();

    expect(addToCartMock).toHaveBeenCalledWith(7, 2);
    expect(state.getItemsSnapshot().at(-1)).toMatchObject({
      serverCartItemId: 33,
      bookId: 7,
      quantity: 2,
    });
  });

  it('merges guest cart items into the backend when syncAfterAuthentication runs', () => {
    getCartMock = vi.fn().mockReturnValue(of(cartResponse));
    const { facade, state } = setup();

    state.addItem(book, 1);
    isAuthenticatedMock.mockReturnValue(true);
    let mergedGuestItems = -1;

    facade.syncAfterAuthentication().subscribe((result) => {
      mergedGuestItems = result.mergedGuestItems;
    });

    expect(addToCartMock).toHaveBeenCalledWith(7, 1);
    expect(getCartMock).toHaveBeenCalledTimes(1);
    expect(mergedGuestItems).toBe(1);
    expect(state.getStorageScope()).toBe('user:reader%40example.com');
    expect(localStorage.getItem(guestStorageKey)).toBeNull();
    expect(state.getItemsSnapshot()[0]).toMatchObject({
      serverCartItemId: 33,
      bookId: 7,
      quantity: 2,
    });
  });

  it('returns zero merged items when syncAfterAuthentication only refreshes the backend cart', () => {
    token$ = new BehaviorSubject<string | null>('token-123');
    isAuthenticatedMock = vi.fn().mockReturnValue(true);
    getCartMock = vi.fn().mockReturnValue(of(cartResponse));

    const { facade } = setup();
    let mergedGuestItems = -1;

    facade.syncAfterAuthentication().subscribe((result) => {
      mergedGuestItems = result.mergedGuestItems;
    });

    expect(mergedGuestItems).toBe(0);
    expect(getCartMock).toHaveBeenCalledTimes(2);
  });

  it('clears the local cart when the session is logged out', () => {
    const { state } = setup();

    state.addItem(book, 1);
    sessionEvents$.next({ type: 'cleared' });

    expect(state.getItemsSnapshot()).toEqual([]);
  });

  it('clears the local cart when a different authenticated session replaces the current one', () => {
    const { state } = setup();

    state.addItem(book, 1);
    sessionEvents$.next({ type: 'authenticated', replacedSession: true });

    expect(state.getStorageScope()).toBe('user:reader%40example.com');
    expect(state.getItemsSnapshot()).toEqual([]);
  });
});
