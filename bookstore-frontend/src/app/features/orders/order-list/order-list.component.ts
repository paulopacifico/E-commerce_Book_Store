import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';

import { OrderService } from '../../../core/services/order.service';
import type { Order } from '../../../core/models/order.interface';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, RouterLink],
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
