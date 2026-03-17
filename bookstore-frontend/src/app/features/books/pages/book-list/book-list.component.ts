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
type SortOption = 'featured' | 'title-asc' | 'price-asc' | 'price-desc';
type PaginationItem = number | 'ellipsis';

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
  readonly selectedSort = signal<SortOption>('featured');
  readonly currentPage = signal(0);
  readonly totalPages = signal(0);
  readonly totalResults = signal(0);
  readonly categories = signal<Category[]>([]);
  private readonly reloadTick = signal(0);

  readonly booksResult$ = combineLatest([
    this.searchInput$.pipe(debounceTime(300), startWith('')),
    toObservable(this.selectedCategoryId),
    toObservable(this.selectedSort),
    toObservable(this.currentPage),
    toObservable(this.reloadTick),
  ]).pipe(
    switchMap(([searchTerm, catId, sortOption, page]) => {
      this.loading.set(true);
      this.booksErrorMessage.set(null);
      const term = (searchTerm ?? '').trim();
      if (term) {
        return this.bookService.searchBooks(term, catId ?? undefined).pipe(
          map((books) => ({
            books: this.sortBooks(books, sortOption),
            totalPages: 1,
            totalResults: books.length,
            page: 0,
          })),
          finalize(() => this.loading.set(false)),
          catchError(() => {
            this.booksErrorMessage.set('Unable to load books right now. Please try again.');
            return of({ books: [] as Book[], totalPages: 0, totalResults: 0, page: 0 });
          }),
        );
      }
      if (catId != null) {
        return this.bookService.getBooksByCategory(catId, page, PAGE_SIZE).pipe(
          map((res) => ({
            books: this.sortBooks(res.content, sortOption),
            totalPages: res.totalPages,
            totalResults: res.totalElements,
            page: res.page,
          })),
          finalize(() => this.loading.set(false)),
          catchError(() => {
            this.booksErrorMessage.set('Unable to load books right now. Please try again.');
            return of({ books: [] as Book[], totalPages: 0, totalResults: 0, page: 0 });
          }),
        );
      }
      return this.bookService.getBooks(page, PAGE_SIZE).pipe(
        map((res) => ({
          books: this.sortBooks(res.content, sortOption),
          totalPages: res.totalPages,
          totalResults: res.totalElements,
          page: res.page,
        })),
        finalize(() => this.loading.set(false)),
        catchError(() => {
          this.booksErrorMessage.set('Unable to load books right now. Please try again.');
          return of({ books: [] as Book[], totalPages: 0, totalResults: 0, page: 0 });
        }),
      );
    }),
  );

  readonly books$ = this.booksResult$.pipe(
    tap((r) => {
      this.totalPages.set(r.totalPages);
      this.totalResults.set(r.totalResults);
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

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const nextSort = (select?.value ?? 'featured') as SortOption;
    this.selectedSort.set(nextSort);
    this.currentPage.set(0);
  }

  clearFilters(): void {
    this.searchValue.set('');
    this.searchInput$.next('');
    this.selectedCategoryId.set(null);
    this.selectedSort.set('featured');
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

  get selectedCategoryLabel(): string | null {
    const categoryId = this.selectedCategoryId();
    return this.categories().find((category) => category.id === categoryId)?.name ?? null;
  }

  get hasActiveFilters(): boolean {
    return (
      !!this.searchValue().trim() ||
      this.selectedCategoryId() != null ||
      this.selectedSort() !== 'featured'
    );
  }

  get resultsLabel(): string {
    const total = this.totalResults();
    if (!total) {
      return 'No titles match the current view.';
    }

    const searchTerm = this.searchValue().trim();
    const category = this.selectedCategoryLabel;
    if (searchTerm && category) {
      return `${total} titles found for "${searchTerm}" in ${category}.`;
    }
    if (searchTerm) {
      return `${total} titles found for "${searchTerm}".`;
    }
    if (category) {
      return `${total} titles available in ${category}.`;
    }
    return `${total} titles available in the catalog.`;
  }

  get visiblePages(): PaginationItem[] {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 1) return [1];
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

    const pages = new Set<number>([1, total, current + 1, current, current + 2]);
    const sorted = Array.from(pages)
      .filter((page) => page >= 1 && page <= total)
      .sort((a, b) => a - b);

    const result: PaginationItem[] = [];
    sorted.forEach((page, index) => {
      const previous = sorted[index - 1];
      if (previous && page - previous > 1) {
        result.push('ellipsis');
      }
      result.push(page);
    });

    return result;
  }

  private sortBooks(books: Book[], sortOption: SortOption): Book[] {
    const next = [...books];

    switch (sortOption) {
      case 'title-asc':
        return next.sort((a, b) => a.title.localeCompare(b.title));
      case 'price-asc':
        return next.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return next.sort((a, b) => b.price - a.price);
      case 'featured':
      default:
        return next.sort((a, b) => {
          const stockDifference = Number(b.stockQuantity > 0) - Number(a.stockQuantity > 0);
          if (stockDifference !== 0) return stockDifference;
          return a.title.localeCompare(b.title);
        });
    }
  }
}
