import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  computed,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Order } from '../../models/order.interface';

import { OrderService } from '../../data-access/order.service';

@Component({
  selector: 'app-order-list',
  standalone: false,
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly orders = signal<Order[]>([]);
  readonly sortedOrders = computed(() =>
    [...this.orders()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );
  readonly totalSpent = computed(() =>
    this.orders().reduce((sum, order) => sum + order.totalAmount, 0),
  );
  readonly totalUnits = computed(() =>
    this.orders().reduce((sum, order) => sum + this.orderUnits(order), 0),
  );
  readonly latestOrderDate = computed(() => this.sortedOrders()[0]?.createdAt ?? null);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.orderService
      .getOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (orders) => this.orders.set(orders),
        error: () => {
          this.orders.set([]);
          this.errorMessage.set('We could not load your orders right now. Please try again.');
          this.loading.set(false);
        },
        complete: () => this.loading.set(false),
      });
  }

  orderUnits(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  primaryTitle(order: Order): string {
    return order.items[0]?.bookTitle ?? 'Order awaiting item details';
  }

  itemSummary(order: Order): string {
    const units = this.orderUnits(order);
    const titles = order.items.length;

    if (titles === 0) {
      return 'Backend did not return line items yet.';
    }

    const unitLabel = units === 1 ? 'item' : 'items';
    const titleLabel = titles === 1 ? 'title' : 'titles';
    return `${units} ${unitLabel} across ${titles} ${titleLabel}`;
  }

  statusLabel(status: string): string {
    return status
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  statusClass(status: string): string {
    return `status-${status.toLowerCase().replace(/_/g, '-')}`;
  }

  statusGuidance(status: string): string {
    switch (status) {
      case 'DELIVERED':
        return 'Delivered and ready for your shelf.';
      case 'SHIPPED':
        return 'On the way to the delivery address.';
      case 'CONFIRMED':
        return 'Confirmed and being prepared.';
      case 'CANCELLED':
        return 'Cancelled. Open details for the receipt.';
      default:
        return 'Pending confirmation from the store.';
    }
  }
}
