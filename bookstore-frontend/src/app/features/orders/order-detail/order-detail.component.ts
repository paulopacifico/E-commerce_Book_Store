import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

import { OrderService } from '../../../core/services/order.service';
import type { Order, OrderItem } from '../../../core/models/order.interface';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] as const;

@Component({
  selector: 'app-order-detail',
  standalone: false,
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  readonly order$: Observable<Order | null> = this.route.paramMap.pipe(
    switchMap((params) => {
      const id = Number(params.get('id'));
      if (!Number.isFinite(id)) return of(null);
      return this.orderService.getOrderById(id).pipe(
        catchError(() => of(null))
      );
    })
  );

  readonly statusSteps = STATUS_STEPS;

  /** Index of current status in the stepper (0-based). CANCELLED returns -1. */
  getStatusIndex(status: string): number {
    const i = STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]);
    return i >= 0 ? i : -1;
  }

  /** Whether this step is completed (current index > step index). */
  isStepCompleted(currentIndex: number, stepIndex: number): boolean {
    return currentIndex > stepIndex;
  }

  /** Whether this step is the current one. */
  isStepCurrent(currentIndex: number, stepIndex: number): boolean {
    return currentIndex === stepIndex;
  }

  /** Subtotal from items (sum of line subtotals). */
  getItemsSubtotal(order: Order): number {
    return order.items.reduce((sum, item) => sum + this.getItemSubtotal(item), 0);
  }

  /** Single line item subtotal. */
  getItemSubtotal(item: OrderItem): number {
    return item.subtotal ?? item.priceAtPurchase * item.quantity;
  }

  /** Display shipping: if total > items subtotal, show difference; else "Included". */
  getShippingDisplay(order: Order): number | 'included' {
    const subtotal = this.getItemsSubtotal(order);
    const total = Number(order.totalAmount);
    if (total > subtotal) return total - subtotal;
    return 'included';
  }

  trackByItemId(_index: number, item: OrderItem): number {
    return item.id;
  }

  /** Simulated last 4 digits (not from API). */
  getPaymentLastFour(): string {
    return '1234';
  }
}
