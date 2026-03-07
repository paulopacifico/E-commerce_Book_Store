import { Injectable, inject } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { switchMap, map, catchError, startWith } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';

@Injectable({ providedIn: 'root' })
export class CartStateService {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly refreshTrigger = new Subject<void>();

  /**
   * Emits the total number of items in the cart. Updates when the user logs in/out
   * or when refresh() is called (e.g. after add/remove/update cart).
   */
  readonly cartCount$: Observable<number> = this.authService.isAuthenticated$.pipe(
    switchMap((authenticated) =>
      authenticated
        ? this.refreshTrigger.pipe(
            startWith(undefined),
            switchMap(() =>
              this.cartService.getCart().pipe(
                map((cart) => cart.totalItems),
                catchError(() => of(0))
              )
            )
          )
        : of(0)
    )
  );

  /** Call after modifying the cart (add, remove, update) so the icon updates. */
  refresh(): void {
    this.refreshTrigger.next();
  }
}
