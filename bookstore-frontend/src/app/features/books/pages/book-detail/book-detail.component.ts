import { Component, inject, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError, tap, finalize } from 'rxjs/operators';
import { BookService } from '../../data-access/book.service';
import { CartService } from '../../../cart/data-access/cart.service';
import { CartStateService } from '../../../cart/data-access/cart-state.service';
import { NotificationService } from '../../../../core/services/notification.service';
import type { Book } from '../../models/book.interface';

@Component({
  selector: 'app-book-detail',
  standalone: false,
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly bookService = inject(BookService);
  private readonly cartService = inject(CartService);
  private readonly cartStateService = inject(CartStateService);
  private readonly notificationService = inject(NotificationService);

  readonly loading = signal(true);
  readonly quantity = signal(1);
  readonly addingToCart = signal(false);
  readonly imageError = signal(false);

  readonly bookResult$: Observable<{ book: Book } | { error: unknown } | null> =
    this.route.paramMap.pipe(
      tap(() => this.loading.set(true)),
      switchMap((params) => {
        const id = Number(params.get('id'));
        if (!id || Number.isNaN(id)) {
          return of(null);
        }
        return this.bookService.getBookById(id).pipe(
          map((book) => ({ book })),
          catchError((err) => of({ error: err }))
        );
      }),
      finalize(() => this.loading.set(false))
    );

  private readonly bookResult = toSignal(this.bookResult$, { initialValue: null as { book: Book } | { error: unknown } | null });

  constructor() {
    effect(() => {
      this.bookResult();
      this.imageError.set(false);
    });
  }

  setQuantity(value: number, book: Book | null): void {
    if (!book) return;
    const max = Math.max(1, book.stockQuantity);
    const n = Number(value);
    const clamped = Math.max(1, Math.min(max, Number.isNaN(n) ? 1 : n));
    this.quantity.set(clamped);
  }

  incrementQuantity(book: Book | null): void {
    this.setQuantity(this.quantity() + 1, book);
  }

  decrementQuantity(book: Book | null): void {
    this.setQuantity(this.quantity() - 1, book);
  }

  onImageError(): void {
    this.imageError.set(true);
  }

  handleAddToCart(book: Book, quantity: number = 1): void {
    this.cartStateService.addItem(book, quantity);
    this.notificationService.success('Book added to cart');
    this.addingToCart.set(true);
    this.cartService.addToCart(book.id, quantity).subscribe({
      next: () => this.addingToCart.set(false),
      error: () => this.addingToCart.set(false),
    });
  }
}
