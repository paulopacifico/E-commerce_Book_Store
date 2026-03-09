import { Pipe, PipeTransform } from '@angular/core';
import type { OrderItem } from '../../core/models/order.interface';

@Pipe({ name: 'orderItemSubtotal', standalone: true, pure: true })
export class OrderItemSubtotalPipe implements PipeTransform {
  transform(item: OrderItem): number {
    return item ? (item.subtotal ?? item.priceAtPurchase * item.quantity) : 0;
  }
}
