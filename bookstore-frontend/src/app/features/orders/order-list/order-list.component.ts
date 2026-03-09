import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { OrderService } from '../../../core/services/order.service';

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
}
