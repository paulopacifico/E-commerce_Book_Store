import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartStateService } from '../../core/services/cart-state.service';

@Component({
  selector: 'app-cart-icon',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './cart-icon.component.html',
  styleUrl: './cart-icon.component.scss',
})
export class CartIconComponent {
  readonly cartCount$ = inject(CartStateService).cartCount$;
}
