import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  OnInit,
  DestroyRef,
  computed,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { BookService } from '../../../books/data-access/book.service';
import { CategoryService } from '../../../categories/data-access/category.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { CartStateService } from '../../../cart/data-access/cart-state.service';
import { NotificationService } from '../../../../core/services/notification.service';
import type { Book } from '../../../books/models/book.interface';
import type { Category } from '../../../categories/models/category.interface';
import { BookCardComponent } from '../../../../shared/components/book-card/book-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BookCardComponent, RouterLink, AsyncPipe, CurrencyPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);
  private readonly cartStateService = inject(CartStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly featuredBooks = signal<Book[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly featuredLoading = signal(true);
  readonly categoriesLoading = signal(true);
  readonly featuredErrorMessage = signal<string | null>(null);
  readonly categoriesErrorMessage = signal<string | null>(null);
  readonly isAuthenticated$ = this.authService.isAuthenticated$;
  readonly spotlightBook = computed(() => this.featuredBooks()[0] ?? null);
  readonly curatedBooks = computed(() => this.featuredBooks().slice(1, 5));
  readonly categoryHighlights = computed(() => this.categories().slice(0, 6));
  readonly catalogSignals = [
    { value: 'Responsive', label: 'Editorial storefront across mobile and desktop' },
    { value: 'REST-ready', label: 'Integrated catalog, cart, auth, and checkout flows' },
    { value: 'Fast scan', label: 'Clear states for browse, compare, and buy decisions' },
  ] as const;
  readonly purchaseJourney = [
    {
      step: '01',
      title: 'Discover titles fast',
      detail:
        'Category-led navigation and polished catalog cards reduce friction from the first click.',
    },
    {
      step: '02',
      title: 'Compare with confidence',
      detail:
        'Availability, pricing, and detail previews stay visible while the layout remains easy to scan.',
    },
    {
      step: '03',
      title: 'Move cleanly to checkout',
      detail:
        'Cart, auth, and checkout are connected to backend flows without breaking the reading experience.',
    },
  ] as const;
  readonly serviceHighlights = [
    {
      title: 'Curated arrivals',
      detail:
        'Fresh releases, thoughtful category groupings, and storefront-ready product hierarchy.',
    },
    {
      title: 'Reliable checkout flow',
      detail:
        'Cart and account states stay coherent while purchase actions remain visible on every screen.',
    },
    {
      title: 'Responsive by default',
      detail:
        'Layouts adapt from compact shelves to full desktop merchandising without losing clarity.',
    },
  ] as const;

  ngOnInit(): void {
    this.loadFeaturedBooks();
    this.loadCategories();
  }

  loadFeaturedBooks(): void {
    this.featuredLoading.set(true);
    this.featuredErrorMessage.set(null);
    this.bookService
      .getBooks(0, 8, 'id,desc')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.featuredBooks.set(res.content),
        error: () => {
          this.featuredBooks.set([]);
          this.featuredErrorMessage.set('Featured books are unavailable right now.');
          this.featuredLoading.set(false);
        },
        complete: () => this.featuredLoading.set(false),
      });
  }

  loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoriesErrorMessage.set(null);
    this.categoryService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => this.categories.set(list),
        error: () => {
          this.categories.set([]);
          this.categoriesErrorMessage.set('Categories are unavailable right now.');
          this.categoriesLoading.set(false);
        },
        complete: () => this.categoriesLoading.set(false),
      });
  }

  scrollToCategories(): void {
    const el = document.getElementById('home-categories');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  handleAddToCart(book: Book): void {
    this.cartStateService.addItem(book, 1);
    this.notificationService.success('Book added to cart');
  }

  trackByBookId(_index: number, book: Book): number {
    return book.id;
  }

  trackByCategoryId(_index: number, cat: Category): number {
    return cat.id;
  }

  categoryIcon(name: string): string {
    const normalized = name.toLowerCase();

    if (normalized.includes('fiction') || normalized.includes('novel')) return '✦';
    if (normalized.includes('business') || normalized.includes('econom')) return '◈';
    if (normalized.includes('design') || normalized.includes('art')) return '◌';
    if (normalized.includes('history') || normalized.includes('biograph')) return '▣';
    if (normalized.includes('science') || normalized.includes('technology')) return '△';
    if (normalized.includes('children') || normalized.includes('young')) return '☼';

    return '◆';
  }

  categoryTone(index: number): string {
    return ['clay', 'sage', 'ink', 'gold'][index % 4];
  }
}
