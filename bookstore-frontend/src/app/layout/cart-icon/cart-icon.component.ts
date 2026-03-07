import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart-icon',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './cart-icon.component.html',
  styleUrl: './cart-icon.component.scss',
})
export class CartIconComponent {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);

  readonly cartCount$: Observable<number> = this.authService.isAuthenticated$.pipe(
    switchMap((authenticated) =>
      authenticated
        ? this.cartService.getCart().pipe(
            map((cart) => cart.totalItems),
            catchError(() => of(0))
          )
        : of(0)
    )
  );
}
