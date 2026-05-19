import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { OrderService } from '../../data-access/order.service';
import type { Order } from '../../models/order.interface';
import { OrderListComponent } from './order-list.component';

describe('OrderListComponent', () => {
  let fixture: ComponentFixture<OrderListComponent>;
  let component: OrderListComponent;
  let getOrdersMock: ReturnType<typeof vi.fn>;

  const buildOrder = (overrides: Partial<Order>): Order => ({
    id: 10,
    items: [
      {
        id: 1,
        bookId: 11,
        bookTitle: 'Clean Architecture',
        bookAuthor: 'Robert C. Martin',
        quantity: 2,
        priceAtPurchase: 45,
        subtotal: 90,
      },
    ],
    totalAmount: 90,
    status: 'CONFIRMED',
    shippingAddress: 'Ada Lovelace | 123 Main St | Toronto, ON, M5V 2T6 | +1 416 555 1212',
    createdAt: '2026-03-17T12:00:00Z',
    ...overrides,
  });

  beforeEach(async () => {
    getOrdersMock = vi.fn();

    await TestBed.configureTestingModule({
      declarations: [OrderListComponent],
      imports: [CommonModule, RouterModule.forRoot([])],
      providers: [
        {
          provide: OrderService,
          useValue: {
            getOrders: getOrdersMock,
          } as Pick<OrderService, 'getOrders'>,
        },
      ],
    }).compileComponents();
  });

  function renderWith(response: Observable<Order[]>): void {
    getOrdersMock.mockReturnValue(response);
    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('renders a summarized order history sorted by most recent order', () => {
    renderWith(
      of([
        buildOrder({ id: 10, createdAt: '2026-03-17T12:00:00Z' }),
        buildOrder({
          id: 20,
          createdAt: '2026-04-02T12:00:00Z',
          totalAmount: 40,
          status: 'SHIPPED',
          items: [
            {
              id: 2,
              bookId: 22,
              bookTitle: 'Designing Data-Intensive Applications',
              bookAuthor: 'Martin Kleppmann',
              quantity: 1,
              priceAtPurchase: 40,
              subtotal: 40,
            },
          ],
        }),
      ]),
    );

    const orderTitles = [...fixture.nativeElement.querySelectorAll('.order-id')].map((element) =>
      element.textContent.trim(),
    );

    expect(orderTitles).toEqual(['Order #20', 'Order #10']);
    expect(component.totalSpent()).toBe(130);
    expect(component.totalUnits()).toBe(3);
    expect(fixture.nativeElement.textContent).toContain('Purchase archive');
    expect(fixture.nativeElement.textContent).toContain('Designing Data-Intensive Applications');
    expect(fixture.nativeElement.querySelector('.status-shipped')?.textContent).toContain(
      'Shipped',
    );
  });

  it('shows the empty state when no orders are returned', () => {
    renderWith(of([]));

    expect(fixture.nativeElement.querySelector('.state-card')?.textContent).toContain(
      'You have no orders yet.',
    );
    expect(fixture.nativeElement.querySelector('.orders-hero')).toBeNull();
  });

  it('shows a retryable error state when the order request fails', () => {
    renderWith(throwError(() => new Error('orders failed')));

    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe(
      'We could not load your orders right now. Please try again.',
    );
    expect(fixture.nativeElement.querySelector('.state-card-error')?.textContent).toContain(
      'We couldn’t load your orders.',
    );
  });

  it('keeps useful labels for orders without returned line items', () => {
    const order = buildOrder({ items: [], totalAmount: 0, status: 'PENDING' });
    renderWith(of([order]));

    expect(component.primaryTitle(order)).toBe('Order awaiting item details');
    expect(component.itemSummary(order)).toBe('Backend did not return line items yet.');
    expect(fixture.nativeElement.textContent).toContain('Order awaiting item details');
  });
});
