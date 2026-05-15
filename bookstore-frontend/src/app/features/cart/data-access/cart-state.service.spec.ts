import { TestBed } from '@angular/core/testing';

import type { Book } from '../../books/models/book.interface';
import { CartStateService } from './cart-state.service';

describe('CartStateService', () => {
  const guestStorageKey = 'bookstore_cart:guest';
  const userStorageKey = 'bookstore_cart:user:reader@example.com';
  const book: Book = {
    id: 7,
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    price: 54.9,
    stockQuantity: 12,
  };

  const setup = (): CartStateService => {
    TestBed.configureTestingModule({
      providers: [CartStateService],
    });

    return TestBed.inject(CartStateService);
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('adds items, merges duplicate books, and persists the cart', () => {
    const service = setup();

    service.addItem(book, 1);
    service.addItem(book, 2);

    expect(service.getCartItemCount()).toBe(3);
    expect(service.getCartTotal()).toBeCloseTo(164.7, 2);

    const stored = JSON.parse(localStorage.getItem(guestStorageKey) ?? '[]') as Array<{
      bookId: number;
      quantity: number;
    }>;

    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      bookId: 7,
      quantity: 3,
    });
  });

  it('hydrates only valid persisted items from storage', () => {
    localStorage.setItem(
      guestStorageKey,
      JSON.stringify([
        {
          bookId: 7,
          bookTitle: 'Domain-Driven Design',
          bookAuthor: 'Eric Evans',
          bookPrice: 54.9,
          quantity: 2,
        },
        {
          bookId: 'broken',
          quantity: 4,
        },
      ]),
    );

    const service = setup();

    expect(service.getCartItemCount()).toBe(2);
    expect(service.getCartTotal()).toBeCloseTo(109.8, 2);
  });

  it('switches persisted storage by scope', () => {
    localStorage.setItem(
      userStorageKey,
      JSON.stringify([
        {
          bookId: 12,
          bookTitle: 'Refactoring',
          bookAuthor: 'Martin Fowler',
          bookPrice: 60,
          quantity: 1,
        },
      ]),
    );
    const service = setup();

    service.addItem(book, 1);
    service.setStorageScope('user:reader@example.com');

    expect(service.getItemsSnapshot()).toHaveLength(1);
    expect(service.getItemsSnapshot()[0]).toMatchObject({
      bookId: 12,
      quantity: 1,
    });
    expect(JSON.parse(localStorage.getItem(guestStorageKey) ?? '[]')).toHaveLength(1);
  });

  it('removes an item when its quantity is updated to zero', () => {
    const service = setup();

    service.addItem(book, 1);
    service.updateQuantity(book.id, 0);

    expect(service.getCartItemCount()).toBe(0);
    expect(service.getCartTotal()).toBe(0);
  });
});
