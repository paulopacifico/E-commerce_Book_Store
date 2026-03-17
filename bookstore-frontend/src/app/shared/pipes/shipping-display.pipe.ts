import { Pipe, PipeTransform } from '@angular/core';
import type { Order } from '../../features/orders/models/order.interface';

@Pipe({ name: 'shippingDisplay', standalone: true, pure: true })
export class ShippingDisplayPipe implements PipeTransform {
  transform(order: Order): number | 'included' {
    if (!order?.items?.length) return 'included';
    const subtotal = order.items.reduce(
      (sum, item) => sum + (item.subtotal ?? item.priceAtPurchase * item.quantity),
      0,
    );
    const total = Number(order.totalAmount);
    return total > subtotal ? total - subtotal : 'included';
  }
}
