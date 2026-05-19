import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { OrderService } from '../../data-access/order.service';
import type { Order } from '../../models/order.interface';
import { OrderItemSubtotalPipe } from '../../../../shared/pipes/order-item-subtotal.pipe';
import { OrderSubtotalPipe } from '../../../../shared/pipes/order-subtotal.pipe';
import { ShippingDisplayPipe } from '../../../../shared/pipes/shipping-display.pipe';
import { StatusIndexPipe } from '../../../../shared/pipes/status-index.pipe';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] as const;

type OrderDetailState =
  | { status: 'loading' }
  | { status: 'loaded'; order: Order }
  | { status: 'not-found' };

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OrderItemSubtotalPipe,
    OrderSubtotalPipe,
    ShippingDisplayPipe,
    StatusIndexPipe,
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  readonly orderState$: Observable<OrderDetailState> = this.route.paramMap.pipe(
    switchMap((params) => {
      const id = Number(params.get('id'));
      if (!Number.isFinite(id)) {
        return of<OrderDetailState>({ status: 'not-found' });
      }

      return this.orderService.getOrderById(id).pipe(
        map((order) => ({ status: 'loaded', order }) as const),
        catchError(() => of<OrderDetailState>({ status: 'not-found' })),
      );
    }),
    startWith({ status: 'loading' } as const),
  );

  readonly statusSteps = STATUS_STEPS;

  hasItems(order: Order): boolean {
    return order.items.length > 0;
  }

  totalUnits(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  shippingLines(order: Order): string[] {
    return order.shippingAddress
      .split('|')
      .map((part) => part.trim())
      .filter(Boolean);
  }

  statusTone(order: Order): string {
    if (order.status === 'DELIVERED') {
      return 'Delivered';
    }
    if (order.status === 'CANCELLED') {
      return 'Cancelled';
    }
    if (order.status === 'SHIPPED') {
      return 'Shipped';
    }
    if (order.status === 'CONFIRMED') {
      return 'Confirmed';
    }
    return 'Pending';
  }
}
