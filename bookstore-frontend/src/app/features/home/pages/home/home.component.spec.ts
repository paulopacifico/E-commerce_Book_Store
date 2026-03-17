import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { BookService } from '../../../books/data-access/book.service';
import type { Book, PageResponse } from '../../../books/models/book.interface';
import { CartStateService } from '../../../cart/data-access/cart-state.service';
import { CategoryService } from '../../../categories/data-access/category.service';
import type { Category } from '../../../categories/models/category.interface';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let addItemMock: ReturnType<typeof vi.fn>;
  let successMock: ReturnType<typeof vi.fn>;

  const featuredBooks: Book[] = [
    {
      id: 10,
      title: 'Atomic Habits',
      author: 'James Clear',
      price: 25.5,
      stockQuantity: 7,
      categoryName: 'Self Development',
    },
    {
      id: 11,
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      price: 29.9,
      stockQuantity: 5,
      categoryName: 'Psychology',
    },
  ];

  const categories: Category[] = [
    { id: 1, name: 'Design', bookCount: 14 },
    { id: 2, name: 'Business', bookCount: 21 },
    { id: 3, name: 'Science', bookCount: 9 },
  ];

  const pageResponse = (content: Book[]): PageResponse<Book> => ({
    content,
    page: 0,
    size: 8,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
  });

  beforeEach(async () => {
    addItemMock = vi.fn();
    successMock = vi.fn();

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        {
          provide: BookService,
          useValue: {
            getBooks: vi.fn().mockReturnValue(of(pageResponse(featuredBooks))),
          } as Pick<BookService, 'getBooks'>,
        },
        {
          provide: CategoryService,
          useValue: {
            getCategories: vi.fn().mockReturnValue(of(categories)),
          } as Pick<CategoryService, 'getCategories'>,
        },
        {
          provide: AuthService,
          useValue: {
            isAuthenticated$: of(false),
          } as Pick<AuthService, 'isAuthenticated$'>,
        },
        {
          provide: CartStateService,
          useValue: {
            addItem: addItemMock,
          } as Pick<CartStateService, 'addItem'>,
        },
        {
          provide: NotificationService,
          useValue: {
            success: successMock,
          } as Pick<NotificationService, 'success'>,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
  });

  it('renders the editorial spotlight and category shelves', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Atomic Habits');
    expect(text).toContain("Editor's Spotlight");
    expect(text).toContain('Category Discovery');
    expect(fixture.nativeElement.querySelectorAll('.category-card').length).toBe(3);
  });

  it('adds the spotlight book to cart from the hero action', () => {
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector(
      '.hero-spotlight .btn-ghost-light',
    ) as HTMLButtonElement;
    addButton.click();

    expect(addItemMock).toHaveBeenCalledWith(featuredBooks[0], 1);
    expect(successMock).toHaveBeenCalledWith('Book added to cart');
  });
});
