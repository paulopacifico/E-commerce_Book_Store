import { Component, inject } from '@angular/core';
import { CartStateService } from '../../core/services/cart-state.service';

@Component({
  selector: 'app-cart-icon',
  standalone: false,
  templateUrl: './cart-icon.component.html',
  styleUrl: './cart-icon.component.scss',
})
export class CartIconComponent {
  readonly cartCount$ = inject(CartStateService).cartCount$;
}
