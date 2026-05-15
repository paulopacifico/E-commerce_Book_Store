import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { OrderService } from '../../data-access/order.service';
import type { Order } from '../../models/order.interface';
import { OrderDetailComponent } from './order-detail.component';

describe('OrderDetailComponent', () => {
  let fixture: ComponentFixture<OrderDetailComponent>;
  let getOrderByIdMock: ReturnType<typeof vi.fn>;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const buildOrder = (items: Order['items']): Order => ({
    id: 42,
    items,
    totalAmount: 94.99,
    status: 'CONFIRMED',
    shippingAddress: 'Ada Lovelace | 123 Main St | Toronto, ON, M5V 2T6 | +1 416 555 1212',
    createdAt: '2026-03-17T12:00:00Z',
  });

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ id: '42' }));
    getOrderByIdMock = vi.fn().mockReturnValue(
      of(
        buildOrder([
          {
            id: 7,
            bookId: 1,
            bookTitle: 'Clean Architecture',
            bookAuthor: 'Robert C. Martin',
            quantity: 2,
            priceAtPurchase: 45,
            subtotal: 90,
          },
        ]),
      ),
    );

    await TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMap$ },
        },
        {
          provide: OrderService,
          useValue: {
            getOrderById: getOrderByIdMock,
          } as Pick<OrderService, 'getOrderById'>,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailComponent);
    fixture.detectChanges();
  });

  it('renders the order line items when the API returns items', () => {
    expect(getOrderByIdMock).toHaveBeenCalledWith(42);
    expect(fixture.nativeElement.querySelector('.items-table')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.empty-items-state')).toBeNull();
  });

  it('shows an explicit empty state when the API returns an order without items', () => {
    getOrderByIdMock.mockReturnValueOnce(of(buildOrder([])));
    paramMap$.next(convertToParamMap({ id: '77' }));
    fixture.detectChanges();

    expect(getOrderByIdMock).toHaveBeenCalledWith(77);
    expect(fixture.nativeElement.querySelector('.items-table')).toBeNull();
    expect(fixture.nativeElement.querySelector('.empty-items-title')?.textContent).toContain(
      'No line items were returned for this order.',
    );
  });

  it('shows the not-found state when the order request fails', () => {
    paramMap$.next(convertToParamMap({ id: '999' }));
    getOrderByIdMock.mockReset();
    getOrderByIdMock.mockReturnValue(throwError(() => new Error('not found')));
    fixture = TestBed.createComponent(OrderDetailComponent);
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.error-state .page-title')?.textContent ?? '';
    expect(title).toContain('Order not found');
  });
});
