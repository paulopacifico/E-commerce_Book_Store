import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';

import { NotificationService } from '../../../../core/services/notification.service';
import { SmoothScrollService } from '../../../../shared/services/smooth-scroll/smooth-scroll.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { CartFacadeService } from '../../../cart/data-access/cart-facade.service';
import { BookService } from '../../data-access/book.service';
import type { Book } from '../../models/book.interface';
import { BookDetailComponent } from './book-detail.component';

describe('BookDetailComponent', () => {
  let fixture: ComponentFixture<BookDetailComponent>;
  let component: BookDetailComponent;
  let getBookByIdMock: ReturnType<typeof vi.fn>;
  let addItemMock: ReturnType<typeof vi.fn>;
  let successMock: ReturnType<typeof vi.fn>;

  const book: Book = {
    id: 7,
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    price: 54.9,
    stockQuantity: 12,
  };

  beforeEach(async () => {
    getBookByIdMock = vi.fn();
    addItemMock = vi.fn().mockReturnValue(of(void 0));
    successMock = vi.fn();

    await TestBed.configureTestingModule({
      declarations: [BookDetailComponent],
      imports: [CommonModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '7' })),
          },
        },
        {
          provide: BookService,
          useValue: {
            getBookById: getBookByIdMock,
          } as Pick<BookService, 'getBookById'>,
        },
        {
          provide: CartFacadeService,
          useValue: { addItem: addItemMock } as Pick<CartFacadeService, 'addItem'>,
        },
        {
          provide: AuthService,
          useValue: { isAuthenticated: vi.fn().mockReturnValue(false) } as Pick<
            AuthService,
            'isAuthenticated'
          >,
        },
        {
          provide: NotificationService,
          useValue: { success: successMock } as Pick<NotificationService, 'success'>,
        },
        {
          provide: SmoothScrollService,
          useValue: { scrollToTop: vi.fn() } as Pick<SmoothScrollService, 'scrollToTop'>,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('clears the loading state after a successful fetch', () => {
    getBookByIdMock.mockReturnValue(of(book));

    fixture = TestBed.createComponent(BookDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture.detectChanges();

    expect(getBookByIdMock).toHaveBeenCalledWith(7);
    expect(getBookByIdMock).toHaveBeenCalledTimes(1);
    expect(component.loading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Domain-Driven Design');
  });

  it('clears the loading state after a failed fetch', () => {
    const response$ = new Subject<Book>();
    getBookByIdMock.mockReturnValue(response$);

    fixture = TestBed.createComponent(BookDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.loading()).toBe(true);

    response$.error(new Error('not found'));
    fixture.detectChanges();

    expect(component.loading()).toBe(false);
  });

  it('tells guests their cart will sync after sign-in when adding a book', () => {
    getBookByIdMock.mockReturnValue(of(book));

    fixture = TestBed.createComponent(BookDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.handleAddToCart(book, 2);

    expect(addItemMock).toHaveBeenCalledWith(book, 2);
    expect(successMock).toHaveBeenCalledWith(
      'Book added to cart. Sign in when you are ready and we will sync it before checkout.',
    );
  });

  it('clamps quantity from the quantity input event', () => {
    getBookByIdMock.mockReturnValue(of(book));

    fixture = TestBed.createComponent(BookDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.value = '99';
    quantityInput.dispatchEvent(new Event('input'));

    component.onQuantityInput({ target: quantityInput } as unknown as Event, book);

    expect(component.quantity()).toBe(book.stockQuantity);
  });
});
