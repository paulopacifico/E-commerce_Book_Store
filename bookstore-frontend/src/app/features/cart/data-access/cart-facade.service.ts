import { Injectable } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap, toArray } from 'rxjs/operators';

import type { Book } from '../../books/models/book.interface';
import { AuthService } from '../../auth/data-access/auth.service';
import { CartService } from './cart.service';
import { CartStateService, type LocalCartItem } from './cart-state.service';
import type { CartItem, CartResponse } from '../models/cart.interface';

export interface CartSyncResult {
  mergedGuestItems: number;
  cart: LocalCartItem[];
}

@Injectable({ providedIn: 'root' })
export class CartFacadeService {
  constructor(
    private readonly authService: AuthService,
    private readonly cartService: CartService,
    private readonly cartState: CartStateService,
  ) {
    if (this.authService.isAuthenticated()) {
      this.cartState.setStorageScope(this.authService.getCartStorageScope());
      this.syncAfterAuthentication().subscribe({
        error: () => {
          // Keep the local cache as-is if refresh fails.
        },
      });
    }

    this.authService.sessionEvents$.subscribe((event) => {
      if (event.type === 'cleared') {
        this.cartState.setStorageScope('guest');
        this.cartState.clearCart();
        return;
      }

      if (event.replacedSession) {
        this.cartState.setStorageScope(this.authService.getCartStorageScope());
        this.cartState.clearCart();
      }
    });
  }

  get cart$(): Observable<LocalCartItem[]> {
    return this.cartState.cart$;
  }

  get cartCount$(): Observable<number> {
    return this.cartState.cartCount$;
  }

  addItem(book: Book, quantity: number): Observable<void> {
    if (!this.authService.isAuthenticated()) {
      this.cartState.addItem(book, quantity);
      return of(void 0);
    }

    return this.cartService.addToCart(book.id, quantity).pipe(
      tap((item) => this.upsertServerItem(item)),
      map(() => void 0),
    );
  }

  updateQuantity(bookId: number, quantity: number): Observable<void> {
    if (!this.authService.isAuthenticated()) {
      this.cartState.updateQuantity(bookId, quantity);
      return of(void 0);
    }

    if (quantity <= 0) {
      return this.removeItem(bookId);
    }

    return this.withResolvedServerItemId(bookId, (serverCartItemId) =>
      this.cartService.updateCartItem(serverCartItemId, quantity).pipe(
        tap((item) => this.upsertServerItem(item)),
        map(() => void 0),
      ),
    );
  }

  removeItem(bookId: number): Observable<void> {
    if (!this.authService.isAuthenticated()) {
      this.cartState.removeItem(bookId);
      return of(void 0);
    }

    return this.withResolvedServerItemId(bookId, (serverCartItemId) =>
      this.cartService.removeCartItem(serverCartItemId).pipe(
        tap(() => {
          const next = this.cartState
            .getItemsSnapshot()
            .filter((item) => item.bookId !== bookId);
          this.cartState.replaceCart(next);
        }),
        map(() => void 0),
      ),
    );
  }

  clearCart(): Observable<void> {
    if (!this.authService.isAuthenticated()) {
      this.cartState.clearCart();
      return of(void 0);
    }

    return this.cartService.clearCart().pipe(
      tap(() => this.cartState.clearCart()),
      map(() => void 0),
    );
  }

  clearLocalCache(): void {
    this.cartState.clearCart();
  }

  refresh(): Observable<LocalCartItem[]> {
    if (!this.authService.isAuthenticated()) {
      return of(this.cartState.getItemsSnapshot());
    }

    return this.cartService.getCart().pipe(
      map((response) => this.mapResponseToLocalItems(response)),
      tap((items) => this.cartState.replaceCart(items)),
    );
  }

  syncAfterAuthentication(): Observable<CartSyncResult> {
    const targetScope = this.authService.getCartStorageScope();
    const currentScope = this.cartState.getStorageScope();
    const pendingGuestItems = this.cartState
      .getItemsSnapshot()
      .filter((item) => item.serverCartItemId == null);

    if (pendingGuestItems.length === 0) {
      if (currentScope !== targetScope) {
        this.cartState.setStorageScope(targetScope);
      }
      return this.refresh().pipe(
        map((cart) => ({
          mergedGuestItems: 0,
          cart,
        })),
      );
    }

    return from(pendingGuestItems).pipe(
      concatMap((item) => this.cartService.addToCart(item.bookId, item.quantity)),
      toArray(),
      switchMap(() => {
        if (this.cartState.getStorageScope() !== targetScope) {
          this.cartState.setStorageScope(targetScope);
        }
        return this.refresh();
      }),
      tap(() => this.cartState.clearPersistedScope('guest')),
      map((cart) => ({
        mergedGuestItems: pendingGuestItems.length,
        cart,
      })),
    );
  }

  private mapResponseToLocalItems(response: CartResponse): LocalCartItem[] {
    return response.items.map((item) => ({
      serverCartItemId: item.id,
      bookId: item.bookId,
      bookTitle: item.bookTitle,
      bookAuthor: item.bookAuthor,
      bookPrice: item.bookPrice,
      quantity: item.quantity,
    }));
  }

  private upsertServerItem(item: CartItem): void {
    const current = this.cartState.getItemsSnapshot();
    const nextItem: LocalCartItem = {
      serverCartItemId: item.id,
      bookId: item.bookId,
      bookTitle: item.bookTitle,
      bookAuthor: item.bookAuthor,
      bookPrice: item.bookPrice,
      quantity: item.quantity,
    };
    const existingIndex = current.findIndex((entry) => entry.bookId === item.bookId);
    if (existingIndex === -1) {
      this.cartState.replaceCart([...current, nextItem]);
      return;
    }

    this.cartState.replaceCart(
      current.map((entry, index) => (index === existingIndex ? nextItem : entry)),
    );
  }

  private withResolvedServerItemId(
    bookId: number,
    action: (serverCartItemId: number) => Observable<void>,
  ): Observable<void> {
    const current = this.cartState.getItemsSnapshot().find((item) => item.bookId === bookId);
    if (current?.serverCartItemId != null) {
      return action(current.serverCartItemId);
    }

    return this.refresh().pipe(
      switchMap(() => {
        const refreshed = this.cartState.getItemsSnapshot().find((item) => item.bookId === bookId);
        if (refreshed?.serverCartItemId == null) {
          return throwError(() => new Error('Unable to sync cart item with the server.'));
        }
        return action(refreshed.serverCartItemId);
      }),
      catchError((error) => throwError(() => error)),
    );
  }

}
