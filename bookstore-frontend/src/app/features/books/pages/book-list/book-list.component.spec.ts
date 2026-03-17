import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { NotificationService } from '../../../../core/services/notification.service';
import { CartStateService } from '../../../cart/data-access/cart-state.service';
import { CategoryService } from '../../../categories/data-access/category.service';
import type { Category } from '../../../categories/models/category.interface';
import { BookService } from '../../data-access/book.service';
import type { Book, PageResponse } from '../../models/book.interface';
import { BookListComponent } from './book-list.component';

describe('BookListComponent', () => {
  let fixture: ComponentFixture<BookListComponent>;
  let component: BookListComponent;
  let getBooksMock: ReturnType<typeof vi.fn>;
  let getBooksByCategoryMock: ReturnType<typeof vi.fn>;
  let searchBooksMock: ReturnType<typeof vi.fn>;
  let getCategoriesMock: ReturnType<typeof vi.fn>;
  let addItemMock: ReturnType<typeof vi.fn>;
  let successMock: ReturnType<typeof vi.fn>;

  const books: Book[] = [
    {
      id: 1,
      title: 'Refactoring UI',
      author: 'Adam Wathan',
      price: 39.9,
      stockQuantity: 8,
    },
  ];
  const categories: Category[] = [{ id: 2, name: 'Design' }];

  const pageResponse = (content: Book[]): PageResponse<Book> => ({
    content,
    page: 0,
    size: 12,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
  });

  beforeEach(async () => {
    getBooksMock = vi.fn();
    getBooksByCategoryMock = vi.fn();
    searchBooksMock = vi.fn();
    getCategoriesMock = vi.fn();
    addItemMock = vi.fn();
    successMock = vi.fn();

    await TestBed.configureTestingModule({
      declarations: [BookListComponent],
      imports: [CommonModule],
      providers: [
        {
          provide: BookService,
          useValue: {
            getBooks: getBooksMock,
            getBooksByCategory: getBooksByCategoryMock,
            searchBooks: searchBooksMock,
          } as Pick<BookService, 'getBooks' | 'getBooksByCategory' | 'searchBooks'>,
        },
        {
          provide: CategoryService,
          useValue: { getCategories: getCategoriesMock } as Pick<CategoryService, 'getCategories'>,
        },
        {
          provide: CartStateService,
          useValue: { addItem: addItemMock } as Pick<CartStateService, 'addItem'>,
        },
        {
          provide: NotificationService,
          useValue: { success: successMock } as Pick<NotificationService, 'success'>,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({})),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('loads the default catalog page and renders book cards', () => {
    getBooksMock.mockReturnValue(of(pageResponse(books)));
    getCategoriesMock.mockReturnValue(of(categories));

    fixture = TestBed.createComponent(BookListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture.detectChanges();

    expect(getCategoriesMock).toHaveBeenCalled();
    expect(getBooksMock).toHaveBeenCalledWith(0, 12);
    expect(component.categories()).toEqual(categories);
    expect(fixture.nativeElement.querySelectorAll('app-book-card').length).toBe(1);
  });

  it('shows a recoverable error state when catalog loading fails', () => {
    getBooksMock
      .mockReturnValueOnce(throwError(() => new Error('catalog unavailable')))
      .mockReturnValueOnce(of(pageResponse(books)));
    getCategoriesMock.mockReturnValue(of(categories));

    fixture = TestBed.createComponent(BookListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture.detectChanges();

    expect(component.booksErrorMessage()).toBe('Unable to load books right now. Please try again.');
    expect(fixture.nativeElement.textContent).toContain('We couldn’t load the catalog.');

    const retryButton = fixture.nativeElement.querySelector('.state-card-error button') as
      | HTMLButtonElement
      | null;
    retryButton?.click();
    fixture.detectChanges();

    expect(getBooksMock).toHaveBeenCalledTimes(2);
    expect(component.booksErrorMessage()).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('app-book-card').length).toBe(1);
  });

  it('surfaces category fetch failures without breaking the catalog', () => {
    getBooksMock.mockReturnValue(of(pageResponse([])));
    getCategoriesMock.mockReturnValue(throwError(() => new Error('categories unavailable')));

    fixture = TestBed.createComponent(BookListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture.detectChanges();

    expect(component.categoriesErrorMessage()).toBe('Categories are unavailable at the moment.');
    expect(fixture.nativeElement.textContent).toContain('Retry Categories');
    expect(fixture.nativeElement.textContent).toContain('No books found.');
  });
});
