import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  OnInit,
  AfterViewInit,
  DestroyRef,
  OnDestroy,
  ElementRef,
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
import { AnimationsService } from '../../../../shared/services/animations/animations.service';
import { SmoothAnchorDirective } from '../../../../shared/directives/smooth-anchor.directive';
import type { Book } from '../../../books/models/book.interface';
import type { Category } from '../../../categories/models/category.interface';
import { BookCardComponent } from '../../../../shared/components/book-card/book-card.component';
import { RevealOnScrollDirective } from '../../../../shared/directives/reveal-on-scroll.directive';
import { TitleRevealDirective } from '../../../../shared/directives/title-reveal.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    BookCardComponent,
    RouterLink,
    AsyncPipe,
    CurrencyPipe,
    RevealOnScrollDirective,
    TitleRevealDirective,
    SmoothAnchorDirective,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly bookService = inject(BookService);
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);
  private readonly cartStateService = inject(CartStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly animations = inject(AnimationsService);

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
    { value: 'Instant access', label: 'Buy once and read your ebooks right away' },
    { value: 'Smart catalog', label: 'Filter by category, price, and availability in seconds' },
    { value: 'Secure checkout', label: 'Clear cart, account, and payment steps from start to finish' },
  ] as const;
  readonly purchaseJourney = [
    {
      step: '01',
      title: 'Find your next ebook quickly',
      detail:
        'Use categories, search, and curated shelves to move from interest to shortlist without friction.',
    },
    {
      step: '02',
      title: 'Compare before you commit',
      detail:
        'Product cards keep price, stock, and preview actions visible so decisions stay easy and informed.',
    },
    {
      step: '03',
      title: 'Checkout in a clear flow',
      detail:
        'From cart to account and order confirmation, each step stays consistent and easy to complete.',
    },
  ] as const;
  readonly serviceHighlights = [
    {
      title: 'Curated arrivals',
      detail:
        'New releases and top picks are organized to help readers discover relevant ebooks faster.',
    },
    {
      title: 'Reliable checkout flow',
      detail:
        'The purchase path is stable across devices, with clear actions and no hidden steps.',
    },
    {
      title: 'Responsive by default',
      detail:
        'Browsing, cart updates, and checkout remain readable and usable from mobile to desktop.',
    },
  ] as const;

  ngOnInit(): void {
    this.loadFeaturedBooks();
    this.loadCategories();
  }

  private scrollRafId: number | null = null;
  private removeScrollListener: (() => void) | null = null;

  ngAfterViewInit(): void {
    const width = typeof window !== 'undefined' ? window.innerWidth : 9999;
    if (this.animations.prefersReducedMotion || width < 640) return;

    const heroSection = this.hostEl.nativeElement.querySelector(
      'section.hero',
    ) as HTMLElement | null;
    const heroBg = this.hostEl.nativeElement.querySelector('.hero-bg') as HTMLElement | null;
    if (!heroSection || !heroBg) return;

    const heroTop = heroSection.getBoundingClientRect().top + window.scrollY;

    const update = (): void => {
      const y = Math.max(0, window.scrollY - heroTop);
      // Subtle parallax: background moves at half scroll speed.
      const offsetY = -y * 0.5;
      heroBg.style.transform = `translate3d(0, ${offsetY.toFixed(1)}px, 0)`;
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

    this.removeScrollListener = (): void => {
      window.removeEventListener('scroll', onScroll);
      if (this.scrollRafId != null) cancelAnimationFrame(this.scrollRafId);
      this.scrollRafId = null;
    };
  }

  ngOnDestroy(): void {
    this.removeScrollListener?.();
    this.removeScrollListener = null;
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
