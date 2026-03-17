import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
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
import { BookService } from '../../data-access/book.service';
import { CategoryService } from '../../../categories/data-access/category.service';
import { CartStateService } from '../../../cart/data-access/cart-state.service';
import { NotificationService } from '../../../../core/services/notification.service';
import type { Book } from '../../models/book.interface';
import type { Category } from '../../../categories/models/category.interface';

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
  private readonly cartStateService = inject(CartStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly searchInput$ = new Subject<string>();
  readonly searchValue = signal('');
  readonly loading = signal(false);
  readonly categoriesLoading = signal(true);
  readonly booksErrorMessage = signal<string | null>(null);
  readonly categoriesErrorMessage = signal<string | null>(null);
  readonly selectedCategoryId = signal<number | null>(null);
  readonly currentPage = signal(0);
  readonly totalPages = signal(0);
  readonly categories = signal<Category[]>([]);
  private readonly reloadTick = signal(0);

  readonly booksResult$ = combineLatest([
    this.searchInput$.pipe(debounceTime(300), startWith('')),
    toObservable(this.selectedCategoryId),
    toObservable(this.currentPage),
    toObservable(this.reloadTick),
  ]).pipe(
    switchMap(([searchTerm, catId, page]) => {
      this.loading.set(true);
      this.booksErrorMessage.set(null);
      const term = (searchTerm ?? '').trim();
      if (term) {
        return this.bookService.searchBooks(term, catId ?? undefined).pipe(
          map((books) => ({ books, totalPages: 1, page: 0 })),
          finalize(() => this.loading.set(false)),
          catchError(() => {
            this.booksErrorMessage.set('Unable to load books right now. Please try again.');
            return of({ books: [] as Book[], totalPages: 0, page: 0 });
          }),
        );
      }
      if (catId != null) {
        return this.bookService.getBooksByCategory(catId, page, PAGE_SIZE).pipe(
          map((res) => ({
            books: res.content,
            totalPages: res.totalPages,
            page: res.page,
          })),
          finalize(() => this.loading.set(false)),
          catchError(() => {
            this.booksErrorMessage.set('Unable to load books right now. Please try again.');
            return of({ books: [] as Book[], totalPages: 0, page: 0 });
          }),
        );
      }
      return this.bookService.getBooks(page, PAGE_SIZE).pipe(
        map((res) => ({
          books: res.content,
          totalPages: res.totalPages,
          page: res.page,
        })),
        finalize(() => this.loading.set(false)),
        catchError(() => {
          this.booksErrorMessage.set('Unable to load books right now. Please try again.');
          return of({ books: [] as Book[], totalPages: 0, page: 0 });
        }),
      );
    }),
  );

  readonly books$ = this.booksResult$.pipe(
    tap((r) => {
      this.totalPages.set(r.totalPages);
      this.currentPage.set(r.page);
    }),
    map((r) => r.books),
  );

  ngOnInit(): void {
    this.loadCategories();
    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      const search = params.get('search')?.trim() ?? '';
      if (search) {
        this.searchValue.set(search);
        this.searchInput$.next(search);
      }
      const categoryIdParam = params.get('category');
      if (categoryIdParam != null) {
        const id = Number(categoryIdParam);
        if (Number.isFinite(id)) {
          this.selectedCategoryId.set(id);
        }
      }
    });
  }

  loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoriesErrorMessage.set(null);
    this.categoryService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => this.categories.set(categories),
        error: () => {
          this.categories.set([]);
          this.categoriesErrorMessage.set('Categories are unavailable at the moment.');
          this.categoriesLoading.set(false);
        },
        complete: () => this.categoriesLoading.set(false),
      });
  }

  onSearchInput(value: string): void {
    this.searchValue.set(value);
    this.searchInput$.next(value);
    this.currentPage.set(0);
  }

  onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const v = select?.value ?? '';
    const categoryId = v === '' ? null : Number(v);
    this.selectedCategoryId.set(categoryId);
    this.currentPage.set(0);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  retryBooks(): void {
    this.reloadTick.update((value) => value + 1);
  }

  handleAddToCart(book: Book, quantity: number = 1): void {
    this.cartStateService.addItem(book, quantity);
    this.notificationService.success('Book added to cart');
  }
}
