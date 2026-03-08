import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { OrderService } from '../../../core/services/order.service';
import type { Order } from '../../../core/models/order.interface';

@Component({
  selector: 'app-order-list',
  standalone: false,
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListComponent {
  private readonly orderService = inject(OrderService);

  readonly orders$ = this.orderService.getOrders();

  trackById(_index: number, order: Order): number {
    return order.id;
  }
}
