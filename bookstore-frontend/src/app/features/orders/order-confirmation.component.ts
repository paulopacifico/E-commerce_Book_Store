import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { OrderService } from '../../core/services/order.service';
import type { Order } from '../../core/models/order.interface';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, RouterLink],
  template: `
    <div class="confirmation-page">
      <h1 class="page-title">Order Confirmed</h1>
      @if (order$ | async; as order) {
        @if (order) {
          <div class="confirmation-card">
            <p class="success-message" role="status">Thank you. Your order has been placed.</p>
            <dl class="order-details">
              <dt>Order number</dt>
              <dd>{{ order.id }}</dd>
              <dt>Status</dt>
              <dd>{{ order.status }}</dd>
              <dt>Total</dt>
              <dd>{{ order.totalAmount | currency : 'EUR' }}</dd>
            </dl>
            <a routerLink="/books" class="btn btn-primary">Continue Shopping</a>
          </div>
        } @else {
          <p class="error-message">Invalid order or order not found.</p>
          <a routerLink="/books" class="btn btn-primary">Back to Books</a>
        }
      } @else {
        <p class="loading">Loading order details…</p>
      }
    </div>
  `,
  styles: [
    `
      .confirmation-page {
        padding: 2rem 0;
      }
      .page-title {
        margin: 0 0 1.5rem;
        font-size: 1.5rem;
        font-weight: 600;
      }
      .confirmation-card {
        max-width: 400px;
        padding: 1.5rem;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      .success-message {
        margin: 0 0 1rem;
        font-size: 1.125rem;
        color: #2e7d32;
      }
      .order-details {
        margin: 0 0 1.5rem;
        font-size: 0.9375rem;
      }
      .order-details dt {
        font-weight: 600;
        margin-top: 0.5rem;
      }
      .order-details dd {
        margin: 0.25rem 0 0;
      }
      .btn {
        display: inline-block;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        font-weight: 500;
        color: #fff;
        background: #1976d2;
        border: none;
        border-radius: 4px;
        text-decoration: none;
        cursor: pointer;
      }
      .btn:hover {
        background: #1565c0;
      }
      .loading {
        color: #666;
      }
      .error-message {
        color: #c62828;
        margin-bottom: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConfirmationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  private orderId = Number(this.route.snapshot.paramMap.get('id'));
  readonly order$: Observable<Order | null> = Number.isFinite(this.orderId)
    ? this.orderService.getOrderById(this.orderId).pipe(
        catchError(() => of(null))
      )
    : of(null);
}
