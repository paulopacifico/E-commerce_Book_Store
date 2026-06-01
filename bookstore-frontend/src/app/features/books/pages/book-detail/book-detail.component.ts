import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  effect,
  inject,
  OnDestroy,
  signal,
  ViewChild,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError, tap, finalize } from 'rxjs/operators';
import { BookService } from '../../data-access/book.service';
import { CartFacadeService } from '../../../cart/data-access/cart-facade.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SmoothScrollService } from '../../../../shared/services/smooth-scroll/smooth-scroll.service';
import type { Book } from '../../models/book.interface';

@Component({
  selector: 'app-book-detail',
  standalone: false,
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookDetailComponent implements AfterViewInit, OnDestroy {
  @ViewChild('detailRoot', { static: true }) detailRoot!: ElementRef<HTMLElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly bookService = inject(BookService);
  private readonly cartFacade = inject(CartFacadeService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly smoothScroll = inject(SmoothScrollService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly quantity = signal(1);
  readonly addingToCart = signal(false);
  readonly imageError = signal(false);
  readonly readingProgress = signal(0);

  readonly showScrollToTop = computed(() => this.readingProgress() > 0.15);

  private scrollRafId: number | null = null;

  readonly bookResult$: Observable<{ book: Book } | { error: unknown } | null> =
    this.route.paramMap.pipe(
      tap(() => {
        this.loading.set(true);
        this.quantity.set(1);
      }),
      switchMap((params) => {
        const id = Number(params.get('id'));
        if (!id || Number.isNaN(id)) {
          this.loading.set(false);
          return of(null);
        }
        return this.bookService.getBookById(id).pipe(
          map((book) => ({ book })),
          catchError((err) => of({ error: err })),
          finalize(() => this.loading.set(false)),
        );
      }),
    );

  readonly bookResult = toSignal(this.bookResult$, {
    initialValue: null as { book: Book } | { error: unknown } | null,
  });

  constructor() {
    effect(() => {
      this.bookResult();
      this.imageError.set(false);
    });
  }

  ngAfterViewInit(): void {
    // Small, rAF-throttled progress updates for the detail view.
    const update = (): void => {
      const el = this.detailRoot?.nativeElement;
      if (!el || typeof window === 'undefined') return;

      const rect = el.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      const height = el.scrollHeight - window.innerHeight;
      const raw = height <= 0 ? 1 : (window.scrollY - top) / height;
      const clamped = Math.max(0, Math.min(1, raw));
      this.readingProgress.set(clamped);
    };

    const onScroll = (): void => {
      if (this.scrollRafId != null) return;
      this.scrollRafId = requestAnimationFrame(() => {
        this.scrollRafId = null;
        update();
      });
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Store cleanup on the instance; ngOnDestroy will handle removal.
    this.removeScrollListener = (): void => {
      window.removeEventListener('scroll', onScroll);
      if (this.scrollRafId != null) cancelAnimationFrame(this.scrollRafId);
      this.scrollRafId = null;
    };
  }

  private removeScrollListener: (() => void) | null = null;

  ngOnDestroy(): void {
    this.removeScrollListener?.();
    this.removeScrollListener = null;
  }

  setQuantity(value: number, book: Book | null): void {
    if (!book) return;
    const max = Math.max(1, book.stockQuantity);
    const n = Number(value);
    const clamped = Math.max(1, Math.min(max, Number.isNaN(n) ? 1 : n));
    this.quantity.set(clamped);
  }

  onQuantityInput(event: Event, book: Book | null): void {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    this.setQuantity(input?.valueAsNumber ?? Number.NaN, book);
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
    this.addingToCart.set(true);
    this.cartFacade
      .addItem(book, quantity)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.addingToCart.set(false)),
      )
      .subscribe({
        next: () =>
          this.notificationService.success(
            this.authService.isAuthenticated()
              ? 'Book added to cart.'
              : 'Book added to cart. Sign in when you are ready and we will sync it before checkout.',
          ),
        error: () => this.notificationService.error('Unable to update your cart right now.'),
      });
  }

  scrollToTop(): void {
    this.smoothScroll.scrollToTop(520);
  }
}
