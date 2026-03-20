import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';

import { NotificationService } from '../../../../core/services/notification.service';
import { SmoothScrollService } from '../../../../shared/services/smooth-scroll/smooth-scroll.service';
import { CartStateService } from '../../../cart/data-access/cart-state.service';
import { BookService } from '../../data-access/book.service';
import type { Book } from '../../models/book.interface';
import { BookDetailComponent } from './book-detail.component';

describe('BookDetailComponent', () => {
  let fixture: ComponentFixture<BookDetailComponent>;
  let component: BookDetailComponent;
  let getBookByIdMock: ReturnType<typeof vi.fn>;

  const book: Book = {
    id: 7,
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    price: 54.9,
    stockQuantity: 12,
  };

  beforeEach(async () => {
    getBookByIdMock = vi.fn();

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
          provide: CartStateService,
          useValue: { addItem: vi.fn() } as Pick<CartStateService, 'addItem'>,
        },
        {
          provide: NotificationService,
          useValue: { success: vi.fn() } as Pick<NotificationService, 'success'>,
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
    expect(component.loading()).toBe(false);
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
});
