import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartStateService } from '../../features/cart/data-access/cart-state.service';
import { pairwise, startWith } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-cart-icon',
  standalone: false,
  templateUrl: './cart-icon.component.html',
  styleUrl: './cart-icon.component.scss',
})
export class CartIconComponent {
  readonly cartCount$ = inject(CartStateService).cartCount$;
  readonly bump = signal(false);

  private readonly destroyRef = inject(DestroyRef);
  private bumpTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.cartCount$
      .pipe(
        startWith(0),
        pairwise(),
        filter(([prev, next]) => next > prev),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.bump.set(true);
        if (this.bumpTimeout) clearTimeout(this.bumpTimeout);
        this.bumpTimeout = setTimeout(() => this.bump.set(false), 260);
      });
  }
}
