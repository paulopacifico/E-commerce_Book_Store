import { Pipe, PipeTransform } from '@angular/core';
import type { LocalCartItem } from '../../features/cart/data-access/cart-state.service';

@Pipe({ name: 'cartSubtotal', standalone: true, pure: true })
export class CartSubtotalPipe implements PipeTransform {
  transform(item: LocalCartItem): number {
    return item ? item.bookPrice * item.quantity : 0;
  }
}
