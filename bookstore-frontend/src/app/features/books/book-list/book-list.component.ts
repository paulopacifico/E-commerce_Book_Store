import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { combineLatest, of } from 'rxjs';
import {
  switchMap,
  map,
  catchError,
  startWith,
  debounceTime,
  tap,
  finalize,
  take,
} from 'rxjs/operators';
import { BookService } from '../../../core/services/book.service';
import { CategoryService } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';
import { CartStateService } from '../../../core/services/cart-state.service';
import { NotificationService } from '../../../core/services/notification.service';
import type { Book } from '../../../core/models/book.interface';
import type { Category } from '../../../core/models/category.interface';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-book-list',
  standalone: false,
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly bookService = inject(BookService);
  private readonly categoryService = inject(CategoryService);
  private readonly cartService = inject(CartService);
  private readonly cartStateService = inject(CartStateService);
  private readonly notificationService = inject(NotificationService);

  private readonly searchInput$ = new Subject<string>();
  readonly searchValue = signal('');
  readonly loading = signal(false);
  readonly selectedCategoryId = signal<number | null>(null);
  readonly currentPage = signal(0);
  readonly totalPages = signal(0);

  readonly categories$ = this.categoryService.getCategories().pipe(
    catchError(() => of<Category[]>([]))
  );

  readonly booksResult$ = combineLatest([
    this.searchInput$.pipe(debounceTime(300), startWith('')),
    toObservable(this.selectedCategoryId),
    toObservable(this.currentPage),
  ]).pipe(
    switchMap(([searchTerm, catId, page]) => {
      this.loading.set(true);
      const term = (searchTerm ?? '').trim();
      if (term) {
        return this.bookService.searchBooks(term, catId ?? undefined).pipe(
          map((books) => ({ books, totalPages: 1, page: 0 })),
          finalize(() => this.loading.set(false)),
          catchError(() => of({ books: [] as Book[], totalPages: 0, page: 0 }))
        );
      }
      if (catId != null) {
        return this.bookService
          .getBooksByCategory(catId, page, PAGE_SIZE)
          .pipe(
            map((res) => ({
              books: res.content,
              totalPages: res.totalPages,
              page: res.page,
            })),
            finalize(() => this.loading.set(false)),
            catchError(() => of({ books: [] as Book[], totalPages: 0, page: 0 }))
          );
      }
      return this.bookService.getBooks(page, PAGE_SIZE).pipe(
        map((res) => ({
          books: res.content,
          totalPages: res.totalPages,
          page: res.page,
        })),
        finalize(() => this.loading.set(false)),
        catchError(() => of({ books: [] as Book[], totalPages: 0, page: 0 }))
      );
    })
  );

  readonly books$ = this.booksResult$.pipe(
    tap((r) => {
      this.totalPages.set(r.totalPages);
      this.currentPage.set(r.page);
    }),
    map((r) => r.books)
  );

  ngOnInit(): void {
    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      const search = params.get('search')?.trim() ?? '';
      if (search) {
        this.searchValue.set(search);
        this.searchInput$.next(search);
      }
    });
  }

  onSearchInput(value: string): void {
    this.searchValue.set(value);
    this.searchInput$.next(value);
    this.currentPage.set(0);
  }

  categorySelectValue(select: HTMLSelectElement): number | null {
    const v = select.value;
    return v === '' ? null : Number(v);
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
    this.currentPage.set(0);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  trackByBookId(_index: number, book: Book): number {
    return book.id;
  }

  handleAddToCart(book: Book, quantity: number = 1): void {
    this.cartStateService.addItem(book, quantity);
    this.notificationService.success('Book added to cart');
    this.cartService.addToCart(book.id, quantity).subscribe({ error: () => {} });
  }
}
