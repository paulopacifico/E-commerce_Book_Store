import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
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
  imports: [BookCardComponent, RouterLink, AsyncPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly bookService = inject(BookService);
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
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
}
