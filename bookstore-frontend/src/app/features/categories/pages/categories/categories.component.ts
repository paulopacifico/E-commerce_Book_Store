import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  computed,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryService } from '../../data-access/category.service';
import type { Category } from '../../models/category.interface';

/** Number of categories shown in the "Featured" section. */
const FEATURED_COUNT = 6;

@Component({
  selector: 'app-categories',
  standalone: false,
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly categories = signal<Category[]>([]);

  /** Current sidebar search query. */
  readonly searchQuery = signal('');

  /** Sidebar list: all categories filtered by search query. */
  readonly filteredCategories = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return q
      ? this.categories().filter((c) => c.name.toLowerCase().includes(q))
      : this.categories();
  });

  /** Main content: first N categories shown as "Featured". */
  readonly featuredCategories = computed(() =>
    this.categories().slice(0, FEATURED_COUNT),
  );

  /** Main content: remaining categories after the featured slice. */
  readonly remainingCategories = computed(() =>
    this.categories().slice(FEATURED_COUNT),
  );

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.categoryService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => this.categories.set(categories),
        error: () => {
          this.categories.set([]);
          this.errorMessage.set('We could not load categories right now. Please try again.');
          this.loading.set(false);
        },
        complete: () => this.loading.set(false),
      });
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }
}
