import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { CategoryService } from '../../data-access/category.service';
import type { Category } from '../../models/category.interface';
import { CategoriesComponent } from './categories.component';

describe('CategoriesComponent', () => {
  let fixture: ComponentFixture<CategoriesComponent>;
  let component: CategoriesComponent;
  let getCategoriesMock: ReturnType<typeof vi.fn>;

  const categories: Category[] = [
    { id: 1, name: 'Design', description: 'Visual systems and product craft.', bookCount: 14 },
    { id: 2, name: 'Business', description: 'Operating models and strategy.', bookCount: 21 },
    { id: 3, name: 'Science', description: 'Research, discovery, and evidence.', bookCount: 9 },
  ];

  beforeEach(async () => {
    getCategoriesMock = vi.fn();

    await TestBed.configureTestingModule({
      declarations: [CategoriesComponent],
      imports: [CommonModule, RouterModule.forRoot([])],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            getCategories: getCategoriesMock,
          } as Pick<CategoryService, 'getCategories'>,
        },
      ],
    }).compileComponents();
  });

  function renderWith(response: Observable<Category[]>): void {
    getCategoriesMock.mockReturnValue(response);
    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('renders the category discovery dashboard with shelf metrics', () => {
    renderWith(of(categories));

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Category Discovery');
    expect(text).toContain('Browse Collections');
    expect(text).toContain('Listed books');
    expect(component.totalBookCount()).toBe(44);
    expect(fixture.nativeElement.querySelectorAll('.collection-card').length).toBe(3);
  });

  it('filters the main collection grid and can reset the search', () => {
    renderWith(of(categories));

    component.searchQuery.set('design');
    fixture.detectChanges();

    expect(component.filteredCount()).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Search Results');
    expect(fixture.nativeElement.querySelectorAll('.collection-card').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Design');
    expect(fixture.nativeElement.textContent).not.toContain('Business');

    const resetButton = fixture.nativeElement.querySelector('.btn-view-all') as HTMLButtonElement;
    resetButton.click();
    fixture.detectChanges();

    expect(component.searchQuery()).toBe('');
    expect(fixture.nativeElement.textContent).toContain('Featured Categories');
  });

  it('shows an empty search result without losing the reset action', () => {
    renderWith(of(categories));

    component.searchQuery.set('poetry');
    fixture.detectChanges();

    expect(component.filteredCount()).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('No matching collections.');
    expect(fixture.nativeElement.querySelector('.btn-view-all')?.textContent).toContain(
      'Reset search',
    );
  });

  it('shows the empty catalog state when there are no categories', () => {
    renderWith(of([]));

    expect(fixture.nativeElement.querySelector('.state-card')?.textContent).toContain(
      'No categories available.',
    );
  });

  it('shows a retryable error state when categories fail to load', () => {
    renderWith(throwError(() => new Error('categories failed')));

    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe(
      'We could not load categories right now. Please try again.',
    );
    expect(fixture.nativeElement.querySelector('.state-card-error')?.textContent).toContain(
      "We couldn't load categories.",
    );
  });
});
