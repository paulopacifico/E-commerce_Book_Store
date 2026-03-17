import { Pipe, PipeTransform } from '@angular/core';
import type { Order } from '../../features/orders/models/order.interface';

@Pipe({ name: 'orderSubtotal', standalone: true, pure: true })
export class OrderSubtotalPipe implements PipeTransform {
  transform(order: Order): number {
    if (!order?.items?.length) return 0;
    return order.items.reduce(
      (sum, item) => sum + (item.subtotal ?? item.priceAtPurchase * item.quantity),
      0,
    );
  }
}
