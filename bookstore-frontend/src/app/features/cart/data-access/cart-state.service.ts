import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Book } from '../../books/models/book.interface';

/** UI cart source of truth, persisted locally for the storefront experience. */
export interface LocalCartItem {
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookPrice: number;
  quantity: number;
}

const STORAGE_KEY = 'bookstore_cart';

@Injectable({ providedIn: 'root' })
export class CartStateService {
  private readonly cartSubject = new BehaviorSubject<LocalCartItem[]>(this.loadFromStorage());

  /** Public observable of current cart items. */
  readonly cart$: Observable<LocalCartItem[]> = this.cartSubject.asObservable();

  /** Total number of items (sum of quantities). Used by cart icon. */
  readonly cartCount$: Observable<number> = this.cart$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.quantity, 0)),
  );

  /** Replace the whole cart state when hydrating from an external source. */
  replaceCart(items: LocalCartItem[]): void {
    this.setState(items);
  }

  addItem(book: Book, quantity: number): void {
    if (quantity <= 0) return;
    const items = this.cartSubject.value;
    const existing = items.find((i) => i.bookId === book.id);
    const next: LocalCartItem[] = existing
      ? items.map((i) => (i.bookId === book.id ? { ...i, quantity: i.quantity + quantity } : i))
      : [
          ...items,
          {
            bookId: book.id,
            bookTitle: book.title,
            bookAuthor: book.author,
            bookPrice: book.price,
            quantity,
          },
        ];
    this.setState(next);
  }

  removeItem(bookId: number): void {
    const next = this.cartSubject.value.filter((i) => i.bookId !== bookId);
    this.setState(next);
  }

  updateQuantity(bookId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(bookId);
      return;
    }
    const next = this.cartSubject.value.map((i) => (i.bookId === bookId ? { ...i, quantity } : i));
    this.setState(next);
  }

  clearCart(): void {
    this.setState([]);
  }

  getCartTotal(): number {
    return this.cartSubject.value.reduce((sum, item) => sum + item.bookPrice * item.quantity, 0);
  }

  getCartItemCount(): number {
    return this.cartSubject.value.reduce((sum, item) => sum + item.quantity, 0);
  }

  private setState(items: LocalCartItem[]): void {
    this.cartSubject.next(items);
    this.persist(items);
  }

  private persist(items: LocalCartItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }

  private loadFromStorage(): LocalCartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item): item is LocalCartItem =>
          item != null &&
          typeof item.bookId === 'number' &&
          typeof item.quantity === 'number' &&
          typeof item.bookPrice === 'number' &&
          typeof item.bookTitle === 'string' &&
          typeof item.bookAuthor === 'string',
      );
    } catch {
      return [];
    }
  }
}
